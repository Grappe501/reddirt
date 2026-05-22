import { writeBriefsOnly } from "../../src/lib/compliance/ai/intelligence/write-intelligence-artifacts";

async function main() {
  await writeBriefsOnly();
  console.log(JSON.stringify({ status: "ok", briefs: ["executive", "operator", "ernie", "treasurer"] }, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
