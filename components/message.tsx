"use client";
import cx from "classnames";
import { memo, useState, lazy, Suspense } from "react";
import type { Vote } from "@/lib/db/schema";
import { PencilEditIcon } from "./icons/core-icons";
import { Markdown } from "./markdown";
import { MessageActions } from "./message-actions";
import { PreviewAttachment } from "./preview-attachment";
import equal from "fast-deep-equal";
import { cn, sanitizeText } from "@/lib/utils";
import { Button } from "./ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { MessageEditor } from "./message-editor";
import type { UseChatHelpers } from "@ai-sdk/react";
import type { ChatMessage } from "@/lib/types";
import { useDataStream } from "./data-stream-provider";
import { DocumentToolCall, DocumentToolResult } from "./document";

// Lazy load heavy components
const AnimatePresence = lazy(() => import("framer-motion").then(m => ({ default: m.AnimatePresence })));
const motion = lazy(() => import("framer-motion").then(m => ({ default: m.motion })));
const MessageReasoning = lazy(() => import("./message-reasoning").then(m => ({ default: m.MessageReasoning })));
import { DocumentPreview } from "./document-preview";

import Image from "next/image";
import { FileText, Download } from "lucide-react";
import { ResourceDetailsSkeleton } from "./dataset-skeletons";
import { ResourceDetailsWidget } from "./resource-details-widget";
import { ToolAccordion } from "./tool-accordion";
import { MergedDatasetSearch } from "./merged-dataset-search";
import { MergedDatasetDetails } from "./merged-dataset-details";
import { AnimatedShinyText } from "./magicui/animated-shiny-text";

// Helper function to find matching output part for an input part
const findMatchingOutputPart = (
  inputPart: any,
  allParts: any[],
  inputIndex: number
): any | null => {
  // Look for the next part with same tool type and toolCallId but output-available state
  for (let i = inputIndex + 1; i < allParts.length; i++) {
    const part = allParts[i];
    if (
      part.type === inputPart.type &&
      part.toolCallId === inputPart.toolCallId &&
      part.state === "output-available"
    ) {
      return part;
    }
  }
  return null;
};

// Helper function to check if this part is an output that should be skipped (already handled by input)
const shouldSkipOutputPart = (
  currentPart: any,
  allParts: any[],
  currentIndex: number
): boolean => {
  if (currentPart.state !== "output-available") return false;

  // Look for previous input part with same tool type and toolCallId
  for (let i = currentIndex - 1; i >= 0; i--) {
    const part = allParts[i];
    if (
      part.type === currentPart.type &&
      part.toolCallId === currentPart.toolCallId &&
      part.state === "input-available"
    ) {
      return true; // Skip this output, it was already handled by the input
    }
  }
  return false;
};

// Helper function to find consecutive searchDatasets calls and group them
const findConsecutiveSearchDatasets = (
  allParts: any[],
  startIndex: number
): { searchParts: any[]; endIndex: number } => {
  const searchParts: any[] = [];
  let currentIndex = startIndex;

  // Start with the current part if it's a searchDatasets
  if (allParts[currentIndex]?.type === "tool-searchDatasets") {
    searchParts.push(allParts[currentIndex]);

    // Look for consecutive searchDatasets parts
    for (let i = currentIndex + 1; i < allParts.length; i++) {
      const part = allParts[i];

      // Stop if we hit a non-searchDatasets tool or a text part
      if (part.type !== "tool-searchDatasets") {
        break;
      }

      searchParts.push(part);
      currentIndex = i;
    }
  }

  return { searchParts, endIndex: currentIndex };
};

// Helper function to group search parts into complete searches (input + output pairs)
const groupSearchParts = (searchParts: any[]): any[] => {
  const groupedSearches: any[] = [];

  for (const part of searchParts) {
    if (
      ("state" in part && part.state === "input-available") ||
      part.state === "output-available"
    ) {
      // Find matching output
      const matchingOutput = searchParts.find(
        (p) =>
          p.type === part.type &&
          p.toolCallId === part.toolCallId &&
          "state" in p &&
          p.state === "output-available"
      );

      groupedSearches.push({
        toolCallId: part.toolCallId,
        input: part.input,
        output: matchingOutput?.output,
      });
    }
  }

  return groupedSearches;
};

// Helper function to group dataset details parts
const groupDatasetDetailsParts = (datasetParts: any[]): any[] => {
  const groupedDatasets: any[] = [];

  for (const part of datasetParts) {
    if (
      ("state" in part && part.state === "input-available") ||
      part.state === "output-available"
    ) {
      // Find matching output
      const matchingOutput = datasetParts.find(
        (p) =>
          p.type === part.type &&
          p.toolCallId === part.toolCallId &&
          "state" in p &&
          p.state === "output-available"
      );

      if (matchingOutput?.output?.data?.result) {
        groupedDatasets.push({
          toolCallId: part.toolCallId,
          datasetId: part.input?.id || "unknown",
          result: matchingOutput.output.data.result,
        });
      }
    }
  }

  return groupedDatasets;
};

const PurePreviewMessage = ({
  chatId,
  message,
  vote,
  isLoading,
  setMessages,
  regenerate,
  isReadonly,
  requiresScrollPadding,
}: {
  chatId: string;
  message: ChatMessage;
  vote: Vote | undefined;
  isLoading: boolean;
  setMessages: UseChatHelpers<ChatMessage>["setMessages"];
  regenerate: UseChatHelpers<ChatMessage>["regenerate"];
  isReadonly: boolean;
  requiresScrollPadding: boolean;
}) => {
  const [mode, setMode] = useState<"view" | "edit">("view");

  const attachmentsFromMessage = message.parts.filter(
    (part) => part.type === "file"
  );

  useDataStream();

  return (
    <AnimatePresence>
      <motion.div
        data-testid={`message-${message.role}`}
        className="w-full mx-auto max-w-3xl px-4 group/message"
        initial={{ y: 5, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        data-role={message.role}
      >
        <div
          className={cn(
            "flex gap-4 w-full group-data-[role=user]/message:ml-auto group-data-[role=user]/message:max-w-2xl",
            {
              "w-full": mode === "edit",
              "group-data-[role=user]/message:w-fit": mode !== "edit",
            }
          )}
        >
          {message.role === "assistant" && (
            <div className="size-9 flex items-center rounded-full justify-center ring-1 shrink-0 ring-border bg-background">
              <div className="translate-y-px">
                <Image
                  src="/assets/logo_datagvat.png"
                  alt="Logo"
                  className="w-9 h-9 p-1.5 bg-card/60	rounded-full"
                  width={32}
                  height={32}
                />
              </div>
            </div>
          )}

          <div
            className={cn("flex flex-col gap-4 max-w-2xl", {
              "min-h-96": message.role === "assistant" && requiresScrollPadding,
            })}
          >
            {attachmentsFromMessage.length > 0 && (
              <div
                data-testid={`message-attachments`}
                className="flex flex-row justify-end gap-2"
              >
                {attachmentsFromMessage.map((attachment) => (
                  <PreviewAttachment
                    key={attachment.url}
                    attachment={{
                      name: attachment.filename ?? "file",
                      contentType: attachment.mediaType,
                      url: attachment.url,
                    }}
                  />
                ))}
              </div>
            )}

            {message.parts?.map((part, index, allParts) => {
              const { type } = part;
              const key = `message-${message.id}-part-${index}`;

              if (shouldSkipOutputPart(part, message.parts || [], index)) {
                return null;
              }

              if (type === "tool-searchDatasets") {
                const firstSearchIndex = allParts.findIndex(
                  (p) => p.type === "tool-searchDatasets"
                );

                if (index === firstSearchIndex) {
                  const allSearchParts = allParts.filter(
                    (p) => p.type === "tool-searchDatasets"
                  );

                  const groupedSearches = groupSearchParts(allSearchParts);

                  const hasAnyOutput = groupedSearches.some(
                    (search) => search.output
                  );

                  return (
                    <MergedDatasetSearch
                      key={`merged-all-searches-${groupedSearches
                        .map((s) => s.toolCallId)
                        .join("-")}`}
                      searches={groupedSearches}
                      isLoading={!hasAnyOutput}
                    />
                  );
                } else {
                  // Skip all other searchDatasets parts since they're handled above
                  return null;
                }
              }

              if (type === "reasoning" && part.text?.trim().length > 0) {
                return (
                  <MessageReasoning
                    key={key}
                    isLoading={isLoading}
                    reasoning={part.text}
                  />
                );
              }

              if (type === "text") {
                if (mode === "view") {
                  return (
                    <div key={key} className="flex flex-row gap-2 items-start">
                      {message.role === "user" && !isReadonly && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              data-testid="message-edit-button"
                              variant="ghost"
                              className="px-2 h-fit rounded-full text-muted-foreground opacity-0 group-hover/message:opacity-100"
                              onClick={() => {
                                setMode("edit");
                              }}
                            >
                              <PencilEditIcon />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Edit message</TooltipContent>
                        </Tooltip>
                      )}

                      <div
                        data-testid="message-content"
                        className={cn("flex flex-col gap-4", {
                          "bg-card/60 border border-border text-secondary-foreground px-3 py-2 rounded-xl":
                            message.role === "user",
                        })}
                      >
                        <Markdown>{sanitizeText(part.text)}</Markdown>
                      </div>
                    </div>
                  );
                }

                if (mode === "edit") {
                  return (
                    <div key={key} className="flex flex-row gap-2 items-start">
                      <div className="size-8" />

                      <MessageEditor
                        key={message.id}
                        message={message}
                        setMode={setMode}
                        setMessages={setMessages}
                        regenerate={regenerate}
                      />
                    </div>
                  );
                }
              }

              if (type === "tool-createDocument") {
                const { toolCallId, state } = part;

                console.log("createDocument", part);

                if (state === "input-available") {
                  const { input } = part;
                  const outputPart = findMatchingOutputPart(
                    part,
                    message.parts || [],
                    index
                  );

                  if (outputPart && "error" in outputPart.output) {
                    return (
                      <div
                        key={toolCallId}
                        className="text-red-500 p-2 border rounded"
                      >
                        Error: {String(outputPart.output.error)}
                      </div>
                    );
                  }

                  if (!outputPart) {
                    return (
                      <motion.div
                        key={toolCallId}
                        className="flex flex-col gap-3"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                      >
                        <AnimatedShinyText className="flex flex-row gap-2 items-center">
                          <FileText className="w-4 h-4" />
                          Erstelle Dokument...
                        </AnimatedShinyText>
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.2, duration: 0.3 }}
                        >
                          <DocumentPreview
                            isReadonly={isReadonly}
                            args={input}
                          />
                        </motion.div>
                      </motion.div>
                    );
                  }

                  return (
                    <ToolAccordion
                      key={toolCallId}
                      icon={<FileText className="w-4 h-4" />}
                      loadingText="Erstelle Dokument..."
                      completedText="Dokument erstellt"
                      isLoading={false}
                      toolCallId={toolCallId}
                    >
                      <DocumentPreview
                        isReadonly={isReadonly}
                        result={outputPart.output}
                      />
                    </ToolAccordion>
                  );
                }

                if (state === "output-available") {
                  // This case is for standalone output parts (without matching input)
                  const { output } = part;

                  if ("error" in output) {
                    return (
                      <div
                        key={toolCallId}
                        className="text-red-500 p-2 border rounded"
                      >
                        Error: {String(output.error)}
                      </div>
                    );
                  }

                  return (
                    <ToolAccordion
                      key={toolCallId}
                      icon={<FileText className="w-4 h-4" />}
                      loadingText="Erstelle Dokument..."
                      completedText="Dokument erstellt"
                      isLoading={false}
                      toolCallId={toolCallId}
                    >
                      <DocumentPreview
                        isReadonly={isReadonly}
                        result={output}
                      />
                    </ToolAccordion>
                  );
                }
              }

              if (type === "tool-updateDocument") {
                const { toolCallId, state } = part;

                if (state === "input-available") {
                  const { input } = part;
                  const outputPart = findMatchingOutputPart(
                    part,
                    message.parts || [],
                    index
                  );

                  if (outputPart && "error" in outputPart.output) {
                    return (
                      <div
                        key={toolCallId}
                        className="text-red-500 p-2 border rounded"
                      >
                        Error: {String(outputPart.output.error)}
                      </div>
                    );
                  }

                  if (!outputPart) {
                    return (
                      <motion.div
                        key={toolCallId}
                        className="flex flex-col gap-3"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                      >
                        <AnimatedShinyText className="flex flex-row gap-2 items-center">
                          <FileText className="w-4 h-4" />
                          Aktualisiere Dokument...
                        </AnimatedShinyText>
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.2, duration: 0.3 }}
                        >
                          <DocumentToolCall
                            type="update"
                            args={input}
                            isReadonly={isReadonly}
                          />
                        </motion.div>
                      </motion.div>
                    );
                  }

                  return (
                    <ToolAccordion
                      key={toolCallId}
                      icon={<FileText className="w-4 h-4" />}
                      loadingText="Aktualisiere Dokument..."
                      completedText="Dokument aktualisiert"
                      isLoading={false}
                      toolCallId={toolCallId}
                    >
                      <DocumentToolResult
                        type="update"
                        result={outputPart.output}
                        isReadonly={isReadonly}
                      />
                    </ToolAccordion>
                  );
                }

                if (state === "output-available") {
                  // This case is for standalone output parts (without matching input)
                  const { output } = part;

                  if ("error" in output) {
                    return (
                      <div
                        key={toolCallId}
                        className="text-red-500 p-2 border rounded"
                      >
                        Error: {String(output.error)}
                      </div>
                    );
                  }

                  return (
                    <ToolAccordion
                      key={toolCallId}
                      icon={<FileText className="w-4 h-4" />}
                      loadingText="Aktualisiere Dokument..."
                      completedText="Dokument aktualisiert"
                      isLoading={false}
                      toolCallId={toolCallId}
                    >
                      <DocumentToolResult
                        type="update"
                        result={output}
                        isReadonly={isReadonly}
                      />
                    </ToolAccordion>
                  );
                }
              }

              if (type === "tool-requestSuggestions") {
                const { toolCallId, state } = part;

                if (state === "input-available") {
                  const { input } = part;
                  const outputPart = findMatchingOutputPart(
                    part,
                    message.parts || [],
                    index
                  );

                  if (outputPart && "error" in outputPart.output) {
                    return (
                      <div
                        key={toolCallId}
                        className="text-red-500 p-2 border rounded"
                      >
                        Error: {String(outputPart.output.error)}
                      </div>
                    );
                  }

                  if (!outputPart) {
                    return (
                      <motion.div
                        key={toolCallId}
                        className="flex flex-col gap-3"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                      >
                        <AnimatedShinyText className="flex flex-row gap-2 items-center">
                          <Download className="w-4 h-4" />
                          Lade Vorschläge...
                        </AnimatedShinyText>
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.2, duration: 0.3 }}
                        >
                          <DocumentToolCall
                            type="request-suggestions"
                            args={input}
                            isReadonly={isReadonly}
                          />
                        </motion.div>
                      </motion.div>
                    );
                  }

                  return (
                    <ToolAccordion
                      key={toolCallId}
                      icon={<Download className="w-4 h-4" />}
                      loadingText="Lade Vorschläge..."
                      completedText="Vorschläge geladen"
                      isLoading={false}
                      toolCallId={toolCallId}
                    >
                      <DocumentToolResult
                        type="request-suggestions"
                        result={outputPart.output}
                        isReadonly={isReadonly}
                      />
                    </ToolAccordion>
                  );
                }

                if (state === "output-available") {
                  // This case is for standalone output parts (without matching input)
                  const { output } = part;

                  if ("error" in output) {
                    return (
                      <div
                        key={toolCallId}
                        className="text-red-500 p-2 border rounded"
                      >
                        Error: {String(output.error)}
                      </div>
                    );
                  }

                  return (
                    <ToolAccordion
                      key={toolCallId}
                      icon={<Download className="w-4 h-4" />}
                      loadingText="Lade Vorschläge..."
                      completedText="Vorschläge geladen"
                      isLoading={false}
                      toolCallId={toolCallId}
                    >
                      <DocumentToolResult
                        type="request-suggestions"
                        result={output}
                        isReadonly={isReadonly}
                      />
                    </ToolAccordion>
                  );
                }
              }

              // Note: tool-searchDatasets is handled above in the merged search logic

              // Handle ALL getDatasetDetails calls as one merged widget
              if (type === "tool-getDatasetDetails") {
                // Check if this is the first getDatasetDetails part in the message
                const firstDatasetIndex = allParts.findIndex(
                  (p) => p.type === "tool-getDatasetDetails"
                );

                if (index === firstDatasetIndex) {
                  // This is the first getDatasetDetails part - collect ALL getDatasetDetails in this message
                  const allDatasetParts = allParts.filter(
                    (p) => p.type === "tool-getDatasetDetails"
                  );
                  const groupedDatasets =
                    groupDatasetDetailsParts(allDatasetParts);
                  const hasAnyOutput = groupedDatasets.length > 0;

                  return (
                    <MergedDatasetDetails
                      key={`merged-datasets-${groupedDatasets
                        .map((d) => d.toolCallId)
                        .join("-")}`}
                      datasets={groupedDatasets}
                      isLoading={!hasAnyOutput}
                    />
                  );
                } else {
                  // Skip all other getDatasetDetails parts since they're handled above
                  return null;
                }
              }
              if (type === "tool-getResourceDetails") {
                const { toolCallId, state, input } = part;

                if (state === "input-available") {
                  const outputPart = findMatchingOutputPart(
                    part,
                    message.parts || [],
                    index
                  );

                  if (outputPart && "error" in outputPart.output) {
                    return (
                      <div
                        key={toolCallId}
                        className="text-red-500 p-2 border rounded"
                      >
                        Error: {String(outputPart.output.error)}
                      </div>
                    );
                  }

                  if (!outputPart) {
                    return (
                      <motion.div
                        key={toolCallId}
                        className="flex flex-col gap-3"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                      >
                        <AnimatedShinyText className="flex flex-row gap-2 items-center">
                          <FileText className="w-4 h-4" />
                          Lade Ressourcen-Details...
                        </AnimatedShinyText>
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.2, duration: 0.3 }}
                        >
                          <ResourceDetailsSkeleton />
                        </motion.div>
                      </motion.div>
                    );
                  }

                  return (
                    <ToolAccordion
                      key={toolCallId}
                      icon={<FileText className="w-4 h-4" />}
                      loadingText="Lade Ressourcen-Details..."
                      completedText="Ressourcen-Details geladen"
                      isLoading={false}
                      toolCallId={toolCallId}
                    >
                      <ResourceDetailsWidget
                        result={outputPart.output.result}
                      />
                    </ToolAccordion>
                  );
                }

                if (state === "output-available") {
                  // This case is for standalone output parts (without matching input)
                  const { output } = part;

                  if ("error" in output) {
                    return (
                      <div
                        key={toolCallId}
                        className="text-red-500 p-2 border rounded"
                      >
                        Error: {String(output.error)}
                      </div>
                    );
                  }

                  const result = output.result;

                  return (
                    <ToolAccordion
                      key={toolCallId}
                      icon={<FileText className="w-4 h-4" />}
                      loadingText="Lade Ressourcen-Details..."
                      completedText="Ressourcen-Details geladen"
                      isLoading={false}
                      toolCallId={toolCallId}
                    >
                      <ResourceDetailsWidget result={result} />
                    </ToolAccordion>
                  );
                }
              }
            })}

            {!isReadonly && (
              <MessageActions
                key={`action-${message.id}`}
                chatId={chatId}
                message={message}
                vote={vote}
                isLoading={isLoading}
              />
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export const PreviewMessage = memo(
  PurePreviewMessage,
  (prevProps, nextProps) => {
    if (prevProps.isLoading !== nextProps.isLoading) return false;
    if (prevProps.message.id !== nextProps.message.id) return false;
    if (prevProps.requiresScrollPadding !== nextProps.requiresScrollPadding)
      return false;
    if (!equal(prevProps.message.parts, nextProps.message.parts)) return false;
    if (!equal(prevProps.vote, nextProps.vote)) return false;

    return false;
  }
);

export const ThinkingMessage = () => {
  const role = "assistant";

  return (
    <motion.div
      data-testid="message-assistant-loading"
      className="w-full mx-auto max-w-3xl px-4 group/message min-h-96"
      initial={{ y: 5, opacity: 0 }}
      animate={{ y: 0, opacity: 1, transition: { delay: 1 } }}
      data-role={role}
    >
      <div
        className={cx(
          "flex gap-4 group-data-[role=user]/message:px-3 w-full group-data-[role=user]/message:w-fit group-data-[role=user]/message:ml-auto group-data-[role=user]/message:max-w-2xl group-data-[role=user]/message:py-2 rounded-xl",
          {
            "group-data-[role=user]/message:bg-card/60": true,
          }
        )}
      >
        <div className="size-9 flex items-center rounded-full justify-center ring-1 shrink-0 ring-border bg-background">
          <div className="translate-y-px">
            <Image
              src="/assets/logo_datagvat.png"
              alt="Logo"
              className="w-9 h-9 p-1.5 bg-card/60	rounded-full"
              width={32}
              height={32}
            />
          </div>
        </div>

        <div className="flex flex-col gap-2 w-full">
          <div className="flex flex-col gap-4 text-muted-foreground">
            Ich denke nach...
          </div>
        </div>
      </div>
    </motion.div>
  );
};
