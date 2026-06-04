import type { SosDebateQuestionDrillDown, SosDebateQuestionCategory } from "@/lib/intelligence/v4/sosDebateQuestionTypes";
import type { TrapLaneDrillDown } from "@/lib/intelligence/v4/trapLaneDrillDownTypes";
import type { DebateQuestionBriefing, DebateAlternativeLine, HammerResearchHook } from "@/lib/intelligence/v4/debateBriefingDepthTypes";

const CATEGORY_PHILOSOPHY: Record<SosDebateQuestionCategory, string[]> = {
  "elections-integrity": ["agree-but-never-only-agree", "integrity-without-nationalizing", "author-vs-administrator"],
  "voter-access": ["agree-but-never-only-agree", "county-clerk-partnership", "presence-without-repetition"],
  "county-administration": ["county-clerk-partnership", "author-vs-administrator", "rebuttal-architecture"],
  "direct-democracy": ["direct-democracy-offense", "agree-but-never-only-agree", "author-vs-administrator"],
  "business-services": ["author-vs-administrator", "presence-without-repetition"],
  "office-role": ["author-vs-administrator", "agree-but-never-only-agree"],
  "experience-readiness": ["author-vs-administrator", "pile-on-survival", "rebuttal-architecture"],
  "security-cyber": ["integrity-without-nationalizing", "county-clerk-partnership"],
  "three-way-race": ["pile-on-survival", "presence-without-repetition", "agree-but-never-only-agree"],
  "current-record": ["presence-without-repetition", "agree-but-never-only-agree", "rebuttal-architecture"],
};

const OPENER_VARIANTS: DebateAlternativeLine[] = [
  {
    label: "Service desk open",
    text: "Let me answer as someone asking to run the Secretary of State's office — not re-litigate talking points.",
    whenToUse: "When prior answers were slogan-heavy",
    presenceGoal: "Executive calm",
  },
  {
    label: "Clerk-first open",
    text: "County clerks will tell you what this question is really about — I'll start there.",
    whenToUse: "County or funding angles",
    presenceGoal: "Field credibility",
  },
  {
    label: "Unity open",
    text: "We can agree on the goal — here's what differs in who will deliver for Arkansas counties.",
    whenToUse: "Second or third speaker",
    presenceGoal: "Cross-aisle warmth",
  },
  {
    label: "Educator open",
    text: "Voters deserve a plain answer — then what the Secretary of State does about it.",
    whenToUse: "Process or access questions",
    presenceGoal: "Teacher clarity",
  },
];

const CLOSER_VARIANTS: DebateAlternativeLine[] = [
  {
    label: "Phone line close",
    text: "When a new rule hits a county on a Friday afternoon, they need a Secretary of State who answers — I will.",
    whenToUse: "Implementation questions",
    presenceGoal: "Reliable partner",
  },
  {
    label: "Civic Index close",
    text: "Measure me by transparency and accountability — the Civic Index frame I will bring to this office.",
    whenToUse: "Integrity or education themes",
    presenceGoal: "Reform without rage",
  },
  {
    label: "Non-partisan close",
    text: "This office serves every voter — I'll keep it that way.",
    whenToUse: "Partisan bait questions",
    presenceGoal: "Steady arbiter",
  },
  {
    label: "Forward close",
    text: "The next election is the test — not tonight's applause.",
    whenToUse: "2020 or national frames",
    presenceGoal: "Forward-looking SOS",
  },
];

const CONTRAST_VARIANTS: DebateAlternativeLine[] = [
  {
    label: "Role contrast",
    text: "Senators write; Secretaries of State implement with 75 counties — different job, different test.",
    whenToUse: "Hammer cites authorship",
    presenceGoal: "High-road contrast",
  },
  {
    label: "Funding contrast",
    text: "A mandate without training money is a press release — SOS must show up with a plan.",
    whenToUse: "Unfunded mandates",
    presenceGoal: "Clerk ally",
  },
  {
    label: "Triangle contrast",
    text: "You heard agreement twice — neither answer named who pays clerks to implement.",
    whenToUse: "Three-way pile-on",
    presenceGoal: "Distinct third voice",
  },
];

function pickVariants<T>(pool: T[], seed: number, count: number): T[] {
  const out: T[] = [];
  for (let i = 0; i < count; i++) {
    out.push(pool[(seed + i) % pool.length]!);
  }
  return out;
}

function categoryHammerHooks(drill: SosDebateQuestionDrillDown): HammerResearchHook[] {
  const hooks: HammerResearchHook[] = [
    {
      label: "Opposition strategy layer",
      href: "/admin/intelligence/opposition-strategy",
      finding: "Trap coverage, offensive moves, 2021/2025 package continuity — read before HIGH-probability Qs.",
      howToUseInPrep: "Open opposition strategy; scan moves matching this category.",
    },
    {
      label: "Film room",
      href: "/admin/intelligence/film-room",
      finding: "Hammer cadence and committee clips — do not cite on stage unless clip ID verified.",
      howToUseInPrep: "Rehearse hearing Hammer's likely line before your triplet rebuttal.",
    },
  ];
  if (drill.relatedBills.length) {
    for (const bill of drill.relatedBills.slice(0, 2)) {
      hooks.push({
        label: `${bill} act proof`,
        href: `/admin/intelligence/kim-hammer/bills/${bill}/act-proof`,
        finding: "Curated or synthesized playbook — verify Arkleg night-before.",
        howToUseInPrep: `Use as fresh-addition anchor for Q${drill.questionNumber}.`,
      });
    }
  }
  if (drill.category === "direct-democracy") {
    hooks.push({
      label: "2025 petition cluster",
      href: "/admin/intelligence/opposition-strategy",
      finding: "SB584 cluster — petition process impact.",
      howToUseInPrep: "Pair with direct-democracy philosophy briefing.",
    });
  }
  if (drill.category === "county-administration" || drill.trapLaneHref?.includes("county")) {
    hooks.push({
      label: "Election funding",
      href: "/admin/intelligence/election-funding",
      finding: "CVSGF statutory frame — county ledger partially NEEDS_RESEARCH.",
      howToUseInPrep: "Use statutory language if dollar figures unverified.",
    });
  }
  if (drill.trapLaneHref) {
    hooks.push({
      label: "Linked trap lane",
      href: drill.trapLaneHref,
      finding: "Full bait/pivot/rebuttal drill-down for this question shape.",
      howToUseInPrep: "Rehearse trap after 60s answer.",
    });
  }
  hooks.push({
    label: "Evidence command",
    href: "/admin/intelligence/kim-hammer/evidence-command",
    finding: "Staff citation locker for act numbers and clips.",
    howToUseInPrep: "Final gate before any bill number on stage.",
  });
  return hooks;
}

function buildWhyThisAnswerWorks(drill: SosDebateQuestionDrillDown): string {
  return [
    `Moderators ask this because ${drill.whyModeratorsAsk.toLowerCase().replace(/\.$/, "")}.`,
    `Your 30s line (${drill.directAnswer30s.slice(0, 60)}…) works because it (1) answers the question in Arkansas terms, (2) adds a SOS deliverable Hammer cannot claim from the Senate floor, and (3) leaves room for a fresh addition if you speak second or third.`,
    drill.agreeButNeverOnlyAgree
      ? `The agree-but-never-only-agree spine here: ${drill.agreeButNeverOnlyAgree}`
      : "",
  ]
    .filter(Boolean)
    .join(" ");
}

function buildOppositionIntelNote(drill: SosDebateQuestionDrillDown): string {
  const hammer = drill.whatHammerLikelySays[0] ?? "integrity branding";
  const packo = drill.whatPackoMayAdd[0];
  return [
    `Expect Hammer to lead with: "${hammer.slice(0, 80)}${hammer.length > 80 ? "…" : ""}".`,
    packo ? `Packo may add: "${packo.slice(0, 70)}…" — use triangle contrast, not biography defense.` : "",
    drill.rebuttalIfHammerAttacks[0]
      ? `Primary rebuttal trigger: ${drill.rebuttalIfHammerAttacks[0].trigger} — rehearse agree/contrast/bridge once aloud.`
      : "",
    drill.claimsGate.includes("NEEDS") ? `Claims gate active: ${drill.claimsGate}` : "",
  ]
    .filter(Boolean)
    .join(" ");
}

export function buildSosQuestionBriefing(drill: SosDebateQuestionDrillDown): DebateQuestionBriefing {
  const seed = drill.questionNumber;
  const openers = pickVariants(OPENER_VARIANTS, seed, 3).map((v, i) => ({
    ...v,
    label: `${v.label} (Q${drill.questionNumber}${String.fromCharCode(65 + i)})`,
  }));
  const closers = pickVariants(CLOSER_VARIANTS, seed + 2, 3).map((v, i) => ({
    ...v,
    label: `${v.label} (alt ${i + 1})`,
  }));
  const contrasts = pickVariants(CONTRAST_VARIANTS, seed + 5, 2);

  const briefingSummary = [
    drill.title,
    drill.directAnswer60s.slice(0, 220) + (drill.directAnswer60s.length > 220 ? "…" : ""),
    `Prep ~${drill.estimatedPrepMinutes} min · ${drill.probability} probability · ${drill.categoryLabel}.`,
    drill.trapLaneHref ? `Trap lane: ${drill.trapLaneHref.split("/").pop()}.` : "",
  ]
    .filter(Boolean)
    .join(" ");

  return {
    briefingSummary,
    whyThisAnswerWorks: buildWhyThisAnswerWorks(drill),
    whyNotRepeatVerbatim:
      "Voters hear three candidates — if your 60s matches your 30s or repeats the prior question's closer, you sound scripted. Keep the spine (agree + SOS deliverable + unity) but rotate openers/closers from alternatives below.",
    alternativeOpeners: openers,
    alternativeClosers: closers,
    alternativeContrasts: contrasts,
    philosophyBriefingIds: CATEGORY_PHILOSOPHY[drill.category] ?? ["agree-but-never-only-agree"],
    hammerResearchHooks: categoryHammerHooks(drill),
    quickPrepChecklist: [
      `Read briefing summary aloud once (${drill.probability} Q).`,
      "Pick one opener + one closer you have NOT used in the prior two answers.",
      `Rehearse speak-order position ${((seed % 3) + 1) as 1 | 2 | 3} fresh-addition line.`,
      drill.rebuttalIfHammerAttacks.length
        ? `Run one rebuttal triplet: ${drill.rebuttalIfHammerAttacks[0]!.trigger}`
        : "Skim Hammer likely lines — no rebuttal block yet.",
      drill.claimsGate.includes("NEEDS") ? "Claims gate — staff verify before stage." : "Claims gate clear for rehearsal.",
      "Open linked trap lane or opposition hook if time allows.",
    ],
    oppositionIntelNote: buildOppositionIntelNote(drill),
  };
}

export function buildTrapLaneBriefing(drill: TrapLaneDrillDown): DebateQuestionBriefing {
  const seed = drill.laneId.length + drill.whatToExpectHammerToSay.length;
  const bait = drill.whatToExpectHammerToSay[0] ?? drill.summary;
  const setup = drill.setupMoves[0] ?? "Ask the setup question calmly.";
  return {
    briefingSummary: [
      drill.title,
      drill.narrativeOverview.slice(0, 200) + (drill.narrativeOverview.length > 200 ? "…" : ""),
      `Pivot: ${drill.kellyPivotDeep}`,
    ].join(" "),
    whyThisAnswerWorks: `This trap works because ${drill.baitPsychology.slice(0, 180)}${drill.baitPsychology.length > 180 ? "…" : ""} Kelly's pivot (${drill.kellyPivotDeep}) reframes to SOS service without taking Hammer's bait.`,
    whyNotRepeatVerbatim:
      "Trap lanes fail when Kelly repeats the same pivot twice in one debate — vary setup question and pivot depth using sample scripts and alternative contrasts.",
    alternativeOpeners: pickVariants(OPENER_VARIANTS, seed, 2),
    alternativeClosers: pickVariants(CLOSER_VARIANTS, seed + 1, 2),
    alternativeContrasts: pickVariants(CONTRAST_VARIANTS, seed + 3, 2),
    philosophyBriefingIds: ["rebuttal-architecture", "author-vs-administrator", "presence-without-repetition"],
    hammerResearchHooks: [
      {
        label: "Trap lane index",
        href: "/admin/intelligence/trap-lanes",
        finding: drill.title,
        howToUseInPrep: "Compare all six lanes — don't over-use one pivot.",
      },
      {
        label: "Opposition strategy",
        href: "/admin/intelligence/opposition-strategy",
        finding: "Offensive moves aligned to trap coverage.",
        howToUseInPrep: "Pair lane rehearsal with one offensive move.",
      },
    ],
    quickPrepChecklist: [
      "Read bait line — know why it hooks.",
      `Rehearse setup: "${setup.slice(0, 60)}…"`,
      "Practice pivot without sneering.",
      "Run one rebuttal script triplet.",
      "Check claims on zingers — skip NEEDS_REVIEW lines.",
    ],
    oppositionIntelNote: `Hammer bait: "${bait.slice(0, 100)}${bait.length > 100 ? "…" : ""}" Watch for: ${drill.whenHeBitesSignals.slice(0, 2).join("; ") || "tone shift to bill numbers"}`,
  };
}

export type SosDebateQuestionWithBriefing = SosDebateQuestionDrillDown & { briefing: DebateQuestionBriefing };

export function attachSosQuestionBriefing(drill: SosDebateQuestionDrillDown): SosDebateQuestionWithBriefing {
  return { ...drill, briefing: buildSosQuestionBriefing(drill) };
}

export type TrapLaneWithBriefing = TrapLaneDrillDown & { briefing: DebateQuestionBriefing };

export function attachTrapLaneBriefing(drill: TrapLaneDrillDown): TrapLaneWithBriefing {
  return { ...drill, briefing: buildTrapLaneBriefing(drill) };
}
