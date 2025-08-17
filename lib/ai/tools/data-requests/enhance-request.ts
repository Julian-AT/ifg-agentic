import { tool } from "ai";
import { z } from "zod";
import { generateObject } from "ai";
import { myProvider } from "@/lib/ai/providers";
import type { UIMessageStreamWriter } from "ai";
import type { Session } from "next-auth";
import type { RequestType } from "@/lib/types/data-request";

// Schema definitions
const RequestTypeSchema = z.enum(["IFG", "IWG", "DZG"]);

const FormDataSchema = z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    publicInterest: z.string().optional(),
    requestType: RequestTypeSchema.optional(),
    searchQuery: z.string().optional(),
    businessModel: z.string().optional(),
    researchPurpose: z.string().optional(),
    technicalRequirements: z.string().optional(),
});

const EnhancementSchema = z.object({
    category: z.string(),
    subCategory: z.string().optional(),
    suggestedTimeline: z.object({
        expectedDays: z.number(),
        urgencyLevel: z.enum(["low", "medium", "high"]),
        factors: z.array(z.string()),
    }),
    privacyConcerns: z.array(
        z.object({
            concern: z.string(),
            severity: z.enum(["low", "medium", "high"]),
            mitigation: z.string(),
        })
    ),
    recommendations: z.array(z.string()),
    estimatedCost: z
        .object({
            processingFee: z.number(),
            dataPreparationFee: z.number().optional(),
            currency: z.string(),
        })
        .optional(),
    legalConsiderations: z.array(z.string()),
});

interface EnhanceRequestProps {
    session: Session;
    dataStream: UIMessageStreamWriter;
}

/**
 * AI-powered request enhancement tool
 * Analyzes and enhances data requests with categorization, timeline estimation, and privacy assessment
 */
export function enhanceDataRequest({
    session,
    dataStream,
}: EnhanceRequestProps) {
    return tool({
        description:
            "Enhance and analyze a data request with AI-powered categorization, timeline estimation, and privacy assessment. Provides comprehensive analysis to improve request success rates.",
        inputSchema: z.object({
            requestType: RequestTypeSchema,
            formData: FormDataSchema,
        }),
        execute: async ({ requestType, formData }) => {
            try {
                console.log(`🔍 Enhancing ${requestType} request:`, {
                    hasTitle: !!formData.title,
                    hasDescription: !!formData.description,
                });

                const systemPrompt = getRequestEnhancementPrompt(requestType);
                const userPrompt = buildRequestEnhancementPrompt(formData);

                const { object } = await generateObject({
                    model: myProvider.languageModel("artifact-model"),
                    system: systemPrompt,
                    prompt: userPrompt,
                    schema: EnhancementSchema,
                });

                // Validate enhancement data
                const enhancement = validateEnhancement(object);

                // Stream the enhancement data to the UI
                dataStream.write({
                    type: "data-requestEnhancement",
                    data: {
                        enhancement,
                        requestType,
                    },
                    transient: false,
                });

                console.log(`✅ Generated enhancement with ${enhancement.recommendations.length} recommendations`);

                return {
                    success: true,
                    enhancement,
                    metadata: {
                        requestType,
                        category: enhancement.category,
                        urgencyLevel: enhancement.suggestedTimeline.urgencyLevel,
                        privacyConcernCount: enhancement.privacyConcerns.length,
                        recommendationCount: enhancement.recommendations.length,
                    },
                };
            } catch (error) {
                console.error("❌ Error enhancing data request:", error);

                const errorMessage = error instanceof Error
                    ? error.message
                    : "Unknown error occurred";

                return {
                    success: false,
                    error: "Failed to enhance data request",
                    details: errorMessage,
                };
            }
        },
    });
}

/**
 * Validate and clean enhancement data
 */
function validateEnhancement(enhancement: any): any {
    return {
        ...enhancement,
        recommendations: enhancement.recommendations.filter(
            (rec: string) => rec.trim().length > 0
        ),
        privacyConcerns: enhancement.privacyConcerns.filter(
            (concern: any) => concern.concern.trim().length > 0
        ),
        suggestedTimeline: {
            ...enhancement.suggestedTimeline,
            expectedDays: Math.max(1, enhancement.suggestedTimeline.expectedDays),
            factors: enhancement.suggestedTimeline.factors.filter(
                (factor: string) => factor.trim().length > 0
            ),
        },
    };
}

/**
 * Generate system prompt for request enhancement
 */
function getRequestEnhancementPrompt(requestType: RequestType): string {
    return `You are an expert in Austrian data request processing and legal frameworks. Analyze and enhance data requests with:

1. Categorization based on data type and purpose
2. Realistic timeline estimation considering:
   - Legal deadlines (${requestType} framework)
   - Agency workload and capacity
   - Data complexity and preparation needs
   - Potential legal or privacy reviews

3. Privacy and legal considerations:
   - GDPR compliance requirements
   - National security or commercial sensitivity
   - Third-party data protection
   - Anonymization needs

4. Cost estimation where applicable
5. Optimization recommendations

Legal framework specifics:
- IFG: 8 weeks standard, free access principle
- IWG: 20 working days, potential fees for data preparation
- DZG: 15 working days, focus on high-value datasets

Provide practical, actionable insights to improve request success rates.
Be specific about Austrian legal requirements and government processes.`;
}

/**
 * Build user prompt for request enhancement
 */
function buildRequestEnhancementPrompt(formData: any): string {
    const dataString = JSON.stringify(formData, null, 2);
    return `Analyze and enhance this data request:

${dataString}

Provide comprehensive analysis including:
1. Appropriate categorization
2. Realistic timeline with specific factors
3. Privacy and legal considerations
4. Cost estimates where applicable
5. Specific recommendations for improvement

Focus on practical advice that will increase the likelihood of a successful request.`;
}