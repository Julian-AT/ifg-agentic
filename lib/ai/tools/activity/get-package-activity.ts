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
 * Enhanced package activity tool
 * Returns comprehensive activity history for a specific dataset with analysis
 */
export const getPackageActivityList = ({
  session,
  dataStream,
}: ActivityToolsProps) =>
  tool({
    description:
      'Get the activity history for a specific dataset (package). Shows what changes have been made, when, and by whom with enhanced analysis and insights. Use this to track dataset updates, modifications, and publishing activity.',
    inputSchema: z.object({
      id: z
        .string()
        .min(1)
        .describe(
          'The exact ID or name of the dataset to get activity for. Example: "bev-bevoelkerung-zu-jahresbeginn-ab-2002"',
        ),
      offset: z
        .number()
        .min(0)
        .optional()
        .describe(
          'Starting position for pagination (0-based). Use 0 for most recent activities',
        ),
      limit: z
        .number()
        .min(1)
        .max(100)
        .optional()
        .describe(
          'Maximum number of activities to return (1-100). Default: 31. Use 10-20 for recent activity overview',
        ),
      include_hidden_activity: z
        .boolean()
        .optional()
        .default(false)
        .describe(
          'Include system/automated activities (usually false for user queries)',
        ),
    }),
    execute: async ({ id, offset = 0, limit = 31, include_hidden_activity = false }) => {
      try {
        console.log(`📊 Getting activity for package: ${id}`);

        const params = new URLSearchParams();
        params.append('id', id);
        params.append('offset', offset.toString());
        params.append('limit', limit.toString());
        params.append('include_hidden_activity', include_hidden_activity.toString());

        const response = await fetch(
          `${BASE_URL}/action/package_activity_list?${params}`,
        );

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error?.message || "Activity request failed");
        }

        // Enhance activity data with analysis
        const enhancedData = enhancePackageActivityData(data, {
          id,
          offset,
          limit,
          include_hidden_activity,
        });

        console.log(`✅ Retrieved ${enhancedData.result.length} activities for ${id}`);

        return enhancedData;

      } catch (error) {
        console.error('❌ Error getting package activity:', error);
        
        return createActivityErrorResult(error, { id, offset, limit });
      }
    },
  });

/**
 * Enhance package activity data with analysis and insights
 */
function enhancePackageActivityData(data: any, params: any) {
  const activities = data.result || [];
  
  // Process each activity with enhanced information
  const processedActivities = activities.map((activity: any) => {
    const analysis = analyzeActivity(activity);
    const impact = assessActivityImpact(activity);
    
    return {
      ...activity,
      enhanced: {
        analysis,
        impact,
        displayInfo: generateActivityDisplayInfo(activity),
        humanReadable: generateHumanReadableDescription(activity),
      },
    };
  });

  // Generate timeline analysis
  const timelineAnalysis = analyzeActivityTimeline(processedActivities);
  
  // Generate insights
  const insights = generateActivityInsights(processedActivities);

  return {
    ...data,
    result: processedActivities,
    metadata: {
      packageId: params.id,
      activityCount: processedActivities.length,
      timelineAnalysis,
      insights,
      pagination: {
        offset: params.offset,
        limit: params.limit,
        hasMore: processedActivities.length === params.limit,
        includeHidden: params.include_hidden_activity,
      },
      timestamp: new Date().toISOString(),
    },
  };
}

/**
 * Analyze individual activity
 */
function analyzeActivity(activity: any) {
  const activityType = activity.activity_type;
  const timestamp = activity.timestamp ? new Date(activity.timestamp) : null;
  const now = new Date();
  
  return {
    type: activityType,
    timestamp: timestamp?.toISOString() || null,
    ageInDays: timestamp ? Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60 * 60 * 24)) : null,
    actor: activity.user_id || 'system',
    objectType: activity.object_id ? 'dataset' : 'unknown',
    objectId: activity.object_id,
    category: categorizeActivity(activityType),
    importance: assessActivityImportance(activityType),
  };
}

/**
 * Categorize activity type
 */
function categorizeActivity(activityType: string): string {
  const categories: Record<string, string> = {
    'new package': 'Creation',
    'changed package': 'Modification',
    'deleted package': 'Deletion',
    'new resource': 'Resource Management',
    'changed resource': 'Resource Management',
    'deleted resource': 'Resource Management',
    'new organization': 'Administration',
    'changed organization': 'Administration',
    'new user': 'User Management',
    'changed user': 'User Management',
  };

  return categories[activityType] || 'Other';
}

/**
 * Assess activity importance
 */
function assessActivityImportance(activityType: string): 'high' | 'medium' | 'low' {
  const highImportance = ['new package', 'deleted package', 'changed package'];
  const mediumImportance = ['new resource', 'deleted resource', 'changed resource'];
  
  if (highImportance.includes(activityType)) return 'high';
  if (mediumImportance.includes(activityType)) return 'medium';
  return 'low';
}

/**
 * Assess activity impact
 */
function assessActivityImpact(activity: any) {
  const type = activity.activity_type;
  
  const impactAssessment = {
    userVisible: isUserVisibleActivity(type),
    dataChanging: isDataChangingActivity(type),
    structural: isStructuralActivity(type),
    severity: getActivitySeverity(type),
  };

  return {
    ...impactAssessment,
    description: generateImpactDescription(impactAssessment, type),
  };
}

/**
 * Check if activity is visible to end users
 */
function isUserVisibleActivity(type: string): boolean {
  const userVisibleTypes = [
    'new package', 'changed package', 'deleted package',
    'new resource', 'changed resource', 'deleted resource'
  ];
  return userVisibleTypes.includes(type);
}

/**
 * Check if activity changes actual data
 */
function isDataChangingActivity(type: string): boolean {
  const dataChangingTypes = [
    'changed package', 'new resource', 'changed resource', 'deleted resource'
  ];
  return dataChangingTypes.includes(type);
}

/**
 * Check if activity affects structure
 */
function isStructuralActivity(type: string): boolean {
  const structuralTypes = [
    'new package', 'deleted package', 'new resource', 'deleted resource'
  ];
  return structuralTypes.includes(type);
}

/**
 * Get activity severity level
 */
function getActivitySeverity(type: string): 'critical' | 'major' | 'minor' {
  const criticalTypes = ['deleted package'];
  const majorTypes = ['new package', 'changed package', 'deleted resource'];
  
  if (criticalTypes.includes(type)) return 'critical';
  if (majorTypes.includes(type)) return 'major';
  return 'minor';
}

/**
 * Generate impact description
 */
function generateImpactDescription(impact: any, type: string): string {
  if (impact.severity === 'critical') {
    return 'Critical change that significantly affects data availability';
  }
  if (impact.severity === 'major') {
    return 'Major change that affects dataset structure or content';
  }
  return 'Minor change with limited impact on users';
}

/**
 * Generate activity display information
 */
function generateActivityDisplayInfo(activity: any) {
  const type = activity.activity_type;
  const timestamp = activity.timestamp ? new Date(activity.timestamp) : null;
  
  return {
    icon: getActivityIcon(type),
    color: getActivityColor(type),
    title: formatActivityTitle(type),
    timeAgo: timestamp ? formatTimeAgo(timestamp) : 'Unknown time',
    badge: categorizeActivity(type),
  };
}

/**
 * Get icon for activity type
 */
function getActivityIcon(type: string): string {
  const icons: Record<string, string> = {
    'new package': 'plus-circle',
    'changed package': 'edit',
    'deleted package': 'trash',
    'new resource': 'file-plus',
    'changed resource': 'file-edit',
    'deleted resource': 'file-minus',
  };
  
  return icons[type] || 'activity';
}

/**
 * Get color for activity type
 */
function getActivityColor(type: string): string {
  const colors: Record<string, string> = {
    'new package': 'green',
    'changed package': 'blue',
    'deleted package': 'red',
    'new resource': 'emerald',
    'changed resource': 'blue',
    'deleted resource': 'orange',
  };
  
  return colors[type] || 'gray';
}

/**
 * Format activity title
 */
function formatActivityTitle(type: string): string {
  const titles: Record<string, string> = {
    'new package': 'Dataset Created',
    'changed package': 'Dataset Updated',
    'deleted package': 'Dataset Deleted',
    'new resource': 'Resource Added',
    'changed resource': 'Resource Updated',
    'deleted resource': 'Resource Removed',
  };
  
  return titles[type] || type;
}

/**
 * Format time ago
 */
function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minutes ago`;
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} hours ago`;
  }
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) {
    return `${diffInDays} days ago`;
  }
  
  const diffInMonths = Math.floor(diffInDays / 30);
  return `${diffInMonths} months ago`;
}

/**
 * Generate human-readable description
 */
function generateHumanReadableDescription(activity: any): string {
  const type = activity.activity_type;
  const timestamp = activity.timestamp ? new Date(activity.timestamp) : null;
  const timeStr = timestamp ? formatTimeAgo(timestamp) : 'at unknown time';
  
  const descriptions: Record<string, string> = {
    'new package': `Dataset was created ${timeStr}`,
    'changed package': `Dataset was updated ${timeStr}`,
    'deleted package': `Dataset was deleted ${timeStr}`,
    'new resource': `New resource was added ${timeStr}`,
    'changed resource': `Resource was updated ${timeStr}`,
    'deleted resource': `Resource was removed ${timeStr}`,
  };
  
  return descriptions[type] || `${type} occurred ${timeStr}`;
}

/**
 * Analyze activity timeline
 */
function analyzeActivityTimeline(activities: any[]) {
  const now = new Date();
  const periods = {
    last24h: 0,
    last7d: 0,
    last30d: 0,
    older: 0,
  };

  const activityTypes: Record<string, number> = {};

  activities.forEach(activity => {
    const timestamp = activity.timestamp ? new Date(activity.timestamp) : null;
    const type = activity.activity_type;
    
    // Count by type
    activityTypes[type] = (activityTypes[type] || 0) + 1;
    
    if (!timestamp) {
      periods.older++;
      return;
    }
    
    const ageInDays = (now.getTime() - timestamp.getTime()) / (1000 * 60 * 60 * 24);
    
    if (ageInDays <= 1) {
      periods.last24h++;
    } else if (ageInDays <= 7) {
      periods.last7d++;
    } else if (ageInDays <= 30) {
      periods.last30d++;
    } else {
      periods.older++;
    }
  });

  return {
    periods,
    activityTypes,
    totalActivities: activities.length,
    isActive: periods.last7d > 0,
    activityLevel: getActivityLevel(periods),
  };
}

/**
 * Get activity level assessment
 */
function getActivityLevel(periods: any): 'high' | 'medium' | 'low' {
  if (periods.last24h > 0) return 'high';
  if (periods.last7d > 0) return 'medium';
  return 'low';
}

/**
 * Generate activity insights
 */
function generateActivityInsights(activities: any[]): string[] {
  const insights: string[] = [];
  
  if (activities.length === 0) {
    insights.push('No activity recorded for this dataset');
    return insights;
  }

  const timeline = analyzeActivityTimeline(activities);
  
  // Activity level insights
  if (timeline.activityLevel === 'high') {
    insights.push('Dataset is very active with recent changes');
  } else if (timeline.activityLevel === 'medium') {
    insights.push('Dataset has moderate activity in the past week');
  } else {
    insights.push('Dataset has low activity - last changes were more than a week ago');
  }

  // Content insights
  const hasResourceChanges = activities.some(a => 
    a.activity_type.includes('resource'));
  if (hasResourceChanges) {
    insights.push('Dataset resources have been modified');
  }

  const hasPackageChanges = activities.some(a => 
    a.activity_type.includes('package'));
  if (hasPackageChanges) {
    insights.push('Dataset metadata has been updated');
  }

  // Frequency insights
  if (timeline.totalActivities > 10) {
    insights.push('Dataset has extensive activity history');
  }

  return insights;
}

/**
 * Create error result for failed requests
 */
function createActivityErrorResult(error: unknown, params: any) {
  return {
    success: false,
    error: {
      message: error instanceof Error ? error.message : "Unknown error occurred",
      packageId: params.id,
      params,
      timestamp: new Date().toISOString(),
    },
    result: [],
    metadata: {
      packageId: params.id,
      activityCount: 0,
      timelineAnalysis: null,
      insights: ['Unable to retrieve activity data'],
      pagination: {
        offset: params.offset,
        limit: params.limit,
        hasMore: false,
        includeHidden: false,
      },
    },
  };
}