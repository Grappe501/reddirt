import { SocialContentStatus, type Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { computeMeaningfulEngagementScore100 } from "@/lib/social/engagement-score";
import { ANALYTICS_RECOMMENDATION_HEURISTIC_VERSION } from "@/lib/social/analytics-recommendation-provenance";

export type OutcomeEvaluationClassification = "WIN" | "NEUTRAL" | "MISS" | "INSUFFICIENT_DATA";
export type OutcomeEvalConfidence = "LOW" | "MEDIUM" | "HIGH";

export type AnalyticsOutcomeEvaluationResult = {
  executed: boolean;
  /** Work item the evaluator used (created draft or explicit executed link). */
  resolvedSocialContentItemId: string | null;
  meaningfulScore: number | null;
  baselineMeaningfulScore: number | null;
  deltaMeaningfulScore: number | null;
  comparisonGroup: {
    platform?: string;
    contentKind: string;
    toneMode: string | null;
  };
  classification: OutcomeEvaluationClassification;
  confidence: OutcomeEvalConfidence;
  reason: string;
  evaluatedAgainstSnapshotCount: number;
};

function mean(nums: number[]): number {
  if (nums.length === 0) return 0;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

function effectiveScoreFromSnapshot(s: {
  engagementQualityScore: number | null;
  impressions: number | null;
  likes: number | null;
  comments: number | null;
  shares: number | null;
  saves: number | null;
  clickThroughs: number | null;
  clickThroughRate: number | null;
  videoCompletionRate: number | null;
  volunteerLeadCount: number | null;
}): number | null {
  if (s.engagementQualityScore != null && Number.isFinite(s.engagementQualityScore)) {
    return Math.min(100, Math.max(0, s.engagementQualityScore));
  }
  return computeMeaningfulEngagementScore100({
    impressions: s.impressions,
    likes: s.likes,
    comments: s.comments,
    shares: s.shares,
    saves: s.saves,
    clickThroughs: s.clickThroughs,
    clickThroughRate: s.clickThroughRate,
    videoCompletionRate: s.videoCompletionRate,
    volunteerLeadCount: s.volunteerLeadCount,
  });
}

/**
 * Scores a recommendation-linked post against a simple peer baseline (same kind + optional tone) over ~30d.
 */
export async function evaluateAnalyticsRecommendationOutcome(
  outcomeId: string
): Promise<{ ok: true; result: AnalyticsOutcomeEvaluationResult; outcomeId: string } | { ok: false; error: string }> {
  const o = await prisma.analyticsRecommendationOutcome.findUnique({
    where: { id: outcomeId },
    include: {
      createdSocialContentItem: true,
      executedSocialContentItem: true,
    },
  });
  if (!o) {
    return { ok: false, error: "Outcome not found." };
  }

  const item = o.executedSocialContentItem ?? o.createdSocialContentItem;
  if (!item) {
    return { ok: false, error: "No linked work item to evaluate." };
  }

  const isPublished = item.status === SocialContentStatus.PUBLISHED;
  if (!isPublished) {
    return {
      ok: true,
      outcomeId: o.id,
      result: {
        executed: false,
        resolvedSocialContentItemId: item.id,
        meaningfulScore: null,
        baselineMeaningfulScore: null,
        deltaMeaningfulScore: null,
        comparisonGroup: {
          contentKind: String(item.kind),
          toneMode: item.messageToneMode,
        },
        classification: "INSUFFICIENT_DATA",
        confidence: "LOW",
        reason: "Work item is not published yet; wait for a rollup snapshot to evaluate against peers.",
        evaluatedAgainstSnapshotCount: 0,
      },
    };
  }

  const snap = await prisma.socialPerformanceSnapshot.findFirst({
    where: { socialContentItemId: item.id, socialPlatformVariantId: null },
    orderBy: { periodEnd: "desc" },
  });

  if (!snap) {
    return {
      ok: true,
      outcomeId: o.id,
      result: {
        executed: isPublished,
        resolvedSocialContentItemId: item.id,
        meaningfulScore: null,
        baselineMeaningfulScore: null,
        deltaMeaningfulScore: null,
        comparisonGroup: { contentKind: String(item.kind), toneMode: item.messageToneMode },
        classification: "INSUFFICIENT_DATA",
        confidence: "LOW",
        reason: "No rollup performance row for this work item; add a snapshot first.",
        evaluatedAgainstSnapshotCount: 0,
      },
    };
  }

  const score = effectiveScoreFromSnapshot(snap);
  if (score == null) {
    return {
      ok: true,
      outcomeId: o.id,
      result: {
        executed: isPublished,
        resolvedSocialContentItemId: item.id,
        meaningfulScore: null,
        baselineMeaningfulScore: null,
        deltaMeaningfulScore: null,
        comparisonGroup: { contentKind: String(item.kind), toneMode: item.messageToneMode },
        classification: "INSUFFICIENT_DATA",
        confidence: "LOW",
        reason: "Snapshot lacks enough metrics to compute a meaningful score.",
        evaluatedAgainstSnapshotCount: 0,
      },
    };
  }

  const since = new Date();
  since.setUTCDate(since.getUTCDate() - 30);

  const peerSnaps = await prisma.socialPerformanceSnapshot.findMany({
    where: {
      periodEnd: { gte: since },
      socialPlatformVariantId: null,
      socialContentItem: {
        id: { not: item.id },
        kind: item.kind,
        ...(item.messageToneMode != null ? { messageToneMode: item.messageToneMode } : {}),
      },
    },
    take: 500,
    orderBy: { periodEnd: "desc" },
  });

  const peerScores: number[] = [];
  for (const p of peerSnaps) {
    const s = effectiveScoreFromSnapshot(p);
    if (s != null) peerScores.push(s);
  }

  if (peerScores.length < 3) {
    const r: AnalyticsOutcomeEvaluationResult = {
      executed: isPublished,
      resolvedSocialContentItemId: item.id,
      meaningfulScore: score,
      baselineMeaningfulScore: null,
      deltaMeaningfulScore: null,
      comparisonGroup: { contentKind: String(item.kind), toneMode: item.messageToneMode },
      classification: "INSUFFICIENT_DATA",
      confidence: "LOW",
      reason: `Not enough peer snapshots with the same content kind and tone in the last 30d (n=${peerScores.length}; need at least 3).`,
      evaluatedAgainstSnapshotCount: peerScores.length,
    };
    return { ok: true, outcomeId: o.id, result: r };
  }

  const baseline = mean(peerScores);
  const delta = score - baseline;
  let classification: OutcomeEvaluationClassification = "NEUTRAL";
  if (delta > 5) classification = "WIN";
  else if (delta < -5) classification = "MISS";
  const conf: OutcomeEvalConfidence = peerScores.length >= 12 ? "HIGH" : peerScores.length >= 6 ? "MEDIUM" : "LOW";
  const reason = `Compared to ${peerScores.length} recent ${String(item.kind)} work items${
    item.messageToneMode != null ? ` with tone ${String(item.messageToneMode)}` : ""
  }: meaningful score ${score.toFixed(1)} vs baseline ${baseline.toFixed(1)} (Δ ${delta >= 0 ? "+" : ""}${delta.toFixed(1)}).`;

  const r: AnalyticsOutcomeEvaluationResult = {
    executed: isPublished,
    resolvedSocialContentItemId: item.id,
    meaningfulScore: score,
    baselineMeaningfulScore: baseline,
    deltaMeaningfulScore: delta,
    comparisonGroup: { contentKind: String(item.kind), toneMode: item.messageToneMode },
    classification,
    confidence: conf,
    reason,
    evaluatedAgainstSnapshotCount: peerScores.length,
  };

  return { ok: true, outcomeId: o.id, result: r };
}

/** Persist evaluation JSON + status. Caller should pass result from `evaluateAnalyticsRecommendationOutcome`. */
export function outcomeJsonFromEvaluation(
  r: AnalyticsOutcomeEvaluationResult
): Prisma.JsonObject {
  return {
    evaluatedAt: new Date().toISOString(),
    heuristicVersion: ANALYTICS_RECOMMENDATION_HEURISTIC_VERSION,
    ...r,
  } as Prisma.JsonObject;
}
