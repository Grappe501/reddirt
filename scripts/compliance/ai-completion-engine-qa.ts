import { writeAllCompletionEngineArtifacts } from "../../src/lib/compliance/ai/completion-engine/write-completion-engine-artifacts";
import { assertCompletionEnginePackage } from "../../src/lib/compliance/ai/completion-engine/validate-completion-engine";

async function main() {
  await writeAllCompletionEngineArtifacts();
  await assertCompletionEnginePackage();
  console.log(JSON.stringify({ status: "ok", schemaValidated: true }, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
