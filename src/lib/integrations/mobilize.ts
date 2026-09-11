import { getMobilizeOrgId, getMobilizeOrgSlug, mobilizeFeedUrl } from "@/config/mobilize";

const MOBILIZE_API = "https://api.mobilize.us/v1";
const TZ = "America/Chicago";

export type PublicMobilizeShift = {
  id: string;
  title: string;
  signupUrl: string;
  locationLabel: string;
  citySort: string;
  whenLabel: string;
  startsAtMs: number;
};

export type PublicMobilizeBoard = {
  feedUrl: string | null;
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

function nextUpcomingSlot(slots: MobilizeTimeslot[] | null | undefined, nowSec: number): MobilizeTimeslot | null {
  const open = (slots ?? [])
    .filter((s) => s.start_date >= nowSec && !s.is_full)
    .sort((a, b) => a.start_date - b.start_date);
  return open[0] ?? null;
}

function locationLabel(event: MobilizeEvent): { label: string; sort: string } {
  if (event.is_virtual) return { label: "Online", sort: "zzz-online" };
  const city = event.location?.locality?.trim();
  const region = event.location?.region?.trim();
  const venue = event.location?.venue?.trim();
  if (city && region) {
    return { label: venue ? `${city}, ${region} · ${venue}` : `${city}, ${region}`, sort: `${city}, ${region}` };
  }
  if (city) return { label: venue ? `${city} · ${venue}` : city, sort: city };
  if (venue) return { label: venue, sort: venue };
  return { label: "Location TBA", sort: "zzz-tba" };
}

function whenLabel(startSec: number): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: TZ,
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(startSec * 1000));
}

async function resolveOrgId(): Promise<{ id: number; feedUrl: string | null } | null> {
  const configured = getMobilizeOrgId();
  const slug = getMobilizeOrgSlug();
  if (configured) {
    return { id: configured, feedUrl: slug ? mobilizeFeedUrl(slug) : null };
  }
  if (!slug) return null;

  const page = await fetch(mobilizeFeedUrl(slug), {
    next: { revalidate: 300 },
    headers: { Accept: "text/html" },
  });
  if (!page.ok) return null;
  const html = await page.text();
  const match =
    html.match(/"organization_id"\s*:\s*(\d+)/) ??
    html.match(/organizations\/(\d+)/) ??
    html.match(/organizationId["']?\s*[:=]\s*["']?(\d+)/i);
  if (!match) return null;
  return { id: Number(match[1]), feedUrl: mobilizeFeedUrl(slug) };
}

async function fetchOrgEvents(orgId: number): Promise<MobilizeEvent[]> {
  const out: MobilizeEvent[] = [];
  let url: string | null =
    `${MOBILIZE_API}/organizations/${orgId}/events?timeslot_start=gte_now&per_page=50`;

  for (let i = 0; i < 6 && url; i += 1) {
    const res = await fetch(url, { next: { revalidate: 300 }, headers: { Accept: "application/json" } });
    if (!res.ok) break;
    const body = (await res.json()) as MobilizeListResponse;
    out.push(...(body.data ?? []));
    url = body.next ?? null;
  }
  return out;
}

export async function loadPublicMobilizeBoard(): Promise<PublicMobilizeBoard> {
  try {
    const org = await resolveOrgId();
    if (!org) {
      return { feedUrl: null, shifts: [], error: null };
    }

    const nowSec = Math.floor(Date.now() / 1000);
    const events = await fetchOrgEvents(org.id);
    const shifts: PublicMobilizeShift[] = [];

    for (const event of events) {
      const slot = nextUpcomingSlot(event.timeslots, nowSec);
      if (!slot) continue;
      const signupUrl = event.browser_url?.trim();
      if (!signupUrl || !signupUrl.includes("mobilize.us")) continue;
      const loc = locationLabel(event);
      shifts.push({
        id: `${event.id}-${slot.id}`,
        title: event.title,
        signupUrl,
        locationLabel: loc.label,
        citySort: loc.sort,
        whenLabel: whenLabel(slot.start_date),
        startsAtMs: slot.start_date * 1000,
      });
    }

    shifts.sort((a, b) => a.citySort.localeCompare(b.citySort) || a.startsAtMs - b.startsAtMs);
    return { feedUrl: org.feedUrl, shifts, error: null };
  } catch {
    return { feedUrl: getMobilizeOrgSlug() ? mobilizeFeedUrl(getMobilizeOrgSlug()!) : null, shifts: [], error: "unavailable" };
  }
}
