import { ensureEmailStagedFiles } from "../../src/lib/email/email-staged-store";
import { getEmailReadinessReport } from "../../src/lib/email/email-readiness";

async function main() {
  await ensureEmailStagedFiles();
  const report = await getEmailReadinessReport();
  console.log(JSON.stringify(report, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
