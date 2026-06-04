import type { DebateFilmRoomState } from "@/lib/opposition/debateFilmRoomTypes";
import type { ComputedReadinessScore } from "@/lib/opposition/debateReadinessSignals";

/** Client-safe P4 war room packet types — no node:fs. */

export type CrossExamRow = {
  id: string;
  question: string;
  billAnchor: string | null;
  whenToAsk: string;
  whatYouLearn: string;
  kellyPivot: string;
  socialPostAngle: string;
  risk: "LOW" | "MEDIUM" | "HIGH";
};

export type ArgumentLibraryRow = {
  id: string;
  hammerLine: string;
  evidenceHeMayCite: string[];
  agreeWhereValid: string;
  contrastPivot: string;
  kellyBridge: string;
  billDrillHref: string | null;
  debateStep: string;
  socialSnippet: string;
};

export type DebateWarRoomP4Packet = {
  version: "4.0-p4";
  generatedAt: string;
  filmRoom: DebateFilmRoomState;
  crossExamBank: CrossExamRow[];
  argumentLibrary: ArgumentLibraryRow[];
  readinessScores: ComputedReadinessScore[];
  todayPriorities: Array<{ title: string; value: string; detail: string }>;
  scenarioTraps: string[];
  whatNotToSay: string[];
  archiveHonesty: string;
  legislativeNote: string;
};
