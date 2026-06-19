import { prisma } from "@/lib/db";
import { getCityNumericTargets } from "@/lib/election-plan/load-city-numeric-targets";
import {
  getFosCommunityAllocation,
  getFosCountyRollup,
  getFosClusterRollup,
} from "@/lib/election-plan/load-fundraising-operating-system";
import type { FosClusterRollup, FosCommunityAllocation, FosCountyRollup } from "@/lib/election-plan/fundraising-operating-system-shared";
import { loadElectionPlanSnapshot } from "@/lib/election-plan/electionPlanSnapshot";
import {
  resolveCityFundraisingLeadSync,
  resolveClusterFundraisingLead,
  resolveCountyFundraisingLead,
  type FundraisingLeadSlot,
} from "@/lib/election-plan/load-location-fundraising-leads";

export type FundraisingOpportunityLane = {
  key: string;
  label: string;
  goalLabel: string;
  ownerLabel: string;
  ownerStatus: "open" | "assigned" | "interim" | "recruiting";
};

export type LocationFundraisingView = {
  citySlug: string;
  cityName: string;
  countySlug: string;
  countyName: string;
  clusterId: string | null;
  clusterName: string | null;
  cityAllocation: FosCommunityAllocation;
  countyRollup: FosCountyRollup | null;
  clusterRollup: FosClusterRollup | null;
  leads: {
    city: FundraisingLeadSlot;
    county: FundraisingLeadSlot;
    cluster: FundraisingLeadSlot | null;
  };
  opportunityLanes: FundraisingOpportunityLane[];
  workbenchHref: string;
};

function ownerStatusFromLead(lead: FundraisingLeadSlot): FundraisingOpportunityLane["ownerStatus"] {
  return lead.status;
}

function ownerLabelFromLead(lead: FundraisingLeadSlot): string {
  return lead.displayName ?? "OPEN";
}

function buildOpportunityLanes(
  cityLead: FundraisingLeadSlot,
  countyLead: FundraisingLeadSlot,
  numeric: ReturnType<typeof getCityNumericTargets>,
  allocation: FosCommunityAllocation,
): FundraisingOpportunityLane[] {
  const lanes: FundraisingOpportunityLane[] = [
    {
      key: "base_goal",
      label: "City base goal (FOS)",
      goalLabel: `$${allocation.baseGoal.toLocaleString()}`,
      ownerLabel: ownerLabelFromLead(cityLead),
      ownerStatus: ownerStatusFromLead(cityLead),
    },
    {
      key: "stretch_goal",
      label: "City stretch goal",
      goalLabel: `$${allocation.stretchGoal.toLocaleString()}`,
      ownerLabel: ownerLabelFromLead(cityLead),
      ownerStatus: ownerStatusFromLead(cityLead),
    },
  ];

  if (numeric) {
    lanes.push({
      key: "house_parties",
      label: "House parties",
      goalLabel: `${numeric.houseParties.hosts} hosts · ${numeric.houseParties.activeHosts} active · ${numeric.houseParties.powerOf5Circles} Power of 5 circles`,
      ownerLabel: ownerLabelFromLead(cityLead),
      ownerStatus: ownerStatusFromLead(cityLead),
    });
    if (numeric.houseParties.vipTables != null) {
      lanes.push({
        key: "vip_tables",
        label: "VIP tables",
        goalLabel: `${numeric.houseParties.vipTables} tables`,
        ownerLabel: ownerLabelFromLead(cityLead),
        ownerStatus: ownerStatusFromLead(cityLead),
      });
    }
    lanes.push({
      key: "grassroots_donors",
      label: "Grassroots / small donor",
      goalLabel: `${numeric.houseParties.conversationsTarget.toLocaleString()} trusted conversations target`,
      ownerLabel: ownerLabelFromLead(cityLead),
      ownerStatus: ownerStatusFromLead(cityLead),
    });
  }

  lanes.push(
    {
      key: "business_meetings",
      label: "Business meetings",
      goalLabel: "County pipeline — goal set with county lead",
      ownerLabel: ownerLabelFromLead(countyLead),
      ownerStatus: ownerStatusFromLead(countyLead),
    },
    {
      key: "major_donor",
      label: "Major donor meetings",
      goalLabel: "County pipeline — escalates to state fundraising director",
      ownerLabel: ownerLabelFromLead(countyLead),
      ownerStatus: ownerStatusFromLead(countyLead),
    },
    {
      key: "community_events",
      label: "Fundraising events",
      goalLabel: "Event profit opportunities (record-backed)",
      ownerLabel: ownerLabelFromLead(cityLead),
      ownerStatus: ownerStatusFromLead(cityLead),
    },
  );

  return lanes;
}

async function loadCommunityLeadershipRows(citySlug: string) {
  try {
    const wb = await prisma.communityWorkbench.findUnique({
      where: { slug: citySlug },
      select: {
        leadership: {
          select: { roleKey: true, personName: true, contact: true },
        },
      },
    });
    return wb?.leadership ?? [];
  } catch {
    return [];
  }
}

export async function loadLocationFundraisingForCity(citySlug: string): Promise<LocationFundraisingView | null> {
  const data = loadElectionPlanSnapshot();
  const city = data.cities.find((c) => c.slug === citySlug);
  if (!city) return null;

  const allocation = getFosCommunityAllocation(citySlug);
  if (!allocation) return null;

  const countyRow = data.counties.find(
    (c) => c.county.toLowerCase() === city.county.toLowerCase(),
  );
  const countySlug = countyRow?.slug ?? allocation.countySlug;
  const countyRollup = getFosCountyRollup(countySlug);
  const clusterId = countyRollup?.clusterId ?? null;
  const clusterRollup = clusterId ? getFosClusterRollup(clusterId) : null;

  const communityLeadership = await loadCommunityLeadershipRows(citySlug);
  const cityLead = resolveCityFundraisingLeadSync(citySlug, communityLeadership);
  const countyLead = resolveCountyFundraisingLead(countySlug);
  const clusterLead = clusterId ? resolveClusterFundraisingLead(clusterId) : null;

  const numeric = getCityNumericTargets(citySlug);

  return {
    citySlug,
    cityName: city.name,
    countySlug,
    countyName: city.county,
    clusterId,
    clusterName: clusterRollup?.name ?? countyRollup?.clusterName ?? null,
    cityAllocation: allocation,
    countyRollup,
    clusterRollup,
    leads: {
      city: cityLead,
      county: countyLead,
      cluster: clusterLead,
    },
    opportunityLanes: buildOpportunityLanes(cityLead, countyLead, numeric, allocation),
    workbenchHref: `/election-plan/workbenches/${citySlug}#fundraising`,
  };
}
