/**
 * Phase 16 P5 — iPad drill player closure.
 */
import fs from "node:fs";
import path from "node:path";
import { buildCandidateCommandHomeFeed } from "@/lib/intelligence/v4/candidateCommandHome";
import { flattenCandidateCommandNavLinks, buildCandidateCommandNavSections } from "@/lib/intelligence/v4/candidateCommandNav";
import {
  buildIpadDrillPlayerSummary,
  IPAD_DRILL_PLAYER_CONTROL_IDS,
  IPAD_DRILL_PLAYER_HREF,
  PHASE16_P5_PLAYER_CONTROL_TOTAL,
} from "@/lib/intelligence/v4/phase16P5IpadDrillPlayer";
import {
  countIpadDrillPlayerControlsAtBar,
  getIpadDrillPlayerControlOverlay,
  ipadDrillPlayerControlMeetsPhase16P5Bar,
} from "@/lib/intelligence/v4/phase16P5IpadDrillPlayerDepth";
import { getFieldBookArticle } from "@/lib/intelligence/fieldBookRegistry";
import { resolveCanonBinding } from "@/lib/intelligence/fieldBookCanonRegistry";
import { listStrategyMigrationRoutes } from "@/lib/intelligence/v4/strategyMigrationBridge";

export type Phase16P5Progress = {
  controlTotal: number;
  controlsAtBar: number;
  shellDrillNavWired: boolean;
  hubInCandidateNav: boolean;
  commandHomeWired: boolean;
  fieldBookReady: boolean;
  canonReady: boolean;
  migrationRouteBound: boolean;
  overallPct: number;
};

export function isIpadDrillPlayerShellWired(root = process.cwd()): boolean {
  const shellPath = path.join(root, "src/components/admin/intelligence/CandidateIpadIntelligenceShell.tsx");
  if (!fs.existsSync(shellPath)) return false;
  const src = fs.readFileSync(shellPath, "utf8");
  return (
    src.includes("CandidateIpadDrillPlayerBottomNavBridge") &&
    src.includes("isIpadDrillPlayerRoute") &&
    src.includes("data-phase16-p5")
  );
}

export function computePhase16P5Progress(): Phase16P5Progress {
  const controlBar = countIpadDrillPlayerControlsAtBar();
  const feed = buildCandidateCommandHomeFeed();

  const candidateHrefs = new Set(
    flattenCandidateCommandNavLinks(buildCandidateCommandNavSections("CANDIDATE")).map((l) => l.href),
  );

  const hubInCandidateNav = candidateHrefs.has(IPAD_DRILL_PLAYER_HREF);
  const commandHomeWired = Boolean(feed.ipadDrillPlayer?.tonightReminder);
  const fieldBookReady = Boolean(getFieldBookArticle("ipad-drill-player-command"));
  const canonReady = Boolean(resolveCanonBinding(IPAD_DRILL_PLAYER_HREF));
  const migrationRouteBound = listStrategyMigrationRoutes().some(
    (r) => r.intelligenceHref === IPAD_DRILL_PLAYER_HREF,
  );
  const shellDrillNavWired = isIpadDrillPlayerShellWired();

  const controlScore =
    controlBar.atBar >= PHASE16_P5_PLAYER_CONTROL_TOTAL
      ? 100
      : Math.round((controlBar.atBar / PHASE16_P5_PLAYER_CONTROL_TOTAL) * 100);
  const shellScore = shellDrillNavWired ? 100 : 70;
  const wireChecks = [hubInCandidateNav, commandHomeWired, fieldBookReady, canonReady, migrationRouteBound];
  const wireScore = Math.round((wireChecks.filter(Boolean).length / wireChecks.length) * 100);

  const overallPct = Math.min(100, Math.round((controlScore + shellScore + wireScore) / 3));

  return {
    controlTotal: controlBar.total,
    controlsAtBar: controlBar.atBar,
    shellDrillNavWired,
    hubInCandidateNav,
    commandHomeWired,
    fieldBookReady,
    canonReady,
    migrationRouteBound,
    overallPct,
  };
}

export type Phase16P5UpgradePassReport = {
  passId: "phase-16-p5-ipad-drill-player";
  title: "Step 16 P5 — iPad drill player";
  summary: string;
  completionPct: number;
  hubHref: string;
  progress: Phase16P5Progress;
};

export function computePhase16P5UpgradePass(): Phase16P5UpgradePassReport {
  const progress = computePhase16P5Progress();
  return {
    passId: "phase-16-p5-ipad-drill-player",
    title: "Step 16 P5 — iPad drill player",
    summary:
      "Full-screen drill stepper in candidate iPad shell — Exit · Prev · Next · Timer bottom nav with 48px touch targets and 820px column.",
    completionPct: progress.overallPct,
    hubHref: IPAD_DRILL_PLAYER_HREF,
    progress,
  };
}

export function assertPhase16P5Bar(): { ok: boolean; message: string } {
  const p = computePhase16P5Progress();
  const issues: string[] = [];
  if (p.controlsAtBar < PHASE16_P5_PLAYER_CONTROL_TOTAL) {
    issues.push(`controls ${p.controlsAtBar}/${PHASE16_P5_PLAYER_CONTROL_TOTAL}`);
  }
  if (!p.shellDrillNavWired) issues.push("ipad shell nav");
  if (!p.hubInCandidateNav) issues.push("candidate nav");
  if (!p.commandHomeWired) issues.push("command home");
  if (!p.fieldBookReady) issues.push("field book");
  if (!p.canonReady) issues.push("canon");
  if (!p.migrationRouteBound) issues.push("migration");

  for (const controlId of IPAD_DRILL_PLAYER_CONTROL_IDS) {
    const o = getIpadDrillPlayerControlOverlay(controlId);
    if (!o || !ipadDrillPlayerControlMeetsPhase16P5Bar(o)) issues.push(`overlay ${controlId}`);
  }

  if (issues.length === 0) return { ok: true, message: "Phase 16 P5 bar met" };
  return { ok: false, message: issues.slice(0, 6).join("; ") };
}

export { IPAD_DRILL_PLAYER_HREF };
