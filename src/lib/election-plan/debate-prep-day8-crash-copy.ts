/**
 * Day 8 crash course — Kelly-facing copy constants (client-safe).
 */
import { epDebatePrepDayBlockHref, epDebatePrepDayHref, epDebatePrepDayRehearsalHref } from "@/lib/election-plan/debate-prep-links";

const DAY8 = "day-8-command-mode-debate" as const;
import {
  DAY8_SOS_THREE_DOMAINS_FRAME,
  DAY8_WEEK_BALANCE_CORRECTION,
} from "@/lib/election-plan/debate-prep-day8-sos-three-domains";

export { DAY8_SOS_THREE_DOMAINS_FRAME, DAY8_WEEK_BALANCE_CORRECTION };

export const DAY8_ARKANSAS_PEOPLE_FRAME =
  "Debate day widens the lens to all Arkansas voters — elections, business services, and Capitol management stay in every answer. Picture Robert K., Diane P., and Rev. James H. when you speak; your week of study is inside those lines, not thrown away.";

export const DAY8_AUDIBLE_CARD =
  "This morning is the compressed seven-day course — same material, stage-ready order. Each section points back to the Day 1–7 blocks where you did the deep work. Short on time? Minimum path is enough. No new research today — green lines only.";

export const DAY8_SEVEN_DAY_DEEP_LINKS = [
  { dayId: "day-1-command-foundation", label: "Day 1 · command foundation", href: epDebatePrepDayHref("day-1-command-foundation") },
  { dayId: "day-2-read-the-table", label: "Day 2 · read the table", href: epDebatePrepDayHref("day-2-read-the-table") },
  { dayId: "day-3-superiority-map", label: "Day 3 · superiority map", href: epDebatePrepDayHref("day-3-superiority-map") },
  { dayId: "day-4-forum-intelligence", label: "Day 4 · forum intelligence", href: epDebatePrepDayHref("day-4-forum-intelligence") },
  { dayId: "day-5-anticipate-and-capitalize", label: "Day 5 · anticipate & capitalize", href: epDebatePrepDayHref("day-5-anticipate-and-capitalize") },
  { dayId: "day-6-full-simulation", label: "Day 6 · full simulation", href: epDebatePrepDayHref("day-6-full-simulation") },
  { dayId: "day-7-refine-and-steal-show", label: "Day 7 · refine & steal show", href: epDebatePrepDayHref("day-7-refine-and-steal-show") },
] as const;

export const DAY8_CRASH_COURSE_SUMMARY =
  "Day 8 today: three-hour crash course — nine sections, three SOS domains in opening and SOS drills, then PM travel → stage → debrief.";

export const DAY8_HUB_TONIGHT_SUMMARY =
  "Day 8 AM: crash course (~3h) — elections + business services + Capitol management in opening and moderator answers, then lock sheet. PM: stage Command Mode.";

export const DAY8_V3_KELLY_MINIMUM_SUMMARY =
  "Minimum path (~90 min): orient → command → opening with three domains → one SOS answer per domain → closing → lock sheet.";

export const DAY8_CLAIMS_GATE = [
  "Day 8 imports Days 1–7 only — no new stats, opponent quotes, or research rabbit holes.",
  "Three SOS domains must each get one claims-green line in opening or SOS — do not skip business services or Capitol management.",
  "BLOCKED debate-command lines stay off stage script — Day 7 claims final cut is the ceiling.",
] as const;

export const DAY8_PM_EXECUTION_NOTE =
  "After the lock sheet: travel mental rehearsal → stage Command Mode → post-debate debrief. No new content ingestion after AM course.";

export const DAY8_OPENING_BEATS = [
  {
    beat: 1,
    source: "Day 1 rehearse-opening-90s",
    objective: "Administrator frame — SOS runs elections, business services, and Capitol management",
    href: epDebatePrepDayRehearsalHref("day-1-command-foundation", "rehearse-opening-90s"),
  },
  {
    beat: 4,
    source: "Day 8 persona wall",
    objective: "Arkansas promise — picture primary persona · statewide APA tone",
    href: epDebatePrepDayBlockHref(DAY8, "s8-persona-wall"),
  },
] as const;

export const DAY8_CLOSING_BEATS = [
  {
    beat: 1,
    source: "Day 7 d7-close + three-domain invoke",
    objective: "Service desk promise — elections, business filings, transparent Capitol rules",
    href: epDebatePrepDayBlockHref("day-7-refine-and-steal-show", "b7-open-close"),
  },
  {
    beat: 2,
    source: "Day 6 debrief top fix",
    objective: "One sentence from sim debrief — weakest domain gets the fix",
    href: epDebatePrepDayBlockHref("day-6-full-simulation", "b6-sim"),
  },
  {
    beat: 3,
    source: "Day 7 quotable lock",
    objective: "One breath pause before last word — quotable without gimmick",
    href: epDebatePrepDayBlockHref(DAY8, "s8-lock-sheet"),
  },
] as const;

export const DAY8_DOMAIN_COVERAGE_CHECK = [
  "Elections — clerk support + integrity in plain language?",
  "Business services — Main Street / rural filing competence named?",
  "Capitol management — petitions, records, or transparent rules named?",
] as const;
