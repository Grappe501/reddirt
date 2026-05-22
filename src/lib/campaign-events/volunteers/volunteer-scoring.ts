import type { VolunteerAssignment, VolunteerProfile } from "./volunteer-types";

export function scoreVolunteerReliability(
  profile: VolunteerProfile,
  assignments: VolunteerAssignment[],
): number {
  const mine = assignments.filter((a) => a.volunteerId === profile.id);
  if (mine.length === 0) return profile.reliabilityScore;
  const completed = mine.filter((a) => a.status === "completed").length;
  const noShows = mine.filter((a) => a.status === "no_show").length;
  const accepted = mine.filter((a) => a.status === "accepted" || a.status === "completed").length;
  const base = 40 + Math.min(40, completed * 8) + Math.min(15, accepted * 3);
  const penalty = noShows * 15;
  return Math.max(0, Math.min(100, base - penalty));
}

export function detectLeadershipPotential(profile: VolunteerProfile): VolunteerProfile["leadershipPotential"] {
  if (profile.leadershipPotential === "high") return "high";
  const trainingCount = profile.trainingCompleted.length;
  const skillBreadth = profile.skills.length;
  if (trainingCount >= 5 && skillBreadth >= 4 && profile.reliabilityScore >= 75) return "high";
  if (trainingCount >= 2 && profile.reliabilityScore >= 60) return "medium";
  return profile.leadershipPotential;
}

export function detectRetentionRisk(profile: VolunteerProfile): "low" | "medium" | "high" {
  if (profile.consentStatus === "unknown") return "high";
  if (profile.trainingNeeded.length > 3 && profile.trainingCompleted.length === 0) return "medium";
  if (profile.reliabilityScore < 40) return "high";
  if (profile.assignedEvents.length === 0 && profile.createdAt) {
    const ageDays = (Date.now() - new Date(profile.createdAt).getTime()) / 86400000;
    if (ageDays > 21) return "medium";
  }
  return "low";
}
