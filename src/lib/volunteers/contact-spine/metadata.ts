/**
 * Phase 1 contact spine — unified RelationalContact links across intake, field log, and roster.
 */

export const CONTACT_SPINE_PACKET = "CONTACT-SPINE-1" as const;

export type ContactSpineMetadata = {
  contactSpine?: typeof CONTACT_SPINE_PACKET;
  leaderSlug?: string;
  leaderInitials?: string;
  workflowIntakeId?: string;
  fieldEntryId?: string;
  volunteerUserId?: string;
  placementLeaderSlug?: string;
  placementLeaderInitials?: string;
  placedAt?: string;
  proxyOwner?: boolean;
};

export type VolunteerIntakePlacementMetadata = {
  placementLeaderSlug?: string;
  placementLeaderInitials?: string;
  placedAt?: string;
  relationalContactId?: string;
  rosterPersonId?: string;
};

export function mergeContactSpineMetadata(
  existing: unknown,
  patch: ContactSpineMetadata,
): ContactSpineMetadata {
  const base =
    typeof existing === "object" && existing !== null && !Array.isArray(existing)
      ? (existing as Record<string, unknown>)
      : {};
  return { ...base, ...patch, contactSpine: CONTACT_SPINE_PACKET };
}

export function readIntakePlacementMetadata(metadata: unknown): VolunteerIntakePlacementMetadata {
  if (typeof metadata !== "object" || metadata === null || Array.isArray(metadata)) return {};
  const m = metadata as Record<string, unknown>;
  return {
    placementLeaderSlug:
      typeof m.placementLeaderSlug === "string" ? m.placementLeaderSlug : undefined,
    placementLeaderInitials:
      typeof m.placementLeaderInitials === "string" ? m.placementLeaderInitials : undefined,
    placedAt: typeof m.placedAt === "string" ? m.placedAt : undefined,
    relationalContactId:
      typeof m.relationalContactId === "string" ? m.relationalContactId : undefined,
    rosterPersonId: typeof m.rosterPersonId === "string" ? m.rosterPersonId : undefined,
  };
}

/** Categories where a named label should create or link a CRM contact. */
export const FIELD_ENTRY_CRM_CATEGORIES = new Set([
  "conversation",
  "volunteer",
  "leader",
  "follower",
  "email_contact",
  "house_party",
]);
