/**
 * Power of 5 — canonical **organizing funnel** pipelines shown on public and leader dashboards.
 *
 * These six stages are the product-facing ladder (invite → candidate). They are a subset of the
 * broader `PowerPipelineId` union in `types.ts`; each row maps to a stable persistence key via
 * `legacyPowerPipelineId` (notably `follow-up` → `followup`).
 *
 * @see docs/POWER_OF_5_PIPELINES.md
 */
import type { PowerPipelineId } from "@/lib/power-of-5/types";

export const POWER_OF_5_ORGANIZING_PIPELINE_IDS = [
  "invite",
  "activation",
  "volunteer",
  "event",
  "follow-up",
  "candidate",
] as const;

export type PowerOf5OrganizingPipelineId = (typeof POWER_OF_5_ORGANIZING_PIPELINE_IDS)[number];

export type PowerOf5PipelineDefinition = {
  id: PowerOf5OrganizingPipelineId;
  order: number;
  label: string;
  /** One-line copy for dashboard tooltips and docs. */
  summary: string;
  /** Aligns with `PowerPipelineId` for `OrganizingActivity.pipelineId` and future DB keys. */
  legacyPowerPipelineId: PowerPipelineId;
};

export const POWER_OF_5_ORGANIZING_PIPELINES: readonly PowerOf5PipelineDefinition[] = [
  {
    id: "invite",
    order: 1,
    label: "Invite",
    summary: "Relational entry — consent-forward asks into someone’s Power of 5 circle.",
    legacyPowerPipelineId: "invite",
  },
  {
    id: "activation",
    order: 2,
    label: "Activation",
    summary: "First meaningful yes: account, training touch, or confirmed role.",
    legacyPowerPipelineId: "activation",
  },
  {
    id: "volunteer",
    order: 3,
    label: "Volunteer",
    summary: "Recurring participation — shifts, relational work, or owned turf.",
    legacyPowerPipelineId: "volunteer",
  },
  {
    id: "event",
    order: 4,
    label: "Event",
    summary: "Anchored moments — house parties, trainings, community-facing touchpoints.",
    legacyPowerPipelineId: "event",
  },
  {
    id: "follow-up",
    order: 5,
    label: "Follow-up",
    summary: "Close the loop on conversations and invites before adding new names.",
    legacyPowerPipelineId: "followup",
  },
  {
    id: "candidate",
    order: 6,
    label: "Candidate",
    summary: "Pipeline toward public leadership — vetting and support, not opposition research in this lane.",
    legacyPowerPipelineId: "candidate",
  },
];

export function isPowerOf5OrganizingPipelineId(id: string): id is PowerOf5OrganizingPipelineId {
  return (POWER_OF_5_ORGANIZING_PIPELINE_IDS as readonly string[]).includes(id);
}

export function getPowerOf5OrganizingPipelineById(
  id: PowerOf5OrganizingPipelineId,
): PowerOf5PipelineDefinition | undefined {
  return POWER_OF_5_ORGANIZING_PIPELINES.find((p) => p.id === id);
}

/** Resolve dashboard slug to the `PowerPipelineId` used in shared types and activity logs. */
export function toLegacyPowerPipelineId(id: PowerOf5OrganizingPipelineId): PowerPipelineId {
  const row = getPowerOf5OrganizingPipelineById(id);
  if (!row) throw new Error(`Unknown organizing pipeline: ${id}`);
  return row.legacyPowerPipelineId;
}
