import { getBlockById } from "@/lib/agents/dashboard-builder/dashboard-component-registry";
import { recommendNextTrainingModule } from "@/lib/agents/training/training-recommendation-engine";
import { getLockedDashboardModules } from "@/lib/agents/training/training-unlock-engine";
import { getRoleAllowedModules } from "@/lib/agents/progression/unlock-engine";
import type {
  CopilotIntelligenceBrief,
  CopilotIntelligenceInput,
  DashboardModuleRecommendation,
} from "./copilot-intelligence-types";
import { composeCopilotCampaignContext, composeCopilotRoleSnapshot } from "./copilot-role-context-composer";
import { routeCopilotSafeActions } from "./copilot-safe-action-router";
import {
  buildTopThreeTaskPackages,
  buildTrainingTaskPackage,
} from "./copilot-task-package-builder";
import { scoreCopilotReadiness, describeModuleLock } from "./copilot-readiness-scorer";
import { getRoleIntelligenceToolIds, getRoleRiskWarnings } from "./role-copilot-intelligence-rules";
import { mergeCountyIntoCopilotBriefLite } from "@/lib/agents/county-intelligence/county-copilot-brief-merge-lite";
import { getRoleCopilot } from "./role-copilot-registry";
import type { CopilotSkillLevel, RoleCopilotId } from "./role-copilot-types";

export function buildCopilotIntelligenceBrief(input: CopilotIntelligenceInput): CopilotIntelligenceBrief {
  const skillLevel: CopilotSkillLevel = input.skillLevel ?? "beginner";
  const month = input.month ?? "2026-03";
  const completed = input.completedTrainingIds ?? [];
  const snapshot = composeCopilotRoleSnapshot(input);
  const campaignContext = composeCopilotCampaignContext(input);
  const def = getRoleCopilot(input.role);

  const topThree = buildTopThreeTaskPackages(
    input.role,
    campaignContext,
    skillLevel,
    input.availableMinutes,
    month,
  );
  const recommendedNextTask = topThree[0];

  const nextTrain = recommendNextTrainingModule(input.role, completed);
  const trainingRecommendation = nextTrain
    ? {
        moduleId: nextTrain.moduleId,
        title: nextTrain.title,
        href: `/admin/training?role=${input.role}&module=${nextTrain.moduleId}`,
        reason: nextTrain.reason,
      }
    : {
        moduleId: def?.trainingModuleIds[0] ?? "tr-os-navigation-101",
        title: "Campaign OS basics",
        href: `/admin/training?role=${input.role}`,
        reason: "Default training path.",
      };

  const allowed = getRoleAllowedModules(input.role, snapshot.progressionLevel, completed);
  const locked = getLockedDashboardModules(def?.dashboardModuleIds ?? [], completed);
  const lockedSet = new Set(locked.map((l) => l.blockId));
  const dashboardModules: DashboardModuleRecommendation[] = allowed.map((id) => ({
    id,
    title: getBlockById(id)?.title ?? id,
    locked: false,
  }));
  for (const l of locked) {
    if (!dashboardModules.some((m) => m.id === l.blockId)) {
      dashboardModules.push({
        id: l.blockId,
        title: describeModuleLock(l.blockId),
        locked: true,
        trainingModuleId: l.requiredModuleId,
      });
    }
  }

  const readiness = scoreCopilotReadiness(input.role, skillLevel, completed);
  const riskWarnings = [
    ...getRoleRiskWarnings(input.role, campaignContext, skillLevel),
    ...(readiness.dimensions.overall < 40 ? ["Complete onboarding training before gated workflows."] : []),
  ].slice(0, 5);

  const escalationNote =
    readiness.dimensions.overall < 50
      ? `${def?.escalationPath ?? "Supervisor"} — training recommended before high-risk tasks.`
      : def?.escalationPath ?? "Campaign manager";

  let confidence: CopilotIntelligenceBrief["confidence"] = "medium";
  if (input.pathname && campaignContext.routeContext !== "general") confidence = "high";
  if (skillLevel === "beginner" && completed.length < 2) confidence = "low";

  const safeActionLinks = routeCopilotSafeActions(input.role, month).slice(0, 8);

  const COUNTY_ROLES: RoleCopilotId[] = [
    "field_manager",
    "county_lead",
    "volunteer_coordinator",
    "intern",
    "communications_lead",
    "candidate",
    "campaign_manager",
  ];
  const baseBrief = {
    snapshot,
    campaignContext,
    recommendedNextTask,
    topThreeTasks: topThree,
    trainingRecommendation,
    dashboardModules: dashboardModules.slice(0, 10),
    riskWarnings,
    escalationNote,
    confidence,
    explanationStyle: def?.explanationStyle ?? "direct",
    safeActionLinks,
    toolIds: getRoleIntelligenceToolIds(input.role),
    generatedAt: new Date().toISOString(),
  };

  if (COUNTY_ROLES.includes(input.role)) {
    return mergeCountyIntoCopilotBriefLite(input.role, baseBrief);
  }
  return baseBrief;
}

export function buildCopilotIntelligenceBriefForRoute(
  role: CopilotIntelligenceInput["role"],
  pathname: string,
  month?: string,
): CopilotIntelligenceBrief {
  return buildCopilotIntelligenceBrief({ role, pathname, month, skillLevel: "intermediate" });
}

export { scoreCopilotReadiness } from "./copilot-readiness-scorer";
export { buildTopThreeTaskPackages, buildCopilotTaskPackage, buildTrainingTaskPackage } from "./copilot-task-package-builder";
export { routeCopilotSafeActions, isHighRiskAutonomousAction } from "./copilot-safe-action-router";
