"use client";

import React, {
    useState,
    useRef,
    useEffect,
    useCallback,
    forwardRef,
} from "react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { CheckIcon, Lightbulb, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { FormField } from "@/lib/types/data-request";

interface AISuggestion {
    text: string;
    confidence: number;
    reasoning?: string;
    type: "completion" | "enhancement" | "template";
}

interface AITextareaProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'onChange'> {
    field: FormField;
    value: string;
    onChange: (value: string) => void;
    onSuggestionAccepted?: (suggestion: AISuggestion) => void;
    requestType?: "IFG" | "IWG" | "DZG";
    formContext?: Record<string, any>;
    enableAutoComplete?: boolean;
    enableEnhancement?: boolean;
    className?: string;
    error?: string;
}

export const AITextarea = forwardRef<HTMLTextAreaElement, AITextareaProps>(
    (
        {
            field,
            value,
            onChange,
            onSuggestionAccepted,
            requestType,
            formContext,
            enableAutoComplete = true,
            enableEnhancement = true,
            className,
            error,
            ...props
        },
        ref
    ) => {
        const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
        const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
        const [showSuggestions, setShowSuggestions] = useState(false);
        const [isGeneratingSuggestions, setIsGeneratingSuggestions] = useState(false);
        const [enhancementSuggestion, setEnhancementSuggestion] = useState<AISuggestion | null>(null);
        const [showEnhancement, setShowEnhancement] = useState(false);
        const textareaRef = useRef<HTMLTextAreaElement>(null);
        const suggestionTimeoutRef = useRef<NodeJS.Timeout>();
        const enhancementTimeoutRef = useRef<NodeJS.Timeout>();

        // Auto-resize textarea
        const adjustHeight = useCallback(() => {
            if (textareaRef.current) {
                textareaRef.current.style.height = 'auto';
                textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
            }
        }, []);

        useEffect(() => {
            adjustHeight();
        }, [value, adjustHeight]);

        // Generate AI completions for partial text
        const generateCompletions = useCallback(
            async (inputValue: string, cursorPosition: number) => {
                if (!enableAutoComplete || !field.aiSuggestionEnabled || inputValue.length < 10) {
                    return;
                }

                setIsGeneratingSuggestions(true);

                try {
                    const textBeforeCursor = inputValue.substring(0, cursorPosition);
                    const textAfterCursor = inputValue.substring(cursorPosition);

                    const context = {
                        fieldId: field.id,
                        fieldType: field.type,
                        fieldLabel: field.label,
                        textBeforeCursor,
                        textAfterCursor,
                        requestType,
                        formContext,
                        helpText: field.helpText,
                    };

                    const response = await fetch("/api/ai/form-completion", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(context),
                    });

                    if (response.ok) {
                        const { completions } = await response.json();
                        if (completions && completions.length > 0) {
                            setSuggestions(completions.map((completion: string, index: number) => ({
                                text: completion,
                                confidence: Math.max(0.9 - index * 0.1, 0.5),
                                type: "completion" as const,
                            })));
                            setShowSuggestions(true);
                        }
                    }
                } catch (error) {
                    console.error("Error generating completions:", error);
                } finally {
                    setIsGeneratingSuggestions(false);
                }
            },
            [enableAutoComplete, field, requestType, formContext]
        );

        // Generate AI enhancement suggestions for complete text
        const generateEnhancement = useCallback(
            async (inputValue: string) => {
                if (!enableEnhancement || !field.aiSuggestionEnabled || inputValue.length < 50) {
                    return;
                }

                try {
                    const context = {
                        fieldId: field.id,
                        fieldType: field.type,
                        fieldLabel: field.label,
                        currentText: inputValue,
                        requestType,
                        formContext,
                        helpText: field.helpText,
                    };

                    const response = await fetch("/api/ai/form-enhancement", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(context),
                    });

                    if (response.ok) {
                        const { enhancement } = await response.json();
                        if (enhancement && enhancement.text !== inputValue) {
                            setEnhancementSuggestion({
                                text: enhancement.text,
                                confidence: enhancement.confidence || 0.8,
                                reasoning: enhancement.reasoning,
                                type: "enhancement",
                            });
                            setShowEnhancement(true);
                        }
                    }
                } catch (error) {
                    console.error("Error generating enhancement:", error);
                }
            },
            [enableEnhancement, field, requestType, formContext]
        );

        // Debounced completion generation
        useEffect(() => {
            if (suggestionTimeoutRef.current) {
                clearTimeout(suggestionTimeoutRef.current);
            }

            if (textareaRef.current) {
                const cursorPosition = textareaRef.current.selectionStart;
                suggestionTimeoutRef.current = setTimeout(() => {
                    generateCompletions(value, cursorPosition);
                }, 500);
            }

            return () => {
                if (suggestionTimeoutRef.current) {
                    clearTimeout(suggestionTimeoutRef.current);
                }
            };
        }, [value, generateCompletions]);

        // Debounced enhancement generation
        useEffect(() => {
            if (enhancementTimeoutRef.current) {
                clearTimeout(enhancementTimeoutRef.current);
            }

            enhancementTimeoutRef.current = setTimeout(() => {
                generateEnhancement(value);
            }, 2000);

            return () => {
                if (enhancementTimeoutRef.current) {
                    clearTimeout(enhancementTimeoutRef.current);
                }
            };
        }, [value, generateEnhancement]);

        // Handle keyboard navigation
        const handleKeyDown = useCallback(
            (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
                if (!showSuggestions || suggestions.length === 0) return;

                switch (e.key) {
                    case "ArrowDown":
                        e.preventDefault();
                        setSelectedSuggestionIndex((prev) =>
                            prev < suggestions.length - 1 ? prev + 1 : 0
                        );
                        break;
                    case "ArrowUp":
                        e.preventDefault();
                        setSelectedSuggestionIndex((prev) =>
                            prev > 0 ? prev - 1 : suggestions.length - 1
                        );
                        break;
                    case "Tab":
                        if (selectedSuggestionIndex >= 0) {
                            e.preventDefault();
                            acceptSuggestion(suggestions[selectedSuggestionIndex]);
                        }
                        break;
                    case "Escape":
                        setShowSuggestions(false);
                        setSelectedSuggestionIndex(-1);
                        break;
                }
            },
            [showSuggestions, suggestions, selectedSuggestionIndex]
        );

        // Accept a suggestion
        const acceptSuggestion = useCallback(
            (suggestion: AISuggestion) => {
                if (suggestion.type === "completion" && textareaRef.current) {
                    const cursorPosition = textareaRef.current.selectionStart;
                    const newValue = value.substring(0, cursorPosition) + suggestion.text;
                    onChange(newValue);
                } else {
                    onChange(suggestion.text);
                }

                onSuggestionAccepted?.(suggestion);
                setShowSuggestions(false);
                setSelectedSuggestionIndex(-1);
                setSuggestions([]);
            },
            [value, onChange, onSuggestionAccepted]
        );

        // Accept enhancement
        const acceptEnhancement = useCallback(() => {
            if (enhancementSuggestion) {
                onChange(enhancementSuggestion.text);
                onSuggestionAccepted?.(enhancementSuggestion);
                setEnhancementSuggestion(null);
                setShowEnhancement(false);
            }
        }, [enhancementSuggestion, onChange, onSuggestionAccepted]);

        // Handle input change
        const handleInputChange = useCallback(
            (e: React.ChangeEvent<HTMLTextAreaElement>) => {
                const newValue = e.target.value;
                onChange(newValue);
                setSelectedSuggestionIndex(-1);
                setShowEnhancement(false);
            },
            [onChange]
        );

        // Close suggestions when clicking outside
        useEffect(() => {
            const handleClickOutside = (event: MouseEvent) => {
                if (textareaRef.current && !textareaRef.current.contains(event.target as Node)) {
                    setShowSuggestions(false);
                }
            };

            document.addEventListener("mousedown", handleClickOutside);
            return () => document.removeEventListener("mousedown", handleClickOutside);
        }, []);

        return (
            <div className="relative w-full">
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                        <Label htmlFor={field.id} className="text-sm font-medium">
                            {field.label}
                            {field.required && <span className="text-red-500 ml-1">*</span>}
                        </Label>
                        {field.aiSuggestionEnabled && (
                            <Badge variant="secondary" className="text-xs px-2 py-0.5">
                                <Lightbulb className="w-3 h-3 mr-1" />
                                AI
                            </Badge>
                        )}
                        {isGeneratingSuggestions && (
                            <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                        )}
                    </div>

                    {field.helpText && (
                        <p className="text-xs text-muted-foreground">{field.helpText}</p>
                    )}

                    <div className="relative">
                        <Textarea
                            ref={(node) => {
                                if (typeof ref === "function") ref(node);
                                else if (ref) ref.current = node;
                                textareaRef.current = node;
                            }}
                            id={field.id}
                            value={value}
                            onChange={handleInputChange}
                            onKeyDown={handleKeyDown}
                            placeholder={field.placeholder}
                            className={cn(
                                "transition-colors resize-none overflow-hidden",
                                error && "border-red-500 focus-visible:ring-red-500",
                                className
                            )}
                            rows={3}
                            {...props}
                        />

                        {/* AI Completions Dropdown */}
                        <AnimatePresence>
                            {showSuggestions && suggestions.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.15 }}
                                    className="absolute top-full left-0 right-0 z-50 mt-1 bg-background border border-border rounded-md shadow-lg max-h-48 overflow-y-auto"
                                >
                                    {suggestions.map((suggestion, index) => (
                                        <motion.div
                                            key={index}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: index * 0.05 }}
                                            className={cn(
                                                "px-3 py-2 cursor-pointer transition-colors text-sm",
                                                index === selectedSuggestionIndex
                                                    ? "bg-accent text-accent-foreground"
                                                    : "hover:bg-accent/50"
                                            )}
                                            onClick={() => acceptSuggestion(suggestion)}
                                            onMouseEnter={() => setSelectedSuggestionIndex(index)}
                                        >
                                            <div className="flex items-start justify-between gap-2">
                                                <span className="flex-1 font-mono text-xs">{suggestion.text}</span>
                                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                    <Badge variant="outline" className="text-xs">
                                                        {Math.round(suggestion.confidence * 100)}%
                                                    </Badge>
                                                    {index === selectedSuggestionIndex && (
                                                        <div className="flex items-center gap-1">
                                                            <kbd className="px-1.5 py-0.5 text-xs font-mono bg-muted rounded">
                                                                Tab
                                                            </kbd>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* AI Enhancement Suggestion */}
                        <AnimatePresence>
                            {showEnhancement && enhancementSuggestion && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    transition={{ duration: 0.2 }}
                                    className="absolute top-full left-0 right-0 z-40 mt-1 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border border-blue-200 dark:border-blue-800 rounded-md shadow-lg p-4"
                                >
                                    <div className="flex items-start gap-3">
                                        <Sparkles className="w-5 h-5 text-blue-500 mt-0.5" />
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <h4 className="text-sm font-medium text-blue-700 dark:text-blue-300">
                                                    AI Enhancement Suggestion
                                                </h4>
                                                <Badge variant="outline" className="text-xs">
                                                    {Math.round(enhancementSuggestion.confidence * 100)}%
                                                </Badge>
                                            </div>
                                            {enhancementSuggestion.reasoning && (
                                                <p className="text-xs text-muted-foreground mb-3">
                                                    {enhancementSuggestion.reasoning}
                                                </p>
                                            )}
                                            <div className="bg-background/60 rounded border p-3 mb-3">
                                                <p className="text-sm whitespace-pre-wrap">
                                                    {enhancementSuggestion.text}
                                                </p>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button
                                                    size="sm"
                                                    onClick={acceptEnhancement}
                                                    className="text-xs"
                                                >
                                                    <CheckIcon className="w-3 h-3 mr-1" />
                                                    Accept Enhancement
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => setShowEnhancement(false)}
                                                    className="text-xs"
                                                >
                                                    Dismiss
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {error && (
                        <motion.p
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-xs text-red-500"
                        >
                            {error}
                        </motion.p>
                    )}
                </div>
            </div>
        );
    }
);

AITextarea.displayName = "AITextarea";