import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { buildRuleReviewWorkflow } from "../../src/lib/compliance/knowledge/build-rule-review-workflow";

async function main() {
  const workflow = await buildRuleReviewWorkflow();
  const report = {
    generatedAt: new Date().toISOString(),
    totalQueueItems: workflow.totalQueueItems,
    topicsPendingReview: workflow.topicsPendingReview,
    itemsReadyForWorkbench: workflow.itemsReadyForWorkbench,
    operatorSummary: workflow.operatorSummary,
    items: workflow.items.map((i) => ({
      topicId: i.topicId,
      topicLabel: i.topicLabel,
      queueItemId: i.queueItemId,
      queueStatus: i.queueStatus,
      topicReviewed: i.topicReviewed,
    })),
  };
  const outDir = path.join(process.cwd(), "data", "compliance", "ai");
  await mkdir(outDir, { recursive: true });
  const outPath = path.join(outDir, "rule-resolution-report.json");
  await writeFile(outPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  console.log(JSON.stringify({ status: "ok", path: outPath, ...report }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
