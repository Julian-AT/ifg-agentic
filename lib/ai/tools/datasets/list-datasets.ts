import { tool, type UIMessageStreamWriter } from 'ai';
import { z } from 'zod';
import type { Session } from 'next-auth';
import type { ChatMessage } from '@/lib/types';
import { buildUrl } from '../config';

type DatasetToolsProps = {
    session: Session;
    dataStream: UIMessageStreamWriter<ChatMessage>;
};

export const listDatasets = ({ session: _session, dataStream: _dataStream }: DatasetToolsProps) =>
    tool({
        description:
            'List datasets from the data catalog with filters and pagination. Returns dataset IDs and basic metadata. CRITICAL: After calling this, you MUST immediately call getDatasetDetails for each relevant dataset ID to display UI cards to the user. DO NOT describe the results in text - use getDatasetDetails to show them properly.',
        inputSchema: z.object({
            filter: z
                .enum(['datasets'])
                .optional()
                .describe('Search filter/query string to filter datasets')
                .default('datasets'),
            limit: z
                .number()
                .min(1)
                .max(5000)
                .optional()
                .default(50)
                .describe('Maximum number of datasets to return (1-5000)'),
            page: z
                .number()
                .min(0)
                .optional()
                .default(0)
                .describe('Page number for pagination (0-based)'),
            sort: z
                .string()
                .optional()
                .default('relevance+desc, modified+desc, title.de+asc')
                .describe('Sort order: relevance+desc, modified+desc, title.de+asc, etc.'),
            facetOperator: z
                .enum(['AND', 'OR'])
                .optional()
                .default('AND')
                .describe('Operator for combining facet filters'),
            facetGroupOperator: z
                .enum(['AND', 'OR'])
                .optional()
                .default('AND')
                .describe('Operator for combining facet groups'),
            dataServices: z
                .boolean()
                .optional()
                .default(false)
                .describe('Include data services in results'),
            includes: z
                .string()
                .optional()
                .default('id,title.de,description.de,languages,modified,issued,catalog.id,catalog.title,catalog.country.id,distributions.id,distributions.format.label,distributions.format.id,distributions.license,categories.label,publisher')
                .describe('Comma-separated list of fields to include in response'),
        }),
        execute: async ({ filter, limit, page, sort, facetOperator, facetGroupOperator, dataServices, includes }) => {
            const url = buildUrl("api/hub/search/search", {
                filter,
                limit,
                page,
                sort,
                facetOperator,
                facetGroupOperator,
                dataServices,
                includes,
            });

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Accept': 'application/ld+json',
                },
            });

            if (!response.ok) {
                throw new Error(`Failed to list datasets: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();

            // Extract results from the response structure
            const results = data.result?.results || data.results || data;
            const resultsArray = Array.isArray(results) ? results : [];

            // CRITICAL: Check for empty results to prevent hallucination
            if (resultsArray.length === 0) {
                return {
                    success: false,
                    data: [],
                    count: 0,
                    message: 'No datasets found. The catalog returned zero results. DO NOT make up or fabricate any data.',
                };
            }

            return {
                success: true,
                data: results,
                count: resultsArray.length,
                message: `Found ${resultsArray.length} dataset(s). NEXT STEP: Call getDatasetDetails for 3-5 relevant dataset IDs from the results to display UI cards. DO NOT describe these results in text.`,
            };
        },
    });

