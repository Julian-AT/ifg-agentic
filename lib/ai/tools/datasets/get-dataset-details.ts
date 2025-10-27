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

            dataStream.write({
                type: 'data-datasetSearchResult',
                data: {
                    dataset: data,
                },
            });

            return {
                success: true,
                dataset: data,
                distributions: data.distributions || [],
                distributionsCount: data.distributions?.length || 0,
                message: `Dataset card displayed. Found ${data.distributions?.length || 0} distribution(s).`
            };
        },
    });