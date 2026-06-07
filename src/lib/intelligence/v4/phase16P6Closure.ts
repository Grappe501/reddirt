/**
 * Phase 16 P6 — Session memory closure.
 */
import fs from "node:fs";
import path from "node:path";
import { buildCandidateCommandHomeFeed } from "@/lib/intelligence/v4/candidateCommandHome";
import { flattenCandidateCommandNavLinks, buildCandidateCommandNavSections } from "@/lib/intelligence/v4/candidateCommandNav";
import {
  ACTIVE_SESSION_FIELD_IDS,
  countActiveSessionFieldsAtBar,
  activeSessionFieldMeetsPhase16P6Bar,
  getActiveSessionFieldOverlay,
} from "@/lib/intelligence/v4/phase16P6SessionMemoryDepth";
import {
  buildSessionMemorySummary,
  PHASE16_P6_ACTIVE_SESSION_FIELD_TOTAL,
  REHEARSAL_HISTORY_HUB_HREF,
} from "@/lib/intelligence/v4/phase16P6SessionMemory";
import { rehearsalSessionStatePath } from "@/lib/intelligence/v4/phase16P6SessionMemoryState";
import { getFieldBookArticle } from "@/lib/intelligence/fieldBookRegistry";
import { resolveCanonBinding } from "@/lib/intelligence/fieldBookCanonRegistry";
import { listStrategyMigrationRoutes } from "@/lib/intelligence/v4/strategyMigrationBridge";

export type Phase16P6Progress = {
  fieldTotal: number;
  fieldsAtBar: number;
  hubInCandidateNav: boolean;
  commandHomeWired: boolean;
  fieldBookReady: boolean;
  canonReady: boolean;
  migrationRouteBound: boolean;
  persistenceWired: boolean;
  clearApiWired: boolean;
  overallPct: number;
};

export function isRehearsalSessionClearApiWired(root = process.cwd()): boolean {
  return fs.existsSync(path.join(root, "src/app/api/admin/intelligence/rehearsal-session/route.ts"));
}

export function computePhase16P6Progress(): Phase16P6Progress {
  const fieldBar = countActiveSessionFieldsAtBar();
  const feed = buildCandidateCommandHomeFeed();

  const candidateHrefs = new Set(
    flattenCandidateCommandNavLinks(buildCandidateCommandNavSections("CANDIDATE")).map((l) => l.href),
  );

  const hubInCandidateNav = candidateHrefs.has(REHEARSAL_HISTORY_HUB_HREF);
  const commandHomeWired = Boolean(feed.sessionMemory?.tonightReminder);
  const fieldBookReady = Boolean(getFieldBookArticle("session-memory-command"));
  const canonReady = Boolean(resolveCanonBinding(REHEARSAL_HISTORY_HUB_HREF));
  const migrationRouteBound = listStrategyMigrationRoutes().some(
    (r) => r.intelligenceHref === REHEARSAL_HISTORY_HUB_HREF,
  );
  const persistenceWired = fs.existsSync(rehearsalSessionStatePath()) || isRehearsalSessionClearApiWired();
  const clearApiWired = isRehearsalSessionClearApiWired();

  const fieldScore =
    fieldBar.atBar >= PHASE16_P6_ACTIVE_SESSION_FIELD_TOTAL
      ? 100
      : Math.round((fieldBar.atBar / PHASE16_P6_ACTIVE_SESSION_FIELD_TOTAL) * 100);
  const persistScore = persistenceWired && clearApiWired ? 100 : 85;
  const wireChecks = [hubInCandidateNav, commandHomeWired, fieldBookReady, canonReady, migrationRouteBound];
  const wireScore = Math.round((wireChecks.filter(Boolean).length / wireChecks.length) * 100);

  const overallPct = Math.min(100, Math.round((fieldScore + persistScore + wireScore) / 3));

  return {
    fieldTotal: fieldBar.total,
    fieldsAtBar: fieldBar.atBar,
    hubInCandidateNav,
    commandHomeWired,
    fieldBookReady,
    canonReady,
    migrationRouteBound,
    persistenceWired,
    clearApiWired,
    overallPct,
  };
}

export type Phase16P6UpgradePassReport = {
  passId: "phase-16-p6-session-memory";
  title: "Step 16 P6 — Session memory";
  summary: string;
  completionPct: number;
  hubHref: string;
  progress: Phase16P6Progress;
};

export function computePhase16P6UpgradePass(): Phase16P6UpgradePassReport {
  const progress = computePhase16P6Progress();
  return {
    passId: "phase-16-p6-session-memory",
    title: "Step 16 P6 — Session memory",
    summary:
      "Continue last drill on command home — rehearsal session state persisted with history list and staff reset on the rehearsal history hub.",
    completionPct: progress.overallPct,
    hubHref: REHEARSAL_HISTORY_HUB_HREF,
    progress,
  };
}

export function assertPhase16P6Bar(): { ok: boolean; message: string } {
  const p = computePhase16P6Progress();
  const issues: string[] = [];
  if (p.fieldsAtBar < PHASE16_P6_ACTIVE_SESSION_FIELD_TOTAL) {
    issues.push(`fields ${p.fieldsAtBar}/${PHASE16_P6_ACTIVE_SESSION_FIELD_TOTAL}`);
  }
  if (!p.hubInCandidateNav) issues.push("candidate nav");
  if (!p.commandHomeWired) issues.push("command home");
  if (!p.fieldBookReady) issues.push("field book");
  if (!p.canonReady) issues.push("canon");
  if (!p.migrationRouteBound) issues.push("migration");
  if (!p.clearApiWired) issues.push("clear api");

  for (const fieldId of ACTIVE_SESSION_FIELD_IDS) {
    const o = getActiveSessionFieldOverlay(fieldId);
    if (!activeSessionFieldMeetsPhase16P6Bar(o)) issues.push(`overlay ${fieldId}`);
  }

  if (issues.length === 0) return { ok: true, message: "Phase 16 P6 bar met" };
  return { ok: false, message: issues.slice(0, 6).join("; ") };
}

export { REHEARSAL_HISTORY_HUB_HREF };
