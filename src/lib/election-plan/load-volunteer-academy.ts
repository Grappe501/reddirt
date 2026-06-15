import academySource from "../../../data/campaign-brain/volunteer-academy/volunteer-positions.source.json";

export type VolunteerPosition = {
  slug: string;
  title: string;
  category: string;
  timeCommitment: string;
  purpose: string;
  responsibilities: string[];
  weeklyTasks: string[];
  successMetrics: string[];
  training: string[];
  resources: string[];
  scripts: string[];
  reporting: string;
  connectionToPlan: string;
  relatedOwnerSlot: string | null;
};

export function getVolunteerAcademy() {
  const src = academySource as {
    title: string;
    subtitle: string;
    doctrine: string;
    onboardingFlow: string[];
    launchDate: string;
    positions: VolunteerPosition[];
  };
  return src;
}

export function getVolunteerPosition(slug: string): VolunteerPosition | undefined {
  return getVolunteerAcademy().positions.find((p) => p.slug === slug);
}

export function volunteerAcademyHref(): string {
  return "/election-plan/academy";
}

export function volunteerPositionHref(slug: string): string {
  return `/election-plan/academy/${slug}`;
}
