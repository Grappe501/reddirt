import { writeOrchestratorArtifacts } from "../../src/lib/compliance/ai/orchestrator/write-orchestrator-artifacts";

async function main() {
  const out = await writeOrchestratorArtifacts();
  console.log(
    JSON.stringify(
      {
        status: "ok",
        commit: out.snapshot.commitBase,
        nextBest: out.snapshot.nextBestAction.action.title,
        owner: out.snapshot.nextBestAction.action.owner,
        launchOverall: out.snapshot.launchOverall,
        paths: out.paths,
        brief: out.briefPath,
        executiveBrief: out.executiveBriefPath,
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
