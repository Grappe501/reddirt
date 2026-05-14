import { buildEmailAudience } from "../../src/lib/email/build-email-audience";

async function main() {
  const result = await buildEmailAudience();
  console.log(JSON.stringify({
    eligibleCount: result.eligible.length,
    needsReviewCount: result.needsReview.length,
    suppressedCount: result.suppressedCount,
    duplicateCount: result.duplicateCount,
    invalidCount: result.invalidCount,
    totalConsidered: result.totalConsidered,
    sample: result.eligible.slice(0, 5).map((m) => ({ id: m.id, source: m.source, consentStatus: m.consentStatus, county: m.county, tags: m.tags })),
  }, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
