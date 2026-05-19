import { writeFilingImpactReport } from "../../src/lib/compliance/sources/filing-impact-report";

async function main() {
  const report = await writeFilingImpactReport();
  console.log(JSON.stringify(report, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
