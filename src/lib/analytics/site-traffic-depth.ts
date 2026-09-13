import type { TrafficChannelId } from "@/lib/analytics/traffic-source";

export type DepthVisit = {
  first: Date;
  last: Date;
  steps: string[];
  source: TrafficChannelId;
  sourceLabel: string;
  device: string;
  formCompleted: boolean;
  engaged: boolean;
};

export type LandingGrade = {
  path: string;
  sessions: number;
  bounceRate: number | null;
  next: string | null;
  converted: number;
  grade: "A" | "B" | "C" | "D" | "F";
  why: string;
};

export type PathCluster = {
  pattern: string;
  sessions: number;
  converted: number;
  avgMinutes: number;
};

export type Hypothesis = {
  claim: string;
  because: string;
  confidence: "high" | "medium" | "low";
  doNext: string;
};

export type HeatCell = {
  hour: number;
  channel: TrafficChannelId;
  label: string;
  sessions: number;
};

export type DeviceSourceRow = {
  device: string;
  source: string;
  sessions: number;
  bounced: number;
  bounceRate: number | null;
};

export type TrafficPulse = {
  last15: number;
  last60: number;
  last15Deep: number;
  last60Converted: number;
};

export type SectionIntelRow = {
  section: string;
  landings: number;
  bounceRate: number | null;
  converted: number;
};

function gradeLanding(bounceRate: number | null, sessions: number, hasNext: boolean, converted: number): { grade: LandingGrade["grade"]; why: string } {
  const bounce = bounceRate ?? 1;
  if (sessions < 2) {
    return { grade: bounce < 0.5 && hasNext ? "B" : "C", why: "Too few landings to trust the grade." };
  }
  if (converted > 0 && bounce < 0.5) return { grade: "A", why: "Holds people and has already converted." };
  if (bounce < 0.4 && hasNext) return { grade: "A", why: "Most landings take a second step." };
  if (bounce < 0.55) return { grade: "B", why: "More than half stay past page one." };
  if (bounce < 0.7) return { grade: "C", why: "A thin majority bounce. The first screen is weak." };
  if (bounce < 0.85) return { grade: "D", why: "This page is mostly a dead end." };
  return { grade: "F", why: "Almost everyone who starts here leaves here." };
}

function arkansasHour(at: Date): number {
  const hour = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Chicago",
    hour: "2-digit",
    hourCycle: "h23",
  }).formatToParts(at).find((part) => part.type === "hour")?.value;
  return Number(hour) || 0;
}

export function buildLandingGrades(visits: DepthVisit[]): LandingGrade[] {
  const map = new Map<string, { sessions: number; bounced: number; next: Map<string, number>; converted: number }>();
  for (const visit of visits) {
    const path = visit.steps[0] ?? "/";
    const row = map.get(path) ?? { sessions: 0, bounced: 0, next: new Map<string, number>(), converted: 0 };
    row.sessions += 1;
    if (visit.steps.length === 1) row.bounced += 1;
    const next = visit.steps[1];
    if (next) row.next.set(next, (row.next.get(next) ?? 0) + 1);
    if (visit.formCompleted) row.converted += 1;
    map.set(path, row);
  }
  return [...map.entries()]
    .map(([path, row]) => {
      const bounceRate = row.sessions ? row.bounced / row.sessions : null;
      const next = [...row.next.entries()].sort((a, b) => b[1] - a[1])[0];
      const scored = gradeLanding(bounceRate, row.sessions, Boolean(next), row.converted);
      return {
        path,
        sessions: row.sessions,
        bounceRate,
        next: next?.[0] ?? null,
        converted: row.converted,
        grade: scored.grade,
        why: scored.why,
      };
    })
    .sort((a, b) => b.sessions - a.sessions)
    .slice(0, 16);
}

export function buildPathClusters(visits: DepthVisit[]): PathCluster[] {
  const map = new Map<string, { sessions: number; converted: number; minutes: number }>();
  for (const visit of visits) {
    if (visit.steps.length < 2) continue;
    const pattern = visit.steps.slice(0, 4).join(" → ");
    const row = map.get(pattern) ?? { sessions: 0, converted: 0, minutes: 0 };
    row.sessions += 1;
    if (visit.formCompleted) row.converted += 1;
    row.minutes += Math.max(0, (visit.last.getTime() - visit.first.getTime()) / 60000);
    map.set(pattern, row);
  }
  return [...map.entries()]
    .map(([pattern, row]) => ({
      pattern,
      sessions: row.sessions,
      converted: row.converted,
      avgMinutes: row.sessions ? row.minutes / row.sessions : 0,
    }))
    .sort((a, b) => b.sessions - a.sessions)
    .slice(0, 12);
}

export function buildHeatCells(visits: DepthVisit[]): HeatCell[] {
  const map = new Map<string, HeatCell>();
  for (const visit of visits) {
    const hour = arkansasHour(visit.first);
    const key = `${hour}|${visit.source}`;
    const row = map.get(key) ?? { hour, channel: visit.source, label: visit.sourceLabel, sessions: 0 };
    row.sessions += 1;
    map.set(key, row);
  }
  return [...map.values()].sort((a, b) => b.sessions - a.sessions);
}

export function buildDeviceSource(visits: DepthVisit[]): DeviceSourceRow[] {
  const map = new Map<string, { sessions: number; bounced: number }>();
  for (const visit of visits) {
    const key = `${visit.device}|${visit.sourceLabel}`;
    const row = map.get(key) ?? { sessions: 0, bounced: 0 };
    row.sessions += 1;
    if (visit.steps.length === 1) row.bounced += 1;
    map.set(key, row);
  }
  return [...map.entries()]
    .map(([key, row]) => {
      const [device, source] = key.split("|");
      return {
        device: device ?? "Unknown",
        source: source ?? "Direct / unknown",
        sessions: row.sessions,
        bounced: row.bounced,
        bounceRate: row.sessions ? row.bounced / row.sessions : null,
      };
    })
    .sort((a, b) => b.sessions - a.sessions)
    .slice(0, 16);
}

export function buildPulse(visits: DepthVisit[], now = Date.now()): TrafficPulse {
  let last15 = 0;
  let last60 = 0;
  let last15Deep = 0;
  let last60Converted = 0;
  for (const visit of visits) {
    const age = now - visit.first.getTime();
    if (age <= 60 * 60 * 1000) {
      last60 += 1;
      if (visit.formCompleted) last60Converted += 1;
    }
    if (age <= 15 * 60 * 1000) {
      last15 += 1;
      if (visit.steps.length >= 3) last15Deep += 1;
    }
  }
  return { last15, last60, last15Deep, last60Converted };
}

export function buildHypotheses(input: {
  sessions: number;
  bounceRate: number | null;
  seoBounce: number | null;
  seoSessions: number;
  formStarts: number;
  formCompletes: number;
  deepSessions: number;
  topLanding: string | null;
  topExit: string | null;
  leadChannel: string | null;
  pulse: TrafficPulse;
  grades: LandingGrade[];
  clusters: PathCluster[];
}): Hypothesis[] {
  const rows: Hypothesis[] = [];
  if (!input.sessions) {
    return [
      {
        claim: "The desk has no stored public visits in this window.",
        because: "Either the recorder is still off, or nobody has loaded a public page since it came back.",
        confidence: "high",
        doNext: "Open /from-the-road on the live site, wait ten seconds, refresh this desk.",
      },
    ];
  }

  const fail = input.grades.find((row) => row.grade === "F" || row.grade === "D");
  if (fail) {
    rows.push({
      claim: `${fail.path} is a leaky front door.`,
      because: fail.why,
      confidence: fail.sessions >= 5 ? "high" : "medium",
      doNext: `Put one next step above the fold on ${fail.path}: events, volunteer, or From the Road.`,
    });
  }

  if (input.seoSessions >= 2 && (input.seoBounce ?? 0) >= 0.7) {
    rows.push({
      claim: "Search traffic is arriving and leaving.",
      because: `${Math.round((input.seoBounce ?? 0) * 100)}% of search sessions are one page.`,
      confidence: "high",
      doNext: "Match the SEO landing to the promise of the snippet. Do not send search to a page with no next click.",
    });
  } else if (input.seoSessions === 0) {
    rows.push({
      claim: "SEO is invisible in this window.",
      because: "No google.com / bing.com referrers were stored. Some search hides as Direct.",
      confidence: "medium",
      doNext: "Share one county or trail URL with utm_medium=organic on a test post so we can see tagged search-like traffic.",
    });
  }

  if (input.topLanding && input.topLanding === input.topExit) {
    rows.push({
      claim: `${input.topLanding} is both the start and the stop.`,
      because: "The most common landing is also the most common exit.",
      confidence: "high",
      doNext: "That page needs a second click people actually want — not another paragraph.",
    });
  }

  if (input.deepSessions > 0 && input.formCompletes === 0) {
    rows.push({
      claim: "People are touring and we are not closing.",
      because: `${input.deepSessions} visit${input.deepSessions === 1 ? "" : "s"} opened four or more pages with no form finish.`,
      confidence: "medium",
      doNext: "Put the volunteer ask on the third page of the common tour, not only on Home.",
    });
  }

  if (input.formStarts > 0 && input.formCompletes === 0) {
    rows.push({
      claim: "The leak is the form, not the homepage.",
      because: `${input.formStarts} start${input.formStarts === 1 ? "" : "s"} and zero finishes.`,
      confidence: "high",
      doNext: "Shorten the first form screen. Count fields. Remove anything that is not name, county, and how they want to help.",
    });
  }

  const cluster = input.clusters[0];
  if (cluster && cluster.sessions >= 2) {
    rows.push({
      claim: `The default tour is ${cluster.pattern}.`,
      because: `${cluster.sessions} multi-page visits followed that opening.`,
      confidence: cluster.sessions >= 4 ? "high" : "medium",
      doNext: cluster.converted
        ? "Keep that path clean and repeat it in ads."
        : "That tour does not convert. Add the ask on the second step.",
    });
  }

  if (input.pulse.last60 === 0 && input.sessions > 0) {
    rows.push({
      claim: "The last hour is quiet.",
      because: "Older visits exist, but nothing started in the last 60 minutes.",
      confidence: "medium",
      doNext: "If people are on the site right now and this stays at zero, the recorder is still missing.",
    });
  } else if (input.pulse.last15 > 0) {
    rows.push({
      claim: "The site is live right now.",
      because: `${input.pulse.last15} visit${input.pulse.last15 === 1 ? "" : "s"} started in the last 15 minutes.`,
      confidence: "high",
      doNext: input.pulse.last15Deep
        ? "Someone is going deep. Do not change the homepage in the next hour."
        : "They are landing. Watch whether they take a second page.",
    });
  }

  return rows.slice(0, 7);
}

export function emptyPulse(): TrafficPulse {
  return { last15: 0, last60: 0, last15Deep: 0, last60Converted: 0 };
}
