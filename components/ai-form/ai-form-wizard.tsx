"use client";

import React, { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    ChevronLeft,
    ChevronRight,
    CheckIcon,
    AlertCircle,
    Lightbulb,
    Sparkles,
    Send
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AITextInput } from "./ai-text-input";
import { AITextarea } from "./ai-textarea";
import { AISelect } from "./ai-select";
import type {
    RequestType,
    FormStep,
    FormField,
    DataRequestFormData
} from "@/lib/types/data-request";

interface AIFormWizardProps {
    requestType: RequestType;
    initialData?: Partial<DataRequestFormData>;
    onSubmit: (data: DataRequestFormData) => Promise<void>;
    onStepChange?: (step: number, data: Partial<DataRequestFormData>) => void;
    onValidation?: (errors: Record<string, string>) => void;
    className?: string;
}

interface FormErrors {
    [fieldId: string]: string;
}

interface AIEnhancement {
    type: "validation" | "suggestion" | "agency_match";
    message: string;
    confidence: number;
    actionable: boolean;
}

export function AIFormWizard({
    initialData,
    requestType,
    onSubmit,
    onStepChange,
    onValidation,
    className,
}: AIFormWizardProps) {
    const [currentStep, setCurrentStep] = useState(0);
    const [formData, setFormData] = useState<Partial<DataRequestFormData>>(initialData || {} as DataRequestFormData);
    const [errors, setErrors] = useState<FormErrors>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formSteps, setFormSteps] = useState<FormStep[]>([]);
    const [isLoadingSteps, setIsLoadingSteps] = useState(true);
    const [aiEnhancements, setAiEnhancements] = useState<AIEnhancement[]>([]);
    const [isGeneratingEnhancements, setIsGeneratingEnhancements] = useState(false);

    // Initialize form schema based on request type
    useEffect(() => {
        loadFormSchema();
    }, [requestType]);

    // Generate AI enhancements when form data changes significantly
    useEffect(() => {
        if (Object.keys(formData).length > 2) {
            generateAIEnhancements();
        }
    }, [formData]);

    const loadFormSchema = async () => {
        setIsLoadingSteps(true);
        try {
            const response = await fetch("/api/ai/form-schema", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ requestType, existingData: formData }),
            });

            if (response.ok) {
                const { steps } = await response.json();
                setFormSteps(steps);
            }
        } catch (error) {
            console.error("Error loading form schema:", error);
            // Fallback to basic schema
            setFormSteps(getBasicFormSteps(requestType));
        } finally {
            setIsLoadingSteps(false);
        }
    };

    const generateAIEnhancements = async () => {
        setIsGeneratingEnhancements(true);
        try {
            const response = await fetch("/api/ai/form-analysis", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    requestType,
                    formData,
                    currentStep: currentStep + 1,
                    totalSteps: formSteps.length,
                }),
            });

            if (response.ok) {
                const { enhancements } = await response.json();
                setAiEnhancements(enhancements || []);
            }
        } catch (error) {
            console.error("Error generating AI enhancements:", error);
        } finally {
            setIsGeneratingEnhancements(false);
        }
    };
    const updateFormData = useCallback((fieldId: string, value: any) => {
        // @ts-expect-error
        setFormData((prev) => ({
            // @ts-expect-error
            ...prev,
            [fieldId]: value,
        }));

        // Clear field error when user types
        if (errors[fieldId]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[fieldId];
                return newErrors;
            });
        }
    }, [errors]);

    const validateStep = async (stepIndex: number): Promise<boolean> => {
        const step = formSteps[stepIndex];
        if (!step) return true;

        const stepErrors: FormErrors = {};

        // Validate required fields
        for (const field of step.fields) {
            if (field.required && !formData[field.id as keyof DataRequestFormData]) {
                stepErrors[field.id] = `${field.label} is required`;
            }

            // Custom validation
            if (field.validation?.customValidator) {
                const value = formData[field.id as keyof DataRequestFormData];
                if (value && !field.validation.customValidator(value)) {
                    stepErrors[field.id] = field.validation.errorMessage || 'Validation failed';
                }
            }
        }

        // AI-powered validation
        try {
            const response = await fetch("/api/ai/form-validation", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    requestType,
                    stepData: step.fields.reduce((acc, field) => {
                        acc[field.id] = formData[field.id as keyof DataRequestFormData];
                        return acc;
                    }, {} as Record<string, any>),
                    stepIndex,
                }),
            });

            if (response.ok) {
                const { validation } = await response.json();
                if (validation?.errors) {
                    validation.errors.forEach((error: any) => {
                        if (error.severity === "error") {
                            stepErrors[error.field] = error.message;
                        }
                    });
                }
            }
        } catch (error) {
            console.error("AI validation error:", error);
        }

        setErrors(stepErrors);
        onValidation?.(stepErrors);
        return Object.keys(stepErrors).length === 0;
    };

    const nextStep = async () => {
        const isValid = await validateStep(currentStep);
        if (!isValid) return;

        const nextStepIndex = currentStep + 1;
        setCurrentStep(nextStepIndex);
        onStepChange?.(nextStepIndex, formData);
    };

    const prevStep = () => {
        const prevStepIndex = Math.max(0, currentStep - 1);
        setCurrentStep(prevStepIndex);
        onStepChange?.(prevStepIndex, formData);
    };

    const handleSubmit = async () => {
        // Validate all steps
        for (let i = 0; i < formSteps.length; i++) {
            const isValid = await validateStep(i);
            if (!isValid) {
                setCurrentStep(i);
                return;
            }
        }

        setIsSubmitting(true);
        try {
            await onSubmit(formData as DataRequestFormData);
        } catch (error) {
            console.error("Form submission error:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderField = (field: FormField) => {
        const fieldProps = {
            field,
            value: (formData[field.id as keyof DataRequestFormData] as string) || "",
            onChange: (value: string) => updateFormData(field.id, value),
            requestType,
            formContext: formData,
            error: errors[field.id],
        };

        switch (field.type) {
            case "textarea":
                return <AITextarea key={field.id} {...fieldProps} />;
            case "select":
                return <AISelect key={field.id} {...fieldProps} />;
            default:
                return <AITextInput key={field.id} {...fieldProps} />;
        }
    };

    const currentStepData = formSteps[currentStep];
    const progress = ((currentStep + 1) / formSteps.length) * 100;
    const isLastStep = currentStep === formSteps.length - 1;
    const hasErrors = Object.keys(errors).length > 0;

    if (isLoadingSteps) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
            </div>
        );
    }

    return (
        <div className={cn("max-w-4xl mx-auto space-y-6", className)}>
            {/* Progress Header */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">
                            {requestType} Data Request
                        </h2>
                        <p className="text-muted-foreground">
                            Step {currentStep + 1} of {formSteps.length}
                        </p>
                    </div>
                    <Badge variant="outline" className="text-sm">
                        <Lightbulb className="w-4 h-4 mr-1" />
                        AI-Powered
                    </Badge>
                </div>
                <Progress value={progress} className="h-2" />
            </div>

            {/* AI Enhancements */}
            <AnimatePresence>
                {aiEnhancements.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4"
                    >
                        <div className="flex items-start gap-3">
                            <Sparkles className="w-5 h-5 text-blue-500 mt-0.5" />
                            <div className="flex-1">
                                <h4 className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-2">
                                    AI Insights
                                </h4>
                                <div className="space-y-2">
                                    {aiEnhancements.map((enhancement, index) => (
                                        <div key={index} className="text-sm">
                                            <span className="text-muted-foreground">
                                                {enhancement.message}
                                            </span>
                                            <Badge variant="outline" className="ml-2 text-xs">
                                                {Math.round(enhancement.confidence * 100)}%
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Form Step */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        {currentStepData?.title}
                        {hasErrors && (
                            <AlertCircle className="w-5 h-5 text-red-500" />
                        )}
                    </CardTitle>
                    {currentStepData?.description && (
                        <p className="text-sm text-muted-foreground">
                            {currentStepData.description}
                        </p>
                    )}
                </CardHeader>
                <CardContent>
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentStep}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.2 }}
                            className="space-y-6"
                        >
                            {currentStepData?.fields.map(renderField)}
                        </motion.div>
                    </AnimatePresence>
                </CardContent>
            </Card>

            {/* Navigation */}
            <div className="flex items-center justify-between">
                <Button
                    variant="outline"
                    onClick={prevStep}
                    disabled={currentStep === 0}
                    className="flex items-center gap-2"
                >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                </Button>

                <div className="flex gap-2">
                    {formSteps.map((_, index) => (
                        <div
                            key={index}
                            className={cn(
                                "w-2 h-2 rounded-full transition-colors",
                                index <= currentStep ? "bg-blue-500" : "bg-muted"
                            )}
                        />
                    ))}
                </div>

                {isLastStep ? (
                    <Button
                        onClick={handleSubmit}
                        disabled={hasErrors || isSubmitting}
                        className="flex items-center gap-2"
                    >
                        <Send className="w-4 h-4" />
                        {isSubmitting ? "Submitting..." : "Submit Request"}
                    </Button>
                ) : (
                    <Button
                        onClick={nextStep}
                        disabled={hasErrors}
                        className="flex items-center gap-2"
                    >
                        Next
                        <ChevronRight className="w-4 h-4" />
                    </Button>
                )}
            </div>
        </div>
    );
}

// Fallback basic form steps
function getBasicFormSteps(requestType: RequestType): FormStep[] {
    const baseFields: FormField[] = [
        {
            id: "title",
            type: "text",
            label: "Request Title",
            placeholder: "Brief title for your data request",
            required: true,
            aiSuggestionEnabled: true,
            helpText: "Provide a clear, descriptive title for your request",
        },
        {
            id: "description",
            type: "textarea",
            label: "Detailed Description",
            placeholder: "Describe the information or data you are seeking...",
            required: true,
            aiSuggestionEnabled: true,
            helpText: "Be specific about what data you need and why",
        },
    ];

    return [
        {
            id: "basic-info",
            title: "Basic Information",
            description: "Provide the essential details of your request",
            fields: baseFields,
        },
    ];
}