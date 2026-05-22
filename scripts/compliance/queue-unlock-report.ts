import { writeQueueUnlockReport } from "../../src/lib/compliance/sources/queue-unlock-report";

async function main() {
  const report = await writeQueueUnlockReport();
  console.log(JSON.stringify(report, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
