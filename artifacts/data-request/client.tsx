import { Artifact } from "@/components/create-artifact";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  SendIcon,
  SparklesIcon,
  FileIcon,
  CheckCircleIcon,
  AlertCircleIcon,
} from "lucide-react";

interface DataRequestFormData {
  requestType: "IFG" | "IWG" | "DZG" | "";
  title: string;
  description: string;
  publicInterest: string;
  requesterName: string;
  requesterEmail: string;
  organization?: string;
  urgency: "low" | "medium" | "high";
  targetAgency?: string;
}

interface Metadata {
  formData: DataRequestFormData;
  isSubmitted: boolean;
  suggestedAgencies?: any[];
  formSuggestions?: any[];
  validation?: {
    isValid: boolean;
    errors: string[];
    suggestions: string[];
  };
}

export const dataRequestArtifact = new Artifact<"data-request", Metadata>({
  kind: "data-request",
  description:
    "Modernes Formular für österreichische Datenanfragen (IFG, IWG, DZG) mit KI-Unterstützung",

  initialize: async ({ setMetadata }) => {
    setMetadata({
      formData: {
        requestType: "",
        title: "",
        description: "",
        publicInterest: "",
        requesterName: "",
        requesterEmail: "",
        organization: "",
        urgency: "medium",
        targetAgency: "",
      },
      isSubmitted: false,
    });
  },

  onStreamPart: ({ streamPart, setMetadata }) => {
    // Handle stream parts when available
    // TODO: Add proper stream part handling when types are fixed
    console.log(streamPart);
  },

  content: ({ metadata, setMetadata }) => {
    const { formData } = metadata;

    const updateFormData = (updates: Partial<DataRequestFormData>) => {
      setMetadata((prev) => ({
        ...prev,
        formData: { ...prev.formData, ...updates },
      }));
    };

    if (metadata.isSubmitted) {
      return (
        <Card className="max-w-2xl mx-auto">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircleIcon className="w-6 h-6 text-green-600" />
            </div>
            <CardTitle className="text-green-800">
              Anfrage erfolgreich eingereicht
            </CardTitle>
            <CardDescription>
              Ihre Datenanfrage wurde an die zuständige Behörde weitergeleitet.
              Sie erhalten in Kürze eine Bestätigung per E-Mail.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div>
                <strong>Anfragetyp:</strong> {formData.requestType}
              </div>
              <div>
                <strong>Titel:</strong> {formData.title}
              </div>
              {metadata.suggestedAgencies &&
                metadata.suggestedAgencies.length > 0 && (
                  <div>
                    <strong>Behörde:</strong>{" "}
                    {metadata.suggestedAgencies[0].name}
                  </div>
                )}
            </div>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileIcon className="w-5 h-5" />
              Österreichische Datenanfrage
            </CardTitle>
            <CardDescription>
              Erstellen Sie eine rechtskonforme Anfrage nach IFG, IWG oder DZG
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Request Type Selection */}
            <div className="space-y-2">
              <Label htmlFor="requestType">Art der Anfrage *</Label>
              <Select
                value={formData.requestType}
                onValueChange={(value) =>
                  updateFormData({ requestType: value as any })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Wählen Sie die Art der Anfrage" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="IFG">
                    <div>
                      <div className="font-medium">
                        IFG - Informationsfreiheitsgesetz
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Allgemeine Informationsanfragen
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="IWG">
                    <div>
                      <div className="font-medium">
                        IWG - Informationsweiterverwendungsgesetz
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Kommerzielle Datennutzung
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="DZG">
                    <div>
                      <div className="font-medium">
                        DZG - Datenzugangsgesetz
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Forschungsdaten und hochwertige Datensätze
                      </div>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator />

            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Titel der Anfrage *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => updateFormData({ title: e.target.value })}
                placeholder="Kurzer, präziser Titel für Ihre Anfrage"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">
                Beschreibung der gewünschten Daten *
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  updateFormData({ description: e.target.value })
                }
                placeholder="Beschreiben Sie detailliert, welche Informationen oder Daten Sie benötigen..."
                rows={4}
              />
            </div>

            {/* Public Interest */}
            <div className="space-y-2">
              <Label htmlFor="publicInterest">Öffentliches Interesse</Label>
              <Textarea
                id="publicInterest"
                value={formData.publicInterest}
                onChange={(e) =>
                  updateFormData({ publicInterest: e.target.value })
                }
                placeholder="Erläutern Sie das öffentliche Interesse an diesen Informationen..."
                rows={3}
              />
            </div>

            <Separator />

            {/* Requester Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="requesterName">Vollständiger Name *</Label>
                <Input
                  id="requesterName"
                  value={formData.requesterName}
                  onChange={(e) =>
                    updateFormData({ requesterName: e.target.value })
                  }
                  placeholder="Ihr vollständiger Name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="requesterEmail">E-Mail-Adresse *</Label>
                <Input
                  id="requesterEmail"
                  type="email"
                  value={formData.requesterEmail}
                  onChange={(e) =>
                    updateFormData({ requesterEmail: e.target.value })
                  }
                  placeholder="ihre@email.com"
                />
              </div>
            </div>

            {/* Organization (optional) */}
            <div className="space-y-2">
              <Label htmlFor="organization">Organisation (optional)</Label>
              <Input
                id="organization"
                value={formData.organization}
                onChange={(e) =>
                  updateFormData({ organization: e.target.value })
                }
                placeholder="Name Ihrer Organisation, falls zutreffend"
              />
            </div>

            {/* Urgency */}
            <div className="space-y-2">
              <Label>Dringlichkeit</Label>
              <Select
                value={formData.urgency}
                onValueChange={(value) =>
                  updateFormData({ urgency: value as any })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">
                    Niedrig - Standardbearbeitung
                  </SelectItem>
                  <SelectItem value="medium">
                    Mittel - Zügige Bearbeitung
                  </SelectItem>
                  <SelectItem value="high">
                    Hoch - Dringende Bearbeitung
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Agency Suggestions */}
            {metadata.suggestedAgencies &&
              metadata.suggestedAgencies.length > 0 && (
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <SparklesIcon className="w-4 h-4 text-blue-600" />
                    <span className="font-medium text-blue-800">
                      KI-Empfehlung
                    </span>
                  </div>
                  <p className="text-sm text-blue-700 mb-2">
                    <strong>Empfohlene Behörde:</strong>{" "}
                    {metadata.suggestedAgencies[0].name}
                  </p>
                  <p className="text-xs text-blue-600">
                    {metadata.suggestedAgencies[0].reasoning}
                  </p>
                </div>
              )}

            {/* Form Suggestions */}
            {metadata.formSuggestions &&
              metadata.formSuggestions.length > 0 && (
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center gap-2 mb-2">
                    <SparklesIcon className="w-4 h-4 text-green-600" />
                    <span className="font-medium text-green-800">
                      KI-Verbesserungsvorschläge
                    </span>
                  </div>
                  <ul className="list-disc list-inside text-sm text-green-700 space-y-1">
                    {metadata.formSuggestions.map((suggestion) => (
                      <li key={`suggestion-${suggestion.fieldId}`}>
                        <strong>{suggestion.fieldId}:</strong>{" "}
                        {suggestion.suggestedValue}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

            {/* Validation Results */}
            {metadata.validation && (
              <div
                className={`p-4 rounded-lg border ${
                  metadata.validation.isValid
                    ? "bg-green-50 border-green-200"
                    : "bg-yellow-50 border-yellow-200"
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  {metadata.validation.isValid ? (
                    <CheckCircleIcon className="w-4 h-4 text-green-600" />
                  ) : (
                    <AlertCircleIcon className="w-4 h-4 text-yellow-600" />
                  )}
                  <span
                    className={`font-medium ${
                      metadata.validation.isValid
                        ? "text-green-800"
                        : "text-yellow-800"
                    }`}
                  >
                    {metadata.validation.isValid
                      ? "Anfrage ist vollständig"
                      : "Verbesserungsvorschläge"}
                  </span>
                </div>
                {metadata.validation.errors.length > 0 && (
                  <ul className="list-disc list-inside text-sm text-yellow-700 mb-2">
                    {metadata.validation.errors.map((error, index) => (
                      <li key={`error-${index}-${error.slice(0, 20)}`}>
                        {error}
                      </li>
                    ))}
                  </ul>
                )}
                {metadata.validation.suggestions.length > 0 && (
                  <ul className="list-disc list-inside text-sm text-yellow-700">
                    {metadata.validation.suggestions.map(
                      (suggestion, index) => (
                        <li
                          key={`validation-suggestion-${index}-${suggestion.slice(
                            0,
                            20
                          )}`}
                        >
                          {suggestion}
                        </li>
                      )
                    )}
                  </ul>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  },

  actions: [
    {
      icon: <SendIcon size={18} />,
      label: "Anfrage einreichen",
      description: "Die ausgefüllte Datenanfrage an die Behörde senden",
      onClick: ({ metadata, sendMessage }) => {
        const { formData } = metadata;

        // Validate required fields
        if (
          !formData.requestType ||
          !formData.title ||
          !formData.description ||
          !formData.requesterName ||
          !formData.requesterEmail
        ) {
          return;
        }

        sendMessage?.({
          role: "user",
          parts: [
            {
              type: "text",
              text: `Reiche diese ${
                formData.requestType
              }-Datenanfrage ein: ${JSON.stringify(formData)}`,
            },
          ],
        });
      },
    },
  ],

  toolbar: [
    {
      icon: <SparklesIcon />,
      description: "KI-Vorschläge für Formularfelder generieren",
      onClick: ({ sendMessage }) => {
        sendMessage?.({
          role: "user",
          parts: [
            {
              type: "text",
              text: "Generiere Verbesserungsvorschläge für die Datenanfrage im geöffneten Formular",
            },
          ],
        });
      },
    },
    {
      icon: <FileIcon />,
      description: "Passende Behörde finden",
      onClick: ({ sendMessage }) => {
        sendMessage?.({
          role: "user",
          parts: [
            {
              type: "text",
              text: "Finde die passende österreichische Behörde für die Datenanfrage im geöffneten Formular",
            },
          ],
        });
      },
    },
    {
      icon: <CheckCircleIcon />,
      description: "Anfrage auf Vollständigkeit prüfen",
      onClick: ({ sendMessage }) => {
        sendMessage?.({
          role: "user",
          parts: [
            {
              type: "text",
              text: "Prüfe die Datenanfrage im geöffneten Formular auf Vollständigkeit und rechtliche Korrektheit",
            },
          ],
        });
      },
    },
  ],
});
