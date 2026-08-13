import type { EventItem } from "@/content/types";
import { countyNameFromAnySlug } from "@/lib/events/county-key";
import { isStatewideVirtualEvent } from "@/lib/events/public-event-county";

function stopPlace(e: EventItem): string {
  if (e.statewideVirtual || isStatewideVirtualEvent(e)) return "Statewide / Virtual";
  const name = countyNameFromAnySlug(e.countySlug);
  if (name) return `${name} County`;
  return (e.city?.trim() || e.locationLabel).replace(/,\s*AR\b.*$/i, "").trim();
}

/** Public journey string from upcoming appearances — never travel legs. */
export function kellyNextStopsRoute(events: EventItem[]): string {
  const places: string[] = [];
  for (const e of events) {
    const place = stopPlace(e);
    if (!place || /^unknown$/i.test(place)) continue;
    if (places[places.length - 1] !== place) places.push(place);
  }
  return places.join(" → ");
}
