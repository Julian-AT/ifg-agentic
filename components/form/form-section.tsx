"use client";

import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SmartField, type FieldConfig } from "./smart-field";
import { FileText, User, Building, Settings, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

const iconMap = {
    basic: FileText,
    personal: User,
    commercial: Building,
    research: Building,
    details: Settings,
    review: CheckCircle2,
};

interface FormSectionProps {
    id: string;
    title: string;
    description?: string;
    icon?: string;
    fields: FieldConfig[];
    values: Record<string, any>;
    errors: Record<string, string>;
    onChange: (fieldId: string, value: any) => void;
    disabled?: boolean;
    context?: {
        requestType?: string;
        formData?: Record<string, any>;
        originalPrompt?: string;
    };
}

export function FormSection({
    id,
    title,
    description,
    icon,
    fields,
    values,
    errors,
    onChange,
    disabled = false,
    context,
}: FormSectionProps) {
    const IconComponent = iconMap[icon as keyof typeof iconMap] || FileText;

    const sectionVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.4,
                ease: "easeOut",
                staggerChildren: 0.1
            }
        },
    };

    const fieldVariants = {
        hidden: { opacity: 0, x: -20 },
        visible: {
            opacity: 1,
            x: 0,
            transition: { duration: 0.3 }
        },
    };

    return (
        <motion.div
            variants={sectionVariants}
            initial="hidden"
            animate="visible"
            className="w-full"
        >
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 rounded-xl overflow-hidden">
                <CardHeader className="pb-6 bg-gradient-to-r from-primary/5 to-primary/10">
                    <CardTitle className="flex items-center gap-4 text-2xl">
                        <div className="p-3 rounded-xl bg-primary/20 text-primary shadow-lg">
                            <IconComponent className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-bold text-foreground">{title}</h3>
                            {description && (
                                <p className="text-base text-muted-foreground font-normal mt-2">
                                    {description}
                                </p>
                            )}
                        </div>
                    </CardTitle>
                </CardHeader>

                <CardContent className="space-y-8 p-8">
                    {fields.map((field, index) => (
                        <motion.div
                            key={field.id}
                            variants={fieldVariants}
                            className={cn(
                                "transition-all duration-200 p-4 rounded-lg hover:bg-muted/30",
                                disabled && "opacity-50 pointer-events-none"
                            )}
                        >
                            <SmartField
                                config={field}
                                value={values[field.id]}
                                onChange={(value) => onChange(field.id, value)}
                                error={errors[field.id]}
                                disabled={disabled}
                                context={context}
                            />
                        </motion.div>
                    ))}
                </CardContent>
            </Card>
        </motion.div>
    );
}