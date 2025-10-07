import { tool, type UIMessageStreamWriter } from 'ai';
import { z } from 'zod';
import type { Session } from 'next-auth';
import type { ChatMessage } from '@/lib/types';
import { buildUrl } from '../config';

interface DatasetToolsProps {
    session: Session;
    dataStream: UIMessageStreamWriter<ChatMessage>;
}


export const getDatasetDetails = ({ session, dataStream }: DatasetToolsProps) =>
    tool({
        description:
            'Get complete details of a specific dataset including metadata and available data files (distributions). This displays a UI card to the user and returns the full dataset object with an embedded "distributions" array. Each distribution contains "id", "title", "format", and "access_url" (array) fields. Use access_url[0] to get the downloadable CSV URL.',
        inputSchema: z.object({
            id: z
                .string()
                .min(1)
                .describe(
                    'The exact ID of the dataset (normalized ID following pattern [a-z,0-9,\\-,~]+)'
                ),
        }),
        execute: async ({ id }) => {
            console.log('🔧 [TOOL] getDatasetDetails:', { id });

            const url = buildUrl(`api/hub/search/datasets/${id}`);

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Accept': 'application/ld+json',
                },
            });

            if (!response.ok) {
                if (response.status === 404) {
                    return {
                        success: false,
                        error: 'Dataset not found',
                        data: null,
                    };
                }
                throw new Error(`Failed to get dataset: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();

            // Log distributions for debugging
            console.log('✅ [TOOL] Dataset distributions:', data.distributions?.length || 0);
            if (data.distributions?.length > 0) {
                console.log('   First distribution:', {
                    id: data.distributions[0].id,
                    title: data.distributions[0].title,
                    format: data.distributions[0].format?.id,
                    access_url: data.distributions[0].access_url?.[0]
                });
            }

            dataStream.write({
                type: 'data-datasetSearchResult',
                data: {
                    dataset: data,
                },
            });

            // Return the full dataset with embedded distributions
            return {
                success: true,
                dataset: data,
                distributions: data.distributions || [],
                distributionsCount: data.distributions?.length || 0,
                message: `Dataset card displayed. Found ${data.distributions?.length || 0} distribution(s).`
            };
        },
    });