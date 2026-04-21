import type { EventItem } from "@/content/types";

export function formatEventWhen(ev: EventItem): { primary: string; secondary?: string } {
  const start = new Date(ev.startsAt);
  const end = ev.endsAt ? new Date(ev.endsAt) : null;
  const dateFmt = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: ev.timezone,
  });
  const timeFmt = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: ev.timezone,
    timeZoneName: "short",
  });
  const primary = dateFmt.format(start);
  const startT = timeFmt.format(start);
  const secondary = end ? `${startT} – ${timeFmt.format(end)}` : startT;
  return { primary, secondary };
}
