import { tool } from "ai";
import { z } from "zod";

interface DataAvailabilityResult {
    available: boolean;
    datasetName: string;
    url: string;
    status: number | null;
    contentType: string | null;
    message: string;
    reason: string;
    suggestion: string;
    responseTime?: number;
}

/**
 * Check data availability tool
 * Verifies if datasets are accessible for programmatic access before attempting to load data
 */
export const checkDataAvailability = () =>
    tool({
        description:
            "Check if a dataset URL is available for programmatic access. Use this tool before attempting to load data to verify accessibility and get helpful error information if the dataset is not available.",
        inputSchema: z.object({
            url: z
                .string()
                .url("Invalid URL format")
                .describe("The URL to check for data availability"),
            datasetName: z
                .string()
                .min(1, "Dataset name is required")
                .describe("Name of the dataset for reference"),
            timeout: z
                .number()
                .min(1000)
                .max(30000)
                .optional()
                .default(10000)
                .describe("Request timeout in milliseconds (1000-30000)"),
        }),
        execute: async ({ url, datasetName, timeout = 10000 }): Promise<DataAvailabilityResult> => {
            const startTime = Date.now();

            try {
                console.log(`🔍 Checking data availability for: ${datasetName}`);
                console.log(`📡 URL: ${url}`);

                // Create an AbortController for timeout handling
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), timeout);

                try {
                    // Use HEAD request to avoid downloading full content
                    const response = await fetch(url, {
                        method: "HEAD",
                        mode: "cors",
                        signal: controller.signal,
                        headers: {
                            'User-Agent': 'IFG-Agentic-Tool/1.0',
                            'Accept': '*/*',
                        },
                    });

                    clearTimeout(timeoutId);
                    const responseTime = Date.now() - startTime;

                    const result = processResponse(response, datasetName, url, responseTime);
                    console.log(`${result.available ? '✅' : '❌'} Check complete: ${result.message}`);

                    return result;

                } catch (fetchError) {
                    clearTimeout(timeoutId);

                    if (fetchError instanceof Error && fetchError.name === 'AbortError') {
                        return createErrorResult(datasetName, url, "Request timeout",
                            `Request timed out after ${timeout}ms`,
                            "Try increasing the timeout or check if the server is responding slowly");
                    }

                    throw fetchError;
                }

            } catch (error) {
                const responseTime = Date.now() - startTime;
                console.error("❌ Error checking data availability:", error);

                // Handle different types of errors
                if (error instanceof TypeError && error.message.includes('fetch')) {
                    return createErrorResult(datasetName, url, "Network error",
                        "Unable to connect to the server",
                        "Check your internet connection or verify the URL is correct");
                }

                return createErrorResult(datasetName, url, "Network error or CORS restriction",
                    error instanceof Error ? error.message : "Unknown error occurred",
                    "The dataset may not be accessible due to CORS policies or network restrictions");
            }
        },
    });

/**
 * Process the HTTP response and create result
 */
function processResponse(
    response: Response,
    datasetName: string,
    url: string,
    responseTime: number
): DataAvailabilityResult {
    const isAvailable = response.ok;
    const status = response.status;
    const contentType = response.headers.get("content-type");

    if (isAvailable) {
        return {
            available: true,
            datasetName,
            url,
            status,
            contentType,
            responseTime,
            message: `✅ Dataset "${datasetName}" is available for programmatic access`,
            reason: `HTTP ${status} - Success`,
            suggestion: "You can proceed with data analysis using this URL",
        };
    }

    // Handle error cases
    const { reason, suggestion } = getErrorDetails(status);

    return {
        available: false,
        datasetName,
        url,
        status,
        contentType,
        responseTime,
        message: `❌ Dataset "${datasetName}" is not available for programmatic access`,
        reason,
        suggestion,
    };
}

/**
 * Get detailed error information based on HTTP status
 */
function getErrorDetails(status: number): { reason: string; suggestion: string } {
    switch (status) {
        case 404:
            return {
                reason: "Dataset not found (404)",
                suggestion: "The URL may be incorrect or the dataset may have been moved. Try searching for the dataset again.",
            };
        case 403:
            return {
                reason: "Access forbidden (403)",
                suggestion: "The dataset requires authentication or is not publicly accessible. Check if you need special permissions.",
            };
        case 401:
            return {
                reason: "Authentication required (401)",
                suggestion: "You need to authenticate before accessing this dataset. Check if API keys or login credentials are required.",
            };
        case 429:
            return {
                reason: "Rate limit exceeded (429)",
                suggestion: "Too many requests. Wait a moment before trying again or check rate limiting policies.",
            };
        case 500:
        case 502:
        case 503:
        case 504:
            return {
                reason: `Server error (${status})`,
                suggestion: "The server may be temporarily unavailable. Try again later or contact the data provider.",
            };
        case 400:
            return {
                reason: "Bad request (400)",
                suggestion: "The request format may be incorrect. Check the URL and any required parameters.",
            };
        default:
            return {
                reason: `HTTP error (${status})`,
                suggestion: "The dataset may be temporarily unavailable or require different access methods. Check the data provider's documentation.",
            };
    }
}

/**
 * Create error result for failed requests
 */
function createErrorResult(
    datasetName: string,
    url: string,
    reason: string,
    details: string,
    suggestion: string
): DataAvailabilityResult {
    return {
        available: false,
        datasetName,
        url,
        status: null,
        contentType: null,
        message: `❌ Unable to check availability for "${datasetName}"`,
        reason: `${reason}: ${details}`,
        suggestion,
    };
}