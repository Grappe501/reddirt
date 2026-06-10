import { z } from "zod";
import { assertAdminApi } from "@/lib/admin/require-admin";
import { weekKeyFromParam } from "@/lib/calendar/weekly-time";
import { loadOrGenerateWeeklyDecisionBrief } from "@/lib/victory-os/decision-engine/load-decision-brief";
import { composeVictoryBoardViewModel } from "@/lib/victory-os/victory-board/compose-victory-board-view-model";
import { persistVictoryBoardSnapshot } from "@/lib/victory-os/victory-board/load-victory-board-snapshot";

export const dynamic = "force-dynamic";

const postSchema = z.object({
  action: z.enum(["persist_snapshot"]),
  weekKey: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

export async function GET(req: Request): Promise<Response> {
  const denied = await assertAdminApi();
  if (denied) return denied;

  const url = new URL(req.url);
  const weekKey = weekKeyFromParam(url.searchParams.get("week"));
  const viewModel = composeVictoryBoardViewModel(weekKey);
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
  const viewModel = composeVictoryBoardViewModel(weekKey);

  if (parsed.data.action === "persist_snapshot") {
    const brief = loadOrGenerateWeeklyDecisionBrief(weekKey);
    const snapshot = persistVictoryBoardSnapshot(viewModel, brief.briefId);
    return Response.json({ ok: true, viewModel, snapshot: { generatedAt: snapshot.generatedAt } });
  }

  return Response.json({ ok: false, error: "unknown_action" }, { status: 400 });
}
