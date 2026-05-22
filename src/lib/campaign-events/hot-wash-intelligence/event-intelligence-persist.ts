import "server-only";

import type { CalendarSurfaceRow } from "../load-campaign-calendar-events";
import type { HotWashIntelligenceData } from "./hot-wash-intelligence-types";
import type { EventBlueprint } from "../event-blueprints/blueprint-types";
import { upsertBlueprint } from "../event-blueprints/blueprint-store";
import { generateEventBlueprint } from "./event-intelligence-helpers";

export async function persistBlueprintFromEvent(
  row: CalendarSurfaceRow,
  intel: HotWashIntelligenceData,
): Promise<EventBlueprint | null> {
  const bp = generateEventBlueprint(row, intel);
  if (!bp) return null;
  await upsertBlueprint(bp);
  return bp;
}
