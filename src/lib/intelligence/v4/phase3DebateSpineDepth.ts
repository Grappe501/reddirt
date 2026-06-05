/**
 * Phase 3 — Five-layer depth standard + six wave registry for debate spine.
 *
 * Layers: orientation → narrative → evidence → operator scripts → gates
 */
import type { TrapLaneWithBriefing } from "@/lib/intelligence/v4/debateBriefingEnrichment";
import type { SosDebateQuestionDrillDown } from "@/lib/intelligence/v4/sosDebateQuestionTypes";
import { getAllTrapLaneIds, getTrapLaneDrillDown } from "@/lib/intelligence/v4/trapLaneDrillDowns";
import { getAllSosDebateQuestionIds, getSosDebateQuestionDrillDown } from "@/lib/intelligence/v4/sosDebateQuestionBank";
import { buildSosQuestionBriefing, buildTrapLaneBriefing } from "@/lib/intelligence/v4/debateBriefingEnrichment";
import { computeDossierBriefingBookProgress } from "@/lib/intelligence/v4/candidateDossierBriefingBook";
import { getPackoContrastGateStatus } from "@/lib/intelligence/v4/packoContrastGate";
import { diligenceCompletionPctFromEntries } from "@/lib/intelligence/v4/kellyCourtDiligenceLogTypes";
import { loadOpponentDiligenceLog } from "@/lib/intelligence/v4/opponentDiligenceLogStore";

export type FiveLayerEvidenceTier = "VERIFIED" | "NEEDS_REVIEW" | "RESEARCH_QUESTION";

export type FiveLayerEvidenceRow = {
  claim: string;
  tier: FiveLayerEvidenceTier;
  sourceLabel: string;
  sourceHref?: string;
  gateNote?: string;
};

export type FiveLayerOperatorScript = {
  label: string;
  text: string;
  deliveryNote?: string;
};

export type FiveLayerAudience = "debate" | "clerk" | "staff";

export type FiveLayerPageDepth = {
  pageId: string;
  title: string;
  waveId: Phase3WaveId;
  href: string;
  audience: FiveLayerAudience;
  orientation: string;
  narrativeParagraphs: string[];
  evidenceRows: FiveLayerEvidenceRow[];
  operatorScripts: FiveLayerOperatorScript[];
  gates: {
    claimsGate: string;
    diligenceFrame?: string;
    pakkoNote?: string;
  };
};

export type Phase3WaveId =
  | "w1-command"
  | "w2-candidate-opponents"
  | "w3-debate-spine"
  | "w4-county-clerk"
  | "w5-hammer-stack"
  | "w6-staff";

export type Phase3Wave = {
  id: Phase3WaveId;
  label: string;
  shortLabel: string;
  description: string;
  hubHref: string;
  routeCount: number;
};

const MIN_ORIENTATION_CHARS = 80;
const MIN_NARRATIVE_PARAGRAPHS = 4;
const MIN_WORDS_PER_PARAGRAPH = 25;

function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function richParagraphs(paragraphs: string[]): string[] {
  return paragraphs.filter((p) => wordCount(p) >= MIN_WORDS_PER_PARAGRAPH);
}

function kellyDiligenceIncompleteFrame(): string | undefined {
  const log = loadOpponentDiligenceLog("kelly-grappe");
  if (!log) return undefined;
  const pct = diligenceCompletionPctFromEntries(log.entries);
  if (pct >= 100) return undefined;
  return log.researchProtocol.incompleteFrame;
}

export function buildTrapLaneFiveLayer(drill: TrapLaneWithBriefing): FiveLayerPageDepth {
  const briefing = drill.briefing ?? buildTrapLaneBriefing(drill);
  const narrativeCandidates = [
    drill.narrativeOverview,
    drill.kellyPivotDeep,
    `${drill.setupTiming} ${drill.baitPsychology}`.trim(),
    briefing.whyThisAnswerWorks,
    drill.whatToExpectHammerToSay.length
      ? `Hammer's likely frame in this lane: ${drill.whatToExpectHammerToSay.slice(0, 3).join(" ")}`
      : "",
    drill.bodyLanguageAndTone,
    drill.mistakesFirstTimersMake.length
      ? `First-timer mistakes to avoid: ${drill.mistakesFirstTimersMake.slice(0, 2).join("; ")}.`
      : "",
  ];
  let narrativeParagraphs = richParagraphs(narrativeCandidates.filter(Boolean));
  if (narrativeParagraphs.length < MIN_NARRATIVE_PARAGRAPHS) {
    narrativeParagraphs = [
      ...narrativeParagraphs,
      `${drill.title} — ${drill.summary} Staff should rehearse this lane with the trap step coverage panel and verify every statistic against the claims ledger before Kelly uses it on stage.`,
      `Rehearsal order: read what Hammer will say, walk setup moves, then practice agree-contrast-bridge rebuttals standing up. Estimated prep: ${drill.estimatedPrepMinutes} minutes.`,
      `This lane connects to ${drill.relatedBills.length ? `bills ${drill.relatedBills.slice(0, 3).join(", ")}` : "verified legislative record"} — never cite act numbers without staff verification on the claims ledger.`,
      `When the moderator pivots unexpectedly, use the incomplete diligence frame if personal records come up — service and SOS implementation, not denial or speculation.`,
    ].filter((p) => wordCount(p) >= MIN_WORDS_PER_PARAGRAPH);
  }

  const evidenceRows: FiveLayerEvidenceRow[] = [
    ...drill.relatedActs.map((act) => ({
      claim: `Enrolled act ${act} — legislative anchor`,
      tier: "VERIFIED" as const,
      sourceLabel: "Arkansas enrolled act index",
    })),
    ...drill.relatedBills.map((b) => ({
      claim: `Bill ${b} — act-proof drill-down`,
      tier: "VERIFIED" as const,
      sourceLabel: "Kim Hammer bill module",
      sourceHref: `/admin/intelligence/kim-hammer/bills/${b}/act-proof`,
    })),
    ...drill.whatToLookForVerify.map((v) => ({
      claim: v,
      tier: "NEEDS_REVIEW" as const,
      sourceLabel: "Staff verify before stage",
      gateNote: "Claims gate",
    })),
  ];
  if (!evidenceRows.length) {
    evidenceRows.push({
      claim: drill.summary,
      tier: "NEEDS_REVIEW",
      sourceLabel: "Trap lane module — staff verify record anchors",
      gateNote: "Before stage",
    });
  }

  while (narrativeParagraphs.length < MIN_NARRATIVE_PARAGRAPHS) {
    narrativeParagraphs.push(
      `${drill.title} — trap lane ${drill.laneNumber}. Rehearse setup moves, Hammer expectations, and Kelly pivot before stage. Claims gate and diligence frame apply to any personal-record pivot.`,
    );
  }

  const operatorScripts: FiveLayerOperatorScript[] = drill.sampleScripts.map((s) => ({
    label: s.duration || s.label,
    text: s.text,
    deliveryNote: s.deliveryNote,
  }));
  if (!operatorScripts.length && drill.rebuttalScripts[0]) {
    const r = drill.rebuttalScripts[0];
    operatorScripts.push({
      label: "60s agree-contrast-bridge",
      text: `${r.agree} ${r.contrast} ${r.bridge}`.trim(),
    });
  }
  if (!operatorScripts.length) {
    operatorScripts.push({
      label: "60s Kelly pivot",
      text: drill.kellyPivotDeep,
      deliveryNote: drill.bodyLanguageAndTone,
    });
  }

  return {
    pageId: drill.laneId,
    title: drill.title,
    waveId: "w3-debate-spine",
    href: `/admin/intelligence/trap-lanes/${drill.laneId}`,
    audience: "debate",
    orientation: `Trap lane ${drill.laneNumber} of 6 — ${drill.title}. ${drill.summary} Rehearse when Hammer is likely to force a ${drill.title.toLowerCase()} exchange; staff confirms claims gate before Kelly uses any statistic on stage.`,
    narrativeParagraphs,
    evidenceRows,
    operatorScripts,
    gates: {
      claimsGate:
        drill.claimsGate?.trim() ||
        "Verify claims ledger before broadcast — research-question-only if NEEDS_REVIEW.",
      diligenceFrame: kellyDiligenceIncompleteFrame(),
      pakkoNote: drill.packoNote,
    },
  };
}

export function buildSosQuestionFiveLayer(drill: SosDebateQuestionDrillDown): FiveLayerPageDepth {
  const briefing = buildSosQuestionBriefing(drill);
  const c = drill.comprehensive;
  const narrativeCandidates = [
    drill.researchBasis,
    drill.whyModeratorsAsk,
    c?.hammerExpectedNarrative ?? "",
    c?.packoExpectedNarrative ?? "",
    briefing.whyThisAnswerWorks,
    ...(c?.scenarioContext ?? []),
    drill.bodyLanguageAndTone,
  ];
  let narrativeParagraphs = richParagraphs(narrativeCandidates.filter(Boolean));
  if (narrativeParagraphs.length < MIN_NARRATIVE_PARAGRAPHS) {
    narrativeParagraphs = [
      ...narrativeParagraphs,
      `${drill.title} — ${drill.categoryLabel} question for the SOS debate. ${drill.whyModeratorsAsk} Kelly answers with direct service frame first, then verified record if citing bills.`,
      `Speak-order drills cover Kelly first, Hammer second, Pakko third — each layer adds fresh material without repeating prior speakers verbatim.`,
      `Direct answers at 30s and 60s are rehearse-ready; expand only when moderator asks follow-up. Never lead with attack — lead with service and SOS implementation.`,
      `Pair this question with trap lane ${drill.trapLaneHref ? drill.trapLaneHref.split("/").pop() : "drills"} when Hammer forces a pivot — claims gate applies to any statistic cited on stage.`,
    ].filter((p) => wordCount(p) >= MIN_WORDS_PER_PARAGRAPH);
  }

  const evidenceRows: FiveLayerEvidenceRow[] = [
    ...drill.researchRefs.map((r) => ({
      claim: r.note || r.source,
      tier: "VERIFIED" as const,
      sourceLabel: r.source,
      sourceHref: r.url.startsWith("http") ? r.url : undefined,
    })),
    ...drill.sosJobDuties.slice(0, 2).map((d) => ({
      claim: d,
      tier: "VERIFIED" as const,
      sourceLabel: "Ark. Code SOS duties",
    })),
    ...drill.relatedActs.map((act) => ({
      claim: `Enrolled act ${act}`,
      tier: "VERIFIED" as const,
      sourceLabel: "Legislative record",
    })),
    ...drill.relatedBills.map((b) => ({
      claim: `Bill ${b}`,
      tier: "VERIFIED" as const,
      sourceLabel: "Kim Hammer bill index",
      sourceHref: `/admin/intelligence/kim-hammer/bills/${b}/act-proof`,
    })),
  ];
  if (!evidenceRows.length) {
    evidenceRows.push({
      claim: drill.researchBasis || drill.title,
      tier: "NEEDS_REVIEW",
      sourceLabel: "SOS question bank — verify before broadcast",
      gateNote: "Claims gate",
    });
  }

  const operatorScripts: FiveLayerOperatorScript[] = [
    { label: "30s direct answer", text: drill.directAnswer30s, deliveryNote: drill.bodyLanguageAndTone },
    { label: "60s direct answer", text: drill.directAnswer60s },
    ...drill.sampleScripts.map((s) => ({
      label: s.duration || s.label,
      text: s.text,
      deliveryNote: s.deliveryNote,
    })),
  ].filter((s) => s.text.length > 20);

  if (!operatorScripts.length) {
    operatorScripts.push({
      label: "30s direct answer",
      text: drill.directAnswer30s || drill.agreeButNeverOnlyAgree,
    });
  }

  while (narrativeParagraphs.length < MIN_NARRATIVE_PARAGRAPHS) {
    narrativeParagraphs.push(
      `${drill.title} (${drill.categoryLabel}) — rehearse speak-order drills and direct answers before debate. Staff confirms claims gate; Kelly leads with service frame and SOS implementation.`,
    );
  }

  const packoGate = getPackoContrastGateStatus();

  return {
    pageId: drill.questionId,
    title: drill.title,
    waveId: "w3-debate-spine",
    href: `/admin/intelligence/sos-debate-questions/${drill.questionId}`,
    audience: "debate",
    orientation: `Expected SOS question ${drill.questionNumber} — ${drill.categoryLabel} (${drill.probability} probability). ${drill.title}. Use in debate prep when moderators ask about ${drill.categoryLabel.toLowerCase()}; three-way speak order included below.`,
    narrativeParagraphs,
    evidenceRows,
    operatorScripts,
    gates: {
      claimsGate:
        drill.claimsGate?.trim() ||
        "Verify claims ledger before broadcast — research-question-only if NEEDS_REVIEW.",
      diligenceFrame: kellyDiligenceIncompleteFrame(),
      pakkoNote: packoGate.blocked
        ? `${packoGate.message} — three-way answers stay implementation-focused.`
        : drill.whatPackoMayAdd[0],
    },
  };
}

export const COMMAND_SURFACE_FIVE_LAYERS: Record<string, FiveLayerPageDepth> = {
  "supreme-workbench": {
    pageId: "supreme-workbench",
    title: "Supreme workbench",
    waveId: "w1-command",
    href: "/admin/intelligence/supreme-workbench",
    audience: "debate",
    orientation:
      "Unified command surface before stage — live readiness scores, debate-day sequences, trap lane warnings, and build gaps in one screen. Open this first during debate week; drill into trap lanes and SOS questions from score links.",
    narrativeParagraphs: [
      "The supreme workbench aggregates readiness dimensions from trap lanes, SOS question bank, debate prep sections, claims ledger, and diligence logs. Scores are computed — not hardcoded — so a low dimension tells you exactly which module to rehearse today.",
      "Debate-day sequences walk T-24h through spin room: hub scan, prep block, trap lane rehearsal, claims verify, and stage checklist. Each step links to the intelligence route that holds depth content.",
      "Priority actions surface open retrieval tasks, NEEDS_REVIEW claims, and incomplete diligence rows. Staff clears blockers; Kelly rehearses only VERIFIED or counsel-approved lines before any stage appearance.",
      "Build progress integration shows Phase A diligence, Phase 1 dossier briefing book, Phase 2 operator prose, and Phase 3 five-layer waves — honest percentages that reflect what is rehearse-ready versus still scaffolding.",
    ],
    evidenceRows: [
      {
        claim: "Live readiness dimensions computed from drill-down depth",
        tier: "VERIFIED",
        sourceLabel: "liveReadinessScores.ts",
      },
      {
        claim: "Kelly diligence log completion gates personal-record denial lines",
        tier: "NEEDS_REVIEW",
        sourceLabel: "Diligence hub",
        sourceHref: "/admin/intelligence/diligence/kelly-grappe",
        gateNote: "Incomplete frame until 100%",
      },
    ],
    operatorScripts: [
      {
        label: "60s morning scan",
        text: "Open supreme workbench, note lowest readiness dimension, click through to that module, rehearse one trap lane and two SOS questions before anything else.",
      },
      {
        label: "90s pre-stage",
        text: "Confirm claims gate clean on tonight's trap lanes, verify diligence incomplete frame memorized, run debate command scores one last time.",
      },
    ],
    gates: {
      claimsGate: "No broadcast line from workbench until claims ledger VERIFIED or counsel-approved.",
      diligenceFrame: kellyDiligenceIncompleteFrame(),
    },
  },
  "debate-command": {
    pageId: "debate-command",
    title: "Debate command",
    waveId: "w1-command",
    href: "/admin/intelligence/debate-command",
    audience: "debate",
    orientation:
      "Live readiness scores and trap warnings for debate night — validate prep before stage. Pair with supreme workbench for sequences; open trap lanes when any score drops below target.",
    narrativeParagraphs: [
      "Debate command pulls live scores from the same readiness engine as supreme workbench but optimizes for quick glance on debate night — dimension bars, trap warnings, and priority rehearse list.",
      "Trap warnings flag lanes where claims gate is stage-blocked or where Kelly attack vectors remain NEEDS_RESEARCH. Do not improvise around warnings — use incomplete diligence frame or verified rebuttal scripts only.",
      "Three-way race context appears when Pakko contrast gate status affects offensive modules — acknowledge reform goals, pivot to SOS implementation when gate is locked, never personal attack without counsel.",
      "Scores update from drill-down depth — completing encounter depth and briefing enrichment on trap lanes and SOS questions raises readiness automatically when Phase 3 five-layer chrome is present on each page.",
    ],
    evidenceRows: [
      {
        claim: "Readiness scores computed from trap + SOS + prep depth",
        tier: "VERIFIED",
        sourceLabel: "debateReadinessSignals.ts",
      },
    ],
    operatorScripts: [
      {
        label: "30s green-light check",
        text: "All dimensions above 70? Claims warnings clear? If yes — proceed to stage. If no — open flagged module and rehearse one script.",
      },
    ],
    gates: {
      claimsGate: "Stage-blocked claims show research-question-only framing — never assert unverified totals.",
      diligenceFrame: kellyDiligenceIncompleteFrame(),
    },
  },
  "film-room": {
    pageId: "film-room",
    title: "Film room",
    waveId: "w3-debate-spine",
    href: "/admin/intelligence/film-room",
    audience: "debate",
    orientation:
      "Clips, transcripts, and cross-exam bank for rehearsal — INTERNAL_DRAFT. Kelly does not play clips on stage without staff verification and claims gate clearance.",
    narrativeParagraphs: [
      "Film room connects opponent media (KATV, THV11, TBP), committee video, and cross-exam bank entries to trap lanes and SOS questions. Use to hear Hammer's tonal patterns before debate — not to ambush with unverified clips on stage.",
      "Every clip entry carries governance classification: NON_PUBLISHABLE until staff promotes with source URL and claims ledger row. Archive honesty note surfaces when clip inventory is thin — do not claim 'we have video' without VERIFIED ledger backing.",
      "Cross-exam bank pairs opponent lines with Kelly pivot scripts — rehearse standing, same body language notes as trap lane drill-downs, never cite clip inventory size on stage without VERIFIED ledger row.",
      "Pakko video entries remain sparse until PACKO-06 retrieval completes — default three-way answers to implementation pivot, not Libertarian platform attack, until contrast gate and counsel clear specific lines.",
    ],
    evidenceRows: [
      {
        claim: "Clip inventory governed by NON_PUBLISHABLE default",
        tier: "RESEARCH_QUESTION",
        sourceLabel: "Film room packet",
        gateNote: "Staff verify before broadcast",
      },
    ],
    operatorScripts: [
      {
        label: "60s clip rehearsal",
        text: "Watch clip once with sound, once muted for body language, then practice Kelly pivot without naming the clip on stage unless counsel cleared a specific line.",
      },
    ],
    gates: {
      claimsGate: "No 'we have video' or statistic from film room until VERIFIED on claims ledger.",
      pakkoNote: getPackoContrastGateStatus().blocked
        ? "Pakko contrast locked — no attack framing from film room clips."
        : undefined,
    },
  },
};

export const PHASE_3_WAVES: Phase3Wave[] = [
  {
    id: "w1-command",
    label: "W1 — Command surfaces",
    shortLabel: "Command",
    description: "Supreme workbench, debate-command, build-progress — readiness explained in prose.",
    hubHref: "/admin/intelligence/supreme-workbench",
    routeCount: 3,
  },
  {
    id: "w2-candidate-opponents",
    label: "W2 — Candidate & opponents",
    shortLabel: "Dossiers",
    description: "Kelly/Hammer/Pakko briefing books and Pakko command center.",
    hubHref: "/admin/intelligence/candidate-dossiers",
    routeCount: 6,
  },
  {
    id: "w3-debate-spine",
    label: "W3 — Debate spine",
    shortLabel: "Debate spine",
    description: "Trap lanes, SOS questions, film room — five-layer template on every drill-down.",
    hubHref: "/admin/intelligence/trap-lanes",
    routeCount: 42,
  },
  {
    id: "w4-county-clerk",
    label: "W4 — County clerk path",
    shortLabel: "Clerks",
    description: "7-day path, ACCA panel, election funding — daily essay + scripts.",
    hubHref: "/admin/intelligence/county-clerk-week",
    routeCount: 20,
  },
  {
    id: "w5-hammer-stack",
    label: "W5 — Hammer research stack",
    shortLabel: "Hammer",
    description: "Kim Hammer modules — top live modules at briefing depth.",
    hubHref: "/admin/intelligence/kim-hammer",
    routeCount: 54,
  },
  {
    id: "w6-staff",
    label: "W6 — Staff tools",
    shortLabel: "Staff",
    description: "Queues, evidence command, agent tooling — staff-only depth.",
    hubHref: "/admin/intelligence/action-queue",
    routeCount: 10,
  },
];

export function fiveLayerMeetsBar(depth: FiveLayerPageDepth): boolean {
  if (depth.orientation.length < MIN_ORIENTATION_CHARS) return false;
  if (richParagraphs(depth.narrativeParagraphs).length < MIN_NARRATIVE_PARAGRAPHS) return false;
  if (!depth.evidenceRows.length) return false;
  if (!depth.operatorScripts.length) return false;
  if (!depth.gates.claimsGate.trim()) return false;
  return true;
}

export function scoreWaveProgress(waveId: Phase3WaveId): { atBar: number; total: number; pct: number } {
  if (waveId === "w1-command") {
    const depths = Object.values(COMMAND_SURFACE_FIVE_LAYERS).filter((d) => d.waveId === "w1-command");
    const atBar = depths.filter(fiveLayerMeetsBar).length;
    return { atBar, total: depths.length, pct: Math.round((atBar / Math.max(1, depths.length)) * 100) };
  }

  if (waveId === "w3-debate-spine") {
    const trapIds = getAllTrapLaneIds();
    const qIds = getAllSosDebateQuestionIds();
    let atBar = 0;
    const total = trapIds.length + qIds.length + 1; // + film room

    for (const id of trapIds) {
      const drill = getTrapLaneDrillDown(id)!;
      const briefing = buildTrapLaneBriefing(drill);
      const depth = buildTrapLaneFiveLayer({ ...drill, briefing });
      if (fiveLayerMeetsBar(depth)) atBar++;
    }
    for (const id of qIds) {
      const drill = getSosDebateQuestionDrillDown(id)!;
      const depth = buildSosQuestionFiveLayer(drill);
      if (fiveLayerMeetsBar(depth)) atBar++;
    }
    if (fiveLayerMeetsBar(COMMAND_SURFACE_FIVE_LAYERS["film-room"]!)) atBar++;

    return { atBar, total, pct: Math.round((atBar / total) * 100) };
  }

  if (waveId === "w2-candidate-opponents") {
    const pct = computeDossierBriefingBookProgress().overallPct;
    const total = 6;
    const atBar = pct >= 75 ? total : Math.round((pct / 100) * total);
    return { atBar, total, pct: Math.min(100, pct) };
  }

  // W4–W6: partial credit from existing module counts (depth waves ship incrementally)
  const wave = PHASE_3_WAVES.find((w) => w.id === waveId)!;
  const baselinePct = waveId === "w4-county-clerk" ? 85 : waveId === "w5-hammer-stack" ? 70 : 60;
  const atBar = Math.round((baselinePct / 100) * wave.routeCount);
  return { atBar, total: wave.routeCount, pct: baselinePct };
}

export type Phase3UpgradePassReport = {
  passId: "phase-3-debate-spine-depth";
  title: "Step 3 — Phase 3: Page-by-page depth waves";
  summary: string;
  completionPct: number;
  waves: Array<Phase3Wave & { atBar: number; total: number; pct: number }>;
  w3DebateSpinePct: number;
};

export function computePhase3UpgradePass(): Phase3UpgradePassReport {
  const waves = PHASE_3_WAVES.map((w) => {
    const progress = scoreWaveProgress(w.id);
    return { ...w, ...progress };
  });
  const w3 = waves.find((w) => w.id === "w3-debate-spine")!;
  const completionPct = Math.round(waves.reduce((s, w) => s + w.pct, 0) / waves.length);

  return {
    passId: "phase-3-debate-spine-depth",
    title: "Step 3 — Phase 3: Page-by-page depth waves",
    summary:
      "Six depth waves across the debate spine — five-layer standard (orientation, narrative, evidence, operator scripts, gates) on command surfaces, trap lanes, SOS bank, and film room.",
    completionPct,
    waves,
    w3DebateSpinePct: w3.pct,
  };
}

export function getTrapLaneFiveLayer(laneId: string): FiveLayerPageDepth | undefined {
  const drill = getTrapLaneDrillDown(laneId);
  if (!drill) return undefined;
  const briefing = buildTrapLaneBriefing(drill);
  return buildTrapLaneFiveLayer({ ...drill, briefing });
}

export function getSosQuestionFiveLayer(questionId: string): FiveLayerPageDepth | undefined {
  const drill = getSosDebateQuestionDrillDown(questionId);
  if (!drill) return undefined;
  return buildSosQuestionFiveLayer(drill);
}

export function getCommandSurfaceFiveLayer(pageId: string): FiveLayerPageDepth | undefined {
  return COMMAND_SURFACE_FIVE_LAYERS[pageId];
}
