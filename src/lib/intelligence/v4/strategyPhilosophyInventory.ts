/**
 * Phase 10 — Complete inventory of strategy & political philosophy surfaces.
 */
import { STRATEGY_MD_ENTRIES } from "@/lib/campaign-strategy/md-manifest";
import { DEBATE_PHILOSOPHY_BRIEFINGS } from "@/lib/intelligence/v4/debatePhilosophyBriefings";
import { getAllDebatePsychologyManualSectionIds } from "@/lib/intelligence/v4/debatePsychologyTrainingManual";
import { loadCampaignPhilosophyGraph } from "@/lib/intelligence/campaignIntelligenceGraph";
import { listStrategyMigrationRoutes } from "@/lib/intelligence/v4/strategyMigrationBridge";
import { MOVEMENT_PHILOSOPHY_ENTRIES, MOVEMENT_PHILOSOPHY_HUB_HREF, movementPhilosophyDocHref } from "@/lib/philosophy/movement-philosophy-nav";
import { listStaffStrategySurfaces, STAFF_STRATEGY_COMMAND_HUB_HREF } from "@/lib/intelligence/v4/staffStrategyCommandInventory";
import {
  STRATEGY_DOCTRINE_HUB_HREF,
  STRATEGY_DOCTRINE_JSON_ENTRIES,
  strategyDoctrineDocHref,
} from "@/lib/strategy-doctrine/strategy-doctrine-nav";
import { PHILOSOPHY_GRAPH_CLAIMS_HUB_HREF } from "@/lib/intelligence/v4/phase11P4PhilosophyGraphClaimsDepth";

export type StrategyPhilosophySurfaceKind =
  | "philosophy-briefing"
  | "psychology-manual"
  | "philosophy-graph"
  | "kelly-manual"
  | "intelligence-strategy"
  | "opposition-strategy"
  | "campaign-system"
  | "movement-philosophy"
  | "staff-strategy"
  | "strategy-doctrine";

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
  href: `/admin/intelligence/philosophy-graph-claims-review/${n.philosophyId}`,
  intelligenceHref: "/admin/intelligence/philosophy-graph-claims-review",
  phase10Enriched: true,
}));

const KELLY_MANUAL_SURFACES: StrategyPhilosophySurface[] = STRATEGY_MD_ENTRIES.map((e) => ({
  id: `kelly-manual-${e.path || "overview"}`,
  kind: "kelly-manual",
  title: e.label,
  summary: `Kelly SOS strategic plan manual — ${e.file}`,
  href: `/admin/intelligence/kelly-strategic-plan${e.path ? `/${e.path}` : ""}`,
  manualPathKey: e.path || "overview",
  intelligenceHref: "/admin/intelligence/kelly-strategic-plan",
  phase10Enriched: true,
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
    title: "Campaign strategy reader (legacy)",
    summary: "Legacy admin reader + Strategy Partner RAG — intelligence reader at kelly-strategic-plan.",
    href: "/admin/campaign-strategy",
    intelligenceHref: "/admin/intelligence/kelly-strategic-plan",
    phase10Enriched: true,
  },
  {
    id: "campaign-system-manual",
    kind: "campaign-system",
    title: "Campaign system manual (252 files)",
    summary: "Operational corpus — intelligence reader, category inventory, priority tome guides at Phase 11 P0 bar.",
    href: "/admin/intelligence/campaign-system-manual",
    intelligenceHref: "/admin/intelligence/phase-11-upgrade",
    phase10Enriched: true,
  },
];

const MOVEMENT_PHILOSOPHY_SURFACES: StrategyPhilosophySurface[] = MOVEMENT_PHILOSOPHY_ENTRIES.map((e) => ({
  id: `movement-philosophy-${e.pathKey}`,
  kind: "movement-philosophy",
  title: e.label,
  summary: e.summary,
  href: movementPhilosophyDocHref(e.pathKey),
  intelligenceHref: MOVEMENT_PHILOSOPHY_HUB_HREF,
  phase10Enriched: true,
}));

const STAFF_STRATEGY_SURFACES: StrategyPhilosophySurface[] = listStaffStrategySurfaces().map((s) => ({
  id: `staff-strategy-${s.id}`,
  kind: "staff-strategy",
  title: s.title,
  summary: s.summary,
  href: s.href,
  intelligenceHref: STAFF_STRATEGY_COMMAND_HUB_HREF,
  phase10Enriched: true,
}));

const STRATEGY_DOCTRINE_SURFACES: StrategyPhilosophySurface[] = STRATEGY_DOCTRINE_JSON_ENTRIES.map((e) => ({
  id: `strategy-doctrine-${e.pathKey}`,
  kind: "strategy-doctrine",
  title: e.label,
  summary: e.summary,
  href: strategyDoctrineDocHref(e.pathKey),
  intelligenceHref: STRATEGY_DOCTRINE_HUB_HREF,
  phase10Enriched: true,
}));

export function listAllStrategyPhilosophySurfaces(): StrategyPhilosophySurface[] {
  return [
    ...PHILOSOPHY_BRIEFING_SURFACES,
    ...PSYCHOLOGY_SURFACES,
    ...GRAPH_SURFACES,
    ...KELLY_MANUAL_SURFACES,
    ...INTELLIGENCE_STRATEGY_SURFACES,
    ...MOVEMENT_PHILOSOPHY_SURFACES,
    ...STAFF_STRATEGY_SURFACES,
    ...STRATEGY_DOCTRINE_SURFACES,
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
    "/admin/intelligence/morning-brief",
    "/admin/intelligence/briefing-papers",
    "/admin/intelligence/writing-toolbox",
    MOVEMENT_PHILOSOPHY_HUB_HREF,
    STAFF_STRATEGY_COMMAND_HUB_HREF,
    STRATEGY_DOCTRINE_HUB_HREF,
    PHILOSOPHY_GRAPH_CLAIMS_HUB_HREF,
    STRATEGY_PHILOSOPHY_HUB_HREF,
  ];
  const boundSet = new Set(listStrategyMigrationRoutes().map((r) => r.intelligenceHref));
  const unbound = keyHrefs.filter((h) => !boundSet.has(h));
  return { bound: boundSet.size, total: listStrategyMigrationRoutes().length, unboundHrefs: unbound };
}
