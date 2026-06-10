#!/usr/bin/env tsx
/** Verify decision brief generation. Run: npm run victory:decisions:verify */
import { generateWeeklyDecisionBrief } from "../../src/lib/victory-os/decision-engine/generate-weekly-decisions";

const brief = generateWeeklyDecisionBrief();

if (brief.topDecisions.length !== 10) {
  console.error(`FAIL: expected 10 decisions, got ${brief.topDecisions.length}`);
  process.exit(1);
}

for (const d of brief.topDecisions) {
  if (!d.recommendation || !d.reason || !d.id) {
    console.error(`FAIL: incomplete decision ${d.rank}`);
    process.exit(1);
  }
}

if (brief.publicationSafety !== "INTERNAL_DRAFT" || !brief.humanReviewRequired) {
  console.error("FAIL: governance flags missing");
  process.exit(1);
}

console.log(`OK: ${brief.topDecisions.length} decisions for week ${brief.weekKey}`);
console.log(`Season: ${brief.seasonLabel}`);
console.log(`#1: ${brief.topDecisions[0].displayName} — ${brief.topDecisions[0].recommendation}`);
