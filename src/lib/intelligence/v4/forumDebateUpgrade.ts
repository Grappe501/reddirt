/**
 * Forum-derived debate prep upgrade — built from forum-transcript-lab.json via
 * `npm run forum:build-debate-upgrade`.
 */
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const DATA_PATH = path.join(process.cwd(), "data/intelligence/forum-debate-upgrade-v1.json");

export type ForumDebateUpgradeRecord = {
  version: 1;
  builtAt: string;
  sourceUpdatedAt: string;
  transcriptChars: number;
  executiveBrief: string;
  capitalizeMoves: Array<{ trigger: string; kellyLine: string; why: string }>;
  commandDrills: Array<{ ifTheySay: string; youSay: string; thenScan: string }>;
  hammerThemes: string[];
  pakkoThemes: string[];
  predictedQuestions: string[];
  watchForTells: string[];
  claimsGateNotes: string[];
  techniquePatches: Array<{ topicId: string; addendum: string }>;
};

const EMPTY: ForumDebateUpgradeRecord = {
  version: 1,
  builtAt: new Date(0).toISOString(),
  sourceUpdatedAt: new Date(0).toISOString(),
  transcriptChars: 0,
  executiveBrief: "",
  capitalizeMoves: [],
  commandDrills: [],
  hammerThemes: [],
  pakkoThemes: [],
  predictedQuestions: [],
  watchForTells: [],
  claimsGateNotes: [],
  techniquePatches: [],
};

export function loadForumDebateUpgrade(): ForumDebateUpgradeRecord {
  try {
    if (!existsSync(DATA_PATH)) return EMPTY;
    return { ...EMPTY, ...JSON.parse(readFileSync(DATA_PATH, "utf8")) };
  } catch {
    return EMPTY;
  }
}

export function isForumDebateUpgradeReady(): boolean {
  const u = loadForumDebateUpgrade();
  return u.capitalizeMoves.length > 0 || u.commandDrills.length > 0;
}

export const FORUM_DEBATE_UPGRADE_DATA_PATH = DATA_PATH;
