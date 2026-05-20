import { writeFilingPredictorOnly } from "../../src/lib/compliance/ai/intelligence/write-intelligence-artifacts";

async function main() {
  const f = await writeFilingPredictorOnly();
  console.log(JSON.stringify({ status: "ok", current: f.currentStatus, blockers: f.currentBlockers.length }, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
