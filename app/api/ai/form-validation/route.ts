import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/(auth)/auth";
import { generateObject } from "ai";
import { myProvider } from "@/lib/ai/providers";
import { z } from "zod";
import type { RequestType } from "@/lib/types/data-request";

const FormValidationRequestSchema = z.object({
    requestType: z.enum(["IFG", "IWG", "DZG"]),
    stepData: z.record(z.any()),
    stepIndex: z.number(),
});

const ValidationErrorSchema = z.object({
    field: z.string(),
    message: z.string(),
    severity: z.enum(["error", "warning", "info"]),
    suggestion: z.string().optional(),
});

const ValidationSuggestionSchema = z.object({
    field: z.string(),
    suggestion: z.string(),
    priority: z.enum(["high", "medium", "low"]),
    reasoning: z.string(),
});

const FormValidationResponseSchema = z.object({
    isValid: z.boolean(),
    completeness: z.number().min(0).max(1),
    errors: z.array(ValidationErrorSchema),
    suggestions: z.array(ValidationSuggestionSchema),
    legalCompliance: z.object({
        score: z.number().min(0).max(1),
        issues: z.array(z.string()),
        recommendations: z.array(z.string()),
    }),
});

export async function POST(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { requestType, stepData, stepIndex } = FormValidationRequestSchema.parse(body);

        const systemPrompt = getFormValidationSystemPrompt(requestType);
        const userPrompt = buildFormValidationPrompt(requestType, stepData, stepIndex);

        const { object } = await generateObject({
            model: myProvider.languageModel("artifact-model"),
            system: systemPrompt,
            prompt: userPrompt,
            schema: FormValidationResponseSchema,
        });

        return NextResponse.json({
            validation: object,
            success: true,
        });
    } catch (error) {
        console.error("Error validating form:", error);
        return NextResponse.json(
            { error: "Failed to validate form" },
            { status: 500 }
        );
    }
}

function getFormValidationSystemPrompt(requestType: RequestType): string {
    const lawInfo = {
        IFG: `IFG Validation Requirements:
- Public Interest: Must demonstrate clear public benefit
- Specificity: Requests must be specific and actionable
- Scope: Reasonable scope that doesn't overwhelm agencies
- Legitimacy: Legitimate purpose for information access
- Privacy: No conflicts with personal data protection
- Format: Professional, formal communication style`,

        IWG: `IWG Validation Requirements:
- Commercial Purpose: Clear business model and reuse intention
- Data Formats: Appropriate technical requirements
- Fee Structure: Realistic fee expectations and payment willingness
- Usage Rights: Understanding of licensing and usage terms
- Technical Feasibility: Realistic technical requirements
- Business Justification: Valid commercial or research use case`,

        DZG: `DZG Validation Requirements:
- Research Purpose: Legitimate academic or scientific research
- Institutional Backing: Proper institutional affiliation
- Ethics Approval: Appropriate ethical review processes
- Data Protection: Adequate privacy and security measures
- Research Methodology: Sound research design and methods
- Data Retention: Appropriate data handling and disposal plans`,
    };

    return `You are an expert validator for Austrian ${requestType} data request forms. Validate form data for legal compliance, completeness, and success probability.

${lawInfo[requestType]}

Validation Framework:
1. Legal Compliance: Check adherence to Austrian transparency laws
2. Completeness: Assess if all necessary information is provided
3. Quality Control: Evaluate clarity, specificity, and professionalism
4. Success Probability: Predict likelihood of approval
5. Risk Assessment: Identify potential rejection reasons
6. Improvement Opportunities: Suggest specific enhancements

Austrian Administrative Standards:
- Formal communication protocols
- GDPR and privacy compliance
- Multi-level government considerations
- Agency competencies and procedures
- Administrative burden assessment
- Historical approval patterns

Provide specific, actionable feedback that helps users create successful requests.`;
}

function buildFormValidationPrompt(
    requestType: RequestType,
    stepData: Record<string, any>,
    stepIndex: number
): string {
    const dataString = Object.entries(stepData)
        .filter(([_, value]) => value && value.toString().trim())
        .map(([key, value]) => `${key}: ${value}`)
        .join('\n');

    return `Validate this ${requestType} form step data for legal compliance and quality:

Step ${stepIndex + 1} Data:
${dataString || "No data provided"}

Validation Criteria:
1. Required Field Completeness: Are all mandatory fields properly filled?
2. Legal Compliance: Does content meet ${requestType} requirements?
3. Clarity and Specificity: Is the information clear and actionable?
4. Professional Standards: Does it meet Austrian administrative communication standards?
5. Success Probability: How likely is this to be approved?
6. Potential Issues: What could cause rejection or delays?

Specific ${requestType} Considerations:
- Legal framework requirements and restrictions
- Austrian administrative procedures and expectations
- Common approval/rejection patterns
- Best practices for successful requests

Provide:
- Specific errors that must be fixed (severity: error)
- Warnings about potential issues (severity: warning)  
- Informational guidance for improvement (severity: info)
- Concrete suggestions for enhancing content
- Legal compliance assessment and recommendations

Focus on actionable feedback that increases approval probability.`;
}