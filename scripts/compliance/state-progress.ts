import { writeStateProgressOnly } from "../../src/lib/compliance/ai/completion-engine/write-completion-engine-artifacts";

async function main() {
  const report = await writeStateProgressOnly();
  console.log(JSON.stringify({ status: "ok", overall: report.overallPercentComplete, filing: report.filingStatus }, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
