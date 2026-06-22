/**
 * Day 4 — full study guides for each block (Election Plan drill-down).
 */
import {
  EP_DEBATE_QUESTIONS_HREF,
  EP_FORUM_LAB_CAPITALIZE_MOVES_HREF,
  EP_FORUM_LAB_DEEP_ANALYSIS_HREF,
  EP_FORUM_TRANSCRIPT_LAB_HREF,
  EP_OPPONENT_BIOS_HREF,
  EP_OPPOSITION_DEBATE_NIGHT_HREF,
  epDebatePrepDayBlockHref,
  epDebatePrepDayConceptHref,
  epDebatePrepDayMicroLessonHref,
  epDebatePrepDayRehearsalHref,
  epOpponentBioHref,
} from "@/lib/election-plan/debate-prep-links";
import { epDebatePrepLaneHref } from "@/lib/election-plan/debate-prep-route-map";
import {
  DAY4_FORUM_INTERNAL_INTEL_LABEL,
  DAY4_FORUM_TRANSCRIPT_CLAIMS_GATE,
} from "@/lib/election-plan/debate-prep-day4-forum-intelligence-copy";
import { DAY4_ID } from "@/lib/election-plan/debatePrepDayDrillDown";
import type { Day1BlockStudyDeep } from "@/lib/election-plan/debatePrepDay1BlockStudy";

const claimsGateLines = [...DAY4_FORUM_TRANSCRIPT_CLAIMS_GATE];

export const DAY4_BLOCK_STUDY: Record<string, Day1BlockStudyDeep> = {
  "b4-lab": {
    blockId: "b4-lab",
    studyGuideTitle: "Forum transcript lab — upload, analyze, extract · 120-minute study",
    professorLead:
      "Sunday you listen like an analyst — the forum transcript is your Rosetta stone. Extract Hammer and Pakko's real language; copy five capitalize moves to a notecard. Do not memorize the whole recording or stage anything that has not passed claims review.",
    overview:
      "Ingest the three-candidate forum: upload video or paste transcript, run v1 themes and v2 deep analysis, skim predicted lines. Staff may run upload if you are exhausted. Kelly's notecard gets claims-gated lines only — raw analysis stays richer behind the scenes until verified.",
    phases: [
      {
        minutesLabel: "0–20 min",
        title: "Forum lab setup — artifact first",
        steps: [
          "Open election-plan forum transcript lab — no admin login required.",
          "Confirm forum video link or prepare pasted transcript fallback.",
          "Label notebook header: Internal tactical intelligence — not for external use until claims-cleared.",
          "Set 120-minute timer — block ends when timer ends.",
        ],
      },
      {
        minutesLabel: "20–45 min",
        title: "Upload or paste transcript",
        steps: [
          "Staff runs upload if Kelly is exhausted — paste transcript fallback is OK.",
          "Confirm artifact saved: video upload OR pasted transcript visible in lab.",
          "Skim transcript once — note one Hammer repeat phrase and one Kelly line that landed.",
          "Do not copy verbatim opponent quotes to notecard yet — mark for claims review.",
        ],
      },
      {
        minutesLabel: "45–70 min",
        title: "Run v1 analysis — themes per candidate",
        steps: [
          "Run v1 analysis in forum lab.",
          "Skim per-candidate themes — patterns only, not every sentence.",
          "Open deep analysis hub when v1 completes.",
          "Flag any quote marked needs_review — staff verifies before Kelly sees it on notecard.",
        ],
      },
      {
        minutesLabel: "70–95 min",
        title: "Run v2 deep analysis — predicted lines",
        steps: [
          "Run v2 deep analysis — executive brief + opponent profiles.",
          "Read predicted Hammer lines list — internal intel label on every verbatim quote.",
          "Pick three forum surprises — forecast vs what they actually said.",
          "Open capitalize moves hub — preview five moves for notecard (Pass 4 worksheet).",
        ],
      },
      {
        minutesLabel: "95–110 min",
        title: "Five capitalize moves — claims gate only",
        steps: [
          "Copy five capitalize move titles to notecard — claims-gated lines only.",
          "Red-line any quote without source + timestamp + green claims status.",
          "Pattern language OK on stage; verbatim forum quotes only if verified.",
          "Staff confirms export path feeds Day 5 anticipate drills.",
        ],
      },
      {
        minutesLabel: "110–120 min",
        title: "Success gate — ingest complete",
        steps: [
          "Answer: forum uploaded or transcript pasted? (yes/no)",
          "Answer: deep analysis run? (yes/no)",
          "Answer: five capitalize moves on notecard — all green? (yes/no/staff pending)",
          "Mark block complete when artifact + v2 exist; notecard can finish in Pass 4 UI.",
        ],
      },
    ],
    deepSections: [
      {
        title: "Rosetta stone transcript",
        body:
          "Concrete forum words beat abstract fear. Kelly learns what Hammer and Pakko actually said — not what staff feared they might say. Forum lab ingest feeds Days 4–5 automatically when workflow completes.",
      },
      {
        title: "Ingest — do not memorize",
        body:
          "Five capitalize moves on a notecard beats a transcript highlight dump. Sunday cognitive load comes from analysis, not trap lane marathons.",
      },
      {
        title: "Internal vs external language",
        body:
          "Forum transcript text is internal tactical intelligence until source, timestamp, and claims review make it usable externally. Kelly's notecard is the external-safe layer.",
      },
      {
        title: "Staff fallback",
        body:
          "Paste transcript OK. Kelly still reviews predicted lines list before Day 5 drills — staff verifies quotes in claims before stage.",
      },
      {
        title: "Common mistakes",
        body:
          "Memorizing every quote. Staging needs_review lines. Skipping v2 deep analysis. Adding new trap content tonight instead of extract-only.",
      },
      {
        title: "Watch-out",
        body: DAY4_FORUM_INTERNAL_INTEL_LABEL,
      },
    ],
    psychology: [
      {
        title: "Concrete beats abstract fear",
        body:
          "The forum recording replaces guesswork with real words. Kelly's nervous system calms when predictions match transcript — analyst mode first, writer second.",
      },
    ],
    opponentForecast: [
      {
        title: "Hammer repeat phrases",
        body:
          "Mark forum repeat phrases as predicted debate lines — pattern language until claims-verified. Do not invent forum quotes from memory.",
      },
    ],
    doNotSay: [
      "Unverified verbatim forum quotes on stage or social.",
      "Forum summary stats without claims ledger green.",
      "Character attacks based on transcript snippets alone.",
    ],
    claimsGate: claimsGateLines,
    keyTakeaways: [
      "Forum artifact exists (upload or paste).",
      "v1 + v2 analysis run.",
      "Five capitalize moves identified — claims-gated only on notecard.",
    ],
    practiceSteps: [
      "Upload or paste transcript.",
      "Run v1 then v2 analysis.",
      "Copy five capitalize moves — claims gate each line.",
    ],
    relatedLinks: [
      { href: EP_FORUM_TRANSCRIPT_LAB_HREF, label: "Forum transcript lab" },
      { href: EP_FORUM_LAB_DEEP_ANALYSIS_HREF, label: "Deep analysis hub" },
      { href: EP_FORUM_LAB_CAPITALIZE_MOVES_HREF, label: "Capitalize moves" },
      { href: epDebatePrepLaneHref("lane-d4-lab-deep"), label: "Forum lab full pipeline lane" },
      { href: epDebatePrepDayMicroLessonHref(DAY4_ID, "d4-lab-workflow"), label: "Forum lab workflow" },
    ],
  },
  "b4-sos": {
    blockId: "b4-sos",
    studyGuideTitle: "SOS question bank — map forum themes to moderator Qs · 60-minute study",
    professorLead:
      "Moderators recycle forum themes at press convention — map what you heard Sunday to what they will ask Monday. One Hammer repeat line per matched topic; sketch a 90s answer — not a timed sprint yet.",
    overview:
      "Open the SOS debate questions hub. Match five forum topics to bank questions. Note Hammer repeat lines per topic. Pre-load clerk-centered answer sketches — claims-verified only if citing forum quotes.",
    phases: [
      {
        minutesLabel: "0–15 min",
        title: "Open SOS bank + forum notes side by side",
        steps: [
          "Open SOS debate questions hub in election-plan.",
          "Keep forum lab notes or deep analysis open in second tab.",
          "List five forum topics that dominated the recording.",
          "Label each topic: internal intel until claims-cleared if quoting verbatim.",
        ],
      },
      {
        minutesLabel: "15–30 min",
        title: "Match five forum topics to bank questions",
        steps: [
          "For each forum topic, find closest SOS bank question.",
          "Write one-line match: forum topic → bank question title.",
          "Skip timed 90s sprint — that is Day 5.",
          "Note which topics Hammer and Pakko both touched.",
        ],
      },
      {
        minutesLabel: "30–45 min",
        title: "Hammer repeat lines per topic",
        steps: [
          "One Hammer repeat phrase per matched topic — from lab output only.",
          "Claims-check each phrase before writing on worksheet.",
          "If needs_review: write pattern language instead of verbatim.",
          "Link to forum → SOS mapping lane for stretch.",
        ],
      },
      {
        minutesLabel: "45–60 min",
        title: "90s answer sketch — clerk-centered",
        steps: [
          "One clerk-centered answer sketch per topic — bullet form.",
          "No new stats tonight — use verified superiority beats from Day 3 if needed.",
          "Mark block complete when five rows filled.",
          "Optional: open lane-d4-sos-map for deeper mapping.",
        ],
      },
    ],
    deepSections: [
      {
        title: "Moderator recycles forum",
        body:
          "Press convention moderators often echo forum themes — mapping reduces surprise. Kelly hears a version of forum questions again in Eureka Springs.",
      },
      {
        title: "Pattern vs verbatim",
        body:
          "SOS mapping uses forum patterns internally; stage answers use claims-gated lines or clerk-centered pattern language.",
      },
      {
        title: "Not Day 5 sprint",
        body: "Timed 90s per question is Day 5 SOS sprint — tonight is sketch only.",
      },
      {
        title: "Common mistakes",
        body:
          "Inventing moderator questions. Citing unverified forum quotes in answer sketches. Running timed sprint tonight.",
      },
    ],
    claimsGate: [
      ...claimsGateLines,
      "Hammer repeat lines in SOS worksheet must match claims-gated lab output.",
      "No invented moderator questions or forum quotes.",
    ],
    keyTakeaways: [
      "Five forum topics mapped to SOS bank.",
      "One Hammer repeat line per topic — verified or pattern.",
      "Clerk-centered answer sketch per match.",
    ],
    practiceSteps: [
      "Open SOS question bank.",
      "Match five forum topics.",
      "Note Hammer repeat lines — claims gate.",
    ],
    relatedLinks: [
      { href: EP_DEBATE_QUESTIONS_HREF, label: "SOS debate questions hub" },
      { href: epDebatePrepLaneHref("lane-d4-sos-map"), label: "Forum → SOS mapping lane" },
      { href: epDebatePrepDayBlockHref(DAY4_ID, "b4-lab"), label: "Forum lab block" },
    ],
  },
  "b4-rest": {
    blockId: "b4-rest",
    studyGuideTitle: "Recovery Sunday — walk, hydrate, one opening · 60-minute study",
    professorLead:
      "Forum lab is heavy cognitive load. Recovery is a block, not a failure — walk, hydrate, one 60s opening only. No new traps, stats, or transcript memorization tonight.",
    overview:
      "Sunday is ingest day. This block prevents Kelly from adding new material that bypasses claims gate. Ten-minute walk, hydrate, optional one opening rep linked to forum counter rehearsal.",
    phases: [
      {
        minutesLabel: "0–20 min",
        title: "Walk — no phone",
        steps: [
          "10-minute walk without phone — no new content research.",
          "Let forum themes settle — do not rehearse full transcript.",
          "Hydrate before sitting back down.",
        ],
      },
      {
        minutesLabel: "20–40 min",
        title: "Rest + hydration timer",
        steps: [
          "Set recovery timer for remainder of block.",
          "No trap lanes, no new opposition research.",
          "Optional: skim Day 5 teaser only — do not start Day 5 drills.",
        ],
      },
      {
        minutesLabel: "40–60 min",
        title: "One 60s opening — optional",
        steps: [
          "If energy allows: one 60s opening aloud — existing material only.",
          "Optional link: rehearse-forum-counter-60s (one predicted line, claims-gated).",
          "Stop when timer ends — save trap lanes for Day 5.",
        ],
      },
    ],
    deepSections: [
      {
        title: "Recovery is a block",
        body:
          "Ingest day cognitive load is real. Recovery prevents Sunday overload and keeps claims discipline — tired Kelly invents quotes.",
      },
      {
        title: "One rep only",
        body: "One opening or one forum counter — not a trap marathon. Day 5 converts intel to muscle memory.",
      },
      {
        title: "Common mistakes",
        body: "Adding new stats. Memorizing forum transcript during walk. Skipping recovery because forum lab felt unfinished.",
      },
      {
        title: "Sunday ingest discipline",
        body: "Recovery protects claims discipline — tired Kelly invents forum quotes. Walk first, then optional one rep only.",
      },
    ],
    claimsGate: [
      ...claimsGateLines,
      "Recovery block: no new forum quotes on notecard.",
      "One rehearsal uses claims-gated predicted line only — or pattern language.",
    ],
    keyTakeaways: ["Walk + hydrate complete.", "Zero new trap content.", "Optional one opening under 60s."],
    practiceSteps: [
      "Walk 10 minutes.",
      "Hydrate.",
      "One 60s opening if energy allows.",
    ],
    relatedLinks: [
      { href: epDebatePrepDayRehearsalHref(DAY4_ID, "rehearse-forum-counter-60s"), label: "Forum counter rehearsal" },
      { href: epDebatePrepDayBlockHref(DAY4_ID, "b4-lab"), label: "Forum lab block" },
      { href: epDebatePrepDayConceptHref(DAY4_ID, "recovery-sunday"), label: "Recovery Sunday concept" },
    ],
  },
  "b4-opponent-bios-reread": {
    blockId: "b4-opponent-bios-reread",
    studyGuideTitle: "Opponent bios re-read — forum notes in hand · 45-minute study",
    professorLead:
      "Re-read Hammer and Pakko bios with forum lab notes beside you. Compare forecast sections to what they actually said — adjust memory lines only with claims-gated forum quotes.",
    overview:
      "Elaborative rehearsal: forum reality updates mental models. Re-read both bios after lab ingest completes. One adjusted memory line per opponent — claims-verified forum quotes only.",
    phases: [
      {
        minutesLabel: "0–12 min",
        title: "Hammer bio + forum notes",
        steps: [
          "Open Hammer bio in election-plan opposition research.",
          "Keep forum deep analysis or capitalize moves visible.",
          "Compare forecast sections to transcript — what surprised you?",
          "Update one capitalize trigger if forum differs — claims gate on any quote.",
        ],
      },
      {
        minutesLabel: "12–24 min",
        title: "Pakko bio + forum notes",
        steps: [
          "Open Pakko bio — respect line ready if transcript differs from forecast.",
          "Note one Pakko forum tell for three-way geometry.",
          "Do not add unverified forum quotes to memory lines.",
        ],
      },
      {
        minutesLabel: "24–36 min",
        title: "Memory line adjustment",
        steps: [
          "Speak one adjusted Hammer memory line aloud — pattern or verified quote.",
          "Speak one Pakko respect/contrast line aloud.",
          "Cross-check opposition debate-night card for export-ready rebuttals.",
        ],
      },
      {
        minutesLabel: "36–45 min",
        title: "Lock-in & evening handoff",
        steps: [
          "Confirm bios re-read happened after forum lab — not before.",
          "Journal: one forum surprise per opponent.",
          "Preview Day 5 anticipate & capitalize teaser.",
        ],
      },
    ],
    deepSections: [
      {
        title: "Forum beats forecast",
        body:
          "Re-reading bios after forum ingest updates mental models with real words. Forecast sections are pre-forum — transcript wins.",
      },
      {
        title: "Claims on memory lines",
        body:
          "Adjusted memory lines that cite forum speech need source, timestamp, and claims green — otherwise use pattern language.",
      },
      {
        title: "Common mistakes",
        body:
          "Re-reading before lab completes. Adding unverified forum quotes. Skipping Pakko re-read.",
      },
      {
        title: "Day 5 handoff",
        body:
          "Adjusted memory lines feed Day 5 when-X-say-Y drills — claims-gated forum quotes only on stage.",
      },
    ],
    claimsGate: [
      ...claimsGateLines,
      "Bio memory line updates citing forum speech require claims green.",
    ],
    keyTakeaways: [
      "Hammer + Pakko bios re-read with forum notes.",
      "One adjusted memory line each — verified or pattern.",
      "Evening handoff to Day 5 when-X-say-Y prep.",
    ],
    practiceSteps: [
      "Hammer bio with forum notes.",
      "Pakko bio with forum notes.",
      "One memory line each — claims-check.",
    ],
    relatedLinks: [
      { href: EP_OPPONENT_BIOS_HREF, label: "Opponent bios hub" },
      { href: epOpponentBioHref("kim-hammer"), label: "Hammer bio" },
      { href: epOpponentBioHref("michael-packo"), label: "Pakko bio" },
      { href: EP_OPPOSITION_DEBATE_NIGHT_HREF, label: "Debate night card" },
      { href: EP_FORUM_TRANSCRIPT_LAB_HREF, label: "Forum lab notes" },
    ],
  },
};

export function getDay4BlockStudy(blockId: string): Day1BlockStudyDeep | undefined {
  return DAY4_BLOCK_STUDY[blockId];
}

export function listDay4BlockStudyIds(): string[] {
  return Object.keys(DAY4_BLOCK_STUDY);
}
