import { STRATEGY_MD_ENTRIES, STRATEGY_NAV } from "./md-manifest";
import type { StrategyNavSection } from "./types";

export const KELLY_STRATEGIC_PLAN_HUB_HREF = "/admin/intelligence/kelly-strategic-plan";

/** Legacy admin reader — Strategy Partner panel lives here. */
export const KELLY_STRATEGIC_PLAN_LEGACY_HREF = "/admin/campaign-strategy";

export function kellyStrategicPlanDocHref(pathKey: string): string {
  const key = pathKey.replace(/^\/+|\/+$/g, "");
  return key ? `${KELLY_STRATEGIC_PLAN_HUB_HREF}/${key}` : KELLY_STRATEGIC_PLAN_HUB_HREF;
}

export function buildKellyStrategicPlanNav(): StrategyNavSection[] {
  return STRATEGY_NAV;
}

export function listKellyStrategicPlanPathKeys(): string[] {
  return STRATEGY_MD_ENTRIES.map((e) => e.path);
}

export function findKellyStrategicPlanEntry(pathKey: string) {
  const key = pathKey.replace(/^\/+|\/+$/g, "");
  return STRATEGY_MD_ENTRIES.find((e) => e.path === key);
}
