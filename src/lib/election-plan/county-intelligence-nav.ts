/** Canonical in-page nav for `/election-plan/counties/{slug}` — County Intelligence drilldown. */

export type CountyIntelligenceNavSection = { id: string; label: string };

export const COUNTY_INTELLIGENCE_NAV_SECTIONS: CountyIntelligenceNavSection[] = [
  { id: "overview", label: "Overview" },
  { id: "playbook", label: "Playbook" },
  { id: "strategy", label: "Strategy" },
  { id: "cities", label: "Cities" },
  { id: "field", label: "Field" },
  { id: "fundraising", label: "Fundraising" },
  { id: "leadership", label: "Leadership" },
  { id: "elections", label: "Elections" },
  { id: "demographics", label: "Demographics" },
  { id: "economy", label: "Economy" },
  { id: "officials", label: "Officials" },
  { id: "history", label: "History" },
  { id: "gaps", label: "Gaps" },
];

export function countyIntelligenceHref(countySlug: string): string {
  return `/election-plan/counties/${countySlug.replace(/-county$/, "")}`;
}
