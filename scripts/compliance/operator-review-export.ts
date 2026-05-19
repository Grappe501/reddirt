import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { APRIL_2026_QUEUE_ID } from "../../src/lib/compliance/approval/build-approval-queue";
import { buildRedactedOperatorReviewList } from "../../src/lib/compliance/approval/approval-burn-down";
import { getQueueItems } from "../../src/lib/compliance/approval/load-approval-queue";

async function main() {
  const items = await getQueueItems(APRIL_2026_QUEUE_ID);
  const redacted = buildRedactedOperatorReviewList(items);
  const outDir = path.join(process.cwd(), "reports", "compliance");
  await mkdir(outDir, { recursive: true });
  const outPath = path.join(outDir, "operator-review-list-redacted.json");
  await writeFile(outPath, JSON.stringify({ generatedAt: new Date().toISOString(), count: redacted.length, items: redacted }, null, 2), "utf8");
  console.log(JSON.stringify({ status: "ok", path: outPath, count: redacted.length, note: "No donor names — safe for planning" }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
