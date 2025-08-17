import { tool, type UIMessageStreamWriter } from 'ai';
import { z } from 'zod';
import type { Session } from 'next-auth';
import type { ChatMessage } from '@/lib/types';

const BASE_URL = 'https://www.data.gv.at/katalog/api/3';

interface ActivityToolsProps {
  session: Session;
  dataStream: UIMessageStreamWriter<ChatMessage>;
}

/**
 * Enhanced activity data tool
 * Returns the data payload from an activity with comprehensive analysis
 */
export const getActivityData = ({ session, dataStream }: ActivityToolsProps) =>
  tool({
    description:
      "Show the data from an item of 'activity' (part of the activity stream) with enhanced data analysis and insights.",
    inputSchema: z.object({
      id: z
        .string()
        .min(1)
        .describe('The ID of the activity'),
      object_type: z
        .enum(['package', 'user', 'group', 'organization'])
        .describe('The type of the activity object'),
    }),
    execute: async ({ id, object_type }) => {
      try {
        console.log(`📊 Getting activity data for: ${id} (${object_type})`);

        const params = new URLSearchParams();
        params.append('id', id);
        params.append('object_type', object_type);

        const response = await fetch(
          `${BASE_URL}/action/activity_data_show?${params}`,
        );

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error?.message || "Activity data request failed");
        }

        // Enhance activity data with analysis
        const enhancedData = enhanceActivityData(data, { id, object_type });

        console.log(`✅ Retrieved activity data for ${object_type} ${id}`);

        return enhancedData;

      } catch (error) {
        console.error('❌ Error getting activity data:', error);
        
        return createActivityDataErrorResult(error, { id, object_type });
      }
    },
  });

/**
 * Enhance activity data with comprehensive analysis
 */
function enhanceActivityData(data: any, params: any) {
  const activityData = data.result;
  
  if (!activityData) {
    return {
      ...data,
      enhanced: {
        analysis: null,
        summary: 'No activity data available',
        timestamp: new Date().toISOString(),
      },
    };
  }

  // Analyze the activity data based on object type
  const analysis = analyzeActivityDataByType(activityData, params.object_type);
  
  // Generate data summary
  const summary = generateActivityDataSummary(activityData, params.object_type);
  
  // Extract key insights
  const insights = extractActivityDataInsights(activityData, params.object_type);

  return {
    ...data,
    enhanced: {
      analysis,
      summary,
      insights,
      metadata: {
        objectType: params.object_type,
        activityId: params.id,
        dataSize: JSON.stringify(activityData).length,
        hasData: !!activityData,
      },
      timestamp: new Date().toISOString(),
      requestParams: params,
    },
  };
}

/**
 * Analyze activity data based on object type
 */
function analyzeActivityDataByType(activityData: any, objectType: string) {
  switch (objectType) {
    case 'package':
      return analyzePackageData(activityData);
    case 'organization':
      return analyzeOrganizationData(activityData);
    case 'group':
      return analyzeGroupData(activityData);
    case 'user':
      return analyzeUserData(activityData);
    default:
      return analyzeGenericData(activityData);
  }
}

/**
 * Analyze package (dataset) activity data
 */
function analyzePackageData(data: any) {
  return {
    id: data.id,
    name: data.name,
    title: data.title,
    state: data.state,
    private: data.private,
    metadata: {
      hasTitle: !!(data.title && data.title.trim()),
      hasDescription: !!(data.notes && data.notes.trim()),
      hasResources: !!(data.resources && data.resources.length > 0),
      resourceCount: data.resources ? data.resources.length : 0,
      hasLicense: !!(data.license_id || data.license_title),
      hasOrganization: !!data.organization,
      tagCount: data.tags ? data.tags.length : 0,
    },
    organization: data.organization ? {
      id: data.organization.id,
      name: data.organization.name,
      title: data.organization.title,
    } : null,
    license: {
      id: data.license_id,
      title: data.license_title,
    },
    dates: {
      created: data.metadata_created,
      modified: data.metadata_modified,
    },
    quality: assessPackageQuality(data),
  };
}

/**
 * Analyze organization activity data
 */
function analyzeOrganizationData(data: any) {
  return {
    id: data.id,
    name: data.name,
    title: data.title,
    displayName: data.display_name,
    state: data.state,
    metadata: {
      hasTitle: !!(data.title && data.title.trim()),
      hasDescription: !!(data.description && data.description.trim()),
      hasImage: !!(data.image_url && data.image_url.trim()),
      packageCount: data.package_count || 0,
    },
    dates: {
      created: data.created,
      modified: data.revision_timestamp,
    },
    contact: {
      approval_status: data.approval_status,
    },
    quality: assessOrganizationQuality(data),
  };
}

/**
 * Analyze group activity data
 */
function analyzeGroupData(data: any) {
  return {
    id: data.id,
    name: data.name,
    title: data.title,
    displayName: data.display_name,
    state: data.state,
    metadata: {
      hasTitle: !!(data.title && data.title.trim()),
      hasDescription: !!(data.description && data.description.trim()),
      hasImage: !!(data.image_url && data.image_url.trim()),
      packageCount: data.package_count || 0,
    },
    dates: {
      created: data.created,
      modified: data.revision_timestamp,
    },
    quality: assessGroupQuality(data),
  };
}

/**
 * Analyze user activity data
 */
function analyzeUserData(data: any) {
  return {
    id: data.id,
    name: data.name,
    displayName: data.display_name,
    state: data.state,
    metadata: {
      hasDisplayName: !!(data.display_name && data.display_name.trim()),
      hasAbout: !!(data.about && data.about.trim()),
      numberCreatedPackages: data.number_created_packages || 0,
    },
    dates: {
      created: data.created,
    },
    activity: {
      createdPackages: data.number_created_packages || 0,
    },
    quality: assessUserQuality(data),
  };
}

/**
 * Analyze generic activity data
 */
function analyzeGenericData(data: any) {
  return {
    id: data.id,
    name: data.name,
    title: data.title,
    state: data.state,
    dataKeys: Object.keys(data),
    dataSize: JSON.stringify(data).length,
    hasBasicFields: !!(data.id && data.name),
  };
}

/**
 * Assess package quality
 */
function assessPackageQuality(data: any): { score: number; factors: string[] } {
  let score = 0;
  const factors: string[] = [];

  if (data.title && data.title.trim()) {
    score += 20;
    factors.push('Has title');
  }

  if (data.notes && data.notes.trim()) {
    score += 25;
    factors.push('Has description');
  }

  if (data.resources && data.resources.length > 0) {
    score += 30;
    factors.push('Has resources');
  }

  if (data.license_id || data.license_title) {
    score += 15;
    factors.push('Has license');
  }

  if (data.organization) {
    score += 10;
    factors.push('Has organization');
  }

  return { score, factors };
}

/**
 * Assess organization quality
 */
function assessOrganizationQuality(data: any): { score: number; factors: string[] } {
  let score = 0;
  const factors: string[] = [];

  if (data.title && data.title.trim()) {
    score += 30;
    factors.push('Has title');
  }

  if (data.description && data.description.trim()) {
    score += 25;
    factors.push('Has description');
  }

  if (data.image_url && data.image_url.trim()) {
    score += 20;
    factors.push('Has image');
  }

  if (data.package_count > 0) {
    score += 25;
    factors.push('Publishes datasets');
  }

  return { score, factors };
}

/**
 * Assess group quality
 */
function assessGroupQuality(data: any): { score: number; factors: string[] } {
  let score = 0;
  const factors: string[] = [];

  if (data.title && data.title.trim()) {
    score += 35;
    factors.push('Has title');
  }

  if (data.description && data.description.trim()) {
    score += 30;
    factors.push('Has description');
  }

  if (data.image_url && data.image_url.trim()) {
    score += 20;
    factors.push('Has image');
  }

  if (data.package_count > 0) {
    score += 15;
    factors.push('Contains datasets');
  }

  return { score, factors };
}

/**
 * Assess user quality
 */
function assessUserQuality(data: any): { score: number; factors: string[] } {
  let score = 0;
  const factors: string[] = [];

  if (data.display_name && data.display_name.trim()) {
    score += 30;
    factors.push('Has display name');
  }

  if (data.about && data.about.trim()) {
    score += 40;
    factors.push('Has about section');
  }

  if (data.number_created_packages > 0) {
    score += 30;
    factors.push('Has created datasets');
  }

  return { score, factors };
}

/**
 * Generate activity data summary
 */
function generateActivityDataSummary(data: any, objectType: string): string {
  const name = data.title || data.display_name || data.name || 'Unnamed';
  
  const summaries: Record<string, string> = {
    'package': `Dataset "${name}" with ${data.resources?.length || 0} resources`,
    'organization': `Organization "${name}" with ${data.package_count || 0} datasets`,
    'group': `Group "${name}" with ${data.package_count || 0} datasets`,
    'user': `User "${name}" who created ${data.number_created_packages || 0} datasets`,
  };
  
  return summaries[objectType] || `${objectType} "${name}"`;
}

/**
 * Extract activity data insights
 */
function extractActivityDataInsights(data: any, objectType: string): string[] {
  const insights: string[] = [];
  
  switch (objectType) {
    case 'package':
      if (data.resources && data.resources.length > 5) {
        insights.push('Dataset has many resources - comprehensive data collection');
      }
      if (data.tags && data.tags.length > 10) {
        insights.push('Well-tagged dataset - good discoverability');
      }
      if (!data.license_id && !data.license_title) {
        insights.push('Dataset lacks license information');
      }
      break;
      
    case 'organization':
      if (data.package_count > 20) {
        insights.push('Very active organization with many datasets');
      }
      if (!data.description || !data.description.trim()) {
        insights.push('Organization could benefit from a description');
      }
      break;
      
    case 'group':
      if (data.package_count > 10) {
        insights.push('Large group with many datasets');
      }
      break;
      
    case 'user':
      if (data.number_created_packages > 5) {
        insights.push('Prolific contributor to the platform');
      }
      break;
  }
  
  return insights;
}

/**
 * Create error result for failed requests
 */
function createActivityDataErrorResult(error: unknown, params: any) {
  return {
    success: false,
    error: {
      message: error instanceof Error ? error.message : "Unknown error occurred",
      activityId: params.id,
      objectType: params.object_type,
      timestamp: new Date().toISOString(),
    },
    result: null,
    enhanced: {
      analysis: null,
      summary: 'Unable to retrieve activity data',
      insights: [],
      metadata: {
        objectType: params.object_type,
        activityId: params.id,
        dataSize: 0,
        hasData: false,
      },
    },
  };
}