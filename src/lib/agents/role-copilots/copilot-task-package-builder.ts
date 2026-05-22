import type {
  CopilotCampaignContext,
  CopilotTaskPackage,
  CopilotTaskPackageType,
} from "./copilot-intelligence-types";
import type { CopilotSkillLevel, RoleCopilotId } from "./role-copilot-types";
import { getRoleCopilot } from "./role-copilot-registry";
import { getRoleExtraTaskPartials } from "./role-copilot-intelligence-rules";

let pkgCounter = 0;

function pkgId(role: string, type: string): string {
  pkgCounter += 1;
  return `pkg_${role}_${type}_${pkgCounter}`;
}

function basePackage(
  role: RoleCopilotId,
  partial: Partial<CopilotTaskPackage> & { title: string; type: CopilotTaskPackageType },
  month: string,
): CopilotTaskPackage {
  const def = getRoleCopilot(role);
  return {
    id: pkgId(role, partial.type),
    type: partial.type,
    title: partial.title,
    role,
    whyItMatters: partial.whyItMatters ?? `Supports ${def?.label ?? role} mission this month.`,
    estimatedMinutes: partial.estimatedMinutes ?? 15,
    difficulty: partial.difficulty ?? "easy",
    prerequisites: partial.prerequisites ?? [],
    steps: partial.steps ?? ["Open linked route", "Complete checklist", "Mark done or escalate"],
    routeLinks: partial.routeLinks ?? def?.firstTasks.slice(0, 1) ?? [],
    toolsNeeded: partial.toolsNeeded ?? ["copilot-task-package-builder"],
    trainingNeeded: partial.trainingNeeded ?? def?.trainingModuleIds.slice(0, 1) ?? [],
    humanApprovalGates: partial.humanApprovalGates ?? [],
    completionCriteria: partial.completionCriteria ?? ["Task reviewed by user", "No gated action taken without approval"],
    escalationRole: partial.escalationRole ?? def?.escalationPath ?? "Campaign manager",
    observationEvents: partial.observationEvents ?? ["copilot_task_package_created"],
    safeOnly: partial.safeOnly ?? true,
  };
}

export function buildCopilotTaskPackage(
  role: RoleCopilotId,
  type: CopilotTaskPackageType,
  opts?: Partial<CopilotTaskPackage>,
  month = "2026-03",
): CopilotTaskPackage {
  return basePackage(role, { type, title: opts?.title ?? `${type} task`, ...opts }, month);
}

export function buildFirstTaskPackage(
  role: RoleCopilotId,
  skillLevel: CopilotSkillLevel,
  availableMinutes?: number,
  month = "2026-03",
): CopilotTaskPackage {
  const def = getRoleCopilot(role);
  const first = def?.firstTasks[0];
  const mins = availableMinutes != null && availableMinutes < 30 ? 10 : 20;
  return basePackage(
    role,
    {
      type: "first",
      title: first?.label ?? "Start here",
      routeLinks: first ? [first] : [],
      estimatedMinutes: mins,
      difficulty: skillLevel === "beginner" ? "easy" : "moderate",
      observationEvents: ["copilot_task_package_created", "onboarding_first_task_started"],
    },
    month,
  );
}

export function buildDailyTaskPackages(
  role: RoleCopilotId,
  ctx: CopilotCampaignContext,
  month = "2026-03",
): CopilotTaskPackage[] {
  const def = getRoleCopilot(role);
  const fromDaily = (def?.dailyTasks ?? []).slice(0, 2).map((t, i) =>
    basePackage(role, { type: "daily", title: t, estimatedMinutes: 10 + i * 5 }, month),
  );
  const extras = getRoleExtraTaskPartials(role, ctx, month).map((p) =>
    basePackage(role, { type: p.type ?? "daily", title: p.title ?? "Daily task", ...p }, month),
  );
  return [...extras, ...fromDaily].slice(0, 4);
}

export function buildTopThreeTaskPackages(
  role: RoleCopilotId,
  ctx: CopilotCampaignContext,
  skillLevel: CopilotSkillLevel,
  availableMinutes?: number,
  month = "2026-03",
): CopilotTaskPackage[] {
  const first = buildFirstTaskPackage(role, skillLevel, availableMinutes, month);
  const daily = buildDailyTaskPackages(role, ctx, month);
  const def = getRoleCopilot(role);
  const fromFirst = (def?.firstTasks ?? []).slice(1, 3).map((t) =>
    basePackage(role, { type: "first", title: t.label, routeLinks: [t] }, month),
  );
  const merged = [first, ...daily, ...fromFirst];
  const seen = new Set<string>();
  const out: CopilotTaskPackage[] = [];
  for (const p of merged) {
    if (seen.has(p.title)) continue;
    seen.add(p.title);
    out.push(p);
    if (out.length >= 3) break;
  }
  return out;
}

export function buildTrainingTaskPackage(
  role: RoleCopilotId,
  moduleId: string,
  moduleTitle: string,
  month = "2026-03",
): CopilotTaskPackage {
  return basePackage(
    role,
    {
      type: "training",
      title: `Training: ${moduleTitle}`,
      routeLinks: [{ label: "Training center", href: `/admin/training?role=${role}&module=${moduleId}` }],
      trainingNeeded: [moduleId],
      observationEvents: ["copilot_training_recommended", "training_module_started"],
    },
    month,
  );
}
