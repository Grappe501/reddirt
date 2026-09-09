import fs from "node:fs";
import path from "node:path";

export type LedgerVote = {
  congress: number;
  rollCall: number;
  date: string;
  measure: string;
  question?: string;
  hillVote: string;
  republicanYea: number;
  republicanNay: number;
  democratYea: number;
  democratNay: number;
  partyBreak: boolean;
  hillAlignedWithGop: boolean | null;
  highPartisanship: boolean;
  partisanshipScore: number | null;
  trumpPosition: string;
  trumpAligned: boolean | null;
  trumpBreak: boolean;
  doubleBreak: boolean;
  highlyPartisanGopAlignment: boolean;
  highlyPartisanTrumpAlignment: boolean;
  highlyPartisanDoubleAlignment: boolean;
  sources: Array<{ label: string; url: string; sourceType: string; primary?: boolean }>;
};

const GENERATED = path.join(process.cwd(), "data", "generated");

export function loadVotes(): LedgerVote[] {
  if (!fs.existsSync(GENERATED)) return [];
  const files = fs.readdirSync(GENERATED).filter((name) => /^hill-votes-\d{4}\.json$/.test(name));
  return files.flatMap((file) => {
    try {
      return JSON.parse(fs.readFileSync(path.join(GENERATED, file), "utf8")) as LedgerVote[];
    } catch {
      return [];
    }
  }).sort((a, b) => b.date.localeCompare(a.date) || b.rollCall - a.rollCall);
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
