import { readFile } from "node:fs/promises";
import path from "node:path";

async function main() {
  const p = path.join(process.cwd(), "data", "compliance", "ai", "april-audit-import-preview.json");
  const preview = JSON.parse(await readFile(p, "utf8")) as { summary: { totalRows: number } };
  if (preview.summary.totalRows < 1) {
    console.error(JSON.stringify({ status: "fail", reason: "no preview rows — run april-audit-spreadsheet first" }, null, 2));
    process.exit(1);
  }
  console.log(JSON.stringify({ status: "ok", totalRows: preview.summary.totalRows }, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
