import { z } from 'zod';
import type { Session } from 'next-auth';
import { streamObject, tool, type UIMessageStreamWriter } from 'ai';
import { getDocumentById, saveSuggestions } from '@/lib/db/queries';
import type { Suggestion } from '@/lib/db/schema';
import { generateUUID } from '@/lib/utils';
import { myProvider } from '../providers';
import type { ChatMessage } from '@/lib/types';

interface RequestSuggestionsProps {
  session: Session;
  dataStream: UIMessageStreamWriter<ChatMessage>;
}

/**
 * Enhanced document suggestions tool
 * Generates AI-powered suggestions for improving documents with better analysis
 */
export const requestSuggestions = ({
  session,
  dataStream,
}: RequestSuggestionsProps) =>
  tool({
    description: 
      'Request AI-powered suggestions for improving a document. Provides detailed suggestions with reasoning and prioritization.',
    inputSchema: z.object({
      documentId: z
        .string()
        .min(1, "Document ID is required")
        .describe('The ID of the document to request suggestions for'),
      focusArea: z
        .enum(['content', 'structure', 'clarity', 'accuracy', 'completeness'])
        .optional()
        .describe('Specific area to focus suggestions on'),
    }),
    execute: async ({ documentId, focusArea }) => {
      try {
        console.log(`💡 Generating suggestions for document: ${documentId}`);

        // Retrieve the document
        const document = await getDocumentById({ id: documentId });

        if (!document || !document.content) {
          console.error(`❌ Document not found or empty: ${documentId}`);
          return {
            success: false,
            error: 'Document not found or has no content',
            details: `No document with content found for ID: ${documentId}`,
          };
        }

        console.log(`📄 Analyzing document: ${document.title}`);

        const suggestions: Array<
          Omit<Suggestion, 'userId' | 'createdAt' | 'documentCreatedAt'>
        > = [];

        // Enhanced system prompt for better suggestions
        const systemPrompt = generateSystemPrompt(focusArea);

        const { elementStream } = streamObject({
          model: myProvider.languageModel('artifact-model'),
          system: systemPrompt,
          prompt: buildAnalysisPrompt(document.content, focusArea),
          output: 'array',
          schema: z.object({
            originalSentence: z.string().describe('The original sentence or section'),
            suggestedSentence: z.string().describe('The improved sentence or section'),
            description: z.string().describe('Explanation of why this change improves the content'),
            priority: z.enum(['high', 'medium', 'low']).describe('Priority level of this suggestion'),
            category: z.enum(['content', 'structure', 'clarity', 'accuracy', 'completeness']).describe('Category of improvement'),
          }),
        });

        let suggestionCount = 0;
        const maxSuggestions = 8;

        for await (const element of elementStream) {
          if (suggestionCount >= maxSuggestions) break;

          // Enhanced suggestion object with additional metadata
          const suggestion: Suggestion = {
            originalText: element.originalSentence,
            suggestedText: element.suggestedSentence,
            description: element.description,
            id: generateUUID(),
            documentId: documentId,
            isResolved: false,
            // Additional metadata
            priority: element.priority,
            category: element.category,
          };

          dataStream.write({
            type: 'data-suggestion',
            data: suggestion,
            transient: true,
          });

          suggestions.push(suggestion);
          suggestionCount++;
        }

        console.log(`✅ Generated ${suggestions.length} suggestions`);

        // Save suggestions to database if user is authenticated
        if (session.user?.id) {
          const userId = session.user.id;

          try {
            await saveSuggestions({
              suggestions: suggestions.map((suggestion) => ({
                ...suggestion,
                userId,
                createdAt: new Date(),
                documentCreatedAt: document.createdAt,
              })),
            });
            console.log(`💾 Saved ${suggestions.length} suggestions to database`);
          } catch (saveError) {
            console.error('❌ Error saving suggestions:', saveError);
            // Continue even if saving fails
          }
        }

        // Analyze suggestion distribution
        const analysis = analyzeSuggestions(suggestions);

        return {
          success: true,
          id: documentId,
          title: document.title,
          kind: document.kind,
          message: `${suggestions.length} suggestions have been generated for the document`,
          metadata: {
            suggestionCount: suggestions.length,
            analysis,
            focusArea,
            timestamp: new Date().toISOString(),
          },
        };

      } catch (error) {
        console.error('❌ Error generating suggestions:', error);
        
        return {
          success: false,
          error: error instanceof Error ? error.message : "Failed to generate suggestions",
          details: "Suggestion generation failed due to an unexpected error",
          documentId,
        };
      }
    },
  });

/**
 * Generate enhanced system prompt
 */
function generateSystemPrompt(focusArea?: string): string {
  let basePrompt = `You are an expert writing assistant specialized in improving document quality. Analyze the given content and provide specific, actionable suggestions for improvement.

Focus on:
- Clarity and readability
- Structural improvements
- Content accuracy and completeness
- Grammar and style
- Logical flow and organization

Requirements:
- Provide full sentences/sections, not just individual words
- Give specific reasoning for each suggestion
- Prioritize suggestions by impact
- Ensure suggestions are actionable and clear
- Maximum 8 suggestions total`;

  if (focusArea) {
    const focusInstructions = {
      content: "Focus primarily on content quality, accuracy, and completeness",
      structure: "Focus primarily on document organization, flow, and structural improvements",
      clarity: "Focus primarily on clarity, readability, and ease of understanding",
      accuracy: "Focus primarily on factual accuracy and precision of information",
      completeness: "Focus primarily on identifying missing information and gaps",
    };

    basePrompt += `\n\nSpecial Focus: ${focusInstructions[focusArea]}`;
  }

  return basePrompt;
}

/**
 * Build analysis prompt
 */
function buildAnalysisPrompt(content: string, focusArea?: string): string {
  let prompt = `Please analyze the following document content and provide improvement suggestions:\n\n${content}`;

  if (focusArea) {
    prompt += `\n\nPay special attention to ${focusArea} aspects when generating suggestions.`;
  }

  return prompt;
}

/**
 * Analyze suggestions distribution and patterns
 */
function analyzeSuggestions(suggestions: any[]) {
  const priorityDistribution = {
    high: suggestions.filter(s => s.priority === 'high').length,
    medium: suggestions.filter(s => s.priority === 'medium').length,
    low: suggestions.filter(s => s.priority === 'low').length,
  };

  const categoryDistribution = {
    content: suggestions.filter(s => s.category === 'content').length,
    structure: suggestions.filter(s => s.category === 'structure').length,
    clarity: suggestions.filter(s => s.category === 'clarity').length,
    accuracy: suggestions.filter(s => s.category === 'accuracy').length,
    completeness: suggestions.filter(s => s.category === 'completeness').length,
  };

  return {
    priorityDistribution,
    categoryDistribution,
    totalSuggestions: suggestions.length,
    highPriorityCount: priorityDistribution.high,
    averageImpact: priorityDistribution.high > suggestions.length / 2 ? 'high' : 
                   priorityDistribution.medium > suggestions.length / 2 ? 'medium' : 'low',
  };
}