/**
 * Day 7 — full study guides for each block (Election Plan drill-down).
 */
import {
  EP_DEBATE_PREP_REHEARSAL_HREF,
  epDebatePrepDayBlockHref,
  epDebatePrepDayConceptHref,
  epDebatePrepDayDrillHref,
  epDebatePrepDayExampleHref,
  epDebatePrepDayMicroLessonHref,
  epDebatePrepDayRehearsalHref,
  epOpponentBioHref,
} from "@/lib/election-plan/debate-prep-links";
import { epDebatePrepLaneHref } from "@/lib/election-plan/debate-prep-route-map";
import {
  DAY7_CUT_DONT_ADD,
  DAY7_PEAK_END_FRAME,
  DAY7_POLISH_CLAIMS_GATE,
  DAY7_QUOTABLE_RULE,
} from "@/lib/election-plan/debate-prep-day7-polish-copy";
import { DAY7_ID } from "@/lib/election-plan/debatePrepDayDrillDown";
import type { Day1BlockStudyDeep } from "@/lib/election-plan/debatePrepDay1BlockStudy";
import { buildDay7PolishSurface } from "@/lib/election-plan/load-day7-polish-surface";

const claimsGateLines = [...DAY7_POLISH_CLAIMS_GATE];

const polishSurface = () => buildDay7PolishSurface();

export const DAY7_BLOCK_STUDY: Record<string, Day1BlockStudyDeep> = {
  "b7-open-close": {
    blockId: "b7-open-close",
    studyGuideTitle: "Opening + closing polish · 60-minute study",
    professorLead: DAY7_PEAK_END_FRAME,
    overview:
      "Polish Day 1 opening and Day 7 closing template — weave Day 6 debrief top-3 fixes into closing beat 2. Three reps each bookend under timer. Minimum block for debate eve.",
    phases: [
      {
        minutesLabel: "0–12 min",
        title: "Day 6 debrief import + polish surface",
        steps: [
          "Open Day 6 sim block debrief — log top 3 fixes only.",
          `Review debrief prompts: ${polishSurface().debriefPrompts.length} questions — pick fix #1 for closing beat 2.`,
          "Read opening + closing scripts from polish surface — claims-green only.",
          "Set timer: 90s opening, 60s closing — no new research.",
        ],
      },
      {
        minutesLabel: "12–30 min",
        title: "Opening 90s · three reps",
        steps: [
          "Rep 1 cold: Day 1 opening script — administrator frame, no opponent names.",
          "Rep 2: add Day 3 qualification proof beat — business + clerks in three beats.",
          "Rep 3: picture APA statewide broadcast — ACCA calm tone.",
          "Log: opening boring yet? (yes / one more rep)",
        ],
      },
      {
        minutesLabel: "30–48 min",
        title: "Closing 60s · three reps with sim fix",
        steps: [
          "Rep 1: d7-close clerk invoke template — hold silence 2s after last word.",
          "Rep 2: weave Day 6 debrief fix #1 into beat 2 — one sentence only.",
          "Rep 3: add staff-cleared quotable line preview in beat 3 if ready.",
          "Log: closing ends on clerk invoke, not agree-only? (yes / fix beat 2)",
        ],
      },
      {
        minutesLabel: "48–60 min",
        title: "Peak-end gate + rehearsal handoff",
        steps: [
          "Answer: three opening reps logged? (yes / roll one rep to AM)",
          "Answer: three closing reps logged with sim fix woven? (yes / repeat beat 2)",
          "Answer: both bookends under timer? (yes / trim, do not add stats)",
          "Mark block complete — open rehearse-bookends-three-reps or claims final if energy allows.",
        ],
      },
    ],
    deepSections: [
      {
        title: "Opening beat spine",
        body: polishSurface()
          .openingBeats.map((b) => `Beat ${b.beat}: ${b.objective} (${b.source})`)
          .join(" · "),
      },
      {
        title: "Closing beat spine",
        body: polishSurface()
          .closingBeats.map((b) => `Beat ${b.beat}: ${b.objective} (${b.source})`)
          .join(" · "),
      },
      {
        title: "Day 6 debrief import",
        body: polishSurface().debriefImportLabel,
      },
      { title: "Cut don't add", body: DAY7_CUT_DONT_ADD },
      {
        title: "Common mistakes",
        body: "Rewriting whole script from sim debrief. New stats after claims final. Opening names opponents. Rushed closing without peak-end pause.",
      },
    ],
    psychology: [
      {
        title: "Peak-end rule",
        body: "Press memory anchors on first calm minute and last quotable minute — middle policy blur fades on broadcast.",
      },
    ],
    opponentForecast: [
      {
        title: "Hammer performs at close",
        body: "Slow down when opponent performs for crowd — contrast reads as command in closing beat 3.",
      },
    ],
    doNotSay: [
      "Fresh stats invented during bookends polish.",
      "Unverified opponent quotes in opening or closing.",
    ],
    claimsGate: claimsGateLines,
    keyTakeaways: [
      "Three reps each bookend — boring is the goal.",
      "Day 6 fix #1 woven into closing beat 2.",
      "Peak-end pause before last word.",
    ],
    practiceSteps: [
      "Import Day 6 top-3 fixes — one sentence into closing.",
      "Polish opening 90s + closing 60s — claims-green only.",
      "Three reps each — log completion.",
    ],
    relatedLinks: [
      { href: epDebatePrepDayRehearsalHref(DAY7_ID, "rehearse-bookends-three-reps"), label: "3 reps bookends rehearsal" },
      { href: epDebatePrepDayRehearsalHref("day-1-command-foundation", "rehearse-opening-90s"), label: "Day 1 · 90s opening" },
      { href: epDebatePrepDayDrillHref(DAY7_ID, "d7-close"), label: "Closing clerk invoke drill" },
      { href: polishSurface().day6DebriefBlockHref, label: "Day 6 sim debrief source" },
      { href: epDebatePrepLaneHref("lane-d7-bookends"), label: "Bookends polish lane" },
    ],
  },
  "b7-claims-final": {
    blockId: "b7-claims-final",
    studyGuideTitle: "Final claims scan · 45-minute study",
    professorLead: DAY7_CUT_DONT_ADD,
    overview:
      "Red-line review of stage script — BLOCKED debate-command lines cut before rehearsal. Nothing new after today. Staff sign-off on final claims-green script.",
    phases: [
      {
        minutesLabel: "0–10 min",
        title: "Script assembly — bookends + sheet",
        steps: [
          "Gather: Day 7 opening/closing polish, Day 5 when-X-say-Y sheet, trap lane pivots used in sim.",
          "Open Day 3 claims gate reference — BLOCKED line definitions.",
          "Label notebook: cut gate — no additions after scan starts.",
          "Confirm bookends block complete or minimum path flagged.",
        ],
      },
      {
        minutesLabel: "10–25 min",
        title: "BLOCKED line purge",
        steps: [
          "Scan every Kelly line in stage script — mark BLOCKED in red.",
          "Cut unverified stats — silence beats unverified lines on broadcast.",
          "Cut invented opponent quotes — paraphrase templates only.",
          "Cross-check Day 4 forum notecard timestamps on any forum verbatim.",
        ],
      },
      {
        minutesLabel: "25–38 min",
        title: "Quotable line claims check",
        steps: [
          "Staff-cleared quotable line — newspaper test + claims gate.",
          "Verify show-steal alternate lines — no new Hammer character claims.",
          "If line fails gate: revert to d7-close template.",
          "Log final quotable pick for rehearse-quotable-line.",
        ],
      },
      {
        minutesLabel: "38–45 min",
        title: "Staff sign-off gate",
        steps: [
          "Answer: zero BLOCKED lines remain on stage script? (yes / cut more)",
          "Answer: no new material added during scan? (yes / undo additions)",
          "Answer: staff signed final script? (yes / hold rehearsal)",
          "Mark block complete — psych refresh or evening close next.",
        ],
      },
    ],
    deepSections: [
      {
        title: "Cut don't add discipline",
        body: "Day 7 fixes what exists — claims final is subtraction, not research. Command Mode on debate eve means verified lines only.",
      },
      {
        title: "BLOCKED debate-command lanes",
        body: "Lines flagged needs_review or BLOCKED in debate-command stay off stage — cut before rehearsal, not during broadcast.",
      },
      {
        title: "Quotable gate",
        body: DAY7_QUOTABLE_RULE,
      },
      {
        title: "Common mistakes",
        body: "Adding one more stat under pressure. Keeping BLOCKED lines for 'just in case.' Skipping staff sign-off before rehearsal.",
      },
    ],
    psychology: [
      {
        title: "Silence beats unverified",
        body: "Honest pause protocol applies to claims — better to bridge than invent under moderator pace.",
      },
    ],
    doNotSay: [
      "needs_review forum lines on stage script.",
      "Fresh opponent quotes from memory during final scan.",
    ],
    claimsGate: claimsGateLines,
    keyTakeaways: [
      "Zero BLOCKED lines on stage script.",
      "No new material after scan.",
      "Staff signed final claims-green script.",
    ],
    practiceSteps: [
      "Scan stage script for BLOCKED lines.",
      "Cut unverified stats — do not add new ones.",
      "Staff sign-off on final script.",
    ],
    relatedLinks: [
      { href: epDebatePrepDayConceptHref(DAY7_ID, "claims-final-cut-d7"), label: "Claims final cut concept" },
      { href: epDebatePrepDayBlockHref("day-3-superiority-map", "b3-claims"), label: "Day 3 claims gate reference" },
      { href: epDebatePrepDayExampleHref(DAY7_ID, "ex7-show-steal"), label: "Show-steal example (claims check)" },
    ],
  },
  "b7-psych-three": {
    blockId: "b7-psych-three",
    studyGuideTitle: "Three-way + ACCA psychology · 45-minute study",
    professorLead:
      "Eureka Springs geometry matches ACCA — pile-on survival with calm contrast. Hammer performs; Kelly commands with clerk bridges.",
    overview:
      "Refresh three-way dynamics before debate eve — one pile-on pivot cold, slow down when opponents perform for crowd. Claims final scan after psych refresh.",
    phases: [
      {
        minutesLabel: "0–10 min",
        title: "ACCA geometry refresh",
        steps: [
          "Read ACCA three-way psych lane — same geometry as Eureka Springs panel.",
          "Label: Kelly vs Hammer vs Pakko — not a two-way debate.",
          "Review Day 5 pile-on bridge line — claims-green only.",
          "Open three-way geometry concept once.",
        ],
      },
      {
        minutesLabel: "10–25 min",
        title: "Pile-on pivot cold rep",
        steps: [
          "Staff simulates Hammer + Pakko trust pile-on — paraphrase OK.",
          "Kelly bridges to clerks in 30s — no counter-punching Pakko.",
          "Repeat twice — boring pivot beats reactive fight.",
          "Log: felt like chess not insult? (yes / repeat once)",
        ],
      },
      {
        minutesLabel: "25–38 min",
        title: "Hammer perform-for-crowd contrast",
        steps: [
          "Staff reads Hammer high-energy closing setup.",
          "Kelly slows down — deliver quotable contrast calmly.",
          "Connect to ex7-show-steal example if not yet complete.",
          "Claims-check setup — no invented Hammer quotes.",
        ],
      },
      {
        minutesLabel: "38–45 min",
        title: "Psych gate + claims handoff",
        steps: [
          "Answer: one pile-on pivot cold under 30s? (yes / repeat)",
          "Answer: contrast reads as command not reaction? (yes / slow down)",
          "Run mini claims scan on any new lines spoken aloud.",
          "Mark block complete — tutor optional or evening close.",
        ],
      },
    ],
    deepSections: [
      {
        title: "Three-way geometry",
        body: "Kelly engages Hammer on job fit, acknowledges Pakko briefly, never wins a philosophy seminar on stage.",
      },
      {
        title: "ACCA confidence",
        body: "You have done three-way before — Eureka Springs matches ACCA panel dynamics. Name that confidence aloud once.",
      },
      {
        title: "Calm contrast",
        body: "When Hammer performs for crowd energy, slow down — volume contrast reads as command on broadcast.",
      },
      {
        title: "Common mistakes",
        body: "Counter-punching Pakko in pile-on. Matching Hammer volume. Adding new attacks during psych refresh.",
      },
    ],
    psychology: [
      {
        title: "Pile-on survival",
        body: "Bridge to clerks — let Capitol debate abstract trust. Do not fight two fronts.",
      },
    ],
    opponentForecast: [
      {
        title: "Hammer + Pakko double-team",
        body: "Trust frames invite pile-on at moderator pace — bridge line should be pre-loaded before debate day.",
      },
      {
        title: "Hammer crowd performance",
        body: "High-energy closing setup — slow Kelly contrast steals peak-end without smear.",
      },
    ],
    doNotSay: [
      "Counter-punch at Pakko instead of bridging to clerks.",
      "Unverified opponent quotes in pile-on setup.",
    ],
    claimsGate: claimsGateLines,
    keyTakeaways: [
      "One pile-on pivot cold under 30s.",
      "Calm contrast when Hammer performs.",
      "Claims scan after psych refresh.",
    ],
    practiceSteps: [
      "Read ACCA three-way refresh once.",
      "One pile-on pivot cold.",
      "Slow down when Hammer performs for crowd.",
    ],
    relatedLinks: [
      { href: epDebatePrepLaneHref("lane-d7-acca-psych"), label: "ACCA three-way psych lane" },
      { href: epDebatePrepDayConceptHref(DAY7_ID, "acca-three-way-geometry-d7"), label: "Three-way geometry concept" },
      { href: epDebatePrepDayExampleHref(DAY7_ID, "ex7-show-steal"), label: "Show-steal example" },
      { href: epOpponentBioHref("heath-pakko"), label: "Heath Pakko bio" },
    ],
  },
  "b7-tutor-final": {
    blockId: "b7-tutor-final",
    studyGuideTitle: "Final tutor office hours · 30-minute study",
    professorLead:
      "One weakness from Day 6 simulation — one drill only. Optional stretch after bookends minimum; rolls to debate-eve AM if tired.",
    overview:
      "Final correction while material is fresh — pick weakest sim segment from debrief, run one drill, stop. Not new content.",
    phases: [
      {
        minutesLabel: "0–8 min",
        title: "Pick one weakness from Day 6 debrief",
        steps: [
          "Open Day 6 sim debrief log — top 3 fixes only.",
          "Pick ONE: weakest trap, weakest SOS, or one bookend fix.",
          "If bookends minimum not complete: skip tutor — return to b7-open-close.",
          "Do not open new research — drill existing material only.",
        ],
      },
      {
        minutesLabel: "8–20 min",
        title: "One drill — speak aloud",
        steps: [
          "Run one command drill or trap pivot for chosen weakness.",
          "Three reps max — boring retrieval, not new learning.",
          "Staff times at moderator pace — 45–60s per rep.",
          "Claims-check every line before repeating.",
        ],
      },
      {
        minutesLabel: "20–30 min",
        title: "Stop gate — no rabbit holes",
        steps: [
          "Answer: one weakness addressed with one drill? (yes / log for Day 8 AM)",
          "Answer: stopped without adding new stats? (yes / cut additions)",
          "Answer: bookends still minimum if tutor skipped? (yes / do bookends first)",
          "Mark block complete — evening success check.",
        ],
      },
    ],
    deepSections: [
      {
        title: "Optional stretch",
        body: "Bookends block is minimum — tutor rolls to debate-eve AM if tired. Command Mode on debate day trusts seven days of work.",
      },
      {
        title: "One drill discipline",
        body: "Simulation exposed gaps — one drill closes the loop without opening new intel rabbit holes.",
      },
      {
        title: "Day 8 handoff",
        body: "Anything unresolved logs for debate-day AM protocol — no overnight research.",
      },
      {
        title: "Common mistakes",
        body: "Full script rewrite from tutor session. New trap lane research. Skipping bookends minimum for optional tutor.",
      },
    ],
    psychology: [
      {
        title: "Retrieval not ingestion",
        body: "Final tutor is spaced retrieval under fatigue — matches debate-eve physiology.",
      },
    ],
    doNotSay: ["Fresh stats invented in tutor drill.", "New opponent quotes from memory."],
    claimsGate: claimsGateLines,
    keyTakeaways: [
      "One weakness from Day 6 debrief.",
      "One drill only — three reps max.",
      "Stopped without new research.",
    ],
    practiceSteps: [
      "Pick weakness from Day 6 debrief.",
      "Run one drill — three reps max.",
      "Stop — log for Day 8 if needed.",
    ],
    relatedLinks: [
      { href: epDebatePrepDayBlockHref(DAY7_ID, "b7-open-close"), label: "Bookends block (minimum)" },
      { href: epDebatePrepDayConceptHref(DAY7_ID, "success-check-d7"), label: "Success check concept" },
      { href: polishSurface().day6DebriefBlockHref, label: "Day 6 sim debrief source" },
      { href: epDebatePrepDayMicroLessonHref(DAY7_ID, "d7-steal"), label: "Steal the show micro-lesson" },
      { href: EP_DEBATE_PREP_REHEARSAL_HREF, label: "Rehearsal hub" },
    ],
  },
};

export function getDay7BlockStudy(blockId: string): Day1BlockStudyDeep | undefined {
  return DAY7_BLOCK_STUDY[blockId];
}

export function listDay7BlockStudyIds(): string[] {
  return Object.keys(DAY7_BLOCK_STUDY);
}
