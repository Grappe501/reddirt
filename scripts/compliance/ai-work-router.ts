import { writeWorkRouterOnly } from "../../src/lib/compliance/ai/intelligence/write-intelligence-artifacts";

async function main() {
  const plan = await writeWorkRouterOnly();
  const counts = Object.fromEntries(Object.entries(plan.queues).map(([k, v]) => [k, v.length]));
  console.log(JSON.stringify({ status: "ok", queues: counts }, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
