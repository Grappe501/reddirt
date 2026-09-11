import { getMobilizeOrgId, mobilizeFeedUrl } from "@/config/mobilize";

const MOBILIZE_API = "https://api.mobilize.us/v1";
const TZ = "America/Chicago";

export type PublicMobilizeShiftKind = "help" | "attend";

export type PublicMobilizeShift = {
  id: string;
  title: string;
  signupUrl: string;
  locationLabel: string;
  city: string;
  venue: string | null;
  citySort: string;
  dateHeadline: string;
  timeHeadline: string;
  whenLabel: string;
  startsAtMs: number;
  kind: PublicMobilizeShiftKind;
};

export type PublicMobilizeBoard = {
  feedUrl: string;
  shifts: PublicMobilizeShift[];
  error: string | null;
};

type MobilizeLocation = {
  venue?: string | null;
  locality?: string | null;
  region?: string | null;
};

type MobilizeTimeslot = {
  id: number;
  start_date: number;
  end_date: number;
  is_full?: boolean;
};

type MobilizeEvent = {
  id: number;
  title: string;
  browser_url?: string | null;
  is_virtual?: boolean;
  location?: MobilizeLocation | null;
  timeslots?: MobilizeTimeslot[] | null;
};

type MobilizeListResponse = {
  data?: MobilizeEvent[];
  next?: string | null;
};

function upcomingSlots(slots: MobilizeTimeslot[] | null | undefined, nowSec: number): MobilizeTimeslot[] {
  return (slots ?? [])
    .filter((s) => s.start_date >= nowSec && !s.is_full)
    .sort((a, b) => a.start_date - b.start_date);
}

function locationParts(event: MobilizeEvent): { city: string; venue: string | null; label: string; sort: string } {
  if (event.is_virtual) return { city: "Online", venue: null, label: "Online", sort: "zzz-online" };
  const city = event.location?.locality?.trim() || "";
  const region = event.location?.region?.trim() || "";
  const venue = event.location?.venue?.trim() || null;
  if (city && region) {
    return {
      city,
      venue,
      label: venue ? `${city}, ${region} · ${venue}` : `${city}, ${region}`,
      sort: `${city}, ${region}`,
    };
  }
  if (city) {
    return { city, venue, label: venue ? `${city} · ${venue}` : city, sort: city };
  }
  if (venue) return { city: venue, venue, label: venue, sort: venue };
  return { city: "Location TBA", venue: null, label: "Location TBA", sort: "zzz-tba" };
}

function formatInCentral(startSec: number, endSec?: number): { dateHeadline: string; timeHeadline: string; whenLabel: string } {
  const start = new Date(startSec * 1000);
  const dateHeadline = new Intl.DateTimeFormat("en-US", {
    timeZone: TZ,
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(start);
  const timeFmt = new Intl.DateTimeFormat("en-US", {
    timeZone: TZ,
    hour: "numeric",
    minute: "2-digit",
  });
  const timeHeadline = endSec
    ? `${timeFmt.format(start)}–${timeFmt.format(new Date(endSec * 1000))} Central`
    : `${timeFmt.format(start)} Central`;
  return { dateHeadline, timeHeadline, whenLabel: `${dateHeadline} · ${timeHeadline}` };
}

function shiftKind(title: string): PublicMobilizeShiftKind {
  return /\b(volunteer|help at|shift|table|greet)\b/i.test(title) ? "help" : "attend";
}

function displayTitle(title: string): string {
  return title.replace(/^\s*(volunteer|attend)\s*:\s*/i, "").trim() || title;
}

async function fetchOrgEvents(orgId: number): Promise<MobilizeEvent[]> {
  const out: MobilizeEvent[] = [];
  let url: string | null = `${MOBILIZE_API}/organizations/${orgId}/events?timeslot_start=gte_now&per_page=50`;

  for (let i = 0; i < 6 && url; i += 1) {
    const res = await fetch(url, { next: { revalidate: 120 }, headers: { Accept: "application/json" } });
    if (!res.ok) break;
    const body = (await res.json()) as MobilizeListResponse;
    out.push(...(body.data ?? []));
    url = body.next ?? null;
  }
  return out;
}

export async function loadPublicMobilizeBoard(): Promise<PublicMobilizeBoard> {
  const feedUrl = mobilizeFeedUrl();
  try {
    const nowSec = Math.floor(Date.now() / 1000);
    const events = await fetchOrgEvents(getMobilizeOrgId());
    const shifts: PublicMobilizeShift[] = [];

    for (const event of events) {
      const signupUrl = event.browser_url?.trim();
      if (!signupUrl || !signupUrl.includes("mobilize.us")) continue;
      const loc = locationParts(event);
      for (const slot of upcomingSlots(event.timeslots, nowSec)) {
        const when = formatInCentral(slot.start_date, slot.end_date);
        shifts.push({
          id: `${event.id}-${slot.id}`,
          title: displayTitle(event.title),
          signupUrl,
          locationLabel: loc.label,
          city: loc.city,
          venue: loc.venue,
          citySort: loc.sort,
          dateHeadline: when.dateHeadline,
          timeHeadline: when.timeHeadline,
          whenLabel: when.whenLabel,
          startsAtMs: slot.start_date * 1000,
          kind: shiftKind(event.title),
        });
      }
    }

    shifts.sort((a, b) => a.startsAtMs - b.startsAtMs || a.citySort.localeCompare(b.citySort));
    return { feedUrl, shifts, error: null };
  } catch {
    return { feedUrl, shifts: [], error: "unavailable" };
  }
}
