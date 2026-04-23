import type {
  CommsSendProvider,
  CommsWorkbenchChannel,
  CommunicationObjective,
  CommunicationPlanStatus,
  ConversationUrgency,
  MediaOutreachItemType,
  MediaOutreachStatus,
} from "@prisma/client";

/**
 * Filters for `listCommunicationPlans` (read/query layer; no Zod in this module).
 */
export type CommunicationPlanListFilters = {
  status?: CommunicationPlanStatus | CommunicationPlanStatus[];
  objective?: CommunicationObjective | CommunicationObjective[];
  ownerUserId?: string;
  requestedByUserId?: string;
  sourceWorkflowIntakeId?: string;
  sourceCampaignTaskId?: string;
  sourceEventId?: string;
  sourceSocialContentItemId?: string;
  /** Any draft on the plan, or any send, uses this channel. */
  channel?: CommsWorkbenchChannel;
  scheduledFrom?: Date;
  scheduledTo?: Date;
  /** Matches `title` or `summary` (Prisma `contains`, case-insensitive). */
  search?: string;
  /** If true, restrict to plans that likely need staff attention (heuristic; see query). */
  needsAction?: boolean;
};

/**
 * Filter + pagination for workbench list routes.
 */
export type CommunicationPlanListQuery = CommunicationPlanListFilters & {
  take?: number;
  skip?: number;
  /** "updatedAt" (default), "createdAt", or "scheduledAt" */
  orderByField?: "updatedAt" | "createdAt" | "scheduledAt";
  orderDirection?: "asc" | "desc";
};

/**
 * Filters for `listMediaOutreachItems`.
 */
export type MediaOutreachListFilters = {
  status?: MediaOutreachStatus | MediaOutreachStatus[];
  type?: MediaOutreachItemType | MediaOutreachItemType[];
  urgency?: ConversationUrgency | ConversationUrgency[];
  linkedCommunicationPlanId?: string;
  linkedWorkflowIntakeId?: string;
  /** Matches `title`, `contactName`, `outletName`, or `notes` when present. */
  search?: string;
};

export type MediaOutreachListQuery = MediaOutreachListFilters & {
  take?: number;
  skip?: number;
  orderByField?: "updatedAt" | "createdAt" | "status";
  orderDirection?: "asc" | "desc";
};

/** Filters for recent failed / execution activity lists (read-only, Packet 11A). */
export type CommsExecutionRecentSendsListQuery = {
  take?: number;
  /** Only sends updated on/after this time. */
  since?: Date;
  channel?: CommsWorkbenchChannel;
  /** When set, only rows whose parsed `outcomeSummaryJson` matches (small lists only). */
  provider?: CommsSendProvider;
};
