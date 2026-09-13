import {
  buildDeviceSource,
  buildHeatCells,
  buildHypotheses,
  buildLandingGrades,
  buildPathClusters,
  buildPulse,
  emptyPulse,
  type DeviceSourceRow,
  type HeatCell,
  type Hypothesis,
  type LandingGrade,
  type PathCluster,
  type TrafficPulse,
} from "@/lib/analytics/site-traffic-depth";
import { CHANNEL_LABELS, classifyTrafficSource, type TrafficChannelId } from "@/lib/analytics/traffic-source";
import {
  CONTENT_SECTION_LABELS,
  classifyContentSection,
  countySlugFromPath,
  isCampaignAnalyticsPath,
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

export type ChannelRow = {
  id: TrafficChannelId;
  label: string;
  sessions: number;
  visitors: number;
  pageViews: number;
  bounceSessions: number;
  bounceRate: number | null;
  engagedSessions: number;
  formCompletes: number;
};

export type TransitionRow = {
  from: string;
  to: string;
  hits: number;
};

export type VisitorJourney = {
  label: string;
  startedAt: string;
  endedAt: string;
  minutes: number;
  source: TrafficChannelId;
  sourceLabel: string;
  referrer: string | null;
  campaign: string | null;
  landing: string;
  exit: string;
  steps: string[];
  pageViews: number;
  device: string;
  bounced: boolean;
  engaged: boolean;
  formStarted: boolean;
  formCompleted: boolean;
  ctaClicked: boolean;
  returning: boolean;
};

export type SeoDesk = {
  sessions: number;
  share: number | null;
  bounceRate: number | null;
  engageRate: number | null;
  engines: CountRow[];
  landings: PageHitRow[];
  nextPages: TransitionRow[];
  exits: PageHitRow[];
  reads: string[];
};

export type PageIntelRow = {
  path: string;
  hits: number;
  visitors: number;
  landings: number;
  exits: number;
  bounceLandings: number;
  landingBounceRate: number | null;
  next: string | null;
  nextHits: number;
  topSource: string | null;
};

export type SourceLandingRow = {
  source: string;
  landing: string;
  sessions: number;
  bounced: number;
  bounceRate: number | null;
};

export type DepthRow = {
  label: string;
  sessions: number;
};

export type UtmRow = {
  source: string;
  medium: string;
  campaign: string;
  hits: number;
};

export type ConversionPathRow = {
  steps: string[];
  count: number;
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
  channels: ChannelRow[];
  transitions: TransitionRow[];
  landingNext: TransitionRow[];
  journeys: VisitorJourney[];
  journeyLimit: number;
  journeysTruncated: boolean;
  seo: SeoDesk;
  analysis: string[];
  pageIntel: PageIntelRow[];
  sourceLandings: SourceLandingRow[];
  depth: DepthRow[];
  utmRows: UtmRow[];
  conversionPaths: ConversionPathRow[];
  newVisitors: number;
  returningVisitors: number;
  returningSessions: number;
  deepSessions: number;
  landingGrades: LandingGrade[];
  pathClusters: PathCluster[];
  heat: HeatCell[];
  deviceSource: DeviceSourceRow[];
  pulse: TrafficPulse;
  hypotheses: Hypothesis[];
  medianSessionMinutes: number;
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
  const p = path?.trim().split("?")[0]?.slice(0, 180) || "";
  if (!isCampaignAnalyticsPath(p)) return null;
  return p;
}

export function visitorLogLimit(days: TrafficWindowDays): number {
  if (days === 1) return 500;
  if (days === 7) return 80;
  return 40;
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
  referrer: string | null;
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
  utmContent: string;
  formStarted: boolean;
  formCompleted: boolean;
  ctaClicked: boolean;
};

type PageHit = {
  visitorId: string;
  path: string;
  at: Date;
  device: DeviceClass;
  referrer: string;
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
  utmContent: string;
};

function sessionize(pageViews: PageHit[]): Visit[] {
  const byVisitor = new Map<string, PageHit[]>();
  for (const row of pageViews) {
    const list = byVisitor.get(row.visitorId) ?? [];
    list.push(row);
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
          referrer: hit.referrer || null,
          utmSource: hit.utmSource,
          utmMedium: hit.utmMedium,
          utmCampaign: hit.utmCampaign,
          utmContent: hit.utmContent,
          formStarted: false,
          formCompleted: false,
          ctaClicked: false,
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

function emptySeoDesk(): SeoDesk {
  return {
    sessions: 0,
    share: null,
    bounceRate: null,
    engageRate: null,
    engines: [],
    landings: [],
    nextPages: [],
    exits: [],
    reads: ["No search-referred visits in this window yet. Google still sends google.com as the referrer — the search words themselves are not available."],
  };
}

function emptyChannels(): ChannelRow[] {
  return (Object.keys(CHANNEL_LABELS) as TrafficChannelId[]).map((id) => ({
    id,
    label: CHANNEL_LABELS[id],
    sessions: 0,
    visitors: 0,
    pageViews: 0,
    bounceSessions: 0,
    bounceRate: null,
    engagedSessions: 0,
    formCompletes: 0,
  }));
}

function campaignTag(visit: Visit): string | null {
  const parts = [visit.utmSource, visit.utmMedium, visit.utmCampaign, visit.utmContent].filter(Boolean);
  return parts.length ? parts.join(" / ") : null;
}

function buildSeoDesk(visits: Visit[], sessions: number): SeoDesk {
  const organic = visits.filter((v) => classifyTrafficSource({
    referrer: v.referrer,
    utmSource: v.utmSource,
    utmMedium: v.utmMedium,
    utmCampaign: v.utmCampaign,
  }).channel === "search");
  if (!organic.length) return emptySeoDesk();

  const engines = new Map<string, number>();
  const landings = new Map<string, { hits: number; sessions: Set<string> }>();
  const exits = new Map<string, { hits: number; sessions: Set<string> }>();
  const nextPages: TransitionRow[] = [];
  const nextMap = new Map<string, number>();
  let bounce = 0;
  let engaged = 0;

  for (const visit of organic) {
    const source = classifyTrafficSource({
      referrer: visit.referrer,
      utmSource: visit.utmSource,
      utmMedium: visit.utmMedium,
      utmCampaign: visit.utmCampaign,
    });
    increment(engines, source.engine ?? "Search");
    const landing = visit.steps[0] ?? "";
    if (landing) {
      const row = landings.get(landing) ?? { hits: 0, sessions: new Set<string>() };
      row.hits += 1;
      row.sessions.add(visit.visitorId);
      landings.set(landing, row);
    }
    const exit = visit.steps[visit.steps.length - 1] ?? "";
    if (exit) {
      const row = exits.get(exit) ?? { hits: 0, sessions: new Set<string>() };
      row.hits += 1;
      row.sessions.add(visit.visitorId);
      exits.set(exit, row);
    }
    if (visit.steps.length >= 2 && landing) {
      const key = `${landing}→${visit.steps[1]}`;
      increment(nextMap, key);
    }
    if (visit.steps.length === 1) bounce += 1;
    if (visit.engaged) engaged += 1;
  }

  for (const [key, hits] of nextMap) {
    const [from, to] = key.split("→");
    if (from && to) nextPages.push({ from, to, hits });
  }
  nextPages.sort((a, b) => b.hits - a.hits);

  const bounceRate = organic.length ? bounce / organic.length : null;
  const engageRate = organic.length ? engaged / organic.length : null;
  const topLanding = [...landings.entries()].sort((a, b) => b[1].hits - a[1].hits)[0];
  const reads: string[] = [];
  reads.push(
    `${organic.length} session${organic.length === 1 ? "" : "s"} arrived from search (${sessions ? Math.round((organic.length / sessions) * 100) : 0}% of visits).`,
  );
  if (bounceRate != null) {
    reads.push(
      bounceRate >= 0.7
        ? `${Math.round(bounceRate * 100)}% of search visits left after one page — the landing page is not holding SEO traffic.`
        : `${Math.round((1 - bounceRate) * 100)}% of search visits opened a second page.`,
    );
  }
  if (topLanding) {
    reads.push(`Top SEO landing: ${topLanding[0]} (${topLanding[1].hits} search session${topLanding[1].hits === 1 ? "" : "s"}).`);
  }
  if (nextPages[0]) {
    reads.push(`Most common next click from search: ${nextPages[0].from} → ${nextPages[0].to}.`);
  } else {
    reads.push("Search visitors are not moving to a second campaign page in this window.");
  }

  const toPageRows = (map: Map<string, { hits: number; sessions: Set<string> }>, limit: number): PageHitRow[] =>
    [...map.entries()]
      .map(([path, v]) => ({ path, hits: v.hits, sessions: v.sessions.size }))
      .sort((a, b) => b.hits - a.hits)
      .slice(0, limit);

  return {
    sessions: organic.length,
    share: sessions ? organic.length / sessions : null,
    bounceRate,
    engageRate,
    engines: rankedCountRows(engines, 8),
    landings: toPageRows(landings, 12),
    nextPages: nextPages.slice(0, 12),
    exits: toPageRows(exits, 8),
    reads: reads.slice(0, 6),
  };
}

function buildAnalysis(input: {
  sessions: number;
  visitors: number;
  bounceRate: number | null;
  channels: ChannelRow[];
  seo: SeoDesk;
  transitions: TransitionRow[];
  journeys: VisitorJourney[];
}): string[] {
  const lines: string[] = [];
  if (!input.sessions) {
    return ["No public campaign visits in this window yet. Share a live page and the desk will start reading journeys."];
  }

  const lead = [...input.channels].sort((a, b) => b.sessions - a.sessions)[0];
  if (lead && lead.sessions > 0) {
    lines.push(
      `${lead.label} is the main door (${lead.sessions} of ${input.sessions} sessions). ${
        lead.bounceRate != null && lead.bounceRate >= 0.65
          ? "Those visitors are mostly bouncing."
          : "That source is holding some people past the first page."
      }`,
    );
  }

  const search = input.channels.find((row) => row.id === "search");
  if (!search || search.sessions === 0) {
    lines.push("SEO is not sending measurable referred visits yet — or Google is not passing a referrer on these hits. Direct traffic can hide some search.");
  } else {
    lines.push(input.seo.reads[0] ?? `${search.sessions} search sessions landed.`);
    if (input.seo.reads[1]) lines.push(input.seo.reads[1]);
  }

  if (input.transitions[0]) {
    lines.push(`The strongest on-site move is ${input.transitions[0].from} → ${input.transitions[0].to} (${input.transitions[0].hits} times).`);
  } else {
    lines.push("Almost no one is clicking through to a second page. The first page they see is the whole visit.");
  }

  const converted = input.journeys.filter((row) => row.formCompleted).length;
  if (converted) {
    lines.push(`${converted} visit${converted === 1 ? "" : "s"} finished a form. Follow the path those people used and put that next step on the leaky landings.`);
  } else if (input.journeys.some((row) => row.formStarted)) {
    lines.push("People started a form and did not finish. The leak is on the form, not the homepage.");
  }

  const returning = input.journeys.filter((row) => row.returning).length;
  if (returning) {
    lines.push(`${returning} visit${returning === 1 ? "" : "s"} came from someone who already showed up in this window.`);
  }

  return lines.slice(0, 7);
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
    channels: emptyChannels(),
    transitions: [],
    landingNext: [],
    journeys: [],
    journeyLimit: visitorLogLimit(days),
    journeysTruncated: false,
    seo: emptySeoDesk(),
    analysis: ["No public campaign visits in this window yet. Share a live page and the desk will start reading journeys."],
    pageIntel: [],
    sourceLandings: [],
    depth: [
      { label: "1 page", sessions: 0 },
      { label: "2 pages", sessions: 0 },
      { label: "3 pages", sessions: 0 },
      { label: "4+ pages", sessions: 0 },
    ],
    utmRows: [],
    conversionPaths: [],
    newVisitors: 0,
    returningVisitors: 0,
    returningSessions: 0,
    deepSessions: 0,
    landingGrades: [],
    pathClusters: [],
    heat: [],
    deviceSource: [],
    pulse: emptyPulse(),
    hypotheses: buildHypotheses({
      sessions: 0,
      bounceRate: null,
      seoBounce: null,
      seoSessions: 0,
      formStarts: 0,
      formCompletes: 0,
      deepSessions: 0,
      topLanding: null,
      topExit: null,
      leadChannel: null,
      pulse: emptyPulse(),
      grades: [],
      clusters: [],
    }),
    medianSessionMinutes: 0,
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
  const pageViewRows: PageHit[] = [];
  const sideEvents: Array<{
    visitorId: string;
    at: Date;
    name: string;
  }> = [];
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
      sideEvents.push({ visitorId: sid, at: row.createdAt, name });
      continue;
    }
    if (name === "form_start") {
      formStartCount += 1;
      formStartVisitors.add(sid);
      increment(formStarts, String(payload.formType ?? "form").slice(0, 80));
      sideEvents.push({ visitorId: sid, at: row.createdAt, name });
      continue;
    }
    if (name === "form_complete") {
      formCompleteCount += 1;
      formCompleteVisitors.add(sid);
      increment(formCompletes, String(payload.formType ?? "form").slice(0, 80));
      sideEvents.push({ visitorId: sid, at: row.createdAt, name });
      continue;
    }
    if (name === "cta_click") {
      ctaCount += 1;
      const label = String(payload.label ?? payload.href ?? "button").trim().slice(0, 80) || "button";
      increment(ctaHits, label);
      sideEvents.push({ visitorId: sid, at: row.createdAt, name });
      continue;
    }
    if (name !== "page_view") continue;
    if (!path) continue;

    pageViews += 1;
    pageViewRows.push({
      visitorId: sid,
      path,
      at: row.createdAt,
      device: deviceFromPayload(payload),
      referrer: String(payload.referrer ?? "").trim().slice(0, 200),
      utmSource: String(payload.utm_source ?? "").trim(),
      utmMedium: String(payload.utm_medium ?? "").trim(),
      utmCampaign: String(payload.utm_campaign ?? "").trim(),
      utmContent: String(payload.utm_content ?? "").trim(),
    });

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
  for (const event of sideEvents) {
    const match = [...visits]
      .reverse()
      .find(
        (visit) =>
          visit.visitorId === event.visitorId &&
          event.at.getTime() >= visit.first.getTime() - 5_000 &&
          event.at.getTime() <= visit.last.getTime() + VISIT_GAP_MS,
      );
    if (!match) continue;
    if (event.name === "form_start") match.formStarted = true;
    if (event.name === "form_complete") match.formCompleted = true;
    if (event.name === "cta_click") match.ctaClicked = true;
    if (event.name === "engage") match.engaged = true;
  }
  const visitorVisitCount = new Map<string, number>();
  for (const visit of visits) increment(visitorVisitCount, visit.visitorId);
  for (const visit of visits) {
    const minutes = Math.max(0, (visit.last.getTime() - visit.first.getTime()) / 60000);
    visit.engaged = visit.engaged || engageVisitors.has(visit.visitorId) || visit.steps.length >= 2 || minutes >= 0.25;
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

  const channelStats = new Map<
    TrafficChannelId,
    { visitors: Set<string>; pageViews: number; bounce: number; engaged: number; forms: number; sessions: number }
  >();
  for (const id of Object.keys(CHANNEL_LABELS) as TrafficChannelId[]) {
    channelStats.set(id, { visitors: new Set(), pageViews: 0, bounce: 0, engaged: 0, forms: 0, sessions: 0 });
  }
  const transitionHits = new Map<string, number>();
  const landingNextHits = new Map<string, number>();
  for (const visit of visits) {
    const source = classifyTrafficSource({
      referrer: visit.referrer,
      utmSource: visit.utmSource,
      utmMedium: visit.utmMedium,
      utmCampaign: visit.utmCampaign,
    });
    const bucket = channelStats.get(source.channel);
    if (bucket) {
      bucket.sessions += 1;
      bucket.visitors.add(visit.visitorId);
      bucket.pageViews += visit.steps.length;
      if (visit.steps.length === 1) bucket.bounce += 1;
      if (visit.engaged) bucket.engaged += 1;
      if (visit.formCompleted) bucket.forms += 1;
    }
    for (let i = 0; i < visit.steps.length - 1; i += 1) {
      increment(transitionHits, `${visit.steps[i]}→${visit.steps[i + 1]}`);
    }
    if (visit.steps.length >= 2) increment(landingNextHits, `${visit.steps[0]}→${visit.steps[1]}`);
  }
  const channels: ChannelRow[] = (Object.keys(CHANNEL_LABELS) as TrafficChannelId[])
    .map((id) => {
      const row = channelStats.get(id)!;
      return {
        id,
        label: CHANNEL_LABELS[id],
        sessions: row.sessions,
        visitors: row.visitors.size,
        pageViews: row.pageViews,
        bounceSessions: row.bounce,
        bounceRate: row.sessions ? row.bounce / row.sessions : null,
        engagedSessions: row.engaged,
        formCompletes: row.forms,
      };
    })
    .sort((a, b) => b.sessions - a.sessions);
  const toTransitions = (map: Map<string, number>, limit: number): TransitionRow[] =>
    [...map.entries()]
      .map(([key, hits]) => {
        const [from, to] = key.split("→");
        return { from: from ?? "", to: to ?? "", hits };
      })
      .filter((row) => row.from && row.to)
      .sort((a, b) => b.hits - a.hits)
      .slice(0, limit);

  const journeyCap = visitorLogLimit(days);
  const journeys: VisitorJourney[] = [...visits]
    .sort((a, b) => b.first.getTime() - a.first.getTime())
    .slice(0, journeyCap)
    .map((visit, index) => {
      const source = classifyTrafficSource({
        referrer: visit.referrer,
        utmSource: visit.utmSource,
        utmMedium: visit.utmMedium,
        utmCampaign: visit.utmCampaign,
      });
      return {
        label: `Visit ${index + 1}`,
        startedAt: visit.first.toISOString(),
        endedAt: visit.last.toISOString(),
        minutes: Math.max(0, (visit.last.getTime() - visit.first.getTime()) / 60000),
        source: source.channel,
        sourceLabel: source.label,
        referrer: visit.referrer,
        campaign: campaignTag(visit),
        landing: visit.steps[0] ?? "/",
        exit: visit.steps[visit.steps.length - 1] ?? "/",
        steps: visit.steps.slice(0, 24),
        pageViews: visit.steps.length,
        device: visit.device === "unknown" ? "Unknown" : visit.device,
        bounced: visit.steps.length === 1,
        engaged: visit.engaged,
        formStarted: visit.formStarted,
        formCompleted: visit.formCompleted,
        ctaClicked: visit.ctaClicked,
        returning: (visitorVisitCount.get(visit.visitorId) ?? 1) > 1,
      };
    });
  const pageIntelMap = new Map<
    string,
    {
      hits: number;
      visitors: Set<string>;
      landings: number;
      exits: number;
      bounceLandings: number;
      next: Map<string, number>;
      sources: Map<string, number>;
    }
  >();
  const sourceLandingMap = new Map<string, { sessions: number; bounced: number }>();
  const conversionPathMap = new Map<string, number>();
  const utmMap = new Map<string, number>();
  let depth1 = 0;
  let depth2 = 0;
  let depth3 = 0;
  let depth4 = 0;
  for (const visit of visits) {
    const source = classifyTrafficSource({
      referrer: visit.referrer,
      utmSource: visit.utmSource,
      utmMedium: visit.utmMedium,
      utmCampaign: visit.utmCampaign,
    });
    if (visit.steps.length === 1) depth1 += 1;
    else if (visit.steps.length === 2) depth2 += 1;
    else if (visit.steps.length === 3) depth3 += 1;
    else depth4 += 1;
    const landKey = `${source.label}||${visit.steps[0] ?? "/"}`;
    const landRow = sourceLandingMap.get(landKey) ?? { sessions: 0, bounced: 0 };
    landRow.sessions += 1;
    if (visit.steps.length === 1) landRow.bounced += 1;
    sourceLandingMap.set(landKey, landRow);
    if (visit.utmSource || visit.utmMedium || visit.utmCampaign) {
      increment(utmMap, `${visit.utmSource || "—"}|${visit.utmMedium || "—"}|${visit.utmCampaign || "—"}`);
    }
    if (visit.formCompleted) increment(conversionPathMap, visit.steps.slice(0, 8).join(" → ") || "/");
    for (const [index, path] of visit.steps.entries()) {
      const row = pageIntelMap.get(path) ?? {
        hits: 0,
        visitors: new Set<string>(),
        landings: 0,
        exits: 0,
        bounceLandings: 0,
        next: new Map<string, number>(),
        sources: new Map<string, number>(),
      };
      row.hits += 1;
      row.visitors.add(visit.visitorId);
      if (index === 0) {
        row.landings += 1;
        increment(row.sources, source.label);
        if (visit.steps.length === 1) row.bounceLandings += 1;
      }
      if (index === visit.steps.length - 1) row.exits += 1;
      const nextPath = visit.steps[index + 1];
      if (nextPath) increment(row.next, nextPath);
      pageIntelMap.set(path, row);
    }
  }
  const pageIntel: PageIntelRow[] = [...pageIntelMap.entries()]
    .map(([path, row]) => {
      const next = [...row.next.entries()].sort((a, b) => b[1] - a[1])[0];
      const topSource = [...row.sources.entries()].sort((a, b) => b[1] - a[1])[0];
      return {
        path,
        hits: row.hits,
        visitors: row.visitors.size,
        landings: row.landings,
        exits: row.exits,
        bounceLandings: row.bounceLandings,
        landingBounceRate: row.landings ? row.bounceLandings / row.landings : null,
        next: next?.[0] ?? null,
        nextHits: next?.[1] ?? 0,
        topSource: topSource?.[0] ?? null,
      };
    })
    .sort((a, b) => b.hits - a.hits)
    .slice(0, 40);
  const sourceLandings: SourceLandingRow[] = [...sourceLandingMap.entries()]
    .map(([key, row]) => {
      const [source, landing] = key.split("||");
      return {
        source: source ?? "Direct / unknown",
        landing: landing ?? "/",
        sessions: row.sessions,
        bounced: row.bounced,
        bounceRate: row.sessions ? row.bounced / row.sessions : null,
      };
    })
    .sort((a, b) => b.sessions - a.sessions)
    .slice(0, 24);
  const conversionPaths: ConversionPathRow[] = [...conversionPathMap.entries()]
    .map(([steps, count]) => ({ steps: steps.split(" → "), count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 12);
  const utmRows: UtmRow[] = [...utmMap.entries()]
    .map(([key, hits]) => {
      const [source, medium, campaign] = key.split("|");
      return { source: source ?? "—", medium: medium ?? "—", campaign: campaign ?? "—", hits };
    })
    .sort((a, b) => b.hits - a.hits)
    .slice(0, 16);
  const returningVisitorIds = [...visitorVisitCount.entries()].filter(([, count]) => count > 1).map(([id]) => id);
  const newVisitors = Math.max(0, visitors - returningVisitorIds.length);
  const returningSessions = visits.filter((visit) => (visitorVisitCount.get(visit.visitorId) ?? 1) > 1).length;
  const deepSessions = depth4;
  const depthVisits = visits.map((visit) => {
    const source = classifyTrafficSource({
      referrer: visit.referrer,
      utmSource: visit.utmSource,
      utmMedium: visit.utmMedium,
      utmCampaign: visit.utmCampaign,
    });
    return {
      first: visit.first,
      last: visit.last,
      steps: visit.steps,
      source: source.channel,
      sourceLabel: source.label,
      device: visit.device === "unknown" ? "Unknown" : visit.device,
      formCompleted: visit.formCompleted,
      engaged: visit.engaged,
    };
  });
  const landingGrades = buildLandingGrades(depthVisits);
  const pathClusters = buildPathClusters(depthVisits);
  const heat = buildHeatCells(depthVisits);
  const deviceSource = buildDeviceSource(depthVisits);
  const pulse = buildPulse(depthVisits);
  const durations = visits
    .map((visit) => Math.max(0, (visit.last.getTime() - visit.first.getTime()) / 60000))
    .sort((a, b) => a - b);
  const medianSessionMinutes = durations.length
    ? durations[Math.floor((durations.length - 1) / 2)] ?? 0
    : 0;
  const seo = buildSeoDesk(visits, sessions);
  const transitions = toTransitions(transitionHits, 20);
  const landingNext = toTransitions(landingNextHits, 16);
  const analysis = buildAnalysis({
    sessions,
    visitors,
    bounceRate: sessions ? singlePageSessions / sessions : null,
    channels,
    seo,
    transitions,
    journeys,
  });

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
      .slice(0, days === 1 ? 80 : 20)
      .map((v) => ({
        steps: v.steps.slice(0, 24),
        hitAt: v.last.toISOString(),
        minutes: Math.max(0, (v.last.getTime() - v.first.getTime()) / 60000),
      })),
    channels,
    transitions,
    landingNext,
    journeys,
    journeyLimit: journeyCap,
    journeysTruncated: visits.length > journeyCap,
    seo,
    analysis,
    pageIntel,
    sourceLandings,
    depth: [
      { label: "1 page", sessions: depth1 },
      { label: "2 pages", sessions: depth2 },
      { label: "3 pages", sessions: depth3 },
      { label: "4+ pages", sessions: depth4 },
    ],
    utmRows,
    conversionPaths,
    newVisitors,
    returningVisitors: returningVisitorIds.length,
    returningSessions,
    deepSessions,
    landingGrades,
    pathClusters,
    heat,
    deviceSource,
    pulse,
    hypotheses: buildHypotheses({
      sessions,
      bounceRate: sessions ? singlePageSessions / sessions : null,
      seoBounce: seo.bounceRate,
      seoSessions: seo.sessions,
      formStarts: formStartCount,
      formCompletes: formCompleteCount,
      deepSessions,
      topLanding: landingHits.size ? [...landingHits.entries()].sort((a, b) => b[1].hits - a[1].hits)[0]?.[0] ?? null : null,
      topExit: exitHits.size ? [...exitHits.entries()].sort((a, b) => b[1].hits - a[1].hits)[0]?.[0] ?? null : null,
      leadChannel: channels.find((row) => row.sessions > 0)?.label ?? null,
      pulse,
      grades: landingGrades,
      clusters: pathClusters,
    }),
    medianSessionMinutes,
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
      channels: snapshot.channels.filter((row) => row.sessions > 0).map((row) => ({
        label: row.label,
        sessions: row.sessions,
        bounceRate: row.bounceRate == null ? null : Number((row.bounceRate * 100).toFixed(1)),
        formCompletes: row.formCompletes,
      })),
      seo: {
        sessions: snapshot.seo.sessions,
        share: snapshot.seo.share == null ? null : Number((snapshot.seo.share * 100).toFixed(1)),
        bounceRate: snapshot.seo.bounceRate == null ? null : Number((snapshot.seo.bounceRate * 100).toFixed(1)),
        engines: snapshot.seo.engines,
        landings: snapshot.seo.landings.slice(0, 8),
        nextPages: snapshot.seo.nextPages.slice(0, 8).map((row) => `${row.from} → ${row.to} (${row.hits})`),
        reads: snapshot.seo.reads,
      },
      analysis: snapshot.analysis,
      topMoves: snapshot.transitions.slice(0, 10).map((row) => `${row.from} → ${row.to} (${row.hits})`),
      recentJourneys: snapshot.journeys.slice(0, 12).map((row) => ({
        source: row.sourceLabel,
        landing: row.landing,
        path: row.steps.join(" → "),
        bounced: row.bounced,
        formCompleted: row.formCompleted,
      })),
      pageIntel: snapshot.pageIntel.slice(0, 16).map((row) => ({
        path: row.path,
        hits: row.hits,
        landings: row.landings,
        exits: row.exits,
        landingBounceRate: row.landingBounceRate == null ? null : Number((row.landingBounceRate * 100).toFixed(1)),
        next: row.next,
        topSource: row.topSource,
      })),
      sourceLandings: snapshot.sourceLandings.slice(0, 12),
      depth: snapshot.depth,
      utmRows: snapshot.utmRows.slice(0, 10),
      conversionPaths: snapshot.conversionPaths.slice(0, 8).map((row) => ({ path: row.steps.join(" → "), count: row.count })),
      newVisitors: snapshot.newVisitors,
      returningVisitors: snapshot.returningVisitors,
      deepSessions: snapshot.deepSessions,
      pulse: snapshot.pulse,
      landingGrades: snapshot.landingGrades.slice(0, 8),
      pathClusters: snapshot.pathClusters.slice(0, 8),
      hypotheses: snapshot.hypotheses,
      deviceSource: snapshot.deviceSource.slice(0, 8),
      medianSessionMinutes: Number(snapshot.medianSessionMinutes.toFixed(2)),
    },
    null,
    2,
  );
}

export function pctChange(current: number, prior: number): number | null {
  if (prior <= 0) return current > 0 ? 100 : null;
  return ((current - prior) / prior) * 100;
}
