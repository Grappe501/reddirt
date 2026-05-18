import { retrieveComplianceRulesForAI } from "../../src/lib/compliance/ai/compliance-agent/rule-retrieval-tool";

async function main() {
  const result = await retrieveComplianceRulesForAI("cash contribution reporting");
  if (!result.status || !Array.isArray(result.chunks)) throw new Error("Rule retrieval result shape invalid.");
  if (result.status !== "needs_rule_verification" && !result.chunks.some((chunk) => chunk.verificationStatus === "verified_authoritative")) {
    throw new Error("Rule retrieval must require verification when no authoritative source is present.");
  }
  console.log(JSON.stringify({ status: "ok", retrievalStatus: result.status, chunks: result.chunks.length, warning: result.warning }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
