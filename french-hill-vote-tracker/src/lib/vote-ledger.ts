import fs from "node:fs";
import path from "node:path";
import { applyTrumpEvidence, loadTrumpEvidence, trumpEvidenceKey } from "./trump-evidence";
import type { VoteRecord } from "./vote-record";

export type LedgerVote = VoteRecord;

const GENERATED = path.join(process.cwd(), "data", "generated");

export function loadVotes(): LedgerVote[] {
  if (!fs.existsSync(GENERATED)) return [];
  const files = fs.readdirSync(GENERATED).filter((name) => /^hill-votes-\d{4}\.json$/.test(name));
  const evidence = new Map(loadTrumpEvidence().map((record) => [trumpEvidenceKey(record), record]));

  return files.flatMap((file) => {
    try {
      return JSON.parse(fs.readFileSync(path.join(GENERATED, file), "utf8")) as LedgerVote[];
    } catch {
      return [];
    }
  }).map((vote) => applyTrumpEvidence(vote, evidence.get(voteKey(vote))))
    .sort((a, b) => b.date.localeCompare(a.date) || b.rollCall - a.rollCall);
}

export function summarizeVotes(votes: LedgerVote[]) {
  return {
    total: votes.length,
    partyBreaks: votes.filter((v) => v.partyBreak).length,
    highlyPartisanGopAlignments: votes.filter((v) => v.highlyPartisanGopAlignment).length,
    trumpBreaks: votes.filter((v) => v.trumpBreak).length,
    trumpAlignments: votes.filter((v) => v.trumpAligned === true).length,
    doubleBreaks: votes.filter((v) => v.doubleBreak).length,
  };
}

export function voteKey(vote: Pick<LedgerVote, "congress" | "rollCall">) {
  return `${vote.congress}-${vote.rollCall}`;
}
