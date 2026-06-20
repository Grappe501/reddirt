/**
 * Validates all 100 priority city location briefs have narrative, intelligence, and model-voter overlays.
 * Usage: npm run agents:test-city-location-briefs
 */
import { getCityIntelligenceProfile } from "../src/lib/election-plan/load-city-intelligence-profile";
import { getCityLocationBrief } from "../src/lib/election-plan/load-city-location-brief";
import { getCountyByName, normalizeElectionPlanCountySlug } from "../src/lib/election-plan/load-county";
import { loadElectionPlanSnapshotFromDisk } from "../src/lib/election-plan/election-plan-snapshot-disk";
import { getCityAudienceOverlay } from "../src/lib/election-plan/voter-audience-models/load";

const data = loadElectionPlanSnapshotFromDisk();
let ok = 0;
let fail = 0;

for (const city of data.cities) {
  const brief = getCityLocationBrief(city.slug, data.cities);
  const intel = getCityIntelligenceProfile(city.slug);
  const audience = getCityAudienceOverlay(city.slug);
  const county = getCountyByName(data, city.county);
  const countySlugOk = county?.slug === normalizeElectionPlanCountySlug(county?.slug ?? "");

  const issues: string[] = [];
  if (!brief) issues.push("missing brief");
  if (!intel) issues.push("missing intelligence");
  if (!audience) issues.push("missing audience overlay");
  if (!county) issues.push(`county not found: ${city.county}`);
  if (!countySlugOk && county) issues.push(`bad county slug: ${county.slug}`);
  if (audience && (!audience.profileEstimates || audience.profileEstimates.length === 0)) {
    issues.push("missing profileEstimates — run voter-audience-models:build");
  }

  if (issues.length > 0) {
    console.log("FAIL", city.slug, issues.join("; "));
    fail++;
  } else {
    ok++;
  }
}

console.log(`city location briefs: ${ok} ok, ${fail} fail / ${data.cities.length} cities`);
if (fail > 0) process.exit(1);
