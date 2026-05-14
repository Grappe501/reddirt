import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

import { runCandidateDashboardPreflight } from "../../src/lib/kelly-agent/tools/candidate-dashboard-preflight-tool";

async function main() {
  const repoRoot = process.cwd();
  const report = await runCandidateDashboardPreflight({ repoRoot });
  const outDir = path.join(repoRoot, "data/agent");
  mkdirSync(outDir, { recursive: true });
  const out = path.join(outDir, "candidate-dashboard-preflight-latest.json");
  writeFileSync(out, JSON.stringify(report, null, 2), "utf8");
  console.log(`candidate dashboard preflight: ${report.overallStatus} (${report.recommendedUseMode})`);
  console.log(`wrote ${out}`);
  if (report.blockers.length) {
    console.log(`blockers: ${report.blockers.join(" | ")}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
