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

export function getImmersionMissionForCounty(countySlug: string): ImmersionCountyMission | undefined {
  const slug = countySlug.toLowerCase();
  const countyOnly = file.missions.find((m) => m.countySlug === slug && !m.citySlug);
  if (countyOnly) return countyOnly;
  return file.missions.find((m) => m.countySlug === slug);
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
