import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  buildAprilAuditImportPreview,
  renderAprilAuditImportPreviewMarkdown,
} from "../../src/lib/compliance/audit/build-april-audit-import-preview";

async function main() {
  const preview = await buildAprilAuditImportPreview();
  const aiDir = path.join(process.cwd(), "data", "compliance", "ai");
  await mkdir(aiDir, { recursive: true });
  await writeFile(path.join(aiDir, "april-audit-import-preview.json"), JSON.stringify(preview, null, 2), "utf8");
  await writeFile(
    path.join(process.cwd(), "docs", "compliance", "COMPLIANCE_APRIL_AUDIT_IMPORT_PREVIEW.md"),
    renderAprilAuditImportPreviewMarkdown(preview),
    "utf8",
  );
  console.log(JSON.stringify({ status: "ok", summary: preview.summary }, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
