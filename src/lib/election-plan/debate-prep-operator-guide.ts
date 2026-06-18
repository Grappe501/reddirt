/** Election Plan debate prep operator instruction copy (client-safe). */

export const DEBATE_PREP_ANSWER_ARCHITECTURE = [
  "Direct answer — one sentence, no throat-clearing",
  "Transparency / accountability or non-partisan pledge",
  "Verified anchor (act number only if staff cleared)",
  "County impact — clerk, training, unfunded mandate",
  "Unity bridge — cross-aisle service, educate public",
  "SOS solution — what you will do in office",
] as const;

export const DEBATE_CONTRAST_METHOD =
  "Acknowledge Hammer's stated goal (integrity, experience) where fair, then contrast means and implementation burden — never motive without a source. Pivot to unity: service desk that educates and unites, not culture-war pulpit.";

export const TRAP_LANE_TECHNIQUE_STEPS = [
  {
    step: 1,
    title: "Pick tonight's lane",
    detail: "Open trap lanes index. Choose 1–2 lanes matching tonight's theme (usually Check My Record or county burden).",
  },
  {
    step: 2,
    title: "Read what Hammer will say",
    detail: "Memorize 3 likely lines — not paragraphs. Staff verifies act numbers before stage.",
  },
  {
    step: 3,
    title: "Run the setup question",
    detail: "Ask the fair moderator-style question that invites him to bite. Calm tone, eyes on moderator.",
  },
  {
    step: 4,
    title: "Pivot when he bites (or doesn't)",
    detail: "45-second pivot script out loud. If no bite: one-sentence pivot anyway and move on.",
  },
  {
    step: 5,
    title: "Rehearse in rehearsal engine",
    detail: "Log the lane in drill queue · run encounter · debrief claims gate before any public line.",
  },
] as const;

export const DEBATE_REHEARSAL_TECHNIQUES = [
  {
    id: "agree-contrast-bridge",
    label: "Agree · contrast · bridge",
    detail: "Never end on agree alone. Narrow agreement → implementation contrast → county or unity bridge.",
  },
  {
    id: "15s-decline",
    label: "15-second culture-war decline",
    detail: "Boundary without repeating bait words. Within 10 seconds: bill, county, or transparency pledge.",
  },
  {
    id: "reset-line",
    label: "If-stuck reset",
    detail: "'Let me answer directly.' + safe fact (non-partisan SOS · 75 counties) + bridge.",
  },
  {
    id: "voice-drop",
    label: "Voice drop on pivot",
    detail: "When Hammer raises volume, lower half a level — voters read that as leadership.",
  },
  {
    id: "three-way-order",
    label: "Three-way speak order",
    detail: "If third after two agree: add county or Civic Index line — never repeat their sentences.",
  },
  {
    id: "claims-gate",
    label: "Claims gate discipline",
    detail: "NEEDS_REVIEW lines stay in staff packet until verified. Research-question framing on stage.",
  },
] as const;

export const DEBATE_PREP_WEEKLY_FLOW = [
  "Command home — readiness, safe/blocked lines, tonight focus",
  "7-day command course — today's day page + study blocks",
  "Trap lanes — 1–2 lanes rehearsed standing",
  "Techniques library — hammer-attacks + if-stuck refresh",
  "AI tutor — 15 min coach mode on weakest lane",
  "Forum lab — ACCA intel when transcript available",
  "Rehearsal engine — primary encounter + drill queue close",
] as const;

/** Which trap lane to open first — match tonight's expected moderator theme. */
export const TRAP_LANE_SELECTION_GUIDE = [
  {
    when: "Hammer claims 2025 is a clean break from 2021",
    laneId: "2021-vs-2025-pivot",
    note: "Force pattern vs. promise — voters decide if the pivot is real.",
  },
  {
    when: "Integrity talk without clerk training or participation",
    laneId: "integrity-without-participation",
    note: "Contrast means: unfunded mandates vs. service desk for 75 counties.",
  },
  {
    when: "County clerk champion framing or rural hero language",
    laneId: "county-champion",
    note: "Thank clerks publicly; ask what Hammer funded vs. what he voted for.",
  },
  {
    when: "Show me the fraud data / prove it dare",
    laneId: "fraud-data-dare",
    note: "Research-question framing — never accept his premise without a source.",
  },
  {
    when: "Experience equals SOS-ready / decades in office",
    laneId: "experience-equals-sos-ready",
    note: "Acknowledge service; contrast implementation burden on clerks.",
  },
  {
    when: "Culture-war bait, biography, or partisan war words",
    laneId: "culture-war-escalation",
    note: "Pair with techniques/culture-war — 15-second decline then pivot.",
  },
] as const;

export const MODERATOR_INTERACTION_TECHNIQUES = [
  {
    id: "answer-the-question",
    label: "Answer what was asked",
    detail: "One direct sentence first. If Hammer interrupts, eyes on moderator: 'I'll finish the question you asked.'",
  },
  {
    id: "time-box",
    label: "Time-box without rushing",
    detail: "Under 45 seconds on pivots. If cut off, next answer is shorter — never stack three ideas.",
  },
  {
    id: "reframe-fairly",
    label: "Reframe unfair premises",
    detail: "'The question assumes X — here's what clerks actually need.' Never attack the moderator.",
  },
  {
    id: "three-way-order",
    label: "Three-way speak order",
    detail: "If you speak last after two agree: add county or Civic Index — never repeat their sentences.",
  },
  {
    id: "water-reset",
    label: "Water / reset signal",
    detail: "Staff pre-briefs a subtle signal. One sip, one breath, one sentence — not an off-mic debate.",
  },
] as const;

export const STAGE_PRESENCE_CHECKLIST = [
  "Feet planted — no sway when Hammer raises volume",
  "Hands visible, still below shoulder line during pivots",
  "Eyes on moderator during setup questions; brief glance at Hammer only on contrast",
  "Voice drops half a level when baited — voters read calm as leadership",
  "Smile only on unity bridge lines, not during decline or contrast",
  "Never repeat Hammer's hot words — paraphrase to substance",
] as const;

export const FIRST_DEBATE_MISTAKES = [
  "Over-explaining act numbers instead of county impact",
  "Matching volume or interrupting back — clips favor composure",
  "Ending on agree without contrast and bridge",
  "Defending biography instead of pivoting to SOS service frame",
  "Using NEEDS_REVIEW lines from staff packet without verification",
  "Running past time — next answer must be one sentence shorter",
] as const;
