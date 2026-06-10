/**
 * Debate prep tutor v5 — conversational guides: why, when, how for every mode and UI element.
 */
import type { DebatePrepProfessorMode } from "@/lib/intelligence/v4/debatePrepProfessorV5";
import type { DebatePrepTutorMode } from "@/lib/intelligence/v4/debatePrepTutorPackageClient";

export const DEBATE_PREP_TUTOR_V5_VERSION = "tutor-v5.0-conversational";

export type TutorModeGuide = {
  id: string;
  label: string;
  tagline: string;
  whyThisMode: string;
  whenToUse: string;
  howItWorks: string[];
  whatYouWillGet: string[];
  coachVoice: string;
  pickIf: string;
};

export type TutorElementGuide = {
  id: string;
  title: string;
  whyItMatters: string;
  howToUse: string;
  coachTip: string;
};

export type TutorToolGuide = {
  toolId: string;
  label: string;
  whyRunIt: string;
  whenToRun: string;
  howToUse: string;
  afterYouRun: string;
};

export const TUTOR_HUB_WELCOME = {
  headline: "Hey Kelly — let's talk through tonight, not dump links at you.",
  intro:
    "I'm your debate prep coach. Think of this like office hours before a big exam: you tell me how much time you have, and I'll walk you through one thing at a time — why it matters, what to say, and what to avoid.",
  howToStart:
    "Start by asking yourself: Am I panicking (under 10 min), prepping normally (15–25 min), or do I want a full professor-style rehearsal? Pick the mode that matches your clock — not your ambition.",
  reassurance:
    "You do not need to read twenty intelligence pages tonight. Each mode gives you cards in order, coach turns you can read out loud, and optional practice feedback. Staff still verifies every claim before stage.",
  governance: "Everything here is internal · NON_PUBLISHABLE · human review before stage",
};

export const COACH_MODE_GUIDES: Record<DebatePrepTutorMode, TutorModeGuide> = {
  "panic-5": {
    id: "panic-5",
    label: "5 min panic reset",
    tagline: "One card. One line. Breathe. Go.",
    whyThisMode:
      "When adrenaline spikes, browsing makes it worse. Your brain needs ONE decision, not fifty tabs. This mode exists because county clerks and first-time statewide candidates both hit the same wall: too much intel, not enough out-loud rehearsal.",
    whenToUse:
      "Use this when you're in the car, backstage, or ten minutes from mic — and you feel like you haven't 'done enough.' You have. You need one safe line, not another research rabbit hole.",
    howItWorks: [
      "I pick the highest-probability trap or SOS card from tonight's queue.",
      "You get a coach walk-through in plain language — what Hammer is baiting, what NOT to say.",
      "You read the stage-safe line twice out loud. That's the session.",
    ],
    whatYouWillGet: ["1 drill card", "Coach turns with a Socratic question", "Safe line + do-not-say list"],
    coachVoice:
      "Kelly — stop scrolling. I'm giving you one card. Say the safe line twice. Composure is contrast; preparation reads as authority on camera.",
    pickIf: "You have under 10 minutes and your heart rate is up.",
  },
  "tonight-15": {
    id: "tonight-15",
    label: "15 min pre-stage (recommended)",
    tagline: "The sweet spot before most forums.",
    whyThisMode:
      "Fifteen minutes is the most common real-world prep window. It's enough to hit traps AND speak-order if we stay sequential — but not enough to improvise. This mode sequences the work so you don't skip the boring parts (blocked lines, agree-only warnings).",
    whenToUse:
      "Default choice before a county forum, ACCA panel, or three-way debate when you have a quarter hour and want structure without a full dress rehearsal.",
    howItWorks: [
      "Three cards from the standard tonight queue — trap, SOS, rebuttal skeleton.",
      "Optional pre-stage tool sequence runs first (blocked lines, trap warnings).",
      "Coach turns on each card; practice box opens so you can type an answer and get feedback.",
    ],
    whatYouWillGet: ["3 coached cards", "Pre-stage tool sequence", "Practice + coach critique"],
    coachVoice:
      "We're going in order — no jumping around. First what's blocked, then what Hammer is likely to bait, then your timed skeleton. Agreement is fine; agreement-only closes are not.",
    pickIf: "You have 15–20 minutes and want the standard pre-stage pass.",
  },
  "deep-30": {
    id: "deep-30",
    label: "30 min full rehearsal",
    tagline: "Run the queue like it's show night.",
    whyThisMode:
      "Thirty minutes lets you practice answers and hear critique — not just read prompts. Political debate is muscle memory: the pivot sentence needs to be in your mouth before adrenaline writes a new one.",
    whenToUse:
      "The night before a major debate, or same-day when you have a real block of time and want to simulate back-to-back exchanges.",
    howItWorks: [
      "Up to six cards alternating trap pivots and SOS speak-order.",
      "After each card, type what you'd actually say — I flag agree-only closes, unsourced stats, blocked lines.",
      "Use Prev/Next to revisit weak cards; run Packo advisor if three-way dynamics show up.",
    ],
    whatYouWillGet: ["6-card queue", "Practice critique on every answer", "Full framework principles"],
    coachVoice:
      "Treat each card like a moderator just asked it. Type your real answer — messy is fine. I'll tell you if it's stage-safe and if you closed on agreement alone.",
    pickIf: "You have 30+ minutes and want practice feedback, not just reading.",
  },
  "check-my-record": {
    id: "check-my-record",
    label: "Check My Record drill",
    tagline: "When Hammer invites record comparison — welcome it.",
    whyThisMode:
      "'Check my record' sounds scary until you remember the job description. He's a Senator (author); you're running to administer. That frame is your semester thesis — this drill walks it beat by beat.",
    whenToUse:
      "When you expect Hammer to retreat to legislative acts, or when staff flags record-comparison traps in the prep bank.",
    howItWorks: [
      "Six-beat walkthrough: welcome → verified acts → wrong job → clerk harm → one trap question → administer fairly.",
      "Each beat has a 'say this' line and explicit do-not-say warnings.",
      "Run the full CMR copilot tool for a draft script — staff reviews before stage.",
    ],
    whatYouWillGet: ["Six-beat playbook on screen", "2 trap/SOS cards", "CMR tool one-click"],
    coachVoice:
      "When he says check my record, slow down and smile inside. Half-beat after each act number. One trap question — then stop. Do not litigate his whole Senate career in 90 seconds.",
    pickIf: "Hammer is likely to use record comparison or 'where's your bill?' bait.",
  },
  "three-way-panel": {
    id: "three-way-panel",
    label: "Three-way panel",
    tagline: "Kelly + Hammer + Packo — position 2/3 closes.",
    whyThisMode:
      "Three-way panels punish pile-ons. Voters remember the calm forensic voice, not whoever talked loudest. Packo brings process reform; Hammer brings slogans — you bring clerk service and verified receipts.",
    whenToUse:
      "Before any forum with Packo on stage, or when moderators use round-robin speak order.",
    howItWorks: [
      "SOS speak-order cards with Packo add-ons and Hammer bait scenarios.",
      "Agree with Packo where fair — never join a smear, always bridge to implementation.",
      "Run Packo lane advisor and direct democracy explainer tools when those threads appear.",
    ],
    whatYouWillGet: ["4 speak-order cards", "Three-way tool sequence", "Packo + DD quick tools"],
    coachVoice:
      "You're often second or third. Open with one verified line, add one contrast Hammer can't match as SOS, close with unity spine — clerks, transparency, non-partisan service.",
    pickIf: "Packo is on the program or the format is round-robin three-way.",
  },
};

export const PROFESSOR_MODE_GUIDES: Record<DebatePrepProfessorMode, TutorModeGuide> = {
  "office-hours-10": {
    id: "office-hours-10",
    label: "10 min office hours",
    tagline: "One concept. One thesis. One rehearsal.",
    whyThisMode:
      "Office hours aren't the full syllabus — they're where students fix the one misunderstanding that would blow the exam. Tonight that might be author vs administrator, or a single trap lane you keep improvising under pressure.",
    whenToUse:
      "When you understand the big picture but one exchange keeps feeling fuzzy — or when you want professor framing without a 45-minute moot.",
    howItWorks: [
      "Short framing lecture on tonight's governing thesis.",
      "One trap-pivot card with Socratic warmup questions.",
      "Type your thesis sentence; professor rubric grades structure.",
    ],
    whatYouWillGet: ["Mini-lecture", "1 card", "Thesis-evidence-pivot coaching"],
    coachVoice:
      "Ask me why before you ask what to say. If you can't explain why a moderator asked this in a SOS race — not a Senate race — we're not ready to memorize lines yet.",
    pickIf: "You want depth on ONE concept, not a full queue.",
  },
  "seminar-25": {
    id: "seminar-25",
    label: "25 min seminar",
    tagline: "Lecture, then defend your thesis like a seminar student.",
    whyThisMode:
      "Seminar format mirrors how you'd prep with a real professor: ten minutes of framing, then you defend your thesis while I push back like a moderator. It's slower than coach mode — on purpose.",
    whenToUse:
      "When you have time to think, not just react — e.g., afternoon before an evening forum.",
    howItWorks: [
      "Professor lecture: applied civics frame, evidence tiers, tonight's cards.",
      "Three coached cards with Socratic questions after each coach turn.",
      "Pre-stage tool sequence optional; practice box with rubric grading.",
    ],
    whatYouWillGet: ["Full mini-lecture", "3 cards + Socratic warmup", "Seminar reading list links"],
    coachVoice:
      "Defend your thesis — I'll push back. End every answer with what you'll DO as Secretary of State, not what Hammer failed to do as Senator.",
    pickIf: "You learn by explaining out loud and want professor pushback.",
  },
  "moot-court-45": {
    id: "moot-court-45",
    label: "45 min moot court",
    tagline: "I play moderator and opposition. Survive cross-exam.",
    whyThisMode:
      "Moot court is the closest we get to stage night without an audience. You deliver an opening thesis, I cross-examine on claims, you pivot under trap pressure — then the rubric tells you if it's defendable.",
    whenToUse:
      "Major debate prep day — when you want full-queue rehearsal plus adversarial follow-up.",
    howItWorks: [
      "Full lecture + up to six cards from standard tonight queue.",
      "Type each practice answer → professor rubric + optional moot cross-examination.",
      "CMR sequence tools available if record comparison appears in queue.",
    ],
    whatYouWillGet: ["6-card moot", "Rubric on every answer", "Cross-examination challenges"],
    coachVoice:
      "One trap question per exchange. If you ask three, you lose the jury. Defend with sources — if you cite an act number, show me the Arkleg receipt or reframe as research.",
    pickIf: "You want adversarial practice and can invest 45 minutes.",
  },
  "forensic-audit": {
    id: "forensic-audit",
    label: "12 min forensic audit",
    tagline: "Bring one answer. I'll grade it like a debate professor.",
    whyThisMode:
      "Sometimes you already know what you want to say — you need a rhetorical audit, not more content. Clarity, structure, sourcing, time, composure — five dimensions, one verdict.",
    whenToUse:
      "When you have a draft answer in your notes and want to know if it's stage-ready before you memorize it.",
    howItWorks: [
      "Two SOS speak-order cards for context.",
      "Paste your planned answer in the practice box.",
      "Professor rubric scores each dimension with a plain-language verdict.",
    ],
    whatYouWillGet: ["Rubric grades (5 dimensions)", "Professor verdict A–incomplete", "Coach critique overlay"],
    coachVoice:
      "Don't tell me what you wish you'd said — paste what you plan to say. I'll tell you if the thesis-evidence-pivot arc is visible and if you're citing acts without verification language.",
    pickIf: "You have a draft answer and want a grade, not a lecture.",
  },
};

export const TUTOR_ELEMENT_GUIDES: Record<string, TutorElementGuide> = {
  "coach-turn": {
    id: "coach-turn",
    title: "Coach turns",
    whyItMatters:
      "Each turn is a beat in the conversation — not a wall of text. Read them out loud; the Socratic question is the one you'd ask yourself backstage.",
    howToUse:
      "Use Earlier tip / Next tip to walk through. Answer the italic question in your head before reading 'Do this.'",
    coachTip: "If a turn mentions trap chess, don't argue yet — listen for the bait, then bridge.",
  },
  "practice-box": {
    id: "practice-box",
    title: "Practice your answer",
    whyItMatters:
      "Typing forces your mouth's first draft onto paper. Adrenaline rewrites answers on stage; this catches agree-only closes and unsourced numbers first.",
    howToUse:
      "Type what you'd actually say in 30–60 seconds. Hit Get coach feedback or Get professor rubric. Revise once, then move to the next card.",
    coachTip: "Messy is fine. I'm checking structure and stage gates — not grammar.",
  },
  "safe-line": {
    id: "safe-line",
    title: "Stage-safe line",
    whyItMatters:
      "This is the line staff has cleared or framed as verify-first — your anchor when the question surprises you.",
    howToUse: "Read it twice out loud. If it says verify-first, don't add act numbers until staff confirms.",
    coachTip: "One sentence opening. You can elaborate after — not before.",
  },
  "do-not-say": {
    id: "do-not-say",
    title: "Do not say (yet)",
    whyItMatters:
      "These are blocked or NEEDS_REVIEW patterns — the lines that sound good in your head but fail the stage gate or hand Hammer a clip.",
    howToUse: "Treat as hard stops tonight. If you're unsure why one is listed, open the drill-down link.",
    coachTip: "Motive attacks and unsourced stats are the usual culprits.",
  },
  "professor-lecture": {
    id: "professor-lecture",
    title: "Professor lecture",
    whyItMatters:
      "The lecture is the 'why' before the 'what.' Skim headings first; read bullets for the exchange you expect tonight.",
    howToUse:
      "Read section I (frame) and IV (stage application) minimum. Socratic warmup — answer out loud before cards.",
    coachTip: "If you only have 3 minutes, read the thesis and section IV.",
  },
  "rubric": {
    id: "rubric",
    title: "Professor rubric",
    whyItMatters:
      "Scores map to collegiate debate standards adapted for SOS panels — not vanity metrics.",
    howToUse:
      "Below 70 on Structure → rebuild thesis-evidence-pivot. Below 70 on Forensic → add verification language or drop act numbers.",
    coachTip: "A-range still needs staff to verify acts before stage.",
  },
  "tool-sequence": {
    id: "tool-sequence",
    title: "Pre-stage tool sequence",
    whyItMatters:
      "Tools generate governed drafts — blocked-line scans, trap warnings, rebuttal skeletons. Run in order; don't skip to rebuttals before traps.",
    howToUse: "Click Run on each step. Read output; don't auto-read on stage. Staff reviews all drafts.",
    coachTip: "If you're in panic mode, skip the sequence — the card safe line is enough.",
  },
};

export const TUTOR_TOOL_GUIDES: TutorToolGuide[] = [
  {
    toolId: "packo-lane-advisor",
    label: "Packo lane advisor",
    whyRunIt:
      "Packo pulls process-reform voters. You want agree+add — agree where fair, then contrast on who can actually implement as SOS.",
    whenToRun: "Three-way panel prep, or when a card mentions Packo / third candidate dynamics.",
    howToUse: "Run it after reading the current card. Use output as internal notes — not a script to recite verbatim.",
    afterYouRun: "Pick one agree line and one SOS implementation contrast. Discard anything that sounds like a smear.",
  },
  {
    toolId: "direct-democracy-explainer",
    label: "Direct democracy explainer",
    whyRunIt:
      "Ballot initiatives and citizen petitions land in SOS jurisdiction — moderators love 'process' questions that trap candidates who only have Hammer talking points.",
    whenToRun: "When speak-order cards mention petitions, ballot access, or Packo process themes.",
    howToUse: "Run once per session; skim the service-desk frame — administer fairly, clerks first.",
    afterYouRun: "One sentence: what Kelly will do as administrator, not what the legislature should have done.",
  },
  {
    toolId: "check-my-record-responder",
    label: "Check My Record tool",
    whyRunIt:
      "Generates a full six-beat CMR draft with act citations flagged for verification — faster than rebuilding from memory.",
    whenToRun: "Check My Record mode, or when Hammer record comparison appears in moot/seminar.",
    howToUse: "Run after walking the six beats on screen. Compare tool output to your spoken rhythm.",
    afterYouRun: "Staff verifies every act number. You keep the beats, not every bullet word-for-word.",
  },
];

export type SessionFlowStep = {
  step: number;
  label: string;
  instruction: string;
  why: string;
};

export function buildCoachSessionFlow(mode: DebatePrepTutorMode): SessionFlowStep[] {
  const g = COACH_MODE_GUIDES[mode];
  const base: SessionFlowStep[] = [
    {
      step: 1,
      label: "Read my opening",
      instruction: g.coachVoice,
      why: "Sets the clock and stops you from browsing.",
    },
    {
      step: 2,
      label: "Work the first card",
      instruction: "Read coach turns out loud. Answer the Socratic question before tapping Next tip.",
      why: "Trap and SOS cards fail when you improvise the opening sentence.",
    },
  ];
  if (mode === "tonight-15" || mode === "deep-30" || mode === "three-way-panel") {
    base.push({
      step: 3,
      label: "Run tool sequence (if shown)",
      instruction: "Blocked lines → trap warnings → skeleton. In order.",
      why: "Skipping traps is how agree-only closes sneak onto stage.",
    });
  }
  if (mode === "deep-30" || mode === "tonight-15") {
    base.push({
      step: base.length + 1,
      label: "Practice + feedback",
      instruction: "Type your answer. Submit for critique. Revise once.",
      why: "Muscle memory beats reading.",
    });
  }
  if (mode === "check-my-record") {
    base.push({
      step: 3,
      label: "Walk six beats",
      instruction: "One beat at a time. Half-beat pause after act numbers.",
      why: "CMR wins on pace, not volume.",
    });
  }
  base.push({
    step: base.length + 1,
    label: "Close",
    instruction: "Say your safe line twice. Stop prepping — staff has the verify list.",
    why: "Over-prep past diminishing returns raises adrenaline.",
  });
  return base;
}

export function buildProfessorSessionFlow(mode: DebatePrepProfessorMode): SessionFlowStep[] {
  const g = PROFESSOR_MODE_GUIDES[mode];
  const steps: SessionFlowStep[] = [
    {
      step: 1,
      label: "Professor opening",
      instruction: g.coachVoice,
      why: g.whyThisMode,
    },
  ];
  if (mode !== "forensic-audit") {
    steps.push({
      step: 2,
      label: "Read the lecture",
      instruction: "Thesis + section IV minimum. Answer Socratic warmup out loud.",
      why: "You need the why before memorizing lines.",
    });
  }
  steps.push({
    step: steps.length + 1,
    label: "Drill cards in order",
    instruction: "Prev/Next between cards. Don't skip the do-not-say list.",
    why: "Each card is one exchange — not the whole debate.",
  });
  if (mode === "moot-court-45" || mode === "seminar-25" || mode === "forensic-audit") {
    steps.push({
      step: steps.length + 1,
      label: "Practice + rubric",
      instruction: "Paste your answer. Read rubric dimension by dimension. Fix Structure first.",
      why: "Thesis-evidence-pivot is the grading spine.",
    });
  }
  if (mode === "moot-court-45") {
    steps.push({
      step: steps.length + 1,
      label: "Survive cross-examination",
      instruction: "Read the moot challenge. One-sentence defense with source or research frame.",
      why: "Moderators and Hammer both follow up — silence isn't a strategy.",
    });
  }
  steps.push({
    step: steps.length + 1,
    label: "Close office hours",
    instruction: "One administrable pledge as SOS. Verify acts with staff before stage.",
    why: g.tagline,
  });
  return steps;
}

export function getTutorHubGuides() {
  return {
    version: DEBATE_PREP_TUTOR_V5_VERSION,
    welcome: TUTOR_HUB_WELCOME,
    coachModes: Object.values(COACH_MODE_GUIDES),
    professorModes: Object.values(PROFESSOR_MODE_GUIDES),
    elements: Object.values(TUTOR_ELEMENT_GUIDES),
    tools: TUTOR_TOOL_GUIDES,
  };
}

export function getCoachModeGuide(mode: DebatePrepTutorMode): TutorModeGuide {
  return COACH_MODE_GUIDES[mode];
}

export function getProfessorModeGuide(mode: DebatePrepProfessorMode): TutorModeGuide {
  return PROFESSOR_MODE_GUIDES[mode];
}
