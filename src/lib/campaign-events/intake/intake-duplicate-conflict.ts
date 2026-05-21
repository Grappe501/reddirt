import type { CampaignCalendarItem } from "@/lib/calendar/campaign-calendar-item";
import type { CampaignEventLedgerRecord } from "@prisma/client";
import { detectEventConflicts } from "../conflicts";
import { recordToCalendarItem } from "../persistence/records";
import { buildWebsiteIntakeCalendarItem } from "./website-intake-calendar";

export type IntakeRiskAssessment = {
  duplicateRisk: boolean;
  scheduleConflict: boolean;
  duplicateReasons: string[];
  conflictReasons: string[];
};

function norm(s: string | null | undefined): string {
  return (s ?? "").trim().toLowerCase();
}

function sameYmd(a: string, b: string): boolean {
  return a.slice(0, 10) === b.slice(0, 10);
}

function titleSimilar(a: string, b: string): boolean {
  const x = norm(a);
  const y = norm(b);
  if (!x || !y) return false;
  if (x === y) return true;
  if (x.includes(y) || y.includes(x)) return true;
  const ax = x.split(/\s+/).filter((w) => w.length > 3);
  const bx = new Set(y.split(/\s+/).filter((w) => w.length > 3));
  const overlap = ax.filter((w) => bx.has(w)).length;
  return overlap >= 2;
}

export function assessIntakeDuplicateAndConflict(input: {
  candidate: CampaignCalendarItem;
  peerCalendarItems: CampaignCalendarItem[];
  existingLedger: CampaignEventLedgerRecord[];
  hostLabel: string | null;
  notesHaystack: string;
}): IntakeRiskAssessment {
  const duplicateReasons: string[] = [];
  const conflictReasons: string[] = [];
  const day = input.candidate.start.slice(0, 10);
  const city = norm(input.candidate.city);
  const host = norm(input.hostLabel);

  for (const peer of input.peerCalendarItems) {
    if (peer.id === input.candidate.id) continue;
    if (!sameYmd(peer.start, input.candidate.start)) continue;
    if (titleSimilar(peer.title, input.candidate.title)) {
      duplicateReasons.push(`Same title/date as “${peer.title}”.`);
    }
    if (city && norm(peer.city) === city) {
      duplicateReasons.push(`Same city (${input.candidate.city}) and date as “${peer.title}”.`);
    }
  }

  for (const row of input.existingLedger) {
    if (!sameYmd(row.startAt.toISOString(), input.candidate.start)) continue;
    if (titleSimilar(row.originalTitle, input.candidate.title)) {
      duplicateReasons.push(`Ledger row “${row.originalTitle}” on same date.`);
    }
    const hostInNotes = norm(row.originalNotes).includes(host) && host.length > 2;
    if (host && hostInNotes) {
      duplicateReasons.push(`Ledger notes mention host on same date (${row.originalTitle}).`);
    }
  }

  if (input.notesHaystack.length > 40) {
    for (const peer of input.peerCalendarItems) {
      if (peer.id === input.candidate.id) continue;
      if (!sameYmd(peer.start, input.candidate.start)) continue;
      const peerNotes = norm(peer.notes);
      if (peerNotes && peerNotes.length > 20 && peerNotes === norm(input.notesHaystack)) {
        duplicateReasons.push(`Similar event description as “${peer.title}”.`);
      }
    }
  }

  const conflictBadges = detectEventConflicts(input.candidate, input.peerCalendarItems, "TENTATIVE");
  for (const b of conflictBadges) {
    conflictReasons.push(`${b.label}: ${b.detail}`);
  }

  const uniqueDup = [...new Set(duplicateReasons)].slice(0, 5);
  const uniqueConf = [...new Set(conflictReasons)].slice(0, 6);

  return {
    duplicateRisk: uniqueDup.length > 0,
    scheduleConflict: uniqueConf.length > 0,
    duplicateReasons: uniqueDup,
    conflictReasons: uniqueConf,
  };
}

export function ledgerRowsToCalendarPeers(
  rows: CampaignEventLedgerRecord[],
  excludeCalendarSourceId: string,
): CampaignCalendarItem[] {
  return rows
    .filter((r) => r.calendarSourceId !== excludeCalendarSourceId)
    .map((r) => {
      if (r.entrySource === "WEBSITE_ENTRY") return buildWebsiteIntakeCalendarItem(r);
      return recordToCalendarItem(r);
    });
}
