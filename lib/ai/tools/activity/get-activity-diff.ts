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
 * Enhanced activity diff tool
 * Returns diff of the activity compared to the previous version with enhanced analysis
 */
export const getActivityDiff = ({ session, dataStream }: ActivityToolsProps) =>
  tool({
    description:
      'Returns a diff of the activity, compared to the previous version of the object with enhanced change analysis and insights.',
    inputSchema: z.object({
      id: z
        .string()
        .min(1)
        .describe('The ID of the activity'),
      object_type: z
        .enum(['package', 'user', 'group', 'organization'])
        .describe('The type of the activity object'),
      diff_type: z
        .enum(['unified', 'context', 'html'])
        .optional()
        .describe('The type of diff to return (default: unified)'),
    }),
    execute: async ({ id, object_type, diff_type = 'unified' }) => {
      try {
        console.log(`📊 Getting activity diff for: ${id} (${object_type})`);

        const params = new URLSearchParams();
        params.append('id', id);
        params.append('object_type', object_type);
        params.append('diff_type', diff_type);

        const response = await fetch(
          `${BASE_URL}/action/activity_diff?${params}`,
        );

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error?.message || "Activity diff request failed");
        }

        // Enhance activity diff with analysis
        const enhancedData = enhanceActivityDiff(data, { id, object_type, diff_type });

        console.log(`✅ Retrieved activity diff for ${object_type} ${id}`);

        return enhancedData;

      } catch (error) {
        console.error('❌ Error getting activity diff:', error);

        return createActivityDiffErrorResult(error, { id, object_type, diff_type });
      }
    },
  });

/**
 * Enhance activity diff with comprehensive analysis
 */
function enhanceActivityDiff(data: any, params: any) {
  const diff = data.result;

  if (!diff) {
    return {
      ...data,
      enhanced: {
        analysis: null,
        summary: 'No diff data available',
        timestamp: new Date().toISOString(),
      },
    };
  }

  // Analyze the diff content
  const analysis = analyzeDiffContent(diff, params.object_type);

  // Generate change summary
  const summary = generateDiffSummary(analysis, params.object_type);

  // Extract insights from changes
  const insights = extractDiffInsights(analysis, params.object_type);

  // Assess change impact
  const impact = assessChangeImpact(analysis, params.object_type);

  return {
    ...data,
    enhanced: {
      analysis,
      summary,
      insights,
      impact,
      metadata: {
        objectType: params.object_type,
        activityId: params.id,
        diffType: params.diff_type,
        hasDiff: !!diff,
        diffSize: typeof diff === 'string' ? diff.length : JSON.stringify(diff).length,
      },
      timestamp: new Date().toISOString(),
      requestParams: params,
    },
  };
}

/**
 * Analyze diff content
 */
function analyzeDiffContent(diff: any, objectType: string) {
  if (typeof diff === 'string') {
    return analyzePlainTextDiff(diff, objectType);
  } else {
    return analyzeStructuredDiff(diff, objectType);
  }
}

/**
 * Analyze plain text diff
 */
function analyzePlainTextDiff(diffText: string, objectType: string) {
  const lines = diffText.split('\n');
  const additions: string[] = [];
  const deletions: string[] = [];
  const modifications: string[] = [];

  let additionCount = 0;
  let deletionCount = 0;

  lines.forEach(line => {
    if (line.startsWith('+') && !line.startsWith('+++')) {
      additions.push(line.substring(1).trim());
      additionCount++;
    } else if (line.startsWith('-') && !line.startsWith('---')) {
      deletions.push(line.substring(1).trim());
      deletionCount++;
    }
  });

  // Detect modifications (paired additions and deletions)
  const modificationPairs = Math.min(additionCount, deletionCount);
  const netAdditions = additionCount - modificationPairs;
  const netDeletions = deletionCount - modificationPairs;

  return {
    type: 'plaintext',
    totalLines: lines.length,
    changes: {
      additions: netAdditions,
      deletions: netDeletions,
      modifications: modificationPairs,
    },
    changedContent: {
      additions: additions.slice(0, 5), // Limit to first 5 for display
      deletions: deletions.slice(0, 5),
    },
    complexity: assessDiffComplexity(additionCount + deletionCount),
    significantChanges: extractSignificantChanges(lines, objectType),
  };
}

/**
 * Analyze structured diff
 */
function analyzeStructuredDiff(diff: any, objectType: string) {
  const changes = {
    additions: 0,
    deletions: 0,
    modifications: 0,
  };

  // This would depend on the actual structure of the diff object
  // For now, provide a basic analysis
  return {
    type: 'structured',
    changes,
    complexity: 'unknown',
    significantChanges: [],
  };
}

/**
 * Assess diff complexity
 */
function assessDiffComplexity(totalChanges: number): 'low' | 'medium' | 'high' {
  if (totalChanges <= 5) return 'low';
  if (totalChanges <= 20) return 'medium';
  return 'high';
}

/**
 * Extract significant changes based on object type
 */
function extractSignificantChanges(lines: string[], objectType: string): string[] {
  const significantChanges: string[] = [];

  // Define significant fields by object type
  const significantFields: Record<string, string[]> = {
    'package': ['title', 'notes', 'license', 'resources', 'tags', 'private'],
    'organization': ['title', 'description', 'image_url', 'state'],
    'group': ['title', 'description', 'image_url'],
    'user': ['display_name', 'about', 'state'],
  };

  const fieldsToCheck = significantFields[objectType] || [];

  lines.forEach(line => {
    fieldsToCheck.forEach(field => {
      if (line.toLowerCase().includes(field.toLowerCase()) &&
        (line.startsWith('+') || line.startsWith('-'))) {
        significantChanges.push(`${field} was modified`);
      }
    });
  });

  return [...new Set(significantChanges)]; // Remove duplicates
}

/**
 * Generate diff summary
 */
function generateDiffSummary(analysis: any, objectType: string): string {
  if (!analysis || analysis.changes.additions === 0 && analysis.changes.deletions === 0 && analysis.changes.modifications === 0) {
    return 'No changes detected in this activity';
  }

  const { additions, deletions, modifications } = analysis.changes;
  const parts: string[] = [];

  if (additions > 0) {
    parts.push(`${additions} addition${additions !== 1 ? 's' : ''}`);
  }

  if (deletions > 0) {
    parts.push(`${deletions} deletion${deletions !== 1 ? 's' : ''}`);
  }

  if (modifications > 0) {
    parts.push(`${modifications} modification${modifications !== 1 ? 's' : ''}`);
  }

  const changesSummary = parts.join(', ');
  const complexity = analysis.complexity;

  return `${changesSummary} (${complexity} complexity) in this ${objectType}`;
}

/**
 * Extract insights from diff analysis
 */
function extractDiffInsights(analysis: any, objectType: string): string[] {
  const insights: string[] = [];

  if (!analysis) {
    insights.push('No diff analysis available');
    return insights;
  }

  const { changes, complexity, significantChanges } = analysis;
  const totalChanges = changes.additions + changes.deletions + changes.modifications;

  // Complexity insights
  if (complexity === 'high') {
    insights.push('Extensive changes made - requires careful review');
  } else if (complexity === 'low') {
    insights.push('Minor changes made - low risk update');
  }

  // Change type insights
  if (changes.additions > changes.deletions) {
    insights.push('Primarily additive changes - expanding content');
  } else if (changes.deletions > changes.additions) {
    insights.push('Primarily subtractive changes - removing content');
  } else if (changes.modifications > 0) {
    insights.push('Modification-focused changes - updating existing content');
  }

  // Object-specific insights
  switch (objectType) {
    case 'package':
      if (significantChanges.some((c: string) => c.includes('resources'))) {
        insights.push('Dataset resources were modified - may affect data accessibility');
      }
      if (significantChanges.some((c: string) => c.includes('license'))) {
        insights.push('License information changed - review usage implications');
      }
      if (significantChanges.some((c: string) => c.includes('private'))) {
        insights.push('Privacy settings changed - affects public visibility');
      }
      break;

    case 'organization':
      if (significantChanges.some((c: string) => c.includes('state'))) {
        insights.push('Organization state changed - may affect dataset availability');
      }
      break;

    case 'user':
      if (significantChanges.some((c: string) => c.includes('state'))) {
        insights.push('User state changed - may affect their contributions');
      }
      break;
  }

  // Volume insights
  if (totalChanges > 50) {
    insights.push('Large-scale changes - consider impact on dependent systems');
  }

  return insights;
}

/**
 * Assess change impact
 */
function assessChangeImpact(analysis: any, objectType: string) {
  if (!analysis) {
    return {
      overall: 'unknown',
      userFacing: false,
      breaking: false,
      dataAffecting: false,
      scope: 'unknown',
    };
  }

  const { changes, complexity, significantChanges } = analysis;
  const totalChanges = changes.additions + changes.deletions + changes.modifications;

  // Assess overall impact
  let overall: 'low' | 'medium' | 'high' = 'low';
  if (complexity === 'high' || totalChanges > 20) {
    overall = 'high';
  } else if (complexity === 'medium' || totalChanges > 5) {
    overall = 'medium';
  }

  // Assess user-facing impact
  const userFacingFields = ['title', 'description', 'notes', 'image_url'];
  const userFacing = significantChanges.some((change: string) =>
    userFacingFields.some(field => change.toLowerCase().includes(field))
  );

  // Assess breaking changes
  const breakingFields = ['private', 'state', 'license'];
  const breaking = significantChanges.some((change: string) =>
    breakingFields.some(field => change.toLowerCase().includes(field))
  );

  // Assess data-affecting changes
  const dataFields = ['resources', 'url', 'format'];
  const dataAffecting = significantChanges.some((change: string) =>
    dataFields.some(field => change.toLowerCase().includes(field))
  );

  // Determine scope
  let scope: 'local' | 'organizational' | 'system' = 'local';
  if (objectType === 'organization' && breaking) {
    scope = 'organizational';
  } else if (overall === 'high' && userFacing) {
    scope = 'system';
  }

  return {
    overall,
    userFacing,
    breaking,
    dataAffecting,
    scope,
  };
}

/**
 * Create error result for failed requests
 */
function createActivityDiffErrorResult(error: unknown, params: any) {
  return {
    success: false,
    error: {
      message: error instanceof Error ? error.message : "Unknown error occurred",
      activityId: params.id,
      objectType: params.object_type,
      diffType: params.diff_type,
      timestamp: new Date().toISOString(),
    },
    result: null,
    enhanced: {
      analysis: null,
      summary: 'Unable to retrieve activity diff',
      insights: ['Diff data unavailable'],
      impact: {
        overall: 'unknown',
        userFacing: false,
        breaking: false,
        dataAffecting: false,
        scope: 'unknown',
      },
      metadata: {
        objectType: params.object_type,
        activityId: params.id,
        diffType: params.diff_type,
        hasDiff: false,
        diffSize: 0,
      },
    },
  };
}