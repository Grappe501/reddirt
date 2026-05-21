import { prisma } from "@/lib/db";
import { MARCH_2026_LEDGER_PERIOD } from "../constants";
import { loadCampaignEventsWorkbench } from "../load-workbench-events";
import { summarizeCalendarSyncForPeriod } from "../calendar-sync/load-calendar-sync-dashboard";
import { getCalendarPromotionConfig } from "./promotion-config";
import { assessPromotionReadiness } from "./promotion-readiness";
import { derivePromotionStatus, parsePromotionMeta, type LedgerCalendarPromotionMeta } from "./promotion-meta";
import type { CalendarPromotionStatus, PromotionReadinessLevel } from "./promotion-types";
import type { WorkbenchEventRow } from "../merge-persisted-row";

export type PromotionWorkbenchRow = {
  row: WorkbenchEventRow;
  promotionStatus: CalendarPromotionStatus;
  meta: LedgerCalendarPromotionMeta;
  readinessTentative: PromotionReadinessLevel;
  readinessOfficial: PromotionReadinessLevel;
  blockers: string[];
};

export type PromotionWorkbenchSnapshot = {
  period: string;
  config: Awaited<ReturnType<typeof getCalendarPromotionConfig>>;
  calendarSync: Awaited<ReturnType<typeof summarizeCalendarSyncForPeriod>>;
  readyTentative: PromotionWorkbenchRow[];
  readyOfficial: PromotionWorkbenchRow[];
  blocked: PromotionWorkbenchRow[];
  failed: PromotionWorkbenchRow[];
  recentlyPromoted: PromotionWorkbenchRow[];
  duplicateWarnings: PromotionWorkbenchRow[];
};

export async function loadPromotionWorkbench(period: string = MARCH_2026_LEDGER_PERIOD): Promise<PromotionWorkbenchSnapshot> {
  const { rows, period: loadedPeriod } = await loadCampaignEventsWorkbench({ period });
  const config = await getCalendarPromotionConfig();
  const calendarSync = await summarizeCalendarSyncForPeriod(loadedPeriod);

  const enriched: PromotionWorkbenchRow[] = [];
  for (const row of rows) {
    if (row.rawEventStatus === "CANCELLED") continue;
    const record = await prisma.campaignEventLedgerRecord.findUnique({ where: { id: row.recordId } });
    if (!record) continue;
    const meta = parsePromotionMeta(record.factCard);
    const promotionStatus = derivePromotionStatus(record, row, meta);
    const rt = await assessPromotionReadiness(record, row, "tentative");
    const ro = await assessPromotionReadiness(record, row, "official");
    enriched.push({
      row,
      promotionStatus,
      meta,
      readinessTentative: rt.level,
      readinessOfficial: ro.level,
      blockers: [...new Set([...rt.blockers, ...ro.blockers])],
    });
  }

  const readyTentative = enriched.filter(
    (e) =>
      e.promotionStatus === "READY_FOR_TENTATIVE_PROMOTION" ||
      (e.readinessTentative === "READY" && !e.meta.tentativeGoogleEventId),
  );
  const readyOfficial = enriched.filter(
    (e) =>
      e.promotionStatus === "READY_FOR_OFFICIAL_PROMOTION" ||
      (e.readinessOfficial === "READY" && e.meta.tentativeGoogleEventId && !e.meta.officialGoogleEventId),
  );
  const blocked = enriched.filter(
    (e) =>
      e.promotionStatus === "PROMOTION_BLOCKED" ||
      e.readinessTentative === "BLOCKED" ||
      e.readinessOfficial === "BLOCKED",
  );
  const failed = enriched.filter((e) => e.promotionStatus === "PROMOTION_FAILED");
  const recentlyPromoted = enriched.filter(
    (e) => e.promotionStatus === "PROMOTED_TO_TENTATIVE" || e.promotionStatus === "PROMOTED_TO_OFFICIAL",
  );
  const duplicateWarnings = enriched.filter((e) => e.row.duplicateRisk || e.row.hasConflictWarning);

  return {
    period: loadedPeriod,
    config,
    calendarSync,
    readyTentative: readyTentative.slice(0, 40),
    readyOfficial: readyOfficial.slice(0, 40),
    blocked: blocked.slice(0, 30),
    failed: failed.slice(0, 20),
    recentlyPromoted: recentlyPromoted.slice(0, 20),
    duplicateWarnings: duplicateWarnings.slice(0, 20),
  };
}
