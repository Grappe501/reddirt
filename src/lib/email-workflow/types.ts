import type {
  EmailWorkflowEscalationLevel,
  EmailWorkflowPriority,
  EmailWorkflowSourceType,
  EmailWorkflowSpamDisposition,
  EmailWorkflowStatus,
} from "@prisma/client";

export type EmailWorkflowListFilters = {
  status?: EmailWorkflowStatus | EmailWorkflowStatus[];
  priority?: EmailWorkflowPriority;
  sourceType?: EmailWorkflowSourceType;
  assignedToUserId?: string | null;
  escalationLevel?: EmailWorkflowEscalationLevel;
  spamDisposition?: EmailWorkflowSpamDisposition;
};
