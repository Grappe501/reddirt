import { writeAllIntelligenceArtifacts } from "../../src/lib/compliance/ai/intelligence/write-intelligence-artifacts";

async function main() {
  const pkg = await writeAllIntelligenceArtifacts();
  console.log(
    JSON.stringify(
      {
        status: "ok",
        commit: pkg.snapshot.commitBase,
        filing: pkg.snapshot.filingStatus,
        completion: pkg.snapshot.overallPercentComplete,
        nextAction: pkg.criticalPathV2.actions[0]?.title,
        dataQuality: pkg.dataQuality.overallScore,
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
