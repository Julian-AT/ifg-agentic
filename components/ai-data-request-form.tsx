"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Loader2, FileText, Building2, Target, Palette, DollarSign, Settings, Send, Sparkles, Calendar, Globe, Database } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { InlineCompletionInput } from "@/components/inline-completion-input";
import type { RequestType } from "@/lib/types/data-request";

interface AIDataRequestFormProps {
    requestType?: RequestType;
    initialData?: Record<string, any>;
    onSubmit: (data: any) => Promise<void>;
    className?: string;
    originalPrompt?: string;
    userIntent?: string;
}

interface FormDataState {
    requestType: RequestType;
    title: string;
    description: string;
    publicInterest: string;
    businessModel: string;
    researchPurpose: string;
    technicalRequirements: string[];
    additionalInfo: string;
    requesterInfo: {
        name: string;
        email: string;
        organization: string;
        phone?: string;
        address?: string;
    };
    preferredFormat: string;
    intendedUse: string;
    researchField: string;
    urgency: string;
    expectedResponseTime: string;
    dataTimeframe: {
        start?: string;
        end?: string;
    };
    specificDocuments: string[];
    exemptionConcerns: string[];
    feeAcceptance: {
        willingToPay: boolean;
        maxAmount?: number;
        paymentMethod?: string;
    };
    // New fields for better data collection
    dataScope: string;
    dataQuality: string;
    updateFrequency: string;
    contactPreferences: string[];
    specialRequirements: string[];
}

interface AISuggestion {
    field: string;
    suggestion: string;
    confidence: number;
    reasoning: string;
}

const getSteps = (requestType: RequestType) => {
    const baseSteps = [
        { id: "request-type", title: "Anfragetyp", icon: FileText },
        { id: "basic-info", title: "Grundinformationen", icon: FileText },
        { id: "requester", title: "Antragsteller", icon: Building2 },
        { id: "request-details", title: "Anfragedetails", icon: Target },
        { id: "data-specifications", title: "Datenspezifikationen", icon: Database },
        { id: "additional", title: "Zusätzliche Informationen", icon: Settings },
    ];

    if (requestType === "IWG") {
        baseSteps.splice(4, 0, { id: "commercial", title: "Geschäftliche Nutzung", icon: DollarSign });
    } else if (requestType === "DZG") {
        baseSteps.splice(4, 0, { id: "research", title: "Forschungsdetails", icon: Target });
    }

    return baseSteps;
};

const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

const contentVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, x: -50, transition: { duration: 0.2 } },
};

export function AIDataRequestForm({
    requestType: initialRequestType = "IFG",
    initialData = {},
    onSubmit,
    className,
    originalPrompt,
    userIntent,
}: AIDataRequestFormProps) {
    const [requestType, setRequestType] = useState<RequestType>(initialRequestType);
    const [currentStep, setCurrentStep] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
    const [aiSuggestions, setAiSuggestions] = useState<AISuggestion[]>([]);
    const [formData, setFormData] = useState<FormDataState>({
        requestType: initialRequestType,
        title: "",
        description: "",
        publicInterest: "",
        businessModel: "",
        researchPurpose: "",
        technicalRequirements: [],
        additionalInfo: "",
        requesterInfo: {
            name: "",
            email: "",
            organization: "",
            phone: "",
            address: "",
        },
        preferredFormat: "pdf",
        intendedUse: "commercial",
        researchField: "",
        urgency: "normal",
        expectedResponseTime: "4-weeks",
        dataTimeframe: {},
        specificDocuments: [],
        exemptionConcerns: [],
        feeAcceptance: {
            willingToPay: false,
            maxAmount: undefined,
            paymentMethod: "",
        },
        dataScope: "",
        dataQuality: "standard",
        updateFrequency: "one-time",
        contactPreferences: [],
        specialRequirements: [],
        ...(initialData as Partial<FormDataState>),
    });

    const steps = getSteps(requestType);

    // Load initial AI suggestions when form opens
    useEffect(() => {
        if (originalPrompt || userIntent) {
            loadInitialSuggestions();
        }
    }, [originalPrompt, userIntent]);

    const loadInitialSuggestions = async () => {
        if (!originalPrompt && !userIntent) return;

        setIsLoadingSuggestions(true);
        try {
            const response = await fetch('/api/ai/form-suggestions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt: originalPrompt,
                    userIntent,
                    context: 'initial_form_suggestions'
                }),
            });

            if (response.ok) {
                const suggestions = await response.json();
                setAiSuggestions(suggestions.suggestions || []);

                // Apply suggestions to form data
                if (suggestions.recommendedRequestType) {
                    setRequestType(suggestions.recommendedRequestType);
                    setFormData(prev => ({ ...prev, requestType: suggestions.recommendedRequestType }));
                }

                if (suggestions.suggestedTitle) {
                    setFormData(prev => ({ ...prev, title: suggestions.suggestedTitle }));
                }

                if (suggestions.suggestedDescription) {
                    setFormData(prev => ({ ...prev, description: suggestions.suggestedDescription }));
                }
            }
        } catch (error) {
            console.error('Failed to load initial suggestions:', error);
        } finally {
            setIsLoadingSuggestions(false);
        }
    };

    // Create a comprehensive context summary for better AI suggestions
    const createContextSummary = (fieldType: string) => {
        const context = {
            originalRequest: originalPrompt || "Kein ursprünglicher Prompt verfügbar",
            userIntent: userIntent || "Keine Benutzerabsicht angegeben",
            currentRequestType: requestType,
            formProgress: `Schritt ${currentStep + 1} von ${steps.length}`,
            fieldType,
            existingData: {
                title: formData.title,
                description: formData.description,
                publicInterest: formData.publicInterest,
                businessModel: formData.businessModel,
                researchPurpose: formData.researchPurpose,
            }
        };

        // Create a focused summary based on field type
        let fieldSpecificContext = "";
        switch (fieldType) {
            case "title":
                fieldSpecificContext = `Generieren Sie einen präzisen, beschreibenden Titel für eine ${requestType}-Anfrage basierend auf: "${originalPrompt}". Der Titel sollte kurz, aber aussagekräftig sein und den Kern der Anfrage widerspiegeln.`;
                break;
            case "description":
                fieldSpecificContext = `Erstellen Sie eine detaillierte Beschreibung für eine ${requestType}-Anfrage. Ursprüngliche Anfrage: "${originalPrompt}". Beschreiben Sie klar, welche spezifischen Informationen oder Daten benötigt werden.`;
                break;
            case "publicInterest":
                fieldSpecificContext = `Begründen Sie das öffentliche Interesse für eine ${requestType}-Anfrage. Ursprüngliche Anfrage: "${originalPrompt}". Erklären Sie, warum diese Information für die Öffentlichkeit relevant und wichtig ist.`;
                break;
            case "businessModel":
                fieldSpecificContext = `Beschreiben Sie das Geschäftsmodell für eine IWG-Anfrage. Ursprüngliche Anfrage: "${originalPrompt}". Erklären Sie, wie die Daten kommerziell genutzt werden sollen und welchen Mehrwert sie schaffen.`;
                break;
            case "researchPurpose":
                fieldSpecificContext = `Beschreiben Sie den Forschungszweck für eine DZG-Anfrage. Ursprüngliche Anfrage: "${originalPrompt}". Erklären Sie die Forschungsziele, Methodik und den erwarteten Nutzen für die Gesellschaft.`;
                break;
            case "dataScope":
                fieldSpecificContext = `Beschreiben Sie den Datenschutzbereich für eine IFG-Anfrage. Ursprüngliche Anfrage: "${originalPrompt}". Definieren Sie klar den Umfang und die Grenzen der gewünschten Daten.`;
                break;
            case "dataQuality":
                fieldSpecificContext = `Beschreiben Sie die Datenqualität für eine IFG-Anfrage. Ursprüngliche Anfrage: "${originalPrompt}". Erklären Sie, welche Qualitätsstandards und -anforderungen Sie haben.`;
                break;
            case "updateFrequency":
                fieldSpecificContext = `Bestimmen Sie die Aktualisierungsfrequenz für eine IFG-Anfrage. Ursprüngliche Anfrage: "${originalPrompt}". Wählen Sie, wie oft die Daten aktualisiert werden sollen.`;
                break;
            case "specialRequirements":
                fieldSpecificContext = `Geben Sie besondere Anforderungen für eine ${requestType}-Anfrage an. Ursprüngliche Anfrage: "${originalPrompt}". Listen Sie spezifische Wünsche oder Anforderungen auf.`;
                break;
            case "additionalInfo":
                fieldSpecificContext = `Geben Sie zusätzliche Informationen für eine ${requestType}-Anfrage. Ursprüngliche Anfrage: "${originalPrompt}". Fügen Sie relevante Details hinzu, die bei der Bearbeitung helfen könnten.`;
                break;
            default:
                fieldSpecificContext = `Feld: ${fieldType}. Ursprüngliche Anfrage: "${originalPrompt}".`;
        }

        return {
            ...context,
            fieldSpecificContext,
            summary: `Anfragetyp: ${requestType}. Benutzer möchte: ${originalPrompt}. Aktueller Schritt: ${fieldType}.`,
        };
    };

    const updateFormData = (field: keyof FormDataState, value: any) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const updateRequesterInfo = (field: keyof FormDataState['requesterInfo'], value: string) => {
        setFormData((prev) => ({
            ...prev,
            requesterInfo: { ...prev.requesterInfo, [field]: value }
        }));
    };

    const nextStep = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep((prev) => prev + 1);
        }
    };

    const prevStep = () => {
        if (currentStep > 0) {
            setCurrentStep((prev) => prev - 1);
        }
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            // Create comprehensive JSON object
            const submissionData = {
                metadata: {
                    submittedAt: new Date().toISOString(),
                    formVersion: "2.0",
                    requestId: `REQ-${Date.now()}`,
                },
                requestType: formData.requestType,
                basicInformation: {
                    title: formData.title,
                    description: formData.description,
                    urgency: formData.urgency,
                    expectedResponseTime: formData.expectedResponseTime,
                },
                requester: {
                    ...formData.requesterInfo,
                    requestReason: originalPrompt,
                    userIntent,
                },
                requestDetails: {
                    publicInterest: formData.publicInterest,
                    preferredFormat: formData.preferredFormat,
                    dataTimeframe: formData.dataTimeframe,
                    specificDocuments: formData.specificDocuments,
                    exemptionConcerns: formData.exemptionConcerns,
                },
                dataSpecifications: {
                    scope: formData.dataScope,
                    quality: formData.dataQuality,
                    updateFrequency: formData.updateFrequency,
                    technicalRequirements: formData.technicalRequirements,
                    specialRequirements: formData.specialRequirements,
                },
                ...(requestType === "IWG" && {
                    commercialUse: {
                        intendedUse: formData.intendedUse,
                        businessModel: formData.businessModel,
                        feeAcceptance: formData.feeAcceptance,
                    }
                }),
                ...(requestType === "DZG" && {
                    researchDetails: {
                        researchPurpose: formData.researchPurpose,
                        researchField: formData.researchField,
                        institutionalAffiliation: formData.requesterInfo.organization,
                    }
                }),
                additionalInformation: {
                    additionalInfo: formData.additionalInfo,
                    contactPreferences: formData.contactPreferences,
                },
                aiSuggestions: aiSuggestions,
            };

            await onSubmit(submissionData);
            toast.success("Datenanfrage erfolgreich eingereicht!");
        } catch (error) {
            toast.error("Fehler beim Einreichen der Anfrage. Bitte versuchen Sie es erneut.");
            console.error("Form submission error:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const isStepValid = () => {
        switch (currentStep) {
            case 0: // Request Type
                return true;
            case 1: // Basic Info
                return formData.title.trim() !== "" && formData.description.trim() !== "";
            case 2: // Requester Details
                return formData.requesterInfo.name.trim() !== "" && formData.requesterInfo.email.trim() !== "";
            case 3: // Request Details
                return formData.publicInterest.trim() !== "";
            case 4: // Data Specifications (IFG) or Commercial/Research (IWG/DZG)
                if (requestType === "IWG") {
                    return formData.businessModel.trim() !== "";
                } else if (requestType === "DZG") {
                    return formData.researchPurpose.trim() !== "";
                } else {
                    // IFG case - validate data specifications
                    return formData.dataScope.trim() !== "" && formData.dataQuality.trim() !== "";
                }
            case 5: // Additional Info
                return true;
            default:
                return true;
        }
    };

    const renderStepContent = () => {
        switch (currentStep) {
            case 0: // Request Type Selection
                return (
                    <>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Sparkles className="h-5 w-5 text-primary" />
                                Anfragetyp wählen
                            </CardTitle>
                            <CardDescription>
                                {isLoadingSuggestions ? (
                                    <div className="flex items-center gap-2">
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        KI analysiert Ihre Anfrage...
                                    </div>
                                ) : (
                                    "Wählen Sie den passenden rechtlichen Rahmen für Ihre Datenanfrage"
                                )}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {[
                                {
                                    type: "IFG" as const,
                                    title: "IFG - Informationsfreiheitsgesetz",
                                    description: "Allgemeine Transparenzanfragen für Regierungsinformationen",
                                    color: "bg-blue-50 hover:bg-blue-100 border-blue-200",
                                    icon: "📋",
                                },
                                {
                                    type: "IWG" as const,
                                    title: "IWG - Informationsweiterverwendungsgesetz",
                                    description: "Geschäftliche Datenweiterverwendung und Geschäftsanwendungen",
                                    color: "bg-green-50 hover:bg-green-100 border-green-200",
                                    icon: "💼",
                                },
                                {
                                    type: "DZG" as const,
                                    title: "DZG - Datenzugangsgesetz",
                                    description: "Forschungs- und hochwertige Datensätze für akademische Nutzung",
                                    color: "bg-purple-50 hover:bg-purple-100 border-purple-200",
                                    icon: "🔬",
                                },
                            ].map((option) => (
                                <motion.div
                                    key={option.type}
                                    variants={fadeInUp}
                                    className={`p-6 text-left rounded-lg border-2 transition-all duration-200 cursor-pointer ${option.color} ${requestType === option.type ? "ring-2 ring-primary ring-offset-2" : ""
                                        }`}
                                    onClick={() => setRequestType(option.type)}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <div className="flex items-start gap-3">
                                        <span className="text-2xl">{option.icon}</span>
                                        <div>
                                            <h3 className="font-semibold text-lg mb-2">{option.title}</h3>
                                            <p className="text-sm text-muted-foreground">{option.description}</p>
                                            {aiSuggestions.find(s => s.field === 'requestType' && s.suggestion === option.type) && (
                                                <div className="mt-2 p-2 bg-primary/10 rounded-md">
                                                    <p className="text-xs text-primary font-medium">KI-Empfehlung</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </CardContent>
                    </>
                );

            case 1: // Basic Information
                return (
                    <>
                        <CardHeader>
                            <CardTitle>Grundinformationen</CardTitle>
                            <CardDescription>
                                Geben Sie wesentliche Details zu Ihrer Datenanfrage an
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <motion.div variants={fadeInUp}>
                                <InlineCompletionInput
                                    id="title"
                                    label="Anfragetitel"
                                    value={formData.title}
                                    onChange={(value) => updateFormData("title", value)}
                                    placeholder="Kurzer, beschreibender Titel für Ihre Anfrage"
                                    required={true}
                                    context={createContextSummary("title")}
                                />
                            </motion.div>
                            <motion.div variants={fadeInUp}>
                                <InlineCompletionInput
                                    id="description"
                                    label="Beschreibung"
                                    value={formData.description}
                                    onChange={(value) => updateFormData("description", value)}
                                    placeholder="Beschreiben Sie detailliert, welche Informationen Sie benötigen"
                                    type="textarea"
                                    rows={4}
                                    required={true}
                                    context={createContextSummary("description")}
                                />
                            </motion.div>
                            <motion.div variants={fadeInUp} className="space-y-2">
                                <Label>Dringlichkeit</Label>
                                <RadioGroup
                                    value={formData.urgency}
                                    onValueChange={(value) => updateFormData("urgency", value)}
                                    className="space-y-2"
                                >
                                    {[
                                        { value: "low", label: "Niedrig - Keine Eile" },
                                        { value: "normal", label: "Normal - Standard (4 Wochen)" },
                                        { value: "high", label: "Hoch - Dringend (2 Wochen)" },
                                        { value: "urgent", label: "Sehr dringend (1 Woche)" },
                                    ].map((urgency) => (
                                        <motion.div
                                            key={`urgency-${urgency.value}`}
                                            className="flex items-center space-x-2 rounded-md border p-3 cursor-pointer hover:bg-accent transition-colors"
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                        >
                                            <RadioGroupItem value={urgency.value} id={`urgency-${urgency.value}`} />
                                            <Label htmlFor={`urgency-${urgency.value}`} className="cursor-pointer w-full">
                                                {urgency.label}
                                            </Label>
                                        </motion.div>
                                    ))}
                                </RadioGroup>
                            </motion.div>
                        </CardContent>
                    </>
                );

            case 2: // Requester Details
                return (
                    <>
                        <CardHeader>
                            <CardTitle>Antragsteller-Details</CardTitle>
                            <CardDescription>
                                Ihre Kontaktinformationen und Organisationsdetails
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <motion.div variants={fadeInUp} className="space-y-2">
                                <Label htmlFor="name">Vollständiger Name *</Label>
                                <Input
                                    id="name"
                                    placeholder="Ihr vollständiger rechtlicher Name"
                                    value={formData.requesterInfo.name}
                                    onChange={(e) => updateRequesterInfo("name", e.target.value)}
                                    className="transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                />
                            </motion.div>
                            <motion.div variants={fadeInUp} className="space-y-2">
                                <Label htmlFor="email">E-Mail-Adresse *</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="ihre.email@beispiel.com"
                                    value={formData.requesterInfo.email}
                                    onChange={(e) => updateRequesterInfo("email", e.target.value)}
                                    className="transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                />
                            </motion.div>
                            <motion.div variants={fadeInUp} className="space-y-2">
                                <Label htmlFor="organization">Organisation</Label>
                                <Input
                                    id="organization"
                                    placeholder="Ihr Unternehmen oder Ihre Organisation"
                                    value={formData.requesterInfo.organization}
                                    onChange={(e) => updateRequesterInfo("organization", e.target.value)}
                                    className="transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                />
                            </motion.div>
                            <motion.div variants={fadeInUp} className="space-y-2">
                                <Label htmlFor="phone">Telefon (Optional)</Label>
                                <Input
                                    id="phone"
                                    placeholder="+43 XXX XXX XXX"
                                    value={formData.requesterInfo.phone}
                                    onChange={(e) => updateRequesterInfo("phone", e.target.value)}
                                    className="transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                />
                            </motion.div>
                        </CardContent>
                    </>
                );

            case 3: // Request Details
                return (
                    <>
                        <CardHeader>
                            <CardTitle>Anfragedetails</CardTitle>
                            <CardDescription>
                                Spezifische Informationen zu Ihrer Anfrage
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <motion.div variants={fadeInUp}>
                                <InlineCompletionInput
                                    id="publicInterest"
                                    label="Begründung des öffentlichen Interesses *"
                                    value={formData.publicInterest}
                                    onChange={(value) => updateFormData("publicInterest", value)}
                                    placeholder="Erklären Sie, warum diese Information im öffentlichen Interesse liegt"
                                    type="textarea"
                                    rows={4}
                                    required={true}
                                    context={createContextSummary("publicInterest")}
                                />
                            </motion.div>
                            <motion.div variants={fadeInUp} className="space-y-2">
                                <Label>Bevorzugtes Antwortformat</Label>
                                <RadioGroup
                                    value={formData.preferredFormat}
                                    onValueChange={(value) => updateFormData("preferredFormat", value)}
                                    className="space-y-2"
                                >
                                    {[
                                        { value: "pdf", label: "PDF-Dokument" },
                                        { value: "excel", label: "Excel-Tabelle" },
                                        { value: "csv", label: "CSV-Daten" },
                                        { value: "json", label: "JSON-Format" },
                                        { value: "email", label: "E-Mail-Antwort" },
                                        { value: "other", label: "Anderes Format (bitte angeben)" },
                                    ].map((format) => (
                                        <motion.div
                                            key={format.value}
                                            className="flex items-center space-x-2 rounded-md border p-3 cursor-pointer hover:bg-accent transition-colors"
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                        >
                                            <RadioGroupItem value={format.value} id={`format-${format.value}`} />
                                            <Label htmlFor={`format-${format.value}`} className="cursor-pointer w-full">
                                                {format.label}
                                            </Label>
                                        </motion.div>
                                    ))}
                                </RadioGroup>
                                {formData.preferredFormat === "other" && (
                                    <motion.div variants={fadeInUp}>
                                        <Input
                                            id="preferredFormatOther"
                                            placeholder="Bitte geben Sie das gewünschte Format an"
                                            value={formData.preferredFormat === "other" ? "" : formData.preferredFormat}
                                            onChange={(e) => updateFormData("preferredFormat", e.target.value)}
                                            className="mt-2"
                                        />
                                    </motion.div>
                                )}
                            </motion.div>
                        </CardContent>
                    </>
                );

            case 4: // Data Specifications (IFG) or Commercial/Research (IWG/DZG)
                if (requestType === "IWG") {
                    return (
                        <>
                            <CardHeader>
                                <CardTitle>Details zur geschäftlichen Nutzung</CardTitle>
                                <CardDescription>
                                    Informationen zu Ihrem Geschäftsmodell und der beabsichtigten Nutzung
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <motion.div variants={fadeInUp}>
                                    <InlineCompletionInput
                                        id="businessModel"
                                        label="Geschäftsmodell *"
                                        value={formData.businessModel}
                                        onChange={(value) => updateFormData("businessModel", value)}
                                        placeholder="Beschreiben Sie Ihr Geschäftsmodell und wie Sie diese Daten nutzen möchten"
                                        type="textarea"
                                        rows={4}
                                        required={true}
                                        context={createContextSummary("businessModel")}
                                    />
                                </motion.div>
                                <motion.div variants={fadeInUp} className="space-y-2">
                                    <Label>Beabsichtigte Nutzung</Label>
                                    <RadioGroup
                                        value={formData.intendedUse}
                                        onValueChange={(value) => updateFormData("intendedUse", value)}
                                        className="space-y-2"
                                    >
                                        {[
                                            { value: "commercial", label: "Geschäftliche Nutzung" },
                                            { value: "non_commercial", label: "Nicht-kommerzielle Nutzung" },
                                            { value: "research", label: "Forschung" },
                                            { value: "journalism", label: "Journalismus" },
                                        ].map((use) => (
                                            <motion.div
                                                key={use.value}
                                                className="flex items-center space-x-2 rounded-md border p-3 cursor-pointer hover:bg-accent transition-colors"
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                            >
                                                <RadioGroupItem value={use.value} id={`use-${use.value}`} />
                                                <Label htmlFor={`use-${use.value}`} className="cursor-pointer w-full">
                                                    {use.label}
                                                </Label>
                                            </motion.div>
                                        ))}
                                    </RadioGroup>
                                </motion.div>
                            </CardContent>
                        </>
                    );
                } else if (requestType === "DZG") {
                    return (
                        <>
                            <CardHeader>
                                <CardTitle>Forschungsdetails</CardTitle>
                                <CardDescription>
                                    Informationen zu Ihrem Forschungsprojekt und der Methodik
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <motion.div variants={fadeInUp}>
                                    <InlineCompletionInput
                                        id="researchPurpose"
                                        label="Forschungszweck *"
                                        value={formData.researchPurpose}
                                        onChange={(value) => updateFormData("researchPurpose", value)}
                                        placeholder="Beschreiben Sie Ihre Forschungsziele und Methodik"
                                        type="textarea"
                                        rows={4}
                                        required={true}
                                        context={createContextSummary("researchPurpose")}
                                    />
                                </motion.div>
                                <motion.div variants={fadeInUp} className="space-y-2">
                                    <Label>Forschungsbereich</Label>
                                    <Select
                                        value={formData.researchField}
                                        onValueChange={(value) => updateFormData("researchField", value)}
                                    >
                                        <SelectTrigger className="transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:border-primary">
                                            <SelectValue placeholder="Forschungsbereich auswählen" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="health">Gesundheit & Medizin</SelectItem>
                                            <SelectItem value="environment">Umwelt</SelectItem>
                                            <SelectItem value="economics">Wirtschaft</SelectItem>
                                            <SelectItem value="social_science">Sozialwissenschaften</SelectItem>
                                            <SelectItem value="technology">Technologie</SelectItem>
                                            <SelectItem value="other">Sonstiges</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </motion.div>
                            </CardContent>
                        </>
                    );
                } else { // IFG case
                    return (
                        <>
                            <CardHeader>
                                <CardTitle>Datenspezifikationen</CardTitle>
                                <CardDescription>
                                    Geben Sie die genaue Definition Ihrer Datenanfrage an
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <motion.div variants={fadeInUp}>
                                    <InlineCompletionInput
                                        id="dataScope"
                                        label="Datenschutzbereich *"
                                        value={formData.dataScope}
                                        onChange={(value) => updateFormData("dataScope", value)}
                                        placeholder="Beschreiben Sie den Umfang der Daten, die Sie anfragen"
                                        type="textarea"
                                        rows={4}
                                        required={true}
                                        context={createContextSummary("dataScope")}
                                    />
                                </motion.div>
                                <motion.div variants={fadeInUp}>
                                    <InlineCompletionInput
                                        id="dataQuality"
                                        label="Datenqualität *"
                                        value={formData.dataQuality}
                                        onChange={(value) => updateFormData("dataQuality", value)}
                                        placeholder="Beschreiben Sie die Qualität der Daten, die Sie anfragen"
                                        type="textarea"
                                        rows={4}
                                        required={true}
                                        context={createContextSummary("dataQuality")}
                                    />
                                </motion.div>

                                <motion.div variants={fadeInUp} className="space-y-2">
                                    <Label>Aktualisierungsfrequenz</Label>
                                    <Select
                                        value={formData.updateFrequency}
                                        onValueChange={(value) => updateFormData("updateFrequency", value)}
                                    >
                                        <SelectTrigger className="transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:border-primary">
                                            <SelectValue placeholder="Häufigkeit der Aktualisierung wählen" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="one-time">Einmalig</SelectItem>
                                            <SelectItem value="daily">Täglich</SelectItem>
                                            <SelectItem value="weekly">Wöchentlich</SelectItem>
                                            <SelectItem value="monthly">Monatlich</SelectItem>
                                            <SelectItem value="quarterly">Vierteljährlich</SelectItem>
                                            <SelectItem value="yearly">Jährlich</SelectItem>
                                            <SelectItem value="on-demand">Bei Bedarf</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </motion.div>
                            </CardContent>
                        </>
                    );
                }

            case 5: // Additional Information
                return (
                    <>
                        <CardHeader>
                            <CardTitle>Zusätzliche Informationen</CardTitle>
                            <CardDescription>
                                Alle anderen Details, die bei der Bearbeitung Ihrer Anfrage helfen könnten
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <motion.div variants={fadeInUp} className="space-y-2">
                                <Label>Technische Anforderungen</Label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                    {[
                                        "API-Zugang",
                                        "Massen-Download",
                                        "Maschinenlesbar",
                                        "Metadaten",
                                        "Dokumentation",
                                        "Echtzeit-Updates",
                                    ].map((requirement) => (
                                        <motion.div
                                            key={requirement}
                                            className="flex items-center space-x-2 rounded-md border p-3 cursor-pointer hover:bg-accent transition-colors"
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                        >
                                            <Checkbox
                                                id={`req-${requirement}`}
                                                checked={formData.technicalRequirements.includes(requirement.toLowerCase())}
                                                onCheckedChange={(checked) => {
                                                    const current = formData.technicalRequirements;
                                                    if (checked) {
                                                        updateFormData("technicalRequirements", [...current, requirement.toLowerCase()]);
                                                    } else {
                                                        updateFormData("technicalRequirements", current.filter(r => r !== requirement.toLowerCase()));
                                                    }
                                                }}
                                            />
                                            <Label htmlFor={`req-${requirement}`} className="cursor-pointer w-full">
                                                {requirement}
                                            </Label>
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.div>

                            <motion.div variants={fadeInUp} className="space-y-2">
                                <Label>Kontaktpräferenzen</Label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                    {[
                                        "E-Mail",
                                        "Telefon",
                                        "Post",
                                        "Persönlich",
                                    ].map((preference) => (
                                        <motion.div
                                            key={preference}
                                            className="flex items-center space-x-2 rounded-md border p-3 cursor-pointer hover:bg-accent transition-colors"
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                        >
                                            <Checkbox
                                                id={`contact-${preference}`}
                                                checked={formData.contactPreferences.includes(preference.toLowerCase())}
                                                onCheckedChange={(checked) => {
                                                    const current = formData.contactPreferences;
                                                    if (checked) {
                                                        updateFormData("contactPreferences", [...current, preference.toLowerCase()]);
                                                    } else {
                                                        updateFormData("contactPreferences", current.filter(p => p !== preference.toLowerCase()));
                                                    }
                                                }}
                                            />
                                            <Label htmlFor={`contact-${preference}`} className="cursor-pointer w-full">
                                                {preference}
                                            </Label>
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.div>

                            <motion.div variants={fadeInUp}>
                                <InlineCompletionInput
                                    id="additionalInfo"
                                    label="Zusätzliche Notizen"
                                    value={formData.additionalInfo}
                                    onChange={(value) => updateFormData("additionalInfo", value)}
                                    placeholder="Alle anderen Informationen oder besonderen Anfragen"
                                    type="textarea"
                                    rows={3}
                                    context={createContextSummary("additionalInfo")}
                                />
                            </motion.div>

                            <motion.div variants={fadeInUp}>
                                <InlineCompletionInput
                                    id="specialRequirements"
                                    label="Besondere Anforderungen"
                                    value={formData.specialRequirements.join(", ")}
                                    onChange={(value) => {
                                        const requirements = value.split(",").map(r => r.trim()).filter(r => r);
                                        updateFormData("specialRequirements", requirements);
                                    }}
                                    placeholder="Besondere Anforderungen oder Wünsche (durch Kommas getrennt)"
                                    type="textarea"
                                    rows={2}
                                    context={createContextSummary("specialRequirements")}
                                />
                            </motion.div>
                        </CardContent>
                    </>
                );

            default:
                return null;
        }
    };

    return (
        <div className={cn("w-full max-w-4xl mx-auto py-8", className)}>
            {/* Progress indicator */}
            <motion.div
                className="mb-8"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="flex justify-between mb-2">
                    {steps.map((step, index) => (
                        <motion.div
                            key={`step-${step.id}-${index}`}
                            className="flex flex-col items-center"
                            whileHover={{ scale: 1.1 }}
                        >
                            <motion.div
                                className={cn(
                                    "w-4 h-4 rounded-full cursor-pointer transition-colors duration-300",
                                    index < currentStep
                                        ? "bg-primary"
                                        : index === currentStep
                                            ? "bg-primary ring-4 ring-primary/20"
                                            : "bg-muted",
                                )}
                                onClick={() => {
                                    if (index <= currentStep) {
                                        setCurrentStep(index);
                                    }
                                }}
                                whileTap={{ scale: 0.95 }}
                            />
                            <motion.span
                                className={cn(
                                    "text-xs mt-1.5 hidden sm:block",
                                    index === currentStep
                                        ? "text-primary font-medium"
                                        : "text-muted-foreground",
                                )}
                            >
                                {step.title}
                            </motion.span>
                        </motion.div>
                    ))}
                </div>
                <div className="w-full bg-muted h-1.5 rounded-full overflow-hidden mt-2">
                    <motion.div
                        className="h-full bg-primary"
                        initial={{ width: 0 }}
                        animate={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
                        transition={{ duration: 0.3 }}
                    />
                </div>
            </motion.div>

            {/* Form card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
            >
                <Card className="border shadow-md rounded-3xl overflow-hidden">
                    <div>
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentStep}
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                                variants={contentVariants}
                            >
                                {renderStepContent()}
                            </motion.div>
                        </AnimatePresence>

                        <CardFooter className="flex justify-between pt-6 pb-4">
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={prevStep}
                                    disabled={currentStep === 0}
                                    className="flex items-center gap-1 transition-all duration-300 rounded-2xl"
                                >
                                    <ChevronLeft className="h-4 w-4" /> Zurück
                                </Button>
                            </motion.div>
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <Button
                                    type="button"
                                    onClick={
                                        currentStep === steps.length - 1 ? handleSubmit : nextStep
                                    }
                                    disabled={!isStepValid() || isSubmitting}
                                    className="flex items-center gap-1 transition-all duration-300 rounded-2xl"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin" /> Wird eingereicht...
                                        </>
                                    ) : (
                                        <>
                                            {currentStep === steps.length - 1 ? "Anfrage einreichen" : "Weiter"}
                                            {currentStep === steps.length - 1 ? (
                                                <Send className="h-4 w-4" />
                                            ) : (
                                                <ChevronRight className="h-4 w-4" />
                                            )}
                                        </>
                                    )}
                                </Button>
                            </motion.div>
                        </CardFooter>
                    </div>
                </Card>
            </motion.div>

            {/* Step indicator */}
            <motion.div
                className="mt-4 text-center text-sm text-muted-foreground"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
            >
                Schritt {currentStep + 1} von {steps.length}: {steps[currentStep].title}
            </motion.div>
        </div>
    );
}