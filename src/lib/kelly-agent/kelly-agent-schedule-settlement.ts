import { z } from "zod";

import type { ScheduleSettlementRecommendation } from "@/lib/calendar/schedule-settlement-types";
import { formatOpenAIErrorForClient, getOpenAIClient, getOpenAIConfigFromEnv, isOpenAIConfigured } from "@/lib/openai/client";
import { buildAgentContextPack } from "@/lib/kelly-agent/build-agent-context-pack";
import type { WeekendRoutePlan } from "@/lib/opportunities/community-opportunity-types";

const outSchema = z.object({
  recommendedPlanId: z.string(),
  recommendation: z.enum(["approve", "approve_with_changes", "hold", "split_with_local", "needs_staff_work"]),
  headline: z.string(),
  why: z.array(z.string()).max(12),
  risks: z.array(z.string()).max(12),
  changesNeeded: z.array(z.string()).max(12),
  sendLocalSuggestions: z.array(z.object({ eventId: z.string(), reason: z.string() })).max(16),
  staffCallsNeeded: z
    .array(
      z.object({
        county: z.string().optional(),
        eventId: z.string().optional(),
        task: z.string(),
      }),
    )
    .max(16),
  pressOpportunities: z
    .array(
      z.object({
        eventId: z.string(),
        recommendation: z.enum(["yes", "maybe", "staff_decide"]),
        reason: z.string(),
      }),
    )
    .max(12),
});

function mapStaffToReco(
  s: WeekendRoutePlan["staffRecommendation"] | undefined,
): ScheduleSettlementRecommendation["recommendation"] {
  switch (s) {
    case "approve":
      return "approve";
    case "modify":
      return "approve_with_changes";
    case "hold":
      return "hold";
    case "split_with_surrogate":
      return "split_with_local";
    default:
      return "needs_staff_work";
  }
}

function buildFallback(args: { weekendPlans: WeekendRoutePlan[]; currentDate: string }): ScheduleSettlementRecommendation {
  const p0 = args.weekendPlans[0];
  const rid = p0?.id ?? `week-${args.currentDate.slice(0, 10)}`;
  const rec = mapStaffToReco(p0?.staffRecommendation);
  return {
    recommendedPlanId: rid,
    recommendation: rec,
    headline: p0?.title ?? "Review the merged calendar pack and weekend route options before locking tonight.",
    why: p0
      ? [
          `${p0.countiesTouched} counties touched with ${p0.mustAttendCount} must-attend anchors.`,
          `Drive load ~${p0.totalDriveMiles} mi / ${p0.totalDriveMinutes} min (workbook estimate).`,
          `Staff preset: ${p0.staffRecommendation.replace(/_/g, " ")}.`,
        ]
      : ["No primary weekend plan row — use route comparison cards and week board."],
    risks: p0?.risks?.length ? p0.risks.slice(0, 6) : ["Data incomplete until weekend plan is selected."],
    changesNeeded: [],
    sendLocalSuggestions: [],
    staffCallsNeeded: [],
    pressOpportunities: [],
  };
}

export async function runScheduleSettlementRecommendation(args: {
  weekendPlans: WeekendRoutePlan[];
  weekMondayYmd?: string;
}): Promise<
  { ok: true; data: ScheduleSettlementRecommendation; openaiModel: string | null; usedFallback: boolean } | { ok: false; error: string }
> {
  const pack = await buildAgentContextPack({ weekMondayYmd: args.weekMondayYmd });
  const fallback = buildFallback({ weekendPlans: args.weekendPlans, currentDate: pack.currentDate });

  if (!isOpenAIConfigured()) {
    return { ok: true, data: fallback, openaiModel: null, usedFallback: true };
  }

  const client = getOpenAIClient();
  const { model } = getOpenAIConfigFromEnv();
  const SYSTEM = `You are the Kelly Grappe campaign scheduling brain in SCHEDULE SETTLEMENT mode (single persona).
Return JSON ONLY matching keys: recommendedPlanId, recommendation, headline, why[], risks[], changesNeeded[], sendLocalSuggestions[{eventId,reason}], staffCallsNeeded[{county?,eventId?,task}], pressOpportunities[{eventId,recommendation,reason}].
recommendation must be one of: approve | approve_with_changes | hold | split_with_local | needs_staff_work.
Use only the provided contextPack and weekendPlansSummary — no invented private calendar titles, no unsourced opponent claims, no secret addresses.
eventId values should be calendar item ids from context when possible, else opportunity ids from weekend plan slots.`;

  const user = JSON.stringify({
    contextPack: pack,
    weekendPlansSummary: args.weekendPlans.slice(0, 6).map((p) => ({
      id: p.id,
      title: p.title,
      weekStart: p.weekStart,
      countiesTouched: p.countiesTouched,
      mustAttendCount: p.mustAttendCount,
      totalDriveMiles: p.totalDriveMiles,
      routeTightness: p.routeTightness,
      staffRecommendation: p.staffRecommendation,
      risks: p.risks,
    })),
  });

  try {
    const completion = await client.chat.completions.create({
      model,
      temperature: 0.15,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM },
        { role: "user", content: user },
      ],
    });
    const raw = completion.choices[0]?.message?.content?.trim();
    if (!raw) return { ok: true, data: fallback, openaiModel: model, usedFallback: true };
    const parsed = outSchema.safeParse(JSON.parse(raw));
    if (!parsed.success) return { ok: true, data: fallback, openaiModel: model, usedFallback: true };
    return { ok: true, data: parsed.data, openaiModel: model, usedFallback: false };
  } catch (e) {
    console.warn("schedule settlement openai", formatOpenAIErrorForClient(e));
    return { ok: true, data: fallback, openaiModel: model, usedFallback: true };
  }
}
