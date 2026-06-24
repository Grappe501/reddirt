import programsFile from "../../../data/volunteers/special-outreach-programs.source.json";
import type { VolunteerLeader } from "@/lib/volunteers/types";

export type SpecialOutreachProgramSlug = "ozark-forward" | "just-a-girl";

export type SpecialOutreachProgram = {
  name: string;
  coalitionSlug: string;
  fundraisingGoal: number | null;
  fundraisingGoalNote: string;
  countySlugs: string[];
};

const registry = programsFile as {
  programs: Record<SpecialOutreachProgramSlug, SpecialOutreachProgram>;
};

export function getSpecialOutreachProgram(slug: SpecialOutreachProgramSlug): SpecialOutreachProgram {
  return registry.programs[slug];
}

export function resolveSpecialOutreachProgramForLeader(
  leader: VolunteerLeader,
): SpecialOutreachProgram | null {
  if (!leader.specialOutreachProgramSlug) return null;
  return getSpecialOutreachProgram(leader.specialOutreachProgramSlug);
}

export function formatSpecialOutreachFundraisingGoal(program: SpecialOutreachProgram): string {
  if (program.fundraisingGoal == null) return "Goal not set yet";
  return `$${program.fundraisingGoal.toLocaleString("en-US")}`;
}
