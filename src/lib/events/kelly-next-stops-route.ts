import type { EventItem } from "@/content/types";
import { countyNameFromAnySlug, eventCountySlugs } from "@/lib/events/county-key";
import { isStatewideVirtualEvent } from "@/lib/events/public-event-county";

function stopPlace(e: EventItem): string {
  if (e.statewideVirtual || isStatewideVirtualEvent(e)) return "Statewide / Virtual";
  const names = eventCountySlugs(e)
    .map((slug) => countyNameFromAnySlug(slug))
    .filter((name): name is NonNullable<typeof name> => Boolean(name));
  if (names.length > 1) return names.map((name) => `${name} County`).join(" · ");
  if (names[0]) return `${names[0]} County`;
  return (e.city?.trim() || e.locationLabel).replace(/,\s*AR\b.*$/i, "").trim();
}

/** Public journey string from upcoming appearances — never travel legs. */
export function kellyNextStopsRoute(events: EventItem[]): string {
  const places: string[] = [];
  for (const e of events) {
    if (e.statewideVirtual || isStatewideVirtualEvent(e)) continue;
    const place = stopPlace(e);
    if (!place || /^unknown$/i.test(place)) continue;
    if (places[places.length - 1] !== place) places.push(place);
  }
  return places.join(" → ");
}
