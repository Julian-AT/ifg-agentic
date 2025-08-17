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
 * Enhanced group activity tool
 * Returns activity history for a specific group with comprehensive analysis
 */
export const getGroupActivityList = ({
  session,
  dataStream,
}: ActivityToolsProps) =>
  tool({
    description:
      'Get the activity history for a specific group. Shows changes and updates to the group and its member datasets with enhanced analysis and insights.',
    inputSchema: z.object({
      id: z
        .string()
        .min(1)
        .describe('The exact ID or name of the group to get activity for'),
      offset: z
        .number()
        .min(0)
        .optional()
        .describe('Starting position for pagination (0-based)'),
      limit: z
        .number()
        .min(1)
        .max(100)
        .optional()
        .describe(
          'Maximum number of activities to return (1-100). Default: 31',
        ),
      include_hidden_activity: z
        .boolean()
        .optional()
        .default(false)
        .describe('Include system/automated activities (usually false)'),
    }),
    execute: async ({ id, offset = 0, limit = 31, include_hidden_activity = false }) => {
      try {
        console.log(`📊 Getting group activity for: ${id}`);

        const params = new URLSearchParams();
        params.append('id', id);
        params.append('offset', offset.toString());
        params.append('limit', limit.toString());
        params.append('include_hidden_activity', include_hidden_activity.toString());

        const response = await fetch(
          `${BASE_URL}/action/group_activity_list?${params}`,
        );

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error?.message || "Group activity request failed");
        }

        // Enhance activity data
        const enhancedData = enhanceGroupActivityData(data, {
          id,
          offset,
          limit,
          include_hidden_activity,
        });

        console.log(`✅ Retrieved ${enhancedData.result.length} group activities`);

        return enhancedData;

      } catch (error) {
        console.error('❌ Error getting group activity:', error);
        
        return createGroupActivityErrorResult(error, { id, offset, limit });
      }
    },
  });

/**
 * Enhance group activity data with analysis
 */
function enhanceGroupActivityData(data: any, params: any) {
  const activities = data.result || [];
  
  // Process activities with group-specific analysis
  const processedActivities = activities.map((activity: any) => {
    return {
      ...activity,
      enhanced: {
        type: activity.activity_type,
        timestamp: activity.timestamp,
        category: categorizeGroupActivity(activity.activity_type),
        impact: assessGroupActivityImpact(activity.activity_type),
        description: generateGroupActivityDescription(activity),
      },
    };
  });

  // Generate group-specific insights
  const insights = generateGroupActivityInsights(processedActivities);

  return {
    ...data,
    result: processedActivities,
    metadata: {
      groupId: params.id,
      activityCount: processedActivities.length,
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
 * Categorize group activity
 */
function categorizeGroupActivity(activityType: string): string {
  const categories: Record<string, string> = {
    'new group': 'Group Management',
    'changed group': 'Group Management',
    'deleted group': 'Group Management',
    'new package': 'Dataset Management',
    'changed package': 'Dataset Management',
    'deleted package': 'Dataset Management',
  };

  return categories[activityType] || 'Other';
}

/**
 * Assess group activity impact
 */
function assessGroupActivityImpact(activityType: string): 'high' | 'medium' | 'low' {
  const highImpact = ['new group', 'deleted group'];
  const mediumImpact = ['changed group', 'new package', 'deleted package'];
  
  if (highImpact.includes(activityType)) return 'high';
  if (mediumImpact.includes(activityType)) return 'medium';
  return 'low';
}

/**
 * Generate group activity description
 */
function generateGroupActivityDescription(activity: any): string {
  const type = activity.activity_type;
  const timestamp = activity.timestamp ? new Date(activity.timestamp) : null;
  const timeStr = timestamp ? formatTimeAgo(timestamp) : 'at unknown time';
  
  const descriptions: Record<string, string> = {
    'new group': `Group was created ${timeStr}`,
    'changed group': `Group was updated ${timeStr}`,
    'deleted group': `Group was deleted ${timeStr}`,
    'new package': `Dataset was added to group ${timeStr}`,
    'changed package': `Dataset in group was updated ${timeStr}`,
    'deleted package': `Dataset was removed from group ${timeStr}`,
  };
  
  return descriptions[type] || `${type} occurred ${timeStr}`;
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
 * Generate group activity insights
 */
function generateGroupActivityInsights(activities: any[]): string[] {
  const insights: string[] = [];
  
  if (activities.length === 0) {
    insights.push('No activity recorded for this group');
    return insights;
  }

  const activityTypes = activities.map(a => a.activity_type);
  const hasGroupChanges = activityTypes.some(t => t.includes('group'));
  const hasPackageChanges = activityTypes.some(t => t.includes('package'));

  if (hasGroupChanges) {
    insights.push('Group configuration has been modified');
  }

  if (hasPackageChanges) {
    insights.push('Group membership or member datasets have changed');
  }

  const recentActivity = activities.filter(a => {
    const timestamp = a.timestamp ? new Date(a.timestamp) : null;
    if (!timestamp) return false;
    const daysSince = (Date.now() - timestamp.getTime()) / (1000 * 60 * 60 * 24);
    return daysSince <= 7;
  });

  if (recentActivity.length > 0) {
    insights.push(`${recentActivity.length} activities in the past week`);
  } else {
    insights.push('No recent activity in the past week');
  }

  return insights;
}

/**
 * Create error result for failed requests
 */
function createGroupActivityErrorResult(error: unknown, params: any) {
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
      groupId: params.id,
      activityCount: 0,
      insights: ['Unable to retrieve group activity data'],
      pagination: {
        offset: params.offset,
        limit: params.limit,
        hasMore: false,
        includeHidden: false,
      },
    },
  };
}