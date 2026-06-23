/**
 * Day 7 polish — Kelly-facing copy constants (client-safe).
 */

export const DAY7_PEAK_END_FRAME =
  "Peak-end rule — editors pull from the first and last minute. Polish bookends tonight; middle policy blur fades on broadcast.";

export const DAY7_CUT_DONT_ADD =
  "Cut, do not add. No new stats or opponent quotes after the claims final scan — Command Mode discipline on debate eve.";

export const DAY7_QUOTABLE_RULE =
  "One quotable clerk-centered line — earned, verified, newspaper-friendly without gimmick.";

export const DAY7_HUB_TONIGHT_SUMMARY =
  "Day 7 tonight: polish opening + closing (3 reps each), final claims scan, lock one quotable line. Minimum: b7-open-close block only.";

export const DAY7_V3_KELLY_MINIMUM_SUMMARY =
  "Minimum path (~60 min): opening + closing polish block only — claims scan and psych refresh roll to debate-eve AM if tired.";

export const DAY7_POLISH_CLAIMS_GATE = [
  DAY7_CUT_DONT_ADD,
  DAY7_QUOTABLE_RULE,
  "Day 7 polish uses Days 1 + 6 claims-green bookends only — no new stats or opponent quotes after claims final scan.",
  "BLOCKED debate-command lines stay off stage script — cut before rehearsal, not during broadcast.",
] as const;

export const DAY7_DEBRIEF_IMPORT_LABEL =
  "Import Day 6 top-3 sim fixes into closing beat 2 — one sentence each, not a full script rewrite.";

export const DAY7_OPENING_BEATS = [
  { beat: 1, source: "Day 1 rehearse-opening-90s", objective: "Administrator frame — no opponent names" },
  { beat: 2, source: "Day 3 qualification proof", objective: "Business + clerk partnership in three beats" },
  { beat: 3, source: "ACCA tone match", objective: "Calm competence — picture APA statewide broadcast" },
] as const;

export const DAY7_CLOSING_BEATS = [
  { beat: 1, source: "Day 7 d7-close template", objective: "Clerk invoke — administrator promise" },
  { beat: 2, source: "Day 6 sim debrief fix #1", objective: "One sentence from top-3 fixes log" },
  { beat: 3, source: "Quotable line staff pick", objective: "One breath pause before last word — peak-end rule" },
] as const;
