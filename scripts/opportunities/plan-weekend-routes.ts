/**
 * Deterministic weekend route templates per top route clusters (fair-heavy until dates land).
 * Run: npm run opportunities:plan-weekends
 */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { addDays, format, parse } from "date-fns";
import { formatInTimeZone, toDate } from "date-fns-tz";
import { loadEnvConfig } from "@next/env";

import type {
  CommunityOpportunity,
  WeekendRoutePlan,
  WeekendRoutePlanOpportunitySlot,
} from "@/lib/opportunities/community-opportunity-types";
import { ROSE_BUD } from "@/lib/opportunities/approx-county-center";
import {
  estimateLegMinutes,
  loadRouteMatrixCache,
  resolveOpportunityCoord,
  type RouteMatrixCacheFile,
} from "@/lib/opportunities/google-route-matrix";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
loadEnvConfig(root);

const DATE_BUCKET = "2026-07-15";
const CHI = "America/Chicago";

const SLOT_TEMPLATE: Array<{ day: WeekendRoutePlanOpportunitySlot["day"]; hour: number; minute: number }> = [
  { day: "saturday", hour: 10, minute: 0 },
  { day: "saturday", hour: 16, minute: 30 },
  { day: "sunday", hour: 11, minute: 0 },
  { day: "sunday", hour: 17, minute: 0 },
  { day: "monday", hour: 10, minute: 30 },
  { day: "monday", hour: 16, minute: 0 },
];

function slug(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
}

function slotIso(weekStartYmd: string, day: WeekendRoutePlanOpportunitySlot["day"], hour: number, minute: number): string {
  const dayAdd = { friday: 0, saturday: 1, sunday: 2, monday: 3 }[day];
  const baseLocal = addDays(parse(weekStartYmd, "yyyy-MM-dd", new Date()), dayAdd);
  const ymd = format(baseLocal, "yyyy-MM-dd");
  const hm = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:00`;
  const inst = toDate(`${ymd} ${hm}`, { timeZone: CHI });
  return formatInTimeZone(inst, CHI, "yyyy-MM-dd'T'HH:mm:ssXXX");
}

function addMinutesToIso(iso: string, addM: number): string {
  const ms = Date.parse(iso);
  if (Number.isNaN(ms)) return iso;
  return formatInTimeZone(new Date(ms + addM * 60_000), CHI, "yyyy-MM-dd'T'HH:mm:ssXXX");
}

function bufferBefore(o: CommunityOpportunity): number {
  const t = o.type;
  if (t === "county_fair" || t === "district_fair" || t === "festival" || t === "parade") return 30;
  if (t === "high_school_football" || t === "campus_event") return 45;
  return 20;
}

function bufferAfter(o: CommunityOpportunity): number {
  if (o.type === "high_school_football" || o.type === "campus_event") return 30;
  if (o.type === "county_fair" || o.type === "district_fair") return 30;
  return 25;
}

function nearestNeighborOrder(nodes: CommunityOpportunity[], cache: RouteMatrixCacheFile): CommunityOpportunity[] {
  const remaining = [...nodes];
  const ordered: CommunityOpportunity[] = [];
  let cur = ROSE_BUD;
  while (remaining.length) {
    let bestI = 0;
    let bestD = Infinity;
    for (let i = 0; i < remaining.length; i++) {
      const p = resolveOpportunityCoord(remaining[i]!);
      const d = estimateLegMinutes(cache, cur, p, DATE_BUCKET);
      if (d < bestD) {
        bestD = d;
        bestI = i;
      }
    }
    const [next] = remaining.splice(bestI, 1);
    ordered.push(next!);
    cur = resolveOpportunityCoord(next!);
  }
  return ordered;
}

function buildPlanForCluster(
  cluster: string,
  fairs: CommunityOpportunity[],
  weekStart: string,
  idx: number,
  cache: RouteMatrixCacheFile,
): WeekendRoutePlan {
  const nodes = nearestNeighborOrder(
    [...fairs].sort((a, b) => (b.score?.total ?? 0) - (a.score?.total ?? 0)).slice(0, 6),
    cache,
  );

  const opportunities: WeekendRoutePlanOpportunitySlot[] = [];
  let prev = ROSE_BUD;
  let totalDrive = 0;
  let totalMiles = 0;
  const dayAgg: Record<string, { drive: number; appearances: number }> = {};
  let gasDebt = 0;

  nodes.forEach((op, i) => {
    const tpl = SLOT_TEMPLATE[i] ?? SLOT_TEMPLATE[SLOT_TEMPLATE.length - 1]!;
    const coord = resolveOpportunityCoord(op);
    let travelMin = estimateLegMinutes(cache, prev, coord, DATE_BUCKET);
    const distMiles = haversineMiles(prev, coord);
    totalDrive += travelMin;
    totalMiles += distMiles;
    gasDebt += travelMin;
    if (gasDebt >= 150) {
      travelMin += 15;
      gasDebt = 0;
    }
    const dayKey = tpl.day;
    dayAgg[dayKey] ??= { drive: 0, appearances: 0 };
    dayAgg[dayKey]!.drive += travelMin;
    dayAgg[dayKey]!.appearances += 1;

    const bBefore = bufferBefore(op);
    const bAfter = bufferAfter(op);
    const appearance = Math.min(op.idealAppearanceMinutes, 120);
    const arrival = slotIso(weekStart, tpl.day, tpl.hour, tpl.minute);
    const departure = addMinutesToIso(arrival, appearance + bAfter);

    let risk: WeekendRoutePlanOpportunitySlot["risk"] = "low";
    if (dayAgg[dayKey]!.drive > 300 || dayAgg[dayKey]!.appearances > 3) risk = "high";
    else if (dayAgg[dayKey]!.drive > 180 || dayAgg[dayKey]!.appearances > 2) risk = "medium";

    opportunities.push({
      opportunityId: op.id,
      day: tpl.day,
      recommendedArrival: arrival,
      recommendedDeparture: departure,
      appearanceMinutes: appearance,
      bufferMinutesBefore: bBefore,
      bufferMinutesAfter: bAfter,
      travelFromPreviousMinutes: travelMin,
      travelFromPreviousMiles: Math.round(distMiles * 10) / 10,
      risk,
    });
    prev = coord;
  });

  const countiesCovered = [...new Set(nodes.map((n) => n.county))];
  const mustAttendCount = nodes.filter((n) => n.campaignValue === "must_attend").length;
  const risks: string[] = [
    "Template times are placeholders until fair and event dates are verified — do not publish as factual schedule.",
    "Confirm school and fair access with hosts before assigning Kelly personally.",
  ];
  if (opportunities.some((s) => s.day === "monday")) {
    risks.push("Monday leg present — if return to Rose Bud exceeds ~2 hours after last stop, book overnight or Tuesday morning return.");
  }
  if (Object.values(dayAgg).some((d) => d.drive > 300)) risks.push("One or more days exceed ~5 hours windshield time before buffers — split or surrogate.");

  let routeTightness: WeekendRoutePlan["routeTightness"] = "comfortable";
  if (totalDrive > 480 || opportunities.filter((o) => o.risk === "high").length >= 2) routeTightness = "too_tight";
  else if (totalDrive > 360 || opportunities.some((o) => o.risk === "high")) routeTightness = "busy_but_safe";

  let staffRecommendation: WeekendRoutePlan["staffRecommendation"] = "approve";
  if (routeTightness === "too_tight") staffRecommendation = "split_with_surrogate";
  else if (routeTightness === "busy_but_safe") staffRecommendation = "modify";

  const overnightStops: WeekendRoutePlan["overnightStops"] = [];
  if (opportunities.some((s) => s.day === "monday") && mustAttendCount > 0) {
    overnightStops.push({
      city: countiesCovered[countiesCovered.length - 1] ?? "Last county seat",
      night: "sunday",
      reason: "Position for Monday stops without pre-dawn drive from Rose Bud.",
    });
  }

  return {
    id: `weekend-${slug(cluster)}-${idx}`,
    weekStart,
    fridayNightOrigin: "Rose Bud, Arkansas",
    homeBase: "Rose Bud, Arkansas",
    startingLocationMode: "rose_bud",
    title: `Weekend cluster: ${cluster}`,
    countiesCovered,
    opportunities,
    overnightStops,
    totalDriveMinutes: Math.round(totalDrive),
    totalDriveMiles: Math.round(totalMiles),
    countiesTouched: countiesCovered.length,
    mustAttendCount,
    routeTightness,
    staffRecommendation,
    risks,
  };
}

function haversineMiles(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const R = 3959;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const la1 = (a.lat * Math.PI) / 180;
  const la2 = (b.lat * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(la1) * Math.cos(la2) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
  return R * c;
}

async function writeDocs(topClusters: string[], plans: WeekendRoutePlan[], rows: CommunityOpportunity[]) {
  const auditPath = path.join(root, "docs/calendar-command-center/COMMUNITY_OPPORTUNITY_AUDIT.md");
  const planPath = path.join(root, "docs/calendar-command-center/WEEKEND_ROUTE_PLANS.md");
  await mkdir(path.dirname(auditPath), { recursive: true });

  const missingSources = [
    "Burt DB fair dates and venues (when connector is enabled).",
    "Official county fair sites and extension PDF calendars (robots.txt aware fetch).",
    "AEA local calendars and back-to-school rally schedules.",
    "ARTA / county retired unit meeting cadences.",
    "Campus student-life iCal feeds (public URLs only).",
    "AHSAA / MaxPreps / school SIS athletics pages for verified football dates.",
  ];
  const staffCalls = [
    "County extension office — EHC council meeting dates and public-visit policy.",
    "AEA local president — candidate-appropriate events and access.",
    "High school ADs — any presence beyond community attendee / tailgate.",
    "Fair boards — carnival arrival windows and candidate booth rules.",
  ];

  const byVer = new Map<string, number>();
  for (const r of rows) {
    byVer.set(r.verificationStatus, (byVer.get(r.verificationStatus) ?? 0) + 1);
  }

  await writeFile(
    auditPath,
    [
      "# Community opportunity audit (2026 pipeline)",
      "",
      `Generated (UTC): ${new Date().toISOString()}`,
      "",
      "## Counts by verification",
      "",
      ...[...byVer.entries()].sort((a, b) => b[1] - a[1]).map(([k, v]) => `- **${k}**: ${v}`),
      "",
      "## Missing source data (next passes)",
      "",
      ...missingSources.map((s) => `- ${s}`),
      "",
      "## Staff calls required",
      "",
      ...staffCalls.map((s) => `- ${s}`),
      "",
      "## Optics (schools / sports)",
      "",
      "- Treat every school-adjacent stop as **community presence** unless staff has written approval for more.",
      "- No disruptive campaigning; partisan signage only where policy allows.",
      "",
    ].join("\n"),
    "utf8",
  );

  await writeFile(
    planPath,
    [
      "# Weekend route plans (deterministic templates)",
      "",
      `Generated (UTC): ${new Date().toISOString()}`,
      "",
      "## Cluster list (up to 20)",
      "",
      ...topClusters.map((c, i) => `${i + 1}. ${c}`),
      "",
      "## Plans",
      "",
      ...plans.flatMap((p) => [
        `### ${p.title} (${p.id})`,
        `- **Week start (Friday)**: ${p.weekStart}`,
        `- **Drive**: ~${p.totalDriveMinutes} min / ~${p.totalDriveMiles} mi (pre-buffer legs)`,
        `- **Tightness**: ${p.routeTightness} · **Staff**: ${p.staffRecommendation}`,
        `- **Counties**: ${p.countiesCovered.join(", ")}`,
        p.risks.length ? `- **Risks**: ${p.risks.join(" · ")}` : "",
        "",
      ]),
    ].join("\n"),
    "utf8",
  );
}

async function main() {
  const normPath = path.join(root, "data/calendar-command-center/community-opportunities-2026.normalized.json");
  const raw = JSON.parse(await readFile(normPath, "utf8")) as { rows?: CommunityOpportunity[] };
  const rows = raw.rows ?? [];
  const fairs = rows.filter((r) => r.type === "county_fair" && r.routeCluster && r.verificationStatus !== "not_relevant");

  const byCluster = new Map<string, CommunityOpportunity[]>();
  for (const f of fairs) {
    const k = f.routeCluster ?? "";
    if (!byCluster.has(k)) byCluster.set(k, []);
    byCluster.get(k)!.push(f);
  }

  const clusterScores = [...byCluster.entries()].map(([name, list]) => ({
    name,
    score: list.reduce((s, x) => s + (x.score?.total ?? 0), 0),
  }));
  clusterScores.sort((a, b) => b.score - a.score);
  const top20 = clusterScores.slice(0, 20);

  const cache = await loadRouteMatrixCache(root);
  const plans: WeekendRoutePlan[] = [];
  const topClusterNames: string[] = top20.map((c) => c.name);
  const baseFriday = new Date(Date.UTC(2026, 4, 15));

  top20.forEach((c, idx) => {
    const list = byCluster.get(c.name) ?? [];
    const d = new Date(baseFriday);
    d.setUTCDate(d.getUTCDate() + idx * 7);
    const weekStart = d.toISOString().slice(0, 10);
    plans.push(buildPlanForCluster(c.name, list, weekStart, idx, cache));
  });

  const usedFairIds = new Set(plans.flatMap((p) => p.opportunities.map((o) => o.opportunityId)));
  let idx = plans.length;
  while (plans.length < 20) {
    const next = [...fairs]
      .sort((a, b) => (b.score?.total ?? 0) - (a.score?.total ?? 0))
      .find((f) => !usedFairIds.has(f.id));
    if (!next) break;
    usedFairIds.add(next.id);
    const d = new Date(baseFriday);
    d.setUTCDate(d.getUTCDate() + idx * 7);
    const weekStart = d.toISOString().slice(0, 10);
    const label = `${next.county} County (single-county add-on)`;
    topClusterNames.push(label);
    plans.push(buildPlanForCluster(label, [next], weekStart, idx, cache));
    idx++;
  }

  const outDir = path.join(root, "data/calendar-command-center");
  await mkdir(outDir, { recursive: true });
  const out = path.join(outDir, "weekend-route-plans-2026.json");
  await writeFile(
    out,
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        topClusters: topClusterNames,
        plans,
      },
      null,
      2,
    ),
    "utf8",
  );

  await writeDocs(topClusterNames, plans, rows);
  console.log(`Wrote ${plans.length} weekend plans → ${path.relative(root, out)}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
