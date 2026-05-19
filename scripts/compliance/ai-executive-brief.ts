import { writeOrchestratorArtifacts } from "../../src/lib/compliance/ai/orchestrator/write-orchestrator-artifacts";

async function main() {
  const out = await writeOrchestratorArtifacts();
  console.log(JSON.stringify({ status: "ok", path: out.executiveBriefPath }, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
