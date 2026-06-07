/**
 * Phase 15 P4 — Top-tier surfacing depth overlays.
 */
import {
  listTopTierPrepItems,
  TOP_TIER_PREP_HUB_HREF,
  type TopTierPrepItem,
} from "@/lib/intelligence/v4/phase15P4TopTierSurfacing";

export { TOP_TIER_PREP_HUB_HREF };

export type TopTierPrepOverlay = {
  itemId: string;
  kind: TopTierPrepItem["kind"];
  promotionSteps: string[];
  commandHomeWired: boolean;
  kellyPrepWeekLinked: boolean;
};

function overlay(item: TopTierPrepItem, steps: string[]): TopTierPrepOverlay {
  return {
    itemId: item.id,
    kind: item.kind,
    promotionSteps: steps,
    commandHomeWired: item.rank <= 5,
    kellyPrepWeekLinked: item.kind === "briefing" || item.kind === "depth",
  };
}

export function getTopTierPrepOverlay(itemId: string): TopTierPrepOverlay | undefined {
  const item = listTopTierPrepItems().find((i) => i.id === itemId);
  if (!item) return undefined;
  return overlay(item, [
    "Listed on /admin/intelligence/top-tier-prep with tier badge and rehearse-out-loud line.",
    item.rank <= 5 ? "Surfaced on command home top-tier strip for candidate profile." : "Available in full hub inventory — not buried in builder nav.",
    "Philosophy nav points to top-tier hub before full briefing library index.",
  ]);
}

export function topTierPrepItemMeetsPhase15P4Bar(overlay: TopTierPrepOverlay): boolean {
  return overlay.promotionSteps.length >= 3 && overlay.promotionSteps.every((s) => s.trim().length >= 20);
}

export function countTopTierPrepItemsAtBar(): { atBar: number; total: number } {
  const items = listTopTierPrepItems();
  const atBar = items.filter((i) => {
    const o = getTopTierPrepOverlay(i.id);
    return o && topTierPrepItemMeetsPhase15P4Bar(o);
  }).length;
  return { atBar, total: items.length };
}
