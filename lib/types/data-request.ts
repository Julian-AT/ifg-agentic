// TypeScript schemas for Austrian data request system (IFG, IWG, DZG)
// Based on fragdenstaat.gv.at concept

export type RequestType = "IFG" | "IWG" | "DZG";

export type BaseRequestData = {
  id: string;
  type: RequestType;
  title: string;
  description: string;
  requesterInfo: RequesterInfo;
  timeline: Timeline;
  status: RequestStatus;
  createdAt: Date;
  updatedAt: Date;
  assignedAgency?: Agency;
  relatedDatasets?: string[];
  internalNotes?: string;
};

export type RequesterInfo = {
  name: string;
  email: string;
  organization?: string;
  address?: Address;
  phone?: string;
  isCommercialUse?: boolean;
  requestReason?: string;
};

export type Address = {
  street: string;
  city: string;
  postalCode: string;
  country: string;
};

export type Timeline = {
  submittedAt: Date;
  deadline: Date; // 4 weeks from submission as per law
  expectedResponse?: Date;
  reminderSent?: Date[];
  escalationLevel: number;
};

export type RequestStatus = {
  current:
  | "draft"
  | "submitted"
  | "assigned"
  | "in_progress"
  | "clarification_needed"
  | "completed"
  | "rejected"
  | "overdue";
  history: StatusChange[];
  publiclyVisible: boolean;
};

export type StatusChange = {
  status: string;
  timestamp: Date;
  note?: string;
  changedBy: string;
};

export type Agency = {
  id: string;
  name: string;
  type: "federal" | "state" | "municipal" | "other";
  contact: {
    email: string;
    phone?: string;
    address: Address;
  };
  competencies: string[];
  elakIntegration: boolean;
  averageResponseTime?: number; // in days
};

// IFG (Information Freedom Act) - General access to public information
export interface IFGRequest extends BaseRequestData {
  type: "IFG";
  timeframe?: DateRange;
  preferredFormat: ResponseFormat;
  publicInterest: string;
  searchedSources: string[]; // data.gv.at searches already performed
  exemptionConcerns?: ExemptionConcern[];
}

export type ExemptionConcern = {
  type:
  | "privacy"
  | "business_secrets"
  | "state_security"
  | "ongoing_proceedings";
  description: string;
};

// IWG (Information Reuse Act) - Open Data and commercial use
export interface IWGRequest extends BaseRequestData {
  type: "IWG";
  intendedUse: "commercial" | "non_commercial" | "research" | "journalism";
  businessModel?: string;
  dataFormat: DataFormat[];
  updateFrequency:
  | "one_time"
  | "monthly"
  | "quarterly"
  | "yearly"
  | "real_time";
  technicalRequirements: TechnicalRequirements;
  existingDataCheck: ExistingDataCheck;
  feeAcceptance: FeeAcceptance;
}

export type TechnicalRequirements = {
  apiAccess: boolean;
  bulkDownload: boolean;
  machineReadable: boolean;
  metadata: boolean;
  documentation: boolean;
};

export type ExistingDataCheck = {
  dataGovAtSearched: boolean;
  openDataPortalsChecked: string[];
  relatedRequestsReviewed: boolean;
};

export type FeeAcceptance = {
  willingToPay: boolean;
  maxAmount?: number;
  paymentMethod?: string;
};

// DZG (Data Access Act) - Protected data for research/innovation
export interface DZGRequest extends BaseRequestData {
  type: "DZG";
  researchPurpose: ResearchPurpose;
  dataSubjects: DataSubject[];
  privacyMeasures: PrivacyMeasures;
  institutionalAffiliation: InstitutionalAffiliation;
  ethicsApproval?: EthicsApproval;
  dataRetention: DataRetention;
  publicationPlans?: PublicationPlans;
}

export type ResearchPurpose = {
  field:
  | "health"
  | "environment"
  | "economics"
  | "social_science"
  | "technology"
  | "other";
  description: string;
  publicBenefit: string;
  methodology: string;
  expectedOutcomes: string;
};

export type DataSubject = {
  category: "individuals" | "businesses" | "organizations";
  sensitivityLevel: "public" | "internal" | "confidential" | "secret";
  dataTypes: string[];
  timeframe: DateRange;
};

export type PrivacyMeasures = {
  anonymization: boolean;
  pseudonymization: boolean;
  aggregation: boolean;
  accessControls: string[];
  storageLocation: "local" | "cloud_eu" | "cloud_non_eu";
  encryptionLevel: string;
};

export type InstitutionalAffiliation = {
  institution: string;
  department: string;
  role: string;
  supervisor?: string;
  institutionType:
  | "university"
  | "research_institute"
  | "private_company"
  | "ngo"
  | "government";
};

export type EthicsApproval = {
  obtained: boolean;
  committee: string;
  approvalNumber?: string;
  approvalDate?: Date;
  conditions?: string[];
};

export type DataRetention = {
  period: number; // in years
  disposalMethod: string;
  backupPolicy: string;
};

export type PublicationPlans = {
  planned: boolean;
  journals?: string[];
  timeline?: string;
  openAccess: boolean;
  dataSharing: boolean;
};

// Common types
export type DateRange = {
  start?: Date;
  end?: Date;
};

export type ResponseFormat =
  | "pdf"
  | "excel"
  | "csv"
  | "json"
  | "xml"
  | "paper"
  | "email"
  | "inspection";
export type DataFormat =
  | "csv"
  | "json"
  | "xml"
  | "rdf"
  | "api"
  | "database"
  | "custom";

// AI Suggestion types
export type FormSuggestion = {
  field: string;
  suggestion: string;
  confidence: number;
  reasoning: string;
  alternatives?: string[];
};

export type AgencySuggestion = {
  agency: Agency;
  relevanceScore: number;
  reasoning: string;
  competencyMatch: string[];
};

// Form state management
export type FormState = {
  currentStep: number;
  totalSteps: number;
  data: Partial<BaseRequestData>;
  validationErrors: Record<string, string>;
  suggestions: FormSuggestion[];
  agencySuggestions: AgencySuggestion[];
  isSubmitting: boolean;
  autoSaveEnabled: boolean;
  lastSaved?: Date;
};

// Request validation schemas
export type ValidationRule = {
  field: string;
  required: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  customValidator?: (value: any) => boolean;
  errorMessage: string;
};

export type RequestSchema = {
  type: RequestType;
  steps: FormStep[];
  validationRules: ValidationRule[];
};

export type FormStep = {
  id: string;
  title: string;
  description: string;
  fields: FormField[];
  conditionalLogic?: ConditionalLogic[];
};

export type FormField = {
  id: string;
  type:
  | "text"
  | "textarea"
  | "select"
  | "multiselect"
  | "checkbox"
  | "radio"
  | "date"
  | "file"
  | "number";
  label: string;
  placeholder?: string;
  helpText?: string;
  required: boolean;
  options?: { value: string; label: string }[];
  validation?: Partial<ValidationRule>;
  aiSuggestionEnabled: boolean;
  dependsOn?: string;
};

export type ConditionalLogic = {
  if: {
    field: string;
    operator:
    | "equals"
    | "not_equals"
    | "contains"
    | "greater_than"
    | "less_than";
    value: any;
  };
  then: {
    action: "show" | "hide" | "require" | "optional";
    targets: string[];
  };
};

// Analytics and monitoring
export type RequestAnalytics = {
  totalRequests: number;
  requestsByType: Record<RequestType, number>;
  averageProcessingTime: number;
  successRate: number;
  topAgencies: Array<{ agency: string; count: number }>;
  commonRejectionReasons: Array<{ reason: string; count: number }>;
  userSatisfactionScore: number;
};

// Additional types for UI components
export type DataRequestFormData = Partial<IFGRequest & IWGRequest & DZGRequest> & {
  searchQuery?: string;
  title: string;
  description: string;
  requestType?: RequestType;
  publicInterest?: string;
  businessModel?: string;
  researchPurpose?: string;
  technicalRequirements?: string;
};

export type UserDataRequest = BaseRequestData & {
  id: string;
  type: RequestType;
  status: "draft" | "submitted" | "in_progress" | "completed" | "rejected";
  submittedAt: Date;
  timeline: {
    submittedAt: Date;
    expectedResponseAt: Date | null;
    actualResponseAt: Date | null;
    reminderSentAt: Date | null;
  };
  statusHistory: Array<{
    status: "draft" | "submitted" | "in_progress" | "completed" | "rejected";
    timestamp: Date;
    note?: string;
    actor?: string;
  }>;
  agency?: Agency;
};
