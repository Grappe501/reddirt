/**
 * Comms workbench deep-link fragments and path helpers.
 * Use these for consistent “jump to section” and cross-links from dashboard/list.
 */
export const COMMS_PLAN_SECTION = {
  attention: "comms-attention",
  source: "comms-source",
  review: "comms-review",
  sendSummary: "comms-send-summary",
  execution: "comms-execution",
  drafts: "comms-drafts",
  variants: "comms-variants",
  sends: "comms-sends",
  media: "comms-media",
  segments: "comms-segments",
} as const;

export type CommsPlanSection = (typeof COMMS_PLAN_SECTION)[keyof typeof COMMS_PLAN_SECTION];

export const COMMS_APP_PATHS = {
  dashboard: "/admin/workbench/comms",
  plans: "/admin/workbench/comms/plans",
  plansNew: "/admin/workbench/comms/plans/new",
  media: "/admin/workbench/comms/media",
} as const;

export function commsPlanPath(planId: string, section?: CommsPlanSection | null): string {
  const base = `/admin/workbench/comms/plans/${planId}`;
  if (!section) return base;
  return `${base}#${section}`;
}

export function commsMediaPath(mediaId: string): string {
  return `${COMMS_APP_PATHS.media}/${mediaId}`;
}

export function commsPlanSegmentPath(communicationPlanId: string, comsPlanAudienceSegmentId: string): string {
  return `/admin/workbench/comms/plans/${communicationPlanId}/segments/${comsPlanAudienceSegmentId}`;
}
