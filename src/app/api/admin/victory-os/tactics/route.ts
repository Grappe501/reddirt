import { z } from "zod";
import { assertAdminApi } from "@/lib/admin/require-admin";
import { weekKeyFromParam } from "@/lib/calendar/weekly-time";
import { composeTacticLinkageViewModel, syncAndPersistTacticLinkage } from "@/lib/victory-os/tactic-linkage/load-tactic-linkage";

export const dynamic = "force-dynamic";

const postSchema = z.object({
  action: z.enum(["sync"]),
  weekKey: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

export async function GET(req: Request): Promise<Response> {
  const denied = await assertAdminApi();
  if (denied) return denied;
  const url = new URL(req.url);
  const weekKey = weekKeyFromParam(url.searchParams.get("week"));
  const viewModel = composeTacticLinkageViewModel(weekKey);
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
  const parsed = postSchema.safeParse(json);
  if (!parsed.success) {
    return Response.json({ ok: false, error: "unknown_action" }, { status: 400 });
  }
  const weekKey = weekKeyFromParam(parsed.data.weekKey);
  if (parsed.data.action === "sync") {
    syncAndPersistTacticLinkage(weekKey);
    const viewModel = composeTacticLinkageViewModel(weekKey);
    return Response.json({ ok: true, viewModel });
  }
  return Response.json({ ok: false, error: "unknown_action" }, { status: 400 });
}
