import { tool, type UIMessageStreamWriter } from "ai";
import { z } from "zod";
import type { Session } from "next-auth";
import type { ChatMessage } from "@/lib/types";

const BASE_URL = "https://www.data.gv.at/katalog/api/3";

interface DatasetToolsProps {
  session: Session;
  dataStream: UIMessageStreamWriter<ChatMessage>;
}

// Helper function to log tool parameters for debugging
const logToolInvocation = (toolName: string, params: any) => {
  console.log(
    `🔧 [TOOL INVOKED] ${toolName}:`,
    JSON.stringify(params, null, 2)
  );
};

// List all datasets within given limit
export const listDatasets = ({ session, dataStream }: DatasetToolsProps) =>
  tool({
    description:
      "List all datasets from the Austrian open data portal. Use this to get an overview of available datasets or for pagination through large result sets. Returns dataset names/IDs only.",
    inputSchema: z.object({
      offset: z
        .number()
        .min(0)
        .optional()
        .describe(
          "Starting position for pagination. Use 0 for first page, 10 for second page if limit=10, etc. Example: offset=20"
        ),
      limit: z
        .number()
        .min(1)
        .max(1000)
        .optional()
        .describe(
          "Maximum number of datasets to return per page. Recommended values: 10, 25, 50, 100. Example: limit=25"
        ),
    }),
    execute: async ({ offset, limit }) => {
      logToolInvocation("listDatasets", { offset, limit });

      const params = new URLSearchParams();
      if (offset !== undefined) params.append("offset", offset.toString());
      if (limit !== undefined) params.append("limit", limit.toString());

      const response = await fetch(`${BASE_URL}/action/package_list?${params}`);
      return await response.json();
    },
  });

// Helper function to generate alternative search terms
const generateAlternativeTerms = (originalQuery: string): string[] => {
  const alternatives: string[] = [];

  // Remove common words and simplify
  const simplified = originalQuery
    .toLowerCase()
    .replace(
      /\b(der|die|das|ein|eine|von|zu|in|mit|für|auf|über|nach|bei|durch|unter|zwischen|während|seit|bis|gegen|ohne|um|vor|hinter|neben|innerhalb|außerhalb|oberhalb|unterhalb|entlang|jenseits|diesseits|anstatt|statt|trotz|wegen|aufgrund|bezüglich|hinsichtlich|bezogen|bezugnehmend)\b/g,
      ""
    )
    .replace(/\s+/g, " ")
    .trim();

  if (simplified !== originalQuery.toLowerCase()) {
    alternatives.push(simplified);
  }

  // Extract key words (single terms)
  const words = simplified.split(" ").filter((word) => word.length > 3);
  alternatives.push(...words);

  // Add broad category terms based on keywords
  const categoryMappings: Record<string, string[]> = {
    energie: ["energie", "strom", "energie"],
    bevölkerung: ["bevölkerung", "demografie", "einwohner", "population"],
    verkehr: ["verkehr", "transport", "mobilität"],
    umwelt: ["umwelt", "klima", "natur"],
    wirtschaft: ["wirtschaft", "unternehmen", "handel"],
    bildung: ["bildung", "schule", "universität"],
    gesundheit: ["gesundheit", "medizin", "krankenhaus"],
    kultur: ["kultur", "kunst", "museum"],
    tourismus: ["tourismus", "reise", "hotel"],
    wetter: ["wetter", "klima", "temperatur"],
    statistik: ["statistik", "daten", "zahlen"],
  };

  // Check if any keywords match our categories
  for (const [category, terms] of Object.entries(categoryMappings)) {
    if (
      originalQuery.toLowerCase().includes(category) ||
      terms.some((term) => originalQuery.toLowerCase().includes(term))
    ) {
      alternatives.push(...terms);
    }
  }

  return [...new Set(alternatives)].slice(0, 5); // Remove duplicates and limit
};

// Search among all datasets
export const searchDatasets = ({ session, dataStream }: DatasetToolsProps) =>
  tool({
    description:
      "Search and filter datasets in the Austrian open data portal. This is the most powerful search tool - use it to find datasets by keywords, categories, organizations, or any other criteria. Returns full dataset metadata. Automatically retries with simpler terms if no results found.",
    inputSchema: z.object({
      q: z
        .string()
        .optional()
        .describe(
          'The solr query. For example name:pdf-testi. Use simple, broad search terms that will catch the user\'s request. Examples: "energy", "covid", "transport", "population"'
        ),
      fq: z
        .string()
        .optional()
        .describe(
          'Filter query for advanced filtering. Examples: "res_format:CSV" (only CSV resources), "organization:ministry-*" (organizations starting with ministry)'
        ),
      sort: z
        .string()
        .optional()
        .default("relevance asc, metadata_modified desc")
        .describe(
          'How to sort the results. Examples: "metadata_modified desc" (newest first), "relevance desc" (most relevant first), "name asc" (alphabetical), "relevance asc, metadata_modified desc" (relevant then newest)'
        ),
      rows: z
        .number()
        .min(1)
        .max(1000)
        .optional()
        .describe(
          "Number of datasets to return (1-1000). Recommended: 10-50 for user display, 100+ for analysis"
        ),
      start: z
        .number()
        .min(0)
        .optional()
        .describe(
          "Starting position for pagination (0-based). For page 2 with rows=10, use start=10"
        ),
      include_drafts: z
        .boolean()
        .optional()
        .default(false)
        .describe(
          "Whether to include draft/unpublished datasets (usually false for public queries)"
        ),
      keywords: z
        .array(z.string())
        .min(2)
        .max(5)
        .describe(
          "Keywords accociated with the serach term. This is only used for displaying keywords related to the search to the user. Fill this with about 3-5 short phrases/keywords that are related to the search term."
        ),
      _isRetry: z
        .boolean()
        .optional()
        .default(false)
        .describe("Internal flag to track retry attempts"),
    }),
    execute: async ({
      q,
      fq,
      sort,
      rows,
      start,
      include_drafts,
      keywords,
      _isRetry,
    }) => {
      const searchTerms: string[] = [];
      let searchAttempts = 0;
      const maxAttempts = 3;

      // Generate search alternatives
      if (q) {
        searchTerms.push(q);
        searchTerms.push(...generateAlternativeTerms(q));
      }

      // If no query provided, use empty search to get all datasets
      if (!q) {
        searchTerms.push("");
      }

      // Function to perform a single search
      const performSearch = async (searchTerm: string) => {
        const params = new URLSearchParams();
        if (searchTerm) params.append("q", searchTerm);
        if (fq !== undefined) params.append("fq", fq);
        if (sort !== undefined) params.append("sort", sort);
        if (rows !== undefined) params.append("rows", rows.toString());
        if (start !== undefined) params.append("start", start.toString());
        if (include_drafts !== undefined)
          params.append("include_drafts", include_drafts.toString());

        const response = await fetch(
          `${BASE_URL}/action/package_search?${params}`
        );

        return await response.json();
      };

      dataStream.write({
        type: "data-datasetSearch",
        data: {
          q: q ?? "Passenden Datensätzen",
          keywords: keywords ?? [],
        },
      });

      logToolInvocation("searchDatasets", {
        q,
        fq,
        sort,
        rows,
        start,
        include_drafts,
        searchTerms: searchTerms.slice(0, 3),
      });

      // Try each search term until we get results or exhaust attempts
      for (const searchTerm of searchTerms) {
        if (searchAttempts >= maxAttempts) break;

        console.log(`🔍 Search attempt ${searchAttempts + 1}: "${searchTerm}"`);

        const data = await performSearch(searchTerm);
        searchAttempts++;

        // Check if we got results
        if (data.success && data.result && data.result.count > 0) {
          console.log(
            `✅ Found ${data.result.count} results with term: "${searchTerm}"`
          );

          dataStream.write({
            type: "data-datasetSearchResult",
            data,
          });

          return {
            ...data,
            searchInfo: {
              originalQuery: q,
              successfulQuery: searchTerm,
              attempts: searchAttempts,
              alternativesGenerated: searchTerms.length - 1,
            },
          };
        }

        console.log(`❌ No results for term: "${searchTerm}"`);

        // Small delay between attempts
        if (
          searchAttempts < maxAttempts &&
          searchAttempts < searchTerms.length
        ) {
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
      }

      // If we get here, no search terms returned results
      console.log(`🚫 No results found after ${searchAttempts} attempts`);

      const emptyResult = {
        success: true,
        result: {
          count: 0,
          results: [],
          facets: {},
        },
        searchInfo: {
          originalQuery: q,
          successfulQuery: null,
          attempts: searchAttempts,
          alternativesGenerated: searchTerms.length - 1,
          searchTermsTried: searchTerms.slice(0, searchAttempts),
        },
      };

      dataStream.write({
        type: "data-datasetSearchResult",
        data: emptyResult,
      });

      return emptyResult;
    },
  });

// Get details of one dataset
export const getDatasetDetails = ({ session, dataStream }: DatasetToolsProps) =>
  tool({
    description:
      "Get complete details of a specific dataset from the Austrian open data portal. Use this when you need full information about a dataset including metadata, resources, tags, and organization details. Requires exact dataset ID or name.",
    inputSchema: z.object({
      id: z
        .string()
        .min(1)
        .describe(
          'The exact ID or name of the dataset. Examples: "bev-bevoelkerung-zu-jahresbeginn-ab-2002", "statistik-austria-population-data". You can get IDs from search results.'
        ),
      include_tracking: z
        .boolean()
        .optional()
        .default(false)
        .describe(
          "Whether to include download/usage tracking statistics (usually false for general queries)"
        ),
    }),
    execute: async ({ id, include_tracking }) => {
      logToolInvocation("getDatasetDetails", { id, include_tracking });

      const params = new URLSearchParams();
      params.append("id", id);
      if (include_tracking !== undefined)
        params.append("include_tracking", include_tracking.toString());

      const response = await fetch(`${BASE_URL}/action/package_show?${params}`);
      const data = await response.json();

      console.log(data);

      return {
        data,
        content: "A dataset card was created and is now visible to the user.",
      };
    },
  });

// List all organizations
export const listOrganizations = ({ session, dataStream }: DatasetToolsProps) =>
  tool({
    description:
      "List organizations (data publishers) from the Austrian open data portal. Use this to discover who publishes datasets or to filter by specific organizations.",
    inputSchema: z.object({
      sort: z
        .string()
        .optional()
        .default("name asc")
        .describe(
          'How to sort organizations. Options: "name asc/desc" (alphabetical), "package_count asc/desc" (by number of datasets), "title asc/desc" (by display name)'
        ),
      limit: z
        .number()
        .min(1)
        .max(1000)
        .optional()
        .describe(
          "Maximum number of organizations to return (1-1000). Use 50-100 for general browsing"
        ),
      offset: z
        .number()
        .min(0)
        .optional()
        .describe("Starting position for pagination (0-based)"),
      organizations: z
        .string()
        .optional()
        .describe(
          'Comma-separated list of specific organization names to return. Example: "statistik-austria,bmk"'
        ),
      all_fields: z
        .boolean()
        .optional()
        .default(true)
        .describe(
          "Whether to return full organization details (recommended: true) or just names"
        ),
      include_dataset_count: z
        .boolean()
        .optional()
        .default(true)
        .describe(
          "Include the number of datasets each organization publishes (recommended: true)"
        ),
      include_extras: z
        .boolean()
        .optional()
        .default(false)
        .describe("Include additional metadata fields (usually not needed)"),
      include_tags: z
        .boolean()
        .optional()
        .default(false)
        .describe("Include organization tags (usually not needed)"),
      include_groups: z
        .boolean()
        .optional()
        .default(false)
        .describe(
          "Include parent/child organization relationships (usually not needed)"
        ),
      include_users: z
        .boolean()
        .optional()
        .default(false)
        .describe("Include organization users (usually not accessible)"),
    }),
    execute: async ({
      sort,
      limit,
      offset,
      organizations,
      all_fields,
      include_dataset_count,
      include_extras,
      include_tags,
      include_groups,
      include_users,
    }) => {
      logToolInvocation("listOrganizations", {
        sort,
        limit,
        offset,
        organizations,
        all_fields,
        include_dataset_count,
        include_extras,
        include_tags,
        include_groups,
        include_users,
      });

      const params = new URLSearchParams();
      if (sort !== undefined) params.append("sort", sort);
      if (limit !== undefined) params.append("limit", limit.toString());
      if (offset !== undefined) params.append("offset", offset.toString());
      if (organizations !== undefined)
        params.append("organizations", organizations);
      if (all_fields !== undefined)
        params.append("all_fields", all_fields.toString());
      if (include_dataset_count !== undefined)
        params.append(
          "include_dataset_count",
          include_dataset_count.toString()
        );
      if (include_extras !== undefined)
        params.append("include_extras", include_extras.toString());
      if (include_tags !== undefined)
        params.append("include_tags", include_tags.toString());
      if (include_groups !== undefined)
        params.append("include_groups", include_groups.toString());
      if (include_users !== undefined)
        params.append("include_users", include_users.toString());

      const response = await fetch(
        `${BASE_URL}/action/organization_list?${params}`
      );
      return await response.json();
    },
  });

// Return a list of the site's datasets and their resources
export const getCurrentDatasetsList = ({
  session,
  dataStream,
}: DatasetToolsProps) =>
  tool({
    description:
      "Return a list of the site's datasets and their resources, sorted most-recently-modified first",
    inputSchema: z.object({
      limit: z
        .number()
        .optional()
        .describe("maximum number of datasets per page"),
      offset: z
        .number()
        .optional()
        .describe("offset to start returning datasets from"),
      page: z
        .number()
        .optional()
        .describe("which page to return (deprecated: use offset)"),
    }),
    execute: async ({ limit, offset, page }) => {
      logToolInvocation("getCurrentDatasetsList", { limit, offset, page });

      const params = new URLSearchParams();
      if (limit !== undefined) params.append("limit", limit.toString());
      if (offset !== undefined) params.append("offset", offset.toString());
      if (page !== undefined) params.append("page", page.toString());

      const response = await fetch(
        `${BASE_URL}/action/current_package_list_with_resources?${params}`
      );
      return await response.json();
    },
  });

// Return a list of datasets that match a string
export const autocompleteDatasets = ({
  session,
  dataStream,
}: DatasetToolsProps) =>
  tool({
    description:
      "Quick search for datasets that match a text string. Returns basic dataset info (name, title, ID). Use this for fast lookups or autocomplete functionality when you have partial dataset names.",
    inputSchema: z.object({
      q: z
        .string()
        .min(1)
        .describe(
          'Search text to match against dataset names and titles. Examples: "energy", "covid", "population", "statistik"'
        ),
      limit: z
        .number()
        .min(1)
        .max(100)
        .optional()
        .default(10)
        .describe(
          "Maximum number of matching datasets to return (1-100). Use 5-10 for suggestions, 20+ for broader search"
        ),
    }),
    execute: async ({ q, limit }) => {
      logToolInvocation("autocompleteDatasets", { q, limit });

      const params = new URLSearchParams();
      params.append("q", q);
      if (limit !== undefined) params.append("limit", limit.toString());

      const response = await fetch(
        `${BASE_URL}/action/package_autocomplete?${params}`
      );
      return await response.json();
    },
  });

// Return the datasets of a group
export const getGroupDatasets = ({ session, dataStream }: DatasetToolsProps) =>
  tool({
    description: "Return the datasets (packages) of a specific group",
    inputSchema: z.object({
      id: z.string().describe("the id or name of the group"),
      limit: z
        .number()
        .optional()
        .describe("the maximum number of datasets to return"),
    }),
    execute: async ({ id, limit }) => {
      logToolInvocation("getGroupDatasets", { id, limit });

      const params = new URLSearchParams();
      params.append("id", id);
      if (limit !== undefined) params.append("limit", limit.toString());

      const response = await fetch(
        `${BASE_URL}/action/group_package_show?${params}`
      );
      return await response.json();
    },
  });

// Return the metadata of a resource
export const getResourceDetails = ({
  session,
  dataStream,
}: DatasetToolsProps) =>
  tool({
    description: "Return the metadata of a specific resource",
    inputSchema: z.object({
      id: z.string().describe("the id of the resource"),
      include_tracking: z
        .boolean()
        .optional()
        .default(false)
        .describe("include tracking information to dataset and resources"),
    }),
    execute: async ({ id, include_tracking }) => {
      logToolInvocation("getResourceDetails", { id, include_tracking });

      const params = new URLSearchParams();
      params.append("id", id);
      if (include_tracking !== undefined)
        params.append("include_tracking", include_tracking.toString());

      const response = await fetch(
        `${BASE_URL}/action/resource_show?${params}`
      );
      return await response.json();
    },
  });

// Return the metadata of a resource view
export const getResourceViewDetails = ({
  session,
  dataStream,
}: DatasetToolsProps) =>
  tool({
    description: "Return the metadata of a resource view",
    inputSchema: z.object({
      id: z.string().describe("the id of the resource view"),
    }),
    execute: async ({ id }) => {
      logToolInvocation("getResourceViewDetails", { id });

      const params = new URLSearchParams();
      params.append("id", id);

      const response = await fetch(
        `${BASE_URL}/action/resource_view_show?${params}`
      );
      return await response.json();
    },
  });

// Return the list of resource views for a particular resource
export const listResourceViews = ({ session, dataStream }: DatasetToolsProps) =>
  tool({
    description: "Return the list of resource views for a particular resource",
    inputSchema: z.object({
      id: z.string().describe("the id of the resource"),
    }),
    execute: async ({ id }) => {
      logToolInvocation("listResourceViews", { id });

      const params = new URLSearchParams();
      params.append("id", id);

      const response = await fetch(
        `${BASE_URL}/action/resource_view_list?${params}`
      );
      return await response.json();
    },
  });

// Search for resources satisfying given criteria
export const searchResources = ({ session, dataStream }: DatasetToolsProps) =>
  tool({
    description: "Search for resources satisfying a given search criteria",
    inputSchema: z.object({
      query: z.string().describe('the search criteria, e.g. "name:data"'),
      fields: z
        .string()
        .optional()
        .describe("dict of fields to search terms (deprecated)"),
      order_by: z.string().optional().describe("field to order results by"),
      offset: z.string().optional().describe("offset for pagination"),
      limit: z.string().optional().describe("limit for pagination"),
    }),
    execute: async ({ query, fields, order_by, offset, limit }) => {
      logToolInvocation("searchResources", {
        query,
        fields,
        order_by,
        offset,
        limit,
      });

      const params = new URLSearchParams();
      params.append("query", query);
      if (fields !== undefined) params.append("fields", fields);
      if (order_by !== undefined) params.append("order_by", order_by);
      if (offset !== undefined) params.append("offset", offset);
      if (limit !== undefined) params.append("limit", limit);

      const response = await fetch(
        `${BASE_URL}/action/resource_search?${params}`
      );
      return await response.json();
    },
  });
