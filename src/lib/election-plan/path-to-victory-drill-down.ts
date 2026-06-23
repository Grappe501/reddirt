import winTargetSource from "../../../data/election/kelly-win-target-scenario-v1.json";

import { getCoalitionWorkbenchRegistry } from "@/lib/election-plan/community-workbench/load-coalition-workbench-profile";
import {
  COUNTY_PLAYBOOK_EXECUTIVE_JUMP_LINKS,
  countyDropOffHref,
  countyRegistrationDashboardHref,
} from "@/lib/election-plan/county-playbook-links";
import { FOUR_LANE_DEFINITIONS, type FourLaneId } from "@/lib/election-plan/four-lanes-labels";
import { getFosCountyRollup } from "@/lib/election-plan/load-fundraising-operating-system";
import {
  countyAllocatedRegistrationTotal,
  countyCityRegistrationAllocation,
  getCityNumericTargets,
} from "@/lib/election-plan/load-city-numeric-targets";
import {
  PO5_CONVERSATIONS_PER_LEADER,
  PO5_VOTERS_PER_LEADER,
  computeVictoryMetrics,
  getCityVictoryTarget,
  getCountyVictoryTarget,
  type CityVictoryTarget,
  type CountyVictoryTarget,
} from "@/lib/election-plan/load-county-victory-targets";
import { loadElectionPlanSnapshot } from "@/lib/election-plan/electionPlanSnapshot";
import { getCountyByName, getCountyBySlug } from "@/lib/election-plan/load-county";
import {
  buildLanesDrillDown,
  type LanesAreaKpi,
  type LanesCountyKpi,
} from "@/lib/election-plan/load-lanes-drill-down";
import { lanesClusterHref, lanesCountyHref } from "@/lib/election-plan/lanes-drill-down-links";
import { cityLocationBriefHref, countyPlaybookHref } from "@/lib/election-plan/location-links";
import { cityPathToVictoryHref, countyPathToVictoryHref } from "@/lib/election-plan/path-to-victory-links";
import type { ElectionPlanCity, ElectionPlanCounty, ElectionPlanWorkbenchSnapshot } from "@/lib/election-plan/types";
import { VCI_EXPLAINER } from "@/lib/election-plan/vci-explainer";

export type DataSourceCitation = {
  id: string;
  label: string;
  file: string;
  field?: string;
  note: string;
};

export type PathToVictoryLaneRow = {
  laneId: FourLaneId;
  rawPotential: number;
  achievementRate: number | null;
  expectedCapture: number;
  volunteerFocus: string[];
  sourceIds: string[];
};

export type HousePartyCityRow = {
  citySlug: string;
  cityName: string;
  hosts: number;
  activeHosts: number;
  powerOf5Circles: number;
  conversationsTarget: number;
  vipTables: number | null;
};

export type HousePartyRollup = {
  hosts: number;
  activeHosts: number;
  powerOf5Circles: number;
  conversationsTarget: number;
  vipTables: number;
  cities: HousePartyCityRow[];
};

export type CoalitionFrameworkRow = {
  slug: string;
  name: string;
  tagline: string;
  relevance: string;
  workbenchHref: string;
};

export type RegistrationAllocationRow = {
  citySlug: string;
  cityName: string;
  countySharePct: number;
  newRegistrations: number;
  registrationChecks: number;
};

type WinScenarioRow = {
  county: string;
  projectedTotalVotes: number;
  baselineDemVotes: number;
  baselineDemShare: number;
  registrationGoal: number;
  registrationGoalSource: string;
  targetVotes: number;
  targetVoteGain: number;
  countyWinContribution: number;
  confidence: string;
  missingData?: string[];
};

const BASE_CITATIONS: DataSourceCitation[] = [
  {
    id: "win-scenario",
    label: "Kelly win-target scenario",
    file: "data/election/kelly-win-target-scenario-v1.json",
    field: "counties[].targetVotes, baselineDemVotes, registrationGoal",
    note: "Planning model — not a forecast. County targets allocated from statewide cushion model.",
  },
  {
    id: "election-history",
    label: "Arkansas county election history",
    file: "data/election/arkansas-county-election-history.normalized.json",
    field: "rows[].sos2022DemVotes, treasurer2024DemVotes",
    note: "Verified SOS / statewide race results for baseline crosswalk.",
  },
  {
    id: "workbench-snapshot",
    label: "Election Plan workbench snapshot",
    file: "data/election-plan/election-plan-workbench.snapshot.json",
    field: "counties[].lane2Recovery50, registrationGoal, gopConversionPotential, vci",
    note: "Four-lane planning inputs and VCI ranks — rebuilt via npm run election-plan:build.",
  },
  {
    id: "achievement-rates",
    label: "Lane achievement rates",
    file: "data/election-plan/election-plan-workbench.snapshot.json",
    field: "lanesOverview.achievementRates",
    note: "Lane 2 @ 50%, Lane 3 @ 60%, Lane 4 @ 40% — planning assumptions for expected capture.",
  },
  {
    id: "city-numeric",
    label: "City location numeric targets",
    file: "data/campaign-brain/city-location-numeric-targets.source.json",
    field: "targets[].registration, houseParties, volunteers",
    note: "House party and registration math from Power of 5 + chapter-05 county allocation.",
  },
  {
    id: "fos",
    label: "Fundraising Operating System",
    file: "data/campaign-brain/fundraising-operating-system.source.json",
    field: "stateGoal, communityStretchMultipliers",
    note: "Dollar goals proportional to city vote targets within Top 175.",
  },
  {
    id: "coalition-registry",
    label: "Coalition workbench registry",
    file: "data/campaign-brain/coalition-workbenches.registry.source.json",
    field: "workbenches[]",
    note: "Framework slots for local coalition leads — not assumptions about any community.",
  },
];

function findClusterForCounty(data: ElectionPlanWorkbenchSnapshot, countyName: string) {
  return data.execution.clusters.find((c) => c.counties.includes(countyName)) ?? null;
}

function findLanesCounty(data: ElectionPlanWorkbenchSnapshot, countySlug: string): {
  clusterId: string;
  clusterName: string;
  county: LanesCountyKpi;
} | null {
  const drill = buildLanesDrillDown(data);
  for (const cluster of drill.clusters) {
    const county = cluster.counties.find((c) => c.slug === countySlug);
    if (county) {
      return { clusterId: cluster.id, clusterName: cluster.name, county };
    }
  }
  return null;
}

function getWinScenarioRow(countyName: string): WinScenarioRow | null {
  const rows = (winTargetSource as { counties: WinScenarioRow[] }).counties;
  return rows.find((r) => r.county === countyName) ?? null;
}

function laneVolunteerFocus(laneId: FourLaneId, county: ElectionPlanCounty): string[] {
  const mission = county.primaryMission.toLowerCase();
  if (laneId === "lane1") {
    return [
      "Hold baseline Democratic voters — early vote chase and relational GOTV",
      "Prevent midterm-style drop-off from 2024 Treasurer baseline",
      "Pair every persuasion contact with a concrete ballot-plan ask",
    ];
  }
  if (laneId === "lane2") {
    const focus = [
      `Recover drop-off Democrats — county pool modeled at ${county.lane2Recovery50.toLocaleString()} @ 50% working goal`,
      "Crosswalk chapter-04 drop-off lists with relational follow-up (no public PII)",
      "Power of Five circles: five conversations per core supporter",
    ];
    if (mission.includes("recovery")) {
      focus.unshift("PRIMARY COUNTY MISSION — prioritize Lane 2 contacts this week");
    }
    return focus;
  }
  if (laneId === "lane3") {
    const focus = [
      `Register toward ${county.registrationGoal.toLocaleString()} new voters (chapter-05 county allocation)`,
      "Deputy registrar partnerships — churches, unions, schools, events",
      "Help 10 Participate: each volunteer completes 10 registration checks",
    ];
    if (mission.includes("registration")) {
      focus.unshift("PRIMARY COUNTY MISSION — registration checks and clerk partnerships");
    }
    return focus;
  }
  const focus = [
    `Relationship persuasion — ${county.gopConversionPotential.toLocaleString()} modeled conversion pool @ 12% peel`,
    "Moderate Republican and independent validators — town halls, not broadcast attacks",
    "Document every persuasion touch in the field entry log",
  ];
  if (mission.includes("persuasion") || mission.includes("conversion")) {
    focus.unshift("PRIMARY COUNTY MISSION — validator-led persuasion conversations");
  }
  return focus;
}

function buildLaneRows(
  county: ElectionPlanCounty,
  rates: { lane2: number; lane3: number; lane4: number },
  baseline: number,
): PathToVictoryLaneRow[] {
  const lane2Expected = Math.round(county.lane2Recovery50 * rates.lane2);
  const lane3Expected = Math.round(county.registrationGoal * rates.lane3);
  const lane4Expected = Math.round(county.gopConversionPotential * rates.lane4);

  return [
    {
      laneId: "lane1",
      rawPotential: baseline,
      achievementRate: null,
      expectedCapture: baseline,
      volunteerFocus: laneVolunteerFocus("lane1", county),
      sourceIds: ["win-scenario", "election-history"],
    },
    {
      laneId: "lane2",
      rawPotential: county.lane2Recovery50,
      achievementRate: rates.lane2,
      expectedCapture: lane2Expected,
      volunteerFocus: laneVolunteerFocus("lane2", county),
      sourceIds: ["workbench-snapshot", "achievement-rates", "win-scenario"],
    },
    {
      laneId: "lane3",
      rawPotential: county.registrationGoal,
      achievementRate: rates.lane3,
      expectedCapture: lane3Expected,
      volunteerFocus: laneVolunteerFocus("lane3", county),
      sourceIds: ["workbench-snapshot", "city-numeric", "achievement-rates"],
    },
    {
      laneId: "lane4",
      rawPotential: county.gopConversionPotential,
      achievementRate: rates.lane4,
      expectedCapture: lane4Expected,
      volunteerFocus: laneVolunteerFocus("lane4", county),
      sourceIds: ["workbench-snapshot", "achievement-rates"],
    },
  ];
}

function buildHousePartyRollup(county: ElectionPlanCounty, cities: ElectionPlanCity[]): HousePartyRollup | null {
  const inCounty = cities.filter((c) => c.county === county.county);
  const rows: HousePartyCityRow[] = [];

  for (const city of inCounty) {
    const numeric = getCityNumericTargets(city.slug);
    if (!numeric) continue;
    rows.push({
      citySlug: city.slug,
      cityName: city.name,
      hosts: numeric.houseParties.hosts,
      activeHosts: numeric.houseParties.activeHosts,
      powerOf5Circles: numeric.houseParties.powerOf5Circles,
      conversationsTarget: numeric.houseParties.conversationsTarget,
      vipTables: numeric.houseParties.vipTables,
    });
  }

  if (rows.length === 0) return null;

  return {
    hosts: rows.reduce((s, r) => s + r.hosts, 0),
    activeHosts: rows.reduce((s, r) => s + r.activeHosts, 0),
    powerOf5Circles: rows.reduce((s, r) => s + r.powerOf5Circles, 0),
    conversationsTarget: rows.reduce((s, r) => s + r.conversationsTarget, 0),
    vipTables: rows.reduce((s, r) => s + (r.vipTables ?? 0), 0),
    cities: rows.sort((a, b) => b.hosts - a.hosts),
  };
}

function coalitionRelevance(primaryMission: string, clusterId: string | null, slug: string): string | null {
  const mission = primaryMission.toLowerCase();
  const bySlug: Record<string, string> = {
    "african-american-outreach": "Faith, civic orgs, NAACP, Greek life — core Lane 2 recovery in Delta and metro counties",
    "hispanic-outreach": "Family networks, schools, festivals — registration and turnout expansion",
    "faith-communities": "Multi-faith relational organizing — Lane 2 chase and house party hosts",
    "muslim-community": "Community connectors and election info teams — registration and turnout",
    "womens-leadership": "County women's chairs and mentor networks — volunteer production",
    labor: "Union halls and workplace conversations — persuasion and registration",
    veterans: "Validator-led persuasion — trust-first Lane 4 conversations",
    "youth-engagement": "Campus and young-voter registration — Lane 3 pipeline",
    "disability-community": "Accessible voter education and registration support",
    "rural-arkansas": "Town halls, county fairs, rural validators — Lane 4 and volunteer production",
    "small-business": "Chamber and main-street networks — fundraising and persuasion",
    educators: "School connections and deputy registrar partnerships — Lane 3",
  };

  if (bySlug[slug] && (mission.includes("recovery") || mission.includes("registration") || mission.includes("persuasion"))) {
    return bySlug[slug];
  }

  if (slug === "rural-arkansas" && clusterId && ["southwest", "north-central-ozarks", "hot-springs-ouachita"].includes(clusterId)) {
    return bySlug[slug];
  }
  if (slug === "african-american-outreach" && clusterId && ["delta-southeast", "crittenden-memphis", "central-metro"].includes(clusterId)) {
    return bySlug[slug];
  }
  if (slug === "hispanic-outreach" && clusterId && ["nwa", "river-valley", "central-metro"].includes(clusterId)) {
    return bySlug[slug];
  }
  if (slug === "small-business" && clusterId && ["nwa", "central-metro", "river-valley"].includes(clusterId)) {
    return bySlug[slug];
  }
  if (slug === "educators" && mission.includes("registration")) {
    return bySlug[slug];
  }
  if (slug === "faith-communities") {
    return bySlug[slug];
  }

  return null;
}

function buildCoalitionFrameworks(
  primaryMission: string,
  clusterId: string | null,
): CoalitionFrameworkRow[] {
  return getCoalitionWorkbenchRegistry()
    .map((profile) => {
      const relevance = coalitionRelevance(primaryMission, clusterId, profile.slug);
      if (!relevance) return null;
      return {
        slug: profile.slug,
        name: profile.name,
        tagline: profile.tagline,
        relevance,
        workbenchHref: `/election-plan/workbenches/${profile.slug}`,
      };
    })
    .filter((row): row is CoalitionFrameworkRow => Boolean(row))
    .slice(0, 8);
}

function persuasionFocusFromCounty(
  county: ElectionPlanCounty,
  cities: ElectionPlanCity[],
  clusterId: string | null,
): string[] {
  const tags = new Set<string>();
  for (const city of cities.filter((c) => c.county === county.county)) {
    for (const tag of city.influenceTags ?? []) {
      tags.add(tag);
    }
    if (city.influenceCategory) tags.add(city.influenceCategory);
  }

  const focus: string[] = [];
  const mission = county.primaryMission.toLowerCase();

  if (mission.includes("persuasion") || mission.includes("conversion")) {
    focus.push("Moderate Republican and independent voters — relationship-first, validator-led");
  }
  if (mission.includes("recovery")) {
    focus.push("2022 Democratic drop-off — especially low-turnout midterm slices");
  }
  if (mission.includes("registration")) {
    focus.push("Unregistered and low-propensity eligible voters — Help 10 Participate");
  }

  if (clusterId === "nwa") focus.push("University pipeline and chamber moderates (NWA growth corridor)");
  if (clusterId === "delta-southeast" || clusterId === "crittenden-memphis") {
    focus.push("Faith and community institutions — base turnout and Lane 2 recovery");
  }
  if (clusterId === "rural-arkansas" || clusterId === "southwest" || clusterId === "north-central-ozarks") {
    focus.push("Rural validators — county fairs, town halls, retiree persuasion");
  }

  for (const tag of tags) {
    focus.push(tag);
  }

  if (county.strategicRole) focus.push(county.strategicRole);

  return [...new Set(focus)].slice(0, 10);
}

function buildRegistrationRows(
  county: ElectionPlanCounty,
  cities: ElectionPlanCity[],
): RegistrationAllocationRow[] {
  return countyCityRegistrationAllocation(county, cities).map(({ city, targets }) => ({
    citySlug: city.slug,
    cityName: city.name,
    countySharePct: targets.registration.countySharePct,
    newRegistrations: targets.registration.newRegistrations,
    registrationChecks: targets.registration.registrationChecks,
  }));
}

export type PathToVictoryCountyView = {
  kind: "county";
  county: string;
  slug: string;
  tier: string;
  vci: number;
  vciRank: number;
  clusterId: string | null;
  clusterName: string | null;
  strategicRole: string;
  primaryMission: string;
  secondaryMission: string;
  recommendedAction: string;
  narrative: string | null;
  engagementThisWeek: string[];
  victoryTarget: CountyVictoryTarget;
  winScenario: WinScenarioRow | null;
  lanes: PathToVictoryLaneRow[];
  totalExpectedLaneCapture: number;
  lane1Baseline: number;
  areaBreakdown: LanesAreaKpi[];
  registrationAllocation: RegistrationAllocationRow[];
  registrationAllocatedTotal: number;
  housePartyRollup: HousePartyRollup | null;
  fundraising: ReturnType<typeof getFosCountyRollup>;
  coalitionFrameworks: CoalitionFrameworkRow[];
  persuasionFocus: string[];
  citations: DataSourceCitation[];
  relatedLinks: Array<{ href: string; label: string }>;
};

export type PathToVictoryCityView = {
  kind: "city";
  name: string;
  slug: string;
  county: string;
  countySlug: string;
  rank: number;
  influenceCategory: string;
  influenceTags: string[];
  strategicRole: string;
  visitFrequency: string;
  victoryTarget: CityVictoryTarget;
  countyContext: Pick<
    ElectionPlanCounty,
    "tier" | "primaryMission" | "secondaryMission" | "registrationGoal" | "lane2Recovery50" | "gopConversionPotential" | "vci" | "vciRank"
  >;
  lanes: PathToVictoryLaneRow[];
  areaBreakdown: LanesAreaKpi | null;
  numericTargets: ReturnType<typeof getCityNumericTargets>;
  housePartyRollup: HousePartyRollup | null;
  persuasionFocus: string[];
  citations: DataSourceCitation[];
  relatedLinks: Array<{ href: string; label: string }>;
};

export function buildCountyPathToVictory(
  countySlug: string,
  opts?: {
    narrative?: string | null;
    engagementThisWeek?: string[];
  },
): PathToVictoryCountyView | null {
  const data = loadElectionPlanSnapshot();
  const county = getCountyBySlug(data, countySlug);
  if (!county) return null;

  const victoryTarget = getCountyVictoryTarget(county.county, county.tier);
  if (!victoryTarget) return null;

  const cluster = findClusterForCounty(data, county.county);
  const lanesCounty = findLanesCounty(data, county.slug);
  const rates = data.lanesOverview.achievementRates;
  const winScenario = getWinScenarioRow(county.county);
  const baseline = winScenario?.baselineDemVotes ?? victoryTarget.planningBaseline;
  const lanes = buildLaneRows(county, rates, baseline);
  const laneAdd = lanes.slice(1).reduce((s, l) => s + l.expectedCapture, 0);

  const registrationAllocation = buildRegistrationRows(county, data.cities);
  const housePartyRollup = buildHousePartyRollup(county, data.cities);

  const relatedLinks = [
    { href: countyPlaybookHref(county.county, county.slug), label: `${county.county} County intelligence` },
    { href: countyDropOffHref(county.slug), label: "Chapter 4 · Democratic drop-off" },
    { href: countyRegistrationDashboardHref(county.slug), label: "Chapter 5 · Registration dashboard" },
    { href: COUNTY_PLAYBOOK_EXECUTIVE_JUMP_LINKS.pathToVictory, label: "Executive Book · Path to Victory" },
    { href: COUNTY_PLAYBOOK_EXECUTIVE_JUMP_LINKS.countyVictoryTargets, label: "Executive Book · County victory targets" },
    { href: "/election-plan/lanes-overview", label: "Four lanes overview" },
  ];

  if (cluster && lanesCounty) {
    relatedLinks.push({
      href: lanesCountyHref(cluster.id, county.slug),
      label: `${cluster.name} · lane drill-down`,
    });
    relatedLinks.push({ href: lanesClusterHref(cluster.id), label: `${cluster.name} cluster` });
  }

  return {
    kind: "county",
    county: county.county,
    slug: county.slug,
    tier: county.tier,
    vci: county.vci,
    vciRank: county.vciRank,
    clusterId: cluster?.id ?? null,
    clusterName: cluster?.name ?? null,
    strategicRole: county.strategicRole,
    primaryMission: county.primaryMission,
    secondaryMission: county.secondaryMission,
    recommendedAction: county.recommendedAction,
    narrative: opts?.narrative ?? null,
    engagementThisWeek: opts?.engagementThisWeek ?? [],
    victoryTarget,
    winScenario,
    lanes,
    lane1Baseline: baseline,
    totalExpectedLaneCapture: baseline + laneAdd,
    areaBreakdown: lanesCounty?.county.areas ?? [],
    registrationAllocation,
    registrationAllocatedTotal: countyAllocatedRegistrationTotal(
      countyCityRegistrationAllocation(county, data.cities),
    ),
    housePartyRollup,
    fundraising: getFosCountyRollup(county.slug),
    coalitionFrameworks: buildCoalitionFrameworks(county.primaryMission, cluster?.id ?? null),
    persuasionFocus: persuasionFocusFromCounty(county, data.cities, cluster?.id ?? null),
    citations: BASE_CITATIONS,
    relatedLinks,
  };
}

export function buildCityPathToVictory(citySlug: string): PathToVictoryCityView | null {
  const data = loadElectionPlanSnapshot();
  const city = data.cities.find((c) => c.slug === citySlug);
  if (!city) return null;

  const county = getCountyByName(data, city.county);
  if (!county) return null;

  const victoryTarget = getCityVictoryTarget({
    name: city.name,
    slug: city.slug,
    county: city.county,
    baselineVote: city.baselineVote,
    targetVotes: city.targetVotes,
    voteGain: city.voteGain,
    isTop10: city.isTop10,
  });

  const lanesCounty = findLanesCounty(data, county.slug);
  const area = lanesCounty?.county.areas.find((a) => a.citySlug === city.slug) ?? null;
  const rates = data.lanesOverview.achievementRates;
  const share = area?.shareOfCounty ?? (city.targetVotes > 0 ? city.targetVotes / Math.max(1, county.vci) : 0);

  const cityAsCounty: ElectionPlanCounty = {
    ...county,
    lane2Recovery50: Math.round(county.lane2Recovery50 * share),
    registrationGoal: Math.round(county.registrationGoal * share),
    gopConversionPotential: Math.round(county.gopConversionPotential * share),
  };

  const numeric = getCityNumericTargets(city.slug);
  const baseline = city.baselineVote;
  const lanes = buildLaneRows(cityAsCounty, rates, baseline);

  if (area) {
    lanes[1].expectedCapture = area.lane2;
    lanes[2].expectedCapture = area.lane3;
    lanes[3].expectedCapture = area.lane4;
    lanes[1].rawPotential = area.lane2 > 0 && rates.lane2 > 0 ? Math.round(area.lane2 / rates.lane2) : cityAsCounty.lane2Recovery50;
    lanes[2].rawPotential =
      area.lane3 > 0 && rates.lane3 > 0 ? Math.round(area.lane3 / rates.lane3) : cityAsCounty.registrationGoal;
    lanes[3].rawPotential =
      area.lane4 > 0 && rates.lane4 > 0 ? Math.round(area.lane4 / rates.lane4) : cityAsCounty.gopConversionPotential;
  }

  const housePartyRollup: HousePartyRollup | null = numeric
    ? {
        hosts: numeric.houseParties.hosts,
        activeHosts: numeric.houseParties.activeHosts,
        powerOf5Circles: numeric.houseParties.powerOf5Circles,
        conversationsTarget: numeric.houseParties.conversationsTarget,
        vipTables: numeric.houseParties.vipTables ?? 0,
        cities: [
          {
            citySlug: city.slug,
            cityName: city.name,
            hosts: numeric.houseParties.hosts,
            activeHosts: numeric.houseParties.activeHosts,
            powerOf5Circles: numeric.houseParties.powerOf5Circles,
            conversationsTarget: numeric.houseParties.conversationsTarget,
            vipTables: numeric.houseParties.vipTables,
          },
        ],
      }
    : null;

  const persuasionFocus = [
    city.influenceCategory,
    ...city.influenceTags,
    city.strategicRole,
    county.primaryMission.includes("Persuasion") ? "City-weighted persuasion — validator conversations" : "",
    county.primaryMission.includes("Recovery") ? "Recover city-weighted Democratic drop-off" : "",
  ].filter(Boolean);

  const relatedLinks = [
    { href: cityLocationBriefHref(city.slug), label: `${city.name} location brief` },
    { href: countyPathToVictoryHref(county.slug), label: `${county.county} County path to victory` },
    { href: countyPlaybookHref(county.county, county.slug), label: `${county.county} County intelligence` },
    { href: `/election-plan/workbenches/${city.slug}`, label: `${city.name} community workbench` },
  ];

  return {
    kind: "city",
    name: city.name,
    slug: city.slug,
    county: city.county,
    countySlug: county.slug,
    rank: city.rank,
    influenceCategory: city.influenceCategory,
    influenceTags: city.influenceTags,
    strategicRole: city.strategicRole,
    visitFrequency: city.visitFrequency,
    victoryTarget,
    countyContext: {
      tier: county.tier,
      primaryMission: county.primaryMission,
      secondaryMission: county.secondaryMission,
      registrationGoal: county.registrationGoal,
      lane2Recovery50: county.lane2Recovery50,
      gopConversionPotential: county.gopConversionPotential,
      vci: county.vci,
      vciRank: county.vciRank,
    },
    lanes,
    areaBreakdown: area,
    numericTargets: numeric,
    housePartyRollup,
    persuasionFocus: [...new Set(persuasionFocus)].slice(0, 10),
    citations: BASE_CITATIONS,
    relatedLinks,
  };
}

export function pathToVictoryPo5Summary(target: CountyVictoryTarget | CityVictoryTarget): string {
  const metrics = computeVictoryMetrics(target.planningBaseline, target.targetVote, target.weeksRemaining);
  return `${metrics.powerOf5LeadersNeeded} Po5 leaders × ${PO5_VOTERS_PER_LEADER} voters × ${PO5_CONVERSATIONS_PER_LEADER} conversations = ~${metrics.powerOf5LeadersNeeded * PO5_VOTERS_PER_LEADER * PO5_CONVERSATIONS_PER_LEADER} relational touches toward +${target.growthNeeded.toLocaleString()} votes`;
}

export { VCI_EXPLAINER };
