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
});

const FormSuggestionSchema = z.object({
    fieldId: z.string(),
    suggestedValue: z.string(),
    confidence: z.number().min(0).max(1),
    reasoning: z.string(),
    alternatives: z.array(z.string()).optional(),
});

interface GenerateSuggestionsProps {
    session: Session;
    dataStream: UIMessageStreamWriter;
}

/**
 * AI-powered form suggestions tool for data requests
 * Generates intelligent suggestions based on Austrian laws (IFG, IWG, DZG)
 */
export function generateDataRequestSuggestions({
    session,
    dataStream,
}: GenerateSuggestionsProps) {
    return tool({
        description:
            "Generate AI-powered suggestions for data request form fields based on Austrian laws (IFG, IWG, DZG). Provides intelligent, legally compliant suggestions to improve request success rates.",
        inputSchema: z.object({
            requestType: RequestTypeSchema,
            currentFormData: FormDataSchema,
            focusField: z
                .string()
                .optional()
                .describe("Specific field to focus suggestions on"),
        }),
        execute: async ({ requestType, currentFormData, focusField }) => {
            try {
                console.log(`🎯 Generating suggestions for ${requestType} request`, {
                    focusField,
                    hasFormData: !!currentFormData,
                });

                const systemPrompt = getFormSuggestionPrompt(requestType);
                const userPrompt = buildFormSuggestionPrompt(currentFormData, focusField);

                const { object } = await generateObject({
                    model: myProvider.languageModel("artifact-model"),
                    system: systemPrompt,
                    prompt: userPrompt,
                    schema: z.object({
                        suggestions: z.array(FormSuggestionSchema),
                        reasoning: z.string(),
                    }),
                });

                // Validate suggestions quality
                const validSuggestions = object.suggestions.filter(
                    (suggestion) =>
                        suggestion.suggestedValue.trim().length > 0 &&
                        suggestion.reasoning.trim().length > 0
                );

                // Stream the suggestions to the UI
                dataStream.write({
                    type: "data-formSuggestions",
                    data: {
                        suggestions: validSuggestions,
                        reasoning: object.reasoning,
                        requestType,
                    },
                    transient: false,
                });

                console.log(`✅ Generated ${validSuggestions.length} suggestions`);

                return {
                    success: true,
                    suggestions: validSuggestions,
                    reasoning: object.reasoning,
                    metadata: {
                        requestType,
                        focusField,
                        suggestionCount: validSuggestions.length,
                    },
                };
            } catch (error) {
                console.error("❌ Error generating form suggestions:", error);

                // Return user-friendly error
                const errorMessage = error instanceof Error
                    ? error.message
                    : "Unknown error occurred";

                return {
                    success: false,
                    error: "Failed to generate form suggestions",
                    details: errorMessage,
                };
            }
        },
    });
}

/**
 * Generate system prompt based on request type
 */
function getFormSuggestionPrompt(requestType: RequestType): string {
    const lawInfo = {
        IFG: "Informationsfreiheitsgesetz (Freedom of Information Act) - focuses on transparency and public access to government information",
        IWG: "Informationsweiterverwendungsgesetz (Information Reuse Act) - focuses on commercial and research reuse of public data",
        DZG: "Datenzugangsgesetz (Data Access Act) - focuses on high-value datasets and open data initiatives",
    };

    return `You are an expert on Austrian data protection and transparency laws. Generate helpful, legally compliant suggestions for ${requestType} form fields.

${lawInfo[requestType]}

Key principles:
- Legal requirements and typical use cases
- Austrian government structure and competencies  
- Best practices for successful requests
- Clear, specific language that agencies can understand
- Appropriate level of detail for the request type

Generate practical suggestions that will increase the likelihood of a successful request.
Focus on actionable improvements that address common pitfalls and legal requirements.`;
}

/**
 * Build user prompt based on form data and focus
 */
function buildFormSuggestionPrompt(formData: any, focusField?: string): string {
    const context = Object.entries(formData)
        .filter(([_, value]) => value)
        .map(([key, value]) => `${key}: ${value}`)
        .join("\n");

    let prompt = `Based on this form data:\n${context}\n\nGenerate helpful suggestions for improving the form fields.`;

    if (focusField) {
        prompt += ` Focus specifically on the "${focusField}" field and provide detailed suggestions for improvement.`;
    } else {
        prompt += ` Analyze all fields and suggest improvements where needed.`;
    }

    return prompt;
}