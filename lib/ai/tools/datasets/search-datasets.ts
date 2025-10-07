import { tool, type UIMessageStreamWriter } from 'ai';
import { z } from 'zod';
import type { Session } from 'next-auth';
import type { ChatMessage } from '@/lib/types';
import { buildUrl } from '../config';

interface DatasetToolsProps {
    session: Session;
    dataStream: UIMessageStreamWriter<ChatMessage>;
}

export const searchDatasets = ({ session, dataStream }: DatasetToolsProps) =>
    tool({
        description:
            'List datasets from the data catalog. Returns dataset URLs, identifiers, or metadata depending on valueType parameter. Supports pagination.',
        inputSchema: z.object({
            q: z.string().optional().describe('Search query'),
            filter: z
                .enum(['dataset'])
                .optional()
                .describe('Search filter/query string to filter datasets')
                .default('dataset'),
            facets: z
                .object({
                    categories: z.array(z.string()).optional().default([]),
                    publisher: z.array(z.string()).optional().default([]),
                    format: z.array(z.enum(["CSV", "JSON"])).optional().default([]),
                    catalog: z.array(z.string()).optional().default([]),
                    keywords: z.array(z.string()).optional().default([]),
                    country: z.array(z.string()).optional().default([]),
                    license: z.array(z.string()).optional().default([]),
                })
                .optional()
                .describe('Facet filters for categories, publisher, format, catalog, keywords, country, and license'),
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
        execute: async ({ filter, limit, page, sort, facetOperator, facetGroupOperator, dataServices, includes, q, facets }) => {
            console.log('🔧 [TOOL] listDatasets:', { filter, limit, page, sort, facetOperator, facetGroupOperator, dataServices, includes, q, facets });

            const facetsString = facets ? JSON.stringify(facets) : "";

            const url = buildUrl("api/hub/search/search", {
                q,
                filter,
                limit,
                page,
                sort,
                facetOperator,
                facetGroupOperator,
                dataServices,
                includes,
                facets: facetsString,
            });

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Accept': 'application/ld+json',
                },
            });

            if (!response.ok) {
                throw new Error(`Failed to search datasets: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();

            const datasets = data.result.results;

            return {
                success: true,
                data: datasets,
                count: datasets.length,
            };
        },
    });

