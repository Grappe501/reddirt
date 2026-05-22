import { writeComplianceExpertArtifacts } from "../../src/lib/compliance/ai/expert/write-expert-artifacts";
import { validateComplianceExpertArtifacts } from "../../src/lib/compliance/ai/expert/validate-compliance-expert";

async function main() {
  await writeComplianceExpertArtifacts();
  const result = await validateComplianceExpertArtifacts();
  if (!result.ok) {
    console.error(JSON.stringify({ status: "fail", errors: result.errors }, null, 2));
    process.exit(1);
  }
  console.log(JSON.stringify({ status: "ok", schemaValidated: true }, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
