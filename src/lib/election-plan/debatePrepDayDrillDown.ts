/**
 * Election Plan — per-day drill-down pages (concepts, blocks, examples, rehearsal, micro-lessons, drills).
 * Day 1 fully wired; other days return empty until expanded.
 */
import {
  EP_DEBATE_PREP_BRIEFINGS_HREF,
  EP_DEBATE_PREP_PSYCHOLOGY_HREF,
  EP_DEBATE_PREP_REHEARSAL_HREF,
  EP_DEBATE_PREP_TUTOR_HREF,
  EP_EXECUTIVE_BOOK_HREF,
  EP_OPPOSITION_RESEARCH_HREF,
  epDebatePrepBriefingHref,
  epDebatePrepDayBlockHref,
  epDebatePrepDayConceptHref,
  epDebatePrepDayDrillHref,
  epDebatePrepDayExampleHref,
  epDebatePrepDayMicroLessonHref,
  epDebatePrepDayRehearsalHref,
  epDebatePrepPsychologySectionHref,
  epTrapLaneHref,
} from "@/lib/election-plan/debate-prep-links";
import { epDebatePrepLaneHref } from "@/lib/election-plan/debate-prep-route-map";
import { getBlockTheoryExpansion } from "@/lib/intelligence/v4/debateWeekIntensive2026V3";
import { getDayDeepOverlay } from "@/lib/intelligence/v4/debateWeekIntensive2026Deep";
import {
  getDebateWeekIntensiveDay,
  type IntensiveDayId,
} from "@/lib/intelligence/v4/debateWeekIntensive2026";

export const DAY1_ID = "day-1-command-foundation" as const satisfies IntensiveDayId;

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
    const theory = getBlockTheoryExpansion(DAY1_ID, block.id);
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
      relatedLinks.push({ href: `${EP_DEBATE_PREP_TUTOR_HREF}?focus=opening`, label: "AI tutor · opening focus" });
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

export function dayHasDrillDownPages(dayId: IntensiveDayId): boolean {
  return dayId === DAY1_ID;
}

export function listDayConcepts(dayId: IntensiveDayId): DayConceptDrillDown[] {
  if (dayId !== DAY1_ID) return [];
  return DAY1_CONCEPTS;
}

export function getDayConcept(dayId: IntensiveDayId, conceptId: string): DayConceptDrillDown | undefined {
  return listDayConcepts(dayId).find((c) => c.id === conceptId);
}

export function listDayBlocksDrillDown(dayId: IntensiveDayId): DayBlockDrillDown[] {
  if (dayId !== DAY1_ID) return [];
  return buildDay1Blocks();
}

export function getDayBlockDrillDown(dayId: IntensiveDayId, blockId: string): DayBlockDrillDown | undefined {
  return listDayBlocksDrillDown(dayId).find((b) => b.blockId === blockId);
}

export function getDayExampleDrillDown(dayId: IntensiveDayId, exampleId: string): DayExampleDrillDown | undefined {
  if (dayId !== DAY1_ID) return undefined;
  return exampleId === DAY1_EXAMPLE.id ? DAY1_EXAMPLE : undefined;
}

export function listDayRehearsalScripts(dayId: IntensiveDayId): DayRehearsalDrillDown[] {
  if (dayId !== DAY1_ID) return [];
  return DAY1_REHEARSAL;
}

export function getDayRehearsalScript(dayId: IntensiveDayId, scriptId: string): DayRehearsalDrillDown | undefined {
  return listDayRehearsalScripts(dayId).find((s) => s.id === scriptId);
}

export function listDayMicroLessonsDrillDown(dayId: IntensiveDayId): DayMicroLessonDrillDown[] {
  if (dayId !== DAY1_ID) return [];
  return buildDay1MicroLessons();
}

export function getDayMicroLessonDrillDown(dayId: IntensiveDayId, lessonId: string): DayMicroLessonDrillDown | undefined {
  return listDayMicroLessonsDrillDown(dayId).find((l) => l.id === lessonId);
}

export function listDayCommandDrillsDrillDown(dayId: IntensiveDayId): DayCommandDrillDown[] {
  if (dayId !== DAY1_ID) return [];
  return buildDay1Drills();
}

export function getDayCommandDrillDrillDown(dayId: IntensiveDayId, drillId: string): DayCommandDrillDown | undefined {
  return listDayCommandDrillsDrillDown(dayId).find((d) => d.id === drillId);
}

export const DAY1_CONCEPT_LINKS = DAY1_CONCEPTS.map((c) => ({
  id: c.id,
  label: c.label,
  href: epDebatePrepDayConceptHref(DAY1_ID, c.id),
}));
