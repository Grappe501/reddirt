/** Canonical in-page nav for `/election-plan/counties/{slug}` — County Intelligence drilldown. */

export type CountyIntelligenceNavSection = { id: string; label: string };

const CORE_SECTIONS: CountyIntelligenceNavSection[] = [
  { id: "overview", label: "Overview" },
  { id: "playbook", label: "Playbook" },
  { id: "strategy", label: "Strategy" },
  { id: "cities", label: "Cities" },
  { id: "field", label: "Field" },
  { id: "fundraising", label: "Fundraising" },
  { id: "leadership", label: "Leadership" },
  { id: "relationships", label: "Contacts" },
  { id: "events", label: "Events" },
];

const DB_INTEL_SECTIONS: CountyIntelligenceNavSection[] = [
  { id: "elections", label: "Elections" },
  { id: "demographics", label: "Demographics" },
  { id: "economy", label: "Economy" },
  { id: "officials", label: "Officials" },
  { id: "history", label: "History" },
];

export function getCountyIntelligenceNavSections(opts?: {
  hasDbIntel?: boolean;
  hasVault?: boolean;
}): CountyIntelligenceNavSection[] {
  const sections = [...CORE_SECTIONS];
  if (opts?.hasDbIntel) sections.push(...DB_INTEL_SECTIONS);
  if (opts?.hasVault) sections.push({ id: "county-media-vault", label: "Media vault" });
  sections.push({ id: "gaps", label: "Gaps" });
  return sections;
}

/** @deprecated Use getCountyIntelligenceNavSections — full list when DB intel loaded. */
export const COUNTY_INTELLIGENCE_NAV_SECTIONS: CountyIntelligenceNavSection[] = getCountyIntelligenceNavSections({
  hasDbIntel: true,
  hasVault: true,
});

export function countyIntelligenceHref(countySlug: string): string {
  return `/election-plan/counties/${countySlug.replace(/-county$/, "")}`;
}
