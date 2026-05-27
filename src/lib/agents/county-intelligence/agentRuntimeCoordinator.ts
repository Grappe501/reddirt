import { loadAgentRuntimeCoordinationMap } from "./campaignBrainAgentRegistry";

export function agentRuntimeCoordinator(countySlug: string) {
  const row = loadAgentRuntimeCoordinationMap().rows.find((x) => x.countySlug === countySlug);
  return {
    countySlug,
    participatingAgents: row?.participatingAgents ?? [],
    coordinationConfidence: row?.coordinationConfidence ?? 0,
    synthesizedReadiness: row?.synthesizedReadiness ?? 0,
    blockedCapabilities: row?.blockedCapabilities ?? ["MISSING coordination row"],
  };
}

