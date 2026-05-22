import type { DashboardBlockId } from "@/lib/agents/dashboard-builder/dashboard-component-registry";
import { getRoleTrainingPath } from "@/lib/agents/training/training-path-builder";
import { getRoleAllowedModules } from "@/lib/agents/progression/unlock-engine";
import type {
  CopilotSkillLevel,
  RecommendRoleCopilotInput,
  RoleCopilotBrief,
  RoleCopilotId,
} from "./role-copilot-types";
import { getRoleCopilot, ROLE_COPILOT_REGISTRY } from "./role-copilot-registry";

const ROLE_KEYWORDS: { id: RoleCopilotId; words: string[] }[] = [
  { id: "candidate", words: ["candidate", "kelly", "approval", "approve"] },
  { id: "treasurer", words: ["treasurer", "reimbursement", "mileage", "receipt", "finance"] },
  { id: "volunteer_coordinator", words: ["volunteer coordinator", "volunteers", "staffing"] },
  { id: "volunteer", words: ["volunteer helper", "door knock", "check in"] },
  { id: "intern", words: ["intern", "student", "assistant"] },
  { id: "field_manager", words: ["field manager", "field org"] },
  { id: "county_lead", words: ["county lead", "county chair", "county"] },
  { id: "event_planner", words: ["event planner", "events", "run of show"] },
  { id: "host", words: ["host", "house party"] },
  { id: "social_media_lead", words: ["social", "instagram", "facebook", "tiktok"] },
  { id: "communications_lead", words: ["communications", "email", "comms"] },
  { id: "finance_helper", words: ["finance helper", "bookkeeper"] },
  { id: "campaign_manager", words: ["campaign manager", "cm", "operations", "workbench"] },
  { id: "new_admin", words: ["new user", "new admin", "first day"] },
  { id: "operator", words: ["steve", "operator", "developer", "admin owner"] },
];

export function recommendRoleCopilot(input: RecommendRoleCopilotInput): {
  role: RoleCopilotId;
  confidence: "high" | "medium" | "low";
  reason: string;
} {
  if (input.preferredRole && getRoleCopilot(input.preferredRole)) {
    return { role: input.preferredRole, confidence: "high", reason: "Explicit role selection." };
  }
  const blob = `${input.who ?? ""} ${input.helpingWith ?? ""}`.toLowerCase();
  for (const row of ROLE_KEYWORDS) {
    if (row.words.some((w) => blob.includes(w))) {
      return { role: row.id, confidence: "medium", reason: `Matched keywords for ${row.id}.` };
    }
  }
  if (input.pathname?.includes("reimbursement")) {
    return { role: "treasurer", confidence: "medium", reason: "Reimbursement route context." };
  }
  if (input.pathname?.includes("volunteer")) {
    return { role: "volunteer_coordinator", confidence: "medium", reason: "Volunteer route context." };
  }
  if (input.experience === "none" || (input.availableHoursPerWeek ?? 0) < 5) {
    return { role: "new_admin", confidence: "low", reason: "Low experience or hours — start with guided onboarding." };
  }
  return { role: "campaign_manager", confidence: "low", reason: "Default ops placement for Kelly SOS." };
}

export function buildRoleCopilotBrief(
  role: RoleCopilotId,
  context?: { pathname?: string; month?: string },
): RoleCopilotBrief {
  const def = getRoleCopilot(role);
  if (!def) {
    return {
      role,
      headline: "Unknown role",
      mission: "Complete onboarding to select a role.",
      focusToday: [],
      doNotTouch: [],
      escalation: "Steve/operator",
      trainingHref: "/admin/training",
      commandCenterHref: "/admin/ai-command-center",
    };
  }
  const month = context?.month ?? "2026-03";
  return {
    role,
    headline: `${def.label} copilot`,
    mission: def.mission,
    focusToday: def.focusAreas.slice(0, 3),
    doNotTouch: def.doNotTouch,
    escalation: def.escalationPath,
    trainingHref: `/admin/training?role=${role}`,
    commandCenterHref: "/admin/ai-command-center",
  };
}

export function buildRoleFirstTasks(
  role: RoleCopilotId,
  availableTime?: number,
  skillLevel: CopilotSkillLevel = "beginner",
): { label: string; href: string; estimatedMinutes: number }[] {
  const def = getRoleCopilot(role);
  if (!def) return [];
  const cap = availableTime != null && availableTime < 2 ? 2 : 3;
  const base = def.firstTasks.slice(0, cap).map((t, i) => ({
    ...t,
    estimatedMinutes: skillLevel === "beginner" ? 15 + i * 5 : 10 + i * 3,
  }));
  return base;
}

export { getRoleAllowedModules, getRoleTrainingPath };

export function getRoleCopilotDashboardModules(
  role: RoleCopilotId,
  level = 1,
): DashboardBlockId[] {
  return getRoleAllowedModules(role, level);
}

export function listAllRoleCopilots() {
  return ROLE_COPILOT_REGISTRY;
}
