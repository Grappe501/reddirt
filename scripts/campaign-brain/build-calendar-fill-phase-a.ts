/**
 * Calendar Fill Phase A — corridors, tradeoff matrix, September readiness gate.
 * Does NOT assign dates or create Kelly's calendar.
 *
 * Usage: npm run campaign-brain:calendar-fill:phase-a
 */

import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

import { ARKANSAS_TOP_75_CITIES } from "../strategic-plan/data/arkansas-top-40-cities";
import { approxCountyCenter, ROSE_BUD } from "../../src/lib/opportunities/approx-county-center";
import { BRAIN_DATA, BRAIN_ROOT, readJson } from "./lib/inputs";

const OUT = path.join(BRAIN_ROOT, "calendar-fill");
const SETTLEMENT = path.join(BRAIN_ROOT, "calendar-settlement/calendar-settlement.summary.json");
const AUDIT_PATH = path.join(BRAIN_ROOT, "routing/county-coverage-reality-audit.json");
const LOCKED_PATH = path.join(BRAIN_DATA, "locked-events-steve.json");

const LABOR_DAY = "2026-09-07";
const DISCLAIMER =
  "Calendar Fill Phase A shows route choices and tradeoffs. It does not assign dates or create Kelly's final calendar.";

type AuditRow = {
  county: string;
  vciRank?: number | null;
  vci?: number;
  visitCount?: number;
  lastVisitDate?: string | null;
  daysSinceLastVisit?: number | null;
  priorityScore?: number;
};

type CorridorDef = {
  id: string;
  name: string;
  counties: string[];
  anchorCity: string;
  suggestedRoute: string;
  travelClass: "local" | "regional" | "immersion" | "multi-day";
  overnightLikely: boolean;
  stackWithLocked: string[];
  strategicValue: string;
  coverageValue: "high" | "medium" | "low" | "none";
  voteProductionValue: "very_high" | "high" | "medium" | "low" | "none";
  coalitionValue: string;
  storytellingValue: string;
  category: "completion" | "reinforcement";
};

const CORRIDOR_DEFS: Omit<CorridorDef, "stackWithLocked">[] = [
  {
    id: "delta-gateway",
    name: "Delta Gateway",
    counties: ["Crittenden", "Mississippi"],
    anchorCity: "West Memphis",
    suggestedRoute: "Rose Bud → West Memphis (overnight) → Blytheville → return via Jonesboro stack optional",
    travelClass: "multi-day",
    overnightLikely: true,
    strategicValue: "Highest-priority Delta entry · Memphis media market spillover",
    coverageValue: "high",
    voteProductionValue: "high",
    coalitionValue: "NAACP Memphis gateway · Delta labor · West Memphis Dems",
    storytellingValue: "River crossing · gateway communities · clerk/election access stories",
    category: "completion",
  },
  {
    id: "delta-river",
    name: "Delta River Corridor",
    counties: ["Phillips", "Monroe", "St. Francis"],
    anchorCity: "Helena",
    suggestedRoute: "LR Tue origin → Helena → Clarendon → Forrest City (2-day overnight)",
    travelClass: "multi-day",
    overnightLikely: true,
    strategicValue: "Deep Delta relationship capital · historic civil rights corridor",
    coverageValue: "high",
    voteProductionValue: "medium",
    coalitionValue: "Delta churches · NAACP branches · educator networks",
    storytellingValue: "Helena blues heritage · farm community · courthouse access",
    category: "completion",
  },
  {
    id: "southeast-delta",
    name: "Southeast Delta",
    counties: ["Ashley", "Chicot", "Lincoln"],
    anchorCity: "Crossett",
    suggestedRoute: "Stack with Union immersion (Jul 25–29) or Sep Ashley fair · Lake Village · Star City",
    travelClass: "multi-day",
    overnightLikely: true,
    strategicValue: "Complete south Delta arc · forestry and rural business stories",
    coverageValue: "high",
    voteProductionValue: "low",
    coalitionValue: "Paper mill communities · rural Dem clubs",
    storytellingValue: "South AR timber · small-town main streets",
    category: "completion",
  },
  {
    id: "southwest-completion",
    name: "Southwest Completion",
    counties: ["Calhoun", "Dallas", "Miller", "Sevier", "Grant"],
    anchorCity: "Camden",
    suggestedRoute: "El Dorado/Union immersion extension → Camden → Arkadelphia adjacency",
    travelClass: "multi-day",
    overnightLikely: true,
    strategicValue: "Southwest quadrant completion · Ouachita foothills",
    coverageValue: "high",
    voteProductionValue: "low",
    coalitionValue: "South AR elected officials · chamber networks",
    storytellingValue: "Rural southwest · small business filers",
    category: "completion",
  },
  {
    id: "northeast-completion",
    name: "Northeast Completion",
    counties: ["Lawrence", "Randolph", "Jackson", "Poinsett", "Woodruff"],
    anchorCity: "Walnut Ridge",
    suggestedRoute: "Jonesboro hub → Walnut Ridge → Newport → Augusta corridor",
    travelClass: "multi-day",
    overnightLikely: true,
    strategicValue: "Crowley's Ridge completion · stack with Greene immersion Jul 12–14",
    coverageValue: "high",
    voteProductionValue: "medium",
    coalitionValue: "NE educator networks · fair circuit partners",
    storytellingValue: "Railroad towns · NE Arkansas identity",
    category: "completion",
  },
  {
    id: "ozark-completion",
    name: "Ozark / North Central Completion",
    counties: ["Newton", "Madison", "Perry", "Logan", "Little River"],
    anchorCity: "Jasper",
    suggestedRoute: "Harrison Balloon Sep 28 stack → Jasper → Paris · Mena adjacency",
    travelClass: "multi-day",
    overnightLikely: true,
    strategicValue: "Northwest Ozarks gap fill · tourist-town visibility",
    coverageValue: "high",
    voteProductionValue: "low",
    coalitionValue: "Ozarks hospitality · small-town clerks",
    storytellingValue: "Buffalo River gateway · mountain communities",
    category: "completion",
  },
  {
    id: "central-prairie",
    name: "Central Prairie Completion",
    counties: ["Prairie", "Scott"],
    anchorCity: "De Witt",
    suggestedRoute: "LR Fri origin → De Witt → Waldron same-day or overnight with Southwest stack",
    travelClass: "regional",
    overnightLikely: false,
    strategicValue: "Central AR prairie counties · quick completion pair",
    coverageValue: "medium",
    voteProductionValue: "low",
    coalitionValue: "Farm bureau adjacency · rural church networks",
    storytellingValue: "Ag communities · rice and prairie landscape",
    category: "completion",
  },
  {
    id: "tier1-revisit",
    name: "Tier 1 Revisit Corridor",
    counties: ["Jefferson", "Craighead"],
    anchorCity: "Pine Bluff",
    suggestedRoute: "LR Tue/Fri → Pine Bluff (Jefferson) · or Jonesboro (Craighead) NE stack",
    travelClass: "regional",
    overnightLikely: false,
    strategicValue: "Vote production · Tier 1 VCI counties already visited but revisit overdue",
    coverageValue: "none",
    voteProductionValue: "very_high",
    coalitionValue: "Pine Bluff NAACP · Jonesboro educators · city partnerships",
    storytellingValue: "Urban recovery · NE hub business spotlight",
    category: "reinforcement",
  },
  {
    id: "nwa-reinforcement",
    name: "NWA Reinforcement Corridor",
    counties: ["Benton", "Washington"],
    anchorCity: "Bentonville",
    suggestedRoute: "Fayetteville · Springdale · Rogers · Bentonville multi-stop (2-day)",
    travelClass: "multi-day",
    overnightLikely: true,
    strategicValue: "Highest statewide VCI vote production · no new counties",
    coverageValue: "none",
    voteProductionValue: "very_high",
    coalitionValue: "AEA NWA · Senior Dems Aug 5 · chamber validators",
    storytellingValue: "NWA growth · business community · student registration",
    category: "reinforcement",
  },
  {
    id: "river-valley-reinforcement",
    name: "River Valley Reinforcement Corridor",
    counties: ["Sebastian", "Pope", "Garland"],
    anchorCity: "Fort Smith",
    suggestedRoute: "Fort Smith → Russellville → Hot Springs (locked fairs/forums align Sep)",
    travelClass: "multi-day",
    overnightLikely: true,
    strategicValue: "Western vote anchor · clerk relationships · fair season alignment",
    coverageValue: "none",
    voteProductionValue: "high",
    coalitionValue: "Fort Smith labor · River Valley educators",
    storytellingValue: "Western AR identity · Hot Springs forum Sep 25",
    category: "reinforcement",
  },
];

function haversineMinutes(from: { lat: number; lng: number }, county: string): number {
  const to = approxCountyCenter(county);
  const R = 3958.8;
  const dLat = ((to.lat - from.lat) * Math.PI) / 180;
  const dLng = ((to.lng - from.lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((from.lat * Math.PI) / 180) * Math.cos((to.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return Math.round(((R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))) / 55) * 60);
}

function travelBurdenLabel(minutes: number): string {
  if (minutes < 60) return "local";
  if (minutes <= 90) return "regional";
  return "immersion";
}

function vciRank(audit: { visitedCounties?: AuditRow[]; neverVisitedCounties?: AuditRow[] }, county: string): number | null {
  const row =
    audit.visitedCounties?.find((r) => r.county === county) ??
    audit.neverVisitedCounties?.find((r) => r.county === county);
  return row?.vciRank ?? null;
}

function stackLockedEvents(counties: string[], locked: Array<{ date: string; eventName: string; county: string }>): string[] {
  const set = new Set(counties);
  return locked
    .filter((e) => set.has(e.county))
    .map((e) => `${e.date.slice(5)} ${e.eventName}`)
    .slice(0, 4);
}

function openWeekends(): Array<{ label: string; start: string; end: string; days: string[] }> {
  const pairs: Array<{ label: string; start: string; end: string; days: string[] }> = [];
  const openDays = [
    "2026-07-19",
    "2026-08-08",
    "2026-08-09",
    "2026-08-15",
    "2026-08-16",
    "2026-08-23",
    "2026-08-30",
    "2026-09-06",
    "2026-09-26",
    "2026-09-27",
    "2026-10-03",
    "2026-10-11",
    "2026-10-12",
    "2026-10-18",
  ];
  let i = 0;
  while (i < openDays.length) {
    const d0 = openDays[i]!;
    const d1 = openDays[i + 1];
    if (d1 && isConsecutive(d0, d1) && isWeekendPair(d0, d1)) {
      pairs.push({ label: `${d0} → ${d1}`, start: d0, end: d1, days: [d0, d1] });
      i += 2;
    } else {
      pairs.push({ label: d0, start: d0, end: d0, days: [d0] });
      i += 1;
    }
  }
  return pairs;
}

function parseYmd(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(Date.UTC(y!, m! - 1, d!));
}

function isConsecutive(a: string, b: string): boolean {
  const da = parseYmd(a);
  da.setUTCDate(da.getUTCDate() + 1);
  return da.toISOString().slice(0, 10) === b;
}

function isWeekendPair(a: string, b: string): boolean {
  return parseYmd(a).getUTCDay() === 6 && parseYmd(b).getUTCDay() === 0;
}

type WeekendOption = {
  id: string;
  label: string;
  corridorId: string;
  corridorOrCounty: string;
  anchorCity: string;
  countiesTouched: string[];
  coverageCountiesGained: number;
  vciVoteWeight: string;
  top40CityImpact: string[];
  coalitionImpact: string;
  storytellingImpact: string;
  travelBurden: string;
  driveMinutes: number;
  candidateFatigueRisk: "low" | "medium" | "high";
  recommendedCategory:
    | "coverage completion"
    | "Tier 1 reinforcement"
    | "fundraising"
    | "coalition"
    | "story/momentum"
    | "rest/prep";
};

function buildWeekendOptions(
  weekend: { start: string; end: string },
  _audit: { visitedCounties?: AuditRow[]; neverVisitedCounties?: AuditRow[] },
): WeekendOption[] {
  const corridors = CORRIDOR_DEFS;
  const critMins = haversineMinutes(ROSE_BUD, "Crittenden");
  const bentMins = haversineMinutes(ROSE_BUD, "Benton");

  const options: WeekendOption[] = [
    {
      id: "delta-gateway",
      label: "Delta Gateway — West Memphis / Blytheville",
      corridorId: "delta-gateway",
      corridorOrCounty: "Delta Gateway",
      anchorCity: "West Memphis",
      countiesTouched: ["Crittenden", "Mississippi"],
      coverageCountiesGained: 2,
      vciVoteWeight: "High Delta gateway · Crittenden VCI top-20",
      top40CityImpact: ["West Memphis adjacency · Memphis spillover media"],
      coalitionImpact: "NAACP · Delta labor · West Memphis Dems",
      storytellingImpact: "Gateway communities · Mississippi River",
      travelBurden: travelBurdenLabel(critMins),
      driveMinutes: critMins,
      candidateFatigueRisk: "high",
      recommendedCategory: "coverage completion",
    },
    {
      id: "nwa-stack",
      label: "NWA Reinforcement — Benton + Washington",
      corridorId: "nwa-reinforcement",
      corridorOrCounty: "NWA Reinforcement",
      anchorCity: "Bentonville",
      countiesTouched: ["Benton", "Washington"],
      coverageCountiesGained: 0,
      vciVoteWeight: "Very high · #2 and #3 VCI counties statewide",
      top40CityImpact: ["Fayetteville", "Springdale", "Rogers", "Bentonville"],
      coalitionImpact: "AEA · Senior Dems · chamber validators",
      storytellingImpact: "NWA growth corridor · business validators",
      travelBurden: travelBurdenLabel(bentMins),
      driveMinutes: bentMins,
      candidateFatigueRisk: "medium",
      recommendedCategory: "Tier 1 reinforcement",
    },
    {
      id: "tier1-pine-bluff",
      label: "Tier 1 Revisit — Pine Bluff / Jefferson",
      corridorId: "tier1-revisit",
      corridorOrCounty: "Tier 1 Revisit",
      anchorCity: "Pine Bluff",
      countiesTouched: ["Jefferson"],
      coverageCountiesGained: 0,
      vciVoteWeight: "Very high · Jefferson Tier 1 · no locked revisit scheduled",
      top40CityImpact: ["Pine Bluff"],
      coalitionImpact: "Jefferson NAACP · educator network",
      storytellingImpact: "Urban Delta recovery · Lane 2 persuasion",
      travelBurden: "regional",
      driveMinutes: haversineMinutes(ROSE_BUD, "Jefferson"),
      candidateFatigueRisk: "medium",
      recommendedCategory: "Tier 1 reinforcement",
    },
    {
      id: "rest-prep",
      label: "Rest / content catch-up / Sherwood prep",
      corridorId: "rest",
      corridorOrCounty: "None",
      anchorCity: "Rose Bud / Little Rock",
      countiesTouched: [],
      coverageCountiesGained: 0,
      vciVoteWeight: "None",
      top40CityImpact: [],
      coalitionImpact: "Internal — volunteer calls · endorsement follow-up",
      storytellingImpact: "Story backlog · Substack · social content",
      travelBurden: "none",
      driveMinutes: 0,
      candidateFatigueRisk: "low",
      recommendedCategory: "rest/prep",
    },
  ];

  if (weekend.start >= "2026-08-15") {
    options.splice(3, 0, {
      id: "delta-river",
      label: "Delta River — Helena / Phillips + Monroe",
      corridorId: "delta-river",
      corridorOrCounty: "Delta River Corridor",
      anchorCity: "Helena",
      countiesTouched: ["Phillips", "Monroe", "St. Francis"],
      coverageCountiesGained: 3,
      vciVoteWeight: "Medium-high Delta · 3 never-visited counties",
      top40CityImpact: [],
      coalitionImpact: "Delta churches · historic civil rights validators",
      storytellingImpact: "Helena heritage · deep Delta listening",
      travelBurden: "immersion",
      driveMinutes: haversineMinutes(ROSE_BUD, "Phillips"),
      candidateFatigueRisk: "high",
      recommendedCategory: "coverage completion",
    });
  }

  if (weekend.start >= "2026-09-01") {
    options.splice(3, 0, {
      id: "ne-stack",
      label: "Northeast Completion — Walnut Ridge / Poinsett stack",
      corridorId: "northeast-completion",
      corridorOrCounty: "Northeast Completion",
      anchorCity: "Walnut Ridge",
      countiesTouched: ["Lawrence", "Randolph", "Poinsett"],
      coverageCountiesGained: 3,
      vciVoteWeight: "Medium · NE completion before Labor Day gate",
      top40CityImpact: ["Jonesboro adjacency for Craighead revisit"],
      coalitionImpact: "NE fair partners · educator intro",
      storytellingImpact: "Crowley's Ridge · railroad towns",
      travelBurden: "immersion",
      driveMinutes: haversineMinutes(ROSE_BUD, "Lawrence"),
      candidateFatigueRisk: "high",
      recommendedCategory: "coverage completion",
    });
  }

  return options.slice(0, 4);
}

function septemberGateStatus(
  settlement: {
    stillMissingCount?: number;
    projectedCountiesAfterLocked?: number;
    openDayCount?: number;
  },
  _audit: { visitedCounties?: AuditRow[]; neverVisitedCounties?: AuditRow[] },
  peoplePower: { volunteerLeadership?: { foundingTeamCurrent?: number } } | null,
  endorse: { endorsed?: number; requested?: number } | null,
  topCities: ReturnType<typeof buildTopCityReadiness>,
) {
  const remaining = settlement.stillMissingCount ?? 25;
  const projected = settlement.projectedCountiesAfterLocked ?? 50;
  const top10NeedRevisit = topCities.filter((c) => c.isTop10 && c.needsRevisit).length;
  const top10Scheduled = topCities.filter((c) => c.isTop10 && c.nextLockedVisit).length;

  return [
    {
      id: "all-75-counties",
      criterion: "All 75 counties touched or scheduled for completion",
      status: remaining <= 10 ? "partial" : "missing",
      detail: `${projected}/75 projected after locked · ${remaining} still missing · corridors defined for all 25`,
    },
    {
      id: "top-10-revisited",
      criterion: "Top 10 cities revisited or scheduled",
      status: top10NeedRevisit <= 3 ? "partial" : "missing",
      detail: `${top10Scheduled}/10 have locked visits · ${top10NeedRevisit} need revisit before Labor Day`,
    },
    {
      id: "volunteer-leaders",
      criterion: "Volunteer leaders active after June 28 launch",
      status: (peoplePower?.volunteerLeadership?.foundingTeamCurrent ?? 0) >= 10 ? "partial" : "missing",
      detail: `${peoplePower?.volunteerLeadership?.foundingTeamCurrent ?? 0}/20 founding team · launch Jun 28`,
    },
    {
      id: "sherwood",
      criterion: "Sherwood operation on track (Jul 3–4 + Sept 17)",
      status: "partial",
      detail: "Jul 3 Sherwood locked · Sept 17 Sherwood in plan — VIP/volunteer metrics TBD",
    },
    {
      id: "endorsements",
      criterion: "Endorsement pipeline active",
      status: (endorse?.endorsed ?? 0) > 0 ? "partial" : "missing",
      detail: `${endorse?.endorsed ?? 0} endorsed · ${endorse?.requested ?? 0} requested`,
    },
    {
      id: "delta-partial",
      criterion: "Delta corridor at least partially covered",
      status: "missing",
      detail: "8 Delta counties in audit · 0 locked in Delta gateway · Phase A recommends Delta Gateway weekend",
    },
    {
      id: "public-proof",
      criterion: "Public proof archive growing",
      status: "missing",
      detail: "Substack 0 · Mobilize 0 linked · story workflow not yet operational",
    },
  ];
}

function buildTopCityReadiness(
  audit: { visitedCounties?: AuditRow[]; neverVisitedCounties?: AuditRow[] },
  locked: Array<{ date: string; eventName: string; city: string; county: string }>,
) {
  const visitedByCounty = new Map((audit.visitedCounties ?? []).map((r: AuditRow) => [r.county, r]));

  return ARKANSAS_TOP_75_CITIES.map((city) => {
    const countyRow = visitedByCounty.get(city.county) as AuditRow | undefined;
    const lockedInCity = locked.filter(
      (e) =>
        e.city?.toLowerCase().includes(city.name.toLowerCase()) ||
        e.county === city.county ||
        (city.county === "Pulaski" && e.city?.includes("Little Rock")),
    );
    const nextLocked = lockedInCity.sort((a, b) => a.date.localeCompare(b.date))[0];
    const daysSince = countyRow?.daysSinceLastVisit ?? null;
    const needsRevisit =
      city.isTop10 &&
      (daysSince === null || daysSince > 45) &&
      !["Little Rock", "North Little Rock", "Sherwood"].includes(city.name);

    const roles: string[] = [];
    if (city.influenceTags.includes("fundraising")) roles.push("fundraising");
    if (city.influenceTags.includes("volunteers")) roles.push("volunteer production");
    if (city.influenceTags.includes("media") || city.influenceTags.includes("regional_media"))
      roles.push("media");
    if (city.influenceTags.includes("persuasion") || city.influenceTags.includes("moderate_republicans"))
      roles.push("persuasion");
    if (city.influenceTags.includes("students") || city.influenceTags.includes("turnout_growth"))
      roles.push("vote production");
    if (city.influenceTags.includes("chambers") || city.influenceTags.includes("business_leaders"))
      roles.push("coalition");
    roles.push("story/momentum");

    let sepStatus: "met" | "partial" | "missing" | "unknown" = "unknown";
    if (nextLocked && nextLocked.date <= LABOR_DAY) sepStatus = "partial";
    else if (countyRow && (countyRow.daysSinceLastVisit ?? 999) < 30) sepStatus = "partial";
    else if (needsRevisit) sepStatus = "missing";
    else sepStatus = "partial";

    return {
      rank: ARKANSAS_TOP_75_CITIES.indexOf(city) + 1,
      city: city.name,
      county: city.county,
      isTop10: city.isTop10,
      lastKnownVisit: countyRow?.lastVisitDate ?? null,
      daysSinceLastVisit: daysSince,
      nextLockedVisit: nextLocked ? { date: nextLocked.date, event: nextLocked.eventName } : null,
      septemberReadinessStatus: sepStatus,
      needsRevisit,
      cityRoles: [...new Set(roles)],
      strategicRole: city.strategicRole,
      visitFrequency: city.visitFrequency,
    };
  });
}

function main() {
  mkdirSync(OUT, { recursive: true });

  const settlement = readJson<{
    stillMissingCounties?: string[];
    stillMissingCount?: number;
    projectedCountiesAfterLocked?: number;
    visitedBaseline?: number;
    openDayCount?: number;
  }>(SETTLEMENT);
  const audit = readJson<{
    visitedCounties?: AuditRow[];
    neverVisitedCounties?: AuditRow[];
  }>(AUDIT_PATH);
  const lockedRaw = readJson<{ events: Array<{ date: string; eventName: string; city: string; county: string }> }>(
    LOCKED_PATH,
  );
  const peoplePower = readJson<{ volunteerLeadership?: { foundingTeamCurrent?: number; foundingTeamGoal?: number } }>(
    path.join(BRAIN_DATA, "people-power-network.json"),
  );
  const endorse = readJson<{ endorsed?: number; requested?: number }>(
    path.join(BRAIN_DATA, "endorsement-scorecard.json"),
  );

  const locked = lockedRaw?.events ?? [];
  const remaining = settlement?.stillMissingCounties ?? [];

  const corridors: CorridorDef[] = CORRIDOR_DEFS.map((c) => ({
    ...c,
    stackWithLocked: stackLockedEvents(c.counties, locked),
  }));

  const corridorJson = {
    generatedAt: new Date().toISOString(),
    disclaimer: DISCLAIMER,
    remainingCountyCount: remaining.length,
    corridorCount: corridors.length,
    corridors: corridors.map((c) => ({
      ...c,
      countiesRemaining: c.counties.filter((x) => remaining.includes(x)),
      vciRanks: Object.fromEntries(c.counties.map((co) => [co, vciRank(audit ?? {}, co)])),
    })),
  };
  writeFileSync(path.join(OUT, "coverage-completion-corridors.json"), JSON.stringify(corridorJson, null, 2));

  let corridorsMd = `# Coverage Completion Corridors

> ${DISCLAIMER}

**${remaining.length} remaining counties** grouped into **${corridors.length} corridors** (not 25 one-off trips).

| Corridor | Counties | Anchor | Travel | Overnight |
|----------|----------|--------|--------|-----------|
${corridors
  .map(
    (c) =>
      `| ${c.name} | ${c.counties.join(", ")} | ${c.anchorCity} | ${c.travelClass} | ${c.overnightLikely ? "yes" : "no"} |`,
  )
  .join("\n")}

---

`;
  for (const c of corridors) {
    corridorsMd += `## ${c.name}

- **Counties:** ${c.counties.join(" · ")}
- **Remaining in this corridor:** ${c.counties.filter((x) => remaining.includes(x)).join(", ") || "—"}
- **Anchor:** ${c.anchorCity}
- **Route:** ${c.suggestedRoute}
- **Stack with locked:** ${c.stackWithLocked.join(" · ") || "—"}
- **Coverage value:** ${c.coverageValue} · **Vote production:** ${c.voteProductionValue}
- **Coalition:** ${c.coalitionValue}
- **Storytelling:** ${c.storytellingValue}

`;
  }
  writeFileSync(path.join(OUT, "coverage-completion-corridors.md"), corridorsMd);

  const weekends = openWeekends();
  const matrix = weekends.map((w) => ({
    weekend: w.label,
    start: w.start,
    end: w.end,
    options: buildWeekendOptions(w, audit ?? {}),
  }));
  writeFileSync(path.join(OUT, "weekend-tradeoff-matrix.json"), JSON.stringify({ generatedAt: new Date().toISOString(), weekends: matrix }, null, 2));

  let matrixMd = `# Weekend Tradeoff Matrix

> ${DISCLAIMER}

Each open weekend shows **coverage vs vote production vs recovery** tradeoffs. No dates assigned.

`;
  for (const w of matrix) {
    matrixMd += `## Weekend: ${w.weekend}\n\n`;
    for (const o of w.options) {
      matrixMd += `### ${o.label}\n\n`;
      matrixMd += `- **Coverage gained:** ${o.coverageCountiesGained} counties (${o.countiesTouched.join(", ") || "none"})\n`;
      matrixMd += `- **VCI / vote weight:** ${o.vciVoteWeight}\n`;
      matrixMd += `- **Top 40 impact:** ${o.top40CityImpact.join(", ") || "minimal"}\n`;
      matrixMd += `- **Coalition:** ${o.coalitionImpact}\n`;
      matrixMd += `- **Storytelling:** ${o.storytellingImpact}\n`;
      matrixMd += `- **Travel:** ${o.travelBurden} (${o.driveMinutes}m)\n`;
      matrixMd += `- **Fatigue risk:** ${o.candidateFatigueRisk}\n`;
      matrixMd += `- **Category:** ${o.recommendedCategory}\n\n`;
    }
  }
  writeFileSync(path.join(OUT, "weekend-tradeoff-matrix.md"), matrixMd);

  const topCities = buildTopCityReadiness(audit ?? {}, locked);
  writeFileSync(path.join(OUT, "top-city-readiness.json"), JSON.stringify({ generatedAt: new Date().toISOString(), cities: topCities }, null, 2));

  let topMd = `# Top 40 / Top 10 City Readiness

> ${DISCLAIMER}

## Top 10 — September readiness

| City | County | Last visit | Next locked | Needs revisit? | Sep status |
|------|--------|------------|-------------|----------------|------------|
${topCities
  .filter((c) => c.isTop10)
  .map(
    (c) =>
      `| ${c.city} | ${c.county} | ${c.lastKnownVisit ?? "—"} | ${c.nextLockedVisit?.event ?? "—"} | ${c.needsRevisit ? "yes" : "no"} | ${c.septemberReadinessStatus} |`,
  )
  .join("\n")}

## Top 40 at risk by September

${topCities
  .filter((c) => c.needsRevisit || c.septemberReadinessStatus === "missing")
  .map((c) => `- **${c.city}** (${c.county}) · roles: ${c.cityRoles.join(", ")}`)
  .join("\n")}
`;
  writeFileSync(path.join(OUT, "top-city-readiness.md"), topMd);

  const gate = septemberGateStatus(settlement ?? {}, audit ?? {}, peoplePower, endorse, topCities);
  writeFileSync(path.join(OUT, "september-readiness-gate.json"), JSON.stringify({ laborDay: LABOR_DAY, criteria: gate }, null, 2));

  let gateMd = `# September Readiness Gate

> Labor Day anchor: **${LABOR_DAY}**

## Required by Labor Day

| Criterion | Status | Detail |
|-----------|--------|--------|
${gate.map((g) => `| ${g.criterion} | **${g.status}** | ${g.detail} |`).join("\n")}

## Not required by Labor Day

- Every county revisited
- Every coalition endorsement completed
- Perfect Calendar Truth
- Every final GOTV detail locked
`;
  writeFileSync(path.join(OUT, "september-readiness-gate.md"), gateMd);

  const conflicts = [
    {
      conflict: "Coverage vs vote production",
      example: "Crittenden (+2 counties) vs NWA stack (0 new · highest VCI)",
      weekends: ["Aug 8–9", "Aug 15–16", "Sep 26–27"],
    },
    {
      conflict: "Delta immersion vs candidate recovery",
      example: "Delta River 3-day vs rest/prep before Sep forum wave",
      weekends: ["Aug 15–16", "Aug 23"],
    },
    {
      conflict: "Tier 1 revisit vs county completion",
      example: "Pine Bluff/Jefferson revisit vs Phillips/Monroe never-visited",
      weekends: ["Jul 19", "Aug 8–9"],
    },
    {
      conflict: "Labor Day gate vs open weekend count",
      example: `Only ${settlement?.openDayCount ?? 14} open days for ${remaining.length} remaining counties — requires multi-county corridors`,
      weekends: ["All open weekends"],
    },
  ];

  const leadershipBrief = `# Leadership Review Brief — Calendar Fill Phase A

> ${DISCLAIMER}

## 1. Which corridors complete county coverage most efficiently?

| Priority | Corridor | Counties | Best stack |
|----------|----------|----------|------------|
| 1 | Delta Gateway | Crittenden, Mississippi | Standalone overnight |
| 2 | Delta River | Phillips, Monroe, St. Francis | LR Tue origin |
| 3 | Southeast Delta | Ashley, Chicot, Lincoln | Union immersion Jul 25–29 |
| 4 | Northeast Completion | Lawrence, Randolph, Jackson, Poinsett, Woodruff | Greene immersion Jul 12–14 |
| 5 | Southwest Completion | Calhoun, Dallas, Miller, Sevier, Grant | Union / Arkadelphia |
| 6 | Ozark Completion | Newton, Madison, Perry, Logan, Little River | Harrison Sep 28 |
| 7 | Central Prairie | Prairie, Scott | Same-day from LR |

**10 corridors total** including Tier 1 / NWA / River Valley **reinforcement** (vote production, not completion).

## 2. Which open weekends create the biggest vote-production opportunity?

- **NWA Reinforcement** (Benton + Washington) — Fayetteville · Springdale · Rogers · Bentonville
- **Tier 1 Revisit** — Pine Bluff (Jefferson) · Jonesboro (Craighead) — no locked revisit scheduled
- **River Valley** — Fort Smith stack aligned with Sebastian immersion Jul 31

## 3. Where do county completion and vote production conflict?

${conflicts.map((c) => `- **${c.conflict}:** ${c.example} (${c.weekends.join(", ")})`).join("\n")}

## 4. What must be true by Labor Day?

${gate.filter((g) => g.status !== "met").map((g) => `- [${g.status.toUpperCase()}] ${g.criterion}`).join("\n")}

## 5. Decisions before Phase B (date assignment)

1. Accept **multi-day Delta overnight** as prerequisite for 75-county completion?
2. Allocate **how many of ${settlement?.openDayCount ?? 14} open weekends** to coverage vs Tier 1 reinforcement?
3. Confirm **Jefferson + Craighead** revisits before or after Delta gateway?
4. Sherwood Sept 17 — locked in plan; confirm VIP/volunteer targets?
5. Endorsement pipeline — activate before or after county fill?

---

**Phase B should not begin until leadership chooses whether to prioritize:**

- **A.** Fastest path to 75 counties
- **B.** Highest VCI vote production
- **C.** Balanced route with Delta + Tier 1 reinforcement
`;
  writeFileSync(path.join(OUT, "LEADERSHIP-REVIEW-BRIEF.md"), leadershipBrief);

  const phaseAMd = `# Calendar Fill Phase A

> ${DISCLAIMER}

## Summary

| Metric | Value |
|--------|------:|
| Baseline visited | ${settlement?.visitedBaseline ?? 43}/75 |
| After locked backbone | ${settlement?.projectedCountiesAfterLocked ?? 50}/75 |
| Remaining counties | ${remaining.length} |
| Completion corridors | ${corridors.filter((c) => c.category === "completion").length} |
| Reinforcement corridors | ${corridors.filter((c) => c.category === "reinforcement").length} |
| Open weekends | ${weekends.length} |
| Top tradeoff | Coverage (Delta) vs vote production (NWA) |

## Deliverables

- [coverage-completion-corridors.md](./coverage-completion-corridors.md)
- [weekend-tradeoff-matrix.md](./weekend-tradeoff-matrix.md)
- [september-readiness-gate.md](./september-readiness-gate.md)
- [top-city-readiness.md](./top-city-readiness.md)
- [LEADERSHIP-REVIEW-BRIEF.md](./LEADERSHIP-REVIEW-BRIEF.md)

## Next step

Leadership review → choose A / B / C balance → **Phase B assigns weekends** (not started).
`;
  writeFileSync(path.join(OUT, "CALENDAR-FILL-PHASE-A.md"), phaseAMd);

  const summary = {
    generatedAt: new Date().toISOString(),
    disclaimer: DISCLAIMER,
    datesAssigned: false,
    corridorCount: corridors.length,
    remainingCountyCount: remaining.length,
    openWeekendCount: weekends.length,
    topTradeoffConflicts: conflicts.map((c) => c.conflict),
    septemberGaps: gate.filter((g) => g.status === "missing").map((g) => g.id),
    topWeekendTradeoffs: matrix.slice(0, 3).map((w) => ({
      weekend: w.weekend,
      optionA: w.options[0]?.label,
      optionB: w.options[1]?.label,
    })),
  };
  writeFileSync(path.join(OUT, "calendar-fill-phase-a.summary.json"), JSON.stringify(summary, null, 2));

  console.log(
    `Calendar Fill Phase A: ${corridors.length} corridors · ${remaining.length} counties grouped · ${weekends.length} open weekends · no dates assigned`,
  );
}

main();
