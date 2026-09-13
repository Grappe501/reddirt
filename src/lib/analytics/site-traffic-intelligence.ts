import { pctChange, type SiteTrafficSnapshot } from "@/lib/analytics/site-traffic-aggregate";
import { ARKANSAS_COUNTY_REGISTRY, getRegistryCountyBySlug } from "@/lib/county/arkansas-county-registry";

export type TrafficMood = "strong" | "steady" | "leaking" | "quiet";

export type TrafficLeak = {
  page: string;
  share: number;
  note: string;
};

export type SiteTrafficIntelligence = {
  healthScore: number;
  mood: TrafficMood;
  reasons: string[];
  trendPct: number | null;
  formConversionRate: number | null;
  ctaRate: number | null;
  peakHourLabel: string | null;
  deviceLead: string | null;
  countyCoverage: number;
  countyNames: string[];
  leaks: TrafficLeak[];
  risingHalf: boolean | null;
};

function hourLabel(hour: number): string {
  const h = ((hour + 11) % 12) + 1;
  return `${h}${hour >= 12 ? " p.m." : " a.m."}`;
}

export function buildSiteTrafficIntelligence(snapshot: SiteTrafficSnapshot): SiteTrafficIntelligence {
  if (snapshot.pageViews === 0 || snapshot.sessions === 0) {
    return {
      healthScore: 0,
      mood: "quiet",
      reasons: ["No public visits in this window yet. Share one live page and this desk will start reading."],
      trendPct: snapshot.prior ? pctChange(snapshot.pageViews, snapshot.prior.pageViews) : null,
      formConversionRate: null,
      ctaRate: null,
      peakHourLabel: null,
      deviceLead: null,
      countyCoverage: 0,
      countyNames: [],
      leaks: [],
      risingHalf: null,
    };
  }

  const bounce = snapshot.bounceRate ?? 1;
  const engage = snapshot.engageRate ?? 0;
  const pages = Math.min(snapshot.pagesPerSession / 3, 1);
  const formRate = snapshot.formCompletes / snapshot.sessions;
  const ctaRate = snapshot.ctaClicks / snapshot.sessions;
  const trendPct = snapshot.prior ? pctChange(snapshot.pageViews, snapshot.prior.pageViews) : null;
  const trendBoost = trendPct == null ? 6 : trendPct > 8 ? 12 : trendPct < -8 ? 2 : 7;

  const healthScore = Math.max(
    4,
    Math.min(
      100,
      Math.round(engage * 32 + (1 - bounce) * 26 + Math.min(formRate, 0.25) * 80 + pages * 16 + trendBoost),
    ),
  );

  const mid = Math.floor(snapshot.daysSeries.length / 2);
  const first = snapshot.daysSeries.slice(0, mid).reduce((sum, row) => sum + row.pageViews, 0);
  const second = snapshot.daysSeries.slice(mid).reduce((sum, row) => sum + row.pageViews, 0);
  const risingHalf = snapshot.daysSeries.length >= 2 ? second >= first : null;

  const peak = snapshot.hours.reduce((best, row) => (row.hits > best.hits ? row : best), snapshot.hours[0] ?? { hour: 0, hits: 0 });
  const deviceLead = snapshot.devices[0]?.label ?? null;
  const countyNames = snapshot.counties
    .map((row) => getRegistryCountyBySlug(row.label)?.displayName ?? row.label)
    .slice(0, 8);

  const leaks: TrafficLeak[] = snapshot.exitPages
    .filter((row) => row.hits >= 2)
    .slice(0, 5)
    .map((row) => ({
      page: row.path,
      share: snapshot.pageViews ? row.hits / snapshot.pageViews : 0,
      note:
        snapshot.landingPages.some((landing) => landing.path === row.path)
          ? "People often start and stop here."
          : "This is where visits go quiet.",
    }));

  const reasons: string[] = [];
  if (trendPct != null) {
    reasons.push(
      trendPct > 0
        ? `Traffic is up ${Math.round(trendPct)}% versus the prior window.`
        : trendPct < 0
          ? `Traffic is down ${Math.abs(Math.round(trendPct))}% versus the prior window.`
          : "Traffic is flat versus the prior window.",
    );
  }
  reasons.push(
    bounce >= 0.65
      ? `${Math.round(bounce * 100)}% of sessions leave after one page.`
      : `${Math.round((1 - bounce) * 100)}% of sessions open more than one page.`,
  );
  if (snapshot.formCompletes > 0) {
    reasons.push(`${snapshot.formCompletes} form${snapshot.formCompletes === 1 ? "" : "s"} finished in this window.`);
  } else if (snapshot.formStarts > 0) {
    reasons.push(`${snapshot.formStarts} form start${snapshot.formStarts === 1 ? "" : "s"} and no finishes yet.`);
  } else {
    reasons.push("No public forms finished in this window.");
  }
  if (countyNames.length) {
    reasons.push(`${countyNames.length} county page${countyNames.length === 1 ? "" : "s"} drew a visit.`);
  }
  if (peak.hits > 0) {
    reasons.push(`Busiest hour is ${hourLabel(peak.hour)} Arkansas time.`);
  }

  const mood: TrafficMood =
    healthScore >= 72 && bounce < 0.55 ? "strong" : bounce >= 0.7 && snapshot.sessions >= 8 ? "leaking" : "steady";

  return {
    healthScore,
    mood,
    reasons: reasons.slice(0, 5),
    trendPct,
    formConversionRate: snapshot.sessions ? formRate : null,
    ctaRate: snapshot.sessions ? ctaRate : null,
    peakHourLabel: peak.hits > 0 ? `${hourLabel(peak.hour)} Arkansas time` : null,
    deviceLead,
    countyCoverage: snapshot.counties.length,
    countyNames,
    leaks,
    risingHalf,
  };
}

export function trafficIntelligenceBriefInput(snapshot: SiteTrafficSnapshot, intel: SiteTrafficIntelligence): string {
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
      healthScore: intel.healthScore,
      mood: intel.mood,
      machineReads: intel.reasons,
      leaks: intel.leaks,
      countyPagesSeen: intel.countyNames,
      arkansasCountyTotal: ARKANSAS_COUNTY_REGISTRY.length,
      peakHour: intel.peakHourLabel,
      deviceLead: intel.deviceLead,
      risingInSecondHalf: intel.risingHalf,
      topPages: snapshot.pages.slice(0, 12),
      landingPages: snapshot.landingPages.slice(0, 8),
      exitPages: snapshot.exitPages.slice(0, 8),
      sections: snapshot.sections,
      devices: snapshot.devices,
      referrers: snapshot.referrers.slice(0, 10),
      campaigns: snapshot.campaigns.slice(0, 8),
      forms: snapshot.forms,
      ctas: snapshot.ctas.slice(0, 8),
      daily: snapshot.daysSeries,
      hours: snapshot.hours.filter((row) => row.hits > 0),
      weekdays: snapshot.weekdays.filter((row) => row.hits > 0),
      recentPaths: snapshot.paths.slice(0, 12).map((p) => p.steps.join(" → ")),
    },
    null,
    2,
  );
}
