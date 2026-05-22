import { writeSourceTruthAudit } from "../../src/lib/compliance/sources/source-truth-audit";

async function main() {
  const report = await writeSourceTruthAudit();
  console.log(JSON.stringify({ status: "ok", summary: report.summary, entryCount: report.entries.length }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
