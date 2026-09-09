import { HILL_VOTE_ACTOR_ID, type LegislativePromptPacket } from "./contracts";
import { buildLegislativeOutlierViews } from "./outliers";
import { loadHillLegislativeIntelligence } from "./profile";

function pct(rate: number | null): string {
  return rate == null ? "unknown" : `${Math.round(rate * 100)}%`;
}

export function buildLegislativePromptPacket(actorId?: string, cwd = process.cwd()): LegislativePromptPacket | null {
  if (actorId !== HILL_VOTE_ACTOR_ID) return null;
  const { votes, profile } = loadHillLegislativeIntelligence(cwd);
  const outliers = buildLegislativeOutlierViews(votes, profile);
  const refs = votes.slice(0, 8).map((vote) => vote.voteId);
  const strongest = profile.issueAlignment.filter((row) => (row.partyAlignment.rate ?? 0) >= 0.8).slice(0, 4);
  const weakest = [...profile.issueAlignment].sort((a, b) => (a.partyAlignment.rate ?? 1) - (b.partyAlignment.rate ?? 1)).slice(0, 4);
  const recent = outliers.find((view) => view.id === "AGAINST_REPUBLICAN_POSITION")?.voteIds.slice(0, 5) ?? [];
  const recentWindow = profile.temporal.find((slice) => slice.window === "LAST_12_MONTHS");
  const allTime = profile.temporal.find((slice) => slice.window === "ALL_TIME_AVAILABLE");

  const lines = [
    `LEGISLATIVE BEHAVIOR PACKET (${profile.version})`,
    `Actor: ${HILL_VOTE_ACTOR_ID}. Source=${profile.record.sourceCorpus ?? "NOT LOCATED"}. Votes analyzed=${profile.record.voteCount}. Coverage=${profile.record.coverageEstimate}.`,
    `Party alignment: ${pct(profile.partyAlignment.rate)} (n=${profile.partyAlignment.denominator}). Party departures: ${profile.partyDefection.numerator}.`,
    `Documented administration alignment: ${pct(profile.documentedAdminAlignment.rate)} (n=${profile.documentedAdminAlignment.denominator}). Unknown administration position stays unknown.`,
    `Bipartisan majority share: ${pct(profile.bipartisanRate.rate)}. Highly partisan share: ${pct(profile.highlyPartisanRate.rate)}.`,
    `Strongest alignment issues: ${strongest.map((row) => `${row.issue} ${pct(row.partyAlignment.rate)}`).join(", ") || "unknown"}.`,
    `Highest-defection issues: ${weakest.map((row) => `${row.issue} ${pct(row.partyAlignment.rate)}`).join(", ") || "unknown"}.`,
    `Recent notable departures (party-position votes): ${recent.join(", ") || "none in loaded corpus"}.`,
    `Recent 12-month party alignment: ${pct(recentWindow?.partyAlignment.rate ?? null)} vs all-available ${pct(allTime?.partyAlignment.rate ?? null)}. Recent evidence is more relevant; history remains visible.`,
    "Vote history is evidence for plausibility, never a deterministic prediction.",
    "Do not invent roll calls, party positions, or administration positions that were not supplied.",
    `Evidence refs: ${refs.join(", ") || "none"}`,
  ];
  return { actorId, lines, sourceRefs: refs };
}

export function formatLegislativePromptPacket(actorId?: string, cwd = process.cwd()): string {
  const packet = buildLegislativePromptPacket(actorId, cwd);
  return packet ? packet.lines.join("\n") : "";
}
