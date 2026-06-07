/**
 * Phase 11 P1 — Kelly SOS strategic plan intelligence closure.
 */
import { STRATEGY_MD_ENTRIES } from "@/lib/campaign-strategy/md-manifest";
import {
  KELLY_STRATEGIC_PLAN_HUB_HREF,
  kellyStrategicPlanDocHref,
} from "@/lib/campaign-strategy/kelly-strategic-plan-nav";
import {
  countKellyChaptersAtPhase11P1Bar,
  getKellyStrategicPlanChapterOverlay,
  kellyChapterMeetsPhase11P1Bar,
  PHASE11_P1_KELLY_CHAPTER_TOTAL,
} from "@/lib/intelligence/v4/phase11KellyStrategicPlanDepth";
import { listStrategyMigrationRoutes } from "@/lib/intelligence/v4/strategyMigrationBridge";
import { getFieldBookArticle } from "@/lib/intelligence/fieldBookRegistry";
import { resolveCanonBinding } from "@/lib/intelligence/fieldBookCanonRegistry";

const MIN_CHAPTERS = 22;
const MIN_AT_BAR = 22;

export type Phase11KellyStrategicPlanProgress = {
  chapterTotal: number;
  chaptersAtBar: number;
  fieldBookArticleReady: boolean;
  canonBindingReady: boolean;
  migrationRouteBound: boolean;
  strategyMigrationRoutes: number;
  overallPct: number;
};

export function computePhase11KellyStrategicPlanProgress(): Phase11KellyStrategicPlanProgress {
  const { atBar, total } = countKellyChaptersAtPhase11P1Bar();
  const fieldBookArticleReady = Boolean(getFieldBookArticle("kelly-strategic-plan-command"));
  const canonBindingReady = Boolean(resolveCanonBinding(KELLY_STRATEGIC_PLAN_HUB_HREF));
  const migrationRoutes = listStrategyMigrationRoutes();
  const migrationRouteBound = migrationRoutes.some((r) => r.intelligenceHref === KELLY_STRATEGIC_PLAN_HUB_HREF);

  const chapterScore = atBar >= MIN_AT_BAR ? 100 : Math.round((atBar / MIN_AT_BAR) * 100);
  const countScore = total >= MIN_CHAPTERS ? 100 : Math.round((total / MIN_CHAPTERS) * 100);
  const wireScore =
    fieldBookArticleReady && canonBindingReady && migrationRouteBound ? 100 : 50;

  const overallPct = Math.min(100, Math.round((chapterScore + countScore + wireScore) / 3));

  return {
    chapterTotal: total,
    chaptersAtBar: atBar,
    fieldBookArticleReady,
    canonBindingReady,
    migrationRouteBound,
    strategyMigrationRoutes: migrationRoutes.length,
    overallPct,
  };
}

export type Phase11P1UpgradePassReport = {
  passId: "phase-11-p1-kelly-strategic-plan";
  title: "Step 11 P1 — Kelly SOS strategic plan command";
  summary: string;
  completionPct: number;
  hubHref: string;
  progress: Phase11KellyStrategicPlanProgress;
};

export function computePhase11P1UpgradePass(): Phase11P1UpgradePassReport {
  const progress = computePhase11KellyStrategicPlanProgress();
  return {
    passId: "phase-11-p1-kelly-strategic-plan",
    title: "Step 11 P1 — Kelly SOS strategic plan command",
    summary:
      "22-chapter Kelly SOS strategic plan surfaced in intelligence tree with Phase 11 P1 depth overlays — debate application, operator steps, and philosophy crosswalk on every chapter.",
    completionPct: progress.overallPct,
    hubHref: KELLY_STRATEGIC_PLAN_HUB_HREF,
    progress,
  };
}

export function assertPhase11KellyStrategicPlanBar(): { ok: boolean; message: string } {
  const p = computePhase11KellyStrategicPlanProgress();
  if (p.chapterTotal < MIN_CHAPTERS) {
    return { ok: false, message: `Chapters ${p.chapterTotal}/${MIN_CHAPTERS}` };
  }
  if (p.chaptersAtBar < MIN_AT_BAR) {
    return { ok: false, message: `Chapters at bar ${p.chaptersAtBar}/${MIN_AT_BAR}` };
  }
  if (!p.fieldBookArticleReady) {
    return { ok: false, message: "Missing Field Book kelly-strategic-plan-command" };
  }
  if (!p.canonBindingReady) {
    return { ok: false, message: "Missing canon binding on kelly-strategic-plan hub" };
  }
  if (!p.migrationRouteBound) {
    return { ok: false, message: "Missing migration bridge route" };
  }
  return { ok: true, message: `Phase 11 P1 Kelly strategic plan ${p.overallPct}% at bar` };
}

export type KellyStrategicPlanChapterSurface = {
  pathKey: string;
  title: string;
  file: string;
  section: string;
  href: string;
  phase11P1Enriched: boolean;
};

export function listKellyStrategicPlanChapterSurfaces(): KellyStrategicPlanChapterSurface[] {
  return STRATEGY_MD_ENTRIES.map((e) => {
    const overlay = getKellyStrategicPlanChapterOverlay(e.path);
    return {
      pathKey: e.path,
      title: e.label,
      file: e.file,
      section: e.section,
      href: kellyStrategicPlanDocHref(e.path),
      phase11P1Enriched: kellyChapterMeetsPhase11P1Bar(overlay),
    };
  });
}

export { PHASE11_P1_KELLY_CHAPTER_TOTAL, KELLY_STRATEGIC_PLAN_HUB_HREF };
