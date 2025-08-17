"use client";

import React from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { InlineCompletionInput } from "@/components/inline-completion-input";
import { Info, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export interface FieldConfig {
    id: string;
    type: 'text' | 'textarea' | 'select' | 'radio' | 'checkbox' | 'date' | 'number';
    label: string;
    placeholder?: string;
    required?: boolean;
    description?: string;
    options?: Array<{
        value: string;
        label: string;
        description?: string;
    }>;
    validation?: {
        minLength?: number;
        maxLength?: number;
        pattern?: string;
    };
    dependencies?: string[];
    rows?: number;
}

interface SmartFieldProps {
    config: FieldConfig;
    value: any;
    onChange: (value: any) => void;
    error?: string;
    disabled?: boolean;
    context?: {
        fieldType?: string;
        requestType?: string;
        formData?: Record<string, any>;
        originalPrompt?: string;
    };
}

export function SmartField({
    config,
    value,
    onChange,
    error,
    disabled = false,
    context,
}: SmartFieldProps) {
    const { id, type, label, placeholder, required, description, options, rows } = config;

    const fieldVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.3, ease: "easeOut" }
        },
    };

    const renderField = () => {
        const baseProps = {
            id,
            disabled,
            className: cn(
                "transition-all duration-200 border-2 border-transparent hover:border-primary/20 focus:border-primary",
                error && "border-red-300 hover:border-red-400 focus:border-red-500"
            ),
        };

        switch (type) {
            case 'text':
                return context ? (
                    <InlineCompletionInput
                        {...baseProps}
                        label=""
                        value={value || ''}
                        onChange={onChange}
                        placeholder={placeholder}
                        type="input"
                        required={required}
                        error={error}
                        context={{
                            ...context,
                            fieldType: id,
                        }}
                    />
                ) : (
                    <Input
                        {...baseProps}
                        value={value || ''}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder={placeholder}
                    />
                );

            case 'textarea':
                return context ? (
                    <InlineCompletionInput
                        {...baseProps}
                        label=""
                        value={value || ''}
                        onChange={onChange}
                        placeholder={placeholder}
                        type="textarea"
                        rows={rows || 3}
                        required={required}
                        error={error}
                        context={{
                            ...context,
                            fieldType: id,
                        }}
                    />
                ) : (
                    <Textarea
                        {...baseProps}
                        value={value || ''}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder={placeholder}
                        rows={rows || 3}
                    />
                );

            case 'select':
                return (
                    <Select value={value || ''} onValueChange={onChange} disabled={disabled}>
                        <SelectTrigger className={baseProps.className}>
                            <SelectValue placeholder={placeholder || 'Select an option'} />
                        </SelectTrigger>
                        <SelectContent>
                            {options?.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                    <div className="space-y-1">
                                        <div className="font-medium">{option.label}</div>
                                        {option.description && (
                                            <div className="text-sm text-muted-foreground">
                                                {option.description}
                                            </div>
                                        )}
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                );

            case 'radio':
                return (
                    <RadioGroup
                        value={value || ''}
                        onValueChange={onChange}
                        disabled={disabled}
                        className="space-y-3"
                    >
                        {options?.map((option) => (
                            <div key={option.value} className="flex items-start space-x-3">
                                <RadioGroupItem value={option.value} id={`${id}-${option.value}`} />
                                <div className="grid gap-1.5 leading-none">
                                    <Label
                                        htmlFor={`${id}-${option.value}`}
                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                    >
                                        {option.label}
                                    </Label>
                                    {option.description && (
                                        <p className="text-xs text-muted-foreground">
                                            {option.description}
                                        </p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </RadioGroup>
                );

            case 'checkbox':
                return (
                    <div className="space-y-3">
                        {options?.map((option) => (
                            <div key={option.value} className="flex items-start space-x-3">
                                <Checkbox
                                    id={`${id}-${option.value}`}
                                    checked={Array.isArray(value) ? value.includes(option.value) : false}
                                    onCheckedChange={(checked) => {
                                        const currentValues = Array.isArray(value) ? value : [];
                                        if (checked) {
                                            onChange([...currentValues, option.value]);
                                        } else {
                                            onChange(currentValues.filter((v: string) => v !== option.value));
                                        }
                                    }}
                                    disabled={disabled}
                                />
                                <div className="grid gap-1.5 leading-none">
                                    <Label
                                        htmlFor={`${id}-${option.value}`}
                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                    >
                                        {option.label}
                                    </Label>
                                    {option.description && (
                                        <p className="text-xs text-muted-foreground">
                                            {option.description}
                                        </p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                );

            case 'number':
                return (
                    <Input
                        {...baseProps}
                        type="number"
                        value={value || ''}
                        onChange={(e) => onChange(e.target.valueAsNumber || e.target.value)}
                        placeholder={placeholder}
                    />
                );

            case 'date':
                return (
                    <Input
                        {...baseProps}
                        type="date"
                        value={value || ''}
                        onChange={(e) => onChange(e.target.value)}
                    />
                );

            default:
                return null;
        }
    };

    return (
        <motion.div
            variants={fieldVariants}
            initial="hidden"
            animate="visible"
            className="space-y-3"
        >
            {/* Field Label and Description */}
            <div className="space-y-1">
                <div className="flex items-center gap-2">
                    <Label
                        htmlFor={id}
                        className="text-sm font-medium text-foreground flex items-center gap-2"
                    >
                        {label}
                        {required && <span className="text-red-500 text-xs">*</span>}
                    </Label>
                    {description && (
                        <div className="group relative">
                            <Info className="w-4 h-4 text-muted-foreground cursor-help" />
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-popover text-popover-foreground text-xs rounded-md shadow-lg border opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-50 max-w-xs">
                                {description}
                            </div>
                        </div>
                    )}
                </div>
                {description && (
                    <p className="text-xs text-muted-foreground">
                        {description}
                    </p>
                )}
            </div>

            {/* Field Input */}
            <div className="relative">
                {renderField()}
            </div>

            {/* Error Message */}
            {error && (
                <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 text-sm text-red-600"
                >
                    <AlertCircle className="w-4 h-4" />
                    {error}
                </motion.div>
            )}
        </motion.div>
    );
}