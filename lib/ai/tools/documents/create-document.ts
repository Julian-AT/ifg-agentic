import { generateUUID } from "@/lib/utils";
import { tool, type UIMessageStreamWriter } from "ai";
import { z } from "zod";
import type { Session } from "next-auth";
import {
  artifactKinds,
  documentHandlersByArtifactKind,
} from "@/lib/artifacts/server";
import type { ChatMessage } from "@/lib/types";

type CreateDocumentProps = {
  session: Session;
  dataStream: UIMessageStreamWriter<ChatMessage>;
};

export const createDocument = ({ session, dataStream }: CreateDocumentProps) =>
  tool({
    description:
      "Create executable Python code artifacts for computational tasks such as data visualization, AI/ML model creation, statistical analysis, or data processing. Use this tool for ALL Python code generation - NEVER write Python code in chat responses. CRITICAL: When working with CSV data, you MUST provide the dataUrl parameter with the exact access_url[0] from the dataset's distributions array. DO NOT use this for displaying dataset information - use getDatasetDetails and other data tools instead for information display.",
    inputSchema: z.object({
      title: z
        .string()
        .min(1, "Title is required")
        .describe("Descriptive title for the document/artifact"),
      kind: z
        .enum(artifactKinds)
        .describe("Type of artifact to create"),
      dataUrl: z
        .string()
        .url("Invalid URL format")
        .optional()
        .describe(
          "The exact access_url[0] from the dataset's distributions array when working with CSV or other data files. Required for data analysis tasks."
        ),
      csvStructure: z
        .object({
          columns: z.array(
            z.object({
              name: z.string(),
              type: z.string(),
              sampleValues: z.array(z.string()),
            })
          ),
          totalRows: z.number(),
          totalColumns: z.number(),
          datasetName: z.string().optional(),
          statistics: z.object({
            delimiter: z.string().optional(),
            titleRowSkipped: z.boolean().optional(),
            hasHeader: z.boolean().optional(),
            emptyRows: z.number().optional(),
            duplicateHeaders: z.array(z.string()).optional(),
            encoding: z.string().optional(),
          }).optional(),
        })
        .optional()
        .describe(
          "CSV data structure from exploreCsvData tool - use this to generate proper column-specific code. CRITICAL: Check statistics.titleRowSkipped and statistics.delimiter!"
        ),
    }),
    execute: async ({ title, kind, dataUrl, csvStructure }) => {
      try {
        const id = generateUUID();

        if (kind === 'code' || kind === 'sheet') {
          if (!dataUrl) {
            throw new Error(
              "CRITICAL: Cannot create data artifact without a valid dataUrl. " +
              "You MUST first call getDatasetDetails to get the access_url from distributions, " +
              "then call exploreCsvData with that URL. DO NOT make up or fabricate URLs."
            );
          }

          if (!csvStructure || !csvStructure.columns || csvStructure.columns.length === 0) {
            throw new Error(
              "CRITICAL: Cannot create data artifact without valid csvStructure. " +
              "You MUST first call exploreCsvData to get the exact column names and structure. " +
              "DO NOT make up or assume column names."
            );
          }
        }

        dataStream.write({
          type: "data-kind",
          data: kind,
          transient: true,
        });

        dataStream.write({
          type: "data-id",
          data: id,
          transient: true,
        });

        dataStream.write({
          type: "data-title",
          data: title,
          transient: true,
        });

        dataStream.write({
          type: "data-clear",
          data: null,
          transient: true,
        });

        const documentHandler = documentHandlersByArtifactKind.find(
          (handler) => handler.kind === kind
        );

        if (!documentHandler) {
          throw new Error(`No document handler found for kind: ${kind}`);
        }

        try {
          await documentHandler.onCreateDocument({
            id,
            title,
            dataStream,
            session,
            dataUrl,
            csvStructure,
          });
        } catch (handlerError) {
          throw new Error(`Failed to create ${kind} document: ${handlerError instanceof Error ? handlerError.message : 'Unknown error'}`);
        }

        dataStream.write({
          type: "data-finish",
          data: null,
          transient: true
        });

        return {
          success: true,
          id,
          title,
          kind,
          content: "A document was created and is now visible to the user.",
          metadata: {
            hasDataUrl: !!dataUrl,
            hasCsvStructure: !!csvStructure,
            timestamp: new Date().toISOString(),
          },
        };

      } catch (error) {
        dataStream.write({
          type: "error",
          errorText: error instanceof Error ? error.message : "Unknown error occurred",
        });

        return {
          success: false,
          error: error instanceof Error ? error.message : "Failed to create document",
          details: "Document creation failed due to an unexpected error",
        };
      }
    },
  });