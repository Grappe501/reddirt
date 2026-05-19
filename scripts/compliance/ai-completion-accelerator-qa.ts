import { readFile } from "node:fs/promises";
import path from "node:path";
import { completionAcceleratorSchema } from "../../src/lib/compliance/ai/expert/build-completion-accelerator";
import { buildCompletionAccelerator } from "../../src/lib/compliance/ai/expert/build-completion-accelerator";
import { writeFile, mkdir } from "node:fs/promises";

async function main() {
  const data = await buildCompletionAccelerator();
  const outPath = path.join(process.cwd(), "data", "compliance", "ai", "completion-accelerator.json");
  await mkdir(path.dirname(outPath), { recursive: true });
  await writeFile(outPath, JSON.stringify(data, null, 2), "utf8");
  const parsed = completionAcceleratorSchema.safeParse(JSON.parse(await readFile(outPath, "utf8")));
  if (!parsed.success) {
    console.error(JSON.stringify({ status: "fail", error: parsed.error.message }, null, 2));
    process.exit(1);
  }
  console.log(JSON.stringify({ status: "ok", schemaValidated: true, top10: parsed.data.top10Actions.length }, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
