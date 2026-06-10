import { z } from "zod";
import { assertAdminApi } from "@/lib/admin/require-admin";
import { weekKeyFromParam } from "@/lib/calendar/weekly-time";
import {
  loadOrGenerateWeeklyDecisionBrief,
  mergeDecisionStatuses,
  persistWeeklyDecisionBrief,
  updateDecisionStatusInBrief,
  listWeeklyDecisionBriefWeekKeys,
  loadWeeklyDecisionBriefSnapshot,
} from "@/lib/victory-os/decision-engine/load-decision-brief";
import { generateWeeklyDecisionBrief } from "@/lib/victory-os/decision-engine/generate-weekly-decisions";

export const dynamic = "force-dynamic";

const statusSchema = z.object({
  action: z.literal("update_status"),
  weekKey: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  decisionId: z.string().min(1),
  status: z.enum(["pending", "approved", "declined", "modified"]),
});

export async function GET(req: Request): Promise<Response> {
  const denied = await assertAdminApi();
  if (denied) return denied;

  const url = new URL(req.url);
  const weekKey = weekKeyFromParam(url.searchParams.get("week"));
  const regenerate = url.searchParams.get("regenerate") === "1";

  const brief = loadOrGenerateWeeklyDecisionBrief(weekKey, { forceRegenerate: regenerate });
  const snapshots = listWeeklyDecisionBriefWeekKeys();

  return Response.json({
    ok: true,
    brief,
    snapshots,
    fromSnapshot: !regenerate && snapshots.includes(weekKey),
  });
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

  const body = json as { action?: string; weekKey?: string };

  if (body.action === "regenerate") {
    const weekKey = weekKeyFromParam(body.weekKey);
    const existing = loadWeeklyDecisionBriefSnapshot(weekKey);
    const fresh = generateWeeklyDecisionBrief({ weekKey });
    const merged = mergeDecisionStatuses(fresh, existing);
    const path = persistWeeklyDecisionBrief(merged);
    return Response.json({ ok: true, brief: merged, path });
  }

  const parsed = statusSchema.safeParse(json);
  if (parsed.success) {
    const updated = updateDecisionStatusInBrief(parsed.data.weekKey, parsed.data.decisionId, parsed.data.status);
    if (!updated) {
      return Response.json({ ok: false, error: "brief_not_found" }, { status: 404 });
    }
    return Response.json({ ok: true, brief: updated });
  }

  return Response.json({ ok: false, error: "unknown_action" }, { status: 400 });
}
