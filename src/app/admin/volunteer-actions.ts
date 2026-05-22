"use server";

import { buildVolunteerProfile } from "@/lib/campaign-events/volunteers/volunteer-profile-builder";
import { appendVolunteerObservation, upsertVolunteerProfile } from "@/lib/campaign-events/volunteers/volunteer-storage";
import type { VolunteerProfileInput } from "@/lib/campaign-events/volunteers/volunteer-profile-builder";
import { appendGlobalUserObservation } from "@/lib/agents/user-intelligence/user-observations";

export async function createVolunteerProfileAction(input: VolunteerProfileInput) {
  const profile = buildVolunteerProfile(input);
  upsertVolunteerProfile(profile);
  appendVolunteerObservation({
    event: "volunteer_created",
    volunteerId: profile.id,
    actor: "operator",
    meta: { source: profile.source, county: profile.county ?? null },
  });
  appendGlobalUserObservation({
    event: "volunteer_created",
    actor: "operator",
    role: "volunteer_coordinator",
    pathname: "/admin/volunteers",
    meta: { volunteerId: profile.id },
  });
  return { ok: true as const, profileId: profile.id };
}
