/**
 * Phase 9 — Dossier depth expansion + debate instruction bridge closure.
 */
import { getAllPrepSectionDrillDownIds, getPrepSectionDrillDown } from "@/lib/intelligence/v4/debatePrepSectionDrillDowns";
import { getAllTrapLaneIds, getTrapLaneDrillDown } from "@/lib/intelligence/v4/trapLaneDrillDowns";
import { getAllSosDebateQuestionIds, getSosDebateQuestionDrillDown } from "@/lib/intelligence/v4/sosDebateQuestionBank";
import {
  prepSectionHasPhase9Bridge,
  sosQuestionHasPhase9Bridge,
  trapLaneHasPhase9Bridge,
} from "@/lib/intelligence/v4/applyPhase9DebateInstruction";
import { computePhase8DossierResearchAccaProgress } from "@/lib/intelligence/v4/phase8DossierResearchAccaClosure";
import { buildDebateCoachingOperatorSummary } from "@/lib/intelligence/v4/phase9DebateCoachingRunbook";
import { PHASE9_PREP_SECTION_IDS } from "@/lib/intelligence/v4/phase9DebateInstructionDepth";
import {
  KIM_HAMMER_V4_MODULES,
  PHASE9_PROMOTED_KH_MODULE_IDS,
} from "@/lib/intelligence/kimHammerV4ModuleRegistry";

const MIN_PREP_AT_BRIDGE = 28;
const MIN_TRAP_AT_BRIDGE = 6;
const MIN_SOS_AT_BRIDGE = 35;
const MIN_KH_WAVE4 = 2;
const MIN_RUNBOOK_STEPS = 8;

export const PHASE9_UPGRADE_HUB_HREF = "/admin/intelligence/phase-9-upgrade";
export const DEBATE_COACHING_HUB_HREF = "/admin/intelligence/kelly-debate-coaching";

export type Phase9OrchestrationGap = {
  id: string;
  label: string;
  status: "closed" | "partial" | "open";
  href?: string;
  note: string;
};

export type Phase9DebateInstructionProgress = {
  dossierDepthPct: number;
  prepSectionsAtBridge: number;
  prepSectionTotal: number;
  trapLanesAtBridge: number;
  trapLaneTotal: number;
  sosQuestionsAtBridge: number;
  sosQuestionTotal: number;
  coachingRunbookSteps: number;
  khWave4Promoted: number;
  expansionSectionCoverage: number;
  overallPct: number;
};

export function computePhase9DebateInstructionProgress(): Phase9DebateInstructionProgress {
  const phase8 = computePhase8DossierResearchAccaProgress();

  const prepIds = getAllPrepSectionDrillDownIds();
  const prepAtBridge = prepIds.filter((id) => {
    const s = getPrepSectionDrillDown(id);
    return s && prepSectionHasPhase9Bridge(s);
  }).length;

  const trapIds = getAllTrapLaneIds();
  const trapAtBridge = trapIds.filter((id) => {
    const lane = getTrapLaneDrillDown(id);
    return lane && trapLaneHasPhase9Bridge(lane);
  }).length;

  const sosIds = getAllSosDebateQuestionIds();
  const sosAtBridge = sosIds.filter((id) => {
    const q = getSosDebateQuestionDrillDown(id);
    return q && sosQuestionHasPhase9Bridge(q);
  }).length;

  let khWave4 = 0;
  for (const id of PHASE9_PROMOTED_KH_MODULE_IDS) {
    const mod = KIM_HAMMER_V4_MODULES[id];
    if (mod && mod.render.type !== "staff-stub") khWave4++;
  }

  const runbookSteps = buildDebateCoachingOperatorSummary().stepCount;

  const dossierScore = phase8.dossierResearchPct >= 95 ? 100 : phase8.dossierResearchPct;
  const prepScore = prepAtBridge >= MIN_PREP_AT_BRIDGE ? 100 : Math.round((prepAtBridge / MIN_PREP_AT_BRIDGE) * 100);
  const trapScore = trapAtBridge >= MIN_TRAP_AT_BRIDGE ? 100 : Math.round((trapAtBridge / MIN_TRAP_AT_BRIDGE) * 100);
  const sosScore = sosAtBridge >= MIN_SOS_AT_BRIDGE ? 100 : Math.round((sosAtBridge / MIN_SOS_AT_BRIDGE) * 100);
  const runbookScore = runbookSteps >= MIN_RUNBOOK_STEPS ? 100 : Math.round((runbookSteps / MIN_RUNBOOK_STEPS) * 100);
  const khScore = khWave4 >= MIN_KH_WAVE4 ? 100 : Math.round((khWave4 / MIN_KH_WAVE4) * 100);

  const overallPct = Math.min(
    100,
    Math.round((dossierScore + prepScore + trapScore + sosScore + runbookScore + khScore) / 6),
  );

  return {
    dossierDepthPct: phase8.dossierResearchPct,
    prepSectionsAtBridge: prepAtBridge,
    prepSectionTotal: prepIds.length,
    trapLanesAtBridge: trapAtBridge,
    trapLaneTotal: trapIds.length,
    sosQuestionsAtBridge: sosAtBridge,
    sosQuestionTotal: sosIds.length,
    coachingRunbookSteps: runbookSteps,
    khWave4Promoted: khWave4,
    expansionSectionCoverage: PHASE9_PREP_SECTION_IDS.length,
    overallPct,
  };
}

export function listPhase9OrchestrationGaps(): Phase9OrchestrationGap[] {
  const p = computePhase9DebateInstructionProgress();

  return [
    {
      id: "dossier-depth-expansion",
      label: "2× dossier + ACCA depth expansion",
      status: p.dossierDepthPct >= 95 ? "closed" : "partial",
      href: "/admin/intelligence/candidate-dossiers",
      note:
        p.dossierDepthPct >= 95
          ? "Kelly/Hammer/Pakko sections at ≥14 narrative paragraphs + ≥8 sourced facts."
          : `Dossier research ${p.dossierDepthPct}% — finish expansion overlays before panel.`,
    },
    {
      id: "prep-dossier-bridge",
      label: "Prep section ↔ dossier cross-links",
      status:
        p.prepSectionsAtBridge >= MIN_PREP_AT_BRIDGE
          ? "closed"
          : p.prepSectionsAtBridge >= 20
            ? "partial"
            : "open",
      href: "/admin/intelligence/kim-hammer/debate-prep",
      note: `${p.prepSectionsAtBridge}/${p.prepSectionTotal} prep sections wired with Phase 9 dossier bridge.`,
    },
    {
      id: "trap-clerk-bridge",
      label: "Trap lane clerk-room scripts",
      status: p.trapLanesAtBridge >= MIN_TRAP_AT_BRIDGE ? "closed" : "partial",
      href: "/admin/intelligence/trap-lanes",
      note: `${p.trapLanesAtBridge}/${p.trapLaneTotal} trap lanes with ACCA-safe clerk-room pivots.`,
    },
    {
      id: "sos-dossier-hooks",
      label: "SOS question dossier briefing hooks",
      status: p.sosQuestionsAtBridge >= MIN_SOS_AT_BRIDGE ? "closed" : "partial",
      href: "/admin/intelligence/sos-debate-questions",
      note: `${p.sosQuestionsAtBridge}/${p.sosQuestionTotal} SOS questions carry category dossier hooks.`,
    },
    {
      id: "coaching-runbook",
      label: "Debate coaching operator runbook",
      status: p.coachingRunbookSteps >= MIN_RUNBOOK_STEPS ? "closed" : "open",
      href: PHASE9_UPGRADE_HUB_HREF,
      note: `${p.coachingRunbookSteps} operator steps from T-14 through post-event Field Book promotion.`,
    },
    {
      id: "phase9-hub-orchestration",
      label: "Phase 9 hub + canon + nav batch",
      status: "closed",
      href: PHASE9_UPGRADE_HUB_HREF,
      note: "phase-9-upgrade hub, Field Book debate-instruction-bridge, canon binding, nav release batch.",
    },
    {
      id: "debate-spine-integration",
      label: "Live debate command ↔ research corpus",
      status: "partial",
      href: "/admin/intelligence/debate-command",
      note: "Phase 10 opportunity: feed research-bar status into debate command cheat sheet readiness.",
    },
    {
      id: "psychology-manual-refresh",
      label: "Psychology manual ↔ dossier research refresh",
      status: "partial",
      href: "/admin/intelligence/debate-prep/psychology-manual",
      note: "Manual marked complete — content refresh tying dossier pivots to stage-safe psychology still open.",
    },
    {
      id: "kh-wave4",
      label: "KH wave 4 staff automation modules",
      status: p.khWave4Promoted >= MIN_KH_WAVE4 ? "closed" : "open",
      href: "/admin/intelligence/kim-hammer/ai-opposition-copilot",
      note: `${p.khWave4Promoted}/${MIN_KH_WAVE4} final staff-stub modules promoted (ai-suggestion-sandbox, ai-opposition-copilot).`,
    },
  ];
}

export type Phase9UpgradePassReport = {
  passId: "phase-9-debate-instruction-bridge";
  title: "Step 9 — Phase 9: Dossier depth + debate instruction bridge";
  summary: string;
  completionPct: number;
  hubHref: string;
  coachingHubHref: string;
  progress: Phase9DebateInstructionProgress;
  gaps: Phase9OrchestrationGap[];
};

export function computePhase9UpgradePass(): Phase9UpgradePassReport {
  const progress = computePhase9DebateInstructionProgress();
  const gaps = listPhase9OrchestrationGaps();

  return {
    passId: "phase-9-debate-instruction-bridge",
    title: "Step 9 — Phase 9: Dossier depth + debate instruction bridge",
    summary:
      "Second-wave dossier depth expansion wired into prep sections, trap lanes, and SOS questions — plus eight-step debate coaching runbook and final KH staff-module promotions.",
    completionPct: progress.overallPct,
    hubHref: PHASE9_UPGRADE_HUB_HREF,
    coachingHubHref: DEBATE_COACHING_HUB_HREF,
    progress,
    gaps,
  };
}

export function assertPhase9DebateInstructionBar(): { ok: boolean; message: string } {
  const p = computePhase9DebateInstructionProgress();

  if (p.dossierDepthPct < 95) {
    return { ok: false, message: `Dossier depth ${p.dossierDepthPct}% (need 95%+)` };
  }
  if (p.prepSectionsAtBridge < MIN_PREP_AT_BRIDGE) {
    return {
      ok: false,
      message: `Prep bridge ${p.prepSectionsAtBridge}/${MIN_PREP_AT_BRIDGE}`,
    };
  }
  if (p.trapLanesAtBridge < MIN_TRAP_AT_BRIDGE) {
    return { ok: false, message: `Trap bridge ${p.trapLanesAtBridge}/${MIN_TRAP_AT_BRIDGE}` };
  }
  if (p.sosQuestionsAtBridge < MIN_SOS_AT_BRIDGE) {
    return { ok: false, message: `SOS bridge ${p.sosQuestionsAtBridge}/${MIN_SOS_AT_BRIDGE}` };
  }
  if (p.coachingRunbookSteps < MIN_RUNBOOK_STEPS) {
    return { ok: false, message: `Coaching runbook ${p.coachingRunbookSteps}/${MIN_RUNBOOK_STEPS} steps` };
  }
  if (p.khWave4Promoted < MIN_KH_WAVE4) {
    return { ok: false, message: `KH wave 4 ${p.khWave4Promoted}/${MIN_KH_WAVE4}` };
  }

  return { ok: true, message: `Phase 9 debate instruction bridge ${p.overallPct}% at bar` };
}
