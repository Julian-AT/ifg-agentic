"use client";

import React, { useState } from "react";
import { AIFormWizard } from "./ai-form-wizard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, CheckCircle, Info } from "lucide-react";
import type { RequestType, DataRequestFormData } from "@/lib/types/data-request";

export function AIFormDemo() {
    const [selectedRequestType, setSelectedRequestType] = useState<RequestType>("IFG");
    const [submittedData, setSubmittedData] = useState<DataRequestFormData | null>(null);
    const [isSubmissionComplete, setIsSubmissionComplete] = useState(false);

    const handleFormSubmit = async (data: DataRequestFormData) => {
        console.log("Form submitted:", data);

        await new Promise(resolve => setTimeout(resolve, 2000));

        setSubmittedData(data);
        setIsSubmissionComplete(true);
    };

    const handleStepChange = (step: number, data: Partial<DataRequestFormData>) => {
        console.log(`Step ${step + 1}:`, data);
    };

    const handleValidation = (errors: Record<string, string>) => {
        console.log("Validation errors:", errors);
    };

    const resetDemo = () => {
        setSubmittedData(null);
        setIsSubmissionComplete(false);
    };

    const requestTypeInfo = {
        IFG: {
            title: "Informationsfreiheitsgesetz",
            description: "General access to public information for transparency",
            badge: "transparency",
            color: "blue",
        },
        IWG: {
            title: "Informationsweiterverwendungsgesetz",
            description: "Reuse of public data for commercial and research purposes",
            badge: "reuse",
            color: "green",
        },
        DZG: {
            title: "Datenzugangsgesetz",
            description: "Access to high-value and protected datasets for research",
            badge: "research",
            color: "purple",
        },
    };

    if (isSubmissionComplete && submittedData) {
        return (
            <div className="max-w-4xl mx-auto space-y-6">
                <Card className="border-green-200 bg-green-50 dark:bg-green-950/20">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-300">
                            <CheckCircle className="w-6 h-6" />
                            Request Successfully Submitted
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div>
                                <h3 className="font-medium">Request Details:</h3>
                                <p className="text-sm text-muted-foreground">
                                    Type: {selectedRequestType}
                                </p>
                            </div>

                            <div className="bg-background/60 rounded-lg p-4">
                                <h4 className="font-medium mb-2">Submitted Data:</h4>
                                <pre className="text-xs text-muted-foreground overflow-auto">
                                    {JSON.stringify(submittedData, null, 2)}
                                </pre>
                            </div>

                            <Button onClick={resetDemo} variant="outline">
                                Try Another Request
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            {/* Header */}
            <div className="text-center space-y-4">
                <h1 className="text-3xl font-bold tracking-tight">
                    AI-Powered Data Request Form
                </h1>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                    Experience the new intelligent form system for Austrian transparency laws (IFG, IWG, DZG)
                    with real-time AI suggestions, smart completions, and guided assistance.
                </p>
            </div>

            {/* Request Type Selection */}
            <Card>
                <CardHeader>
                    <CardTitle>Select Request Type</CardTitle>
                    <p className="text-sm text-muted-foreground">
                        Choose the type of data request you want to make
                    </p>
                </CardHeader>
                <CardContent>
                    <Tabs value={selectedRequestType} onValueChange={(value) => setSelectedRequestType(value as RequestType)}>
                        <TabsList className="grid w-full grid-cols-3">
                            {Object.entries(requestTypeInfo).map(([type, info]) => (
                                <TabsTrigger key={type} value={type} className="flex flex-col gap-1 h-auto py-3">
                                    <span className="font-medium">{type}</span>
                                    <Badge variant="outline" className="text-xs">
                                        {info.badge}
                                    </Badge>
                                </TabsTrigger>
                            ))}
                        </TabsList>

                        {Object.entries(requestTypeInfo).map(([type, info]) => (
                            <TabsContent key={type} value={type} className="mt-4">
                                <div className="bg-muted/50 rounded-lg p-4">
                                    <h3 className="font-medium mb-2">{info.title}</h3>
                                    <p className="text-sm text-muted-foreground">{info.description}</p>
                                </div>
                            </TabsContent>
                        ))}
                    </Tabs>
                </CardContent>
            </Card>

            {/* Feature Highlights */}
            <div className="grid md:grid-cols-3 gap-4">
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                            <Info className="w-5 h-5 text-blue-500" />
                            AI Suggestions
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">
                            Get intelligent suggestions as you type, with tab completion for faster form filling.
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                            <CheckCircle className="w-5 h-5 text-green-500" />
                            Smart Validation
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">
                            Real-time validation ensures legal compliance and improves success rates.
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                            <AlertCircle className="w-5 h-5 text-purple-500" />
                            Guided Process
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">
                            Multi-step wizard with dynamic fields based on your specific request type.
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* AI Form Wizard */}
            <AIFormWizard
                requestType={selectedRequestType}
                onSubmit={handleFormSubmit}
                onStepChange={handleStepChange}
                onValidation={handleValidation}
            />

            {/* Usage Instructions */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">How to Use the AI Features</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                        <div>
                            <h4 className="font-medium mb-2">🤖 AI Suggestions</h4>
                            <ul className="space-y-1 text-muted-foreground">
                                <li>• Start typing in any field marked with "AI"</li>
                                <li>• Watch for dropdown suggestions as you type</li>
                                <li>• Press <kbd className="bg-muted px-1 rounded">Tab</kbd> to accept suggestions</li>
                                <li>• Use arrow keys to navigate options</li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-medium mb-2">✨ Smart Enhancements</h4>
                            <ul className="space-y-1 text-muted-foreground">
                                <li>• Complete longer text fields to see enhancement suggestions</li>
                                <li>• Review AI insights about your request</li>
                                <li>• Get recommendations for relevant agencies</li>
                                <li>• Receive legal compliance guidance</li>
                            </ul>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}