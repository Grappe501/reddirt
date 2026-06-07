/**
 * Phase 11 P2 — Movement philosophy + staff strategy command closure.
 */
import {
  MOVEMENT_PHILOSOPHY_ENTRIES,
  MOVEMENT_PHILOSOPHY_HUB_HREF,
  movementPhilosophyDocHref,
} from "@/lib/philosophy/movement-philosophy-nav";
import {
  countMovementPhilosophyDocsAtPhase11P2Bar,
  getMovementPhilosophyDocOverlay,
  movementPhilosophyDocMeetsPhase11P2Bar,
  PHASE11_P2_MOVEMENT_PHILOSOPHY_DOC_TOTAL,
} from "@/lib/intelligence/v4/phase11P2MovementPhilosophyDepth";
import {
  countStaffStrategySurfacesAtPhase11P2Bar,
  getStaffStrategySurfaceOverlay,
  PHASE11_P2_STAFF_STRATEGY_SURFACE_TOTAL,
  staffStrategySurfaceMeetsPhase11P2Bar,
} from "@/lib/intelligence/v4/phase11P2StaffStrategyDepth";
import {
  listStaffStrategySurfaces,
  STAFF_STRATEGY_COMMAND_HUB_HREF,
} from "@/lib/intelligence/v4/staffStrategyCommandInventory";
import { listStrategyMigrationRoutes } from "@/lib/intelligence/v4/strategyMigrationBridge";
import { listStrategyMigrationCoverage } from "@/lib/intelligence/v4/strategyPhilosophyInventory";
import { getFieldBookArticle } from "@/lib/intelligence/fieldBookRegistry";
import { resolveCanonBinding } from "@/lib/intelligence/fieldBookCanonRegistry";

const MIN_DOCS = 5;
const MIN_DOCS_AT_BAR = 5;
const MIN_STAFF_SURFACES = 6;
const MIN_STAFF_AT_BAR = 6;
const MIN_MIGRATION_ROUTES = 47;

export type MovementPhilosophyDocSurface = {
  pathKey: string;
  title: string;
  href: string;
  sourceFile: string;
  phase11P2Enriched: boolean;
};

export type Phase11P2Progress = {
  movementDocTotal: number;
  movementDocsAtBar: number;
  staffSurfaceTotal: number;
  staffSurfacesAtBar: number;
  fieldBookMovementReady: boolean;
  fieldBookStaffReady: boolean;
  movementCanonReady: boolean;
  staffCanonReady: boolean;
  movementMigrationBound: boolean;
  staffMigrationBound: boolean;
  strategyMigrationRoutes: number;
  migrationCoverageUnbound: string[];
  overallPct: number;
};

export function listMovementPhilosophyDocSurfaces(): MovementPhilosophyDocSurface[] {
  return MOVEMENT_PHILOSOPHY_ENTRIES.map((e) => {
    const overlay = getMovementPhilosophyDocOverlay(e.pathKey);
    return {
      pathKey: e.pathKey,
      title: e.label,
      href: movementPhilosophyDocHref(e.pathKey),
      sourceFile: e.sourceFile,
      phase11P2Enriched: movementPhilosophyDocMeetsPhase11P2Bar(overlay),
    };
  });
}

export function computePhase11P2Progress(): Phase11P2Progress {
  const movement = countMovementPhilosophyDocsAtPhase11P2Bar();
  const staff = countStaffStrategySurfacesAtPhase11P2Bar();
  const migrationRoutes = listStrategyMigrationRoutes();
  const coverage = listStrategyMigrationCoverage();

  const fieldBookMovementReady = Boolean(getFieldBookArticle("movement-philosophy-command"));
  const fieldBookStaffReady = Boolean(getFieldBookArticle("staff-strategy-command"));
  const movementCanonReady = Boolean(resolveCanonBinding(MOVEMENT_PHILOSOPHY_HUB_HREF));
  const staffCanonReady = Boolean(resolveCanonBinding(STAFF_STRATEGY_COMMAND_HUB_HREF));
  const movementMigrationBound = migrationRoutes.some((r) => r.intelligenceHref === MOVEMENT_PHILOSOPHY_HUB_HREF);
  const staffMigrationBound = migrationRoutes.some((r) => r.intelligenceHref === STAFF_STRATEGY_COMMAND_HUB_HREF);

  const docScore =
    movement.atBar >= MIN_DOCS_AT_BAR && movement.total >= MIN_DOCS
      ? 100
      : Math.round((movement.atBar / MIN_DOCS_AT_BAR) * 100);
  const staffScore =
    staff.atBar >= MIN_STAFF_AT_BAR && staff.total >= MIN_STAFF_SURFACES
      ? 100
      : Math.round((staff.atBar / MIN_STAFF_AT_BAR) * 100);
  const wireChecks = [
    fieldBookMovementReady,
    fieldBookStaffReady,
    movementCanonReady,
    staffCanonReady,
    movementMigrationBound,
    staffMigrationBound,
    migrationRoutes.length >= MIN_MIGRATION_ROUTES,
    coverage.unboundHrefs.length === 0,
  ];
  const wireScore = Math.round((wireChecks.filter(Boolean).length / wireChecks.length) * 100);

  const overallPct = Math.min(100, Math.round((docScore + staffScore + wireScore) / 3));

  return {
    movementDocTotal: movement.total,
    movementDocsAtBar: movement.atBar,
    staffSurfaceTotal: staff.total,
    staffSurfacesAtBar: staff.atBar,
    fieldBookMovementReady,
    fieldBookStaffReady,
    movementCanonReady,
    staffCanonReady,
    movementMigrationBound,
    staffMigrationBound,
    strategyMigrationRoutes: migrationRoutes.length,
    migrationCoverageUnbound: coverage.unboundHrefs,
    overallPct,
  };
}

export type Phase11P2UpgradePassReport = {
  passId: "phase-11-p2-movement-philosophy-staff-strategy";
  title: "Step 11 P2 — Movement philosophy + staff strategy command";
  summary: string;
  completionPct: number;
  movementHubHref: string;
  staffHubHref: string;
  progress: Phase11P2Progress;
};

export function computePhase11P2UpgradePass(): Phase11P2UpgradePassReport {
  const progress = computePhase11P2Progress();
  return {
    passId: "phase-11-p2-movement-philosophy-staff-strategy",
    title: "Step 11 P2 — Movement philosophy + staff strategy command",
    summary:
      "Public philosophy corpus (docs/philosophy + VOL-CORE-1) surfaced in intelligence with debate and volunteer overlays; morning brief, briefing papers, writing toolbox, and NSI pathway/graph/simulation wired to migration bridge, canon, and debate philosophy readiness feed.",
    completionPct: progress.overallPct,
    movementHubHref: MOVEMENT_PHILOSOPHY_HUB_HREF,
    staffHubHref: STAFF_STRATEGY_COMMAND_HUB_HREF,
    progress,
  };
}

export function assertPhase11P2Bar(): { ok: boolean; message: string } {
  const p = computePhase11P2Progress();
  const issues: string[] = [];
  if (p.movementDocsAtBar < MIN_DOCS_AT_BAR) issues.push(`movement docs ${p.movementDocsAtBar}/${MIN_DOCS_AT_BAR}`);
  if (p.staffSurfacesAtBar < MIN_STAFF_AT_BAR) issues.push(`staff surfaces ${p.staffSurfacesAtBar}/${MIN_STAFF_AT_BAR}`);
  if (!p.fieldBookMovementReady) issues.push("movement field book");
  if (!p.fieldBookStaffReady) issues.push("staff field book");
  if (!p.movementCanonReady) issues.push("movement canon");
  if (!p.staffCanonReady) issues.push("staff canon");
  if (!p.movementMigrationBound) issues.push("movement migration");
  if (!p.staffMigrationBound) issues.push("staff migration");
  if (p.strategyMigrationRoutes < MIN_MIGRATION_ROUTES) {
    issues.push(`migration routes ${p.strategyMigrationRoutes}/${MIN_MIGRATION_ROUTES}`);
  }
  if (p.migrationCoverageUnbound.length > 0) {
    issues.push(`unbound: ${p.migrationCoverageUnbound.join(", ")}`);
  }
  if (issues.length === 0) {
    return { ok: true, message: "Phase 11 P2 bar met" };
  }
  return { ok: false, message: issues.join("; ") };
}

export {
  MOVEMENT_PHILOSOPHY_HUB_HREF,
  STAFF_STRATEGY_COMMAND_HUB_HREF,
  PHASE11_P2_MOVEMENT_PHILOSOPHY_DOC_TOTAL,
  PHASE11_P2_STAFF_STRATEGY_SURFACE_TOTAL,
};

export function listStaffStrategySurfaceSummaries() {
  return listStaffStrategySurfaces().map((s) => ({
    ...s,
    phase11P2Enriched: staffStrategySurfaceMeetsPhase11P2Bar(getStaffStrategySurfaceOverlay(s.id)),
  }));
}
