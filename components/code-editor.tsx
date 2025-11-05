"use client";

import { memo, useEffect, useRef, useState } from "react";
import { createHighlighter, type Highlighter } from "shiki";
import type { Suggestion } from "@/lib/db/schema";

type EditorProps = {
  content: string;
  onSaveContent: (updatedContent: string, debounce: boolean) => void;
  status: "streaming" | "idle";
  isCurrentVersion: boolean;
  currentVersionIndex: number;
  suggestions: Suggestion[];
};

let highlighterInstance: Highlighter | null = null;

function PureCodeEditor({ content, onSaveContent: _onSaveContent, status }: EditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const highlightRef = useRef<HTMLDivElement>(null);
  const [highlightedCode, setHighlightedCode] = useState("");

  useEffect(() => {
    let isCancelled = false;

    const highlightCode = async () => {
      try {
        if (!highlighterInstance) {
          highlighterInstance = await createHighlighter({
            themes: ["github-light", "github-dark"],
            langs: ["python", "javascript", "typescript", "json", "bash"],
          });
        }

        const html = highlighterInstance.codeToHtml(content || " ", {
          lang: "python",
          themes: {
            light: "github-light",
            dark: "github-dark",
          },
        });

        if (!isCancelled) {
          setHighlightedCode(html);
        }
      } catch (_error) {
        // Error highlighting code
      }
    };

    highlightCode();

    return () => {
      isCancelled = true;
    };
  }, [content]);

  useEffect(() => {
    if (textareaRef.current && status === "streaming") {
      textareaRef.current.value = content;
      textareaRef.current.scrollTop = textareaRef.current.scrollHeight;
    }
  }, [content, status]);

  return (
    <div className="not-prose relative h-[90dvh] w-full overflow-y-auto text-sm">
      <div className="relative h-full rounded-lg border border-border bg-background">
        <div
          ref={highlightRef}
          className="code-editor-highlight pointer-events-auto absolute inset-0 overflow-y-auto [&_code]:font-mono [&_code]:text-sm [&_code]:leading-[1.5] [&_pre]:m-0 [&_pre]:bg-transparent [&_pre]:p-4 [&_pre]:font-mono [&_pre]:text-sm [&_pre]:leading-[1.5]"
          dangerouslySetInnerHTML={{ __html: highlightedCode }}
        />
      </div>
    </div>
  );
}

function areEqual(prevProps: EditorProps, nextProps: EditorProps) {
  if (prevProps.suggestions !== nextProps.suggestions) {
    return false;
  }
  if (prevProps.currentVersionIndex !== nextProps.currentVersionIndex) {
    return false;
  }
  if (prevProps.isCurrentVersion !== nextProps.isCurrentVersion) {
    return false;
  }
  if (prevProps.status === "streaming" && nextProps.status === "streaming") {
    return false;
  }
  if (prevProps.content !== nextProps.content) {
    return false;
  }

  return true;
}

export const CodeEditor = memo(PureCodeEditor, areEqual);
