import { buildComplianceBrainSnapshot } from "../../src/lib/compliance/ai/brain/build-compliance-brain";
import { buildCompletionProgress } from "../../src/lib/compliance/ai/expert/build-completion-progress";
import { buildProgressMatrixMarkdown } from "../../src/lib/compliance/ai/expert/write-progress-matrix-doc";
import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";

async function main() {
  const brain = await buildComplianceBrainSnapshot();
  const progress = buildCompletionProgress(brain);
  const outDir = path.join(process.cwd(), "data", "compliance", "ai");
  await mkdir(outDir, { recursive: true });
  const outPath = path.join(outDir, "completion-progress.json");
  await writeFile(outPath, JSON.stringify(progress, null, 2), "utf8");
  const matrixPath = path.join(process.cwd(), "docs", "compliance", "COMPLIANCE_PROGRESS_MATRIX.md");
  await writeFile(matrixPath, buildProgressMatrixMarkdown(progress), "utf8");
  const lowest = [...progress.areas].sort((a, b) => a.percentComplete - b.percentComplete).slice(0, 5);
  console.log(
    JSON.stringify(
      {
        status: "ok",
        path: outPath,
        overallPercentComplete: progress.overallPercentComplete,
        lowestAreas: lowest.map((a) => ({ area: a.area, percent: a.percentComplete, status: a.status })),
        matrixPath,
      },
      null,
      2,
    ),
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
