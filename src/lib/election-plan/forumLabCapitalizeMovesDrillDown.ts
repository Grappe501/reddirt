/**
 * Forum lab — capitalize moves drill-down registry (when X, say Y).
 */
import {
  EP_DEBATE_PREP_HREF,
  EP_FORUM_LAB_ANALYSIS_HREF,
  EP_FORUM_LAB_INTEGRATION_HREF,
  EP_FORUM_TRANSCRIPT_LAB_HREF,
  epDebatePrepDayHref,
} from "@/lib/election-plan/debate-prep-links";
import { FORUM_CAPITALIZE_MOVE_LESSONS } from "@/lib/election-plan/forumLabCapitalizeMovesLessonBank";

export type CapitalizeMoveDrillDownLink = { href: string; label: string };

export type CapitalizeMoveOptionalPhrase = {
  label: string;
  line: string;
  when: string;
};

export type CapitalizeMoveLesson = {
  id: string;
  trigger: string;
  kellyLine: string;
  whySummary: string;
  /** Why undecided viewers reward this move on a split screen. */
  viewerImpact: string;
  strategy: Array<{ heading: string; body: string }>;
  psychology: Array<{ heading: string; body: string }>;
  optionalPhrasing: CapitalizeMoveOptionalPhrase[];
  phaseGuidance: Array<{ phase: string; body: string }>;
  forumEvidence: string[];
  doNotSay: string[];
  practiceSteps: string[];
  claimsGate: string[];
  relatedLinks: CapitalizeMoveDrillDownLink[];
};

export const CAPITALIZE_MOVES_HUB_INTRO = {
  title: "Capitalize moves — when X, say Y",
  description:
    "This is where the debate is won in viewers' eyes. Undecided voters do not score policy white papers — they score warmth, competence, and who looks like they can govern tomorrow. Capitalize moves are rehearsed agree-add pivots: honor what the audience already likes hearing, then add the one line that only Kelly can own.",
  pillars: [
    {
      heading: "Agree-add, never argue-add",
      body:
        "Viewers punish the candidate who interrupts a popular sentiment. Kelly's job is to let Hammer or Pakko finish a line the room already agrees with, nod once, then add implementation — clerks, process, youth programs, truth campaigns — in one breath.",
    },
    {
      heading: "Split-screen psychology",
      body:
        "On TV, viewers see three faces at once. The candidate who looks surprised, defensive, or petty loses. The candidate who looks calm, collaborative, and specific wins — even if the transcript reads as a tie.",
    },
    {
      heading: "SOS dignity",
      body:
        "Kelly is not debating to win Twitter. She is auditioning to administer elections. Every capitalize move should sound like a future Secretary of State, not a cable panelist.",
    },
  ],
};

const LESSON_BY_ID = new Map(FORUM_CAPITALIZE_MOVE_LESSONS.map((l) => [l.id, l]));

const TRIGGER_ALIASES: Record<string, string> = {
  "when hammer says 'we need to work together'": "hammer-work-together",
  "when pakko mentions 'competition in politics'": "pakko-competition",
  "when hammer talks about election security": "hammer-security",
  "when pakko discusses voter engagement": "pakko-engagement",
  "when hammer emphasizes civic education": "hammer-civic-ed",
  "our elections are not secure.": "not-secure",
  "i don't trust the government.": "dont-trust-gov",
};

function normalizeTrigger(trigger: string): string {
  return trigger.trim().toLowerCase().replace(/\s+/g, " ");
}

export function getCapitalizeMoveLesson(moveId: string): CapitalizeMoveLesson | undefined {
  return LESSON_BY_ID.get(moveId);
}

export function listCapitalizeMoveLessons(): CapitalizeMoveLesson[] {
  return FORUM_CAPITALIZE_MOVE_LESSONS;
}

export function listCapitalizeMoveIds(): string[] {
  return FORUM_CAPITALIZE_MOVE_LESSONS.map((l) => l.id);
}

export function resolveCapitalizeMoveFromTrigger(trigger: string): CapitalizeMoveLesson | undefined {
  const key = normalizeTrigger(trigger);
  const id = TRIGGER_ALIASES[key];
  if (id) return getCapitalizeMoveLesson(id);
  return FORUM_CAPITALIZE_MOVE_LESSONS.find((l) => normalizeTrigger(l.trigger) === key);
}

export const CAPITALIZE_MOVES_HUB_LINKS: CapitalizeMoveDrillDownLink[] = [
  { href: EP_FORUM_TRANSCRIPT_LAB_HREF, label: "Forum transcript lab" },
  { href: EP_FORUM_LAB_ANALYSIS_HREF, label: "Forum analysis lessons" },
  { href: EP_FORUM_LAB_INTEGRATION_HREF, label: "7-day integration map" },
  { href: epDebatePrepDayHref("day-5-anticipate-and-capitalize"), label: "Command course · Day 5" },
  { href: EP_DEBATE_PREP_HREF, label: "Debate prep hub" },
];