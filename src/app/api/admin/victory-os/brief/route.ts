import { z } from "zod";
import { assertAdminApi } from "@/lib/admin/require-admin";
import { weekKeyFromParam } from "@/lib/calendar/weekly-time";
import { composeMondayBriefViewModel } from "@/lib/victory-os/mission-brief/compose-monday-brief-view-model";
import {
  loadWeeklyDecisionBriefSnapshot,
  mergeDecisionStatuses,
  persistWeeklyDecisionBrief,
} from "@/lib/victory-os/decision-engine/load-decision-brief";
import { generateWeeklyDecisionBrief } from "@/lib/victory-os/decision-engine/generate-weekly-decisions";
import { syncCountyMissionsFromBrief } from "@/lib/victory-os/mission-framework/sync-missions-from-brief";

export const dynamic = "force-dynamic";

const pipelineSchema = z.object({
  action: z.enum(["run_monday_pipeline", "approve_all_pending"]),
  weekKey: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

export async function GET(req: Request): Promise<Response> {
  const denied = await assertAdminApi();
  if (denied) return denied;

  const url = new URL(req.url);
  const weekKey = weekKeyFromParam(url.searchParams.get("week"));
  const viewModel = composeMondayBriefViewModel(weekKey);
  return Response.json({ ok: true, viewModel });
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

  const parsed = pipelineSchema.safeParse(json);
  if (!parsed.success) {
    return Response.json({ ok: false, error: "unknown_action" }, { status: 400 });
  }

  const weekKey = weekKeyFromParam(parsed.data.weekKey);

  if (parsed.data.action === "run_monday_pipeline") {
    const existing = loadWeeklyDecisionBriefSnapshot(weekKey);
    const fresh = generateWeeklyDecisionBrief({ weekKey });
    const merged = mergeDecisionStatuses(fresh, existing);
    persistWeeklyDecisionBrief(merged);
    try {
      syncCountyMissionsFromBrief({ weekKey });
    } catch {
      /* brief saved; missions sync optional if brief was new */
    }
    const viewModel = composeMondayBriefViewModel(weekKey);
    return Response.json({ ok: true, viewModel });
  }

  if (parsed.data.action === "approve_all_pending") {
    const brief = loadWeeklyDecisionBriefSnapshot(weekKey);
    if (!brief) {
      return Response.json({ ok: false, error: "brief_not_found" }, { status: 404 });
    }
    const updated = {
      ...brief,
      topDecisions: brief.topDecisions.map((d) =>
        d.status === "pending" ? { ...d, status: "approved" as const } : d,
      ),
      kellyDeployment: brief.kellyDeployment.map((d) =>
        d.status === "pending" ? { ...d, status: "approved" as const } : d,
      ),
      volunteerDeployment: brief.volunteerDeployment.map((d) =>
        d.status === "pending" ? { ...d, status: "approved" as const } : d,
      ),
      fundraisingDeployment: brief.fundraisingDeployment.map((d) =>
        d.status === "pending" ? { ...d, status: "approved" as const } : d,
      ),
    };
    persistWeeklyDecisionBrief(updated);
    const viewModel = composeMondayBriefViewModel(weekKey);
    return Response.json({ ok: true, viewModel });
  }

  return Response.json({ ok: false, error: "unknown_action" }, { status: 400 });
}
