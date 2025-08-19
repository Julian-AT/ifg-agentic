import { Artifact } from "@/components/create-artifact";
import { SendIcon, BotIcon } from "lucide-react";
import { useRef } from "react";
import { AIDataRequestForm } from "@/components/ai-data-request-form";

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
  // Request type specific fields
  businessModel?: string;
  technicalRequirements?: string;
  dataUsagePurpose?: string;
  researchPurpose?: string;
  institutionalAffiliation?: string;
  dataProtectionMeasures?: string;
  ethicsApproval?: string;
  timeframe?: string;
}

interface Metadata {
  formData: DataRequestFormData;
  isSubmitted: boolean;
  isStreaming: boolean;
  streamingField?: string;
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

  initialize: async ({ setMetadata, documentId }) => {
    // Initialize with default form data
    const defaultFormData: DataRequestFormData = {
      requestType: "",
      title: "",
      description: "",
      publicInterest: "",
      requesterName: "",
      requesterEmail: "",
      organization: "",
      urgency: "medium",
      targetAgency: "",
    };

    setMetadata({
      formData: defaultFormData,
      isSubmitted: false,
      isStreaming: false,
      streamingField: undefined,
      suggestedAgencies: undefined,
      formSuggestions: undefined,
      validation: undefined,
    });
  },
  onStreamPart: ({ streamPart, setMetadata }) => {
    if (streamPart.type === "data-formDelta") {
      const { field, content, oldValue, isComplete, hasChange } = (streamPart as any).data;

      setMetadata((prev) => ({
        ...prev,
        isStreaming: !isComplete,
        streamingField: isComplete ? undefined : field,
        formData: {
          ...prev.formData,
          [field]: content,
        },
      }));

      // Notify the form component about changes for diff view
      if (hasChange && typeof window !== 'undefined' && (window as any).formRef?.current?.addDiff) {
        (window as any).formRef.current.addDiff(field, content, oldValue || "", getFieldLabel(field));
      }
    }

    if (streamPart.type === "data-formComplete") {
      const { formData, isComplete } = (streamPart as any).data;

      setMetadata((prev) => ({
        ...prev,
        isStreaming: false,
        streamingField: undefined,
        formData: { ...prev.formData, ...formData },
      }));
    }

    if (streamPart.type === "data-formSuggestions") {
      setMetadata((prev) => ({
        ...prev,
        formSuggestions: (streamPart as any).data.suggestions,
      }));
    }

    if (streamPart.type === "data-agencySuggestions") {
      setMetadata((prev) => ({
        ...prev,
        suggestedAgencies: (streamPart as any).data.agencies,
      }));
    }

    if (streamPart.type === "data-validationResult") {
      setMetadata((prev) => ({
        ...prev,
        validation: (streamPart as any).data.validation,
      }));
    }
  },
  content: ({ metadata, setMetadata, ...context }) => {
    const formRef = useRef<any>(null);
    const sendMessage = (context as any).sendMessage;

    if (typeof window !== 'undefined') {
      (window as any).formRef = formRef;
    }

    return (
      <div className="max-w-4xl mx-auto p-6">
        <AIDataRequestForm
          initialData={metadata.formData as DataRequestFormData}
          onSubmit={async (data) => {
            console.log("submit", data);
          }}
        />
      </div>
    );
  },
  actions: [
  ],

  toolbar: [],
});

// Helper function for field labels
function getFieldLabel(field: string): string {
  const labels: Record<string, string> = {
    requestType: "Request Type",
    title: "Title",
    description: "Description",
    publicInterest: "Public Interest",
    requesterName: "Name",
    requesterEmail: "Email",
    organization: "Organization",
    urgency: "Priority",
    businessModel: "Business Model",
    technicalRequirements: "Technical Requirements",
    dataUsagePurpose: "Data Usage Purpose",
    researchPurpose: "Research Purpose",
    institutionalAffiliation: "Institution",
    dataProtectionMeasures: "Data Protection",
    ethicsApproval: "Ethics Approval",
    timeframe: "Timeframe",
  };

  return labels[field] || field;
}
