import type { VolunteerProfile, VolunteerTrainingRecord } from "./volunteer-types";
import { VOLUNTEER_TRAINING_MODULES } from "./volunteer-training-modules";

export type VolunteerTrainingPath = {
  volunteerId: string;
  recommendedNext: string[];
  inProgress: string[];
  completed: string[];
  estimatedHours: number;
  gaps: string[];
};

export function buildVolunteerTrainingPath(
  profile: VolunteerProfile,
  records: VolunteerTrainingRecord[] = [],
): VolunteerTrainingPath {
  const completed = new Set([
    ...profile.trainingCompleted,
    ...records.filter((r) => r.status === "completed").map((r) => r.moduleId),
  ]);
  const inProgress = records.filter((r) => r.status === "in_progress").map((r) => r.moduleId);
  const recommendedNext: string[] = [];
  const gaps: string[] = [];

  if (!completed.has("campaign-basics")) {
    recommendedNext.push("campaign-basics");
    gaps.push("Campaign basics not complete");
  }
  if (!completed.has("data-privacy-rules")) {
    recommendedNext.push("data-privacy-rules");
    gaps.push("Privacy training required before outreach roles");
  }
  for (const skill of profile.skills) {
    if (skill === "canvassing" && !completed.has("canvassing-basics")) recommendedNext.push("canvassing-basics");
    if (skill === "phone_bank" && !completed.has("phone-bank-basics")) recommendedNext.push("phone-bank-basics");
    if (skill === "text_bank" && !completed.has("text-bank-basics")) recommendedNext.push("text-bank-basics");
    if (skill === "power_of_five" && !completed.has("power-of-five")) recommendedNext.push("power-of-five");
  }
  for (const need of profile.trainingNeeded) {
    if (!completed.has(need) && !recommendedNext.includes(need)) recommendedNext.push(need);
  }

  const unique = [...new Set(recommendedNext)].slice(0, 6);
  const estimatedHours =
    unique.reduce((sum, id) => {
      const m = VOLUNTEER_TRAINING_MODULES.find((x) => x.id === id);
      return sum + (m ? m.estimatedMinutes / 60 : 0.5);
    }, 0) + completed.size * 0.1;

  return {
    volunteerId: profile.id,
    recommendedNext: unique,
    inProgress,
    completed: [...completed],
    estimatedHours: Math.round(estimatedHours * 10) / 10,
    gaps,
  };
}
