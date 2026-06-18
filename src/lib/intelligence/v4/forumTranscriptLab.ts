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

export type ForumSpeakerProfile = {
  rhetoricalStyle: string;
  favoritePhrases: string[];
  evasionPatterns: string[];
  weakUnderPressure: string;
  strongestMoments: string;
};

export type ForumVerbatimQuote = {
  speaker: "Hammer" | "Pakko" | "Kelly" | "Moderator" | "Unknown";
  quote: string;
  context: string;
  stageUse: string;
  claimsGate: "verified" | "needs_review" | "do_not_use";
};

export type ForumPredictedBeat = {
  phase: string;
  moderatorQuestion: string;
  hammerLikely: string;
  pakkoLikely: string;
  kellyBest: string;
  kellyAvoid: string;
};

export type ForumDeepAnalysis = {
  generatedAt: string;
  model?: string;
  speakerProfiles: {
    hammer: ForumSpeakerProfile;
    pakko: ForumSpeakerProfile;
    kelly: ForumSpeakerProfile;
  };
  verbatimQuotes: ForumVerbatimQuote[];
  predictedDebateScript: ForumPredictedBeat[];
  crossExamStarters: Array<{ target: string; opener: string; followUp: string }>;
  sevenDayIntegration: Array<{ dayNumber: number; dayTitle: string; useThisIntel: string; drillTonight: string }>;
  mockModeratorBlock: {
    openingQuestion: string;
    followUps: string[];
    closingQuestion: string;
  };
  commandDrills: Array<{ ifTheySay: string; youSay: string; thenScan: string }>;
  newspaperPullQuotes: Array<{ speaker: string; line: string; useCase: string }>;
  executiveBrief: string;
};

export type ForumTranscriptLabRecord = {
  version: 2;
  updatedAt: string;
  title: string;
  eventLabel: string;
  ownedMediaAssetId: string | null;
  /** Repo-relative path to local drop MP4 when file exceeds Prisma INT4 or DB skipped. */
  localVideoRelativePath?: string | null;
  videoSizeBytes?: number | null;
  transcriptText: string;
  transcriptSource: "upload_whisper" | "paste" | "pending" | "youtube_captions" | "youtube_whisper";
  analysis: ForumTranscriptAnalysis | null;
  deepAnalysis: ForumDeepAnalysis | null;
  analysisStatus: "pending" | "ready" | "error";
  deepAnalysisStatus: "pending" | "ready" | "error" | "not_started";
  analysisError: string | null;
  deepAnalysisError: string | null;
};

const EMPTY: ForumTranscriptLabRecord = {
  version: 2,
  updatedAt: new Date(0).toISOString(),
  title: "Three-candidate SOS forum",
  eventLabel: "ACCA / three-way forum — upload when ready",
  ownedMediaAssetId: null,
  transcriptText: "",
  transcriptSource: "pending",
  analysis: null,
  deepAnalysis: null,
  analysisStatus: "pending",
  deepAnalysisStatus: "not_started",
  analysisError: null,
  deepAnalysisError: null,
};

export function loadForumTranscriptLab(): ForumTranscriptLabRecord {
  try {
    if (!existsSync(DATA_PATH)) return { ...EMPTY, updatedAt: new Date().toISOString() };
    const raw = readFileSync(DATA_PATH, "utf8");
    const parsed = JSON.parse(raw) as Partial<ForumTranscriptLabRecord>;
    return {
      ...EMPTY,
      ...parsed,
      version: 2,
      deepAnalysis: parsed.deepAnalysis ?? null,
      deepAnalysisStatus: parsed.deepAnalysisStatus ?? (parsed.deepAnalysis ? "ready" : "not_started"),
      deepAnalysisError: parsed.deepAnalysisError ?? null,
    };
  } catch {
    return { ...EMPTY, updatedAt: new Date().toISOString() };
  }
}

export function saveForumTranscriptLab(record: ForumTranscriptLabRecord): void {
  mkdirSync(path.dirname(DATA_PATH), { recursive: true });
  writeFileSync(DATA_PATH, JSON.stringify({ ...record, updatedAt: new Date().toISOString() }, null, 2), "utf8");
}

export const FORUM_TRANSCRIPT_LAB_DATA_PATH = DATA_PATH;
