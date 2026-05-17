import { writeBaselineAnalysisReports } from "../src/lib/compliance/storage";

async function main() {
  const paths = await writeBaselineAnalysisReports();
  console.log(`Reconciliation preview written: ${paths.reconciliation}`);
  console.log("Status: preview generated from ignored local staged analyses, if present.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
