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
 * Enhanced resource search tool
 * Search for resources with advanced filtering and analysis capabilities
 */
export const searchResources = ({ session, dataStream }: DatasetToolsProps) =>
  tool({
    description: 
      "Search for resources satisfying given search criteria. Use this to find specific data files by format, name, or other properties across all datasets in the Austrian portal.",
    inputSchema: z.object({
      query: z
        .string()
        .min(1)
        .describe('The search criteria. Examples: "format:CSV", "name:energy", "size:[100000 TO *]"'),
      fields: z
        .string()
        .optional()
        .describe("Deprecated: Specific fields to search in"),
      order_by: z
        .string()
        .optional()
        .describe("Field to order results by: 'name', 'last_modified', 'size', 'format'"),
      offset: z
        .number()
        .min(0)
        .optional()
        .describe("Starting position for pagination (0-based)"),
      limit: z
        .number()
        .min(1)
        .max(1000)
        .optional()
        .describe("Maximum number of resources to return (1-1000)"),
    }),
    execute: async ({ query, fields, order_by, offset = 0, limit = 50 }) => {
      try {
        console.log(`🔍 Searching resources:`, { query, order_by, limit, offset });

        const params = new URLSearchParams();
        params.append("query", query);
        
        if (fields) params.append("fields", fields);
        if (order_by) params.append("order_by", order_by);
        params.append("offset", offset.toString());
        params.append("limit", limit.toString());

        const response = await fetch(
          `${BASE_URL}/action/resource_search?${params}`
        );

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error?.message || "Resource search failed");
        }

        // Enhance search results with analysis
        const enhancedData = enhanceResourceSearchResults(data, { 
          query, order_by, offset, limit 
        });

        console.log(`✅ Found ${enhancedData.result.count} resources`);

        return enhancedData;

      } catch (error) {
        console.error("❌ Error searching resources:", error);
        
        return createResourceSearchErrorResult(error, { query, order_by, offset, limit });
      }
    },
  });

/**
 * Enhance resource search results with comprehensive analysis
 */
function enhanceResourceSearchResults(data: any, params: any) {
  const results = data.result?.results || [];
  const count = data.result?.count || 0;
  
  // Process each resource result
  const processedResults = results.map((resource: any) => {
    const analysis = analyzeSearchResult(resource);
    const accessibility = assessResourceAccessibility(resource);
    const recommendations = generateResourceRecommendations(resource);
    
    return {
      ...resource,
      enhanced: {
        analysis,
        accessibility,
        recommendations,
        relevanceScore: calculateRelevanceScore(resource, params.query),
      },
    };
  });

  // Sort by relevance if no specific order requested
  const sortedResults = params.order_by ? 
    processedResults : 
    processedResults.sort((a, b) => b.enhanced.relevanceScore - a.enhanced.relevanceScore);

  // Generate search analytics
  const analytics = generateSearchAnalytics(sortedResults, params.query);

  return {
    ...data,
    result: {
      ...data.result,
      results: sortedResults,
    },
    metadata: {
      search: {
        query: params.query,
        orderBy: params.order_by,
        pagination: {
          offset: params.offset,
          limit: params.limit,
          hasMore: count > params.offset + params.limit,
          totalResults: count,
        },
      },
      analytics,
      timestamp: new Date().toISOString(),
    },
  };
}

/**
 * Analyze individual search result
 */
function analyzeSearchResult(resource: any) {
  return {
    name: resource.name || 'Unnamed Resource',
    format: normalizeFormat(resource.format),
    url: resource.url,
    description: resource.description,
    size: {
      bytes: resource.size ? parseInt(resource.size) : null,
      human: resource.size ? formatFileSize(parseInt(resource.size)) : 'Unknown',
    },
    dates: {
      created: resource.created,
      modified: resource.last_modified || resource.revision_timestamp,
    },
    package: {
      id: resource.package_id,
      name: resource.package?.name,
      title: resource.package?.title,
    },
    hasValidUrl: isValidUrl(resource.url),
    isDownloadable: isDirectDownloadUrl(resource.url),
  };
}

/**
 * Assess resource accessibility
 */
function assessResourceAccessibility(resource: any) {
  let score = 0;
  const factors: string[] = [];

  // URL validity
  if (isValidUrl(resource.url)) {
    score += 30;
    factors.push('Valid URL');
    
    if (isDirectDownloadUrl(resource.url)) {
      score += 20;
      factors.push('Direct download URL');
    }
  }

  // Format quality
  const format = normalizeFormat(resource.format);
  if (isOpenFormat(format)) {
    score += 25;
    factors.push('Open format');
  }

  if (isMachineReadable(format)) {
    score += 15;
    factors.push('Machine readable');
  }

  // Documentation
  if (resource.description && resource.description.trim()) {
    score += 10;
    factors.push('Has description');
  }

  return {
    score: Math.min(score, 100),
    factors,
    isAccessible: score >= 60,
  };
}

/**
 * Generate resource-specific recommendations
 */
function generateResourceRecommendations(resource: any): string[] {
  const recommendations: string[] = [];
  const format = normalizeFormat(resource.format);

  // Format-specific recommendations
  const formatRecommendations: Record<string, string[]> = {
    'CSV': [
      'Check delimiter and encoding before processing',
      'Use pandas or similar library for analysis',
    ],
    'JSON': [
      'Validate JSON structure before processing',
      'Consider nested data handling',
    ],
    'XML': [
      'Parse with appropriate XML library',
      'Check for schema/namespace definitions',
    ],
    'XLSX': [
      'May contain multiple sheets',
      'Use appropriate Excel reading library',
    ],
    'PDF': [
      'Requires text extraction tools',
      'Data may not be machine-readable',
    ],
  };

  recommendations.push(...(formatRecommendations[format] || []));

  // URL accessibility recommendations
  if (!isDirectDownloadUrl(resource.url)) {
    recommendations.push('Verify URL accessibility before automated processing');
  }

  // Size-based recommendations
  const sizeBytes = resource.size ? parseInt(resource.size) : 0;
  if (sizeBytes > 50 * 1024 * 1024) { // > 50MB
    recommendations.push('Large file - consider memory management strategies');
  }

  return recommendations;
}

/**
 * Calculate relevance score for search result
 */
function calculateRelevanceScore(resource: any, searchQuery: string): number {
  const query = searchQuery.toLowerCase();
  let score = 0;

  // Exact matches in name
  if (resource.name && resource.name.toLowerCase().includes(query)) {
    score += 40;
  }

  // Format matches
  if (resource.format && resource.format.toLowerCase().includes(query)) {
    score += 30;
  }

  // Description matches
  if (resource.description && resource.description.toLowerCase().includes(query)) {
    score += 20;
  }

  // URL quality bonus
  if (isDirectDownloadUrl(resource.url)) {
    score += 10;
  }

  // Open format bonus
  if (isOpenFormat(normalizeFormat(resource.format))) {
    score += 10;
  }

  // Recent modification bonus
  if (resource.last_modified) {
    const modifiedDate = new Date(resource.last_modified);
    const daysSinceModified = (Date.now() - modifiedDate.getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceModified < 365) { // Less than a year old
      score += 5;
    }
  }

  return Math.min(score, 100);
}

/**
 * Generate analytics for search results
 */
function generateSearchAnalytics(results: any[], searchQuery: string) {
  const formatDistribution: Record<string, number> = {};
  const packageDistribution: Record<string, number> = {};
  let totalSize = 0;
  let accessibleCount = 0;

  results.forEach(result => {
    // Format distribution
    const format = result.enhanced.analysis.format;
    formatDistribution[format] = (formatDistribution[format] || 0) + 1;

    // Package distribution
    const packageName = result.enhanced.analysis.package.name || 'Unknown';
    packageDistribution[packageName] = (packageDistribution[packageName] || 0) + 1;

    // Size accumulation
    if (result.enhanced.analysis.size.bytes) {
      totalSize += result.enhanced.analysis.size.bytes;
    }

    // Accessibility count
    if (result.enhanced.accessibility.isAccessible) {
      accessibleCount++;
    }
  });

  return {
    totalResults: results.length,
    formatDistribution,
    packageDistribution: Object.entries(packageDistribution)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10) // Top 10 packages
      .reduce((obj, [key, value]) => ({ ...obj, [key]: value }), {}),
    aggregateSize: {
      bytes: totalSize,
      human: formatFileSize(totalSize),
    },
    accessibilityStats: {
      accessible: accessibleCount,
      total: results.length,
      percentage: results.length > 0 ? Math.round((accessibleCount / results.length) * 100) : 0,
    },
    qualityMetrics: {
      averageRelevance: results.length > 0 
        ? Math.round(results.reduce((sum, r) => sum + r.enhanced.relevanceScore, 0) / results.length)
        : 0,
      hasDescription: results.filter(r => r.enhanced.analysis.description).length,
      hasValidUrl: results.filter(r => r.enhanced.analysis.hasValidUrl).length,
    },
  };
}

// Utility functions (reused from other tools)

function normalizeFormat(format: string | undefined): string {
  if (!format) return 'UNKNOWN';
  return format.toUpperCase().trim();
}

function isValidUrl(url: string | undefined): boolean {
  if (!url) return false;
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

function isDirectDownloadUrl(url: string | undefined): boolean {
  if (!url) return false;
  
  const directPatterns = [
    '.csv', '.json', '.xml', '.xlsx', '.xls', '.pdf', '.zip', '.geojson',
    'download', 'file', 'attachment'
  ];
  
  return directPatterns.some(pattern => url.toLowerCase().includes(pattern));
}

function isOpenFormat(format: string): boolean {
  const openFormats = ['CSV', 'JSON', 'XML', 'GEOJSON', 'TXT', 'TSV'];
  return openFormats.includes(format);
}

function isMachineReadable(format: string): boolean {
  const machineReadableFormats = ['CSV', 'JSON', 'XML', 'GEOJSON', 'TSV', 'YAML'];
  return machineReadableFormats.includes(format);
}

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
 * Create error result for failed searches
 */
function createResourceSearchErrorResult(error: unknown, params: any) {
  return {
    success: false,
    error: {
      message: error instanceof Error ? error.message : "Unknown error occurred",
      query: params.query,
      params,
      timestamp: new Date().toISOString(),
    },
    result: {
      count: 0,
      results: [],
    },
    metadata: {
      search: {
        query: params.query,
        orderBy: params.order_by,
        pagination: {
          offset: params.offset,
          limit: params.limit,
          hasMore: false,
          totalResults: 0,
        },
      },
      analytics: null,
    },
  };
}