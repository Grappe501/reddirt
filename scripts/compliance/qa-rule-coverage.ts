import { auditComplianceRuleCorpus } from "../../src/lib/compliance/knowledge/compliance-rule-index";
import { loadComplianceRuleCorpus } from "../../src/lib/compliance/knowledge/load-compliance-rule-corpus";
import { requiredComplianceRuleTopics } from "../../src/lib/compliance/knowledge/compliance-rule-types";
import { retrieveComplianceRulesForAI } from "../../src/lib/compliance/ai/compliance-agent/rule-retrieval-tool";

async function main() {
  const corpus = await loadComplianceRuleCorpus();
  if (!corpus) throw new Error("Rule corpus missing. Run npm run compliance:rules:build first.");
  const audit = auditComplianceRuleCorpus(corpus);
  if (audit.topicCoverage.length !== requiredComplianceRuleTopics.length) throw new Error("Topic coverage shape mismatch.");
  const missingCards = requiredComplianceRuleTopics.filter((topic) => !audit.topicCoverage.some((coverage) => coverage.topic === topic));
  if (missingCards.length) throw new Error(`Missing topic coverage cards: ${missingCards.join(", ")}`);
  const retrieval = await retrieveComplianceRulesForAI("cash contribution reporting");
  if (!retrieval.status || !Array.isArray(retrieval.chunks)) throw new Error("AI rule retrieval returned invalid shape.");
  console.log(JSON.stringify({
    status: "ok",
    topics: audit.topicCoverage.length,
    chunks: audit.chunksIndexed,
    missingTopics: audit.topicsMissing,
    needsVerification: audit.rulesNeedingVerification,
    retrievalStatus: retrieval.status,
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
