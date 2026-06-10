import { z } from "zod";
import { assertAdminApi } from "@/lib/admin/require-admin";
import { weekKeyFromParam } from "@/lib/calendar/weekly-time";
import {
  loadAllCountyMissionStacks,
  loadCountyMissionStack,
  loadCountyMissionsRegistry,
  updateDailyTaskStatusInRegistry,
  updateMissionStatusInRegistry,
} from "@/lib/victory-os/mission-framework/load-county-missions";
import { syncCountyMissionsFromBrief } from "@/lib/victory-os/mission-framework/sync-missions-from-brief";

export const dynamic = "force-dynamic";

const statusSchema = z.object({
  action: z.literal("update_mission_status"),
  countySlug: z.string().min(1),
  missionId: z.string().min(1),
  status: z.enum(["proposed", "approved", "in_progress", "completed", "cancelled"]),
});

const taskSchema = z.object({
  action: z.literal("update_task_status"),
  countySlug: z.string().min(1),
  taskId: z.string().min(1),
  status: z.enum(["proposed", "approved", "in_progress", "completed", "cancelled"]),
});

const syncSchema = z.object({
  action: z.literal("sync_from_brief"),
  weekKey: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

export async function GET(req: Request): Promise<Response> {
  const denied = await assertAdminApi();
  if (denied) return denied;

  const url = new URL(req.url);
  const countySlug = url.searchParams.get("countySlug");
  const weekKey = url.searchParams.get("week");

  if (countySlug) {
    const stack = loadCountyMissionStack(countySlug);
    return Response.json({ ok: true, stack, registry: loadCountyMissionsRegistry() });
  }

  const registry = loadCountyMissionsRegistry();
  let stacks = loadAllCountyMissionStacks();
  if (weekKey) {
    const wk = weekKeyFromParam(weekKey);
    stacks = stacks.filter((s) => s.weekly?.periodKey === wk || registry?.syncedWeekKey === wk);
  }

  return Response.json({
    ok: true,
    registry,
    stacks,
    priorityStacks: stacks.filter((s) => s.weekly?.linkedDecisionIds?.length).slice(0, 15),
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

  const syncParsed = syncSchema.safeParse(json);
  if (syncParsed.success) {
    const weekKey = weekKeyFromParam(syncParsed.data.weekKey);
    try {
      const result = syncCountyMissionsFromBrief({ weekKey });
      return Response.json({ ok: true, result, registry: loadCountyMissionsRegistry() });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "sync_failed";
      return Response.json({ ok: false, error: msg }, { status: 400 });
    }
  }

  const missionParsed = statusSchema.safeParse(json);
  if (missionParsed.success) {
    const reg = updateMissionStatusInRegistry(
      missionParsed.data.countySlug,
      missionParsed.data.missionId,
      missionParsed.data.status,
    );
    if (!reg) return Response.json({ ok: false, error: "not_found" }, { status: 404 });
    return Response.json({ ok: true, registry: reg, stack: loadCountyMissionStack(missionParsed.data.countySlug) });
  }

  const taskParsed = taskSchema.safeParse(json);
  if (taskParsed.success) {
    const reg = updateDailyTaskStatusInRegistry(
      taskParsed.data.countySlug,
      taskParsed.data.taskId,
      taskParsed.data.status,
    );
    if (!reg) return Response.json({ ok: false, error: "not_found" }, { status: 404 });
    return Response.json({ ok: true, registry: reg, stack: loadCountyMissionStack(taskParsed.data.countySlug) });
  }

  return Response.json({ ok: false, error: "unknown_action" }, { status: 400 });
}
