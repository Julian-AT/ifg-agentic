"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { FormSection } from "./form-section";
import type { FieldConfig } from "./smart-field";
import {
    Sparkles,
    Loader2,
    Send,
    ArrowLeft,
    ArrowRight,
    RefreshCw,
    Clock
} from "lucide-react";
import { cn } from "@/lib/utils";

interface FormStructure {
    requestType: string;
    title: string;
    description: string;
    sections: Array<{
        id: string;
        title: string;
        description?: string;
        icon?: string;
        fields: FieldConfig[];
    }>;
    estimatedTime?: string;
}

interface AdaptiveFormProps {
    requestType: 'IFG' | 'IWG' | 'DZG';
    userIntent?: string;
    originalPrompt?: string;
    onSubmit: (data: Record<string, any>) => Promise<void>;
    className?: string;
}

export function AdaptiveForm({
    requestType,
    userIntent,
    originalPrompt,
    onSubmit,
    className,
}: AdaptiveFormProps) {
    const [formStructure, setFormStructure] = useState<FormStructure | null>(null);
    const [isLoadingStructure, setIsLoadingStructure] = useState(true);
    const [currentSection, setCurrentSection] = useState(0);
    const [formData, setFormData] = useState<Record<string, any>>({});
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Load form structure from LLM
    const loadFormStructure = useCallback(async () => {
        console.log('Loading form structure for:', requestType);
        setIsLoadingStructure(true);
        try {
            const response = await fetch('/api/form-structure', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    requestType,
                    userIntent,
                    existingData: {}, // Don't send formData to avoid infinite loops
                }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Failed to generate form structure: ${response.status} ${errorText}`);
            }

            const structure = await response.json();
            console.log('Loaded form structure:', structure);

            // Validate the structure has the expected format
            if (!structure.sections || !Array.isArray(structure.sections)) {
                throw new Error('Invalid form structure: missing sections array');
            }

            // Ensure all fields have required properties
            const hasValidFields = structure.sections.every((section: any) =>
                section.fields && Array.isArray(section.fields) &&
                section.fields.every((field: any) =>
                    field.id && field.type && typeof field.required === 'boolean'
                )
            );

            if (!hasValidFields) {
                throw new Error('Invalid form structure: fields missing required properties');
            }

            setFormStructure(structure);
        } catch (error) {
            console.error('Error loading form structure:', error);
            // Fallback to basic structure
            setFormStructure({
                requestType,
                title: `${requestType} Data Request`,
                description: `Submit your ${requestType} request`,
                sections: [{
                    id: 'basic',
                    title: 'Basic Information',
                    description: 'Essential details about your request',
                    icon: 'basic',
                    fields: [
                        {
                            id: 'title',
                            type: 'text',
                            label: 'Request Title',
                            placeholder: 'Brief, descriptive title for your request',
                            required: true,
                            description: 'A clear, descriptive title for your request',
                        },
                        {
                            id: 'description',
                            type: 'textarea',
                            label: 'Description',
                            placeholder: 'Describe what information you need',
                            required: true,
                            rows: 4,
                            description: 'Detailed description of the information you are requesting',
                        },
                    ],
                }, {
                    id: 'contact',
                    title: 'Contact Information',
                    description: 'Your contact details',
                    icon: 'personal',
                    fields: [
                        {
                            id: 'name',
                            type: 'text',
                            label: 'Full Name',
                            placeholder: 'Your full name',
                            required: true,
                            description: 'Your legal name as it appears on official documents',
                        },
                        {
                            id: 'email',
                            type: 'text',
                            label: 'Email Address',
                            placeholder: 'your.email@example.com',
                            required: true,
                            description: 'We will use this email to communicate with you about your request',
                        },
                    ],
                }],
                estimatedTime: '5-10 minutes',
            });
        } finally {
            setIsLoadingStructure(false);
        }
    }, [requestType, userIntent]); // Removed formData dependency

    useEffect(() => {
        loadFormStructure();
    }, [loadFormStructure]);

    // Handle field changes
    const handleFieldChange = useCallback((fieldId: string, value: any) => {
        setFormData(prev => ({ ...prev, [fieldId]: value }));

        // Clear error for this field
        if (errors[fieldId]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[fieldId];
                return newErrors;
            });
        }
    }, [errors]);

    // Validate current section
    const validateSection = useCallback((sectionIndex: number): boolean => {
        if (!formStructure) return false;

        const section = formStructure.sections[sectionIndex];
        const sectionErrors: Record<string, string> = {};

        section.fields.forEach(field => {
            if (field.required && !formData[field.id]) {
                sectionErrors[field.id] = `${field.label} is required`;
            }

            // Additional validation based on field config
            if (formData[field.id] && field.validation) {
                const value = formData[field.id];
                const { minLength, maxLength, pattern } = field.validation;

                if (minLength && value.length < minLength) {
                    sectionErrors[field.id] = `Minimum ${minLength} characters required`;
                }
                if (maxLength && value.length > maxLength) {
                    sectionErrors[field.id] = `Maximum ${maxLength} characters allowed`;
                }
                if (pattern && !new RegExp(pattern).test(value)) {
                    sectionErrors[field.id] = `Invalid format`;
                }
            }
        });

        setErrors(sectionErrors);
        return Object.keys(sectionErrors).length === 0;
    }, [formStructure, formData]);

    // Navigation
    const handleNext = () => {
        if (validateSection(currentSection)) {
            setCurrentSection(prev => Math.min(prev + 1, (formStructure?.sections.length || 1) - 1));
        }
    };

    const handlePrevious = () => {
        setCurrentSection(prev => Math.max(prev - 1, 0));
    };

    const handleSubmit = async () => {
        // Validate all sections
        for (let i = 0; i < (formStructure?.sections.length || 0); i++) {
            if (!validateSection(i)) {
                setCurrentSection(i);
                return;
            }
        }

        setIsSubmitting(true);
        try {
            await onSubmit(formData);
        } catch (error) {
            console.error('Form submission error:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoadingStructure) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[500px] space-y-6">
                <div className="relative">
                    <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                    <Sparkles className="absolute inset-0 m-auto w-8 h-8 text-primary animate-pulse" />
                </div>
                <div className="text-center space-y-2">
                    <h3 className="text-xl font-semibold">Creating your personalized form...</h3>
                    <p className="text-muted-foreground">AI is analyzing the best fields for your {requestType} request</p>
                </div>
            </div>
        );
    }

    if (!formStructure) {
        return (
            <div className="text-center space-y-6 max-w-md mx-auto">
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-700 font-medium">Failed to load form structure</p>
                    <p className="text-red-600 text-sm mt-1">There was an issue generating your form</p>
                </div>
                <Button onClick={loadFormStructure} variant="outline" className="px-6 py-3">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Try Again
                </Button>
            </div>
        );
    }

    const currentSectionData = formStructure.sections[currentSection];
    const progress = ((currentSection + 1) / formStructure.sections.length) * 100;
    const isLastSection = currentSection === formStructure.sections.length - 1;

    return (
        <div className={cn("max-w-5xl mx-auto space-y-8 p-6", className)}>
            <div className="space-y-4">
                <div className="flex justify-between items-center text-sm">
                    <span className="font-medium text-foreground">
                        Section {currentSection + 1} of {formStructure.sections.length}
                    </span>
                    <span className="text-muted-foreground">
                        {Math.round(progress)}% complete
                    </span>
                </div>
                <div className="relative">
                    <Progress value={progress} className="h-3 bg-muted" />
                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/20 to-primary/10" />
                </div>
            </div>

            {/* Current Section */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentSection}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                >
                    <FormSection
                        id={currentSectionData.id}
                        title={currentSectionData.title}
                        description={currentSectionData.description}
                        icon={currentSectionData.icon}
                        fields={currentSectionData.fields}
                        values={formData}
                        errors={errors}
                        onChange={handleFieldChange}
                        disabled={isSubmitting}
                        context={{
                            requestType,
                            formData,
                            originalPrompt,
                        }}
                    />
                </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex items-center justify-between pt-8 border-t bg-white/50 rounded-lg p-6 shadow-sm">
                <Button
                    variant="outline"
                    onClick={handlePrevious}
                    disabled={currentSection === 0 || isSubmitting}
                    className="flex items-center gap-2 px-6 py-3"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Previous
                </Button>

                <div className="flex gap-3">
                    {formStructure.sections.map((section, index) => (
                        <div
                            key={`${section.id}-${index}`}
                            className={cn(
                                "w-3 h-3 rounded-full transition-all duration-200",
                                index <= currentSection ? "bg-primary shadow-sm" : "bg-muted",
                                index === currentSection && "ring-2 ring-primary/30 scale-110"
                            )}
                        />
                    ))}
                </div>

                {isLastSection ? (
                    <Button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90"
                        size="lg"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Submitting...
                            </>
                        ) : (
                            <>
                                <Send className="w-4 h-4" />
                                Submit Request
                            </>
                        )}
                    </Button>
                ) : (
                    <Button
                        onClick={handleNext}
                        disabled={isSubmitting}
                        className="flex items-center gap-2 px-6 py-3"
                        size="lg"
                    >
                        Next
                        <ArrowRight className="w-4 h-4" />
                    </Button>
                )}
            </div>
        </div>
    );
}