/**
 * Day 4 Pass 4 — Kelly-facing forum pipeline surface (claims-gated, no staff clutter).
 */
import { FORUM_CAPITALIZE_MOVE_LESSONS } from "@/lib/election-plan/forumLabCapitalizeMovesLessonBank";
import { getOpponentBio } from "@/lib/election-plan/opponentBioDrillDown";
import { epForumLabCapitalizeMoveHref } from "@/lib/election-plan/debate-prep-links";
import { loadForumTranscriptIntel } from "@/lib/intelligence/v4/forumTranscriptIntel";
import {
  loadForumTranscriptLab,
  type ForumTranscriptLabRecord,
  type ForumVerbatimQuote,
} from "@/lib/intelligence/v4/forumTranscriptLab";
import { listSosDebateQuestionsByCategory } from "@/lib/intelligence/v4/sosDebateQuestionBank";

export type Day4ClaimsStatus = "green" | "needs_review" | "do_not_use" | "pending";

export type Day4NotecardLine = {
  slotIndex: number;
  trigger: string;
  kellyLine: string;
  why: string;
  sourceLabel: string;
  timestamp: string;
  claimsStatus: "green";
  lessonHref?: string;
};

export type Day4VerifiedQuoteLine = {
  id: string;
  speaker: ForumVerbatimQuote["speaker"];
  quote: string;
  context: string;
  sourceLabel: string;
  timestamp: string;
  claimsStatus: "verified";
};

export type Day4PipelineStatus = {
  artifactReady: boolean;
  artifactLabel: string;
  v1Ready: boolean;
  v1Timestamp: string | null;
  v2Ready: boolean;
  v2Timestamp: string | null;
  verifiedCapitalizeCount: number;
  targetCapitalizeCount: number;
  staffPendingQuoteCount: number;
  transcriptSource: string;
  eventLabel: string;
};

export type Day4SosMappingRow = {
  rowIndex: number;
  forumTopic: string;
  suggestedQuestionId: string;
  suggestedQuestionTitle: string;
  suggestedQuestionHref: string;
  hammerLineSuggestion: string | null;
  hammerLineClaimsStatus: Day4ClaimsStatus;
  hammerLineSource: string | null;
  hammerLineTimestamp: string | null;
};

export type Day4BioRereadRow = {
  opponentId: "kim-hammer" | "michael-packo";
  displayName: string;
  forecastSections: Array<{ heading: string; body: string }>;
  verifiedForumLines: Day4VerifiedQuoteLine[];
  patternPhrases: string[];
};

export type Day4ForumPipelineSurface = {
  pipeline: Day4PipelineStatus;
  notecardLines: Day4NotecardLine[];
  verifiedHammerLines: Day4VerifiedQuoteLine[];
  sosMappingRows: Day4SosMappingRow[];
  bioRows: Day4BioRereadRow[];
  internalIntelQuoteCount: number;
};

const TARGET_CAPITALIZE = 5;
const SOURCE_LABEL = "ACCA forum transcript lab";
const ROW_COUNT = 5;

function normalizeText(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
}

function tokenSet(value: string): Set<string> {
  return new Set(
    normalizeText(value)
      .split(" ")
      .filter((t) => t.length > 3),
  );
}

function overlapScore(a: string, b: string): number {
  const ta = tokenSet(a);
  const tb = tokenSet(b);
  if (ta.size === 0 || tb.size === 0) return 0;
  let hits = 0;
  for (const t of ta) {
    if (tb.has(t)) hits += 1;
  }
  return hits;
}

function matchCapitalizeLesson(trigger: string) {
  const norm = normalizeText(trigger);
  return FORUM_CAPITALIZE_MOVE_LESSONS.find((lesson) => {
    const lt = normalizeText(lesson.trigger);
    return norm.includes(lt.slice(0, 24)) || lt.includes(norm.slice(0, 24));
  });
}

function analysisTimestamp(lab: ForumTranscriptLabRecord): string | null {
  return lab.analysis?.generatedAt ?? lab.deepAnalysis?.generatedAt ?? lab.updatedAt ?? null;
}

function deepTimestamp(lab: ForumTranscriptLabRecord): string | null {
  return lab.deepAnalysis?.generatedAt ?? null;
}

function toVerifiedQuote(
  quote: ForumVerbatimQuote,
  index: number,
  timestamp: string,
): Day4VerifiedQuoteLine | null {
  if (quote.claimsGate !== "verified") return null;
  return {
    id: `vq-${index}-${quote.speaker.toLowerCase()}`,
    speaker: quote.speaker,
    quote: quote.quote,
    context: quote.context,
    sourceLabel: SOURCE_LABEL,
    timestamp,
    claimsStatus: "verified",
  };
}

function buildNotecardLines(lab: ForumTranscriptLabRecord): Day4NotecardLine[] {
  const intel = loadForumTranscriptIntel();
  const ts = analysisTimestamp(lab);
  if (!ts || !intel.analysisReady) return [];

  const moves = intel.capitalizeMoves.slice(0, TARGET_CAPITALIZE);
  return moves.map((move, idx) => {
    const lesson = matchCapitalizeLesson(move.trigger);
    return {
      slotIndex: idx + 1,
      trigger: move.trigger,
      kellyLine: move.kellyLine,
      why: move.why,
      sourceLabel: intel.analysisReady ? "Forum lab v1 analysis" : "Forum debate upgrade",
      timestamp: ts,
      claimsStatus: "green" as const,
      lessonHref: lesson ? epForumLabCapitalizeMoveHref(lesson.id) : undefined,
    };
  });
}

function bestSosQuestion(forumTopic: string): { questionId: string; title: string } | null {
  const categories = listSosDebateQuestionsByCategory();
  let best: { questionId: string; title: string; score: number } | null = null;
  for (const cat of categories) {
    for (const q of cat.questions) {
      const score = overlapScore(forumTopic, q.title);
      if (!best || score > best.score) {
        best = { questionId: q.questionId, title: q.title, score };
      }
    }
  }
  if (!best || best.score < 1) return null;
  return { questionId: best.questionId, title: best.title };
}

function bestVerifiedHammerLine(topic: string, verified: Day4VerifiedQuoteLine[]): Day4VerifiedQuoteLine | null {
  let best: { line: Day4VerifiedQuoteLine; score: number } | null = null;
  for (const line of verified.filter((l) => l.speaker === "Hammer")) {
    const score = Math.max(overlapScore(topic, line.quote), overlapScore(topic, line.context));
    if (!best || score > best.score) {
      best = { line, score };
    }
  }
  return best && best.score >= 1 ? best.line : null;
}

function buildSosRows(
  forumTopics: string[],
  verified: Day4VerifiedQuoteLine[],
): Day4SosMappingRow[] {
  const topics = forumTopics.slice(0, ROW_COUNT);
  while (topics.length < ROW_COUNT) {
    topics.push("");
  }

  return topics.map((forumTopic, rowIndex) => {
    const match = forumTopic ? bestSosQuestion(forumTopic) : null;
    const hammer = forumTopic ? bestVerifiedHammerLine(forumTopic, verified) : null;
    return {
      rowIndex: rowIndex + 1,
      forumTopic,
      suggestedQuestionId: match?.questionId ?? "",
      suggestedQuestionTitle: match?.title ?? "",
      suggestedQuestionHref: match ? `/election-plan/debate-prep/questions/${match.questionId}` : "",
      hammerLineSuggestion: hammer?.quote ?? null,
      hammerLineClaimsStatus: hammer ? "green" : forumTopic ? "pending" : "pending",
      hammerLineSource: hammer?.sourceLabel ?? null,
      hammerLineTimestamp: hammer?.timestamp ?? null,
    };
  });
}

function buildBioRows(
  verified: Day4VerifiedQuoteLine[],
  lab: ForumTranscriptLabRecord,
): Day4BioRereadRow[] {
  const deep = lab.deepAnalysis;
  const ts = deepTimestamp(lab) ?? analysisTimestamp(lab) ?? lab.updatedAt;

  return (["kim-hammer", "michael-packo"] as const).map((opponentId) => {
    const bio = getOpponentBio(opponentId)!;
    const speakerKey = opponentId === "kim-hammer" ? "Hammer" : "Pakko";
    const profile = deep?.speakerProfiles[opponentId === "kim-hammer" ? "hammer" : "pakko"];
    const lines = verified.filter((q) => q.speaker === speakerKey);
    return {
      opponentId,
      displayName: bio.displayName,
      forecastSections: bio.forecast.slice(0, 3),
      verifiedForumLines: lines.slice(0, 4),
      patternPhrases: profile?.favoritePhrases ?? [],
    };
  });
}

export function buildDay4ForumPipelineSurface(): Day4ForumPipelineSurface {
  const lab = loadForumTranscriptLab();
  const intel = loadForumTranscriptIntel();
  const ts = analysisTimestamp(lab);
  const deepTs = deepTimestamp(lab);

  const verifiedQuotes = (lab.deepAnalysis?.verbatimQuotes ?? [])
    .map((q, i) => toVerifiedQuote(q, i, deepTs ?? ts ?? lab.updatedAt))
    .filter((q): q is Day4VerifiedQuoteLine => Boolean(q));

  const notecardLines = buildNotecardLines(lab);
  const internalIntelQuoteCount = (lab.deepAnalysis?.verbatimQuotes ?? []).filter(
    (q) => q.claimsGate !== "verified",
  ).length;

  const forumTopics =
    intel.predictedQuestions.length > 0
      ? intel.predictedQuestions
      : [...intel.hammerThemes.slice(0, 3), ...intel.pakkoThemes.slice(0, 2)];

  return {
    pipeline: {
      artifactReady: intel.transcriptReady,
      artifactLabel: lab.eventLabel || lab.title,
      v1Ready: intel.analysisReady,
      v1Timestamp: lab.analysis?.generatedAt ?? null,
      v2Ready: intel.deepAnalysisReady,
      v2Timestamp: deepTs,
      verifiedCapitalizeCount: notecardLines.length,
      targetCapitalizeCount: TARGET_CAPITALIZE,
      staffPendingQuoteCount: internalIntelQuoteCount,
      transcriptSource: lab.transcriptSource,
      eventLabel: lab.eventLabel,
    },
    notecardLines,
    verifiedHammerLines: verifiedQuotes.filter((q) => q.speaker === "Hammer"),
    sosMappingRows: buildSosRows(forumTopics, verifiedQuotes),
    bioRows: buildBioRows(verifiedQuotes, lab),
    internalIntelQuoteCount,
  };
}
