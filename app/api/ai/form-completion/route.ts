import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/(auth)/auth";
import { generateObject } from "ai";
import { myProvider } from "@/lib/ai/providers";
import { z } from "zod";
import type { RequestType } from "@/lib/types/data-request";

const FormCompletionRequestSchema = z.object({
    fieldId: z.string(),
    fieldType: z.string(),
    fieldLabel: z.string(),
    textBeforeCursor: z.string(),
    textAfterCursor: z.string().optional(),
    requestType: z.enum(["IFG", "IWG", "DZG"]).optional(),
    formContext: z.record(z.any()).optional(),
    helpText: z.string().optional(),
});

const CompletionSchema = z.object({
    completions: z.array(z.string()).max(3),
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
            textBeforeCursor,
            textAfterCursor,
            requestType,
            formContext,
            helpText,
        } = FormCompletionRequestSchema.parse(body);

        // Only generate completions if there's meaningful text to complete
        if (textBeforeCursor.length < 10) {
            return NextResponse.json({
                completions: [],
                success: true,
            });
        }

        const systemPrompt = getCompletionSystemPrompt(requestType);
        const userPrompt = buildCompletionPrompt(
            fieldId,
            fieldType,
            fieldLabel,
            textBeforeCursor,
            textAfterCursor,
            formContext,
            helpText
        );

        const { object } = await generateObject({
            model: myProvider.languageModel("artifact-model"),
            system: systemPrompt,
            prompt: userPrompt,
            schema: CompletionSchema,
        });

        return NextResponse.json({
            completions: object.completions,
            success: true,
        });
    } catch (error) {
        console.error("Error generating form completion:", error);
        return NextResponse.json(
            { error: "Failed to generate completion" },
            { status: 500 }
        );
    }
}

function getCompletionSystemPrompt(requestType?: RequestType): string {
    const lawInfo = {
        IFG: "Informationsfreiheitsgesetz (Freedom of Information Act) - focuses on transparency and public access to government information",
        IWG: "Informationsweiterverwendungsgesetz (Information Reuse Act) - focuses on commercial and research reuse of public data",
        DZG: "Datenzugangsgesetz (Data Access Act) - focuses on high-value datasets and open data initiatives",
    };

    const requestContext = requestType
        ? `\n\nRequest Type Context: ${lawInfo[requestType]}`
        : "";

    return `You are an expert text completion assistant for Austrian data request forms. Generate natural, contextually appropriate completions for partial text input.

Guidelines:
- Complete the text naturally and coherently
- Use appropriate Austrian German terminology and formal language when relevant
- Ensure completions are legally compliant and professional
- Consider the specific context of Austrian government data requests
- Focus on clarity, specificity, and completeness
- Avoid overly generic or vague language
- Suggest practical, actionable content
${requestContext}

Generate 1-3 short, focused completions that naturally continue the existing text.`;
}

function buildCompletionPrompt(
    fieldId: string,
    fieldType: string,
    fieldLabel: string,
    textBeforeCursor: string,
    textAfterCursor?: string,
    formContext?: Record<string, any>,
    helpText?: string
): string {
    const context = formContext
        ? Object.entries(formContext)
            .filter(([_, value]) => value && typeof value === "string")
            .map(([key, value]) => `${key}: ${value}`)
            .join("\n")
        : "";

    return `Complete this partial text naturally and contextually:

Field: ${fieldLabel} (${fieldId})
Type: ${fieldType}
${helpText ? `Help Text: ${helpText}` : ""}

Text before cursor: "${textBeforeCursor}"
${textAfterCursor ? `Text after cursor: "${textAfterCursor}"` : ""}

${context ? `Form Context:\n${context}` : ""}

Requirements:
- Generate 1-3 short, natural completions that continue the text
- Each completion should be 3-20 words
- Focus on completing the current thought or sentence
- Ensure completions are relevant to Austrian data requests
- Maintain professional tone and legal appropriateness
- Don't repeat the existing text

Return only the completion text (what should be added), not the full text.`;
}