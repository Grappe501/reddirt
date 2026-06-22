/**
 * Debate Week Intensive v3 — theory, drill-down lanes, block expansions, readiness.
 * Optional depth when Kelly has extra time; every lane explains WHY and what to look for.
 */
import {
  DEBATE_WEEK_INTENSIVE_DAYS,
  type IntensiveDayId,
} from "@/lib/intelligence/v4/debateWeekIntensive2026";
import { EP_FORUM_TRANSCRIPT_LAB_HREF } from "@/lib/election-plan/debate-prep-links";
import { getDayDeepOverlay } from "@/lib/intelligence/v4/debateWeekIntensive2026Deep";
import type { KellyDebateIntensiveProgress } from "@/lib/intelligence/v4/kellyDebateIntensiveProgress";

export const DEBATE_INTENSIVE_V3_LABEL = "Command Mode v3 · theory & drill-down lanes";
export const DEBATE_WEEK_LANES_HUB_HREF = "/admin/intelligence/debate-week-intensive/lanes";
export const DEBATE_WEEK_THEORY_HUB_HREF = "/admin/intelligence/debate-week-intensive/theory";

export type DrillDownLaneTier = "essential" | "deeper" | "stretch";

export type WhatToLookFor = {
  signal: string;
  meaning: string;
};

export type DrillDownLane = {
  id: string;
  dayId: IntensiveDayId;
  tier: DrillDownLaneTier;
  title: string;
  subtitle: string;
  minutes: number;
  theory: string;
  whyKelly: string;
  whatToLookFor: WhatToLookFor[];
  steps: string[];
  href?: string;
  relatedBlockIds?: string[];
};

export type CrossCuttingTheory = {
  id: string;
  title: string;
  category: "command-mode" | "psychology" | "adult-education" | "debate-craft" | "media" | "opponent";
  body: string;
  whyItMatters: string;
  kellyApplication: string;
  readMinutes: number;
};

export type BlockTheoryExpansion = {
  blockId: string;
  adultEducationWhy: string;
  whatSuccessLooksLike: string;
  commonMistakes: string[];
  stretchLaneId?: string;
};

export type DayV3Overlay = {
  dayId: IntensiveDayId;
  pacingNote: string;
  drillDownLanes: DrillDownLane[];
  blockExpansions: BlockTheoryExpansion[];
};

export const CROSS_CUTTING_THEORY: CrossCuttingTheory[] = [
  {
    id: "theory-command-mode",
    title: "Command Mode — posture before politics",
    category: "command-mode",
    readMinutes: 10,
    body:
      "High-stakes communicators train the body first because adrenaline hijacks vocabulary. Command Mode is not a persona — it is a protocol: scan the room, exhale, answer in your lane, never chase bait. State police and federal interview training use the same sequence because it works under cortisol.",
    whyItMatters:
      "Kelly has real qualifications but no debate stage muscle memory. Without body protocol, innocence reads as panic; with it, innocence reads as honesty.",
    kellyApplication:
      "Before every block tonight: feet planted, 4-4-6 breath, first sentence under twelve words. If you feel rushed, you are — slow down.",
  },
  {
    id: "theory-adult-education",
    title: "Adult-education pacing — safety before skill",
    category: "adult-education",
    readMinutes: 8,
    body:
      "Adults learn under threat poorly. Day 1 is body and philosophy, not trap lanes, because you cannot absorb opponent content while your nervous system is screaming. Each day adds one layer: observe → stack qualifications → ingest forum → capitalize → simulate → refine → execute.",
    whyItMatters:
      "Skipping to 'what Hammer will say' before Kelly feels grounded produces memorized lines that collapse on stage.",
    kellyApplication:
      "If a day feels like too much, finish the first two blocks and mark the day in progress — do not cram stretch lanes.",
  },
  {
    id: "theory-agree-add",
    title: "Agree but never only agree",
    category: "debate-craft",
    readMinutes: 7,
    body:
      "Hammer's opening move is almost always agree-on-security. If Kelly stops at agreement, the room hears two Republicans saying the same thing. The add-on must be one clerk-centered sentence — funding, phone calls, implementation — that reframes the job without attacking motive.",
    whyItMatters:
      "Voters punish candidates who sound like they are arguing for the sake of arguing. The add-on is how Kelly contrasts without sounding cynical.",
    kellyApplication:
      "Practice ending every agree line with 'and clerks need…' until it feels automatic.",
  },
  {
    id: "theory-author-admin",
    title: "Author vs administrator — job fit, not personality",
    category: "debate-craft",
    readMinutes: 9,
    body:
      "Legislators write law; Secretaries of State run offices clerks depend on. Hammer will list bill numbers as proof of competence. Kelly wins by naming operational work: budgets, deadlines, people who need answers on night three of early voting.",
    whyItMatters:
      "This is the race in one frame — not Hammer is bad, but Kelly is built for the desk.",
    kellyApplication:
      "Never debate bill text line-by-line. Pivot in one breath: 'Writing law and running the office are different jobs.'",
  },
  {
    id: "theory-three-way",
    title: "Three-way geometry — center, not crossfire",
    category: "psychology",
    readMinutes: 8,
    body:
      "In three-way debates, the center candidate who fights two fronts looks chaotic. Kelly engages Hammer on job fit, acknowledges Pakko briefly on clerk burden, and never tries to win a libertarian philosophy seminar on stage.",
    whyItMatters:
      "Pakko exists to split protest energy. Kelly's job is not to defeat Pakko — it is to stay administrator-credible while Hammer performs.",
    kellyApplication:
      "When both opponents talk, stillness reads as command. Look at the moderator, not the pile-on.",
  },
  {
    id: "theory-claims-gate",
    title: "Claims gate — Command Mode never improvises numbers",
    category: "debate-craft",
    readMinutes: 6,
    body:
      "Every stat, quote, and act number on stage must pass claims review. Forum transcript quotes are especially dangerous — mark needs_review until staff verifies. Research questions ('Where is the ledger?') are safer than invented figures.",
    whyItMatters:
      "One unverified number on TV can define the race negatively for weeks.",
    kellyApplication:
      "If you are not sure, ask the question instead of stating the fact.",
  },
  {
    id: "theory-peak-end",
    title: "Peak-end rule — what papers remember",
    category: "media",
    readMinutes: 6,
    body:
      "Audiences remember the emotional peak and the final minute disproportionately. Kelly's closing should be calm, clerk-rooted, and quotable — not a new attack or stat dump.",
    whyItMatters:
      "APA LTE and local visit-ad print amplify the line that sounds like a working administrator, not a debater.",
    kellyApplication:
      "Pick one closing line by Day 7 and repeat it until boring.",
  },
];

const DAY_V3: Record<IntensiveDayId, DayV3Overlay> = {
  "day-1-command-foundation": {
    dayId: "day-1-command-foundation",
    pacingNote:
      "Tonight is about feeling safe on stage, not winning arguments. If you only finish posture + author/administrator, that is a successful Day 1.",
    blockExpansions: [
      {
        blockId: "b1-posture",
        adultEducationWhy:
          "Motor skills must be automatic before cognitive load rises. Politicians look calm because they rehearsed stillness, not because they feel calm.",
        whatSuccessLooksLike:
          "Two full 4-4-6 cycles without checking notes; first spoken sentence starts after a visible pause.",
        commonMistakes: ["Swaying while listening", "Talking over the moderator's first word", "Gesturing before the second sentence"],
        stretchLaneId: "lane-d1-asp-deep",
      },
      {
        blockId: "b1-author",
        adultEducationWhy:
          "Job-fit framing is cognitively simpler than policy debate — it gives Kelly a home base to return to whenever Hammer accelerates.",
        whatSuccessLooksLike:
          "One-sentence author vs administrator line delivered without apology or over-explaining.",
        commonMistakes: ["Listing too many jobs", "Sounding defensive about never having held office", "Attacking Hammer's motives instead of job fit"],
        stretchLaneId: "lane-d1-author-deep",
      },
      {
        blockId: "b1-philosophy",
        adultEducationWhy:
          "Hammer's agree-on-security opener is predictable. Kelly must have muscle memory for the add-on before Day 2 trap lanes.",
        whatSuccessLooksLike:
          "60-second closing that agrees once, adds clerk layer, stops — no bill-number tennis.",
        commonMistakes: ["Stopping at agreement", "Adding abstract promises instead of SOS deliverables", "Sounding argumentative on shared values"],
        stretchLaneId: "lane-d1-author-deep",
      },
      {
        blockId: "b1-psych",
        adultEducationWhy:
          "Naming fear reduces amygdala hijack. Adult learners need emotional honesty before opponent content sticks.",
        whatSuccessLooksLike:
          "One fear sentence + one offer sentence spoken aloud; three psychology sections skimmed with one rehearsal script each.",
        commonMistakes: ["Skipping the journal", "Reading without rehearsing scripts aloud", "Apologizing for being new instead of anchoring competence"],
        stretchLaneId: "lane-d1-psych-stretch",
      },
      {
        blockId: "b1-tutor",
        adultEducationWhy:
          "AI repeats without judgment — builds confidence before human critique and forum-informed cards in later days.",
        whatSuccessLooksLike:
          "15-minute tutor session on opening only; Kelly can deliver opening twice without reading notes.",
        commonMistakes: ["Trying to cover every topic in one session", "Skipping video self-review", "Letting tutor session replace out-loud rehearsal"],
      },
    ],
    drillDownLanes: [
      {
        id: "lane-d1-asp-deep",
        dayId: "day-1-command-foundation",
        tier: "essential",
        title: "ASP-style command protocol — full walkthrough",
        subtitle: "Why police trainers start with breath, not talking points",
        minutes: 25,
        theory:
          "Autonomic nervous system arousal narrows working memory. Exhale activates parasympathetic response; pause signals confidence to the room before words do.",
        whyKelly:
          "You have never debated on TV. This protocol is how you borrow calm until it becomes real.",
        whatToLookFor: [
          { signal: "Shoulders rising while listening", meaning: "Adrenaline building — exhale before your mic opens." },
          { signal: "Moderator says your name", meaning: "Two-second pause is allowed; rush reads as fear." },
          { signal: "Hammer speaks first", meaning: "Stillness while he talks is power — do not fidget." },
        ],
        steps: [
          "Stand: feet shoulder-width, weight even.",
          "Run 4-4-6 breath twice with eyes open.",
          "Deliver opening under 12 words, pause, then second sentence.",
          "Mirror check: hands still until gesture carries meaning.",
        ],
        href: "/admin/intelligence/debate-prep/psychology-manual/atmosphere-management-overview",
        relatedBlockIds: ["b1-posture"],
      },
      {
        id: "lane-d1-author-deep",
        dayId: "day-1-command-foundation",
        tier: "deeper",
        title: "Author vs administrator — philosophy drill",
        subtitle: "Read the briefing, then teach it back in 60 seconds",
        minutes: 35,
        theory:
          "Contrast frames work when they describe two jobs voters already understand — legislator vs administrator — without requiring voters to know bill numbers.",
        whyKelly:
          "Hammer's strongest move is authorship. This lane makes your counter boringly automatic.",
        whatToLookFor: [
          { signal: "Hammer says 'I wrote'", meaning: "Pivot within one sentence — do not let him finish a list." },
          { signal: "Urge to cite specific acts", meaning: "Stop — job fit beats bill tennis unless claims-verified." },
        ],
        steps: [
          "Read author vs administrator briefing.",
          "Speak 60s closing that adds clerk layer after an agree line.",
          "Record yourself — count ums; target under three.",
          "Staff calls one bait line; respond in 45s.",
        ],
        href: "/admin/intelligence/debate-briefings/author-vs-administrator",
        relatedBlockIds: ["b1-author", "b1-philosophy"],
      },
      {
        id: "lane-d1-psych-stretch",
        dayId: "day-1-command-foundation",
        tier: "stretch",
        title: "Fear journal + innocence reframe",
        subtitle: "Adult learning requires naming the threat",
        minutes: 20,
        theory:
          "Metacognition — naming fear reduces amygdala hijack. Kelly's 'never debated' is an asset if paired with visible preparation.",
        whyKelly:
          "Performative politicians lose trust. Your honesty plus steady body is the combination they have not seen.",
        whatToLookFor: [
          { signal: "Self-deprecating apology", meaning: "Replace with one competence fact — nonprofit, clerks, deadlines." },
        ],
        steps: [
          "Write one sentence: what scares me about the stage.",
          "Write one sentence: what I offer the room.",
          "Read psychology manual sections 1–3.",
          "Say both sentences aloud to one person.",
        ],
        href: "/admin/intelligence/debate-prep/psychology-manual/atmosphere-management-overview",
        relatedBlockIds: ["b1-psych"],
      },
    ],
  },
  "day-2-read-the-table": {
    dayId: "day-2-read-the-table",
    pacingNote: "Today is observation, not memorization. Three tells per opponent is enough.",
    blockExpansions: [
      {
        blockId: "b2-film",
        adultEducationWhy: "Observational learning lets Kelly anticipate rhythm before content — seasoned debaters win on timing.",
        whatSuccessLooksLike: "Three physical/vocal tells for Hammer and one pivot phrase for Pakko, spoken without notes.",
        commonMistakes: ["Reading without writing tells", "Trying to counter every line in the excerpt", "Ignoring Pakko because Hammer is louder"],
        stretchLaneId: "lane-d2-film-deep",
      },
      {
        blockId: "b2-opponent-bios",
        adultEducationWhy:
          "Deep opponent knowledge converts surprise into recognition — Kelly stays in command when Hammer and Pakko feel predictable.",
        whatSuccessLooksLike:
          "Both full bios read; three Hammer priorities and one Pakko respect line spoken without notes.",
        commonMistakes: [
          "Skipping Pakko because Hammer is louder",
          "Reading bios before forum briefs — tells land better after transcript excerpts",
          "Memorizing attack lines instead of command pivots",
        ],
      },
    ],
    drillDownLanes: [
      {
        id: "lane-d2-film-deep",
        dayId: "day-2-read-the-table",
        tier: "essential",
        title: "Forum tell extraction",
        subtitle: "What Hammer does in the ACCA transcript when challenged",
        minutes: 45,
        theory:
          "Nonverbal tells precede verbal pivots. If Kelly knows when Hammer will accelerate, she can slow down — contrast reads as command.",
        whyKelly: "You cannot predict every line, but you can predict his rhythm.",
        whatToLookFor: [
          { signal: "Voice speed increases", meaning: "Hammer feels threatened — do not match pace." },
          { signal: "Ranking or Heritage cite", meaning: "Abstract scorecard coming — pivot to county clerk." },
          { signal: "Pakko looks at Hammer", meaning: "Potential pile-on — bridge to clerks." },
        ],
        steps: [
          "Read one Hammer brief — mark three tells in pull quotes.",
          "Read one Pakko brief — note one respect line.",
          "Rehearse 60s counter to ranking cite.",
        ],
        href: EP_FORUM_TRANSCRIPT_LAB_HREF,
        relatedBlockIds: ["b2-film"],
      },
      {
        id: "lane-d2-trap-deep",
        dayId: "day-2-read-the-table",
        tier: "deeper",
        title: "Trap lanes 1–2 speak-order lab",
        subtitle: "Authorship and 2021 package — pivot until boring",
        minutes: 50,
        theory: "Spaced repetition in speak-order (Kelly 1·2·3) builds retrieval under moderator pace.",
        whyKelly: "Hammer will stay in lane 1 all night if you let him.",
        whatToLookFor: [
          { signal: "Bill number list", meaning: "Bridge: 'Different job than running the office.'" },
          { signal: "2020 framing", meaning: "Do not relitigate — clerks forward." },
        ],
        steps: [
          "Open trap lanes 1–2.",
          "Staff reads bait; Kelly 60s each, three rounds.",
          "Log one line that still feels stiff — fix tomorrow, not tonight.",
        ],
        href: "/admin/intelligence/trap-lanes",
        relatedBlockIds: ["b2-trap1"],
      },
      {
        id: "lane-d2-geometry-stretch",
        dayId: "day-2-read-the-table",
        tier: "stretch",
        title: "Three-way eye-line geometry",
        subtitle: "Where to look when you are not speaking",
        minutes: 25,
        theory: "Audience reads furtive eye movement as uncertainty. Moderator-centered scanning signals respect and control.",
        whyKelly: "Command Mode includes where your eyes go.",
        whatToLookFor: [
          { signal: "Double-team from Hammer + Pakko", meaning: "Look at moderator, still hands, bridge sentence." },
        ],
        steps: [
          "Read stage presence coaching section.",
          "Practice: opponent speaks → Kelly looks at moderator.",
          "One pile-on drill with staff.",
        ],
        href: "/admin/intelligence/kelly-debate-coaching",
        relatedBlockIds: ["b2-coaching"],
      },
    ],
  },
  "day-3-superiority-map": {
    dayId: "day-3-superiority-map",
    pacingNote: "Stack three qualifications only — repetition beats breadth.",
    blockExpansions: [
      {
        blockId: "b3-claims",
        adultEducationWhy: "Self-efficacy from verified facts prevents stage improvisation that triggers claims disasters.",
        whatSuccessLooksLike: "Three superiority points green in claims; zero red lines in rehearsal.",
        commonMistakes: ["Adding a fourth job story on stage", "Using forum quotes not verified", "Sounding arrogant instead of specific"],
      },
    ],
    drillDownLanes: [
      {
        id: "lane-d3-stack",
        dayId: "day-3-superiority-map",
        tier: "essential",
        title: "Qualification stack — three beats only",
        subtitle: "Overwhelm with competence, not volume",
        minutes: 40,
        theory: "Working memory holds ~3 items under stress. Hammer overwhelms with bill count; Kelly overwhelms with three operational stories.",
        whyKelly: "Your resume is stronger than you think — pick three and repeat.",
        whatToLookFor: [
          { signal: "Urge to list every job", meaning: "Stop at three; smile; wait." },
          { signal: "Hammer bill-number spray", meaning: "Administrator pivot — night three of early voting." },
        ],
        steps: [
          "Pick three Kelly jobs from manual/framework.",
          "90s 'why qualified' — no bill numbers.",
          "Claims-check each fact used.",
        ],
        href: "/admin/intelligence/kelly-strategic-plan/framework",
        relatedBlockIds: ["b3-manual"],
      },
      {
        id: "lane-d3-funding-deep",
        dayId: "day-3-superiority-map",
        tier: "deeper",
        title: "Election funding — research question frame",
        subtitle: "Ask for the ledger; do not invent numbers",
        minutes: 45,
        theory: "Questions signal competence without claims risk. Clerks care about unfunded mandates — Hammer owns the bills that created burden.",
        whyKelly: "This is your policy lane that clerks feel in their bones.",
        whatToLookFor: [
          { signal: "CVSGF or HAVA mention", meaning: "Research frame only unless claims-verified." },
        ],
        steps: [
          "Skim election funding traps section.",
          "Memorize one research question.",
          "Rehearse 60s clerk funding answer.",
        ],
        href: "/admin/intelligence/election-funding",
        relatedBlockIds: ["b3-funding"],
      },
      {
        id: "lane-d3-offense-stretch",
        dayId: "day-3-superiority-map",
        tier: "stretch",
        title: "Offense sequence — two natural moves",
        subtitle: "Contrast on job fit, not smear",
        minutes: 35,
        theory: "Offensive moves pre-load contrast so Kelly is not always defending.",
        whyKelly: "Pick moves that feel like you — forced attack reads fake.",
        whatToLookFor: [
          { signal: "Move feels personal", meaning: "Drop it — clerk-centered only." },
        ],
        steps: [
          "Skim six offensive moves.",
          "Pick two; rehearse 90s each.",
          "Run through claims gate.",
        ],
        href: "/admin/intelligence/opposition-strategy",
        relatedBlockIds: ["b3-opposition"],
      },
    ],
  },
  "day-4-forum-intelligence": {
    dayId: "day-4-forum-intelligence",
    pacingNote: "Sunday is ingest day — cognitive load from transcript, not new traps.",
    blockExpansions: [
      {
        blockId: "b4-lab",
        adultEducationWhy: "Concrete transcript beats abstract fear — Kelly learns from real words Hammer and Pakko used.",
        whatSuccessLooksLike: "Transcript saved; v1 + v2 analysis run; five capitalize moves on notecard.",
        commonMistakes: ["Memorizing every quote", "Using unverified verbatim lines on stage", "Skipping deep analysis v2"],
        stretchLaneId: "lane-d4-lab-deep",
      },
      {
        blockId: "b4-opponent-bios-reread",
        adultEducationWhy:
          "Elaborative rehearsal — re-reading bios after forum ingest updates mental models with real words, not forecasts.",
        whatSuccessLooksLike: "Five forum lines paired with bio forecast sections; memory lines adjusted if transcript differs.",
        commonMistakes: [
          "Re-reading before forum lab completes",
          "Adding unverified forum quotes to memory lines",
          "Skipping Pakko re-read",
        ],
      },
    ],
    drillDownLanes: [
      {
        id: "lane-d4-lab-deep",
        dayId: "day-4-forum-intelligence",
        tier: "essential",
        title: "Forum lab full pipeline",
        subtitle: "Transcript → v1 → v2 → Day 5 feed",
        minutes: 90,
        theory: "Elaborative rehearsal — connecting forum lines to trap lanes cements retrieval for debate night.",
        whyKelly: "This is the highest-leverage intelligence in the race.",
        whatToLookFor: [
          { signal: "Hammer repeat phrase in transcript", meaning: "Mark as predicted debate line." },
          { signal: "claimsGate: needs_review", meaning: "Do not stage until staff clears." },
        ],
        steps: [
          "Open forum transcript lab — confirm transcript artifact.",
          "Run v1 analysis.",
          "Run v2 deep analysis.",
          "Copy five capitalize moves to notecard.",
        ],
        href: EP_FORUM_TRANSCRIPT_LAB_HREF,
        relatedBlockIds: ["b4-lab"],
      },
      {
        id: "lane-d4-sos-map",
        dayId: "day-4-forum-intelligence",
        tier: "deeper",
        title: "Forum → SOS question mapping",
        subtitle: "Moderators recycle forum themes",
        minutes: 40,
        theory: "Press convention moderators often echo forum topics — mapping reduces surprise.",
        whyKelly: "You will hear a version of forum questions again in Eureka Springs.",
        whatToLookFor: [
          { signal: "Forum topic matches SOS bank tag", meaning: "Pre-load 90s answer." },
        ],
        steps: [
          "Open SOS question bank.",
          "Match top 5 forum topics to bank questions.",
          "Note Hammer repeat lines per topic.",
        ],
        href: "/admin/intelligence/sos-debate-questions",
        relatedBlockIds: ["b4-sos"],
      },
    ],
  },
  "day-5-anticipate-and-capitalize": {
    dayId: "day-5-anticipate-and-capitalize",
    pacingNote: "Today converts intel into muscle memory — timed pairs only.",
    blockExpansions: [
      {
        blockId: "b5-lab-review",
        adultEducationWhy: "Spaced retrieval — yesterday's forum intel must be pullable in under 10 seconds.",
        whatSuccessLooksLike: "≥8 when-X-say-Y pairs timed; mock moderator block rehearsed once.",
        commonMistakes: ["New stats today", "Unverified forum quotes", "Agree-only closes"],
      },
    ],
    drillDownLanes: [
      {
        id: "lane-d5-capitalize",
        dayId: "day-5-anticipate-and-capitalize",
        tier: "essential",
        title: "Capitalize sheet — eight timed pairs",
        subtitle: "When X, say Y — then scan",
        minutes: 60,
        theory: "Implementation intentions ('if they say X, I say Y') outperform generic prep under stress.",
        whyKelly: "Command Mode is preparation, not improvisation.",
        whatToLookFor: [
          { signal: "First three words of Hammer line", meaning: "Answer should start before he finishes." },
          { signal: "Pile-on with Pakko", meaning: "Bridge to clerks — do not fight two fronts." },
        ],
        steps: [
          "Export capitalize moves from forum lab.",
          "Merge deep analysis command drills.",
          "Time eight pairs — 45s each.",
          "Claims-check every line.",
        ],
        href: "/admin/intelligence/forum-transcript-lab",
        relatedBlockIds: ["b5-lab-review"],
      },
      {
        id: "lane-d5-trap-sprint",
        dayId: "day-5-anticipate-and-capitalize",
        tier: "deeper",
        title: "Trap lanes 3–6 timed sprint",
        minutes: 50,
        theory: "Forum intel fills gaps in lanes 3–6 — combine with trap lane scripts.",
        whyKelly: "Hammer will rotate lanes if one fails — you need all six cold.",
        whatToLookFor: [{ signal: "Lane feels unfamiliar", meaning: "Forum-derived drill may cover it — check lab." }],
        steps: ["Open trap lanes 3–6.", "60s per lane, three rounds.", "Log weakest lane for Day 6 sim."],
        href: "/admin/intelligence/trap-lanes",
        relatedBlockIds: ["b5-trap-all"],
        subtitle: "Forum intel plus trap scripts",
      },
      {
        id: "lane-d5-moot-stretch",
        dayId: "day-5-anticipate-and-capitalize",
        tier: "stretch",
        title: "AI moot court — forum Hammer lines",
        minutes: 35,
        theory: "Adversarial AI drill without judgment builds speed before human simulation.",
        whyKelly: "Forum lines must feel spoken, not read.",
        whatToLookFor: [{ signal: "Reading from notes", meaning: "Redo until paraphrase natural." }],
        steps: ["30-min tutor moot session.", "Focus forum-derived Hammer only.", "One debrief note."],
        href: "/admin/intelligence/debate-prep-tutor",
        relatedBlockIds: ["b5-tutor"],
        subtitle: "Adversarial drill on real forum lines",
      },
    ],
  },
  "day-6-full-simulation": {
    dayId: "day-6-full-simulation",
    pacingNote: "Fail in the room with staff, not on stage. No new material today.",
    blockExpansions: [
      {
        blockId: "b6-opponent-bios-lock",
        adultEducationWhy:
          "Spaced retrieval on Day 6 — memory lines and command mode only, after two prior reads, become automatic under sim stress.",
        whatSuccessLooksLike: "Memory lines spoken twice per opponent; staff bait drill feels boring.",
        commonMistakes: [
          "Full dossier re-read instead of lock-in sections",
          "Skipping Pakko respect line",
          "Starting simulation without lock-in",
        ],
      },
      {
        blockId: "b6-sim",
        adultEducationWhy: "Stress inoculation — anxiety during simulation is the point.",
        whatSuccessLooksLike: "60-min sim complete; top 3 fixes logged; readiness ≥70%.",
        commonMistakes: ["Adding new attacks during sim", "Skipping debrief", "Ignoring blocked debate-command lanes"],
      },
    ],
    drillDownLanes: [
      {
        id: "lane-d6-full-sim",
        dayId: "day-6-full-simulation",
        tier: "essential",
        title: "Full three-way simulation",
        subtitle: "Opening → traps → SOS → closing",
        minutes: 90,
        theory: "Full dress rehearsal under fatigue matches Jun 24–26 prep window physiology.",
        whyKelly: "Treat today like stage night.",
        whatToLookFor: [
          { signal: "Agree-only close", meaning: "Add clerk layer." },
          { signal: "Lost thread", meaning: "Use bridge: 'Let me answer the clerk part first.'" },
        ],
        steps: [
          "Staff plays Hammer + Pakko.",
          "60-min sim — timed.",
          "30-min debrief — log top 3 fixes only.",
        ],
        href: "/admin/intelligence/rehearsal",
        relatedBlockIds: ["b6-sim"],
      },
      {
        id: "lane-d6-readiness",
        dayId: "day-6-full-simulation",
        tier: "deeper",
        title: "Debate command readiness audit",
        minutes: 30,
        theory: "Honest scores prevent false confidence before travel.",
        whyKelly: "BLOCKED lanes on TV are worse than silence.",
        whatToLookFor: [{ signal: "Any BLOCKED lane", meaning: "Cut that line from sim answers." }],
        steps: ["Open debate command.", "Review blocked lanes.", "Adjust sim script."],
        href: "/admin/intelligence/debate-command",
        relatedBlockIds: ["b6-command"],
        subtitle: "Blocked lanes and philosophy scores",
      },
      {
        id: "lane-d6-stuck-stretch",
        dayId: "day-6-full-simulation",
        tier: "stretch",
        title: "If-stuck bridge phrases",
        minutes: 25,
        theory: "Honest pause beats fake certainty — Kelly's transparency is a strength.",
        whyKelly: "Unexpected questions will happen.",
        whatToLookFor: [{ signal: "Freeze", meaning: "Bridge + breath — not rambling." }],
        steps: ["Read if-stuck depth page.", "Memorize three bridges.", "Use one in sim."],
        href: "/admin/intelligence/debate-depth/if-stuck",
        relatedBlockIds: ["b6-depth"],
        subtitle: "Honest pause protocol",
      },
    ],
  },
  "day-7-refine-and-steal-show": {
    dayId: "day-7-refine-and-steal-show",
    pacingNote: "Cut, do not add. One quotable line for papers.",
    blockExpansions: [
      {
        blockId: "b7-open-close",
        adultEducationWhy: "Peak-end rule — press remembers opening calm and closing quotable.",
        whatSuccessLooksLike: "Opening/closing memorized; one newspaper line claims-cleared.",
        commonMistakes: ["New stats after claims final", "Gimmick closing", "Over-long opening"],
      },
    ],
    drillDownLanes: [
      {
        id: "lane-d7-bookends",
        dayId: "day-7-refine-and-steal-show",
        tier: "essential",
        title: "Opening + closing polish",
        subtitle: "Bookends define coverage",
        minutes: 45,
        theory: "Editors pull from first and last minute — middle policy blur fades.",
        whyKelly: "Steal the show with calm competence, not volume.",
        whatToLookFor: [
          { signal: "Closing ends on agree", meaning: "Add clerk invoke." },
          { signal: "Opening names opponents", meaning: "Cut — clerk partnership first." },
        ],
        steps: ["Polish opening under 90s.", "Polish closing under 60s.", "Pick one quotable line."],
        href: "/admin/intelligence/kelly-debate-coaching",
        relatedBlockIds: ["b7-open-close"],
      },
      {
        id: "lane-d7-acca-psych",
        dayId: "day-7-refine-and-steal-show",
        tier: "deeper",
        title: "ACCA three-way psychology refresh",
        minutes: 35,
        theory: "Eureka Springs geometry matches ACCA panel — same pile-on dynamics.",
        whyKelly: "You have done three-way before — name that confidence.",
        whatToLookFor: [{ signal: "Hammer performs for crowd", meaning: "Slow down — contrast reads as command." }],
        steps: ["Read ACCA three-way section.", "One pile-on pivot cold.", "Claims final scan."],
        href: "/admin/intelligence/debate-prep/psychology-manual/arkansas-three-way-acca-context",
        relatedBlockIds: ["b7-psych-three"],
        subtitle: "Same geometry as Eureka Springs",
      },
    ],
  },
  "day-8-command-mode-debate": {
    dayId: "day-8-command-mode-debate",
    pacingNote: "Execution day — protocol before words. Trust the seven days.",
    blockExpansions: [],
    drillDownLanes: [
      {
        id: "lane-d8-day-of",
        dayId: "day-8-command-mode-debate",
        tier: "essential",
        title: "Debate day protocol checklist",
        subtitle: "T-24h through walk-on",
        minutes: 15,
        theory: "Routine reduces decision fatigue on stage day.",
        whyKelly: "You are not proving you belong — you belong.",
        whatToLookFor: [
          { signal: "Last-minute research urge", meaning: "Stop — trust prep." },
          { signal: "First mic moment", meaning: "4-4-6 breath before words." },
        ],
        steps: [
          "Review opening/closing once.",
          "Hydrate + light meal.",
          "Breath protocol before walk-on.",
          "Debrief + LTE path after — regardless of outcome.",
        ],
        href: "/admin/intelligence/debate-week-intensive",
        relatedBlockIds: [],
      },
      {
        id: "lane-d8-spin-stretch",
        dayId: "day-8-command-mode-debate",
        tier: "stretch",
        title: "Post-debate press + APA LTE path",
        minutes: 20,
        theory: "Newspaper moment extends beyond stage — clerk-centered quote in LTE within 48h.",
        whyKelly: "APA monthly send amplifies competence narrative.",
        whatToLookFor: [{ signal: "Reactive attack quote", meaning: "Stay administrator — clerk invoke." }],
        steps: ["Draft one LTE theme pre-debate.", "Note one quotable line if earned.", "Staff queues APA visit-ad if applicable."],
        subtitle: "Extend the newspaper moment",
      },
    ],
  },
};

export function getDayV3Overlay(dayId: IntensiveDayId): DayV3Overlay {
  return DAY_V3[dayId];
}

export function getDrillDownLane(laneId: string): DrillDownLane | undefined {
  for (const overlay of Object.values(DAY_V3)) {
    const lane = overlay.drillDownLanes.find((l) => l.id === laneId);
    if (lane) return lane;
  }
  return undefined;
}

export function listAllDrillDownLanes(): DrillDownLane[] {
  return Object.values(DAY_V3).flatMap((d) => d.drillDownLanes);
}

export function listDrillDownLanesForDay(dayId: IntensiveDayId): DrillDownLane[] {
  return DAY_V3[dayId].drillDownLanes;
}

export function debateWeekIntensiveLaneHref(laneId: string): string {
  return `/admin/intelligence/debate-week-intensive/lanes/${laneId}`;
}

export function getBlockTheoryExpansion(
  dayId: IntensiveDayId,
  blockId: string,
): BlockTheoryExpansion | undefined {
  return DAY_V3[dayId].blockExpansions.find((b) => b.blockId === blockId);
}

export type DebateIntensiveReadiness = {
  percent: number;
  label: string;
  blocksDone: number;
  blocksTotal: number;
  drillsDone: number;
  drillsTotal: number;
  lanesDone: number;
  lanesTotal: number;
  daysDone: number;
  daysTotal: number;
};

export function computeDebateIntensiveReadiness(
  progress: KellyDebateIntensiveProgress,
): DebateIntensiveReadiness {
  const blocksTotal = DEBATE_WEEK_INTENSIVE_DAYS.reduce((s, d) => s + d.blocks.length, 0);
  const blocksDone = Object.values(progress.completedBlocks).reduce((s, arr) => s + (arr?.length ?? 0), 0);

  const drillsTotal = DEBATE_WEEK_INTENSIVE_DAYS.reduce(
    (s, d) => s + getDayDeepOverlay(d.dayId).commandDrills.length,
    0,
  );
  const drillsDone = progress.completedDrills.filter(
    (id) => !id.startsWith("forum-") && !id.startsWith("deep-"),
  ).length;

  const lanesTotal = listAllDrillDownLanes().length;
  const lanesDone = progress.completedLanes?.length ?? 0;

  const daysTotal = DEBATE_WEEK_INTENSIVE_DAYS.length;
  const daysDone = progress.completedDays.length;

  const blockScore = blocksTotal > 0 ? (blocksDone / blocksTotal) * 40 : 0;
  const drillScore = drillsTotal > 0 ? (drillsDone / drillsTotal) * 25 : 0;
  const laneScore = lanesTotal > 0 ? (lanesDone / lanesTotal) * 20 : 0;
  const dayScore = daysTotal > 0 ? (daysDone / daysTotal) * 15 : 0;
  const percent = Math.round(blockScore + drillScore + laneScore + dayScore);

  let label = "Getting started";
  if (percent >= 85) label = "Command ready";
  else if (percent >= 70) label = "Debate ready";
  else if (percent >= 50) label = "On track";
  else if (percent >= 25) label = "Building foundation";

  return {
    percent,
    label,
    blocksDone,
    blocksTotal,
    drillsDone,
    drillsTotal,
    lanesDone,
    lanesTotal,
    daysDone,
    daysTotal,
  };
}
