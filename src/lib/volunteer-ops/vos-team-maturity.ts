import type { Team } from "@/types/dashboard";

/** Five-level Volunteer OS maturity — keeps advanced work off day-one dashboards. */
export type VosMaturityLevel = 1 | 2 | 3 | 4 | 5;

function hasCoreTriad(members: Team["members"]): boolean {
  const roles = new Set(members.map((m) => m.role));
  return roles.has("events") && roles.has("social-media") && roles.has("power-of-5");
}

/**
 * Infer maturity from team shape (deterministic; later: AI may recommend adjustments).
 * Level 1 Start → Level 5 Lead per Kelly VOS rubric.
 */
export function inferVosMaturityFromTeam(team: Team): VosMaturityLevel {
  const triad = hasCoreTriad(team.members);
  const downstream = team.downstreamTeamIds.length;
  const life = team.lifecycleStatus ?? "building";

  if (life === "dormant" || life === "archived") return triad ? 2 : 1;

  if (life === "building") {
    if (triad && team.members.length >= 3) return 2;
    return 1;
  }

  if (life === "active") {
    if (!triad) return 2;
    if (downstream >= 2) return 4;
    return 3;
  }

  if (life === "expanding") {
    if (downstream >= 3) return 5;
    return 4;
  }

  return triad ? 3 : 2;
}

export const VOS_MATURITY_LEVEL_TITLES: Record<VosMaturityLevel, string> = {
  1: "Start",
  2: "Build",
  3: "Operate",
  4: "Expand",
  5: "Lead",
};

/** Bullets shown in help disclosure — matches product spec. */
export const VOS_MATURITY_RUBRIC: Record<VosMaturityLevel, string[]> = {
  1: [
    "Sign up",
    "Open dashboard",
    "Invite missing team members",
    "Like/comment daily",
    "Watch for local events",
    "Begin P5 list",
  ],
  2: [
    "Complete 3-person team",
    "Schedule first meeting",
    "Share campaign content",
    "Identify local events",
    "Build P5 networks",
  ],
  3: [
    "Host small gathering",
    "Plan voter registration event",
    "Build event pipeline",
    "Add speaking opportunities",
    "Begin media list",
  ],
  4: [
    "Place volunteers downstream",
    "Launch another team",
    "Coordinate Kelly visit stops",
    "Contact local media",
    "Set up interviews",
  ],
  5: [
    "Run immersion weekend",
    "Coordinate multiple stops",
    "Train downstream teams",
    "Report full KPIs",
    "Prepare GOTV operations",
  ],
};
