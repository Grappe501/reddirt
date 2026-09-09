import fs from "node:fs";
import path from "node:path";
import type { LedgerVote } from "./vote-ledger";

export type TrumpEvidenceRecord = {
  congress: number;
  rollCall: number;
  position: "Support" | "Oppose" | "Neutral" | "Ambiguous";
  preferredVote?: "Yea" | "Nay" | null;
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

const DATA_DIR = path.join(process.cwd(), "data");
const EVIDENCE_PATH = path.join(DATA_DIR, "trump-evidence.json");
const BATCH_DIR = path.join(DATA_DIR, "trump-evidence-batches");

function readEvidenceFile(filePath: string): TrumpEvidenceRecord[] {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8")) as TrumpEvidenceRecord[];
  } catch {
    return [];
  }
}

export function loadTrumpEvidence(): TrumpEvidenceRecord[] {
  const records: TrumpEvidenceRecord[] = fs.existsSync(EVIDENCE_PATH) ? readEvidenceFile(EVIDENCE_PATH) : [];
  if (fs.existsSync(BATCH_DIR)) {
    const batchFiles = fs.readdirSync(BATCH_DIR).filter((name) => name.endsWith(".json")).sort();
    for (const file of batchFiles) records.push(...readEvidenceFile(path.join(BATCH_DIR, file)));
  }
  return records;
}

export function trumpEvidenceKey(record: Pick<TrumpEvidenceRecord, "congress" | "rollCall">) {
  return `${record.congress}-${record.rollCall}`;
}

function legacyPreferredVote(position: TrumpEvidenceRecord["position"]): "Yea" | "Nay" | null {
  if (position === "Support") return "Yea";
  if (position === "Oppose") return "Nay";
  return null;
}

function hillAlignedWithPosition(hillVote: LedgerVote["hillVote"], evidence: TrumpEvidenceRecord): boolean | null {
  if (hillVote !== "Yea" && hillVote !== "Nay") return null;
  const preferredVote = evidence.preferredVote ?? legacyPreferredVote(evidence.position);
  if (!preferredVote) return null;
  return hillVote === preferredVote;
}

export function applyTrumpEvidence(vote: LedgerVote, evidence?: TrumpEvidenceRecord): LedgerVote {
  if (!evidence || evidence.evidenceStatus !== "verified") return vote;

  const trumpAligned = hillAlignedWithPosition(vote.hillVote, evidence);
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
