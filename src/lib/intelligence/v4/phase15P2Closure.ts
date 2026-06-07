/**
 * Phase 15 P2 — Kelly prep week closure.
 */
import {
  countKellyPrepWeekDaysAtBar,
  getKellyPrepWeekDayOverlay,
  KELLY_PREP_WEEK_HUB_HREF,
  kellyPrepWeekDayMeetsPhase15P2Bar,
  PHASE15_P2_DAY_TOTAL,
  PHASE15_P2_MIN_READS_PER_DAY,
  PHASE15_P2_MIN_TOTAL_READS,
} from "@/lib/intelligence/v4/phase15P2KellyPrepWeekDepth";
import { listKellyPrepWeekDaySurfacesFromPath, type KellyPrepWeekDaySurface } from "@/lib/intelligence/v4/kellyPrepWeekInventory";
import { countKellyPrepWeekReads, KELLY_PREP_WEEK_DAYS } from "@/lib/intelligence/v4/kellyPrepWeekPath";
import { getFieldBookArticle } from "@/lib/intelligence/fieldBookRegistry";
import { resolveCanonBinding } from "@/lib/intelligence/fieldBookCanonRegistry";
import { listStrategyMigrationRoutes } from "@/lib/intelligence/v4/strategyMigrationBridge";
import {
  flattenCandidateCommandNavLinks,
  buildCandidateCommandNavSections,
} from "@/lib/intelligence/v4/candidateCommandNav";

const MIN_DAYS_AT_BAR = 7;

export type Phase15P2Progress = {
  dayTotal: number;
  daysAtBar: number;
  totalReads: number;
  readsPerDayMin: number;
  hubInCandidateNav: boolean;
  fieldBookReady: boolean;
  canonReady: boolean;
  migrationRouteBound: boolean;
  overallPct: number;
};

export function computePhase15P2Progress(): Phase15P2Progress {
  const dayBar = countKellyPrepWeekDaysAtBar();
  const totalReads = countKellyPrepWeekReads();
  const readsPerDayMin = Math.min(...KELLY_PREP_WEEK_DAYS.map((d) => d.kellyReads.length));

  const candidateHrefs = new Set(
    flattenCandidateCommandNavLinks(buildCandidateCommandNavSections("CANDIDATE")).map((l) => l.href),
  );
  const hubInCandidateNav = candidateHrefs.has(KELLY_PREP_WEEK_HUB_HREF);

  const fieldBookReady = Boolean(getFieldBookArticle("kelly-prep-week-command"));
  const canonReady = Boolean(resolveCanonBinding(KELLY_PREP_WEEK_HUB_HREF));
  const migrationRouteBound = listStrategyMigrationRoutes().some(
    (r) => r.intelligenceHref === KELLY_PREP_WEEK_HUB_HREF,
  );

  const dayScore =
    dayBar.atBar >= MIN_DAYS_AT_BAR ? 100 : Math.round((dayBar.atBar / MIN_DAYS_AT_BAR) * 100);
  const readScore =
    totalReads >= PHASE15_P2_MIN_TOTAL_READS && readsPerDayMin >= PHASE15_P2_MIN_READS_PER_DAY
      ? 100
      : Math.round((totalReads / PHASE15_P2_MIN_TOTAL_READS) * 100);
  const wireChecks = [hubInCandidateNav, fieldBookReady, canonReady, migrationRouteBound];
  const wireScore = Math.round((wireChecks.filter(Boolean).length / wireChecks.length) * 100);

  const overallPct = Math.min(100, Math.round((dayScore + readScore + wireScore) / 3));

  return {
    dayTotal: dayBar.total,
    daysAtBar: dayBar.atBar,
    totalReads,
    readsPerDayMin,
    hubInCandidateNav,
    fieldBookReady,
    canonReady,
    migrationRouteBound,
    overallPct,
  };
}

export type Phase15P2UpgradePassReport = {
  passId: "phase-15-p2-kelly-prep-week";
  title: "Step 15 P2 — Kelly prep week";
  summary: string;
  completionPct: number;
  hubHref: string;
  progress: Phase15P2Progress;
};

export function computePhase15P2UpgradePass(): Phase15P2UpgradePassReport {
  const progress = computePhase15P2Progress();
  return {
    passId: "phase-15-p2-kelly-prep-week",
    title: "Step 15 P2 — Kelly prep week",
    summary:
      "Seven-day orchestrated candidate prep path — philosophy, trap lanes, SOS drills, opposition, three-way, simulation, and claims-only rest day with progress tracking.",
    completionPct: progress.overallPct,
    hubHref: KELLY_PREP_WEEK_HUB_HREF,
    progress,
  };
}

export function listKellyPrepWeekDaySurfaces(): KellyPrepWeekDaySurface[] {
  return listKellyPrepWeekDaySurfacesFromPath();
}

export function assertPhase15P2Bar(): { ok: boolean; message: string } {
  const p = computePhase15P2Progress();
  const issues: string[] = [];
  if (p.daysAtBar < MIN_DAYS_AT_BAR) issues.push(`days ${p.daysAtBar}/${MIN_DAYS_AT_BAR}`);
  if (p.totalReads < PHASE15_P2_MIN_TOTAL_READS) issues.push(`reads ${p.totalReads}`);
  if (p.readsPerDayMin < PHASE15_P2_MIN_READS_PER_DAY) issues.push(`min reads/day ${p.readsPerDayMin}`);
  if (!p.hubInCandidateNav) issues.push("candidate nav");
  if (!p.fieldBookReady) issues.push("field book");
  if (!p.canonReady) issues.push("canon");
  if (!p.migrationRouteBound) issues.push("migration");
  if (issues.length === 0) return { ok: true, message: "Phase 15 P2 bar met" };
  return { ok: false, message: issues.join("; ") };
}

export {
  KELLY_PREP_WEEK_HUB_HREF,
  PHASE15_P2_DAY_TOTAL,
  getKellyPrepWeekDayOverlay,
  kellyPrepWeekDayMeetsPhase15P2Bar,
};
