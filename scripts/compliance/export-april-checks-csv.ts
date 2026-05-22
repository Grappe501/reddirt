import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { buildAprilCheckSosWorkbook, workbookToCsv } from "../../src/lib/compliance/checks/april-check-sos-workbook.server";

async function main() {
  const workbook = await buildAprilCheckSosWorkbook();
  const csvPath = path.join(process.cwd(), "data", "compliance", "checks", "april-check-sos-export.csv");
  await mkdir(path.dirname(csvPath), { recursive: true });
  await writeFile(csvPath, workbookToCsv(workbook), "utf8");
  console.log(JSON.stringify({ status: "ok", entries: workbook.entries.length, csv: csvPath }, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
