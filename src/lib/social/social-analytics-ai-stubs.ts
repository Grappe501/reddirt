/**
 * AI / LLM integration points for Social Workbench analytics.
 * Until a provider is wired, use deterministic `buildLocalStructuredRecommendationsFromMetrics`
 * (wraps `buildHeuristicRecommendations`) — same inputs as the “Apply heuristics” server action.
 *
 * TODO: When adding OpenAI or another provider, call it from server actions and merge with
 * local heuristics; do not fabricate live model output.
 */

import type { SocialContentKind, SocialMessageToneMode, SocialStrategicFollowupType } from "@prisma/client";
import {
  buildHeuristicRecommendations,
  type SocialAnalyticsAggregates,
} from "@/lib/social/social-analytics-aggregates";

export type SocialAnalyticsAiStub = { ok: false; reason: "not_implemented" };

export async function classifySocialCommentsStub(_socialContentItemId: string): Promise<SocialAnalyticsAiStub> {
  return { ok: false, reason: "not_implemented" };
}

export async function summarizeSocialPostPerformanceStub(_socialContentItemId: string): Promise<SocialAnalyticsAiStub> {
  return { ok: false, reason: "not_implemented" };
}

export async function suggestSocialCopyImprovementsStub(_socialContentItemId: string): Promise<SocialAnalyticsAiStub> {
  return { ok: false, reason: "not_implemented" };
}

/** Deterministic structured output for UI and future AI merge — no external API. */
export type StructuredStrategicRecommendation = {
  recommendedNextTone: SocialMessageToneMode | null;
  recommendedBestWindow: string | null;
  recommendedFollowupType: SocialStrategicFollowupType;
  recommendedCountyFocus: string | null;
  recommendedCtaType: string | null;
  confidenceScore: number;
  source: "heuristic_local";
};

export function buildLocalStructuredRecommendationsFromMetrics(
  item: { kind: SocialContentKind; messageToneMode: SocialMessageToneMode | null; campaignEventId: string | null },
  primarySnapshot: { volunteerLeadCount: number | null; saves: number | null; comments: number | null } | null,
  agg: SocialAnalyticsAggregates
): StructuredStrategicRecommendation {
  const h = buildHeuristicRecommendations(item, primarySnapshot, agg);
  return { ...h, source: "heuristic_local" };
}
