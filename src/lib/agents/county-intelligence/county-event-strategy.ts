import { slugifyCounty } from "@/lib/campaign-events/media/media-path-builder";
import { buildCountyIntelligenceSummary } from "./county-intelligence-engine";
import type { CountyIntelligenceSummary } from "./county-kpi-types";

export function countySlugFromEventCounty(countyName?: string | null): string {
  return slugifyCounty(countyName);
}

export function loadEventCountyContext(countyName?: string | null): CountyIntelligenceSummary | null {
  const slug = countySlugFromEventCounty(countyName);
  if (slug === "unknown-county") return null;
  return buildCountyIntelligenceSummary(slug);
}
