/**
 * Forum lab — 7-day integration map drill-down (forum deep analysis → command course).
 */
import {
  EP_FORUM_LAB_ELECTION_LAW_STUDY_HREF,
  EP_FORUM_TRANSCRIPT_LAB_HREF,
  EP_OPPONENT_BIOS_HREF,
  EP_OPPOSITION_RESEARCH_HREF,
  epDebatePrepBriefingHref,
  epDebatePrepDayHref,
  epForumLabElectionLawTopicHref,
  epForumLabIntegrationDayHref,
  epTrapLaneHref,
} from "@/lib/election-plan/debate-prep-links";
import type { ForumDeepAnalysis } from "@/lib/intelligence/v4/forumTranscriptLab";
import { loadForumTranscriptIntel } from "@/lib/intelligence/v4/forumTranscriptIntel";
import {
  DEBATE_WEEK_INTENSIVE_DAYS,
  type IntensiveDayId,
} from "@/lib/intelligence/v4/debateWeekIntensive2026";

export type ForumIntegrationDrillDownLink = { href: string; label: string };

export type ForumIntegrationDayDrillDown = {
  dayNumber: number;
  dayTitle: string;
  useThisIntel: string;
  drillTonight: string;
  commandCourseDayId: IntensiveDayId;
  commandCourseTitle: string;
  sections: Array<{ title: string; body: string }>;
  practiceSteps: string[];
  relatedLinks: ForumIntegrationDrillDownLink[];
};

const DAY_ID_BY_NUMBER: IntensiveDayId[] = [
  "day-1-command-foundation",
  "day-2-read-the-table",
  "day-3-superiority-map",
  "day-4-forum-intelligence",
  "day-5-anticipate-and-capitalize",
  "day-6-full-simulation",
  "day-7-refine-and-steal-show",
];

const ENRICHMENT: Record<
  number,
  Omit<ForumIntegrationDayDrillDown, "dayNumber" | "dayTitle" | "useThisIntel" | "drillTonight" | "commandCourseDayId" | "commandCourseTitle">
> = {
  1: {
    sections: [
      {
        title: "Forum → Day 1 bridge",
        body:
          "ACCA forum language on election integrity is abstract. Day 1 grounds Kelly in body protocol and the author-vs-administrator frame before debating bill lists. Forum intel tells you Hammer will open on security — your add-on is clerk implementation.",
      },
      {
        title: "Election law study (tonight drill)",
        body:
          "‘Review current election laws’ means knowing the SOS job vs Senate authorship — not memorizing every act number. Study the 2021 integrity package pattern, county burden frame, and claims gate before citing any bill on stage.",
      },
      {
        title: "Claims gate",
        body:
          "Forum-generated summaries may mislabel bills. Verify act numbers on Arkleg and run claims review before using Hammer quotes or package statistics in debate.",
      },
    ],
    practiceSteps: [
      "Read election law study overview — SOS role vs legislature (30 min).",
      "Skim 2021 package + SB250 anchor cards — do not cite act numbers aloud yet.",
      "Practice one agree-add line: secure elections + clerks need funding.",
      "Open Day 1 command course block deep dive for posture protocol.",
    ],
    relatedLinks: [
      { href: EP_FORUM_LAB_ELECTION_LAW_STUDY_HREF, label: "Current election law study hub" },
      { href: epForumLabElectionLawTopicHref("sos-role-vs-legislature"), label: "SOS role vs legislature" },
      { href: epForumLabElectionLawTopicHref("2021-integrity-package"), label: "2021 integrity package" },
      { href: epDebatePrepDayHref("day-1-command-foundation"), label: "Command course · Day 1" },
      { href: epDebatePrepBriefingHref("author-vs-administrator"), label: "Author vs administrator briefing" },
    ],
  },
  2: {
    sections: [
      {
        title: "Forum → Day 2 bridge",
        body:
          "Day 2 is observational — read Hammer and Pakko tells from forum transcript briefs. Map forum speaker profiles to rhetorical patterns you will hear on debate night.",
      },
      {
        title: "Engagement vs observation",
        body:
          "Forum civic-education talk is Kelly's lane. Day 2 extracts tells and rhythm — do not memorize every forum line; extract three Hammer patterns and one Pakko respect line.",
      },
    ],
    practiceSteps: [
      "Read Hammer forum brief — list three tells from pull quotes.",
      "Note one Pakko line worth respectful acknowledgment.",
      "Open trap lanes 1–2 on Day 2 course page.",
    ],
    relatedLinks: [
      { href: epDebatePrepDayHref("day-2-read-the-table"), label: "Command course · Day 2" },
      { href: EP_OPPONENT_BIOS_HREF, label: "Opponent biographies · first read" },
      { href: epTrapLaneHref("experience-equals-sos-ready"), label: "Trap lane · experience" },
      { href: EP_FORUM_TRANSCRIPT_LAB_HREF, label: "Forum lab · speaker profiles" },
    ],
  },
  3: {
    sections: [
      {
        title: "Forum → Day 3 bridge",
        body:
          "Technology and election systems came up in forum Q&A. Day 3 stacks Kelly's superiority map — SOS duties, business services, and implementation credibility without bill-number tennis.",
      },
    ],
    practiceSteps: [
      "List forum tech claims — mark needs_review until verified.",
      "Map one forum theme to SOS speak-order question bank.",
      "Open Day 3 superiority map blocks.",
    ],
    relatedLinks: [
      { href: epDebatePrepDayHref("day-3-superiority-map"), label: "Command course · Day 3" },
      { href: epForumLabElectionLawTopicHref("county-implementation-burden"), label: "County implementation burden" },
    ],
  },
  4: {
    sections: [
      {
        title: "Forum → Day 4 bridge",
        body:
          "Day 4 is forum intelligence day — this integration entry is the home base. Capitalize moves, verbatim quotes, and mock moderator block all feed tonight's drills.",
      },
      {
        title: "Clerk partnerships",
        body:
          "Forum emphasis on local execution matches county-clerk partnership briefing. Schedule real clerk conversations only with staff coordination — no PII in logs.",
      },
    ],
    practiceSteps: [
      "Run forum capitalize moves queue — 3 cards aloud.",
      "Read mock moderator block — answer opening in 60s.",
      "Mark Day 4 blocks complete on command course.",
    ],
    relatedLinks: [
      { href: epDebatePrepDayHref("day-4-forum-intelligence"), label: "Command course · Day 4" },
      { href: EP_OPPONENT_BIOS_HREF, label: "Opponent biographies · re-read" },
      { href: epDebatePrepBriefingHref("county-clerk-partnership"), label: "County clerk partnership briefing" },
      { href: EP_FORUM_TRANSCRIPT_LAB_HREF, label: "Forum transcript lab" },
    ],
  },
  5: {
    sections: [
      {
        title: "Forum → Day 5 bridge",
        body:
          "Day 5 anticipates Hammer themes and capitalizes on forum tells. Public-confidence messaging must pass claims gate — no invented fraud statistics.",
      },
    ],
    practiceSteps: [
      "Run forum-acca rehearsal queue — 20 min timed.",
      "Pair each capitalize move with author-vs-administrator pivot.",
      "Staff claims-gate one opponent quote from forum.",
    ],
    relatedLinks: [
      { href: epDebatePrepDayHref("day-5-anticipate-and-capitalize"), label: "Command course · Day 5" },
      { href: epDebatePrepBriefingHref("agree-but-never-only-agree"), label: "Agree-but-never-only-agree" },
    ],
  },
  6: {
    sections: [
      {
        title: "Forum → Day 6 bridge",
        body:
          "Day 6 full simulation — forum predicted beats become dress-rehearsal cards. Legislative advocacy intel maps to trap lanes and SOS questions, not new attacks.",
      },
    ],
    practiceSteps: [
      "Run world-class dress queue or Day 6 simulation block.",
      "Use forum predicted script as moderator script once.",
    ],
    relatedLinks: [
      { href: epDebatePrepDayHref("day-6-full-simulation"), label: "Command course · Day 6" },
      { href: EP_OPPONENT_BIOS_HREF, label: "Opponent biographies · lock-in" },
      { href: "/election-plan/debate-prep/war-room", label: "War room" },
    ],
  },
  7: {
    sections: [
      {
        title: "Forum → Day 7 bridge",
        body:
          "Day 7 refines closing and quotable lines. Consolidate forum pull quotes — only claims-verified lines make the closing spine.",
      },
    ],
    practiceSteps: [
      "Pick one closing line from forum executive brief — rewrite in Kelly voice.",
      "Practice 30s final thought twice on video.",
      "Open Day 7 refine blocks.",
    ],
    relatedLinks: [
      { href: epDebatePrepDayHref("day-7-refine-and-steal-show"), label: "Command course · Day 7" },
      { href: epDebatePrepBriefingHref("presence-without-repetition"), label: "Presence without repetition" },
    ],
  },
};

function resolveCommandDay(dayNumber: number) {
  const commandCourseDayId = DAY_ID_BY_NUMBER[dayNumber - 1] ?? "day-4-forum-intelligence";
  const plan = DEBATE_WEEK_INTENSIVE_DAYS.find((d) => d.dayId === commandCourseDayId);
  return { commandCourseDayId, commandCourseTitle: plan?.title ?? `Day ${dayNumber}` };
}

export function listForumIntegrationDays(): ForumIntegrationDayDrillDown[] {
  const intel = loadForumTranscriptIntel();
  const entries = intel.sevenDayIntegration.length > 0 ? intel.sevenDayIntegration : FALLBACK_INTEGRATION;
  return entries.map((entry) => buildForumIntegrationDay(entry));
}

export function getForumIntegrationDay(dayNumber: number): ForumIntegrationDayDrillDown | undefined {
  return listForumIntegrationDays().find((d) => d.dayNumber === dayNumber);
}

function buildForumIntegrationDay(entry: ForumDeepAnalysis["sevenDayIntegration"][number]): ForumIntegrationDayDrillDown {
  const { commandCourseDayId, commandCourseTitle } = resolveCommandDay(entry.dayNumber);
  const enrich = ENRICHMENT[entry.dayNumber] ?? ENRICHMENT[4]!;
  return {
    dayNumber: entry.dayNumber,
    dayTitle: entry.dayTitle,
    useThisIntel: entry.useThisIntel,
    drillTonight: entry.drillTonight,
    commandCourseDayId,
    commandCourseTitle,
    sections: enrich.sections,
    practiceSteps: enrich.practiceSteps,
    relatedLinks: [
      { href: epForumLabIntegrationDayHref(entry.dayNumber), label: "This integration day" },
      { href: epDebatePrepDayHref(commandCourseDayId), label: `Command course · ${commandCourseTitle}` },
      ...enrich.relatedLinks,
    ],
  };
}

const FALLBACK_INTEGRATION: ForumDeepAnalysis["sevenDayIntegration"] = [
  { dayNumber: 1, dayTitle: "Command foundation + election law", useThisIntel: "Forum security talk → clerk implementation frame.", drillTonight: "Review current election laws." },
  { dayNumber: 2, dayTitle: "Read the table", useThisIntel: "Extract opponent tells from forum transcript.", drillTonight: "Forum tell brief list." },
  { dayNumber: 3, dayTitle: "Superiority map", useThisIntel: "Map forum tech themes to SOS duties.", drillTonight: "SOS speak-order skim." },
  { dayNumber: 4, dayTitle: "Forum intelligence", useThisIntel: "Capitalize moves + mock moderator.", drillTonight: "Forum-acca rehearsal queue." },
  { dayNumber: 5, dayTitle: "Anticipate & capitalize", useThisIntel: "Hammer themes from forum.", drillTonight: "Trap lane + forum queue." },
  { dayNumber: 6, dayTitle: "Full simulation", useThisIntel: "Predicted debate beats.", drillTonight: "Day 6 dress rehearsal." },
  { dayNumber: 7, dayTitle: "Refine & close", useThisIntel: "Pull quotes + closing spine.", drillTonight: "30s final thought on video." },
];

export { epForumLabIntegrationDayHref };
