import { writeMemoryLedgerOnly } from "../../src/lib/compliance/ai/intelligence/write-intelligence-artifacts";

async function main() {
  const m = await writeMemoryLedgerOnly();
  console.log(JSON.stringify({ status: "ok", previous: m.previousCommit, deltas: m.deltas.length }, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
