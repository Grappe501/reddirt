/**
 * Phase 16 P9 — SRE stack closure (P0–P8 aggregation).
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
import { computePhase16P0UpgradePass } from "@/lib/intelligence/v4/phase16P0Closure";
import { computePhase16P1UpgradePass } from "@/lib/intelligence/v4/phase16P1Closure";
import { computePhase16P2UpgradePass } from "@/lib/intelligence/v4/phase16P2Closure";
import { assertPhase16P3Bar, computePhase16P3UpgradePass } from "@/lib/intelligence/v4/phase16P3Closure";
import { computePhase16P4UpgradePass } from "@/lib/intelligence/v4/phase16P4Closure";
import { computePhase16P5UpgradePass, isIpadDrillPlayerShellWired } from "@/lib/intelligence/v4/phase16P5Closure";
import { computePhase16P6UpgradePass } from "@/lib/intelligence/v4/phase16P6Closure";
import { computePhase16P7UpgradePass, isRehearsalCoachRouteGuardWired } from "@/lib/intelligence/v4/phase16P7Closure";
import { computePhase16P8UpgradePass } from "@/lib/intelligence/v4/phase16P8Closure";
import {
  countPhase16SreCheckpointsAtBar,
  getPhase16SreCheckpointOverlay,
  PHASE16_P9_CHECKPOINT_TOTAL,
  PHASE16_P9_STACK_BAR_PCT,
  PHASE16_SRE_CHECKPOINT_IDS,
  phase16SreCheckpointMeetsPhase16P9Bar,
  SRE_CLOSURE_HUB_HREF,
  type Phase16SreCheckpointId,
} from "@/lib/intelligence/v4/phase16P9SreClosureDepth";
import type { Phase16SreClosureStateFile } from "@/lib/intelligence/v4/phase16P9SreClosureState";
import { getFieldBookArticle } from "@/lib/intelligence/fieldBookRegistry";
import { resolveCanonBinding } from "@/lib/intelligence/fieldBookCanonRegistry";
import { listStrategyMigrationRoutes } from "@/lib/intelligence/v4/strategyMigrationBridge";

const MIN_PASSES_AT_BAR = 9;
const MIN_STACK_PCT = 90;

const HUB_LAUNCH_PATH = "src/app/admin/(board)/intelligence/IntelligenceHubLaunchPage.tsx";

const CHECKPOINT_PASS_MAP: Record<
  Phase16SreCheckpointId,
  () => { completionPct: number; title: string }
> = {
  "p0-session-launcher": () => computePhase16P0UpgradePass(),
  "p1-run-of-show": () => computePhase16P1UpgradePass(),
  "p2-encounters": () => computePhase16P2UpgradePass(),
  "p3-drill-queue": () => computePhase16P3UpgradePass(),
  "p4-session-debrief": () => computePhase16P4UpgradePass(),
  "p5-ipad-drill-player": () => computePhase16P5UpgradePass(),
  "p6-session-memory": () => computePhase16P6UpgradePass(),
  "p7-staff-coach": () => computePhase16P7UpgradePass(),
  "p8-live-event": () => computePhase16P8UpgradePass(),
};

export type Phase16SreCheckpointSurface = {
  checkpointId: Phase16SreCheckpointId;
  passLabel: string;
  completionPct: number;
  atBar: boolean;
  upgradeHref: string;
  hubHref: string;
  phase16P9Enriched: boolean;
};

export type Phase16P9Progress = {
  passTotal: number;
  passesAtBar: number;
  stackCompletionPct: number;
  checkpointsAtBar: number;
  staffCoachStaffOnly: boolean;
  ipadDrillPlayerWired: boolean;
  drillQueueStageSafe: boolean;
  candidateNavLinkCount: number;
  candidateReadinessPct: number;
  hubInCandidateNav: boolean;
  commandHomeWired: boolean;
  fieldBookReady: boolean;
  canonReady: boolean;
  sreExitReady: boolean;
  strategyMigrationRoutes: number;
  overallPct: number;
};

export function listPhase16SreCheckpointSurfaces(): Phase16SreCheckpointSurface[] {
  return PHASE16_SRE_CHECKPOINT_IDS.map((checkpointId) => {
    const overlay = getPhase16SreCheckpointOverlay(checkpointId);
    const pass = CHECKPOINT_PASS_MAP[checkpointId]();
    return {
      checkpointId,
      passLabel: overlay.passLabel,
      completionPct: pass.completionPct,
      atBar: pass.completionPct >= PHASE16_P9_STACK_BAR_PCT,
      upgradeHref: overlay.upgradeHref,
      hubHref: overlay.hubHref,
      phase16P9Enriched: phase16SreCheckpointMeetsPhase16P9Bar(overlay),
    };
  });
}

export function buildPhase16SreClosureState(): Phase16SreClosureStateFile {
  const checkpoints = listPhase16SreCheckpointSurfaces();
  const passesAtBar = checkpoints.filter((c) => c.atBar).length;
  const stackCompletionPct = Math.round(
    checkpoints.reduce((s, c) => s + c.completionPct, 0) / checkpoints.length,
  );
  const navLinks = countCandidateCommandNavLinks(buildCandidateCommandNavSections("CANDIDATE"));

  return {
    generatedAt: new Date().toISOString(),
    stackCompletionPct,
    passesAtBar,
    passTotal: checkpoints.length,
    staffCoachStaffOnly: isRehearsalCoachRouteGuardWired(),
    ipadDrillPlayerWired: isIpadDrillPlayerShellWired(),
    drillQueueStageSafe: assertPhase16P3Bar().ok,
    candidateNavLinkCount: navLinks,
    checkpoints: checkpoints.map((c) => ({
      checkpointId: c.checkpointId,
      passLabel: c.passLabel,
      completionPct: c.completionPct,
      atBar: c.atBar,
    })),
  };
}

export function computePhase16P9Progress(): Phase16P9Progress {
  const checkpoints = listPhase16SreCheckpointSurfaces();
  const overlayBar = countPhase16SreCheckpointsAtBar();
  const feed = buildCandidateCommandHomeFeed();
  const navLinks = countCandidateCommandNavLinks(buildCandidateCommandNavSections("CANDIDATE"));
  const migrationRoutes = listStrategyMigrationRoutes();

  const passesAtBar = checkpoints.filter((c) => c.atBar).length;
  const stackCompletionPct = Math.round(
    checkpoints.reduce((s, c) => s + c.completionPct, 0) / checkpoints.length,
  );

  const fieldBookReady = Boolean(getFieldBookArticle("sre-closure-command"));
  const canonReady = Boolean(resolveCanonBinding(SRE_CLOSURE_HUB_HREF));
  const candidateHrefs = new Set(
    flattenCandidateCommandNavLinks(buildCandidateCommandNavSections("CANDIDATE")).map((l) => l.href),
  );
  const hubInCandidateNav = candidateHrefs.has(SRE_CLOSURE_HUB_HREF);
  const commandHomeWired = isSreClosureCommandHomeWired();
  const staffCoachStaffOnly = isRehearsalCoachRouteGuardWired();
  const ipadDrillPlayerWired = isIpadDrillPlayerShellWired();
  const drillQueueStageSafe = assertPhase16P3Bar().ok;
  const navWithinCap = navLinks <= PHASE15_P0_MAX_CANDIDATE_LINKS;

  const passScore =
    passesAtBar >= MIN_PASSES_AT_BAR ? 100 : Math.round((passesAtBar / MIN_PASSES_AT_BAR) * 100);
  const stackScore =
    stackCompletionPct >= MIN_STACK_PCT ? 100 : Math.round((stackCompletionPct / MIN_STACK_PCT) * 100);
  const checkpointScore =
    overlayBar.atBar >= PHASE16_P9_CHECKPOINT_TOTAL
      ? 100
      : Math.round((overlayBar.atBar / PHASE16_P9_CHECKPOINT_TOTAL) * 100);
  const sreStackScore =
    staffCoachStaffOnly && ipadDrillPlayerWired && drillQueueStageSafe ? 100 : 85;
  const wireChecks = [
    fieldBookReady,
    canonReady,
    navWithinCap,
    hubInCandidateNav,
    commandHomeWired,
    staffCoachStaffOnly,
    ipadDrillPlayerWired,
    drillQueueStageSafe,
  ];
  const wireScore = Math.round((wireChecks.filter(Boolean).length / wireChecks.length) * 100);

  const overallPct = Math.min(
    100,
    Math.round((passScore + stackScore + checkpointScore + sreStackScore + wireScore) / 5),
  );

  const sreExitReady =
    passesAtBar >= MIN_PASSES_AT_BAR &&
    stackCompletionPct >= MIN_STACK_PCT &&
    staffCoachStaffOnly &&
    ipadDrillPlayerWired &&
    drillQueueStageSafe &&
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
    staffCoachStaffOnly,
    ipadDrillPlayerWired,
    drillQueueStageSafe,
    candidateNavLinkCount: navLinks,
    candidateReadinessPct: feed.readinessPct,
    hubInCandidateNav,
    commandHomeWired,
    fieldBookReady,
    canonReady,
    sreExitReady,
    strategyMigrationRoutes: migrationRoutes.length,
    overallPct,
  };
}

export type Phase16P9UpgradePassReport = {
  passId: "phase-16-p9-sre-closure";
  title: "Step 16 P9 — SRE stack closure";
  summary: string;
  completionPct: number;
  hubHref: string;
  progress: Phase16P9Progress;
};

export function computePhase16P9UpgradePass(): Phase16P9UpgradePassReport {
  const progress = computePhase16P9Progress();
  return {
    passId: "phase-16-p9-sre-closure",
    title: "Step 16 P9 — SRE stack closure",
    summary:
      "Master closure pass aggregating P0–P8 Stage Rehearsal Engine sub-passes — nine checkpoints, staff coach guard, iPad drill player, drill queue stage-safe, and candidate nav cap.",
    completionPct: progress.overallPct,
    hubHref: SRE_CLOSURE_HUB_HREF,
    progress,
  };
}

export function assertPhase16P9Bar(): { ok: boolean; message: string } {
  const p = computePhase16P9Progress();
  const issues: string[] = [];
  if (p.passesAtBar < MIN_PASSES_AT_BAR) issues.push(`passes ${p.passesAtBar}/${MIN_PASSES_AT_BAR}`);
  if (p.stackCompletionPct < MIN_STACK_PCT) issues.push(`stack ${p.stackCompletionPct}%/${MIN_STACK_PCT}%`);
  if (p.checkpointsAtBar < PHASE16_P9_CHECKPOINT_TOTAL) {
    issues.push(`checkpoints ${p.checkpointsAtBar}/${PHASE16_P9_CHECKPOINT_TOTAL}`);
  }
  if (!p.staffCoachStaffOnly) issues.push("staff coach guard");
  if (!p.ipadDrillPlayerWired) issues.push("ipad shell");
  if (!p.drillQueueStageSafe) issues.push("drill stage-safe");
  if (p.candidateNavLinkCount > PHASE15_P0_MAX_CANDIDATE_LINKS) {
    issues.push(`nav ${p.candidateNavLinkCount}`);
  }
  if (!p.fieldBookReady) issues.push("field book");
  if (!p.canonReady) issues.push("canon");
  if (!p.hubInCandidateNav) issues.push("candidate nav");
  if (!p.commandHomeWired) issues.push("command home");

  for (const checkpointId of PHASE16_SRE_CHECKPOINT_IDS) {
    const overlay = getPhase16SreCheckpointOverlay(checkpointId);
    if (!phase16SreCheckpointMeetsPhase16P9Bar(overlay)) issues.push(`overlay ${checkpointId}`);
  }

  if (issues.length === 0) return { ok: true, message: "Phase 16 P9 bar met — SRE stack closed" };
  return { ok: false, message: issues.slice(0, 6).join("; ") };
}

export type SreClosureSummary = {
  hubHref: string;
  checkpointCount: number;
  passesAtBar: number;
  stackCompletionPct: number;
  tonightReminder: string;
};

export function isSreClosureCommandHomeWired(root = process.cwd()): boolean {
  try {
    const src = fs.readFileSync(path.join(root, HUB_LAUNCH_PATH), "utf8");
    return src.includes("buildSreClosureSummary") && src.includes("sreClosure={sreClosure}");
  } catch {
    return false;
  }
}

export function buildSreClosureSummary(): SreClosureSummary {
  const checkpoints = listPhase16SreCheckpointSurfaces();
  const passesAtBar = checkpoints.filter((c) => c.atBar).length;
  const stackCompletionPct = Math.round(
    checkpoints.reduce((s, c) => s + c.completionPct, 0) / checkpoints.length,
  );
  const sreExitReady =
    passesAtBar >= MIN_PASSES_AT_BAR &&
    stackCompletionPct >= MIN_STACK_PCT &&
    checkpoints.length === MIN_PASSES_AT_BAR;

  return {
    hubHref: SRE_CLOSURE_HUB_HREF,
    checkpointCount: checkpoints.length,
    passesAtBar,
    stackCompletionPct,
    tonightReminder: sreExitReady
      ? "SRE stack closed — nine sub-passes at bar, staff coach guarded, iPad player wired, nav within cap."
      : `${passesAtBar}/${checkpoints.length} SRE passes at bar · stack ${stackCompletionPct}% — finish gaps before stage deploy.`,
  };
}

export {
  SRE_CLOSURE_HUB_HREF,
  PHASE16_P9_CHECKPOINT_TOTAL,
  PHASE16_P9_STACK_BAR_PCT,
  PHASE16_SRE_CHECKPOINT_IDS,
};
