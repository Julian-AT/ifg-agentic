import { z } from "zod";
import type {
  listDatasets,
  searchDatasets,
  getDatasetDetails,
  listOrganizations,
  getCurrentDatasetsList,
  autocompleteDatasets,
  getGroupDatasets,
  getResourceDetails,
  getResourceViewDetails,
  listResourceViews,
  searchResources,
} from "./ai/tools/datasets-tools";
// Activity API tools
import type {
  getPackageActivityList,
  getGroupActivityList,
  getOrganizationActivityList,
  getRecentlyChangedPackagesActivityList,
  getActivityDetails,
  getActivityData,
  getActivityDiff,
} from "./ai/tools/activity-tools";
import type { InferUITool, UIMessage } from "ai";

import type { Suggestion } from "./db/schema";
import type { ArtifactKind } from "@/components/artifact";
import type { createDocument } from "./ai/tools/create-document";
import type { updateDocument } from "./ai/tools/update-document";
import type { requestSuggestions } from "./ai/tools/request-suggestions";
import type { exploreCsvData } from "./ai/tools/explore-csv-data";
import type { checkDataAvailability } from "./ai/tools/check-data-availability";

export type DataPart = { type: "append-message"; message: string };

export const messageMetadataSchema = z.object({
  createdAt: z.string(),
});

export type MessageMetadata = z.infer<typeof messageMetadataSchema>;

type listDatasetsTool = InferUITool<ReturnType<typeof listDatasets>>;
type searchDatasetsTool = InferUITool<ReturnType<typeof searchDatasets>>;
type getDatasetDetailsTool = InferUITool<ReturnType<typeof getDatasetDetails>>;
type listOrganizationsTool = InferUITool<ReturnType<typeof listOrganizations>>;
type getCurrentDatasetsListTool = InferUITool<
  ReturnType<typeof getCurrentDatasetsList>
>;
type autocompleteDatasetsTools = InferUITool<
  ReturnType<typeof autocompleteDatasets>
>;
type getGroupDatasetsTool = InferUITool<ReturnType<typeof getGroupDatasets>>;
type getResourceDetailsTool = InferUITool<
  ReturnType<typeof getResourceDetails>
>;
type getResourceViewDetailsTool = InferUITool<
  ReturnType<typeof getResourceViewDetails>
>;
type listResourceViewsTool = InferUITool<ReturnType<typeof listResourceViews>>;
type searchResourcesTool = InferUITool<ReturnType<typeof searchResources>>;

// Activity API tool types
type getPackageActivityListTool = InferUITool<
  ReturnType<typeof getPackageActivityList>
>;
type getGroupActivityListTool = InferUITool<
  ReturnType<typeof getGroupActivityList>
>;
type getOrganizationActivityListTool = InferUITool<
  ReturnType<typeof getOrganizationActivityList>
>;
type getRecentlyChangedPackagesActivityListTool = InferUITool<
  ReturnType<typeof getRecentlyChangedPackagesActivityList>
>;
type getActivityDetailsTool = InferUITool<
  ReturnType<typeof getActivityDetails>
>;
type getActivityDataTool = InferUITool<ReturnType<typeof getActivityData>>;
type getActivityDiffTool = InferUITool<ReturnType<typeof getActivityDiff>>;
type createDocumentTool = InferUITool<ReturnType<typeof createDocument>>;
type updateDocumentTool = InferUITool<ReturnType<typeof updateDocument>>;
type requestSuggestionsTool = InferUITool<
  ReturnType<typeof requestSuggestions>
>;
type exploreCsvDataTool = InferUITool<ReturnType<typeof exploreCsvData>>;
type checkDataAvailabilityTool = InferUITool<
  ReturnType<typeof checkDataAvailability>
>;

export type ChatTools = {
  listDatasets: listDatasetsTool;
  searchDatasets: searchDatasetsTool;
  getDatasetDetails: getDatasetDetailsTool;
  listOrganizations: listOrganizationsTool;
  getCurrentDatasetsList: getCurrentDatasetsListTool;
  autocompleteDatasets: autocompleteDatasetsTools;
  getGroupDatasets: getGroupDatasetsTool;
  getResourceDetails: getResourceDetailsTool;
  getResourceViewDetails: getResourceViewDetailsTool;
  listResourceViews: listResourceViewsTool;
  searchResources: searchResourcesTool;
  getPackageActivityList: getPackageActivityListTool;
  getGroupActivityList: getGroupActivityListTool;
  getOrganizationActivityList: getOrganizationActivityListTool;
  getRecentlyChangedPackagesActivityList: getRecentlyChangedPackagesActivityListTool;
  getActivityDetails: getActivityDetailsTool;
  getActivityData: getActivityDataTool;
  getActivityDiff: getActivityDiffTool;
  createDocument: createDocumentTool;
  updateDocument: updateDocumentTool;
  requestSuggestions: requestSuggestionsTool;
  exploreCsvData: exploreCsvDataTool;
  checkDataAvailability: checkDataAvailabilityTool;
};

export type CustomUIDataTypes = {
  textDelta: string;
  codeDelta: string;
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
