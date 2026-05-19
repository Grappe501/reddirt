import { buildComplianceBrainSnapshot } from "../../src/lib/compliance/ai/brain/build-compliance-brain";
import { validateComplianceLaunchReadiness } from "../../src/lib/compliance/ai/brain/validate-compliance-brain";

async function main() {
  const snapshot = await buildComplianceBrainSnapshot();
  validateComplianceLaunchReadiness(snapshot.launchReadiness);
  console.log(JSON.stringify(snapshot.launchReadiness, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
