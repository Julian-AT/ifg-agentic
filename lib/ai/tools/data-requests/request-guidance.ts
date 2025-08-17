import { tool } from "ai";
import { z } from "zod";
import type { UIMessageStreamWriter } from "ai";
import type { Session } from "next-auth";
import type { RequestType } from "@/lib/types/data-request";

// Schema definitions
const RequestTypeSchema = z.enum(["IFG", "IWG", "DZG"]);

interface RequestGuidanceProps {
    session: Session;
    dataStream: UIMessageStreamWriter;
}

interface LegalFrameworkGuidance {
    lawName: string;
    purpose: string;
    keyRequirements: string[];
    typicalUseCase: string;
    timeframes: string;
    costs: string;
    commonPitfalls: string[];
}

/**
 * Tool for providing quick data request guidance without creating an artifact
 * Helps users understand Austrian data request laws and procedures
 */
export function getDataRequestGuidance({
    session,
    dataStream,
}: RequestGuidanceProps) {
    return tool({
        description:
            "Provide comprehensive guidance on Austrian data request laws and procedures without creating an artifact. Offers framework-specific advice and best practices.",
        inputSchema: z.object({
            question: z
                .string()
                .min(1, "Question is required")
                .describe("The user's question about data requests or Austrian laws"),
            context: z
                .string()
                .optional()
                .describe("Additional context about the user's situation"),
        }),
        execute: async ({ question, context }) => {
            try {
                console.log("📚 Providing data request guidance:", { question, hasContext: !!context });

                // Determine the most relevant law based on the question
                const relevantLaw = determineRelevantLaw(question, context);
                const guidance = getFrameworkGuidance(relevantLaw);

                // Generate personalized recommendations
                const personalizedAdvice = generatePersonalizedAdvice(question, context, relevantLaw);

                // Stream the guidance
                dataStream.write({
                    type: "data-guidance",
                    data: {
                        type: "guidance",
                        relevantLaw,
                        guidance,
                        personalizedAdvice,
                        question,
                        context: context || "",
                    },
                    transient: false,
                });

                console.log(`✅ Provided ${relevantLaw} guidance`);

                return {
                    success: true,
                    relevantLaw,
                    guidance,
                    personalizedAdvice,
                    recommendation: generateRecommendation(relevantLaw),
                };
            } catch (error) {
                console.error("❌ Error providing data request guidance:", error);

                const errorMessage = error instanceof Error
                    ? error.message
                    : "Unknown error occurred";

                return {
                    success: false,
                    error: "Fehler beim Bereitstellen der Rechtsberatung",
                    details: errorMessage,
                };
            }
        },
    });
}

/**
 * Determine the most relevant legal framework
 */
function determineRelevantLaw(question: string, context?: string): RequestType {
    const questionLower = question.toLowerCase();
    const contextLower = (context || "").toLowerCase();
    const combined = `${questionLower} ${contextLower}`;

    // IWG indicators (commercial use)
    const iwgKeywords = [
        "commercial", "business", "kommerziell", "geschäft", "iwg",
        "startup", "unternehmen", "verkauf", "gewinn", "produkt"
    ];

    // DZG indicators (research/high-value datasets)
    const dzgKeywords = [
        "research", "wissenschaft", "forschung", "university", "universität",
        "dzg", "study", "analyse", "academic", "akademisch", "dissertation"
    ];

    if (iwgKeywords.some(keyword => combined.includes(keyword))) {
        return "IWG";
    }

    if (dzgKeywords.some(keyword => combined.includes(keyword))) {
        return "DZG";
    }

    // Default to IFG for general transparency requests
    return "IFG";
}

/**
 * Get comprehensive guidance for each framework
 */
function getFrameworkGuidance(requestType: RequestType): LegalFrameworkGuidance {
    const frameworks = {
        IFG: {
            lawName: "Informationsfreiheitsgesetz (IFG)",
            purpose: "Gewährleistet den allgemeinen Zugang zu öffentlichen Informationen und fördert Transparenz in der Verwaltung",
            keyRequirements: [
                "Klar beschreiben, welche Informationen benötigt werden",
                "Öffentliches Interesse an den Informationen darlegen",
                "Zeitrahmen spezifizieren, falls relevant",
                "Begründung für Transparenz und Bürgerbeteiligung",
            ],
            typicalUseCase: "Bürger, Journalisten und NGOs, die Transparenz und Zugang zu Regierungsinformationen suchen",
            timeframes: "8 Wochen gesetzliche Frist, oft schneller bei einfachen Anfragen",
            costs: "Grundsätzlich kostenlos, Gebühren nur bei außergewöhnlichem Aufwand",
            commonPitfalls: [
                "Zu vage Anfragen ohne klaren Fokus",
                "Fehlendes öffentliches Interesse",
                "Anfragen zu laufenden Verfahren",
                "Persönliche Daten ohne Berechtigung",
            ],
        },
        IWG: {
            lawName: "Informationsweiterverwendungsgesetz (IWG)",
            purpose: "Regelt die kommerzielle Nutzung und Weiterverwendung von öffentlichen Informationen für wirtschaftliche Zwecke",
            keyRequirements: [
                "Geschäftsmodell oder Verwendungszweck detailliert beschreiben",
                "Technische Anforderungen an die Daten spezifizieren",
                "Bereitschaft zur Kostenübernahme signalisieren",
                "Nachweis der kommerziellen Seriosität",
            ],
            typicalUseCase: "Unternehmen, Startups und Entwickler, die öffentliche Daten für kommerzielle Zwecke nutzen möchten",
            timeframes: "20 Werktage gesetzliche Frist",
            costs: "Kostendeckende Gebühren für Datenaufbereitung und -bereitstellung möglich",
            commonPitfalls: [
                "Unklares Geschäftsmodell",
                "Fehlende technische Spezifikationen",
                "Unterschätzung der Kosten",
                "Mangelnde Rechtfertigung des kommerziellen Nutzens",
            ],
        },
        DZG: {
            lawName: "Datenzugangsgesetz (DZG)",
            purpose: "Ermöglicht Zugang zu hochwertigen Datensätzen für Forschung, Innovation und gesellschaftlichen Nutzen",
            keyRequirements: [
                "Forschungszweck und Methodik wissenschaftlich erläutern",
                "Gesellschaftlichen oder wissenschaftlichen Nutzen darlegen",
                "Datenschutz und ethische Aspekte berücksichtigen",
                "Qualifikation des Antragstellers nachweisen",
            ],
            typicalUseCase: "Forscher, Wissenschaftler und Innovatoren, die Zugang zu hochwertigen Regierungsdaten benötigen",
            timeframes: "15 Werktage gesetzliche Frist",
            costs: "Meist kostenlos für wissenschaftliche Zwecke",
            commonPitfalls: [
                "Unzureichende wissenschaftliche Begründung",
                "Fehlende Datenschutz-Konzepte",
                "Unrealistische Forschungsziele",
                "Mangelnde institutionelle Anbindung",
            ],
        },
    };

    return frameworks[requestType];
}

/**
 * Generate personalized advice based on user input
 */
function generatePersonalizedAdvice(question: string, context: string | undefined, framework: RequestType): string[] {
    const advice: string[] = [];

    // Framework-specific advice
    if (framework === "IWG") {
        advice.push("Bereiten Sie eine detaillierte Geschäftsbeschreibung vor");
        advice.push("Kalkulieren Sie realistische Budgets für Datengebühren ein");
    } else if (framework === "DZG") {
        advice.push("Entwickeln Sie ein klares Forschungsdesign");
        advice.push("Bereiten Sie Datenschutz- und Ethik-Konzepte vor");
    } else {
        advice.push("Formulieren Sie Ihre Anfrage so spezifisch wie möglich");
        advice.push("Betonen Sie das öffentliche Interesse Ihrer Anfrage");
    }

    // Context-specific advice
    if (context?.toLowerCase().includes("urgent")) {
        advice.push("Erklären Sie die Dringlichkeit und bitten Sie um prioritäre Bearbeitung");
    }

    if (context?.toLowerCase().includes("data") || context?.toLowerCase().includes("dataset")) {
        advice.push("Spezifizieren Sie gewünschte Datenformate und technische Anforderungen");
    }

    return advice;
}

/**
 * Generate framework-specific recommendation
 */
function generateRecommendation(framework: RequestType): string {
    const recommendations = {
        IFG: "Möchten Sie eine IFG-Anfrage erstellen? Ich kann Ihnen dabei helfen, eine rechtskonforme Transparenz-Anfrage zu formulieren.",
        IWG: "Möchten Sie eine IWG-Anfrage für kommerzielle Datennutzung erstellen? Ich kann Ihnen bei der Geschäftsmodell-Dokumentation helfen.",
        DZG: "Möchten Sie eine DZG-Anfrage für Forschungszwecke erstellen? Ich kann Ihnen bei der wissenschaftlichen Begründung helfen.",
    };

    return recommendations[framework];
}