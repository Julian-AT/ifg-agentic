"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FileText, Search, ExternalLink, Sparkles, Info } from "lucide-react";
import Link from "next/link";

interface DataNotFoundActionProps {
  searchQuery?: string;
  className?: string;
  onCreateDataRequest?: (query: string) => void;
}

export function DataNotFoundAction({
  searchQuery = "",
  className,
  onCreateDataRequest,
}: DataNotFoundActionProps) {
  const handleCreateRequest = () => {
    if (onCreateDataRequest) {
      onCreateDataRequest(searchQuery);
    }
  };
  return (
    <Card className={`border-blue-200 bg-blue-50/50 ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-900">
          <Search className="h-5 w-5" />
          Nicht gefunden, was Sie suchen?
        </CardTitle>
        <CardDescription className="text-blue-700">
          Stellen Sie eine offizielle Anfrage und lassen Sie sich die benötigten
          Informationen direkt von der zuständigen Behörde bereitstellen.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
          <div className="bg-white rounded-lg p-3 border border-blue-200">
            <div className="font-semibold text-blue-900 mb-1">📄 IFG</div>
            <div className="text-blue-700 text-xs">
              Allgemeine Informationen und Dokumente
            </div>
          </div>
          <div className="bg-white rounded-lg p-3 border border-blue-200">
            <div className="font-semibold text-blue-900 mb-1">🔄 IWG</div>
            <div className="text-blue-700 text-xs">
              Daten für kommerzielle Nutzung
            </div>
          </div>
          <div className="bg-white rounded-lg p-3 border border-blue-200">
            <div className="font-semibold text-blue-900 mb-1">🔬 DZG</div>
            <div className="text-blue-700 text-xs">
              Forschungsdaten für Wissenschaft
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          {onCreateDataRequest ? (
            <Button
              onClick={handleCreateRequest}
              className="w-full gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
              size="lg"
            >
              <Sparkles className="h-4 w-4" />
              AI-unterstützte Datenanfrage erstellen
              <FileText className="h-4 w-4" />
            </Button>
          ) : (
            <Link href="/data-requests" className="w-full">
              <Button
                className="w-full gap-2 bg-blue-600 hover:bg-blue-700"
                size="lg"
              >
                <FileText className="h-4 w-4" />
                Datenanfrage stellen
              </Button>
            </Link>
          )}

          <div className="flex items-center justify-center gap-2 pt-2">
            <div className="flex items-center gap-1 text-xs text-blue-600">
              <Sparkles className="h-3 w-3" />
              <span>KI-unterstützt</span>
            </div>
            <div className="w-1 h-1 rounded-full bg-blue-400" />
            <div className="flex items-center gap-1 text-xs text-blue-600">
              <FileText className="h-3 w-3" />
              <span>Rechtlich konform</span>
            </div>
            <div className="w-1 h-1 rounded-full bg-blue-400" />
            <div className="flex items-center gap-1 text-xs text-blue-600">
              <Info className="h-3 w-3" />
              <span>Automatische Behördenerkennung</span>
            </div>
          </div>

          <Button
            variant="outline"
            className="gap-2 border-blue-300 text-blue-700 hover:bg-blue-100"
            onClick={() => {
              window.open("/help/data-requests", "_blank");
            }}
          >
            <ExternalLink className="h-4 w-4" />
            Anleitung und Hilfe
          </Button>
        </div>

        {searchQuery && (
          <div className="text-xs text-blue-700 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg p-3 border border-amber-200">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              <strong>Smart-Tipp:</strong>
            </div>
            <div className="mt-1">
              Ihre Suche nach "{searchQuery}" wird automatisch analysiert und in
              das Anfrageformular übernommen. Die KI hilft beim Ausfüllen der
              Felder und findet die passende Behörde.
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
