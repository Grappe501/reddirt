import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { auditComplianceRuleCorpus } from "../../src/lib/compliance/knowledge/compliance-rule-index";
import { buildComplianceRuleCorpus, ruleCorpusPath, ruleCoveragePath } from "../../src/lib/compliance/knowledge/load-compliance-rule-corpus";

async function main() {
  const corpus = await buildComplianceRuleCorpus();
  const audit = auditComplianceRuleCorpus(corpus);
  await mkdir(path.dirname(ruleCorpusPath), { recursive: true });
  await writeFile(ruleCorpusPath, `${JSON.stringify(corpus, null, 2)}\n`, "utf8");
  await writeFile(ruleCoveragePath, `${JSON.stringify(audit, null, 2)}\n`, "utf8");
  console.log(JSON.stringify({ sources: corpus.sources.length, chunks: corpus.chunks.length, topicsMissing: audit.topicsMissing, warning: audit.warning }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
