/**
 * Forum transcript lab — persist analysis artifacts (internal only).
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import path from "node:path";

const DATA_PATH = path.join(process.cwd(), "data/intelligence/forum-transcript-lab.json");

export type ForumTranscriptAnalysis = {
  generatedAt: string;
  model?: string;
  hammerThemes: string[];
  pakkoThemes: string[];
  kellyOpportunities: string[];
  predictedDebateQuestions: string[];
  capitalizeMoves: Array<{ trigger: string; kellyLine: string; why: string }>;
  watchForTells: string[];
  newspaperAngles: string[];
  claimsGateNotes: string[];
  summary: string;
};

export type ForumTranscriptLabRecord = {
  version: 1;
  updatedAt: string;
  title: string;
  eventLabel: string;
  ownedMediaAssetId: string | null;
  transcriptText: string;
  transcriptSource: "upload_whisper" | "paste" | "pending";
  analysis: ForumTranscriptAnalysis | null;
  analysisStatus: "pending" | "ready" | "error";
  analysisError: string | null;
};

const EMPTY: ForumTranscriptLabRecord = {
  version: 1,
  updatedAt: new Date(0).toISOString(),
  title: "Three-candidate SOS forum",
  eventLabel: "ACCA / three-way forum — upload when ready",
  ownedMediaAssetId: null,
  transcriptText: "",
  transcriptSource: "pending",
  analysis: null,
  analysisStatus: "pending",
  analysisError: null,
};

export function loadForumTranscriptLab(): ForumTranscriptLabRecord {
  try {
    if (!existsSync(DATA_PATH)) return { ...EMPTY, updatedAt: new Date().toISOString() };
    const raw = readFileSync(DATA_PATH, "utf8");
    const parsed = JSON.parse(raw) as ForumTranscriptLabRecord;
    return { ...EMPTY, ...parsed };
  } catch {
    return { ...EMPTY, updatedAt: new Date().toISOString() };
  }
}

export function saveForumTranscriptLab(record: ForumTranscriptLabRecord): void {
  mkdirSync(path.dirname(DATA_PATH), { recursive: true });
  writeFileSync(DATA_PATH, JSON.stringify({ ...record, updatedAt: new Date().toISOString() }, null, 2), "utf8");
}

export const FORUM_TRANSCRIPT_LAB_DATA_PATH = DATA_PATH;
