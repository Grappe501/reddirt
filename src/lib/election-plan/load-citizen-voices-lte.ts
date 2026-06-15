import newspaperInventory from "../../../data/campaign-brain/citizen-voices/newspaper-inventory.source.json";
import lteRegistrySource from "../../../data/campaign-brain/citizen-voices/lte-outlet-registry.source.json";
import citizenVoicesNetwork from "../../../data/campaign-brain/citizen-voices/citizen-voices-network.json";

export type LteOutletTracking = {
  outletId: string;
  outletName: string;
  tier: number;
  primaryCounty: string;
  mediaMarket: string;
  lteCoordinator: string | null;
  writers: number;
  lettersSubmitted: number;
  lettersPublished: number;
  lastSubmissionWeek: string | null;
};

export type LteRegion = {
  id: string;
  label: string;
  lteCoordinator: string | null;
  weeklyGoal: number;
  outletsInRegion: number;
  lettersSubmitted: number;
  lettersPublished: number;
};

export type CitizenVoicesLteModel = {
  programName: string;
  doctrine: string;
  goal: string;
  workflowSteps: Array<{ step: number; label: string; owner: string }>;
  regions: LteRegion[];
  outlets: LteOutletTracking[];
  rollup: {
    outletsTracked: number;
    coordinatorsAssigned: number;
    totalWriters: number;
    lettersSubmitted: number;
    lettersPublished: number;
    countiesWithCoordinator: number;
    foundingWritersGoal: number;
    foundingWriters: number;
    laborDayDeadline: string;
  };
};

const REGION_COUNTY_MAP: Record<string, string[]> = {
  northwest: ["Benton", "Washington", "Carroll", "Madison"],
  northeast: ["Craighead", "Greene", "Mississippi", "Clay", "Randolph"],
  central: ["Pulaski", "Saline", "Lonoke", "Faulkner"],
  "river-valley": ["Pope", "Conway", "Johnson", "Franklin", "Logan"],
  southwest: ["Sebastian", "Miller", "Sevier", "Polk", "Little River"],
  southeast: ["Union", "Columbia", "Ashley", "Bradley", "Drew", "Calhoun", "Ouachita"],
  delta: ["Phillips", "St. Francis", "Jefferson", "Arkansas", "Desha", "Lee"],
  "north-central": ["Boone", "Newton", "Baxter", "Marion", "White", "Independence", "Jackson"],
};

export function getCitizenVoicesLteModel(): CitizenVoicesLteModel {
  const inventory = newspaperInventory as {
    outlets: Array<{
      id: string;
      name: string;
      tier: number;
      mediaMarket: string;
      counties: string[];
    }>;
  };
  const registry = lteRegistrySource as {
    programName: string;
    doctrine: string;
    goal: string;
    workflowSteps: CitizenVoicesLteModel["workflowSteps"];
    regions: Array<{ id: string; label: string; lteCoordinator: string | null; weeklyGoal: number }>;
    outletTracking: Array<{
      outletId: string;
      primaryCounty: string;
      lteCoordinator: string | null;
      writers: number;
      lettersSubmitted: number;
      lettersPublished: number;
      lastSubmissionWeek: string | null;
    }>;
  };
  const cv = citizenVoicesNetwork as {
    laborDayDeadline?: string;
    targets?: { foundingWriters?: number };
    metrics?: {
      foundingWriters?: number;
      lettersSubmitted?: number;
      lettersPublished?: number;
    };
  };

  const outletById = new Map(inventory.outlets.map((o) => [o.id, o]));

  const outlets: LteOutletTracking[] = registry.outletTracking.map((t) => {
    const outlet = outletById.get(t.outletId);
    return {
      outletId: t.outletId,
      outletName: outlet?.name ?? t.outletId,
      tier: outlet?.tier ?? 3,
      primaryCounty: t.primaryCounty,
      mediaMarket: outlet?.mediaMarket ?? "—",
      lteCoordinator: t.lteCoordinator,
      writers: t.writers,
      lettersSubmitted: t.lettersSubmitted,
      lettersPublished: t.lettersPublished,
      lastSubmissionWeek: t.lastSubmissionWeek,
    };
  });

  const regions: LteRegion[] = registry.regions.map((r) => {
    const counties = REGION_COUNTY_MAP[r.id] ?? [];
    const regionOutlets = outlets.filter((o) => counties.includes(o.primaryCounty));
    return {
      ...r,
      outletsInRegion: regionOutlets.length,
      lettersSubmitted: regionOutlets.reduce((s, o) => s + o.lettersSubmitted, 0),
      lettersPublished: regionOutlets.reduce((s, o) => s + o.lettersPublished, 0),
    };
  });

  return {
    programName: registry.programName,
    doctrine: registry.doctrine,
    goal: registry.goal,
    workflowSteps: registry.workflowSteps,
    regions,
    outlets,
    rollup: {
      outletsTracked: outlets.length,
      coordinatorsAssigned: outlets.filter((o) => o.lteCoordinator).length,
      totalWriters: outlets.reduce((s, o) => s + o.writers, 0),
      lettersSubmitted: outlets.reduce((s, o) => s + o.lettersSubmitted, 0),
      lettersPublished: outlets.reduce((s, o) => s + o.lettersPublished, 0),
      countiesWithCoordinator: new Set(
        outlets.filter((o) => o.lteCoordinator).map((o) => o.primaryCounty),
      ).size,
      foundingWritersGoal: cv.targets?.foundingWriters ?? 20,
      foundingWriters: cv.metrics?.foundingWriters ?? 0,
      laborDayDeadline: cv.laborDayDeadline ?? "2026-09-07",
    },
  };
}

export function citizenVoicesLteHref(): string {
  return "/election-plan/movement-infrastructure/lte-program";
}

export function freshmanWeekReadinessHref(): string {
  return "/election-plan/campuses/freshman-week";
}

export function campusCaptainDashboardHref(): string {
  return "/election-plan/campuses/captains";
}
