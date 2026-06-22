/**
 * Election Plan — per-day drill-down pages (concepts, blocks, examples, rehearsal, micro-lessons, drills).
 * Days 1–6 wired; other days return empty until expanded.
 */
import {
  EP_DEBATE_PREP_BRIEFINGS_HREF,
  EP_DEBATE_PREP_PSYCHOLOGY_HREF,
  EP_DEBATE_PREP_REHEARSAL_HREF,
  EP_DEBATE_PREP_TUTOR_HREF,
  EP_EXECUTIVE_BOOK_HREF,
  EP_FORUM_TRANSCRIPT_LAB_HREF,
  EP_OPPONENT_BIOS_HREF,
  EP_OPPOSITION_RESEARCH_HREF,
  epDebatePrepBriefingHref,
  epDebatePrepDayBlockHref,
  epDebatePrepDayConceptHref,
  epDebatePrepDayDrillHref,
  epDebatePrepDayExampleHref,
  epDebatePrepDayMicroLessonHref,
  epDebatePrepDayRehearsalHref,
  epDebatePrepPsychologySectionHref,
  epOpponentBioHref,
  epOppositionResearchModuleHref,
  epTrapLaneHref,
} from "@/lib/election-plan/debate-prep-links";
import { epDebatePrepLaneHref } from "@/lib/election-plan/debate-prep-route-map";
import {
  buildDay4Blocks,
  buildDay4Drills,
  buildDay4Examples,
  buildDay4MicroLessons,
  DAY4_CONCEPTS,
  DAY4_REHEARSAL,
} from "@/lib/election-plan/debatePrepDay4Registry";
import {
  buildDay5Blocks,
  buildDay5Drills,
  buildDay5Examples,
  buildDay5MicroLessons,
  DAY5_CONCEPTS,
  DAY5_REHEARSAL,
} from "@/lib/election-plan/debatePrepDay5Registry";
import {
  buildDay6Blocks,
  buildDay6Drills,
  buildDay6MicroLessons,
  DAY6_CONCEPTS,
  DAY6_REHEARSAL,
} from "@/lib/election-plan/debatePrepDay6Registry";
import { getDay1BlockStudy } from "@/lib/election-plan/debatePrepDay1BlockStudy";
import { getBlockTheoryExpansion } from "@/lib/intelligence/v4/debateWeekIntensive2026V3";
import { getDayDeepOverlay } from "@/lib/intelligence/v4/debateWeekIntensive2026Deep";
import {
  getDebateWeekIntensiveDay,
  type IntensiveDayId,
} from "@/lib/intelligence/v4/debateWeekIntensive2026";

export const DAY1_ID = "day-1-command-foundation" as const satisfies IntensiveDayId;
export const DAY2_ID = "day-2-read-the-table" as const satisfies IntensiveDayId;
export const DAY3_ID = "day-3-superiority-map" as const satisfies IntensiveDayId;
export const DAY4_ID = "day-4-forum-intelligence" as const satisfies IntensiveDayId;
export const DAY5_ID = "day-5-anticipate-and-capitalize" as const satisfies IntensiveDayId;
export const DAY6_ID = "day-6-full-simulation" as const satisfies IntensiveDayId;

export type DrillDownDayId =
  | typeof DAY1_ID
  | typeof DAY2_ID
  | typeof DAY3_ID
  | typeof DAY4_ID
  | typeof DAY5_ID
  | typeof DAY6_ID;

const DRILL_DOWN_DAY_ID_SET = new Set<IntensiveDayId>([
  DAY1_ID,
  DAY2_ID,
  DAY3_ID,
  DAY4_ID,
  DAY5_ID,
  DAY6_ID,
]);

export type DrillDownLink = { href: string; label: string };

export type DayConceptDrillDown = {
  id: string;
  label: string;
  summary: string;
  sections: Array<{ title: string; body: string }>;
  practiceSteps: string[];
  relatedLinks: DrillDownLink[];
};

export type DayBlockDrillDown = {
  blockId: string;
  title: string;
  minutes: number;
  activity: string;
  why: string;
  sections: Array<{ title: string; body: string }>;
  practiceSteps: string[];
  relatedLinks: DrillDownLink[];
};

export type DayExampleDrillDown = {
  id: string;
  opponent: string;
  theirMove: string;
  kellyResponse: string;
  whyItWorks: string;
  sourceNote: string;
  sections: Array<{ title: string; body: string }>;
  alternateLines: string[];
  practiceSteps: string[];
  relatedLinks: DrillDownLink[];
};

export type DayRehearsalDrillDown = {
  id: string;
  label: string;
  durationLabel: string;
  script: string;
  presenceNotes: string[];
  successCheck: string[];
  relatedLinks: DrillDownLink[];
};

export type DayMicroLessonDrillDown = {
  id: string;
  title: string;
  readMinutes: number;
  body: string;
  practiceSteps: string[];
  relatedLinks: DrillDownLink[];
};

export type DayCommandDrillDown = {
  id: string;
  ifTheySay: string;
  youSay: string;
  thenScan: string;
  claimsNote?: string;
  practiceSteps: string[];
  relatedLinks: DrillDownLink[];
};

const DAY1_CONCEPTS: DayConceptDrillDown[] = [
  {
    id: "command-focus",
    label: "Command focus",
    summary: "Establish physical protocol: feet planted, shoulders down, pause before answer one.",
    sections: [
      {
        title: "What Command Mode means on Day 1",
        body:
          "Command Mode is not a persona — it is a body protocol borrowed from high-stakes communication training: scan, exhale, answer in your lane, never chase bait. Day 1 trains stillness before vocabulary because adrenaline narrows working memory.",
      },
      {
        title: "The four-step ASP-style protocol",
        body:
          "1) Feet shoulder-width, weight even. 2) Exhale before the mic opens (4-4-6 breath). 3) First sentence under twelve words when possible. 4) Hands still until a gesture carries meaning. Politicians look calm because they rehearsed stillness — not because they feel calm.",
      },
      {
        title: "Why pause is power",
        body:
          "A two-second pause after the moderator says your name reads as confidence, not fear. Rush reads as panic. If Hammer speaks first, stillness while he talks is power — do not fidget.",
      },
    ],
    practiceSteps: [
      "Stand and run 4-4-6 breath twice with eyes open.",
      "Deliver an opening under twelve words, pause, then second sentence.",
      "Mirror check: no sway; hands still until gesture serves a point.",
      "Repeat twice without notes — mark block b1-posture complete when done.",
    ],
    relatedLinks: [
      { href: epDebatePrepDayBlockHref(DAY1_ID, "b1-posture"), label: "Posture block deep dive" },
      { href: epDebatePrepLaneHref("lane-d1-asp-deep"), label: "ASP command protocol lane" },
    ],
  },
  {
    id: "psychology-principle",
    label: "Psychology principle",
    summary: "Adult learning safety — reduce threat first. You cannot absorb trap lanes while adrenaline is high.",
    sections: [
      {
        title: "Adult-education pacing",
        body:
          "Adults learn under threat poorly. Day 1 is body and philosophy, not trap lanes, because you cannot absorb opponent content while your nervous system is screaming. Each day adds one layer: observe → stack qualifications → ingest forum → capitalize → simulate → refine → execute.",
      },
      {
        title: "Safety before skill",
        body:
          "Skipping to 'what Hammer will say' before Kelly feels grounded produces memorized lines that collapse on stage. If tonight feels like too much, finish posture + author/administrator — that is a successful Day 1.",
      },
      {
        title: "Naming fear reduces it",
        body:
          "Metacognition — writing one sentence on what scares you and one on what you offer the room — reduces amygdala hijack. Honesty plus steady body is a combination performative politicians rarely show.",
      },
    ],
    practiceSteps: [
      "Write one sentence: what scares me about the stage.",
      "Write one sentence: what I offer the room.",
      "Read psychology manual intro + atmosphere overview (linked below).",
      "Say both sentences aloud to one person or on video.",
    ],
    relatedLinks: [
      { href: epDebatePrepPsychologySectionHref("advanced-candidate-manual-intro"), label: "Psychology · manual intro" },
      { href: epDebatePrepPsychologySectionHref("atmosphere-management-overview"), label: "Psychology · atmosphere overview" },
      { href: epDebatePrepDayBlockHref(DAY1_ID, "b1-psych"), label: "Psychology block deep dive" },
    ],
  },
  {
    id: "goal-for-kelly",
    label: "Goal for Kelly",
    summary:
      "Internalize that you are not performing a character. You are the most qualified administrator in the race — your job tonight is to let the room feel that before Hammer speaks.",
    sections: [
      {
        title: "Administrator, not performer",
        body:
          "Kelly's biography — nonprofit CEO, community listener, mother, executive — is psychologically distinct from Hammer's legislative combat. Day 1 goal is to let that administrator identity land in the room before any opponent contrast.",
      },
      {
        title: "Innocence is an asset",
        body:
          "Voters distrust performative politicians. Kelly has never debated — that reads as honest if her body is steady. Do not apologize for being new; anchor on competence she already has in clerk rooms and deadlines.",
      },
      {
        title: "Job fit is the home base",
        body:
          "Every Day 1 block supports one frame: writing law and running the office clerks depend on are different jobs. Return to that frame whenever content feels overwhelming.",
      },
    ],
    practiceSteps: [
      "Speak the author vs administrator line once without notes.",
      "Record 60s opening — no opponent names; clerk partnership only.",
      "Staff asks: 'Why are you running?' — answer in administrator frame only.",
    ],
    relatedLinks: [
      { href: epDebatePrepBriefingHref("author-vs-administrator"), label: "Author vs administrator briefing" },
      { href: epDebatePrepDayMicroLessonHref(DAY1_ID, "d1-innocence"), label: "Micro-lesson · innocence is not weakness" },
    ],
  },
  {
    id: "success-check",
    label: "Success check",
    summary: "Kelly completes breathing protocol twice without notes; can deliver author vs administrator line naturally.",
    sections: [
      {
        title: "Minimum viable Day 1",
        body:
          "If you only finish posture + author/administrator blocks, mark Day 1 in progress and stop — cramming stretch lanes under stress defeats adult-education pacing.",
      },
      {
        title: "Breathing protocol check",
        body:
          "Two full 4-4-6 cycles without checking notes; first spoken sentence starts after a visible pause. Shoulders down while listening to moderator or Hammer.",
      },
      {
        title: "Contrast line check",
        body:
          "One-sentence author vs administrator pivot delivered without apology, over-explaining, or motive attack. Target: under three filler words on video replay.",
      },
    ],
    practiceSteps: [
      "Evening review: Did I finish breathing protocol twice?",
      "Can I say author vs administrator in one breath?",
      "What one fear did I name honestly in the journal?",
      "Mark day complete when all three are yes.",
    ],
    relatedLinks: [
      { href: epDebatePrepDayDrillHref(DAY1_ID, "d1-calm-open"), label: "Command drill · calm opening" },
      { href: epDebatePrepDayDrillHref(DAY1_ID, "d1-agree-add"), label: "Command drill · agree-add" },
    ],
  },
  {
    id: "newspaper-angle",
    label: "Newspaper angle",
    summary: "Draft LTE theme: 'Clerks run elections — the SOS should serve them' (APA monthly send).",
    sections: [
      {
        title: "Why clerks lead the LTE",
        body:
          "Arkansas papers reward plain competence and local respect. APA statewide LTE + visit-adjacent print amplifies a candidate who sounds like she already works for clerks — not like she wrote bills about them.",
      },
      {
        title: "Theme spine",
        body:
          "Clerks run elections in every county. The Secretary of State should be the administrator who answers their calls, funds training, and publishes rules clerks can execute — not a Capitol author taking credit from the floor.",
      },
      {
        title: "Claims gate",
        body:
          "No specific act numbers or county dollar figures in public LTE until staff verifies in claims ledger. Use role contrast and service language — safe on Day 1.",
      },
    ],
    practiceSteps: [
      "Draft 150-word LTE skeleton — clerk service frame only.",
      "Read aloud — does it sound like a job interview or a debate zinger?",
      "Staff claims-gate before APA send.",
    ],
    relatedLinks: [
      { href: EP_EXECUTIVE_BOOK_HREF, label: "Executive Book · narrative crosswalk" },
      { href: epDebatePrepBriefingHref("county-clerk-partnership"), label: "County clerk partnership briefing" },
    ],
  },
];

const DAY1_REHEARSAL: DayRehearsalDrillDown[] = [
  {
    id: "rehearse-opening-90s",
    label: "90s opening — no opponent names",
    durationLabel: "~90 seconds",
    script:
      "I'm Kelly Grappe. I'm running to run the office — a service desk for seventy-five counties that educates and unites. Clerks run elections in Arkansas. I want to be the administrator who answers their calls, funds training, and shows up when a new rule lands on a Friday. Compare records, compare readiness, compare who will show up for clerks.",
    presenceNotes: [
      "Eyes to moderator first, then one slow sweep of the room.",
      "Pause after name and after 'unites' — half-beat each.",
      "No opponent names; no bill numbers on Day 1.",
      "Hands still until 'seventy-five counties' — one open gesture only.",
    ],
    successCheck: [
      "Under 90 seconds on timer.",
      "No ums over three on replay.",
      "Ends on clerk service, not attack.",
    ],
    relatedLinks: [
      { href: `${EP_DEBATE_PREP_TUTOR_HREF}?focus=opening`, label: "AI tutor · opening focus" },
      { href: epDebatePrepDayDrillHref(DAY1_ID, "d1-calm-open"), label: "Command drill · calm opening" },
    ],
  },
  {
    id: "rehearse-agree-contrast-30s",
    label: "30s agree-but-contrast on secure elections",
    durationLabel: "~30 seconds",
    script:
      "Absolutely — we all want secure elections. And clerks need funding and answers, not just slogans. That is the job I am asking for.",
    presenceNotes: [
      "Agree in one breath — no sarcasm.",
      "Pivot word is 'And' — never stop at agreement.",
      "Slow down on 'clerks need' — that is the contrast.",
      "Stop talking after the bridge — do not pile on.",
    ],
    successCheck: [
      "Agree line + add-on under 30 seconds.",
      "Never ends on agree alone.",
      "No unverified stats.",
    ],
    relatedLinks: [
      { href: epDebatePrepBriefingHref("agree-but-never-only-agree"), label: "Agree-but-never-only-agree briefing" },
      { href: epDebatePrepDayDrillHref(DAY1_ID, "d1-agree-add"), label: "Command drill · agree-add" },
      { href: `${EP_DEBATE_PREP_REHEARSAL_HREF}?queue=standard-tonight&card=1`, label: "Rehearsal queue" },
    ],
  },
];

const DAY1_EXAMPLE: DayExampleDrillDown = {
  id: "ex1-hammer-open",
  opponent: "Hammer",
  theirMove: "Opens with election integrity ranking and 'I wrote the bills that secured Arkansas elections.'",
  kellyResponse:
    "Clerks secured those elections — in every county. I want an office that answers their calls, not one that takes credit from the Capitol.",
  whyItWorks: "Redirects authorship to service without attacking motive.",
  sourceNote: "Pattern from Hammer campaign messaging — verify in claims before broadcast.",
  sections: [
    {
      title: "What Hammer is doing",
      body:
        "Hammer collapses legislative authorship into SOS competence. Integrity rankings and 'I wrote the bills' are his default opening — he wants the room to equate lawmaking with running elections.",
    },
    {
      title: "Kelly's pivot architecture",
      body:
        "Step 1: Credit clerks who implement. Step 2: Name the SOS job as service desk. Step 3: Contrast Capitol credit vs county execution — without motive attack. Do not debate bill text line-by-line unless claims-verified.",
    },
    {
      title: "Claims gate",
      body:
        "Do not cite Heritage rankings or specific act numbers on stage until staff verifies. 'Clerks secured those elections' is frame-safe; inventing statistics is not.",
    },
  ],
  alternateLines: [
    "Senator Hammer helped write policy — the Secretary of State's job is to make sure seventy-five county clerks can execute it without going broke.",
    "Writing law and running the office clerks depend on are different jobs. I am asking for the administrator job.",
    "We all want secure elections — clerks need a SOS who answers the phone when Saline County gets a new rule at four on a Friday.",
  ],
  practiceSteps: [
    "Staff reads Hammer line verbatim — Kelly responds in 45s.",
    "Repeat until boring — target three clean takes on video.",
    "Debrief: Did I stop at agree? Did I attack motive?",
  ],
  relatedLinks: [
    { href: epDebatePrepBriefingHref("author-vs-administrator"), label: "Author vs administrator briefing" },
    { href: epTrapLaneHref("experience-equals-sos-ready"), label: "Trap lane · experience equals SOS ready" },
    { href: EP_OPPOSITION_RESEARCH_HREF, label: "Opposition research hub" },
  ],
};

function buildDay1Blocks(): DayBlockDrillDown[] {
  const plan = getDebateWeekIntensiveDay(DAY1_ID)!;
  return plan.blocks.map((block) => {
    const study = getDay1BlockStudy(block.id);
    const theory = getBlockTheoryExpansion(DAY1_ID, block.id);

    if (study) {
      return {
        blockId: block.id,
        title: study.studyGuideTitle,
        minutes: block.minutes,
        activity: block.activity,
        why: block.why,
        sections: [
          { title: "Block goal", body: block.why },
          ...study.deepSections.map((s) => ({ title: s.title, body: s.body })),
        ],
        practiceSteps: study.practiceSteps,
        relatedLinks: study.relatedLinks,
      };
    }

    const sections: Array<{ title: string; body: string }> = [
      { title: "Activity", body: block.activity },
      { title: "Why this block", body: block.why },
    ];
    if (theory) {
      sections.push(
        { title: "Adult-education rationale", body: theory.adultEducationWhy },
        { title: "What success looks like", body: theory.whatSuccessLooksLike },
        { title: "Common mistakes", body: theory.commonMistakes.join(" · ") },
      );
    }

    const relatedLinks: DrillDownLink[] = [];
    if (block.id === "b1-philosophy") {
      relatedLinks.push({ href: epDebatePrepBriefingHref("agree-but-never-only-agree"), label: "Full philosophy briefing" });
    }
    if (block.id === "b1-author") {
      relatedLinks.push({ href: epDebatePrepBriefingHref("author-vs-administrator"), label: "Full contrast briefing" });
    }
    if (block.id === "b1-psych") {
      relatedLinks.push(
        { href: EP_DEBATE_PREP_PSYCHOLOGY_HREF, label: "Psychology manual hub" },
        { href: epDebatePrepPsychologySectionHref("advanced-candidate-manual-intro"), label: "Part 1 · audience target" },
        { href: epDebatePrepPsychologySectionHref("atmosphere-management-overview"), label: "Part · atmosphere management" },
        { href: epDebatePrepPsychologySectionHref("when-audience-anxious"), label: "Part · when audience is anxious" },
      );
    }
    if (block.id === "b1-tutor") {
      relatedLinks.push({ href: epDebatePrepDayBlockHref(DAY1_ID, "b1-tutor"), label: "First impression opening study guide" });
    }
    if (block.id === "b1-posture") {
      relatedLinks.push({ href: epDebatePrepLaneHref("lane-d1-asp-deep"), label: "ASP protocol lane" });
    }
    if (theory?.stretchLaneId) {
      relatedLinks.push({ href: epDebatePrepLaneHref(theory.stretchLaneId), label: "Linked drill-down lane" });
    }

    const practiceSteps: string[] = [];
    if (block.id === "b1-posture") {
      practiceSteps.push(
        "Stand: feet shoulder-width, weight even.",
        "Run 4-4-6 breath twice with eyes open.",
        "Deliver opening under 12 words, pause, then second sentence.",
        "Mirror check: hands still until gesture carries meaning.",
      );
    } else if (block.id === "b1-philosophy") {
      practiceSteps.push(
        "Read agree-but-never-only-agree briefing.",
        "Speak 60s closing that adds clerk layer after an agree line.",
        "Record — count ums; target under three.",
      );
    } else if (block.id === "b1-author") {
      practiceSteps.push(
        "Read author vs administrator briefing.",
        "Practice: 'Sponsoring a bill is not running the office clerks depend on.'",
        "Staff calls one bait line; respond in 45s.",
      );
    } else if (block.id === "b1-psych") {
      practiceSteps.push(
        "Read psychology sections 1–3 (linked above).",
        "Journal one fear sentence + one offer sentence.",
        "Rehearse one script from atmosphere section aloud.",
      );
    } else if (block.id === "b1-tutor") {
      practiceSteps.push(
        "Open AI tutor — first impression opening only.",
        "15 minutes — do not switch modes mid-session.",
        "Repeat best opening line twice out loud after session.",
      );
    }

    return {
      blockId: block.id,
      title: block.title,
      minutes: block.minutes,
      activity: block.activity,
      why: block.why,
      sections,
      practiceSteps,
      relatedLinks,
    };
  });
}

function buildDay1MicroLessons(): DayMicroLessonDrillDown[] {
  const overlay = getDayDeepOverlay(DAY1_ID);
  return overlay.microLessons.map((lesson) => ({
    id: lesson.id,
    title: lesson.title,
    readMinutes: lesson.readMinutes,
    body: lesson.body,
    practiceSteps:
      lesson.id === "d1-asp-protocol"
        ? [
            "Read protocol once.",
            "Stand and execute all four steps on video.",
            "Replay — check shoulders and hand stillness.",
          ]
        : [
            "Read lesson once.",
            "Speak one competence fact aloud (nonprofit, clerks, deadlines).",
            "No self-deprecating apology — replace with competence anchor.",
          ],
    relatedLinks:
      lesson.id === "d1-asp-protocol"
        ? [
            { href: epDebatePrepDayBlockHref(DAY1_ID, "b1-posture"), label: "Posture block" },
            { href: epDebatePrepLaneHref("lane-d1-asp-deep"), label: "ASP protocol lane" },
          ]
        : [
            { href: epDebatePrepDayConceptHref(DAY1_ID, "goal-for-kelly"), label: "Goal for Kelly concept" },
            { href: epDebatePrepPsychologySectionHref("kelly-archetype-competent-mom-executive"), label: "Kelly archetype (psychology manual)" },
          ],
  }));
}

function buildDay1Drills(): DayCommandDrillDown[] {
  const overlay = getDayDeepOverlay(DAY1_ID);
  return overlay.commandDrills.map((drill) => ({
    id: drill.id,
    ifTheySay: drill.ifTheySay,
    youSay: drill.youSay,
    thenScan: drill.thenScan,
    claimsNote: drill.claimsNote,
    practiceSteps: [
      "Staff reads 'if they say' line.",
      "Kelly delivers 'you say' without notes.",
      "Pause — execute 'then scan' behavior.",
      "Repeat three times; mark drill complete when clean.",
    ],
    relatedLinks: [
      { href: `${EP_DEBATE_PREP_REHEARSAL_HREF}?queue=standard-tonight&card=1`, label: "Run in rehearsal queue" },
      { href: `${EP_DEBATE_PREP_TUTOR_HREF}?focus=opening`, label: "Practice in AI tutor" },
      ...(drill.id === "d1-agree-add"
        ? [{ href: epDebatePrepBriefingHref("agree-but-never-only-agree"), label: "Agree briefing" }]
        : [{ href: epDebatePrepDayRehearsalHref(DAY1_ID, "rehearse-opening-90s"), label: "90s opening script" }]),
    ],
  }));
}

const DAY2_CONCEPTS: DayConceptDrillDown[] = [
  {
    id: "scan-before-speak",
    label: "Scan before speak",
    summary: "Who is talking, who is baiting, who is splitting the room — before you counter content.",
    sections: [
      {
        title: "Command Mode on Day 2",
        body:
          "Day 1 trained your body. Day 2 trains your eyes and ears. Scan the table before you speak: moderator, Hammer, Pakko, audience energy. Rush to counter content before you read the room reads as fear.",
      },
      {
        title: "Three-way geometry preview",
        body:
          "Kelly center: engage Hammer on job fit, acknowledge Pakko briefly, never fight two fronts. When both opponents talk, stillness reads as command.",
      },
    ],
    practiceSteps: [
      "Read one Hammer forum brief — write three tells from pull quotes.",
      "Read one Pakko brief — one respect line only.",
      "Practice moderator-centered eye line while opponents speak.",
    ],
    relatedLinks: [
      { href: epDebatePrepDayBlockHref(DAY2_ID, "b2-film"), label: "Forum tell briefs block" },
      { href: epDebatePrepDayMicroLessonHref(DAY2_ID, "d2-three-way"), label: "Three-way geometry micro-lesson" },
    ],
  },
  {
    id: "observational-learning",
    label: "Observational learning",
    summary: "Study behavior before countering content — three tells per opponent is enough tonight.",
    sections: [
      {
        title: "Why observation comes before memorization",
        body:
          "Adults learn opponent patterns faster by reading forum language than by cramming bill lists. Hammer repeats authorship, ranking, mandate — predict the pivot point, not every word.",
      },
      {
        title: "Minimum viable Day 2",
        body:
          "Forum tell briefs + trap lane 1 pivot is a successful Day 2 if you are tired. Bios can roll to morning — do not cram under adrenaline.",
      },
    ],
    practiceSteps: [
      "List three Hammer tells from transcript briefs (ranking, authorship, mandate).",
      "Name one Pakko tell without attacking third-candidate status.",
      "Stop when tells are boring — that is the goal.",
    ],
    relatedLinks: [
      { href: epDebatePrepLaneHref("lane-d2-film-deep"), label: "Tell extraction lane" },
      { href: EP_FORUM_TRANSCRIPT_LAB_HREF, label: "Forum transcript lab" },
    ],
  },
  {
    id: "goal-for-kelly-d2",
    label: "Goal for Kelly",
    summary:
      "Learn Hammer's three tells (authorship, ranking, mandate) and Pakko's libertarian split — so nothing on stage surprises you.",
    sections: [
      {
        title: "Recognition beats surprise",
        body:
          "Deep opponent knowledge converts surprise into recognition. When Hammer accelerates, you slow down — contrast reads as command.",
      },
      {
        title: "Pakko respect gate",
        body:
          "Viewers punish pile-ons on third candidates. One acknowledge + pivot — never coordinate vote strategy aloud.",
      },
    ],
    practiceSteps: [
      "Speak author vs administrator line once — link to Hammer authorship tell.",
      "Deliver one Pakko respect line without sounding patronizing.",
      "Read opponent bio Day 2 phase callouts if time remains.",
    ],
    relatedLinks: [
      { href: EP_OPPONENT_BIOS_HREF, label: "Opponent biographies hub" },
      { href: epOpponentBioHref("kim-hammer"), label: "Kim Hammer bio" },
      { href: epOpponentBioHref("michael-packo"), label: "Michael Pakko bio" },
    ],
  },
  {
    id: "success-check-d2",
    label: "Success check",
    summary: "Kelly names three Hammer tells and one Pakko pivot without reading.",
    sections: [
      {
        title: "Hammer tells check",
        body:
          "Authorship collapse, integrity ranking cite, mandate language — each is a pivot to clerks and implementation, not motive attack.",
      },
      {
        title: "Pakko pivot check",
        body:
          "Agree on clerk burden, steal reform lane: unfunded mandates on the record, not more Capitol mandates without funding.",
      },
    ],
    practiceSteps: [
      "Evening review: three Hammer tells named aloud?",
      "One Pakko pivot under 30 seconds?",
      "Trap lane 1 rebuttal under 90 seconds without notes?",
    ],
    relatedLinks: [
      { href: epDebatePrepDayDrillHref(DAY2_ID, "d2-authorship-pivot"), label: "Authorship drill" },
      { href: epTrapLaneHref("experience-equals-sos-ready"), label: "Trap lane 1" },
    ],
  },
  {
    id: "three-way-geometry",
    label: "Three-way geometry",
    summary: "Kelly center — engage Hammer on job fit, acknowledge Pakko briefly, never fight two fronts.",
    sections: [
      {
        title: "Where your eyes go",
        body:
          "Audience reads furtive eye movement as uncertainty. When Hammer and Pakko both speak, look at moderator, still hands, bridge sentence to clerks.",
      },
      {
        title: "Pile-on stillness",
        body:
          "Double-team moments are when Kelly's Day 1 breathing protocol pays off. Exhale, one sentence, stop.",
      },
    ],
    practiceSteps: [
      "Opponent speaks → eyes to moderator.",
      "Practice pile-on drill with staff reading two bait lines.",
      "One bridge sentence: clerks need an administrator, not a debate.",
    ],
    relatedLinks: [
      { href: epDebatePrepDayBlockHref(DAY2_ID, "b2-coaching"), label: "Stage presence coaching block" },
      { href: epDebatePrepLaneHref("lane-d2-geometry-stretch"), label: "Eye-line geometry lane" },
      { href: EP_DEBATE_PREP_TUTOR_HREF, label: "Debate prep tutor" },
    ],
  },
];

const DAY2_REHEARSAL: DayRehearsalDrillDown[] = [
  {
    id: "rehearse-hammer-bait-60s",
    label: "Hammer bait → 60s rebuttal",
    durationLabel: "~60 seconds",
    script:
      "Writing law and running the office clerks depend on are different jobs. I am asking for the administrator job. Clerks in your county know whether the SOS office answered the phone last week — that is the ranking I care about.",
    presenceNotes: [
      "Staff reads bait verbatim — you pause one beat before answering.",
      "Slow down if Hammer's voice would be accelerating — contrast reads as command.",
      "End on clerk service, not motive attack.",
      "No specific act numbers unless claims-verified.",
    ],
    successCheck: [
      "Under 60 seconds on timer.",
      "Author vs administrator frame lands in first sentence.",
      "No agree-only close.",
    ],
    relatedLinks: [
      { href: epDebatePrepDayDrillHref(DAY2_ID, "d2-authorship-pivot"), label: "Authorship pivot drill" },
      { href: epTrapLaneHref("experience-equals-sos-ready"), label: "Trap lane · experience equals SOS" },
      { href: epDebatePrepBriefingHref("author-vs-administrator"), label: "Author vs administrator briefing" },
    ],
  },
  {
    id: "rehearse-pakko-pivot-30s",
    label: "Pakko acknowledge + pivot",
    durationLabel: "~30 seconds",
    script:
      "I agree bureaucracy can burden clerks — that is why I want unfunded mandates on the record, not more Capitol mandates without funding. The SOS should be the service desk counties can call.",
    presenceNotes: [
      "Respect line first — no sarcasm toward third candidate.",
      "Pivot word is why — bridge to administrator frame.",
      "Look at moderator on pivot, not at Pakko.",
      "Stop after bridge — do not pile on.",
    ],
    successCheck: [
      "Under 30 seconds.",
      "Sounds respectful, not patronizing.",
      "Never cedes SOS credibility to LP frame.",
    ],
    relatedLinks: [
      { href: epOpponentBioHref("michael-packo"), label: "Michael Pakko bio" },
      { href: epDebatePrepDayExampleHref(DAY2_ID, "ex2-pakko-split"), label: "Pakko split example" },
      { href: EP_OPPOSITION_RESEARCH_HREF, label: "Opposition research hub" },
    ],
  },
];

function buildDay2Examples(): DayExampleDrillDown[] {
  const plan = getDebateWeekIntensiveDay(DAY2_ID)!;
  return plan.opponentExamples.map((ex) => ({
    id: ex.id,
    opponent: ex.opponent,
    theirMove: ex.theirMove,
    kellyResponse: ex.kellyResponse,
    whyItWorks: ex.whyItWorks,
    sourceNote: ex.sourceNote,
    sections: [
      {
        title: "What they are doing",
        body: ex.theirMove,
      },
      {
        title: "Kelly pivot",
        body: ex.kellyResponse,
      },
      {
        title: "Why it works",
        body: ex.whyItWorks,
      },
      {
        title: "Claims gate",
        body: ex.sourceNote,
      },
    ],
    alternateLines:
      ex.id === "ex2-hammer-rank"
        ? [
            "Rankings measure rhetoric. I measure whether Montgomery County got her grant question answered this week.",
            "Clerks in your county know whether the SOS office answered the phone — that is the scorecard I care about.",
            "We all want secure elections — clerks need funding and answers, not abstract scorecards.",
          ]
        : [
            "I agree clerks get burdened by unfunded mandates — that is an administrator problem I will track on the record.",
            "Reform should start with what county clerks can execute — not Capitol credit.",
            "Bureaucracy burdens clerks — the SOS job is to clear the path, not add mandates.",
          ],
    practiceSteps: [
      "Staff reads their move verbatim.",
      "Kelly delivers response in 45s without notes.",
      "Repeat three times; mark complete when boring.",
    ],
    relatedLinks:
      ex.id === "ex2-hammer-rank"
        ? [
            { href: epDebatePrepDayDrillHref(DAY2_ID, "d2-ranking-pivot"), label: "Ranking pivot drill" },
            { href: epTrapLaneHref("experience-equals-sos-ready"), label: "Trap lane 1" },
            { href: EP_OPPOSITION_RESEARCH_HREF, label: "Opposition research" },
          ]
        : [
            { href: epOpponentBioHref("michael-packo"), label: "Pakko bio" },
            { href: epDebatePrepDayMicroLessonHref(DAY2_ID, "d2-three-way"), label: "Three-way geometry" },
            { href: EP_OPPOSITION_RESEARCH_HREF, label: "Opposition research" },
          ],
  }));
}

function buildDay2Blocks(): DayBlockDrillDown[] {
  const plan = getDebateWeekIntensiveDay(DAY2_ID)!;
  return plan.blocks.map((block) => {
    const theory = getBlockTheoryExpansion(DAY2_ID, block.id);
    const sections: Array<{ title: string; body: string }> = [
      { title: "Activity", body: block.activity },
      { title: "Why this block", body: block.why },
    ];
    if (theory) {
      sections.push(
        { title: "Adult-education rationale", body: theory.adultEducationWhy },
        { title: "What success looks like", body: theory.whatSuccessLooksLike },
        { title: "Common mistakes", body: theory.commonMistakes.join(" · ") },
      );
    }

    const relatedLinks: DrillDownLink[] = [];
    if (block.id === "b2-film") {
      relatedLinks.push(
        { href: EP_FORUM_TRANSCRIPT_LAB_HREF, label: "Forum lab · ACCA recording" },
        { href: epDebatePrepLaneHref("lane-d2-film-deep"), label: "Tell extraction lane" },
        { href: epOpponentBioHref("kim-hammer"), label: "Hammer bio (after clips)" },
      );
    }
    if (block.id === "b2-trap1") {
      relatedLinks.push(
        { href: epTrapLaneHref("experience-equals-sos-ready"), label: "Trap lane 1 · authorship" },
        { href: epTrapLaneHref("2021-vs-2025-pivot"), label: "Trap lane 2 · 2021 package" },
        { href: epDebatePrepLaneHref("lane-d2-trap-deep"), label: "Trap lanes speak-order lab" },
      );
    }
    if (block.id === "b2-packo") {
      relatedLinks.push(
        { href: epOpponentBioHref("michael-packo"), label: "Michael Pakko bio" },
        { href: EP_OPPOSITION_RESEARCH_HREF, label: "Opposition research · Pakko" },
        { href: epDebatePrepDayMicroLessonHref(DAY2_ID, "d2-three-way"), label: "Three-way geometry" },
      );
    }
    if (block.id === "b2-coaching") {
      relatedLinks.push(
        { href: EP_DEBATE_PREP_TUTOR_HREF, label: "Debate prep tutor" },
        { href: epDebatePrepLaneHref("lane-d2-geometry-stretch"), label: "Eye-line geometry lane" },
        { href: epDebatePrepPsychologySectionHref("when-audience-anxious"), label: "Psychology · anxious audience" },
      );
    }
    if (block.id === "b2-opponent-bios") {
      relatedLinks.push(
        { href: epOpponentBioHref("kim-hammer"), label: "Kim Hammer · first read" },
        { href: epOpponentBioHref("michael-packo"), label: "Michael Pakko · first read" },
        { href: EP_OPPONENT_BIOS_HREF, label: "Opponent bios hub" },
      );
    }
    if (theory?.stretchLaneId) {
      relatedLinks.push({ href: epDebatePrepLaneHref(theory.stretchLaneId), label: "Linked drill-down lane" });
    }

    const practiceSteps: string[] = [];
    if (block.id === "b2-film") {
      practiceSteps.push(
        "Open forum tell briefs — read one Hammer excerpt with pull quotes.",
        "Mark three tells in text — ranking cite, authorship frame, mandate language.",
        "Read one Pakko brief — note one respect line.",
        "Write tells on worksheet before any rebuttal practice.",
      );
    } else if (block.id === "b2-trap1") {
      practiceSteps.push(
        "Open trap lanes 1 and 2 in election-plan war room.",
        "Staff reads bait line — Kelly 60s rebuttal, three rounds each.",
        "Pivot until boring — log one stiff line for tomorrow.",
      );
    } else if (block.id === "b2-packo") {
      practiceSteps.push(
        "Read Pakko respect line from bio — speak aloud once.",
        "Practice acknowledge + pivot in 30s.",
        "Do not attack third-candidate status — contrast gate applies.",
      );
    } else if (block.id === "b2-coaching") {
      practiceSteps.push(
        "Read three-way geometry micro-lesson.",
        "Practice: opponent speaks → Kelly looks at moderator.",
        "One pile-on drill with staff.",
      );
    } else if (block.id === "b2-opponent-bios") {
      practiceSteps.push(
        "Read Hammer bio professor lead + priorities (30 min).",
        "Read Pakko bio + three-way section (30 min).",
        "Speak one memory line from each — debate version aloud.",
      );
    }

    return {
      blockId: block.id,
      title: block.title,
      minutes: block.minutes,
      activity: block.activity,
      why: block.why,
      sections,
      practiceSteps,
      relatedLinks,
    };
  });
}

function buildDay2MicroLessons(): DayMicroLessonDrillDown[] {
  const overlay = getDayDeepOverlay(DAY2_ID);
  return overlay.microLessons.map((lesson) => ({
    id: lesson.id,
    title: lesson.title,
    readMinutes: lesson.readMinutes,
    body: lesson.body,
    practiceSteps:
      lesson.id === "d2-watch-hammer"
        ? [
            "Read tell list once.",
            "Read one Hammer brief — mark authorship, ranking, mandate tells in pull quotes.",
            "Speak one pivot line per tell without notes.",
          ]
        : [
            "Read geometry lesson once.",
            "Stand — practice moderator-centered scan.",
            "Staff simulates pile-on — one bridge sentence only.",
          ],
    relatedLinks:
      lesson.id === "d2-watch-hammer"
        ? [
            { href: epDebatePrepDayBlockHref(DAY2_ID, "b2-film"), label: "Forum tell briefs block" },
            { href: epOpponentBioHref("kim-hammer"), label: "Hammer bio" },
          ]
        : [
            { href: epDebatePrepDayBlockHref(DAY2_ID, "b2-coaching"), label: "Stage presence block" },
            { href: epDebatePrepDayConceptHref(DAY2_ID, "three-way-geometry"), label: "Three-way geometry concept" },
          ],
  }));
}

function buildDay2Drills(): DayCommandDrillDown[] {
  const overlay = getDayDeepOverlay(DAY2_ID);
  return overlay.commandDrills.map((drill) => ({
    id: drill.id,
    ifTheySay: drill.ifTheySay,
    youSay: drill.youSay,
    thenScan: drill.thenScan,
    claimsNote: drill.claimsNote,
    practiceSteps: [
      "Staff reads 'if they say' line.",
      "Kelly delivers 'you say' without notes.",
      "Pause — execute 'then scan' behavior.",
      "Repeat three times; mark drill complete when clean.",
    ],
    relatedLinks: [
      { href: epTrapLaneHref("experience-equals-sos-ready"), label: "Trap lane 1" },
      { href: epDebatePrepDayRehearsalHref(DAY2_ID, "rehearse-hammer-bait-60s"), label: "Hammer bait rehearsal" },
      ...(drill.id === "d2-ranking-pivot"
        ? [{ href: epDebatePrepDayExampleHref(DAY2_ID, "ex2-hammer-rank"), label: "Ranking example" }]
        : [{ href: epDebatePrepBriefingHref("author-vs-administrator"), label: "Author vs administrator briefing" }]),
    ],
  }));
}

const DAY3_CONCEPTS: DayConceptDrillDown[] = [
  {
    id: "overwhelm-with-competence",
    label: "Overwhelm with competence",
    summary: "Hammer overwhelms with bill numbers — Kelly overwhelms with three operational stories told slowly and specifically.",
    sections: [
      {
        title: "Competence beats volume",
        body:
          "Working memory holds about three items under stress. Stack three Kelly jobs — who you served, what broke, how you fixed it — then stop. Slower + specific beats fast + abstract every time.",
      },
      {
        title: "Not a résumé dump",
        body:
          "Listing every job reads as insecurity. Three beats, smile, wait. If Hammer sprays act numbers, pivot to night three of early voting — clerks need an administrator.",
      },
    ],
    practiceSteps: [
      "Pick three Kelly jobs from executive book / platform chapters.",
      "Write one clerk-relevant beat per notecard.",
      "Deliver 90s stack without bill numbers — timer on.",
    ],
    relatedLinks: [
      { href: epDebatePrepDayBlockHref(DAY3_ID, "b3-manual"), label: "Manual / framework block" },
      { href: epDebatePrepDayMicroLessonHref(DAY3_ID, "d3-overwhelm"), label: "Micro-lesson · overwhelm with competence" },
      { href: EP_EXECUTIVE_BOOK_HREF, label: "Executive book hub" },
    ],
  },
  {
    id: "three-beats-only",
    label: "Three beats only",
    summary: "Stop at three qualification beats — repetition beats breadth on stage.",
    sections: [
      {
        title: "Why three",
        body:
          "Day 3 psychology: self-efficacy through mastery. Repeat the same three beats until they feel boring — that is when they will survive adrenaline on stage.",
      },
    ],
    practiceSteps: [
      "Run qualification stack drill three times.",
      "Note urge to add a fourth job — mark it for staff research, not stage.",
      "End with then-scan: smile, pause, hands still.",
    ],
    relatedLinks: [
      { href: epDebatePrepDayDrillHref(DAY3_ID, "d3-qual-stack"), label: "Qualification stack drill" },
      { href: epDebatePrepLaneHref("lane-d3-stack"), label: "Qualification stack lane" },
    ],
  },
  {
    id: "administrator-vs-author",
    label: "Administrator vs author",
    summary: "Writing law and running the office clerks depend on are different jobs — Day 3 stacks Kelly operational history.",
    sections: [
      {
        title: "Hammer's frame vs Kelly's frame",
        body:
          "Hammer lists bill numbers as proof he can run SOS. Kelly stacks organizations managed, budgets met, people who got answers under deadline — especially for county clerks.",
      },
    ],
    practiceSteps: [
      "Speak author vs administrator line once — link to Hammer admin example.",
      "Rehearse ex3-hammer-admin response if claims gate is green.",
    ],
    relatedLinks: [
      { href: epDebatePrepBriefingHref("author-vs-administrator"), label: "Author vs administrator briefing" },
      { href: epDebatePrepDayExampleHref(DAY3_ID, "ex3-hammer-admin"), label: "Hammer admin example" },
    ],
  },
  {
    id: "research-question-frame",
    label: "Research question frame",
    summary: "Questions signal competence without claims risk — ask for the ledger, do not invent dollar amounts.",
    sections: [
      {
        title: "Funding without fabrication",
        body:
          "Clerks care about unfunded mandates. Kelly can ask where CVSGF and federal pass-through dollars landed county-by-county — research frame only unless claims-verified.",
      },
    ],
    practiceSteps: [
      "Memorize one clerk funding research question.",
      "Rehearse 60s answer — no numbers unless green in claims ledger.",
    ],
    relatedLinks: [
      { href: epDebatePrepDayBlockHref(DAY3_ID, "b3-funding"), label: "Election funding block" },
      { href: epDebatePrepLaneHref("lane-d3-funding-deep"), label: "Election funding deep lane" },
      { href: epTrapLaneHref("election-funding"), label: "Trap lane · election funding" },
    ],
  },
  {
    id: "goal-for-kelly-d3",
    label: "Goal for Kelly",
    summary:
      "Build a mental stack of Kelly advantages — SOS desk experience, clerk relationships, direct democracy organizing, nonprofit administration.",
    sections: [
      {
        title: "Superiority without arrogance",
        body:
          "Specific beats abstract. Tell who depended on you and what broke — voters read humility + competence, not bragging.",
      },
    ],
    practiceSteps: [
      "Write one sentence: which Kelly job story makes clerks nod?",
      "Read goal from day plan aloud once.",
    ],
    relatedLinks: [
      { href: epDebatePrepDayBlockHref(DAY3_ID, "b3-manual"), label: "Manual block" },
      { href: EP_EXECUTIVE_BOOK_HREF, label: "Executive book" },
    ],
  },
  {
    id: "success-check-d3",
    label: "Success check",
    summary: "Kelly recites three verified superiority points from memory.",
    sections: [
      {
        title: "Evening gate",
        body:
          "Three superiority points verified in claims? Offense move felt natural? Any stat red-lined? If yes/no/no — successful Day 3.",
      },
    ],
    practiceSteps: [
      "Recite three superiority beats without notes.",
      "Claims-check each fact used today.",
      "Log one offense move that felt natural vs forced.",
    ],
    relatedLinks: [
      { href: epDebatePrepDayBlockHref(DAY3_ID, "b3-claims"), label: "Claims gate block" },
      { href: epOppositionResearchModuleHref("claims-ledger"), label: "Claims ledger module" },
    ],
  },
];

const DAY3_REHEARSAL: DayRehearsalDrillDown[] = [
  {
    id: "rehearse-qualified-90s",
    label: "90s why I'm qualified",
    durationLabel: "~90 seconds",
    script:
      "I have managed organizations, budgets, and people under deadline — and I have organized statewide with clerks in the room, not just legislators in the Capitol. Nonprofit leadership taught me what breaks when funding is late. Direct democracy organizing taught me what clerks need on the record. That is the administrator job — not reading act numbers on night three of early voting.",
    presenceNotes: [
      "Three beats only — stop even if you want to add a fourth job.",
      "No bill numbers unless claims-verified.",
      "End with then-scan: smile, pause, wait.",
      "Slow down if you feel rushed — contrast reads as command.",
    ],
    successCheck: [
      "Under 90 seconds on timer.",
      "Three distinct Kelly jobs named.",
      "Administrator frame in first sentence.",
    ],
    relatedLinks: [
      { href: epDebatePrepDayDrillHref(DAY3_ID, "d3-qual-stack"), label: "Qualification stack drill" },
      { href: epDebatePrepDayBlockHref(DAY3_ID, "b3-manual"), label: "Manual block" },
      { href: epDebatePrepBriefingHref("author-vs-administrator"), label: "Author vs administrator briefing" },
    ],
  },
  {
    id: "rehearse-clerk-funding-60s",
    label: "60s clerk funding — research frame",
    durationLabel: "~60 seconds",
    script:
      "I've been researching how election funding flows to counties, and it is hard for the public to find county-by-county accounting. Clerks should not have to guess whether a mandate came with dollars. I will publish a grant ledger as Secretary of State — and I will ask where pass-through funds landed before we add new Capitol mandates.",
    presenceNotes: [
      "Research question frame — no invented CVSGF or HAVA totals.",
      "Look at moderator on pivot from Hammer bill spray.",
      "Clerk-centered language — not partisan attack.",
    ],
    successCheck: [
      "Under 60 seconds.",
      "Contains a research question or ledger commitment.",
      "Zero unsourced dollar amounts.",
    ],
    relatedLinks: [
      { href: epDebatePrepDayBlockHref(DAY3_ID, "b3-funding"), label: "Election funding block" },
      { href: epTrapLaneHref("election-funding"), label: "Trap lane · election funding" },
      { href: epOppositionResearchModuleHref("claims-ledger"), label: "Claims ledger" },
    ],
  },
];

function buildDay3Examples(): DayExampleDrillDown[] {
  const plan = getDebateWeekIntensiveDay(DAY3_ID)!;
  return plan.opponentExamples.map((ex) => ({
    id: ex.id,
    opponent: ex.opponent,
    theirMove: ex.theirMove,
    kellyResponse: ex.kellyResponse,
    whyItWorks: ex.whyItWorks,
    sourceNote: ex.sourceNote,
    sections: [
      { title: "What they are doing", body: ex.theirMove },
      { title: "Kelly pivot", body: ex.kellyResponse },
      { title: "Why it works", body: ex.whyItWorks },
      { title: "Claims gate", body: ex.sourceNote },
    ],
    alternateLines: [
      "I've managed organizations, budgets, and people who depend on timely answers — clerks need an administrator on night three of early voting, not a sponsor reading act numbers.",
      "Writing law and running the office clerks depend on are different jobs — I am asking for the administrator job.",
      "Rankings measure rhetoric. I measure whether your county clerk got her grant question answered this week.",
    ],
    practiceSteps: [
      "Staff reads Hammer bill-list move verbatim.",
      "Kelly delivers administrator pivot in 45s without notes.",
      "Repeat three times; mark complete when boring.",
    ],
    relatedLinks: [
      { href: epDebatePrepBriefingHref("author-vs-administrator"), label: "Author vs administrator briefing" },
      { href: EP_OPPOSITION_RESEARCH_HREF, label: "Opposition research hub" },
      { href: epDebatePrepDayBlockHref(DAY3_ID, "b3-claims"), label: "Claims gate block" },
    ],
  }));
}

function buildDay3Blocks(): DayBlockDrillDown[] {
  const plan = getDebateWeekIntensiveDay(DAY3_ID)!;
  return plan.blocks.map((block) => {
    const theory = getBlockTheoryExpansion(DAY3_ID, block.id);
    const sections: Array<{ title: string; body: string }> = [
      { title: "Activity", body: block.activity },
      { title: "Why this block", body: block.why },
    ];
    if (theory) {
      sections.push(
        { title: "Adult-education rationale", body: theory.adultEducationWhy },
        { title: "What success looks like", body: theory.whatSuccessLooksLike },
        { title: "Common mistakes", body: theory.commonMistakes.join(" · ") },
      );
    }

    const relatedLinks: DrillDownLink[] = [];
    if (block.id === "b3-manual") {
      relatedLinks.push(
        { href: EP_EXECUTIVE_BOOK_HREF, label: "Executive book hub" },
        { href: epDebatePrepLaneHref("lane-d3-stack"), label: "Qualification stack lane" },
        { href: epDebatePrepDayConceptHref(DAY3_ID, "three-beats-only"), label: "Three beats only concept" },
      );
    }
    if (block.id === "b3-opposition") {
      relatedLinks.push(
        { href: EP_OPPOSITION_RESEARCH_HREF, label: "Opposition research hub" },
        { href: epDebatePrepLaneHref("lane-d3-offense-stretch"), label: "Offense sequence lane" },
        { href: epDebatePrepDayConceptHref(DAY3_ID, "administrator-vs-author"), label: "Administrator vs author" },
      );
    }
    if (block.id === "b3-funding") {
      relatedLinks.push(
        { href: EP_OPPOSITION_RESEARCH_HREF, label: "Election funding intelligence" },
        { href: epDebatePrepLaneHref("lane-d3-funding-deep"), label: "Funding research lane" },
        { href: epTrapLaneHref("election-funding"), label: "Trap lane · election funding" },
      );
    }
    if (block.id === "b3-claims") {
      relatedLinks.push(
        { href: epOppositionResearchModuleHref("claims-ledger"), label: "Claims ledger module" },
        { href: epDebatePrepDayConceptHref(DAY3_ID, "success-check-d3"), label: "Success check concept" },
        { href: epDebatePrepDayRehearsalHref(DAY3_ID, "rehearse-qualified-90s"), label: "90s qualification rehearsal" },
      );
    }
    if (theory?.stretchLaneId) {
      relatedLinks.push({ href: epDebatePrepLaneHref(theory.stretchLaneId), label: "Linked drill-down lane" });
    }

    const practiceSteps: string[] = [];
    if (block.id === "b3-manual") {
      practiceSteps.push(
        "Open executive book — map three pillars to debate answers (one notecard each).",
        "Pick three Kelly jobs — nonprofit, organizing, clerk partnership.",
        "90s qualification stack aloud — no bill numbers.",
      );
    } else if (block.id === "b3-opposition") {
      practiceSteps.push(
        "Skim six offensive moves in opposition research — pick two that feel natural.",
        "Rehearse 90s each — contrast on job fit, not smear.",
        "Run chosen lines through claims gate before stage use.",
      );
    } else if (block.id === "b3-funding") {
      practiceSteps.push(
        "Skim election funding traps — research question frame only.",
        "Memorize one clerk funding question.",
        "Rehearse 60s answer — no invented dollar amounts.",
      );
    } else if (block.id === "b3-claims") {
      practiceSteps.push(
        "Open claims ledger — mark every superiority stat green or red.",
        "Red-line anything NEEDS_REVIEW — do not stage.",
        "Lock three green superiority points for tomorrow's rehearsal.",
      );
    }

    return {
      blockId: block.id,
      title: block.title,
      minutes: block.minutes,
      activity: block.activity,
      why: block.why,
      sections,
      practiceSteps,
      relatedLinks,
    };
  });
}

function buildDay3MicroLessons(): DayMicroLessonDrillDown[] {
  const overlay = getDayDeepOverlay(DAY3_ID);
  return overlay.microLessons.map((lesson) => ({
    id: lesson.id,
    title: lesson.title,
    readMinutes: lesson.readMinutes,
    body: lesson.body,
    practiceSteps: [
      "Read lesson once — note one sentence to keep.",
      "Pick three Kelly jobs — say them slower than feels natural.",
      "Stop at three beats — smile, wait.",
    ],
    relatedLinks: [
      { href: epDebatePrepDayBlockHref(DAY3_ID, "b3-manual"), label: "Manual block" },
      { href: epDebatePrepDayConceptHref(DAY3_ID, "overwhelm-with-competence"), label: "Overwhelm with competence" },
    ],
  }));
}

function buildDay3Drills(): DayCommandDrillDown[] {
  const overlay = getDayDeepOverlay(DAY3_ID);
  return overlay.commandDrills.map((drill) => ({
    id: drill.id,
    ifTheySay: drill.ifTheySay,
    youSay: drill.youSay,
    thenScan: drill.thenScan,
    claimsNote: drill.claimsNote,
    practiceSteps: [
      "Staff reads 'if they say' line.",
      "Kelly delivers 'you say' — three beats maximum.",
      "Execute then-scan: stop, smile, wait.",
      "Repeat three times; mark drill complete when boring.",
    ],
    relatedLinks: [
      { href: epDebatePrepDayRehearsalHref(DAY3_ID, "rehearse-qualified-90s"), label: "90s qualification rehearsal" },
      { href: epDebatePrepDayBlockHref(DAY3_ID, "b3-manual"), label: "Manual block" },
      { href: epDebatePrepLaneHref("lane-d3-stack"), label: "Qualification stack lane" },
    ],
  }));
}

export function dayHasDrillDownPages(dayId: IntensiveDayId): boolean {
  return DRILL_DOWN_DAY_ID_SET.has(dayId);
}

export function listDayExampleIds(dayId: IntensiveDayId): string[] {
  if (dayId === DAY1_ID) return [DAY1_EXAMPLE.id];
  if (dayId === DAY2_ID) return buildDay2Examples().map((e) => e.id);
  if (dayId === DAY3_ID) return buildDay3Examples().map((e) => e.id);
  if (dayId === DAY4_ID) return buildDay4Examples().map((e) => e.id);
  if (dayId === DAY5_ID) return buildDay5Examples().map((e) => e.id);
  if (dayId === DAY6_ID) return [];
  return [];
}

export function listDayConcepts(dayId: IntensiveDayId): DayConceptDrillDown[] {
  if (dayId === DAY1_ID) return DAY1_CONCEPTS;
  if (dayId === DAY2_ID) return DAY2_CONCEPTS;
  if (dayId === DAY3_ID) return DAY3_CONCEPTS;
  if (dayId === DAY4_ID) return DAY4_CONCEPTS;
  if (dayId === DAY5_ID) return DAY5_CONCEPTS;
  if (dayId === DAY6_ID) return DAY6_CONCEPTS;
  return [];
}

export function getDayConcept(dayId: IntensiveDayId, conceptId: string): DayConceptDrillDown | undefined {
  return listDayConcepts(dayId).find((c) => c.id === conceptId);
}

export function listDayBlocksDrillDown(dayId: IntensiveDayId): DayBlockDrillDown[] {
  if (dayId === DAY1_ID) return buildDay1Blocks();
  if (dayId === DAY2_ID) return buildDay2Blocks();
  if (dayId === DAY3_ID) return buildDay3Blocks();
  if (dayId === DAY4_ID) return buildDay4Blocks();
  if (dayId === DAY5_ID) return buildDay5Blocks();
  if (dayId === DAY6_ID) return buildDay6Blocks();
  return [];
}

export function getDayBlockDrillDown(dayId: IntensiveDayId, blockId: string): DayBlockDrillDown | undefined {
  return listDayBlocksDrillDown(dayId).find((b) => b.blockId === blockId);
}

export function getDayExampleDrillDown(dayId: IntensiveDayId, exampleId: string): DayExampleDrillDown | undefined {
  if (dayId === DAY1_ID) return exampleId === DAY1_EXAMPLE.id ? DAY1_EXAMPLE : undefined;
  if (dayId === DAY2_ID) return buildDay2Examples().find((e) => e.id === exampleId);
  if (dayId === DAY3_ID) return buildDay3Examples().find((e) => e.id === exampleId);
  if (dayId === DAY4_ID) return buildDay4Examples().find((e) => e.id === exampleId);
  if (dayId === DAY5_ID) return buildDay5Examples().find((e) => e.id === exampleId);
  if (dayId === DAY6_ID) return undefined;
  return undefined;
}

export function listDayRehearsalScripts(dayId: IntensiveDayId): DayRehearsalDrillDown[] {
  if (dayId === DAY1_ID) return DAY1_REHEARSAL;
  if (dayId === DAY2_ID) return DAY2_REHEARSAL;
  if (dayId === DAY3_ID) return DAY3_REHEARSAL;
  if (dayId === DAY4_ID) return DAY4_REHEARSAL;
  if (dayId === DAY5_ID) return DAY5_REHEARSAL;
  if (dayId === DAY6_ID) return DAY6_REHEARSAL;
  return [];
}

export function getDayRehearsalScript(dayId: IntensiveDayId, scriptId: string): DayRehearsalDrillDown | undefined {
  return listDayRehearsalScripts(dayId).find((s) => s.id === scriptId);
}

export function listDayMicroLessonsDrillDown(dayId: IntensiveDayId): DayMicroLessonDrillDown[] {
  if (dayId === DAY1_ID) return buildDay1MicroLessons();
  if (dayId === DAY2_ID) return buildDay2MicroLessons();
  if (dayId === DAY3_ID) return buildDay3MicroLessons();
  if (dayId === DAY4_ID) return buildDay4MicroLessons();
  if (dayId === DAY5_ID) return buildDay5MicroLessons();
  if (dayId === DAY6_ID) return buildDay6MicroLessons();
  return [];
}

export function getDayMicroLessonDrillDown(dayId: IntensiveDayId, lessonId: string): DayMicroLessonDrillDown | undefined {
  return listDayMicroLessonsDrillDown(dayId).find((l) => l.id === lessonId);
}

export function listDayCommandDrillsDrillDown(dayId: IntensiveDayId): DayCommandDrillDown[] {
  if (dayId === DAY1_ID) return buildDay1Drills();
  if (dayId === DAY2_ID) return buildDay2Drills();
  if (dayId === DAY3_ID) return buildDay3Drills();
  if (dayId === DAY4_ID) return buildDay4Drills();
  if (dayId === DAY5_ID) return buildDay5Drills();
  if (dayId === DAY6_ID) return buildDay6Drills();
  return [];
}

export function getDayCommandDrillDrillDown(dayId: IntensiveDayId, drillId: string): DayCommandDrillDown | undefined {
  return listDayCommandDrillsDrillDown(dayId).find((d) => d.id === drillId);
}

export const DAY1_CONCEPT_LINKS = DAY1_CONCEPTS.map((c) => ({
  id: c.id,
  label: c.label,
  href: epDebatePrepDayConceptHref(DAY1_ID, c.id),
}));
