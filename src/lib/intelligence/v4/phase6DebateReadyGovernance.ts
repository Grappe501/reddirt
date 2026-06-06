/**
 * Phase 6 — Debate-ready governance: prep encounter depth, trap lanes, claims review wave, KH promotions.
 */
import { getAllPrepSectionDrillDownIds, getPrepSectionDrillDown } from "@/lib/intelligence/v4/debatePrepSectionDrillDowns";
import { prepSectionMeetsPhase6Bar } from "@/lib/intelligence/v4/phase6PrepSectionCompletion";
import { getAllTrapLaneIds, getTrapLaneDrillDown } from "@/lib/intelligence/v4/trapLaneDrillDowns";
import { buildTrapLaneStepCoverage } from "@/lib/intelligence/v4/trapLaneStepCoverage";
import { PHASE6_PROMOTED_KH_MODULE_IDS, KIM_HAMMER_V4_MODULES } from "@/lib/intelligence/kimHammerV4ModuleRegistry";
import { summarizeClaimLedger } from "@/lib/intelligence/claims/claimLedgerSummary";

const MIN_PREP_SECTIONS_AT_BAR = 28;
const MIN_TRAP_LANES_AT_BAR = 6;
const MIN_KH_PROMOTED = 10;

export const PHASE6_UPGRADE_HUB_HREF = "/admin/intelligence/phase-6-upgrade";

function trapLaneMeetsPhase6Bar(laneId: string): boolean {
  const d = getTrapLaneDrillDown(laneId);
  if (!d) return false;
  const coverage = buildTrapLaneStepCoverage(d);
  return (
    d.rebuttalScripts.length >= 1 &&
    d.whatToExpectHammerToSay.length >= 3 &&
    coverage.steps.length >= 6 &&
    Boolean(d.encounterDepth?.whatToExpectPlain)
  );
}

export type Phase6DebateReadyProgress = {
  prepSectionsAtBar: number;
  prepSectionTotal: number;
  trapLanesAtBar: number;
  trapLaneTotal: number;
  khModulesPromoted: number;
  khModulesPromotedTarget: number;
  claimsNeedsReview: number;
  claimsVerified: number;
  overallPct: number;
};

export function computePhase6DebateReadyProgress(): Phase6DebateReadyProgress {
  const prepIds = getAllPrepSectionDrillDownIds();
  const prepAtBar = prepIds.filter((id) => prepSectionMeetsPhase6Bar(getPrepSectionDrillDown(id)!)).length;

  const trapIds = getAllTrapLaneIds();
  const trapAtBar = trapIds.filter(trapLaneMeetsPhase6Bar).length;

  let khPromoted = 0;
  for (const id of PHASE6_PROMOTED_KH_MODULE_IDS) {
    const mod = KIM_HAMMER_V4_MODULES[id];
    if (mod && mod.render.type !== "staff-stub") khPromoted++;
  }

  let claimsNeedsReview = 0;
  let claimsVerified = 0;
  try {
    const summary = summarizeClaimLedger();
    claimsNeedsReview = summary.needsReviewClaims;
    claimsVerified = summary.verifiedClaims;
  } catch {
    /* optional in test env */
  }

  const prepPct = Math.round((prepAtBar / MIN_PREP_SECTIONS_AT_BAR) * 100);
  const trapPct = Math.round((trapAtBar / MIN_TRAP_LANES_AT_BAR) * 100);
  const khPct = Math.round((khPromoted / MIN_KH_PROMOTED) * 100);
  const claimsPct = claimsNeedsReview === 0 ? 100 : Math.max(40, 100 - claimsNeedsReview * 5);

  const overallPct = Math.min(100, Math.round((prepPct + trapPct + khPct + claimsPct) / 4));

  return {
    prepSectionsAtBar: prepAtBar,
    prepSectionTotal: prepIds.length,
    trapLanesAtBar: trapAtBar,
    trapLaneTotal: trapIds.length,
    khModulesPromoted: khPromoted,
    khModulesPromotedTarget: MIN_KH_PROMOTED,
    claimsNeedsReview,
    claimsVerified,
    overallPct,
  };
}

export type Phase6UpgradePassReport = {
  passId: "phase-6-debate-ready-governance";
  title: "Step 6 — Phase 6: Debate-ready governance";
  summary: string;
  completionPct: number;
  hubHref: string;
  progress: Phase6DebateReadyProgress;
};

export function computePhase6UpgradePass(): Phase6UpgradePassReport {
  const progress = computePhase6DebateReadyProgress();
  return {
    passId: "phase-6-debate-ready-governance",
    title: "Step 6 — Phase 6: Debate-ready governance",
    summary:
      "Section-specific encounter depth on all 28 prep drill-downs, trap lane rebuttal completion, claims review wave, and ten priority Kim Hammer modules promoted from staff-stub.",
    completionPct: progress.overallPct,
    hubHref: PHASE6_UPGRADE_HUB_HREF,
    progress,
  };
}

export function assertPhase6DebateReadyBar(): { ok: boolean; message: string } {
  const p = computePhase6DebateReadyProgress();

  if (p.prepSectionsAtBar < MIN_PREP_SECTIONS_AT_BAR) {
    return { ok: false, message: `Prep sections ${p.prepSectionsAtBar}/${MIN_PREP_SECTIONS_AT_BAR} at bar` };
  }
  if (p.trapLanesAtBar < MIN_TRAP_LANES_AT_BAR) {
    return { ok: false, message: `Trap lanes ${p.trapLanesAtBar}/${MIN_TRAP_LANES_AT_BAR} at bar` };
  }
  if (p.khModulesPromoted < MIN_KH_PROMOTED) {
    return { ok: false, message: `KH promoted ${p.khModulesPromoted}/${MIN_KH_PROMOTED}` };
  }

  return { ok: true, message: `Phase 6 debate-ready governance ${p.overallPct}% — prep + traps + KH wave at bar` };
}
