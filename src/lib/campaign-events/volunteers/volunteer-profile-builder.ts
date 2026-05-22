import type { VolunteerConsentStatus, VolunteerProfile, VolunteerProgressLevel } from "./volunteer-types";

export type VolunteerProfileInput = Partial<
  Pick<
    VolunteerProfile,
    | "firstName"
    | "lastName"
    | "email"
    | "phone"
    | "city"
    | "county"
    | "zip"
    | "source"
    | "consentStatus"
    | "skills"
    | "interests"
    | "availability"
    | "preferredTasks"
    | "notes"
    | "tags"
  >
>;

export function buildVolunteerProfile(input: VolunteerProfileInput, existing?: VolunteerProfile): VolunteerProfile {
  const now = new Date().toISOString();
  const id = existing?.id ?? `vol_${Date.now().toString(36)}`;
  return {
    id,
    firstName: input.firstName?.trim() || existing?.firstName || "Volunteer",
    lastName: input.lastName?.trim() || existing?.lastName || "",
    email: (input.email ?? existing?.email ?? "").trim().toLowerCase(),
    phone: input.phone ?? existing?.phone,
    city: input.city ?? existing?.city,
    county: (input.county ?? existing?.county)?.toLowerCase(),
    zip: input.zip ?? existing?.zip,
    source: input.source ?? existing?.source ?? "manual_entry",
    consentStatus: (input.consentStatus ?? existing?.consentStatus ?? "unknown") as VolunteerConsentStatus,
    communicationPreferences: existing?.communicationPreferences ?? ["email"],
    skills: input.skills ?? existing?.skills ?? [],
    interests: input.interests ?? existing?.interests ?? [],
    availability: input.availability ?? existing?.availability ?? [],
    preferredTasks: input.preferredTasks ?? existing?.preferredTasks ?? [],
    trainingCompleted: existing?.trainingCompleted ?? [],
    trainingNeeded: existing?.trainingNeeded ?? ["campaign-basics"],
    assignedEvents: existing?.assignedEvents ?? [],
    assignedTasks: existing?.assignedTasks ?? [],
    reliabilityScore: existing?.reliabilityScore ?? 50,
    leadershipPotential: existing?.leadershipPotential ?? "low",
    progressLevel: existing?.progressLevel ?? ("helper_l1" as VolunteerProgressLevel),
    notes: input.notes ?? existing?.notes,
    tags: input.tags ?? existing?.tags ?? [],
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };
}

export function normalizeCountySlug(county?: string): string | undefined {
  if (!county?.trim()) return undefined;
  return county.trim().toLowerCase().replace(/\s+county$/i, "").replace(/\s+/g, "-");
}
