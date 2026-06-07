/**
 * Phase 15 P4 — Top-tier surfacing closure.
 */
import { buildCandidateCommandHomeFeed } from "@/lib/intelligence/v4/candidateCommandHome";
import {
  countTopTierPrepItemsAtBar,
  getTopTierPrepOverlay,
  topTierPrepItemMeetsPhase15P4Bar,
  TOP_TIER_PREP_HUB_HREF,
} from "@/lib/intelligence/v4/phase15P4TopTierSurfacingDepth";
import {
  listTopTierPrepItems,
  listTopTierPrepTonight,
  PHASE15_P4_BRIEFING_TOTAL,
  PHASE15_P4_DEPTH_TOTAL,
  PHASE15_P4_PSYCH_TOTAL,
  PHASE15_P4_TOP_TIER_TONIGHT,
  topTierPrepItemsByKind,
  type TopTierPrepItem,
} from "@/lib/intelligence/v4/phase15P4TopTierSurfacing";
import { flattenCandidateCommandNavLinks, buildCandidateCommandNavSections } from "@/lib/intelligence/v4/candidateCommandNav";
import { getFieldBookArticle } from "@/lib/intelligence/fieldBookRegistry";
import { resolveCanonBinding } from "@/lib/intelligence/fieldBookCanonRegistry";
import { listStrategyMigrationRoutes } from "@/lib/intelligence/v4/strategyMigrationBridge";

const MIN_ITEMS_AT_BAR = 21;

export type Phase15P4Progress = {
  briefingTotal: number;
  depthTotal: number;
  psychTotal: number;
  itemsAtBar: number;
  itemTotal: number;
  tonightOnHome: number;
  hubInCandidateNav: boolean;
  commandHomeWired: boolean;
  fieldBookReady: boolean;
  canonReady: boolean;
  migrationRouteBound: boolean;
  overallPct: number;
};

export function computePhase15P4Progress(): Phase15P4Progress {
  const bar = countTopTierPrepItemsAtBar();
  const feed = buildCandidateCommandHomeFeed();
  const briefings = topTierPrepItemsByKind("briefing");
  const depth = topTierPrepItemsByKind("depth");
  const psych = topTierPrepItemsByKind("psychology");

  const candidateHrefs = new Set(
    flattenCandidateCommandNavLinks(buildCandidateCommandNavSections("CANDIDATE")).map((l) => l.href),
  );

  const hubInCandidateNav = candidateHrefs.has(TOP_TIER_PREP_HUB_HREF);
  const commandHomeWired = feed.topTierTonight.length >= PHASE15_P4_TOP_TIER_TONIGHT;
  const fieldBookReady = Boolean(getFieldBookArticle("top-tier-prep-command"));
  const canonReady = Boolean(resolveCanonBinding(TOP_TIER_PREP_HUB_HREF));
  const migrationRouteBound = listStrategyMigrationRoutes().some(
    (r) => r.intelligenceHref === TOP_TIER_PREP_HUB_HREF,
  );

  const inventoryScore =
    briefings.length >= PHASE15_P4_BRIEFING_TOTAL &&
    depth.length >= PHASE15_P4_DEPTH_TOTAL &&
    psych.length >= PHASE15_P4_PSYCH_TOTAL
      ? 100
      : 80;
  const barScore = bar.atBar >= MIN_ITEMS_AT_BAR ? 100 : Math.round((bar.atBar / MIN_ITEMS_AT_BAR) * 100);
  const wireChecks = [hubInCandidateNav, commandHomeWired, fieldBookReady, canonReady, migrationRouteBound];
  const wireScore = Math.round((wireChecks.filter(Boolean).length / wireChecks.length) * 100);

  const overallPct = Math.min(100, Math.round((inventoryScore + barScore + wireScore) / 3));

  return {
    briefingTotal: briefings.length,
    depthTotal: depth.length,
    psychTotal: psych.length,
    itemsAtBar: bar.atBar,
    itemTotal: bar.total,
    tonightOnHome: feed.topTierTonight.length,
    hubInCandidateNav,
    commandHomeWired,
    fieldBookReady,
    canonReady,
    migrationRouteBound,
    overallPct,
  };
}

export type Phase15P4UpgradePassReport = {
  passId: "phase-15-p4-top-tier-surfacing";
  title: "Step 15 P4 — Top-tier surfacing";
  summary: string;
  completionPct: number;
  hubHref: string;
  progress: Phase15P4Progress;
};

export function computePhase15P4UpgradePass(): Phase15P4UpgradePassReport {
  const progress = computePhase15P4Progress();
  return {
    passId: "phase-15-p4-top-tier-surfacing",
    title: "Step 15 P4 — Top-tier surfacing",
    summary:
      "Eight philosophy briefings, five depth guides, and eight psychology sections promoted to command home and a single top-tier hub — no longer buried under builder nav.",
    completionPct: progress.overallPct,
    hubHref: TOP_TIER_PREP_HUB_HREF,
    progress,
  };
}

export function listTopTierPrepSurfaces(): TopTierPrepItem[] {
  return listTopTierPrepItems();
}

export function assertPhase15P4Bar(): { ok: boolean; message: string } {
  const p = computePhase15P4Progress();
  const issues: string[] = [];
  if (p.briefingTotal < PHASE15_P4_BRIEFING_TOTAL) issues.push(`briefings ${p.briefingTotal}`);
  if (p.depthTotal < PHASE15_P4_DEPTH_TOTAL) issues.push(`depth ${p.depthTotal}`);
  if (p.psychTotal < PHASE15_P4_PSYCH_TOTAL) issues.push(`psych ${p.psychTotal}`);
  if (p.itemsAtBar < MIN_ITEMS_AT_BAR) issues.push(`items ${p.itemsAtBar}/${MIN_ITEMS_AT_BAR}`);
  if (!p.hubInCandidateNav) issues.push("hub nav");
  if (!p.commandHomeWired) issues.push("command home");
  if (!p.fieldBookReady) issues.push("field book");
  if (!p.canonReady) issues.push("canon");
  if (!p.migrationRouteBound) issues.push("migration");

  for (const item of listTopTierPrepItems()) {
    const o = getTopTierPrepOverlay(item.id);
    if (!o || !topTierPrepItemMeetsPhase15P4Bar(o)) issues.push(`overlay ${item.id}`);
  }

  if (listTopTierPrepTonight().length < PHASE15_P4_TOP_TIER_TONIGHT) {
    issues.push("tonight strip");
  }

  if (issues.length === 0) return { ok: true, message: "Phase 15 P4 bar met" };
  return { ok: false, message: issues.slice(0, 6).join("; ") };
}

export { TOP_TIER_PREP_HUB_HREF };
