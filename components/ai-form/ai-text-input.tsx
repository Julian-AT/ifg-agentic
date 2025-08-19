"use client";

import React, {
    useState,
    useRef,
    useEffect,
    useCallback,
    forwardRef,
} from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { CheckIcon, Lightbulb, Loader2 } from "lucide-react";
import { useCompletion } from "@ai-sdk/react";
import { Button } from "@/components/ui/button";
import type { FormField } from "@/lib/types/data-request";

interface AISuggestion {
    text: string;
    confidence: number;
    reasoning?: string;
}

interface AITextInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
    field: FormField;
    value: string;
    onChange: (value: string) => void;
    onSuggestionAccepted?: (suggestion: AISuggestion) => void;
    requestType?: "IFG" | "IWG" | "DZG";
    formContext?: Record<string, any>;
    enableAutoComplete?: boolean;
    className?: string;
    error?: string;
}

export const AITextInput = forwardRef<HTMLInputElement, AITextInputProps>(
    (
        {
            field,
            value,
            onChange,
            onSuggestionAccepted,
            requestType,
            formContext,
            enableAutoComplete = true,
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
        const inputRef = useRef<HTMLInputElement | null>(null);
        const suggestionTimeoutRef = useRef<NodeJS.Timeout>();

        // Use AI completion for real-time suggestions
        const { complete, completion, isLoading } = useCompletion({
            api: "/api/ai/form-completion",
        });

        // Generate AI suggestions based on current input
        const generateSuggestions = useCallback(
            async (inputValue: string) => {
                if (!enableAutoComplete || !field.aiSuggestionEnabled || inputValue.length < 2) {
                    return;
                }

                setIsGeneratingSuggestions(true);

                try {
                    const context = {
                        fieldId: field.id,
                        fieldType: field.type,
                        fieldLabel: field.label,
                        currentValue: inputValue,
                        requestType,
                        formContext,
                        helpText: field.helpText,
                    };

                    const response = await fetch("/api/ai/form-suggestions", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(context),
                    });

                    if (response.ok) {
                        const { suggestions: newSuggestions } = await response.json();
                        setSuggestions(newSuggestions || []);
                        setShowSuggestions((newSuggestions?.length || 0) > 0);
                    }
                } catch (error) {
                    console.error("Error generating suggestions:", error);
                } finally {
                    setIsGeneratingSuggestions(false);
                }
            },
            [enableAutoComplete, field, requestType, formContext]
        );

        // Debounced suggestion generation
        useEffect(() => {
            if (suggestionTimeoutRef.current) {
                clearTimeout(suggestionTimeoutRef.current);
            }

            suggestionTimeoutRef.current = setTimeout(() => {
                generateSuggestions(value);
            }, 300);

            return () => {
                if (suggestionTimeoutRef.current) {
                    clearTimeout(suggestionTimeoutRef.current);
                }
            };
        }, [value, generateSuggestions]);

        // Handle keyboard navigation
        const handleKeyDown = useCallback(
            (e: React.KeyboardEvent<HTMLInputElement>) => {
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
                    case "Enter":
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
                onChange(suggestion.text);
                onSuggestionAccepted?.(suggestion);
                setShowSuggestions(false);
                setSelectedSuggestionIndex(-1);
                setSuggestions([]);
            },
            [onChange, onSuggestionAccepted]
        );

        // Handle input change
        const handleInputChange = useCallback(
            (e: React.ChangeEvent<HTMLInputElement>) => {
                const newValue = e.target.value;
                onChange(newValue);
                setSelectedSuggestionIndex(-1);
            },
            [onChange]
        );

        // Close suggestions when clicking outside
        useEffect(() => {
            const handleClickOutside = (event: MouseEvent) => {
                if (inputRef.current && !inputRef.current.contains(event.target as Node)) {
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
                        <Input
                            ref={(node) => {
                                if (typeof ref === "function") ref(node);
                                else if (ref) ref.current = node;
                                inputRef.current = node;
                            }}
                            id={field.id}
                            value={value}
                            onChange={handleInputChange}
                            onKeyDown={handleKeyDown}
                            placeholder={field.placeholder}
                            className={cn(
                                "transition-colors",
                                error && "border-red-500 focus-visible:ring-red-500",
                                className
                            )}
                            {...props}
                        />

                        {/* AI Suggestions Dropdown */}
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
                                                <span className="flex-1">{suggestion.text}</span>
                                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                    <Badge variant="outline" className="text-xs">
                                                        {Math.round(suggestion.confidence * 100)}%
                                                    </Badge>
                                                    {index === selectedSuggestionIndex && (
                                                        <div className="flex items-center gap-1">
                                                            <kbd className="px-1.5 py-0.5 text-xs font-mono bg-muted rounded">
                                                                Tab
                                                            </kbd>
                                                            <span className="text-xs">to accept</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            {suggestion.reasoning && (
                                                <p className="text-xs text-muted-foreground mt-1 pr-16">
                                                    {suggestion.reasoning}
                                                </p>
                                            )}
                                        </motion.div>
                                    ))}
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

AITextInput.displayName = "AITextInput";