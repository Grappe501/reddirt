/**
 * Debate Week Intensive 2026 — 7 study days + Command Mode debate day.
 * Adult-education scaffold: slow foundation → accelerated drills → stage refinement.
 * SOS Debate · Annual Press Convention · Eureka Springs · 2026-06-26.
 */

import { EP_FORUM_TRANSCRIPT_LAB_HREF, EP_OPPONENT_BIOS_HREF } from "@/lib/election-plan/debate-prep-links";

export const DEBATE_WEEK_INTENSIVE_HUB_HREF = "/admin/intelligence/debate-week-intensive";
export const FORUM_TRANSCRIPT_LAB_HREF = "/admin/intelligence/forum-transcript-lab";

export const DEBATE_DATE = "2026-06-26";
export const INTENSIVE_START = "2026-06-19";
export const HOURS_PER_DAY_TARGET = 4;

export type IntensiveDayId =
  | "day-1-command-foundation"
  | "day-2-read-the-table"
  | "day-3-superiority-map"
  | "day-4-forum-intelligence"
  | "day-5-anticipate-and-capitalize"
  | "day-6-full-simulation"
  | "day-7-refine-and-steal-show"
  | "day-8-command-mode-debate";

export type IntensiveBlock = {
  id: string;
  title: string;
  minutes: number;
  activity: string;
  why: string;
  href?: string;
  aiEnabled?: boolean;
};

export type OpponentExample = {
  id: string;
  opponent: "Hammer" | "Pakko" | "Moderator";
  theirMove: string;
  kellyResponse: string;
  whyItWorks: string;
  sourceNote: string;
};

export type IntensiveDayPlan = {
  day: number;
  dayId: IntensiveDayId;
  calendarDate: string;
  weekdayLabel: string;
  title: string;
  subtitle: string;
  commandModeFocus: string;
  psychologyPrinciple: string;
  goalForKelly: string;
  hoursTarget: number;
  blocks: IntensiveBlock[];
  opponentExamples: OpponentExample[];
  rehearsalOutLoud: string[];
  newspaperAngle: string;
  successCheck: string;
  staffOnly?: string[];
};

export const DEBATE_WEEK_INTENSIVE_PRIMER = {
  headline: "Command Mode — seven study days, one debate day",
  whoThisIsFor:
    "Kelly has never debated on stage against seasoned politicians. This course uses adult-education pacing: calm foundation first, then real opponent examples, then timed simulation. Your innocence is an asset — the room trusts someone who does not perform cynicism.",
  commandModeDefinition:
    "Command Mode means posture, breath, and word choice under pressure — the same discipline state police train for high-stakes communication: scan, listen, respond with purpose, never react with panic.",
  opponents:
    "Kim Hammer (R, incumbent) leads with authorship and integrity rankings. Michael Pakko (Libertarian) splits protest energy. Kelly wins on administrator competence, clerk partnership, and verified contrast — not motive attacks.",
  winCondition:
    "Kelly walks on stage calm, names what clerks need, contrasts job-fit without smear, and leaves Hammer defending bills while she explains how the office actually runs.",
  newspaperHook:
    "Arkansas papers reward plain competence and local respect — APA statewide LTE + visit-adjacent print amplifies a candidate who sounds like she already works for clerks, not like she wrote bills about them.",
};

export const DEBATE_WEEK_INTENSIVE_DAYS: IntensiveDayPlan[] = [
  {
    day: 1,
    dayId: "day-1-command-foundation",
    calendarDate: "2026-06-19",
    weekdayLabel: "Thursday · Day 1",
    title: "Command Mode foundation",
    subtitle: "Body, breath, and first words — before any opponent content",
    commandModeFocus: "Establish physical protocol: feet planted, shoulders down, pause before answer one.",
    psychologyPrinciple: "Adult learning safety — reduce threat first. You cannot absorb trap lanes while adrenaline is high.",
    goalForKelly:
      "Internalize that you are not performing a character. You are the most qualified administrator in the race — your job tonight is to let the room feel that before Hammer speaks.",
    hoursTarget: 4,
    blocks: [
      {
        id: "b1-posture",
        title: "Command posture & breathing (ASP-style protocol)",
        minutes: 45,
        activity:
          "Stand, practice 4-4-6 breath, micro-pause before mic. Mirror check: no sway, hands still until gesture serves a point.",
        why: "Seasoned politicians look calm because their body is trained first. Your innocence reads as authenticity if your body is steady.",
      },
      {
        id: "b1-philosophy",
        title: "Philosophy spine — agree but never only agree",
        minutes: 60,
        href: "/admin/intelligence/debate-briefings/agree-but-never-only-agree",
        activity: "Read briefing + speak 60s closing that adds a clerk partnership layer after any agree line.",
        why: "Hammer's first move is always agree-on-security — you must have a muscle memory add-on.",
      },
      {
        id: "b1-author",
        title: "Author vs administrator frame",
        minutes: 60,
        href: "/admin/intelligence/debate-briefings/author-vs-administrator",
        activity: "Practice: 'Sponsoring a bill is not running the office clerks depend on.'",
        why: "This is your single strongest contrast — job fit, not personality.",
      },
      {
        id: "b1-psych",
        title: "Psychology manual — debate atmosphere",
        minutes: 45,
        href: "/admin/intelligence/debate-prep/psychology-manual",
        activity: "Read sections 1–3; journal one sentence on what scares you and one on what you offer the room.",
        why: "Naming fear reduces it — adult education requires emotional honesty before skill drills.",
      },
      {
        id: "b1-tutor",
        title: "AI debate prep tutor — 15 min office hours",
        minutes: 30,
        href: "/admin/intelligence/debate-prep-tutor",
        activity: "Run 15-minute tutor session on 'first impression opening' only.",
        why: "AI repeats without judgment — build confidence before human critique.",
        aiEnabled: true,
      },
    ],
    opponentExamples: [
      {
        id: "ex1-hammer-open",
        opponent: "Hammer",
        theirMove: "Opens with election integrity ranking and 'I wrote the bills that secured Arkansas elections.'",
        kellyResponse:
          "Clerks secured those elections — in every county. I want an office that answers their calls, not one that takes credit from the Capitol.",
        whyItWorks: "Redirects authorship to service without attacking motive.",
        sourceNote: "Pattern from Hammer campaign messaging — verify in claims before broadcast.",
      },
    ],
    rehearsalOutLoud: [
      "90s opening — no opponent names; clerk partnership + administrator frame",
      "30s agree-but-contrast on 'secure elections'",
    ],
    newspaperAngle: "Draft LTE theme: 'Clerks run elections — the SOS should serve them' (APA monthly send).",
    successCheck: "Kelly completes breathing protocol twice without notes; can deliver author vs administrator line naturally.",
  },
  {
    day: 2,
    dayId: "day-2-read-the-table",
    calendarDate: "2026-06-20",
    weekdayLabel: "Friday · Day 2",
    title: "Read the table — opponent patterns",
    subtitle: "What seasoned politicians do · what to listen for",
    commandModeFocus: "Scan before speak: who is talking, who is baiting, who is splitting the room.",
    psychologyPrinciple: "Observational learning — study behavior before countering content.",
    goalForKelly:
      "Learn Hammer's three tells (authorship, ranking, mandate) and Pakko's libertarian split — so nothing on stage surprises you.",
    hoursTarget: 4.5,
    blocks: [
      {
        id: "b2-film",
        title: "Forum tell briefs — Hammer & Pakko transcript excerpts",
        minutes: 90,
        href: EP_FORUM_TRANSCRIPT_LAB_HREF,
        activity:
          "Read five ACCA forum transcript briefs: pull quotes, rhetorical tells in text, one Kelly pivot each — no video.",
        why: "Pattern recognition from real words beats rewatching footage — Kelly already knows their faces.",
      },
      {
        id: "b2-trap1",
        title: "Trap lanes 1–2 — authorship & 2021 package",
        minutes: 75,
        href: "/admin/intelligence/trap-lanes",
        activity: "Drill lanes 1–2 speak-order out loud with staff calling bait lines.",
        why: "Hammer will stay in authorship lane — rehearse pivot until boring.",
      },
      {
        id: "b2-packo",
        title: "Pakko contrast scaffold",
        minutes: 45,
        href: "/admin/intelligence/opponents/michael-packo",
        activity: "Read respect line + contrast gate; practice one sentence acknowledging Pakko without ceding SOS credibility.",
        why: "Three-way geometry — Kelly center, not fighting two fronts.",
      },
      {
        id: "b2-coaching",
        title: "Stage presence coaching",
        minutes: 45,
        href: "/admin/intelligence/kelly-debate-coaching",
        activity: "Three-way geometry: where to look when Hammer and Pakko talk.",
        why: "Command Mode includes where your eyes go — never look rattled.",
      },
      {
        id: "b2-opponent-bios",
        title: "Opponent biographies — first full read",
        minutes: 60,
        href: EP_OPPONENT_BIOS_HREF,
        activity:
          "Read full Kim Hammer bio (30 min), then full Dr. Michael Pakko bio (30 min). Priorities, psychology, tells, memory lines — nothing on stage should surprise you.",
        why: "Understanding opponents is command — you anticipate rhythm before they speak.",
      },
    ],
    opponentExamples: [
      {
        id: "ex2-hammer-rank",
        opponent: "Hammer",
        theirMove: "Cites Heritage Foundation or similar ranking on election integrity.",
        kellyResponse:
          "Rankings measure rhetoric. I measure whether a county clerk in Montgomery County got her grant question answered this week.",
        whyItWorks: "Moves abstract scorecard to concrete service — Kelly's lane.",
        sourceNote: "Contrast frame KH-2 — control vs trust.",
      },
      {
        id: "ex2-pakko-split",
        opponent: "Pakko",
        theirMove: "Libertarian frame on government overreach in elections.",
        kellyResponse:
          "I agree bureaucracy can burden clerks — that's why I want unfunded mandates on the record, not more Capitol mandates without funding.",
        whyItWorks: "Agree on clerk burden, steal the reform lane from both sides.",
        sourceNote: "Pakko scaffold — no unsourced attacks.",
      },
    ],
    rehearsalOutLoud: [
      "Staff reads Hammer bait line → Kelly 60s rebuttal without notes",
      "One Pakko acknowledge + pivot phrase",
    ],
    newspaperAngle: "Local paper quote pull: competence line from Day 1 opening — prep 1/8 page visit-ad for next rural stop.",
    successCheck: "Kelly names three Hammer tells and one Pakko pivot without reading.",
  },
  {
    day: 3,
    dayId: "day-3-superiority-map",
    calendarDate: "2026-06-21",
    weekdayLabel: "Saturday · Day 3",
    title: "Superiority map — qualifications overwhelm",
    subtitle: "Organization history · expertise · scare with competence",
    commandModeFocus: "Speak from evidence stacks — calm, stacked, unhurried.",
    psychologyPrinciple: "Self-efficacy through mastery — list what you have done until the list feels boring.",
    goalForKelly:
      "Build a mental stack of Kelly advantages: SOS desk experience, clerk relationships, direct democracy organizing, nonprofit administration — more relevant than both opponents combined.",
    hoursTarget: 4,
    blocks: [
      {
        id: "b3-manual",
        title: "Kelly SOS manual — framework + implementation",
        minutes: 75,
        href: "/admin/intelligence/kelly-strategic-plan/framework",
        activity: "Map three pillars to debate answers — one pillar per notecard.",
        why: "Your manual is the opponent's missing operator guide.",
      },
      {
        id: "b3-opposition",
        title: "Opposition strategy — offense sequence",
        minutes: 60,
        href: "/admin/intelligence/opposition-strategy",
        activity: "Skim six offensive moves — pick two that feel natural, rehearse 90s each.",
        why: "Offense is contrast on job fit — not attack.",
      },
      {
        id: "b3-funding",
        title: "Election funding + clerk mandates",
        minutes: 60,
        href: "/admin/intelligence/election-funding",
        activity: "Research-question framing only — ask for ledger, do not invent numbers.",
        why: "Clerks care about money — Hammer owns the bills that created burden.",
      },
      {
        id: "b3-claims",
        title: "Claims gate — verify superiority lines",
        minutes: 45,
        href: "/admin/intelligence/claims",
        activity: "Mark every stat you plan to use — red line anything NEEDS_REVIEW.",
        why: "Command Mode never improvises unverified numbers.",
      },
    ],
    opponentExamples: [
      {
        id: "ex3-hammer-admin",
        opponent: "Hammer",
        theirMove: "Lists bill numbers as proof he can run SOS.",
        kellyResponse:
          "I've managed organizations, budgets, and people who depend on timely answers. Clerks need an administrator on night three of early voting — not a sponsor reading act numbers.",
        whyItWorks: "Stacks Kelly operational history vs Hammer legislative history.",
        sourceNote: "Author vs administrator briefing.",
      },
    ],
    rehearsalOutLoud: [
      "90s 'why I'm qualified' — no bill numbers, three real Kelly jobs",
      "60s clerk funding question — research frame only",
    ],
    newspaperAngle: "Story pitch: Kelly's nonprofit + civic organizing vs career politician — local business editors.",
    successCheck: "Kelly recites three verified superiority points from memory.",
  },
  {
    day: 4,
    dayId: "day-4-forum-intelligence",
    calendarDate: "2026-06-22",
    weekdayLabel: "Sunday · Day 4",
    title: "Forum intelligence lab",
    subtitle: "Forum transcript · pull quotes · AI breakdown",
    commandModeFocus: "Listen like an analyst first — extract their scripts before writing yours.",
    psychologyPrinciple: "Concrete examples beat abstract fear — the forum transcript is your Rosetta stone.",
    goalForKelly:
      "Read the three-candidate forum transcript and analysis — map Hammer and Pakko's real language to predicted debate lines.",
    hoursTarget: 4,
    blocks: [
      {
        id: "b4-lab",
        title: "Forum transcript lab — read & analyze",
        minutes: 120,
        href: FORUM_TRANSCRIPT_LAB_HREF,
        activity:
          "Read forum transcript excerpts and run AI analysis: per-candidate themes, predicted debate questions, Kelly capitalize moves.",
        why: "This is the highest-leverage intelligence for this race — real words, not guesswork.",
        aiEnabled: true,
      },
      {
        id: "b4-sos",
        title: "SOS question bank — map forum to moderator Qs",
        minutes: 60,
        href: "/admin/intelligence/sos-debate-questions",
        activity: "Match forum topics to top 5 SOS bank questions — note Hammer repeat lines.",
        why: "Moderators recycle forum themes at press convention.",
      },
      {
        id: "b4-rest",
        title: "Recovery + light rehearsal",
        minutes: 60,
        activity: "Walk, hydrate, one 60s opening only — no new content.",
        why: "Sunday is ingest day — cognitive load from transcript, not new traps.",
      },
      {
        id: "b4-opponent-bios-reread",
        title: "Opponent biographies — re-read after forum lab",
        minutes: 45,
        href: EP_OPPONENT_BIOS_HREF,
        activity:
          "Re-read both bios with forum notes in hand. Compare forecast sections to transcript — update capitalize triggers and memory lines.",
        why: "Forum reality beats guesswork — engrave what they actually said.",
      },
    ],
    opponentExamples: [
      {
        id: "ex4-forum",
        opponent: "Moderator",
        theirMove: "Forum moderator asks all three to define 'election integrity' in one sentence.",
        kellyResponse:
          "Integrity is clerks with funded equipment, transparent processes, and a SOS office that picks up the phone.",
        whyItWorks: "Concrete, clerk-centered — contrasts abstract opponent answers.",
        sourceNote: "Refine after forum transcript lab ingest.",
      },
    ],
    rehearsalOutLoud: ["Read AI-predicted Hammer line from lab → 60s Kelly counter"],
    newspaperAngle: "Monitor forum coverage — respond with LTE if local paper quotes Hammer without clerk context.",
    successCheck: "Forum lab shows transcript + analysis artifact; Kelly reviews predicted lines list.",
    staffOnly: ["Staff runs upload if Kelly exhausted — paste transcript fallback OK"],
  },
  {
    day: 5,
    dayId: "day-5-anticipate-and-capitalize",
    calendarDate: "2026-06-23",
    weekdayLabel: "Monday · Day 5",
    title: "Anticipate & capitalize",
    subtitle: "From forum intel to debate traps",
    commandModeFocus: "Pre-load responses — when you hear the first three words, answer is ready.",
    psychologyPrinciple: "Spaced retrieval — pull yesterday's forum intel forward under time pressure.",
    goalForKelly:
      "Turn forum transcript analysis into a personal cheat sheet: when Hammer says X, Kelly says Y — all claims-verified.",
    hoursTarget: 4.5,
    blocks: [
      {
        id: "b5-lab-review",
        title: "Forum lab review + capitalize sheet",
        minutes: 60,
        href: FORUM_TRANSCRIPT_LAB_HREF,
        activity: "Export capitalize moves; staff merges into debate command.",
        why: "Intelligence only wins if rehearsed.",
        aiEnabled: true,
      },
      {
        id: "b5-trap-all",
        title: "Trap lanes 3–6",
        minutes: 90,
        href: "/admin/intelligence/trap-lanes",
        activity: "Timed 60s per remaining lane.",
        why: "Forum intel fills gaps in lanes 3–6 predictions.",
      },
      {
        id: "b5-sos-sprint",
        title: "SOS question sprint — 5 timed",
        minutes: 75,
        href: "/admin/intelligence/sos-debate-questions",
        activity: "90s per question — speak order 1·2·3.",
        why: "Moderator pace at press convention is fast.",
      },
      {
        id: "b5-tutor",
        title: "AI tutor — moot court 30 min",
        minutes: 45,
        href: "/admin/intelligence/debate-prep-tutor",
        activity: "30-minute moot session on forum-derived Hammer lines.",
        why: "Forum intel becomes muscle memory only through adversarial drill.",
        aiEnabled: true,
      },
    ],
    opponentExamples: [
      {
        id: "ex5-pileon",
        opponent: "Hammer",
        theirMove: "Tries pile-on with Pakko on 'government trust'.",
        kellyResponse:
          "I'll let the Capitol debate trust — I'm asking clerks what they need before November.",
        whyItWorks: "Pile-on survival — rise above, pivot to clerks.",
        sourceNote: "Philosophy briefing pile-on survival.",
      },
    ],
    rehearsalOutLoud: ["Five forum-derived Q&A pairs timed", "One pile-on pivot cold"],
    newspaperAngle: "Prep APA visit-ad for Eureka Springs / Carroll corridor before debate travel.",
    successCheck: "Capitalize sheet has ≥8 when-X-say-Y pairs; all green in claims.",
  },
  {
    day: 6,
    dayId: "day-6-full-simulation",
    calendarDate: "2026-06-24",
    weekdayLabel: "Tuesday · Day 6",
    title: "Full simulation — prep window opens",
    subtitle: "60-minute debate dress rehearsal",
    commandModeFocus: "Execute under fatigue — Command Mode is muscle memory, not inspiration.",
    psychologyPrinciple: "Stress inoculation — worst-case drills in safe room.",
    goalForKelly:
      "Run full simulation: opening, three trap lanes, five SOS questions, closing — staff plays Hammer and Pakko.",
    hoursTarget: 5,
    blocks: [
      {
        id: "b6-opponent-bios-lock",
        title: "Opponent biographies — lock-in before simulation",
        minutes: 30,
        href: EP_OPPONENT_BIOS_HREF,
        activity:
          "Third read: memory lines + command mode sections only (15 min each opponent). Speak aloud until boring — then simulation.",
        why: "Bios are muscle memory on stage night — not homework under lights.",
      },
      {
        id: "b6-sim",
        title: "Full simulation block",
        minutes: 90,
        href: "/admin/intelligence/rehearsal",
        activity: "60-min three-way simulation + 30-min debrief.",
        why: "Prep window Jun 24–26 — treat today like stage night.",
      },
      {
        id: "b6-prep",
        title: "Debate prep packet sections 1–10",
        minutes: 90,
        href: "/admin/intelligence/kim-hammer/debate-prep",
        activity: "Highest trap-density sections only.",
        why: "Integrated packet catches simulation gaps.",
      },
      {
        id: "b6-command",
        title: "Debate command readiness check",
        minutes: 45,
        href: "/admin/intelligence/debate-command",
        activity: "Review blocked lanes and philosophy feed scores.",
        why: "Honest readiness before travel.",
      },
      {
        id: "b6-depth",
        title: "If stuck — bridge phrases",
        minutes: 30,
        href: "/admin/intelligence/debate-depth/if-stuck",
        activity: "Memorize three bridges — honest pause beats fake certainty.",
        why: "Kelly's transparency under pressure is a strength.",
      },
    ],
    opponentExamples: [],
    rehearsalOutLoud: [
      "Full simulation — staff logs weak segments",
      "Closing 60s — administrator frame",
    ],
    newspaperAngle: "Press advisory draft for debate — APA + local Carroll paper.",
    successCheck: "Simulation complete; debate command readiness ≥70% all dimensions.",
    staffOnly: ["Staff times simulation; action queue for fixes"],
  },
  {
    day: 7,
    dayId: "day-7-refine-and-steal-show",
    calendarDate: "2026-06-25",
    weekdayLabel: "Wednesday · Day 7",
    title: "Refine & steal the show",
    subtitle: "Newspaper moment · crowd energy · final cuts",
    commandModeFocus: "One memorable line — earned, verified, clerk-rooted.",
    psychologyPrinciple: "Peak-end rule — people remember the last calm confident minute.",
    goalForKelly:
      "Cut weak material; polish opening and closing; identify the one newspaper-quotable line that steals the show without gimmick.",
    hoursTarget: 4,
    blocks: [
      {
        id: "b7-open-close",
        title: "Opening + closing polish",
        minutes: 60,
        href: "/admin/intelligence/kelly-debate-coaching",
        activity: "Only verified lines — open with service, close with clerk invoke.",
        why: "Bookends define press coverage.",
      },
      {
        id: "b7-claims-final",
        title: "Final claims scan",
        minutes: 45,
        href: "/admin/intelligence/claims",
        activity: "Red line review — nothing new after today.",
        why: "Command Mode discipline — no last-minute unverified stats.",
      },
      {
        id: "b7-psych-three",
        title: "Three-way + ACCA psychology",
        minutes: 45,
        href: "/admin/intelligence/debate-prep/psychology-manual/arkansas-three-way-acca-context",
        activity: "Review geometry + pile-on survival.",
        why: "Eureka Springs is three-way — same as ACCA panel.",
      },
      {
        id: "b7-tutor-final",
        title: "AI tutor — final 15 min office hours",
        minutes: 30,
        href: "/admin/intelligence/debate-prep-tutor",
        activity: "One weakness from simulation — one drill only.",
        why: "Final correction while material is fresh — not new content.",
        aiEnabled: true,
      },
    ],
    opponentExamples: [
      {
        id: "ex7-show-steal",
        opponent: "Hammer",
        theirMove: "Closes with ranking and 'I wrote the law.'",
        kellyResponse:
          "Clerks don't need another author in the Capitol — they need a Secretary of State who shows up. I'll be that administrator.",
        whyItWorks: "Quotable, contrast, no smear — newspaper-friendly.",
        sourceNote: "Claims verify before stage.",
      },
    ],
    rehearsalOutLoud: ["Opening + closing only — 3 reps each", "Quotable line — one breath pause before delivery"],
    newspaperAngle: "Identify reporter in room — post-debate LTE within 48h via APA.",
    successCheck: "Kelly has one quotable line staff cleared; opening/closing memorized.",
  },
  {
    day: 8,
    dayId: "day-8-command-mode-debate",
    calendarDate: "2026-06-26",
    weekdayLabel: "Debate Day · Jun 26",
    title: "Command Mode — debate day",
    subtitle: "Mindset · travel · stage · debrief",
    commandModeFocus: "Execute protocol — you already did the work. Scan, breathe, respond.",
    psychologyPrinciple: "Implementation intention — if X happens, I do Y (pre-decided, no panic decisions).",
    goalForKelly:
      "Light cognitive load — physical readiness, safe lines only, steal the show with calm competence.",
    hoursTarget: 2,
    blocks: [
      {
        id: "b8-morning",
        title: "Morning Command Mode ritual",
        minutes: 30,
        activity: "Breath protocol + read three safe lines only. No new research.",
        why: "Debate day is execution, not ingestion.",
      },
      {
        id: "b8-travel",
        title: "Travel to Eureka Springs — mental rehearsal",
        minutes: 60,
        activity: "Silent run-through of opening in car; staff handles logistics.",
        why: "Transition time is rehearsal time.",
      },
      {
        id: "b8-stage",
        title: "Stage — Command Mode active",
        minutes: 120,
        href: "/admin/intelligence/run-of-show",
        activity: "Follow run of show; post-debrief in session debrief strip.",
        why: "This sets the tone for the entire general election.",
      },
      {
        id: "b8-debrief",
        title: "Post-debate debrief + press",
        minutes: 45,
        href: "/admin/intelligence/rehearsal-history",
        activity: "Capture what worked; APA LTE draft within 48h.",
        why: "Peak-end — how you leave the room matters for coverage.",
      },
    ],
    opponentExamples: [],
    rehearsalOutLoud: ["Opening once backstage — not twice (save voice)"],
    newspaperAngle: "Same-day quote to friendly editor if available; APA LTE next morning.",
    successCheck: "Kelly completes debate; debrief logged; no unverified lines used on stage.",
  },
];

export const DEBATE_WEEK_INTENSIVE_DAY_IDS = DEBATE_WEEK_INTENSIVE_DAYS.map((d) => d.dayId);

export function debateWeekIntensiveDayHref(dayId: IntensiveDayId): string {
  return `${DEBATE_WEEK_INTENSIVE_HUB_HREF}/${dayId}`;
}

export function getDebateWeekIntensiveDay(dayId: IntensiveDayId): IntensiveDayPlan | undefined {
  return DEBATE_WEEK_INTENSIVE_DAYS.find((d) => d.dayId === dayId);
}

export function totalIntensiveMinutes(): number {
  return DEBATE_WEEK_INTENSIVE_DAYS.reduce(
    (sum, d) => sum + d.blocks.reduce((s, b) => s + b.minutes, 0),
    0,
  );
}

export function getTodayIntensiveDay(referenceDate = "2026-06-19"): IntensiveDayPlan | undefined {
  return DEBATE_WEEK_INTENSIVE_DAYS.find((d) => d.calendarDate === referenceDate);
}
