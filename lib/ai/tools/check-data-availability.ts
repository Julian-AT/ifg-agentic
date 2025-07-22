import { tool } from "ai";
import { z } from "zod";

export const checkDataAvailability = () =>
  tool({
    description:
      "Check if a dataset URL is available for programmatic access. Use this tool before attempting to load data to verify accessibility and get helpful error information if the dataset is not available.",
    inputSchema: z.object({
      url: z.string().describe("The URL to check for data availability"),
      datasetName: z.string().describe("Name of the dataset for reference"),
    }),
    execute: async ({ url, datasetName }) => {
      try {
        console.log(`🔍 Checking data availability for: ${datasetName}`);
        console.log(`📡 URL: ${url}`);

        // Use fetch to check if the URL is accessible
        const response = await fetch(url, {
          method: "HEAD", // Use HEAD to avoid downloading the full content
          mode: "cors", // Enable CORS
        });

        const isAvailable = response.ok;
        const status = response.status;
        const contentType = response.headers.get("content-type");

        let message = "";
        let reason = "";
        let suggestion = "";

        if (isAvailable) {
          message = `✅ Dataset "${datasetName}" is available for programmatic access`;
          suggestion = "You can proceed with data analysis using this URL";
        } else {
          message = `❌ Dataset "${datasetName}" is not available for programmatic access`;

          switch (status) {
            case 404:
              reason = "Dataset not found (404)";
              suggestion =
                "The URL may be incorrect or the dataset may have been moved";
              break;
            case 403:
              reason = "Access forbidden (403)";
              suggestion =
                "The dataset requires authentication or is not publicly accessible";
              break;
            case 500:
            case 502:
            case 503:
              reason = `Server error (${status})`;
              suggestion =
                "The server may be temporarily unavailable, try again later";
              break;
            default:
              reason = `HTTP error (${status})`;
              suggestion =
                "The dataset may be temporarily unavailable or require different access methods";
          }
        }

        return {
          available: isAvailable,
          datasetName,
          url,
          status,
          contentType,
          message,
          reason,
          suggestion,
        };
      } catch (error) {
        console.error("Error checking data availability:", error);

        return {
          available: false,
          datasetName,
          url,
          status: null,
          contentType: null,
          message: `❌ Unable to check availability for "${datasetName}"`,
          reason: "Network error or CORS restriction",
          suggestion:
            "The dataset may not be accessible due to CORS policies or network restrictions",
        };
      }
    },
  });
