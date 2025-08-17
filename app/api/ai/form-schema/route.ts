import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/(auth)/auth";
import { generateObject } from "ai";
import { myProvider } from "@/lib/ai/providers";
import { z } from "zod";
import type { RequestType, FormStep, FormField } from "@/lib/types/data-request";

const FormSchemaRequestSchema = z.object({
    requestType: z.enum(["IFG", "IWG", "DZG"]),
    existingData: z.record(z.any()).optional(),
});

const FormFieldSchema = z.object({
    id: z.string(),
    type: z.enum(["text", "textarea", "select", "multiselect", "checkbox", "radio", "date", "file", "number"]),
    label: z.string(),
    placeholder: z.string().optional(),
    helpText: z.string().optional(),
    required: z.boolean(),
    options: z.array(z.object({
        value: z.string(),
        label: z.string(),
    })).optional(),
    aiSuggestionEnabled: z.boolean(),
});

const FormStepSchema = z.object({
    id: z.string(),
    title: z.string(),
    description: z.string(),
    fields: z.array(FormFieldSchema),
});

const FormSchemaResponseSchema = z.object({
    steps: z.array(FormStepSchema),
    reasoning: z.string(),
});

export async function POST(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { requestType, existingData } = FormSchemaRequestSchema.parse(body);

        const systemPrompt = getFormSchemaSystemPrompt(requestType);
        const userPrompt = buildFormSchemaPrompt(requestType, existingData);

        const { object } = await generateObject({
            model: myProvider.languageModel("artifact-model"),
            system: systemPrompt,
            prompt: userPrompt,
            schema: FormSchemaResponseSchema,
        });

        return NextResponse.json({
            steps: object.steps,
            reasoning: object.reasoning,
            success: true,
        });
    } catch (error) {
        console.error("Error generating form schema:", error);
        return NextResponse.json(
            { error: "Failed to generate form schema" },
            { steps: getDefaultFormSteps(request.url.includes("requestType") ? "IFG" : "IFG") }
        );
    }
}

function getFormSchemaSystemPrompt(requestType: RequestType): string {
    const lawInfo = {
        IFG: `Informationsfreiheitsgesetz (Freedom of Information Act):
- Focus: General public access to government information
- Key Requirements: Public interest justification, specific information requests, legitimate purpose
- Typical Data: Administrative documents, decision records, policy papers, correspondence
- Process: 4-week response time, possible exemptions for privacy/security`,

        IWG: `Informationsweiterverwendungsgesetz (Information Reuse Act):
- Focus: Commercial and research reuse of public data  
- Key Requirements: Business model description, data format preferences, usage purpose, fee acceptance
- Typical Data: Datasets, statistics, geographic data, economic indicators
- Process: Emphasis on machine-readable formats, potential licensing fees`,

        DZG: `Datenzugangsgesetz (Data Access Act):
- Focus: High-value datasets and protected data for research
- Key Requirements: Research purpose, institutional affiliation, privacy measures, ethical approval
- Typical Data: Sensitive datasets, research data, statistical microdata
- Process: Additional security and privacy safeguards, research ethics review`,
    };

    return `You are an expert in Austrian transparency laws and form design. Generate an intelligent, multi-step form schema for ${requestType} data requests.

${lawInfo[requestType]}

Form Design Principles:
1. Logical Flow: Group related fields, build from general to specific
2. User Experience: Clear labels, helpful descriptions, progressive disclosure
3. Legal Compliance: Include all required fields per Austrian law
4. AI Integration: Enable AI suggestions where helpful
5. Validation: Anticipate common errors and provide guidance

Austrian Context:
- Multi-level government (Bund/Länder/Gemeinden)
- GDPR compliance requirements  
- German/English language options
- Formal administrative communication style
- Agency competency considerations

Generate 3-5 logical steps with appropriate fields for successful ${requestType} requests.`;
}

function buildFormSchemaPrompt(requestType: RequestType, existingData?: Record<string, any>): string {
    const context = existingData && Object.keys(existingData).length > 0
        ? `\nExisting form data to consider:\n${JSON.stringify(existingData, null, 2)}`
        : "";

    return `Generate a comprehensive form schema for ${requestType} data requests in Austria.

Requirements:
1. Create logical steps that guide users through the request process
2. Include all legally required fields for ${requestType}
3. Add helpful optional fields that improve success rates
4. Enable AI suggestions for complex fields
5. Provide clear help text and validation guidance
6. Consider the Austrian administrative context

${context}

Focus on:
- Request identification and description
- Requester information and purpose
- Specific data requirements  
- Legal and technical considerations
- Agency selection and routing
- Final review and submission

Ensure the form collects sufficient information for successful processing while maintaining user-friendliness.`;
}

function getDefaultFormSteps(requestType: RequestType): FormStep[] {
    const commonFields = {
        title: {
            id: "title",
            type: "text" as const,
            label: "Request Title",
            placeholder: "Brief, descriptive title for your request",
            helpText: "Provide a clear title that summarizes what you're requesting",
            required: true,
            aiSuggestionEnabled: true,
        },
        description: {
            id: "description",
            type: "textarea" as const,
            label: "Detailed Description",
            placeholder: "Describe the specific information or data you need...",
            helpText: "Be as specific as possible about what you're looking for and why",
            required: true,
            aiSuggestionEnabled: true,
        },
        publicInterest: {
            id: "publicInterest",
            type: "textarea" as const,
            label: "Public Interest Justification",
            placeholder: "Explain how this request serves the public interest...",
            helpText: "Describe the public benefit and transparency value of your request",
            required: true,
            aiSuggestionEnabled: true,
        },
    };

    const baseSteps: FormStep[] = [
        {
            id: "basic-info",
            title: "Request Overview",
            description: "Provide the basic details of your data request",
            fields: [commonFields.title, commonFields.description],
        },
        {
            id: "justification",
            title: "Purpose & Justification",
            description: "Explain the purpose and public interest of your request",
            fields: [commonFields.publicInterest],
        },
    ];

    return baseSteps;
}