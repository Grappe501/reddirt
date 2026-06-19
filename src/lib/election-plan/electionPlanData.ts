import { ELECTION_PLAN_ARCHITECTURE } from "./electionPlanIndex";
import type { ElectionPlanWorkbenchSnapshot } from "./types";

export { ELECTION_PLAN_ARCHITECTURE };

export const ELECTION_PLAN_CLASSIFICATION =
  "Internal campaign strategy presentation — not for public distribution.";

export const ELECTION_PLAN_BRAND = {
  candidate: "Kelly Grappe",
  office: "Secretary of State",
  planTitle: "Arkansas Plurality Victory Plan",
  workbenchTitle: "Campaign Brain Workbench",
} as const;

export function formatVotes(n: number): string {
  return n.toLocaleString("en-US");
}

export function formatBudget(n: number): string {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

export function formatCompactVotes(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}K`;
  return formatVotes(n);
}

export function formatPluralityRange(low: number, high: number): string {
  if (low <= 0 && high <= 0) return "—";
  return `${formatCompactVotes(low)}–${formatCompactVotes(high)}`;
}

export function formatPct(n: number): string {
  return `${Math.round(n * 1000) / 10}%`;
}

/** Combined vote target for priority cities (Top 100 registry, with legacy fallbacks). */
export function priorityCitiesCombinedTarget(
  data: Pick<ElectionPlanWorkbenchSnapshot, "top100TargetVotes" | "top75TargetVotes" | "top40TargetVotes">,
): number {
  return data.top100TargetVotes ?? data.top75TargetVotes ?? data.top40TargetVotes;
}
