/**
 * Phase 5 — Debate glossary + hub connectivity + Field Book B/C depth pass.
 */
import { FIELD_BOOK_CANON_BINDINGS, resolveCanonBinding } from "@/lib/intelligence/fieldBookCanonRegistry";
import { FIELD_BOOK_ARTICLES, type FieldBookPhaseId } from "@/lib/intelligence/fieldBookRegistry";
import {
  DEBATE_GLOSSARY_TERMS,
  FIELD_BOOK_GLOSSARY_HREF,
  type DebateGlossaryTerm,
} from "@/lib/intelligence/v4/debateGlossaryRegistry";
import {
  listStrategyMigrationRoutes,
  validateStrategyMigrationBridge,
} from "@/lib/intelligence/v4/strategyMigrationBridge";

const MIN_GLOSSARY_TERMS = 35;
const MIN_DEFINITION_CHARS = 40;
const MIN_PHASE_BC_PARAGRAPHS = 6;
const MIN_WORDS_PER_PARAGRAPH = 18;

/** Intelligence hubs that Phase 5 binds to Field Book canon. */
export const PHASE5_HUB_ROUTES = [
  "/admin/intelligence/kelly-debate-coaching",
  "/admin/intelligence/opposition-strategy",
  "/admin/intelligence/debate-depth",
  "/admin/intelligence/action-queue",
  "/admin/intelligence/agent-tooling",
  "/admin/intelligence/ai-tools",
  "/admin/intelligence/command-center",
  "/admin/intelligence/kelly-mirror",
  "/admin/intelligence/election-equipment-vvsg",
  "/admin/intelligence/debate-prep/psychology-manual",
  "/admin/intelligence/phase-5-upgrade",
] as const;

const PHASE5_FIELD_BOOK_PHASES: FieldBookPhaseId[] = ["phase-b", "phase-c"];

function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function articleMeetsPhase5Bar(body: string[]): boolean {
  const rich = body.filter((p) => wordCount(p) >= MIN_WORDS_PER_PARAGRAPH);
  return rich.length >= MIN_PHASE_BC_PARAGRAPHS;
}

function termMeetsBar(term: DebateGlossaryTerm): boolean {
  return term.definition.length >= MIN_DEFINITION_CHARS && term.label.length >= 3;
}

export type Phase5GlossaryConnectivityProgress = {
  glossaryTermCount: number;
  glossaryTermsAtBar: number;
  phaseBcArticleTotal: number;
  phaseBcArticlesAtBar: number;
  hubRoutesBound: number;
  hubRoutesTotal: number;
  strategyRouteCount: number;
  canonBindingCount: number;
  overallPct: number;
};

export function computePhase5GlossaryConnectivityProgress(): Phase5GlossaryConnectivityProgress {
  const glossaryTermsAtBar = DEBATE_GLOSSARY_TERMS.filter(termMeetsBar).length;
  const phaseBcArticles = FIELD_BOOK_ARTICLES.filter((a) => PHASE5_FIELD_BOOK_PHASES.includes(a.phaseId));
  const phaseBcAtBar = phaseBcArticles.filter((a) => articleMeetsPhase5Bar(a.body)).length;

  let hubRoutesBound = 0;
  for (const href of PHASE5_HUB_ROUTES) {
    if (resolveCanonBinding(href)) hubRoutesBound++;
  }

  const glossaryPct = Math.round((glossaryTermsAtBar / MIN_GLOSSARY_TERMS) * 100);
  const phaseBcPct = Math.round((phaseBcAtBar / Math.max(1, phaseBcArticles.length)) * 100);
  const hubPct = Math.round((hubRoutesBound / PHASE5_HUB_ROUTES.length) * 100);
  const strategyPct = listStrategyMigrationRoutes().length >= 26 ? 100 : Math.round((listStrategyMigrationRoutes().length / 26) * 100);

  const overallPct = Math.min(100, Math.round((glossaryPct + phaseBcPct + hubPct + strategyPct) / 4));

  return {
    glossaryTermCount: DEBATE_GLOSSARY_TERMS.length,
    glossaryTermsAtBar,
    phaseBcArticleTotal: phaseBcArticles.length,
    phaseBcArticlesAtBar: phaseBcAtBar,
    hubRoutesBound,
    hubRoutesTotal: PHASE5_HUB_ROUTES.length,
    strategyRouteCount: listStrategyMigrationRoutes().length,
    canonBindingCount: FIELD_BOOK_CANON_BINDINGS.length,
    overallPct,
  };
}

export type Phase5UpgradePassReport = {
  passId: "phase-5-glossary-connectivity";
  title: "Step 5 — Phase 5: Debate glossary + hub connectivity";
  summary: string;
  completionPct: number;
  glossaryHubHref: string;
  progress: Phase5GlossaryConnectivityProgress;
};

export function computePhase5UpgradePass(): Phase5UpgradePassReport {
  const progress = computePhase5GlossaryConnectivityProgress();
  return {
    passId: "phase-5-glossary-connectivity",
    title: "Step 5 — Phase 5: Debate glossary + hub connectivity",
    summary:
      "Debate term registry, Field Book Phase B/C depth expansion, and canon bindings for every remaining intelligence hub — plain language on first use.",
    completionPct: progress.overallPct,
    glossaryHubHref: FIELD_BOOK_GLOSSARY_HREF,
    progress,
  };
}

export function assertPhase5GlossaryConnectivityBar(): { ok: boolean; message: string } {
  const validation = validateStrategyMigrationBridge();
  if (!validation.ok) {
    return { ok: false, message: validation.errors[0] ?? "Strategy migration bridge invalid" };
  }

  const p = computePhase5GlossaryConnectivityProgress();

  if (p.glossaryTermsAtBar < MIN_GLOSSARY_TERMS) {
    return { ok: false, message: `Glossary terms ${p.glossaryTermsAtBar} (need ${MIN_GLOSSARY_TERMS}+)` };
  }
  if (p.phaseBcArticlesAtBar < p.phaseBcArticleTotal) {
    return {
      ok: false,
      message: `Phase B/C articles ${p.phaseBcArticlesAtBar}/${p.phaseBcArticleTotal} at briefing bar`,
    };
  }
  if (p.hubRoutesBound < p.hubRoutesTotal) {
    return { ok: false, message: `Hub bindings ${p.hubRoutesBound}/${p.hubRoutesTotal}` };
  }
  if (p.strategyRouteCount < 26) {
    return { ok: false, message: `Strategy routes ${p.strategyRouteCount} (need 26+)` };
  }
  if (!FIELD_BOOK_ARTICLES.some((a) => a.slug === "debate-glossary")) {
    return { ok: false, message: "Missing debate-glossary Field Book hub article" };
  }

  return { ok: true, message: `Phase 5 glossary connectivity ${p.overallPct}% — glossary + hubs + B/C depth at bar` };
}
