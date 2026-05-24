import { NextResponse } from "next/server";
import { buildOrchestrationStatePayload } from "@/lib/agents/orchestration/build-orchestration-payload";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const period = url.searchParams.get("period") ?? "2026-04";
  const payload = await buildOrchestrationStatePayload(period, {
    pathname: "/api/agents/cross-domain-orchestration-state",
  });
  const state = payload.crossDomainOrchestration;
  return NextResponse.json({
    ok: true,
    generatedAt: payload.generatedAt,
    sectionMapSummary: state.sectionMap.map((s) => ({
      id: s.id,
      label: s.label,
      ownedDomains: s.ownedDomains,
      routePaths: s.routePaths,
      improvesCampaignUnderstandingHow: s.improvesCampaignUnderstandingHow,
    })),
    dependencyGraph: state.dependencyGraph,
    recommendedSectionFocus: state.recommendedSectionFocus,
    playbooks: state.playbooks,
    actionPackets: state.actionPackets,
    learningHooks: state.learningHooks,
    safetySummary: state.safetySummary,
  });
}
