import { writeWeaknessDiscoveryOnly } from "../../src/lib/compliance/ai/completion-engine/write-completion-engine-artifacts";

async function main() {
  const report = await writeWeaknessDiscoveryOnly();
  console.log(JSON.stringify({ status: "ok", bySeverity: report.bySeverity, count: report.weaknesses.length }, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
