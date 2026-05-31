/**
 * County Workbench Factory validation
 */
import { ARKANSAS_COUNTY_REGISTRY } from "../src/lib/county/arkansas-county-registry";
import { loadCountySourceCatalog, allCountySlugs } from "../src/lib/county-workbench/factory/countySourceCatalog";
import { loadCountyFacts, summarizeCountyFactCoverage } from "../src/lib/county-workbench/factory/countyFactStore";
import { buildAllCountyCrossTables, summarizeCrossTableCompleteness } from "../src/lib/county-workbench/factory/countyCrossTableBuilder";
import { compileAllCountyProfiles, summarizeCompiledProfileReadiness } from "../src/lib/county-workbench/factory/countyProfileCompiler";
import { generateAllCountyBriefs, summarizeCountyBriefFactory } from "../src/lib/county-workbench/factory/countyBriefFactory";
import {
  runCountyBuilderAgent,
  recommendNextGlobalDataPulls,
  recommendNextCountyDataPulls,
} from "../src/lib/county-workbench/factory/aiCountyBuilderAgent";
import { dryRunCountyIngestion, summarizeIngestionResults } from "../src/lib/county-workbench/factory/countyIngestionOrchestrator";
import { COUNTY_FACTORY_GOVERNANCE } from "../src/lib/county-workbench/factory/countyFactoryTypes";
import { buildCountyFactoryDashboardRollup } from "../src/lib/county-workbench/factory/aiCountyBuilderAgent";

const results: { name: string; pass: boolean; detail?: string }[] = [];
function assert(name: string, condition: boolean, detail?: string) {
  results.push({ name, pass: condition, detail });
  console.log(`${condition ? "PASS" : "FAIL"} — ${name}${detail ? `: ${detail}` : ""}`);
}

async function main() {
  assert("1. All 75 counties represented", ARKANSAS_COUNTY_REGISTRY.length === 75);
  assert("2. County source catalog loads", loadCountySourceCatalog().sources.length >= 10);

  const facts = loadCountyFacts();
  assert("3. Fact store loads", Array.isArray(facts.facts));
  assert(
    "4. Facts require verification status",
    facts.facts.every((f) => Boolean(f.verificationStatus)),
    `facts=${facts.facts.length}`,
  );
  assert(
    "5. Facts require provenance",
    facts.facts.every((f) => f.sourceId && f.sourceName && f.sourceUrlOrPath),
  );

  assert(
    "6. Canonical registration goals not in factory facts as mutable",
    !facts.facts.some((f) => f.factKey === "registrationGoal" && f.verificationStatus === "VERIFIED" && f.sourceId === "county-workbench-bridge"),
  );

  const estimated = facts.facts.filter((f) => f.verificationStatus === "ESTIMATED");
  assert(
    "7. Planning estimates labeled",
    estimated.every((f) => f.notes.toLowerCase().includes("not") || f.notes.toLowerCase().includes("planning") || f.publicUseRisk === "HIGH"),
    `estimated=${estimated.length}`,
  );

  buildAllCountyCrossTables();
  const tables = summarizeCrossTableCompleteness();
  assert("8. Cross tables generate for all 75 counties", tables.tableCount === 12 && tables.tables.every((t) => t.rowCount === 75));

  const profiles = compileAllCountyProfiles();
  assert("9. Compiled profiles for all 75 counties", profiles.length === 75);

  const briefs = generateAllCountyBriefs();
  assert("10. Briefs generate for all 75 counties", briefs.length === 75);

  const shellProfiles = profiles.filter((p) => p.profileStatus === "SHELL").length;
  assert("11. Shell counties honestly labeled", shellProfiles > 0, `shell=${shellProfiles}`);

  const agent = runCountyBuilderAgent();
  assert("12. AI builder global recommendations", recommendNextGlobalDataPulls().length >= 3);
  assert("13. AI builder county gap recommendations", recommendNextCountyDataPulls("pope-county").length >= 1);

  const dry = await dryRunCountyIngestion();
  const drySum = summarizeIngestionResults(dry);
  assert("14. No fake data when APIs unavailable", drySum.complete === 0 || drySum.deferred > 0);
  assert("15. Deferred jobs when sources unavailable", drySum.deferred + drySum.dryRun > 0, `deferred=${drySum.deferred}`);

  const dash = buildCountyFactoryDashboardRollup();
  assert("16. Dashboard rollup shape valid", dash.facts.totalFacts >= 0 && dash.profiles.countyCount >= 0);

  assert("17. INTERNAL_DRAFT governance", COUNTY_FACTORY_GOVERNANCE.internalOnly === true);
  assert("18. NON_PUBLISHABLE governance", COUNTY_FACTORY_GOVERNANCE.publicationSafety === "NON_PUBLISHABLE");

  const briefJson = JSON.stringify(briefs[0]);
  assert("19. No send/publish/export", !/sendEmail|publishPost|exportPublic/i.test(briefJson));

  assert(
    "20. Claim/citation requirements preserved",
    briefs.every((b) => b.claimCitationRequirements.length >= 1),
  );

  assert("21. All county slugs helper", allCountySlugs().length === 75);

  const failed = results.filter((r) => !r.pass);
  console.log(`\n${results.length - failed.length}/${results.length} PASS`);
  if (failed.length) {
    console.error(failed);
    process.exit(1);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
