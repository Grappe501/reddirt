/**
 * Phase 15 P2 — Kelly seven-day debate prep path (orchestrated candidate journey).
 */
import type { PrepDayPlan, PrepReadItem } from "@/lib/intelligence/v4/countyClerkSevenDayPrepPath";

export type KellyPrepWeekDayId =
  | "day-1-philosophy"
  | "day-2-trap-lanes"
  | "day-3-sos-questions"
  | "day-4-opposition"
  | "day-5-three-way"
  | "day-6-simulation"
  | "day-7-red-lines";

export type KellyPrepWeekDayPlan = PrepDayPlan & {
  dayId: KellyPrepWeekDayId;
  weekdayLabel: string;
};

export const KELLY_PREP_WEEK_HUB_HREF = "/admin/intelligence/kelly-prep-week";

export const KELLY_PREP_WEEK_PRIMER = {
  headline: "One week, one sequence — not eighty random links",
  whoThisIsFor:
    "Kelly on a standard debate-prep week: philosophy framing first, trap rehearsal mid-week, full simulation before stage, claims-only on rest day.",
  dailyHabit:
    "Open command home for readiness, then work today's day card in order — each reading lists minutes, extract goal, and stage-safe rehearsal lines.",
  hammerPattern:
    "Hammer leads with authorship and integrity slogans — Kelly answers with implementation, clerk partnership, and verified contrast.",
  winCondition:
    "Kelly finishes the week knowing what to say tonight, what Hammer will try, and which lines are still blocked by claims.",
};

export const KELLY_PREP_WEEK_DAYS: KellyPrepWeekDayPlan[] = [
  {
    day: 1,
    dayId: "day-1-philosophy",
    weekdayLabel: "Monday",
    title: "Philosophy + framing",
    subtitle: "Build handling vocabulary before offense drills",
    goalForKelly:
      "Internalize agree-but-contrast and author-vs-administrator frames — every later trap lane uses these two moves.",
    hammerTrapWeWant: "Do not debate bills yet — build Kelly's philosophy spine first.",
    kellyReads: [
      {
        id: "k1-home",
        href: "/admin/intelligence",
        label: "Command home — readiness + safe/blocked lines",
        minutes: 10,
        whatToExtract: "Tonight readiness %, three safe lines, three blocked lines",
        positioningForClerks: "Same frames work in clerk rooms — partnership before punch.",
        kellySuperiorityAngle: "Kelly opens with service; Hammer opens with authorship.",
      },
      {
        id: "k1-brief-agree",
        href: "/admin/intelligence/debate-briefings/agree-but-never-only-agree",
        label: "Philosophy briefing — agree but never only agree",
        minutes: 15,
        whatToExtract: "Validate → add fresh layer → never end on agree alone",
        positioningForClerks: "Use when Hammer says 'we all want secure elections.'",
        kellySuperiorityAngle: "Kelly adds county implementation Hammer skips.",
      },
      {
        id: "k1-brief-author",
        href: "/admin/intelligence/debate-briefings/author-vs-administrator",
        label: "Philosophy briefing — author vs administrator",
        minutes: 15,
        whatToExtract: "Sponsoring law ≠ running SOS — job-fit contrast without smear",
        positioningForClerks: "Clerks need administrators who answer the phone.",
        kellySuperiorityAngle: "Kelly offers desk experience; Hammer offers bill numbers.",
      },
      {
        id: "k1-framework",
        href: "/admin/intelligence/kelly-strategic-plan/framework",
        label: "Kelly SOS manual — framework chapter",
        minutes: 20,
        whatToExtract: "Three pillars tied to tonight's message lanes",
        positioningForClerks: "Framework maps to clerk training and funding asks.",
        kellySuperiorityAngle: "Kelly's theory of change is operational, not rhetorical.",
      },
    ],
    rehearsalOutLoud: [
      "60s agree-but-contrast on 'secure elections' without naming Hammer",
      "60s author vs administrator close — job fit, not personality",
    ],
    afterTheDay: "Note one philosophy line that felt natural — staff logs claims status if new.",
    successCheck: "Kelly can explain two handling methods without notes; zero NEEDS_REVIEW lines rehearsed.",
  },
  {
    day: 2,
    dayId: "day-2-trap-lanes",
    weekdayLabel: "Tuesday",
    title: "Trap lanes 1–3",
    subtitle: "Rehearse Hammer's first three bait lines",
    goalForKelly:
      "Run lanes 1–3 with speak-order drills — authorship, 2021 package, and ranking traps.",
    hammerTrapWeWant: "Hammer stays in 'I wrote the bills' lane — Kelly pivots to funding and clerks.",
    kellyReads: [
      {
        id: "k2-trap-hub",
        href: "/admin/intelligence/trap-lanes",
        label: "Trap lanes hub — lanes 1–3",
        minutes: 10,
        whatToExtract: "Lane titles and Hammer bait one-liners",
        positioningForClerks: "Same pivots work when clerks ask who pays for mandates.",
        kellySuperiorityAngle: "Kelly names line items; Hammer names rankings.",
      },
      {
        id: "k2-lane-authorship",
        href: "/admin/intelligence/trap-lanes/2021-vs-2025-pivot",
        label: "Trap lane — 2021 vs 2025 pivot",
        minutes: 25,
        whatToExtract: "Full rebuttal script + what Hammer will say list",
        positioningForClerks: "Ask for county cost worksheet per 2021 act.",
        kellySuperiorityAngle: "Administrator answer vs author answer.",
      },
      {
        id: "k2-lane-2021",
        href: "/admin/intelligence/trap-lanes/integrity-without-participation",
        label: "Trap lane — integrity without participation",
        minutes: 25,
        whatToExtract: "Continuity trap — 2025 fresh start vs 2021 burden",
        positioningForClerks: "Clerks lived the six-bill year — Kelly acknowledges burden.",
        kellySuperiorityAngle: "Kelly partners with clerks; Hammer campaigns on authorship.",
      },
      {
        id: "k2-coaching",
        href: "/admin/intelligence/kelly-debate-coaching",
        label: "Debate coaching — stage presence",
        minutes: 15,
        whatToExtract: "Three-way geometry reminder before deep drills",
        positioningForClerks: "Calm presence reads as competence in clerk rooms.",
        kellySuperiorityAngle: "Kelly presence vs Hammer performative certainty.",
      },
    ],
    rehearsalOutLoud: [
      "Lane 1 rebuttal — 90s out loud with speak-order 1·2·3",
      "Lane 2 — agree on security, add county funding question",
    ],
    afterTheDay: "Mark any script with red claims badge — do not use on stage.",
    successCheck: "Two trap lanes rehearsed aloud; debate command shows no new BLOCKED lanes.",
  },
  {
    day: 3,
    dayId: "day-3-sos-questions",
    weekdayLabel: "Wednesday",
    title: "SOS question bank — top drills",
    subtitle: "Moderator Q&A speak-order rehearsal",
    goalForKelly:
      "Work the highest-frequency SOS questions — direct answer in 30s, then fresh add, never agree-only close.",
    hammerTrapWeWant: "Hammer gives one-word agree — Kelly always adds implementation layer.",
    kellyReads: [
      {
        id: "k3-sos-hub",
        href: "/admin/intelligence/sos-debate-questions",
        label: "SOS question bank hub",
        minutes: 10,
        whatToExtract: "Pick top 5 by relevance to next event",
        positioningForClerks: "Clerk questions overlap SOS moderator prompts.",
        kellySuperiorityAngle: "Kelly answers with specifics; Hammer with slogans.",
      },
      {
        id: "k3-sos-integrity",
        href: "/admin/intelligence/sos-debate-questions/2020-election-fairness",
        label: "SOS Q — 2020 election fairness",
        minutes: 20,
        whatToExtract: "30s direct answer + Hammer angle + speak-order drills",
        positioningForClerks: "Trust = clerks + SOS hotline, not Capitol rhetoric.",
        kellySuperiorityAngle: "Kelly names clerks as heroes.",
      },
      {
        id: "k3-sos-funding",
        href: "/admin/intelligence/sos-debate-questions/county-clerks-unfunded-mandates",
        label: "SOS Q — county clerks unfunded mandates",
        minutes: 20,
        whatToExtract: "CVSGF research-question framing only until ledger verified",
        positioningForClerks: "Core clerk-room credibility question.",
        kellySuperiorityAngle: "Kelly asks for public ledger; Hammer cites acts.",
      },
      {
        id: "k3-depth",
        href: "/admin/intelligence/debate-depth/if-stuck",
        label: "Plain-language depth — if you get stuck",
        minutes: 12,
        whatToExtract: "Bridge phrases when moderator moves fast",
        positioningForClerks: "Honest pause beats fake certainty.",
        kellySuperiorityAngle: "Kelly models transparency under pressure.",
      },
    ],
    rehearsalOutLoud: [
      "Three SOS questions — speak order 1·2·3 each",
      "One 'stuck' bridge phrase cold",
    ],
    afterTheDay: "Staff verifies any new adaptation in claims ledger.",
    successCheck: "Five SOS drills complete; each ends on Kelly fresh add, not agree-only.",
  },
  {
    day: 4,
    dayId: "day-4-opposition",
    weekdayLabel: "Thursday",
    title: "Opposition + contrast",
    subtitle: "Offense map and claims check",
    goalForKelly:
      "Run opposition strategy v6.2 offense sequence — six moves, cross-exam starters, then claims gate.",
    hammerTrapWeWant: "Kelly contrasts job fit and implementation — never motive or smear.",
    kellyReads: [
      {
        id: "k4-opposition",
        href: "/admin/intelligence/opposition-strategy",
        label: "Opposition strategy layer v6.2",
        minutes: 25,
        whatToExtract: "2021 package + 2025 petition cluster + six offensive moves",
        positioningForClerks: "Offense still clerk-safe vocabulary.",
        kellySuperiorityAngle: "Kelly superiority on job fit, not personal attack.",
      },
      {
        id: "k4-debate-command",
        href: "/admin/intelligence/debate-command",
        label: "Debate command — readiness scores",
        minutes: 15,
        whatToExtract: "Blocked trap lanes and philosophy feed gaps",
        positioningForClerks: "Scores mirror what Kelly can safely say in public.",
        kellySuperiorityAngle: "Honest readiness vs overconfident opponent claims.",
      },
      {
        id: "k4-claims",
        href: "/admin/intelligence/claims",
        label: "Claims ledger — verify before broadcast",
        minutes: 20,
        whatToExtract: "NEEDS_REVIEW rows tied to today's offense lines",
        positioningForClerks: "Same firewall before clerk-room stats.",
        kellySuperiorityAngle: "Kelly verified; opponents often aren't.",
      },
      {
        id: "k4-film",
        href: "/admin/intelligence/film-room",
        label: "Film room — one pivot clip",
        minutes: 15,
        whatToExtract: "One rehearsed pivot with honesty label on clip",
        positioningForClerks: "Clips optional for clerks; vital for debate stage.",
        kellySuperiorityAngle: "Kelly rehearses; Hammer relies on repetition.",
      },
    ],
    rehearsalOutLoud: [
      "One offensive move — 90s with cross-exam starter",
      "Recite one blocked line and why it is blocked",
    ],
    afterTheDay: "Update command home safe/blocked panel after claims review.",
    successCheck: "Offense sequence skimmed; zero UNSUPPORTED lines in rehearsal.",
  },
  {
    day: 5,
    dayId: "day-5-three-way",
    weekdayLabel: "Friday",
    title: "Three-way + panel context",
    subtitle: "Psychology, ACCA, and pile-on survival",
    goalForKelly:
      "Prepare for three-candidate geometry — Kelly center, Hammer aggressive, Pakko libertarian lane.",
    hammerTrapWeWant: "Hammer tries pile-on with Pakko — Kelly holds clerk partnership frame.",
    kellyReads: [
      {
        id: "k5-psych",
        href: "/admin/intelligence/debate-prep/psychology-manual/arkansas-three-way-acca-context",
        label: "Psychology manual — three-way debate geometry",
        minutes: 20,
        whatToExtract: "Where to look, when to engage Pakko, when to ignore bait",
        positioningForClerks: "ACCA panel is three-way — same geometry.",
        kellySuperiorityAngle: "Kelly calm center; opponents fight for airtime.",
      },
      {
        id: "k5-brief-pileon",
        href: "/admin/intelligence/debate-briefings/pile-on-survival",
        label: "Philosophy briefing — pile-on survival",
        minutes: 15,
        whatToExtract: "Do not fight two fronts — pivot to clerks/SOS service",
        positioningForClerks: "Clerks watch temperament under pressure.",
        kellySuperiorityAngle: "Kelly rises above; Hammer escalates.",
      },
      {
        id: "k5-clerk",
        href: "/admin/intelligence/county-clerk-week",
        label: "County clerk week — panel context card",
        minutes: 15,
        whatToExtract: "ACCA panel prep sections if clerk event upcoming",
        positioningForClerks: "Clerk vocabulary for Thu Jun 11 panel.",
        kellySuperiorityAngle: "Kelly prepared for clerk audience specifically.",
      },
      {
        id: "k5-packo",
        href: "/admin/intelligence/opponents/michael-packo",
        label: "Pakko command — contrast scaffold",
        minutes: 15,
        whatToExtract: "Respect line + contrast gate — no unsourced attacks",
        positioningForClerks: "Pakko lane separate from clerk partnership message.",
        kellySuperiorityAngle: "Kelly SOS credibility vs protest vote split.",
      },
    ],
    rehearsalOutLoud: [
      "90s three-way opening — Kelly center, no opponent names first 30s",
      "One pile-on pivot phrase out loud",
    ],
    afterTheDay: "Confirm Pakko contrast gate status with staff.",
    successCheck: "Three-way opening rehearsed; psychology manual section complete.",
  },
  {
    day: 6,
    dayId: "day-6-simulation",
    weekdayLabel: "Saturday",
    title: "Full simulation",
    subtitle: "Debate prep sections 1–10 + trap/SOS integration",
    goalForKelly:
      "Run a 60-minute simulation — prep packet sections 1–10, then trap lanes + SOS bank under time pressure.",
    hammerTrapWeWant: "Simulation exposes agree-only closes — fix before Sunday rest day.",
    kellyReads: [
      {
        id: "k6-prep",
        href: "/admin/intelligence/kim-hammer/debate-prep",
        label: "Debate prep packet — sections 1–10",
        minutes: 35,
        whatToExtract: "Highest trap-density sections per operator guide",
        positioningForClerks: "Sections 4, 6–8 map to clerk funding traps.",
        kellySuperiorityAngle: "Kelly integrated rehearsal; opponents wing it.",
      },
      {
        id: "k6-trap-all",
        href: "/admin/intelligence/trap-lanes",
        label: "All six trap lanes — timed run",
        minutes: 25,
        whatToExtract: "60s per lane — rebuttal only, no notes",
        positioningForClerks: "Same pivots under time pressure.",
        kellySuperiorityAngle: "Kelly scripted readiness.",
      },
      {
        id: "k6-sos-sprint",
        href: "/admin/intelligence/sos-debate-questions",
        label: "SOS sprint — 5 questions timed",
        minutes: 20,
        whatToExtract: "Speak-order under 90s total per question",
        positioningForClerks: "Moderator pace practice.",
        kellySuperiorityAngle: "Kelly concise; Hammer verbose.",
      },
    ],
    staffOnly: [
      "Staff times simulation and logs weak segments in action queue",
      "Run debate-command readiness check after simulation",
    ],
    rehearsalOutLoud: [
      "Full 60-min simulation block — staff calls Hammer bait lines",
      "Closing 60s — administrator frame, no smear",
    ],
    afterTheDay: "Debrief with staff — top 3 fixes for Sunday review.",
    successCheck: "Simulation complete; debate command readiness ≥70% on all dimensions.",
  },
  {
    day: 7,
    dayId: "day-7-red-lines",
    weekdayLabel: "Sunday",
    title: "Rest + red lines",
    subtitle: "Claims-only five-minute review",
    goalForKelly:
      "Light day — review safe/blocked lines, five-minute claims check, mental rest before event week.",
    hammerTrapWeWant: "No new content — consolidation only.",
    kellyReads: [
      {
        id: "k7-home",
        href: "/admin/intelligence",
        label: "Command home — final safe/blocked scan",
        minutes: 5,
        whatToExtract: "Three safe, three blocked — memorize safe only",
        positioningForClerks: "Same scan before clerk events.",
        kellySuperiorityAngle: "Kelly disciplined; opponents overclaim Sunday night.",
      },
      {
        id: "k7-claims",
        href: "/admin/intelligence/claims",
        label: "Claims ledger — red line review",
        minutes: 10,
        whatToExtract: "Any NEEDS_REVIEW touched during week — confirm still blocked",
        positioningForClerks: "Clerk stats especially gated.",
        kellySuperiorityAngle: "Kelly never improvises unverified numbers.",
      },
      {
        id: "k7-coaching-close",
        href: "/admin/intelligence/kelly-debate-coaching",
        label: "Coaching — opening and closing only",
        minutes: 10,
        whatToExtract: "One opening, one closing — stage-ready lines only",
        positioningForClerks: "Clerk-first opening variant if needed.",
        kellySuperiorityAngle: "Kelly bookends with service frame.",
      },
    ],
    rehearsalOutLoud: [
      "Opening 60s — verified lines only",
      "Closing 60s — clerk partnership invoke",
    ],
    afterTheDay: "Rest — no new research; staff handles overnight claims ingest.",
    successCheck: "Week complete; Kelly can name three safe lines and three blocked lines from memory.",
  },
];

export const KELLY_PREP_WEEK_DAY_IDS = KELLY_PREP_WEEK_DAYS.map((d) => d.dayId);

export function kellyPrepWeekDayHref(dayId: KellyPrepWeekDayId): string {
  return `${KELLY_PREP_WEEK_HUB_HREF}/${dayId}`;
}

export function getKellyPrepWeekDayPlan(dayId: KellyPrepWeekDayId): KellyPrepWeekDayPlan | undefined {
  return KELLY_PREP_WEEK_DAYS.find((d) => d.dayId === dayId);
}

export function getKellyPrepWeekDayByNumber(day: number): KellyPrepWeekDayPlan | undefined {
  return KELLY_PREP_WEEK_DAYS.find((d) => d.day === day);
}

export function totalKellyPrepWeekReadMinutes(): number {
  return KELLY_PREP_WEEK_DAYS.reduce(
    (sum, d) => sum + d.kellyReads.reduce((s, r) => s + r.minutes, 0),
    0,
  );
}

export function listKellyPrepWeekReadHrefs(): string[] {
  const seen = new Set<string>();
  for (const day of KELLY_PREP_WEEK_DAYS) {
    for (const read of day.kellyReads) {
      seen.add(read.href.split("#")[0] ?? read.href);
    }
  }
  return [...seen];
}

export function countKellyPrepWeekReads(): number {
  return KELLY_PREP_WEEK_DAYS.reduce((n, d) => n + d.kellyReads.length, 0);
}
