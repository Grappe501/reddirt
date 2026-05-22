import type { CampaignCalendarItem } from "@/lib/calendar/campaign-calendar-item";
import type { CampaignEventLedgerEventStatus } from "@prisma/client";
import { evaluateWorkHoursWarning } from "./work-schedule";

export type ConflictCategory = "overlap" | "work_hours" | "tentative_vs_confirmed";

export type EventConflictBadge = {
  category: ConflictCategory;
  label: string;
  detail: string;
};

function chicagoYmd(iso: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Chicago",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(iso));
}

function rangesOverlap(aStart: number, aEnd: number, bStart: number, bEnd: number): boolean {
  return aStart < bEnd && bStart < aEnd;
}

function eventRangeMs(item: CampaignCalendarItem): { start: number; end: number } {
  const start = new Date(item.start).getTime();
  const end = item.end ? new Date(item.end).getTime() : start + 60 * 60 * 1000;
  return { start, end: Math.max(end, start + 15 * 60 * 1000) };
}

export function detectEventConflicts(
  item: CampaignCalendarItem,
  peers: CampaignCalendarItem[],
  eventStatus: CampaignEventLedgerEventStatus,
): EventConflictBadge[] {
  const badges: EventConflictBadge[] = [];
  const work = evaluateWorkHoursWarning(item);
  if (work.show) {
    badges.push({
      category: "work_hours",
      label: work.badge,
      detail: work.detail,
    });
  }

  const day = chicagoYmd(item.start);
  const { start: a0, end: a1 } = eventRangeMs(item);

  for (const other of peers) {
    if (other.id === item.id) continue;
    if (chicagoYmd(other.start) !== day) continue;
    if (other.allDay || item.allDay) continue;
    const { start: b0, end: b1 } = eventRangeMs(other);
    if (rangesOverlap(a0, a1, b0, b1)) {
      badges.push({
        category: "overlap",
        label: "Schedule overlap",
        detail: `Overlaps “${other.title}” on the same day.`,
      });
      break;
    }
  }

  const sameDay = peers.filter((p) => p.id !== item.id && chicagoYmd(p.start) === day);
  const peerConfirmed = sameDay.some((p) => p.calendarStatus === "confirmed");
  if (eventStatus === "TENTATIVE" && peerConfirmed) {
    badges.push({
      category: "tentative_vs_confirmed",
      label: "Tentative vs confirmed",
      detail: "This row is tentative while another same-day event is confirmed — review before locking travel.",
    });
  }
  if (eventStatus === "CONFIRMED" && sameDay.some((p) => p.calendarStatus === "tentative")) {
    badges.push({
      category: "tentative_vs_confirmed",
      label: "Unconfirmed neighbor",
      detail: "Confirmed event shares the day with tentative calendar items.",
    });
  }

  return badges;
}
