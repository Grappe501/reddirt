import { loadCoalitionLaneDashboard, type CoalitionWorkbenchRow } from "@/lib/coalition/load-coalition-lane-dashboard";
import { communityWorkbenchHref } from "@/lib/election-plan/community-workbench/links";
import { listCommunityWorkbenchHubSummaries } from "@/lib/election-plan/community-workbench/hub-summary";
import { getCoalitionWorkbenchRegistry } from "@/lib/election-plan/community-workbench/load-coalition-workbench-profile";
import { loadElectionPlanSnapshot } from "@/lib/election-plan/electionPlanSnapshot";
import { cityLocationBriefHref, electionPlanSlugForCountyName } from "@/lib/election-plan/location-links";
import { isDatabaseConfigured } from "@/lib/env";
import { leaderWorkbenchHref } from "@/lib/volunteers/build-leader-workbench-v2";
import { getVolunteerLeaderRoster } from "@/lib/volunteers/leader-roster";
import type { VolunteerLeader } from "@/lib/volunteers/types";

export type CoverageLevel = "covered" | "partial" | "minimal" | "none";

export type CityCoverageRow = {
  rank: number;
  slug: string;
  name: string;
  county: string;
  countySlug: string;
  targetVotes: number;
  isTop10: boolean;
  cityChairName: string | null;
  cityChairLeaderSlug: string | null;
  workbenchLead: string | null;
  hasWorkbenchOwner: boolean;
  readinessPct: number;
  coverageLevel: CoverageLevel;
  cityBriefHref: string;
  workbenchHref: string;
};

export type CoalitionCoverageRow = CoalitionWorkbenchRow & {
  rosterLeadName: string | null;
  rosterLeadSlug: string | null;
};

export type CampusChapterRow = {
  id: string;
  campusSlug: string;
  campusLabel: string;
  regionLabel: string;
  coChairName: string;
  coChairLeaderSlug: string | null;
  isOpen: boolean;
  county: string | null;
  campusPageHref: string;
  workbenchHref: string | null;
  leaderWorkbenchHref: string | null;
};

export type LaneCoverageDashboardPayload = {
  dbAvailable: boolean;
  city: {
    stats: {
      total: number;
      covered: number;
      partial: number;
      minimal: number;
      top10Covered: number;
      top10Total: number;
    };
    rows: CityCoverageRow[];
    gapRows: CityCoverageRow[];
  };
  coalition: {
    stats: {
      total: number;
      withOwner: number;
      missingOwners: number;
      rosterLeads: number;
      avgReadinessPct: number;
    };
    rows: CoalitionCoverageRow[];
    missingOwnerRows: CoalitionCoverageRow[];
  };
  campus: {
    stats: {
      total: number;
      filled: number;
      open: number;
    };
    rows: CampusChapterRow[];
    openRows: CampusChapterRow[];
  };
  weeklyRhythm: Array<{ id: string; label: string; description: string; href?: string }>;
};

function cityCoverageLevel(
  cityChairName: string | null,
  workbenchLead: string | null,
  hasWorkbenchOwner: boolean,
): CoverageLevel {
  if (cityChairName) return "covered";
  if (workbenchLead || hasWorkbenchOwner) return "partial";
  return "minimal";
}

function buildCityChairIndex(): Map<string, { name: string; slug: string }> {
  const map = new Map<string, { name: string; slug: string }>();
  for (const leader of getVolunteerLeaderRoster()) {
    const isCityLeader =
      leader.workbenchTemplates?.includes("city_leader") || leader.workbenchTier === "city";
    if (!isCityLeader) continue;
    for (const connection of leader.connections) {
      if (connection.kind === "city") {
        map.set(connection.citySlug, { name: leader.displayName, slug: leader.slug });
      }
    }
  }
  return map;
}

function coalitionLeadByWorkbenchSlug(): Map<string, { name: string; slug: string }> {
  const registrySlugs = new Set(getCoalitionWorkbenchRegistry().map((w) => w.slug));
  const map = new Map<string, { name: string; slug: string }>();

  for (const leader of getVolunteerLeaderRoster()) {
    const program = leader.connections.find((c) => c.kind === "program");
    if (!program || program.kind !== "program") continue;
    if (!registrySlugs.has(program.programSlug)) continue;
    if (
      leader.workbenchTemplates?.some((t) =>
        [
          "progressives_liaison",
          "muslim_community_lead",
          "educators_coalition_lead",
          "union_liaison",
          "democratic_black_caucus_lead",
          "hispanic_outreach_lead",
          "special_outreach_lead",
        ].includes(t),
      ) ||
      leader.interfaithCommsLiaison
    ) {
      map.set(program.programSlug, { name: leader.displayName, slug: leader.slug });
    }
  }

  return map;
}

function campusLabelFromSlug(slug: string): string {
  const labels: Record<string, string> = {
    "university-of-central-arkansas": "UCA",
    "philander-smith": "Philander Smith",
    ualr: "UALR",
    "university-of-arkansas": "UA Fayetteville",
    "arkansas-state-university": "Arkansas State",
  };
  return labels[slug] ?? slug.replace(/-/g, " ");
}

function regionLabelForCampus(leader: VolunteerLeader): string {
  const slug = leader.campusLeadCampusSlug ?? "";
  if (slug.includes("ualr") || slug === "ualr") return "Central · metro";
  if (slug.includes("arkansas-state")) return "Northeast · Jonesboro";
  if (slug.includes("arkansas") && !slug.includes("state")) return "Northwest · Fayetteville";
  if (slug.includes("philander")) return "Central · HBCU";
  if (slug.includes("central")) return "Central · Conway";
  return "Statewide";
}

function buildCampusRows(): CampusChapterRow[] {
  return getVolunteerLeaderRoster()
    .filter(
      (leader) =>
        leader.campusTeamCoChair ||
        leader.workbenchTemplates?.includes("campus_team_co_chair") ||
        leader.studentsForArkansasCoChairId,
    )
    .map((leader) => {
      const campusSlug = leader.campusLeadCampusSlug ?? "students-for-arkansas";
      const isOpen = Boolean(leader.leaderRosterSignInHidden || leader.displayName.startsWith("Open —"));
      const program = leader.connections.find(
        (c): c is Extract<typeof c, { kind: "program" }> =>
          c.kind === "program" && c.programSlug.includes("campus"),
      );
      const countyConn = leader.connections.find((c) => c.kind === "county");

      return {
        id: leader.slug,
        campusSlug,
        campusLabel: campusLabelFromSlug(campusSlug),
        regionLabel: regionLabelForCampus(leader),
        coChairName: leader.displayName,
        coChairLeaderSlug: isOpen ? null : leader.slug,
        isOpen,
        county: countyConn?.kind === "county" ? countyConn.county : null,
        campusPageHref: `/election-plan/campuses/${campusSlug}`,
        workbenchHref: program ? communityWorkbenchHref(program.programSlug) : null,
        leaderWorkbenchHref: isOpen ? null : leaderWorkbenchHref(leader.slug),
      };
    })
    .sort((a, b) => {
      if (a.isOpen !== b.isOpen) return a.isOpen ? 1 : -1;
      return a.campusLabel.localeCompare(b.campusLabel);
    });
}

export async function loadLaneCoverageDashboard(): Promise<LaneCoverageDashboardPayload> {
  const dbAvailable = isDatabaseConfigured();
  const snapshot = loadElectionPlanSnapshot();
  const top250 = snapshot.cities.filter((c) => !c.isBonusCity).sort((a, b) => a.rank - b.rank);
  const cityChairs = buildCityChairIndex();

  const [hubSummaries, coalitionPayload] = await Promise.all([
    listCommunityWorkbenchHubSummaries(),
    loadCoalitionLaneDashboard(),
  ]);

  const cityWorkbenchBySlug = new Map(
    hubSummaries.filter((w) => w.kind === "city").map((w) => [w.slug, w]),
  );

  const cityRows: CityCoverageRow[] = top250.map((city) => {
    const chair = cityChairs.get(city.slug);
    const wb = cityWorkbenchBySlug.get(city.slug);
    const cityChairName = chair?.name ?? null;
    const workbenchLead = wb?.communityLead ?? null;
    const hasWorkbenchOwner = Boolean(wb?.hasOwner);
    const coverageLevel = cityCoverageLevel(cityChairName, workbenchLead, hasWorkbenchOwner);

    return {
      rank: city.rank,
      slug: city.slug,
      name: city.name,
      county: city.county,
      countySlug: electionPlanSlugForCountyName(city.county),
      targetVotes: city.targetVotes,
      isTop10: city.isTop10,
      cityChairName,
      cityChairLeaderSlug: chair?.slug ?? null,
      workbenchLead,
      hasWorkbenchOwner,
      readinessPct: wb?.readinessPct ?? 0,
      coverageLevel,
      cityBriefHref: cityLocationBriefHref(city.slug),
      workbenchHref: communityWorkbenchHref(city.slug),
    };
  });

  const cityStats = {
    total: cityRows.length,
    covered: cityRows.filter((r) => r.coverageLevel === "covered").length,
    partial: cityRows.filter((r) => r.coverageLevel === "partial").length,
    minimal: cityRows.filter((r) => r.coverageLevel === "minimal").length,
    top10Covered: cityRows.filter((r) => r.isTop10 && r.coverageLevel === "covered").length,
    top10Total: cityRows.filter((r) => r.isTop10).length,
  };

  const rosterCoalitionLeads = coalitionLeadByWorkbenchSlug();
  const coalitionRows: CoalitionCoverageRow[] = coalitionPayload.workbenches.map((wb) => {
    const roster = rosterCoalitionLeads.get(wb.slug);
    return {
      ...wb,
      rosterLeadName: roster?.name ?? null,
      rosterLeadSlug: roster?.slug ?? null,
    };
  });

  const campusRows = buildCampusRows();

  return {
    dbAvailable,
    city: {
      stats: cityStats,
      rows: cityRows,
      gapRows: cityRows
        .filter((r) => r.coverageLevel !== "covered")
        .sort((a, b) => a.rank - b.rank)
        .slice(0, 40),
    },
    coalition: {
      stats: {
        total: coalitionRows.length,
        withOwner: coalitionRows.filter((r) => r.hasOwner).length,
        missingOwners: coalitionRows.filter((r) => !r.hasOwner).length,
        rosterLeads: coalitionRows.filter((r) => r.rosterLeadName).length,
        avgReadinessPct: coalitionPayload.stats.avgReadinessPct,
      },
      rows: coalitionRows,
      missingOwnerRows: coalitionRows.filter((r) => !r.hasOwner || !r.rosterLeadName),
    },
    campus: {
      stats: {
        total: campusRows.length,
        filled: campusRows.filter((r) => !r.isOpen).length,
        open: campusRows.filter((r) => r.isOpen).length,
      },
      rows: campusRows,
      openRows: campusRows.filter((r) => r.isOpen),
    },
    weeklyRhythm: [
      {
        id: "city-gaps",
        label: "Recruit top-10 city chairs",
        description: "Little Rock, Fayetteville, Springdale, and NWA gaps block statewide credibility.",
      },
      {
        id: "coalition-owners",
        label: "Name coalition workbench leads",
        description: "Women's leadership, veterans, rural Arkansas, and disability programs still open.",
        href: "/election-plan/operators/coalition-command",
      },
      {
        id: "campus-slots",
        label: "Fill SfA co-chair slots",
        description: "UALR, UA Fayetteville, and Arkansas State chapters need named co-chairs.",
        href: "/election-plan/executive-book/students-for-arkansas",
      },
      {
        id: "county-coverage",
        label: "County coverage cross-check",
        description: "Mirror this board against 75-county chair assignments.",
        href: "/election-plan/leadership/county-coverage",
      },
    ],
  };
}
