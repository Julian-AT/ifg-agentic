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

export const createDocument = ({ session, dataStream }: CreateDocumentProps) =>
  tool({
    description:
      "Creates a document from a given title, kind. A document can be a data request form, a code, a data analysis, or other purposes. Use this tool for ALL document creation - NEVER write document content in chat responses. Use this tool if the user want  to create a request for a data that is not available in the system or if they want to create a data analysis or other document.",
    inputSchema: z.object({
      title: z.string(),
      kind: z.enum(artifactKinds),
      dataUrl: z
        .string()
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
      const id = generateUUID();

      console.log("creating document", { title, kind, id });

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
        (documentHandlerByArtifactKind) =>
          documentHandlerByArtifactKind.kind === kind
      );

      if (!documentHandler) {
        throw new Error(`No document handler found for kind: ${kind}`);
      }

      await documentHandler.onCreateDocument({
        id,
        title,
        dataStream,
        session,
        dataUrl,
        csvStructure,
      });

      dataStream.write({ type: "data-finish", data: null, transient: true });

      return {
        id,
        title,
        kind,
        content: "A document was created and is now visible to the user.",
      };
    },
  });
