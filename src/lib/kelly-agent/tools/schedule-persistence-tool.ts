import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

import { prisma } from "@/lib/db";

export type SchedulePersistenceReport = {
  canActionsPersist: boolean;
  routeDecisionsDbBacked: boolean;
  approvalsDbBacked: boolean;
  stillFileStaged: string[];
  counts: {
    kellyDecisions: number;
    localCoverageRequests: number;
    routeDecisionAlerts: number;
    scheduleSettlementStagedEntries: number;
  };
  warnings: string[];
};

function stagedCount(): number {
  const file = path.join(process.cwd(), "data/calendar-command-center/schedule-settlement-decisions.staged.json");
  if (!existsSync(file)) return 0;
  try {
    const parsed = JSON.parse(readFileSync(file, "utf8")) as { entries?: unknown[] };
    return parsed.entries?.length ?? 0;
  } catch {
    return 0;
  }
}

export async function buildSchedulePersistenceReport(): Promise<SchedulePersistenceReport> {
  const warnings: string[] = [];
  try {
    const [kellyDecisions, localCoverageRequests, routeDecisionAlerts] = await Promise.all([
      prisma.kellyCalendarDecision.count(),
      prisma.localCoverageRequest.count(),
      prisma.calendarAlert.count({ where: { alertType: "SCHEDULE_ROUTE_DECISION" } }),
    ]);
    const scheduleSettlementStagedEntries = stagedCount();
    const routeDecisionsDbBacked = routeDecisionAlerts > 0 || scheduleSettlementStagedEntries === 0;
    if (scheduleSettlementStagedEntries > 0) warnings.push("Schedule settlement JSON remains as audit/fallback.");
    return {
      canActionsPersist: true,
      routeDecisionsDbBacked,
      approvalsDbBacked: kellyDecisions >= 0,
      stillFileStaged: scheduleSettlementStagedEntries > 0 ? ["schedule-settlement-decisions.staged.json"] : [],
      counts: { kellyDecisions, localCoverageRequests, routeDecisionAlerts, scheduleSettlementStagedEntries },
      warnings,
    };
  } catch (e) {
    return {
      canActionsPersist: false,
      routeDecisionsDbBacked: false,
      approvalsDbBacked: false,
      stillFileStaged: ["calendar actions blocked until cockpit migration applies"],
      counts: { kellyDecisions: 0, localCoverageRequests: 0, routeDecisionAlerts: 0, scheduleSettlementStagedEntries: stagedCount() },
      warnings: [e instanceof Error ? e.message : "schedule persistence check failed"],
    };
  }
}
