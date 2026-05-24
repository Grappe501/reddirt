import { NextResponse } from "next/server";
import { buildCrossDomainOrchestrationState } from "@/lib/agents/orchestration/cross-domain/cross-domain-orchestration-state";
import { loadCampaignOrchestrationSignals } from "@/lib/agents/orchestration/load-campaign-orchestration-signals";
import { runOrchestrationReasoning } from "@/lib/agents/orchestration/orchestration-reasoning-engine";
import { buildAgentToolingState } from "@/lib/agents/orchestration/tooling/agent-tooling-state";
import type { CampaignSectionId } from "@/lib/agents/orchestration/cross-domain/cross-domain-orchestrator-types";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const period = url.searchParams.get("period") ?? "2026-04";
  const requestedSection = url.searchParams.get("section") as CampaignSectionId | null;
  const role = "campaign_manager";
  const { state, sourceHealth } = await loadCampaignOrchestrationSignals(period, { pathname: "/admin/orchestration", role });
  const diagnosis = runOrchestrationReasoning(state);
  const agentTooling = buildAgentToolingState({ state, sourceHealth, diagnosis, role, period });
  const crossDomainOrchestration = buildCrossDomainOrchestrationState({
    state,
    sourceHealth,
    agentTooling,
    role,
    period,
    requestedSection: requestedSection ?? undefined,
  });
  return NextResponse.json({
    ok: true,
    generatedAt: new Date().toISOString(),
    sectionMapSummary: crossDomainOrchestration.sectionMap.map((s) => ({
      id: s.id,
      label: s.label,
      ownedDomains: s.ownedDomains,
      routePaths: s.routePaths,
      improvesCampaignUnderstandingHow: s.improvesCampaignUnderstandingHow,
    })),
    dependencyGraph: crossDomainOrchestration.dependencyGraph,
    recommendedSectionFocus: crossDomainOrchestration.recommendedSectionFocus,
    playbooks: crossDomainOrchestration.playbooks,
    actionPackets: crossDomainOrchestration.actionPackets,
    learningHooks: crossDomainOrchestration.learningHooks,
    safetySummary: crossDomainOrchestration.safetySummary,
    readOnly: true,
  });
}
