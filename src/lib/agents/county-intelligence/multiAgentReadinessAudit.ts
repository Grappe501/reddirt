import { loadMultiAgentCoordinationReadiness } from "./campaignBrainAgentRegistry";

export function multiAgentReadinessAudit(countySlug: string) {
  const row = loadMultiAgentCoordinationReadiness().rows.find((x) => x.countySlug === countySlug);
  return {
    countySlug,
    coordinationConfidence: row?.coordinationConfidence ?? 0,
    conflictsSurfaced: row?.conflictsSurfaced ?? false,
    missingCoverage: row?.missingCoverage ?? ["MISSING readiness row"],
    requiredHumanApprovals: row?.requiredHumanApprovals ?? ["MISSING approval path"],
  };
}

