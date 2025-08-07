"use client";

import { motion } from "framer-motion";
import { Button } from "./ui/button";
import { memo } from "react";
import type { UseChatHelpers } from "@ai-sdk/react";
import type { VisibilityType } from "./visibility-selector";
import type { ChatMessage } from "@/lib/types";

interface SuggestedActionsProps {
  chatId: string;
  sendMessage: UseChatHelpers<ChatMessage>["sendMessage"];
  selectedVisibilityType: VisibilityType;
}

function PureSuggestedActions({
  chatId,
  sendMessage,
  selectedVisibilityType,
}: SuggestedActionsProps) {
  const suggestedActions = [
    {
      title: "Bevölkerungsentwicklung",
      label: "Demografische Trends und Statistiken",
      action:
        "Zeige mir aktuelle Daten zur Bevölkerungsentwicklung und demografischen Trends in Österreich",
    },
    {
      title: "Verkehr & Mobilität",
      label: "Öffentliche Verkehrsdaten",
      action:
        "Suche nach Datensätzen zu öffentlichen Verkehrsmitteln, Fahrgastzahlen und Verkehrsaufkommen",
    },
    {
      title: "Energie & Umwelt",
      label: "Nachhaltigkeit und Klimadaten",
      action:
        "Finde Informationen zu Energieverbrauch, erneuerbaren Energien und Umweltindikatoren",
    },
    {
      title: "Wirtschaft & Arbeit",
      label: "Arbeitsmarkt und Wirtschaftsdaten",
      action:
        "Analysiere Arbeitsmarktdaten, Wirtschaftsindikatoren und Beschäftigungstrends",
    },
  ];

  return (
    <div
      data-testid="suggested-actions"
      className="grid sm:grid-cols-2 gap-2 w-full max-w-4xl mx-auto px-6 md:px-0"
    >
      {suggestedActions.map((suggestedAction, index) => (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ delay: 0.05 * index }}
          key={`suggested-action-${suggestedAction.title}-${index}`}
          className={index > 1 ? "hidden sm:block" : "block"}
        >
          <Button
            variant="ghost"
            onClick={async () => {
              window.history.replaceState({}, "", `/chat/${chatId}`);

              sendMessage({
                role: "user",
                parts: [{ type: "text", text: suggestedAction.action }],
              });
            }}
            className="text-left bg-card/60 border border-border hover:bg-card/70 cursor-pointer rounded-xl px-4 py-3.5 text-sm flex-1 gap-1 sm:flex-col w-full h-auto justify-start items-start"
          >
            <span className="font-medium">{suggestedAction.title}</span>
            <span className="text-muted-foreground">
              {suggestedAction.label}
            </span>
          </Button>
        </motion.div>
      ))}
    </div>
  );
}

export const SuggestedActions = memo(
  PureSuggestedActions,
  (prevProps, nextProps) => {
    if (prevProps.chatId !== nextProps.chatId) return false;
    if (prevProps.selectedVisibilityType !== nextProps.selectedVisibilityType)
      return false;

    return true;
  }
);
