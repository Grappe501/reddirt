import { writeDiagnosisOnly } from "../../src/lib/compliance/ai/intelligence/write-intelligence-artifacts";

async function main() {
  const d = await writeDiagnosisOnly();
  console.log(JSON.stringify({ status: "ok", items: d.items.length, summary: d.summary }, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
