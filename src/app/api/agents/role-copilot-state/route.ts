import { NextResponse } from "next/server";
import { loadCampaignOrchestrationSignals } from "@/lib/agents/orchestration/load-campaign-orchestration-signals";
import { runOrchestrationReasoning } from "@/lib/agents/orchestration/orchestration-reasoning-engine";
import { buildAgentToolingState } from "@/lib/agents/orchestration/tooling/agent-tooling-state";
import { buildCrossDomainOrchestrationState } from "@/lib/agents/orchestration/cross-domain/cross-domain-orchestration-state";
import { buildRoleCopilotNetworkState } from "@/lib/agents/orchestration/role-copilots/role-copilot-state";
import type { CampaignOrchestrationRoleId } from "@/lib/agents/orchestration/role-copilots/role-copilot-types";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const period = url.searchParams.get("period") ?? "2026-04";
  const activeRole = (url.searchParams.get("role") ?? "campaign_manager") as CampaignOrchestrationRoleId;
  const role = "campaign_manager";
  const { state, sourceHealth } = await loadCampaignOrchestrationSignals(period, { pathname: "/admin/orchestration", role });
  const diagnosis = runOrchestrationReasoning(state);
  const agentTooling = buildAgentToolingState({ state, sourceHealth, diagnosis, role, period });
  const crossDomainOrchestration = buildCrossDomainOrchestrationState({ state, sourceHealth, agentTooling, role, period });
  const roleCopilots = buildRoleCopilotNetworkState({ state, agentTooling, crossDomainOrchestration, activeRole });

  return NextResponse.json({
    ok: true,
    generatedAt: new Date().toISOString(),
    period,
    role: activeRole,
    roleBriefing: roleCopilots.activeRoleBriefing,
    tools: roleCopilots.roleToolRoutes.find((r) => r.roleId === activeRole),
    workflows: roleCopilots.roleWorkflows.filter((w) => w.roleId === activeRole),
    training: roleCopilots.roleTraining.find((t) => t.roleId === activeRole),
    learningPrompts: roleCopilots.roleLearningPrompts.filter((p) => p.roleId === activeRole),
    safetyBoundaries: roleCopilots.safetySummary,
    roles: roleCopilots.roles.map((r) => ({ id: r.id, label: r.label, mission: r.mission })),
    readOnly: true,
  });
}
