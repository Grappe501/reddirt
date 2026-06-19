/**
 * Heavy command-home bundle — isolated from v5 snapshot so EP hub pages stay light on Netlify.
 */
import { mapAdminHrefsDeep } from "@/lib/election-plan/debate-prep-route-map";
import { buildCandidateCommandHomeFeed } from "@/lib/intelligence/v4/candidateCommandHome";
import { buildCceClosureSummary } from "@/lib/intelligence/v4/phase15P9Closure";
import { buildSreClosureSummary } from "@/lib/intelligence/v4/phase16P9Closure";

export function buildDebatePrepCommandHomeBundle() {
  const raw = {
    feed: buildCandidateCommandHomeFeed(),
    cceClosure: buildCceClosureSummary(),
    sreClosure: buildSreClosureSummary(),
  };
  return mapAdminHrefsDeep(raw);
}
