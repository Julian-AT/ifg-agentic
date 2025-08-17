import { tool, type UIMessageStreamWriter } from "ai";
import { z } from "zod";
import type { Session } from "next-auth";
import type { ChatMessage } from "@/lib/types";

const BASE_URL = "https://www.data.gv.at/katalog/api/3";

interface DatasetToolsProps {
  session: Session;
  dataStream: UIMessageStreamWriter<ChatMessage>;
}

/**
 * Enhanced organization listing tool
 * Lists data publishers from the Austrian open data portal with comprehensive filtering
 */
export const listOrganizations = ({ session, dataStream }: DatasetToolsProps) =>
  tool({
    description:
      "List organizations (data publishers) from the Austrian open data portal. Use this to discover who publishes datasets or to filter by specific organizations. Provides detailed information about government agencies and institutions.",
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
      sort = "name asc",
      limit = 50,
      offset = 0,
      organizations,
      all_fields = true,
      include_dataset_count = true,
      include_extras = false,
      include_tags = false,
      include_groups = false,
      include_users = false,
    }) => {
      try {
        console.log(`🏛️ Listing organizations:`, { sort, limit, offset });

        const params = new URLSearchParams();
        params.append("sort", sort);
        params.append("limit", limit.toString());
        params.append("offset", offset.toString());
        params.append("all_fields", all_fields.toString());
        params.append("include_dataset_count", include_dataset_count.toString());
        params.append("include_extras", include_extras.toString());
        params.append("include_tags", include_tags.toString());
        params.append("include_groups", include_groups.toString());
        params.append("include_users", include_users.toString());

        if (organizations) {
          params.append("organizations", organizations);
        }

        const response = await fetch(
          `${BASE_URL}/action/organization_list?${params}`
        );

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error?.message || "Organization list request failed");
        }

        // Enhance organization data
        const enhancedData = enhanceOrganizationData(data, {
          sort,
          limit,
          offset,
          include_dataset_count,
        });

        console.log(`✅ Listed ${enhancedData.result.length} organizations`);

        return enhancedData;

      } catch (error) {
        console.error("❌ Error listing organizations:", error);
        
        return createOrganizationErrorResult(error, { sort, limit, offset });
      }
    },
  });

/**
 * Enhance organization data with additional processing
 */
function enhanceOrganizationData(data: any, params: any) {
  const organizations = data.result || [];
  
  // Process and categorize organizations
  const processedOrganizations = organizations.map((org: any) => {
    const category = categorizeOrganization(org);
    const stats = extractOrganizationStats(org);
    
    return {
      ...org,
      enhanced: {
        category,
        stats,
        displayName: formatOrganizationName(org),
        isGovernment: isGovernmentOrganization(org),
        level: getGovernmentLevel(org),
      },
    };
  });

  // Sort organizations by category and importance
  const sortedOrganizations = sortOrganizationsByImportance(processedOrganizations);

  // Generate summary statistics
  const summary = generateOrganizationSummary(processedOrganizations);

  return {
    ...data,
    result: sortedOrganizations,
    metadata: {
      requested: params,
      returned: processedOrganizations.length,
      summary,
      categories: summary.categories,
      timestamp: new Date().toISOString(),
    },
  };
}

/**
 * Categorize organization by type
 */
function categorizeOrganization(org: any): string {
  const name = (org.name || '').toLowerCase();
  const title = (org.title || '').toLowerCase();
  const combined = `${name} ${title}`;

  if (combined.includes('bundesministerium') || combined.includes('bmk') || 
      combined.includes('bmf') || combined.includes('bmi')) {
    return 'Federal Ministry';
  }

  if (combined.includes('statistik') && combined.includes('austria')) {
    return 'National Statistics';
  }

  if (combined.includes('land ') || combined.includes('steiermark') || 
      combined.includes('tirol') || combined.includes('kärnten') ||
      combined.includes('salzburg') || combined.includes('vorarlberg') ||
      combined.includes('burgenland') || combined.includes('oberösterreich') ||
      combined.includes('niederösterreich')) {
    return 'Regional Government';
  }

  if (combined.includes('gemeinde') || combined.includes('stadt') ||
      combined.includes('wien') && !combined.includes('land')) {
    return 'Municipality';
  }

  if (combined.includes('universität') || combined.includes('university') ||
      combined.includes('hochschule')) {
    return 'University';
  }

  if (combined.includes('krankenhaus') || combined.includes('klinik') ||
      combined.includes('hospital')) {
    return 'Healthcare';
  }

  if (combined.includes('verkehr') || combined.includes('öbb') ||
      combined.includes('transport')) {
    return 'Transportation';
  }

  if (combined.includes('umwelt') || combined.includes('klima') ||
      combined.includes('environment')) {
    return 'Environment';
  }

  return 'Other';
}

/**
 * Extract organization statistics
 */
function extractOrganizationStats(org: any) {
  return {
    datasetCount: org.package_count || 0,
    hasDescription: !!(org.description && org.description.trim()),
    hasImage: !!(org.image_url && org.image_url.trim()),
    hasWebsite: !!(org.extras && org.extras.find((e: any) => e.key === 'website')),
    createdDate: org.created,
    lastModified: org.revision_timestamp,
  };
}

/**
 * Format organization name for display
 */
function formatOrganizationName(org: any): string {
  if (org.title && org.title.trim()) {
    return org.title;
  }
  
  if (org.display_name && org.display_name.trim()) {
    return org.display_name;
  }
  
  if (org.name) {
    // Convert kebab-case to readable format
    return org.name
      .replace(/-/g, ' ')
      .replace(/\b\w/g, (l: string) => l.toUpperCase());
  }
  
  return 'Unknown Organization';
}

/**
 * Check if organization is a government entity
 */
function isGovernmentOrganization(org: any): boolean {
  const indicators = [
    'bundesministerium', 'ministerium', 'land ', 'stadt', 'gemeinde',
    'statistik austria', 'regierung', 'behörde', 'amt'
  ];
  
  const combined = `${org.name || ''} ${org.title || ''}`.toLowerCase();
  return indicators.some(indicator => combined.includes(indicator));
}

/**
 * Get government level (federal, regional, local)
 */
function getGovernmentLevel(org: any): string | null {
  if (!isGovernmentOrganization(org)) return null;
  
  const combined = `${org.name || ''} ${org.title || ''}`.toLowerCase();
  
  if (combined.includes('bund') || combined.includes('bundesministerium') ||
      combined.includes('statistik austria')) {
    return 'federal';
  }
  
  if (combined.includes('land ') || combined.includes('steiermark') ||
      combined.includes('tirol')) {
    return 'regional';
  }
  
  if (combined.includes('gemeinde') || combined.includes('stadt')) {
    return 'local';
  }
  
  return 'other';
}

/**
 * Sort organizations by importance and category
 */
function sortOrganizationsByImportance(organizations: any[]) {
  const categoryOrder = [
    'Federal Ministry',
    'National Statistics', 
    'Regional Government',
    'Municipality',
    'University',
    'Healthcare',
    'Transportation',
    'Environment',
    'Other'
  ];

  return organizations.sort((a, b) => {
    // Sort by category first
    const categoryA = categoryOrder.indexOf(a.enhanced.category);
    const categoryB = categoryOrder.indexOf(b.enhanced.category);
    
    if (categoryA !== categoryB) {
      return categoryA - categoryB;
    }
    
    // Then by dataset count (descending)
    const countA = a.enhanced.stats.datasetCount || 0;
    const countB = b.enhanced.stats.datasetCount || 0;
    
    if (countA !== countB) {
      return countB - countA;
    }
    
    // Finally by name
    return a.enhanced.displayName.localeCompare(b.enhanced.displayName);
  });
}

/**
 * Generate summary statistics
 */
function generateOrganizationSummary(organizations: any[]) {
  const categories: Record<string, number> = {};
  let totalDatasets = 0;
  let governmentOrgs = 0;
  
  organizations.forEach(org => {
    const category = org.enhanced.category;
    categories[category] = (categories[category] || 0) + 1;
    totalDatasets += org.enhanced.stats.datasetCount || 0;
    
    if (org.enhanced.isGovernment) {
      governmentOrgs++;
    }
  });

  return {
    totalOrganizations: organizations.length,
    categories,
    totalDatasets,
    governmentOrganizations: governmentOrgs,
    averageDatasetsPerOrg: organizations.length > 0 ? totalDatasets / organizations.length : 0,
  };
}

/**
 * Create error result for failed requests
 */
function createOrganizationErrorResult(error: unknown, params: any) {
  return {
    success: false,
    error: {
      message: error instanceof Error ? error.message : "Unknown error occurred",
      params,
      timestamp: new Date().toISOString(),
    },
    result: [],
    metadata: {
      requested: params,
      returned: 0,
      summary: {
        totalOrganizations: 0,
        categories: {},
        totalDatasets: 0,
        governmentOrganizations: 0,
        averageDatasetsPerOrg: 0,
      },
    },
  };
}