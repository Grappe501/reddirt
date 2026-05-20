import { writeDataQualityOnly } from "../../src/lib/compliance/ai/intelligence/write-intelligence-artifacts";

async function main() {
  const dq = await writeDataQualityOnly();
  console.log(JSON.stringify({ status: "ok", overallScore: dq.overallScore, domains: dq.domains.length }, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
