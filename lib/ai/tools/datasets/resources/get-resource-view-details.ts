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
 * Enhanced resource view details tool
 * Returns metadata about specific resource views with visualization analysis
 */
export const getResourceViewDetails = ({
  session,
  dataStream,
}: DatasetToolsProps) =>
  tool({
    description: 
      "Return the metadata of a resource view with enhanced visualization analysis. Resource views are specific presentations or visualizations of data resources.",
    inputSchema: z.object({
      id: z
        .string()
        .min(1)
        .describe("The ID of the resource view"),
    }),
    execute: async ({ id }) => {
      try {
        console.log(`👁️ Getting resource view details for: ${id}`);

        const params = new URLSearchParams();
        params.append("id", id);

        const response = await fetch(
          `${BASE_URL}/action/resource_view_show?${params}`
        );

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error?.message || "Resource view not found");
        }

        // Enhance resource view data
        const enhancedData = enhanceResourceViewData(data, { id });

        console.log(`✅ Retrieved resource view:`, {
          title: enhancedData.result?.title,
          viewType: enhancedData.result?.view_type,
          resourceId: enhancedData.result?.resource_id,
        });

        return enhancedData;

      } catch (error) {
        console.error("❌ Error getting resource view details:", error);
        
        return createResourceViewErrorResult(error, id);
      }
    },
  });

/**
 * Enhance resource view data with analysis
 */
function enhanceResourceViewData(data: any, params: { id: string }) {
  const view = data.result;
  
  if (!view) {
    return data;
  }

  // Analyze view properties
  const analysis = analyzeResourceView(view);
  
  // Assess view capabilities
  const capabilities = assessViewCapabilities(view);
  
  // Generate usage recommendations
  const recommendations = generateViewRecommendations(view);

  return {
    ...data,
    enhanced: {
      analysis,
      capabilities,
      recommendations,
      summary: generateViewSummary(view),
      timestamp: new Date().toISOString(),
      requestParams: params,
    },
  };
}

/**
 * Analyze resource view properties
 */
function analyzeResourceView(view: any) {
  return {
    id: view.id,
    title: view.title || 'Untitled View',
    description: view.description || null,
    viewType: view.view_type,
    resourceId: view.resource_id,
    packageId: view.package_id,
    config: view.config || {},
    metadata: {
      hasTitle: !!(view.title && view.title.trim()),
      hasDescription: !!(view.description && view.description.trim()),
      hasConfig: !!(view.config && Object.keys(view.config).length > 0),
      isPublic: view.public !== false, // Default to public if not specified
    },
    dates: {
      created: view.created,
      modified: view.modified,
    },
  };
}

/**
 * Assess view capabilities and features
 */
function assessViewCapabilities(view: any) {
  const viewType = view.view_type;
  const config = view.config || {};
  
  let capabilities: Record<string, boolean> = {};
  let features: string[] = [];
  let limitations: string[] = [];

  switch (viewType) {
    case 'recline_view':
      capabilities = {
        dataExploration: true,
        filtering: true,
        sorting: true,
        searching: true,
        dataExport: true,
        visualization: false,
      };
      features.push('Interactive data table', 'Column sorting', 'Row filtering', 'Search functionality');
      break;

    case 'recline_graph_view':
      capabilities = {
        dataExploration: true,
        filtering: false,
        sorting: false,
        searching: false,
        dataExport: false,
        visualization: true,
      };
      features.push('Data visualization', 'Chart generation', 'Graph display');
      if (config.graph_type) {
        features.push(`${config.graph_type} chart type`);
      }
      break;

    case 'recline_map_view':
      capabilities = {
        dataExploration: true,
        filtering: true,
        sorting: false,
        searching: false,
        dataExport: false,
        visualization: true,
      };
      features.push('Geographic visualization', 'Map display', 'Spatial data rendering');
      break;

    case 'image_view':
      capabilities = {
        dataExploration: false,
        filtering: false,
        sorting: false,
        searching: false,
        dataExport: false,
        visualization: true,
      };
      features.push('Image display', 'Visual content presentation');
      limitations.push('No data interaction capabilities');
      break;

    case 'text_view':
      capabilities = {
        dataExploration: false,
        filtering: false,
        sorting: false,
        searching: false,
        dataExport: false,
        visualization: false,
      };
      features.push('Text content display', 'Document presentation');
      limitations.push('No data interaction capabilities');
      break;

    case 'pdf_view':
      capabilities = {
        dataExploration: false,
        filtering: false,
        sorting: false,
        searching: false,
        dataExport: false,
        visualization: false,
      };
      features.push('PDF document display', 'Document viewer');
      limitations.push('No data interaction capabilities');
      break;

    default:
      capabilities = {
        dataExploration: false,
        filtering: false,
        sorting: false,
        searching: false,
        dataExport: false,
        visualization: false,
      };
      limitations.push('Unknown view type - capabilities uncertain');
  }

  return {
    viewType,
    capabilities,
    features,
    limitations,
    interactivity: calculateInteractivityScore(capabilities),
    suitability: assessViewSuitability(view),
  };
}

/**
 * Calculate interactivity score
 */
function calculateInteractivityScore(capabilities: Record<string, boolean>): number {
  const weights = {
    dataExploration: 25,
    filtering: 20,
    sorting: 15,
    searching: 15,
    dataExport: 15,
    visualization: 10,
  };

  let score = 0;
  Object.entries(capabilities).forEach(([capability, enabled]) => {
    if (enabled && weights[capability as keyof typeof weights]) {
      score += weights[capability as keyof typeof weights];
    }
  });

  return score;
}

/**
 * Assess view suitability for different use cases
 */
function assessViewSuitability(view: any) {
  const viewType = view.view_type;
  
  const suitability: Record<string, number> = {
    dataAnalysis: 0,
    visualization: 0,
    documentation: 0,
    publicPresentation: 0,
    technicalReview: 0,
  };

  switch (viewType) {
    case 'recline_view':
      suitability.dataAnalysis = 90;
      suitability.technicalReview = 85;
      suitability.publicPresentation = 60;
      break;

    case 'recline_graph_view':
      suitability.visualization = 90;
      suitability.publicPresentation = 85;
      suitability.dataAnalysis = 70;
      break;

    case 'recline_map_view':
      suitability.visualization = 95;
      suitability.publicPresentation = 90;
      suitability.dataAnalysis = 75;
      break;

    case 'image_view':
      suitability.documentation = 80;
      suitability.publicPresentation = 70;
      break;

    case 'text_view':
      suitability.documentation = 90;
      suitability.technicalReview = 70;
      break;

    case 'pdf_view':
      suitability.documentation = 95;
      suitability.technicalReview = 80;
      suitability.publicPresentation = 60;
      break;
  }

  return suitability;
}

/**
 * Generate view-specific recommendations
 */
function generateViewRecommendations(view: any): string[] {
  const recommendations: string[] = [];
  const viewType = view.view_type;

  // Type-specific recommendations
  switch (viewType) {
    case 'recline_view':
      recommendations.push('Use this view for detailed data exploration and analysis');
      recommendations.push('Sort and filter columns to find specific data points');
      recommendations.push('Export filtered data for further analysis');
      break;

    case 'recline_graph_view':
      recommendations.push('Use this view for visual data analysis and presentations');
      recommendations.push('Choose appropriate chart types for your data');
      recommendations.push('Consider data aggregation needs for effective visualization');
      break;

    case 'recline_map_view':
      recommendations.push('Use this view for geographic data analysis');
      recommendations.push('Ensure your data contains geographic coordinates or regions');
      recommendations.push('Consider map projection and zoom levels for your use case');
      break;

    case 'image_view':
      recommendations.push('Use this view for visual content and documentation');
      recommendations.push('Ensure image URLs are accessible and properly formatted');
      break;

    case 'text_view':
      recommendations.push('Use this view for textual content and documentation');
      recommendations.push('Consider text formatting and readability');
      break;

    case 'pdf_view':
      recommendations.push('Use this view for document presentation');
      recommendations.push('Ensure PDF files are accessible and not password-protected');
      break;

    default:
      recommendations.push('Unknown view type - verify compatibility with your use case');
      recommendations.push('Check with data provider for view capabilities');
  }

  // General recommendations
  if (!view.title || !view.title.trim()) {
    recommendations.push('Request proper title from data provider for better identification');
  }

  if (!view.description || !view.description.trim()) {
    recommendations.push('Request description from data provider for better understanding');
  }

  return recommendations;
}

/**
 * Generate view summary
 */
function generateViewSummary(view: any): string {
  const title = view.title || 'Untitled View';
  const viewType = view.view_type || 'unknown';
  const typeDescription = getViewTypeDescription(viewType);
  
  return `${title} is a ${typeDescription}${view.description ? ': ' + view.description.substring(0, 100) + '...' : '.'}`;
}

/**
 * Get human-readable view type description
 */
function getViewTypeDescription(viewType: string): string {
  const descriptions: Record<string, string> = {
    'recline_view': 'interactive data table view',
    'recline_graph_view': 'data visualization chart view',
    'recline_map_view': 'geographic map view',
    'image_view': 'image display view',
    'text_view': 'text content view',
    'pdf_view': 'PDF document view',
  };

  return descriptions[viewType] || `${viewType} view`;
}

/**
 * Create error result for failed requests
 */
function createResourceViewErrorResult(error: unknown, viewId: string) {
  return {
    success: false,
    error: {
      message: error instanceof Error ? error.message : "Unknown error occurred",
      viewId,
      timestamp: new Date().toISOString(),
    },
    result: null,
    enhanced: null,
  };
}