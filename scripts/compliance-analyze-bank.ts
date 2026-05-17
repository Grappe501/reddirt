import { writeBaselineAnalysisReports } from "../src/lib/compliance/storage";

async function main() {
  const paths = await writeBaselineAnalysisReports();
  console.log(`Bank analysis report written: ${paths.bank}`);
  console.log("Status: ready if ignored upload analyses exist; otherwise sample_needed.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
