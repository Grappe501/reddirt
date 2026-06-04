/** Client-safe debate film room types — no node:fs. */

export type FilmRoomItem = {
  id: string;
  title: string;
  dateOrSource: string;
  topic: string;
  opponentClaimOrAngle: string;
  vulnerability: string;
  recommendedCounter: string;
  confidence: "LOW" | "MEDIUM" | "HIGH";
  researchGaps: string[];
  drillPrompt: string;
  assetType: string;
  url: string | null;
  isDirectOpponentClip: boolean;
  governanceLabel: "INTERNAL_DRAFT" | "REFERENCE_ONLY";
  legislativeChunkId?: string;
  timestampRange?: string;
  speakerAttributionStatus?: string;
  needsVerification?: boolean;
};

export type DebateFilmRoomState = {
  generatedAt: string;
  directClipCount: number;
  referenceClipCount: number;
  legislativeClipCount: number;
  items: FilmRoomItem[];
  coverageGaps: string[];
  archiveHonestyNote: string;
  topHammerCommitteeQuotes: string[];
  billsWithTranscriptCoverage: string[];
  speakerVerificationWarnings: string[];
};
