import { runTripResolutionAutopilot } from "../../src/lib/travel-ledger/ai/trip-resolution-autopilot/run-trip-resolution-autopilot";
import { saveTripResolutionAutopilotArtifacts } from "../../src/lib/travel-ledger/ai/trip-resolution-autopilot/save-autopilot-artifacts";

async function main() {
  const summary = await runTripResolutionAutopilot();
  await saveTripResolutionAutopilotArtifacts(summary);
  console.log("TRIP-RESOLUTION-AUTOPILOT — OK");
  console.log(`  title city matches: ${summary.titleCityMatches}`);
  console.log(`  title purpose matches: ${summary.titlePurposeMatches}`);
  console.log(`  needs city before/after: ${summary.before.needsCity} -> ${summary.after.needsCity}`);
  console.log(`  mileage calculated before/after: ${summary.before.mileageCalculated} -> ${summary.after.mileageCalculated}`);
  console.log(`  ready to approve before/after: ${summary.before.readyToApprove} -> ${summary.after.readyToApprove}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

