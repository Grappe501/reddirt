/**
 * Read-only smoke check: INTEL-3 opposition tables are reachable via Prisma (post-migration).
 * Usage: npx tsx scripts/verify-opposition-intel-tables.ts
 */
import { loadEnvConfig } from "@next/env";
import { prisma } from "../src/lib/db";

loadEnvConfig(process.cwd());

async function main() {
  const [
    oppositionEntity,
    oppositionSource,
    oppositionBillRecord,
    oppositionVoteRecord,
    oppositionFinanceRecord,
    oppositionMessageRecord,
    oppositionVideoRecord,
    oppositionNewsMention,
    oppositionElectionPattern,
    oppositionAccountabilityItem,
  ] = await Promise.all([
    prisma.oppositionEntity.count(),
    prisma.oppositionSource.count(),
    prisma.oppositionBillRecord.count(),
    prisma.oppositionVoteRecord.count(),
    prisma.oppositionFinanceRecord.count(),
    prisma.oppositionMessageRecord.count(),
    prisma.oppositionVideoRecord.count(),
    prisma.oppositionNewsMention.count(),
    prisma.oppositionElectionPattern.count(),
    prisma.oppositionAccountabilityItem.count(),
  ]);

  console.log(
    JSON.stringify(
      {
        ok: true,
        packet: "INTEL-3",
        counts: {
          oppositionEntity,
          oppositionSource,
          oppositionBillRecord,
          oppositionVoteRecord,
          oppositionFinanceRecord,
          oppositionMessageRecord,
          oppositionVideoRecord,
          oppositionNewsMention,
          oppositionElectionPattern,
          oppositionAccountabilityItem,
        },
      },
      null,
      2
    )
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });
