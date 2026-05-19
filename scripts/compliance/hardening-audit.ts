import { writeHardeningAuditOnly } from "../../src/lib/compliance/ai/completion-engine/write-completion-engine-artifacts";

async function main() {
  const report = await writeHardeningAuditOnly();
  console.log(JSON.stringify({ status: "ok", hardening: report.status, checks: report.checks.length }, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
