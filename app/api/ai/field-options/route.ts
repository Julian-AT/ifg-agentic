import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/(auth)/auth";
import { generateObject } from "ai";
import { myProvider } from "@/lib/ai/providers";
import { z } from "zod";
import type { RequestType } from "@/lib/types/data-request";

const FieldOptionsRequestSchema = z.object({
    fieldId: z.string(),
    fieldType: z.string(),
    fieldLabel: z.string(),
    existingOptions: z.array(z.object({
        value: z.string(),
        label: z.string(),
    })).optional(),
    requestType: z.enum(["IFG", "IWG", "DZG"]).optional(),
    formContext: z.record(z.any()).optional(),
    helpText: z.string().optional(),
});

const FieldOptionSchema = z.object({
    value: z.string(),
    label: z.string(),
    confidence: z.number().min(0).max(1),
    reasoning: z.string(),
    isRecommended: z.boolean().optional(),
});

const OptionsResponseSchema = z.object({
    additionalOptions: z.array(FieldOptionSchema).max(5),
    recommendedOption: FieldOptionSchema.optional(),
    reasoning: z.string(),
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
            existingOptions,
            requestType,
            formContext,
            helpText,
        } = FieldOptionsRequestSchema.parse(body);

        const systemPrompt = getFieldOptionsSystemPrompt(requestType);
        const userPrompt = buildFieldOptionsPrompt(
            fieldId,
            fieldType,
            fieldLabel,
            existingOptions,
            formContext,
            helpText
        );

        const { object } = await generateObject({
            model: myProvider.languageModel("artifact-model"),
            system: systemPrompt,
            prompt: userPrompt,
            schema: OptionsResponseSchema,
        });

        return NextResponse.json({
            suggestions: object.additionalOptions,
            recommended: object.recommendedOption,
            reasoning: object.reasoning,
            success: true,
        });
    } catch (error) {
        console.error("Error generating field options:", error);
        return NextResponse.json(
            { error: "Failed to generate field options" },
            { status: 500 }
        );
    }
}

function getFieldOptionsSystemPrompt(requestType?: RequestType): string {
    const lawInfo = {
        IFG: "Informationsfreiheitsgesetz (Freedom of Information Act) - general public information access",
        IWG: "Informationsweiterverwendungsgesetz (Information Reuse Act) - data reuse for commercial/research purposes",
        DZG: "Datenzugangsgesetz (Data Access Act) - access to high-value and protected datasets",
    };

    const requestContext = requestType
        ? `\n\nRequest Type: ${lawInfo[requestType]}`
        : "";

    return `You are an expert assistant for Austrian data request forms. Generate intelligent, contextually relevant options for form fields based on:

1. Austrian Government Structure:
   - Federal level (Bund): Ministries, federal agencies
   - State level (Länder): Regional governments, state authorities
   - Municipal level (Gemeinden): Local governments, city administrations
   - Public institutions: Universities, hospitals, public companies

2. Common Data Categories:
   - Administrative data: permits, registrations, public records
   - Statistical data: demographics, economic indicators, surveys
   - Environmental data: monitoring, assessments, geographic information
   - Financial data: budgets, expenditures, contracts
   - Health data: public health statistics, healthcare system data
   - Education data: schools, universities, educational statistics
   - Transport data: traffic, public transport, infrastructure

3. Legal and Administrative Context:
   - GDPR compliance requirements
   - Privacy and confidentiality considerations
   - Commercial vs. non-commercial use distinctions
   - Research and academic purposes
   - Public interest justifications
${requestContext}

Generate options that are:
- Specific to Austrian administrative context
- Legally compliant and realistic
- Contextually relevant to the current form data
- Professionally appropriate for government communication`;
}

function buildFieldOptionsPrompt(
    fieldId: string,
    fieldType: string,
    fieldLabel: string,
    existingOptions?: Array<{ value: string, label: string }>,
    formContext?: Record<string, any>,
    helpText?: string
): string {
    const context = formContext
        ? Object.entries(formContext)
            .filter(([_, value]) => value && typeof value === "string" && value.length > 0)
            .map(([key, value]) => `${key}: ${value}`)
            .join("\n")
        : "";

    const existingList = existingOptions
        ? existingOptions.map(opt => `- ${opt.label} (${opt.value})`).join("\n")
        : "None";

    return `Generate smart options for this form field:

Field: ${fieldLabel} (${fieldId})
Type: ${fieldType}
${helpText ? `Help Text: ${helpText}` : ""}

Existing Options:
${existingList}

Current Form Context:
${context || "No additional context available"}

Requirements:
1. Generate 3-5 additional relevant options that complement existing ones
2. Base suggestions on the current form context and field purpose
3. Consider Austrian administrative structure and data types
4. Recommend the most likely option based on context (if applicable)
5. Ensure options are specific, actionable, and legally appropriate
6. Use appropriate German terminology where relevant

Focus on options that:
- Are not already covered by existing options
- Match the current request context and purpose
- Represent common, realistic choices for Austrian data requests
- Demonstrate understanding of the Austrian administrative system

If a specific recommendation can be made based on the form context, mark it as recommended with high confidence.`;
}