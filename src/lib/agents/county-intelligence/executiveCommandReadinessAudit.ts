import { ARKANSAS_COUNTY_REGISTRY } from "@/lib/county/arkansas-county-registry";
import { loadExecutiveCommandReadiness } from "./executiveCommandStateBuilder";

export function executiveCommandReadinessAudit() {
  const file = loadExecutiveCommandReadiness();
  const rowsBySlug = new Map(file.rows.map((row) => [row.countySlug, row]));
  const missing = ARKANSAS_COUNTY_REGISTRY.filter((county) => !rowsBySlug.has(county.slug)).map(
    (county) => county.slug,
  );
  return {
    rowCount: file.rows.length,
    expectedCount: ARKANSAS_COUNTY_REGISTRY.length,
    missing,
    blockedAutomationStatePresentEverywhere: file.rows.every((row) => row.blockedAutomationStatePresent),
  };
}

