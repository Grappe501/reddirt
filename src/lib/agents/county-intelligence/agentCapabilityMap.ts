import { loadAgentCapabilityMap } from "./campaignBrainAgentRegistry";

export function agentCapabilityMap(agentId: string) {
  const row = loadAgentCapabilityMap().rows.find((x) => x.agentId === agentId);
  return {
    agentId,
    can: row?.can ?? [],
    cannot: row?.cannot ?? [],
    safetyConstraints: row?.safetyConstraints ?? [],
  };
}

