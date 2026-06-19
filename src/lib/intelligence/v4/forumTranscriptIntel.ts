/**
 * Unified forum transcript intelligence for debate prep surfaces.
 * Merges forum-transcript-lab.json + forum-debate-upgrade-v1.json.
 */
import {
  loadForumDebateUpgrade,
  type ForumDebateUpgradeRecord,
} from "@/lib/intelligence/v4/forumDebateUpgrade";
import {
  loadForumTranscriptLab,
  type ForumDeepAnalysis,
  type ForumTranscriptLabRecord,
} from "@/lib/intelligence/v4/forumTranscriptLab";

/** Map upgrade patch topicIds to techniques library topicIds. */
const TECHNIQUE_PATCH_ALIASES: Record<string, string> = {
  "three-way-pivot": "three-way",
  "split-the-table": "three-way",
  "capitalize-moves": "hammer-attacks",
};

export type ForumTranscriptIntelSlice = {
  ready: boolean;
  transcriptReady: boolean;
  analysisReady: boolean;
  deepAnalysisReady: boolean;
  transcriptChars: number;
  transcriptSource: ForumTranscriptLabRecord["transcriptSource"];
  executiveBrief: string;
  capitalizeMoves: ForumDebateUpgradeRecord["capitalizeMoves"];
  commandDrills: ForumDebateUpgradeRecord["commandDrills"];
  hammerThemes: string[];
  pakkoThemes: string[];
  predictedQuestions: string[];
  watchForTells: string[];
  claimsGateNotes: string[];
  verbatimQuotes: ForumDeepAnalysis["verbatimQuotes"];
  predictedDebateBeats: ForumDeepAnalysis["predictedDebateScript"];
  mockModeratorBlock: ForumDeepAnalysis["mockModeratorBlock"] | null;
  sevenDayIntegration: ForumDeepAnalysis["sevenDayIntegration"];
  /** Surfaces where forum intel is actively merged into prep content. */
  wiredSurfaces: string[];
};

const WIRED_SURFACES_WHEN_READY = [
  "Forum transcript lab",
  "Debate prep hub intel panel",
  "Command course Days 4–8 (seven-day integration map)",
  "Day 5 command drills (capitalize moves + deep drills)",
  "Day 5 mock moderator block",
  "Techniques library (forum upgrade banner + topic addenda)",
  "Trap lanes index (Hammer tells from forum)",
  "AI tutor (forum-acca cards + coach/critique context)",
  "Rehearsal engine (forum-acca-tonight queue + enriched run-of-show)",
  "Command home tonight focus (when analysis ready)",
] as const;

export function loadForumTranscriptIntel(): ForumTranscriptIntelSlice {
  const lab = loadForumTranscriptLab();
  const upgrade = loadForumDebateUpgrade();
  const deep = lab.deepAnalysis;

  const transcriptReady = lab.transcriptText.length >= 50;
  const analysisReady = lab.analysisStatus === "ready" && Boolean(lab.analysis);
  const deepAnalysisReady = lab.deepAnalysisStatus === "ready" && Boolean(deep);
  const ready = analysisReady || deepAnalysisReady || upgrade.capitalizeMoves.length > 0;

  return {
    ready,
    transcriptReady,
    analysisReady,
    deepAnalysisReady,
    transcriptChars: lab.transcriptText.length || upgrade.transcriptChars,
    transcriptSource: lab.transcriptSource,
    executiveBrief: upgrade.executiveBrief || deep?.executiveBrief || lab.analysis?.summary || "",
    capitalizeMoves: upgrade.capitalizeMoves.length
      ? upgrade.capitalizeMoves
      : (lab.analysis?.capitalizeMoves ?? []),
    commandDrills: upgrade.commandDrills.length
      ? upgrade.commandDrills
      : (deep?.commandDrills ?? []),
    hammerThemes: upgrade.hammerThemes.length
      ? upgrade.hammerThemes
      : (lab.analysis?.hammerThemes ?? []),
    pakkoThemes: upgrade.pakkoThemes.length
      ? upgrade.pakkoThemes
      : (lab.analysis?.pakkoThemes ?? []),
    predictedQuestions: upgrade.predictedQuestions.length
      ? upgrade.predictedQuestions
      : (lab.analysis?.predictedDebateQuestions ?? []),
    watchForTells: upgrade.watchForTells.length
      ? upgrade.watchForTells
      : (lab.analysis?.watchForTells ?? []),
    claimsGateNotes: upgrade.claimsGateNotes.length
      ? upgrade.claimsGateNotes
      : (lab.analysis?.claimsGateNotes ?? []),
    verbatimQuotes: deep?.verbatimQuotes ?? [],
    predictedDebateBeats: deep?.predictedDebateScript ?? [],
    mockModeratorBlock: deep?.mockModeratorBlock ?? null,
    sevenDayIntegration: deep?.sevenDayIntegration ?? [],
    wiredSurfaces: ready ? [...WIRED_SURFACES_WHEN_READY] : ["Forum transcript lab (awaiting ingest)"],
  };
}

export function getForumTechniquePatch(topicId: string): string | null {
  const upgrade = loadForumDebateUpgrade();
  const intel = loadForumTranscriptIntel();
  if (!intel.ready) return null;

  const direct = upgrade.techniquePatches.find((p) => p.topicId === topicId);
  if (direct) return direct.addendum;

  for (const patch of upgrade.techniquePatches) {
    const alias = TECHNIQUE_PATCH_ALIASES[patch.topicId];
    if (alias === topicId) return patch.addendum;
  }

  if (topicId === "hammer-attacks" && intel.hammerThemes.length) {
    return `ACCA forum Hammer tells: ${intel.hammerThemes.slice(0, 5).join(" · ")}`;
  }
  if (topicId === "three-way" && (intel.hammerThemes.length || intel.pakkoThemes.length)) {
    const parts = [
      intel.hammerThemes.length ? `Hammer: ${intel.hammerThemes.slice(0, 3).join(" · ")}` : "",
      intel.pakkoThemes.length ? `Pakko: ${intel.pakkoThemes.slice(0, 3).join(" · ")}` : "",
    ].filter(Boolean);
    return parts.length ? `ACCA forum three-way dynamics — ${parts.join(" | ")}` : null;
  }

  return null;
}

export function getForumIntegrationForDay(dayNumber: number) {
  return loadForumTranscriptIntel().sevenDayIntegration.find((d) => d.dayNumber === dayNumber) ?? null;
}
