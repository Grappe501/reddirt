import { readFile } from "node:fs/promises";
import { writeComplianceExpertArtifacts } from "../../src/lib/compliance/ai/expert/write-expert-artifacts";

async function main() {
  const out = await writeComplianceExpertArtifacts();
  const progress = JSON.parse(await readFile(out.progressPath, "utf8"));
  console.log(
    JSON.stringify(
      {
        status: "ok",
        commit: out.expert.commitBase,
        launchOverall: out.expert.launchOverall,
        overallPercentComplete: progress.overallPercentComplete,
        paths: { expert: out.expertPath, progress: out.progressPath, brief: out.briefPath },
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
