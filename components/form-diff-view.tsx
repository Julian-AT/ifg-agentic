"use client";

import React from "react";
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
                        <CardTitle className="text-lg flex items-center gap-2">
                            <EyeIcon className="w-5 h-5 text-orange-600" />
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
                                className="text-green-600 border-green-200 hover:bg-green-50"
                            >
                                <CheckIcon className="w-4 h-4 mr-1" />
                                Accept All
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={onRejectAll}
                                className="text-red-600 border-red-200 hover:bg-red-50"
                            >
                                <XIcon className="w-4 h-4 mr-1" />
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
        <div className="border border-orange-200 rounded-lg p-4 bg-background/60">
            <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-sm">{diff.label}</h4>
                <div className="flex gap-2">
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={onAccept}
                        className="text-green-600 border-green-200 hover:bg-green-50 h-7 px-2"
                    >
                        <CheckIcon className="w-3 h-3 mr-1" />
                        Accept
                    </Button>
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={onReject}
                        className="text-red-600 border-red-200 hover:bg-red-50 h-7 px-2"
                    >
                        <XIcon className="w-3 h-3 mr-1" />
                        Reject
                    </Button>
                </div>
            </div>

            <div className="space-y-2">
                {/* Old Value */}
                {diff.oldValue && (
                    <div className="p-3 rounded border border-red-200 bg-red-50 dark:bg-red-950/20">
                        <div className="flex items-center gap-2 mb-2">
                            <Badge variant="destructive" className="text-xs">
                                Current
                            </Badge>
                        </div>
                        <pre className="text-sm whitespace-pre-wrap text-red-800 dark:text-red-200">
                            {diff.oldValue}
                        </pre>
                    </div>
                )}

                {/* New Value */}
                <div className="p-3 rounded border border-green-200 bg-green-50 dark:bg-green-950/20">
                    <div className="flex items-center gap-2 mb-2">
                        <Badge variant="default" className="text-xs bg-green-600">
                            AI Suggestion
                        </Badge>
                    </div>
                    <pre className="text-sm whitespace-pre-wrap text-green-800 dark:text-green-200">
                        {diff.newValue}
                    </pre>
                </div>
            </div>

            {/* Diff Visualization */}
            <div className="mt-3 p-3 rounded bg-muted/50">
                <div className="text-xs text-muted-foreground mb-2">Changes:</div>
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
                        className="bg-red-200 dark:bg-red-900/30 text-red-800 dark:text-red-200 line-through"
                    >
                        {oldWord}{" "}
                    </span>
                );
            }
            if (newWord) {
                elements.push(
                    <span
                        key={`added-${i}`}
                        className="bg-green-200 dark:bg-green-900/30 text-green-800 dark:text-green-200"
                    >
                        {newWord}{" "}
                    </span>
                );
            }
        }
    }

    return (
        <div className="text-sm font-mono leading-relaxed">
            {elements.length > 0 ? elements : <span className="text-muted-foreground">No changes</span>}
        </div>
    );
}