import { buildComplianceBrainSnapshot } from "../../src/lib/compliance/ai/brain/build-compliance-brain";
import { buildReconciliationCoach } from "../../src/lib/compliance/ai/expert/build-coaches";
import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";

async function main() {
  const brain = await buildComplianceBrainSnapshot();
  const coach = buildReconciliationCoach(brain);
  const outPath = path.join(process.cwd(), "data", "compliance", "ai", "reconciliation-coach.json");
  await mkdir(path.dirname(outPath), { recursive: true });
  await writeFile(outPath, JSON.stringify(coach, null, 2), "utf8");
  console.log(JSON.stringify({ status: "ok", path: outPath }, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
