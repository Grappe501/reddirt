import derived from "./data/hill-derived.json";
import { HILL_VOTE_ACTOR_ID } from "./contracts";

export type HillLegislativeDashboard = typeof derived;

export function getHillLegislativeDashboard(actorId?: string): HillLegislativeDashboard | null {
  if (actorId !== HILL_VOTE_ACTOR_ID) return null;
  return derived;
}

export function hillLegislativeCorpusIsMissing(actorId?: string): boolean {
  const row = getHillLegislativeDashboard(actorId);
  return Boolean(row && row.voteCount === 0);
}
