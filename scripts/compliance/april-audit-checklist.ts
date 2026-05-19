import { writeAprilAuditChecklistOnly } from "../../src/lib/compliance/ai/completion-engine/write-completion-engine-artifacts";

async function main() {
  const checklist = await writeAprilAuditChecklistOnly();
  console.log(JSON.stringify({ status: "ok", summary: checklist.summary, doc: "docs/compliance/COMPLIANCE_APRIL_AUDIT_CHECKLIST.md" }, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
