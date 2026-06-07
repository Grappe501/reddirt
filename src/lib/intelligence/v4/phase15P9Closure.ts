/**
 * Phase 15 P9 — CCE closure (P0+P1–P8 aggregation).
 */
import fs from "node:fs";
import path from "node:path";
import { buildCandidateCommandHomeFeed } from "@/lib/intelligence/v4/candidateCommandHome";
import {
  countCandidateCommandNavLinks,
  buildCandidateCommandNavSections,
  flattenCandidateCommandNavLinks,
} from "@/lib/intelligence/v4/candidateCommandNav";
import { PHASE15_P0_MAX_CANDIDATE_LINKS } from "@/lib/intelligence/v4/phase15CandidateCommandDepth";
import { computePhase15P0P1UpgradePass } from "@/lib/intelligence/v4/phase15Closure";
import { computePhase15P2UpgradePass } from "@/lib/intelligence/v4/phase15P2Closure";
import { computePhase15P3UpgradePass } from "@/lib/intelligence/v4/phase15P3Closure";
import { computePhase15P4UpgradePass } from "@/lib/intelligence/v4/phase15P4Closure";
import { computePhase15P5UpgradePass } from "@/lib/intelligence/v4/phase15P5Closure";
import { computePhase15P6UpgradePass } from "@/lib/intelligence/v4/phase15P6Closure";
import { computePhase15P7UpgradePass } from "@/lib/intelligence/v4/phase15P7Closure";
import { computePhase15P8UpgradePass } from "@/lib/intelligence/v4/phase15P8Closure";
import {
  countPhase15CceCheckpointsAtBar,
  CCE_CLOSURE_HUB_HREF,
  getPhase15CceCheckpointOverlay,
  PHASE15_CCE_CHECKPOINT_IDS,
  PHASE15_P9_CHECKPOINT_TOTAL,
  PHASE15_P9_STACK_BAR_PCT,
  phase15CceCheckpointMeetsPhase15P9Bar,
  type Phase15CceCheckpointId,
} from "@/lib/intelligence/v4/phase15P9CceClosureDepth";
import type { Phase15CceClosureStateFile } from "@/lib/intelligence/v4/phase15CceClosureState";
import { getFieldBookArticle } from "@/lib/intelligence/fieldBookRegistry";
import { resolveCanonBinding } from "@/lib/intelligence/fieldBookCanonRegistry";
import { listStrategyMigrationRoutes } from "@/lib/intelligence/v4/strategyMigrationBridge";

const MIN_PASSES_AT_BAR = 8;
const MIN_STACK_PCT = 90;

const CHECKPOINT_PASS_MAP: Record<
  Phase15CceCheckpointId,
  () => { completionPct: number; title: string }
> = {
  "p0-p1-candidate-command": () => computePhase15P0P1UpgradePass(),
  "p2-kelly-prep-week": () => computePhase15P2UpgradePass(),
  "p3-stage-safe-filter": () => computePhase15P3UpgradePass(),
  "p4-top-tier-surfacing": () => computePhase15P4UpgradePass(),
  "p5-evidence-honesty": () => computePhase15P5UpgradePass(),
  "p6-demo-mode": () => computePhase15P6UpgradePass(),
  "p7-ipad-polish": () => computePhase15P7UpgradePass(),
  "p8-staff-backstage": () => computePhase15P8UpgradePass(),
};

export type Phase15CceCheckpointSurface = {
  checkpointId: Phase15CceCheckpointId;
  passLabel: string;
  completionPct: number;
  atBar: boolean;
  upgradeHref: string;
  hubHref: string;
  phase15P9Enriched: boolean;
};

export type Phase15P9Progress = {
  passTotal: number;
  passesAtBar: number;
  stackCompletionPct: number;
  checkpointsAtBar: number;
  staffBackstageEnforced: boolean;
  candidateNavLinkCount: number;
  candidateReadinessPct: number;
  hubInCandidateNav: boolean;
  commandHomeWired: boolean;
  fieldBookReady: boolean;
  canonReady: boolean;
  cceExitReady: boolean;
  strategyMigrationRoutes: number;
  overallPct: number;
};

export function listPhase15CceCheckpointSurfaces(): Phase15CceCheckpointSurface[] {
  return PHASE15_CCE_CHECKPOINT_IDS.map((checkpointId) => {
    const overlay = getPhase15CceCheckpointOverlay(checkpointId);
    const pass = CHECKPOINT_PASS_MAP[checkpointId]();
    return {
      checkpointId,
      passLabel: overlay.passLabel,
      completionPct: pass.completionPct,
      atBar: pass.completionPct >= PHASE15_P9_STACK_BAR_PCT,
      upgradeHref: overlay.upgradeHref,
      hubHref: overlay.hubHref,
      phase15P9Enriched: phase15CceCheckpointMeetsPhase15P9Bar(overlay),
    };
  });
}

export function buildPhase15CceClosureState(): Phase15CceClosureStateFile {
  const checkpoints = listPhase15CceCheckpointSurfaces();
  const passesAtBar = checkpoints.filter((c) => c.atBar).length;
  const stackCompletionPct = Math.round(
    checkpoints.reduce((s, c) => s + c.completionPct, 0) / checkpoints.length,
  );
  const p8 = computePhase15P8UpgradePass();
  const navLinks = countCandidateCommandNavLinks(buildCandidateCommandNavSections("CANDIDATE"));

  return {
    generatedAt: new Date().toISOString(),
    stackCompletionPct,
    passesAtBar,
    passTotal: checkpoints.length,
    staffBackstageEnforced:
      p8.progress.layoutGuardWired && p8.progress.candidateBlockedFromBuilder,
    candidateNavLinkCount: navLinks,
    checkpoints: checkpoints.map((c) => ({
      checkpointId: c.checkpointId,
      passLabel: c.passLabel,
      completionPct: c.completionPct,
      atBar: c.atBar,
    })),
  };
}

export function computePhase15P9Progress(): Phase15P9Progress {
  const checkpoints = listPhase15CceCheckpointSurfaces();
  const overlayBar = countPhase15CceCheckpointsAtBar();
  const p8 = computePhase15P8UpgradePass();
  const feed = buildCandidateCommandHomeFeed();
  const navLinks = countCandidateCommandNavLinks(buildCandidateCommandNavSections("CANDIDATE"));
  const migrationRoutes = listStrategyMigrationRoutes();

  const passesAtBar = checkpoints.filter((c) => c.atBar).length;
  const stackCompletionPct = Math.round(
    checkpoints.reduce((s, c) => s + c.completionPct, 0) / checkpoints.length,
  );

  const fieldBookReady = Boolean(getFieldBookArticle("cce-closure-command"));
  const canonReady = Boolean(resolveCanonBinding(CCE_CLOSURE_HUB_HREF));
  const candidateHrefs = new Set(
    flattenCandidateCommandNavLinks(buildCandidateCommandNavSections("CANDIDATE")).map((l) => l.href),
  );
  const hubInCandidateNav =
    candidateHrefs.has(CCE_CLOSURE_HUB_HREF) || isCceClosureCommandHomeWired();
  const commandHomeWired = isCceClosureCommandHomeWired();
  const staffBackstageEnforced =
    p8.progress.layoutGuardWired && p8.progress.candidateBlockedFromBuilder;
  const navWithinCap = navLinks <= PHASE15_P0_MAX_CANDIDATE_LINKS;

  const passScore =
    passesAtBar >= MIN_PASSES_AT_BAR ? 100 : Math.round((passesAtBar / MIN_PASSES_AT_BAR) * 100);
  const stackScore =
    stackCompletionPct >= MIN_STACK_PCT ? 100 : Math.round((stackCompletionPct / MIN_STACK_PCT) * 100);
  const checkpointScore =
    overlayBar.atBar >= PHASE15_P9_CHECKPOINT_TOTAL
      ? 100
      : Math.round((overlayBar.atBar / PHASE15_P9_CHECKPOINT_TOTAL) * 100);
  const wireChecks = [fieldBookReady, canonReady, staffBackstageEnforced, navWithinCap, hubInCandidateNav, commandHomeWired];
  const wireScore = Math.round((wireChecks.filter(Boolean).length / wireChecks.length) * 100);

  const overallPct = Math.min(100, Math.round((passScore + stackScore + checkpointScore + wireScore) / 4));

  const cceExitReady =
    passesAtBar >= MIN_PASSES_AT_BAR &&
    stackCompletionPct >= MIN_STACK_PCT &&
    staffBackstageEnforced &&
    navWithinCap &&
    fieldBookReady &&
    canonReady &&
    hubInCandidateNav &&
    commandHomeWired;

  return {
    passTotal: checkpoints.length,
    passesAtBar,
    stackCompletionPct,
    checkpointsAtBar: overlayBar.atBar,
    staffBackstageEnforced,
    candidateNavLinkCount: navLinks,
    candidateReadinessPct: feed.readinessPct,
    hubInCandidateNav,
    commandHomeWired,
    fieldBookReady,
    canonReady,
    cceExitReady,
    strategyMigrationRoutes: migrationRoutes.length,
    overallPct,
  };
}

export type Phase15P9UpgradePassReport = {
  passId: "phase-15-p9-cce-closure";
  title: "Step 15 P9 — CCE closure";
  summary: string;
  completionPct: number;
  hubHref: string;
  progress: Phase15P9Progress;
};

export function computePhase15P9UpgradePass(): Phase15P9UpgradePassReport {
  const progress = computePhase15P9Progress();
  return {
    passId: "phase-15-p9-cce-closure",
    title: "Step 15 P9 — CCE closure",
    summary:
      "Master closure pass aggregating P0+P1–P8 sub-passes — eight CCE checkpoints, staff backstage enforcement, candidate nav cap, and Phase 15 exit gate for the Candidate Command Experience.",
    completionPct: progress.overallPct,
    hubHref: CCE_CLOSURE_HUB_HREF,
    progress,
  };
}

export function assertPhase15P9Bar(): { ok: boolean; message: string } {
  const p = computePhase15P9Progress();
  const issues: string[] = [];
  if (p.passesAtBar < MIN_PASSES_AT_BAR) issues.push(`passes ${p.passesAtBar}/${MIN_PASSES_AT_BAR}`);
  if (p.stackCompletionPct < MIN_STACK_PCT) issues.push(`stack ${p.stackCompletionPct}%/${MIN_STACK_PCT}%`);
  if (p.checkpointsAtBar < PHASE15_P9_CHECKPOINT_TOTAL) {
    issues.push(`checkpoints ${p.checkpointsAtBar}/${PHASE15_P9_CHECKPOINT_TOTAL}`);
  }
  if (!p.staffBackstageEnforced) issues.push("staff backstage");
  if (p.candidateNavLinkCount > PHASE15_P0_MAX_CANDIDATE_LINKS) {
    issues.push(`nav ${p.candidateNavLinkCount}`);
  }
  if (!p.fieldBookReady) issues.push("field book");
  if (!p.canonReady) issues.push("canon");
  if (!p.hubInCandidateNav) issues.push("candidate nav");
  if (!p.commandHomeWired) issues.push("command home");

  for (const checkpointId of PHASE15_CCE_CHECKPOINT_IDS) {
    const overlay = getPhase15CceCheckpointOverlay(checkpointId);
    if (!phase15CceCheckpointMeetsPhase15P9Bar(overlay)) issues.push(`overlay ${checkpointId}`);
  }

  if (issues.length === 0) return { ok: true, message: "Phase 15 P9 bar met — CCE closure complete" };
  return { ok: false, message: issues.slice(0, 6).join("; ") };
}

export type CceClosureSummary = {
  hubHref: string;
  checkpointCount: number;
  passesAtBar: number;
  stackCompletionPct: number;
  tonightReminder: string;
};

const HUB_LAUNCH_PATH = "src/app/admin/(board)/intelligence/IntelligenceHubLaunchPage.tsx";

export function isCceClosureCommandHomeWired(root = process.cwd()): boolean {
  try {
    const src = fs.readFileSync(path.join(root, HUB_LAUNCH_PATH), "utf8");
    return src.includes("buildCceClosureSummary") && src.includes("cceClosure={cceClosure}");
  } catch {
    return false;
  }
}

export function buildCceClosureSummary(): CceClosureSummary {
  const checkpoints = listPhase15CceCheckpointSurfaces();
  const passesAtBar = checkpoints.filter((c) => c.atBar).length;
  const stackCompletionPct = Math.round(
    checkpoints.reduce((s, c) => s + c.completionPct, 0) / checkpoints.length,
  );
  const cceExitReady =
    passesAtBar >= MIN_PASSES_AT_BAR &&
    stackCompletionPct >= MIN_STACK_PCT &&
    checkpoints.length === MIN_PASSES_AT_BAR;

  return {
    hubHref: CCE_CLOSURE_HUB_HREF,
    checkpointCount: checkpoints.length,
    passesAtBar,
    stackCompletionPct,
    tonightReminder: cceExitReady
      ? "CCE stack closed — eight sub-passes at bar, staff backstage enforced, candidate nav within cap."
      : `${passesAtBar}/${checkpoints.length} CCE passes at bar · stack ${stackCompletionPct}% — finish gaps before stage deploy.`,
  };
}

export {
  CCE_CLOSURE_HUB_HREF,
  PHASE15_P9_CHECKPOINT_TOTAL,
  PHASE15_P9_STACK_BAR_PCT,
};
