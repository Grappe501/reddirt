import { buildApprovalQueues } from "../../src/lib/compliance/approval/build-approval-queue";
import { saveApprovalItems, saveApprovalQueues } from "../../src/lib/compliance/approval/approval-storage";

async function main() {
  const { queues, items } = await buildApprovalQueues();
  await saveApprovalQueues(queues);
  await saveApprovalItems(items);
  const bySource = items.reduce<Record<string, number>>((acc, item) => {
    acc[item.source] = (acc[item.source] ?? 0) + 1;
    return acc;
  }, {});
  console.log(
    JSON.stringify(
      {
        status: "ok",
        queues: queues.length,
        items: items.length,
        bySource,
        defaultQueue: queues[0]?.label,
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
