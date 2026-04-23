import type {
  ConversationClusterStatus,
  ConversationItemStatus,
  ConversationOpportunityStatus,
  ConversationUrgency,
} from "@prisma/client";

export type ConversationMonitoringSummary = {
  itemCount: number;
  newItems: number;
  openOpportunities: number;
  activeClusters: number;
  watchlistCount: number;
  /** Simple county slice for the strip; empty if none */
  topCounties: { countyId: string; displayName: string; count: number }[];
};

export type ConversationItemListRow = {
  id: string;
  channel: string;
  sourceKind: string;
  title: string | null;
  bodyPreview: string;
  status: ConversationItemStatus;
  publishedAt: string | null;
  countyId: string | null;
  countyName: string | null;
  /** Present when a `ConversationAnalysis` row exists. */
  analyzedAt: string | null;
  analysisSummary: string | null;
  classification: string | null;
  urgency: ConversationUrgency | null;
  sentiment: string | null;
  updatedAt: string;
};

export type ConversationItemDetail = ConversationItemListRow & {
  bodyText: string;
  publicPermalink: string | null;
  watchlistName: string | null;
  issueTags: string[];
  suggestedAction: string | null;
  suggestedTone: string | null;
  countyInferenceNote: string | null;
  analyzerVersion: string | null;
};

export type ConversationClusterListRow = {
  id: string;
  title: string;
  itemCount: number;
  status: ConversationClusterStatus;
  countyName: string | null;
  updatedAt: string;
};

export type ConversationOpportunityListRow = {
  id: string;
  title: string;
  status: ConversationOpportunityStatus;
  urgency: ConversationUrgency;
  countyName: string | null;
  hasIntake: boolean;
  hasSocial: boolean;
  updatedAt: string;
};
