import { existsSync, readFileSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { Prisma } from "@prisma/client";

import { prisma } from "../../src/lib/db";
import { loadRedDirtEnv } from "../load-red-dirt-env";

const ROOT = process.cwd();
const OUT = path.join(ROOT, "data/agent/calendar-intelligence-report-latest.json");

loadRedDirtEnv(ROOT);

function readJson<T>(rel: string): T | null {
  const file = path.join(ROOT, rel);
  if (!existsSync(file)) return null;
  try { return JSON.parse(readFileSync(file, "utf8")) as T; } catch { return null; }
}

type CoverageFile = { stats?: Record<string, number> & { materials?: Record<string, number> }; plans?: Array<{ campaignEventId: string; title?: string; county?: string; status: string; volunteerLeadNeeded?: boolean; tableNeeded?: boolean; tableStatus?: string; staffNextActions?: string[] }> };
type StaffingFile = { stats?: { total?: number; needsVolunteerLead?: number; needsCallout?: number; fullyStaffed?: number; totalStaffingGap?: number }; plans?: Array<{ campaignEventId: string; title: string; status: string; staffingGap: number; volunteerLeadNeeded: boolean; notes?: string }> };
type Preflight = { overallStatus?: "green" | "yellow" | "red"; blockers?: string[]; warnings?: string[]; scheduleReadiness?: { highRiskItems?: string[] } };
type CalendarSourceRow = { sourceType: string; syncEnabled: boolean | null; oauthJson: unknown; lastFullSyncAt: Date | null; lastIncrementalAt: Date | null };

function hasRefreshToken(source: CalendarSourceRow | undefined): boolean {
  const oauth = (source?.oauthJson ?? {}) as { refresh_token?: string };
  return Boolean(oauth.refresh_token);
}

async function calendarSyncReadiness(): Promise<{ ready: boolean; blockers: string[] }> {
  const blockers: string[] = [];
  try {
    const anchorId = process.env.KELLY_GOOGLE_ANCHOR_CALENDAR_SOURCE_ID?.trim();
    const sources = await prisma.$queryRaw<CalendarSourceRow[]>(Prisma.sql`
      SELECT "sourceType"::text AS "sourceType", "syncEnabled", "oauthJson", "lastFullSyncAt", "lastIncrementalAt"
      FROM public."CalendarSource"
      WHERE "sourceType"::text IN ('KELLY_GOOGLE_TENTATIVE', 'KELLY_GOOGLE_CONFIRMED')
         OR (${anchorId ?? ""} <> '' AND id::text = ${anchorId ?? ""})
    `);
    const tentative = sources.find((s) => s.sourceType === "KELLY_GOOGLE_TENTATIVE");
    const confirmed = sources.find((s) => s.sourceType === "KELLY_GOOGLE_CONFIRMED");
    const anchor = anchorId ? sources.find((s) => hasRefreshToken(s)) : undefined;
    if (!anchorId || !anchor) blockers.push("Google OAuth anchor source missing");
    if (!tentative) blockers.push("Kelly Tentative CalendarSource missing");
    if (!confirmed) blockers.push("Kelly Confirmed CalendarSource missing");
    if (!hasRefreshToken(tentative) || !hasRefreshToken(confirmed) || !hasRefreshToken(anchor)) blockers.push("Refresh token missing on anchor/tentative/confirmed source");
    if (!tentative?.syncEnabled || !confirmed?.syncEnabled) blockers.push("Kelly Google source sync not enabled");
  } catch (err) {
    blockers.push(err instanceof Error ? err.message : "calendar sync readiness failed");
  }
  return { ready: blockers.length === 0, blockers };
}

async function main() {
  const generatedAt = new Date().toISOString();
  const coverage = readJson<CoverageFile>("data/calendar-command-center/event-coverage-plans.staged.json");
  const staffing = readJson<StaffingFile>("data/calendar-command-center/event-staffing-plans.staged.json");
  const callouts = readJson<{ callouts?: unknown[] }>("data/calendar-command-center/event-volunteer-callouts.staged.json");
  const reminders = readJson<{ reminders?: unknown[] }>("data/calendar-command-center/event-volunteer-reminders.staged.json");
  const preflight = readJson<Preflight>("data/agent/candidate-dashboard-preflight-latest.json");
  const calendarItems = readJson<{ items?: unknown[] } | unknown[]>("data/calendar-command-center/calendar-items.normalized.json");
  const sync = await calendarSyncReadiness();

  let dbCounts = { total: 0, withCounty: 0, withoutCounty: 0, confirmed: 0, tentative: 0, needsReview: 0, missingLocation: 0 };
  try {
    const [row] = await prisma.$queryRaw<Array<typeof dbCounts>>(Prisma.sql`
      SELECT
        count(*)::int AS total,
        count("countyId")::int AS "withCounty",
        (count(*) - count("countyId"))::int AS "withoutCounty",
        count(*) FILTER (WHERE "eventWorkflowState"::text IN ('APPROVED','PUBLISHED','COMPLETED'))::int AS confirmed,
        count(*) FILTER (WHERE "eventWorkflowState"::text IN ('PENDING_APPROVAL','DRAFT'))::int AS tentative,
        count(*) FILTER (WHERE "syncReviewNeeded" = true OR "eventWorkflowState"::text = 'PENDING_APPROVAL')::int AS "needsReview",
        count(*) FILTER (WHERE "locationName" IS NULL OR trim("locationName") = '')::int AS "missingLocation"
      FROM public."CampaignEvent"
    `);
    if (row) dbCounts = row;
  } catch {
    // DB may be unavailable in local/offline runs; file-staged counts still make the report useful.
  }

  const topStaffActions = (staffing?.plans ?? [])
    .filter((p) => p.staffingGap > 0 || p.volunteerLeadNeeded)
    .slice(0, 10)
    .map((p) => ({ campaignEventId: p.campaignEventId, title: p.title, status: p.status, staffingGap: p.staffingGap, notes: p.notes }));

  const report = {
    generatedAt,
    campaignEvents: {
      total: dbCounts.total || (Array.isArray(calendarItems) ? calendarItems.length : calendarItems?.items?.length ?? 0),
      confirmed: dbCounts.confirmed,
      tentative: dbCounts.tentative,
      needsReview: dbCounts.needsReview,
      withCounty: dbCounts.withCounty,
      withoutCounty: dbCounts.withoutCounty,
      missingLocation: dbCounts.missingLocation,
    },
    coverage: {
      total: coverage?.stats?.total ?? coverage?.plans?.length ?? 0,
      needingLocalCoverage: coverage?.stats?.needsLocalCoverage ?? 0,
      needingVolunteerLead: coverage?.stats?.needsVolunteerLead ?? 0,
      needingTablePermission: coverage?.stats?.needsTablePermission ?? 0,
      ready: coverage?.stats?.ready ?? 0,
      notCovering: coverage?.stats?.notCovering ?? 0,
      materials: coverage?.stats?.materials ?? {},
    },
    staffing: {
      total: staffing?.stats?.total ?? staffing?.plans?.length ?? 0,
      needsVolunteerLead: staffing?.stats?.needsVolunteerLead ?? 0,
      needsCallout: staffing?.stats?.needsCallout ?? 0,
      fullyStaffed: staffing?.stats?.fullyStaffed ?? 0,
      totalStaffingGap: staffing?.stats?.totalStaffingGap ?? 0,
      calloutDrafts: callouts?.callouts?.length ?? 0,
      reminderDrafts: reminders?.reminders?.length ?? 0,
    },
    scheduleConflicts: preflight?.scheduleReadiness?.highRiskItems?.filter((x) => x.startsWith("Conflict:")).length ?? 0,
    preflightStatus: preflight?.overallStatus ?? "yellow",
    googleSyncReady: sync.ready,
    googleSyncBlockers: sync.blockers,
    topStaffActions,
  };
  await mkdir(path.dirname(OUT), { recursive: true });
  await writeFile(OUT, JSON.stringify(report, null, 2), "utf8");
  console.log(JSON.stringify(report, null, 2));
  await prisma.$disconnect();
}

main().catch(async (err) => {
  console.error(err);
  await prisma.$disconnect();
  process.exit(1);
});
