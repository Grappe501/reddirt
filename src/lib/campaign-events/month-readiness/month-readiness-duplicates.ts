import type { CampaignCalendarItem } from "@/lib/calendar/campaign-calendar-item";
import { loadNormalizedCalendarItems } from "../load-march-events";

export type DuplicateCalendarIdGroup = {
  calendarId: string;
  count: number;
  titles: string[];
  starts: string[];
};

export type PeriodDuplicateReport = {
  period: string;
  jsonRowCount: number;
  uniqueIdCount: number;
  duplicateGroups: DuplicateCalendarIdGroup[];
};

export async function findDuplicateCalendarIdsForPeriod(period: string): Promise<PeriodDuplicateReport> {
  const all = await loadNormalizedCalendarItems();
  const inPeriod = all.filter((item) => String(item.start).slice(0, 7) === period);
  const byId = new Map<string, CampaignCalendarItem[]>();

  for (const item of inPeriod) {
    const list = byId.get(item.id) ?? [];
    list.push(item);
    byId.set(item.id, list);
  }

  const duplicateGroups: DuplicateCalendarIdGroup[] = [];
  for (const [calendarId, items] of byId) {
    if (items.length > 1) {
      duplicateGroups.push({
        calendarId,
        count: items.length,
        titles: items.map((i) => i.title),
        starts: items.map((i) => String(i.start).slice(0, 10)),
      });
    }
  }

  return {
    period,
    jsonRowCount: inPeriod.length,
    uniqueIdCount: byId.size,
    duplicateGroups,
  };
}
