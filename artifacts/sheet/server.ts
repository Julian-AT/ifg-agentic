import { streamObject } from "ai";
import { z } from "zod";
import { sheetPrompt, updateDocumentPrompt } from "@/lib/ai/prompts";
import { myProvider } from "@/lib/ai/providers";
import { createDocumentHandler } from "@/lib/artifacts/server";

export const sheetDocumentHandler = createDocumentHandler<"sheet">({
  kind: "sheet",
  onCreateDocument: async ({ title, dataStream, dataUrl, csvStructure }) => {
    let draftContent = "";

    // Build enhanced prompt with data context
    let enhancedPrompt = title;

    if (dataUrl) {
      enhancedPrompt += `\n\nData URL: ${dataUrl}`;
    }

    if (csvStructure) {
      enhancedPrompt += "\n\nCSV Structure:";
      enhancedPrompt += `\n- Total Rows: ${csvStructure.totalRows}`;
      enhancedPrompt += `\n- Total Columns: ${csvStructure.totalColumns}`;

      if (csvStructure.statistics) {
        enhancedPrompt += `\n- Delimiter: "${csvStructure.statistics.delimiter || ','}"`;
        enhancedPrompt += `\n- Title Row Skipped: ${csvStructure.statistics.titleRowSkipped ? 'YES - Use skiprows=1 in pd.read_csv()' : 'NO'}`;
        if (csvStructure.statistics.titleRowSkipped) {
          enhancedPrompt += "\n  ⚠️ CRITICAL: Add skiprows=1 parameter to pd.read_csv() because a title row was detected";
        }
      }

      enhancedPrompt += "\n- Columns:";
      csvStructure.columns.forEach(col => {
        enhancedPrompt += `\n  • ${col.name} (${col.type})`;
        if (col.sampleValues?.length > 0) {
          enhancedPrompt += ` - Examples: ${col.sampleValues.slice(0, 2).join(', ')}`;
        }
      });
    }

    const { fullStream } = streamObject({
      model: myProvider.languageModel("openai/gpt-5"),
      system: sheetPrompt,
      prompt: enhancedPrompt,
      schema: z.object({
        csv: z.string().describe("CSV data"),
      }),
    });

    for await (const delta of fullStream) {
      const { type } = delta;

      if (type === "object") {
        const { object } = delta;
        const { csv } = object;

        if (csv) {
          dataStream.write({
            type: "data-sheetDelta",
            data: csv,
            transient: true,
          });

          draftContent = csv;
        }
      }
    }

    dataStream.write({
      type: "data-sheetDelta",
      data: draftContent,
      transient: true,
    });

    return draftContent;
  },
  onUpdateDocument: async ({ document, description, dataStream }) => {
    let draftContent = "";

    const { fullStream } = streamObject({
      model: myProvider.languageModel("openai/gpt-5"),
      system: updateDocumentPrompt(document.content, "sheet"),
      prompt: description,
      schema: z.object({
        csv: z.string(),
      }),
    });

    for await (const delta of fullStream) {
      const { type } = delta;

      if (type === "object") {
        const { object } = delta;
        const { csv } = object;

        if (csv) {
          dataStream.write({
            type: "data-sheetDelta",
            data: csv,
            transient: true,
          });

          draftContent = csv;
        }
      }
    }

    return draftContent;
  },
});
