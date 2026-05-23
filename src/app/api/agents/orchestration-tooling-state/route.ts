import { NextResponse } from "next/server";
import { buildOrchestrationStatePayload } from "@/lib/agents/orchestration/build-orchestration-payload";
import { loadUnifiedAgentToolRegistry, registrySummary } from "@/lib/agents/orchestration/tooling/agent-tool-registry";
import { PROHIBITED_EXECUTION_TYPES } from "@/lib/agents/orchestration/tooling/agent-tool-safety";

export const dynamic = "force-dynamic";

/** Read-only AI agent tooling brain state. */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const period = url.searchParams.get("period") ?? "2026-04";

  try {
    const payload = await buildOrchestrationStatePayload(period, {
      pathname: "/admin/orchestration",
      role: "campaign_manager",
    });
    const tooling = payload.agentTooling;
    const registry = loadUnifiedAgentToolRegistry();

    return NextResponse.json({
      ok: payload.ok,
      generatedAt: payload.generatedAt,
      period,
      registrySummary: registrySummary(registry),
      agentTooling: tooling,
      safety: {
        readOnly: true,
        autoExecutionDisabled: true,
        prohibitedActionTypes: PROHIBITED_EXECUTION_TYPES,
        humanGateRequired: true,
      },
      errors: payload.errors,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Orchestration tooling state failed";
    return NextResponse.json({ ok: false, error: message, period }, { status: 200 });
  }
}
