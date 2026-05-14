import { z } from "zod";

import { assertAdminApi } from "@/lib/admin/require-admin";
import { KELLY_AGENT_TASKS, type KellyAgentTask } from "@/lib/kelly-agent/agent-context-pack";
import { runKellyAgentRecommend } from "@/lib/kelly-agent/kelly-agent-recommend";

export const dynamic = "force-dynamic";

const taskTuple = [...KELLY_AGENT_TASKS] as [KellyAgentTask, ...KellyAgentTask[]];
const taskEnum = z.enum(taskTuple);

const bodySchema = z.object({
  task: taskEnum,
  weekMondayYmd: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  calendarItemId: z.string().min(1).optional(),
  extraStaffRules: z.array(z.string()).max(24).optional(),
  extraConstraints: z.array(z.string()).max(24).optional(),
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

  const { task, weekMondayYmd, calendarItemId, extraStaffRules, extraConstraints } = parsed.data;
  const out = await runKellyAgentRecommend({
    task,
    weekMondayYmd,
    calendarItemId,
    extraStaffRules,
    extraConstraints,
  });
  return Response.json(out);
}
