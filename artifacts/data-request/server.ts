import { z } from "zod";
import { streamObject, generateObject } from "ai";
import { myProvider } from "@/lib/ai/providers";
import { createDocumentHandler } from "@/lib/artifacts/server";
import type {
  FormSuggestion,
  AgencySuggestion,
} from "@/lib/types/data-request";
import { generateUUID } from "@/lib/utils";

// Zod schemas for AI responses
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

const RequestEnhancementSchema = z.object({
  category: z.string(),
  suggestedTimeline: z.object({
    expectedDays: z.number(),
    urgencyLevel: z.enum(["low", "medium", "high"]),
  }),
  privacyConcerns: z.array(z.string()),
  recommendations: z.array(z.string()),
});

export const dataRequestDocumentHandler = createDocumentHandler<"data-request">(
  {
    kind: "data-request",
    onCreateDocument: async ({ title, dataStream }) => {
      console.log("onCreateDocument data-request", { title });

      // Initialize with search query if provided
      const searchQuery = title || "";

      // The createDocument tool already handles the artifact creation events
      // (data-id, data-title, data-kind, data-clear, data-finish)
      // We just need to return the initial content

      return searchQuery;
    },
    onUpdateDocument: async ({ document, description, dataStream }) => {
      console.log("onUpdateDocument data-request", { description });

      try {
        // Parse the update request
        const updateRequest = parseUpdateRequest(description);

        switch (updateRequest.action) {
          case "generateSuggestions":
            return await generateFormSuggestions(updateRequest, dataStream);

          case "findAgency":
            return await findRelevantAgency(updateRequest, dataStream);

          case "enhanceRequest":
            return await enhanceRequestData(updateRequest, dataStream);

          case "submitRequest":
            return await submitDataRequest(updateRequest, dataStream);

          case "generateFieldContent":
            return await generateStreamingFormContent(updateRequest, dataStream);

          case "generateCompleteForm":
            return await generateStreamingFormContent({
              requestType: extractRequestType(description),
              userRequest: description,
              existingFormData: extractFormContext(description)
            }, dataStream);

          default:
            // Check if this is a special auto-fill trigger
            if (description === "AUTO_FILL_FORM") {
              return await generateStreamingFormContent({
                requestType: "IFG", // Default, can be enhanced to detect from current form
                userRequest: "Generate a professional Austrian government data request",
                existingFormData: {}
              }, dataStream);
            }

            // Check if this is a form generation request
            if (description.toLowerCase().includes("generate") ||
              description.toLowerCase().includes("complete") ||
              description.toLowerCase().includes("auto-fill")) {
              return await generateStreamingFormContent({
                requestType: extractRequestType(description),
                userRequest: description,
                existingFormData: extractFormContext(description)
              }, dataStream);
            }
            // General form update
            return await updateFormData(updateRequest, dataStream);
        }
      } catch (error) {
        console.error("Error updating data request:", error);
        dataStream.write({
          type: "error",
          errorText: "Failed to process request update",
        });
        return document.content;
      }
    },
  }
);

// Helper functions

function parseUpdateRequest(description: string) {
  // Parse natural language updates into structured requests
  const lowerDesc = description.toLowerCase();

  if (lowerDesc.includes("suggestion") || lowerDesc.includes("help")) {
    return { action: "generateSuggestions", description };
  }

  if (lowerDesc.includes("agency") || lowerDesc.includes("find")) {
    return { action: "findAgency", description };
  }

  if (lowerDesc.includes("enhance") || lowerDesc.includes("improve")) {
    return { action: "enhanceRequest", description };
  }

  if (lowerDesc.includes("submit") || lowerDesc.includes("send")) {
    return { action: "submitRequest", description };
  }

  // Check for field content generation requests
  if (lowerDesc.includes("fill") || lowerDesc.includes("complete") || lowerDesc.includes("generate")) {
    // Try to extract field name and context
    const fieldMatch = description.match(/(?:fill|complete|generate).*?(?:title|description|public.*?interest|name|email|organization)/i);
    if (fieldMatch) {
      return {
        action: "generateFieldContent",
        description,
        field: fieldMatch[0].split(/\s+/).pop(),
        requestType: extractRequestType(description),
        formContext: extractFormContext(description)
      };
    }
  }

  return { action: "update", description };
}

function extractRequestType(description: string): string {
  const lowerDesc = description.toLowerCase();
  if (lowerDesc.includes("ifg")) return "IFG";
  if (lowerDesc.includes("iwg")) return "IWG";
  if (lowerDesc.includes("dzg")) return "DZG";
  return "IFG"; // default
}

function extractFormContext(description: string): any {
  // This could be enhanced to extract more context from the description
  // For now, return a basic context
  return {
    source: "AI generation request",
    timestamp: new Date().toISOString(),
  };
}

async function generateFormSuggestions(request: any, dataStream: any) {
  const { fullStream } = streamObject({
    model: myProvider.languageModel("artifact-model"),
    system: `You are an expert in Austrian data protection and freedom of information laws (IFG, IWG, DZG). 
    Generate helpful suggestions for form fields based on the user's request context.
    Consider legal requirements, typical use cases, and best practices.
    
    For IFG requests: Focus on information access rights, public interest, and specific data needs.
    For IWG requests: Focus on data reuse, commercial applications, and technical requirements.
    For DZG requests: Focus on high-value datasets, research applications, and public benefit.`,
    prompt: `Generate form field suggestions for: ${request.description}`,
    schema: z.object({
      suggestions: z.array(FormSuggestionSchema),
    }),
  });

  let suggestions: FormSuggestion[] = [];

  for await (const delta of fullStream) {
    if (delta.type === "object" && delta.object.suggestions) {
      suggestions = delta.object.suggestions.filter((s: any) => s != null) as FormSuggestion[];

      dataStream.write({
        type: "data-suggestions",
        data: { suggestions },
        transient: false,
      });
    }
  }

  return JSON.stringify(suggestions);
}

async function findRelevantAgency(request: any, dataStream: any) {
  const { fullStream } = streamObject({
    model: myProvider.languageModel("artifact-model"),
    system: `You are an expert on Austrian government structure and data governance.
    Identify the most relevant government agencies for data requests based on the topic and legal framework.
    Consider competencies, organizational structure, and typical response patterns.
    
    Key Austrian agencies include:
    - Ministries (BMF, BMSGPK, BMI, etc.)
    - Regional governments (Länder)
    - Municipalities
    - Specialized agencies (Statistics Austria, etc.)`,
    prompt: `Find the most relevant Austrian government agency for: ${request.description}`,
    schema: z.object({
      agencies: z.array(AgencySuggestionSchema),
    }),
  });

  let agencies: AgencySuggestion[] = [];

  for await (const delta of fullStream) {
    if (delta.type === "object" && delta.object.agencies) {
      agencies = delta.object.agencies.filter((a: any) => a != null) as AgencySuggestion[];

      dataStream.write({
        type: "data-agencies",
        data: { agencies },
        transient: false,
      });
    }
  }

  return JSON.stringify(agencies);
}

async function enhanceRequestData(request: any, dataStream: any) {
  const { object } = await generateObject({
    model: myProvider.languageModel("artifact-model"),
    system: `You are an expert in Austrian data request processing.
    Analyze and enhance data requests with categorization, timeline estimation, and privacy assessment.
    Consider legal frameworks, typical processing times, and potential complications.`,
    prompt: `Enhance and analyze this data request: ${request.description}`,
    schema: RequestEnhancementSchema,
  });

  dataStream.write({
    type: "data-enhancement",
    data: object,
    transient: false,
  });

  return JSON.stringify(object);
}

async function submitDataRequest(request: any, dataStream: any) {
  // In a real implementation, this would integrate with government APIs
  // For now, we'll simulate the submission process

  const requestId = generateUUID();
  const submittedRequest: any = {
    id: requestId,
    type: "IFG", // This would be parsed from the form data
    status: "submitted",
    submittedAt: new Date(),
    title: "Data Request",
    description: request.description,
    agency: {
      name: "Austrian Government Agency",
      type: "federal",
      competencies: ["Data governance", "Public information"],
      // Extra fields for suggestion purposes
      relevanceScore: 0.9,
      reasoning: "Primary competency for this data type",
      contactInfo: {
        email: "info@agency.gv.at",
        website: "https://agency.gv.at",
      },
      performanceMetrics: {
        averageResponseTime: 30,
        successRate: 0.85,
        userRating: 4.2,
      },
    },
    timeline: {
      submittedAt: new Date(),
      deadline: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000), // 28 days (4 weeks)
      escalationLevel: 0,
      expectedResponseAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      actualResponseAt: null,
      reminderSentAt: null,
    },
    statusHistory: [
      {
        status: "submitted",
        timestamp: new Date(),
        note: "Request submitted successfully",
        actor: "system",
      },
    ],
    requesterInfo: {
      name: "User",
      email: "user@example.com",
    },
  };

  dataStream.write({
    type: "data-requestSubmitted",
    data: { request: submittedRequest },
    transient: false,
  });

  return JSON.stringify(submittedRequest);
}

async function updateFormData(request: any, dataStream: any) {
  // Check if this is a streaming form field update request
  if (request.streamField && request.fieldContent !== undefined) {
    return await streamFormFieldUpdate(request, dataStream);
  }

  // Handle general form updates
  dataStream.write({
    type: "data-formProgress",
    data: {
      step: 1,
      formData: {
        title: request.description,
        description: "",
      },
    },
    transient: false,
  });

  return request.description;
}

async function streamFormFieldUpdate(request: any, dataStream: any) {
  const { streamField, fieldContent, isComplete = false } = request;

  // Stream the form field delta similar to how code artifacts work
  dataStream.write({
    type: "data-formDelta",
    data: {
      field: streamField,
      content: fieldContent,
      isComplete: isComplete,
    },
    transient: false,
  });

  return fieldContent;
}

// Function to generate AI-powered form content with streaming using streamObject
async function generateStreamingFormContent(request: any, dataStream: any) {
  const { requestType, userRequest, existingFormData = {} } = request;

  const systemPrompt = getFormGenerationSystemPrompt(requestType);
  const userPrompt = buildFormGenerationPrompt(userRequest, existingFormData);

  // Define form schema based on request type
  const formSchema = getFormSchema(requestType);

  // Stream the form object generation
  const { partialObjectStream } = streamObject({
    model: myProvider.languageModel("artifact-model"),
    system: systemPrompt,
    prompt: userPrompt,
    schema: formSchema,
  });

  let previousObject = {};

  for await (const partialObject of partialObjectStream) {
    // Compare with previous to detect changes
    const changes = detectFormChanges(previousObject, partialObject);

    // Stream each changed field
    for (const change of changes) {
      dataStream.write({
        type: "data-formDelta",
        data: {
          field: change.field,
          content: change.newValue,
          oldValue: change.oldValue,
          isComplete: false,
          hasChange: change.oldValue !== change.newValue,
        },
        transient: false,
      });
    }

    previousObject = { ...partialObject };
  }

  // Mark generation as complete
  dataStream.write({
    type: "data-formComplete",
    data: {
      formData: previousObject,
      isComplete: true,
    },
    transient: false,
  });

  return previousObject;
}

function getFormFieldSystemPrompt(requestType: string, field: string): string {
  const lawInfo = {
    IFG: "Informationsfreiheitsgesetz - focuses on transparency and public access to government information",
    IWG: "Informationsweiterverwendungsgesetz - focuses on commercial and research reuse of public data",
    DZG: "Datenzugangsgesetz - focuses on high-value datasets and protected data for research",
  };

  return `You are an expert assistant for Austrian ${requestType} data requests.
${lawInfo[requestType as keyof typeof lawInfo] || ""}

Generate appropriate content for the "${field}" field that:
- Follows Austrian legal requirements and best practices
- Uses professional, formal language appropriate for government communication
- Is specific and actionable
- Demonstrates legitimate public interest where applicable
- Considers GDPR and privacy implications
- Increases the likelihood of request approval

Write clear, concise, and legally compliant content.`;
}

function buildFormFieldPrompt(field: string, partialContent: string, formContext: any): string {
  const context = formContext ? Object.entries(formContext)
    .filter(([_, value]) => value && typeof value === 'string')
    .map(([key, value]) => `${key}: ${value}`)
    .join('\n') : '';

  return `Generate content for the "${field}" field based on:

Current partial content: "${partialContent || ''}"
${context ? `\nForm context:\n${context}` : ''}

Complete the field with appropriate, professional content that strengthens the data request.`;
}

// New helper functions for streamObject implementation

function getFormGenerationSystemPrompt(requestType: string): string {
  const lawInfo = {
    IFG: "Informationsfreiheitsgesetz (Freedom of Information Act) - general transparency and public access to government information",
    IWG: "Informationsweiterverwendungsgesetz (Information Reuse Act) - commercial and research reuse of public data",
    DZG: "Datenzugangsgesetz (Data Access Act) - access to high-value and protected datasets for research",
  };

  return `You are an expert assistant for Austrian ${requestType} data requests.
${lawInfo[requestType as keyof typeof lawInfo] || ""}

Generate a complete, professional data request form that:
- Follows Austrian legal requirements and administrative procedures
- Uses formal, appropriate language for government communication
- Is specific and actionable to increase approval likelihood
- Demonstrates legitimate public interest where applicable
- Considers GDPR and privacy implications
- Includes all required fields and proper justifications

Tailor the content specifically to the user's request while ensuring legal compliance.`;
}

function buildFormGenerationPrompt(userRequest: string, existingFormData: any): string {
  const existingContent = Object.entries(existingFormData)
    .filter(([_, value]) => value && typeof value === 'string' && value.trim())
    .map(([key, value]) => `${key}: ${value}`)
    .join('\n');

  return `Generate a complete data request form based on this user request:
"${userRequest}"

${existingContent ? `\nExisting form content to build upon:\n${existingContent}` : ''}

Requirements:
- Generate appropriate content for all form fields
- Ensure professional, legally compliant language
- Be specific and detailed to improve success rate
- If existing content is provided, enhance and improve it rather than replacing entirely
- Focus on the user's specific request while meeting legal requirements`;
}

function getFormSchema(requestType: string) {
  const baseSchema = z.object({
    requestType: z.string().default(requestType),
    title: z.string().describe("Clear, specific title for the data request"),
    description: z.string().describe("Detailed description of the requested information or data"),
    publicInterest: z.string().describe("Explanation of public interest and transparency value"),
    requesterName: z.string().describe("Full name of the requester"),
    requesterEmail: z.string().email().describe("Email address for correspondence"),
    organization: z.string().optional().describe("Organization name if applicable"),
    urgency: z.enum(["low", "medium", "high"]).default("medium"),
  });

  // Extend schema based on request type
  switch (requestType) {
    case "IWG":
      return baseSchema.extend({
        businessModel: z.string().describe("Description of intended commercial use or business model"),
        technicalRequirements: z.string().describe("Required data formats and technical specifications"),
        dataUsagePurpose: z.string().describe("Specific purpose for data reuse"),
      });

    case "DZG":
      return baseSchema.extend({
        researchPurpose: z.string().describe("Academic or scientific research purpose"),
        institutionalAffiliation: z.string().describe("Research institution or university affiliation"),
        dataProtectionMeasures: z.string().describe("Privacy and data protection measures to be implemented"),
        ethicsApproval: z.string().optional().describe("Ethics committee approval if applicable"),
      });

    default: // IFG
      return baseSchema.extend({
        timeframe: z.string().optional().describe("Specific time period for requested information"),
      });
  }
}

function detectFormChanges(oldObj: any, newObj: any): Array<{ field: string, oldValue: any, newValue: any }> {
  const changes: Array<{ field: string, oldValue: any, newValue: any }> = [];

  const allKeys = new Set([...Object.keys(oldObj || {}), ...Object.keys(newObj || {})]);

  for (const key of allKeys) {
    const oldValue = oldObj[key] || "";
    const newValue = newObj[key] || "";

    if (oldValue !== newValue) {
      changes.push({
        field: key,
        oldValue,
        newValue,
      });
    }
  }

  return changes;
}
