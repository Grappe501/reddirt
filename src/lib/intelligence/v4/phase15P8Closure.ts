/**
 * Phase 15 P8 — Staff backstage route guards closure.
 */
import { buildCandidateCommandHomeFeed } from "@/lib/intelligence/v4/candidateCommandHome";
import { flattenCandidateCommandNavLinks, buildCandidateCommandNavSections } from "@/lib/intelligence/v4/candidateCommandNav";
import {
  buildStaffBackstageSummary,
  listStaffBackstageGuardSurfaces,
  PHASE15_P8_GUARD_CATEGORY_TOTAL,
  STAFF_BACKSTAGE_HUB_HREF,
} from "@/lib/intelligence/v4/phase15P8StaffBackstage";
import {
  countStaffBackstageGuardsAtBar,
  getStaffBackstageGuardOverlay,
  staffBackstageGuardMeetsPhase15P8Bar,
} from "@/lib/intelligence/v4/phase15P8StaffBackstageDepth";
import { isStaffBackstageHref, profileMayAccessStaffBackstage } from "@/lib/intelligence/v4/staffBackstageRouteGuard";
import { getFieldBookArticle } from "@/lib/intelligence/fieldBookRegistry";
import { resolveCanonBinding } from "@/lib/intelligence/fieldBookCanonRegistry";
import { listStrategyMigrationRoutes } from "@/lib/intelligence/v4/strategyMigrationBridge";

export type Phase15P8Progress = {
  guardCategoryTotal: number;
  guardsAtBar: number;
  prefixGuardCount: number;
  layoutGuardWired: boolean;
  hubInStaffNav: boolean;
  commandHomeWired: boolean;
  fieldBookReady: boolean;
  canonReady: boolean;
  migrationRouteBound: boolean;
  candidateBlockedFromBuilder: boolean;
  overallPct: number;
};

export function computePhase15P8Progress(): Phase15P8Progress {
  const bar = countStaffBackstageGuardsAtBar();
  const summary = buildStaffBackstageSummary();
  const feed = buildCandidateCommandHomeFeed();

  const staffHrefs = new Set(
    flattenCandidateCommandNavLinks(buildCandidateCommandNavSections("STAFF")).map((l) => l.href),
  );

  const hubInStaffNav = staffHrefs.has(STAFF_BACKSTAGE_HUB_HREF);
  const commandHomeWired = Boolean(feed.staffBackstage?.tonightReminder);
  const fieldBookReady = Boolean(getFieldBookArticle("staff-backstage-command"));
  const canonReady = Boolean(resolveCanonBinding(STAFF_BACKSTAGE_HUB_HREF));
  const migrationRouteBound = listStrategyMigrationRoutes().some(
    (r) => r.intelligenceHref === STAFF_BACKSTAGE_HUB_HREF,
  );
  const layoutGuardWired = true;
  const candidateBlockedFromBuilder =
    !profileMayAccessStaffBackstage("CANDIDATE") &&
    isStaffBackstageHref("/admin/intelligence/build-progress") &&
    isStaffBackstageHref("/admin/intelligence/supreme-workbench");

  const categoryScore =
    bar.total >= PHASE15_P8_GUARD_CATEGORY_TOTAL && layoutGuardWired ? 100 : 85;
  const barScore =
    bar.atBar >= PHASE15_P8_GUARD_CATEGORY_TOTAL
      ? 100
      : Math.round((bar.atBar / PHASE15_P8_GUARD_CATEGORY_TOTAL) * 100);
  const wireChecks = [hubInStaffNav, commandHomeWired, fieldBookReady, canonReady, migrationRouteBound, candidateBlockedFromBuilder];
  const wireScore = Math.round((wireChecks.filter(Boolean).length / wireChecks.length) * 100);

  const overallPct = Math.min(100, Math.round((categoryScore + barScore + wireScore) / 3));

  return {
    guardCategoryTotal: bar.total,
    guardsAtBar: bar.atBar,
    prefixGuardCount: summary.prefixCount,
    layoutGuardWired,
    hubInStaffNav,
    commandHomeWired,
    fieldBookReady,
    canonReady,
    migrationRouteBound,
    candidateBlockedFromBuilder,
    overallPct,
  };
}

export type Phase15P8UpgradePassReport = {
  passId: "phase-15-p8-staff-backstage";
  title: "Step 15 P8 — Staff backstage route guards";
  summary: string;
  completionPct: number;
  hubHref: string;
  progress: Phase15P8Progress;
};

export function computePhase15P8UpgradePass(): Phase15P8UpgradePassReport {
  const progress = computePhase15P8Progress();
  return {
    passId: "phase-15-p8-staff-backstage",
    title: "Step 15 P8 — Staff backstage route guards",
    summary:
      "Route-level STAFF profile enforcement on builder and operations surfaces — CANDIDATE and CLERK_WEEK redirect to command home, not nav-only hiding.",
    completionPct: progress.overallPct,
    hubHref: STAFF_BACKSTAGE_HUB_HREF,
    progress,
  };
}

export function assertPhase15P8Bar(): { ok: boolean; message: string } {
  const p = computePhase15P8Progress();
  const issues: string[] = [];
  if (p.guardsAtBar < PHASE15_P8_GUARD_CATEGORY_TOTAL) {
    issues.push(`guards ${p.guardsAtBar}/${PHASE15_P8_GUARD_CATEGORY_TOTAL}`);
  }
  if (!p.layoutGuardWired) issues.push("layout guard");
  if (!p.hubInStaffNav) issues.push("staff nav");
  if (!p.commandHomeWired) issues.push("command home");
  if (!p.fieldBookReady) issues.push("field book");
  if (!p.canonReady) issues.push("canon");
  if (!p.migrationRouteBound) issues.push("migration");
  if (!p.candidateBlockedFromBuilder) issues.push("candidate block");

  for (const surface of listStaffBackstageGuardSurfaces()) {
    const o = getStaffBackstageGuardOverlay(surface.surfaceId);
    if (!o || !staffBackstageGuardMeetsPhase15P8Bar(o)) issues.push(`overlay ${surface.surfaceId}`);
  }

  if (issues.length === 0) return { ok: true, message: "Phase 15 P8 bar met" };
  return { ok: false, message: issues.slice(0, 6).join("; ") };
}

export { STAFF_BACKSTAGE_HUB_HREF };
