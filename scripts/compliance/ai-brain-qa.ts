import { readFile } from "node:fs/promises";
import path from "node:path";
import { writeComplianceBrainArtifacts } from "../../src/lib/compliance/ai/brain/write-brain-artifacts";
import { assertBrainPackage } from "../../src/lib/compliance/ai/brain/validate-compliance-brain";

async function main() {
  const written = await writeComplianceBrainArtifacts();
  const [snapshotRaw, nextRaw, riskRaw, launchRaw] = await Promise.all([
    readFile(written.snapshotPath, "utf8"),
    readFile(written.nextActionsPath, "utf8"),
    readFile(written.riskReportPath, "utf8"),
    readFile(written.launchReadinessPath, "utf8"),
  ]);
  const nextParsed = JSON.parse(nextRaw) as { actions: unknown };
  assertBrainPackage({
    snapshot: JSON.parse(snapshotRaw),
    nextActions: nextParsed.actions,
    risks: JSON.parse(riskRaw).risks,
    launchReadiness: JSON.parse(launchRaw),
  });
  const brief = await readFile(path.join(process.cwd(), "docs/compliance/COMPLIANCE_AI_BRAIN_BRIEF.md"), "utf8");
  if (!brief.includes("Unsafe actions")) throw new Error("Brief missing unsafe actions section");
  console.log(JSON.stringify({ status: "ok", schemaValidated: true, launchOverall: written.snapshot.launchReadiness.overall }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
