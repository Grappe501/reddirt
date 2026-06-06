/**
 * Phase 10 — Complete inventory of strategy & political philosophy surfaces.
 */
import { STRATEGY_MD_ENTRIES } from "@/lib/campaign-strategy/md-manifest";
import { DEBATE_PHILOSOPHY_BRIEFINGS } from "@/lib/intelligence/v4/debatePhilosophyBriefings";
import { getAllDebatePsychologyManualSectionIds } from "@/lib/intelligence/v4/debatePsychologyTrainingManual";
import { loadCampaignPhilosophyGraph } from "@/lib/intelligence/campaignIntelligenceGraph";
import { listStrategyMigrationRoutes } from "@/lib/intelligence/v4/strategyMigrationBridge";

export type StrategyPhilosophySurfaceKind =
  | "philosophy-briefing"
  | "psychology-manual"
  | "philosophy-graph"
  | "kelly-manual"
  | "intelligence-strategy"
  | "opposition-strategy"
  | "campaign-system";

export type StrategyPhilosophySurface = {
  id: string;
  kind: StrategyPhilosophySurfaceKind;
  title: string;
  summary: string;
  href: string;
  intelligenceHref?: string;
  manualPathKey?: string;
  phase10Enriched: boolean;
};

export const STRATEGY_PHILOSOPHY_HUB_HREF = "/admin/intelligence/strategy-philosophy-hub";

const PHILOSOPHY_BRIEFING_SURFACES: StrategyPhilosophySurface[] = DEBATE_PHILOSOPHY_BRIEFINGS.map((b) => ({
  id: `briefing-${b.briefingId}`,
  kind: "philosophy-briefing",
  title: b.title,
  summary: b.summary,
  href: `/admin/intelligence/debate-briefings/${b.briefingId}`,
  phase10Enriched: true,
}));

const PSYCHOLOGY_SURFACES: StrategyPhilosophySurface[] = getAllDebatePsychologyManualSectionIds().map((id) => ({
  id: `psych-${id}`,
  kind: "psychology-manual",
  title: id.replace(/-/g, " "),
  summary: "Debate psychology manual section — stage-safe psychology tied to philosophy briefings.",
  href: `/admin/intelligence/debate-prep/psychology-manual/${id}`,
  phase10Enriched: true,
}));

const GRAPH_SURFACES: StrategyPhilosophySurface[] = loadCampaignPhilosophyGraph().nodes.map((n) => ({
  id: n.philosophyId,
  kind: "philosophy-graph",
  title: n.title,
  summary: n.principle.slice(0, 160),
  href: `${STRATEGY_PHILOSOPHY_HUB_HREF}#${n.philosophyId}`,
  intelligenceHref: "/admin/intelligence/campaign-intelligence-graph",
  phase10Enriched: true,
}));

const KELLY_MANUAL_SURFACES: StrategyPhilosophySurface[] = STRATEGY_MD_ENTRIES.map((e) => ({
  id: `kelly-manual-${e.path || "overview"}`,
  kind: "kelly-manual",
  title: e.label,
  summary: `Kelly SOS strategic plan manual — ${e.file}`,
  href: `/admin/campaign-strategy${e.path ? `/${e.path}` : ""}`,
  manualPathKey: e.path || "overview",
  intelligenceHref: STRATEGY_PHILOSOPHY_HUB_HREF,
  phase10Enriched: e.path === "framework" || e.path === "executive-summary" || e.path === "build-audit",
}));

const INTELLIGENCE_STRATEGY_SURFACES: StrategyPhilosophySurface[] = [
  {
    id: "opposition-strategy",
    kind: "opposition-strategy",
    title: "Opposition strategy layer (v6.2)",
    summary: "Trap map, 2021/2025 packages, offensive moves, cross-exam sequence.",
    href: "/admin/intelligence/opposition-strategy",
    phase10Enriched: true,
  },
  {
    id: "strategy-alignment",
    kind: "intelligence-strategy",
    title: "Strategy alignment (SDI-1)",
    summary: "Doctrine ↔ narrative coherence dashboard.",
    href: "/admin/intelligence/strategy-alignment",
    phase10Enriched: true,
  },
  {
    id: "strategic-target-pathway",
    kind: "intelligence-strategy",
    title: "Strategic target pathway (NSI-7)",
    summary: "Victory math, registration goals, county briefings rollup.",
    href: "/admin/intelligence/strategic-target-pathway",
    phase10Enriched: true,
  },
  {
    id: "campaign-intelligence-graph",
    kind: "intelligence-strategy",
    title: "Campaign intelligence graph (NSI-4)",
    summary: "Unified entity resolution — bills, narratives, doctrines, philosophy nodes.",
    href: "/admin/intelligence/campaign-intelligence-graph",
    phase10Enriched: true,
  },
  {
    id: "scenario-simulation",
    kind: "intelligence-strategy",
    title: "Scenario simulation",
    summary: "Strategic scenario modeling for debate and field decisions.",
    href: "/admin/intelligence/scenario-simulation",
    phase10Enriched: true,
  },
  {
    id: "campaign-strategy-reader",
    kind: "kelly-manual",
    title: "Campaign strategy reader",
    summary: "Full Kelly SOS manual + Strategy Partner RAG.",
    href: "/admin/campaign-strategy",
    phase10Enriched: true,
  },
  {
    id: "campaign-system-manual",
    kind: "campaign-system",
    title: "Campaign system manual (chunked)",
    summary: "252 markdown files — agent chunking via /api/admin/campaign-strategy/chunks?manualDomain=campaign-system",
    href: "/admin/campaign-strategy",
    phase10Enriched: true,
  },
];

export function listAllStrategyPhilosophySurfaces(): StrategyPhilosophySurface[] {
  return [
    ...PHILOSOPHY_BRIEFING_SURFACES,
    ...PSYCHOLOGY_SURFACES,
    ...GRAPH_SURFACES,
    ...KELLY_MANUAL_SURFACES,
    ...INTELLIGENCE_STRATEGY_SURFACES,
  ];
}

export function countStrategyPhilosophySurfacesByKind(): Record<StrategyPhilosophySurfaceKind, number> {
  const all = listAllStrategyPhilosophySurfaces();
  const counts: Record<string, number> = {};
  for (const s of all) {
    counts[s.kind] = (counts[s.kind] ?? 0) + 1;
  }
  return counts as Record<StrategyPhilosophySurfaceKind, number>;
}

export function listStrategyMigrationCoverage(): {
  bound: number;
  total: number;
  unboundHrefs: string[];
} {
  const keyHrefs = [
    "/admin/intelligence/debate-briefings",
    "/admin/intelligence/strategic-target-pathway",
    "/admin/intelligence/campaign-intelligence-graph",
    "/admin/intelligence/scenario-simulation",
    STRATEGY_PHILOSOPHY_HUB_HREF,
  ];
  const boundSet = new Set(listStrategyMigrationRoutes().map((r) => r.intelligenceHref));
  const unbound = keyHrefs.filter((h) => !boundSet.has(h));
  return { bound: boundSet.size, total: listStrategyMigrationRoutes().length, unboundHrefs: unbound };
}
