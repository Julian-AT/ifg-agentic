"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, Loader2, CheckIcon, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { FormField } from "@/lib/types/data-request";

interface AISuggestion {
    value: string;
    label: string;
    confidence: number;
    reasoning: string;
    isRecommended?: boolean;
}

interface AISelectProps {
    field: FormField;
    value: string;
    onChange: (value: string) => void;
    onSuggestionAccepted?: (suggestion: AISuggestion) => void;
    requestType?: "IFG" | "IWG" | "DZG";
    formContext?: Record<string, any>;
    enableAISuggestions?: boolean;
    className?: string;
    error?: string;
}

export function AISelect({
    field,
    value,
    onChange,
    onSuggestionAccepted,
    requestType,
    formContext,
    enableAISuggestions = true,
    className,
    error,
}: AISelectProps) {
    const [aiSuggestions, setAiSuggestions] = useState<AISuggestion[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isGeneratingSuggestions, setIsGeneratingSuggestions] = useState(false);
    const [recommendedOption, setRecommendedOption] = useState<AISuggestion | null>(null);

    // Combine predefined options with AI suggestions
    const allOptions = [
        ...(field.options || []).map(opt => ({
            value: opt.value,
            label: opt.label,
            confidence: 1,
            reasoning: "Predefined option",
        })),
        ...aiSuggestions,
    ];

    // Generate AI suggestions for additional relevant options
    const generateSuggestions = useCallback(
        async () => {
            if (!enableAISuggestions || !field.aiSuggestionEnabled) {
                return;
            }

            setIsGeneratingSuggestions(true);

            try {
                const context = {
                    fieldId: field.id,
                    fieldType: field.type,
                    fieldLabel: field.label,
                    existingOptions: field.options,
                    requestType,
                    formContext,
                    helpText: field.helpText,
                };

                const response = await fetch("/api/ai/field-options", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(context),
                });

                if (response.ok) {
                    const { suggestions, recommended } = await response.json();
                    if (suggestions && suggestions.length > 0) {
                        setAiSuggestions(suggestions);
                        if (recommended) {
                            setRecommendedOption(recommended);
                            setShowSuggestions(true);
                        }
                    }
                }
            } catch (error) {
                console.error("Error generating select suggestions:", error);
            } finally {
                setIsGeneratingSuggestions(false);
            }
        },
        [enableAISuggestions, field, requestType, formContext]
    );

    // Generate suggestions when form context changes
    useEffect(() => {
        if (formContext && Object.keys(formContext).length > 0) {
            generateSuggestions();
        }
    }, [formContext, generateSuggestions]);

    // Handle option selection
    const handleValueChange = useCallback(
        (newValue: string) => {
            onChange(newValue);

            // Find the selected option for suggestion callback
            const selectedOption = allOptions.find(opt => opt.value === newValue);
            if (selectedOption && onSuggestionAccepted) {
                onSuggestionAccepted(selectedOption as AISuggestion);
            }

            setShowSuggestions(false);
        },
        [onChange, onSuggestionAccepted, allOptions]
    );

    // Accept recommended option
    const acceptRecommendation = useCallback(() => {
        if (recommendedOption) {
            handleValueChange(recommendedOption.value);
            setRecommendedOption(null);
        }
    }, [recommendedOption, handleValueChange]);

    // Get display label for current value
    const getDisplayLabel = (val: string) => {
        const option = allOptions.find(opt => opt.value === val);
        return option?.label || val;
    };

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
                    <Select value={value} onValueChange={handleValueChange}>
                        <SelectTrigger
                            className={cn(
                                "transition-colors",
                                error && "border-red-500 focus:ring-red-500",
                                className
                            )}
                        >
                            <SelectValue
                                placeholder={field.placeholder || `Select ${field.label.toLowerCase()}...`}
                            />
                        </SelectTrigger>
                        <SelectContent>
                            {allOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                    <div className="flex items-center justify-between w-full">
                                        <span>{option.label}</span>
                                        {option.confidence < 1 && (
                                            <Badge variant="outline" className="text-xs ml-2">
                                                AI: {Math.round(option.confidence * 100)}%
                                            </Badge>
                                        )}
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {/* AI Recommendation Popup */}
                    <AnimatePresence>
                        {showSuggestions && recommendedOption && !value && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                transition={{ duration: 0.2 }}
                                className="absolute top-full left-0 right-0 z-50 mt-1 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20 border border-green-200 dark:border-green-800 rounded-md shadow-lg p-4"
                            >
                                <div className="flex items-start gap-3">
                                    <Sparkles className="w-5 h-5 text-green-500 mt-0.5" />
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <h4 className="text-sm font-medium text-green-700 dark:text-green-300">
                                                AI Recommendation
                                            </h4>
                                            <Badge variant="outline" className="text-xs">
                                                {Math.round(recommendedOption.confidence * 100)}% match
                                            </Badge>
                                        </div>
                                        <p className="text-sm font-medium mb-1">
                                            {recommendedOption.label}
                                        </p>
                                        <p className="text-xs text-muted-foreground mb-3">
                                            {recommendedOption.reasoning}
                                        </p>
                                        <div className="flex gap-2">
                                            <Button
                                                size="sm"
                                                onClick={acceptRecommendation}
                                                className="text-xs"
                                            >
                                                <CheckIcon className="w-3 h-3 mr-1" />
                                                Accept Recommendation
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => setShowSuggestions(false)}
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