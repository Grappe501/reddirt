import type { CampaignState, PreparedOrchestrationAction } from "../campaign-state-types";
import type { AgentToolingState, PreparedAgentAction } from "../tooling/agent-tooling-types";
import type { CrossDomainActionPacket, CrossDomainPlaybook } from "./cross-domain-orchestrator-types";
import { CAMPAIGN_SECTION_MAP } from "./campaign-section-map";

function preparedFromStep(playbook: CrossDomainPlaybook, step: CrossDomainPlaybook["steps"][number], now: string): PreparedAgentAction {
  return {
    id: `packet:${playbook.id}:step:${step.order}`,
    title: step.title,
    description: step.purpose,
    actionType: "cross_domain_packet_step",
    domain: CAMPAIGN_SECTION_MAP.find((s) => s.id === step.sectionId)?.ownedDomains[0] ?? "campaign_management",
    preparedByToolId: step.toolId,
    suggestedPayload: {
      sectionId: step.sectionId,
      playbookId: playbook.id,
      expectedOutput: step.expectedOutput,
    },
    humanApprovalRequired: true,
    approvalPrompt: "Review this packet step before acting in the owning section.",
    restrictedExecution: true,
    canExecuteNow: false,
    safetyNotes: [`Safety: ${step.safety}`, "Execution disabled", "Human operates in linked section"],
    dataSources: ["crossDomainOrchestration", step.toolId],
    teachesCampaignIfCompleted: `Completion feedback teaches whether ${step.sectionId.replaceAll("_", " ")} improved the cross-domain campaign map.`,
    createdAt: now,
  };
}

function evidenceForPlaybook(playbook: CrossDomainPlaybook, state: CampaignState): string[] {
  const evidence = [playbook.trigger, state.observationSummary];
  if (state.knowledge.unknownSummary) evidence.push(state.knowledge.unknownSummary);
  if (state.feedbackLoop.learningSummary) evidence.push(state.feedbackLoop.learningSummary);
  return evidence.slice(0, 5);
}

function existingPreparedActions(tooling: AgentToolingState, playbook: CrossDomainPlaybook): PreparedAgentAction[] {
  const sectionDomains = CAMPAIGN_SECTION_MAP.filter((s) => playbook.sections.includes(s.id)).flatMap((s) => s.ownedDomains);
  return tooling.preparedActions.filter((a) => sectionDomains.includes(a.domain)).slice(0, 2);
}

function humanApprovals(playbook: CrossDomainPlaybook): string[] {
  const sectionApprovals = CAMPAIGN_SECTION_MAP.filter((s) => playbook.sections.includes(s.id)).flatMap((s) => s.restrictedActions);
  return [...new Set(["Campaign manager review", "Section owner review", ...sectionApprovals])];
}

export function buildCrossDomainActionPackets(
  state: CampaignState,
  tooling: AgentToolingState,
  playbooks: CrossDomainPlaybook[],
): CrossDomainActionPacket[] {
  const now = new Date().toISOString();
  return playbooks.slice(0, 6).map((playbook) => {
    const packetActions = [
      ...playbook.steps.slice(0, 4).map((s) => preparedFromStep(playbook, s, now)),
      ...existingPreparedActions(tooling, playbook),
    ].slice(0, 6);
    const restrictedActions = humanApprovals(playbook).filter((a) => a.includes("_") || a.includes("-"));
    const blockers = state.activeBlockers
      .filter((b) => CAMPAIGN_SECTION_MAP.some((s) => playbook.sections.includes(s.id) && s.ownedDomains.includes(b.domainId)))
      .map((b) => b.message)
      .slice(0, 4);
    const risks = [
      ...state.financeComplianceWarnings,
      ...(state.commsReadiness.massEmailBlocked ? ["Mass email remains blocked"] : []),
      ...(state.calendarEventPressure.syncStale ? ["Calendar sync stale"] : []),
    ].slice(0, 5);

    return {
      id: `packet:${playbook.id}`,
      title: playbook.outputPacketTitle,
      playbookId: playbook.id,
      sections: playbook.sections,
      summary: playbook.summary,
      recommendedOwner:
        CAMPAIGN_SECTION_MAP.find((s) => s.id === playbook.sections[0])?.humanOwners[0] ?? "campaign_manager",
      whyNow: playbook.trigger,
      sourceEvidence: evidenceForPlaybook(playbook, state),
      preparedActions: packetActions,
      humanApprovalsRequired: humanApprovals(playbook),
      blockedBy: blockers,
      risks,
      expectedCampaignStateImprovement: `Improves ${playbook.sections.map((s) => s.replaceAll("_", " ")).join(", ")} signals and feedback in CampaignState.`,
      expectedLessons: playbook.learningHookIds,
      doneWhen: `${playbook.outputPacketTitle} is reviewed, acted on by humans, and outcome feedback is recorded.`,
      safetySummary: {
        autoExecutionDisabled: true,
        canExecuteNow: false,
        restrictedActions,
      },
      createdAt: now,
    };
  });
}

export function packetToPreparedOrchestrationAction(packet: CrossDomainActionPacket): PreparedOrchestrationAction {
  return {
    id: packet.id,
    title: packet.title,
    why: packet.whyNow,
    routes: packet.sections.flatMap((sectionId) => CAMPAIGN_SECTION_MAP.find((s) => s.id === sectionId)?.routePaths ?? []).slice(0, 4),
    checklist: [
      ...packet.humanApprovalsRequired.slice(0, 3).map((a) => `Review: ${a}`),
      ...packet.preparedActions.slice(0, 3).map((a) => a.title),
    ],
    humanGate: "review",
  };
}
