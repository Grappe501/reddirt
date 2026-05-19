import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { buildAprilCheckSosWorkbook, workbookToCsv, getAprilCheckSosStorePath } from "../../src/lib/compliance/checks/april-check-sos-workbook";

async function main() {
  const workbook = await buildAprilCheckSosWorkbook({ extract: true });
  const csvPath = path.join(process.cwd(), "data", "compliance", "checks", "april-check-sos-export.csv");
  await mkdir(path.dirname(csvPath), { recursive: true });
  await writeFile(csvPath, workbookToCsv(workbook), "utf8");
  console.log(
    JSON.stringify(
      {
        status: "ok",
        entries: workbook.entries.length,
        json: getAprilCheckSosStorePath(),
        csv: csvPath,
        openPage: "/admin/compliance/checks/sos-entry",
      },
      null,
      2,
    ),
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
