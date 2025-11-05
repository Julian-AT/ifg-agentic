import { z } from "zod";
import type { InferUITool, UIMessage } from "ai";

import type { Suggestion } from "./db/schema";
import type { ArtifactKind } from "@/components/artifact";
import type { listDatasets } from "./ai/tools/datasets/list-datasets";
import type { searchDatasets } from "./ai/tools/datasets";
import type { getDatasetDetails } from "./ai/tools/datasets/get-dataset-details";
import type { exploreCsvData } from "./ai/tools/datasets/explore-csv-data";
import type { createAnalysisPlan } from "./ai/tools/analysis";
import type { createDocument, requestSuggestions, updateDocument } from "./ai/tools";
import type { AppUsage } from "./usage";


export type DataPart = { type: "append-message"; message: string };

export const messageMetadataSchema = z.object({
  createdAt: z.string(),
});

export type MessageMetadata = z.infer<typeof messageMetadataSchema>;


type listDatasetsTool = InferUITool<ReturnType<typeof listDatasets>>;
type searchDatasetsTool = InferUITool<ReturnType<typeof searchDatasets>>;
type getDatasetDetailsTool = InferUITool<ReturnType<typeof getDatasetDetails>>;
type exploreCsvDataTool = InferUITool<ReturnType<typeof exploreCsvData>>;
type createAnalysisPlanTool = InferUITool<ReturnType<typeof createAnalysisPlan>>;
type createDocumentTool = InferUITool<ReturnType<typeof createDocument>>;
type updateDocumentTool = InferUITool<ReturnType<typeof updateDocument>>;
type requestSuggestionsTool = InferUITool<ReturnType<typeof requestSuggestions>>;


export type ChatTools = {
  listDatasets: listDatasetsTool;
  searchDatasets: searchDatasetsTool;
  getDatasetDetails: getDatasetDetailsTool;
  exploreCsvData: exploreCsvDataTool;
  createAnalysisPlan: createAnalysisPlanTool;
  createDocument: createDocumentTool;
  updateDocument: updateDocumentTool;
  requestSuggestions: requestSuggestionsTool;
};

export type CustomUIDataTypes = {
  textDelta: string;
  codeDelta: string;
  sheetDelta: string;
  suggestion: Suggestion;
  appendMessage: string;
  id: string;
  title: string;
  clear: null;
  finish: null;
  kind: ArtifactKind;
  datasetSearch: {
    q: string;
    keywords: string[];
  };
  datasetSearchResult: {};
  usage: AppUsage;
  task: {
    title: string;
    items: Array<{
      text: string;
      file?: {
        name: string;
        icon: string;
      };
    }>;
    status: "pending" | "in_progress" | "completed";
  };
};

export type ChatMessage = UIMessage<
  MessageMetadata,
  CustomUIDataTypes,
  ChatTools
>;

export interface Attachment {
  name: string;
  url: string;
  contentType: string;
}
