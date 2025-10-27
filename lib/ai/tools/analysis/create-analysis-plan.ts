import { tool, type UIMessageStreamWriter } from "ai";
import { z } from "zod";
import type { Session } from "next-auth";
import type { ChatMessage } from "@/lib/types";

interface AnalysisPlanProps {
    session: Session;
    dataStream: UIMessageStreamWriter<ChatMessage>;
}

export const createAnalysisPlan = ({ session, dataStream }: AnalysisPlanProps) =>
    tool({
        description:
            'Create a visual task plan for data analysis. Use this at the START of any data analysis request to show the user the steps you will take. This displays a collapsible task list with status indicators.',
        inputSchema: z.object({
            title: z
                .string()
                .describe('Title of the analysis task (e.g., "Analyzing Energy Consumption Data")'),
            steps: z
                .array(
                    z.object({
                        text: z.string().describe('Description of the step'),
                        file: z.object({
                            name: z.string().describe('File or resource name if applicable'),
                            icon: z.enum(['dataset', 'csv', 'python', 'chart']).describe('Icon type'),
                        }).optional(),
                    })
                )
                .describe('Array of steps in the analysis plan'),
        }),
        execute: async ({ title, steps }) => {
            dataStream.write({
                type: 'data-task',
                data: {
                    title,
                    items: steps,
                    status: 'in_progress',
                },
            });

            return {
                success: true,
                message: `Analysis plan created: ${title}`,
                stepCount: steps.length,
            };
        },
    });

