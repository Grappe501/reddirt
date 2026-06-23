/**
 * Day 8 — Debate command course copy (client-safe, reusable every stage appearance).
 */
import { epDebatePrepDayBlockHref, epDebatePrepDayHref, epDebatePrepDayRehearsalHref } from "@/lib/election-plan/debate-prep-links";

const DAY8 = "day-8-command-mode-debate" as const;
import {
  DAY8_SOS_THREE_DOMAINS_FRAME,
  DAY8_WEEK_BALANCE_CORRECTION,
} from "@/lib/election-plan/debate-prep-day8-sos-three-domains";

export { DAY8_SOS_THREE_DOMAINS_FRAME, DAY8_WEEK_BALANCE_CORRECTION };

/** Public course name — use everywhere instead of “crash course”. */
export const DAY8_COURSE_TITLE = "Debate command course";
export const DAY8_COURSE_EYEBROW = "Module 8 · Debate command course";

export const DAY8_ARKANSAS_PEOPLE_FRAME =
  "Stage appearances reach all Arkansas voters — elections, business services, and Capitol management belong in every answer. Picture Robert K., Diane P., and Rev. James H.; foundation work from Modules 1–7 lives inside those lines.";

/** Course orientation — replaces one-time “audible” framing. */
export const DAY8_COURSE_INTRO =
  "A compressed replay of Modules 1–7 in stage order. Nine sections, three SOS domains, one lock sheet — reusable before every debate through November.";

/** @deprecated Use DAY8_COURSE_INTRO */
export const DAY8_AUDIBLE_CARD = DAY8_COURSE_INTRO;

export const DAY8_SEVEN_DAY_DEEP_LINKS = [
  { dayId: "day-1-command-foundation", label: "Module 1 · command foundation", href: epDebatePrepDayHref("day-1-command-foundation") },
  { dayId: "day-2-read-the-table", label: "Module 2 · read the table", href: epDebatePrepDayHref("day-2-read-the-table") },
  { dayId: "day-3-superiority-map", label: "Module 3 · superiority map", href: epDebatePrepDayHref("day-3-superiority-map") },
  { dayId: "day-4-forum-intelligence", label: "Module 4 · forum intelligence", href: epDebatePrepDayHref("day-4-forum-intelligence") },
  { dayId: "day-5-anticipate-and-capitalize", label: "Module 5 · anticipate & capitalize", href: epDebatePrepDayHref("day-5-anticipate-and-capitalize") },
  { dayId: "day-6-full-simulation", label: "Module 6 · full simulation", href: epDebatePrepDayHref("day-6-full-simulation") },
  { dayId: "day-7-refine-and-steal-show", label: "Module 7 · refine & steal show", href: epDebatePrepDayHref("day-7-refine-and-steal-show") },
] as const;

export const DAY8_CRASH_COURSE_SUMMARY =
  `${DAY8_COURSE_TITLE} — nine sections, three SOS domains in opening and moderator answers, then lock sheet and stage handoff.`;

export const DAY8_HUB_TONIGHT_SUMMARY =
  `${DAY8_COURSE_TITLE} (~3h) — elections, business services, and Capitol management in opening and SOS answers, then export lock sheet before stage.`;

export const DAY8_V3_KELLY_MINIMUM_SUMMARY =
  "Essentials path (~90 min): orient → command → opening → one SOS answer per domain → closing → lock sheet.";

export const DAY8_CLAIMS_GATE = [
  "Use claims-green lines from Modules 1–7 only.",
  "Cover elections, business services, and Capitol management — one verified line per domain.",
  "Day 7 claims final cut is the ceiling for stage script.",
] as const;

export const DAY8_PM_EXECUTION_NOTE =
  "After lock sheet: travel rehearsal → stage Command Mode → post-debate debrief. No new content after course completion.";

export const DAY8_OPENING_BEATS = [
  {
    beat: 1,
    source: "Module 1 · 90s opening",
    objective: "Administrator frame — SOS runs elections, business services, and Capitol management",
    href: epDebatePrepDayRehearsalHref("day-1-command-foundation", "rehearse-opening-90s"),
  },
  {
    beat: 4,
    source: "Module 8 · persona wall",
    objective: "Arkansas promise — primary persona · statewide tone",
    href: epDebatePrepDayBlockHref(DAY8, "s8-persona-wall"),
  },
] as const;

export const DAY8_CLOSING_BEATS = [
  {
    beat: 1,
    source: "Module 7 · three-domain close",
    objective: "Service desk promise — elections, business filings, transparent Capitol rules",
    href: epDebatePrepDayBlockHref("day-7-refine-and-steal-show", "b7-open-close"),
  },
  {
    beat: 2,
    source: "Module 6 · sim debrief fix",
    objective: "One sentence from simulation debrief — weakest domain gets the fix",
    href: epDebatePrepDayBlockHref("day-6-full-simulation", "b6-sim"),
  },
  {
    beat: 3,
    source: "Module 7 · quotable lock",
    objective: "One breath pause before last word — quotable without gimmick",
    href: epDebatePrepDayBlockHref(DAY8, "s8-lock-sheet"),
  },
] as const;

export const DAY8_DOMAIN_COVERAGE_CHECK = [
  "Elections — clerk support + integrity in plain language?",
  "Business services — Main Street / rural filing competence named?",
  "Capitol management — petitions, records, or transparent rules named?",
] as const;
