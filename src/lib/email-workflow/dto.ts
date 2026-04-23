import type {
  EmailWorkflowEscalationLevel,
  EmailWorkflowIntent,
  EmailWorkflowPriority,
  EmailWorkflowSourceType,
  EmailWorkflowSpamDisposition,
  EmailWorkflowStatus,
  EmailWorkflowTone,
  EmailWorkflowTriggerType,
} from "@prisma/client";
import type { CommunicationUserSummary } from "../comms-workbench/dto";

/** Compact row for triage (operator-first; no raw message bodies). */
export type EmailWorkflowListItem = {
  id: string;
  status: EmailWorkflowStatus;
  priority: EmailWorkflowPriority;
  sourceType: EmailWorkflowSourceType;
  triggerType: EmailWorkflowTriggerType;
  title: string | null;
  queueReason: string | null;
  whoSummary: string | null;
  whatSummary: string | null;
  whenSummary: string | null;
  whereSummary: string | null;
  whySummary: string | null;
  impactSummary: string | null;
  recommendedResponseSummary: string | null;
  tone: EmailWorkflowTone;
  intent: EmailWorkflowIntent;
  escalationLevel: EmailWorkflowEscalationLevel;
  spamDisposition: EmailWorkflowSpamDisposition;
  needsDeescalation: boolean;
  occurredAt: string | null;
  sentiment: string | null;
  assignedTo: CommunicationUserSummary | null;
  createdBy: CommunicationUserSummary | null;
  createdAt: string;
  updatedAt: string;
  /** Denormalized link hints for the table (no N+1 in list). */
  linkHints: {
    communicationPlanId: string | null;
    planTitle: string | null;
    communicationThreadId: string | null;
    threadHint: string | null;
    communicationSendId: string | null;
    workflowIntakeId: string | null;
    campaignTaskId: string | null;
  };
};

export type EmailWorkflowItemDetail = EmailWorkflowListItem & {
  recommendedResponseRationale: string | null;
  spamScore: number | null;
  reviewedBy: CommunicationUserSummary | null;
  reviewedAt: string | null;
  metadataJson: unknown;
  linkDetail: {
    userId: string | null;
    userLabel: string | null;
    volunteerProfileId: string | null;
    communicationPlan: { id: string; title: string } | null;
    communicationSend: { id: string; status: string; channel: string } | null;
    thread: { id: string; primaryEmail: string | null; primaryPhone: string | null } | null;
    workflowIntake: { id: string; title: string | null; status: string } | null;
    campaignTask: { id: string; title: string; status: string } | null;
    conversationOpportunity: { id: string; title: string; status: string } | null;
    socialContentItem: { id: string; title: string | null } | null;
    comsPlanAudienceSegment: { id: string; name: string } | null;
    communicationMessage: { id: string; createdAt: string; direction: string } | null;
  };
};
