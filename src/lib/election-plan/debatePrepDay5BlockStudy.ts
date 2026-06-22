/**
 * Day 5 — full study guides for each block (Election Plan drill-down).
 */
import {
  EP_DEBATE_PREP_TUTOR_HREF,
  EP_DEBATE_QUESTIONS_HREF,
  EP_FORUM_LAB_CAPITALIZE_MOVES_HREF,
  EP_FORUM_TRANSCRIPT_LAB_HREF,
  EP_TRAP_LANES_HREF,
  epDebatePrepDayBlockHref,
  epDebatePrepDayConceptHref,
  epDebatePrepDayDrillHref,
  epDebatePrepDayExampleHref,
  epDebatePrepDayMicroLessonHref,
  epTrapLaneHref,
} from "@/lib/election-plan/debate-prep-links";
import { epDebatePrepLaneHref } from "@/lib/election-plan/debate-prep-route-map";
import {
  DAY5_INTERNAL_INTEL_HANDOFF,
  DAY5_NO_NEW_STATS_WATCHOUT,
  DAY5_RETRIEVAL_DAY_LABEL,
  DAY5_WHEN_X_SAY_Y_CLAIMS_GATE,
} from "@/lib/election-plan/debate-prep-day5-anticipate-copy";
import { DAY5_ID } from "@/lib/election-plan/debatePrepDayDrillDown";
import type { Day1BlockStudyDeep } from "@/lib/election-plan/debatePrepDay1BlockStudy";

const claimsGateLines = [...DAY5_WHEN_X_SAY_Y_CLAIMS_GATE];

const TRAP_LANES_3_6 = [
  { id: "county-champion", label: "Trap lane 3 · county champion" },
  { id: "integrity-without-participation", label: "Trap lane 4 · integrity without participation" },
  { id: "fraud-data-dare", label: "Trap lane 5 · fraud data dare" },
  { id: "culture-war-escalation", label: "Trap lane 6 · culture-war escalation" },
] as const;

export const DAY5_BLOCK_STUDY: Record<string, Day1BlockStudyDeep> = {
  "b5-lab-review": {
    blockId: "b5-lab-review",
    studyGuideTitle: "Forum lab review + capitalize sheet · 60-minute study",
    professorLead:
      "Day 4 ingested the forum — today you pull it forward under time pressure. Build eight when-X-say-Y pairs from green notecard lines only. Countering puts you in Hammer's frame; capitalize moves to clerks in one sentence.",
    overview:
      "Import Day 4 green notecard lines into a personal capitalize sheet. Merge forum lab export and deep analysis command drills. Claims-check every Kelly line, then time each pair 45–60s. Optional mock moderator block once if energy allows.",
    phases: [
      {
        minutesLabel: "0–10 min",
        title: "Import Day 4 green lines",
        steps: [
          "Open forum transcript lab and capitalize moves hub — election-plan only.",
          "Confirm Day 4 artifact exists: v1 + v2 analysis run, five+ capitalize moves identified.",
          "Copy green notecard lines to capitalize sheet — claims-gated only.",
          "If Day 4 minimum incomplete: stop and finish forum lab ingest before timed pairs.",
        ],
      },
      {
        minutesLabel: "10–25 min",
        title: "Pair builder — eight when-X-say-Y rows",
        steps: [
          "For each green line: write trigger (Hammer paraphrase OK) + Kelly capitalize response.",
          "Kelly line must be claims-green — no needs_review forum verbatim in responses.",
          "Target eight pairs — five minimum for tonight success check.",
          "Open capitalize vs counter micro-lesson if any row feels like pure counter-punch.",
        ],
      },
      {
        minutesLabel: "25–45 min",
        title: "45–60s timer × eight pairs",
        steps: [
          "Staff reads trigger — Kelly delivers capitalize line before trigger finishes when possible.",
          "45s per pair minimum — stretch to 60s if pivot needs clerk image.",
          "No new stats invented under timer — Day 4 lines and verified templates only.",
          "Log slowest pair — repeat twice before moving to trap block.",
        ],
      },
      {
        minutesLabel: "45–55 min",
        title: "Mock moderator once (optional stretch)",
        steps: [
          "Staff runs one mock moderator block from forum lab deep analysis.",
          "Kelly uses sheet pairs — do not improvise new opponent quotes.",
          "Skip if tired after eight timed pairs — minimum path is complete.",
        ],
      },
      {
        minutesLabel: "55–60 min",
        title: "Success gate — capitalize sheet ready",
        steps: [
          "Answer: eight pairs on sheet? (yes / five minimum / staff pending)",
          "Answer: every Kelly line claims-green? (yes / staff pending)",
          "Answer: slowest pair repeated twice? (yes / skip if minimum only)",
          "Mark block complete — trap lanes 3–6 next or roll to Tuesday AM.",
        ],
      },
    ],
    deepSections: [
      {
        title: "Implementation intentions",
        body:
          "When Hammer says X, Kelly says Y — pre-loaded responses beat generic prep under cortisol. Triggers may paraphrase; Kelly lines must pass claims gate.",
      },
      {
        title: "Capitalize vs counter",
        body:
          "Countering keeps you in Hammer's frame. Capitalizing names what clerks need next — one sentence bridge from their line to your lane.",
      },
      { title: "Day 4 handoff", body: DAY5_INTERNAL_INTEL_HANDOFF },
      { title: "No new content today", body: DAY5_NO_NEW_STATS_WATCHOUT },
      {
        title: "Common mistakes",
        body:
          "Inventing forum quotes from memory. Staging needs_review lines. Adding fresh trap research instead of timed retrieval. Counter-punching when capitalize line exists.",
      },
      { title: "Watch-out", body: DAY5_RETRIEVAL_DAY_LABEL },
    ],
    psychology: [
      {
        title: "Spaced retrieval",
        body:
          "Pull yesterday's forum intel forward under time pressure — Command Mode is preparation, not improvisation.",
      },
    ],
    opponentForecast: [
      {
        title: "Hammer repeat phrases from forum",
        body: "Use Day 4 predicted lines as trigger labels — pattern language until claims-verified.",
      },
    ],
    doNotSay: [
      "Unverified verbatim forum quotes in Kelly responses.",
      "New opponent claims or stats invented under the timer.",
      "Pure counter-punch without clerk-centered capitalize beat.",
    ],
    claimsGate: claimsGateLines,
    keyTakeaways: [
      "Day 4 green lines imported to capitalize sheet.",
      "Eight when-X-say-Y pairs — all Kelly lines claims-green.",
      "Each pair timed once at 45–60s.",
    ],
    practiceSteps: [
      "Import Day 4 green notecard lines.",
      "Build eight pairs — claims-check every Kelly line.",
      "Time each pair 45–60s.",
    ],
    relatedLinks: [
      { href: EP_FORUM_TRANSCRIPT_LAB_HREF, label: "Forum transcript lab" },
      { href: EP_FORUM_LAB_CAPITALIZE_MOVES_HREF, label: "Capitalize moves hub" },
      { href: epDebatePrepLaneHref("lane-d5-capitalize"), label: "Eight timed pairs lane" },
      { href: epDebatePrepDayMicroLessonHref(DAY5_ID, "d5-capitalize"), label: "Capitalize micro-lesson" },
      { href: epDebatePrepDayConceptHref(DAY5_ID, "when-x-say-y-d5"), label: "When X say Y concept" },
    ],
  },
  "b5-trap-all": {
    blockId: "b5-trap-all",
    studyGuideTitle: "Trap lanes 3–6 · timed sprint · 90-minute study",
    professorLead:
      "Day 2 covered lanes 1–2. Forum intel fills gaps in lanes 3–6. Sixty seconds per lane, speak aloud. Log weakest lane for Day 6 simulation staff debrief.",
    overview:
      "Open trap lanes 3–6 in election-plan. Run each lane cold at moderator pace — 60s per lane. Combine forum-derived triggers with existing playbook scripts.",
    phases: [
      {
        minutesLabel: "0–15 min",
        title: "Lane 3 · county champion",
        steps: [
          "Open county-champion trap lane in election-plan.",
          "Read Hammer setup + Kelly pivot script once.",
          "Staff reads trigger — Kelly delivers pivot in 60s on timer.",
          "Note: did pivot land on clerks or drift to Capitol credit?",
        ],
      },
      {
        minutesLabel: "15–30 min",
        title: "Lane 4 · integrity without participation",
        steps: [
          "Open integrity-without-participation lane.",
          "Frank Donnelly profile: integrity without fear-mongering.",
          "60s cold rep — speak pivot aloud.",
          "Claims-check any forum quote before using verbatim in trigger.",
        ],
      },
      {
        minutesLabel: "30–45 min",
        title: "Lane 5 · fraud data dare",
        steps: [
          "Open fraud-data-dare lane.",
          "Kelly does not accept dare to prove negative — pivot to clerk service desk.",
          "60s cold rep — slow voice, concrete clerk image.",
          "Optional second round if first rep felt rushed.",
        ],
      },
      {
        minutesLabel: "45–60 min",
        title: "Lane 6 · culture-war + weakest-lane log",
        steps: [
          "Open culture-war-escalation lane — do not take bait.",
          "60s cold rep — bridge to clerks, not crossfire.",
          "Log weakest lane (3–6) for Day 6 simulation debrief.",
          "Optional second round on weakest lane — stop at 90 min.",
        ],
      },
    ],
    deepSections: [
      {
        title: "Interleaved practice",
        body: "Hammer rotates lanes when one trap fails. Kelly needs lanes 3–6 cold at moderator pace.",
      },
      {
        title: "Weakest lane log",
        body: "Day 6 full simulation replays weakest lane — log choice tonight.",
      },
      {
        title: "Common mistakes",
        body: "Re-teaching lanes 1–2. Silent read instead of speak-aloud. Inventing new Hammer quotes.",
      },
    ],
    psychology: [
      {
        title: "Coach Pat Nolan · rural clerk jury",
        body: "County champion lane speaks to clerks who need a champion, not a Capitol author.",
      },
    ],
    opponentForecast: [
      {
        title: "Lane rotation under pressure",
        body: "Hammer escalates to culture-war or fraud dare when clerk pivot lands.",
      },
    ],
    doNotSay: [
      "New opponent character claims not in playbook or claims ledger.",
      "Fear-mongering instead of clerk-centered pivot.",
    ],
    claimsGate: [
      ...claimsGateLines,
      "Trap lane scripts use existing playbook text — no new opponent claims tonight.",
    ],
    keyTakeaways: [
      "Lanes 3–6 each get one 60s cold rep.",
      "Weakest lane logged for Day 6 sim.",
      "Speak aloud — not silent read.",
    ],
    practiceSteps: [
      "Open trap lanes 3–6 in election-plan.",
      "60s per lane — speak pivot aloud.",
      "Log weakest lane for Day 6.",
    ],
    relatedLinks: [
      { href: EP_TRAP_LANES_HREF, label: "Trap lanes hub" },
      ...TRAP_LANES_3_6.map((lane) => ({ href: epTrapLaneHref(lane.id), label: lane.label })),
      { href: epDebatePrepLaneHref("lane-d5-trap-sprint"), label: "Trap sprint lane" },
      { href: epDebatePrepDayDrillHref(DAY5_ID, "d5-pileon-pivot"), label: "Pile-on command drill" },
    ],
  },
  "b5-sos-sprint": {
    blockId: "b5-sos-sprint",
    studyGuideTitle: "SOS question sprint — five timed · 75-minute study",
    professorLead:
      "Pick five SOS questions mapped from Day 4 forum topics — ninety seconds each, speak order 1·2·3 aloud.",
    overview:
      "Open SOS debate questions hub. Pre-fill five questions from Day 4 SOS mapping. Run 90s timer per question. Stop after five — no new policy research tonight.",
    phases: [
      {
        minutesLabel: "0–15 min",
        title: "Pick five from Day 4 SOS map",
        steps: [
          "Open SOS debate questions hub in election-plan.",
          "Pull Day 4 forum topic → bank question matches.",
          "Select five questions — prioritize forum themes both opponents touched.",
          "Write speak-order reminder: beat 1 · beat 2 · beat 3.",
        ],
      },
      {
        minutesLabel: "15–35 min",
        title: "Questions 1–2 · 90s each",
        steps: [
          "Staff reads question 1 — start 90s timer.",
          "Kelly delivers answer with speak order 1·2·3.",
          "Claims-check any forum quote before citing verbatim.",
          "Repeat for question 2.",
        ],
      },
      {
        minutesLabel: "35–55 min",
        title: "Questions 3–4 · 90s each",
        steps: [
          "Question 3 on timer — clerk-centered image required.",
          "Question 4 on timer — bridge from forum theme if applicable.",
          "No browsing full bank mid-sprint.",
          "Log slowest question for one repeat at end.",
        ],
      },
      {
        minutesLabel: "55–75 min",
        title: "Question 5 + checklist",
        steps: [
          "Question 5 on timer — 90s hard stop.",
          "Repeat slowest question once if time remains.",
          "Checklist: five complete? speak order each time? claims-green?",
          "Mark block complete.",
        ],
      },
    ],
    deepSections: [
      {
        title: "Timed retrieval",
        body: "Day 4 mapped forum themes to bank questions — Day 5 tests pull speed at moderator pace.",
      },
      {
        title: "Speak order 1·2·3",
        body: "Who you served · what broke · how you fix it for clerks — under 90s clock.",
      },
      {
        title: "Common mistakes",
        body: "Researching new policy mid-sprint. Abstract answers without clerk image.",
      },
    ],
    psychology: [
      {
        title: "Marcia Truman · skeptical administrator",
        body: "Rewards concrete SOS desk implementation over abstract integrity slogans.",
      },
    ],
    opponentForecast: [
      {
        title: "Forum theme recycle",
        body: "Expect moderator questions that mirror Sunday forum topics.",
      },
    ],
    doNotSay: [
      "Unverified forum quotes in timed answers.",
      "Bill-number laundry lists instead of administrator beats.",
    ],
    claimsGate: claimsGateLines,
    keyTakeaways: [
      "Five SOS questions picked from Day 4 map.",
      "90s per question with speak order 1·2·3.",
      "Slowest question repeated once if time allows.",
    ],
    practiceSteps: [
      "Pick five questions from Day 4 SOS mapping.",
      "90s timer per question — speak aloud.",
      "Claims-check forum quotes before verbatim use.",
    ],
    relatedLinks: [
      { href: EP_DEBATE_QUESTIONS_HREF, label: "SOS debate questions hub" },
      { href: epDebatePrepDayBlockHref(DAY5_ID, "b5-lab-review"), label: "Capitalize sheet block" },
      { href: epDebatePrepDayConceptHref(DAY5_ID, "goal-for-kelly-d5"), label: "Goal for Kelly" },
    ],
  },
  "b5-tutor": {
    blockId: "b5-tutor",
    studyGuideTitle: "AI tutor · moot court 30 min · 45-minute block",
    professorLead:
      "Thirty minutes on forum-derived Hammer lines only. One debrief note for staff when timer ends.",
    overview:
      "Open debate prep tutor with forum Hammer preset. Run 30-minute moot. Skip if tired after capitalize minimum.",
    phases: [
      {
        minutesLabel: "0–10 min",
        title: "Open tutor · forum Hammer preset",
        steps: [
          "Open debate prep tutor in election-plan.",
          "Select forum-derived Hammer context.",
          "Keep capitalize sheet visible.",
          "Set 30-minute moot timer.",
        ],
      },
      {
        minutesLabel: "10–40 min",
        title: "30-minute moot session",
        steps: [
          "Staff or tutor reads Hammer triggers — claims-gated only.",
          "Kelly responds with capitalize lines and trap pivots.",
          "If pile-on starts: bridge to clerks.",
          "Pause only for claims uncertainty.",
        ],
      },
      {
        minutesLabel: "40–45 min",
        title: "Debrief note + close",
        steps: [
          "One debrief note: strongest pair, weakest lane, one fix for tomorrow.",
          "No new material after timer.",
          "Mark block complete or skip if capitalize minimum was enough.",
        ],
      },
    ],
    deepSections: [
      {
        title: "Adversarial drill",
        body: "Moot court adds unpredictable follow-ups — forum Hammer lines only keeps claims discipline.",
      },
      {
        title: "Skip if tired",
        body: "Capitalize sheet + eight timed pairs is the Day 5 minimum.",
      },
      {
        title: "Common mistakes",
        body: "Generic tutor topics. Pakko philosophy seminar. Inventing new Hammer quotes mid-moot.",
      },
    ],
    psychology: [
      {
        title: "Stress inoculation preview",
        body: "Day 6 runs full simulation — tonight's moot is a lighter adversarial rep if energy allows.",
      },
    ],
    opponentForecast: [
      {
        title: "Forum-derived Hammer only",
        body: "Moot triggers should match Day 4 predicted lines.",
      },
    ],
    doNotSay: [
      "Unverified forum quotes in moot responses.",
      "New material after 30-minute timer.",
    ],
    claimsGate: claimsGateLines,
    keyTakeaways: [
      "Tutor opened with forum Hammer preset.",
      "30-minute moot completed or block skipped if tired.",
      "One debrief note captured for staff.",
    ],
    practiceSteps: [
      "Open tutor with forum Hammer context.",
      "30-minute moot — forum lines only.",
      "One debrief note — no new material after timer.",
    ],
    relatedLinks: [
      { href: EP_DEBATE_PREP_TUTOR_HREF, label: "Debate prep tutor" },
      { href: epDebatePrepLaneHref("lane-d5-moot-stretch"), label: "AI moot court lane" },
      { href: EP_FORUM_TRANSCRIPT_LAB_HREF, label: "Forum Hammer lines source" },
      { href: epDebatePrepDayExampleHref(DAY5_ID, "ex5-pileon"), label: "Pile-on example" },
    ],
  },
};

export function getDay5BlockStudy(blockId: string): Day1BlockStudyDeep | undefined {
  return DAY5_BLOCK_STUDY[blockId];
}

export function listDay5BlockStudyIds(): string[] {
  return Object.keys(DAY5_BLOCK_STUDY);
}
