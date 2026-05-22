import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { APRIL_2026_QUEUE_ID } from "../../src/lib/compliance/approval/build-approval-queue";
import { buildQueueBurndownReport } from "../../src/lib/compliance/approval/queue-burn-down-export";
import { getQueueItems } from "../../src/lib/compliance/approval/load-approval-queue";

async function main() {
  const items = await getQueueItems(APRIL_2026_QUEUE_ID);
  const report = await buildQueueBurndownReport(APRIL_2026_QUEUE_ID, items);
  const outDir = path.join(process.cwd(), "data", "compliance", "ai");
  await mkdir(outDir, { recursive: true });
  const outPath = path.join(outDir, "queue-burndown.json");
  await writeFile(outPath, JSON.stringify(report, null, 2), "utf8");
  console.log(
    JSON.stringify(
      {
        status: "ok",
        path: outPath,
        openCount: report.openCount,
        nextBestItemId: report.nextBestItemId,
        startHere: report.startHere,
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
