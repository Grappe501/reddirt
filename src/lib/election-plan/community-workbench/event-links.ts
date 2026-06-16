import { GRASSROOTS_GUITAR_STRINGS_EVENT_SLUG } from "./pilot-event-seeds";

export function communityWorkbenchEventHref(workbenchSlug: string, eventSlug: string): string {
  return `/election-plan/workbenches/${workbenchSlug}/events/${eventSlug}`;
}

export function grassrootsGuitarStringsEventHref(): string {
  return communityWorkbenchEventHref("sherwood", GRASSROOTS_GUITAR_STRINGS_EVENT_SLUG);
}

export function sherwoodEventsAnchorHref(): string {
  return "/election-plan/workbenches/sherwood#events";
}
