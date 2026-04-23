/**
 * Meaningful engagement score 0–100: emphasizes saves, shares, comments, CTR, VCR, volunteer leads;
 * de-emphasizes raw likes and impressions (vanity / reach without trust signals).
 *
 * ## Weighting philosophy (tunable)
 * - Rate-based features use impression as denominator when impressions > 0; else base=1 to avoid divide-by-zero.
 * - **Likes**: low weight (0.4) — easy to farm, weak trust signal.
 * - **Comments**: 2.0 — conversation / clarity potential.
 * - **Shares**: 2.2 — endorsement + reach with social proof.
 * - **Saves**: 2.5 — retention / “come back” intent.
 * - **Click-throughs (raw / improssion)**: 1.5 — action beyond the feed.
 * - **Platform CTR (0–1)**: ×1.2 as 0–100 scale — when provided, often cleaner than raw clicks/imp.
 * - **Video completion (0–1)**: ×1.0 — attention / message held.
 * - **Volunteer leads**: capped contribution (×4 per lead, max 20 points) — real conversion, not rage-clicks.
 *
 * The raw sum is **not** a linear percentage of reach; it is scaled so “typical good” posts land ~40–85 after clamp.
 * When `engagementQualityScore` is manually set on a snapshot, that value wins (0–100 clamp).
 */

export type SnapshotEngagementInput = {
  impressions: number | null;
  likes: number | null;
  comments: number | null;
  shares: number | null;
  saves: number | null;
  clickThroughs: number | null;
  clickThroughRate: number | null;
  videoCompletionRate: number | null;
  volunteerLeadCount: number | null;
};

function clamp100(n: number): number {
  if (!Number.isFinite(n) || n < 0) return 0;
  if (n > 100) return 100;
  return n;
}

export type MeaningfulEngagementComponents = {
  likeRate: number;
  commentRate: number;
  shareRate: number;
  saveRate: number;
  clickRateFromImpressions: number;
  ctrAsPercent: number;
  vcrAsPercent: number;
  leadPoints: number;
  /** Unclamped sum before `clamp100` (for debugging / tuning) */
  rawComposite: number;
};

export type MeaningfulEngagementResult = {
  /** Final 0–100 score (same as `computeMeaningfulEngagementScore100`). */
  weightedScore: number;
  /** For transparency in admin UI and tuning. */
  components: MeaningfulEngagementComponents;
  /** Echo of inputs (JSON-safe for API). */
  raw: SnapshotEngagementInput;
};

export function computeMeaningfulEngagementScore100(s: SnapshotEngagementInput): number {
  return computeMeaningfulEngagementDetail(s).weightedScore;
}

/**
 * Returns weighted score plus decomposed terms. Does **not** use manual `engagementQualityScore` —
 * pass snapshots through `effectiveScore` in aggregates when that field may be set.
 */
export function computeMeaningfulEngagementDetail(s: SnapshotEngagementInput): MeaningfulEngagementResult {
  const imp = Math.max(s.impressions ?? 0, 0);
  const base = imp > 0 ? imp : 1;

  const likeRate = ((s.likes ?? 0) / base) * 100;
  const commentRate = ((s.comments ?? 0) / base) * 100;
  const shareRate = ((s.shares ?? 0) / base) * 100;
  const saveRate = ((s.saves ?? 0) / base) * 100;
  const clickRate = ((s.clickThroughs ?? 0) / base) * 100;

  const qCtr = s.clickThroughRate != null ? s.clickThroughRate * 100 : 0;
  const qVcr = s.videoCompletionRate != null ? s.videoCompletionRate * 100 : 0;
  const leads = Math.min(20, (s.volunteerLeadCount ?? 0) * 4);

  const rawComposite =
    likeRate * 0.4 +
    commentRate * 2.0 +
    shareRate * 2.2 +
    saveRate * 2.5 +
    clickRate * 1.5 +
    qCtr * 1.2 +
    qVcr * 1.0 +
    leads;

  return {
    weightedScore: clamp100(rawComposite),
    components: {
      likeRate,
      commentRate,
      shareRate,
      saveRate,
      clickRateFromImpressions: clickRate,
      ctrAsPercent: qCtr,
      vcrAsPercent: qVcr,
      leadPoints: leads,
      rawComposite,
    },
    raw: { ...s },
  };
}
