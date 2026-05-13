/**
 * Read-only diagnostics for failed migration `20260518210000_kelly_calendar_cockpit`.
 * Run: npx tsx scripts/migration-diagnose-kelly-cockpit.ts
 * Does not modify migration state or run migrate resolve.
 */
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Prisma } from "@prisma/client";
import { prisma } from "../src/lib/db";
import { loadRedDirtEnv } from "./load-red-dirt-env";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.join(__dirname, "..");
loadRedDirtEnv(REPO);

async function main() {
  const migrationRow = await prisma.$queryRaw<
    {
      id: string;
      migration_name: string;
      started_at: Date;
      finished_at: Date | null;
      rolled_back_at: Date | null;
      applied_steps_count: number;
      logs: string | null;
    }[]
  >(Prisma.sql`
    SELECT id, migration_name, started_at, finished_at, rolled_back_at, applied_steps_count, logs
    FROM "_prisma_migrations"
    WHERE migration_name = ${"20260518210000_kelly_calendar_cockpit"}
  `);

  const tables = await prisma.$queryRaw<{ table_name: string }[]>(Prisma.sql`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name IN (
        'KellyCalendarDecision',
        'LocalCoverageRequest',
        'CalendarAlert',
        'KellyCalendarPromotion'
      )
    ORDER BY table_name
  `);

  const enums = await prisma.$queryRaw<{ enum_type: string }[]>(Prisma.sql`
    SELECT typname AS enum_type
    FROM pg_type
    WHERE typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
      AND typname IN (
        'KellyCockpitDecisionKind',
        'KellySurrogateTypePref',
        'LocalCoverageRequestStatus',
        'CalendarAlertSeverity',
        'CalendarAlertChannel',
        'CalendarAlertStatus'
      )
    ORDER BY typname
  `);

  const kellyGoogleEnumLabels = await prisma.$queryRaw<{ enumlabel: string }[]>(Prisma.sql`
    SELECT e.enumlabel
    FROM pg_type t
    JOIN pg_enum e ON t.oid = e.enumtypid
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE n.nspname = 'public'
      AND t.typname = 'CalendarSourceType'
      AND e.enumlabel IN ('KELLY_GOOGLE_TENTATIVE', 'KELLY_GOOGLE_CONFIRMED')
    ORDER BY e.enumsortorder
  `);

  const countyIdCol = await prisma.$queryRaw<{ column_name: string; data_type: string; udt_name: string }[]>(Prisma.sql`
    SELECT column_name, data_type, udt_name
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'counties'
      AND column_name = 'id'
  `);

  const campaignEventIdCol = await prisma.$queryRaw<{ column_name: string; data_type: string; udt_name: string }[]>(Prisma.sql`
    SELECT column_name, data_type, udt_name
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'CampaignEvent'
      AND column_name = 'id'
  `);

  const out = {
    migration: migrationRow,
    cockpitTablesFound: tables.map((t) => t.table_name),
    cockpitEnumsFound: enums.map((e) => e.enum_type),
    calendarSourceTypeKellyGoogleLabels: kellyGoogleEnumLabels.map((r) => r.enumlabel),
    countiesIdColumn: countyIdCol[0] ?? null,
    campaignEventIdColumn: campaignEventIdCol[0] ?? null,
    interpretation: {
      migrationRowCount: migrationRow.length,
      allFourTablesPresent: ["KellyCalendarDecision", "KellyCalendarPromotion", "LocalCoverageRequest", "CalendarAlert"].every((n) =>
        tables.some((t) => t.table_name === n),
      ),
      allSixEnumsPresent: [
        "KellyCockpitDecisionKind",
        "KellySurrogateTypePref",
        "LocalCoverageRequestStatus",
        "CalendarAlertSeverity",
        "CalendarAlertChannel",
        "CalendarAlertStatus",
      ].every((n) => enums.some((e) => e.enum_type === n)),
      kellyGoogleEnumValuesLive: kellyGoogleEnumLabels.length >= 2,
    },
  };

  console.log(JSON.stringify(out, null, 2));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
