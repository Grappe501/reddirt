import responsibilitySource from "../../../data/campaign-brain/ownership/campaign-responsibility-matrix.source.json";
import countyOverridesSource from "../../../data/campaign-brain/ownership/county-leadership-overrides.source.json";
import weeklyPacketSource from "../../../data/campaign-brain/ownership/weekly-leadership-packet.source.json";
import arkansasCounties from "../../../data/calendar-command-center/arkansas-counties-75.json";
import searcyTrustSource from "../../../data/campaign-brain/movement-infrastructure/searcy-county-trust-pilot.source.json";
import directDemocracyLeadershipSource from "../../../data/campaign-brain/movement-infrastructure/direct-democracy-leadership.source.json";
import po5CommandSource from "../../../data/campaign-brain/relational-organizing/power-of-5-command-center.source.json";
import po5Executive from "../../../data/campaign-brain/relational-organizing/power-of-5-executive-chapter.json";

export type CampaignInitiative = {
  id: string;
  initiative: string;
  owner: string | null;
  backup: string | null;
  goal: string;
  weeklyDeliverable: string;
  status: string;
  href: string;
  unassigned: boolean;
};

export type CountyLeadershipRole = {
  county: string;
  chairIdentified: boolean;
  chairName?: string | null;
  volunteerCaptain: string | null;
  mobilizeLead: string | null;
  mediaLead: string | null;
  faithLead: string | null;
  laborLead: string | null;
  rolesFilled: number;
  rolesTotal: number;
  coveragePct: number;
  coverageLevel: "complete" | "partial" | "minimal" | "none";
  notes?: string;
};

export type WeeklyLeadershipPacket = {
  generatedFor: string;
  weekOf: string;
  doctrine: string;
  sections: Array<{
    id: string;
    label: string;
    owner: string;
    priorities: string[];
    unassignedOwner: boolean;
  }>;
};

const ROLE_KEYS = [
  "chairIdentified",
  "volunteerCaptain",
  "mobilizeLead",
  "mediaLead",
  "faithLead",
  "laborLead",
] as const;

function getMondayOfWeek(d: Date): Date {
  const date = new Date(d);
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

function roleFilled(value: unknown): boolean {
  if (typeof value === "boolean") return value;
  if (value === null || value === undefined) return false;
  if (typeof value === "string") return value.trim().length > 0;
  return false;
}

export function getCampaignResponsibilityMatrix() {
  const initiatives = (responsibilitySource as { initiatives: CampaignInitiative[] }).initiatives.map((i) => ({
    ...i,
    unassigned: !i.owner || i.owner === "TBD",
  }));
  return {
    doctrine: (responsibilitySource as { doctrine: string }).doctrine,
    initiatives,
    unassignedCount: initiatives.filter((i) => i.unassigned).length,
    assignedCount: initiatives.filter((i) => !i.unassigned).length,
    total: initiatives.length,
  };
}

export function getCountyLeadershipCoverage() {
  const overrides = (countyOverridesSource as {
    counties: Record<
      string,
      Partial<{
        chairIdentified: boolean;
        chairName: string | null;
        volunteerCaptain: string | null;
        mobilizeLead: string | null;
        mediaLead: string | null;
        faithLead: string | null;
        laborLead: string | null;
        notes: string;
      }>
    >;
  }).counties;

  const counties: CountyLeadershipRole[] = (arkansasCounties as { counties: string[] }).counties.map((county) => {
    const o = overrides[county] ?? {};
    const roles = {
      chairIdentified: o.chairIdentified === true || Boolean(o.chairName),
      volunteerCaptain: o.volunteerCaptain ?? null,
      mobilizeLead: o.mobilizeLead ?? null,
      mediaLead: o.mediaLead ?? null,
      faithLead: o.faithLead ?? null,
      laborLead: o.laborLead ?? null,
    };
    const filled = [
      roles.chairIdentified,
      roleFilled(roles.volunteerCaptain),
      roleFilled(roles.mobilizeLead),
      roleFilled(roles.mediaLead),
      roleFilled(roles.faithLead),
      roleFilled(roles.laborLead),
    ].filter(Boolean).length;
    const rolesTotal = ROLE_KEYS.length;
    const coveragePct = Math.round((filled / rolesTotal) * 100);
    let coverageLevel: CountyLeadershipRole["coverageLevel"] = "none";
    if (coveragePct >= 100) coverageLevel = "complete";
    else if (coveragePct >= 50) coverageLevel = "partial";
    else if (coveragePct >= 17) coverageLevel = "minimal";

    return {
      county,
      chairIdentified: roles.chairIdentified,
      chairName: o.chairName ?? null,
      volunteerCaptain: roles.volunteerCaptain,
      mobilizeLead: roles.mobilizeLead,
      mediaLead: roles.mediaLead,
      faithLead: roles.faithLead,
      laborLead: roles.laborLead,
      rolesFilled: filled,
      rolesTotal,
      coveragePct,
      coverageLevel,
      notes: o.notes,
    };
  });

  return {
    counties,
    summary: {
      total: counties.length,
      chairsIdentified: counties.filter((c) => c.chairIdentified).length,
      fullyCovered: counties.filter((c) => c.coverageLevel === "complete").length,
      partial: counties.filter((c) => c.coverageLevel === "partial").length,
      minimal: counties.filter((c) => c.coverageLevel === "minimal").length,
      none: counties.filter((c) => c.coverageLevel === "none").length,
    },
  };
}

export function getWeeklyLeadershipPacket(referenceDate = new Date()): WeeklyLeadershipPacket {
  const src = weeklyPacketSource as {
    doctrine: string;
    sections: Record<string, { label: string; owner: string; priorities: string[] }>;
  };
  const monday = getMondayOfWeek(referenceDate);
  const weekOf = monday.toISOString().slice(0, 10);

  return {
    generatedFor: monday.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" }),
    weekOf,
    doctrine: src.doctrine,
    sections: Object.entries(src.sections).map(([id, section]) => ({
      id,
      label: section.label,
      owner: section.owner,
      priorities: section.priorities,
      unassignedOwner: section.owner.startsWith("TBD"),
    })),
  };
}

export function getPowerOf5CommandCenter() {
  const cmd = po5CommandSource as {
    title: string;
    subtitle: string;
    headlineMetrics: Array<{ id: string; label: string; current: number; goal: number }>;
    foundingLeaders: { current: number; goal: number; deadline: string };
    countyHosts: { current: number; goal: number };
    hciLink: { current: number; goal: number; label: string };
  };
  const exec = po5Executive as {
    foundingLeaders?: number;
    foundingLeadersGoal?: number;
    countyHostsGoal?: number;
    hciCurrent?: number;
    hciGoal?: number;
    powerOf5Commitments?: number;
    conversations?: number;
  };

  const metrics = cmd.headlineMetrics.map((m) => {
    if (m.id === "po5-commitments") return { ...m, current: exec.powerOf5Commitments ?? m.current };
    if (m.id === "active-leaders") return { ...m, current: exec.foundingLeaders ?? m.current };
    if (m.id === "contacts-generated") return { ...m, current: exec.hciCurrent ?? m.current, goal: exec.hciGoal ?? m.goal };
    return m;
  });

  return {
    ...cmd,
    headlineMetrics: metrics,
    foundingLeaders: {
      ...cmd.foundingLeaders,
      current: exec.foundingLeaders ?? cmd.foundingLeaders.current,
      goal: exec.foundingLeadersGoal ?? cmd.foundingLeaders.goal,
    },
    countyHosts: {
      ...cmd.countyHosts,
      current: 0,
      goal: exec.countyHostsGoal ?? cmd.countyHosts.goal,
    },
    hciLink: {
      ...cmd.hciLink,
      current: exec.hciCurrent ?? cmd.hciLink.current,
      goal: exec.hciGoal ?? cmd.hciLink.goal,
    },
    conversations: exec.conversations ?? 0,
  };
}

export function getDirectDemocracyLeadership() {
  return directDemocracyLeadershipSource;
}

export function getSearcyCountyTrustPilot() {
  return searcyTrustSource;
}

export function leadershipHubHref(): string {
  return "/election-plan/leadership";
}

export function responsibilityMatrixHref(): string {
  return "/election-plan/leadership/responsibility-matrix";
}

export function weeklyPacketHref(): string {
  return "/election-plan/leadership/weekly-packet";
}

export function countyCoverageHref(): string {
  return "/election-plan/leadership/county-coverage";
}

export function powerOf5CommandCenterHref(): string {
  return "/election-plan/power-of-5/command-center";
}

export function directDemocracyLeadershipHref(): string {
  return "/election-plan/direct-democracy/leadership";
}

export function searcyTrustPilotHref(): string {
  return "/election-plan/movement-infrastructure/searcy-trust-pilot";
}
