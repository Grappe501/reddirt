import type { CampaignEventLedgerRecord } from "@prisma/client";
import type { CampaignCalendarItem } from "@/lib/calendar/campaign-calendar-item";
import { loadNormalizedCalendarItems } from "../load-march-events";
import { buildWebsiteIntakeCalendarItem } from "../intake/website-intake-calendar";

/** Calendar item for a ledger row — normalized JSON or synthetic website intake. */
export function resolveLedgerCalendarItem(
  record: CampaignEventLedgerRecord,
  calendarById: Map<string, CampaignCalendarItem>,
): CampaignCalendarItem | null {
  const fromJson = calendarById.get(record.calendarSourceId);
  if (fromJson) return fromJson;
  if (record.entrySource === "WEBSITE_ENTRY") return buildWebsiteIntakeCalendarItem(record);
  return null;
}

export async function loadCalendarPeerPool(): Promise<{
  all: CampaignCalendarItem[];
  byId: Map<string, CampaignCalendarItem>;
}> {
  const all = await loadNormalizedCalendarItems();
  const byId = new Map(all.map((item) => [item.id, item]));
  return { all, byId };
}

export function buildSyntheticWebsiteItems(records: CampaignEventLedgerRecord[]): CampaignCalendarItem[] {
  const out: CampaignCalendarItem[] = [];
  for (const record of records) {
    if (record.entrySource === "WEBSITE_ENTRY") {
      out.push(buildWebsiteIntakeCalendarItem(record));
    }
  }
  return out;
}
