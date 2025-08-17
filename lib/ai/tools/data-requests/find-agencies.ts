import { tool } from "ai";
import { z } from "zod";
import { generateObject } from "ai";
import { myProvider } from "@/lib/ai/providers";
import type { UIMessageStreamWriter } from "ai";
import type { Session } from "next-auth";
import type { RequestType } from "@/lib/types/data-request";

// Schema definitions
const RequestTypeSchema = z.enum(["IFG", "IWG", "DZG"]);

const AgencySuggestionSchema = z.object({
    name: z.string(),
    type: z.string(),
    relevanceScore: z.number().min(0).max(1),
    reasoning: z.string(),
    competencies: z.array(z.string()),
    contactInfo: z.object({
        email: z.string().optional(),
        phone: z.string().optional(),
        address: z.string().optional(),
        website: z.string().optional(),
    }),
    performanceMetrics: z.object({
        averageResponseTime: z.number(),
        successRate: z.number(),
        userRating: z.number(),
    }),
});

interface FindAgenciesProps {
    session: Session;
    dataStream: UIMessageStreamWriter;
}

/**
 * AI-powered agency matching tool
 * Finds the most relevant Austrian government agencies for data requests
 */
export function findRelevantAgencies({
    session,
    dataStream,
}: FindAgenciesProps) {
    return tool({
        description:
            "Find the most relevant Austrian government agencies for a data request using AI analysis. Matches requests to agencies based on competencies, legal mandates, and historical performance.",
        inputSchema: z.object({
            requestType: RequestTypeSchema,
            requestTitle: z.string().min(1, "Request title is required"),
            requestDescription: z.string().min(1, "Request description is required"),
            dataCategory: z.string().optional(),
        }),
        execute: async ({
            requestType,
            requestTitle,
            requestDescription,
            dataCategory,
        }) => {
            try {
                console.log(`🏛️ Finding agencies for ${requestType} request:`, {
                    title: requestTitle,
                    category: dataCategory,
                });

                const systemPrompt = getAgencyMatchingPrompt();
                const userPrompt = buildAgencyMatchingPrompt(
                    requestType,
                    requestTitle,
                    requestDescription,
                    dataCategory
                );

                const { object } = await generateObject({
                    model: myProvider.languageModel("artifact-model"),
                    system: systemPrompt,
                    prompt: userPrompt,
                    schema: z.object({
                        agencies: z.array(AgencySuggestionSchema),
                        reasoning: z.string(),
                        confidence: z.number().min(0).max(1),
                    }),
                });

                // Validate and sort agencies by relevance
                const validAgencies = object.agencies
                    .filter((agency) =>
                        agency.name.trim().length > 0 &&
                        agency.reasoning.trim().length > 0 &&
                        agency.relevanceScore > 0
                    )
                    .sort((a, b) => b.relevanceScore - a.relevanceScore)
                    .slice(0, 5); // Limit to top 5 agencies

                // Stream the agency suggestions to the UI
                dataStream.write({
                    type: "data-agencySuggestions",
                    data: {
                        agencies: validAgencies,
                        reasoning: object.reasoning,
                        confidence: object.confidence,
                        requestType,
                    },
                    transient: false,
                });

                console.log(`✅ Found ${validAgencies.length} relevant agencies`);

                return {
                    success: true,
                    agencies: validAgencies,
                    reasoning: object.reasoning,
                    confidence: object.confidence,
                    metadata: {
                        requestType,
                        agencyCount: validAgencies.length,
                        topAgency: validAgencies[0]?.name,
                    },
                };
            } catch (error) {
                console.error("❌ Error finding relevant agencies:", error);

                const errorMessage = error instanceof Error
                    ? error.message
                    : "Unknown error occurred";

                return {
                    success: false,
                    error: "Failed to find relevant agencies",
                    details: errorMessage,
                };
            }
        },
    });
}

/**
 * Generate system prompt for agency matching
 */
function getAgencyMatchingPrompt(): string {
    return `You are an expert on Austrian government structure and data governance. Identify the most relevant government agencies for data requests.

Key Austrian agencies and their competencies:
- Federal Ministries (BMF, BMSGPK, BMI, BMLRT, etc.) - national policy and regulation
- Statistics Austria - official statistics and census data
- Regional governments (Länder) - regional administration and services
- Municipalities - local government data
- Regulatory agencies - sector-specific oversight
- Public institutions - universities, hospitals, etc.

Evaluation criteria:
- Agency competencies and legal mandates
- Data ownership and processing responsibilities
- Historical response patterns and performance
- Administrative hierarchy and data flow
- Legal frameworks (IFG, IWG, DZG) requirements

Instructions:
- Rank agencies by relevance (0.0 to 1.0 scale)
- Provide detailed reasoning for each suggestion
- Include realistic performance metrics
- Focus on agencies most likely to have the requested data
- Consider the specific legal framework requirements`;
}

/**
 * Build user prompt for agency matching
 */
function buildAgencyMatchingPrompt(
    requestType: RequestType,
    title: string,
    description: string,
    category?: string
): string {
    return `Find the most relevant Austrian government agencies for this ${requestType} request:

Title: ${title}
Description: ${description}
${category ? `Category: ${category}` : ""}

Consider the specific legal framework (${requestType}) and identify agencies most likely to:
1. Have the requested data
2. Have authority to process the request
3. Respond within reasonable timeframes
4. Provide high-quality data

Focus on agencies with direct competency over the subject matter.`;
}