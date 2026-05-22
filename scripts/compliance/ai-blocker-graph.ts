import { writeBlockerGraphOnly } from "../../src/lib/compliance/ai/completion-engine/write-completion-engine-artifacts";

async function main() {
  const graph = await writeBlockerGraphOnly();
  console.log(JSON.stringify({ status: "ok", nodes: graph.nodes.length }, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
