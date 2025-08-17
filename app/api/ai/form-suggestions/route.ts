import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/(auth)/auth";
import { generateObject } from "ai";
import { myProvider } from "@/lib/ai/providers";
import { z } from "zod";
import type { RequestType } from "@/lib/types/data-request";

const FormSuggestionRequestSchema = z.object({
    fieldId: z.string(),
    fieldType: z.string(),
    fieldLabel: z.string(),
    currentValue: z.string(),
    requestType: z.enum(["IFG", "IWG", "DZG"]).optional(),
    formContext: z.record(z.any()).optional(),
    helpText: z.string().optional(),
});

const FormSuggestionSchema = z.object({
    text: z.string(),
    confidence: z.number().min(0).max(1),
    reasoning: z.string().optional(),
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
            currentValue,
            requestType,
            formContext,
            helpText,
        } = FormSuggestionRequestSchema.parse(body);

        const systemPrompt = getFormSuggestionSystemPrompt(requestType);
        const userPrompt = buildFormSuggestionPrompt(
            fieldId,
            fieldType,
            fieldLabel,
            currentValue,
            formContext,
            helpText
        );

        const { object } = await generateObject({
            model: myProvider.languageModel("artifact-model"),
            system: systemPrompt,
            prompt: userPrompt,
            schema: z.object({
                suggestions: z.array(FormSuggestionSchema).max(5),
            }),
        });

        return NextResponse.json({
            suggestions: object.suggestions,
            success: true,
        });
    } catch (error) {
        console.error("Error generating form suggestions:", error);
        return NextResponse.json(
            { error: "Failed to generate suggestions" },
            { status: 500 }
        );
    }
}

function getFormSuggestionSystemPrompt(requestType?: RequestType): string {
    const lawInfo = {
        IFG: "Informationsfreiheitsgesetz (Freedom of Information Act) - focuses on transparency and public access to government information",
        IWG: "Informationsweiterverwendungsgesetz (Information Reuse Act) - focuses on commercial and research reuse of public data",
        DZG: "Datenzugangsgesetz (Data Access Act) - focuses on high-value datasets and open data initiatives",
    };

    const requestContext = requestType
        ? `\n\nRequest Type Context: ${lawInfo[requestType]}`
        : "";

    return `You are an expert assistant for Austrian data request forms. Generate helpful, practical suggestions for form fields that will improve the success rate of data requests.

Key principles:
- Suggestions should be specific, clear, and legally compliant
- Use appropriate Austrian German terminology when relevant
- Consider the Austrian government structure and competencies
- Provide suggestions that demonstrate legitimate public interest
- Focus on clarity and completeness to avoid follow-up questions
- Suggest realistic timeframes and scope
- Consider GDPR and privacy implications
${requestContext}

Generate 3-5 high-quality suggestions ranked by usefulness and likelihood of success.`;
}

function buildFormSuggestionPrompt(
    fieldId: string,
    fieldType: string,
    fieldLabel: string,
    currentValue: string,
    formContext?: Record<string, any>,
    helpText?: string
): string {
    const context = formContext
        ? Object.entries(formContext)
            .filter(([_, value]) => value && typeof value === "string")
            .map(([key, value]) => `${key}: ${value}`)
            .join("\n")
        : "";

    return `Generate intelligent suggestions for this form field:

Field: ${fieldLabel} (${fieldId})
Type: ${fieldType}
Current Value: "${currentValue}"
${helpText ? `Help Text: ${helpText}` : ""}

${context ? `Form Context:\n${context}` : ""}

Requirements:
- Complete the current partial input if it seems unfinished
- Suggest improvements or alternatives that are more specific/clear
- Consider legal requirements and best practices
- Ensure suggestions are practical and actionable
- Rank by confidence and usefulness

Generate suggestions that build upon what the user has already written and help them create a successful data request.`;
}