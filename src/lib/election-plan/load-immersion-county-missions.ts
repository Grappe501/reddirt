import source from "../../../data/campaign-brain/election-plan/immersion-county-missions.source.json";

export type ImmersionMissionSubTarget = {
  label: string;
  goal: number;
};

export type ImmersionCountyMission = {
  id: string;
  community: string;
  county: string;
  countySlug: string;
  citySlug?: string;
  headline: string;
  tagline: string;
  successMetric: string;
  primaryGoal?: number;
  primaryGoalLabel?: string;
  thenSteps?: string[];
  activityTypes?: string[];
  notThis?: string[];
  subTargets?: ImmersionMissionSubTarget[];
  href?: string;
};

type SourceFile = {
  version: number;
  operatingPrinciple: string;
  doctrineHref: string;
  missions: ImmersionCountyMission[];
};

const file = source as SourceFile;

export function getImmersionOperatingPrinciple(): string {
  return file.operatingPrinciple;
}

export function getImmersionDoctrineHref(): string {
  return file.doctrineHref;
}

export function getAllImmersionCountyMissions(): ImmersionCountyMission[] {
  return file.missions;
}

export function getImmersionMissionById(id: string): ImmersionCountyMission | undefined {
  return file.missions.find((m) => m.id === id);
}

export const JACKSONVILLE_DD_MISSION_ID = "jacksonville-dd";

export function isJacksonvilleDirectDemocracyMission(
  mission: ImmersionCountyMission | undefined,
): mission is ImmersionCountyMission {
  return mission?.id === JACKSONVILLE_DD_MISSION_ID;
}

export type ImmersionMissionDisplaySurface =
  | "city"
  | "county"
  | "hub"
  | "dd-leadership"
  | "stop-brief";

/** Jacksonville DD hub card is Jacksonville-only — not a county or global template. */
export function shouldShowJacksonvilleDirectDemocracyMission(context: {
  surface: ImmersionMissionDisplaySurface;
  citySlug?: string;
}): boolean {
  if (context.surface === "dd-leadership") return true;
  if (context.surface === "city") return context.citySlug === "jacksonville";
  return false;
}

export function filterImmersionMissionForDisplay(
  mission: ImmersionCountyMission | undefined,
  context: { surface: ImmersionMissionDisplaySurface; citySlug?: string },
): ImmersionCountyMission | undefined {
  if (!mission) return undefined;
  if (isJacksonvilleDirectDemocracyMission(mission)) {
    return shouldShowJacksonvilleDirectDemocracyMission(context) ? mission : undefined;
  }
  return mission;
}

export function getImmersionMissionForCounty(countySlug: string): ImmersionCountyMission | undefined {
  const slug = countySlug.toLowerCase();
  return file.missions.find((m) => m.countySlug === slug && !m.citySlug);
}

/** City-specific missions (Quitman, Sherwood, Jacksonville) beat county-only missions. */
export function getImmersionMissionForLocation(opts: {
  countySlug?: string;
  citySlug?: string;
}): ImmersionCountyMission | undefined {
  const city = opts.citySlug?.toLowerCase();
  const county = opts.countySlug?.toLowerCase();

  if (city) {
    const byCity = file.missions.find((m) => m.citySlug === city);
    if (byCity) return byCity;
  }
  if (county) {
    return file.missions.find((m) => m.countySlug === county && !m.citySlug);
  }
  return undefined;
}
