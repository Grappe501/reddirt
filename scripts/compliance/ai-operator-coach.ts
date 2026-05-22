import { buildComplianceBrainSnapshot } from "../../src/lib/compliance/ai/brain/build-compliance-brain";
import { buildOperatorCoach } from "../../src/lib/compliance/ai/expert/build-coaches";
import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";

async function main() {
  const brain = await buildComplianceBrainSnapshot();
  const coach = buildOperatorCoach(brain);
  const outDir = path.join(process.cwd(), "data", "compliance", "ai");
  await mkdir(outDir, { recursive: true });
  const outPath = path.join(outDir, "operator-coach.json");
  await writeFile(outPath, JSON.stringify(coach, null, 2), "utf8");
  console.log(JSON.stringify({ status: "ok", path: outPath, steps: coach.steps.length }, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
