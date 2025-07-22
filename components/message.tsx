"use client";
import cx from "classnames";
import { AnimatePresence, motion } from "framer-motion";
import { memo, useState } from "react";
import type { Vote } from "@/lib/db/schema";
import { PencilEditIcon, SparklesIcon } from "./icons";
import { Markdown } from "./markdown";
import { MessageActions } from "./message-actions";
import { PreviewAttachment } from "./preview-attachment";
import { Weather } from "./weather";
import equal from "fast-deep-equal";
import { cn, sanitizeText } from "@/lib/utils";
import { Button } from "./ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { MessageEditor } from "./message-editor";
import { MessageReasoning } from "./message-reasoning";
import type { UseChatHelpers } from "@ai-sdk/react";
import type { ChatMessage } from "@/lib/types";
import { useDataStream } from "./data-stream-provider";
import Link from "next/link";
import { Badge } from "./ui/badge";
import { DocumentToolCall, DocumentToolResult } from "./document";
import { DocumentPreview } from "./document-preview";
import {
  DatasetSearchSkeleton,
  DatasetSearchMessage,
} from "@/components/dataset-message";

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
            <div className="size-8 flex items-center rounded-full justify-center ring-1 shrink-0 ring-border bg-background">
              <div className="translate-y-px">
                <SparklesIcon size={14} />
              </div>
            </div>
          )}

          <div
            className={cn("flex flex-col gap-4 w-full", {
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

            {message.parts?.map((part, index) => {
              const { type } = part;
              const key = `message-${message.id}-part-${index}`;

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
                          "bg-primary text-primary-foreground px-3 py-2 rounded-xl":
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

                if (state === "input-available") {
                  const { input } = part;
                  return (
                    <div key={toolCallId}>
                      <DocumentPreview isReadonly={isReadonly} args={input} />
                    </div>
                  );
                }

                if (state === "output-available") {
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
                    <div key={toolCallId}>
                      <DocumentPreview
                        isReadonly={isReadonly}
                        result={output}
                      />
                    </div>
                  );
                }
              }

              if (type === "tool-updateDocument") {
                const { toolCallId, state } = part;

                if (state === "input-available") {
                  const { input } = part;

                  return (
                    <div key={toolCallId}>
                      <DocumentToolCall
                        type="update"
                        args={input}
                        isReadonly={isReadonly}
                      />
                    </div>
                  );
                }

                if (state === "output-available") {
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
                    <div key={toolCallId}>
                      <DocumentToolResult
                        type="update"
                        result={output}
                        isReadonly={isReadonly}
                      />
                    </div>
                  );
                }
              }

              if (type === "tool-requestSuggestions") {
                const { toolCallId, state } = part;

                if (state === "input-available") {
                  const { input } = part;
                  return (
                    <div key={toolCallId}>
                      <DocumentToolCall
                        type="request-suggestions"
                        args={input}
                        isReadonly={isReadonly}
                      />
                    </div>
                  );
                }

                if (state === "output-available") {
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
                    <div key={toolCallId}>
                      <DocumentToolResult
                        type="request-suggestions"
                        result={output}
                        isReadonly={isReadonly}
                      />
                    </div>
                  );
                }
              }

              if (type === "tool-searchDatasets") {
                const { toolCallId, state, input } = part;

                if (state === "input-available") {
                  return <DatasetSearchSkeleton toolCallId={toolCallId} />;
                }

                if (state === "output-available") {
                  const { output } = part;

                  return (
                    <DatasetSearchMessage
                      toolCallId={toolCallId}
                      input={{
                        ...input,
                        q: input.q || "data.gv.at",
                      }}
                      output={output}
                    />
                  );
                }
              }

              if (type === "tool-getDatasetDetails") {
                const { toolCallId, state, input } = part;

                if (state === "input-available") {
                  return (
                    <div key={toolCallId} className="skeleton">
                      <Weather />
                    </div>
                  );
                }

                if (state === "output-available") {
                  const { output } = part;
                  const result = output.data.result;

                  if (!result) {
                    return (
                      <div
                        key={toolCallId}
                        className="text-red-500 p-2 border rounded"
                      >
                        Error: {output.content}
                      </div>
                    );
                  }

                  return (
                    <Link
                      key={toolCallId}
                      href={`https://www.data.gv.at/katalog/dataset/${result.id}`}
                      target="_blank"
                    >
                      <div className="flex flex-col gap-3 bg-card p-3 rounded-lg border hover:bg-accent/50 transition-colors">
                        {/* Header */}
                        <div className="flex flex-row gap-2 items-start">
                          <img
                            src={"https://www.data.gv.at/favicon.ico"}
                            alt={"data.gv.at logo"}
                            className="w-8 h-8 aspect-square rounded-sm bg-secondary border p-1 mt-0.5"
                          />
                          <div className="flex flex-col flex-1 min-w-0">
                            <div className="text-xs text-muted-foreground">
                              {result.publisher || "data.gv.at"}
                            </div>
                            <h3 className="font-medium leading-tight text-sm">
                              {result.title}
                            </h3>
                          </div>
                        </div>

                        {/* Description */}
                        {result.notes && (
                          <div className="text-xs text-muted-foreground line-clamp-1">
                            {result.notes}
                          </div>
                        )}

                        {/* Tags */}
                        {result.tags && result.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {result.tags
                              .slice(0, 4)
                              .map(
                                (tag: { display_name: string; id: string }) => (
                                  <span
                                    key={`${result.id}-${tag.id}`}
                                    className="text-xs bg-secondary px-2 py-0.5 rounded text-muted-foreground"
                                  >
                                    {tag.display_name}
                                  </span>
                                )
                              )}
                            {result.tags.length > 4 && (
                              <span className="text-xs bg-secondary px-2 py-0.5 rounded text-muted-foreground">
                                +{result.tags.length - 4}
                              </span>
                            )}
                          </div>
                        )}

                        {/* Metadata Cards */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                          {result.num_resources && (
                            <div className="bg-background/50 rounded p-2 border border-border/50">
                              <div className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
                                Ressourcen
                              </div>
                              <div className="text-sm font-semibold">
                                {result.num_resources}
                              </div>
                            </div>
                          )}

                          {result.metadata_created && (
                            <div className="bg-background/50 rounded p-2 border border-border/50">
                              <div className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
                                Erstellt
                              </div>
                              <div className="text-xs font-medium">
                                {new Date(
                                  result.metadata_created
                                ).toLocaleDateString("de-AT", {
                                  day: "2-digit",
                                  month: "2-digit",
                                  year: "numeric",
                                })}
                              </div>
                            </div>
                          )}

                          {result.metadata_modified && (
                            <div className="bg-background/50 rounded p-2 border border-border/50">
                              <div className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
                                Aktualisiert
                              </div>
                              <div className="text-xs font-medium">
                                {new Date(
                                  result.metadata_modified
                                ).toLocaleDateString("de-AT", {
                                  day: "2-digit",
                                  month: "2-digit",
                                  year: "numeric",
                                })}
                              </div>
                            </div>
                          )}

                          {result.license_title && (
                            <div className="bg-background/50 rounded p-2 border border-border/50">
                              <div className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
                                Lizenz
                              </div>
                              <div
                                className="text-xs font-medium truncate"
                                title={result.license_title}
                              >
                                {result.license_title}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </Link>
                  );
                }
              }
              if (type === "tool-getResourceDetails") {
                const { toolCallId, state, input } = part;

                if (state === "input-available") {
                  return (
                    <div key={toolCallId} className="skeleton">
                      <Weather />
                    </div>
                  );
                }

                if (state === "output-available") {
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
                    <div
                      key={toolCallId}
                      className="flex flex-col gap-4 bg-card p-4 rounded-lg border"
                    >
                      {/* Header */}
                      <div className="flex flex-row gap-3 items-start">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold text-sm shrink-0">
                          {result.format || "FILE"}
                        </div>
                        <div className="flex flex-col flex-1 min-w-0">
                          <h3 className="font-semibold leading-tight text-lg">
                            {result.name}
                          </h3>
                          {result.url && (
                            <p className="text-sm text-muted-foreground line-clamp-2 max-w-1/2 truncate">
                              {result.url}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Main Resource Details */}
                      <div className="flex flex-wrap gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                            Format:
                          </span>
                          <span className="font-medium">
                            {result.format || "Unbekannt"}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                            Status:
                          </span>
                          <span
                            className={`font-medium ${
                              result.state === "active"
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {result.state === "active" ? "Aktiv" : result.state}
                          </span>
                        </div>

                        {result.size && (
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                              Größe:
                            </span>
                            <span className="font-medium">
                              {(result.size / 1024 / 1024).toFixed(2)} MB
                            </span>
                          </div>
                        )}

                        {result.language && (
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                              Sprache:
                            </span>
                            <span className="font-medium">
                              {result.language}
                            </span>
                          </div>
                        )}

                        {result.created && (
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                              Erstellt:
                            </span>
                            <span className="font-medium">
                              {new Date(result.created).toLocaleDateString()}
                            </span>
                          </div>
                        )}

                        {result.last_modified && (
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                              Geändert:
                            </span>
                            <span className="font-medium">
                              {new Date(
                                result.last_modified
                              ).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Technical Details */}
                      {(result.mimetype ||
                        result.characterSet ||
                        result.datastore_active) && (
                        <div className="border-t pt-3">
                          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 block">
                            Technische Details
                          </span>
                          <div className="flex flex-wrap gap-2">
                            {result.mimetype && (
                              <Badge variant="outline" className="text-xs">
                                MIME: {result.mimetype}
                              </Badge>
                            )}
                            {result.characterSet && (
                              <Badge variant="outline" className="text-xs">
                                Charset: {result.characterSet}
                              </Badge>
                            )}
                            {result.datastore_active && (
                              <Badge
                                variant="outline"
                                className="text-xs text-green-600"
                              >
                                Datastore aktiv
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Download Link */}
                      {result.url && (
                        <div className="border-t pt-3">
                          <Link
                            href={result.url}
                            target="_blank"
                            className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                              />
                            </svg>
                            Ressource herunterladen
                          </Link>
                        </div>
                      )}
                    </div>
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
            "group-data-[role=user]/message:bg-muted": true,
          }
        )}
      >
        <div className="size-8 flex items-center rounded-full justify-center ring-1 shrink-0 ring-border">
          <SparklesIcon size={14} />
        </div>

        <div className="flex flex-col gap-2 w-full">
          <div className="flex flex-col gap-4 text-muted-foreground">
            Hmm...
          </div>
        </div>
      </div>
    </motion.div>
  );
};
