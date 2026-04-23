import {
  SocialPlatform,
  SocialStrategicFollowupType,
  type SocialContentKind,
  type SocialMessageTacticMode,
  type SocialMessageToneMode,
} from "@prisma/client";
import { prisma } from "@/lib/db";
import { socialEnumLabel } from "@/lib/social/enum-labels";
import { computeMeaningfulEngagementScore100 } from "@/lib/social/engagement-score";

const MAX_ROWS = 4000;

const WINDOW_CANDIDATES: readonly (14 | 30 | 60)[] = [14, 30, 60];

export type WindowBucket = { key: string; label: string; avgScore: number; n: number };
export type KindToneRow = { kind: SocialContentKind; avgScore: number; n: number };
export type ToneModeRow = { tone: SocialMessageToneMode; avgScore: number; n: number };
export type TacticModeRow = { tactic: SocialMessageTacticMode; avgScore: number; n: number };
export type EventSplit = { withEvent: { avgScore: number; n: number }; withoutEvent: { avgScore: number; n: number } };

/** Cross-work-item aggregates for one time window. `snapshotCount` = rows included (after take). */
export type SocialAnalyticsAggregates = {
  generatedAt: string;
  dayRange: number;
  snapshotCount: number;
  bestHourByPlatform: Record<string, WindowBucket | undefined>;
  bestWeekdayByPlatform: Record<string, WindowBucket | undefined>;
  byKind: KindToneRow[];
  byTone: ToneModeRow[];
  byTactic: TacticModeRow[];
  eventSplit: EventSplit;
  topTones: ToneModeRow[];
};

export type SocialAnalyticsTimingEntry = {
  dayRange: 14 | 30 | 60;
  label: string;
  aggregates: SocialAnalyticsAggregates;
  /** Human-readable sample / confidence note for ops. */
  confidenceHint: string;
};

export type SocialAnalyticsTimingIntelligence = {
  generatedAt: string;
  windows: SocialAnalyticsTimingEntry[];
};

/** Minimal snapshot shape for weighted score + time bucketing (avoids Prisma GetPayload + partial-select mismatch). */
type AggSnapshotRow = {
  impressions: number | null;
  likes: number | null;
  comments: number | null;
  shares: number | null;
  saves: number | null;
  clickThroughs: number | null;
  clickThroughRate: number | null;
  videoCompletionRate: number | null;
  engagementQualityScore: number | null;
  volunteerLeadCount: number | null;
  socialContentItem: {
    id: string;
    kind: SocialContentKind;
    messageToneMode: SocialMessageToneMode | null;
    messageTacticMode: SocialMessageTacticMode | null;
    campaignEventId: string | null;
    createdAt: Date;
    platformVariants: { id: string; platform: SocialPlatform; publishedAt: Date | null; scheduledAt: Date | null }[];
  };
  socialPlatformVariant: { platform: SocialPlatform; publishedAt: Date | null; scheduledAt: Date | null } | null;
};

function emptyAccumulators() {
  return {
    byPlatformHour: new Map<string, { sum: number; n: number }>(),
    byPlatformWeekday: new Map<string, { sum: number; n: number }>(),
    byKind: new Map<SocialContentKind, { sum: number; n: number }>(),
    byTone: new Map<SocialMessageToneMode, { sum: number; n: number }>(),
    byTactic: new Map<SocialMessageTacticMode, { sum: number; n: number }>(),
    withEvent: { sum: 0, n: 0 },
    withoutEvent: { sum: 0, n: 0 },
  };
}

function effectiveScore(
  s: Pick<
    AggSnapshotRow,
    | "impressions"
    | "likes"
    | "comments"
    | "shares"
    | "saves"
    | "clickThroughs"
    | "clickThroughRate"
    | "videoCompletionRate"
    | "engagementQualityScore"
    | "volunteerLeadCount"
  >
): number {
  if (s.engagementQualityScore != null && Number.isFinite(s.engagementQualityScore)) {
    return Math.min(100, Math.max(0, s.engagementQualityScore));
  }
  return computeMeaningfulEngagementScore100(s);
}

function postTimestampUtc(s: AggSnapshotRow): Date | null {
  const v = s.socialPlatformVariant;
  if (v) {
    return v.publishedAt ?? v.scheduledAt ?? null;
  }
  const vars = s.socialContentItem.platformVariants;
  if (!vars.length) return null;
  const best = vars
    .map((p) => p.publishedAt ?? p.scheduledAt)
    .filter((d): d is Date => d != null)
    .sort((a, b) => a.getTime() - b.getTime())[0];
  return best ?? s.socialContentItem.createdAt;
}

function confidenceHintForSample(snapshotCount: number, dayRange: number): string {
  if (snapshotCount === 0) {
    return `No snapshots in the last ${dayRange} days — add performance rows with post times.`;
  }
  if (snapshotCount < 5) {
    return `Low sample (n=${snapshotCount}) — interpret timing and tone ranks as directional only.`;
  }
  if (snapshotCount < 20) {
    return `Moderate sample (n=${snapshotCount}) — good for trends; refine with more labeled tone/tactic.`;
  }
  return `Stronger sample (n=${snapshotCount}) for this ${dayRange}d window — still use judgment and local timezones.`;
}

/**
 * Build maps from raw rows, then best buckets per platform, kind/tone/tactic means, and event split.
 * Uses UTC for hour/day buckets (label clearly in UI).
 */
export function computeAggregatesFromRows(rows: AggSnapshotRow[], dayRange: number, generatedAt: Date): SocialAnalyticsAggregates {
  const acc = emptyAccumulators();

  for (const s of rows) {
    const sc = effectiveScore(s);
    const item = s.socialContentItem;
    const k = item.kind;
    const tone = item.messageToneMode;
    const tact = item.messageTacticMode;

    if (item.campaignEventId) {
      acc.withEvent.sum += sc;
      acc.withEvent.n += 1;
    } else {
      acc.withoutEvent.sum += sc;
      acc.withoutEvent.n += 1;
    }

    const kacc = acc.byKind.get(k) ?? { sum: 0, n: 0 };
    kacc.sum += sc;
    kacc.n += 1;
    acc.byKind.set(k, kacc);

    if (tone) {
      const tacc = acc.byTone.get(tone) ?? { sum: 0, n: 0 };
      tacc.sum += sc;
      tacc.n += 1;
      acc.byTone.set(tone, tacc);
    }
    if (tact) {
      const t2 = acc.byTactic.get(tact) ?? { sum: 0, n: 0 };
      t2.sum += sc;
      t2.n += 1;
      acc.byTactic.set(tact, t2);
    }

    const when = postTimestampUtc(s);
    if (when) {
      const pl = s.socialPlatformVariant?.platform ?? item.platformVariants[0]?.platform;
      if (pl) {
        const h = when.getUTCHours();
        const d = when.getUTCDay();
        const hKey = `${pl}__H${h}`;
        const dKey = `${pl}__D${d}`;
        const hh = acc.byPlatformHour.get(hKey) ?? { sum: 0, n: 0 };
        hh.sum += sc;
        hh.n += 1;
        acc.byPlatformHour.set(hKey, hh);
        const dw = acc.byPlatformWeekday.get(dKey) ?? { sum: 0, n: 0 };
        dw.sum += sc;
        dw.n += 1;
        acc.byPlatformWeekday.set(dKey, dw);
      }
    }
  }

  const platforms = Object.values(SocialPlatform) as SocialPlatform[];
  const weekdayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const bestHourByPlatform: Record<string, WindowBucket> = {};
  const bestWeekdayByPlatform: Record<string, WindowBucket> = {};
  for (const pl of platforms) {
    let bestH: WindowBucket | undefined;
    for (let h = 0; h < 24; h++) {
      const c = acc.byPlatformHour.get(`${pl}__H${h}`);
      if (!c || c.n < 1) continue;
      const avg = c.sum / c.n;
      const key = `H${h}`;
      const label = `UTC ${h}:00–${h}:59 (n=${c.n})`;
      if (!bestH || avg > bestH.avgScore) {
        bestH = { key, label, avgScore: avg, n: c.n };
      }
    }
    if (bestH) bestHourByPlatform[pl] = bestH;
    let bestD: WindowBucket | undefined;
    for (let d = 0; d < 7; d++) {
      const c = acc.byPlatformWeekday.get(`${pl}__D${d}`);
      if (!c || c.n < 1) continue;
      const avg = c.sum / c.n;
      const key = `D${d}`;
      const label = `${weekdayLabels[d] ?? d} (n=${c.n})`;
      if (!bestD || avg > bestD.avgScore) {
        bestD = { key, label, avgScore: avg, n: c.n };
      }
    }
    if (bestD) bestWeekdayByPlatform[pl] = bestD;
  }

  const byKind: KindToneRow[] = [...acc.byKind.entries()]
    .map(([kind, v]) => ({ kind, avgScore: v.sum / v.n, n: v.n }))
    .sort((a, b) => b.avgScore - a.avgScore);
  const byTone: ToneModeRow[] = [...acc.byTone.entries()]
    .map(([tone, v]) => ({ tone, avgScore: v.sum / v.n, n: v.n }))
    .sort((a, b) => b.avgScore - a.avgScore);
  const byTactic: TacticModeRow[] = [...acc.byTactic.entries()]
    .map(([tactic, v]) => ({ tactic, avgScore: v.sum / v.n, n: v.n }))
    .sort((a, b) => b.avgScore - a.avgScore);

  const snapshotCount = rows.length;

  return {
    generatedAt: generatedAt.toISOString(),
    dayRange,
    snapshotCount,
    bestHourByPlatform,
    bestWeekdayByPlatform,
    byKind,
    byTone,
    byTactic,
    topTones: byTone.slice(0, 6),
    eventSplit: {
      withEvent: { avgScore: acc.withEvent.n ? acc.withEvent.sum / acc.withEvent.n : 0, n: acc.withEvent.n },
      withoutEvent: { avgScore: acc.withoutEvent.n ? acc.withoutEvent.sum / acc.withoutEvent.n : 0, n: acc.withoutEvent.n },
    },
  };
}

async function loadSnapshotRows(since: Date, maxRows: number): Promise<AggSnapshotRow[]> {
  try {
    const raw = await prisma.socialPerformanceSnapshot.findMany({
      where: { periodEnd: { gte: since } },
      take: maxRows,
      orderBy: { periodEnd: "desc" },
      include: {
        socialContentItem: {
          select: {
            id: true,
            kind: true,
            messageToneMode: true,
            messageTacticMode: true,
            campaignEventId: true,
            createdAt: true,
            platformVariants: {
              select: { id: true, platform: true, publishedAt: true, scheduledAt: true },
            },
          },
        },
        socialPlatformVariant: { select: { platform: true, publishedAt: true, scheduledAt: true } },
      },
    });
    return raw as AggSnapshotRow[];
  } catch {
    return [];
  }
}

/** Single window (default 90d) — backward compatible. */
export async function getSocialAnalyticsAggregatesForDays(dayRange: number, maxRows = MAX_ROWS): Promise<SocialAnalyticsAggregates> {
  const since = new Date();
  since.setUTCDate(since.getUTCDate() - dayRange);
  const generatedAt = new Date();
  const rows = await loadSnapshotRows(since, maxRows);
  return computeAggregatesFromRows(rows, dayRange, generatedAt);
}

export async function getSocialAnalyticsAggregates(): Promise<SocialAnalyticsAggregates> {
  return getSocialAnalyticsAggregatesForDays(90);
}

/**
 * 14d / 30d / 60d slices (reuses same cap). Shorter windows surface recency; longer windows add stability.
 */
export async function getSocialAnalyticsTimingIntelligence(maxRows = MAX_ROWS): Promise<SocialAnalyticsTimingIntelligence> {
  const generatedAt = new Date();
  const windows: SocialAnalyticsTimingEntry[] = [];
  for (const d of WINDOW_CANDIDATES) {
    const since = new Date();
    since.setUTCDate(since.getUTCDate() - d);
    const rows = await loadSnapshotRows(since, maxRows);
    const aggregates = computeAggregatesFromRows(rows, d, generatedAt);
    windows.push({
      dayRange: d,
      label: `Last ${d} days`,
      aggregates,
      confidenceHint: confidenceHintForSample(aggregates.snapshotCount, d),
    });
  }
  return { generatedAt: generatedAt.toISOString(), windows };
}

/**
 * Heuristic: fill `SocialContentStrategicInsight` recommendations from recent aggregates and this work item.
 * Deterministic, trust-first — no outrage optimization. Prefer calm / community / invitation tones when data is thin.
 */
export function buildHeuristicRecommendations(
  item: { kind: SocialContentKind; messageToneMode: SocialMessageToneMode | null; campaignEventId: string | null },
  primarySnapshot: {
    volunteerLeadCount: number | null;
    saves: number | null;
    comments: number | null;
  } | null,
  agg: SocialAnalyticsAggregates
): {
  recommendedNextTone: SocialMessageToneMode | null;
  recommendedBestWindow: string | null;
  recommendedFollowupType: SocialStrategicFollowupType;
  recommendedCountyFocus: string | null;
  recommendedCtaType: string | null;
  confidenceScore: number;
} {
  const top = agg.topTones[0]?.tone;
  const second = agg.topTones[1]?.tone;
  const hasStrongTone = (agg.topTones[0]?.n ?? 0) >= 2;
  const thinData = agg.snapshotCount < 3;

  let recommendedNextTone: SocialMessageToneMode | null = null;
  if (hasStrongTone && top) {
    recommendedNextTone = item.messageToneMode && item.messageToneMode === top && second ? second : top;
  } else {
    recommendedNextTone = "CALM_CLARIFICATION";
  }

  const bestPlats = Object.entries(agg.bestHourByPlatform)
    .sort((a, b) => b[1]!.avgScore - a[1]!.avgScore)
    .slice(0, 2);
  const winParts = bestPlats
    .map(([pl, w]) => `${socialEnumLabel(pl)}: ${w!.label} (avg score ${w!.avgScore.toFixed(1)})`)
    .join(" · ");
  const recommendedBestWindow = winParts || "Log more per-variant post times to refine windows (UTC used in aggregates).";

  let recommendedFollowupType: SocialStrategicFollowupType = SocialStrategicFollowupType.GENERAL_ENGAGEMENT;
  if (thinData) {
    recommendedFollowupType = SocialStrategicFollowupType.NO_ACTION;
  } else if (primarySnapshot?.volunteerLeadCount && primarySnapshot.volunteerLeadCount > 0) {
    recommendedFollowupType = SocialStrategicFollowupType.VOLUNTEER_CTA;
  } else if (item.kind === "POST_EVENT_RECAP") {
    recommendedFollowupType = SocialStrategicFollowupType.NO_ACTION;
  } else if (item.kind === "RAPID_RESPONSE") {
    recommendedFollowupType = SocialStrategicFollowupType.CLARIFICATION_POST;
  } else if (item.campaignEventId) {
    if (item.kind === "EVENT_PROMO") {
      recommendedFollowupType = SocialStrategicFollowupType.POST_EVENT_RECAP;
    } else {
      recommendedFollowupType = SocialStrategicFollowupType.COUNTY_VARIANT;
    }
  } else if (item.kind === "EVENT_PROMO") {
    recommendedFollowupType = SocialStrategicFollowupType.EVENT_PROMO;
  } else {
    recommendedFollowupType = SocialStrategicFollowupType.GENERAL_ENGAGEMENT;
  }

  const recommendedCountyFocus: string | null = item.campaignEventId
    ? "Tie to linked event’s counties in copy when you draft the follow-up."
    : null;
  const recommendedCtaType =
    primarySnapshot && (primarySnapshot.saves ?? 0) > (primarySnapshot.comments ?? 0) ? "save_reminder" : "thoughtful_reply";

  let confidenceScore = hasStrongTone ? 0.55 : 0.35;
  if (thinData) confidenceScore = 0.2;
  if (agg.snapshotCount >= 20) confidenceScore = Math.min(0.85, confidenceScore + 0.1);

  return {
    recommendedNextTone,
    recommendedBestWindow,
    recommendedFollowupType,
    recommendedCountyFocus,
    recommendedCtaType,
    confidenceScore,
  };
}
