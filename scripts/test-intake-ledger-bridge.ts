/**
 * Sprint 2 — verify website intake → ledger bridge (no live HTTP; uses Prisma).
 * Run: npm run campaign-events:test-intake-bridge
 */
import { prisma } from "../src/lib/db";
import { buildWebsiteEntrySourceKey } from "../src/lib/campaign-events/intake/intake-meta";

async function main() {
  const intakes = await prisma.workflowIntake.findMany({
    where: { source: "public_schedule_request" },
    orderBy: { createdAt: "desc" },
    take: 5,
    include: { eventRequest: true },
  });

  console.log(`Recent public_schedule_request intakes: ${intakes.length}`);

  let ok = 0;
  let missing = 0;

  for (const intake of intakes) {
    const sourceKey = buildWebsiteEntrySourceKey(intake.id);
    const ledger = await prisma.campaignEventLedgerRecord.findUnique({ where: { sourceKey } });
    if (ledger) {
      ok++;
      console.log(`  OK  intake=${intake.id.slice(0, 8)}… ledger=${ledger.id.slice(0, 8)}… period=${ledger.period} status=${ledger.eventStatus}`);
    } else {
      missing++;
      console.log(`  MISS intake=${intake.id.slice(0, 8)}… (no ledger for ${sourceKey})`);
    }
  }

  const dupKeys = await prisma.campaignEventLedgerRecord.groupBy({
    by: ["sourceKey"],
    where: { entrySource: "WEBSITE_ENTRY" },
    _count: { sourceKey: true },
  });
  const dupes = dupKeys.filter((g) => g._count.sourceKey > 1);
  if (dupes.length) {
    console.error("FAIL: duplicate sourceKey rows", dupes);
    process.exit(1);
  }

  console.log(`\nBridged: ${ok} · Missing ledger: ${missing}`);
  if (intakes.length > 0 && missing === intakes.length) {
    console.log("Hint: run a public schedule submit or backfill script for legacy intakes.");
  }
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
