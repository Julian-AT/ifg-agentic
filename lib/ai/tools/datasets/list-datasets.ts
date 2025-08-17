import { tool, type UIMessageStreamWriter } from "ai";
import { z } from "zod";
import type { Session } from "next-auth";
import type { ChatMessage } from "@/lib/types";

const BASE_URL = "https://www.data.gv.at/katalog/api/3";

interface DatasetToolsProps {
    session: Session;
    dataStream: UIMessageStreamWriter<ChatMessage>;
}

/**
 * List datasets tool with pagination support
 * Provides a simple way to browse through available datasets
 */
export const listDatasets = ({ session, dataStream }: DatasetToolsProps) =>
    tool({
        description:
            "List all datasets from the Austrian open data portal. Use this to get an overview of available datasets or for pagination through large result sets. Returns dataset names/IDs only for quick browsing.",
        inputSchema: z.object({
            offset: z
                .number()
                .min(0)
                .optional()
                .describe(
                    "Starting position for pagination. Use 0 for first page, 10 for second page if limit=10, etc. Example: offset=20"
                ),
            limit: z
                .number()
                .min(1)
                .max(1000)
                .optional()
                .describe(
                    "Maximum number of datasets to return per page. Recommended values: 10, 25, 50, 100. Example: limit=25"
                ),
        }),
        execute: async ({ offset = 0, limit = 50 }) => {
            try {
                console.log(`📋 Listing datasets:`, { offset, limit });

                const params = new URLSearchParams();
                params.append("offset", offset.toString());
                params.append("limit", limit.toString());

                const response = await fetch(`${BASE_URL}/action/package_list?${params}`);

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }

                const data = await response.json();

                if (!data.success) {
                    throw new Error(data.error?.message || "API request failed");
                }

                const enhancedData = enhanceListResults(data, { offset, limit });

                console.log(`✅ Listed ${enhancedData.result.length} datasets`);

                return enhancedData;

            } catch (error) {
                console.error("❌ Error listing datasets:", error);

                return createErrorResult(error, { offset, limit });
            }
        },
    });

/**
 * Enhanced version with metadata and resource information
 */
export const getCurrentDatasetsList = ({
    session,
    dataStream,
}: DatasetToolsProps) =>
    tool({
        description:
            "Return a list of the site's datasets and their resources, sorted most-recently-modified first. Provides more detailed information than the basic list including resources.",
        inputSchema: z.object({
            limit: z
                .number()
                .min(1)
                .max(1000)
                .optional()
                .describe("Maximum number of datasets per page (default: 50)"),
            offset: z
                .number()
                .min(0)
                .optional()
                .describe("Offset to start returning datasets from (default: 0)"),
            page: z
                .number()
                .min(1)
                .optional()
                .describe("Which page to return (deprecated: use offset instead)"),
        }),
        execute: async ({ limit = 50, offset = 0, page }) => {
            try {
                console.log(`📋 Getting current datasets list:`, { limit, offset, page });

                // Handle legacy page parameter
                const actualOffset = page ? (page - 1) * (limit || 50) : offset;

                const params = new URLSearchParams();
                params.append("limit", limit.toString());
                params.append("offset", actualOffset.toString());

                const response = await fetch(
                    `${BASE_URL}/action/current_package_list_with_resources?${params}`
                );

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }

                const data = await response.json();

                if (!data.success) {
                    throw new Error(data.error?.message || "API request failed");
                }

                const enhancedData = enhanceCurrentListResults(data, {
                    limit,
                    offset: actualOffset,
                    page,
                    requestedOffset: offset,
                });

                console.log(`✅ Retrieved ${enhancedData.result.length} datasets with resources`);

                return enhancedData;

            } catch (error) {
                console.error("❌ Error getting current datasets list:", error);

                return createCurrentListErrorResult(error, { limit, offset, page });
            }
        },
    });

/**
 * Enhance basic list results with metadata
 */
function enhanceListResults(data: any, params: { offset: number; limit: number }) {
    const resultCount = Array.isArray(data.result) ? data.result.length : 0;

    return {
        ...data,
        metadata: {
            requested: params,
            returned: resultCount,
            hasMore: resultCount === params.limit,
            nextOffset: resultCount === params.limit ? params.offset + params.limit : null,
            timestamp: new Date().toISOString(),
        },
    };
}

/**
 * Enhance current list results with additional metadata
 */
function enhanceCurrentListResults(data: any, params: any) {
    const resultCount = Array.isArray(data.result) ? data.result.length : 0;
    const resourceCount = data.result?.reduce((total: number, dataset: any) => {
        return total + (dataset.resources?.length || 0);
    }, 0) || 0;

    return {
        ...data,
        metadata: {
            requested: params,
            returned: {
                datasets: resultCount,
                resources: resourceCount,
            },
            hasMore: resultCount === params.limit,
            nextOffset: resultCount === params.limit ? params.offset + params.limit : null,
            pagination: {
                currentPage: params.page || Math.floor(params.offset / params.limit) + 1,
                itemsPerPage: params.limit,
                totalItemsOnPage: resultCount,
            },
            timestamp: new Date().toISOString(),
        },
    };
}

/**
 * Create error result for basic list
 */
function createErrorResult(error: unknown, params: { offset: number; limit: number }) {
    return {
        success: false,
        error: {
            message: error instanceof Error ? error.message : "Unknown error occurred",
            params,
            timestamp: new Date().toISOString(),
        },
        result: [],
        metadata: {
            requested: params,
            returned: 0,
            hasMore: false,
            nextOffset: null,
        },
    };
}

/**
 * Create error result for current list
 */
function createCurrentListErrorResult(error: unknown, params: any) {
    return {
        success: false,
        error: {
            message: error instanceof Error ? error.message : "Unknown error occurred",
            params,
            timestamp: new Date().toISOString(),
        },
        result: [],
        metadata: {
            requested: params,
            returned: {
                datasets: 0,
                resources: 0,
            },
            hasMore: false,
            nextOffset: null,
        },
    };
}