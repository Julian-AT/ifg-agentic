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
 * Enhanced recent activity tool
 * Returns the activity stream of all recently changed packages with comprehensive analysis
 */
export const getRecentlyChangedPackagesActivityList = ({
  session,
  dataStream,
}: ActivityToolsProps) =>
  tool({
    description:
      'Return the activity stream of all recently added or changed packages with enhanced analysis. Use this to discover what datasets have been updated across the entire portal.',
    inputSchema: z.object({
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
    }),
    execute: async ({ offset = 0, limit = 31 }) => {
      try {
        console.log(`📈 Getting recent package activities`);

        const params = new URLSearchParams();
        params.append('offset', offset.toString());
        params.append('limit', limit.toString());

        const response = await fetch(
          `${BASE_URL}/action/recently_changed_packages_activity_list?${params}`,
        );

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error?.message || "Recent activity request failed");
        }

        // Enhance recent activity data
        const enhancedData = enhanceRecentActivityData(data, { offset, limit });

        console.log(`✅ Retrieved ${enhancedData.result.length} recent activities`);

        return enhancedData;

      } catch (error) {
        console.error('❌ Error getting recent activity:', error);
        
        return createRecentActivityErrorResult(error, { offset, limit });
      }
    },
  });

/**
 * Enhance recent activity data with comprehensive analysis
 */
function enhanceRecentActivityData(data: any, params: any) {
  const activities = data.result || [];
  
  // Process activities with enhanced analysis
  const processedActivities = activities.map((activity: any) => {
    return {
      ...activity,
      enhanced: {
        type: activity.activity_type,
        timestamp: activity.timestamp,
        category: categorizeRecentActivity(activity.activity_type),
        priority: assessActivityPriority(activity.activity_type),
        description: generateRecentActivityDescription(activity),
        organization: extractOrganizationInfo(activity),
        dataset: extractDatasetInfo(activity),
      },
    };
  });

  // Generate system-wide insights
  const insights = generateSystemInsights(processedActivities);
  const trends = analyzeActivityTrends(processedActivities);
  const statistics = calculateActivityStatistics(processedActivities);

  return {
    ...data,
    result: processedActivities,
    metadata: {
      activityCount: processedActivities.length,
      insights,
      trends,
      statistics,
      pagination: {
        offset: params.offset,
        limit: params.limit,
        hasMore: processedActivities.length === params.limit,
      },
      timestamp: new Date().toISOString(),
    },
  };
}

/**
 * Categorize recent activity
 */
function categorizeRecentActivity(activityType: string): string {
  const categories: Record<string, string> = {
    'new package': 'New Dataset',
    'changed package': 'Dataset Update',
    'deleted package': 'Dataset Removal',
    'new resource': 'Resource Addition',
    'changed resource': 'Resource Update',
    'deleted resource': 'Resource Removal',
  };

  return categories[activityType] || 'Other Activity';
}

/**
 * Assess activity priority for display
 */
function assessActivityPriority(activityType: string): 'high' | 'medium' | 'low' {
  const highPriority = ['new package', 'deleted package'];
  const mediumPriority = ['changed package', 'new resource', 'deleted resource'];
  
  if (highPriority.includes(activityType)) return 'high';
  if (mediumPriority.includes(activityType)) return 'medium';
  return 'low';
}

/**
 * Generate recent activity description
 */
function generateRecentActivityDescription(activity: any): string {
  const type = activity.activity_type;
  const timestamp = activity.timestamp ? new Date(activity.timestamp) : null;
  const timeStr = timestamp ? formatTimeAgo(timestamp) : 'recently';
  
  const descriptions: Record<string, string> = {
    'new package': `New dataset was published ${timeStr}`,
    'changed package': `Dataset was updated ${timeStr}`,
    'deleted package': `Dataset was removed ${timeStr}`,
    'new resource': `New data resource was added ${timeStr}`,
    'changed resource': `Data resource was updated ${timeStr}`,
    'deleted resource': `Data resource was removed ${timeStr}`,
  };
  
  return descriptions[type] || `${type} occurred ${timeStr}`;
}

/**
 * Extract organization information from activity
 */
function extractOrganizationInfo(activity: any) {
  // This would typically be extracted from activity data
  // For now, return a placeholder structure
  return {
    id: activity.object_id || null,
    name: activity.data?.organization?.name || 'Unknown',
    title: activity.data?.organization?.title || 'Unknown Organization',
  };
}

/**
 * Extract dataset information from activity
 */
function extractDatasetInfo(activity: any) {
  return {
    id: activity.object_id || null,
    name: activity.data?.name || 'Unknown',
    title: activity.data?.title || 'Unknown Dataset',
  };
}

/**
 * Format time ago
 */
function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 60) {
    return diffInMinutes <= 1 ? 'just now' : `${diffInMinutes} minutes ago`;
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;
  }
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`;
  }
  
  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) {
    return `${diffInWeeks} week${diffInWeeks !== 1 ? 's' : ''} ago`;
  }
  
  const diffInMonths = Math.floor(diffInDays / 30);
  return `${diffInMonths} month${diffInMonths !== 1 ? 's' : ''} ago`;
}

/**
 * Generate system-wide insights
 */
function generateSystemInsights(activities: any[]): string[] {
  const insights: string[] = [];
  
  if (activities.length === 0) {
    insights.push('No recent activity detected across the system');
    return insights;
  }

  const activityTypes = activities.map(a => a.activity_type);
  const newPackages = activityTypes.filter(t => t === 'new package').length;
  const updatedPackages = activityTypes.filter(t => t === 'changed package').length;
  const deletedPackages = activityTypes.filter(t => t === 'deleted package').length;

  // Publishing insights
  if (newPackages > 0) {
    insights.push(`${newPackages} new dataset${newPackages !== 1 ? 's' : ''} published recently`);
  }

  if (updatedPackages > 0) {
    insights.push(`${updatedPackages} dataset${updatedPackages !== 1 ? 's' : ''} updated recently`);
  }

  if (deletedPackages > 0) {
    insights.push(`${deletedPackages} dataset${deletedPackages !== 1 ? 's' : ''} removed recently`);
  }

  // Activity level assessment
  const totalActivities = activities.length;
  if (totalActivities > 20) {
    insights.push('High activity level across the platform');
  } else if (totalActivities > 10) {
    insights.push('Moderate activity level across the platform');
  } else {
    insights.push('Low activity level across the platform');
  }

  // Organization diversity
  const organizations = new Set(activities.map(a => a.enhanced?.organization?.name).filter(Boolean));
  if (organizations.size > 5) {
    insights.push(`Activities from ${organizations.size} different organizations`);
  }

  return insights;
}

/**
 * Analyze activity trends
 */
function analyzeActivityTrends(activities: any[]) {
  const now = new Date();
  const hourlyBuckets: Record<string, number> = {};
  const dailyBuckets: Record<string, number> = {};
  const activityTypeDistribution: Record<string, number> = {};

  activities.forEach(activity => {
    const timestamp = activity.timestamp ? new Date(activity.timestamp) : null;
    const type = activity.activity_type;
    
    // Count by type
    activityTypeDistribution[type] = (activityTypeDistribution[type] || 0) + 1;
    
    if (timestamp) {
      // Hourly distribution (last 24 hours)
      const hoursSince = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60 * 60));
      if (hoursSince < 24) {
        const hourKey = `${hoursSince}h ago`;
        hourlyBuckets[hourKey] = (hourlyBuckets[hourKey] || 0) + 1;
      }
      
      // Daily distribution (last 7 days)
      const daysSince = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60 * 60 * 24));
      if (daysSince < 7) {
        const dayKey = `${daysSince}d ago`;
        dailyBuckets[dayKey] = (dailyBuckets[dayKey] || 0) + 1;
      }
    }
  });

  return {
    hourlyDistribution: hourlyBuckets,
    dailyDistribution: dailyBuckets,
    activityTypeDistribution,
    peakActivity: findPeakActivity(dailyBuckets),
    trend: assessActivityTrend(activities),
  };
}

/**
 * Find peak activity period
 */
function findPeakActivity(dailyBuckets: Record<string, number>): string {
  const sortedDays = Object.entries(dailyBuckets).sort(([,a], [,b]) => b - a);
  return sortedDays[0]?.[0] || 'No peak identified';
}

/**
 * Assess activity trend
 */
function assessActivityTrend(activities: any[]): 'increasing' | 'stable' | 'decreasing' {
  const now = new Date();
  const last24h = activities.filter(a => {
    const timestamp = a.timestamp ? new Date(a.timestamp) : null;
    if (!timestamp) return false;
    return (now.getTime() - timestamp.getTime()) < (24 * 60 * 60 * 1000);
  }).length;

  const previous24h = activities.filter(a => {
    const timestamp = a.timestamp ? new Date(a.timestamp) : null;
    if (!timestamp) return false;
    const ageMs = now.getTime() - timestamp.getTime();
    return ageMs >= (24 * 60 * 60 * 1000) && ageMs < (48 * 60 * 60 * 1000);
  }).length;

  if (last24h > previous24h * 1.2) return 'increasing';
  if (last24h < previous24h * 0.8) return 'decreasing';
  return 'stable';
}

/**
 * Calculate activity statistics
 */
function calculateActivityStatistics(activities: any[]) {
  const now = new Date();
  const stats = {
    totalActivities: activities.length,
    activitiesLast24h: 0,
    activitiesLast7d: 0,
    averageActivitiesPerDay: 0,
    mostActiveOrganization: '',
    oldestActivity: null as string | null,
    newestActivity: null as string | null,
  };

  const organizationCounts: Record<string, number> = {};
  const timestamps: Date[] = [];

  activities.forEach(activity => {
    const timestamp = activity.timestamp ? new Date(activity.timestamp) : null;
    const orgName = activity.enhanced?.organization?.name || 'Unknown';
    
    // Count by organization
    organizationCounts[orgName] = (organizationCounts[orgName] || 0) + 1;
    
    if (timestamp) {
      timestamps.push(timestamp);
      const ageMs = now.getTime() - timestamp.getTime();
      
      if (ageMs < (24 * 60 * 60 * 1000)) {
        stats.activitiesLast24h++;
      }
      
      if (ageMs < (7 * 24 * 60 * 60 * 1000)) {
        stats.activitiesLast7d++;
      }
    }
  });

  // Find most active organization
  const sortedOrgs = Object.entries(organizationCounts).sort(([,a], [,b]) => b - a);
  stats.mostActiveOrganization = sortedOrgs[0]?.[0] || 'None';

  // Calculate average activities per day
  if (timestamps.length > 0) {
    timestamps.sort((a, b) => a.getTime() - b.getTime());
    const oldestTimestamp = timestamps[0];
    const newestTimestamp = timestamps[timestamps.length - 1];
    
    stats.oldestActivity = oldestTimestamp.toISOString();
    stats.newestActivity = newestTimestamp.toISOString();
    
    const daySpan = Math.max(1, (newestTimestamp.getTime() - oldestTimestamp.getTime()) / (1000 * 60 * 60 * 24));
    stats.averageActivitiesPerDay = Math.round(activities.length / daySpan * 10) / 10;
  }

  return stats;
}

/**
 * Create error result for failed requests
 */
function createRecentActivityErrorResult(error: unknown, params: any) {
  return {
    success: false,
    error: {
      message: error instanceof Error ? error.message : "Unknown error occurred",
      params,
      timestamp: new Date().toISOString(),
    },
    result: [],
    metadata: {
      activityCount: 0,
      insights: ['Unable to retrieve recent activity data'],
      trends: null,
      statistics: null,
      pagination: {
        offset: params.offset,
        limit: params.limit,
        hasMore: false,
      },
    },
  };
}