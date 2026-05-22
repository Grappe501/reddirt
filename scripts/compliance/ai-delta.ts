import { buildOrchestratorPackage } from "../../src/lib/compliance/ai/orchestrator/build-orchestrator";
import { writeAiDelta } from "../../src/lib/compliance/ai/orchestrator/build-ai-delta";

async function main() {
  const pkg = await buildOrchestratorPackage();
  const path = await writeAiDelta(pkg.delta);
  console.log(JSON.stringify({ status: "ok", path, ...pkg.delta }, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
