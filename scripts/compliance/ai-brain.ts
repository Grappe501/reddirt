import { writeComplianceBrainArtifacts } from "../../src/lib/compliance/ai/brain/write-brain-artifacts";

async function main() {
  const out = await writeComplianceBrainArtifacts();
  console.log(
    JSON.stringify(
      {
        status: "ok",
        commit: out.snapshot.commitBase,
        launchOverall: out.snapshot.launchReadiness.overall,
        filing: out.snapshot.filing.overall,
        openQueue: out.snapshot.queue.openItems,
        paths: {
          snapshot: out.snapshotPath,
          nextActions: out.nextActionsPath,
          risks: out.riskReportPath,
          launchReadiness: out.launchReadinessPath,
          brief: out.briefPath,
        },
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
