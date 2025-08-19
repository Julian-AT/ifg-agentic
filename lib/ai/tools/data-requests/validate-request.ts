import { tool } from "ai";
import { z } from "zod";
import { generateObject } from "ai";
import { myProvider } from "@/lib/ai/providers";
import type { UIMessageStreamWriter } from "ai";
import type { Session } from "next-auth";
import type { RequestType } from "@/lib/types/data-request";

// Schema definitions
const RequestTypeSchema = z.enum(["IFG", "IWG", "DZG"]);

const ValidationErrorSchema = z.object({
    field: z.string(),
    message: z.string(),
    severity: z.enum(["error", "warning", "info"]),
});

const ValidationSuggestionSchema = z.object({
    field: z.string(),
    suggestion: z.string(),
    priority: z.enum(["high", "medium", "low"]),
});

const LegalComplianceSchema = z.object({
    score: z.number().min(0).max(1),
    issues: z.array(z.string()),
    recommendations: z.array(z.string()),
});

const ValidationResultSchema = z.object({
    isValid: z.boolean(),
    completeness: z.number().min(0).max(1),
    errors: z.array(ValidationErrorSchema),
    suggestions: z.array(ValidationSuggestionSchema),
    legalCompliance: LegalComplianceSchema,
});

interface ValidateRequestProps {
    session: Session;
    dataStream: UIMessageStreamWriter;
}

/**
 * AI-powered request validation tool
 * Validates data request forms for completeness and legal compliance
 */
export function validateDataRequest({
    session,
    dataStream,
}: ValidateRequestProps) {
    return tool({
        description:
            "Validate a data request form for completeness and legal compliance using AI analysis. Checks requirements, legal compliance, and provides actionable feedback.",
        inputSchema: z.object({
            requestType: RequestTypeSchema,
            formData: z.record(z.any()),
        }),
        execute: async ({ requestType, formData }) => {
            try {
                console.log(`🔍 Validating ${requestType} request:`, {
                    fieldCount: Object.keys(formData).length,
                });

                const systemPrompt = getValidationPrompt(requestType);
                const userPrompt = buildValidationPrompt(formData);

                const { object } = await generateObject({
                    model: myProvider.languageModel("artifact-model"),
                    system: systemPrompt,
                    prompt: userPrompt,
                    schema: ValidationResultSchema,
                });

                // Process and enhance validation results
                const validationResult = processValidationResult(object, requestType);

                // Stream the validation results to the UI
                dataStream.write({
                    type: "data-validationResult",
                    data: {
                        validation: validationResult,
                        requestType,
                    },
                    transient: false,
                });

                console.log(`✅ Validation complete:`, {
                    isValid: validationResult.isValid,
                    completeness: validationResult.completeness,
                    errorCount: validationResult.errors.length,
                    suggestionCount: validationResult.suggestions.length,
                });

                return {
                    success: true,
                    validation: validationResult,
                    metadata: {
                        requestType,
                        isValid: validationResult.isValid,
                        completeness: validationResult.completeness,
                        errorCount: validationResult.errors.length,
                        warningCount: validationResult.errors.filter((e: any) => e.severity === "warning").length,
                    },
                };
            } catch (error) {
                console.error("❌ Error validating data request:", error);

                const errorMessage = error instanceof Error
                    ? error.message
                    : "Unknown error occurred";

                return {
                    success: false,
                    error: "Failed to validate data request",
                    details: errorMessage,
                };
            }
        },
    });
}

/**
 * Process and enhance validation results
 */
function processValidationResult(result: any, requestType: RequestType): any {
    // Sort errors by severity
    const sortedErrors = result.errors.sort((a: any, b: any) => {
        const severityOrder: { [key: string]: number } = { error: 3, warning: 2, info: 1 };
        return (severityOrder[b.severity] || 0) - (severityOrder[a.severity] || 0);
    });

    // Sort suggestions by priority
    const sortedSuggestions = result.suggestions.sort((a: any, b: any) => {
        const priorityOrder: { [key: string]: number } = { high: 3, medium: 2, low: 1 };
        return (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
    });

    // Add framework-specific recommendations
    const frameworkRecommendations = getFrameworkSpecificRecommendations(requestType);

    return {
        ...result,
        errors: sortedErrors,
        suggestions: sortedSuggestions,
        legalCompliance: {
            ...result.legalCompliance,
            recommendations: [
                ...result.legalCompliance.recommendations,
                ...frameworkRecommendations,
            ],
        },
    };
}

/**
 * Get framework-specific recommendations
 */
function getFrameworkSpecificRecommendations(requestType: RequestType): string[] {
    const recommendations = {
        IFG: [
            "Ensure public interest justification is clear and compelling",
            "Reference specific government transparency obligations",
            "Consider citing relevant EU transparency directives",
        ],
        IWG: [
            "Clearly describe commercial use case and business model",
            "Specify technical requirements for data format and delivery",
            "Include willingness to pay reasonable processing fees",
        ],
        DZG: [
            "Focus on high-value datasets as defined by EU regulations",
            "Emphasize research or innovation potential",
            "Consider open data publication benefits",
        ],
    };

    return recommendations[requestType] || [];
}

/**
 * Generate system prompt for validation
 */
function getValidationPrompt(requestType: RequestType): string {
    const frameworkRequirements = {
        IFG: "Focus on transparency, public interest, and citizen rights",
        IWG: "Ensure commercial use justification and technical specifications",
        DZG: "Verify research purpose and high-value dataset criteria",
    };

    return `You are a legal expert on Austrian transparency laws. Validate data request forms for completeness and legal compliance under ${requestType}.

Legal Framework: ${frameworkRequirements[requestType]}

Validation criteria:
1. Required fields based on legal framework
2. Clarity and specificity of request
3. Appropriate justification for request type
4. Legal compliance and potential issues
5. Optimization opportunities

Check for:
- Missing or incomplete required information
- Unclear or vague descriptions
- Legal compliance issues
- Potential obstacles to approval
- Opportunities for improvement

Provide specific, actionable feedback that will improve the request's chances of success.
Consider Austrian government procedures and common approval factors.`;
}

/**
 * Build user prompt for validation
 */
function buildValidationPrompt(formData: any): string {
    const dataString = JSON.stringify(formData, null, 2);
    return `Validate this data request form for completeness and legal compliance:

${dataString}

Provide detailed analysis including:
1. Overall validity assessment
2. Completeness percentage (0.0 to 1.0)
3. Specific errors with severity levels
4. Actionable suggestions with priorities
5. Legal compliance score and recommendations

Focus on practical issues that could prevent approval or delay processing.`;
}