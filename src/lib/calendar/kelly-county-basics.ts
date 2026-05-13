import type { CampaignCalendarItem, CountyPrioritySnapshotRow } from "./campaign-calendar-item";
import { normCountyKey } from "./build-approval-context";
import type { CountyFactsFileRow } from "./load-travel-calendar-data";
import { touchLookup } from "./kelly-approval-hints";

export type CountyBasicsStrip = {
  countyName: string;
  countySeat: string;
  population: string;
  povertyRate: string;
  unemploymentRate: string;
  registeredVoters: string;
  recentTurnout: string;
  lastKellyTouch: string;
  touchesSinceNov1Line: string;
  priorityTier: string;
  countyMeetingStatus: string;
  localGuideLine: string;
};

function needsData(v?: string | null): string {
  const s = v?.trim();
  return s && s.length > 0 ? s : "Needs data.";
}

export function findCountyPriorityRow(
  county: string | undefined,
  rows: CountyPrioritySnapshotRow[],
): CountyPrioritySnapshotRow | undefined {
  const ck = normCountyKey(county);
  if (!ck) return undefined;
  return rows.find((r) => normCountyKey(r.county) === ck);
}

export function buildCountyBasicsStrip(
  item: CampaignCalendarItem,
  opts: {
    facts: Record<string, CountyFactsFileRow>;
    priorities: CountyPrioritySnapshotRow[];
    touchMap: Map<string, { touches: number; lastYmd: string }>;
  },
): CountyBasicsStrip {
  const ck = normCountyKey(item.county) ?? "";
  const factsRow = ck ? opts.facts[ck] : undefined;
  const pr = findCountyPriorityRow(item.county, opts.priorities);
  const touch = touchLookup(item.county, opts.touchMap);
  const guide = item.drillDown?.adminLocalGuide;

  return {
    countyName: item.county ?? "County TBD",
    countySeat: needsData(factsRow?.countySeat),
    population: needsData(factsRow?.population),
    povertyRate: needsData(factsRow?.povertyRate),
    unemploymentRate: needsData(factsRow?.unemploymentRate),
    registeredVoters: needsData(factsRow?.registeredVoters),
    recentTurnout: needsData(factsRow?.recentTurnout),
    lastKellyTouch: pr?.lastTouch ? pr.lastTouch : "Needs data.",
    touchesSinceNov1Line:
      typeof pr?.pastTouchesSinceNov1 === "number"
        ? String(pr.pastTouchesSinceNov1)
        : touch
          ? `${touch.touches} (touch file)`
          : "Needs data.",
    priorityTier: needsData(item.priorityTier ?? pr?.tier ?? pr?.recommendedTierLabel),
    countyMeetingStatus: needsData(factsRow?.countyMeetingStatus),
    localGuideLine: guide?.displayName
      ? `${guide.displayName}${guide.notes ? ` — ${guide.notes}` : ""}`
      : "Needs data.",
  };
}
