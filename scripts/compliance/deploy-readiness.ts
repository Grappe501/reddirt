import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { buildDeployReadinessReport } from "../../src/lib/compliance/ai/expert/build-deploy-readiness";

async function main() {
  const report = await buildDeployReadinessReport();
  const outPath = path.join(process.cwd(), "data", "compliance", "ai", "deploy-readiness.json");
  await mkdir(path.dirname(outPath), { recursive: true });
  await writeFile(outPath, JSON.stringify(report, null, 2), "utf8");
  console.log(
    JSON.stringify(
      {
        status: "ok",
        readyForNetlifyDeploy: report.readyForNetlifyDeploy,
        path: outPath,
        productionBlockers: report.productionBlockers,
        filingStatus: report.filingStatus,
        bankCsvState: report.bankCsvState,
      },
      null,
      2,
    ),
  );
  if (!report.readyForNetlifyDeploy) process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
