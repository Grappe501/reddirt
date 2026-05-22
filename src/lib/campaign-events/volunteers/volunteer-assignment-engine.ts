import type { VolunteerAssignment, VolunteerProfile, VolunteerSkill } from "./volunteer-types";
import { scoreVolunteerReliability } from "./volunteer-scoring";

export type EventVolunteerNeed = {
  eventRecordId: string;
  county?: string;
  rolesNeeded: string[];
  volunteersNeeded: number;
  trainedOnly?: boolean;
};

export type VolunteerAssignmentRecommendation = {
  volunteerId: string;
  displayName: string;
  role: string;
  score: number;
  reasons: string[];
  humanApprovalRequired: true;
};

const ROLE_SKILL_MAP: Record<string, VolunteerSkill[]> = {
  "check-in table": ["check_in"],
  "literature table": ["literature"],
  "event setup": ["event_setup"],
  "door knocking": ["canvassing"],
  "phone bank": ["phone_bank"],
  "text bank": ["text_bank"],
  "house party support": ["house_party"],
  driver: ["driving"],
  "social media helper": ["social_media"],
  photographer: ["photography"],
  "county data helper": ["data_entry"],
  "hot wash note taker": ["hot_wash_notes"],
  "volunteer captain": ["event_setup", "check_in"],
};

export function recommendVolunteersForEvent(
  need: EventVolunteerNeed,
  profiles: VolunteerProfile[],
  assignments: VolunteerAssignment[],
): VolunteerAssignmentRecommendation[] {
  const countyNorm = need.county?.toLowerCase().replace(/\s+county$/i, "").trim();
  const recs: VolunteerAssignmentRecommendation[] = [];

  for (const profile of profiles) {
    if (profile.consentStatus === "unknown") continue;
    if (countyNorm && profile.county && profile.county !== countyNorm && !profile.tags.includes("statewide")) continue;

    for (const role of need.rolesNeeded) {
      const skills = ROLE_SKILL_MAP[role] ?? [];
      const skillMatch = skills.length === 0 || skills.some((s) => profile.skills.includes(s));
      if (!skillMatch && need.trainedOnly) continue;

      const reliability = scoreVolunteerReliability(profile, assignments);
      const trainingOk = need.trainedOnly
        ? profile.trainingCompleted.includes("campaign-basics")
        : true;
      if (!trainingOk) continue;

      let score = reliability * 0.5;
      if (skillMatch) score += 25;
      if (profile.leadershipPotential === "high" && role.includes("captain")) score += 15;
      if (profile.assignedEvents.includes(need.eventRecordId)) score -= 50;

      const reasons: string[] = [];
      if (skillMatch) reasons.push(`Skills match ${role}`);
      reasons.push(`Reliability ${reliability}`);
      if (profile.county === countyNorm) reasons.push("Same county");

      recs.push({
        volunteerId: profile.id,
        displayName: `${profile.firstName} ${profile.lastName}`.trim(),
        role,
        score,
        reasons,
        humanApprovalRequired: true,
      });
    }
  }

  return recs.sort((a, b) => b.score - a.score).slice(0, need.volunteersNeeded * 3);
}

export function estimateEventStaffingGap(
  volunteersNeeded: number,
  currentAssignments: VolunteerAssignment[],
  eventRecordId: string,
): { needed: number; assigned: number; gap: number; warning?: string } {
  const assigned = currentAssignments.filter(
    (a) => a.eventRecordId === eventRecordId && (a.status === "accepted" || a.status === "completed"),
  ).length;
  const gap = Math.max(0, volunteersNeeded - assigned);
  return {
    needed: volunteersNeeded,
    assigned,
    gap,
    warning: gap > 0 ? `${gap} volunteer(s) still needed — recommendations require human approval` : undefined,
  };
}
