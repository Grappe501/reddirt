/**
 * Campaign Lessons Engine — types (Phase 3A).
 */

import type { CampaignDomainId } from "@/lib/agents/orchestration/campaign-state-types";

export type CampaignLessonType =
  | "what_worked"
  | "what_failed"
  | "pattern"
  | "strategy"
  | "operational"
  | "comms"
  | "county"
  | "finance"
  | "volunteer"
  | "media";

export type CampaignLessonConfidence = "low" | "medium" | "high";
export type CampaignLessonFreshness = "fresh" | "aging" | "stale";
export type CampaignLessonStatus = "proposed" | "approved" | "rejected" | "archived";

export type CampaignLesson = {
  id: string;
  createdAt: string;
  updatedAt: string;
  title: string;
  summary: string;
  domainId: CampaignDomainId;
  lessonType: CampaignLessonType;
  confidence: CampaignLessonConfidence;
  freshness: CampaignLessonFreshness;
  usefulnessScore: number;
  sourceKind: string;
  sourceRef?: string;
  linkedEntityIds: string[];
  countySlug?: string;
  eventRecordId?: string;
  requiresHumanApproval: boolean;
  status: CampaignLessonStatus;
};

export type CampaignLessonRef = {
  id: string;
  title: string;
  summary: string;
  domainId: CampaignDomainId;
  confidence: CampaignLessonConfidence;
  usefulnessScore: number;
};
