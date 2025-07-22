import { tool, type UIMessageStreamWriter } from 'ai';
import { z } from 'zod';
import type { Session } from 'next-auth';
import type { ChatMessage } from '@/lib/types';

const BASE_URL = 'https://www.data.gv.at/katalog/api/3';

interface ActivityToolsProps {
  session: Session;
  dataStream: UIMessageStreamWriter<ChatMessage>;
}

// Helper function to log tool parameters for debugging
const logToolInvocation = (toolName: string, params: any) => {
  console.log(
    `📊 [ACTIVITY TOOL] ${toolName}:`,
    JSON.stringify(params, null, 2),
  );
};

// Return a package's activity stream
export const getPackageActivityList = ({
  session,
  dataStream,
}: ActivityToolsProps) =>
  tool({
    description:
      'Get the activity history for a specific dataset (package). Shows what changes have been made, when, and by whom. Use this to track dataset updates, modifications, and publishing activity.',
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
    execute: async ({ id, offset, limit, include_hidden_activity }) => {
      logToolInvocation('getPackageActivityList', {
        id,
        offset,
        limit,
        include_hidden_activity,
      });

      const params = new URLSearchParams();
      params.append('id', id);
      if (offset !== undefined) params.append('offset', offset.toString());
      if (limit !== undefined) params.append('limit', limit.toString());
      if (include_hidden_activity !== undefined)
        params.append(
          'include_hidden_activity',
          include_hidden_activity.toString(),
        );

      const response = await fetch(
        `${BASE_URL}/action/package_activity_list?${params}`,
      );
      return await response.json();
    },
  });

// Return a group's activity stream
export const getGroupActivityList = ({
  session,
  dataStream,
}: ActivityToolsProps) =>
  tool({
    description:
      'Get the activity history for a specific group. Shows changes and updates to the group and its member datasets.',
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
    execute: async ({ id, offset, limit, include_hidden_activity }) => {
      logToolInvocation('getGroupActivityList', {
        id,
        offset,
        limit,
        include_hidden_activity,
      });

      const params = new URLSearchParams();
      params.append('id', id);
      if (offset !== undefined) params.append('offset', offset.toString());
      if (limit !== undefined) params.append('limit', limit.toString());
      if (include_hidden_activity !== undefined)
        params.append(
          'include_hidden_activity',
          include_hidden_activity.toString(),
        );

      const response = await fetch(
        `${BASE_URL}/action/group_activity_list?${params}`,
      );
      return await response.json();
    },
  });

// Return an organization's activity stream
export const getOrganizationActivityList = ({
  session,
  dataStream,
}: ActivityToolsProps) =>
  tool({
    description: "Return an organization's activity stream",
    inputSchema: z.object({
      id: z.string().describe('the id or name of the organization'),
      offset: z
        .number()
        .optional()
        .describe('where to start getting activity items from (default: 0)'),
      limit: z
        .number()
        .optional()
        .describe(
          'the maximum number of activities to return (default: 31, upper limit: 100)',
        ),
      include_hidden_activity: z
        .boolean()
        .optional()
        .describe(
          'whether to include hidden activity (NB Only sysadmins may set this to true)',
        ),
    }),
    execute: async ({ id, offset, limit, include_hidden_activity }) => {
      logToolInvocation('getOrganizationActivityList', {
        id,
        offset,
        limit,
        include_hidden_activity,
      });

      const params = new URLSearchParams();
      params.append('id', id);
      if (offset !== undefined) params.append('offset', offset.toString());
      if (limit !== undefined) params.append('limit', limit.toString());
      if (include_hidden_activity !== undefined)
        params.append(
          'include_hidden_activity',
          include_hidden_activity.toString(),
        );

      const response = await fetch(
        `${BASE_URL}/action/organization_activity_list?${params}`,
      );
      return await response.json();
    },
  });

// Return the activity stream of all recently added or changed packages
export const getRecentlyChangedPackagesActivityList = ({
  session,
  dataStream,
}: ActivityToolsProps) =>
  tool({
    description:
      'Return the activity stream of all recently added or changed packages',
    inputSchema: z.object({
      offset: z
        .number()
        .optional()
        .describe('where to start getting activity items from (default: 0)'),
      limit: z
        .number()
        .optional()
        .describe(
          'the maximum number of activities to return (default: 31, upper limit: 100)',
        ),
    }),
    execute: async ({ offset, limit }) => {
      logToolInvocation('getRecentlyChangedPackagesActivityList', {
        offset,
        limit,
      });

      const params = new URLSearchParams();
      if (offset !== undefined) params.append('offset', offset.toString());
      if (limit !== undefined) params.append('limit', limit.toString());

      const response = await fetch(
        `${BASE_URL}/action/recently_changed_packages_activity_list?${params}`,
      );
      return await response.json();
    },
  });

// Show details of an item of 'activity'
export const getActivityDetails = ({
  session,
  dataStream,
}: ActivityToolsProps) =>
  tool({
    description:
      'Get detailed information about a specific activity event. Use this to see what exactly changed in a particular activity.',
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
      logToolInvocation('getActivityDetails', { id, include_data });

      const params = new URLSearchParams();
      params.append('id', id);
      params.append('include_data', include_data.toString());

      const response = await fetch(
        `${BASE_URL}/action/activity_show?${params}`,
      );
      return await response.json();
    },
  });

// Show the data from an item of 'activity'
export const getActivityData = ({ session, dataStream }: ActivityToolsProps) =>
  tool({
    description:
      "Show the data from an item of 'activity' (part of the activity stream)",
    inputSchema: z.object({
      id: z.string().describe('the id of the activity'),
      object_type: z
        .enum(['package', 'user', 'group', 'organization'])
        .describe('the type of the activity object'),
    }),
    execute: async ({ id, object_type }) => {
      logToolInvocation('getActivityData', { id, object_type });

      const params = new URLSearchParams();
      params.append('id', id);
      params.append('object_type', object_type);

      const response = await fetch(
        `${BASE_URL}/action/activity_data_show?${params}`,
      );
      return await response.json();
    },
  });

// Returns a diff of the activity, compared to the previous version of the object
export const getActivityDiff = ({ session, dataStream }: ActivityToolsProps) =>
  tool({
    description:
      'Returns a diff of the activity, compared to the previous version of the object',
    inputSchema: z.object({
      id: z.string().describe('the id of the activity'),
      object_type: z
        .enum(['package', 'user', 'group', 'organization'])
        .describe('the type of the activity object'),
      diff_type: z
        .enum(['unified', 'context', 'html'])
        .optional()
        .describe('the type of diff to return'),
    }),
    execute: async ({ id, object_type, diff_type }) => {
      logToolInvocation('getActivityDiff', { id, object_type, diff_type });

      const params = new URLSearchParams();
      params.append('id', id);
      params.append('object_type', object_type);
      if (diff_type !== undefined) params.append('diff_type', diff_type);

      const response = await fetch(
        `${BASE_URL}/action/activity_diff?${params}`,
      );
      return await response.json();
    },
  });
