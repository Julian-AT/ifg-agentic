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
 * Enhanced resource details tool
 * Returns comprehensive metadata about a specific resource with accessibility analysis
 */
export const getResourceDetails = ({
  session,
  dataStream,
}: DatasetToolsProps) =>
  tool({
    description: 
      "Return the metadata of a specific resource with enhanced analysis. Use this to get detailed information about individual data files, including download URLs, formats, and accessibility metrics.",
    inputSchema: z.object({
      id: z
        .string()
        .min(1)
        .describe("The ID of the resource"),
      include_tracking: z
        .boolean()
        .optional()
        .default(false)
        .describe("Include tracking information about dataset and resource usage statistics"),
    }),
    execute: async ({ id, include_tracking = false }) => {
      try {
        console.log(`📄 Getting resource details for: ${id}`);

        const params = new URLSearchParams();
        params.append("id", id);
        if (include_tracking) {
          params.append("include_tracking", include_tracking.toString());
        }

        const response = await fetch(`${BASE_URL}/action/resource_show?${params}`);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error?.message || "Resource not found");
        }

        // Enhance resource data with detailed analysis
        const enhancedData = enhanceResourceData(data, { id, include_tracking });

        console.log(`✅ Retrieved resource details:`, {
          name: enhancedData.result?.name,
          format: enhancedData.result?.format,
          accessibility: enhancedData.enhanced?.accessibility?.score,
        });

        return enhancedData;

      } catch (error) {
        console.error("❌ Error getting resource details:", error);
        
        return createResourceErrorResult(error, id);
      }
    },
  });

/**
 * Enhance resource data with comprehensive analysis
 */
function enhanceResourceData(data: any, params: { id: string; include_tracking: boolean }) {
  const resource = data.result;
  
  if (!resource) {
    return data;
  }

  // Analyze resource properties
  const analysis = analyzeResource(resource);
  
  // Assess accessibility
  const accessibility = assessResourceAccessibility(resource);
  
  // Analyze technical specifications
  const technical = analyzeTechnicalSpecs(resource);
  
  // Generate usage recommendations
  const recommendations = generateUsageRecommendations(resource);

  return {
    ...data,
    enhanced: {
      analysis,
      accessibility,
      technical,
      recommendations,
      summary: generateResourceSummary(resource),
      timestamp: new Date().toISOString(),
      requestParams: params,
    },
  };
}

/**
 * Analyze basic resource properties
 */
function analyzeResource(resource: any) {
  const now = new Date();
  const created = resource.created ? new Date(resource.created) : null;
  const modified = resource.last_modified || resource.revision_timestamp ? 
    new Date(resource.last_modified || resource.revision_timestamp) : null;

  return {
    name: resource.name || 'Unnamed Resource',
    description: resource.description || null,
    format: normalizeFormat(resource.format),
    url: resource.url,
    hasValidUrl: isValidUrl(resource.url),
    size: {
      bytes: resource.size ? parseInt(resource.size) : null,
      human: resource.size ? formatFileSize(parseInt(resource.size)) : 'Unknown',
    },
    dates: {
      created: created?.toISOString() || null,
      modified: modified?.toISOString() || null,
      ageInDays: created ? Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24)) : null,
      daysSinceUpdate: modified ? Math.floor((now.getTime() - modified.getTime()) / (1000 * 60 * 60 * 24)) : null,
    },
    metadata: {
      hasDescription: !!(resource.description && resource.description.trim()),
      hasValidFormat: !!(resource.format && resource.format.trim()),
      hasSize: !!(resource.size && !isNaN(resource.size)),
      mimetype: resource.mimetype,
    },
  };
}

/**
 * Assess resource accessibility
 */
function assessResourceAccessibility(resource: any) {
  let score = 0;
  const factors: string[] = [];
  const issues: string[] = [];

  // URL accessibility
  if (resource.url && isValidUrl(resource.url)) {
    score += 25;
    factors.push('Has valid URL');
    
    // Check for direct download patterns
    if (isDirectDownloadUrl(resource.url)) {
      score += 20;
      factors.push('Direct download URL');
    }
  } else {
    issues.push('Invalid or missing URL');
  }

  // Format accessibility
  const format = normalizeFormat(resource.format);
  if (isOpenFormat(format)) {
    score += 25;
    factors.push('Uses open format');
  } else if (format && format !== 'UNKNOWN') {
    score += 10;
    factors.push('Has specified format');
  } else {
    issues.push('Unknown or proprietary format');
  }

  // Machine readability
  if (isMachineReadable(format)) {
    score += 15;
    factors.push('Machine-readable format');
  }

  // Documentation
  if (resource.description && resource.description.trim()) {
    score += 10;
    factors.push('Has description');
  } else {
    issues.push('Missing description');
  }

  // Size information
  if (resource.size && !isNaN(resource.size)) {
    score += 5;
    factors.push('Size information available');
  }

  return {
    score: Math.min(score, 100),
    grade: score >= 80 ? 'A' : score >= 60 ? 'B' : score >= 40 ? 'C' : 'D',
    factors,
    issues,
    isDownloadable: isDirectDownloadUrl(resource.url),
    isOpenFormat: isOpenFormat(format),
    isMachineReadable: isMachineReadable(format),
  };
}

/**
 * Analyze technical specifications
 */
function analyzeTechnicalSpecs(resource: any) {
  const format = normalizeFormat(resource.format);
  
  return {
    format: {
      normalized: format,
      original: resource.format,
      mimetype: resource.mimetype,
      category: categorizeFormat(format),
    },
    encoding: inferEncoding(resource),
    structure: inferDataStructure(format),
    compatibility: assessCompatibility(format),
    processingRecommendations: getProcessingRecommendations(format),
  };
}

/**
 * Generate usage recommendations
 */
function generateUsageRecommendations(resource: any): string[] {
  const recommendations: string[] = [];
  const format = normalizeFormat(resource.format);
  
  // Format-specific recommendations
  switch (format) {
    case 'CSV':
      recommendations.push('Use pandas.read_csv() for Python analysis');
      recommendations.push('Check for proper delimiter and encoding');
      recommendations.push('Examine first few rows for data structure');
      break;
    case 'JSON':
      recommendations.push('Use json.loads() or pandas.read_json() for Python');
      recommendations.push('Validate JSON structure before processing');
      break;
    case 'XML':
      recommendations.push('Use xml.etree.ElementTree or lxml for Python');
      recommendations.push('Consider converting to structured format for analysis');
      break;
    case 'XLSX':
      recommendations.push('Use pandas.read_excel() for Python analysis');
      recommendations.push('May require openpyxl or xlrd dependencies');
      break;
  }

  // Size-based recommendations
  const sizeBytes = resource.size ? parseInt(resource.size) : 0;
  if (sizeBytes > 100 * 1024 * 1024) { // > 100MB
    recommendations.push('Large file - consider streaming or chunked processing');
  }

  // URL-based recommendations
  if (!isDirectDownloadUrl(resource.url)) {
    recommendations.push('URL may not be direct download - verify accessibility first');
  }

  // Accessibility recommendations
  if (!resource.description) {
    recommendations.push('Contact data provider for more information about structure');
  }

  return recommendations;
}

/**
 * Generate resource summary
 */
function generateResourceSummary(resource: any): string {
  const name = resource.name || 'Unnamed resource';
  const format = normalizeFormat(resource.format);
  const size = resource.size ? formatFileSize(parseInt(resource.size)) : 'unknown size';
  
  return `${name} is a ${format} resource (${size})${resource.description ? ': ' + resource.description.substring(0, 100) + '...' : '.'}`;
}

// Utility functions

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

function categorizeFormat(format: string): string {
  const categories: Record<string, string> = {
    'CSV': 'Structured Data',
    'JSON': 'Structured Data', 
    'XML': 'Structured Data',
    'GEOJSON': 'Geographic Data',
    'XLSX': 'Spreadsheet',
    'XLS': 'Spreadsheet',
    'PDF': 'Document',
    'TXT': 'Text',
    'ZIP': 'Archive',
    'HTML': 'Web Page',
  };
  
  return categories[format] || 'Other';
}

function inferEncoding(resource: any): string {
  // Try to infer from metadata or make educated guess
  if (resource.encoding) return resource.encoding;
  
  const format = normalizeFormat(resource.format);
  if (['JSON', 'GEOJSON'].includes(format)) return 'utf-8';
  if (format === 'CSV') return 'utf-8 or iso-8859-1';
  
  return 'unknown';
}

function inferDataStructure(format: string): string {
  const structures: Record<string, string> = {
    'CSV': 'Tabular - rows and columns',
    'JSON': 'Hierarchical - nested objects/arrays',
    'XML': 'Hierarchical - nested elements', 
    'GEOJSON': 'Geographic features with properties',
    'XLSX': 'Tabular - multiple sheets possible',
  };
  
  return structures[format] || 'Unknown structure';
}

function assessCompatibility(format: string): Record<string, boolean> {
  return {
    python: ['CSV', 'JSON', 'XML', 'XLSX', 'GEOJSON'].includes(format),
    r: ['CSV', 'JSON', 'XML', 'XLSX'].includes(format),
    excel: ['CSV', 'XLSX', 'XLS'].includes(format),
    gis: ['GEOJSON', 'CSV'].includes(format),
    webBrowsers: ['JSON', 'GEOJSON', 'CSV', 'XML', 'HTML'].includes(format),
  };
}

function getProcessingRecommendations(format: string): string[] {
  const recommendations: Record<string, string[]> = {
    'CSV': ['Check delimiter (comma, semicolon, tab)', 'Verify text encoding', 'Handle missing values'],
    'JSON': ['Validate JSON syntax', 'Check for nested structures', 'Handle arrays vs objects'],
    'XML': ['Understand schema/DTD if available', 'Parse namespaces carefully', 'Consider memory usage for large files'],
    'XLSX': ['Check multiple sheets', 'Handle merged cells', 'Be aware of Excel-specific formatting'],
  };
  
  return recommendations[format] || ['Check data quality', 'Validate format compliance'];
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
 * Create error result for failed requests
 */
function createResourceErrorResult(error: unknown, resourceId: string) {
  return {
    success: false,
    error: {
      message: error instanceof Error ? error.message : "Unknown error occurred",
      resourceId,
      timestamp: new Date().toISOString(),
    },
    result: null,
    enhanced: null,
  };
}