import type { VolunteerOpsTeamMemberRole } from "@prisma/client";

const LANE_EVENT = "lane:event_representation";
const LANE_SOCIAL = "lane:social_media";
const LANE_P5 = "lane:power_of_five";

export function volunteerInterestsToOpsRole(interests: string[]): VolunteerOpsTeamMemberRole {
  const set = new Set(interests);
  if (set.has("pref_role:events") || set.has(LANE_EVENT)) return "EVENTS";
  if (set.has("pref_role:social_media") || set.has(LANE_SOCIAL)) return "SOCIAL_MEDIA";
  if (set.has("pref_role:power_of_five") || set.has(LANE_P5)) return "POWER_OF_FIVE";

  const textBlob = interests.join(" ").toLowerCase();
  if (textBlob.includes("event") && (textBlob.includes("represent") || textBlob.includes("coord"))) {
    return "EVENTS";
  }
  if (textBlob.includes("social")) return "SOCIAL_MEDIA";
  if (textBlob.includes("power") || textBlob.includes("registr") || textBlob.includes("voter")) {
    return "POWER_OF_FIVE";
  }

  return "GENERAL";
}
