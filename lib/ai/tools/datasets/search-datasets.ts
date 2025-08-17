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
 * Enhanced dataset search tool with intelligent retry logic
 * Searches Austrian open data portal with automatic fallback strategies
 */
export const searchDatasets = ({ session, dataStream }: DatasetToolsProps) =>
    tool({
        description:
            "Search and filter datasets in the Austrian open data portal. This is the most powerful search tool - use it to find datasets by keywords, categories, organizations, or any other criteria. Returns full dataset metadata. Automatically retries with simpler terms if no results found.",
        inputSchema: z.object({
            q: z
                .string()
                .optional()
                .describe(
                    'The search query. Use simple, broad search terms that will catch the user\'s request. Examples: "energy", "covid", "transport", "population"'
                ),
            fq: z
                .string()
                .optional()
                .describe(
                    'Filter query for advanced filtering. Examples: "res_format:CSV" (only CSV resources), "organization:ministry-*" (organizations starting with ministry)'
                ),
            sort: z
                .string()
                .optional()
                .default("relevance asc, metadata_modified desc")
                .describe(
                    'How to sort the results. Examples: "metadata_modified desc" (newest first), "relevance desc" (most relevant first), "name asc" (alphabetical)'
                ),
            rows: z
                .number()
                .min(1)
                .max(1000)
                .optional()
                .describe(
                    "Number of datasets to return (1-1000). Recommended: 10-50 for user display, 100+ for analysis"
                ),
            start: z
                .number()
                .min(0)
                .optional()
                .describe(
                    "Starting position for pagination (0-based). For page 2 with rows=10, use start=10"
                ),
            include_drafts: z
                .boolean()
                .optional()
                .default(false)
                .describe(
                    "Whether to include draft/unpublished datasets (usually false for public queries)"
                ),
            keywords: z
                .array(z.string())
                .min(2)
                .max(5)
                .describe(
                    "Keywords associated with the search term. This is only used for displaying keywords related to the search to the user. Fill this with about 3-5 short phrases/keywords that are related to the search term."
                ),
            _isRetry: z
                .boolean()
                .optional()
                .default(false)
                .describe("Internal flag to track retry attempts"),
        }),
        execute: async ({
            q,
            fq,
            sort,
            rows,
            start,
            include_drafts,
            keywords,
            _isRetry,
        }) => {
            try {
                console.log(`🔍 Searching datasets:`, { q, rows, start });

                const searchTerms = generateSearchTerms(q);
                const searchAttempts = 0;
                const maxAttempts = 3;

                // Stream search start notification
                dataStream.write({
                    type: "data-datasetSearch",
                    data: {
                        q: q ?? "Alle verfügbaren Datensätze",
                        keywords: keywords ?? [],
                    },
                });

                // Try each search term until we get results or exhaust attempts
                for (const searchTerm of searchTerms) {
                    if (searchAttempts >= maxAttempts) break;

                    console.log(`🔍 Search attempt ${searchAttempts + 1}: "${searchTerm}"`);

                    const data = await performSearch({
                        searchTerm,
                        fq,
                        sort,
                        rows,
                        start,
                        include_drafts,
                    });

                    // Check if we got results
                    if (data.success && data.result && data.result.count > 0) {
                        console.log(`✅ Found ${data.result.count} results with term: "${searchTerm}"`);

                        const enhancedData = enhanceSearchResults(data, {
                            originalQuery: q,
                            successfulQuery: searchTerm,
                            attempts: searchAttempts + 1,
                            alternativesGenerated: searchTerms.length - 1,
                        });

                        dataStream.write({
                            type: "data-datasetSearchResult",
                            data: enhancedData,
                        });

                        return enhancedData;
                    }

                    console.log(`❌ No results for term: "${searchTerm}"`);

                    // Small delay between attempts
                    if (searchAttempts < maxAttempts - 1) {
                        await new Promise((resolve) => setTimeout(resolve, 100));
                    }
                }

                // If we get here, no search terms returned results
                console.log(`🚫 No results found after ${searchAttempts} attempts`);

                const emptyResult = createEmptyResult(q, searchTerms, searchAttempts);

                dataStream.write({
                    type: "data-datasetSearchResult",
                    data: emptyResult,
                });

                return emptyResult;

            } catch (error) {
                console.error("❌ Error searching datasets:", error);

                const errorResult = createErrorResult(q, error);

                dataStream.write({
                    type: "data-datasetSearchResult",
                    data: errorResult,
                });

                return errorResult;
            }
        },
    });

/**
 * Generate alternative search terms for better results
 */
function generateSearchTerms(originalQuery?: string): string[] {
    const searchTerms: string[] = [];

    if (originalQuery) {
        searchTerms.push(originalQuery);
        searchTerms.push(...generateAlternativeTerms(originalQuery));
    } else {
        // Empty search to get all datasets
        searchTerms.push("");
    }

    return searchTerms;
}

/**
 * Generate alternative search terms based on the original query
 */
function generateAlternativeTerms(originalQuery: string): string[] {
    const alternatives: string[] = [];

    // Remove common German words and simplify
    const simplified = originalQuery
        .toLowerCase()
        .replace(
            /\b(der|die|das|ein|eine|von|zu|in|mit|für|auf|über|nach|bei|durch|unter|zwischen|während|seit|bis|gegen|ohne|um|vor|hinter|neben|innerhalb|außerhalb|oberhalb|unterhalb|entlang|jenseits|diesseits|anstatt|statt|trotz|wegen|aufgrund|bezüglich|hinsichtlich|bezogen|bezugnehmend)\b/g,
            ""
        )
        .replace(/\s+/g, " ")
        .trim();

    if (simplified !== originalQuery.toLowerCase()) {
        alternatives.push(simplified);
    }

    // Extract key words (single terms)
    const words = simplified.split(" ").filter((word) => word.length > 3);
    alternatives.push(...words);

    // Add broad category terms based on keywords
    const categoryMappings: Record<string, string[]> = {
        energie: ["energie", "strom", "power", "energy"],
        bevölkerung: ["bevölkerung", "demografie", "einwohner", "population"],
        verkehr: ["verkehr", "transport", "mobilität", "traffic"],
        umwelt: ["umwelt", "klima", "natur", "environment"],
        wirtschaft: ["wirtschaft", "unternehmen", "handel", "economy"],
        bildung: ["bildung", "schule", "universität", "education"],
        gesundheit: ["gesundheit", "medizin", "krankenhaus", "health"],
        kultur: ["kultur", "kunst", "museum", "culture"],
        tourismus: ["tourismus", "reise", "hotel", "tourism"],
        wetter: ["wetter", "klima", "temperatur", "weather"],
        statistik: ["statistik", "daten", "zahlen", "statistics"],
    };

    // Check if any keywords match our categories
    for (const [category, terms] of Object.entries(categoryMappings)) {
        if (
            originalQuery.toLowerCase().includes(category) ||
            terms.some((term) => originalQuery.toLowerCase().includes(term))
        ) {
            alternatives.push(...terms);
        }
    }

    return [...new Set(alternatives)].slice(0, 5); // Remove duplicates and limit
}

/**
 * Perform a single search request
 */
async function performSearch({
    searchTerm,
    fq,
    sort,
    rows,
    start,
    include_drafts,
}: {
    searchTerm: string;
    fq?: string;
    sort?: string;
    rows?: number;
    start?: number;
    include_drafts?: boolean;
}) {
    const params = new URLSearchParams();

    if (searchTerm) params.append("q", searchTerm);
    if (fq !== undefined) params.append("fq", fq);
    if (sort !== undefined) params.append("sort", sort);
    if (rows !== undefined) params.append("rows", rows.toString());
    if (start !== undefined) params.append("start", start.toString());
    if (include_drafts !== undefined)
        params.append("include_drafts", include_drafts.toString());

    const response = await fetch(`${BASE_URL}/action/package_search?${params}`);

    if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
}

/**
 * Enhance search results with metadata
 */
function enhanceSearchResults(data: any, searchInfo: any) {
    return {
        ...data,
        searchInfo,
        timestamp: new Date().toISOString(),
    };
}

/**
 * Create empty result when no datasets found
 */
function createEmptyResult(originalQuery?: string, searchTerms: string[] = [], attempts: number = 0) {
    return {
        success: true,
        result: {
            count: 0,
            results: [],
            facets: {},
        },
        searchInfo: {
            originalQuery,
            successfulQuery: null,
            attempts,
            alternativesGenerated: searchTerms.length - 1,
            searchTermsTried: searchTerms.slice(0, attempts),
        },
        timestamp: new Date().toISOString(),
    };
}

/**
 * Create error result for failed searches
 */
function createErrorResult(originalQuery?: string, error: unknown) {
    return {
        success: false,
        error: {
            message: error instanceof Error ? error.message : "Unknown error occurred",
            originalQuery,
            timestamp: new Date().toISOString(),
        },
        result: {
            count: 0,
            results: [],
            facets: {},
        },
    };
}