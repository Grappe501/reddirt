import { assertAdminApi } from "@/lib/admin/require-admin";
import { composeDailyBriefViewModel, loadOrGenerateDailyDecisionBrief, persistDailyDecisionBrief } from "@/lib/victory-os/daily-decisions/load-daily-brief";
import { generateDailyDecisionBrief } from "@/lib/victory-os/daily-decisions/generate-daily-decisions";

export const dynamic = "force-dynamic";

export async function GET(req: Request): Promise<Response> {
  const denied = await assertAdminApi();
  if (denied) return denied;
  const url = new URL(req.url);
  const dayKey = url.searchParams.get("day") ?? undefined;
  const viewModel = composeDailyBriefViewModel(dayKey);
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
  const action = (json as { action?: string }).action;
  const dayKey = (json as { dayKey?: string }).dayKey;
  if (action === "regenerate") {
    const brief = generateDailyDecisionBrief({ dayKey });
    persistDailyDecisionBrief(brief);
    const viewModel = composeDailyBriefViewModel(brief.dayKey);
    return Response.json({ ok: true, viewModel });
  }
  return Response.json({ ok: false, error: "unknown_action" }, { status: 400 });
}
