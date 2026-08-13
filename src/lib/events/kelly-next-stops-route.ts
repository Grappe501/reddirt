import type { EventItem } from "@/content/types";

function stopPlace(e: EventItem): string {
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
