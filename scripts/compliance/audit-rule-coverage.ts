import { readFile, writeFile } from "node:fs/promises";
import { auditComplianceRuleCorpus } from "../../src/lib/compliance/knowledge/compliance-rule-index";
import { loadComplianceRuleCorpus, ruleCoveragePath } from "../../src/lib/compliance/knowledge/load-compliance-rule-corpus";

async function main() {
  const corpus = await loadComplianceRuleCorpus();
  const audit = auditComplianceRuleCorpus(corpus);
  await writeFile(ruleCoveragePath, `${JSON.stringify(audit, null, 2)}\n`, "utf8");
  const existing = await readFile(ruleCoveragePath, "utf8");
  console.log(existing);
  if (!corpus || audit.topicsMissing.length) {
    console.warn("[compliance:rules:audit] Rules corpus incomplete. Human legal review required.");
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
