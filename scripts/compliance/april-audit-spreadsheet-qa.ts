import { readFile } from "node:fs/promises";
import path from "node:path";
import { APRIL_AUDIT_PATHS } from "../../src/lib/compliance/audit/write-april-audit-spreadsheet";

async function main() {
  const mainPath = path.join(process.cwd(), APRIL_AUDIT_PATHS.main);
  const text = await readFile(mainPath, "utf8");
  const lines = text.trim().split(/\r?\n/);
  const rowCount = Math.max(0, lines.length - 1);
  if (rowCount < 50) {
    console.error(JSON.stringify({ status: "fail", reason: "main audit CSV too few rows", rowCount }, null, 2));
    process.exit(1);
  }
  const required = ["audit_id", "workflow_area", "human_answer", "ready_for_import"];
  const header = lines[0];
  for (const col of required) {
    if (!header.includes(col)) {
      console.error(JSON.stringify({ status: "fail", reason: `missing column ${col}` }, null, 2));
      process.exit(1);
    }
  }
  console.log(JSON.stringify({ status: "ok", rowCount, paths: APRIL_AUDIT_PATHS }, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
