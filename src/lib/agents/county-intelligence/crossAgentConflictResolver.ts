import { loadMultiAgentCoordinationReadiness } from "./campaignBrainAgentRegistry";

export function crossAgentConflictResolver(countySlug: string) {
  const row = loadMultiAgentCoordinationReadiness().rows.find((x) => x.countySlug === countySlug);
  const conflicts = row?.conflictsSurfaced ? row.missingCoverage : [];
  return {
    countySlug,
    conflicts,
    hasConflicts: conflicts.length > 0,
    guidance:
      conflicts.length > 0
        ? "Surface conflicts explicitly and require human review."
        : "No major cross-agent conflicts detected.",
  };
}

