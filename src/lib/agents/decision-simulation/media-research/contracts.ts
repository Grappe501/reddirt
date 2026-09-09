import type { WritingActorId } from "../writing-intelligence/contracts";

export const MEDIA_RESEARCH_VERSION = "media-research-1.0" as const;
export const MEDIA_RESEARCH_ACCESSED = "2026-09-09" as const;

export type MediaQuoteKind = "DIRECT_QUOTE" | "PREPARED_STATEMENT" | "PARAPHRASE";
export type MediaOutletKind = "NEWS_ARTICLE" | "INTERVIEW" | "OFFICIAL_RELEASE" | "PODCAST";
export type MediaTopicId =
  | "AFFORDABILITY"
  | "ACCOUNTABILITY"
  | "HEALTHCARE"
  | "HOUSING"
  | "EDUCATION"
  | "RURAL_HOSPITALS"
  | "AGRICULTURE"
  | "TAXES"
  | "BORDER"
  | "VETERANS"
  | "BANKING"
  | "HOUSING_SUPPLY"
  | "FED_INFLATION"
  | "DIGITAL_ASSETS"
  | "NATIONAL_SECURITY"
  | "DEMOCRACY"
  | "WASTE"
  | "CONTRAST";

export type MediaClip = {
  id: string;
  actorId: WritingActorId;
  outlet: string;
  title: string;
  url: string;
  publishedAt: string;
  accessed: string;
  outletKind: MediaOutletKind;
  quoteKind: MediaQuoteKind;
  sourceState: "OBSERVED" | "INFERRED";
  provenance: "DISCOVERY_ONLY";
  authorshipConfidence: "ATTRIBUTED" | "OFFICIAL_OFFICE";
  retrievalQuality: "FULL_PUBLIC" | "PARTIAL_PUBLIC";
  topics: MediaTopicId[];
  quote: string;
  notes?: string;
};

export type MediaResearchSnapshot = {
  version: typeof MEDIA_RESEARCH_VERSION;
  actorId: WritingActorId;
  accessed: string;
  clipCount: number;
  topics: MediaTopicId[];
  clips: MediaClip[];
  missing: string[];
  uncertainty: string[];
};
