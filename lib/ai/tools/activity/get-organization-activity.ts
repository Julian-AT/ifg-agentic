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
 * Enhanced organization activity tool
 * Returns activity history for an organization with comprehensive analysis
 */
export const getOrganizationActivityList = ({
  session,
  dataStream,
}: ActivityToolsProps) =>
  tool({
    description: 
      "Return an organization's activity stream with enhanced analysis and insights. Shows all activities related to the organization's datasets and resources.",
    inputSchema: z.object({
      id: z
        .string()
        .min(1)
        .describe('The ID or name of the organization'),
      offset: z
        .number()
        .min(0)
        .optional()
        .describe('Starting position for pagination (default: 0)'),
      limit: z
        .number()
        .min(1)
        .max(100)
        .optional()
        .describe(
          'Maximum number of activities to return (default: 31, upper limit: 100)',
        ),
      include_hidden_activity: z
        .boolean()
        .optional()
        .default(false)
        .describe(
          'Whether to include hidden activity (usually false for external users)',
        ),
    }),
    execute: async ({ id, offset = 0, limit = 31, include_hidden_activity = false }) => {
      try {
        console.log(`🏛️ Getting organization activity for: ${id}`);

        const params = new URLSearchParams();
        params.append('id', id);
        params.append('offset', offset.toString());
        params.append('limit', limit.toString());
        params.append('include_hidden_activity', include_hidden_activity.toString());

        const response = await fetch(
          `${BASE_URL}/action/organization_activity_list?${params}`,
        );

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error?.message || "Organization activity request failed");
        }

        // Enhance organization activity data
        const enhancedData = enhanceOrganizationActivityData(data, {
          id,
          offset,
          limit,
          include_hidden_activity,
        });

        console.log(`✅ Retrieved ${enhancedData.result.length} organization activities`);

        return enhancedData;

      } catch (error) {
        console.error('❌ Error getting organization activity:', error);
        
        return createOrganizationActivityErrorResult(error, { id, offset, limit });
      }
    },
  });

/**
 * Enhance organization activity data with analysis
 */
function enhanceOrganizationActivityData(data: any, params: any) {
  const activities = data.result || [];
  
  // Process activities with organization-specific analysis
  const processedActivities = activities.map((activity: any) => {
    return {
      ...activity,
      enhanced: {
        type: activity.activity_type,
        timestamp: activity.timestamp,
        category: categorizeOrganizationActivity(activity.activity_type),
        significance: assessOrganizationActivitySignificance(activity.activity_type),
        description: generateOrganizationActivityDescription(activity),
        impact: assessOrganizationActivityImpact(activity),
      },
    };
  });

  // Generate organization-specific insights
  const insights = generateOrganizationActivityInsights(processedActivities, params.id);
  const metrics = calculateOrganizationActivityMetrics(processedActivities);

  return {
    ...data,
    result: processedActivities,
    metadata: {
      organizationId: params.id,
      activityCount: processedActivities.length,
      insights,
      metrics,
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
 * Categorize organization activity
 */
function categorizeOrganizationActivity(activityType: string): string {
  const categories: Record<string, string> = {
    'new organization': 'Organization Management',
    'changed organization': 'Organization Management',
    'deleted organization': 'Organization Management',
    'new package': 'Dataset Publishing',
    'changed package': 'Dataset Management',
    'deleted package': 'Dataset Management',
    'new resource': 'Resource Management',
    'changed resource': 'Resource Management',
    'deleted resource': 'Resource Management',
    'new user': 'User Management',
    'changed user': 'User Management',
  };

  return categories[activityType] || 'Other';
}

/**
 * Assess organization activity significance
 */
function assessOrganizationActivitySignificance(activityType: string): 'critical' | 'major' | 'minor' {
  const criticalActivities = ['new organization', 'deleted organization'];
  const majorActivities = ['changed organization', 'new package', 'deleted package'];
  
  if (criticalActivities.includes(activityType)) return 'critical';
  if (majorActivities.includes(activityType)) return 'major';
  return 'minor';
}

/**
 * Generate organization activity description
 */
function generateOrganizationActivityDescription(activity: any): string {
  const type = activity.activity_type;
  const timestamp = activity.timestamp ? new Date(activity.timestamp) : null;
  const timeStr = timestamp ? formatTimeAgo(timestamp) : 'at unknown time';
  
  const descriptions: Record<string, string> = {
    'new organization': `Organization was established ${timeStr}`,
    'changed organization': `Organization details were updated ${timeStr}`,
    'deleted organization': `Organization was removed ${timeStr}`,
    'new package': `New dataset was published ${timeStr}`,
    'changed package': `Dataset was updated ${timeStr}`,
    'deleted package': `Dataset was removed ${timeStr}`,
    'new resource': `New resource was added ${timeStr}`,
    'changed resource': `Resource was updated ${timeStr}`,
    'deleted resource': `Resource was removed ${timeStr}`,
    'new user': `New user was added ${timeStr}`,
    'changed user': `User details were updated ${timeStr}`,
  };
  
  return descriptions[type] || `${type} occurred ${timeStr}`;
}

/**
 * Assess organization activity impact
 */
function assessOrganizationActivityImpact(activity: any) {
  const type = activity.activity_type;
  
  return {
    publicVisible: ['new package', 'changed package', 'deleted package', 'new resource', 'changed resource'].includes(type),
    dataAffecting: ['new package', 'changed package', 'deleted package', 'new resource', 'changed resource', 'deleted resource'].includes(type),
    organizationChanging: ['changed organization', 'new user', 'changed user'].includes(type),
    scope: getActivityScope(type),
  };
}

/**
 * Get activity scope
 */
function getActivityScope(type: string): 'organization' | 'dataset' | 'resource' | 'user' {
  if (type.includes('organization')) return 'organization';
  if (type.includes('package')) return 'dataset';
  if (type.includes('resource')) return 'resource';
  if (type.includes('user')) return 'user';
  return 'organization';
}

/**
 * Format time ago
 */
function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffInDays === 0) return 'today';
  if (diffInDays === 1) return 'yesterday';
  if (diffInDays < 7) return `${diffInDays} days ago`;
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
  return `${Math.floor(diffInDays / 30)} months ago`;
}

/**
 * Calculate organization activity metrics
 */
function calculateOrganizationActivityMetrics(activities: any[]) {
  const now = new Date();
  const metrics = {
    totalActivities: activities.length,
    activitiesLast7Days: 0,
    activitiesLast30Days: 0,
    datasetActivities: 0,
    resourceActivities: 0,
    organizationActivities: 0,
    mostCommonActivity: '',
    activityFrequency: 'low' as 'high' | 'medium' | 'low',
  };

  const activityCounts: Record<string, number> = {};

  activities.forEach(activity => {
    const timestamp = activity.timestamp ? new Date(activity.timestamp) : null;
    const type = activity.activity_type;
    
    // Count by type
    activityCounts[type] = (activityCounts[type] || 0) + 1;
    
    // Categorize by scope
    if (type.includes('package')) metrics.datasetActivities++;
    else if (type.includes('resource')) metrics.resourceActivities++;
    else if (type.includes('organization')) metrics.organizationActivities++;
    
    // Time-based counts
    if (timestamp) {
      const daysSince = (now.getTime() - timestamp.getTime()) / (1000 * 60 * 60 * 24);
      if (daysSince <= 7) metrics.activitiesLast7Days++;
      if (daysSince <= 30) metrics.activitiesLast30Days++;
    }
  });

  // Find most common activity
  const sortedActivities = Object.entries(activityCounts).sort(([,a], [,b]) => b - a);
  metrics.mostCommonActivity = sortedActivities[0]?.[0] || 'none';

  // Assess activity frequency
  if (metrics.activitiesLast7Days > 5) metrics.activityFrequency = 'high';
  else if (metrics.activitiesLast7Days > 1) metrics.activityFrequency = 'medium';

  return metrics;
}

/**
 * Generate organization activity insights
 */
function generateOrganizationActivityInsights(activities: any[], organizationId: string): string[] {
  const insights: string[] = [];
  
  if (activities.length === 0) {
    insights.push('No activity recorded for this organization');
    return insights;
  }

  const metrics = calculateOrganizationActivityMetrics(activities);

  // Activity level insights
  if (metrics.activityFrequency === 'high') {
    insights.push('Organization is very active with frequent updates');
  } else if (metrics.activityFrequency === 'medium') {
    insights.push('Organization has moderate activity levels');
  } else {
    insights.push('Organization has low activity - few recent changes');
  }

  // Content insights
  if (metrics.datasetActivities > metrics.resourceActivities) {
    insights.push('Organization focuses more on dataset-level changes');
  } else if (metrics.resourceActivities > metrics.datasetActivities) {
    insights.push('Organization frequently updates individual resources');
  }

  // Publishing patterns
  const newPackages = activities.filter(a => a.activity_type === 'new package').length;
  if (newPackages > 3) {
    insights.push('Organization actively publishes new datasets');
  }

  // Recent activity
  if (metrics.activitiesLast7Days > 0) {
    insights.push(`${metrics.activitiesLast7Days} activities in the past week`);
  } else if (metrics.activitiesLast30Days > 0) {
    insights.push(`${metrics.activitiesLast30Days} activities in the past month`);
  } else {
    insights.push('No recent activity in the past month');
  }

  return insights;
}

/**
 * Create error result for failed requests
 */
function createOrganizationActivityErrorResult(error: unknown, params: any) {
  return {
    success: false,
    error: {
      message: error instanceof Error ? error.message : "Unknown error occurred",
      organizationId: params.id,
      params,
      timestamp: new Date().toISOString(),
    },
    result: [],
    metadata: {
      organizationId: params.id,
      activityCount: 0,
      insights: ['Unable to retrieve organization activity data'],
      metrics: null,
      pagination: {
        offset: params.offset,
        limit: params.limit,
        hasMore: false,
        includeHidden: false,
      },
    },
  };
}