import { memo } from "react";
import { X } from "lucide-react";
import { initialArtifactData, useArtifact } from "@/hooks/use-artifact";
import { Button } from "./ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

function PureArtifactCloseButton() {
  const { setArtifact } = useArtifact();

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          className="h-8 w-8 p-0 dark:hover:bg-zinc-800"
          data-testid="artifact-close-button"
          onClick={() => {
            setArtifact((currentArtifact) =>
              currentArtifact.status === "streaming"
                ? {
                  ...currentArtifact,
                  isVisible: false,
                }
                : { ...initialArtifactData, status: "idle" }
            );
          }}
          size="sm"
          variant="ghost"
        >
          <X className="h-4 w-4 text-muted-foreground" />
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom">Close</TooltipContent>
    </Tooltip>
  );
}

export const ArtifactCloseButton = memo(PureArtifactCloseButton, () => true);
