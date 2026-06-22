/**
 * Sanity check GOP primary election analysis module.
 * Usage: node scripts/run-with-h-drive-env.cjs npx tsx scripts/test-gop-primary-election-analysis.ts
 */
import { buildGopSos2026PrimaryElectionAnalysis } from "../src/lib/election-plan/load-gop-sos-2026-primary-election-analysis";

const analysis = buildGopSos2026PrimaryElectionAnalysis();
if (!analysis) {
  console.error("FAIL: analysis bundle missing");
  process.exit(1);
}

const { statewide, coalitionMath, regions, flipCounties } = analysis;

if (statewide.primaryTotal !== 266439) {
  console.error("FAIL: unexpected primary total", statewide.primaryTotal);
  process.exit(1);
}

if (statewide.runoffMarginVotes !== 913) {
  console.error("FAIL: unexpected runoff margin", statewide.runoffMarginVotes);
  process.exit(1);
}

if (statewide.norrisRunoffCounties !== 38 || statewide.hammerRunoffCounties !== 37) {
  console.error("FAIL: county win split", statewide.norrisRunoffCounties, statewide.hammerRunoffCounties);
  process.exit(1);
}

if (regions.length < 8) {
  console.error("FAIL: expected 8 regions", regions.length);
  process.exit(1);
}

if (flipCounties.length < 10) {
  console.error("FAIL: expected flip counties", flipCounties.length);
  process.exit(1);
}

if (coalitionMath.highOpportunityCounties < 40) {
  console.error("FAIL: high opportunity count low", coalitionMath.highOpportunityCounties);
  process.exit(1);
}

console.log("OK: GOP primary election analysis");
console.log(analysis.kellyExecutiveOneLiner.slice(0, 120) + "…");
