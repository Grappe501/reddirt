import type { CampaignState } from "../campaign-state-types";
import type { AgentToolingState } from "../tooling/agent-tooling-types";
import type { CrossDomainPlaybook, CrossDomainPlaybookStep } from "./cross-domain-orchestrator-types";
import { defaultLearningHooksForPlaybook } from "./cross-domain-learning-hooks";

function step(
  order: number,
  sectionId: CrossDomainPlaybookStep["sectionId"],
  title: string,
  toolIds: string[],
  output: string,
  safety: CrossDomainPlaybookStep["safety"] = "safe_prepare",
): CrossDomainPlaybookStep {
  return {
    order,
    sectionId,
    toolIds,
    title,
    purpose: `Use ${sectionId.replaceAll("_", " ")} tools to prepare ${output}.`,
    output,
    safety,
    humanGateRequired: safety !== "safe_read",
  };
}

function playbook(input: Omit<CrossDomainPlaybook, "learningHooks">): CrossDomainPlaybook {
  return {
    ...input,
    learningHooks: defaultLearningHooksForPlaybook(input.id, input.sections),
  };
}

export function buildCrossDomainPlaybooks(state: CampaignState, tooling: AgentToolingState): CrossDomainPlaybook[] {
  const bestTool = tooling.bestNextToolForCampaignState?.toolId ?? "campaign-state-loader";
  return [
    playbook({
      id: "county-activation-playbook",
      title: "County Activation Playbook",
      summary: "Prepare a county action packet that coordinates field, events, volunteer, comms, content, and feedback learning.",
      trigger: state.countyHealth.band !== "strong" ? "County posture weak or stale." : "County activation opportunity detected.",
      sections: ["county_intelligence", "events_calendar", "volunteer_field", "communications", "content_media", "memory_observations"],
      domains: ["county", "event_planning", "volunteer", "communications", "social_media", "memory"],
      steps: [
        step(1, "county_intelligence", "Inspect county posture", ["county-intelligence-bridge", bestTool], "county activation packet", "safe_read"),
        step(2, "events_calendar", "Prepare local event context", ["event-readiness-builder"], "event prep checklist"),
        step(3, "volunteer_field", "Prepare volunteer follow-up", ["volunteer-system"], "volunteer task prep"),
        step(4, "communications", "Prepare comms/email context", ["communications-intelligence-engine", "email-os-readiness-checker"], "comms prep"),
        step(5, "memory_observations", "Create follow-up lesson prompt", ["feedback-learning-engine"], "lesson prompt"),
      ],
      outputs: ["county activation packet", "comms prep", "event prep", "volunteer task prep", "follow-up lesson prompt"],
      humanReviewChecklist: ["Verify county facts", "Approve any contact/outreach list manually", "Confirm event and volunteer owners"],
      safetyNotes: ["Preparation only", "No voter/contact export", "No email/SMS send"],
      expectedCampaignStateImprovement: "Improves county, field, event, comms, and memory slices with one coordinated packet.",
      expectedLessons: ["county_learning", "workflow_learning"],
    }),
    playbook({
      id: "comms-to-field-mobilization-playbook",
      title: "Comms-to-Field Mobilization Playbook",
      summary: "Prepare audience, message, volunteer follow-up, and event CTA packets with ECC gates intact.",
      trigger: state.communicationsHealth.band !== "strong" || state.commsReadiness.volunteerAtRisk > 0 ? "Comms or volunteer activation needs attention." : "Mobilization opportunity.",
      sections: ["communications", "email_os_ecc", "volunteer_field", "events_calendar", "memory_observations"],
      domains: ["communications", "volunteer", "event_planning", "memory"],
      steps: [
        step(1, "communications", "Inspect comms readiness", ["communications-intelligence-engine"], "audience/message prep", "safe_read"),
        step(2, "email_os_ecc", "Prepare ECC approval packet", ["email-os-readiness-checker"], "human approval checklist"),
        step(3, "volunteer_field", "Prepare follow-up instructions", ["volunteer-system"], "volunteer follow-up prep"),
        step(4, "events_calendar", "Attach event CTA context", ["event-readiness-builder"], "event CTA prep"),
        step(5, "memory_observations", "Capture result prompt", ["campaign-observation-intake"], "learning prompt"),
      ],
      outputs: ["audience/message prep", "volunteer follow-up prep", "event CTA prep", "human approval checklist"],
      humanReviewChecklist: ["Approve message", "Confirm no send action", "Verify recipient/audience rules manually"],
      safetyNotes: ["Mass send remains blocked", "Human approval required before outreach"],
      expectedCampaignStateImprovement: "Connects comms readiness to field mobilization and event attendance signals.",
      expectedLessons: ["message_learning", "volunteer_learning"],
    }),
    playbook({
      id: "event-intelligence-playbook",
      title: "Event Intelligence Playbook",
      summary: "Prepare event intelligence before the event and capture hot wash learning afterward.",
      trigger: state.eventReadiness.score < 75 || state.calendarEventPressure.pendingApprovals > 0 ? "Event readiness pressure detected." : "Event learning opportunity.",
      sections: ["events_calendar", "county_intelligence", "communications", "content_media", "memory_observations"],
      domains: ["event_planning", "calendar", "county", "communications", "hot_wash"],
      steps: [
        step(1, "events_calendar", "Prepare event packet", ["event-readiness-builder", "calendar-sync-health"], "pre-event intelligence packet"),
        step(2, "county_intelligence", "Attach county context", ["county-intelligence-bridge"], "county context"),
        step(3, "communications", "Prepare comms follow-up", ["communications-intelligence-engine"], "comms follow-up plan"),
        step(4, "content_media", "Prepare recap capture", ["content-recap-builder"], "media/content capture plan"),
        step(5, "memory_observations", "Prepare hot wash prompt", ["hot-wash-intelligence"], "lesson capture plan"),
      ],
      outputs: ["pre-event intelligence packet", "post-event hot wash prompt", "lesson capture plan"],
      humanReviewChecklist: ["Confirm event facts", "Approve calendar/public changes manually", "Assign hot wash owner"],
      safetyNotes: ["No Google Calendar write", "No public publish"],
      expectedCampaignStateImprovement: "Turns events into county, comms, media, and lesson signals.",
      expectedLessons: ["event_learning", "county_learning"],
    }),
    playbook({
      id: "campaign-manager-daily-command-playbook",
      title: "Campaign Manager Daily Command Playbook",
      summary: "Prepare daily top priorities, review packets, blocked decisions, and follow-up checklist.",
      trigger: "Daily campaign manager operating rhythm.",
      sections: ["executive_command", "tool_builder", "memory_observations", "deployment_readiness"],
      domains: ["campaign_management", "tool_builder", "memory", "dashboard_ux"],
      steps: [
        step(1, "executive_command", "Load CampaignState", ["campaign-state-loader"], "daily top priorities", "safe_read"),
        step(2, "tool_builder", "Review missing tools", ["tool-gap-detector"], "recommended tools"),
        step(3, "memory_observations", "Review feedback and lessons", ["feedback-learning-engine"], "review packets"),
        step(4, "deployment_readiness", "Check build/deploy posture", ["test-runner", "next-build"], "blocked decisions"),
      ],
      outputs: ["daily top priorities", "recommended tools", "review packets", "blocked decisions", "follow-up checklist"],
      humanReviewChecklist: ["Confirm top three priorities", "Choose packets for execution", "Approve memory changes manually"],
      safetyNotes: ["No production mutation", "Prepared actions only"],
      expectedCampaignStateImprovement: "Improves campaign management confidence by making blockers, feedback, and tool gaps visible together.",
      expectedLessons: ["workflow_learning", "tool_learning"],
    }),
    playbook({
      id: "compliance-safe-operations-playbook",
      title: "Compliance-Safe Operations Playbook",
      summary: "Prepare finance, reimbursement, compliance, and scheduling review without posting or submitting.",
      trigger: state.financeComplianceWarnings.length > 0 || state.reimbursementReadiness.score < 80 ? "Finance/compliance warning or reimbursement gap." : "Periodic compliance review.",
      sections: ["finance_reimbursement", "compliance", "scheduling", "executive_command"],
      domains: ["finance", "reimbursement", "compliance", "calendar"],
      steps: [
        step(1, "finance_reimbursement", "Inspect finance and reimbursement gaps", ["finance-event-fusion", "reimbursement-packet-builder"], "review checklist"),
        step(2, "compliance", "Attach compliance evidence needs", ["compliance-readiness-checker"], "required documentation"),
        step(3, "scheduling", "Check travel/calendar dependencies", ["calendar-sync-health", "travel-ledger-review"], "blocked actions"),
        step(4, "executive_command", "Prepare human-only approval queue", ["orchestration-human-gate-enforcer"], "human-only approvals"),
      ],
      outputs: ["review checklist", "blocked actions", "required documentation", "human-only approvals"],
      humanReviewChecklist: ["Treasurer review", "Compliance review", "No post/submit actions"],
      safetyNotes: ["No finance post", "No reimbursement submit", "No filing certification"],
      expectedCampaignStateImprovement: "Connects operational costs to compliance readiness and blocked decisions.",
      expectedLessons: ["finance_learning", "compliance_learning"],
    }),
    playbook({
      id: "deployment-readiness-playbook",
      title: "Deployment Readiness Playbook",
      summary: "Prepare a release readiness packet using tests, typecheck, build, migrations, docs, and route health.",
      trigger: "Before shipping public/admin changes.",
      sections: ["deployment_readiness", "public_site", "tool_builder", "executive_command"],
      domains: ["dashboard_ux", "tool_builder", "campaign_management"],
      steps: [
        step(1, "deployment_readiness", "Run verification gate", ["test-runner", "typecheck", "next-build", "prisma-migrate-status"], "deployment readiness packet", "safe_prepare"),
        step(2, "public_site", "Review public/admin route risk", ["public-route-health-check"], "route health"),
        step(3, "tool_builder", "List unresolved tool blockers", ["tool-builder-queue"], "unresolved blockers"),
        step(4, "executive_command", "Prepare handoff summary", ["orchestration-state-loader"], "Netlify readiness status"),
      ],
      outputs: ["deployment readiness packet", "unresolved blockers", "Netlify readiness status"],
      humanReviewChecklist: ["Verify tests", "Verify build", "Verify migration status", "Human approves deploy"],
      safetyNotes: ["No deploy command", "No production mutation"],
      expectedCampaignStateImprovement: "Tells the campaign whether the operator map is safe to ship.",
      expectedLessons: ["tool_learning", "workflow_learning"],
    }),
  ];
}
