import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/(auth)/auth";
import { generateObject } from "ai";
import { myProvider } from "@/lib/ai/providers";
import { z } from "zod";
import type { RequestType } from "@/lib/types/data-request";

const FormAnalysisRequestSchema = z.object({
    requestType: z.enum(["IFG", "IWG", "DZG"]),
    formData: z.record(z.any()),
    currentStep: z.number(),
    totalSteps: z.number(),
});

const EnhancementSchema = z.object({
    type: z.enum(["validation", "suggestion", "agency_match", "timeline", "cost_estimate"]),
    message: z.string(),
    confidence: z.number().min(0).max(1),
    actionable: z.boolean(),
    priority: z.enum(["low", "medium", "high"]).optional(),
});

const FormAnalysisResponseSchema = z.object({
    enhancements: z.array(EnhancementSchema).max(5),
    completeness: z.number().min(0).max(1),
    suggestedAgencies: z.array(z.string()).optional(),
    estimatedTimeline: z.string().optional(),
    potentialIssues: z.array(z.string()).optional(),
});

export async function POST(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const {
            requestType,
            formData,
            currentStep,
            totalSteps
        } = FormAnalysisRequestSchema.parse(body);

        const systemPrompt = getFormAnalysisSystemPrompt(requestType);
        const userPrompt = buildFormAnalysisPrompt(
            requestType,
            formData,
            currentStep,
            totalSteps
        );

        const { object } = await generateObject({
            model: myProvider.languageModel("artifact-model"),
            system: systemPrompt,
            prompt: userPrompt,
            schema: FormAnalysisResponseSchema,
        });

        return NextResponse.json({
            enhancements: object.enhancements,
            completeness: object.completeness,
            suggestedAgencies: object.suggestedAgencies,
            estimatedTimeline: object.estimatedTimeline,
            potentialIssues: object.potentialIssues,
            success: true,
        });
    } catch (error) {
        console.error("Error generating form analysis:", error);
        return NextResponse.json(
            { error: "Failed to analyze form" },
            { status: 500 }
        );
    }
}

function getFormAnalysisSystemPrompt(requestType: RequestType): string {
    const lawInfo = {
        IFG: `Informationsfreiheitsgesetz (IFG) Analysis:
- Focus on transparency and public access
- Key success factors: Clear public interest, specific requests, appropriate scope
- Common issues: Too broad requests, insufficient justification, privacy conflicts
- Timeline: 4 weeks standard response time
- Exemptions: Personal data, business secrets, ongoing proceedings`,

        IWG: `Informationsweiterverwendungsgesetz (IWG) Analysis:
- Focus on data reuse for commercial/research purposes
- Key success factors: Clear business model, appropriate data formats, fee acceptance
- Common issues: Unclear commercial purpose, inappropriate scope, licensing concerns
- Timeline: Variable based on data processing requirements
- Considerations: Machine-readable formats, licensing fees, update frequency`,

        DZG: `Datenzugangsgesetz (DZG) Analysis:
- Focus on high-value and protected datasets for research
- Key success factors: Research justification, institutional backing, privacy measures
- Common issues: Insufficient ethical approval, unclear research purpose, inadequate security
- Timeline: Extended due to privacy and security reviews
- Requirements: Research ethics, data protection measures, institutional affiliation`,
    };

    return `You are an expert analyst for Austrian data request forms. Analyze form data and provide intelligent insights to improve request success rates.

${lawInfo[requestType]}

Analysis Framework:
1. Completeness Assessment: Evaluate if all necessary information is provided
2. Success Probability: Assess likelihood of approval based on Austrian administrative practice
3. Legal Compliance: Check adherence to ${requestType} requirements
4. Agency Matching: Suggest most appropriate government agencies
5. Timeline Estimation: Provide realistic processing time estimates
6. Risk Identification: Flag potential issues or rejections

Austrian Administrative Context:
- Multi-level government structure (Federal/State/Municipal)
- Formal communication protocols
- GDPR and privacy considerations
- Agency competencies and jurisdictions
- Historical approval patterns
- Common rejection reasons

Provide actionable, specific recommendations that increase approval probability.`;
}

function buildFormAnalysisPrompt(
    requestType: RequestType,
    formData: Record<string, any>,
    currentStep: number,
    totalSteps: number
): string {
    const dataString = Object.entries(formData)
        .filter(([_, value]) => value && value.toString().trim())
        .map(([key, value]) => `${key}: ${value}`)
        .join('\n');

    const progressInfo = `Form Progress: Step ${currentStep} of ${totalSteps} (${Math.round((currentStep / totalSteps) * 100)}% complete)`;

    return `Analyze this ${requestType} data request form and provide intelligent insights:

${progressInfo}

Current Form Data:
${dataString || "No data provided yet"}

Analysis Requirements:
1. Assess form completeness and quality
2. Identify potential approval obstacles
3. Suggest relevant Austrian government agencies
4. Estimate realistic processing timeline
5. Provide actionable improvement recommendations
6. Highlight any legal or procedural concerns

Focus on:
- Specific, actionable advice for improvement
- Austrian administrative context and requirements
- Common approval/rejection patterns
- Agency competencies and jurisdictions
- Legal compliance under ${requestType}

Generate insights that help users create successful data requests.`;
}