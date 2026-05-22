import { writeCriticalPathV2Only } from "../../src/lib/compliance/ai/intelligence/write-intelligence-artifacts";

async function main() {
  const cp = await writeCriticalPathV2Only();
  console.log(JSON.stringify({ status: "ok", actions: cp.actions.length, top: cp.actions[0]?.title }, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
