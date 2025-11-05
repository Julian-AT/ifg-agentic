import { tool, type UIMessageStreamWriter } from 'ai';
import type { Session } from 'next-auth';
import { z } from 'zod';
import { getDocumentById } from '@/lib/db/queries';
import { documentHandlersByArtifactKind } from '@/lib/artifacts/server';
import type { ChatMessage } from '@/lib/types';

type UpdateDocumentProps = {
  session: Session;
  dataStream: UIMessageStreamWriter<ChatMessage>;
};

export const updateDocument = ({ session, dataStream }: UpdateDocumentProps) =>
  tool({
    description:
      'Update an existing document with the given description. Provides detailed feedback about the update process and validates changes.',
    inputSchema: z.object({
      id: z
        .string()
        .min(1, "Document ID is required")
        .describe('The ID of the document to update'),
      description: z
        .string()
        .min(1, "Description is required")
        .describe('The description of changes that need to be made'),
    }),
    execute: async ({ id, description }) => {
      try {
        const document = await getDocumentById({ id });

        if (!document) {
          return {
            success: false,
            error: 'Document not found',
            details: `No document exists with ID: ${id}`,
          };
        }

        dataStream.write({
          type: 'data-clear',
          data: null,
          transient: true,
        });

        const documentHandler = documentHandlersByArtifactKind.find(
          (handler) => handler.kind === document.kind,
        );

        if (!documentHandler) {
          throw new Error(`No document handler found for kind: ${document.kind}`);
        }

        try {
          await documentHandler.onUpdateDocument({
            document,
            description,
            dataStream,
            session,
          });
        } catch (handlerError) {
          throw new Error(`Failed to update ${document.kind} document: ${handlerError instanceof Error ? handlerError.message : 'Unknown error'}`);
        }

        dataStream.write({
          type: 'data-finish',
          data: null,
          transient: true
        });

        return {
          success: true,
          id,
          title: document.title,
          kind: document.kind,
          content: 'The document has been updated successfully.',
          metadata: {
            originalTitle: document.title,
            updateDescription: description,
            timestamp: new Date().toISOString(),
          },
        };

      } catch (error) {
        dataStream.write({
          type: 'error',
          errorText: error instanceof Error ? error.message : "Unknown error occurred",
        });

        return {
          success: false,
          error: error instanceof Error ? error.message : "Failed to update document",
          details: "Document update failed due to an unexpected error",
          documentId: id,
        };
      }
    },
  });