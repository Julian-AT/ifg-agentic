"use client";

import { EditorView } from "@codemirror/view";
import { EditorState, Transaction } from "@codemirror/state";
import { python } from "@codemirror/lang-python";
import { basicSetup } from "codemirror";
import React, { memo, useEffect, useMemo, useRef } from "react";
import type { Suggestion } from "@/lib/db/schema";
import { ayuLight, dracula } from "thememirror";
import { useTheme } from "next-themes";

// Custom dark theme matching the app's CSS colors+
const customDarkTheme = EditorView.theme({
  "&": {
    backgroundColor: "oklch(0.21 0.006 285.885)",
  },
  ".cm-cursor, .cm-dropCursor": {
    borderLeftColor: "oklch(0.596 0.145 163.225)",
  },
  ".cm-selectionBackground, .cm-selectionMatch": {
    backgroundColor: "oklch(0.274 0.006 286.033)",
  },
  ".cm-activeLine": {
    backgroundColor: "oklch(0.244 0.006 285.97)",
  },
  ".cm-gutters": {
    backgroundColor: "oklch(0.244 0.006 285.97)",
    color: "oklch(0.705 0.015 286.067)",
    border: "none",
  },
  ".cm-lineNumbers .cm-gutterElement": {
    color: "oklch(0.705 0.015 286.067)",
  },
  ".cm-activeLineGutter": {
    backgroundColor: "oklch(0.29 0.009 285.83)",
    color: "oklch(0.985 0 0)",
  },
  ".cm-tooltip": {
    backgroundColor: "oklch(0.21 0.006 285.885)",
    border: "1px solid oklch(0.29 0.009 285.83)",
  },
  ".cm-tooltip.cm-tooltip-autocomplete": {
    backgroundColor: "oklch(0.21 0.006 285.885)",
    border: "1px solid oklch(0.29 0.009 285.83)",
  },
  ".cm-tooltip.cm-tooltip-autocomplete > ul": {
    backgroundColor: "oklch(0.21 0.006 285.885)",
  },
  ".cm-tooltip.cm-tooltip-autocomplete > ul > li": {
    color: "oklch(0.985 0 0)",
  },
  ".cm-tooltip.cm-tooltip-autocomplete > ul > li[aria-selected]": {
    backgroundColor: "oklch(0.274 0.006 286.033)",
    color: "oklch(0.985 0 0)",
  },
  ".cm-panel": {
    backgroundColor: "oklch(0.21 0.006 285.885)",
    color: "oklch(0.985 0 0)",
  },
  ".cm-panel.cm-panel-top": {
    borderBottom: "1px solid oklch(0.29 0.009 285.83)",
  },
  ".cm-panel.cm-panel-bottom": {
    borderTop: "1px solid oklch(0.29 0.009 285.83)",
  },
  ".cm-searchMatch": {
    backgroundColor: "oklch(0.488 0.243 264.376)",
  },
  ".cm-searchMatch.cm-searchMatch-selected": {
    backgroundColor: "oklch(0.596 0.145 163.225)",
  },
  ".cm-selectionMatch": {
    backgroundColor: "oklch(0.274 0.006 286.033)",
  },
  "&.cm-focused .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection":
    {
      backgroundColor: "oklch(0.274 0.006 286.033)",
    },
  ".cm-line": {
    padding: "0 4px 0 4px",
  },
  ".cm-scroller": {
    fontFamily: "var(--font-mono)",
  },
});

type EditorProps = {
  content: string;
  onSaveContent: (updatedContent: string, debounce: boolean) => void;
  status: "streaming" | "idle";
  isCurrentVersion: boolean;
  currentVersionIndex: number;
  suggestions: Array<Suggestion>;
};

function PureCodeEditor({ content, onSaveContent, status }: EditorProps) {
  const { theme } = useTheme();

  const containerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<EditorView | null>(null);

  // Select theme based on global theme
  const editorTheme = useMemo(() => {
    if (theme === "light") {
      return ayuLight;
    }
    return [dracula, customDarkTheme];
  }, [theme]);

  useEffect(() => {
    if (containerRef.current && !editorRef.current) {
      const startState = EditorState.create({
        doc: content,
        extensions: [basicSetup, python(), editorTheme],
      });

      editorRef.current = new EditorView({
        state: startState,
        parent: containerRef.current,
      });
    }

    return () => {
      if (editorRef.current) {
        editorRef.current.destroy();
        editorRef.current = null;
      }
    };
    // NOTE: we only want to run this effect once
    // eslint-disable-next-line
  }, []);

  // Update theme when global theme changes
  useEffect(() => {
    if (editorRef.current) {
      const currentSelection = editorRef.current.state.selection;

      const newState = EditorState.create({
        doc: editorRef.current.state.doc,
        extensions: [basicSetup, python(), editorTheme],
        selection: currentSelection,
      });

      editorRef.current.setState(newState);
    }
  }, [editorTheme]);

  useEffect(() => {
    if (editorRef.current) {
      const updateListener = EditorView.updateListener.of((update) => {
        if (update.docChanged) {
          const transaction = update.transactions.find(
            (tr) => !tr.annotation(Transaction.remote)
          );

          if (transaction) {
            const newContent = update.state.doc.toString();
            onSaveContent(newContent, true);
          }
        }
      });

      const currentSelection = editorRef.current.state.selection;

      const newState = EditorState.create({
        doc: editorRef.current.state.doc,
        extensions: [basicSetup, python(), editorTheme, updateListener],
        selection: currentSelection,
      });

      editorRef.current.setState(newState);
    }
  }, [onSaveContent, editorTheme]);

  useEffect(() => {
    if (editorRef.current && content) {
      const currentContent = editorRef.current.state.doc.toString();

      if (status === "streaming" || currentContent !== content) {
        const transaction = editorRef.current.state.update({
          changes: {
            from: 0,
            to: currentContent.length,
            insert: content,
          },
          annotations: [Transaction.remote.of(true)],
        });

        editorRef.current.dispatch(transaction);
      }
    }
  }, [content, status]);

  return (
    <div
      className="relative not-prose w-full pb-[calc(0dvh)] text-sm"
      ref={containerRef}
    />
  );
}

function areEqual(prevProps: EditorProps, nextProps: EditorProps) {
  if (prevProps.suggestions !== nextProps.suggestions) return false;
  if (prevProps.currentVersionIndex !== nextProps.currentVersionIndex)
    return false;
  if (prevProps.isCurrentVersion !== nextProps.isCurrentVersion) return false;
  if (prevProps.status === "streaming" && nextProps.status === "streaming")
    return false;
  if (prevProps.content !== nextProps.content) return false;

  return true;
}

export const CodeEditor = memo(PureCodeEditor, areEqual);
