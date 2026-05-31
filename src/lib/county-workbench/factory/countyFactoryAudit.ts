import { ARKANSAS_COUNTY_REGISTRY } from "@/lib/county/arkansas-county-registry";
import { composeCountyDashboardContext } from "@/lib/agents/county-intelligence/county-intelligence-engine";
import { summarizeCountyPublicBriefReadiness, generateAllCountyBriefBundles } from "@/lib/intelligence/briefs/countyPublicBriefGenerator";
import { summarizeCountyFactCoverage } from "./countyFactStore";
import { summarizeSourceCoverage } from "./countySourceCatalog";
import { buildRegistrySeedSummary } from "./countyIngestionOrchestrator";

export function runCountyFactoryAudit(repoRoot: string = process.cwd()) {
  const registry = ARKANSAS_COUNTY_REGISTRY.length;
  const statewide = composeCountyDashboardContext();
  const legacyBriefs = summarizeCountyPublicBriefReadiness(generateAllCountyBriefBundles());
  const facts = summarizeCountyFactCoverage(repoRoot);
  const sources = summarizeSourceCoverage(repoRoot);
  return {
    generatedAt: new Date().toISOString(),
    registryCount: registry,
    bridgeAvailable: statewide.bridgeAvailable,
    bridgeCountyCount: statewide.counties.length,
    legacyPublicBriefRollup: legacyBriefs,
    factoryFactCoverage: facts,
    sourceCatalog: sources,
    splitBrainWarnings: [
      "Planning vote target proxy ≠ CountyCampaignStats.registrationGoal",
      "Executive readiness matrix scores differ from workbench CSV completion",
      "KH overlay counties classified differently across brief systems",
    ],
  };
}

export { buildRegistrySeedSummary };
