/**
 * Phase 16 P7 — Staff coach overlay closure.
 */
import fs from "node:fs";
import path from "node:path";
import { buildCandidateCommandHomeFeed } from "@/lib/intelligence/v4/candidateCommandHome";
import { flattenCandidateCommandNavLinks, buildCandidateCommandNavSections } from "@/lib/intelligence/v4/candidateCommandNav";
import {
  COACH_OVERLAY_FIELD_IDS,
  countCoachOverlayFieldsAtBar,
  coachOverlayFieldMeetsPhase16P7Bar,
  getCoachOverlayField,
} from "@/lib/intelligence/v4/phase16P7StaffCoachDepth";
import {
  buildStaffCoachSummary,
  PHASE16_P7_COACH_FIELD_TOTAL,
  REHEARSAL_COACH_HUB_HREF,
} from "@/lib/intelligence/v4/phase16P7StaffCoach";
import { rehearsalCoachStatePath } from "@/lib/intelligence/v4/phase16P7RehearsalCoachState";
import { isStaffBackstageHref } from "@/lib/intelligence/v4/staffBackstageRouteGuard";
import { getFieldBookArticle } from "@/lib/intelligence/fieldBookRegistry";
import { resolveCanonBinding } from "@/lib/intelligence/fieldBookCanonRegistry";
import { listStrategyMigrationRoutes } from "@/lib/intelligence/v4/strategyMigrationBridge";

export type Phase16P7Progress = {
  fieldTotal: number;
  fieldsAtBar: number;
  hubInStaffNav: boolean;
  commandHomeWired: boolean;
  fieldBookReady: boolean;
  canonReady: boolean;
  migrationRouteBound: boolean;
  assignApiWired: boolean;
  routeGuardWired: boolean;
  overallPct: number;
};

export function isRehearsalCoachApiWired(root = process.cwd()): boolean {
  return fs.existsSync(path.join(root, "src/app/api/admin/intelligence/rehearsal-coach/route.ts"));
}

export function isRehearsalCoachRouteGuardWired(): boolean {
  return isStaffBackstageHref(REHEARSAL_COACH_HUB_HREF);
}

export function computePhase16P7Progress(): Phase16P7Progress {
  const fieldBar = countCoachOverlayFieldsAtBar();
  const feed = buildCandidateCommandHomeFeed();

  const staffHrefs = new Set(
    flattenCandidateCommandNavLinks(buildCandidateCommandNavSections("STAFF")).map((l) => l.href),
  );

  const hubInStaffNav = staffHrefs.has(REHEARSAL_COACH_HUB_HREF);
  const commandHomeWired = Boolean(feed.staffCoach?.tonightReminder);
  const fieldBookReady = Boolean(getFieldBookArticle("rehearsal-coach-command"));
  const canonReady = Boolean(resolveCanonBinding(REHEARSAL_COACH_HUB_HREF));
  const migrationRouteBound = listStrategyMigrationRoutes().some(
    (r) => r.intelligenceHref === REHEARSAL_COACH_HUB_HREF,
  );
  const assignApiWired = isRehearsalCoachApiWired();
  const routeGuardWired = isRehearsalCoachRouteGuardWired();

  const fieldScore =
    fieldBar.atBar >= PHASE16_P7_COACH_FIELD_TOTAL
      ? 100
      : Math.round((fieldBar.atBar / PHASE16_P7_COACH_FIELD_TOTAL) * 100);
  const guardScore = routeGuardWired && assignApiWired ? 100 : 85;
  const wireChecks = [hubInStaffNav, commandHomeWired, fieldBookReady, canonReady, migrationRouteBound];
  const wireScore = Math.round((wireChecks.filter(Boolean).length / wireChecks.length) * 100);

  const overallPct = Math.min(100, Math.round((fieldScore + guardScore + wireScore) / 3));

  return {
    fieldTotal: fieldBar.total,
    fieldsAtBar: fieldBar.atBar,
    hubInStaffNav,
    commandHomeWired,
    fieldBookReady,
    canonReady,
    migrationRouteBound,
    assignApiWired,
    routeGuardWired,
    overallPct,
  };
}

export type Phase16P7UpgradePassReport = {
  passId: "phase-16-p7-staff-coach";
  title: "Step 16 P7 — Staff coach overlay";
  summary: string;
  completionPct: number;
  hubHref: string;
  progress: Phase16P7Progress;
};

export function computePhase16P7UpgradePass(): Phase16P7UpgradePassReport {
  const progress = computePhase16P7Progress();
  return {
    passId: "phase-16-p7-staff-coach",
    title: "Step 16 P7 — Staff coach overlay",
    summary:
      "STAFF-only coach hub — assign tonight's encounter and pin up to three must-run drills surfaced on command home for Kelly.",
    completionPct: progress.overallPct,
    hubHref: REHEARSAL_COACH_HUB_HREF,
    progress,
  };
}

export function assertPhase16P7Bar(): { ok: boolean; message: string } {
  const p = computePhase16P7Progress();
  const issues: string[] = [];
  if (p.fieldsAtBar < PHASE16_P7_COACH_FIELD_TOTAL) {
    issues.push(`fields ${p.fieldsAtBar}/${PHASE16_P7_COACH_FIELD_TOTAL}`);
  }
  if (!p.hubInStaffNav) issues.push("staff nav");
  if (!p.commandHomeWired) issues.push("command home");
  if (!p.fieldBookReady) issues.push("field book");
  if (!p.canonReady) issues.push("canon");
  if (!p.migrationRouteBound) issues.push("migration");
  if (!p.assignApiWired) issues.push("assign api");
  if (!p.routeGuardWired) issues.push("route guard");

  for (const fieldId of COACH_OVERLAY_FIELD_IDS) {
    const field = getCoachOverlayField(fieldId);
    if (!coachOverlayFieldMeetsPhase16P7Bar(field)) issues.push(`overlay ${fieldId}`);
  }

  if (issues.length === 0) return { ok: true, message: "Phase 16 P7 bar met" };
  return { ok: false, message: issues.slice(0, 6).join("; ") };
}

export { REHEARSAL_COACH_HUB_HREF };
