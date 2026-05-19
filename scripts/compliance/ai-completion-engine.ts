import { writeAllCompletionEngineArtifacts } from "../../src/lib/compliance/ai/completion-engine/write-completion-engine-artifacts";

async function main() {
  const out = await writeAllCompletionEngineArtifacts();
  console.log(
    JSON.stringify(
      {
        status: "ok",
        commit: out.pkg.engine.commitBase,
        overall: out.pkg.engine.overallPercentComplete,
        nextBest: out.pkg.engine.nextBestAction.title,
        auditChecks: out.auditChecklist.summary.totalChecks,
        auditExpenditures: out.auditChecklist.summary.totalLedgerExpenditures,
      },
      null,
      2,
    ),
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
