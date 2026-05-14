import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

import { prisma } from "@/lib/db";

export type CalendarDbHealthReport = {
  migrationsGreen: boolean;
  failedMigrationNames: string[];
  campaignEventCount: number;
  calendarSourceCount: number;
  googleSourceIdsPresent: boolean;
  tables: {
    kellyCalendarDecision: boolean;
    localCoverageRequest: boolean;
    calendarAlert: boolean;
  };
  warnings: string[];
};

function migrationSqlFixed(repoRoot: string): boolean {
  const file = path.join(repoRoot, "prisma/migrations/20260518210000_kelly_calendar_cockpit/migration.sql");
  if (!existsSync(file)) return false;
  return readFileSync(file, "utf8").includes('"countyId" UUID');
}

export async function buildCalendarDbHealthReport(repoRoot = process.cwd()): Promise<CalendarDbHealthReport> {
  const warnings: string[] = [];
  try {
    const [failedMigrations, campaignEventCount, calendarSourceCount, googleSources, decisionCount, localCount, alertCount] =
      await Promise.all([
        prisma.$queryRaw<Array<{ migration_name: string }>>`
          SELECT migration_name FROM "_prisma_migrations"
          WHERE finished_at IS NULL AND rolled_back_at IS NULL
        `,
        prisma.campaignEvent.count(),
        prisma.calendarSource.count(),
        prisma.calendarSource.findMany({
          where: { sourceType: { in: ["KELLY_GOOGLE_TENTATIVE", "KELLY_GOOGLE_CONFIRMED"] } },
          select: { id: true },
        }),
        prisma.kellyCalendarDecision.count().then(() => true).catch(() => false),
        prisma.localCoverageRequest.count().then(() => true).catch(() => false),
        prisma.calendarAlert.count().then(() => true).catch(() => false),
      ]);
    if (!migrationSqlFixed(repoRoot)) warnings.push("Kelly cockpit migration SQL does not show countyId UUID.");
    return {
      migrationsGreen: failedMigrations.length === 0,
      failedMigrationNames: failedMigrations.map((m) => m.migration_name),
      campaignEventCount,
      calendarSourceCount,
      googleSourceIdsPresent: googleSources.length >= 2,
      tables: {
        kellyCalendarDecision: decisionCount,
        localCoverageRequest: localCount,
        calendarAlert: alertCount,
      },
      warnings,
    };
  } catch (e) {
    return {
      migrationsGreen: false,
      failedMigrationNames: ["database_unavailable_or_schema_incomplete"],
      campaignEventCount: 0,
      calendarSourceCount: 0,
      googleSourceIdsPresent: false,
      tables: { kellyCalendarDecision: false, localCoverageRequest: false, calendarAlert: false },
      warnings: [e instanceof Error ? e.message : "unknown database health error"],
    };
  }
}
