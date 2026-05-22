import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { buildRuleTopicReviewPacket } from "../../src/lib/compliance/knowledge/rule-topic-review-packet";

async function main() {
  const packet = await buildRuleTopicReviewPacket();
  const outDir = path.join(process.cwd(), "data", "compliance", "reports");
  await mkdir(outDir, { recursive: true });
  const outPath = path.join(outDir, "rule-topic-review-packet.json");
  const redacted = {
    generatedAt: packet.generatedAt,
    topicCount: packet.topicCount,
    unverifiedCount: packet.unverifiedCount,
    topics: packet.topics.map((t) => ({
      topicId: t.topicId,
      label: t.label,
      verified: t.verified,
      approvalItemsAffected: t.approvalItemsAffected,
      whyReviewRequired: t.whyReviewRequired,
      evidenceAvailable: t.evidenceAvailable,
      unresolvedQuestion: t.unresolvedQuestion,
      recommendedDecisionFormat: t.recommendedDecisionFormat,
      qaGuard: t.qaGuard,
    })),
  };
  await writeFile(outPath, JSON.stringify(redacted, null, 2), "utf8");
  console.log(JSON.stringify({ status: "ok", path: outPath, unverifiedCount: packet.unverifiedCount }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
