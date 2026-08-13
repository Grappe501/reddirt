import type { EventItem } from "@/content/types";

/**
 * Keep one card per weekly series on Movement lists — the next upcoming occurrence.
 * The canonical catalog still holds every date through Election Day.
 */
export function collapseRecurringSeriesToNextOccurrence(events: EventItem[]): EventItem[] {
  const seen = new Set<string>();
  const out: EventItem[] = [];
  for (const event of events) {
    const seriesId = event.recurringSeriesId;
    if (!seriesId) {
      out.push(event);
      continue;
    }
    if (seen.has(seriesId)) continue;
    seen.add(seriesId);
    out.push(event);
  }
  return out;
}
