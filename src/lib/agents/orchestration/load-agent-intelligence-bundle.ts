import "server-only";

import type { CampaignEventsDashboardSnapshot } from "@/lib/campaign-events/load-campaign-events-dashboard";
import { buildMemoryCandidatesFromObservations } from "../memory/agent-memory-write-planner";
import type { CampaignUserRole } from "../user-intelligence/user-personas";
import { loadGlobalUserObservations } from "../user-intelligence/user-observations";
import { detectWorkflowFriction } from "../user-intelligence/workflow-friction-detector";
import { composeCrossDomainContext } from "./cross-domain-context-composer";

export function loadAgentIntelligenceBundle(input: {
  role: CampaignUserRole;
  pathname: string;
  period: string;
  snapshot?: CampaignEventsDashboardSnapshot | null;
  readinessScore?: number | null;
  eventRecordId?: string | null;
  reimbursementEffectiveStatus?: string | null;
}) {
  const observations = loadGlobalUserObservations();
  const recent = observations.slice(-24);
  const syncStale = Boolean(input.snapshot?.calendarSync?.jsonStale);
  const crossDomain = composeCrossDomainContext({
    ...input,
    recentObservations: recent,
    syncStale,
    reimbursementEffectiveStatus: input.reimbursementEffectiveStatus,
  });
  const friction = detectWorkflowFriction(observations);
  const memoryCandidates = buildMemoryCandidatesFromObservations(observations, 6);

  const toolSignals = countToolSignals(observations);

  return {
    observations,
    recent,
    crossDomain,
    friction,
    memoryCandidates,
    toolSignals,
    nextActions: crossDomain.recommendedNextActions,
  };
}

function countToolSignals(obs: ReturnType<typeof loadGlobalUserObservations>) {
  const counts = new Map<string, number>();
  for (const o of obs) {
    if (o.toolId) counts.set(o.toolId, (counts.get(o.toolId) ?? 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([toolId, count]) => ({ toolId, count }));
}
