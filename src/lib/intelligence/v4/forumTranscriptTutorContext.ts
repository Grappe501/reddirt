/**
 * Compact forum intel payload for tutor AI coach/critique calls.
 */
import { loadForumTranscriptIntel } from "@/lib/intelligence/v4/forumTranscriptIntel";

export type ForumTutorContextPayload = {
  ready: boolean;
  executiveBrief: string;
  hammerThemes: string[];
  pakkoThemes: string[];
  watchForTells: string[];
  predictedQuestions: string[];
  capitalizeMovesSample: Array<{ trigger: string; kellyLine: string }>;
  claimsGateNotes: string[];
};

export function buildForumTutorContextPayload(): ForumTutorContextPayload {
  const intel = loadForumTranscriptIntel();
  return {
    ready: intel.ready,
    executiveBrief: intel.executiveBrief.slice(0, 600),
    hammerThemes: intel.hammerThemes.slice(0, 6),
    pakkoThemes: intel.pakkoThemes.slice(0, 6),
    watchForTells: intel.watchForTells.slice(0, 5),
    predictedQuestions: intel.predictedQuestions.slice(0, 6),
    capitalizeMovesSample: intel.capitalizeMoves.slice(0, 5).map((m) => ({
      trigger: m.trigger,
      kellyLine: m.kellyLine,
    })),
    claimsGateNotes: intel.claimsGateNotes.slice(0, 5),
  };
}

export function forumTutorCoachOpeningAddon(): string | null {
  const intel = loadForumTranscriptIntel();
  if (!intel.ready) return null;
  return `ACCA forum intel is loaded (${intel.transcriptChars.toLocaleString()} chars). Hammer themes and capitalize moves from the Mountain View panel are in your cards — use them, do not invent new quotes.`;
}
