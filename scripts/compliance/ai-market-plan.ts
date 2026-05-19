import { buildComplianceExpertSnapshot } from "../../src/lib/compliance/ai/expert/build-compliance-expert";
import { buildCompletionProgress } from "../../src/lib/compliance/ai/expert/build-completion-progress";
import { buildComplianceBrainSnapshot } from "../../src/lib/compliance/ai/brain/build-compliance-brain";

async function main() {
  const brain = await buildComplianceBrainSnapshot();
  const expert = await buildComplianceExpertSnapshot(brain);
  const progress = buildCompletionProgress(brain);
  console.log(
    JSON.stringify(
      {
        status: "ok",
        marketReadinessPercent: progress.areas.find((a) => a.area === "Market readiness")?.percentComplete,
        launchScore: expert.launchReadinessScore,
        launchOverall: expert.launchOverall,
        criticalAreas: progress.areas.filter((a) => a.launchCriticality === "critical" && a.percentComplete < 50).map((a) => a.area),
        doc: "docs/compliance/COMPLIANCE_MARKET_READINESS_PLAN.md",
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
