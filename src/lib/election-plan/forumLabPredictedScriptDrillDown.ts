/**
 * Forum lab — predicted debate script professor drill-down registry.
 */
import {
  EP_DEBATE_PREP_HREF,
  EP_FORUM_LAB_CAPITALIZE_MOVES_HREF,
  EP_FORUM_LAB_DEEP_ANALYSIS_HREF,
  EP_FORUM_TRANSCRIPT_LAB_HREF,
  epDebatePrepDayHref,
  epForumLabPredictedScriptPhaseHref,
} from "@/lib/election-plan/debate-prep-links";
import { FORUM_PREDICTED_SCRIPT_LESSONS } from "@/lib/election-plan/forumLabPredictedScriptLessonBank";

export type PredictedScriptLink = { href: string; label: string };

export type PredictedScriptLesson = {
  id: string;
  phase: string;
  title: string;
  summary: string;
  professorLead: string;
  scriptBeat: {
    moderatorQuestion: string;
    hammerLikely: string;
    pakkoLikely: string;
    kellyBest: string;
    kellyAvoid: string;
  };
  sections: Array<{ heading: string; body: string }>;
  psychology: Array<{ heading: string; body: string }>;
  kellyStrategy: Array<{ heading: string; body: string }>;
  opponentForecast: Array<{ heading: string; body: string }>;
  optionalPhrasing: Array<{ label: string; line: string; when: string }>;
  forumEvidence: string[];
  doNotSay: string[];
  practiceSteps: string[];
  claimsGate: string[];
  relatedLinks: PredictedScriptLink[];
};

export const PREDICTED_SCRIPT_HUB_INTRO = {
  title: "Predicted debate script — professor rehearsal",
  description:
    "v2 forecast of five debate beats: opening, integrity, funding, direct democracy, and close. Each phase page is a full mock-moderator lab — opponent lines, Kelly architecture, psychology, and timed answers.",
  pillars: [
    {
      heading: "Script beats are not scripts",
      body:
        "Hammer and Pakko will not read these cards aloud. The forecast tells you the lane each opponent will occupy so Kelly can pre-load agree-add pivots and 90-second answers.",
    },
    {
      heading: "Kelly wins on specificity",
      body:
        "Forum ACCA proved Kelly scores when she names clerks, processes, and programs. Every phase below ends with a rehearsed answer longer than the one-line 'Kelly best' summary.",
    },
    {
      heading: "Avoid lines are guardrails",
      body:
        "Each beat's 'avoid' is a failure mode from forum observation — polarizing rhetoric, jargon, vagueness, dismissiveness, negative close.",
    },
  ],
};

const LESSON_BY_ID = new Map(FORUM_PREDICTED_SCRIPT_LESSONS.map((l) => [l.id, l]));

const PHASE_ORDER = ["opening", "integrity", "funding", "direct_democracy", "closing"];

export function getPredictedScriptLesson(phaseId: string): PredictedScriptLesson | undefined {
  return LESSON_BY_ID.get(phaseId);
}

export function listPredictedScriptLessons(): PredictedScriptLesson[] {
  return PHASE_ORDER.map((id) => LESSON_BY_ID.get(id)).filter((l): l is PredictedScriptLesson => Boolean(l));
}

export function listPredictedScriptPhaseIds(): string[] {
  return [...PHASE_ORDER];
}

export function resolvePredictedScriptLessonFromPhase(phase: string): PredictedScriptLesson | undefined {
  const key = phase.trim().toLowerCase();
  return FORUM_PREDICTED_SCRIPT_LESSONS.find((l) => l.phase.toLowerCase() === key || l.id === key);
}

export const PREDICTED_SCRIPT_HUB_LINKS: PredictedScriptLink[] = [
  { href: EP_FORUM_TRANSCRIPT_LAB_HREF, label: "Forum transcript lab" },
  { href: EP_FORUM_LAB_DEEP_ANALYSIS_HREF, label: "Deep analysis v2" },
  { href: EP_FORUM_LAB_CAPITALIZE_MOVES_HREF, label: "Capitalize moves" },
  { href: epDebatePrepDayHref("day-5-anticipate-and-capitalize"), label: "Command course · Day 5" },
  { href: EP_DEBATE_PREP_HREF, label: "Debate prep hub" },
];

export { epForumLabPredictedScriptPhaseHref };
