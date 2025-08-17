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
 * Enhanced autocomplete datasets tool with intelligent suggestions
 * Provides fast dataset name matching with additional metadata
 */
export const autocompleteDatasets = ({
    session,
    dataStream,
}: DatasetToolsProps) =>
    tool({
        description:
            "Quick search for datasets that match a text string. Returns basic dataset info (name, title, ID). Use this for fast lookups or autocomplete functionality when you have partial dataset names.",
        inputSchema: z.object({
            q: z
                .string()
                .min(1)
                .describe(
                    'Search text to match against dataset names and titles. Examples: "energy", "covid", "population", "statistik"'
                ),
            limit: z
                .number()
                .min(1)
                .max(100)
                .optional()
                .default(10)
                .describe(
                    "Maximum number of matching datasets to return (1-100). Use 5-10 for suggestions, 20+ for broader search"
                ),
        }),
        execute: async ({ q, limit = 10 }) => {
            try {
                console.log(`🔍 Autocompleting datasets for: "${q}"`);

                const params = new URLSearchParams();
                params.append("q", q);
                params.append("limit", limit.toString());

                const response = await fetch(
                    `${BASE_URL}/action/package_autocomplete?${params}`
                );

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }

                const data = await response.json();

                if (!data.success) {
                    throw new Error(data.error?.message || "Autocomplete request failed");
                }

                // Enhance autocomplete results
                const enhancedData = enhanceAutocompleteResults(data, { q, limit });

                console.log(`✅ Found ${enhancedData.result.length} autocomplete matches`);

                return enhancedData;

            } catch (error) {
                console.error("❌ Error autocompleting datasets:", error);

                return createAutocompleteErrorResult(error, { q, limit });
            }
        },
    });

/**
 * Enhance autocomplete results with better formatting and metadata
 */
function enhanceAutocompleteResults(data: any, params: { q: string; limit: number }) {
    const results = data.result || [];

    // Process and rank results
    const processedResults = results.map((item: any) => {
        const relevanceScore = calculateRelevance(item, params.q);

        return {
            ...item,
            enhanced: {
                relevanceScore,
                displayTitle: formatDisplayTitle(item),
                searchHighlight: highlightSearchTerm(item, params.q),
                category: inferCategory(item),
            },
        };
    });

    // Sort by relevance
    const sortedResults = processedResults.sort((a: any, b: any) =>
        b.enhanced.relevanceScore - a.enhanced.relevanceScore
    );

    return {
        ...data,
        result: sortedResults,
        metadata: {
            query: params.q,
            totalMatches: results.length,
            requested: params.limit,
            hasMoreResults: results.length === params.limit,
            suggestions: generateSearchSuggestions(params.q, results),
            timestamp: new Date().toISOString(),
        },
    };
}

/**
 * Calculate relevance score for search results
 */
function calculateRelevance(item: any, searchTerm: string): number {
    const query = searchTerm.toLowerCase();
    let score = 0;

    // Exact name match gets highest score
    if (item.name && item.name.toLowerCase() === query) {
        score += 100;
    }

    // Title exact match
    if (item.title && item.title.toLowerCase() === query) {
        score += 90;
    }

    // Name starts with query
    if (item.name && item.name.toLowerCase().startsWith(query)) {
        score += 70;
    }

    // Title starts with query
    if (item.title && item.title.toLowerCase().startsWith(query)) {
        score += 60;
    }

    // Name contains query
    if (item.name && item.name.toLowerCase().includes(query)) {
        score += 40;
    }

    // Title contains query
    if (item.title && item.title.toLowerCase().includes(query)) {
        score += 30;
    }

    // Bonus for shorter names (more specific matches)
    const nameLength = item.name ? item.name.length : 100;
    score += Math.max(0, 20 - nameLength / 10);

    return Math.min(score, 100);
}

/**
 * Format display title for better readability
 */
function formatDisplayTitle(item: any): string {
    if (item.title && item.title.trim()) {
        return item.title;
    }

    if (item.name) {
        // Convert kebab-case to readable format
        return item.name
            .replace(/-/g, ' ')
            .replace(/\b\w/g, (l: string) => l.toUpperCase());
    }

    return 'Untitled Dataset';
}

/**
 * Highlight search term in results
 */
function highlightSearchTerm(item: any, searchTerm: string) {
    const query = searchTerm.toLowerCase();

    const highlightText = (text: string) => {
        if (!text) return text;

        const regex = new RegExp(`(${escapeRegExp(query)})`, 'gi');
        return text.replace(regex, '<mark>$1</mark>');
    };

    return {
        name: highlightText(item.name || ''),
        title: highlightText(item.title || ''),
    };
}

/**
 * Escape special regex characters
 */
function escapeRegExp(string: string): string {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Infer dataset category from name and title
 */
function inferCategory(item: any): string {
    const text = `${item.name || ''} ${item.title || ''}`.toLowerCase();

    const categories = {
        'Statistics': ['statistik', 'bev-', 'census', 'bevölkerung', 'einwohner'],
        'Environment': ['umwelt', 'klima', 'wetter', 'environment', 'climate'],
        'Transportation': ['verkehr', 'transport', 'öffi', 'bahn', 'auto'],
        'Economy': ['wirtschaft', 'unternehmen', 'handel', 'economy', 'business'],
        'Health': ['gesundheit', 'medizin', 'krankenhaus', 'health', 'medical'],
        'Education': ['bildung', 'schule', 'universität', 'education', 'school'],
        'Culture': ['kultur', 'kunst', 'museum', 'culture', 'art'],
        'Government': ['regierung', 'behörde', 'amt', 'government', 'administration'],
    };

    for (const [category, keywords] of Object.entries(categories)) {
        if (keywords.some(keyword => text.includes(keyword))) {
            return category;
        }
    }

    return 'General';
}

/**
 * Generate search suggestions based on query and results
 */
function generateSearchSuggestions(query: string, results: any[]): string[] {
    const suggestions: Set<string> = new Set();

    // Extract common terms from successful matches
    results.forEach(item => {
        const words = `${item.name || ''} ${item.title || ''}`
            .toLowerCase()
            .split(/[\s-_]+/)
            .filter(word => word.length > 3 && word !== query.toLowerCase());

        words.slice(0, 2).forEach(word => suggestions.add(word));
    });

    // Add common related terms
    const relatedTerms = generateRelatedTerms(query);
    relatedTerms.forEach(term => suggestions.add(term));

    return Array.from(suggestions).slice(0, 5);
}

/**
 * Generate related search terms
 */
function generateRelatedTerms(query: string): string[] {
    const relatedTermsMap: Record<string, string[]> = {
        'energy': ['strom', 'energie', 'power', 'renewable'],
        'population': ['bevölkerung', 'einwohner', 'demografie', 'census'],
        'transport': ['verkehr', 'öffi', 'bahn', 'mobility'],
        'economy': ['wirtschaft', 'handel', 'unternehmen', 'business'],
        'environment': ['umwelt', 'klima', 'nature', 'wetter'],
        'health': ['gesundheit', 'medizin', 'hospital', 'covid'],
    };

    const queryLower = query.toLowerCase();

    for (const [key, terms] of Object.entries(relatedTermsMap)) {
        if (queryLower.includes(key) || terms.some(term => queryLower.includes(term))) {
            return terms;
        }
    }

    return [];
}

/**
 * Create error result for failed autocomplete
 */
function createAutocompleteErrorResult(error: unknown, params: { q: string; limit: number }) {
    return {
        success: false,
        error: {
            message: error instanceof Error ? error.message : "Unknown error occurred",
            query: params.q,
            timestamp: new Date().toISOString(),
        },
        result: [],
        metadata: {
            query: params.q,
            totalMatches: 0,
            requested: params.limit,
            hasMoreResults: false,
            suggestions: [],
        },
    };
}