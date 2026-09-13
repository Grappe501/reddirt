export type TimedStep = {
  path: string;
  at: string;
  seconds: number;
};

export type VisitorEvent = {
  at: string;
  name: string;
  path: string;
  detail: string;
};

export type VisitorProfile = {
  label: string;
  seed: number;
  firstAt: string;
  lastAt: string;
  sessions: number;
  pageViews: number;
  uniquePages: number;
  sources: string[];
  devices: string[];
  timezones: string[];
  locales: string[];
  converted: boolean;
  neighborName: string | null;
  intakeHref: string | null;
  cities: string[];
  formStarted: boolean;
  engaged: boolean;
  maxScroll: number | null;
  outbounds: number;
  totalMinutes: number;
  timeline: VisitorEvent[];
  tours: string[];
};

export type AcquisitionRow = {
  source: string;
  medium: string;
  campaign: string;
  sessions: number;
  visitors: number;
  bounceRate: number | null;
  pagesPerSession: number;
  avgMinutes: number;
  conversions: number;
};

export type RetentionReport = {
  priorVisitors: number;
  returnedFromPrior: number;
  returnRate: number | null;
  frequency: Array<{ label: string; visitors: number }>;
};

export type RealtimeReport = {
  active5: number;
  active15: number;
  active30: number;
  recent: Array<{ at: string; path: string; source: string; city: string | null }>;
};

export type FunnelStep = {
  label: string;
  count: number;
  dropPct: number | null;
};

export type ExplorerVisit = {
  visitorKey: string;
  first: Date;
  last: Date;
  steps: string[];
  sourceLabel: string;
  medium: string;
  campaign: string;
  device: string;
  timezone: string;
  locale: string;
  formStarted: boolean;
  formCompleted: boolean;
  engaged: boolean;
  neighborName: string | null;
  city: string | null;
  intakeHref: string | null;
};

export type ExplorerEvent = {
  visitorKey: string;
  at: Date;
  name: string;
  path: string;
  detail: string;
  scroll?: number;
};

function increment(map: Map<string, number>, key: string): void {
  map.set(key, (map.get(key) ?? 0) + 1);
}

export function visitorSeed(key: string): number {
  let hash = 2166136261;
  for (let i = 0; i < key.length; i += 1) {
    hash ^= key.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export function buildVisitorProfiles(
  visits: ExplorerVisit[],
  events: ExplorerEvent[],
  limit: number,
): VisitorProfile[] {
  const byVisitor = new Map<string, ExplorerVisit[]>();
  for (const visit of visits) {
    const list = byVisitor.get(visit.visitorKey) ?? [];
    list.push(visit);
    byVisitor.set(visit.visitorKey, list);
  }
  const eventsByVisitor = new Map<string, ExplorerEvent[]>();
  for (const event of events) {
    const list = eventsByVisitor.get(event.visitorKey) ?? [];
    list.push(event);
    eventsByVisitor.set(event.visitorKey, list);
  }

  const profiles: VisitorProfile[] = [];
  for (const [key, list] of byVisitor) {
    list.sort((a, b) => a.first.getTime() - b.first.getTime());
    const ev = (eventsByVisitor.get(key) ?? []).sort((a, b) => a.at.getTime() - b.at.getTime());
    const pages = list.flatMap((visit) => visit.steps);
    const sources = [...new Set(list.map((visit) => visit.sourceLabel).filter(Boolean))];
    const devices = [...new Set(list.map((visit) => visit.device).filter(Boolean))];
    const timezones = [...new Set(list.map((visit) => visit.timezone).filter(Boolean))];
    const locales = [...new Set(list.map((visit) => visit.locale).filter(Boolean))];
    let maxScroll: number | null = null;
    let outbounds = 0;
    for (const event of ev) {
      if (event.name === "scroll_depth" && event.scroll != null) {
        maxScroll = Math.max(maxScroll ?? 0, event.scroll);
      }
      if (event.name === "outbound") outbounds += 1;
    }
    profiles.push({
      label: "",
      seed: visitorSeed(key),
      firstAt: list[0]!.first.toISOString(),
      lastAt: list[list.length - 1]!.last.toISOString(),
      sessions: list.length,
      pageViews: pages.length,
      uniquePages: new Set(pages).size,
      sources,
      devices,
      timezones,
      locales,
      converted: list.some((visit) => visit.formCompleted),
      neighborName: list.find((visit) => visit.neighborName)?.neighborName ?? null,
      intakeHref: list.find((visit) => visit.intakeHref)?.intakeHref ?? null,
      cities: [...new Set(list.map((visit) => visit.city).filter((row): row is string => Boolean(row)))],
      formStarted: list.some((visit) => visit.formStarted),
      engaged: list.some((visit) => visit.engaged),
      maxScroll,
      outbounds,
      totalMinutes: list.reduce((sum, visit) => sum + Math.max(0, (visit.last.getTime() - visit.first.getTime()) / 60000), 0),
      timeline: ev.slice(-40).map((event) => ({
        at: event.at.toISOString(),
        name: event.name,
        path: event.path,
        detail: event.detail,
      })),
      tours: list.map((visit) => visit.steps.join(" → ")).slice(-8),
    });
  }

  return profiles
    .sort((a, b) => Date.parse(b.lastAt) - Date.parse(a.lastAt))
    .slice(0, limit)
    .map((row, index) => ({ ...row, label: `Visitor ${index + 1}` }));
}

export function buildAcquisition(visits: ExplorerVisit[]): AcquisitionRow[] {
  const map = new Map<
    string,
    { visitors: Set<string>; sessions: number; bounced: number; pages: number; minutes: number; conversions: number }
  >();
  for (const visit of visits) {
    const key = `${visit.sourceLabel}|${visit.medium || "(none)"}|${visit.campaign || "(none)"}`;
    const row = map.get(key) ?? {
      visitors: new Set<string>(),
      sessions: 0,
      bounced: 0,
      pages: 0,
      minutes: 0,
      conversions: 0,
    };
    row.visitors.add(visit.visitorKey);
    row.sessions += 1;
    if (visit.steps.length === 1) row.bounced += 1;
    row.pages += visit.steps.length;
    row.minutes += Math.max(0, (visit.last.getTime() - visit.first.getTime()) / 60000);
    if (visit.formCompleted) row.conversions += 1;
    map.set(key, row);
  }
  return [...map.entries()]
    .map(([key, row]) => {
      const [source, medium, campaign] = key.split("|");
      return {
        source: source ?? "Direct / unknown",
        medium: medium ?? "(none)",
        campaign: campaign ?? "(none)",
        sessions: row.sessions,
        visitors: row.visitors.size,
        bounceRate: row.sessions ? row.bounced / row.sessions : null,
        pagesPerSession: row.sessions ? row.pages / row.sessions : 0,
        avgMinutes: row.sessions ? row.minutes / row.sessions : 0,
        conversions: row.conversions,
      };
    })
    .sort((a, b) => b.sessions - a.sessions)
    .slice(0, 24);
}

export function buildRetention(currentKeys: Set<string>, priorKeys: Set<string>, sessionsPerVisitor: Map<string, number>): RetentionReport {
  let returnedFromPrior = 0;
  for (const key of currentKeys) {
    if (priorKeys.has(key)) returnedFromPrior += 1;
  }
  const freq = new Map<string, number>();
  for (const count of sessionsPerVisitor.values()) {
    if (count <= 1) increment(freq, "1 session");
    else if (count === 2) increment(freq, "2 sessions");
    else if (count === 3) increment(freq, "3 sessions");
    else increment(freq, "4+ sessions");
  }
  return {
    priorVisitors: priorKeys.size,
    returnedFromPrior,
    returnRate: priorKeys.size ? returnedFromPrior / priorKeys.size : null,
    frequency: ["1 session", "2 sessions", "3 sessions", "4+ sessions"].map((label) => ({
      label,
      visitors: freq.get(label) ?? 0,
    })),
  };
}

export function buildRealtime(visits: ExplorerVisit[], now = Date.now()): RealtimeReport {
  const active = (ms: number) => new Set(visits.filter((visit) => now - visit.last.getTime() <= ms).map((visit) => visit.visitorKey)).size;
  const recent = [...visits]
    .sort((a, b) => b.last.getTime() - a.last.getTime())
    .slice(0, 20)
    .map((visit) => ({
      at: visit.last.toISOString(),
      path: visit.steps[visit.steps.length - 1] ?? visit.steps[0] ?? "/",
      source: visit.sourceLabel,
      city: visit.city,
    }));
  return {
    active5: active(5 * 60 * 1000),
    active15: active(15 * 60 * 1000),
    active30: active(30 * 60 * 1000),
    recent,
  };
}

export function buildDropFunnel(steps: Array<{ label: string; count: number }>): FunnelStep[] {
  return steps.map((step, index) => {
    const prev = steps[index - 1]?.count ?? null;
    return {
      label: step.label,
      count: step.count,
      dropPct: prev && prev > 0 ? 1 - step.count / prev : null,
    };
  });
}

export function emptyAcquisition(): AcquisitionRow[] {
  return [];
}

export function emptyRetention(): RetentionReport {
  return { priorVisitors: 0, returnedFromPrior: 0, returnRate: null, frequency: [] };
}

export function emptyRealtime(): RealtimeReport {
  return { active5: 0, active15: 0, active30: 0, recent: [] };
}
