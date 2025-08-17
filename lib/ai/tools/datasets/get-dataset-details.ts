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
 * Get dataset details tool with enhanced metadata processing
 * Retrieves comprehensive information about a specific dataset
 */
export const getDatasetDetails = ({ session, dataStream }: DatasetToolsProps) =>
    tool({
        description:
            "Get complete details of a specific dataset from the Austrian open data portal. Use this when you need full information about a dataset including metadata, resources, tags, and organization details. Requires exact dataset ID or name.",
        inputSchema: z.object({
            id: z
                .string()
                .min(1)
                .describe(
                    'The exact ID or name of the dataset. Examples: "bev-bevoelkerung-zu-jahresbeginn-ab-2002", "statistik-austria-population-data". You can get IDs from search results.'
                ),
            include_tracking: z
                .boolean()
                .optional()
                .default(false)
                .describe(
                    "Whether to include download/usage tracking statistics (usually false for general queries)"
                ),
        }),
        execute: async ({ id, include_tracking = false }) => {
            try {
                console.log(`📊 Getting dataset details for: ${id}`);

                const params = new URLSearchParams();
                params.append("id", id);
                if (include_tracking) {
                    params.append("include_tracking", include_tracking.toString());
                }

                const response = await fetch(`${BASE_URL}/action/package_show?${params}`);

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }

                const data = await response.json();

                if (!data.success) {
                    throw new Error(data.error?.message || "Dataset not found");
                }

                // Enhance the dataset data with processed information
                const enhancedData = enhanceDatasetDetails(data, { id, include_tracking });

                console.log(`✅ Retrieved dataset details:`, {
                    name: enhancedData.result?.name,
                    title: enhancedData.result?.title,
                    resourceCount: enhancedData.result?.resources?.length || 0,
                });

                return {
                    data: enhancedData,
                    content: "A dataset card was created and is now visible to the user.",
                };

            } catch (error) {
                console.error("❌ Error getting dataset details:", error);

                return createDetailErrorResult(error, id);
            }
        },
    });

/**
 * Enhance dataset details with processed metadata
 */
function enhanceDatasetDetails(data: any, params: { id: string; include_tracking: boolean }) {
    const dataset = data.result;

    if (!dataset) {
        return data;
    }

    // Process resources for better usability
    const processedResources = dataset.resources?.map((resource: any) => ({
        ...resource,
        metadata: {
            isDownloadable: isResourceDownloadable(resource),
            fileType: extractFileType(resource),
            sizeHuman: formatFileSize(resource.size),
            lastModifiedHuman: formatDate(resource.last_modified),
        },
    })) || [];

    // Extract key information
    const keyInfo = extractKeyInformation(dataset);

    // Calculate dataset quality metrics
    const qualityMetrics = calculateQualityMetrics(dataset);

    return {
        ...data,
        result: {
            ...dataset,
            resources: processedResources,
        },
        enhanced: {
            keyInfo,
            qualityMetrics,
            summary: generateDatasetSummary(dataset),
            accessibility: assessAccessibility(dataset),
            timestamp: new Date().toISOString(),
            requestParams: params,
        },
    };
}

/**
 * Check if a resource is downloadable
 */
function isResourceDownloadable(resource: any): boolean {
    const url = resource.url;
    if (!url) return false;

    // Check for direct file URLs
    const downloadableExtensions = ['.csv', '.json', '.xml', '.xlsx', '.pdf', '.zip'];
    const hasDownloadableExtension = downloadableExtensions.some(ext =>
        url.toLowerCase().includes(ext)
    );

    // Check for download indicators in URL
    const hasDownloadIndicator = url.includes('download') || url.includes('file');

    return hasDownloadableExtension || hasDownloadIndicator;
}

/**
 * Extract file type from resource
 */
function extractFileType(resource: any): string {
    // Check format field first
    if (resource.format) {
        return resource.format.toUpperCase();
    }

    // Try to extract from URL
    const url = resource.url || '';
    const urlLower = url.toLowerCase();

    if (urlLower.includes('.csv')) return 'CSV';
    if (urlLower.includes('.json')) return 'JSON';
    if (urlLower.includes('.xml')) return 'XML';
    if (urlLower.includes('.xlsx') || urlLower.includes('.xls')) return 'Excel';
    if (urlLower.includes('.pdf')) return 'PDF';
    if (urlLower.includes('.zip')) return 'ZIP';

    return 'Unknown';
}

/**
 * Format file size in human readable format
 */
function formatFileSize(size: any): string {
    if (!size || isNaN(size)) return 'Unknown';

    const bytes = parseInt(size);
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    let unitIndex = 0;
    let fileSize = bytes;

    while (fileSize >= 1024 && unitIndex < units.length - 1) {
        fileSize /= 1024;
        unitIndex++;
    }

    return `${fileSize.toFixed(1)} ${units[unitIndex]}`;
}

/**
 * Format date in human readable format
 */
function formatDate(dateString: any): string {
    if (!dateString) return 'Unknown';

    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('de-AT', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    } catch {
        return 'Invalid date';
    }
}

/**
 * Extract key information from dataset
 */
function extractKeyInformation(dataset: any) {
    return {
        title: dataset.title || dataset.name,
        organization: dataset.organization?.title || dataset.organization?.name,
        lastUpdated: dataset.metadata_modified,
        resourceCount: dataset.resources?.length || 0,
        tags: dataset.tags?.map((tag: any) => tag.name || tag) || [],
        license: dataset.license_title || dataset.license_id,
        maintainer: dataset.maintainer || dataset.author,
        contact: dataset.maintainer_email || dataset.author_email,
    };
}

/**
 * Calculate quality metrics for the dataset
 */
function calculateQualityMetrics(dataset: any) {
    let score = 0;
    const factors: string[] = [];

    // Check for complete metadata
    if (dataset.title && dataset.notes) {
        score += 20;
        factors.push('Has title and description');
    }

    if (dataset.tags && dataset.tags.length > 0) {
        score += 15;
        factors.push('Has tags');
    }

    if (dataset.resources && dataset.resources.length > 0) {
        score += 25;
        factors.push('Has resources');
    }

    if (dataset.license_title || dataset.license_id) {
        score += 15;
        factors.push('Has license information');
    }

    if (dataset.maintainer_email || dataset.author_email) {
        score += 10;
        factors.push('Has contact information');
    }

    if (dataset.metadata_modified) {
        const lastModified = new Date(dataset.metadata_modified);
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

        if (lastModified > oneYearAgo) {
            score += 15;
            factors.push('Recently updated');
        }
    }

    return {
        score: Math.min(score, 100),
        factors,
        grade: score >= 80 ? 'A' : score >= 60 ? 'B' : score >= 40 ? 'C' : 'D',
    };
}

/**
 * Generate a brief summary of the dataset
 */
function generateDatasetSummary(dataset: any): string {
    const title = dataset.title || dataset.name;
    const resourceCount = dataset.resources?.length || 0;
    const organization = dataset.organization?.title || 'Unknown organization';

    return `${title} is a dataset from ${organization} containing ${resourceCount} resource${resourceCount !== 1 ? 's' : ''}.`;
}

/**
 * Assess dataset accessibility
 */
function assessAccessibility(dataset: any) {
    const resources = dataset.resources || [];
    const accessibleResources = resources.filter((r: any) => isResourceDownloadable(r));

    return {
        totalResources: resources.length,
        accessibleResources: accessibleResources.length,
        accessibilityRatio: resources.length > 0 ? accessibleResources.length / resources.length : 0,
        formats: [...new Set(resources.map((r: any) => extractFileType(r)))],
    };
}

/**
 * Create error result for failed requests
 */
function createDetailErrorResult(error: unknown, datasetId: string) {
    return {
        data: {
            success: false,
            error: {
                message: error instanceof Error ? error.message : "Unknown error occurred",
                datasetId,
                timestamp: new Date().toISOString(),
            },
        },
        content: `Failed to retrieve dataset details for "${datasetId}". The dataset may not exist or may be temporarily unavailable.`,
    };
}