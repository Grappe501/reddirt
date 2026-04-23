import { type Prisma, type SocialContentKind, type SocialMessageToneMode } from "@prisma/client";
import { prisma } from "@/lib/db";
import {
  ANALYTICS_RECOMMENDATION_HEURISTIC_VERSION,
  type AnalyticsProvenancePayload,
  buildAnalyticsProvenancePayload,
} from "@/lib/social/analytics-recommendation-provenance";
import { getSocialAnalyticsAggregatesForDays } from "@/lib/social/social-analytics-aggregates";

type RegisterDraftParams = {
  sourceSocialContentItemId: string;
  createdSocialContentItemId: string;
  template: string;
  title: string;
  kind: SocialContentKind;
  tone: SocialMessageToneMode | null;
  campaignEventId: string | null;
  confidence: number | null;
};

/**
 * After `SocialContentItem` follow-up creation from analytics — durable outcome row + full provenance.
 * Uses the same 30d aggregate window as heuristic recommendations for consistency.
 */
export async function registerAnalyticFollowUpDraftOutcome(p: RegisterDraftParams): Promise<void> {
  const agg = await getSocialAnalyticsAggregatesForDays(30);
  const end = new Date();
  const start = new Date();
  start.setUTCDate(start.getUTCDate() - 30);
  const provenance: AnalyticsProvenancePayload = buildAnalyticsProvenancePayload({
    recommendationType: `draft_template_${p.template}`,
    headline: p.title,
    confidence: p.confidence != null && Number.isFinite(p.confidence) ? Math.min(1, Math.max(0, p.confidence)) : 0.45,
    reasoning: { lane: "draft_followup", template: p.template },
    dateRange: { start, end },
    aggregate: agg,
    contentKind: p.kind,
    toneMode: p.tone,
    eventId: p.campaignEventId,
    sourceSocialContentItemId: p.sourceSocialContentItemId,
    templateKey: p.template,
  });
  await prisma.analyticsRecommendationOutcome.create({
    data: {
      source: "analytics",
      recommendationType: `draft_${p.template}`,
      headline: p.title,
      confidence: p.confidence,
      heuristicVersion: ANALYTICS_RECOMMENDATION_HEURISTIC_VERSION,
      status: "DRAFT_CREATED",
      dateRangeStart: start,
      dateRangeEnd: end,
      contentKind: p.kind,
      toneMode: p.tone,
      eventId: p.campaignEventId,
      sourceSocialContentItemId: p.sourceSocialContentItemId,
      provenanceJson: provenance as unknown as Prisma.JsonObject,
      createdSocialContentItemId: p.createdSocialContentItemId,
    },
  });
}
