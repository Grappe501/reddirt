import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { APRIL_2026_QUEUE_ID } from "../../src/lib/compliance/approval/build-approval-queue";
import { buildOperatorReviewRowsV2, summarizeBurnDownV2, BURN_DOWN_START_ORDER } from "../../src/lib/compliance/approval/approval-burn-down-v2";
import { getQueueItems } from "../../src/lib/compliance/approval/load-approval-queue";

async function main() {
  const items = await getQueueItems(APRIL_2026_QUEUE_ID);
  const rows = await buildOperatorReviewRowsV2(items, APRIL_2026_QUEUE_ID);
  const summary = summarizeBurnDownV2(rows);
  const startHere = BURN_DOWN_START_ORDER.map((key) => ({ category: key, count: summary[key] ?? 0 })).filter((s) => s.count > 0);
  const outDir = path.join(process.cwd(), "reports", "compliance");
  await mkdir(outDir, { recursive: true });
  const outPath = path.join(outDir, "operator-review-list-v2-redacted.json");
  await writeFile(
    outPath,
    JSON.stringify({ generatedAt: new Date().toISOString(), summary, startHere, rows }, null, 2),
    "utf8",
  );
  console.log(JSON.stringify({ status: "ok", path: outPath, open: rows.length, summary }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
