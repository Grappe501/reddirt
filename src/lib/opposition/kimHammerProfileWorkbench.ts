import fs from "node:fs";
import path from "node:path";

function readJson<T>(relPath: string): T {
  return JSON.parse(fs.readFileSync(path.join(process.cwd(), relPath), "utf8")) as T;
}

type EvidenceStatus =
  | "VERIFIED_FACT"
  | "REPORTED_CLAIM"
  | "INTERPRETATION"
  | "RESEARCH_QUESTION"
  | "NEEDS_REVIEW";

export type KimHammerBiographyFile = {
  generatedAt: string;
  subject: string;
  records: Array<{
    field: string;
    value: string;
    evidenceStatus: EvidenceStatus;
    sourceConfidence: "LOW" | "MEDIUM" | "HIGH";
    sources: string[];
  }>;
  openGaps: string[];
};

export type KimHammerElectoralHistoryFile = {
  generatedAt: string;
  rows: Array<{
    year: number;
    office: string;
    district: string;
    stage: string;
    opponents: string[];
    votes: unknown;
    percentages: unknown;
    result: string;
    marginVotes: unknown;
    source: string;
    confidence: "LOW" | "MEDIUM" | "HIGH";
    evidenceStatus: EvidenceStatus;
  }>;
  openGaps: string[];
};

export type KimHammerPublicTimelineFile = {
  generatedAt: string;
  events: Array<{
    year: number;
    label: string;
    description: string;
    evidenceStatus: EvidenceStatus;
    sources: string[];
    confidence: "LOW" | "MEDIUM" | "HIGH";
  }>;
};

export type KimHammerMediaFootprintFile = {
  generatedAt: string;
  channels: Array<{
    type: string;
    label: string;
    url: string;
    sourceConfidence: "LOW" | "MEDIUM" | "HIGH";
    evidenceStatus: EvidenceStatus;
  }>;
  counts: Record<string, number>;
  openGaps: string[];
};

export type KimHammerPublicControversiesFile = {
  generatedAt: string;
  items: Array<{
    id: string;
    title: string;
    summary: string;
    supporterOrSubjectExplanation: string;
    evidenceStatus: EvidenceStatus;
    confidence: "LOW" | "MEDIUM" | "HIGH";
    sources: string[];
  }>;
  safetyNotes: string[];
};

export function loadKimHammerProfileWorkbench() {
  const biography = readJson<KimHammerBiographyFile>(
    "data/opposition/kim-hammer-profile/kim-hammer-biography.json",
  );
  const electoralHistory = readJson<KimHammerElectoralHistoryFile>(
    "data/opposition/kim-hammer-profile/kim-hammer-electoral-history.json",
  );
  const publicTimeline = readJson<KimHammerPublicTimelineFile>(
    "data/opposition/kim-hammer-profile/kim-hammer-public-timeline.json",
  );
  const mediaFootprint = readJson<KimHammerMediaFootprintFile>(
    "data/opposition/kim-hammer-profile/kim-hammer-media-footprint.json",
  );
  const publicControversies = readJson<KimHammerPublicControversiesFile>(
    "data/opposition/kim-hammer-profile/kim-hammer-public-controversies.json",
  );
  const profileHighlights = [
    `Public officeholder area: ${
      biography.records.find((r) => r.field === "publicResidenceArea")?.value ?? "MISSING"
    }`,
    `Occupation/ministry profile: ${
      biography.records.find((r) => r.field === "occupation")?.value ?? "MISSING"
    }`,
    `Office history rows: ${electoralHistory.rows.length}`,
    `Media channels indexed: ${mediaFootprint.channels.length}`,
    `Public controversy records: ${publicControversies.items.length}`,
  ];

  return {
    biography,
    electoralHistory,
    publicTimeline,
    mediaFootprint,
    publicControversies,
    profileHighlights,
  };
}

