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
 * Enhanced resource views listing tool
 * Returns all available views for a specific resource with analysis
 */
export const listResourceViews = ({ session, dataStream }: DatasetToolsProps) =>
  tool({
    description: 
      "Return the list of resource views for a particular resource with comprehensive analysis. Resource views provide different ways to interact with and visualize data resources.",
    inputSchema: z.object({
      id: z
        .string()
        .min(1)
        .describe("The ID of the resource to get views for"),
    }),
    execute: async ({ id }) => {
      try {
        console.log(`📋 Listing resource views for: ${id}`);

        const params = new URLSearchParams();
        params.append("id", id);

        const response = await fetch(
          `${BASE_URL}/action/resource_view_list?${params}`
        );

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error?.message || "Resource views request failed");
        }

        // Enhance resource views data
        const enhancedData = enhanceResourceViewsData(data, { id });

        console.log(`✅ Listed ${enhancedData.result.length} resource views`);

        return enhancedData;

      } catch (error) {
        console.error("❌ Error listing resource views:", error);
        
        return createResourceViewsErrorResult(error, id);
      }
    },
  });

/**
 * Enhance resource views data with comprehensive analysis
 */
function enhanceResourceViewsData(data: any, params: { id: string }) {
  const views = data.result || [];
  
  // Process each view with enhanced analysis
  const processedViews = views.map((view: any) => {
    const analysis = analyzeView(view);
    const capabilities = assessViewCapabilities(view);
    const suitability = assessViewSuitability(view);
    
    return {
      ...view,
      enhanced: {
        analysis,
        capabilities,
        suitability,
        recommendations: generateViewRecommendations(view),
        displayInfo: generateDisplayInfo(view),
      },
    };
  });

  // Sort views by usefulness and interactivity
  const sortedViews = sortViewsByUsefulness(processedViews);

  // Generate collection analysis
  const collectionAnalysis = analyzeViewCollection(sortedViews);

  return {
    ...data,
    result: sortedViews,
    metadata: {
      resourceId: params.id,
      viewCount: sortedViews.length,
      analysis: collectionAnalysis,
      recommendations: generateCollectionRecommendations(sortedViews),
      timestamp: new Date().toISOString(),
    },
  };
}

/**
 * Analyze individual view
 */
function analyzeView(view: any) {
  return {
    id: view.id,
    title: view.title || 'Untitled View',
    description: view.description,
    viewType: view.view_type,
    config: view.config || {},
    metadata: {
      hasTitle: !!(view.title && view.title.trim()),
      hasDescription: !!(view.description && view.description.trim()),
      hasConfig: !!(view.config && Object.keys(view.config).length > 0),
      isConfigured: isViewProperlyCofigured(view),
    },
    typeInfo: getViewTypeInfo(view.view_type),
  };
}

/**
 * Assess view capabilities
 */
function assessViewCapabilities(view: any) {
  const viewType = view.view_type;
  
  const capabilityProfiles: Record<string, any> = {
    'recline_view': {
      interactivity: 90,
      dataExploration: 95,
      visualization: 40,
      analysis: 85,
      features: ['Data table', 'Sorting', 'Filtering', 'Search', 'Export'],
    },
    'recline_graph_view': {
      interactivity: 60,
      dataExploration: 70,
      visualization: 95,
      analysis: 80,
      features: ['Charts', 'Graphs', 'Visual analysis'],
    },
    'recline_map_view': {
      interactivity: 70,
      dataExploration: 80,
      visualization: 95,
      analysis: 75,
      features: ['Geographic visualization', 'Map interaction', 'Spatial analysis'],
    },
    'image_view': {
      interactivity: 20,
      dataExploration: 10,
      visualization: 80,
      analysis: 10,
      features: ['Image display', 'Visual content'],
    },
    'text_view': {
      interactivity: 20,
      dataExploration: 30,
      visualization: 20,
      analysis: 40,
      features: ['Text display', 'Document content'],
    },
    'pdf_view': {
      interactivity: 30,
      dataExploration: 40,
      visualization: 60,
      analysis: 50,
      features: ['PDF display', 'Document viewer'],
    },
  };

  return capabilityProfiles[viewType] || {
    interactivity: 10,
    dataExploration: 10,
    visualization: 10,
    analysis: 10,
    features: ['Unknown capabilities'],
  };
}

/**
 * Assess view suitability for different use cases
 */
function assessViewSuitability(view: any) {
  const viewType = view.view_type;
  
  const suitabilityProfiles: Record<string, Record<string, number>> = {
    'recline_view': {
      'Data Analysis': 95,
      'Public Presentation': 60,
      'Technical Review': 90,
      'Quick Overview': 70,
      'Documentation': 50,
    },
    'recline_graph_view': {
      'Data Analysis': 80,
      'Public Presentation': 95,
      'Technical Review': 70,
      'Quick Overview': 90,
      'Documentation': 70,
    },
    'recline_map_view': {
      'Data Analysis': 85,
      'Public Presentation': 95,
      'Technical Review': 75,
      'Quick Overview': 85,
      'Documentation': 60,
    },
    'image_view': {
      'Data Analysis': 20,
      'Public Presentation': 70,
      'Technical Review': 30,
      'Quick Overview': 60,
      'Documentation': 80,
    },
    'text_view': {
      'Data Analysis': 30,
      'Public Presentation': 50,
      'Technical Review': 60,
      'Quick Overview': 70,
      'Documentation': 90,
    },
    'pdf_view': {
      'Data Analysis': 40,
      'Public Presentation': 60,
      'Technical Review': 70,
      'Quick Overview': 50,
      'Documentation': 95,
    },
  };

  return suitabilityProfiles[viewType] || {
    'Data Analysis': 20,
    'Public Presentation': 20,
    'Technical Review': 20,
    'Quick Overview': 20,
    'Documentation': 20,
  };
}

/**
 * Check if view is properly configured
 */
function isViewProperlyCofigured(view: any): boolean {
  const viewType = view.view_type;
  const config = view.config || {};

  switch (viewType) {
    case 'recline_graph_view':
      return !!(config.graph_type || config.x_axis || config.y_axis);
    case 'recline_map_view':
      return !!(config.map_field_type || config.latitude_field || config.longitude_field);
    default:
      return true; // Most views don't require specific configuration
  }
}

/**
 * Get view type information
 */
function getViewTypeInfo(viewType: string) {
  const typeInfo: Record<string, any> = {
    'recline_view': {
      name: 'Data Table View',
      description: 'Interactive table for data exploration',
      category: 'Data Exploration',
      primaryUse: 'Detailed data analysis and filtering',
    },
    'recline_graph_view': {
      name: 'Chart View',
      description: 'Visual charts and graphs',
      category: 'Visualization',
      primaryUse: 'Data visualization and trend analysis',
    },
    'recline_map_view': {
      name: 'Map View',
      description: 'Geographic data visualization',
      category: 'Geographic Visualization',
      primaryUse: 'Spatial data analysis and mapping',
    },
    'image_view': {
      name: 'Image View',
      description: 'Image and visual content display',
      category: 'Media Display',
      primaryUse: 'Visual content presentation',
    },
    'text_view': {
      name: 'Text View',
      description: 'Text content display',
      category: 'Document Display',
      primaryUse: 'Text and document viewing',
    },
    'pdf_view': {
      name: 'PDF View',
      description: 'PDF document viewer',
      category: 'Document Display',
      primaryUse: 'PDF document presentation',
    },
  };

  return typeInfo[viewType] || {
    name: `${viewType} View`,
    description: 'Unknown view type',
    category: 'Unknown',
    primaryUse: 'Purpose not specified',
  };
}

/**
 * Generate view-specific recommendations
 */
function generateViewRecommendations(view: any): string[] {
  const recommendations: string[] = [];
  const viewType = view.view_type;
  const capabilities = assessViewCapabilities(view);

  // Capability-based recommendations
  if (capabilities.interactivity > 70) {
    recommendations.push('Ideal for interactive data exploration');
  }

  if (capabilities.visualization > 80) {
    recommendations.push('Excellent for visual presentations and reports');
  }

  if (capabilities.analysis > 80) {
    recommendations.push('Suitable for detailed data analysis tasks');
  }

  // Type-specific recommendations
  const typeRecommendations: Record<string, string[]> = {
    'recline_view': [
      'Use for detailed data examination and filtering',
      'Export filtered data for further analysis',
    ],
    'recline_graph_view': [
      'Choose appropriate chart types for your data',
      'Use for trend analysis and pattern identification',
    ],
    'recline_map_view': [
      'Ensure your data contains geographic information',
      'Use for spatial analysis and location-based insights',
    ],
    'image_view': [
      'Ensure image URLs are accessible',
      'Use for visual documentation and presentations',
    ],
    'text_view': [
      'Use for textual content and documentation',
      'Consider text formatting for readability',
    ],
    'pdf_view': [
      'Ensure PDF files are properly formatted',
      'Use for formal document presentation',
    ],
  };

  recommendations.push(...(typeRecommendations[viewType] || []));

  return recommendations;
}

/**
 * Generate display information for UI
 */
function generateDisplayInfo(view: any) {
  const typeInfo = getViewTypeInfo(view.view_type);
  const capabilities = assessViewCapabilities(view);
  
  return {
    displayName: view.title || typeInfo.name,
    subtitle: typeInfo.description,
    badge: typeInfo.category,
    score: Math.round((capabilities.interactivity + capabilities.visualization + capabilities.analysis) / 3),
    icon: getViewTypeIcon(view.view_type),
  };
}

/**
 * Get icon identifier for view type
 */
function getViewTypeIcon(viewType: string): string {
  const icons: Record<string, string> = {
    'recline_view': 'table',
    'recline_graph_view': 'chart',
    'recline_map_view': 'map',
    'image_view': 'image',
    'text_view': 'document',
    'pdf_view': 'file-pdf',
  };

  return icons[viewType] || 'eye';
}

/**
 * Sort views by usefulness and capabilities
 */
function sortViewsByUsefulness(views: any[]) {
  return views.sort((a, b) => {
    const scoreA = a.enhanced.capabilities.interactivity + 
                   a.enhanced.capabilities.dataExploration + 
                   a.enhanced.capabilities.analysis;
    const scoreB = b.enhanced.capabilities.interactivity + 
                   b.enhanced.capabilities.dataExploration + 
                   b.enhanced.capabilities.analysis;
    
    return scoreB - scoreA;
  });
}

/**
 * Analyze the collection of views
 */
function analyzeViewCollection(views: any[]) {
  const typeDistribution: Record<string, number> = {};
  const categoryDistribution: Record<string, number> = {};
  let totalInteractivity = 0;
  let totalVisualization = 0;
  let configuredViews = 0;

  views.forEach(view => {
    const viewType = view.view_type;
    const category = view.enhanced.analysis.typeInfo.category;
    
    typeDistribution[viewType] = (typeDistribution[viewType] || 0) + 1;
    categoryDistribution[category] = (categoryDistribution[category] || 0) + 1;
    
    totalInteractivity += view.enhanced.capabilities.interactivity;
    totalVisualization += view.enhanced.capabilities.visualization;
    
    if (view.enhanced.analysis.metadata.isConfigured) {
      configuredViews++;
    }
  });

  const viewCount = views.length;

  return {
    totalViews: viewCount,
    typeDistribution,
    categoryDistribution,
    averageInteractivity: viewCount > 0 ? Math.round(totalInteractivity / viewCount) : 0,
    averageVisualization: viewCount > 0 ? Math.round(totalVisualization / viewCount) : 0,
    configurationRate: viewCount > 0 ? Math.round((configuredViews / viewCount) * 100) : 0,
    mostCommonType: Object.entries(typeDistribution).sort(([,a], [,b]) => b - a)[0]?.[0] || 'none',
    diversityScore: Object.keys(typeDistribution).length,
  };
}

/**
 * Generate recommendations for the view collection
 */
function generateCollectionRecommendations(views: any[]): string[] {
  const recommendations: string[] = [];
  const analysis = analyzeViewCollection(views);

  if (analysis.totalViews === 0) {
    recommendations.push('No views available - contact data provider for viewing options');
    return recommendations;
  }

  if (analysis.totalViews === 1) {
    recommendations.push('Single view available - consider requesting additional view types');
  }

  if (analysis.averageInteractivity > 70) {
    recommendations.push('Good interactive options available for data exploration');
  }

  if (analysis.averageVisualization > 70) {
    recommendations.push('Strong visualization capabilities for presentations');
  }

  if (analysis.diversityScore < 2 && analysis.totalViews > 1) {
    recommendations.push('Limited view diversity - consider requesting additional view types');
  }

  if (analysis.configurationRate < 50) {
    recommendations.push('Some views may need configuration - check with data provider');
  }

  // Usage recommendations based on available views
  const hasTableView = views.some(v => v.view_type === 'recline_view');
  const hasChartView = views.some(v => v.view_type === 'recline_graph_view');
  const hasMapView = views.some(v => v.view_type === 'recline_map_view');

  if (hasTableView) {
    recommendations.push('Use table view for detailed data analysis and filtering');
  }

  if (hasChartView) {
    recommendations.push('Use chart view for visual analysis and presentations');
  }

  if (hasMapView) {
    recommendations.push('Use map view for geographic analysis and spatial insights');
  }

  return recommendations;
}

/**
 * Create error result for failed requests
 */
function createResourceViewsErrorResult(error: unknown, resourceId: string) {
  return {
    success: false,
    error: {
      message: error instanceof Error ? error.message : "Unknown error occurred",
      resourceId,
      timestamp: new Date().toISOString(),
    },
    result: [],
    metadata: {
      resourceId,
      viewCount: 0,
      analysis: null,
      recommendations: ['Unable to retrieve views - check resource ID and try again'],
    },
  };
}