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
 * Enhanced activity details tool
 * Returns detailed information about a specific activity event with comprehensive analysis
 */
export const getActivityDetails = ({
  session,
  dataStream,
}: ActivityToolsProps) =>
  tool({
    description:
      'Get detailed information about a specific activity event. Use this to see what exactly changed in a particular activity with enhanced analysis and change details.',
    inputSchema: z.object({
      id: z
        .string()
        .min(1)
        .describe(
          'The exact ID of the activity event (obtained from activity lists)',
        ),
      include_data: z
        .boolean()
        .describe(
          'Whether to include full object data (recommended: true) or just the object title (false)',
        ),
    }),
    execute: async ({ id, include_data }) => {
      try {
        console.log(`🔍 Getting activity details for: ${id}`);

        const params = new URLSearchParams();
        params.append('id', id);
        params.append('include_data', include_data.toString());

        const response = await fetch(
          `${BASE_URL}/action/activity_show?${params}`,
        );

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error?.message || "Activity details request failed");
        }

        // Enhance activity details with comprehensive analysis
        const enhancedData = enhanceActivityDetails(data, { id, include_data });

        console.log(`✅ Retrieved activity details:`, {
          type: enhancedData.result?.activity_type,
          timestamp: enhancedData.result?.timestamp,
        });

        return enhancedData;

      } catch (error) {
        console.error('❌ Error getting activity details:', error);
        
        return createActivityDetailsErrorResult(error, id);
      }
    },
  });

/**
 * Enhance activity details with comprehensive analysis
 */
function enhanceActivityDetails(data: any, params: any) {
  const activity = data.result;
  
  if (!activity) {
    return data;
  }

  // Analyze the activity in detail
  const analysis = analyzeActivityDetails(activity);
  
  // Extract change information if data is included
  const changes = params.include_data ? extractChangeDetails(activity) : null;
  
  // Generate impact assessment
  const impact = assessDetailedActivityImpact(activity);
  
  // Create recommendations
  const recommendations = generateActivityRecommendations(activity);

  return {
    ...data,
    enhanced: {
      analysis,
      changes,
      impact,
      recommendations,
      summary: generateActivitySummary(activity),
      timeline: generateActivityTimeline(activity),
      timestamp: new Date().toISOString(),
      requestParams: params,
    },
  };
}

/**
 * Analyze activity details comprehensively
 */
function analyzeActivityDetails(activity: any) {
  const timestamp = activity.timestamp ? new Date(activity.timestamp) : null;
  const now = new Date();
  
  return {
    id: activity.id,
    type: activity.activity_type,
    timestamp: timestamp?.toISOString() || null,
    age: timestamp ? formatAge(timestamp, now) : 'Unknown age',
    actor: {
      id: activity.user_id,
      type: activity.user_id ? 'user' : 'system',
    },
    object: {
      id: activity.object_id,
      type: activity.object_type || 'unknown',
    },
    revision: {
      id: activity.revision_id,
      hasRevision: !!activity.revision_id,
    },
    metadata: {
      hasData: !!activity.data,
      dataSize: activity.data ? JSON.stringify(activity.data).length : 0,
      isPublic: activity.public !== false,
    },
    category: categorizeDetailedActivity(activity.activity_type),
    importance: assessDetailedImportance(activity.activity_type),
  };
}

/**
 * Format age from timestamp
 */
function formatAge(timestamp: Date, now: Date): string {
  const diffInSeconds = Math.floor((now.getTime() - timestamp.getTime()) / 1000);
  
  if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`;
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} hours ago`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) return `${diffInDays} days ago`;
  
  const diffInMonths = Math.floor(diffInDays / 30);
  return `${diffInMonths} months ago`;
}

/**
 * Categorize detailed activity
 */
function categorizeDetailedActivity(activityType: string): string {
  const categories: Record<string, string> = {
    'new package': 'Dataset Creation',
    'changed package': 'Dataset Modification',
    'deleted package': 'Dataset Deletion',
    'new resource': 'Resource Creation',
    'changed resource': 'Resource Modification',
    'deleted resource': 'Resource Deletion',
    'new organization': 'Organization Creation',
    'changed organization': 'Organization Modification',
    'new user': 'User Management',
    'changed user': 'User Management',
  };

  return categories[activityType] || 'Other Activity';
}

/**
 * Assess detailed importance
 */
function assessDetailedImportance(activityType: string): 'critical' | 'high' | 'medium' | 'low' {
  const critical = ['deleted package', 'deleted organization'];
  const high = ['new package', 'changed package'];
  const medium = ['new resource', 'changed resource', 'deleted resource', 'changed organization'];
  
  if (critical.includes(activityType)) return 'critical';
  if (high.includes(activityType)) return 'high';
  if (medium.includes(activityType)) return 'medium';
  return 'low';
}

/**
 * Extract change details from activity data
 */
function extractChangeDetails(activity: any) {
  if (!activity.data) {
    return {
      hasChanges: false,
      changeCount: 0,
      changes: [],
      summary: 'No change data available',
    };
  }

  const data = activity.data;
  const changes: any[] = [];
  
  // Extract meaningful changes based on activity type
  if (activity.activity_type.includes('package')) {
    changes.push(...extractPackageChanges(data));
  } else if (activity.activity_type.includes('resource')) {
    changes.push(...extractResourceChanges(data));
  } else if (activity.activity_type.includes('organization')) {
    changes.push(...extractOrganizationChanges(data));
  }

  return {
    hasChanges: changes.length > 0,
    changeCount: changes.length,
    changes,
    summary: generateChangeSummary(changes, activity.activity_type),
  };
}

/**
 * Extract package-specific changes
 */
function extractPackageChanges(data: any): any[] {
  const changes: any[] = [];
  
  // Common package fields to track
  const trackableFields = ['title', 'notes', 'license_id', 'license_title', 'maintainer', 'author'];
  
  trackableFields.forEach(field => {
    if (data[field] !== undefined) {
      changes.push({
        field,
        type: 'field_change',
        newValue: data[field],
        fieldName: formatFieldName(field),
      });
    }
  });

  // Track resource changes
  if (data.resources && Array.isArray(data.resources)) {
    changes.push({
      field: 'resources',
      type: 'resources_update',
      newValue: data.resources.length,
      fieldName: 'Resources',
      details: `${data.resources.length} resources`,
    });
  }

  // Track tag changes
  if (data.tags && Array.isArray(data.tags)) {
    changes.push({
      field: 'tags',
      type: 'tags_update',
      newValue: data.tags.map((tag: any) => tag.name || tag),
      fieldName: 'Tags',
      details: `${data.tags.length} tags`,
    });
  }

  return changes;
}

/**
 * Extract resource-specific changes
 */
function extractResourceChanges(data: any): any[] {
  const changes: any[] = [];
  
  const trackableFields = ['name', 'description', 'url', 'format', 'size'];
  
  trackableFields.forEach(field => {
    if (data[field] !== undefined) {
      changes.push({
        field,
        type: 'field_change',
        newValue: data[field],
        fieldName: formatFieldName(field),
      });
    }
  });

  return changes;
}

/**
 * Extract organization-specific changes
 */
function extractOrganizationChanges(data: any): any[] {
  const changes: any[] = [];
  
  const trackableFields = ['title', 'description', 'image_url', 'name'];
  
  trackableFields.forEach(field => {
    if (data[field] !== undefined) {
      changes.push({
        field,
        type: 'field_change',
        newValue: data[field],
        fieldName: formatFieldName(field),
      });
    }
  });

  return changes;
}

/**
 * Format field name for display
 */
function formatFieldName(field: string): string {
  const fieldNames: Record<string, string> = {
    'title': 'Title',
    'notes': 'Description',
    'license_id': 'License ID',
    'license_title': 'License',
    'maintainer': 'Maintainer',
    'author': 'Author',
    'name': 'Name',
    'description': 'Description',
    'url': 'URL',
    'format': 'Format',
    'size': 'File Size',
    'image_url': 'Image URL',
    'resources': 'Resources',
    'tags': 'Tags',
  };

  return fieldNames[field] || field;
}

/**
 * Generate change summary
 */
function generateChangeSummary(changes: any[], activityType: string): string {
  if (changes.length === 0) {
    return 'No specific changes identified';
  }

  const changeTypes = changes.map(c => c.fieldName).join(', ');
  const verb = activityType.includes('new') ? 'added' : 'updated';
  
  return `${changes.length} field${changes.length !== 1 ? 's' : ''} ${verb}: ${changeTypes}`;
}

/**
 * Assess detailed activity impact
 */
function assessDetailedActivityImpact(activity: any) {
  const type = activity.activity_type;
  
  return {
    userImpact: assessUserImpact(type),
    systemImpact: assessSystemImpact(type),
    dataImpact: assessDataImpact(type),
    visibilityImpact: assessVisibilityImpact(type),
    urgency: assessUrgency(type),
    scope: getImpactScope(type),
    reversibility: assessReversibility(type),
  };
}

/**
 * Assess user impact
 */
function assessUserImpact(type: string): 'high' | 'medium' | 'low' {
  const highImpact = ['new package', 'deleted package'];
  const mediumImpact = ['changed package', 'new resource', 'deleted resource'];
  
  if (highImpact.includes(type)) return 'high';
  if (mediumImpact.includes(type)) return 'medium';
  return 'low';
}

/**
 * Assess system impact
 */
function assessSystemImpact(type: string): 'high' | 'medium' | 'low' {
  const highImpact = ['new organization', 'deleted organization'];
  const mediumImpact = ['changed organization', 'new package', 'deleted package'];
  
  if (highImpact.includes(type)) return 'high';
  if (mediumImpact.includes(type)) return 'medium';
  return 'low';
}

/**
 * Assess data impact
 */
function assessDataImpact(type: string): 'high' | 'medium' | 'low' {
  const highImpact = ['deleted package', 'deleted resource'];
  const mediumImpact = ['changed package', 'changed resource', 'new resource'];
  
  if (highImpact.includes(type)) return 'high';
  if (mediumImpact.includes(type)) return 'medium';
  return 'low';
}

/**
 * Assess visibility impact
 */
function assessVisibilityImpact(type: string): 'high' | 'medium' | 'low' {
  const highImpact = ['new package'];
  const mediumImpact = ['changed package', 'deleted package'];
  
  if (highImpact.includes(type)) return 'high';
  if (mediumImpact.includes(type)) return 'medium';
  return 'low';
}

/**
 * Assess urgency
 */
function assessUrgency(type: string): 'critical' | 'high' | 'medium' | 'low' {
  const critical = ['deleted package'];
  const high = ['deleted resource'];
  const medium = ['changed package', 'new package'];
  
  if (critical.includes(type)) return 'critical';
  if (high.includes(type)) return 'high';
  if (medium.includes(type)) return 'medium';
  return 'low';
}

/**
 * Get impact scope
 */
function getImpactScope(type: string): 'global' | 'organization' | 'dataset' | 'resource' {
  if (type.includes('organization')) return 'organization';
  if (type.includes('package')) return 'dataset';
  if (type.includes('resource')) return 'resource';
  return 'global';
}

/**
 * Assess reversibility
 */
function assessReversibility(type: string): 'irreversible' | 'difficult' | 'easy' {
  const irreversible = ['deleted package', 'deleted organization', 'deleted resource'];
  const difficult = ['new package', 'new organization'];
  
  if (irreversible.includes(type)) return 'irreversible';
  if (difficult.includes(type)) return 'difficult';
  return 'easy';
}

/**
 * Generate activity recommendations
 */
function generateActivityRecommendations(activity: any): string[] {
  const recommendations: string[] = [];
  const type = activity.activity_type;
  const impact = assessDetailedActivityImpact(activity);

  // Type-specific recommendations
  if (type === 'new package') {
    recommendations.push('Monitor download and usage statistics for this new dataset');
    recommendations.push('Consider promoting this dataset to relevant user communities');
  } else if (type === 'changed package') {
    recommendations.push('Check if existing integrations need to be updated');
    recommendations.push('Notify users who have bookmarked or use this dataset');
  } else if (type === 'deleted package') {
    recommendations.push('Archive any related documentation and references');
    recommendations.push('Redirect users to alternative datasets if available');
  }

  // Impact-based recommendations
  if (impact.urgency === 'critical') {
    recommendations.push('Immediate attention required - assess system stability');
  }

  if (impact.reversibility === 'irreversible') {
    recommendations.push('Document this change thoroughly for audit trail');
  }

  if (impact.userImpact === 'high') {
    recommendations.push('Consider user communication about this change');
  }

  return recommendations;
}

/**
 * Generate activity summary
 */
function generateActivitySummary(activity: any): string {
  const type = activity.activity_type;
  const timestamp = activity.timestamp ? new Date(activity.timestamp) : null;
  const timeStr = timestamp ? formatAge(timestamp, new Date()) : 'at unknown time';
  
  const summaries: Record<string, string> = {
    'new package': `New dataset was published ${timeStr}`,
    'changed package': `Dataset was updated ${timeStr}`,
    'deleted package': `Dataset was permanently removed ${timeStr}`,
    'new resource': `New data resource was added ${timeStr}`,
    'changed resource': `Data resource was modified ${timeStr}`,
    'deleted resource': `Data resource was removed ${timeStr}`,
    'new organization': `New organization was created ${timeStr}`,
    'changed organization': `Organization was updated ${timeStr}`,
  };
  
  return summaries[type] || `${type} occurred ${timeStr}`;
}

/**
 * Generate activity timeline
 */
function generateActivityTimeline(activity: any) {
  const timestamp = activity.timestamp ? new Date(activity.timestamp) : null;
  
  return {
    timestamp: timestamp?.toISOString() || null,
    relativeTime: timestamp ? formatAge(timestamp, new Date()) : 'Unknown time',
    epochTime: timestamp?.getTime() || null,
    isRecent: timestamp ? (Date.now() - timestamp.getTime()) < (24 * 60 * 60 * 1000) : false,
    dayOfWeek: timestamp ? timestamp.toLocaleDateString('en', { weekday: 'long' }) : null,
    timeOfDay: timestamp ? timestamp.toLocaleTimeString('en', { 
      hour: '2-digit', 
      minute: '2-digit' 
    }) : null,
  };
}

/**
 * Create error result for failed requests
 */
function createActivityDetailsErrorResult(error: unknown, activityId: string) {
  return {
    success: false,
    error: {
      message: error instanceof Error ? error.message : "Unknown error occurred",
      activityId,
      timestamp: new Date().toISOString(),
    },
    result: null,
    enhanced: null,
  };
}