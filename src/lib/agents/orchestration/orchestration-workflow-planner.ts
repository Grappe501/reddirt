/**
 * Cross-domain workflow planner — deterministic workflow chains V1.
 */

import type { CampaignDomainId } from "./campaign-state-types";
import type { OrchestrationDiagnosis } from "./orchestration-reasoning-engine";

export type OrchestrationWorkflowStep = {
  id: string;
  title: string;
  domainId: CampaignDomainId;
  route?: string;
  toolId?: string;
  dependsOn?: string[];
  ownerRole: string;
  humanGate: "none" | "review" | "forbidden";
};

export type OrchestrationWorkflowPlan = {
  id: string;
  title: string;
  purpose: string;
  steps: OrchestrationWorkflowStep[];
  readinessScore: number;
  blockers: string[];
};

export const ORCHESTRATION_WORKFLOW_TEMPLATES: Record<string, OrchestrationWorkflowPlan> = {
  "close-month-reimbursement": {
    id: "close-month-reimbursement",
    title: "Close month reimbursement",
    purpose: "Travel approvals → mileage fixes → finance packet → treasurer review → print/export",
    readinessScore: 0,
    blockers: [],
    steps: [
      { id: "s1", title: "Clear travel approval queue", domainId: "approvals", route: "/admin/campaign-events/review", ownerRole: "campaign_manager", humanGate: "review" },
      { id: "s2", title: "Fix mileage / ledger gaps", domainId: "travel", route: "/admin/campaign-events/travel", ownerRole: "operator", humanGate: "review", dependsOn: ["s1"] },
      { id: "s3", title: "Build finance packet", domainId: "finance", route: "/admin/campaign-events/reimbursement", ownerRole: "treasurer", humanGate: "review", dependsOn: ["s2"] },
      { id: "s4", title: "Treasurer review + print gate", domainId: "reimbursement", route: "/admin/campaign-events/reimbursement", ownerRole: "treasurer", humanGate: "review", dependsOn: ["s3"] },
    ],
  },
  "prepare-county-visit": {
    id: "prepare-county-visit",
    title: "Prepare county visit",
    purpose: "County briefing → event planning → volunteers → communications → candidate talking points → hot wash setup",
    readinessScore: 0,
    blockers: [],
    steps: [
      { id: "s1", title: "County intelligence briefing", domainId: "county", route: "/admin/county-intelligence", ownerRole: "field_manager", humanGate: "none" },
      { id: "s2", title: "Event planning drilldown", domainId: "event_planning", route: "/admin/campaign-events/workbench", ownerRole: "campaign_manager", humanGate: "review", dependsOn: ["s1"] },
      { id: "s3", title: "Volunteer staffing", domainId: "volunteer", route: "/admin/volunteers", ownerRole: "volunteer_coordinator", humanGate: "review", dependsOn: ["s2"] },
      { id: "s4", title: "Communications package (draft only)", domainId: "communications", route: "/admin/communications/intelligence", ownerRole: "communications_lead", humanGate: "review", dependsOn: ["s2"] },
      { id: "s5", title: "Candidate talking points", domainId: "candidate", route: "/admin/ai-command-center/copilots", ownerRole: "candidate", humanGate: "none", dependsOn: ["s2"] },
      { id: "s6", title: "Hot wash template ready", domainId: "hot_wash", route: "/admin/campaign-events/media", ownerRole: "operator", humanGate: "none", dependsOn: ["s2"] },
    ],
  },
  "activate-weak-county": {
    id: "activate-weak-county",
    title: "Activate weak county",
    purpose: "Gap analysis → volunteer recruitment → Power of 5 → event proposal → comms package",
    readinessScore: 0,
    blockers: [],
    steps: [
      { id: "s1", title: "County gap analysis", domainId: "county", route: "/admin/county-intelligence", ownerRole: "county_lead", humanGate: "none" },
      { id: "s2", title: "Volunteer recruitment segment", domainId: "volunteer", route: "/admin/volunteers", ownerRole: "volunteer_coordinator", humanGate: "review", dependsOn: ["s1"] },
      { id: "s3", title: "Power of 5 outreach plan", domainId: "county", route: "/admin/county-intelligence", ownerRole: "field_manager", humanGate: "review", dependsOn: ["s1"] },
      { id: "s4", title: "Event proposal", domainId: "event_planning", route: "/admin/campaign-events/workbench", ownerRole: "campaign_manager", humanGate: "review", dependsOn: ["s3"] },
      { id: "s5", title: "Communications package", domainId: "communications", route: "/admin/communications/studio", ownerRole: "communications_lead", humanGate: "review", dependsOn: ["s4"] },
    ],
  },
  "run-house-party-program": {
    id: "run-house-party-program",
    title: "Run house party program",
    purpose: "Host onboarding → invite list → volunteer staffing → candidate briefing → post-event follow-up",
    readinessScore: 0,
    blockers: [],
    steps: [
      { id: "s1", title: "Host onboarding", domainId: "host", route: "/admin/campaign-events/workbench", ownerRole: "field_manager", humanGate: "review" },
      { id: "s2", title: "Invite list review", domainId: "communications", route: "/admin/communications", ownerRole: "communications_lead", humanGate: "review", dependsOn: ["s1"] },
      { id: "s3", title: "Volunteer staffing", domainId: "volunteer", route: "/admin/volunteers", ownerRole: "volunteer_coordinator", humanGate: "review", dependsOn: ["s1"] },
      { id: "s4", title: "Candidate briefing", domainId: "candidate", route: "/admin/ai-command-center/copilots", ownerRole: "candidate", humanGate: "none", dependsOn: ["s1"] },
      { id: "s5", title: "Post-event follow-up drafts", domainId: "communications", route: "/admin/communications/intelligence", ownerRole: "communications_lead", humanGate: "review", dependsOn: ["s1"] },
    ],
  },
  "launch-volunteer-push": {
    id: "launch-volunteer-push",
    title: "Launch volunteer push",
    purpose: "Segments → email drafts → training → county targeting → assignment queue",
    readinessScore: 0,
    blockers: [],
    steps: [
      { id: "s1", title: "Volunteer segments", domainId: "volunteer", route: "/admin/volunteers", ownerRole: "volunteer_coordinator", humanGate: "none" },
      { id: "s2", title: "Email drafts (ECC)", domainId: "communications", route: "/admin/workbench/email-command-center", ownerRole: "communications_lead", humanGate: "review", dependsOn: ["s1"] },
      { id: "s3", title: "Training modules assigned", domainId: "training", route: "/admin/training", ownerRole: "volunteer_coordinator", humanGate: "none", dependsOn: ["s1"] },
      { id: "s4", title: "County gap targeting", domainId: "county", route: "/admin/county-intelligence", ownerRole: "field_manager", humanGate: "none", dependsOn: ["s1"] },
      { id: "s5", title: "Assignment queue", domainId: "volunteer", route: "/admin/volunteers", ownerRole: "volunteer_coordinator", humanGate: "review", dependsOn: ["s4"] },
    ],
  },
  "campaign-manager-daily": {
    id: "campaign-manager-daily",
    title: "Campaign manager daily plan",
    purpose: "OS health → blockers → top 3 moves → delegation → risk warnings",
    readinessScore: 0,
    blockers: [],
    steps: [
      { id: "s1", title: "OS health snapshot", domainId: "campaign_management", route: "/admin/ai-command-center", ownerRole: "campaign_manager", humanGate: "none" },
      { id: "s2", title: "Clear P0 blockers", domainId: "campaign_management", route: "/admin/ai-command-center", ownerRole: "campaign_manager", humanGate: "review", dependsOn: ["s1"] },
      { id: "s3", title: "Top 3 moves + delegation", domainId: "campaign_management", route: "/admin/ai-command-center/copilots", ownerRole: "campaign_manager", humanGate: "none", dependsOn: ["s2"] },
      { id: "s4", title: "Risk warnings review", domainId: "compliance", route: "/admin/compliance", ownerRole: "campaign_manager", humanGate: "none", dependsOn: ["s1"] },
    ],
  },
};

export function buildOrchestrationWorkflowPlans(
  diagnosis: OrchestrationDiagnosis,
): OrchestrationWorkflowPlan[] {
  return diagnosis.workflowRecommendations
    .map((id) => ORCHESTRATION_WORKFLOW_TEMPLATES[id])
    .filter((p): p is OrchestrationWorkflowPlan => Boolean(p));
}

export function scoreWorkflowReadiness(plan: OrchestrationWorkflowPlan, openBlockerCount: number): OrchestrationWorkflowPlan {
  const penalty = Math.min(40, openBlockerCount * 8);
  return {
    ...plan,
    readinessScore: Math.max(0, 100 - penalty),
    blockers: openBlockerCount > 0 ? [`${openBlockerCount} active campaign blocker(s)`] : [],
  };
}
