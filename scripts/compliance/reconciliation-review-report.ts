import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { buildReconciliationReviewBoard } from "../../src/lib/compliance/reconciliation/build-reconciliation-review-board";
import { buildReconciliationProgress } from "../../src/lib/compliance/reconciliation/build-reconciliation-progress";

async function main() {
  const [board, progress] = await Promise.all([buildReconciliationReviewBoard(), buildReconciliationProgress()]);
  const report = {
    generatedAt: new Date().toISOString(),
    progress,
    ambiguousGroups: board.ambiguousGroups.length,
    unmatchedBank: board.unmatchedBank.length,
    highConfidence: board.highConfidence.length,
    operatorSummary: board.operatorSummary,
  };
  const outDir = path.join(process.cwd(), "data", "compliance", "ai");
  await mkdir(outDir, { recursive: true });
  const outPath = path.join(outDir, "reconciliation-review-report.json");
  await writeFile(outPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  console.log(JSON.stringify({ status: "ok", path: outPath, ...report }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
