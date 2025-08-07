import { Artifact } from "@/components/create-artifact";
import { CodeEditor } from "@/components/code-editor";
import {
  CopyIcon,
  LogsIcon,
  MessageIcon,
  PlayIcon,
  RedoIcon,
  UndoIcon,
} from "@/components/icons";
import { toast } from "sonner";
import { generateUUID } from "@/lib/utils";
import {
  Console,
  type ConsoleOutput,
  type ConsoleOutputContent,
} from "@/components/console";

const OUTPUT_HANDLERS = {
  matplotlib: `
    import io
    import base64
    from matplotlib import pyplot as plt

    # Clear any existing plots
    plt.clf()
    plt.close('all')

    # Switch to agg backend
    plt.switch_backend('agg')

    def setup_matplotlib_output():
        def custom_show():
            if plt.gcf().get_size_inches().prod() * plt.gcf().dpi ** 2 > 25_000_000:
                print("Warning: Plot size too large, reducing quality")
                plt.gcf().set_dpi(100)

            png_buf = io.BytesIO()
            plt.savefig(png_buf, format='png')
            png_buf.seek(0)
            png_base64 = base64.b64encode(png_buf.read()).decode('utf-8')
            print(f'data:image/png;base64,{png_base64}')
            png_buf.close()

            plt.clf()
            plt.close('all')

        plt.show = custom_show
  `,
  pandas: `
    import pyodide_http
    pyodide_http.patch_all()  # Patch all libraries
    import pandas as pd
    import io

    original_read_csv = pd.read_csv

    async def read_csv(filepath_or_buffer, **kwargs):
        if isinstance(filepath_or_buffer, str) and (filepath_or_buffer.startswith('http://') or filepath_or_buffer.startswith('https://')):
            import js
            proxy_url = f"https://whateverorigin.org/get?url={js.encodeURIComponent(filepath_or_buffer)}"
            response = await js.fetch(proxy_url)
            if response.status != 200:
                raise Exception(f"Failed to fetch data: HTTP {response.status}")
            json_data = await response.json()
            data = json_data.contents
            return original_read_csv(io.StringIO(data), **kwargs)
        else:
            return original_read_csv(filepath_or_buffer, **kwargs)

    pd.read_csv = read_csv
  `,
  basic: `
    # Basic output capture setup
  `,
};

function detectRequiredHandlers(code: string): string[] {
  const handlers: string[] = ["basic"];

  if (code.includes("matplotlib") || code.includes("plt.")) {
    handlers.push("matplotlib");
  }

  if (
    code.includes("pandas") ||
    code.includes("pd.") ||
    code.includes("read_csv")
  ) {
    handlers.push("pandas");
  }

  return handlers;
}

interface Metadata {
  outputs: Array<ConsoleOutput>;
}

export const codeArtifact = new Artifact<"code", Metadata>({
  kind: "code",
  description:
    "Useful for code generation; Code execution is only available for python code.",
  initialize: async ({ setMetadata }) => {
    setMetadata({
      outputs: [],
    });
  },
  onStreamPart: ({ streamPart, setArtifact }) => {
    if (streamPart.type === "data-codeDelta") {
      setArtifact((draftArtifact) => ({
        ...draftArtifact,
        content: streamPart.data,
        isVisible:
          draftArtifact.status === "streaming" &&
          draftArtifact.content.length > 300 &&
          draftArtifact.content.length < 310
            ? true
            : draftArtifact.isVisible,
        status: "streaming",
      }));
    }
  },
  content: ({ metadata, setMetadata, ...props }) => {
    return (
      <>
        <div className="px-1">
          <CodeEditor {...props} />
        </div>

        {metadata?.outputs && (
          <Console
            consoleOutputs={metadata.outputs}
            setConsoleOutputs={() => {
              setMetadata({
                ...metadata,
                outputs: [],
              });
            }}
          />
        )}
      </>
    );
  },
  actions: [
    {
      icon: <PlayIcon size={18} />,
      label: "Run",
      description: "Execute code",
      onClick: async ({ content, setMetadata }) => {
        const runId = generateUUID();
        const outputContent: Array<ConsoleOutputContent> = [];

        setMetadata((metadata) => ({
          ...metadata,
          outputs: [
            ...metadata.outputs,
            {
              id: runId,
              contents: [],
              status: "in_progress",
            },
          ],
        }));

        try {
          // @ts-expect-error - loadPyodide is not defined
          const currentPyodideInstance = await globalThis.loadPyodide({
            indexURL: "https://cdn.jsdelivr.net/pyodide/v0.23.4/full/",
          });

          currentPyodideInstance.setStdout({
            batched: (output: string) => {
              outputContent.push({
                type: output.startsWith("data:image/png;base64")
                  ? "image"
                  : "text",
                value: output,
              });
            },
          });

          await currentPyodideInstance.loadPackage("pyodide-http");
          await currentPyodideInstance.loadPackage("pandas");
          await currentPyodideInstance.loadPackage("matplotlib");

          await currentPyodideInstance.runPythonAsync(
            "import pyodide_http\npyodide_http.patch_all()"
          );

          await currentPyodideInstance.runPythonAsync("print('test')");

          await currentPyodideInstance.loadPackagesFromImports(content, {
            messageCallback: (message: string) => {
              setMetadata((metadata) => ({
                ...metadata,
                outputs: [
                  ...metadata.outputs.filter((output) => output.id !== runId),
                  {
                    id: runId,
                    contents: [{ type: "text", value: message }],
                    status: "loading_packages",
                  },
                ],
              }));
            },
          });

          let processedContent = content;

          console.log(processedContent);

          processedContent = processedContent.replace(
            /(?<!await\s+)pd\.read_csv\s*\(/g,
            "await pd.read_csv("
          );

          // if (!/async\s+def\s+main\s*\(/.test(processedContent)) {
          //   const indented = processedContent
          //     .split("\n")
          //     .map((line) => `    ${line}`)
          //     .join("\n");
          //   processedContent = `async def main():\n${indented}\nawait main()`;
          // }

          const requiredHandlers = detectRequiredHandlers(content);
          for (const handler of requiredHandlers) {
            if (OUTPUT_HANDLERS[handler as keyof typeof OUTPUT_HANDLERS]) {
              await currentPyodideInstance.runPythonAsync(
                OUTPUT_HANDLERS[handler as keyof typeof OUTPUT_HANDLERS]
              );

              if (handler === "matplotlib") {
                await currentPyodideInstance.runPythonAsync(
                  "setup_matplotlib_output()"
                );
              }

              if (handler === "pandas") {
                await currentPyodideInstance.runPythonAsync(`
                  print("Pandas handler loaded. Use fetch_csv_from_url(url) to fetch CSV data from URLs.")
                `);
              }
            }
          }

          try {
            await currentPyodideInstance.runPythonAsync(processedContent);
          } catch (error: any) {
            setMetadata((metadata) => ({
              ...metadata,
              outputs: [
                ...metadata.outputs.filter((output) => output.id !== runId),
              ],
            }));
          }

          setMetadata((metadata) => ({
            ...metadata,
            outputs: [
              ...metadata.outputs.filter((output) => output.id !== runId),
              {
                id: runId,
                contents: outputContent,
                status: "completed",
              },
            ],
          }));
        } catch (error: any) {
          setMetadata((metadata) => ({
            ...metadata,
            outputs: [
              ...metadata.outputs.filter((output) => output.id !== runId),
              {
                id: runId,
                contents: [{ type: "text", value: error.message }],
                status: "failed",
              },
            ],
          }));
        }
      },
    },
    {
      icon: <UndoIcon size={18} />,
      description: "View Previous version",
      onClick: ({ handleVersionChange }) => {
        handleVersionChange("prev");
      },
      isDisabled: ({ currentVersionIndex }) => {
        if (currentVersionIndex === 0) {
          return true;
        }

        return false;
      },
    },
    {
      icon: <RedoIcon size={18} />,
      description: "View Next version",
      onClick: ({ handleVersionChange }) => {
        handleVersionChange("next");
      },
      isDisabled: ({ isCurrentVersion }) => {
        if (isCurrentVersion) {
          return true;
        }

        return false;
      },
    },
    {
      icon: <CopyIcon size={18} />,
      description: "Copy code to clipboard",
      onClick: ({ content }) => {
        navigator.clipboard.writeText(content);
        toast.success("Copied to clipboard!");
      },
    },
  ],
  toolbar: [
    {
      icon: <MessageIcon />,
      description: "Code Kommentare",
      onClick: ({ sendMessage }) => {
        sendMessage({
          role: "user",
          parts: [
            {
              type: "text",
              text: "Füge Kommentare zum Code hinzu, um ihn besser zu verstehen",
            },
          ],
        });
      },
    },
    {
      icon: <LogsIcon />,
      description: "Code Dokumentation",
      onClick: ({ sendMessage }) => {
        sendMessage({
          role: "user",
          parts: [
            {
              type: "text",
              text: "Dokumentiere den Code",
            },
          ],
        });
      },
    },
  ],
});
