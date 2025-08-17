import { tool } from "ai";
import { z } from "zod";

interface CsvExplorationResult {
    datasetName: string;
    url: string;
    totalRows: number;
    totalColumns: number;
    columns: Array<{
        name: string;
        type: string;
        sampleValues: string[];
    }>;
    sampleData: {
        headers: string[];
        rows: string[][];
    };
    statistics?: {
        encoding?: string;
        delimiter?: string;
        hasHeader: boolean;
        emptyRows: number;
        duplicateHeaders: string[];
    };
}

/**
 * Enhanced CSV data exploration tool
 * Automatically analyzes CSV structure from Austrian datasets with intelligent type detection
 */
export const exploreCsvData = () =>
    tool({
        description:
            "Automatically explore CSV data structure from Austrian datasets. This tool fetches a CSV file from getResourceDetails URL and returns comprehensive data structure information (columns, types, sample data, statistics) that can be used for code generation. Use this tool before creating analysis code to understand the data structure.",
        inputSchema: z.object({
            url: z
                .string()
                .url("Invalid URL format")
                .describe("The exact CSV URL from getResourceDetails tool output"),
            datasetName: z
                .string()
                .optional()
                .describe("Name of the dataset for context"),
            sampleSize: z
                .number()
                .min(1)
                .max(20)
                .optional()
                .default(5)
                .describe("Number of sample rows to analyze (1-20)"),
            encoding: z
                .string()
                .optional()
                .describe("Text encoding to use (e.g., 'utf-8', 'iso-8859-1')"),
        }),
        execute: async ({ url, datasetName, sampleSize = 5, encoding = 'utf-8' }): Promise<CsvExplorationResult> => {
            try {
                console.log(`📊 Exploring CSV data from: ${url}`);

                // Fetch the CSV data with proper error handling
                const response = await fetch(url, {
                    headers: {
                        'User-Agent': 'IFG-Agentic-Tool/1.0',
                        'Accept': 'text/csv,text/plain,*/*',
                    },
                });

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }

                const csvText = await response.text();

                if (!csvText || csvText.trim().length === 0) {
                    throw new Error("CSV file is empty or could not be read");
                }

                // Analyze CSV structure
                const analysisResult = analyzeCsvStructure(csvText, sampleSize);

                const result: CsvExplorationResult = {
                    datasetName: datasetName || "Austrian Dataset",
                    url,
                    totalRows: analysisResult.totalRows,
                    totalColumns: analysisResult.totalColumns,
                    columns: analysisResult.columns,
                    sampleData: analysisResult.sampleData,
                    statistics: analysisResult.statistics,
                };

                console.log(`✅ CSV exploration complete:`, {
                    rows: result.totalRows,
                    columns: result.totalColumns,
                    dataTypes: result.columns.map(c => c.type).join(', '),
                });

                return result;

            } catch (error) {
                console.error("❌ Error exploring CSV:", error);
                throw new Error(`Failed to explore CSV data: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        },
    });

/**
 * Analyze CSV structure with advanced parsing and type detection
 */
function analyzeCsvStructure(csvText: string, sampleSize: number) {
    // Detect delimiter
    const delimiter = detectDelimiter(csvText);

    // Split into lines and filter empty ones
    const allLines = csvText.split('\n');
    const nonEmptyLines = allLines.filter(line => line.trim());
    const emptyRows = allLines.length - nonEmptyLines.length;

    if (nonEmptyLines.length === 0) {
        throw new Error("CSV contains no data rows");
    }

    // Parse header
    const headerLine = nonEmptyLines[0];
    const headers = parseCsvLine(headerLine, delimiter);

    // Check for duplicate headers
    const duplicateHeaders = findDuplicates(headers);

    // Parse sample data rows
    const dataLines = nonEmptyLines.slice(1, Math.min(1 + sampleSize, nonEmptyLines.length));
    const sampleRows = dataLines.map(line => parseCsvLine(line, delimiter));

    // Ensure all rows have the same number of columns as headers
    const normalizedRows = sampleRows.map(row => {
        while (row.length < headers.length) {
            row.push('');
        }
        return row.slice(0, headers.length);
    });

    // Analyze column types
    const columns = headers.map((header, index) => {
        const columnData = normalizedRows
            .map(row => row[index])
            .filter(value => value != null && value.trim() !== '');

        return {
            name: header,
            type: inferDataType(columnData),
            sampleValues: columnData.slice(0, 3),
        };
    });

    return {
        totalRows: nonEmptyLines.length - 1, // excluding header
        totalColumns: headers.length,
        columns,
        sampleData: {
            headers,
            rows: normalizedRows.slice(0, 3), // Show only first 3 rows
        },
        statistics: {
            delimiter,
            hasHeader: true,
            emptyRows,
            duplicateHeaders,
            encoding: 'utf-8', // Default assumption
        },
    };
}

/**
 * Detect CSV delimiter
 */
function detectDelimiter(csvText: string): string {
    const sample = csvText.split('\n').slice(0, 5).join('\n');
    const delimiters = [',', ';', '\t', '|'];

    let bestDelimiter = ',';
    let maxScore = 0;

    for (const delimiter of delimiters) {
        const lines = sample.split('\n').filter(line => line.trim());
        if (lines.length < 2) continue;

        const counts = lines.map(line => (line.match(new RegExp(`\\${delimiter}`, 'g')) || []).length);
        const avgCount = counts.reduce((sum, count) => sum + count, 0) / counts.length;
        const consistency = 1 - (Math.max(...counts) - Math.min(...counts)) / (Math.max(...counts) || 1);

        const score = avgCount * consistency;

        if (score > maxScore) {
            maxScore = score;
            bestDelimiter = delimiter;
        }
    }

    return bestDelimiter;
}

/**
 * Parse a single CSV line respecting quotes
 */
function parseCsvLine(line: string, delimiter: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    let i = 0;

    while (i < line.length) {
        const char = line[i];

        if (char === '"') {
            if (inQuotes && line[i + 1] === '"') {
                // Escaped quote
                current += '"';
                i += 2;
            } else {
                // Toggle quote state
                inQuotes = !inQuotes;
                i++;
            }
        } else if (char === delimiter && !inQuotes) {
            // End of field
            result.push(current.trim());
            current = '';
            i++;
        } else {
            current += char;
            i++;
        }
    }

    // Add the last field
    result.push(current.trim());

    return result;
}

/**
 * Find duplicate values in array
 */
function findDuplicates(arr: string[]): string[] {
    const counts: Record<string, number> = {};
    arr.forEach(item => {
        counts[item] = (counts[item] || 0) + 1;
    });

    return Object.keys(counts).filter(key => counts[key] > 1);
}

/**
 * Infer data type from sample values with enhanced logic
 */
function inferDataType(values: string[]): string {
    if (values.length === 0) return 'string';

    // Remove empty values for type analysis
    const nonEmptyValues = values.filter(val => val.trim() !== '');
    if (nonEmptyValues.length === 0) return 'string';

    // Check for boolean values
    const booleanValues = nonEmptyValues.filter(val =>
        ['true', 'false', 'yes', 'no', 'ja', 'nein', '1', '0'].includes(val.toLowerCase())
    );
    if (booleanValues.length === nonEmptyValues.length) {
        return 'boolean';
    }

    // Check for dates
    const dateValues = nonEmptyValues.filter(val => {
        const parsed = Date.parse(val);
        return !isNaN(parsed) && val.match(/\d{1,4}[-/.]\d{1,2}[-/.]\d{1,4}/);
    });
    if (dateValues.length >= nonEmptyValues.length * 0.8) {
        return 'date';
    }

    // Check for numbers
    const numberValues = nonEmptyValues.filter(val => {
        const cleaned = val.replace(/[.,\s]/g, '.');
        return !isNaN(Number(cleaned)) && isFinite(Number(cleaned));
    });

    if (numberValues.length >= nonEmptyValues.length * 0.8) {
        // Check if integers or floats
        const hasDecimals = numberValues.some(val =>
            val.includes('.') || val.includes(',')
        );
        return hasDecimals ? 'float' : 'integer';
    }

    // Check for categorical data (limited unique values)
    const uniqueValues = [...new Set(nonEmptyValues)];
    if (uniqueValues.length <= Math.max(10, nonEmptyValues.length * 0.1)) {
        return 'categorical';
    }

    // Default to string
    return 'string';
}