import type { DashboardBlockId } from "@/lib/agents/dashboard-builder/dashboard-component-registry";
import type { RoleCopilotId } from "@/lib/agents/role-copilots/role-copilot-types";
import type { RoleLevelDefinition, RoleProgressLevel } from "./progression-types";

const BASE_L1: DashboardBlockId[] = ["onboarding_checklist", "role_training", "executive_summary"];
const BASE_L2: DashboardBlockId[] = ["ai_next_actions", "upcoming_events"];
const BASE_L3: DashboardBlockId[] = ["approval_queue", "command_palette"];

const ROLE_UNLOCKS: Partial<Record<RoleCopilotId, Record<RoleProgressLevel, DashboardBlockId[]>>> = {
  candidate: {
    1: [...BASE_L1, "approval_queue", "travel_reimbursement_summary"],
    2: [...BASE_L2, "upcoming_events"],
    3: [...BASE_L3, "print_download_actions"],
  },
  campaign_manager: {
    1: [...BASE_L1, "event_planning_checklist", "calendar_sync_health"],
    2: [...BASE_L2, "promotion_readiness", "hot_wash_queue"],
    3: [...BASE_L3, "approval_queue", "recent_activity"],
  },
  treasurer: {
    1: [...BASE_L1, "travel_reimbursement_summary", "missing_mileage"],
    2: [...BASE_L2, "finance_readiness", "receipt_gaps"],
    3: [...BASE_L3, "print_download_actions"],
  },
  volunteer: {
    1: [...BASE_L1, "upcoming_events"],
    2: [...BASE_L2, "volunteer_needs"],
    3: BASE_L3,
  },
  intern: {
    1: [...BASE_L1, "event_planning_checklist", "receipt_gaps"],
    2: [...BASE_L2, "missing_mileage"],
    3: BASE_L3,
  },
  field_manager: {
    1: [...BASE_L1, "county_memory"],
    2: [...BASE_L2, "volunteer_needs", "hot_wash_queue"],
    3: BASE_L3,
  },
  new_admin: {
    1: [...BASE_L1, "command_palette"],
    2: [...BASE_L2],
    3: [...BASE_L3, "executive_summary"],
  },
  operator: {
    1: [...BASE_L1, "recent_activity", "ai_next_actions"],
    2: [...BASE_L2, "calendar_sync_health"],
    3: [...BASE_L3, "promotion_readiness", "command_palette"],
  },
};

function levelsFor(role: RoleCopilotId): RoleLevelDefinition[] {
  const unlocks = ROLE_UNLOCKS[role] ?? {
    1: [...BASE_L1],
    2: [...BASE_L2],
    3: [...BASE_L3],
  };
  return ([1, 2, 3] as RoleProgressLevel[]).map((level) => ({
    role,
    level,
    title: `${role.replace(/_/g, " ")} Level ${level}`,
    description: `Guidance tier ${level} — not a permission system.`,
    requiredTrainingModuleIds: level === 1 ? [] : level === 2 ? [`tr-${role}-201`] : [`tr-${role}-201`, `tr-os-navigation-101`],
    unlocksDashboardModules: unlocks[level] ?? BASE_L1,
    achievements: [`${role}_level_${level}_reached`],
  }));
}

const REGISTRY: RoleLevelDefinition[] = (
  [
    "candidate",
    "campaign_manager",
    "treasurer",
    "event_planner",
    "volunteer_coordinator",
    "volunteer",
    "intern",
    "field_manager",
    "county_lead",
    "host",
    "social_media_lead",
    "communications_lead",
    "finance_helper",
    "new_admin",
    "operator",
  ] as RoleCopilotId[]
).flatMap(levelsFor);

export function getRoleLevelDefinition(
  role: RoleCopilotId,
  level: RoleProgressLevel,
): RoleLevelDefinition | undefined {
  return REGISTRY.find((r) => r.role === role && r.level === level);
}

export function listRoleLevels(role: RoleCopilotId): RoleLevelDefinition[] {
  return REGISTRY.filter((r) => r.role === role);
}
