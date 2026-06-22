/**
 * Day 6 — full study guides for each block (Election Plan drill-down).
 */
import {
  EP_DEBATE_QUESTIONS_HREF,
  EP_OPPONENT_BIOS_HREF,
  EP_TRAP_LANES_HREF,
  epDebatePrepDayBlockHref,
  epDebatePrepDayConceptHref,
  epDebatePrepDayDrillHref,
  epDebatePrepDayMicroLessonHref,
  epDebatePrepDayRehearsalHref,
  epOpponentBioHref,
  epTrapLaneHref,
} from "@/lib/election-plan/debate-prep-links";
import { epDebatePrepLaneHref } from "@/lib/election-plan/debate-prep-route-map";
import {
  DAY6_APA_SIM_FRAME,
  DAY6_SIM_CLAIMS_GATE,
  DAY6_SIM_NO_NEW_MATERIAL_WATCHOUT,
  DAY6_SIM_TRAP_LANE_IDS,
} from "@/lib/election-plan/debate-prep-day6-simulation-copy";
import { buildDay6SimulationSurface } from "@/lib/election-plan/load-day6-simulation-surface";
import { DAY6_ID } from "@/lib/election-plan/debatePrepDayDrillDown";
import type { Day1BlockStudyDeep } from "@/lib/election-plan/debatePrepDay1BlockStudy";

const claimsGateLines = [...DAY6_SIM_CLAIMS_GATE];

const simSurface = () => buildDay6SimulationSurface();

export const DAY6_BLOCK_STUDY: Record<string, Day1BlockStudyDeep> = {
  "b6-opponent-bios-lock": {
    blockId: "b6-opponent-bios-lock",
    studyGuideTitle: "Opponent bios lock-in · 30-minute study",
    professorLead:
      "Third read: memory lines and command mode sections only — not the full dossier. Speak aloud until boring, then simulation. Bios are muscle memory on stage night, not homework under lights.",
    overview:
      "Fifteen minutes per opponent on memory lines + command mode only. Hammer clerk-room and debate pivots; Pakko respect line without vote-strategy coordination. Staff runs one bait drill per opponent — Kelly bridges, does not counter-punch personality.",
    phases: [
      {
        minutesLabel: "0–8 min",
        title: "Hammer memory lines — speak twice",
        steps: [
          "Open Kim Hammer bio in election-plan — memory lines section only.",
          "Read clerk-room line aloud, then debate pivot aloud — no notes on second pass.",
          "Read authorship pivot and ranking pivot — claims-green templates only.",
          "Do not re-read full dossier — lock-in sections only tonight.",
        ],
      },
      {
        minutesLabel: "8–16 min",
        title: "Pakko memory lines — respect + bridge",
        steps: [
          "Open Heath Pakko bio — memory lines + command mode sections.",
          "Deliver respect line without sounding like coalition pitch on stage.",
          "Practice bridge when Pakko frames duopoly — agree on burden, add funded implementation.",
          "Speak Pakko debate line twice — boring is the goal.",
        ],
      },
      {
        minutesLabel: "16–24 min",
        title: "Staff bait drill — one per opponent",
        steps: [
          "Staff reads Hammer bait line from forum predicted list — paraphrase OK.",
          "Kelly delivers memory-line pivot in 30s — no new opponent quotes.",
          "Staff reads Pakko duopoly line — Kelly bridges to clerks.",
          "Log one moment that felt personal — strip emotion, keep pivot.",
        ],
      },
      {
        minutesLabel: "24–30 min",
        title: "Lock-in gate before sim",
        steps: [
          "Answer: memory lines spoken twice per opponent? (yes / roll to AM)",
          "Answer: bait drill felt boring not reactive? (yes / repeat once)",
          "Answer: ready for full sim without dossier open? (yes / 5 more min)",
          "Mark block complete — open b6-sim next.",
        ],
      },
    ],
    deepSections: [
      {
        title: "Spaced retrieval on Day 6",
        body: "After two prior reads, memory lines become automatic under sim stress — third read is lock-in, not learning.",
      },
      {
        title: "Command mode sections",
        body: "Body protocol before vocabulary — stillness while Hammer speaks is power. Do not fidget during pile-on setup.",
      },
      { title: "No new material", body: DAY6_SIM_NO_NEW_MATERIAL_WATCHOUT },
      {
        title: "Common mistakes",
        body: "Full dossier re-read under time pressure. Skipping Pakko respect line. Starting simulation without lock-in complete.",
      },
    ],
    psychology: [
      {
        title: "Predictable not personal",
        body: "Engrave opponent priorities until bait lines feel chess, not insult — Kelly's transparency under pressure is strength.",
      },
    ],
    opponentForecast: [
      {
        title: "Hammer repeat phrases",
        body: "Experience, clerk relationships from Capitol, integrity rankings — pivot to administrator job fit.",
      },
      {
        title: "Pakko protest lane",
        body: "Duopoly framing — respect participation without coordinating vote strategy on stage.",
      },
    ],
    doNotSay: [
      "Unverified act numbers from memory during bait drill.",
      "Personal attacks on pastor identity or party label.",
    ],
    claimsGate: claimsGateLines,
    keyTakeaways: [
      "Memory lines spoken twice per opponent.",
      "Staff bait drill complete — boring pivot.",
      "Ready for b6-sim without dossier open.",
    ],
    practiceSteps: [
      "Hammer memory lines ×2 aloud.",
      "Pakko memory lines ×2 aloud.",
      "One bait drill per opponent — bridge only.",
    ],
    relatedLinks: [
      { href: EP_OPPONENT_BIOS_HREF, label: "Opponent bios hub" },
      { href: epOpponentBioHref("kim-hammer"), label: "Kim Hammer bio" },
      { href: epOpponentBioHref("heath-pakko"), label: "Heath Pakko bio" },
      { href: epDebatePrepDayBlockHref(DAY6_ID, "b6-sim"), label: "Full simulation block" },
    ],
  },
  "b6-sim": {
    blockId: "b6-sim",
    studyGuideTitle: "Full simulation block · 90-minute study",
    professorLead:
      "Sixty-minute three-way dress rehearsal under fatigue — staff plays Hammer and Pakko at moderator pace. Fail in the room, not on the APA statewide broadcast. Thirty-minute debrief logs top three fixes only.",
    overview: `Run ${simSurface().segments.length} timed segments: opening → three trap lanes → pile-on → five SOS questions → closing. Use Day 5 when-X-say-Y sheet live at least three times. No new stats — claims-green only.`,
    phases: [
      {
        minutesLabel: "0–5 min",
        title: "Sim setup — roles + APA audience frame",
        steps: [
          "Assign staff: moderator, Hammer, Pakko — rotate if needed.",
          "Read stress inoculation micro-lesson once.",
          "Picture APA statewide broadcast + clerks grading competence — fail in the room with staff.",
          "Confirm Day 5 sheet has five+ verified pairs — else finish Day 5 minimum first.",
        ],
      },
      {
        minutesLabel: "5–25 min",
        title: "Bookends + trap lanes (segments 1–4)",
        steps: [
          "Segment 1: opening 90s — Day 1 script, no opponent names.",
          `Trap lanes: ${DAY6_SIM_TRAP_LANE_IDS.join(", ")} — 3 min each at Hammer pace.`,
          "Use Day 5 when-X-say-Y pair on at least one trap — log which pair.",
          "Staff marks agree-only close moments — add clerk layer when Kelly agrees.",
        ],
      },
      {
        minutesLabel: "25–45 min",
        title: "Pile-on + SOS sprint (segments 5–10)",
        steps: [
          "Segment 5: pile-on — Hammer + Pakko on trust; Kelly bridges to clerks in 30s.",
          "Five SOS questions from Day 4 mapping — 90s each, speak order 1·2·3.",
          "No new policy research — Day 4 forum topics and verified bank questions only.",
          "Log weakest SOS segment for debrief.",
        ],
      },
      {
        minutesLabel: "45–60 min",
        title: "Closing + sim complete",
        steps: [
          "Segment 11: closing 60s — Day 7 clerk-invoke template pull-forward.",
          "Hold silence 2 seconds after last word — peak-end rule.",
          "Mark sim timer complete — no new material after closing.",
          "Transition to debrief block — do not skip.",
        ],
      },
      {
        minutesLabel: "60–90 min",
        title: "Debrief — top 3 fixes only",
        steps: [
          "Log top 3 fixes only — Day 7 polishes bookends; do not rewrite whole script tonight.",
          "Staff logs: weakest trap, weakest SOS, one bookend fix.",
          "Target debate command readiness ≥70% all dimensions before travel.",
          "Preview Day 7 polish — cut weak material, do not add tonight.",
        ],
      },
    ],
    deepSections: [
      {
        title: "Sim segment spine",
        body: simSurface()
          .segments.map((s) => `${s.segmentIndex}. ${s.label} (${s.timedMinutes} min · ${s.staffRole})`)
          .join(" · "),
      },
      {
        title: "Stress inoculation",
        body: "Anxiety during simulation is the point — Command Mode under fatigue matches Jun 24–26 prep window physiology.",
      },
      { title: "APA broadcast frame", body: DAY6_APA_SIM_FRAME },
      { title: "No new content", body: DAY6_SIM_NO_NEW_MATERIAL_WATCHOUT },
      {
        title: "Common mistakes",
        body: "Adding new attacks during sim. Skipping debrief. Ignoring BLOCKED debate-command lanes in answers.",
      },
    ],
    psychology: [
      {
        title: "Integrated rehearsal",
        body: "Days 2–5 built pieces — Day 6 tests whether Kelly can retrieve under moderator pace and pile-on pressure.",
      },
    ],
    opponentForecast: [
      {
        title: "Three-way geometry",
        body: "Hammer rotates trap lanes; Pakko may join on trust — bridge first, answer clerk part second.",
      },
    ],
    doNotSay: [
      "Fresh stats invented under SOS timer.",
      "Unverified forum verbatim in sim responses.",
    ],
    claimsGate: claimsGateLines,
    keyTakeaways: [
      "60-min sim complete with opening + closing.",
      "Day 5 sheet used live ≥3 times.",
      "Top 3 fixes logged for Day 7.",
    ],
    practiceSteps: [
      "Run full segment spine with staff roles.",
      "Debrief top 3 fixes — no full script rewrite.",
      "Note readiness gaps for b6-command block.",
    ],
    relatedLinks: [
      { href: epDebatePrepLaneHref("lane-d6-full-sim"), label: "Full three-way simulation lane" },
      { href: epDebatePrepDayRehearsalHref(DAY6_ID, "rehearse-open-close-sim"), label: "Opening + closing rehearsal" },
      { href: epDebatePrepDayMicroLessonHref(DAY6_ID, "d6-stress"), label: "Stress inoculation micro-lesson" },
      { href: epDebatePrepDayBlockHref("day-5-anticipate-and-capitalize", "b5-lab-review"), label: "Day 5 capitalize sheet" },
    ],
  },
  "b6-prep": {
    blockId: "b6-prep",
    studyGuideTitle: "Trap/SOS pocket cards · 90-minute study",
    professorLead:
      "Highest trap-density review from Days 2–5 — pocket cards only, no new research. If simulation exposed gaps, note them for debrief; do not fix with fresh intel tonight.",
    overview:
      "Skim trap lanes 1–6 for pivot language at moderator pace. Review Day 5 when-X-say-Y sheet — eight pairs claims-green. Confirm five SOS questions mapped from Day 4 forum topics. Speak highest-risk pivots aloud once each.",
    phases: [
      {
        minutesLabel: "0–20 min",
        title: "Trap lanes 1–6 skim — pivot language only",
        steps: [
          "Open trap lanes hub — election-plan only.",
          "Lanes 1–2 (Day 2): 2021-vs-2025 pivot, integrity-without-participation — 60s each aloud.",
          "Lanes 3–6 (Day 5): county champion through culture-war — 60s each aloud.",
          "Log weakest lane from sim — repeat twice, no new content.",
        ],
      },
      {
        minutesLabel: "20–45 min",
        title: "Day 5 when-X-say-Y sheet review",
        steps: [
          "Open Day 5 capitalize sheet block — verify eight pair rows.",
          "Time three slowest pairs from sim debrief — 45–60s each.",
          "Claims-check every Kelly line before re-timing.",
          "Mark pairs used live in sim — note gaps for Day 7.",
        ],
      },
      {
        minutesLabel: "45–70 min",
        title: "Five SOS questions — forum mapping",
        steps: [
          "Open SOS question bank — five questions from Day 4 forum topic map.",
          "90s per question — speak order 1·2·3 aloud.",
          "Hammer line suggestion from forum lab — paraphrase OK in staff setup.",
          "Stop at five — no new bank research tonight.",
        ],
      },
      {
        minutesLabel: "70–90 min",
        title: "Pocket card assembly + success gate",
        steps: [
          "Write three highest-risk triggers on index card — claims-green Kelly lines only.",
          "One card per opponent tell — not full transcript dump.",
          "Answer: pocket cards ready for travel? (yes / staff pending)",
          "Mark block complete — readiness audit next if energy allows.",
        ],
      },
    ],
    deepSections: [
      {
        title: "Integrated packet",
        body: "Simulation gaps surface here — pocket cards catch what timed pairs missed without opening new research rabbit holes.",
      },
      {
        title: "Trap density priority",
        body: "County champion and integrity lanes recur at moderator pace — prioritize pivots that appeared weak in debrief.",
      },
      { title: "Claims gate", body: DAY6_SIM_NO_NEW_MATERIAL_WATCHOUT },
      {
        title: "Common mistakes",
        body: "Re-reading full debate prep packet cover-to-cover. Adding forum quotes not on Day 4 notecard. Trap marathon after sim fatigue.",
      },
    ],
    psychology: [
      {
        title: "Retrieval not ingestion",
        body: "Day 6 prep block is spaced retrieval — speed and clerk image, not new intel.",
      },
    ],
    doNotSay: ["needs_review forum lines on pocket card.", "Unverified opponent quotes from memory."],
    claimsGate: claimsGateLines,
    keyTakeaways: [
      "Trap lanes 1–6 skimmed aloud.",
      "Day 5 sheet gaps noted from sim.",
      "Five SOS questions rehearsed once.",
    ],
    practiceSteps: [
      "Trap lanes 1–6 — 60s pivot each.",
      "Three slowest when-X-say-Y pairs re-timed.",
      "Five SOS questions at 90s pace.",
    ],
    relatedLinks: [
      { href: EP_TRAP_LANES_HREF, label: "Trap lanes hub" },
      ...DAY6_SIM_TRAP_LANE_IDS.map((id) => ({
        href: epTrapLaneHref(id),
        label: `Trap lane · ${id}`,
      })),
      { href: EP_DEBATE_QUESTIONS_HREF, label: "SOS debate questions hub" },
      { href: epDebatePrepDayBlockHref("day-5-anticipate-and-capitalize", "b5-lab-review"), label: "Day 5 capitalize sheet" },
    ],
  },
  "b6-command": {
    blockId: "b6-command",
    studyGuideTitle: "Debate command readiness audit · 45-minute study",
    professorLead:
      "Honest readiness before travel — BLOCKED lanes on TV are worse than silence. Cut unverified lines from sim script; target ≥70% all dimensions.",
    overview:
      "Review debate command scores and blocked lanes from philosophy feed. Any BLOCKED line comes out of sim answers tonight. Adjust segment script if readiness below target — do not false-confidence into travel.",
    phases: [
      {
        minutesLabel: "0–10 min",
        title: "Open readiness audit — blocked lanes first",
        steps: [
          "Open readiness audit lane in election-plan.",
          "List every BLOCKED line — cut from sim script immediately.",
          "Silence or clerk bridge beats unverified stat on broadcast.",
          "Staff confirms cuts — Kelly does not defend blocked lines.",
        ],
      },
      {
        minutesLabel: "10–25 min",
        title: "Dimension scores — honest check",
        steps: [
          "Review philosophy feed scores per dimension — note any below 70%.",
          "Weakest dimension gets one repeat drill from sim debrief fix list.",
          "Do not inflate scores — Day 7 polish needs honest baseline.",
          "Log one dimension that felt strong — reinforce protocol.",
        ],
      },
      {
        minutesLabel: "25–40 min",
        title: "Sim script adjustment",
        steps: [
          "Cross-check sim segments against blocked lane list.",
          "Replace cut lines with claims-green templates from Day 5 sheet.",
          "Confirm opening + closing bookends still claims-green.",
          "Staff signs off on adjusted script for Day 7 polish.",
        ],
      },
      {
        minutesLabel: "40–45 min",
        title: "Readiness gate",
        steps: [
          "Target debate command readiness ≥70% all dimensions before travel.",
          "Answer: all BLOCKED lanes cut? (yes / staff pending)",
          "Answer: weakest dimension has one fix assigned? (yes)",
          "Mark block complete — if-stuck bridges if energy allows.",
        ],
      },
    ],
    deepSections: [
      {
        title: "Honest scores",
        body: "False confidence before APA broadcast travel is worse than admitting one weak lane — Day 7 exists to polish, not to discover gaps on stage.",
      },
      {
        title: "BLOCKED lane protocol",
        body: "If debate command marks a line BLOCKED, it does not appear in sim answers, pocket cards, or closing template variants.",
      },
      { title: "Claims gate", body: claimsGateLines[1]! },
      {
        title: "Common mistakes",
        body: "Ignoring blocked lanes because they 'sound good.' Adding replacement stats without claims check. Skipping audit after long sim.",
      },
    ],
    psychology: [
      {
        title: "Safety before show",
        body: "Readiness audit reduces amygdala hijack on stage — Kelly knows exactly which lines are cleared.",
      },
    ],
    claimsGate: claimsGateLines,
    keyTakeaways: [
      "BLOCKED lanes cut from sim script.",
      "Weakest dimension has one assigned fix.",
      "Readiness baseline honest for Day 7.",
    ],
    practiceSteps: [
      "List and cut BLOCKED lines.",
      "One repeat drill on weakest dimension.",
      "Staff sign-off on adjusted script.",
    ],
    relatedLinks: [
      { href: epDebatePrepLaneHref("lane-d6-readiness"), label: "Readiness audit lane" },
      { href: epDebatePrepDayConceptHref(DAY6_ID, "success-check-d6"), label: "Success check" },
      { href: epDebatePrepDayBlockHref(DAY6_ID, "b6-sim"), label: "Full simulation block" },
    ],
  },
  "b6-depth": {
    blockId: "b6-depth",
    studyGuideTitle: "If-stuck bridge phrases · 30-minute study",
    professorLead:
      "Unexpected questions and pile-on will happen — honest pause beats fake certainty. Kelly's transparency under pressure is a strength, not a weakness.",
    overview:
      "Memorize three bridge templates: unexpected question, pile-on double-team, lost thread mid-answer. Use d6-stuck-bridge command drill. One bridge must appear in sim or post-sim drill.",
    phases: [
      {
        minutesLabel: "0–8 min",
        title: "Three bridge templates — read aloud",
        steps: [
          "Bridge 1: 'Let me answer the clerk part first — because that is what this office is for.'",
          "Bridge 2: 'I'll let the Capitol debate that — I'm asking what clerks need before November.'",
          "Bridge 3: Honest pause + breath — 'Here's what I can say with confidence…'",
          "Open stuck-bridge command drill — match templates to drill copy.",
        ],
      },
      {
        minutesLabel: "8–18 min",
        title: "Speak each bridge twice — paraphrase OK",
        steps: [
          "Staff triggers unexpected question — Kelly delivers bridge 1 in 30s.",
          "Staff triggers pile-on — Kelly delivers bridge 2 without counter-punching Pakko.",
          "Staff triggers lost thread — Kelly uses bridge 3 + one clerk fact from claims-green sheet.",
          "Repeat until paraphrase feels natural — not read from notes.",
        ],
      },
      {
        minutesLabel: "18–25 min",
        title: "Connect to sim debrief",
        steps: [
          "Review sim log — where did Kelly freeze or ramble?",
          "Pick one moment — replay with bridge template.",
          "Log whether agree-only close would have helped.",
          "No new content — bridges only.",
        ],
      },
      {
        minutesLabel: "25–30 min",
        title: "Evening stretch gate",
        steps: [
          "Answer: three bridges memorized? (yes / one more rep)",
          "Answer: one bridge used in sim or drill? (yes / use in Day 7 warm-up)",
          "Mark block complete — Day 6 minimum path done if b6-sim complete.",
        ],
      },
    ],
    deepSections: [
      {
        title: "Honest pause protocol",
        body: "Voters reward calm specificity over fake certainty — bridge buys time to return to clerk lane.",
      },
      {
        title: "Pile-on survival",
        body: "Do not fight Hammer and Pakko on two fronts — rise above, pivot to clerks in one sentence.",
      },
      { title: "Stretch lane", body: "If-stuck bridges are stretch if tired — minimum path is b6-sim only." },
      {
        title: "Common mistakes",
        body: "Rambling after bridge instead of one clerk fact. Counter-punching Pakko on duopoly. Apologizing for pause.",
      },
    ],
    psychology: [
      {
        title: "Transparency as strength",
        body: "Kelly's honesty under pressure differentiates from performative politicians — bridge + breath reads as confidence.",
      },
    ],
    claimsGate: claimsGateLines,
    keyTakeaways: [
      "Three bridges spoken twice aloud.",
      "One bridge connected to sim debrief moment.",
      "Ready for Day 7 polish pass.",
    ],
    practiceSteps: [
      "d6-stuck-bridge command drill ×3.",
      "Replay one sim freeze with bridge.",
      "Preview Day 7 closing polish.",
    ],
    relatedLinks: [
      { href: epDebatePrepDayDrillHref(DAY6_ID, "d6-stuck-bridge"), label: "Stuck bridge command drill" },
      { href: epDebatePrepLaneHref("lane-d6-stuck-stretch"), label: "If-stuck bridge lane" },
      { href: epDebatePrepDayConceptHref(DAY6_ID, "integrated-rehearsal-d6"), label: "Integrated rehearsal concept" },
    ],
  },
};

export function getDay6BlockStudy(blockId: string): Day1BlockStudyDeep | undefined {
  return DAY6_BLOCK_STUDY[blockId];
}

export function listDay6BlockStudyIds(): string[] {
  return Object.keys(DAY6_BLOCK_STUDY);
}
