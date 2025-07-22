import { z } from "zod";
import { streamObject } from "ai";
import { myProvider } from "@/lib/ai/providers";
import { codePrompt, updateDocumentPrompt } from "@/lib/ai/prompts";
import { createDocumentHandler } from "@/lib/artifacts/server";

export const codeDocumentHandler = createDocumentHandler<"code">({
  kind: "code",
  onCreateDocument: async ({ title, dataStream, dataUrl, csvStructure }) => {
    console.log("onCreateDocument code", { title, dataUrl, csvStructure });

    let draftContent = "";

    // Enhance the prompt with dataUrl and csvStructure information if provided
    let enhancedPrompt = title;

    if (dataUrl && csvStructure) {
      const columnInfo = csvStructure.columns
        .map(
          (col) => `- ${col.name} (${col.type}): ${col.sampleValues.join(", ")}`
        )
        .join("\n");

      enhancedPrompt = `${title}

IMPORTANT: Use this exact data URL for loading data: ${dataUrl}
Do not invent or guess any URLs. Only use the provided URL above.

CSV STRUCTURE INFORMATION (from automatic exploration):
Dataset: ${csvStructure.datasetName || "Austrian Dataset"}
Rows: ${csvStructure.totalRows}
Columns: ${csvStructure.totalColumns}

Column Details:
${columnInfo}

CRITICAL: Use the exact column names shown above. Do NOT do manual data exploration - the structure is already provided. Focus on the actual analysis task using these known columns.`;
    } else if (dataUrl) {
      enhancedPrompt = `${title}\n\nIMPORTANT: Use this exact data URL for loading data: ${dataUrl}\nDo not invent or guess any URLs. Only use the provided URL above.`;
    }

    const { fullStream } = streamObject({
      model: myProvider.languageModel("artifact-model"),
      system: codePrompt,
      prompt: enhancedPrompt,
      schema: z.object({
        code: z.string(),
      }),
    });

    for await (const delta of fullStream) {
      const { type } = delta;

      if (type === "object") {
        const { object } = delta;
        const { code } = object;

        if (code) {
          dataStream.write({
            type: "data-codeDelta",
            data: code ?? "",
            transient: true,
          });

          draftContent = code;
        }
      }
    }

    return draftContent;
  },
  onUpdateDocument: async ({ document, description, dataStream }) => {
    let draftContent = "";

    const { fullStream } = streamObject({
      model: myProvider.languageModel("artifact-model"),
      system: updateDocumentPrompt(document.content, "code"),
      prompt: description,
      schema: z.object({
        code: z.string(),
      }),
    });

    for await (const delta of fullStream) {
      const { type } = delta;

      if (type === "object") {
        const { object } = delta;
        const { code } = object;

        if (code) {
          dataStream.write({
            type: "data-codeDelta",
            data: code ?? "",
            transient: true,
          });

          draftContent = code;
        }
      }
    }

    return draftContent;
  },
});
