/**
 * Phase 4M checks.
 */
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadRedDirtEnv } from "./load-red-dirt-env";
import { buildCountyAgentRuntimePayload } from "../src/lib/agents/county-intelligence/countyAgentRuntimePayloadBuilder";
import { runCampaignManagerAnalysisAgent } from "../src/lib/agents/county-intelligence/campaignManagerAnalysisAgent";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
loadRedDirtEnv(path.join(__dirname, ".."));

async function main() {
  const runtime = await buildCountyAgentRuntimePayload();
  const analysis = runCampaignManagerAnalysisAgent(runtime);

  const hasExpectedTools = analysis.tools.length >= 8;
  const hasCountyBriefs = analysis.countyManagerBriefs.length === 75;
  const noUnsafePermissions =
    analysis.safety.noRawVoterRowsExposed &&
    analysis.safety.noIndividualTargeting &&
    analysis.safety.noContactListGeneration &&
    analysis.safety.noAutomatedPersuasionCopy &&
    analysis.safety.noFinalStrategyWhenGateNo;

  const simulationsClearlyLabeled = analysis.countyManagerBriefs.every((b) =>
    b.scenarios.every((s) => s.clearlyScenario === true && s.note.toLowerCase().includes("scenario")),
  );

  const citationsPresent = analysis.countyManagerBriefs.every((b) => b.sourceArtifacts.length >= 3);
  const portfolioRanked = analysis.statewidePortfolioOptimizer.rankedOperationalUrgency.length > 0;

  console.log("Phase 4M campaign manager analysis checks");
  console.log("  tool count:", analysis.tools.length);
  console.log("  county briefs:", analysis.countyManagerBriefs.length);
  console.log("  no unsafe permissions:", noUnsafePermissions);
  console.log("  simulations labeled as scenarios:", simulationsClearlyLabeled);
  console.log("  recommendations cite sources:", citationsPresent);
  console.log("  portfolio ranking produced:", portfolioRanked);

  const ok =
    hasExpectedTools &&
    hasCountyBriefs &&
    noUnsafePermissions &&
    simulationsClearlyLabeled &&
    citationsPresent &&
    portfolioRanked;

  if (!ok) process.exit(1);
  console.log("OK — Phase 4M campaign manager analysis checks passed");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

