import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';

// Allow fast responses
export const maxDuration = 10;

export async function POST(req: Request) {
    try {
        const {
            text,
            context
        }: {
            text: string;
            context?: {
                fieldType?: string;
                requestType?: string;
                formData?: Record<string, any>;
                originalPrompt?: string;
            };
        } = await req.json();

        // Build context-aware system prompt
        let systemPrompt = `You are a helpful assistant for German government data request forms. Continue the user's text naturally and professionally. Keep completions concise (1-3 words or a short phrase). Focus on commonly used phrases in government and legal contexts.`;

        if (context?.requestType) {
            systemPrompt += ` This is for a ${context.requestType} request.`;
        }

        if (context?.fieldType) {
            systemPrompt += ` You are helping with the ${context.fieldType} field.`;
        }

        if (context?.originalPrompt) {
            systemPrompt += ` Original request context: ${context.originalPrompt}`;
        }

        // Add form context for better suggestions
        let promptContext = '';
        if (context?.formData) {
            const { title, description, requestType } = context.formData;
            if (title) promptContext += `Title: ${title}. `;
            if (description) promptContext += `Description: ${description}. `;
        }

        // Simple, fast completion - just continue the user's text
        const result = await generateText({
            model: openai('gpt-4o-mini'),
            system: systemPrompt,
            prompt: `${promptContext}Continue this text naturally: ${text}`,
            maxTokens: 20,
            temperature: 0.3,
        });

        // Clean up the response text - remove quotes and extra whitespace
        let cleanCompletion = result.text.trim();

        // Remove surrounding quotes if present
        if ((cleanCompletion.startsWith('"') && cleanCompletion.endsWith('"')) ||
            (cleanCompletion.startsWith("'") && cleanCompletion.endsWith("'"))) {
            cleanCompletion = cleanCompletion.slice(1, -1);
        }

        // Remove any leading text that duplicates the input
        if (cleanCompletion.toLowerCase().startsWith(text.toLowerCase())) {
            cleanCompletion = cleanCompletion.slice(text.length).trim();
        }

        return new Response(JSON.stringify({ completion: cleanCompletion }), {
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('Completion API error:', error);
        return new Response(JSON.stringify({ completion: '' }), {
            headers: { 'Content-Type': 'application/json' },
            status: 200, // Return empty completion instead of error for better UX
        });
    }
}