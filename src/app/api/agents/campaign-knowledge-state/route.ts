import { NextResponse } from "next/server";
import { buildOrchestrationStatePayload } from "@/lib/agents/orchestration/build-orchestration-payload";
import { ORCHESTRATION_FORBIDDEN_AUTO_ACTIONS } from "@/lib/agents/orchestration/orchestration-tool-contracts";

export const dynamic = "force-dynamic";

/** Read-only campaign knowledge / lessons summary for agents and operators. */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const period = url.searchParams.get("period") ?? "2026-04";

  try {
    const payload = await buildOrchestrationStatePayload(period, {
      pathname: "/admin/orchestration",
      role: "campaign_manager",
    });
    const knowledge = payload.campaignState.knowledge;

    return NextResponse.json({
      ok: payload.ok,
      generatedAt: payload.generatedAt,
      period,
      knowledge,
      graphHealth: knowledge.graphHealth,
      safety: {
        readOnly: true,
        autoExecutionDisabled: true,
        restrictedActions: ORCHESTRATION_FORBIDDEN_AUTO_ACTIONS,
      },
      errors: payload.errors,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Campaign knowledge state failed";
    return NextResponse.json({ ok: false, error: message, period }, { status: 200 });
  }
}
