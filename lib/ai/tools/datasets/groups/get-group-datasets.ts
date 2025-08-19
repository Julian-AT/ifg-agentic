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
 * Enhanced group datasets tool
 * Returns datasets belonging to a specific group with comprehensive metadata
 */
export const getGroupDatasets = ({ session, dataStream }: DatasetToolsProps) =>
  tool({
    description:
      "Return the datasets (packages) of a specific group with enhanced filtering and analysis. Groups organize datasets by theme or category in the Austrian data portal.",
    inputSchema: z.object({
      id: z
        .string()
        .min(1)
        .describe("The ID or name of the group"),
      limit: z
        .number()
        .min(1)
        .max(1000)
        .optional()
        .describe("The maximum number of datasets to return (default: 50)"),
      offset: z
        .number()
        .min(0)
        .optional()
        .describe("Starting position for pagination (default: 0)"),
      sort: z
        .string()
        .optional()
        .describe("Sort order: 'name asc/desc', 'metadata_modified asc/desc', 'relevance asc/desc'"),
    }),
    execute: async ({ id, limit = 50, offset = 0, sort }) => {
      try {
        console.log(`👥 Getting datasets for group: ${id}`);

        const params = new URLSearchParams();
        params.append("id", id);
        params.append("limit", limit.toString());
        params.append("offset", offset.toString());

        if (sort) {
          params.append("sort", sort);
        }

        const response = await fetch(
          `${BASE_URL}/action/group_package_show?${params}`
        );

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error?.message || "Group package request failed");
        }

        // Enhance group dataset data
        const enhancedData = enhanceGroupDatasetData(data, { id, limit, offset, sort });

        console.log(`✅ Retrieved ${enhancedData.result.length} datasets for group ${id}`);

        return enhancedData;

      } catch (error) {
        console.error("❌ Error getting group datasets:", error);

        return createGroupDatasetErrorResult(error, { id, limit, offset, sort });
      }
    },
  });

/**
 * Enhance group dataset data with analysis and metadata
 */
function enhanceGroupDatasetData(data: any, params: any) {
  const datasets = data.result || [];

  // Process each dataset with additional metadata
  const processedDatasets = datasets.map((dataset: any) => {
    const analysis = analyzeDataset(dataset);
    const resources = analyzeResources(dataset.resources || []);

    return {
      ...dataset,
      enhanced: {
        analysis,
        resources,
        accessibility: assessDatasetAccessibility(dataset),
        lastActivity: getLastActivity(dataset),
        qualityScore: calculateDatasetQuality(dataset),
      },
    };
  });

  // Generate group analysis
  const groupAnalysis = analyzeGroupDatasets(processedDatasets);

  return {
    ...data,
    result: processedDatasets,
    metadata: {
      group: {
        id: params.id,
        datasetCount: processedDatasets.length,
        analysis: groupAnalysis,
      },
      pagination: {
        limit: params.limit,
        offset: params.offset,
        sort: params.sort,
        hasMore: processedDatasets.length === params.limit,
        nextOffset: processedDatasets.length === params.limit ? params.offset + params.limit : null,
      },
      timestamp: new Date().toISOString(),
    },
  };
}

/**
 * Analyze individual dataset
 */
function analyzeDataset(dataset: any) {
  const now = new Date();
  const created = dataset.metadata_created ? new Date(dataset.metadata_created) : null;
  const modified = dataset.metadata_modified ? new Date(dataset.metadata_modified) : null;

  return {
    title: dataset.title || dataset.name,
    hasDescription: !!(dataset.notes?.trim()),
    resourceCount: dataset.resources?.length || 0,
    tagCount: dataset.tags?.length || 0,
    hasLicense: !!(dataset.license_title || dataset.license_id),
    organization: dataset.organization?.title || dataset.organization?.name,
    ageInDays: created ? Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24)) : null,
    daysSinceUpdate: modified ? Math.floor((now.getTime() - modified.getTime()) / (1000 * 60 * 60 * 24)) : null,
  };
}

/**
 * Analyze dataset resources
 */
function analyzeResources(resources: any[]) {
  const formatCounts: Record<string, number> = {};
  let downloadableCount = 0;
  let totalSize = 0;

  resources.forEach(resource => {
    const format = (resource.format || 'unknown').toUpperCase();
    formatCounts[format] = (formatCounts[format] || 0) + 1;

    if (isResourceDownloadable(resource)) {
      downloadableCount++;
    }

    if (resource.size && !Number.isNaN(resource.size)) {
      totalSize += Number.parseInt(resource.size);
    }
  });

  return {
    total: resources.length,
    downloadable: downloadableCount,
    formats: formatCounts,
    totalSizeBytes: totalSize,
    totalSizeHuman: formatFileSize(totalSize),
    accessibilityRatio: resources.length > 0 ? downloadableCount / resources.length : 0,
  };
}

/**
 * Check if a resource is downloadable
 */
function isResourceDownloadable(resource: any): boolean {
  const url = resource.url || '';
  const format = (resource.format || '').toLowerCase();

  // Direct download formats
  const downloadableFormats = ['csv', 'json', 'xml', 'xlsx', 'pdf', 'zip', 'geojson'];
  if (downloadableFormats.includes(format)) {
    return true;
  }

  // URL patterns that suggest downloadable content
  const downloadPatterns = ['.csv', '.json', '.xml', '.xlsx', '.pdf', '.zip', 'download', 'file'];
  return downloadPatterns.some(pattern => url.toLowerCase().includes(pattern));
}

/**
 * Format file size in human readable format
 */
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';

  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let unitIndex = 0;
  let size = bytes;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(1)} ${units[unitIndex]}`;
}

/**
 * Assess dataset accessibility
 */
function assessDatasetAccessibility(dataset: any): any {
  const resources = dataset.resources || [];
  const downloadableResources = resources.filter(isResourceDownloadable);

  let score = 0;
  const factors: string[] = [];

  // Resource availability
  if (resources.length > 0) {
    score += 30;
    factors.push('Has resources');
  }

  // Downloadable resources
  if (downloadableResources.length > 0) {
    score += 25;
    factors.push('Has downloadable resources');
  }

  // Open formats
  const openFormats = ['csv', 'json', 'xml', 'geojson'];
  const hasOpenFormat = resources.some((r: any) =>
    openFormats.includes((r.format || '').toLowerCase())
  );
  if (hasOpenFormat) {
    score += 20;
    factors.push('Uses open formats');
  }

  // License information
  if (dataset.license_title || dataset.license_id) {
    score += 15;
    factors.push('Has license information');
  }

  // Documentation
  if (dataset.notes?.trim()) {
    score += 10;
    factors.push('Has description');
  }

  return {
    score: Math.min(score, 100),
    factors,
    grade: score >= 80 ? 'A' : score >= 60 ? 'B' : score >= 40 ? 'C' : 'D',
  };
}

/**
 * Get last activity date
 */
function getLastActivity(dataset: any): string | null {
  const modified = dataset.metadata_modified;
  const created = dataset.metadata_created;

  const lastDate = modified || created;
  if (!lastDate) return null;

  try {
    return new Date(lastDate).toISOString();
  } catch {
    return null;
  }
}

/**
 * Calculate dataset quality score
 */
function calculateDatasetQuality(dataset: any): number {
  let score = 0;

  // Basic metadata
  if (dataset.title) score += 15;
  if (dataset.notes?.trim()) score += 20;
  if (dataset.tags && dataset.tags.length > 0) score += 10;

  // Resources
  const resourceCount = dataset.resources?.length || 0;
  if (resourceCount > 0) score += 25;
  if (resourceCount > 1) score += 5;

  // License
  if (dataset.license_title || dataset.license_id) score += 15;

  // Organization
  if (dataset.organization) score += 10;

  return Math.min(score, 100);
}

/**
 * Analyze group datasets collectively
 */
function analyzeGroupDatasets(datasets: any[]) {
  const totalDatasets = datasets.length;

  // Resource analysis
  const totalResources = datasets.reduce((sum, d) => sum + (d.enhanced.resources.total || 0), 0);
  const totalDownloadable = datasets.reduce((sum, d) => sum + (d.enhanced.resources.downloadable || 0), 0);

  // Format distribution
  const formatDistribution: Record<string, number> = {};
  datasets.forEach(dataset => {
    Object.entries(dataset.enhanced.resources.formats).forEach(([format, count]) => {
      formatDistribution[format] = (formatDistribution[format] || 0) + (count as number);
    });
  });

  // Organization distribution
  const organizationDistribution: Record<string, number> = {};
  datasets.forEach(dataset => {
    const org = dataset.enhanced.analysis.organization || 'Unknown';
    organizationDistribution[org] = (organizationDistribution[org] || 0) + 1;
  });

  // Quality distribution
  const qualityScores = datasets.map(d => d.enhanced.qualityScore);
  const averageQuality = qualityScores.reduce((sum, score) => sum + score, 0) / totalDatasets;

  return {
    totalDatasets,
    totalResources,
    totalDownloadable,
    accessibilityRatio: totalResources > 0 ? totalDownloadable / totalResources : 0,
    formatDistribution,
    organizationDistribution,
    averageQuality: Math.round(averageQuality),
    qualityDistribution: {
      excellent: qualityScores.filter(s => s >= 80).length,
      good: qualityScores.filter(s => s >= 60 && s < 80).length,
      fair: qualityScores.filter(s => s >= 40 && s < 60).length,
      poor: qualityScores.filter(s => s < 40).length,
    },
  };
}

/**
 * Create error result for failed requests
 */
function createGroupDatasetErrorResult(error: unknown, params: any) {
  return {
    success: false,
    error: {
      message: error instanceof Error ? error.message : "Unknown error occurred",
      groupId: params.id,
      params,
      timestamp: new Date().toISOString(),
    },
    result: [],
    metadata: {
      group: {
        id: params.id,
        datasetCount: 0,
        analysis: null,
      },
      pagination: {
        limit: params.limit,
        offset: params.offset,
        sort: params.sort,
        hasMore: false,
        nextOffset: null,
      },
    },
  };
}