import { writeWorkSequencerOnly } from "../../src/lib/compliance/ai/completion-engine/write-completion-engine-artifacts";

async function main() {
  const seq = await writeWorkSequencerOnly();
  console.log(JSON.stringify({ status: "ok", roles: seq.roles.map((r) => r.role) }, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
