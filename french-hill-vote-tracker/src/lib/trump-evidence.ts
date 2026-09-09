import fs from "node:fs";
import path from "node:path";
import type { LedgerVote } from "./vote-ledger";

export type TrumpEvidenceRecord = {
  congress: number;
  rollCall: number;
  position: "Support" | "Oppose" | "Neutral" | "Ambiguous";
  evidenceStatus: "verified" | "provisional" | "ambiguous" | "rejected";
  summary: string;
  effectiveDate?: string;
  reviewNotes?: string;
  sources: Array<{
    label: string;
    url: string;
    sourceType: "official-trump" | "archive" | "news" | "house" | "other";
    primary?: boolean;
    publishedDate?: string;
  }>;
};

const EVIDENCE_PATH = path.join(process.cwd(), "data", "trump-evidence.json");

export function loadTrumpEvidence(): TrumpEvidenceRecord[] {
  if (!fs.existsSync(EVIDENCE_PATH)) return [];
  try {
    return JSON.parse(fs.readFileSync(EVIDENCE_PATH, "utf8")) as TrumpEvidenceRecord[];
  } catch {
    return [];
  }
}

export function trumpEvidenceKey(record: Pick<TrumpEvidenceRecord, "congress" | "rollCall">) {
  return `${record.congress}-${record.rollCall}`;
}

function hillAlignedWithPosition(hillVote: LedgerVote["hillVote"], position: TrumpEvidenceRecord["position"]): boolean | null {
  if (hillVote !== "Yea" && hillVote !== "Nay") return null;
  if (position === "Support") return hillVote === "Yea";
  if (position === "Oppose") return hillVote === "Nay";
  return null;
}

export function applyTrumpEvidence(vote: LedgerVote, evidence?: TrumpEvidenceRecord): LedgerVote {
  if (!evidence || evidence.evidenceStatus !== "verified") return vote;

  const trumpAligned = hillAlignedWithPosition(vote.hillVote, evidence.position);
  const trumpBreak = trumpAligned === false;
  const mergedSources = [...(vote.sources ?? []), ...evidence.sources.filter((source) => !vote.sources?.some((existing) => existing.url === source.url))];

  return {
    ...vote,
    trumpPosition: evidence.position,
    trumpAligned,
    trumpBreak,
    doubleBreak: Boolean(vote.partyBreak && trumpBreak),
    highlyPartisanTrumpAlignment: Boolean(vote.highPartisanship && trumpAligned),
    highlyPartisanDoubleAlignment: Boolean(vote.highPartisanship && vote.hillAlignedWithGop && trumpAligned),
    trumpEvidenceSummary: evidence.summary,
    trumpEvidenceStatus: evidence.evidenceStatus,
    trumpEvidenceSources: evidence.sources,
    sources: mergedSources,
  };
}
