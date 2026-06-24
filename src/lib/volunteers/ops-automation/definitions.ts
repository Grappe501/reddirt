import type { CampaignTaskOpsSourceType, CampaignTaskOpsVisibility } from "@prisma/client";

/** Phase 6 — closed feedback loops and ladder automation. */
export const OPS_AUTOMATION_PACKET = "OPS-AUTOMATION-6" as const;

export const QUIET_LEADER_DAYS = 14;
export const STALE_INTAKE_DAYS = 7;
export const OVERDUE_ESCALATION_GRACE_DAYS = 1;

export type OpsAutomationTrigger =
  | "field_follow_up"
  | "intake_leader_notify"
  | "quiet_leader_14d"
  | "overdue_escalation"
  | "stale_intake"
  | "event_workflow_pack";

export const FIELD_FOLLOW_UP_CATEGORIES = new Set([
  "conversation",
  "volunteer",
  "email_contact",
  "house_party",
  "follower",
]);

export type AutomationTaskSpec = {
  title: string;
  description: string;
  taskType: "FIELD" | "VOLUNTEER" | "ADMIN" | "OTHER";
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  assignedRole: string;
  opsSourceType: CampaignTaskOpsSourceType;
  opsVisibility: CampaignTaskOpsVisibility;
  dueDays: number;
  leaderSlug?: string | null;
  parentTaskId?: string | null;
  laneId?: string | null;
  countyId?: string | null;
  eventId?: string | null;
  metadata?: Record<string, unknown>;
};

/** Map assigned role upward for overdue escalation (volunteer → city/county → CM). */
export function escalationRoleFor(currentRole: string | null | undefined): string | null {
  const role = (currentRole ?? "volunteer_ops").trim().toUpperCase();
  if (role === "CAMPAIGN_MANAGER") return null;
  if (role === "FIELD_DIRECTOR") return "CAMPAIGN_MANAGER";
  if (role === "VOLUNTEER_COORDINATOR" || role === "VOLUNTEER_OPS") return "FIELD_DIRECTOR";
  return "FIELD_DIRECTOR";
}

export function automationSignalId(trigger: OpsAutomationTrigger, key: string): string {
  return `automation:${trigger}:${key}`;
}
