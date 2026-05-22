import { readFile } from "node:fs/promises";
import path from "node:path";
import { writeOrchestratorArtifacts } from "../../src/lib/compliance/ai/orchestrator/write-orchestrator-artifacts";
import { assertOrchestratorPackage } from "../../src/lib/compliance/ai/orchestrator/validate-orchestrator";

async function main() {
  const out = await writeOrchestratorArtifacts();
  const [orch, impact, guard, roles, delta] = await Promise.all([
    readFile(out.paths.orchestrator, "utf8"),
    readFile(out.paths.impactForecast, "utf8"),
    readFile(out.paths.decisionGuard, "utf8"),
    readFile(out.paths.rolePlans, "utf8"),
    readFile(path.join(process.cwd(), "data", "compliance", "ai", "delta.json"), "utf8"),
  ]);
  assertOrchestratorPackage({
    snapshot: JSON.parse(orch),
    impactForecast: JSON.parse(impact),
    decisionGuard: JSON.parse(guard),
    rolePlans: JSON.parse(roles),
    delta: JSON.parse(delta),
  });
  const brief = await readFile(out.briefPath, "utf8");
  if (!brief.includes("Unsafe shortcuts")) throw new Error("Orchestrator brief missing unsafe shortcuts");
  console.log(
    JSON.stringify(
      {
        status: "ok",
        schemaValidated: true,
        guardsPassed: out.decisionGuard.allGuardsPassed,
        nextBest: out.snapshot.nextBestAction.action.id,
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
