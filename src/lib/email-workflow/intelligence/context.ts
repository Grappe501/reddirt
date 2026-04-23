import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { clampMessageBodyPreview } from "./preview-helpers";

const planSelect = { id: true, title: true, objective: true, status: true } as const;
const sendSelect = { id: true, status: true, channel: true, scheduledAt: true, sentAt: true, createdAt: true } as const;
const userSelect = { id: true, name: true, email: true } as const;
const volSelect = { id: true, userId: true, availability: true, skills: true, leadershipInterest: true } as const;
const threadSelect = {
  id: true,
  primaryEmail: true,
  primaryPhone: true,
  lastMessageAt: true,
  lastInboundAt: true,
  aiThreadSummary: true,
  aiNextBestAction: true,
  threadStatus: true,
} as const;
const messageSelect = {
  id: true,
  subject: true,
  direction: true,
  channel: true,
  createdAt: true,
  bodyText: true,
} as const;
const intakeSelect = { id: true, title: true, status: true, source: true, createdAt: true, metadata: true } as const;
const taskSelect = {
  id: true,
  title: true,
  description: true,
  status: true,
  priority: true,
  taskType: true,
  dueAt: true,
} as const;
const oppSelect = {
  id: true,
  title: true,
  summary: true,
  status: true,
  urgency: true,
  suggestedTone: true,
  actionTemplate: true,
} as const;
const socialSelect = {
  id: true,
  title: true,
  kind: true,
  status: true,
  messageToneMode: true,
  messageTacticMode: true,
} as const;
const segSelect = { id: true, name: true } as const;

const include = {
  user: { select: userSelect },
  volunteerProfile: { select: volSelect },
  plan: { select: planSelect },
  send: { select: sendSelect },
  thread: { select: threadSelect },
  communicationMessage: { select: messageSelect },
  workflowIntake: { select: intakeSelect },
  campaignTask: { select: taskSelect },
  conversationOpportunity: { select: oppSelect },
  socialContentItem: { select: socialSelect },
  comsPlanAudienceSegment: { select: segSelect },
} satisfies Prisma.EmailWorkflowItemInclude;

/**
 * Interpretation context loader: one `findUnique` with bounded `select` branches.
 * - Does **not** load `thread.messages` (N+1 / heavy history).
 * - Linked `bodyText` is read as stored in DB; preview uses {@link clampMessageBodyPreview} only in-memory.
 * TODO(E-2+): if megabyte bodies show up, add a `findUnique` follow-up with `$queryRaw` substring select for `communicationMessageId` only.
 */
export type MessagePreview = {
  id: string;
  subject: string | null;
  direction: import("@prisma/client").MessageDirection;
  channel: import("@prisma/client").CommunicationChannel;
  createdAt: Date;
  bodyTextPreview: string | null;
};

/** Full snapshot for the interpretation pipeline (safe fields only). */
export type EmailWorkflowInterpretationContext = Omit<
  Prisma.EmailWorkflowItemGetPayload<{ include: typeof include }>,
  "communicationMessage"
> & { communicationMessage: MessagePreview | null };

/**
 * Load the queue item and linked records needed for E-2A interpretation.
 * Avoids loading thread message lists; message body is truncated to a preview only.
 */
export async function loadEmailWorkflowInterpretationContext(
  id: string
): Promise<EmailWorkflowInterpretationContext | null> {
  const row = await prisma.emailWorkflowItem.findUnique({
    where: { id },
    include,
  });
  if (!row) return null;

  let comm: MessagePreview | null = null;
  if (row.communicationMessage) {
    const m = row.communicationMessage;
    const bodyTextPreview = clampMessageBodyPreview(m.bodyText);
    comm = {
      id: m.id,
      subject: m.subject,
      direction: m.direction,
      channel: m.channel,
      createdAt: m.createdAt,
      bodyTextPreview,
    };
  }

  return {
    ...row,
    communicationMessage: comm,
  };
}
