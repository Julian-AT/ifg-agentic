import { z } from "zod";
import { streamObject, generateObject } from "ai";
import { myProvider } from "@/lib/ai/providers";
import { createDocumentHandler } from "@/lib/artifacts/server";
import type {
  DataRequestFormData,
  FormSuggestion,
  AgencySuggestion,
  UserDataRequest,
  RequestStatus,
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

      // Stream initial data
      dataStream.write({
        type: "data-formProgress",
        data: {
          step: 0,
          formData: {
            searchQuery,
            title: "",
            description: "",
          } as Partial<DataRequestFormData>,
        },
        transient: false,
      });

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

          default:
            // General form update
            return await updateFormData(updateRequest, dataStream);
        }
      } catch (error) {
        console.error("Error updating data request:", error);
        dataStream.write({
          type: "error",
          data: { message: "Failed to process request update" },
          transient: false,
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

  return { action: "update", description };
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
      suggestions = delta.object.suggestions;

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
      agencies = delta.object.agencies;

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
  const submittedRequest: UserDataRequest = {
    id: requestId,
    type: "IFG", // This would be parsed from the form data
    status: "submitted" as RequestStatus,
    submittedAt: new Date(),
    title: "Data Request",
    description: request.description,
    agency: {
      name: "Austrian Government Agency",
      type: "Ministry",
      relevanceScore: 0.9,
      reasoning: "Primary competency for this data type",
      competencies: ["Data governance", "Public information"],
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
      expectedResponseAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      actualResponseAt: null,
      reminderSentAt: null,
    },
    statusHistory: [
      {
        status: "submitted" as RequestStatus,
        timestamp: new Date(),
        note: "Request submitted successfully",
        actor: "system",
      },
    ],
    requesterInfo: {
      name: "User",
      email: "user@example.com",
      type: "individual",
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
