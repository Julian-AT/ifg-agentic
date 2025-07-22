import { TerminalWindowIcon, LoaderIcon, CrossSmallIcon } from "./icons";
import { Button } from "./ui/button";
import {
  type Dispatch,
  type SetStateAction,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { cn } from "@/lib/utils";

export interface ConsoleOutputContent {
  type: "text" | "image" | "html" | "dataframe" | "json";
  value: string;
}

export interface ConsoleOutput {
  id: string;
  status: "in_progress" | "loading_packages" | "completed" | "failed";
  contents: Array<ConsoleOutputContent>;
}

interface ConsoleProps {
  consoleOutputs: Array<ConsoleOutput>;
  setConsoleOutputs: Dispatch<SetStateAction<Array<ConsoleOutput>>>;
}

export function Console({ consoleOutputs, setConsoleOutputs }: ConsoleProps) {
  const [height, setHeight] = useState<number>(300);
  const [isResizing, setIsResizing] = useState(false);
  const consoleEndRef = useRef<HTMLDivElement>(null);

  const minHeight = 100;
  const maxHeight = 800;

  const startResizing = useCallback(() => {
    setIsResizing(true);
  }, []);

  const stopResizing = useCallback(() => {
    setIsResizing(false);
  }, []);

  const resize = useCallback(
    (e: MouseEvent) => {
      if (isResizing) {
        const newHeight = window.innerHeight - e.clientY;
        if (newHeight >= minHeight && newHeight <= maxHeight) {
          setHeight(newHeight);
        }
      }
    },
    [isResizing]
  );

  useEffect(() => {
    window.addEventListener("mousemove", resize);
    window.addEventListener("mouseup", stopResizing);
    return () => {
      window.removeEventListener("mousemove", resize);
      window.removeEventListener("mouseup", stopResizing);
    };
  }, [resize, stopResizing]);

  useEffect(() => {
    consoleEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [consoleOutputs]);

  return consoleOutputs.length > 0 ? (
    <>
      <div
        className="h-2 w-full fixed cursor-ns-resize z-50"
        onMouseDown={startResizing}
        style={{ bottom: height - 4 }}
        role="slider"
        aria-valuenow={minHeight}
      />

      <div
        className={cn(
          "fixed flex flex-col bottom-0 dark:bg-zinc-900 bg-zinc-50 w-full border-t z-40 overflow-y-scroll overflow-x-hidden dark:border-zinc-700 border-zinc-200",
          {
            "select-none": isResizing,
          }
        )}
        style={{ height }}
      >
        <div className="flex flex-row justify-between items-center w-full h-fit border-b dark:border-zinc-700 border-zinc-200 px-2 py-1 sticky top-0 z-50 bg-muted">
          <div className="text-sm pl-2 dark:text-zinc-50 text-zinc-800 flex flex-row gap-3 items-center">
            <div className="text-muted-foreground">
              <TerminalWindowIcon />
            </div>
            <div>Console</div>
          </div>
          <Button
            variant="ghost"
            className="size-fit p-1 hover:dark:bg-zinc-700 hover:bg-zinc-200"
            size="icon"
            onClick={() => setConsoleOutputs([])}
          >
            <CrossSmallIcon />
          </Button>
        </div>

        <div>
          {consoleOutputs.map((consoleOutput, index) => (
            <div
              key={consoleOutput.id}
              className="px-4 py-2 flex flex-row text-sm border-b dark:border-zinc-700 border-zinc-200 dark:bg-zinc-900 bg-zinc-50 font-mono"
            >
              <div
                className={cn("w-12 shrink-0", {
                  "text-muted-foreground": [
                    "in_progress",
                    "loading_packages",
                  ].includes(consoleOutput.status),
                  "text-emerald-500": consoleOutput.status === "completed",
                  "text-red-400": consoleOutput.status === "failed",
                })}
              >
                [{index + 1}]
              </div>
              {["in_progress", "loading_packages"].includes(
                consoleOutput.status
              ) ? (
                <div className="flex flex-row gap-2">
                  <div className="animate-spin size-fit self-center mb-auto mt-0.5">
                    <LoaderIcon />
                  </div>
                  <div className="text-muted-foreground">
                    {consoleOutput.status === "in_progress"
                      ? "Initializing..."
                      : consoleOutput.status === "loading_packages"
                      ? consoleOutput.contents.map((content) =>
                          content.type === "text" ? content.value : null
                        )
                      : null}
                  </div>
                </div>
              ) : (
                <div className="dark:text-zinc-50 text-zinc-900 w-full flex flex-col gap-2 overflow-x-scroll">
                  {consoleOutput.contents.map((content, index) => {
                    const key = `${consoleOutput.id}-${index}`;

                    switch (content.type) {
                      case "image":
                        return (
                          <picture key={key}>
                            <img
                              src={content.value}
                              alt="output"
                              className="rounded-md max-w-(--breakpoint-toast-mobile) w-full"
                            />
                          </picture>
                        );

                      case "html":
                        return (
                          <div
                            key={key}
                            className="w-full border rounded-md p-2 bg-white dark:bg-zinc-800"
                            dangerouslySetInnerHTML={{ __html: content.value }}
                          />
                        );

                      case "dataframe":
                        return (
                          <div
                            key={key}
                            className="w-full overflow-x-auto border rounded-md"
                            dangerouslySetInnerHTML={{ __html: content.value }}
                          />
                        );

                      case "json":
                        return (
                          <div key={key} className="w-full">
                            <pre className="bg-zinc-100 dark:bg-zinc-800 p-3 rounded-md text-sm overflow-x-auto">
                              {JSON.stringify(
                                JSON.parse(content.value),
                                null,
                                2
                              )}
                            </pre>
                          </div>
                        );

                      default: // text
                        return (
                          <div
                            key={key}
                            className="whitespace-pre-line break-words w-full"
                          >
                            {content.value}
                          </div>
                        );
                    }
                  })}
                </div>
              )}
            </div>
          ))}
          <div ref={consoleEndRef} />
        </div>
      </div>
    </>
  ) : null;
}
