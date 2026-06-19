/**
 * Forum lab — deep analysis v2 professor drill-down registry.
 */
import {
  EP_DEBATE_PREP_HREF,
  EP_FORUM_LAB_ANALYSIS_HREF,
  EP_FORUM_LAB_CAPITALIZE_MOVES_HREF,
  EP_FORUM_TRANSCRIPT_LAB_HREF,
  epDebatePrepDayHref,
  epForumLabDeepAnalysisLessonHref,
} from "@/lib/election-plan/debate-prep-links";
import { FORUM_DEEP_PROFESSOR_LESSONS } from "@/lib/election-plan/forumLabDeepAnalysisLessonBank";

export type ForumDeepProfessorLink = { href: string; label: string };

export type ForumDeepProfessorLesson = {
  id: string;
  blockType: "executive-brief" | "profile" | "quote";
  title: string;
  summary: string;
  professorLead: string;
  sections: Array<{ heading: string; body: string }>;
  psychology: Array<{ heading: string; body: string }>;
  kellyStrategy: Array<{ heading: string; body: string }>;
  optionalPhrasing: Array<{ label: string; line: string; when: string }>;
  forumEvidence: string[];
  doNotSay: string[];
  practiceSteps: string[];
  claimsGate: string[];
  relatedLinks: ForumDeepProfessorLink[];
  quoteMeta?: {
    speaker: string;
    quote: string;
    context: string;
    stageUse: string;
    claimsGateStatus: string;
  };
};

export const DEEP_ANALYSIS_HUB_INTRO = {
  title: "Deep analysis v2 — professor study",
  description:
    "Forum transcript lab v2 is your opponent forecast and Kelly positioning brief. Each block below is a full professor page: rhetoric, psychology, claims gate, and rehearsal — not summary bullets.",
  pillars: [
    {
      heading: "Read opponents like a director",
      body:
        "Profiles tell you how each candidate performs on camera. Quotes tell you the exact lines coming back on debate night. Kelly's job is not to memorize — it is to anticipate and capitalize.",
    },
    {
      heading: "Claims gate is non-negotiable",
      body:
        "Verbatim quotes marked needs_review stay in staff notebooks until verified. Kelly only speaks verified lines or pattern language on stage.",
    },
    {
      heading: "Executive brief = north star",
      body:
        "The v2 brief compresses Kelly's ACCA story: clerk partnership, civic engagement, integrity without fear-mongering. Every deep page should trace back to that triangle.",
    },
  ],
};

const LESSON_BY_ID = new Map(FORUM_DEEP_PROFESSOR_LESSONS.map((l) => [l.id, l]));

const QUOTE_MATCH: Array<{ prefix: string; id: string }> = [
  { prefix: "if it isn't broke", id: "quote-hammer-if-it-isnt-broke" },
  { prefix: "elections are too important to leave", id: "quote-pakko-duopoly-line" },
  { prefix: "my number one goal is to make sure", id: "quote-kelly-security-integrity-goal" },
  { prefix: "we need to be an office that is loud", id: "quote-hammer-office-loud" },
  { prefix: "we need a handbook for our counties", id: "quote-pakko-county-handbook" },
  { prefix: "i want to show people how secure", id: "quote-kelly-show-secure" },
  { prefix: "we need to capitalize on that", id: "quote-hammer-capitalize-balance" },
  { prefix: "we need to bring technology up to date", id: "quote-pakko-tech-up-to-date" },
  { prefix: "i believe that the county clerks are a big part", id: "quote-kelly-clerks-trust" },
  { prefix: "we need to work together as a team", id: "quote-hammer-work-together-team" },
];

export function getDeepProfessorLesson(lessonId: string): ForumDeepProfessorLesson | undefined {
  return LESSON_BY_ID.get(lessonId);
}

export function listDeepProfessorLessons(): ForumDeepProfessorLesson[] {
  return FORUM_DEEP_PROFESSOR_LESSONS;
}

export function listDeepProfessorLessonIds(): string[] {
  return FORUM_DEEP_PROFESSOR_LESSONS.map((l) => l.id);
}

export function listDeepProfessorProfiles(): ForumDeepProfessorLesson[] {
  return FORUM_DEEP_PROFESSOR_LESSONS.filter((l) => l.blockType === "profile");
}

export function listDeepProfessorQuotes(): ForumDeepProfessorLesson[] {
  return FORUM_DEEP_PROFESSOR_LESSONS.filter((l) => l.blockType === "quote");
}

export function resolveDeepProfessorQuoteLesson(quoteText: string): ForumDeepProfessorLesson | undefined {
  const key = quoteText.trim().toLowerCase();
  const match = QUOTE_MATCH.find((m) => key.startsWith(m.prefix));
  return match ? getDeepProfessorLesson(match.id) : undefined;
}

export const DEEP_ANALYSIS_HUB_LINKS: ForumDeepProfessorLink[] = [
  { href: EP_FORUM_TRANSCRIPT_LAB_HREF, label: "Forum transcript lab" },
  { href: EP_FORUM_LAB_CAPITALIZE_MOVES_HREF, label: "Capitalize moves" },
  { href: EP_FORUM_LAB_ANALYSIS_HREF, label: "Forum analysis lessons" },
  { href: epDebatePrepDayHref("day-4-forum-intelligence"), label: "Command course · Day 4" },
  { href: EP_DEBATE_PREP_HREF, label: "Debate prep hub" },
];

export { epForumLabDeepAnalysisLessonHref };
