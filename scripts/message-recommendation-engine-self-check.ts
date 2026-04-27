/**
 * Lightweight invariant checks for the message recommendation engine (no test runner in repo).
 * Run: npx tsx scripts/message-recommendation-engine-self-check.ts
 */
import { assertMessageRecommendationEngineInvariants, getMessageRecommendations } from "@/lib/message-engine/recommendations";

assertMessageRecommendationEngineInvariants();

const popeContext = getMessageRecommendations({
  audience: "persuadable",
  relationship: "neighbor",
  countyDisplayName: "Pope County",
  regionDisplayName: "River Valley",
  stateDisplayName: "Arkansas",
});

if (!popeContext.recommendations.some((r) => r.reasons.length > 0)) {
  throw new Error("Expected at least one recommendation with rule-based reasons");
}

process.stdout.write(
  `message-recommendation-engine-self-check: ok (${popeContext.recommendations.length} recommendations)\n`,
);
