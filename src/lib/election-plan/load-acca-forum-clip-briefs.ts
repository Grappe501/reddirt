/**
 * ACCA forum clip briefs — transcript + pull quotes at hand (no video required).
 */
import {
  ACCA_FORUM_RECORDING_SECONDS,
  formatAccaClipTimestamp,
  getAccaForumStudyClip,
  type AccaForumStudyClip,
} from "@/lib/election-plan/acca-forum-study-clips";
import { loadForumTranscriptLab } from "@/lib/intelligence/v4/forumTranscriptLab";

export type AccaForumClipPullQuote = {
  speaker: string;
  quote: string;
  context?: string;
  claimsGate?: "verified" | "needs_review" | "do_not_use";
};

export type AccaForumClipBrief = {
  clipId: string;
  label: string;
  opponent: AccaForumStudyClip["opponent"];
  timestampLabel: string;
  narrativeLead: string;
  tellsToTrack: string;
  kellyPivotHint: string;
  claimsNote?: string;
  transcriptExcerpt: string;
  pullQuotes: AccaForumClipPullQuote[];
  filmTellIds?: string[];
};

function snapWordBoundary(text: string, index: number, direction: "start" | "end"): number {
  if (direction === "start") {
    const space = text.lastIndexOf(" ", Math.max(0, index - 80));
    return space >= 0 ? space + 1 : index;
  }
  const space = text.indexOf(" ", Math.min(text.length, index + 80));
  return space >= 0 ? space : text.length;
}

export function excerptForumTranscriptByTime(
  transcript: string,
  startSeconds: number,
  durationSeconds: number,
  recordingSeconds: number = ACCA_FORUM_RECORDING_SECONDS,
): string {
  const text = transcript.trim();
  if (!text) return "";
  const len = text.length;
  const startChar = snapWordBoundary(
    text,
    Math.floor((startSeconds / recordingSeconds) * len),
    "start",
  );
  const endChar = snapWordBoundary(
    text,
    Math.floor(((startSeconds + durationSeconds) / recordingSeconds) * len),
    "end",
  );
  const excerpt = text.slice(startChar, endChar).trim();
  if (excerpt.length <= 900) return excerpt;
  return `${excerpt.slice(0, 897).trim()}…`;
}

function pullQuotesForClip(
  clip: AccaForumStudyClip,
  excerpt: string,
  transcript: string,
): AccaForumClipPullQuote[] {
  const lab = loadForumTranscriptLab();
  const quotes = lab.deepAnalysis?.verbatimQuotes ?? [];
  const excerptLower = excerpt.toLowerCase();
  const matched = quotes
    .filter((q) => q.speaker === clip.opponent || (clip.opponent === "Kelly" && q.speaker === "Kelly"))
    .filter((q) => {
      const needle = q.quote.slice(0, 40).toLowerCase();
      return excerptLower.includes(needle) || transcript.toLowerCase().includes(needle.slice(0, 24));
    })
    .slice(0, 3)
    .map((q) => ({
      speaker: q.speaker,
      quote: q.quote,
      context: q.context,
      claimsGate: q.claimsGate,
    }));

  if (matched.length > 0) return matched;

  const newspaper = lab.deepAnalysis?.newspaperPullQuotes ?? [];
  return newspaper
    .filter((q) => q.speaker === clip.opponent || (clip.opponent === "Kelly" && q.speaker === "Kelly"))
    .slice(0, 2)
    .map((q) => ({ speaker: q.speaker, quote: q.line, context: q.useCase }));
}

function buildBrief(clip: AccaForumStudyClip, transcript: string): AccaForumClipBrief {
  const excerpt = excerptForumTranscriptByTime(transcript, clip.startSeconds, clip.durationSeconds);
  return {
    clipId: clip.id,
    label: clip.label,
    opponent: clip.opponent,
    timestampLabel: formatAccaClipTimestamp(clip.startSeconds),
    narrativeLead: clip.narrativeLead ?? clip.watchFor,
    tellsToTrack: clip.tellsToTrack ?? clip.watchFor,
    kellyPivotHint: clip.kellyPivotHint,
    claimsNote: clip.claimsNote,
    transcriptExcerpt: excerpt || "Transcript excerpt loading — open forum transcript lab for full ACCA forum text.",
    pullQuotes: pullQuotesForClip(clip, excerpt, transcript),
    filmTellIds: clip.filmTellIds,
  };
}

export function buildAccaClipBriefs(clipIds: readonly string[]): AccaForumClipBrief[] {
  const lab = loadForumTranscriptLab();
  const transcript = lab.transcriptText ?? "";
  return clipIds
    .map((id) => getAccaForumStudyClip(id))
    .filter((c): c is AccaForumStudyClip => Boolean(c))
    .map((clip) => buildBrief(clip, transcript));
}

export function forumTranscriptReady(): boolean {
  const lab = loadForumTranscriptLab();
  return Boolean(lab.transcriptText && lab.transcriptText.length > 500);
}
