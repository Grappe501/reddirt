import { buildComplianceBrainSnapshot, buildComplianceRiskReport } from "../../src/lib/compliance/ai/brain/build-compliance-brain";
import { validateComplianceRisks } from "../../src/lib/compliance/ai/brain/validate-compliance-brain";

async function main() {
  const snapshot = await buildComplianceBrainSnapshot();
  const risks = buildComplianceRiskReport(snapshot);
  validateComplianceRisks(risks);
  console.log(JSON.stringify({ generatedAt: snapshot.generatedAt, risks }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
