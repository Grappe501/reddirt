import {
  CONTENT_SECTION_LABELS,
  classifyContentSection,
  countySlugFromPath,
  type DeviceClass,
} from "@/lib/analytics/visitor-signals";

export type TrafficWindowDays = 1 | 7 | 30 | 90;

export type CountRow = {
  label: string;
  hits: number;
};

export type PageHitRow = {
  path: string;
  hits: number;
  sessions: number;
};

export type ReferrerRow = {
  referrer: string;
  hits: number;
};

export type CampaignRow = {
  campaign: string;
  hits: number;
};

export type SessionPathRow = {
  steps: string[];
  hitAt: string;
  minutes: number;
};

export type TrendDayRow = {
  date: string;
  pageViews: number;
  sessions: number;
  visitors: number;
};

export type HourRow = {
  hour: number;
  hits: number;
};

export type FunnelRow = {
  label: string;
  count: number;
};

export type PriorWindowDelta = {
  pageViews: number;
  visitors: number;
  sessions: number;
  bounceRate: number | null;
};

export type SiteTrafficSnapshot = {
  days: TrafficWindowDays;
  pageViews: number;
  visitors: number;
  sessions: number;
  pagesPerSession: number;
  avgSessionMinutes: number;
  bounceRate: number | null;
  engagedSessions: number;
  engageRate: number | null;
  singlePageSessions: number;
  formStarts: number;
  formCompletes: number;
  ctaClicks: number;
  pages: PageHitRow[];
  landingPages: PageHitRow[];
  exitPages: PageHitRow[];
  referrers: ReferrerRow[];
  campaigns: CampaignRow[];
  devices: CountRow[];
  locales: CountRow[];
  sections: CountRow[];
  counties: CountRow[];
  forms: Array<{ formType: string; starts: number; completes: number }>;
  ctas: CountRow[];
  daysSeries: TrendDayRow[];
  hours: HourRow[];
  weekdays: CountRow[];
  funnel: FunnelRow[];
  paths: SessionPathRow[];
  prior: PriorWindowDelta | null;
  truncated: boolean;
};

export type TrafficEventRow = {
  name?: string;
  path: string | null;
  sessionId: string | null;
  createdAt: Date;
  payload: unknown;
};

const VISIT_GAP_MS = 30 * 60 * 1000;
const ARKANSAS_TZ = "America/Chicago";
const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function asRecord(payload: unknown): Record<string, unknown> {
  return payload && typeof payload === "object" && !Array.isArray(payload)
    ? (payload as Record<string, unknown>)
    : {};
}

export function publicAnalyticsPath(path: string | null | undefined): string | null {
  const p = path?.trim() || "";
  if (!p.startsWith("/")) return null;
  if (p.startsWith("/admin") || p.startsWith("/api")) return null;
  return p.split("?")[0]?.slice(0, 180) || null;
}

function eventPath(row: TrafficEventRow): string | null {
  const payload = asRecord(row.payload);
  return publicAnalyticsPath(row.path) ?? publicAnalyticsPath(String(payload.pathname ?? ""));
}

function visitorId(row: TrafficEventRow): string {
  return row.sessionId?.trim() || "anon";
}

function eventName(row: TrafficEventRow): string {
  return (row.name ?? "page_view").trim() || "page_view";
}

function deviceFromPayload(payload: Record<string, unknown>): DeviceClass {
  const raw = String(payload.device ?? payload.viewport ?? "").trim();
  if (raw === "phone" || raw === "tablet" || raw === "desktop" || raw === "unknown") return raw;
  return "unknown";
}

function increment(map: Map<string, number>, key: string, by = 1): void {
  map.set(key, (map.get(key) ?? 0) + by);
}

function rankedCountRows(map: Map<string, number>, limit: number): CountRow[] {
  return [...map.entries()]
    .map(([label, hits]) => ({ label, hits }))
    .sort((a, b) => b.hits - a.hits)
    .slice(0, limit);
}

function arkansasParts(at: Date): { date: string; hour: number; weekday: number } {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: ARKANSAS_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    hourCycle: "h23",
    weekday: "short",
  }).formatToParts(at);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  const weekdayName = get("weekday");
  const weekday = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(weekdayName);
  return {
    date: `${get("year")}-${get("month")}-${get("day")}`,
    hour: Number(get("hour")) || 0,
    weekday: weekday >= 0 ? weekday : 0,
  };
}

function fillDays(days: TrafficWindowDays, hits: Map<string, { pageViews: number; sessions: Set<string>; visitors: Set<string> }>): TrendDayRow[] {
  const out: TrendDayRow[] = [];
  const now = Date.now();
  for (let i = days - 1; i >= 0; i -= 1) {
    const at = new Date(now - i * 24 * 60 * 60 * 1000);
    const date = arkansasParts(at).date;
    const row = hits.get(date);
    out.push({
      date,
      pageViews: row?.pageViews ?? 0,
      sessions: row?.sessions.size ?? 0,
      visitors: row?.visitors.size ?? 0,
    });
  }
  return out;
}

type Visit = {
  visitorId: string;
  steps: string[];
  first: Date;
  last: Date;
  device: DeviceClass;
  engaged: boolean;
};

function sessionize(pageViews: Array<{ visitorId: string; path: string; at: Date; device: DeviceClass }>): Visit[] {
  const byVisitor = new Map<string, Array<{ path: string; at: Date; device: DeviceClass }>>();
  for (const row of pageViews) {
    const list = byVisitor.get(row.visitorId) ?? [];
    list.push({ path: row.path, at: row.at, device: row.device });
    byVisitor.set(row.visitorId, list);
  }

  const visits: Visit[] = [];
  for (const [sid, list] of byVisitor) {
    list.sort((a, b) => a.at.getTime() - b.at.getTime());
    let current: Visit | null = null;
    for (const hit of list) {
      if (!current || hit.at.getTime() - current.last.getTime() > VISIT_GAP_MS) {
        current = {
          visitorId: sid,
          steps: [hit.path],
          first: hit.at,
          last: hit.at,
          device: hit.device,
          engaged: false,
        };
        visits.push(current);
        continue;
      }
      if (current.steps[current.steps.length - 1] !== hit.path) current.steps.push(hit.path);
      current.last = hit.at;
      if (current.device === "unknown") current.device = hit.device;
    }
  }
  return visits;
}

export function emptySiteTrafficSnapshot(days: TrafficWindowDays): SiteTrafficSnapshot {
  return {
    days,
    pageViews: 0,
    visitors: 0,
    sessions: 0,
    pagesPerSession: 0,
    avgSessionMinutes: 0,
    bounceRate: null,
    engagedSessions: 0,
    engageRate: null,
    singlePageSessions: 0,
    formStarts: 0,
    formCompletes: 0,
    ctaClicks: 0,
    pages: [],
    landingPages: [],
    exitPages: [],
    referrers: [],
    campaigns: [],
    devices: [],
    locales: [],
    sections: [],
    counties: [],
    forms: [],
    ctas: [],
    daysSeries: fillDays(days, new Map()),
    hours: Array.from({ length: 24 }, (_, hour) => ({ hour, hits: 0 })),
    weekdays: WEEKDAYS.map((label) => ({ label, hits: 0 })),
    funnel: [
      { label: "Sessions", count: 0 },
      { label: "Stayed 15s or opened a second page", count: 0 },
      { label: "Started a form", count: 0 },
      { label: "Finished a form", count: 0 },
    ],
    paths: [],
    prior: null,
    truncated: false,
  };
}

export function aggregateSiteTraffic(
  rows: TrafficEventRow[],
  days: TrafficWindowDays,
  options?: { priorRows?: TrafficEventRow[]; truncated?: boolean },
): SiteTrafficSnapshot {
  const pageHits = new Map<string, { hits: number; sessions: Set<string> }>();
  const landingHits = new Map<string, { hits: number; sessions: Set<string> }>();
  const exitHits = new Map<string, { hits: number; sessions: Set<string> }>();
  const referrerHits = new Map<string, number>();
  const campaignHits = new Map<string, number>();
  const deviceHits = new Map<string, number>();
  const localeHits = new Map<string, number>();
  const sectionHits = new Map<string, number>();
  const countyHits = new Map<string, number>();
  const ctaHits = new Map<string, number>();
  const formStarts = new Map<string, number>();
  const formCompletes = new Map<string, number>();
  const hourHits = Array.from({ length: 24 }, () => 0);
  const weekdayHits = Array.from({ length: 7 }, () => 0);
  const dayHits = new Map<string, { pageViews: number; sessions: Set<string>; visitors: Set<string> }>();
  const engageVisitors = new Set<string>();
  const formStartVisitors = new Set<string>();
  const formCompleteVisitors = new Set<string>();
  const pageViewRows: Array<{ visitorId: string; path: string; at: Date; device: DeviceClass }> = [];
  let pageViews = 0;
  let formStartCount = 0;
  let formCompleteCount = 0;
  let ctaCount = 0;

  for (const row of rows) {
    const payload = asRecord(row.payload);
    const path = eventPath(row);
    const sid = visitorId(row);
    const name = eventName(row);

    if (name === "engage") {
      engageVisitors.add(sid);
      continue;
    }
    if (name === "form_start") {
      formStartCount += 1;
      formStartVisitors.add(sid);
      increment(formStarts, String(payload.formType ?? "form").slice(0, 80));
      continue;
    }
    if (name === "form_complete") {
      formCompleteCount += 1;
      formCompleteVisitors.add(sid);
      increment(formCompletes, String(payload.formType ?? "form").slice(0, 80));
      continue;
    }
    if (name === "cta_click") {
      ctaCount += 1;
      const label = String(payload.label ?? payload.href ?? "button").trim().slice(0, 80) || "button";
      increment(ctaHits, label);
      continue;
    }
    if (name !== "page_view") continue;
    if (!path) continue;

    pageViews += 1;
    pageViewRows.push({ visitorId: sid, path, at: row.createdAt, device: deviceFromPayload(payload) });

    const page = pageHits.get(path) ?? { hits: 0, sessions: new Set<string>() };
    page.hits += 1;
    page.sessions.add(sid);
    pageHits.set(path, page);

    const ref = String(payload.referrer ?? "").trim().slice(0, 200);
    if (ref && !ref.startsWith("/") && !/^\d{1,3}(\.\d{1,3}){3}$/.test(ref)) {
      increment(referrerHits, ref);
    }

    const utm = [payload.utm_source, payload.utm_medium, payload.utm_campaign, payload.utm_content]
      .map((v) => String(v ?? "").trim())
      .filter(Boolean)
      .join(" / ");
    if (utm) increment(campaignHits, utm);

    const locale = String(payload.locale ?? "").trim();
    if (/^[a-z]{2}(?:-[A-Za-z]{2})?$/.test(locale)) increment(localeHits, locale);

    increment(sectionHits, CONTENT_SECTION_LABELS[classifyContentSection(path)]);
    const county = countySlugFromPath(path);
    if (county) increment(countyHits, county);

    const when = arkansasParts(row.createdAt);
    hourHits[when.hour] += 1;
    weekdayHits[when.weekday] += 1;
    const day = dayHits.get(when.date) ?? { pageViews: 0, sessions: new Set<string>(), visitors: new Set<string>() };
    day.pageViews += 1;
    day.visitors.add(sid);
    dayHits.set(when.date, day);
  }

  const visits = sessionize(pageViewRows);
  for (const visit of visits) {
    const minutes = Math.max(0, (visit.last.getTime() - visit.first.getTime()) / 60000);
    visit.engaged = engageVisitors.has(visit.visitorId) || visit.steps.length >= 2 || minutes >= 0.25;
    increment(deviceHits, visit.device === "unknown" ? "Unknown device" : visit.device);
    const landing = landingHits.get(visit.steps[0] ?? "") ?? { hits: 0, sessions: new Set<string>() };
    if (visit.steps[0]) {
      landing.hits += 1;
      landing.sessions.add(visit.visitorId);
      landingHits.set(visit.steps[0], landing);
    }
    const exitPath = visit.steps[visit.steps.length - 1] ?? "";
    const exit = exitHits.get(exitPath) ?? { hits: 0, sessions: new Set<string>() };
    if (exitPath) {
      exit.hits += 1;
      exit.sessions.add(visit.visitorId);
      exitHits.set(exitPath, exit);
    }
    const startDay = arkansasParts(visit.first).date;
    const day = dayHits.get(startDay) ?? { pageViews: 0, sessions: new Set<string>(), visitors: new Set<string>() };
    day.sessions.add(`${visit.visitorId}:${visit.first.toISOString()}`);
    dayHits.set(startDay, day);
  }

  const visitors = new Set(pageViewRows.map((r) => r.visitorId)).size;
  const sessions = visits.length;
  const singlePageSessions = visits.filter((v) => v.steps.length === 1).length;
  const engagedSessions = visits.filter((v) => v.engaged).length;
  const durationVisits = visits.filter((v) => v.steps.length >= 2 || v.last.getTime() > v.first.getTime());
  const avgSessionMinutes =
    durationVisits.length === 0
      ? 0
      : durationVisits.reduce((sum, v) => sum + (v.last.getTime() - v.first.getTime()) / 60000, 0) /
        durationVisits.length;

  const toPageRows = (map: Map<string, { hits: number; sessions: Set<string> }>, limit: number): PageHitRow[] =>
    [...map.entries()]
      .map(([path, v]) => ({ path, hits: v.hits, sessions: v.sessions.size }))
      .sort((a, b) => b.hits - a.hits)
      .slice(0, limit);

  const formTypes = new Set([...formStarts.keys(), ...formCompletes.keys()]);

  const snapshot: SiteTrafficSnapshot = {
    days,
    pageViews,
    visitors,
    sessions,
    pagesPerSession: sessions ? pageViews / sessions : 0,
    avgSessionMinutes,
    bounceRate: sessions ? singlePageSessions / sessions : null,
    engagedSessions,
    engageRate: sessions ? engagedSessions / sessions : null,
    singlePageSessions,
    formStarts: formStartCount,
    formCompletes: formCompleteCount,
    ctaClicks: ctaCount,
    pages: toPageRows(pageHits, 30),
    landingPages: toPageRows(landingHits, 12),
    exitPages: toPageRows(exitHits, 12),
    referrers: [...referrerHits.entries()]
      .map(([referrer, hits]) => ({ referrer, hits }))
      .sort((a, b) => b.hits - a.hits)
      .slice(0, 15),
    campaigns: [...campaignHits.entries()]
      .map(([campaign, hits]) => ({ campaign, hits }))
      .sort((a, b) => b.hits - a.hits)
      .slice(0, 12),
    devices: rankedCountRows(deviceHits, 6),
    locales: rankedCountRows(localeHits, 8),
    sections: rankedCountRows(sectionHits, 12),
    counties: rankedCountRows(countyHits, 15),
    forms: [...formTypes]
      .map((formType) => ({
        formType,
        starts: formStarts.get(formType) ?? 0,
        completes: formCompletes.get(formType) ?? 0,
      }))
      .sort((a, b) => b.completes + b.starts - (a.completes + a.starts))
      .slice(0, 12),
    ctas: rankedCountRows(ctaHits, 12),
    daysSeries: fillDays(days, dayHits),
    hours: hourHits.map((hits, hour) => ({ hour, hits })),
    weekdays: WEEKDAYS.map((label, i) => ({ label, hits: weekdayHits[i] ?? 0 })),
    funnel: [
      { label: "Sessions", count: sessions },
      { label: "Stayed 15s or opened a second page", count: engagedSessions },
      { label: "Started a form", count: formStartVisitors.size },
      { label: "Finished a form", count: formCompleteVisitors.size },
    ],
    paths: visits
      .filter((v) => v.steps.length >= 2)
      .sort((a, b) => b.last.getTime() - a.last.getTime())
      .slice(0, 20)
      .map((v) => ({
        steps: v.steps.slice(0, 8),
        hitAt: v.last.toISOString(),
        minutes: Math.max(0, (v.last.getTime() - v.first.getTime()) / 60000),
      })),
    prior: null,
    truncated: Boolean(options?.truncated),
  };

  if (options?.priorRows) {
    const prior = aggregateSiteTraffic(options.priorRows, days);
    snapshot.prior = {
      pageViews: prior.pageViews,
      visitors: prior.visitors,
      sessions: prior.sessions,
      bounceRate: prior.bounceRate,
    };
  }

  return snapshot;
}

export function trafficBriefInput(snapshot: SiteTrafficSnapshot): string {
  return JSON.stringify(
    {
      windowDays: snapshot.days,
      pageViews: snapshot.pageViews,
      visitors: snapshot.visitors,
      sessions: snapshot.sessions,
      pagesPerSession: Number(snapshot.pagesPerSession.toFixed(2)),
      avgSessionMinutes: Number(snapshot.avgSessionMinutes.toFixed(2)),
      bounceRate: snapshot.bounceRate == null ? null : Number((snapshot.bounceRate * 100).toFixed(1)),
      engageRate: snapshot.engageRate == null ? null : Number((snapshot.engageRate * 100).toFixed(1)),
      formStarts: snapshot.formStarts,
      formCompletes: snapshot.formCompletes,
      ctaClicks: snapshot.ctaClicks,
      prior: snapshot.prior,
      topPages: snapshot.pages.slice(0, 12),
      landingPages: snapshot.landingPages.slice(0, 8),
      exitPages: snapshot.exitPages.slice(0, 8),
      sections: snapshot.sections,
      counties: snapshot.counties.slice(0, 10),
      devices: snapshot.devices,
      referrers: snapshot.referrers.slice(0, 10),
      campaigns: snapshot.campaigns.slice(0, 8),
      forms: snapshot.forms,
      daily: snapshot.daysSeries,
      recentPaths: snapshot.paths.slice(0, 12).map((p) => p.steps.join(" → ")),
    },
    null,
    2,
  );
}

export function pctChange(current: number, prior: number): number | null {
  if (prior <= 0) return current > 0 ? 100 : null;
  return ((current - prior) / prior) * 100;
}
