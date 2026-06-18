import { z } from "zod";
import { assertAdminApi } from "@/lib/admin/require-admin";
import { DEBATE_WEEK_INTENSIVE_DAY_IDS, type IntensiveDayId } from "@/lib/intelligence/v4/debateWeekIntensive2026";
import {
  loadKellyDebateIntensiveProgress,
  markDayComplete,
  saveKellyDebateIntensiveProgress,
  toggleBlockProgress,
  toggleDrillProgress,
} from "@/lib/intelligence/v4/kellyDebateIntensiveProgress";

export const dynamic = "force-dynamic";

const dayIdSchema = z
  .string()
  .refine((v): v is IntensiveDayId => DEBATE_WEEK_INTENSIVE_DAY_IDS.includes(v as IntensiveDayId));

const toggleBlockSchema = z.object({
  action: z.literal("toggle_block"),
  dayId: dayIdSchema,
  blockId: z.string().min(1),
});

const toggleDrillSchema = z.object({
  action: z.literal("toggle_drill"),
  drillId: z.string().min(1),
});

const completeDaySchema = z.object({
  action: z.literal("complete_day"),
  dayId: dayIdSchema,
});

export async function GET(): Promise<Response> {
  const denied = await assertAdminApi();
  if (denied) return denied;
  return Response.json({ ok: true, progress: loadKellyDebateIntensiveProgress() });
}

export async function POST(req: Request): Promise<Response> {
  const denied = await assertAdminApi();
  if (denied) return denied;

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return Response.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const action = (json as { action?: string }).action;
  const current = loadKellyDebateIntensiveProgress();

  if (action === "toggle_block") {
    const parsed = toggleBlockSchema.safeParse(json);
    if (!parsed.success) return Response.json({ ok: false, error: "validation" }, { status: 400 });
    const progress = toggleBlockProgress(current, parsed.data.dayId, parsed.data.blockId);
    saveKellyDebateIntensiveProgress(progress);
    return Response.json({ ok: true, progress });
  }

  if (action === "toggle_drill") {
    const parsed = toggleDrillSchema.safeParse(json);
    if (!parsed.success) return Response.json({ ok: false, error: "validation" }, { status: 400 });
    const progress = toggleDrillProgress(current, parsed.data.drillId);
    saveKellyDebateIntensiveProgress(progress);
    return Response.json({ ok: true, progress });
  }

  if (action === "complete_day") {
    const parsed = completeDaySchema.safeParse(json);
    if (!parsed.success) return Response.json({ ok: false, error: "validation" }, { status: 400 });
    const progress = markDayComplete(current, parsed.data.dayId);
    saveKellyDebateIntensiveProgress(progress);
    return Response.json({ ok: true, progress });
  }

  return Response.json({ ok: false, error: "unknown_action" }, { status: 400 });
}
