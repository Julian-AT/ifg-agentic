import { tool } from "ai";
import { z } from "zod";
import type { UIMessageStreamWriter } from "ai";
import type { Session } from "next-auth";

// Tool for providing quick data request guidance without creating an artifact
export function getDataRequestGuidance({
  session,
  dataStream,
}: {
  session: Session;
  dataStream: UIMessageStreamWriter;
}) {
  return tool({
    description:
      "Provide guidance on Austrian data request laws and procedures without creating an artifact",
    inputSchema: z.object({
      question: z
        .string()
        .describe("The user's question about data requests or Austrian laws"),
      context: z
        .string()
        .optional()
        .describe("Additional context about the user's situation"),
    }),
    execute: async ({ question, context }) => {
      try {
        // Determine the most relevant law based on the question
        let relevantLaw = "IFG";
        let guidance = {};

        const questionLower = question.toLowerCase();
        const contextLower = (context || "").toLowerCase();
        const combined = `${questionLower} ${contextLower}`;

        if (
          combined.includes("commercial") ||
          combined.includes("business") ||
          combined.includes("kommerziell") ||
          combined.includes("geschäft") ||
          combined.includes("iwg")
        ) {
          relevantLaw = "IWG";
          guidance = {
            lawName: "Informationsweiterverwendungsgesetz (IWG)",
            purpose:
              "Regelt die kommerzielle Nutzung und Weiterverwendung von öffentlichen Informationen",
            keyRequirements: [
              "Geschäftsmodell oder Verwendungszweck beschreiben",
              "Technische Anforderungen an die Daten spezifizieren",
              "Mögliche Kosten für die Datenbereitstellung berücksichtigen",
            ],
            typicalUseCase:
              "Unternehmen, die öffentliche Daten für kommerzielle Zwecke nutzen möchten",
          };
        } else if (
          combined.includes("research") ||
          combined.includes("wissenschaft") ||
          combined.includes("forschung") ||
          combined.includes("university") ||
          combined.includes("universität") ||
          combined.includes("dzg")
        ) {
          relevantLaw = "DZG";
          guidance = {
            lawName: "Datenzugangsgesetz (DZG)",
            purpose:
              "Ermöglicht Zugang zu hochwertigen Datensätzen für Forschung und Innovation",
            keyRequirements: [
              "Forschungszweck und Methodik erläutern",
              "Wissenschaftlichen Nutzen darlegen",
              "Datenschutz und ethische Aspekte berücksichtigen",
            ],
            typicalUseCase:
              "Forscher und Wissenschaftler, die Zugang zu Regierungsdaten benötigen",
          };
        } else {
          relevantLaw = "IFG";
          guidance = {
            lawName: "Informationsfreiheitsgesetz (IFG)",
            purpose:
              "Gewährleistet den allgemeinen Zugang zu öffentlichen Informationen",
            keyRequirements: [
              "Klar beschreiben, welche Informationen benötigt werden",
              "Öffentliches Interesse an den Informationen darlegen",
              "Zeitrahmen spezifizieren, falls relevant",
            ],
            typicalUseCase:
              "Bürger, die Transparenz und Zugang zu Regierungsinformationen suchen",
          };
        }

        // Stream the guidance
        dataStream.write({
          type: "data-guidance",
          data: {
            type: "guidance",
            relevantLaw,
            guidance,
            question,
            context: context || "",
          },
          transient: false,
        });

        return {
          success: true,
          relevantLaw,
          guidance,
          recommendation:
            "Möchten Sie ein Datenanfrage-Formular erstellen? Ich kann Ihnen dabei helfen, eine rechtskonforme Anfrage zu formulieren.",
        };
      } catch (error) {
        console.error("Error providing data request guidance:", error);
        return {
          success: false,
          error: "Fehler beim Bereitstellen der Rechtsberatung",
        };
      }
    },
  });
}
