import { loadAgentRuntimeStateTable } from "./campaignBrainAgentRegistry";

export function statewideInterventionCoordinator() {
  const rows = loadAgentRuntimeStateTable().rows
    .slice()
    .sort((a, b) => b.executiveUrgency - a.executiveUrgency);
  return {
    rankedInterventions: rows.map((row) => ({
      countySlug: row.countySlug,
      countyName: row.countyName,
      executiveUrgency: row.executiveUrgency,
      coordinationConfidence: row.coordinationConfidence,
    })),
  };
}

