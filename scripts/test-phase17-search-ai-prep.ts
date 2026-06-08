/**
 * Phase 17 — Search v4 + AI prep v4 closure test.
 */
import { assertPhase17Bar, computePhase17UpgradePass } from "../src/lib/intelligence/v4/phase17SearchAiPrepClosure";
import { countIntelSearchCorpus } from "../src/lib/intelligence/intelligenceSearchCorpus";
import { INTEL_SEARCH_V4_VERSION } from "../src/lib/intelligence/intelligenceSearchV4";

function main() {
  const report = computePhase17UpgradePass();
  const bar = assertPhase17Bar();
  const corpus = countIntelSearchCorpus("CANDIDATE");

  console.log("=== Phase 17 — Search v4 + AI prep v4 ===");
  console.log(`Version: ${INTEL_SEARCH_V4_VERSION}`);
  console.log(`Completion: ${report.completionPct}%`);
  console.log(`Checkpoints: ${report.progress.checkpointsAtBar}/${report.progress.checkpointTotal}`);
  console.log(`Corpus total: ${corpus.total}`);
  console.log(`SRE docs: ${corpus.byKind.rehearsal ?? 0}`);
  console.log(`Copilot docs: ${corpus.byKind.copilot_tool ?? 0}`);
  console.log(`Quick tools: ${report.progress.quickTools}`);

  for (const c of report.checkpoints) {
    console.log(`  ${c.atBar ? "✓" : "✗"} ${c.id}`);
  }

  if (!bar.ok) {
    console.error(`\nFAIL: ${bar.message}`);
    process.exit(1);
  }

  console.log("\nPASS: Phase 17 bar met");
}

main();
