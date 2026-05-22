import type { RoleCopilotId } from "@/lib/agents/role-copilots/role-copilot-types";
import { getTrainingModule } from "./training-module-registry";
import { getRoleTrainingPath } from "./training-path-builder";

export function recommendNextTrainingModule(
  role: RoleCopilotId,
  completedIds: string[],
): { moduleId: string; title: string; reason: string } | null {
  const path = getRoleTrainingPath(role, "beginner", completedIds);
  const next = path.moduleIds.find((id) => !completedIds.includes(id));
  if (!next) return null;
  const m = getTrainingModule(next);
  return {
    moduleId: next,
    title: m?.title ?? next,
    reason: "Next module on your Kelly training path.",
  };
}

export function recommendTrainingForPathname(
  pathname: string,
  role: RoleCopilotId,
): { moduleId: string; title: string } | null {
  const rules: { match: RegExp; moduleId: string }[] = [
    { match: /reimbursement/, moduleId: "tr-reimbursement-treasurer-101" },
    { match: /workbench/, moduleId: "tr-workbench-101" },
    { match: /onboarding/, moduleId: "tr-onboarding-users-101" },
    { match: /volunteer/, moduleId: "tr-volunteer-mgmt-101" },
    { match: /ai-command-center/, moduleId: "tr-ai-command-center-101" },
    { match: /county/, moduleId: "tr-county-dashboard-101" },
  ];
  for (const r of rules) {
    if (r.match.test(pathname)) {
      const m = getTrainingModule(r.moduleId);
      if (m && (m.roleTargets.includes(role) || role === "operator")) {
        return { moduleId: r.moduleId, title: m.title };
      }
    }
  }
  return recommendNextTrainingModule(role, [])
    ? { moduleId: recommendNextTrainingModule(role, [])!.moduleId, title: recommendNextTrainingModule(role, [])!.title }
    : null;
}
