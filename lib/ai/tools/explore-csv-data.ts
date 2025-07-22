import { tool } from "ai";
import { z } from "zod";

export const exploreCsvData = () =>
  tool({
    description:
      "Automatically explore CSV data structure from Austrian datasets. This tool fetches a CSV file from getResourceDetails URL and returns the data structure information (columns, types, sample data) that can be used for code generation. Use this tool before creating analysis code to understand the data structure.",
    inputSchema: z.object({
      url: z
        .string()
        .describe("The exact CSV URL from getResourceDetails tool output"),
      datasetName: z
        .string()
        .optional()
        .describe("Name of the dataset for context"),
    }),
    execute: async ({ url, datasetName }) => {
      try {
        console.log("Exploring CSV data from:", url);

        // Fetch the CSV data
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const csvText = await response.text();

        // Parse CSV to get structure information
        const lines = csvText.split("\n").filter((line) => line.trim());
        if (lines.length === 0) {
          throw new Error("CSV file is empty");
        }

        // Get headers (first line)
        const headers = lines[0]
          .split(",")
          .map((h) => h.trim().replace(/"/g, ""));

        // Get sample data (first few rows)
        const sampleRows = lines
          .slice(1, Math.min(6, lines.length))
          .map((line) =>
            line.split(",").map((cell) => cell.trim().replace(/"/g, ""))
          );

        // Analyze data types based on sample data
        const columnInfo = headers.map((header, index) => {
          const sampleValues = sampleRows
            .map((row) => row[index])
            .filter((val) => val && val !== "");

          let inferredType = "string";
          if (sampleValues.length > 0) {
            // Check if all values are numbers
            const allNumbers = sampleValues.every(
              (val) => !Number.isNaN(Number(val)) && val !== ""
            );
            // Check if all values look like dates
            const allDates = sampleValues.every(
              (val) => !Number.isNaN(Date.parse(val))
            );

            if (allNumbers) {
              // Check if integers or floats
              const hasDecimals = sampleValues.some(
                (val) => val.includes(".") || val.includes(",")
              );
              inferredType = hasDecimals ? "float" : "integer";
            } else if (allDates) {
              inferredType = "datetime";
            }
          }

          return {
            name: header,
            type: inferredType,
            sampleValues: sampleValues.slice(0, 3),
          };
        });

        const result = {
          datasetName: datasetName || "Austrian Dataset",
          url,
          totalRows: lines.length - 1, // excluding header
          totalColumns: headers.length,
          columns: columnInfo,
          sampleData: {
            headers,
            rows: sampleRows.slice(0, 3),
          },
        };

        console.log("CSV exploration result:", result);
        return result;
      } catch (error) {
        console.error("Error exploring CSV:", error);
        throw new Error(`Failed to explore CSV data: ${error}`);
      }
    },
  });
