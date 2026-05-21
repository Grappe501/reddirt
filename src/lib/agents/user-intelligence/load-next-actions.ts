import "server-only";

import type { CampaignEventsDashboardSnapshot } from "@/lib/campaign-events/load-campaign-events-dashboard";
import { composeCrossDomainContext } from "../orchestration/cross-domain-context-composer";
import type { NextActionResult } from "./next-action-engine";
import type { CampaignUserRole } from "./user-personas";
import { inferRoleFromPath } from "./user-personas";
import { loadGlobalUserObservations } from "./user-observations";

export function loadNextActionsForPage(input: {
  role?: CampaignUserRole;
  pathname: string;
  period: string;
  snapshot?: CampaignEventsDashboardSnapshot | null;
  readinessScore?: number | null;
}): NextActionResult {
  const role = input.role ?? inferRoleFromPath(input.pathname);
  const recentObservations = loadGlobalUserObservations().slice(-24);
  const syncStale = Boolean(input.snapshot?.calendarSync?.jsonStale);

  return composeCrossDomainContext({
    role,
    pathname: input.pathname,
    period: input.period,
    snapshot: input.snapshot,
    recentObservations,
    readinessScore: input.readinessScore ?? null,
    syncStale,
  }).recommendedNextActions;
}
