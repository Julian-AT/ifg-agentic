import { generateUUID } from "@/lib/utils";
import { tool, type UIMessageStreamWriter } from "ai";
import { z } from "zod";
import type { Session } from "next-auth";
import {
  artifactKinds,
  documentHandlersByArtifactKind,
} from "@/lib/artifacts/server";
import type { ChatMessage } from "@/lib/types";

interface CreateDocumentProps {
  session: Session;
  dataStream: UIMessageStreamWriter<ChatMessage>;
}

/**
 * Enhanced document creation tool
 * Creates executable artifacts with improved data handling and validation
 */
export const createDocument = ({ session, dataStream }: CreateDocumentProps) =>
  tool({
    description:
      "Create executable Python code artifacts for computational tasks such as data visualization, AI/ML model creation, statistical analysis, or data processing. Use this tool for ALL Python code generation - NEVER write Python code in chat responses. CRITICAL: When working with CSV data, you MUST provide the dataUrl parameter with the exact URL from getResourceDetails tool output. DO NOT use this for displaying dataset information - use getDatasetDetails, getResourceDetails, and other data tools instead for information display.",
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
          "The exact URL from getResourceDetails tool output when working with CSV or other data files. Required for data analysis tasks."
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
        })
        .optional()
        .describe(
          "CSV data structure from exploreCsvData tool - use this to generate proper column-specific code"
        ),
    }),
    execute: async ({ title, kind, dataUrl, csvStructure }) => {
      try {
        console.log("📄 Creating document:", { title, kind, hasDataUrl: !!dataUrl });

        // Generate unique document ID
        const id = generateUUID();

        // Validate data requirements for data analysis tasks
        if (kind.includes('analysis') || kind.includes('visualization')) {
          if (!dataUrl && !csvStructure) {
            console.warn("⚠️ Data analysis task without data URL or structure");
          }
        }

        // Stream document creation metadata
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

        // Find appropriate document handler
        const documentHandler = documentHandlersByArtifactKind.find(
          (handler) => handler.kind === kind
        );

        if (!documentHandler) {
          throw new Error(`No document handler found for kind: ${kind}`);
        }

        // Create the document with enhanced error handling
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
          console.error(`❌ Document handler error for ${kind}:`, handlerError);
          throw new Error(`Failed to create ${kind} document: ${handlerError instanceof Error ? handlerError.message : 'Unknown error'}`);
        }

        // Signal completion
        dataStream.write({
          type: "data-finish",
          data: null,
          transient: true
        });

        console.log(`✅ Document created successfully: ${id}`);

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
        console.error("❌ Error creating document:", error);

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