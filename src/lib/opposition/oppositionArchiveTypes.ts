/** Kim Hammer opposition archive types — JSON-first, Postgres-ready. */

export type OppositionArchiveItemType =
  | "VIDEO_CLIP"
  | "DEBATE_CLIP"
  | "SPEECH"
  | "INTERVIEW"
  | "SOCIAL_POST"
  | "AUTHORED_WRITING"
  | "VOTING_RECORD"
  | "BILL_RECORD"
  | "PUBLIC_STATEMENT"
  | "BIOGRAPHICAL_RECORD"
  | "MANAGEMENT_RECORD"
  | "MEDIA_COVERAGE"
  | "RESEARCH_TASK"
  | "INTERNAL_ANALYSIS";

export type OppositionResearchStatus =
  | "VERIFIED_SOURCE"
  | "PARTIAL_SOURCE"
  | "NEEDS_RETRIEVAL"
  | "NEEDS_REVIEW"
  | "SOURCE_MISSING"
  | "DUPLICATE"
  | "RETIRED";

export type OppositionArchiveGovernance = {
  publicationSafety: "NON_PUBLISHABLE";
  humanReviewRequired: true;
  exportControlRespected: true;
  labels: string[];
};

export type OppositionArchiveItem = {
  id: string;
  opponentId: string;
  itemType: OppositionArchiveItemType;
  title: string;
  date: string | null;
  sourceTitle: string;
  sourceUrlOrPath: string;
  sourceType: string;
  topicTags: string[];
  countyTags: string[];
  officeTags: string[];
  summary: string;
  directQuotes: string[];
  clipReferences: string[];
  writingReferences: string[];
  claimIds: string[];
  citationSourceIds: string[];
  citationAnchorIds: string[];
  reliabilityRating: "LOW" | "MEDIUM" | "HIGH";
  sourceConfidence: number;
  publicUseRisk: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  researchStatus: OppositionResearchStatus;
  createdAt: string;
  updatedAt: string;
};

export type OppositionSourceRecord = {
  id: string;
  opponentId: string;
  title: string;
  sourceType: string;
  urlOrPath: string;
  reliabilityRating: "LOW" | "MEDIUM" | "HIGH";
  sourceConfidence: number;
  archiveItemIds: string[];
  createdAt: string;
};

export type OppositionQuoteRecord = {
  id: string;
  opponentId: string;
  quoteText: string;
  context: string;
  sourceUrlOrPath: string | null;
  date: string | null;
  citationSourceId: string | null;
  citationAnchorId: string | null;
  usable: boolean;
  unusableReason: string | null;
  publicUseRisk: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  createdAt: string;
};

export type OppositionClipRecord = {
  id: string;
  opponentId: string;
  title: string;
  url: string | null;
  clipType: "DIRECT_OPPONENT" | "REFERENCE_SOS" | "MEDIA_COVERAGE";
  timestamp: string | null;
  citationSourceId: string | null;
  retrievalNeeded: boolean;
  createdAt: string;
};

export type OppositionWritingRecord = {
  id: string;
  opponentId: string;
  title: string;
  writingType: string;
  date: string | null;
  publisher: string;
  url: string | null;
  summary: string;
  citationSourceId: string | null;
  retrievalNeeded: boolean;
  createdAt: string;
};

export type OppositionRetrievalTaskStatus =
  | "NOT_STARTED"
  | "ASSIGNED"
  | "IN_PROGRESS"
  | "BLOCKED"
  | "READY_FOR_REVIEW"
  | "COMPLETE"
  | "ARCHIVED";

export type OppositionRetrievalTask = {
  id: string;
  opponentId: string;
  rank: number;
  priority: string;
  description: string;
  taskStatus: OppositionRetrievalTaskStatus;
  evidenceStatus: string;
  owner: string;
  blocker: string;
  currentAvailableEvidence: string[];
  recommendedHumanAction: string;
  citationRequirement: string;
  nextRetrievalStep: string;
  canCloseFromLocalEvidence: boolean;
  closureStatus: "OPEN" | "PARTIAL" | "CLOSED";
  linkedArchiveItemIds: string[];
  updatedAt: string;
};

export type OppositionArchiveRollup = {
  opponentId: string;
  generatedAt: string;
  sourceCount: number;
  archiveItemCount: number;
  directQuoteCount: number;
  usableQuoteCount: number;
  directClipCount: number;
  referenceClipCount: number;
  authoredWritingCount: number;
  billRecordCount: number;
  retrievalTasksTotal: number;
  retrievalTasksComplete: number;
  retrievalTasksPartial: number;
  claimLedgerLinkedCount: number;
  citationSourceCount: number;
  citationAnchorCount: number;
  oppositionBriefConfidenceEstimate: number;
  confidenceBasis: string;
  topUsableEvidence: string[];
  topUnusableClaims: string[];
  nextHumanRetrievalActions: string[];
  filmRoomGapNote: string;
  governance: OppositionArchiveGovernance;
};

export type OppositionArchiveItemsFile = {
  version: number;
  generatedAt: string;
  items: OppositionArchiveItem[];
};

export type OppositionRetrievalTasksFile = {
  version: number;
  generatedAt: string;
  tasks: OppositionRetrievalTask[];
};

export const OPPOSITION_ARCHIVE_GOVERNANCE: OppositionArchiveGovernance = {
  publicationSafety: "NON_PUBLISHABLE",
  humanReviewRequired: true,
  exportControlRespected: true,
  labels: [
    "INTERNAL_DRAFT",
    "NON_PUBLISHABLE",
    "HUMAN_REVIEW_REQUIRED",
    "KH-4_EXPORT_CONTROL",
    "NOT_PUBLIC_CONTENT",
  ],
};

export const OPPOSITION_ARCHIVE_BASE = "data/opposition/kim-hammer-profile";
