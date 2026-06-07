/**
 * Phase 11 P9 — Stack closure (P0–P8 aggregation).
 */
import { computeDebateCommandPhilosophyReadiness } from "@/lib/intelligence/v4/debateCommandPhilosophyReadiness";
import { computePhase11UpgradePassSync } from "@/lib/intelligence/v4/phase11CampaignSystemClosure";
import { computePhase11P1UpgradePass } from "@/lib/intelligence/v4/phase11KellyStrategicPlanClosure";
import { computePhase11P2UpgradePass } from "@/lib/intelligence/v4/phase11P2Closure";
import { computePhase11P3UpgradePass } from "@/lib/intelligence/v4/phase11P3Closure";
import { computePhase11P4UpgradePass } from "@/lib/intelligence/v4/phase11P4Closure";
import { computePhase11P5UpgradePass } from "@/lib/intelligence/v4/phase11P5Closure";
import { computePhase11P6UpgradePass } from "@/lib/intelligence/v4/phase11P6Closure";
import { computePhase11P7UpgradePass } from "@/lib/intelligence/v4/phase11P7Closure";
import { computePhase11P8UpgradePass } from "@/lib/intelligence/v4/phase11P8Closure";
import {
  countPhase11StackCheckpointsAtBar,
  getPhase11StackCheckpointOverlay,
  PHASE_11_STACK_CLOSURE_HUB_HREF,
  PHASE11_P9_CHECKPOINT_TOTAL,
  PHASE11_P9_STACK_BAR_PCT,
  PHASE_11_STACK_CHECKPOINT_IDS,
  phase11StackCheckpointMeetsPhase11P9Bar,
  type Phase11StackCheckpointId,
} from "@/lib/intelligence/v4/phase11P9StackClosureDepth";
import type { Phase11StackClosureStateFile } from "@/lib/intelligence/v4/phase11StackClosureState";
import { getFieldBookArticle } from "@/lib/intelligence/fieldBookRegistry";
import { resolveCanonBinding } from "@/lib/intelligence/fieldBookCanonRegistry";
import { listStrategyMigrationRoutes } from "@/lib/intelligence/v4/strategyMigrationBridge";

const MIN_PASSES_AT_BAR = 9;
const MIN_STACK_PCT = 90;

const CHECKPOINT_PASS_MAP: Record<
  Phase11StackCheckpointId,
  () => { completionPct: number; title: string }
> = {
  "p0-campaign-system": () => computePhase11UpgradePassSync(),
  "p1-kelly-strategic-plan": () => computePhase11P1UpgradePass(),
  "p2-movement-staff-strategy": () => computePhase11P2UpgradePass(),
  "p3-strategy-doctrine": () => computePhase11P3UpgradePass(),
  "p4-philosophy-claims": () => computePhase11P4UpgradePass(),
  "p5-chunk-promotion": () => computePhase11P5UpgradePass(),
  "p6-alignment-preview": () => computePhase11P6UpgradePass(),
  "p7-briefing-attach": () => computePhase11P7UpgradePass(),
  "p8-promotion-execution": () => computePhase11P8UpgradePass(),
};

export type Phase11StackCheckpointSurface = {
  checkpointId: Phase11StackCheckpointId;
  passLabel: string;
  completionPct: number;
  atBar: boolean;
  upgradeHref: string;
  hubHref: string;
  phase11P9Enriched: boolean;
};

export type Phase11P9Progress = {
  passTotal: number;
  passesAtBar: number;
  stackCompletionPct: number;
  checkpointsAtBar: number;
  promotionPipelineReady: boolean;
  debatePhilosophyScore: number;
  fieldBookReady: boolean;
  canonReady: boolean;
  stackExitReady: boolean;
  strategyMigrationRoutes: number;
  overallPct: number;
};

export function listPhase11StackCheckpointSurfaces(): Phase11StackCheckpointSurface[] {
  return PHASE_11_STACK_CHECKPOINT_IDS.map((checkpointId) => {
    const overlay = getPhase11StackCheckpointOverlay(checkpointId);
    const pass = CHECKPOINT_PASS_MAP[checkpointId]();
    return {
      checkpointId,
      passLabel: overlay.passLabel,
      completionPct: pass.completionPct,
      atBar: pass.completionPct >= PHASE11_P9_STACK_BAR_PCT,
      upgradeHref: overlay.upgradeHref,
      hubHref: overlay.hubHref,
      phase11P9Enriched: phase11StackCheckpointMeetsPhase11P9Bar(overlay),
    };
  });
}

export function buildPhase11StackClosureState(): Phase11StackClosureStateFile {
  const checkpoints = listPhase11StackCheckpointSurfaces();
  const passesAtBar = checkpoints.filter((c) => c.atBar).length;
  const stackCompletionPct = Math.round(
    checkpoints.reduce((s, c) => s + c.completionPct, 0) / checkpoints.length,
  );
  const p8 = computePhase11P8UpgradePass();

  return {
    generatedAt: new Date().toISOString(),
    stackCompletionPct,
    passesAtBar,
    passTotal: checkpoints.length,
    promotionPipelineReady: p8.progress.promotionPipelineReady,
    checkpoints: checkpoints.map((c) => ({
      checkpointId: c.checkpointId,
      passLabel: c.passLabel,
      completionPct: c.completionPct,
      atBar: c.atBar,
    })),
  };
}

export function computePhase11P9Progress(): Phase11P9Progress {
  const checkpoints = listPhase11StackCheckpointSurfaces();
  const overlayBar = countPhase11StackCheckpointsAtBar();
  const p8 = computePhase11P8UpgradePass();
  const debate = computeDebateCommandPhilosophyReadiness();
  const migrationRoutes = listStrategyMigrationRoutes();

  const passesAtBar = checkpoints.filter((c) => c.atBar).length;
  const stackCompletionPct = Math.round(
    checkpoints.reduce((s, c) => s + c.completionPct, 0) / checkpoints.length,
  );

  const fieldBookReady = Boolean(getFieldBookArticle("phase-11-stack-closure-command"));
  const canonReady = Boolean(resolveCanonBinding(PHASE_11_STACK_CLOSURE_HUB_HREF));

  const passScore =
    passesAtBar >= MIN_PASSES_AT_BAR ? 100 : Math.round((passesAtBar / MIN_PASSES_AT_BAR) * 100);
  const stackScore =
    stackCompletionPct >= MIN_STACK_PCT ? 100 : Math.round((stackCompletionPct / MIN_STACK_PCT) * 100);
  const checkpointScore =
    overlayBar.atBar >= PHASE11_P9_CHECKPOINT_TOTAL
      ? 100
      : Math.round((overlayBar.atBar / PHASE11_P9_CHECKPOINT_TOTAL) * 100);
  const wireChecks = [fieldBookReady, canonReady, p8.progress.promotionPipelineReady];
  const wireScore = Math.round((wireChecks.filter(Boolean).length / wireChecks.length) * 100);

  const overallPct = Math.min(100, Math.round((passScore + stackScore + checkpointScore + wireScore) / 4));

  const stackExitReady =
    passesAtBar >= MIN_PASSES_AT_BAR &&
    stackCompletionPct >= MIN_STACK_PCT &&
    p8.progress.promotionPipelineReady &&
    fieldBookReady &&
    canonReady;

  return {
    passTotal: checkpoints.length,
    passesAtBar,
    stackCompletionPct,
    checkpointsAtBar: overlayBar.atBar,
    promotionPipelineReady: p8.progress.promotionPipelineReady,
    debatePhilosophyScore: debate.overallScore,
    fieldBookReady,
    canonReady,
    stackExitReady,
    strategyMigrationRoutes: migrationRoutes.length,
    overallPct,
  };
}

export type Phase11P9UpgradePassReport = {
  passId: "phase-11-p9-stack-closure";
  title: "Step 11 P9 — Phase 11 stack closure";
  summary: string;
  completionPct: number;
  hubHref: string;
  progress: Phase11P9Progress;
};

export function computePhase11P9UpgradePass(): Phase11P9UpgradePassReport {
  const progress = computePhase11P9Progress();
  return {
    passId: "phase-11-p9-stack-closure",
    title: "Step 11 P9 — Phase 11 stack closure",
    summary:
      "Master closure pass aggregating P0–P8 sub-passes — nine stack checkpoints, promotion pipeline readiness, debate philosophy feed score, and Phase 11 exit gate for strategy-manual → Field Book canon workflow.",
    completionPct: progress.overallPct,
    hubHref: PHASE_11_STACK_CLOSURE_HUB_HREF,
    progress,
  };
}

export function assertPhase11P9Bar(): { ok: boolean; message: string } {
  const p = computePhase11P9Progress();
  const issues: string[] = [];
  if (p.passesAtBar < MIN_PASSES_AT_BAR) issues.push(`passes ${p.passesAtBar}/${MIN_PASSES_AT_BAR}`);
  if (p.stackCompletionPct < MIN_STACK_PCT) issues.push(`stack ${p.stackCompletionPct}%/${MIN_STACK_PCT}%`);
  if (p.checkpointsAtBar < PHASE11_P9_CHECKPOINT_TOTAL) {
    issues.push(`checkpoints ${p.checkpointsAtBar}/${PHASE11_P9_CHECKPOINT_TOTAL}`);
  }
  if (!p.promotionPipelineReady) issues.push("promotion pipeline");
  if (!p.fieldBookReady) issues.push("field book");
  if (!p.canonReady) issues.push("canon");
  if (issues.length === 0) return { ok: true, message: "Phase 11 P9 bar met" };
  return { ok: false, message: issues.join("; ") };
}

export {
  PHASE_11_STACK_CLOSURE_HUB_HREF,
  PHASE11_P9_CHECKPOINT_TOTAL,
  PHASE11_P9_STACK_BAR_PCT,
};
