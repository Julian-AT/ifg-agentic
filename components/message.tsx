"use client";
import cx from "classnames";
import { AnimatePresence, motion } from "framer-motion";
import { memo, useState } from "react";
import type { Vote } from "@/lib/db/schema";
import { MessageActions } from "./message-actions";
import { PreviewAttachment } from "./preview-attachment";
import equal from "fast-deep-equal";
import { cn, sanitizeText } from "@/lib/utils";
import { MessageEditor } from "./message-editor";
import { MessageReasoning } from "./message-reasoning";
import type { UseChatHelpers } from "@ai-sdk/react";
import type { ChatMessage } from "@/lib/types";
import { useDataStream } from "./data-stream-provider";
import { DocumentToolCall, DocumentToolResult } from "./document";
import { DocumentPreview } from "./document-preview";

import Image from "next/image";
import { FileText, Download } from "lucide-react";
import { ResourceDetailsSkeleton } from "./dataset-skeletons";
import { ResourceDetailsWidget } from "./resource-details-widget";
import { ToolAccordion } from "./tool-accordion";
import { MergedDatasetSearch } from "./merged-dataset-search";
import { MergedDatasetDetails } from "./merged-dataset-details";
import { AnimatedShinyText } from "@/components/animated-shiny-text";
import { MessageContent } from "./elements/message";
import { Response } from "./elements/response";
import {
  Tool,
  ToolContent,
  ToolHeader,
  ToolInput,
  ToolOutput,
} from "./elements/tool";
import {
  Task,
  TaskContent,
  TaskItem,
  TaskItemFile,
  TaskTrigger,
} from "./elements/task";
import { Database, FileSpreadsheet, Code, BarChart3 } from "lucide-react";
import { useArtifact } from "@/hooks/use-artifact";
import { ShinyText } from "./shiny-text";

const findMatchingOutputPart = (
  inputPart: any,
  allParts: any[],
  inputIndex: number
): any | null => {
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

const shouldSkipOutputPart = (
  currentPart: any,
  allParts: any[],
  currentIndex: number
): boolean => {
  if (currentPart.state !== "output-available") return false;

  for (let i = currentIndex - 1; i >= 0; i--) {
    const part = allParts[i];
    if (
      part.type === currentPart.type &&
      part.toolCallId === currentPart.toolCallId &&
      part.state === "input-available"
    ) {
      return true;
    }
  }
  return false;
};


const groupSearchParts = (searchParts: any[]): any[] => {
  const groupedSearches: any[] = [];

  for (const part of searchParts) {
    if (
      ("state" in part && part.state === "input-available") ||
      part.state === "output-available"
    ) {
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

const groupDatasetDetailsParts = (datasetParts: any[]): any[] => {
  const groupedDatasets: any[] = [];

  for (const part of datasetParts) {
    if (
      ("state" in part && part.state === "input-available") ||
      part.state === "output-available"
    ) {
      const matchingOutput = datasetParts.find(
        (p) =>
          p.type === part.type &&
          p.toolCallId === part.toolCallId &&
          "state" in p &&
          p.state === "output-available"
      );

      const dataset =
        matchingOutput?.output?.dataset || matchingOutput?.output?.data?.result;

      if (dataset) {
        groupedDatasets.push({
          toolCallId: part.toolCallId,
          datasetId: part.input?.id || "unknown",
          result: dataset,
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
  const { artifact } = useArtifact();

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
            className={cn("flex flex-col gap-4 max-w-full", {
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
                  return null;
                }
              }

              if (type === "reasoning") {
                console.log("reasoning", part);

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
                    <div key={key}>
                      <MessageContent
                        className={cn({
                          "w-fit break-words rounded-2xl px-3 py-2 text-right text-white":
                            message.role === "user",
                          "bg-transparent px-0 py-0 text-left":
                            message.role === "assistant",
                        })}
                        data-testid="message-content"
                        style={
                          message.role === "user"
                            ? { backgroundColor: "#006cff" }
                            : undefined
                        }
                      >
                        <Response>{sanitizeText(part.text)}</Response>
                      </MessageContent>
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
                const { toolCallId } = part;

                if (part.output && "error" in part.output) {
                  return (
                    <div
                      className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-500 dark:bg-red-950/50"
                      key={toolCallId}
                    >
                      Error creating document: {String(part.output.error)}
                    </div>
                  );
                }

                return (
                  <DocumentPreview
                    isReadonly={isReadonly}
                    key={toolCallId}
                    result={part.output}
                  />
                );
              }

              if (type === "tool-updateDocument") {
                const { toolCallId } = part;

                if (part.output && "error" in part.output) {
                  return (
                    <div
                      className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-500 dark:bg-red-950/50"
                      key={toolCallId}
                    >
                      Error updating document: {String(part.output.error)}
                    </div>
                  );
                }

                return (
                  <div className="relative" key={toolCallId}>
                    <DocumentPreview
                      args={{ ...part.output, isUpdate: true }}
                      isReadonly={isReadonly}
                      result={part.output}
                    />
                  </div>
                );
              }

              if (type === "tool-requestSuggestions") {
                const { toolCallId, state } = part;

                return (
                  <Tool defaultOpen={true} key={toolCallId}>
                    <ToolHeader state={state} type="tool-requestSuggestions" />
                    <ToolContent>
                      {state === "input-available" && (
                        <ToolInput input={part.input} />
                      )}
                      {state === "output-available" && (
                        <ToolOutput
                          errorText={undefined}
                          output={
                            "error" in part.output ? (
                              <div className="rounded border p-2 text-red-500">
                                Error: {String(part.output.error)}
                              </div>
                            ) : (
                              <DocumentToolResult
                                isReadonly={isReadonly}
                                result={part.output}
                                type="request-suggestions"
                              />
                            )
                          }
                        />
                      )}
                    </ToolContent>
                  </Tool>
                );
              }

              if (type === "tool-exploreCsvData" && "toolCallId" in part) {
                const { toolCallId, state } = part as any;

                if (state === "input-available") {
                  return (
                    <div className="flex flex-row gap-2 items-center text-muted-foreground">
                      <FileText className="w-4 h-4" />
                      <ShinyText text="Analysiere CSV-Daten..." />
                    </div>
                  );
                }
                return (
                  <div className="flex flex-row gap-2 items-center text-muted-foreground">
                    <FileText className="w-4 h-4" />
                    CSV-Daten analysiert
                  </div>
                );
              }

              if (type === "data-task" && "data" in part) {
                const taskData = part.data as any;
                const iconMap = {
                  dataset: Database,
                  csv: FileSpreadsheet,
                  python: Code,
                  chart: BarChart3,
                };

                return (
                  <Task key={`task-${index}`} defaultOpen={true}>
                    <TaskTrigger title={taskData.title} />
                    <TaskContent>
                      {taskData.items.map((item: any, idx: number) => (
                        <TaskItem key={idx}>
                          {item.text}
                          {item.file && (
                            <>
                              {" "}
                              <TaskItemFile>
                                {iconMap[
                                  item.file.icon as keyof typeof iconMap
                                ] &&
                                  (() => {
                                    const Icon =
                                      iconMap[
                                      item.file.icon as keyof typeof iconMap
                                      ];
                                    return <Icon className="size-4" />;
                                  })()}
                                <span>{item.file.name}</span>
                              </TaskItemFile>
                            </>
                          )}
                        </TaskItem>
                      ))}
                    </TaskContent>
                  </Task>
                );
              }


              if (type === "tool-getDatasetDetails") {
                const firstDatasetIndex = allParts.findIndex(
                  (p) => p.type === "tool-getDatasetDetails"
                );

                if (index === firstDatasetIndex) {
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
                  return null;
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
