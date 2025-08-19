import { tool } from "ai";
import { z } from "zod";
import { generateUUID } from "@/lib/utils";
import type { UIMessageStreamWriter } from "ai";
import type { Session } from "next-auth";
import type { ChatMessage } from "@/lib/types";
import type {
    UserDataRequest,
    RequestType,
    Agency,
} from "@/lib/types/data-request";

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

interface SubmitRequestProps {
    session: Session;
    dataStream: UIMessageStreamWriter<ChatMessage>;
}

/**
 * Submit data request tool
 * Handles the submission of completed data requests to appropriate Austrian government agencies
 */
export function submitDataRequest({
    session,
    dataStream,
}: SubmitRequestProps) {
    return tool({
        description:
            "Submit a completed data request to the appropriate Austrian government agency. Creates a tracking record and provides confirmation details.",
        inputSchema: z.object({
            requestType: RequestTypeSchema,
            formData: z.record(z.any()),
            selectedAgency: AgencySuggestionSchema,
        }),
        execute: async ({ requestType, formData, selectedAgency }) => {
            try {
                console.log(`📤 Submitting ${requestType} request to ${selectedAgency.name}`);

                // Validate submission requirements
                const validationResult = validateSubmissionData(requestType, formData, selectedAgency);
                if (!validationResult.isValid) {
                    return {
                        success: false,
                        error: "Submission validation failed",
                        details: validationResult.errors,
                    };
                }

                // Generate unique request ID
                const requestId = generateUUID();

                // Calculate expected response timeline
                const timeline = calculateTimeline(requestType, selectedAgency);

                // Create request record
                const submittedRequest: UserDataRequest = {
                    id: requestId,
                    type: requestType,
                    // @ts-expect-error
                    status: {
                        current: "submitted",
                        history: [],
                        publiclyVisible: false,
                    },
                    metadata: {
                        validation: {},
                        submittedAt: new Date(),
                        title: (formData as any).title || "Data Request",
                        description: (formData as any).description || "",
                        createdAt: new Date(),
                        updatedAt: new Date(),
                        agency: selectedAgency as unknown as Agency,
                        timeline,
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
                    },
                };

                // Stream submission confirmation to UI
                dataStream.write({
                    type: "data-requestSubmitted",
                    data: {
                        request: submittedRequest,
                    },
                    transient: false,
                });

                console.log(`✅ Request ${requestId} submitted successfully`);

                return {
                    success: true,
                    request: submittedRequest,
                    confirmationNumber: requestId,
                    message: `Your ${requestType} request has been submitted successfully to ${selectedAgency.name}`,
                    nextSteps: generateNextSteps(requestType, timeline),
                };
            } catch (error) {
                console.error("❌ Error submitting data request:", error);

                const errorMessage = error instanceof Error
                    ? error.message
                    : "Unknown error occurred";

                return {
                    success: false,
                    error: "Failed to submit data request",
                    details: errorMessage,
                };
            }
        },
    });
}

/**
 * Validate submission data
 */
function validateSubmissionData(
    requestType: RequestType,
    formData: any,
    agency: any
): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check required fields
    if (!formData.title || formData.title.trim().length === 0) {
        errors.push("Request title is required");
    }

    if (!formData.description || formData.description.trim().length === 0) {
        errors.push("Request description is required");
    }

    // Type-specific validations
    if (requestType === "IWG" && !formData.businessModel) {
        errors.push("Business model is required for IWG requests");
    }

    if (requestType === "DZG" && !formData.researchPurpose) {
        errors.push("Research purpose is required for DZG requests");
    }

    // Agency validation
    if (!agency.name || agency.relevanceScore < 0.3) {
        errors.push("Selected agency appears to have low relevance for this request");
    }

    return {
        isValid: errors.length === 0,
        errors,
    };
}

/**
 * Calculate expected timeline for request processing
 */
function calculateTimeline(requestType: RequestType, agency: any): any {
    const baseDays = {
        IFG: 56, // 8 weeks
        IWG: 20, // 20 working days
        DZG: 15, // 15 working days
    };

    const expectedDays = baseDays[requestType];
    const agencyResponseTime = agency.performanceMetrics?.averageResponseTime || expectedDays;

    // Use the longer of legal requirement or agency average
    const finalExpectedDays = Math.max(expectedDays, agencyResponseTime);

    const submittedAt = new Date();
    const deadline = new Date(submittedAt.getTime() + expectedDays * 24 * 60 * 60 * 1000);
    const expectedResponseAt = new Date(submittedAt.getTime() + finalExpectedDays * 24 * 60 * 60 * 1000);

    return {
        submittedAt,
        deadline,
        escalationLevel: 0,
        expectedResponseAt,
        actualResponseAt: null,
        reminderSentAt: null,
    };
}

/**
 * Generate next steps guidance
 */
function generateNextSteps(requestType: RequestType, timeline: any): string[] {
    const steps = [
        "You will receive an email confirmation if the agency supports electronic communication",
        `The agency has ${Math.floor((timeline.deadline - timeline.submittedAt) / (24 * 60 * 60 * 1000))} days to respond according to ${requestType} law`,
        "You can track the status of your request through this system",
    ];

    if (requestType === "IWG") {
        steps.push("Be prepared to pay processing fees if the data requires significant preparation");
    }

    if (requestType === "DZG") {
        steps.push("The agency may contact you for clarification on research methodology");
    }

    steps.push("You can submit a reminder if no response is received by the expected date");

    return steps;
}