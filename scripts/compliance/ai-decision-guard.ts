import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { buildOrchestratorPackage } from "../../src/lib/compliance/ai/orchestrator/build-orchestrator";

async function main() {
  const pkg = await buildOrchestratorPackage();
  const outPath = path.join(process.cwd(), "data", "compliance", "ai", "decision-guard.json");
  await mkdir(path.dirname(outPath), { recursive: true });
  await writeFile(outPath, `${JSON.stringify(pkg.decisionGuard, null, 2)}\n`, "utf8");
  console.log(JSON.stringify({ status: "ok", path: outPath, allGuardsPassed: pkg.decisionGuard.allGuardsPassed }, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
