import { writeExceptionResolverOnly } from "../../src/lib/compliance/ai/intelligence/write-intelligence-artifacts";

async function main() {
  const plan = await writeExceptionResolverOnly();
  console.log(JSON.stringify({ status: "ok", groups: plan.groups.length, noAutoFix: plan.noAutoFix }, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
