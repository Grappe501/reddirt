/**
 * Phase 16 P4 — Session debrief closure.
 */
import fs from "node:fs";
import path from "node:path";
import { buildCandidateCommandHomeFeed } from "@/lib/intelligence/v4/candidateCommandHome";
import { flattenCandidateCommandNavLinks, buildCandidateCommandNavSections } from "@/lib/intelligence/v4/candidateCommandNav";
import {
  buildSessionDebriefSummary,
  PHASE16_P4_PRE_CHECKLIST_TOTAL,
  PRE_STAGE_CHECKLIST_IDS,
  SESSION_DEBRIEF_HUB_HREF,
} from "@/lib/intelligence/v4/phase16P4SessionDebrief";
import {
  countPreStageChecklistAtBar,
  getPreStageChecklistOverlay,
  preStageChecklistMeetsPhase16P4Bar,
} from "@/lib/intelligence/v4/phase16P4SessionDebriefDepth";
import { sessionDebriefStatePath } from "@/lib/intelligence/v4/phase16P4SessionDebriefState";
import { getFieldBookArticle } from "@/lib/intelligence/fieldBookRegistry";
import { resolveCanonBinding } from "@/lib/intelligence/fieldBookCanonRegistry";
import { listStrategyMigrationRoutes } from "@/lib/intelligence/v4/strategyMigrationBridge";

export type Phase16P4Progress = {
  checklistTotal: number;
  checklistAtBar: number;
  hubInCandidateNav: boolean;
  commandHomeWired: boolean;
  fieldBookReady: boolean;
  canonReady: boolean;
  migrationRouteBound: boolean;
  captureApiWired: boolean;
  overallPct: number;
};

export function isSessionDebriefCaptureApiWired(root = process.cwd()): boolean {
  const route = path.join(root, "src/app/api/admin/intelligence/session-debrief/route.ts");
  return fs.existsSync(route);
}

export function computePhase16P4Progress(): Phase16P4Progress {
  const checklistBar = countPreStageChecklistAtBar();
  const feed = buildCandidateCommandHomeFeed();

  const candidateHrefs = new Set(
    flattenCandidateCommandNavLinks(buildCandidateCommandNavSections("CANDIDATE")).map((l) => l.href),
  );

  const hubInCandidateNav = candidateHrefs.has(SESSION_DEBRIEF_HUB_HREF);
  const commandHomeWired = Boolean(feed.sessionDebrief?.tonightReminder);
  const fieldBookReady = Boolean(getFieldBookArticle("session-debrief-command"));
  const canonReady = Boolean(resolveCanonBinding(SESSION_DEBRIEF_HUB_HREF));
  const migrationRouteBound = listStrategyMigrationRoutes().some(
    (r) => r.intelligenceHref === SESSION_DEBRIEF_HUB_HREF,
  );
  const captureApiWired = isSessionDebriefCaptureApiWired();

  const checklistScore =
    checklistBar.atBar >= PHASE16_P4_PRE_CHECKLIST_TOTAL
      ? 100
      : Math.round((checklistBar.atBar / PHASE16_P4_PRE_CHECKLIST_TOTAL) * 100);
  const stateScore = fs.existsSync(sessionDebriefStatePath()) || captureApiWired ? 100 : 85;
  const wireChecks = [hubInCandidateNav, commandHomeWired, fieldBookReady, canonReady, migrationRouteBound, captureApiWired];
  const wireScore = Math.round((wireChecks.filter(Boolean).length / wireChecks.length) * 100);

  const overallPct = Math.min(100, Math.round((checklistScore + stateScore + wireScore) / 3));

  return {
    checklistTotal: checklistBar.total,
    checklistAtBar: checklistBar.atBar,
    hubInCandidateNav,
    commandHomeWired,
    fieldBookReady,
    canonReady,
    migrationRouteBound,
    captureApiWired,
    overallPct,
  };
}

export type Phase16P4UpgradePassReport = {
  passId: "phase-16-p4-session-debrief";
  title: "Step 16 P4 — Session debrief";
  summary: string;
  completionPct: number;
  hubHref: string;
  progress: Phase16P4Progress;
};

export function computePhase16P4UpgradePass(): Phase16P4UpgradePassReport {
  const progress = computePhase16P4Progress();
  return {
    passId: "phase-16-p4-session-debrief",
    title: "Step 16 P4 — Session debrief",
    summary:
      "Pre-stage five-item checklist and post-session capture — felt-risky lines and staff follow-ups persisted for human action queue review.",
    completionPct: progress.overallPct,
    hubHref: SESSION_DEBRIEF_HUB_HREF,
    progress,
  };
}

export function assertPhase16P4Bar(): { ok: boolean; message: string } {
  const p = computePhase16P4Progress();
  const issues: string[] = [];
  if (p.checklistAtBar < PHASE16_P4_PRE_CHECKLIST_TOTAL) {
    issues.push(`checklist ${p.checklistAtBar}/${PHASE16_P4_PRE_CHECKLIST_TOTAL}`);
  }
  if (!p.hubInCandidateNav) issues.push("candidate nav");
  if (!p.commandHomeWired) issues.push("command home");
  if (!p.fieldBookReady) issues.push("field book");
  if (!p.canonReady) issues.push("canon");
  if (!p.migrationRouteBound) issues.push("migration");
  if (!p.captureApiWired) issues.push("capture api");

  for (const itemId of PRE_STAGE_CHECKLIST_IDS) {
    const o = getPreStageChecklistOverlay(itemId);
    if (!o || !preStageChecklistMeetsPhase16P4Bar(o)) issues.push(`overlay ${itemId}`);
  }

  if (issues.length === 0) return { ok: true, message: "Phase 16 P4 bar met" };
  return { ok: false, message: issues.slice(0, 6).join("; ") };
}

export { SESSION_DEBRIEF_HUB_HREF };
