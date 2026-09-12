export type TrafficWindowDays = 7 | 30;

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
};

export type SiteTrafficSnapshot = {
  days: TrafficWindowDays;
  pageViews: number;
  sessions: number;
  pages: PageHitRow[];
  referrers: ReferrerRow[];
  campaigns: CampaignRow[];
  paths: SessionPathRow[];
  singlePageSessions: number;
};

export type TrafficEventRow = {
  path: string | null;
  sessionId: string | null;
  createdAt: Date;
  payload: unknown;
};

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

export function emptySiteTrafficSnapshot(days: TrafficWindowDays): SiteTrafficSnapshot {
  return {
    days,
    pageViews: 0,
    sessions: 0,
    pages: [],
    referrers: [],
    campaigns: [],
    paths: [],
    singlePageSessions: 0,
  };
}

export function aggregateSiteTraffic(rows: TrafficEventRow[], days: TrafficWindowDays): SiteTrafficSnapshot {
  const pageHits = new Map<string, { hits: number; sessions: Set<string> }>();
  const referrerHits = new Map<string, number>();
  const campaignHits = new Map<string, number>();
  const sessionSteps = new Map<string, { steps: string[]; last: Date }>();
  let pageViews = 0;

  for (const row of rows) {
    const payload = asRecord(row.payload);
    const path = publicAnalyticsPath(row.path) ?? publicAnalyticsPath(String(payload.pathname ?? ""));
    if (!path) continue;
    const sid = row.sessionId?.trim() || "anon";
    pageViews += 1;

    const page = pageHits.get(path) ?? { hits: 0, sessions: new Set<string>() };
    page.hits += 1;
    page.sessions.add(sid);
    pageHits.set(path, page);

    const ref = String(payload.referrer ?? "").trim().slice(0, 200);
    if (ref && !ref.startsWith("/") && !/^\d{1,3}(\.\d{1,3}){3}$/.test(ref)) {
      referrerHits.set(ref, (referrerHits.get(ref) ?? 0) + 1);
    }

    const utm = [payload.utm_source, payload.utm_medium, payload.utm_campaign]
      .map((v) => String(v ?? "").trim())
      .filter(Boolean)
      .join(" / ");
    if (utm) campaignHits.set(utm, (campaignHits.get(utm) ?? 0) + 1);

    const sess = sessionSteps.get(sid) ?? { steps: [], last: row.createdAt };
    if (sess.steps[sess.steps.length - 1] !== path) sess.steps.push(path);
    sess.last = row.createdAt;
    sessionSteps.set(sid, sess);
  }

  return {
    days,
    pageViews,
    sessions: sessionSteps.size,
    pages: [...pageHits.entries()]
      .map(([path, v]) => ({ path, hits: v.hits, sessions: v.sessions.size }))
      .sort((a, b) => b.hits - a.hits)
      .slice(0, 25),
    referrers: [...referrerHits.entries()]
      .map(([referrer, hits]) => ({ referrer, hits }))
      .sort((a, b) => b.hits - a.hits)
      .slice(0, 15),
    campaigns: [...campaignHits.entries()]
      .map(([campaign, hits]) => ({ campaign, hits }))
      .sort((a, b) => b.hits - a.hits)
      .slice(0, 12),
    paths: [...sessionSteps.values()]
      .filter((s) => s.steps.length >= 2)
      .sort((a, b) => b.last.getTime() - a.last.getTime())
      .slice(0, 20)
      .map((s) => ({ steps: s.steps.slice(0, 8), hitAt: s.last.toISOString() })),
    singlePageSessions: [...sessionSteps.values()].filter((s) => s.steps.length === 1).length,
  };
}

export function trafficBriefInput(snapshot: SiteTrafficSnapshot): string {
  return JSON.stringify(
    {
      windowDays: snapshot.days,
      pageViews: snapshot.pageViews,
      sessions: snapshot.sessions,
      singlePageSessions: snapshot.singlePageSessions,
      topPages: snapshot.pages.slice(0, 12),
      referrers: snapshot.referrers.slice(0, 10),
      campaigns: snapshot.campaigns.slice(0, 8),
      recentPaths: snapshot.paths.slice(0, 12).map((p) => p.steps.join(" → ")),
    },
    null,
    2,
  );
}
