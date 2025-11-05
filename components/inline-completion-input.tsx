"use client";

import type React from "react";
import { useState, useEffect, useRef, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type InlineCompletionInputProps = {
    id: string;
    label: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    type?: "input" | "textarea";
    rows?: number;
    required?: boolean;
    disabled?: boolean;
    className?: string;
    error?: string;
    context?: {
        fieldType?: string;
        requestType?: string;
        formData?: Record<string, any>;
        originalPrompt?: string;
    };
};

export function InlineCompletionInput({
    id,
    label,
    value,
    onChange,
    placeholder,
    type = "input",
    rows = 3,
    required = false,
    disabled = false,
    className,
    error,
    context,
}: InlineCompletionInputProps) {
    const [completion, setCompletion] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [lastValue, setLastValue] = useState(value);
    const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
    const abortControllerRef = useRef<AbortController | null>(null);

    const fetchCompletion = useCallback(
        async (text: string) => {
            if (!text.trim() || disabled) {
                setCompletion("");
                return;
            }

            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }

            const controller = new AbortController();
            abortControllerRef.current = controller;

            try {
                setIsLoading(true);
                const response = await fetch("/api/completion", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ text, context }),
                    signal: controller.signal,
                });

                if (!response.ok) { throw new Error("Failed to fetch completion"); }

                const data = await response.json();

                if (!controller.signal.aborted && data.completion) {
                    setCompletion(data.completion.trim());
                }
            } catch (err) {
                if (err instanceof Error && err.name !== "AbortError") {
                    // Completion error
                }
                setCompletion("");
            } finally {
                setIsLoading(false);
            }
        },
        [disabled, context]
    );

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchCompletion(value);
        }, 300); // 300ms debounce

        return () => clearTimeout(timer);
    }, [value, fetchCompletion]);

    useEffect(() => {
        if (value !== lastValue) {
            setLastValue(value);
            if (!value.trim()) {
                setCompletion("");
            }
        }
    }, [value, lastValue]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Tab" && completion) {
            e.preventDefault();
            const newValue = value + completion;
            onChange(newValue);
            setCompletion("");

            setTimeout(() => {
                if (inputRef.current) {
                    inputRef.current.focus();
                    const length = newValue.length;
                    if ('setSelectionRange' in inputRef.current) {
                        inputRef.current.setSelectionRange(length, length);
                    }
                }
            }, 0);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const newValue = e.target.value;
        onChange(newValue);

        // Clear completion immediately if text was deleted or changed
        if (newValue.length < lastValue.length || newValue !== lastValue + completion.slice(0, newValue.length - lastValue.length)) {
            setCompletion("");
        }

        setLastValue(newValue);
    };

    const handleFocus = () => {
        // Re-fetch completion when input is focused
        if (value.trim()) {
            fetchCompletion(value);
        }
    };

    const handleBlur = () => {
        // Clear completion when input loses focus
        setTimeout(() => setCompletion(""), 100); // Small delay to allow tab acceptance
    };

    const InputComponent = type === "textarea" ? Textarea : Input;
    const _displayValue = value + (completion ? completion : "");

    return (
        <div className="space-y-2">
            <Label htmlFor={id} className="font-medium text-sm">
                {label} {required && <span className="text-red-500">*</span>}
            </Label>

            <div className="relative">
                <div
                    className={cn(
                        "pointer-events-none absolute inset-0 overflow-hidden whitespace-pre-wrap break-words text-sm",
                        "border border-transparent p-2 px-3 text-transparent"
                    )}
                >
                    {value}
                    {completion && (
                        <span className="text-muted-foreground/60">
                            {completion}
                            <span className="ml-1 rounded-md border border-muted-foreground/40 px-1 text-muted-foreground/40 text-xs">TAB</span>
                        </span>
                    )}
                </div>

                <InputComponent
                    ref={inputRef as any}
                    id={id}
                    value={value}
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    placeholder={placeholder}
                    rows={type === "textarea" ? rows : undefined}
                    disabled={disabled}
                    className={cn(
                        "relative z-10 bg-transparent",
                        isLoading && "bg-blue-50/30",
                        error && "border-red-300 focus:border-red-500 focus:ring-red-200",
                        className
                    )}
                />
            </div>

            {error && (
                <p className="text-red-600 text-sm">{error}</p>
            )}
        </div>
    );
}