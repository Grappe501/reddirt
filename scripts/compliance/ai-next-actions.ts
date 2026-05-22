import { buildComplianceBrainSnapshot, buildComplianceNextActions } from "../../src/lib/compliance/ai/brain/build-compliance-brain";
import { validateComplianceNextActions } from "../../src/lib/compliance/ai/brain/validate-compliance-brain";

async function main() {
  const snapshot = await buildComplianceBrainSnapshot();
  const actions = buildComplianceNextActions(snapshot);
  validateComplianceNextActions(actions);
  console.log(JSON.stringify({ generatedAt: snapshot.generatedAt, actions }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
