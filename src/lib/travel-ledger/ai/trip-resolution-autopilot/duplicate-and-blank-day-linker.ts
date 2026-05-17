import type { TravelLedgerItem } from "@/lib/travel-ledger/types";

export function findDuplicateCandidates(item: TravelLedgerItem, items: TravelLedgerItem[]): TravelLedgerItem[] {
  const title = item.sourceTitles.join(" ").toLowerCase();
  return items
    .filter((candidate) => candidate.id !== item.id && candidate.date === item.date)
    .filter((candidate) => {
      const other = candidate.sourceTitles.join(" ").toLowerCase();
      return title === other || sharedTokenCount(title, other) >= 3;
    })
    .slice(0, 5);
}

export function buildBlankDayContext(item: TravelLedgerItem, items: TravelLedgerItem[]) {
  const sorted = items.slice().sort((a, b) => a.date.localeCompare(b.date));
  const index = sorted.findIndex((candidate) => candidate.id === item.id);
  return {
    previousItem: index > 0 ? sorted[index - 1] : undefined,
    nextItem: index >= 0 && index < sorted.length - 1 ? sorted[index + 1] : undefined,
  };
}

function sharedTokenCount(a: string, b: string): number {
  const aTokens = new Set(a.split(/[^a-z0-9]+/).filter((token) => token.length > 3));
  return b.split(/[^a-z0-9]+/).filter((token) => aTokens.has(token)).length;
}

