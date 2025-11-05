import { tool, type UIMessageStreamWriter } from "ai";
import { z } from "zod";
import type { Session } from "next-auth";
import type { ChatMessage } from "@/lib/types";

type CsvExplorationResult = {
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
        titleRowSkipped?: boolean;
    };
};

type DatasetToolsProps = {
    session: Session;
    dataStream: UIMessageStreamWriter<ChatMessage>;
};


export const exploreCsvData = ({ session: _session, dataStream: _dataStream }: DatasetToolsProps) =>
    tool({
        description:
            "Analyze CSV file structure before writing code. CRITICAL: Use the access_url[0] from dataset.distributions array as the url parameter. This tool fetches the CSV, detects delimiter, infers column types, and returns sample data. You MUST call this before createDocument to know the exact column names and types. NOTE: This tool automatically detects and skips title rows (e.g., when the actual headers are in row 2). When generating code, account for this - if a title row was detected, skip the first row when reading the CSV.",
        inputSchema: z.object({
            url: z
                .string()
                .url("Invalid URL format")
                .describe("The access_url[0] from the dataset distributions array (e.g., https://www.data.gv.at/katalog/dataset/xyz/resource/abc.csv)"),
            datasetName: z
                .string()
                .optional()
                .describe("Name of the dataset for context (optional)"),
            sampleSize: z
                .number()
                .min(1)
                .max(20)
                .optional()
                .default(5)
                .describe("Number of sample rows to analyze (1-20, default: 5)"),
            encoding: z
                .string()
                .optional()
                .describe("Text encoding to use (e.g., 'utf-8', 'iso-8859-1', default: utf-8)"),
        }),
        execute: async ({ url, datasetName, sampleSize = 5, encoding: _encoding = 'utf-8' }): Promise<CsvExplorationResult> => {
            try {
                const proxiedUrl = `https://corsproxy.io/?${url}`;

                const response = await fetch(proxiedUrl, {
                    headers: {
                        'User-Agent': 'IFG-Agentic-Tool/1.0',
                        'Accept': 'text/csv,text/plain,*/*',
                    },
                });

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}. The CSV file could not be accessed at this URL. DO NOT proceed with data analysis or make up data.`);
                }

                const csvText = await response.text();

                if (!csvText || csvText.trim().length === 0) {
                    throw new Error("CSV file is empty or could not be read. The data source contains no data. DO NOT make up or fabricate data.");
                }

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

                return result;

            } catch (error) {
                throw new Error(`Failed to explore CSV data: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        },
    });

function analyzeCsvStructure(csvText: string, sampleSize: number) {
    const delimiter = detectDelimiter(csvText);

    const allLines = csvText.split('\n');
    const nonEmptyLines = allLines.filter(line => line.trim());
    const emptyRows = allLines.length - nonEmptyLines.length;

    if (nonEmptyLines.length === 0) {
        throw new Error("CSV contains no data rows");
    }

    let headerRowIndex = 0;
    if (nonEmptyLines.length >= 2) {
        const firstRowParsed = parseCsvLine(nonEmptyLines[0], delimiter);
        const secondRowParsed = parseCsvLine(nonEmptyLines[1], delimiter);

        const firstRowNonEmpty = firstRowParsed.filter(v => v.trim() !== '').length;
        const secondRowNonEmpty = secondRowParsed.filter(v => v.trim() !== '').length;

        if (firstRowNonEmpty === 1 || (secondRowNonEmpty > firstRowNonEmpty * 2)) {
            headerRowIndex = 1;
        }
    }

    const headerLine = nonEmptyLines[headerRowIndex];
    const headers = parseCsvLine(headerLine, delimiter);

    const duplicateHeaders = findDuplicates(headers);

    const dataStartIndex = headerRowIndex + 1;
    const dataLines = nonEmptyLines.slice(dataStartIndex, Math.min(dataStartIndex + sampleSize, nonEmptyLines.length));
    const sampleRows = dataLines.map(line => parseCsvLine(line, delimiter));

    const normalizedRows = sampleRows.map(row => {
        while (row.length < headers.length) {
            row.push('');
        }
        return row.slice(0, headers.length);
    });

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
        totalRows: nonEmptyLines.length - headerRowIndex - 1,
        totalColumns: headers.length,
        columns,
        sampleData: {
            headers,
            rows: normalizedRows.slice(0, 3),
        },
        statistics: {
            delimiter,
            hasHeader: true,
            emptyRows,
            duplicateHeaders,
            titleRowSkipped: headerRowIndex === 1,
            encoding: 'utf-8',
        },
    };
}


function detectDelimiter(csvText: string): string {
    const sample = csvText.split('\n').slice(0, 5).join('\n');
    const delimiters = [',', ';', '\t', '|'];

    let bestDelimiter = ',';
    let maxScore = 0;

    for (const delimiter of delimiters) {
        const lines = sample.split('\n').filter(line => line.trim());
        if (lines.length < 2) { continue; }

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

function parseCsvLine(line: string, delimiter: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    let i = 0;

    while (i < line.length) {
        const char = line[i];

        if (char === '"') {
            if (inQuotes && line[i + 1] === '"') {
                current += '"';
                i += 2;
            } else {
                inQuotes = !inQuotes;
                i++;
            }
        } else if (char === delimiter && !inQuotes) {
            result.push(current.trim());
            current = '';
            i++;
        } else {
            current += char;
            i++;
        }
    }

    result.push(current.trim());

    return result;
}

function findDuplicates(arr: string[]): string[] {
    const counts: Record<string, number> = {};
    for (const item of arr) {
        counts[item] = (counts[item] || 0) + 1;
    }

    return Object.keys(counts).filter(key => counts[key] > 1);
}

const DATE_PATTERN_REGEX = /\d{1,4}[-/.]\d{1,2}[-/.]\d{1,4}/;

function inferDataType(values: string[]): string {
    if (values.length === 0) { return 'string'; }

    const nonEmptyValues = values.filter(val => val.trim() !== '');
    if (nonEmptyValues.length === 0) { return 'string'; }

    const booleanValues = nonEmptyValues.filter(val =>
        ['true', 'false', 'yes', 'no', 'ja', 'nein', '1', '0'].includes(val.toLowerCase())
    );
    if (booleanValues.length === nonEmptyValues.length) {
        return 'boolean';
    }

    const dateValues = nonEmptyValues.filter(val => {
        const parsed = Date.parse(val);
        return !Number.isNaN(parsed) && val.match(DATE_PATTERN_REGEX);
    });
    if (dateValues.length >= nonEmptyValues.length * 0.8) {
        return 'date';
    }

    const numberValues = nonEmptyValues.filter(val => {
        const cleaned = val.replace(/[.,\s]/g, '.');
        return !Number.isNaN(Number(cleaned)) && Number.isFinite(Number(cleaned));
    });

    if (numberValues.length >= nonEmptyValues.length * 0.8) {
        const hasDecimals = numberValues.some(val =>
            val.includes('.') || val.includes(',')
        );
        return hasDecimals ? 'float' : 'integer';
    }

    const uniqueValues = [...new Set(nonEmptyValues)];
    if (uniqueValues.length <= Math.max(10, nonEmptyValues.length * 0.1)) {
        return 'categorical';
    }

    return 'string';
}