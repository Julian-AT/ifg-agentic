import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/(auth)/auth";
import { generateObject } from "ai";
import { myProvider } from "@/lib/ai/providers";
import { z } from "zod";
import type { RequestType } from "@/lib/types/data-request";

const FormEnhancementRequestSchema = z.object({
    fieldId: z.string(),
    fieldType: z.string(),
    fieldLabel: z.string(),
    currentText: z.string(),
    requestType: z.enum(["IFG", "IWG", "DZG"]).optional(),
    formContext: z.record(z.any()).optional(),
    helpText: z.string().optional(),
});

const EnhancementSchema = z.object({
    text: z.string(),
    confidence: z.number().min(0).max(1),
    reasoning: z.string(),
    improvements: z.array(z.string()),
    hasSignificantChanges: z.boolean(),
});

export async function POST(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const {
            fieldId,
            fieldType,
            fieldLabel,
            currentText,
            requestType,
            formContext,
            helpText,
        } = FormEnhancementRequestSchema.parse(body);

        // Only enhance if there's substantial text
        if (currentText.length < 50) {
            return NextResponse.json({
                enhancement: null,
                success: true,
            });
        }

        const systemPrompt = getEnhancementSystemPrompt(requestType);
        const userPrompt = buildEnhancementPrompt(
            fieldId,
            fieldType,
            fieldLabel,
            currentText,
            formContext,
            helpText
        );

        const { object } = await generateObject({
            model: myProvider.languageModel("artifact-model"),
            system: systemPrompt,
            prompt: userPrompt,
            schema: EnhancementSchema,
        });

        // Only return enhancement if there are significant improvements
        if (!object.hasSignificantChanges || object.confidence < 0.6) {
            return NextResponse.json({
                enhancement: null,
                success: true,
            });
        }

        return NextResponse.json({
            enhancement: {
                text: object.text,
                confidence: object.confidence,
                reasoning: object.reasoning,
                improvements: object.improvements,
            },
            success: true,
        });
    } catch (error) {
        console.error("Error generating form enhancement:", error);
        return NextResponse.json(
            { error: "Failed to generate enhancement" },
            { status: 500 }
        );
    }
}

function getEnhancementSystemPrompt(requestType?: RequestType): string {
    const lawInfo = {
        IFG: "Informationsfreiheitsgesetz (Freedom of Information Act) - focuses on transparency and public access to government information. Key considerations: public interest justification, specific information requests, legitimate purpose.",
        IWG: "Informationsweiterverwendungsgesetz (Information Reuse Act) - focuses on commercial and research reuse of public data. Key considerations: commercial viability, data formats, reuse purposes, business models.",
        DZG: "Datenzugangsgesetz (Data Access Act) - focuses on high-value datasets and protected data for research. Key considerations: research purposes, data protection, ethical approval, institutional affiliation.",
    };

    const requestContext = requestType
        ? `\n\nRequest Type Specific Requirements: ${lawInfo[requestType]}`
        : "";

    return `You are an expert content reviewer for Austrian data request forms. Analyze and enhance form field content to maximize the success rate of data requests.

Enhancement Focus Areas:
1. Legal Compliance: Ensure content meets Austrian transparency law requirements
2. Clarity: Make requests specific, unambiguous, and actionable
3. Completeness: Include all necessary details and context
4. Professional Tone: Use appropriate formal language for government communication
5. Strategic Framing: Present requests in ways that demonstrate legitimate public interest
6. Practical Scope: Ensure requests are realistic and achievable

Austrian Context:
- Use appropriate German terminology when relevant
- Consider the federal structure (Bund, Länder, Gemeinden)
- Reference relevant legal frameworks appropriately
- Understand Austrian administrative procedures
${requestContext}

Only suggest enhancements if they provide significant value. Minor grammar or style changes are not sufficient - focus on substantial improvements that increase request success probability.`;
}

function buildEnhancementPrompt(
    fieldId: string,
    fieldType: string,
    fieldLabel: string,
    currentText: string,
    formContext?: Record<string, any>,
    helpText?: string
): string {
    const context = formContext
        ? Object.entries(formContext)
            .filter(([_, value]) => value && typeof value === "string")
            .map(([key, value]) => `${key}: ${value}`)
            .join("\n")
        : "";

    return `Analyze and enhance this form field content:

Field: ${fieldLabel} (${fieldId})
Type: ${fieldType}
${helpText ? `Help Text: ${helpText}` : ""}

Current Text:
"${currentText}"

${context ? `Form Context:\n${context}` : ""}

Enhancement Guidelines:
- Improve clarity, specificity, and legal compliance
- Add missing details that would strengthen the request
- Ensure appropriate professional tone for government communication
- Make the request more actionable and precise
- Consider Austrian legal and administrative context
- Demonstrate legitimate public interest where applicable

Requirements:
- Only suggest enhancements that provide significant value
- Mark hasSignificantChanges as false if only minor changes are needed
- Provide clear reasoning for all suggested improvements
- Maintain the user's intent and core message
- Ensure the enhanced version is more likely to succeed

If the current text is already well-written and appropriate, set hasSignificantChanges to false.`;
}