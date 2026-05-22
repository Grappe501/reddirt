import { writeComplianceBrainArtifacts } from "../../src/lib/compliance/ai/brain/write-brain-artifacts";

async function main() {
  const out = await writeComplianceBrainArtifacts();
  console.log(
    JSON.stringify(
      {
        status: "ok",
        brief: out.briefPath,
        human: out.snapshot.recommendedNextHumanAction,
        ai: out.snapshot.recommendedNextAiAction,
        launch: out.snapshot.launchReadiness.overall,
        score: out.snapshot.launchReadiness.launchReadinessScore,
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
