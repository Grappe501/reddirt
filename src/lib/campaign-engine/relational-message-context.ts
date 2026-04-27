/**
 * Maps REL-2 Prisma enums into message-engine relationship hints (admin-only callers).
 * No voter identifiers; safe to use only behind admin gates.
 */

import type { RelationalRelationshipCloseness, RelationalRelationshipType } from "@prisma/client";

import type { RelationshipType } from "@/lib/message-engine";

const RELATIONSHIP_LABELS: Record<RelationalRelationshipType, string> = {
  FAMILY: "Family",
  FRIEND: "Friend",
  NEIGHBOR: "Neighbor",
  COWORKER: "Coworker",
  CHURCH_COMMUNITY: "Faith community",
  SCHOOL_COMMUNITY: "School community",
  COMMUNITY_GROUP: "Community group",
  ONLINE: "Online connection",
  OTHER: "Other",
  UNKNOWN: "Relationship not specified",
};

const CLOSENESS_LABELS: Record<RelationalRelationshipCloseness, string> = {
  VERY_CLOSE: "Very close",
  CLOSE: "Close",
  FAMILIAR: "Familiar",
  WEAK_TIE: "Light tie",
  UNKNOWN: "Closeness not specified",
};

/** Staff-facing label for REL-2 relationship type (not microtargeting language). */
export function formatRelationalRelationshipTypeForStaff(t: RelationalRelationshipType): string {
  return RELATIONSHIP_LABELS[t] ?? "Relationship not specified";
}

export function formatRelationalClosenessForStaff(c: RelationalRelationshipCloseness | null | undefined): string | null {
  if (c == null) return null;
  return CLOSENESS_LABELS[c] ?? null;
}

/**
 * Map Prisma enum values to message registry `RelationshipType` when there is a direct match.
 * Unknown / online / school / community group are left unset so filters stay inclusive.
 */
/** Title-style county label from voter-file slug (e.g. `st-francis` → `St Francis`) — for script place-holders only. */
export function formatCountySlugForConversationContext(slug: string): string {
  const s = String(slug ?? "").trim();
  if (!s) return "Arkansas";
  return s
    .split("-")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

export function mapRelationalRelationshipForMessageEngine(
  t: RelationalRelationshipType,
): RelationshipType | undefined {
  switch (t) {
    case "FAMILY":
      return "family";
    case "FRIEND":
      return "friend";
    case "NEIGHBOR":
      return "neighbor";
    case "COWORKER":
      return "coworker";
    case "CHURCH_COMMUNITY":
      return "church_community";
    default:
      return undefined;
  }
}
