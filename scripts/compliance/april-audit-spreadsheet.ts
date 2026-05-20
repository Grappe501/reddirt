import { writeAprilAuditSpreadsheetPackage } from "../../src/lib/compliance/audit/write-april-audit-spreadsheet";

async function main() {
  const { pkg, paths } = await writeAprilAuditSpreadsheetPackage();
  console.log(JSON.stringify({ status: "ok", summary: pkg.summary, paths }, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
