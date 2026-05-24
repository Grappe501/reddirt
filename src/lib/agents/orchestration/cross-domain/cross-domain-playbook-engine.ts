import type { CampaignState } from "../campaign-state-types";
import type { AgentToolingState } from "../tooling/agent-tooling-types";
import type { CrossDomainPlaybook, CrossDomainPlaybookStep } from "./cross-domain-orchestrator-types";
import { buildLearningHooksForPlaybook } from "./cross-domain-learning-hooks";

function step(
  order: number,
  sectionId: CrossDomainPlaybookStep["sectionId"],
  toolId: string,
  title: string,
  purpose: string,
  safety: CrossDomainPlaybookStep["safety"] = "safe_prepare",
  humanGateRequired = true,
): CrossDomainPlaybookStep {
  return {
    order,
    sectionId,
    toolId,
    title,
    purpose,
    safety,
    humanGateRequired,
    expectedOutput: `${title} reviewed by human before action.`,
  };
}

function playbook(input: Omit<CrossDomainPlaybook, "humanGateRequired" | "learningHookIds">): CrossDomainPlaybook {
  const hooks = buildLearningHooksForPlaybook({ id: input.id, sections: input.sections });
  return {
    ...input,
    humanGateRequired: true,
    learningHookIds: hooks.map((h) => h.id),
  };
}

export function buildCrossDomainPlaybooks(state: CampaignState, tooling: AgentToolingState): CrossDomainPlaybook[] {
  const safety = ["Preparation only", "No send/submit/export/calendar/finance execution", "Human review required"];
  const countyWeak = state.weakDomains.includes("county") || state.countyIntelligenceSummary.weakCountyCount > 0;
  const commsBlocked = state.commsReadiness.massEmailBlocked || !state.emailEccReadiness.sendEnabled;
  const eventPressure = state.calendarEventPressure.pendingApprovals > 0 || state.eventReadiness.score < 75;
  const financeRisk = state.financeComplianceWarnings.length > 0 || state.reimbursementReadiness.score < 80 || state.complianceReadiness.score < 80;
  const deploymentRisk = state.signalLoadErrors.length > 0 || tooling.safetySummary.prohibitedCount > 0;

  return [
    playbook({
      id: "county-activation",
      title: "County Activation Playbook",
      summary: "Prepare county activation by connecting county intelligence, events, volunteer field, comms, content, and lessons.",
      sections: ["county_intelligence", "events_calendar", "volunteer_field", "communications", "content_media", "memory_observations"],
      trigger: countyWeak ? "County section weak or blocked" : "County momentum review",
      steps: [
        step(1, "county_intelligence", "field-priority-orchestrator", "Inspect county priority gaps", "Find weak counties and local context.", "safe_read", false),
        step(2, "events_calendar", "county-to-event-calendar-router", "Prepare county event options", "Create tentative event prep, not calendar writes."),
        step(3, "volunteer_field", "volunteer-workload-balancer", "Prepare volunteer field needs", "Identify staffing and follow-up needs."),
        step(4, "communications", "communications-priority-orchestrator", "Prepare local comms checklist", "Draft-only message/audience review."),
        step(5, "memory_observations", "hotwash-to-county-strategy-router", "Prepare lesson prompt", "Capture follow-up learning with approval."),
      ],
      outputPacketTitle: "County activation packet",
      expectedOutcome: "Human-reviewed county action packet with comms, event, volunteer, and lesson prompts.",
      safetyNotes: safety,
    }),
    playbook({
      id: "comms-to-field-mobilization",
      title: "Comms-to-Field Mobilization Playbook",
      summary: "Connect comms readiness, Email OS/ECC, volunteer field, events, knowledge, and safety gates.",
      sections: ["communications", "email_os_ecc", "volunteer_field", "events_calendar", "memory_observations"],
      trigger: commsBlocked ? "Comms or ECC readiness blocked" : "Volunteer/event mobilization needs narrative support",
      steps: [
        step(1, "communications", "communications-priority-orchestrator", "Inspect comms readiness", "Check fatigue, follow-up, and draft backlog.", "safe_read", false),
        step(2, "email_os_ecc", "orchestration-autonomy-boundary-checker", "Confirm send gates", "Verify no email execution is possible."),
        step(3, "volunteer_field", "communications-to-volunteer-retention-router", "Prepare volunteer follow-up", "Draft volunteer follow-up instructions."),
        step(4, "events_calendar", "event-county-volunteer-planner", "Prepare event CTA context", "Connect event CTA to field needs."),
        step(5, "memory_observations", "orchestration-memory-candidate-builder", "Prepare lesson capture", "Ask what message improved activation."),
      ],
      outputPacketTitle: "Comms-to-field mobilization packet",
      expectedOutcome: "Audience/message prep and human approval checklist for mobilization.",
      safetyNotes: safety,
    }),
    playbook({
      id: "event-intelligence",
      title: "Event Intelligence Playbook",
      summary: "Prepare pre-event intelligence and post-event hot wash learning across event, county, comms, media, and memory.",
      sections: ["events_calendar", "county_intelligence", "communications", "content_media", "memory_observations"],
      trigger: eventPressure ? "Event readiness pressure" : "Upcoming event intelligence review",
      steps: [
        step(1, "events_calendar", "event-county-volunteer-planner", "Build pre-event packet", "Gather event readiness and dependencies.", "safe_read", false),
        step(2, "county_intelligence", "field-priority-orchestrator", "Add county context", "Attach local priorities and gaps."),
        step(3, "communications", "communications-priority-orchestrator", "Prepare event comms", "Draft-only event message checklist."),
        step(4, "content_media", "hotwash-to-county-strategy-router", "Prepare recap/hot wash prompt", "Capture media and county learning after event."),
      ],
      outputPacketTitle: "Event intelligence packet",
      expectedOutcome: "Pre-event packet plus hot wash and lesson capture plan.",
      safetyNotes: safety,
    }),
    playbook({
      id: "campaign-manager-daily-command",
      title: "Campaign Manager Daily Command Playbook",
      summary: "Combine CampaignState, blockers, risks, workflows, agent tooling, feedback, and knowledge gaps into a daily command packet.",
      sections: ["executive_command", "tool_builder", "memory_observations", "deployment_readiness"],
      trigger: "Campaign manager daily operating rhythm",
      steps: [
        step(1, "executive_command", "campaign-state-loader", "Refresh CampaignState", "Start from live state.", "safe_read", false),
        step(2, "executive_command", "orchestration-reasoning-engine", "Rank blockers and opportunities", "Identify top moves.", "safe_read", false),
        step(3, "tool_builder", "campaign-tool-gap-orchestrator", "Inspect missing tools", "Route friction to build queue review."),
        step(4, "memory_observations", "orchestration-observation-miner", "Review feedback and knowledge gaps", "Lower confidence where feedback is thin."),
      ],
      outputPacketTitle: "Campaign manager daily command packet",
      expectedOutcome: "Daily priorities, tool recommendations, review packets, blockers, and follow-up checklist.",
      safetyNotes: safety,
    }),
    playbook({
      id: "compliance-safe-operations",
      title: "Compliance-Safe Operations Playbook",
      summary: "Prepare finance, reimbursement, compliance, and scheduling review without posting or submitting.",
      sections: ["finance_reimbursement", "compliance", "scheduling", "executive_command"],
      trigger: financeRisk ? "Finance/reimbursement/compliance warning" : "Compliance-safe operations review",
      steps: [
        step(1, "finance_reimbursement", "campaign-risk-detector", "Inspect finance warnings", "Find docs and reimbursement risks.", "safe_read", false),
        step(2, "compliance", "finance-event-compliance-fusion-engine", "Prepare compliance checklist", "Tie finance artifacts to filing readiness."),
        step(3, "scheduling", "workflow-readiness-checker", "Check timing dependencies", "Identify schedule pressure before approvals."),
        step(4, "executive_command", "orchestration-human-gate-enforcer", "Confirm human-only approvals", "Block post/submit/export actions."),
      ],
      outputPacketTitle: "Compliance-safe operations packet",
      expectedOutcome: "Review checklist, blocked actions, required documentation, and human-only approvals.",
      safetyNotes: [...safety, "No finance_post", "No reimbursement_submit"],
    }),
    playbook({
      id: "deployment-readiness",
      title: "Deployment Readiness Playbook",
      summary: "Prepare release readiness from tests, typecheck, build, migrations, route health, docs, and handoff status.",
      sections: ["deployment_readiness", "tool_builder", "public_site", "executive_command"],
      trigger: deploymentRisk ? "Degraded source/build/tool safety signal" : "Before Netlify or public/admin release",
      steps: [
        step(1, "deployment_readiness", "orchestration-sprint-recommender", "Review verification gates", "Confirm tests, typecheck, build, migrations, docs."),
        step(2, "tool_builder", "campaign-tool-gap-orchestrator", "Review unresolved tool blockers", "Identify build tickets before release."),
        step(3, "public_site", "campaign-risk-detector", "Check public/admin safety", "Confirm no unsafe route or content risks."),
        step(4, "executive_command", "orchestration-autonomy-boundary-checker", "Confirm no forbidden automation", "Keep execution disabled."),
      ],
      outputPacketTitle: "Deployment readiness packet",
      expectedOutcome: "Readiness packet with unresolved blockers and Netlify readiness status.",
      safetyNotes: [...safety, "No production mutation"],
    }),
  ];
}
