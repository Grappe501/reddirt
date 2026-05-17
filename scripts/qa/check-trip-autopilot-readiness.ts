import { runTripResolutionAutopilot } from "../../src/lib/travel-ledger/ai/trip-resolution-autopilot/run-trip-resolution-autopilot";

async function main() {
  const summary = await runTripResolutionAutopilot();
  if (summary.results.length === 0) {
    throw new Error("Trip autopilot returned no items.");
  }
  if (summary.titleCityMatches === 0) {
    throw new Error("Trip autopilot found zero title city matches.");
  }
  if (summary.after.needsCity > summary.before.needsCity) {
    throw new Error(`Trip autopilot increased needs-city count (${summary.before.needsCity} -> ${summary.after.needsCity}).`);
  }
  console.log("qa:autopilot-readiness OK");
  console.log(`  title city matches: ${summary.titleCityMatches}`);
  console.log(`  needs city before/after: ${summary.before.needsCity} -> ${summary.after.needsCity}`);
  console.log(`  ready to approve before/after: ${summary.before.readyToApprove} -> ${summary.after.readyToApprove}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

