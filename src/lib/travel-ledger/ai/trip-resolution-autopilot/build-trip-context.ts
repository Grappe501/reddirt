import type { TravelLedgerItem } from "@/lib/travel-ledger/types";
import type { TripResolutionContext } from "./autopilot-types";
import { buildBlankDayContext, findDuplicateCandidates } from "./duplicate-and-blank-day-linker";

export function buildTripContext(item: TravelLedgerItem, items: TravelLedgerItem[]): TripResolutionContext {
  return {
    item,
    title: item.sourceTitles[0] ?? "Untitled item",
    locationText: item.businessPurpose ?? "",
    descriptionText: item.sourceTitles.slice(1).join(" "),
    priorApprovedItems: items.filter((candidate) => candidate.approvalStatus !== "not_approved"),
    duplicateCandidates: findDuplicateCandidates(item, items),
    blankDayContext: buildBlankDayContext(item, items),
  };
}

