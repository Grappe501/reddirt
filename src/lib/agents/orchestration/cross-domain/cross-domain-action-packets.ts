import type { CampaignState } from "../campaign-state-types";
import type { AgentToolingState, PreparedAgentAction } from "../tooling/agent-tooling-types";
import { PROHIBITED_EXECUTION_TYPES } from "../tooling/agent-tool-safety";
import type { CrossDomainActionPacket, CrossDomainPlaybook, SectionToolDiagnosis } from "./cross-domain-orchestrator-types";

function preparedActionFromPlaybook(playbook: CrossDomainPlaybook, focus: SectionToolDiagnosis | null, now: string): PreparedAgentAction {
  return {
    id: `cross-domain-action:${playbook.id}`.slice(0, 120),
    title: `Review packet: ${playbook.title}`,
    description: playbook.summary,
    actionType: "cross_domain_review_packet",
    domain: playbook.domains[0] ?? "campaign_management",
    preparedByToolId: "cross-domain-agent-orchestrator",
    suggestedPayload: {
      playbookId: playbook.id,
      focusSection: focus?.sectionId ?? playbook.sections[0],
      outputs: playbook.outputs.join(", "),
    },
    humanApprovalRequired: true,
    approvalPrompt: `Review ${playbook.title}; confirm facts, owners, and safety gates before any downstream execution.`,
    restrictedExecution: true,
    canExecuteNow: false,
    safetyNotes: ["Preparation only", "No send/submit/export/calendar/finance execution"],
    dataSources: ["CampaignState", "agentTooling", "knowledge", "feedbackLoop"],
    teachesCampaignIfCompleted: playbook.expectedCampaignStateImprovement,
    createdAt: now,
  };
}

export function buildCrossDomainActionPackets(input: {
  state: CampaignState;
  playbooks: CrossDomainPlaybook[];
  recommendedSectionFocus: SectionToolDiagnosis | null;
  agentTooling: AgentToolingState;
}): CrossDomainActionPacket[] {
  const now = new Date().toISOString();
  return input.playbooks.slice(0, 6).map((playbook) => {
    const blockedBy = [
      ...input.state.activeBlockers.filter((b) => playbook.domains.includes(b.domainId)).map((b) => b.message),
      ...playbook.steps.flatMap((s) => (s.safety === "prohibited" ? [`Prohibited step: ${s.title}`] : [])),
    ].slice(0, 5);
    return {
      id: `packet:${playbook.id}`.slice(0, 120),
      title: playbook.title.replace("Playbook", "Action Packet"),
      playbookId: playbook.id,
      sections: playbook.sections,
      summary: playbook.summary,
      recommendedOwner: playbook.sections.includes("finance_reimbursement")
        ? "treasurer"
        : playbook.sections.includes("communications")
          ? "communications_director"
          : input.recommendedSectionFocus?.sectionId === "county_intelligence"
            ? "field_manager"
            : "campaign_manager",
      whyNow: playbook.trigger,
      sourceEvidence: [
        input.state.executiveSummary,
        input.state.knowledge.unknownSummary,
        input.state.feedbackLoop.learningSummary,
        input.agentTooling.bestNextToolForCampaignState?.title ?? "No best tool selected",
      ],
      preparedActions: [preparedActionFromPlaybook(playbook, input.recommendedSectionFocus, now)],
      humanApprovalsRequired: playbook.humanReviewChecklist,
      blockedBy,
      risks: playbook.safetyNotes,
      expectedCampaignStateImprovement: playbook.expectedCampaignStateImprovement,
      expectedLessons: playbook.expectedLessons,
      doneWhen: `Human reviews packet, records outcome feedback, and approves any downstream section-specific work separately.`,
      safetySummary: {
        canExecuteNow: false,
        autoExecutionDisabled: true,
        restrictedActions: [...PROHIBITED_EXECUTION_TYPES],
        humanGateRequired: true,
      },
      createdAt: now,
    };
  });
}
