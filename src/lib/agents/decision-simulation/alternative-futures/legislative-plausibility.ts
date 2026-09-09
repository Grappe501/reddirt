import { HILL_VOTE_ACTOR_ID } from "../vote-intelligence/contracts";
import { loadHillLegislativeIntelligence } from "../vote-intelligence/profile";
import { detectIssuesInOpening } from "../vote-intelligence/taxonomy";
import type { AlternativeFutureId } from "./contracts";

export function legislativePlausibilityNotes(
  actorId: string | undefined,
  opening: string,
  futureId: AlternativeFutureId,
  cwd = process.cwd(),
): string[] {
  if (actorId !== HILL_VOTE_ACTOR_ID) return [];
  const { profile } = loadHillLegislativeIntelligence(cwd);
  if (profile.record.voteCount === 0) {
    return [
      "Legislative record not loaded. Do not invent Hill roll calls to score this future.",
      `Future ${futureId} must stay inside writing/personality evidence only.`,
    ];
  }
  const issues = detectIssuesInOpening(opening);
  const notes: string[] = [];
  for (const issue of issues.slice(0, 4)) {
    const row = profile.issueAlignment.find((item) => item.issue === issue);
    if (!row) {
      notes.push(`Issue ${issue} appears in the opening; no loaded votes are tagged ${issue}.`);
      continue;
    }
    const party = row.partyAlignment.rate;
    notes.push(
      `Issue ${issue}: ${row.voteCount} loaded votes; party alignment ${party == null ? "unknown" : `${Math.round(party * 100)}%`} (n=${row.partyAlignment.denominator}).`,
    );
    if (party != null && party < 0.7) {
      notes.push(`Issue ${issue} is a loaded-record departure zone relative to party position. Treat HOSTILE/SURPRISE as more available, not determined.`);
    }
    if (party != null && party >= 0.9) {
      notes.push(`Issue ${issue} is a high party-alignment zone in the loaded record. A large departure needs extra uncertainty.`);
    }
  }
  const recent = profile.temporal.find((slice) => slice.window === "LAST_12_MONTHS");
  const all = profile.temporal.find((slice) => slice.window === "ALL_TIME_AVAILABLE");
  if (recent && all && recent.partyAlignment.rate != null && all.partyAlignment.rate != null) {
    const drift = recent.partyAlignment.rate - all.partyAlignment.rate;
    if (Math.abs(drift) >= 0.05) {
      notes.push(
        `12-month party alignment ${Math.round(recent.partyAlignment.rate * 100)}% vs all-available ${Math.round(all.partyAlignment.rate * 100)}%. Recent evidence is more relevant.`,
      );
    }
  }
  if (futureId === "SILENCE") {
    notes.push("Silence/non-response is allowed even when the record shows frequent floor votes. A vote history does not require a public reply.");
  }
  return notes;
}
