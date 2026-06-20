/**
 * County operating center smoke test — sync loaders for all 75 snapshot counties.
 * Run: npm run agents:test-county-operating-center-page
 */
import { buildCountyWorkbenchV4OperationalView } from "../src/lib/election-plan/county-workbench/build-county-v4-operational";
import { buildCountyCalendarBinding } from "../src/lib/election-plan/location-calendar-binding";
import { fieldEventsForLocation } from "../src/lib/election-plan/location-calendar-integration";
import { loadElectionPlanSnapshotFromDisk } from "../src/lib/election-plan/election-plan-snapshot-disk";
import { getCountyBySlug } from "../src/lib/election-plan/load-county";
import { getCountyStrikeTeamBySlug } from "../src/lib/election-plan/load-county-strike-team";
import { loadCountyPlaybookMarkdown } from "../src/lib/election-plan/load-county-playbook-markdown";
import { getCountyVictoryTarget } from "../src/lib/election-plan/load-county-victory-targets";
import { getCountyPartyProfileBySlug } from "../src/lib/election-plan/load-county-party-intelligence";
import { getCountyAudienceOverlay } from "../src/lib/election-plan/voter-audience-models/load";
import {
  filterImmersionMissionForDisplay,
  getImmersionMissionForCounty,
} from "../src/lib/election-plan/load-immersion-county-missions";
import { getSpecialKpiGoalForCounty } from "../src/lib/election-plan/load-special-kpi-goals";
import { getCountyVoterFileRollup } from "../src/lib/election-plan/load-voter-file-location-rollups";
import { countyPlaybookHref } from "../src/lib/election-plan/location-links";

const SPOT_CHECK = ["faulkner", "saline", "sebastian", "pulaski", "st-francis", "hot-spring"];

function main() {
  const data = loadElectionPlanSnapshotFromDisk();
  if (data.counties.length < 75) {
    console.error(`FAIL — expected 75 counties, got ${data.counties.length}`);
    process.exit(1);
  }

  const failures: string[] = [];

  for (const county of data.counties) {
    try {
      getCountyVictoryTarget(county.county, county.tier);
      getCountyPartyProfileBySlug(county.slug);
      getCountyAudienceOverlay(county.slug);
      filterImmersionMissionForDisplay(getImmersionMissionForCounty(county.slug), { surface: "county" });
      getSpecialKpiGoalForCounty(county.slug);
      getCountyVoterFileRollup(county.slug);
      getCountyStrikeTeamBySlug(county.slug);
      buildCountyWorkbenchV4OperationalView(getCountyStrikeTeamBySlug(county.slug), {
        entries: [],
        rollups: [],
        totalQuantity: 0,
      });
      loadCountyPlaybookMarkdown(county.slug, county.playbookPath);
      buildCountyCalendarBinding(data, county.county);
      fieldEventsForLocation(data.executiveCalendar.entries, {
        countyName: county.county,
        referenceDate: data.executiveCalendar.referenceDate,
        limit: 8,
      });
      const href = countyPlaybookHref(county.county, county.slug);
      if (!href.startsWith(`/election-plan/counties/${county.slug}`)) {
        failures.push(`${county.slug}: bad href ${href}`);
      }
    } catch (e) {
      failures.push(`${county.slug}: ${e instanceof Error ? e.message : String(e)}`);
    }
  }

  for (const slug of SPOT_CHECK) {
    const county = getCountyBySlug(data, slug);
    if (!county) {
      failures.push(`spot-check missing slug: ${slug}`);
      continue;
    }
    const md = loadCountyPlaybookMarkdown(county.slug, county.playbookPath);
    if (!md?.trim()) failures.push(`spot-check missing playbook markdown: ${slug}`);
  }

  console.log("County operating center sync smoke test");
  console.log(`  counties: ${data.counties.length}`);
  console.log(`  failures: ${failures.length}`);

  if (failures.length) {
    for (const f of failures.slice(0, 20)) console.error(`  FAIL: ${f}`);
    process.exit(1);
  }

  console.log("OK — all county sync loaders pass");
}

main();
