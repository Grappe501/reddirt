import onboardingSource from "../../../data/campaign-brain/volunteer-academy/volunteer-onboarding.source.json";
import { getVolunteerAcademy, getVolunteerPosition, type VolunteerPosition } from "./load-volunteer-academy";

export type TrainingModule = {
  id: string;
  title: string;
  durationMinutes: number;
  type: "video" | "document" | "checklist";
};

export type RoleOnboardingProfile = {
  weeklyExpectation: string;
  firstAction: string;
  firstWeekTasks: string[];
  trainingModules: TrainingModule[];
  expectationSheet: {
    time: string;
    monthly: string;
    reporting: string;
  };
};

export type AssignmentSlot = {
  id: string;
  roleSlug: string;
  label: string;
  county: string | null;
  region: string;
  volunteerName: string | null;
  status: "open" | "filled" | "pending";
  onboardingComplete: boolean;
};

export type VolunteerOnboardingModel = {
  mission: string;
  launchDate: string;
  launchEvent: {
    title: string;
    subtitle: string;
    format: string;
    durationMinutes: number;
    goal: string;
    agenda: Array<{ time: string; segment: string; owner: string; minutes: number; notes: string }>;
  };
  followUpPacket: {
    sendWithin: string;
    subject: string;
    includes: string[];
    weekOneChecklist: string[];
  };
  onboardingSteps: Array<{ id: string; label: string; route: string }>;
  roleProfiles: Record<string, RoleOnboardingProfile>;
  assignmentSlots: AssignmentSlot[];
  foundingLeaderGoal: number;
};

export type RoleOnboardingBundle = {
  position: VolunteerPosition;
  profile: RoleOnboardingProfile;
};

export function getVolunteerOnboarding(): VolunteerOnboardingModel {
  return onboardingSource as VolunteerOnboardingModel;
}

export function getRoleOnboardingBundle(slug: string): RoleOnboardingBundle | undefined {
  const position = getVolunteerPosition(slug);
  const profile = getVolunteerOnboarding().roleProfiles[slug];
  if (!position || !profile) return undefined;
  return { position, profile };
}

export function getOnboardingRollup() {
  const model = getVolunteerOnboarding();
  const slots = model.assignmentSlots;
  const filled = slots.filter((s) => s.status === "filled" || s.volunteerName);
  const onboardingComplete = slots.filter((s) => s.onboardingComplete);
  const byRole = getVolunteerAcademy().positions.map((p) => ({
    slug: p.slug,
    title: p.title,
    slotsOpen: slots.filter((s) => s.roleSlug === p.slug && !s.volunteerName).length,
    slotsFilled: slots.filter((s) => s.roleSlug === p.slug && s.volunteerName).length,
  }));

  return {
    foundingLeaderGoal: model.foundingLeaderGoal,
    totalSlots: slots.length,
    filled: filled.length,
    open: slots.length - filled.length,
    onboardingComplete: onboardingComplete.length,
    pendingOnboarding: filled.length - onboardingComplete.length,
    byRole,
  };
}

export function academyOnboardingHref(): string {
  return "/election-plan/academy/onboarding";
}

export function academyJune28Href(): string {
  return "/election-plan/academy/june-28-launch";
}

export function academyAssignmentsHref(): string {
  return "/election-plan/academy/assignments";
}

export function academyTrainingHref(): string {
  return "/election-plan/academy/training";
}

export function academyTrainingRoleHref(slug: string): string {
  return `/election-plan/academy/training/${slug}`;
}

export function academyHowItHelpsHref(slug: string): string {
  return `/election-plan/academy/${slug}/how-it-helps`;
}

export const ONBOARDING_LOCAL_STORAGE_KEY = "campaign-academy-onboarding-v1";
