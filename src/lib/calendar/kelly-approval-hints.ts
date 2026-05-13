import type { CampaignCalendarItem, CountyPrioritySnapshotRow } from "./campaign-calendar-item";
import { normCountyKey, type ApprovalContextHints } from "./build-approval-context";

export function touchLookup(
  county: string | undefined,
  map: Map<string, { touches: number; lastYmd: string }>,
): { touches: number; lastYmd: string } | undefined {
  if (!county) return undefined;
  const parts = county
    .split(/[,/]/)
    .map((s) => s.trim())
    .filter(Boolean);
  for (const p of parts) {
    const hit = map.get(p) ?? map.get(p.replace(/\s+County$/i, "").trim());
    if (hit) return hit;
  }
  return undefined;
}

export function resolveApprovalContextHints(
  item: CampaignCalendarItem,
  priorities: CountyPrioritySnapshotRow[],
  touchMap: Map<string, { touches: number; lastYmd: string }>,
): ApprovalContextHints | undefined {
  const ck = normCountyKey(item.county);
  const row = ck ? priorities.find((r) => normCountyKey(r.county) === ck) : undefined;
  const touch = touchLookup(item.county, touchMap);
  if (!row && !touch) return undefined;
  return {
    strategicClass: row?.strategicClass,
    pastTouchesSinceNov1: row?.pastTouchesSinceNov1 ?? touch?.touches,
    nextScheduledAnchor: row?.nextScheduledAnchor,
    prioritySnapshotTier: row?.tier,
  };
}
