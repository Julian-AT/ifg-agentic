import { forwardRef, type HTMLAttributes, type ComponentProps } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { LucideIcon } from "lucide-react";

// Artifact Container
const Artifact = forwardRef<
    HTMLDivElement,
    HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn(
            "flex flex-col overflow-hidden rounded-lg border border-border bg-card shadow-sm",
            className
        )}
        {...props}
    />
));
Artifact.displayName = "Artifact";

// Artifact Header
const ArtifactHeader = forwardRef<
    HTMLDivElement,
    HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn(
            "flex items-center justify-between gap-4 border-border border-b bg-card px-4 py-3",
            className
        )}
        {...props}
    />
));
ArtifactHeader.displayName = "ArtifactHeader";

// Artifact Title
const ArtifactTitle = forwardRef<
    HTMLParagraphElement,
    HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
    <p
        ref={ref}
        className={cn("font-semibold text-base leading-tight", className)}
        {...props}
    />
));
ArtifactTitle.displayName = "ArtifactTitle";

// Artifact Description
const ArtifactDescription = forwardRef<
    HTMLParagraphElement,
    HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
    <p
        ref={ref}
        className={cn("text-muted-foreground text-xs", className)}
        {...props}
    />
));
ArtifactDescription.displayName = "ArtifactDescription";

// Artifact Actions Container
const ArtifactActions = forwardRef<
    HTMLDivElement,
    HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn("flex items-center gap-1.5", className)}
        {...props}
    />
));
ArtifactActions.displayName = "ArtifactActions";

// Artifact Action Button
interface ArtifactActionProps extends ComponentProps<typeof Button> {
    tooltip?: string;
    label?: string;
    icon?: LucideIcon;
}

const ArtifactAction = forwardRef<HTMLButtonElement, ArtifactActionProps>(
    ({ tooltip, label, icon: Icon, className, children, ...props }, ref) => {
        const button = (
            <Button
                ref={ref}
                size="sm"
                variant="ghost"
                className={cn(
                    "h-8 transition-colors dark:hover:bg-zinc-800",
                    !label && "w-8 p-0",
                    label && "px-3",
                    className
                )}
                {...props}
            >
                {Icon && (
                    <Icon className="h-4 w-4 text-muted-foreground group-hover:text-foreground" />
                )}
                {label && <span className="ml-2 text-xs">{label}</span>}
                {children}
            </Button>
        );

        if (tooltip) {
            return (
                <Tooltip>
                    <TooltipTrigger asChild>{button}</TooltipTrigger>
                    <TooltipContent side="bottom">{tooltip}</TooltipContent>
                </Tooltip>
            );
        }

        return button;
    }
);
ArtifactAction.displayName = "ArtifactAction";

// Artifact Close Button
const ArtifactClose = forwardRef<
    HTMLButtonElement,
    ComponentProps<typeof Button>
>(({ className, ...props }, ref) => (
    <Button
        ref={ref}
        size="sm"
        variant="ghost"
        className={cn("h-8 w-8 p-0 dark:hover:bg-zinc-800", className)}
        {...props}
    />
));
ArtifactClose.displayName = "ArtifactClose";

// Artifact Content
const ArtifactContent = forwardRef<
    HTMLDivElement,
    HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn("flex-1 overflow-auto", className)}
        {...props}
    />
));
ArtifactContent.displayName = "ArtifactContent";

export {
    Artifact,
    ArtifactHeader,
    ArtifactTitle,
    ArtifactDescription,
    ArtifactActions,
    ArtifactAction,
    ArtifactClose,
    ArtifactContent,
};


