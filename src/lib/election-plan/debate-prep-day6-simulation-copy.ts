/**
 * Day 6 full simulation — Kelly-facing copy constants (client-safe).
 */

export const DAY6_APA_SIM_FRAME =
  "Fail in the room with staff, not on the APA statewide broadcast. Clerks belong in your lines; voters and press belong in your tone — calm, specific, quotable without gimmick.";

export const DAY6_SIM_AUDIENCE_LABEL =
  "Audience: Arkansas Press Association broadcast + local Carroll paper + clerks grading competence.";

export const DAY6_SIM_CLAIMS_GATE = [
  "Simulation uses Days 1–5 claims-green lines only — no new stats or opponent quotes invented under timer.",
  "BLOCKED debate-command lanes are cut from sim answers — silence beats unverified lines on broadcast.",
  "Forum verbatim in triggers must match Day 4 notecard source + timestamp + green status.",
  "Pull-forward closing template is staff-approved — no fresh policy research during sim.",
] as const;

export const DAY6_SIM_NO_NEW_MATERIAL_WATCHOUT =
  "Day 6 fixes what exists — simulation only. Do not add fresh research, trap content, or unverified quotes during the dress rehearsal.";

export const DAY6_DEBRIEF_PROMPTS = [
  "Where did I agree-only close instead of counter-punching?",
  "Which trap lane felt slowest at moderator pace?",
  "Which SOS answer lost the clerk image in the last ten seconds?",
  "When did Command Mode feel natural vs performative?",
  "What one fix from tonight matters most for Day 7 polish?",
] as const;

export const DAY6_DEBRIEF_TOP_FIXES_LABEL =
  "Log top 3 fixes only — Day 7 polishes bookends; do not rewrite the whole script tonight.";

export const DAY6_READINESS_TARGET_LABEL =
  "Target debate command readiness ≥70% all dimensions before travel — honest scores beat false confidence.";

export const DAY6_OPENING_BEATS = [
  { beat: 1, source: "Day 1 rehearse-opening-90s", objective: "Administrator frame — no opponent names" },
  { beat: 2, source: "Day 3 qualification stack", objective: "Business proof + clerk partnership in three beats" },
  { beat: 3, source: "Forum Kelly lines (Day 3–4)", objective: "Tone match ACCA — do this the right way" },
] as const;

export const DAY6_CLOSING_BEATS = [
  { beat: 1, source: "Day 7 d7-close template", objective: "Clerk invoke — administrator promise" },
  { beat: 2, source: "Day 5 weakest lane fix", objective: "One sentence from sim debrief" },
  { beat: 3, source: "Optional quotable preview", objective: "One breath pause before last word" },
] as const;

/** Three trap lanes woven into the 60-min sim script (Days 2 + 5 coverage). */
export const DAY6_SIM_TRAP_LANE_IDS = [
  "county-champion",
  "integrity-without-participation",
  "fraud-data-dare",
] as const;

export type Day6SimTrapLaneId = (typeof DAY6_SIM_TRAP_LANE_IDS)[number];

export const DAY6_SIM_SOS_COUNT = 5;

export const DAY6_SIM_TOTAL_MINUTES = 60;

export const DAY6_SIM_DEBRIEF_MINUTES = 30;

/** Shared with Day 7 debrief import panel — do not rename casually. */
export const DAY6_SIM_DEBRIEF_STORAGE_KEY = "kelly-day6-sim-debrief-v1";

/** Client-safe segment outline (no server loaders). */
export const DAY6_SIM_SEGMENT_OUTLINE: ReadonlyArray<{
  label: string;
  timedMinutes: number;
  staffRole: "moderator" | "hammer" | "pakko";
}> = [
  { label: "Opening statement · 90s administrator frame", timedMinutes: 2, staffRole: "moderator" },
  { label: "Trap lane · county champion", timedMinutes: 3, staffRole: "hammer" },
  { label: "Trap lane · integrity without participation", timedMinutes: 3, staffRole: "hammer" },
  { label: "Trap lane · fraud data dare", timedMinutes: 3, staffRole: "hammer" },
  { label: "Pile-on pivot · Hammer + Pakko on government trust", timedMinutes: 3, staffRole: "hammer" },
  { label: "SOS question 1 · moderator pace", timedMinutes: 2, staffRole: "moderator" },
  { label: "SOS question 2 · moderator pace", timedMinutes: 2, staffRole: "moderator" },
  { label: "SOS question 3 · moderator pace", timedMinutes: 2, staffRole: "moderator" },
  { label: "SOS question 4 · moderator pace", timedMinutes: 2, staffRole: "moderator" },
  { label: "SOS question 5 · moderator pace", timedMinutes: 2, staffRole: "moderator" },
  { label: "Closing statement · 60s clerk invoke", timedMinutes: 2, staffRole: "moderator" },
];

export const DAY6_SIM_SEGMENT_COUNT = DAY6_SIM_SEGMENT_OUTLINE.length;

export const DAY6_V3_KELLY_MINIMUM_SUMMARY =
  "Minimum path (~90 min): full simulation block only — bios lock-in and debrief roll to Wednesday AM if tired. Staff plays Hammer and Pakko; fail in the room, not on broadcast.";

export const DAY6_HUB_TONIGHT_SUMMARY =
  "Day 6 tonight: 60-minute three-way dress rehearsal — opening, trap lanes, SOS sprint, closing. Use Day 5 when-X-say-Y sheet live. Minimum: b6-sim block only.";

/** Client-safe serializable types for Day 6 simulation UI props. */
export type Day6SimSegmentKind = "opening" | "trap" | "sos" | "closing" | "pile-on";

export type Day6SimStaffRole = "moderator" | "hammer" | "pakko";

export type Day6SimSegment = {
  segmentIndex: number;
  kind: Day6SimSegmentKind;
  label: string;
  timedMinutes: number;
  staffRole: Day6SimStaffRole;
  kellyObjective: string;
  sourceDayId: string;
  href?: string;
  staffSetupHint?: string;
};

export type Day6SimBookend = {
  variant: "opening" | "closing";
  durationSeconds: 90 | 60;
  script: string;
  sourceDayId: string;
  sourceLabel: string;
  rehearsalHref: string;
};
