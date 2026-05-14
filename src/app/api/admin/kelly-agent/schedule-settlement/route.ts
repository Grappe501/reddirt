import { assertAdminApi } from "@/lib/admin/require-admin";
import { runScheduleSettlementRecommendation } from "@/lib/kelly-agent/kelly-agent-schedule-settlement";
import type { WeekendRoutePlan } from "@/lib/opportunities/community-opportunity-types";
import { loadWeekendRoutePlansFile } from "@/lib/opportunities/load-community-opportunities-data";
import { z } from "zod";

export const dynamic = "force-dynamic";

const bodySchema = z.object({
  weekMondayYmd: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  /** Optional explicit plans; otherwise load from JSON file (capped). */
  weekendPlans: z.array(z.unknown()).max(8).optional(),
});

export async function POST(req: Request): Promise<Response> {
  const denied = await assertAdminApi();
  if (denied) return denied;

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return Response.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return Response.json({ ok: false, error: "validation", details: parsed.error.flatten() }, { status: 400 });
  }

  let plans: WeekendRoutePlan[] = [];
  if (Array.isArray(parsed.data.weekendPlans) && parsed.data.weekendPlans.length) {
    plans = parsed.data.weekendPlans as WeekendRoutePlan[];
  } else {
    const file = loadWeekendRoutePlansFile();
    plans = (file?.plans ?? []).slice(0, 8);
  }

  const out = await runScheduleSettlementRecommendation({
    weekendPlans: plans,
    weekMondayYmd: parsed.data.weekMondayYmd,
  });

  if (!out.ok) return Response.json(out, { status: 500 });
  return Response.json({
    ok: true,
    recommendation: out.data,
    openaiModel: out.openaiModel,
    usedFallback: out.usedFallback,
  });
}
