import { writeCriticalPathOnly } from "../../src/lib/compliance/ai/completion-engine/write-completion-engine-artifacts";

async function main() {
  const pathItems = await writeCriticalPathOnly();
  console.log(JSON.stringify({ status: "ok", count: pathItems.length, top: pathItems[0]?.title }, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
