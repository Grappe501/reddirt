import { SocialContentKind, SocialMessageToneMode, SocialPlatform } from "@prisma/client";
import { z } from "zod";
import type { SocialAnalyticsAggregates } from "@/lib/social/social-analytics-aggregates";

/** Heuristic / provenance version — bump when aggregate or recommendation shape changes. */
export const ANALYTICS_RECOMMENDATION_HEURISTIC_VERSION = "v1";

const aggregateSignalsSchema = z.object({
  bestHour: z.string().nullable(),
  bestWeekday: z.string().nullable(),
  topTone: z
    .object({
      tone: z.string(),
      avgScore: z.number(),
      n: z.number(),
    })
    .nullable(),
  eventVsNonEventDelta: z.number().nullable(),
  meaningfulScoreContext: z.string(),
});

/**
 * Durable, structured snapshot stored on `WorkflowIntake.metadata` and in `AnalyticsRecommendationOutcome.provenanceJson`.
 */
export const analyticsProvenancePayloadSchema = z.object({
  source: z.literal("analytics"),
  recommendationType: z.string().min(1),
  headline: z.string().min(1),
  confidence: z.number().min(0).max(1),
  generatedAt: z.string(),
  dateRange: z.object({ start: z.string(), end: z.string() }),
  platform: z.string().nullable().optional(),
  contentKind: z.string().nullable().optional(),
  toneMode: z.string().nullable().optional(),
  eventId: z.string().nullable().optional(),
  aggregateSignals: aggregateSignalsSchema,
  heuristicVersion: z.string().min(1),
  reasoning: z.union([z.string(), z.record(z.string(), z.unknown())]),
  sourceSocialContentItemId: z.string().min(1).optional(),
  templateKey: z.string().optional(),
});

export type AnalyticsProvenancePayload = z.infer<typeof analyticsProvenancePayloadSchema>;

type WindowBucket = { key: string; label: string; avgScore: number; n: number };

function bestBucketEntry(
  map: Record<string, WindowBucket | undefined>,
  score: (b: WindowBucket) => number
): { key: string; value: WindowBucket } | null {
  let best: { key: string; value: WindowBucket } | null = null;
  for (const [k, v] of Object.entries(map)) {
    if (!v) continue;
    if (!best || score(v) > score(best.value)) {
      best = { key: k, value: v };
    }
  }
  return best;
}

/**
 * Build aggregate-signal lines for decision lineage (reconstruct “why” without re-querying all snapshots here).
 */
export function buildAnalyticsAggregateSignals(agg: SocialAnalyticsAggregates) {
  const h = bestBucketEntry(agg.bestHourByPlatform, (b) => b.avgScore);
  const w = bestBucketEntry(agg.bestWeekdayByPlatform, (b) => b.avgScore);
  const bestHour = h
    ? `${h.key.split("__")[0] ?? h.key} · ${h.value.label} (score ${h.value.avgScore.toFixed(1)})`
    : null;
  const bestWeekday = w
    ? `${w.key.split("__")[0] ?? w.key} · ${w.value.label} (score ${w.value.avgScore.toFixed(1)})`
    : null;
  const top = agg.byTone[0] ?? null;
  const topTone = top
    ? { tone: String(top.tone), avgScore: top.avgScore, n: top.n }
    : null;
  const e = agg.eventSplit;
  const eventVsNonEventDelta = e.withEvent.n >= 1 && e.withoutEvent.n >= 1 ? e.withEvent.avgScore - e.withoutEvent.avgScore : null;
  const meaningfulScoreContext = `window=${agg.dayRange}d snapshots=${agg.snapshotCount}`;

  return {
    bestHour,
    bestWeekday,
    topTone,
    eventVsNonEventDelta,
    meaningfulScoreContext: meaningfulScoreContext.slice(0, 2000),
  };
}

type BuildProvenanceInput = {
  recommendationType: string;
  headline: string;
  confidence: number;
  reasoning: string | Record<string, unknown>;
  dateRange: { start: Date; end: Date };
  aggregate: SocialAnalyticsAggregates;
  platform?: SocialPlatform | null;
  contentKind?: SocialContentKind | null;
  toneMode?: SocialMessageToneMode | null;
  eventId?: string | null;
  sourceSocialContentItemId?: string;
  templateKey?: string;
  /** Defaults to `new Date()`. */
  now?: Date;
  heuristicVersion?: string;
};

/**
 * Central builder for provenance: intake lane, draft lane, and `AnalyticsRecommendationOutcome` rows.
 */
export function buildAnalyticsProvenancePayload(input: BuildProvenanceInput): AnalyticsProvenancePayload {
  const now = input.now ?? new Date();
  const version = input.heuristicVersion ?? ANALYTICS_RECOMMENDATION_HEURISTIC_VERSION;
  const signals = buildAnalyticsAggregateSignals(input.aggregate);
  const out: AnalyticsProvenancePayload = {
    source: "analytics",
    recommendationType: input.recommendationType,
    headline: input.headline,
    confidence: input.confidence,
    generatedAt: now.toISOString(),
    dateRange: {
      start: input.dateRange.start.toISOString(),
      end: input.dateRange.end.toISOString(),
    },
    platform: input.platform != null ? String(input.platform) : undefined,
    contentKind: input.contentKind != null ? String(input.contentKind) : undefined,
    toneMode: input.toneMode != null ? String(input.toneMode) : undefined,
    eventId: input.eventId != null && input.eventId.length > 0 ? input.eventId : undefined,
    aggregateSignals: signals,
    heuristicVersion: version,
    reasoning: input.reasoning,
  };
  if (input.sourceSocialContentItemId) {
    out.sourceSocialContentItemId = input.sourceSocialContentItemId;
  }
  if (input.templateKey) {
    out.templateKey = input.templateKey;
  }
  return analyticsProvenancePayloadSchema.parse(out);
}

const socialPlatformSchema = z.nativeEnum(SocialPlatform);
const socialContentKindSchema = z.nativeEnum(SocialContentKind);
const socialMessageToneModeSchema = z.nativeEnum(SocialMessageToneMode);

const socialAggregatesMinSchema = z.object({
  generatedAt: z.string(),
  dayRange: z.number(),
  snapshotCount: z.number(),
  bestHourByPlatform: z.record(z.unknown()).optional(),
  bestWeekdayByPlatform: z.record(z.unknown()).optional(),
  byKind: z.array(z.unknown()).optional(),
  byTone: z.array(z.unknown()).optional(),
  byTactic: z.array(z.unknown()).optional(),
  topTones: z.array(z.unknown()).optional(),
  eventSplit: z.unknown().optional(),
});

export function parseSocialAnalyticsAggregates(raw: unknown): SocialAnalyticsAggregates {
  const p = socialAggregatesMinSchema.safeParse(raw);
  if (!p.success) {
    throw new Error("Invalid aggregateContext: not a social analytics window payload.");
  }
  return raw as SocialAnalyticsAggregates;
}

export const createWorkflowIntakeFromAnalyticsInputSchema = z.object({
  sourceSocialContentItemId: z.string().min(1),
  recommendationType: z.string().min(1),
  headline: z.string().min(1).max(500),
  reasoning: z.union([z.string().max(20_000), z.record(z.string(), z.unknown())]),
  platform: socialPlatformSchema.optional(),
  contentKind: socialContentKindSchema.optional(),
  toneMode: socialMessageToneModeSchema.optional(),
  eventId: z.string().min(1).optional(),
  confidence: z.number().min(0).max(1),
  aggregateContext: z.unknown(),
  dateRange: z.object({
    start: z.string().min(1),
    end: z.string().min(1),
  }),
  heuristicVersion: z.string().min(1).default(ANALYTICS_RECOMMENDATION_HEURISTIC_VERSION),
});

export type CreateWorkflowIntakeFromAnalyticsInput = z.infer<typeof createWorkflowIntakeFromAnalyticsInputSchema>;
