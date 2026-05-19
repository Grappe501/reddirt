import { writeFocusBriefOnly } from "../../src/lib/compliance/ai/completion-engine/write-completion-engine-artifacts";

async function main() {
  const focus = await writeFocusBriefOnly();
  console.log(JSON.stringify({ status: "ok", plainEnglish: focus.plainEnglish.slice(0, 120) }, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
