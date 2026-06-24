import type { WorkflowIntakeStatus } from "@prisma/client";

export const VOLUNTEER_LIFECYCLE_PACKET = "VOLUNTEER-LIFECYCLE-4" as const;

export const VOLUNTEER_LIFECYCLE_STAGES = [
  "PENDING",
  "IN_REVIEW",
  "PLACED",
  "ONBOARDING",
  "ACTIVE",
  "LEADER_CANDIDATE",
  "ARCHIVED",
] as const;

export type VolunteerLifecycleStage = (typeof VOLUNTEER_LIFECYCLE_STAGES)[number];

export const LIFECYCLE_STAGE_LABELS: Record<VolunteerLifecycleStage, string> = {
  PENDING: "Pending",
  IN_REVIEW: "In review",
  PLACED: "Placed",
  ONBOARDING: "Onboarding",
  ACTIVE: "Active",
  LEADER_CANDIDATE: "Leader candidate",
  ARCHIVED: "Archived",
};

export const LIFECYCLE_PIPELINE: Array<{
  stage: VolunteerLifecycleStage;
  label: string;
  description: string;
}> = [
  { stage: "PENDING", label: "Pending", description: "New sign-ups awaiting first operator touch" },
  { stage: "IN_REVIEW", label: "In review", description: "Skills, geography, and fit under review" },
  { stage: "PLACED", label: "Placed", description: "Leader or workbench assignment confirmed" },
  { stage: "ONBOARDING", label: "Onboarding", description: "CRM contact created — welcome path in progress" },
  { stage: "ACTIVE", label: "Active", description: "Volunteer cleared for field work and workbench access" },
  {
    stage: "LEADER_CANDIDATE",
    label: "Leader candidate",
    description: "Flagged for future county or lane leadership",
  },
  { stage: "ARCHIVED", label: "Archived", description: "Declined or closed — no further activation work" },
];

const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);

export function isVolunteerLifecycleStage(v: unknown): v is VolunteerLifecycleStage {
  return typeof v === "string" && (VOLUNTEER_LIFECYCLE_STAGES as readonly string[]).includes(v);
}

/** Infer lifecycle stage from metadata + workflow status (Phase 4). */
export function readVolunteerLifecycleStage(
  metadata: unknown,
  status: WorkflowIntakeStatus,
): VolunteerLifecycleStage {
  if (isRecord(metadata) && isVolunteerLifecycleStage(metadata.lifecycleStage)) {
    return metadata.lifecycleStage;
  }
  if (status === "PENDING") return "PENDING";
  if (status === "IN_REVIEW" || status === "AWAITING_INFO" || status === "READY_FOR_CALENDAR") {
    return "IN_REVIEW";
  }
  if (status === "CONVERTED") return "ACTIVE";
  if (status === "DECLINED" || status === "ARCHIVED") return "ARCHIVED";
  return "PENDING";
}

export function mergeLifecycleMetadata(
  existing: unknown,
  stage: VolunteerLifecycleStage,
  patch: Record<string, unknown> = {},
): Record<string, unknown> {
  const base = isRecord(existing) ? { ...existing } : {};
  return {
    ...base,
    ...patch,
    lifecycleStage: stage,
    lifecycleUpdatedAt: new Date().toISOString(),
    lifecyclePacket: VOLUNTEER_LIFECYCLE_PACKET,
  };
}

export function workflowStatusForLifecycleStage(stage: VolunteerLifecycleStage): WorkflowIntakeStatus {
  switch (stage) {
    case "PENDING":
      return "PENDING";
    case "IN_REVIEW":
      return "IN_REVIEW";
    case "PLACED":
      return "READY_FOR_CALENDAR";
    case "ONBOARDING":
    case "ACTIVE":
    case "LEADER_CANDIDATE":
      return "CONVERTED";
    case "ARCHIVED":
      return "DECLINED";
    default:
      return "PENDING";
  }
}

const ALLOWED_TRANSITIONS: Record<VolunteerLifecycleStage, VolunteerLifecycleStage[]> = {
  PENDING: ["IN_REVIEW", "ARCHIVED"],
  IN_REVIEW: ["PLACED", "PENDING", "ARCHIVED"],
  PLACED: ["ONBOARDING", "IN_REVIEW", "ARCHIVED"],
  ONBOARDING: ["ACTIVE", "PLACED", "ARCHIVED"],
  ACTIVE: ["LEADER_CANDIDATE", "ONBOARDING", "ARCHIVED"],
  LEADER_CANDIDATE: ["ACTIVE", "ARCHIVED"],
  ARCHIVED: [],
};

export function canTransitionLifecycle(from: VolunteerLifecycleStage, to: VolunteerLifecycleStage): boolean {
  if (from === to) return false;
  return ALLOWED_TRANSITIONS[from]?.includes(to) ?? false;
}
