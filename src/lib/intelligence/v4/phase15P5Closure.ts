/**
 * Phase 15 P5 — Evidence honesty badges closure.
 */
import { buildCandidateCommandHomeFeed } from "@/lib/intelligence/v4/candidateCommandHome";
import {
  buildEvidenceHonestySummary,
  EVIDENCE_HONESTY_HUB_HREF,
  getEvidenceHonestySurface,
  listEvidenceHonestySurfaces,
  PHASE15_P5_FILM_DRILL_BAR,
  PHASE15_P5_SURFACE_CATEGORY_TOTAL,
} from "@/lib/intelligence/v4/phase15P5EvidenceHonesty";
import {
  countEvidenceHonestySurfacesAtBar,
  evidenceHonestySurfaceMeetsPhase15P5Bar,
  getEvidenceHonestySurfaceOverlay,
} from "@/lib/intelligence/v4/phase15P5EvidenceHonestyDepth";
import { flattenCandidateCommandNavLinks, buildCandidateCommandNavSections } from "@/lib/intelligence/v4/candidateCommandNav";
import { getFieldBookArticle } from "@/lib/intelligence/fieldBookRegistry";
import { resolveCanonBinding } from "@/lib/intelligence/fieldBookCanonRegistry";
import { listStrategyMigrationRoutes } from "@/lib/intelligence/v4/strategyMigrationBridge";

export type Phase15P5Progress = {
  surfaceCategoryTotal: number;
  surfacesAtBar: number;
  filmDrillBadges: number;
  commandHomeWired: boolean;
  hubInCandidateNav: boolean;
  fieldBookReady: boolean;
  canonReady: boolean;
  migrationRouteBound: boolean;
  nonStageSafeTagged: number;
  overallPct: number;
};

export function computePhase15P5Progress(): Phase15P5Progress {
  const bar = countEvidenceHonestySurfacesAtBar();
  const summary = buildEvidenceHonestySummary();
  const feed = buildCandidateCommandHomeFeed();

  const candidateHrefs = new Set(
    flattenCandidateCommandNavLinks(buildCandidateCommandNavSections("CANDIDATE")).map((l) => l.href),
  );

  const hubInCandidateNav =
    candidateHrefs.has(EVIDENCE_HONESTY_HUB_HREF) || Boolean(feed.evidenceHonesty?.tonightReminder);
  const commandHomeWired = Boolean(feed.evidenceHonesty?.tonightReminder);
  const fieldBookReady = Boolean(getFieldBookArticle("evidence-honesty-command"));
  const canonReady = Boolean(resolveCanonBinding(EVIDENCE_HONESTY_HUB_HREF));
  const migrationRouteBound = listStrategyMigrationRoutes().some(
    (r) => r.intelligenceHref === EVIDENCE_HONESTY_HUB_HREF,
  );

  const categoryScore =
    bar.total >= PHASE15_P5_SURFACE_CATEGORY_TOTAL && getEvidenceHonestySurface("film-room-hub") ? 100 : 85;
  const barScore = bar.atBar >= PHASE15_P5_SURFACE_CATEGORY_TOTAL ? 100 : Math.round((bar.atBar / PHASE15_P5_SURFACE_CATEGORY_TOTAL) * 100);
  const wireChecks = [hubInCandidateNav, commandHomeWired, fieldBookReady, canonReady, migrationRouteBound];
  const wireScore = Math.round((wireChecks.filter(Boolean).length / wireChecks.length) * 100);

  const overallPct = Math.min(100, Math.round((categoryScore + barScore + wireScore) / 3));
  const filmDrillBadges = getEvidenceHonestySurface("film-room-hub") ? PHASE15_P5_FILM_DRILL_BAR : 0;

  return {
    surfaceCategoryTotal: bar.total,
    surfacesAtBar: bar.atBar,
    filmDrillBadges,
    commandHomeWired,
    hubInCandidateNav,
    fieldBookReady,
    canonReady,
    migrationRouteBound,
    nonStageSafeTagged: summary.nonStageSafeCount,
    overallPct,
  };
}

export type Phase15P5UpgradePassReport = {
  passId: "phase-15-p5-evidence-honesty";
  title: "Step 15 P5 — Evidence honesty badges";
  summary: string;
  completionPct: number;
  hubHref: string;
  progress: Phase15P5Progress;
};

export function computePhase15P5UpgradePass(): Phase15P5UpgradePassReport {
  const progress = computePhase15P5Progress();
  return {
    passId: "phase-15-p5-evidence-honesty",
    title: "Step 15 P5 — Evidence honesty badges",
    summary:
      "Unified VERIFIED / NEEDS_REVIEW / NON_PUBLISHABLE badges on film room, briefings, opposition, and rehearse surfaces — Kelly sees evidence tier before proof language.",
    completionPct: progress.overallPct,
    hubHref: EVIDENCE_HONESTY_HUB_HREF,
    progress,
  };
}

export function assertPhase15P5Bar(): { ok: boolean; message: string } {
  const p = computePhase15P5Progress();
  const issues: string[] = [];
  if (p.surfacesAtBar < PHASE15_P5_SURFACE_CATEGORY_TOTAL) {
    issues.push(`surfaces ${p.surfacesAtBar}/${PHASE15_P5_SURFACE_CATEGORY_TOTAL}`);
  }
  if (p.filmDrillBadges < 3) issues.push(`film drills ${p.filmDrillBadges}`);
  if (!p.hubInCandidateNav) issues.push("nav");
  if (!p.commandHomeWired) issues.push("command home");
  if (!p.fieldBookReady) issues.push("field book");
  if (!p.canonReady) issues.push("canon");
  if (!p.migrationRouteBound) issues.push("migration");

  for (const surface of listEvidenceHonestySurfaces()) {
    const o = getEvidenceHonestySurfaceOverlay(surface.surfaceId);
    if (!o || !evidenceHonestySurfaceMeetsPhase15P5Bar(o)) issues.push(`overlay ${surface.surfaceId}`);
  }

  if (issues.length === 0) return { ok: true, message: "Phase 15 P5 bar met" };
  return { ok: false, message: issues.slice(0, 6).join("; ") };
}

export { EVIDENCE_HONESTY_HUB_HREF };
