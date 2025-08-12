import { tool } from "ai";
import { z } from "zod";
import { generateObject } from "ai";
import { myProvider } from "@/lib/ai/providers";
import type { UIMessageStreamWriter } from "ai";
import type { Session } from "next-auth";
import type {
  UserDataRequest,
  RequestType,
  Agency,
} from "@/lib/types/data-request";
import { generateUUID } from "@/lib/utils";
import type { ChatMessage } from "@/lib/types";

// Schema definitions for AI tool inputs and outputs
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

// AI-powered form suggestions tool
export function generateDataRequestSuggestions({
  session,
  dataStream,
}: {
  session: Session;
  dataStream: UIMessageStreamWriter;
}) {
  return tool({
    description:
      "Generate AI-powered suggestions for data request form fields based on Austrian laws (IFG, IWG, DZG)",
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
        const systemPrompt = getFormSuggestionPrompt(requestType);

        const { object } = await generateObject({
          model: myProvider.languageModel("artifact-model"),
          system: systemPrompt,
          prompt: buildFormSuggestionPrompt(currentFormData, focusField),
          schema: z.object({
            suggestions: z.array(FormSuggestionSchema),
            reasoning: z.string(),
          }),
        });

        // Stream the suggestions to the UI
        dataStream.write({
          type: "data-formSuggestions",
          data: {
            suggestions: object.suggestions,
            reasoning: object.reasoning,
            requestType,
          },
          transient: false,
        });

        return {
          success: true,
          suggestions: object.suggestions,
          reasoning: object.reasoning,
        };
      } catch (error) {
        console.error("Error generating form suggestions:", error);
        return {
          success: false,
          error: "Failed to generate form suggestions",
        };
      }
    },
  });
}

// AI-powered agency matching tool
export function findRelevantAgencies({
  session,
  dataStream,
}: {
  session: Session;
  dataStream: UIMessageStreamWriter;
}) {
  return tool({
    description:
      "Find the most relevant Austrian government agencies for a data request using AI analysis",
    inputSchema: z.object({
      requestType: RequestTypeSchema,
      requestTitle: z.string(),
      requestDescription: z.string(),
      dataCategory: z.string().optional(),
    }),
    execute: async ({
      requestType,
      requestTitle,
      requestDescription,
      dataCategory,
    }) => {
      try {
        const systemPrompt = getAgencyMatchingPrompt();

        const { object } = await generateObject({
          model: myProvider.languageModel("artifact-model"),
          system: systemPrompt,
          prompt: buildAgencyMatchingPrompt(
            requestType,
            requestTitle,
            requestDescription,
            dataCategory
          ),
          schema: z.object({
            agencies: z.array(AgencySuggestionSchema),
            reasoning: z.string(),
            confidence: z.number().min(0).max(1),
          }),
        });

        // Stream the agency suggestions to the UI
        dataStream.write({
          type: "data-agencySuggestions",
          data: {
            agencies: object.agencies,
            reasoning: object.reasoning,
            confidence: object.confidence,
            requestType,
          },
          transient: false,
        });

        return {
          success: true,
          agencies: object.agencies,
          reasoning: object.reasoning,
          confidence: object.confidence,
        };
      } catch (error) {
        console.error("Error finding relevant agencies:", error);
        return {
          success: false,
          error: "Failed to find relevant agencies",
        };
      }
    },
  });
}

// AI-powered request enhancement tool
export function enhanceDataRequest({
  session,
  dataStream,
}: {
  session: Session;
  dataStream: UIMessageStreamWriter;
}) {
  return tool({
    description:
      "Enhance and analyze a data request with AI-powered categorization, timeline estimation, and privacy assessment",
    inputSchema: z.object({
      requestType: RequestTypeSchema,
      formData: FormDataSchema.extend({
        businessModel: z.string().optional(),
        researchPurpose: z.string().optional(),
        technicalRequirements: z.string().optional(),
      }),
    }),
    execute: async ({ requestType, formData }) => {
      try {
        const systemPrompt = getRequestEnhancementPrompt(requestType);

        const { object } = await generateObject({
          model: myProvider.languageModel("artifact-model"),
          system: systemPrompt,
          prompt: buildRequestEnhancementPrompt(formData),
          schema: z.object({
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
          }),
        });

        // Stream the enhancement data to the UI
        dataStream.write({
          type: "data-requestEnhancement",
          data: {
            enhancement: object,
            requestType,
          },
          transient: false,
        });

        return {
          success: true,
          enhancement: object,
        };
      } catch (error) {
        console.error("Error enhancing data request:", error);
        return {
          success: false,
          error: "Failed to enhance data request",
        };
      }
    },
  });
}

// AI-powered request validation tool
export function validateDataRequest({
  session,
  dataStream,
}: {
  session: Session;
  dataStream: UIMessageStreamWriter;
}) {
  return tool({
    description:
      "Validate a data request form for completeness and legal compliance using AI analysis",
    inputSchema: z.object({
      requestType: RequestTypeSchema,
      formData: z.record(z.any()),
    }),
    execute: async ({ requestType, formData }) => {
      try {
        const systemPrompt = getValidationPrompt(requestType);

        const { object } = await generateObject({
          model: myProvider.languageModel("artifact-model"),
          system: systemPrompt,
          prompt: buildValidationPrompt(formData),
          schema: z.object({
            isValid: z.boolean(),
            completeness: z.number().min(0).max(1),
            errors: z.array(
              z.object({
                field: z.string(),
                message: z.string(),
                severity: z.enum(["error", "warning", "info"]),
              })
            ),
            suggestions: z.array(
              z.object({
                field: z.string(),
                suggestion: z.string(),
                priority: z.enum(["high", "medium", "low"]),
              })
            ),
            legalCompliance: z.object({
              score: z.number().min(0).max(1),
              issues: z.array(z.string()),
              recommendations: z.array(z.string()),
            }),
          }),
        });

        // Stream the validation results to the UI
        dataStream.write({
          type: "data-validationResult",
          data: {
            validation: object,
            requestType,
          },
          transient: false,
        });

        return {
          success: true,
          validation: object,
        };
      } catch (error) {
        console.error("Error validating data request:", error);
        return {
          success: false,
          error: "Failed to validate data request",
        };
      }
    },
  });
}

// Submit data request tool (simulated)
export function submitDataRequest({
  session,
  dataStream,
}: {
  session: Session;
  dataStream: UIMessageStreamWriter<ChatMessage>;
}) {
  return tool({
    description:
      "Submit a completed data request to the appropriate Austrian government agency",
    inputSchema: z.object({
      requestType: RequestTypeSchema,
      formData: z.record(z.any()),
      selectedAgency: AgencySuggestionSchema,
    }),
    execute: async ({ requestType, formData, selectedAgency }) => {
      try {
        const requestId = generateUUID();
        const submittedRequest: UserDataRequest = {
          id: requestId,
          type: requestType,
          status: {
            current: "submitted",
            history: [],
            publiclyVisible: false,
          },
          submittedAt: new Date(),
          title: (formData as any).title || "Data Request",
          description: (formData as any).description || "",
          createdAt: new Date(),
          updatedAt: new Date(),
          agency: selectedAgency as unknown as Agency,
          timeline: {
            submittedAt: new Date(),
            deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
            escalationLevel: 0,
            expectedResponseAt: new Date(
              Date.now() +
                (selectedAgency as any).performanceMetrics.averageResponseTime *
                  24 *
                  60 *
                  60 *
                  1000
            ),
            actualResponseAt: null,
            reminderSentAt: null,
          },
          statusHistory: [
            {
              status: "submitted",
              timestamp: new Date(),
              note: "Request submitted successfully",
              actor: "user",
            },
          ],
          requesterInfo: {
            name: session.user?.name || "User",
            email: session.user?.email || "",
          },
        };

        dataStream.write({
          type: "data-requestSubmitted",
          data: {
            request: submittedRequest,
            confirmationNumber: requestId,
          },
          transient: false,
        });

        return {
          success: true,
          request: submittedRequest,
          confirmationNumber: requestId,
          message: `Your ${requestType} request has been submitted successfully to ${selectedAgency.name}`,
        };
      } catch (error) {
        console.error("Error submitting data request:", error);
        return {
          success: false,
          error: "Failed to submit data request",
        };
      }
    },
  });
}

// Helper functions for generating prompts

function getFormSuggestionPrompt(requestType: RequestType): string {
  const lawInfo = {
    IFG: "Informationsfreiheitsgesetz (Freedom of Information Act) - focuses on transparency and public access to government information",
    IWG: "Informationsweiterverwendungsgesetz (Information Reuse Act) - focuses on commercial and research reuse of public data",
    DZG: "Datenzugangsgesetz (Data Access Act) - focuses on high-value datasets and open data initiatives",
  };

  return `You are an expert on Austrian data protection and transparency laws. Generate helpful, legally compliant suggestions for ${requestType} form fields.

${lawInfo[requestType]}

Consider:
- Legal requirements and typical use cases
- Austrian government structure and competencies  
- Best practices for successful requests
- Clear, specific language that agencies can understand
- Appropriate level of detail for the request type

Generate practical suggestions that will increase the likelihood of a successful request.`;
}

function buildFormSuggestionPrompt(formData: any, focusField?: string): string {
  const context = Object.entries(formData)
    .filter(([_, value]) => value)
    .map(([key, value]) => `${key}: ${value}`)
    .join("\n");

  let prompt = `Based on this form data:\n${context}\n\nGenerate helpful suggestions for form fields.`;

  if (focusField) {
    prompt += ` Focus specifically on the "${focusField}" field.`;
  }

  return prompt;
}

function getAgencyMatchingPrompt(): string {
  return `You are an expert on Austrian government structure and data governance. Identify the most relevant government agencies for data requests.

Key Austrian agencies and their competencies:
- Federal Ministries (BMF, BMSGPK, BMI, BMLRT, etc.) - national policy and regulation
- Statistics Austria - official statistics and census data
- Regional governments (Länder) - regional administration and services
- Municipalities - local government data
- Regulatory agencies - sector-specific oversight
- Public institutions - universities, hospitals, etc.

Consider:
- Agency competencies and legal mandates
- Data ownership and processing responsibilities
- Historical response patterns and performance
- Administrative hierarchy and data flow
- Legal frameworks (IFG, IWG, DZG) requirements

Rank agencies by relevance and provide detailed reasoning.`;
}

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

Consider the specific legal framework (${requestType}) and identify agencies most likely to have the requested data and authority to process the request.`;
}

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

Provide practical, actionable insights to improve request success rates.`;
}

function buildRequestEnhancementPrompt(formData: any): string {
  const dataString = JSON.stringify(formData, null, 2);
  return `Analyze and enhance this data request:\n\n${dataString}\n\nProvide comprehensive analysis and recommendations.`;
}

function getValidationPrompt(requestType: RequestType): string {
  return `You are a legal expert on Austrian transparency laws. Validate data request forms for completeness and legal compliance under ${requestType}.

Check for:
1. Required fields based on legal framework
2. Clarity and specificity of request
3. Appropriate justification (especially for IWG commercial use)
4. Legal compliance and potential issues
5. Optimization opportunities

Provide specific, actionable feedback to improve the request.`;
}

function buildValidationPrompt(formData: any): string {
  const dataString = JSON.stringify(formData, null, 2);
  return `Validate this data request form for completeness and legal compliance:\n\n${dataString}`;
}
