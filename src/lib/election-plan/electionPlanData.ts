import { ELECTION_PLAN_ARCHITECTURE } from "./electionPlanIndex";

export { ELECTION_PLAN_ARCHITECTURE };

export const ELECTION_PLAN_CLASSIFICATION =
  "Internal campaign strategy presentation — not for public distribution.";

export const ELECTION_PLAN_BRAND = {
  candidate: "Kelly Grappe",
  office: "Secretary of State",
  planTitle: "Arkansas Plurality Victory Plan",
  workbenchTitle: "Campaign Brain Workbench",
} as const;

export const ELECTION_PLAN_HERO_DEFAULTS = {
  expectedProjection: 410_197,
  pluralityLow: 390_000,
  pluralityHigh: 420_000,
  dropOffPool: 102_070,
  lane2Recovery50: 51_051,
  registrationGoal: 50_000,
  top40CityTarget: 207_507,
  verifiedEvents: 3,
  verifiedGoal: 300,
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
  return `${formatCompactVotes(low)}–${formatCompactVotes(high)}`;
}

export function formatPct(n: number): string {
  return `${Math.round(n * 1000) / 10}%`;
}
