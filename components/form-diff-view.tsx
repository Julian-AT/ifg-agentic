"use client";

import type React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckIcon, XIcon, EyeIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface FormDiff {
    field: string;
    oldValue: string;
    newValue: string;
    label: string;
}

interface FormDiffViewProps {
    diffs: FormDiff[];
    onAccept: (field: string) => void;
    onReject: (field: string) => void;
    onAcceptAll: () => void;
    onRejectAll: () => void;
    className?: string;
}

export function FormDiffView({
    diffs,
    onAccept,
    onReject,
    onAcceptAll,
    onRejectAll,
    className,
}: FormDiffViewProps) {
    if (diffs.length === 0) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={cn("w-full space-y-4", className)}
        >
            <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950/20">
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <EyeIcon className="h-5 w-5 text-orange-600" />
                            AI Form Changes
                            <Badge variant="outline" className="text-orange-600">
                                {diffs.length} changes
                            </Badge>
                        </CardTitle>
                        <div className="flex gap-2">
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={onAcceptAll}
                                className="border-green-200 text-green-600 hover:bg-green-50"
                            >
                                <CheckIcon className="mr-1 h-4 w-4" />
                                Accept All
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={onRejectAll}
                                className="border-red-200 text-red-600 hover:bg-red-50"
                            >
                                <XIcon className="mr-1 h-4 w-4" />
                                Reject All
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <AnimatePresence>
                        {diffs.map((diff, index) => (
                            <motion.div
                                key={diff.field}
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <DiffItem
                                    diff={diff}
                                    onAccept={() => onAccept(diff.field)}
                                    onReject={() => onReject(diff.field)}
                                />
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </CardContent>
            </Card>
        </motion.div>
    );
}

interface DiffItemProps {
    diff: FormDiff;
    onAccept: () => void;
    onReject: () => void;
}

function DiffItem({ diff, onAccept, onReject }: DiffItemProps) {
    return (
        <div className="rounded-lg border border-orange-200 bg-background/60 p-4">
            <div className="mb-3 flex items-center justify-between">
                <h4 className="font-medium text-sm">{diff.label}</h4>
                <div className="flex gap-2">
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={onAccept}
                        className="h-7 border-green-200 px-2 text-green-600 hover:bg-green-50"
                    >
                        <CheckIcon className="mr-1 h-3 w-3" />
                        Accept
                    </Button>
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={onReject}
                        className="h-7 border-red-200 px-2 text-red-600 hover:bg-red-50"
                    >
                        <XIcon className="mr-1 h-3 w-3" />
                        Reject
                    </Button>
                </div>
            </div>

            <div className="space-y-2">
                {/* Old Value */}
                {diff.oldValue && (
                    <div className="rounded border border-red-200 bg-red-50 p-3 dark:bg-red-950/20">
                        <div className="mb-2 flex items-center gap-2">
                            <Badge variant="destructive" className="text-xs">
                                Current
                            </Badge>
                        </div>
                        <pre className="whitespace-pre-wrap text-red-800 text-sm dark:text-red-200">
                            {diff.oldValue}
                        </pre>
                    </div>
                )}

                {/* New Value */}
                <div className="rounded border border-green-200 bg-green-50 p-3 dark:bg-green-950/20">
                    <div className="mb-2 flex items-center gap-2">
                        <Badge variant="default" className="bg-green-600 text-xs">
                            AI Suggestion
                        </Badge>
                    </div>
                    <pre className="whitespace-pre-wrap text-green-800 text-sm dark:text-green-200">
                        {diff.newValue}
                    </pre>
                </div>
            </div>

            {/* Diff Visualization */}
            <div className="mt-3 rounded bg-muted/50 p-3">
                <div className="mb-2 text-muted-foreground text-xs">Changes:</div>
                <DiffText oldText={diff.oldValue} newText={diff.newValue} />
            </div>
        </div>
    );
}

interface DiffTextProps {
    oldText: string;
    newText: string;
}

function DiffText({ oldText, newText }: DiffTextProps) {
    // Simple word-level diff visualization
    const oldWords = oldText ? oldText.split(/\s+/) : [];
    const newWords = newText ? newText.split(/\s+/) : [];

    // Basic diff algorithm (can be enhanced with proper diff library)
    const maxLength = Math.max(oldWords.length, newWords.length);
    const elements: React.ReactNode[] = [];

    for (let i = 0; i < maxLength; i++) {
        const oldWord = oldWords[i];
        const newWord = newWords[i];

        if (oldWord === newWord) {
            // Unchanged
            if (oldWord) {
                elements.push(
                    <span key={`same-${i}`} className="text-muted-foreground">
                        {oldWord}{" "}
                    </span>
                );
            }
        } else {
            // Changed
            if (oldWord) {
                elements.push(
                    <span
                        key={`removed-${i}`}
                        className="bg-red-200 text-red-800 line-through dark:bg-red-900/30 dark:text-red-200"
                    >
                        {oldWord}{" "}
                    </span>
                );
            }
            if (newWord) {
                elements.push(
                    <span
                        key={`added-${i}`}
                        className="bg-green-200 text-green-800 dark:bg-green-900/30 dark:text-green-200"
                    >
                        {newWord}{" "}
                    </span>
                );
            }
        }
    }

    return (
        <div className="font-mono text-sm leading-relaxed">
            {elements.length > 0 ? elements : <span className="text-muted-foreground">No changes</span>}
        </div>
    );
}