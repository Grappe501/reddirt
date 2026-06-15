import type {
  ElectionPlanCity,
  ElectionPlanCounty,
  ElectionPlanWorkbenchSnapshot,
} from "@/lib/election-plan/types";

export type LanesAreaKpi = {
  slug: string;
  name: string;
  kind: "city" | "rural";
  expectedContribution: number;
  lane2: number;
  lane3: number;
  lane4: number;
  shareOfCounty: number;
  citySlug?: string;
};

export type LanesCountyKpi = {
  county: string;
  slug: string;
  tier: string;
  vci: number;
  vciRank: number;
  expectedContribution: number;
  lane2: number;
  lane3: number;
  lane4: number;
  areas: LanesAreaKpi[];
};

export type LanesClusterKpi = {
  id: string;
  name: string;
  description: string;
  vci: number;
  shareOfExpected: number;
  expectedContribution: number;
  lane2: number;
  lane3: number;
  lane4: number;
  counties: LanesCountyKpi[];
};

export type LanesDrillDown = {
  expectedProjection: number;
  achievementRates: { lane2: number; lane3: number; lane4: number };
  clusters: LanesClusterKpi[];
};

type LaneTriple = { lane2: number; lane3: number; lane4: number; expectedContribution: number };

function countyLaneKpis(
  county: ElectionPlanCounty,
  rates: { lane2: number; lane3: number; lane4: number },
): LaneTriple {
  const lane2 = Math.round(county.lane2Recovery50 * rates.lane2);
  const lane3 = Math.round(county.registrationGoal * rates.lane3);
  const lane4 = Math.round(county.gopConversionPotential * rates.lane4);
  return { lane2, lane3, lane4, expectedContribution: lane2 + lane3 + lane4 };
}

function allocateCountyAreas(
  county: ElectionPlanCounty,
  cities: ElectionPlanCity[],
  rates: { lane2: number; lane3: number; lane4: number },
): LanesAreaKpi[] {
  const totals = countyLaneKpis(county, rates);
  const countyCities = cities.filter((c) => c.county === county.county);

  if (countyCities.length === 0) {
    return [
      {
        slug: `${county.slug}-countywide`,
        name: `${county.county} — towns & rural areas`,
        kind: "rural",
        ...totals,
        shareOfCounty: 1,
      },
    ];
  }

  const totalWeight = countyCities.reduce((s, c) => s + c.targetVotes, 0);
  let usedLane2 = 0;
  let usedLane3 = 0;
  let usedLane4 = 0;

  const areas: LanesAreaKpi[] = countyCities.map((city) => {
    const w = totalWeight > 0 ? city.targetVotes / totalWeight : 1 / countyCities.length;
    const lane2 = Math.round(county.lane2Recovery50 * rates.lane2 * w);
    const lane3 = Math.round(county.registrationGoal * rates.lane3 * w);
    const lane4 = Math.round(county.gopConversionPotential * rates.lane4 * w);
    usedLane2 += lane2;
    usedLane3 += lane3;
    usedLane4 += lane4;
    return {
      slug: city.slug,
      name: city.name,
      kind: "city" as const,
      lane2,
      lane3,
      lane4,
      expectedContribution: lane2 + lane3 + lane4,
      shareOfCounty: w,
      citySlug: city.slug,
    };
  });

  const ruralLane2 = totals.lane2 - usedLane2;
  const ruralLane3 = totals.lane3 - usedLane3;
  const ruralLane4 = totals.lane4 - usedLane4;
  const ruralTotal = ruralLane2 + ruralLane3 + ruralLane4;

  if (ruralTotal > 0 || countyCities.length > 0) {
    areas.push({
      slug: `${county.slug}-outlying`,
      name: `${county.county} — outlying & rural areas`,
      kind: "rural",
      lane2: ruralLane2,
      lane3: ruralLane3,
      lane4: ruralLane4,
      expectedContribution: ruralTotal,
      shareOfCounty: totals.expectedContribution > 0 ? ruralTotal / totals.expectedContribution : 0,
    });
  }

  return areas;
}

const CLUSTER_DESCRIPTIONS: Record<string, string> = {
  "central-metro": "Statewide hub — media, fundraising, volunteer production, Lane 2 recovery at scale.",
  nwa: "NWA growth corridor — university pipeline, chamber networks, moderate Republican conversion.",
  "river-valley": "Western persuasion corridor — regional media, clerk relationships, moderate GOP outreach.",
  "northeast-ridge": "Crowley's Ridge and northeast media — persuasion, regional chambers, volunteer hubs.",
  "north-central-ozarks": "Ozarks and Boston Mountains — event-driven presence, retiree persuasion, fair circuit.",
  "hot-springs-ouachita": "Tourism, retiree persuasion, lake communities — relationship-based Lane 4.",
  "delta-southeast": "Delta Democratic recovery — Lane 2 reactivation, base turnout, faith and community organizing.",
  southwest: "Timber and oil belt — chamber relationships, county seats, registration at schools.",
  "crittenden-memphis": "East Arkansas turnout growth — Democratic recovery, Delta base mobilization.",
};

export function buildLanesDrillDown(data: ElectionPlanWorkbenchSnapshot): LanesDrillDown {
  const rates = data.lanesOverview.achievementRates;
  const countyByName = new Map(data.counties.map((c) => [c.county, c]));

  const clusters: LanesClusterKpi[] = data.execution.clusters.map((cluster) => {
    const counties: LanesCountyKpi[] = cluster.counties
      .map((name) => countyByName.get(name))
      .filter((c): c is ElectionPlanCounty => Boolean(c))
      .map((county) => {
        const kpis = countyLaneKpis(county, rates);
        return {
          county: county.county,
          slug: county.slug,
          tier: county.tier,
          vci: county.vci,
          vciRank: county.vciRank,
          areas: allocateCountyAreas(county, data.cities, rates),
          ...kpis,
        };
      })
      .sort((a, b) => b.expectedContribution - a.expectedContribution);

    const lane2 = counties.reduce((s, c) => s + c.lane2, 0);
    const lane3 = counties.reduce((s, c) => s + c.lane3, 0);
    const lane4 = counties.reduce((s, c) => s + c.lane4, 0);

    return {
      id: cluster.id,
      name: cluster.name,
      description: CLUSTER_DESCRIPTIONS[cluster.id] ?? "",
      vci: cluster.vci,
      shareOfExpected: cluster.shareOfExpected,
      expectedContribution: lane2 + lane3 + lane4,
      lane2,
      lane3,
      lane4,
      counties,
    };
  });

  return {
    expectedProjection: data.lanesOverview.expectedProjection,
    achievementRates: rates,
    clusters,
  };
}

export function getLanesCluster(
  data: ElectionPlanWorkbenchSnapshot,
  clusterId: string,
): LanesClusterKpi | undefined {
  return buildLanesDrillDown(data).clusters.find((c) => c.id === clusterId);
}

export function getLanesCountyInCluster(
  data: ElectionPlanWorkbenchSnapshot,
  clusterId: string,
  countySlug: string,
): { cluster: LanesClusterKpi; county: LanesCountyKpi } | undefined {
  const cluster = getLanesCluster(data, clusterId);
  if (!cluster) return undefined;
  const county = cluster.counties.find((c) => c.slug === countySlug);
  if (!county) return undefined;
  return { cluster, county };
}
