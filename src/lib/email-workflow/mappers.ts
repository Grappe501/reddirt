import { mapCommunicationUserSummary } from "../comms-workbench/mappers";
import type { EmailWorkflowItemDetail, EmailWorkflowListItem } from "./dto";

type ListRow = {
  id: string;
  status: import("@prisma/client").EmailWorkflowStatus;
  priority: import("@prisma/client").EmailWorkflowPriority;
  sourceType: import("@prisma/client").EmailWorkflowSourceType;
  triggerType: import("@prisma/client").EmailWorkflowTriggerType;
  title: string | null;
  queueReason: string | null;
  whoSummary: string | null;
  whatSummary: string | null;
  whenSummary: string | null;
  whereSummary: string | null;
  whySummary: string | null;
  impactSummary: string | null;
  recommendedResponseSummary: string | null;
  tone: import("@prisma/client").EmailWorkflowTone;
  intent: import("@prisma/client").EmailWorkflowIntent;
  escalationLevel: import("@prisma/client").EmailWorkflowEscalationLevel;
  spamDisposition: import("@prisma/client").EmailWorkflowSpamDisposition;
  needsDeescalation: boolean;
  occurredAt: Date | null;
  sentiment: string | null;
  communicationPlanId: string | null;
  communicationThreadId: string | null;
  communicationSendId: string | null;
  workflowIntakeId: string | null;
  campaignTaskId: string | null;
  createdAt: Date;
  updatedAt: Date;
  assignedToUser: { id: string; name: string | null; email: string } | null;
  createdBy: { id: string; name: string | null; email: string } | null;
  plan: { id: string; title: string } | null;
  thread: { id: string; primaryEmail: string | null; primaryPhone: string | null } | null;
};

export function mapEmailWorkflowListItem(r: ListRow): EmailWorkflowListItem {
  const planTitle = r.plan?.title ?? null;
  const threadHint = r.thread
    ? [r.thread.primaryEmail, r.thread.primaryPhone].filter(Boolean).join(" · ") || r.thread.id.slice(0, 8)
    : null;
  return {
    id: r.id,
    status: r.status,
    priority: r.priority,
    sourceType: r.sourceType,
    triggerType: r.triggerType,
    title: r.title,
    queueReason: r.queueReason,
    whoSummary: r.whoSummary,
    whatSummary: r.whatSummary,
    whenSummary: r.whenSummary,
    whereSummary: r.whereSummary,
    whySummary: r.whySummary,
    impactSummary: r.impactSummary,
    recommendedResponseSummary: r.recommendedResponseSummary,
    tone: r.tone,
    intent: r.intent,
    escalationLevel: r.escalationLevel,
    spamDisposition: r.spamDisposition,
    needsDeescalation: r.needsDeescalation,
    occurredAt: r.occurredAt?.toISOString() ?? null,
    sentiment: r.sentiment,
    assignedTo: mapCommunicationUserSummary(r.assignedToUser),
    createdBy: mapCommunicationUserSummary(r.createdBy),
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
    linkHints: {
      communicationPlanId: r.communicationPlanId,
      planTitle,
      communicationThreadId: r.communicationThreadId,
      threadHint,
      communicationSendId: r.communicationSendId,
      workflowIntakeId: r.workflowIntakeId,
      campaignTaskId: r.campaignTaskId,
    },
  };
}

type DetailRow = ListRow & {
  recommendedResponseRationale: string | null;
  spamScore: number | null;
  reviewedAt: Date | null;
  userId: string | null;
  user: { id: string; name: string | null; email: string } | null;
  volunteerProfileId: string | null;
  metadataJson: unknown;
  reviewedBy: { id: string; name: string | null; email: string } | null;
  send: { id: string; status: import("@prisma/client").CommunicationSendStatus; channel: import("@prisma/client").CommsWorkbenchChannel } | null;
  workflowIntake: { id: string; title: string | null; status: import("@prisma/client").WorkflowIntakeStatus } | null;
  campaignTask: { id: string; title: string; status: import("@prisma/client").CampaignTaskStatus } | null;
  conversationOpportunity: { id: string; title: string; status: import("@prisma/client").ConversationOpportunityStatus } | null;
  socialContentItem: { id: string; title: string | null } | null;
  comsPlanAudienceSegment: { id: string; name: string } | null;
  communicationMessage: { id: string; createdAt: Date; direction: import("@prisma/client").MessageDirection } | null;
};

export function mapEmailWorkflowItemDetail(r: DetailRow): EmailWorkflowItemDetail {
  const list = mapEmailWorkflowListItem(r);
  const u = r.user;
  return {
    ...list,
    recommendedResponseRationale: r.recommendedResponseRationale,
    spamScore: r.spamScore,
    reviewedBy: mapCommunicationUserSummary(r.reviewedBy),
    reviewedAt: r.reviewedAt?.toISOString() ?? null,
    metadataJson: r.metadataJson,
    linkDetail: {
      userId: r.userId,
      userLabel: u ? (u.name?.trim() || u.email) : null,
      volunteerProfileId: r.volunteerProfileId,
      communicationPlan: r.plan ? { id: r.plan.id, title: r.plan.title } : null,
      communicationSend: r.send
        ? { id: r.send.id, status: r.send.status, channel: r.send.channel }
        : null,
      thread: r.thread
        ? {
            id: r.thread.id,
            primaryEmail: r.thread.primaryEmail,
            primaryPhone: r.thread.primaryPhone,
          }
        : null,
      workflowIntake: r.workflowIntake
        ? { id: r.workflowIntake.id, title: r.workflowIntake.title, status: r.workflowIntake.status }
        : null,
      campaignTask: r.campaignTask
        ? { id: r.campaignTask.id, title: r.campaignTask.title, status: r.campaignTask.status }
        : null,
      conversationOpportunity: r.conversationOpportunity
        ? {
            id: r.conversationOpportunity.id,
            title: r.conversationOpportunity.title,
            status: r.conversationOpportunity.status,
          }
        : null,
      socialContentItem: r.socialContentItem
        ? { id: r.socialContentItem.id, title: r.socialContentItem.title }
        : null,
      comsPlanAudienceSegment: r.comsPlanAudienceSegment
        ? { id: r.comsPlanAudienceSegment.id, name: r.comsPlanAudienceSegment.name }
        : null,
      communicationMessage: r.communicationMessage
        ? {
            id: r.communicationMessage.id,
            createdAt: r.communicationMessage.createdAt.toISOString(),
            direction: r.communicationMessage.direction,
          }
        : null,
    },
  };
}
