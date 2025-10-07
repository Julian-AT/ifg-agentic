import { streamObject } from "ai";
import { z } from "zod";
import { codePrompt, updateDocumentPrompt } from "@/lib/ai/prompts";
import { myProvider } from "@/lib/ai/providers";
import { createDocumentHandler } from "@/lib/artifacts/server";

export const codeDocumentHandler = createDocumentHandler<"code">({
  kind: "code",
  onCreateDocument: async ({ title, dataStream, dataUrl, csvStructure }) => {
    let draftContent = "";

    // Build enhanced prompt with data context
    let enhancedPrompt = title;

    if (dataUrl) {
      enhancedPrompt += `\n\nData URL: ${dataUrl}`;
    }

    if (csvStructure) {
      enhancedPrompt += `\n\nCSV Structure:`;
      enhancedPrompt += `\n- Total Rows: ${csvStructure.totalRows}`;
      enhancedPrompt += `\n- Total Columns: ${csvStructure.totalColumns}`;
      enhancedPrompt += `\n- Columns:`;
      csvStructure.columns.forEach(col => {
        enhancedPrompt += `\n  • ${col.name} (${col.type})`;
        if (col.sampleValues?.length > 0) {
          enhancedPrompt += ` - Examples: ${col.sampleValues.slice(0, 2).join(', ')}`;
        }
      });
    }

    console.log('📝 Creating code with context:', {
      hasDataUrl: !!dataUrl,
      hasStructure: !!csvStructure,
      columnCount: csvStructure?.columns?.length
    });

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
