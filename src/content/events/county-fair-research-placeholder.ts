import { ARKANSAS_COUNTY_REGISTRY } from "@/lib/county/arkansas-county-registry";

/**
 * Placeholder rows for the 75-county fair research tracker.
 * TODO: Replace with verified 2026 fair names, cities, dates, and source URLs after research — do not invent dates in production data.
 * TODO: Join to schedule/visit status from admin or CMS when county fair pipeline is built.
 */
export type CountyFairResearchStatus =
  | "Research needed"
  | "Confirmed"
  | "Requested"
  | "Scheduled"
  | "Visited";

export type CountyFairResearchRow = {
  county: string;
  countySlug: string;
  fairName: string;
  dates2026: string;
  city: string;
  sourceUrl: string | null;
  status: CountyFairResearchStatus;
};

export const COUNTY_FAIR_RESEARCH_PLACEHOLDER_ROWS: readonly CountyFairResearchRow[] = ARKANSAS_COUNTY_REGISTRY.map((c) => ({
  county: c.displayName,
  countySlug: c.slug,
  fairName: "—",
  dates2026: "—",
  city: "—",
  sourceUrl: null,
  status: "Research needed",
}));
