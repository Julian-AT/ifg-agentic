"use client";

import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

export default function FeedbackDialog() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="outline" size="sm" className="text-sm">
          Feedback
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle>Feedback senden</AlertDialogTitle>
          <AlertDialogDescription>
            Teilen Sie uns mit, wie wir den IFG Agent verbessern können.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="space-y-5">
          <Textarea
            id="feedback"
            placeholder="Wie können wir den IFG Agent verbessern?"
            aria-label="Feedback senden"
          />
          <div className="flex flex-col sm:flex-row sm:justify-end gap-2">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Abbrechen
            </Button>
            <Button
              onClick={() => {
                // Handle feedback submission
                setIsOpen(false);
              }}
            >
              Feedback senden
            </Button>
          </div>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
