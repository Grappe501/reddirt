/**
 * Phase 4 — Field Book canon loop progress + upgrade pass report.
 */
import {
  computeCanonLoopStats,
  FIELD_BOOK_CANON_BINDINGS,
  FIELD_BOOK_CANON_HUB_HREF,
} from "@/lib/intelligence/fieldBookCanonRegistry";
import { FIELD_BOOK_ARTICLES, getFieldBookArticle } from "@/lib/intelligence/fieldBookRegistry";
import {
  listStrategyMigrationRoutes,
  strategyMigrationCoveragePct,
  validateStrategyMigrationBridge,
} from "@/lib/intelligence/v4/strategyMigrationBridge";

const MIN_PHASE_D_PARAGRAPHS = 6;
const MIN_WORDS_PER_PARAGRAPH = 18;
const MIN_CANON_BINDINGS = 18;

function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function articleMeetsPhase4Bar(body: string[]): boolean {
  const rich = body.filter((p) => wordCount(p) >= MIN_WORDS_PER_PARAGRAPH);
  return rich.length >= MIN_PHASE_D_PARAGRAPHS;
}

export type Phase4CanonLoopProgress = {
  bindingCount: number;
  bindingsAtBar: number;
  phaseDArticlesAtBar: number;
  phaseDArticleTotal: number;
  strategyRoutes: number;
  strategyCoveragePct: number;
  routesWithClaimsGate: number;
  overallPct: number;
};

export function computePhase4CanonLoopProgress(): Phase4CanonLoopProgress {
  const stats = computeCanonLoopStats();
  const phaseDArticles = FIELD_BOOK_ARTICLES.filter((a) => a.phaseId === "phase-d");
  const phaseDAtBar = phaseDArticles.filter((a) => articleMeetsPhase4Bar(a.body)).length;

  let bindingsAtBar = 0;
  for (const b of FIELD_BOOK_CANON_BINDINGS) {
    const allSlugsResolve = b.fieldBookSlugs.every((s) => Boolean(getFieldBookArticle(s)));
    const hasNote = b.promoteNote.length > 40;
    if (allSlugsResolve && hasNote) bindingsAtBar++;
  }

  const bindingPct = Math.round((bindingsAtBar / Math.max(1, FIELD_BOOK_CANON_BINDINGS.length)) * 100);
  const phaseDPct = Math.round((phaseDAtBar / Math.max(1, phaseDArticles.length)) * 100);
  const strategyPct = strategyMigrationCoveragePct();
  const claimsPct = Math.round((stats.routesWithClaimsGate / MIN_CANON_BINDINGS) * 100);

  const overallPct = Math.round((bindingPct + phaseDPct + strategyPct + Math.min(100, claimsPct)) / 4);

  return {
    bindingCount: stats.bindingCount,
    bindingsAtBar,
    phaseDArticlesAtBar: phaseDAtBar,
    phaseDArticleTotal: phaseDArticles.length,
    strategyRoutes: listStrategyMigrationRoutes().length,
    strategyCoveragePct: strategyPct,
    routesWithClaimsGate: stats.routesWithClaimsGate,
    overallPct,
  };
}

export type Phase4UpgradePassReport = {
  passId: "phase-4-field-book-canon-loop";
  title: "Step 4 — Phase 4: Field Book canon loop";
  summary: string;
  completionPct: number;
  canonHubHref: string;
  progress: Phase4CanonLoopProgress;
};

export function computePhase4UpgradePass(): Phase4UpgradePassReport {
  const progress = computePhase4CanonLoopProgress();
  return {
    passId: "phase-4-field-book-canon-loop",
    title: "Step 4 — Phase 4: Field Book canon loop",
    summary:
      "Route bindings connect intelligence pages to Field Book articles and claims gates; strategy manual chapters bridge promotion workflow.",
    completionPct: progress.overallPct,
    canonHubHref: FIELD_BOOK_CANON_HUB_HREF,
    progress,
  };
}

export function assertPhase4CanonLoopBar(): { ok: boolean; message: string } {
  const validation = validateStrategyMigrationBridge();
  if (!validation.ok) {
    return { ok: false, message: validation.errors[0] ?? "Strategy migration bridge invalid" };
  }

  const p = computePhase4CanonLoopProgress();
  if (p.bindingCount < MIN_CANON_BINDINGS) {
    return { ok: false, message: `Canon bindings ${p.bindingCount} (need ${MIN_CANON_BINDINGS}+)` };
  }
  if (p.bindingsAtBar < p.bindingCount) {
    return { ok: false, message: `Bindings at bar ${p.bindingsAtBar}/${p.bindingCount}` };
  }
  if (p.phaseDArticlesAtBar < p.phaseDArticleTotal) {
    return {
      ok: false,
      message: `Phase D articles ${p.phaseDArticlesAtBar}/${p.phaseDArticleTotal} at briefing bar`,
    };
  }
  if (p.strategyCoveragePct < 100) {
    return { ok: false, message: `Strategy migration ${p.strategyCoveragePct}%` };
  }
  return { ok: true, message: `Phase 4 canon loop ${p.overallPct}% — bindings + strategy migration at bar` };
}
