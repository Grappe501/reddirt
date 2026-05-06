/**
 * EMAIL-MESSAGE-STUDIO-SERVER-DRAFTS-1.0 — server-side shared draft persistence (no sends, no providers).
 */

import { Prisma } from "@prisma/client";
import type { MessageStudioDraft, MessageStudioDraftStatus } from "@prisma/client";
import { prisma } from "@/lib/db";
import type { MessageStudioLocalDraft } from "@/components/admin/email-command-center/message-studio-local-drafts";
import { createEmptyDraft } from "@/components/admin/email-command-center/message-studio-local-drafts";
import { getDefaultCampaignVoiceSettings } from "@/lib/email-command-center/campaign-voice";
import {
  defaultEditorialClaimSourceChecklist,
  defaultEditorialComplianceChecklist,
  defaultEditorialVoiceAudienceChecklist,
} from "@/lib/email-command-center/message-studio-editorial-review-model";

const SECRET_KEY_PATTERN = /api[_-]?key|secret|password|token|authorization|bearer|private[_-]?key|openai_api_key|credential/i;

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

/** Strip nested values that look like credentials before JSON persistence. */
export function sanitizeJsonForPersistence(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map((x) => sanitizeJsonForPersistence(x));
  }
  if (isPlainObject(value)) {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) {
      if (SECRET_KEY_PATTERN.test(k)) continue;
      out[k] = sanitizeJsonForPersistence(v);
    }
    return out;
  }
  return value;
}

export type MessageStudioDraftListRow = {
  id: string;
  title: string;
  draftType: string;
  status: MessageStudioDraftStatus;
  approvalStatus: string;
  updatedAt: string;
  createdAt: string;
  createdByLabel: string | null;
  assignedReviewerLabel: string | null;
  /** Last governance approval reviewer when set on row. */
  reviewedByLabel: string | null;
};

function userLabel(u: { email: string; name: string | null } | null): string | null {
  if (!u) return null;
  return u.name?.trim() ? `${u.name.trim()} · ${u.email}` : u.email;
}

const draftListInclude = {
  createdBy: { select: { email: true, name: true } },
  assignedReviewer: { select: { email: true, name: true } },
  reviewedBy: { select: { email: true, name: true } },
} satisfies Prisma.MessageStudioDraftInclude;

export async function listMessageStudioDrafts(options?: {
  includeArchived?: boolean;
}): Promise<MessageStudioDraftListRow[]> {
  const rows = await prisma.messageStudioDraft.findMany({
    where: options?.includeArchived ? {} : { status: { not: "ARCHIVED" } },
    orderBy: { updatedAt: "desc" },
    take: 200,
    include: draftListInclude,
  });
  return rows.map((r) => ({
    id: r.id,
    title: r.title,
    draftType: r.draftType,
    status: r.status,
    approvalStatus: r.approvalStatus,
    updatedAt: r.updatedAt.toISOString(),
    createdAt: r.createdAt.toISOString(),
    createdByLabel: userLabel(r.createdBy),
    assignedReviewerLabel: userLabel(r.assignedReviewer),
    reviewedByLabel: userLabel(r.reviewedBy),
  }));
}

export async function getMessageStudioDraft(id: string): Promise<MessageStudioDraft | null> {
  return prisma.messageStudioDraft.findUnique({ where: { id } });
}

/** Merge sanitized keys into `metadataJson` (no body/subject mutation). */
export async function mergeMessageStudioDraftMetadataJson(
  id: string,
  patch: Record<string, unknown>,
  updatedByUserId?: string | null,
): Promise<MessageStudioDraft> {
  const row = await prisma.messageStudioDraft.findUnique({ where: { id } });
  if (!row) throw new Error("Draft not found.");
  const meta = parseJsonObject(row.metadataJson, {});
  const merged = sanitizeJsonForPersistence({ ...meta, ...patch }) as Prisma.InputJsonValue;
  return prisma.messageStudioDraft.update({
    where: { id },
    data: {
      metadataJson: merged,
      ...(updatedByUserId ? { updatedBy: { connect: { id: updatedByUserId } } } : {}),
    },
  });
}

export type MessageStudioDraftCreateInput = {
  title: string;
  draftType?: string;
  status?: MessageStudioDraftStatus;
  subject?: string;
  preheader?: string;
  body?: string;
  audienceNote?: string;
  primaryCta?: string;
  tone?: string;
  approvalStatus?: string;
  approvalNotes?: string;
  complianceNotes?: string;
  campaignVoiceJson?: Prisma.JsonValue;
  qualityChecklistJson?: Prisma.JsonValue;
  editorialReviewJson?: Prisma.JsonValue;
  templateJson?: Prisma.JsonValue;
  sendPacketJson?: Prisma.JsonValue | null;
  sourceContextJson?: Prisma.JsonValue;
  metadataJson?: Prisma.JsonValue;
};

export function buildServerDraftFromLocalDraftPayload(
  payload: MessageStudioLocalDraft,
): Omit<MessageStudioDraftCreateInput, "title"> & { title: string } {
  const editorialReviewJson = sanitizeJsonForPersistence({
    editorialReviewStatus: payload.editorialReviewStatus,
    editorialReviewOwner: payload.editorialReviewOwner,
    editorialReviewNotes: payload.editorialReviewNotes,
    editorialClaimSourceChecklist: payload.editorialClaimSourceChecklist,
    editorialVoiceAudienceChecklist: payload.editorialVoiceAudienceChecklist,
    editorialComplianceChecklist: payload.editorialComplianceChecklist,
  });
  const templateJson = sanitizeJsonForPersistence({
    contentBlocksUsed: payload.contentBlocksUsed,
    templateIdLastApplied: payload.templateIdLastApplied,
    templatesUsed: payload.templatesUsed,
    governanceAcknowledged: payload.governanceAcknowledged,
  });
  let sendPacketJson: Prisma.JsonValue | null = null;
  if (payload.lastSendPacketJson?.trim()) {
    try {
      sendPacketJson = sanitizeJsonForPersistence(JSON.parse(payload.lastSendPacketJson)) as Prisma.JsonValue;
    } catch {
      sendPacketJson = null;
    }
  }
  const metadataJson = sanitizeJsonForPersistence({
    approvalOwner: payload.approvalOwner,
    lastAiAdvisoryJson: payload.lastAiAdvisoryJson,
    lastSendPacketGeneratedAt: payload.lastSendPacketGeneratedAt,
    promotedFromLocalDraftId: payload.id,
    ...(payload.lastDraftCritiqueJson?.trim()
      ? {
          lastDraftCritiqueJson:
            payload.lastDraftCritiqueJson.length > 100_000
              ? payload.lastDraftCritiqueJson.slice(0, 100_000)
              : payload.lastDraftCritiqueJson,
        }
      : {}),
  }) as Prisma.JsonValue;

  return {
    title: payload.title?.trim() || "Untitled shared draft",
    draftType: payload.draftType ?? "",
    subject: payload.subject ?? "",
    preheader: payload.preheader ?? "",
    body: payload.body ?? "",
    audienceNote: payload.audienceNote ?? "",
    primaryCta: payload.primaryCta ?? "",
    tone: payload.tone ?? "",
    approvalStatus: payload.approvalStatus ?? "draft",
    approvalNotes: payload.approvalNotes ?? "",
    complianceNotes: payload.complianceNotes ?? "",
    campaignVoiceJson: sanitizeJsonForPersistence(payload.campaignVoice) as Prisma.JsonValue,
    qualityChecklistJson: sanitizeJsonForPersistence(payload.qualityChecklist) as Prisma.JsonValue,
    editorialReviewJson: editorialReviewJson as Prisma.JsonValue,
    templateJson: templateJson as Prisma.JsonValue,
    sendPacketJson,
    sourceContextJson: sanitizeJsonForPersistence(payload.sourceContext) as Prisma.JsonValue,
    metadataJson: metadataJson as Prisma.JsonValue,
  };
}

export async function createMessageStudioDraft(
  input: MessageStudioDraftCreateInput & { createdByUserId?: string | null; updatedByUserId?: string | null },
): Promise<MessageStudioDraft> {
  const status = input.status ?? "DRAFT";
  return prisma.messageStudioDraft.create({
    data: {
      title: input.title.trim() || "Untitled shared draft",
      draftType: input.draftType ?? "",
      status,
      subject: input.subject ?? "",
      preheader: input.preheader ?? "",
      body: input.body ?? "",
      audienceNote: input.audienceNote ?? "",
      primaryCta: input.primaryCta ?? "",
      tone: input.tone ?? "",
      approvalStatus: input.approvalStatus ?? "draft",
      approvalNotes: input.approvalNotes ?? "",
      complianceNotes: input.complianceNotes ?? "",
      campaignVoiceJson: (input.campaignVoiceJson ?? {}) as Prisma.InputJsonValue,
      qualityChecklistJson: (input.qualityChecklistJson ?? {}) as Prisma.InputJsonValue,
      editorialReviewJson: (input.editorialReviewJson ?? {}) as Prisma.InputJsonValue,
      templateJson: (input.templateJson ?? {}) as Prisma.InputJsonValue,
      sendPacketJson:
        input.sendPacketJson === undefined
          ? undefined
          : input.sendPacketJson === null
            ? Prisma.JsonNull
            : (input.sendPacketJson as Prisma.InputJsonValue),
      sourceContextJson: (input.sourceContextJson ?? {}) as Prisma.InputJsonValue,
      metadataJson: (input.metadataJson ?? {}) as Prisma.InputJsonValue,
      createdByUserId: input.createdByUserId ?? undefined,
      updatedByUserId: input.updatedByUserId ?? input.createdByUserId ?? undefined,
    },
  });
}

export async function promoteLocalDraftPayloadToServerDraft(args: {
  payload: MessageStudioLocalDraft;
  createdByUserId?: string | null;
  initialStatus?: MessageStudioDraftStatus;
}): Promise<MessageStudioDraft> {
  const built = buildServerDraftFromLocalDraftPayload(args.payload);
  return createMessageStudioDraft({
    ...built,
    status: args.initialStatus ?? "DRAFT",
    createdByUserId: args.createdByUserId,
    updatedByUserId: args.createdByUserId,
  });
}

export async function updateMessageStudioDraft(
  id: string,
  input: MessageStudioDraftCreateInput & {
    status?: MessageStudioDraftStatus;
    updatedByUserId?: string | null;
    reviewedByUserId?: string | null;
    reviewedAt?: Date | null;
    archivedAt?: Date | null;
    assignedReviewerUserId?: string | null;
  },
): Promise<MessageStudioDraft> {
  const data: Prisma.MessageStudioDraftUpdateInput = {
    title: input.title,
    draftType: input.draftType,
    subject: input.subject,
    preheader: input.preheader,
    body: input.body,
    audienceNote: input.audienceNote,
    primaryCta: input.primaryCta,
    tone: input.tone,
    approvalStatus: input.approvalStatus,
    approvalNotes: input.approvalNotes,
    complianceNotes: input.complianceNotes,
  };
  if (input.updatedByUserId) {
    data.updatedBy = { connect: { id: input.updatedByUserId } };
  }
  if (input.assignedReviewerUserId !== undefined) {
    data.assignedReviewer = input.assignedReviewerUserId
      ? { connect: { id: input.assignedReviewerUserId } }
      : { disconnect: true };
  }
  if (input.campaignVoiceJson !== undefined) data.campaignVoiceJson = input.campaignVoiceJson as Prisma.InputJsonValue;
  if (input.qualityChecklistJson !== undefined) data.qualityChecklistJson = input.qualityChecklistJson as Prisma.InputJsonValue;
  if (input.editorialReviewJson !== undefined) data.editorialReviewJson = input.editorialReviewJson as Prisma.InputJsonValue;
  if (input.templateJson !== undefined) data.templateJson = input.templateJson as Prisma.InputJsonValue;
  if (input.sendPacketJson !== undefined) {
    data.sendPacketJson =
      input.sendPacketJson === null ? Prisma.JsonNull : (input.sendPacketJson as Prisma.InputJsonValue);
  }
  if (input.sourceContextJson !== undefined) data.sourceContextJson = input.sourceContextJson as Prisma.InputJsonValue;
  if (input.metadataJson !== undefined) data.metadataJson = input.metadataJson as Prisma.InputJsonValue;
  if (input.status !== undefined) {
    data.status = input.status;
    if (input.status === "ARCHIVED") {
      data.archivedAt = new Date();
    }
  }
  if (input.reviewedByUserId !== undefined) {
    data.reviewedBy = input.reviewedByUserId ? { connect: { id: input.reviewedByUserId } } : { disconnect: true };
  }
  if (input.reviewedAt !== undefined) data.reviewedAt = input.reviewedAt;
  if (input.archivedAt !== undefined) data.archivedAt = input.archivedAt;
  return prisma.messageStudioDraft.update({ where: { id }, data });
}

export async function archiveMessageStudioDraft(
  id: string,
  updatedByUserId?: string | null,
): Promise<MessageStudioDraft> {
  return prisma.messageStudioDraft.update({
    where: { id },
    data: {
      status: "ARCHIVED",
      archivedAt: new Date(),
      ...(updatedByUserId ? { updatedBy: { connect: { id: updatedByUserId } } } : {}),
    },
  });
}

/**
 * Workflow-only update (status / reviewer) without re-serializing full draft body — no sends, no providers.
 * Use `archiveMessageStudioDraft` path when status is ARCHIVED.
 */
export async function patchMessageStudioDraftWorkflow(args: {
  id: string;
  status: MessageStudioDraftStatus;
  updatedByUserId?: string | null;
  assignedReviewerUserId?: string | null | undefined;
}): Promise<MessageStudioDraft> {
  const existing = await prisma.messageStudioDraft.findUnique({ where: { id: args.id } });
  if (!existing) {
    throw new Error("Draft not found.");
  }
  if (existing.status === "ARCHIVED") {
    throw new Error("Draft is archived.");
  }
  if (args.status === "ARCHIVED") {
    return archiveMessageStudioDraft(args.id, args.updatedByUserId);
  }

  const transitioningToApproved =
    args.status === "APPROVED_FOR_SEND_GOVERNANCE" && existing.status !== "APPROVED_FOR_SEND_GOVERNANCE";

  const data: Prisma.MessageStudioDraftUpdateInput = {
    status: args.status,
    ...(args.updatedByUserId ? { updatedBy: { connect: { id: args.updatedByUserId } } } : {}),
    ...(args.assignedReviewerUserId !== undefined
      ? args.assignedReviewerUserId
        ? { assignedReviewer: { connect: { id: args.assignedReviewerUserId } } }
        : { assignedReviewer: { disconnect: true } }
      : {}),
    ...(transitioningToApproved && args.updatedByUserId
      ? {
          reviewedAt: new Date(),
          reviewedBy: { connect: { id: args.updatedByUserId } },
        }
      : transitioningToApproved
        ? { reviewedAt: new Date() }
        : {}),
  };

  return prisma.messageStudioDraft.update({ where: { id: args.id }, data });
}

function parseJsonObject(raw: Prisma.JsonValue | null | undefined, fallback: Record<string, unknown>): Record<string, unknown> {
  if (raw && typeof raw === "object" && !Array.isArray(raw)) return raw as Record<string, unknown>;
  return fallback;
}

/** Rehydrate a server row into a browser-local draft shape (new local id; links server id). */
export function serverDraftRowToLocalDraft(row: MessageStudioDraft): MessageStudioLocalDraft {
  const base = createEmptyDraft();
  const cvRaw = parseJsonObject(row.campaignVoiceJson, {});
  const sc = parseJsonObject(row.sourceContextJson, {});
  const ed = parseJsonObject(row.editorialReviewJson, {});
  const tpl = parseJsonObject(row.templateJson, {});
  const meta = parseJsonObject(row.metadataJson, {});
  let lastSendPacketJson = "";
  if (row.sendPacketJson !== null && row.sendPacketJson !== undefined) {
    try {
      lastSendPacketJson = JSON.stringify(row.sendPacketJson);
    } catch {
      lastSendPacketJson = "";
    }
  }
  const campaignVoice: MessageStudioLocalDraft["campaignVoice"] =
    cvRaw && Object.keys(cvRaw).length > 0
      ? ({
          ...getDefaultCampaignVoiceSettings(),
          ...cvRaw,
          sourceLayers: {
            ...getDefaultCampaignVoiceSettings().sourceLayers,
            ...(typeof cvRaw.sourceLayers === "object" && cvRaw.sourceLayers !== null
              ? (cvRaw.sourceLayers as Record<string, boolean>)
              : {}),
          },
        } as MessageStudioLocalDraft["campaignVoice"])
      : base.campaignVoice;

  return {
    ...base,
    linkedServerDraftId: row.id,
    title: row.title,
    draftType: row.draftType,
    subject: row.subject,
    preheader: row.preheader,
    body: row.body,
    audienceNote: row.audienceNote,
    primaryCta: row.primaryCta,
    tone: row.tone || base.tone,
    approvalStatus: (row.approvalStatus as MessageStudioLocalDraft["approvalStatus"]) || "draft",
    approvalNotes: row.approvalNotes,
    complianceNotes: row.complianceNotes,
    campaignVoice,
    qualityChecklist: parseJsonObject(row.qualityChecklistJson, {}) as MessageStudioLocalDraft["qualityChecklist"],
    sourceContext: {
      source: typeof sc.source === "string" ? sc.source : "",
      emailWorkflowItemId: typeof sc.emailWorkflowItemId === "string" ? sc.emailWorkflowItemId : "",
      audienceDefinitionId: typeof sc.audienceDefinitionId === "string" ? sc.audienceDefinitionId : "",
      importBatchId: typeof sc.importBatchId === "string" ? sc.importBatchId : "",
    },
    editorialReviewStatus: (ed.editorialReviewStatus as MessageStudioLocalDraft["editorialReviewStatus"]) ?? base.editorialReviewStatus,
    editorialReviewOwner: (ed.editorialReviewOwner as MessageStudioLocalDraft["editorialReviewOwner"]) ?? base.editorialReviewOwner,
    editorialReviewNotes: typeof ed.editorialReviewNotes === "string" ? ed.editorialReviewNotes : "",
    editorialClaimSourceChecklist:
      ed.editorialClaimSourceChecklist && typeof ed.editorialClaimSourceChecklist === "object"
        ? { ...defaultEditorialClaimSourceChecklist(), ...(ed.editorialClaimSourceChecklist as object) }
        : defaultEditorialClaimSourceChecklist(),
    editorialVoiceAudienceChecklist:
      ed.editorialVoiceAudienceChecklist && typeof ed.editorialVoiceAudienceChecklist === "object"
        ? { ...defaultEditorialVoiceAudienceChecklist(), ...(ed.editorialVoiceAudienceChecklist as object) }
        : defaultEditorialVoiceAudienceChecklist(),
    editorialComplianceChecklist:
      ed.editorialComplianceChecklist && typeof ed.editorialComplianceChecklist === "object"
        ? { ...defaultEditorialComplianceChecklist(), ...(ed.editorialComplianceChecklist as object) }
        : defaultEditorialComplianceChecklist(),
    contentBlocksUsed: Array.isArray(tpl.contentBlocksUsed)
      ? (tpl.contentBlocksUsed as unknown[]).filter((x): x is string => typeof x === "string")
      : [],
    templateIdLastApplied: typeof tpl.templateIdLastApplied === "string" ? tpl.templateIdLastApplied : "",
    templatesUsed: Array.isArray(tpl.templatesUsed)
      ? (tpl.templatesUsed as unknown[]).filter((x): x is string => typeof x === "string")
      : [],
    governanceAcknowledged: tpl.governanceAcknowledged === true,
    approvalOwner: typeof meta.approvalOwner === "string" ? meta.approvalOwner : "",
    lastAiAdvisoryJson: typeof meta.lastAiAdvisoryJson === "string" ? meta.lastAiAdvisoryJson : "",
    lastSendPacketGeneratedAt: typeof meta.lastSendPacketGeneratedAt === "string" ? meta.lastSendPacketGeneratedAt : "",
    lastDraftCritiqueJson:
      typeof meta.lastDraftCritiqueJson === "string"
        ? meta.lastDraftCritiqueJson
        : meta.lastDraftCritique && typeof meta.lastDraftCritique === "object"
          ? JSON.stringify(meta.lastDraftCritique)
          : "",
    lastSendPacketJson,
  };
}

export async function createMessageStudioDraftRevision(
  draftId: string,
  note: string | null | undefined,
  createdByUserId?: string | null,
): Promise<void> {
  const row = await prisma.messageStudioDraft.findUnique({ where: { id: draftId } });
  if (!row) throw new Error("Draft not found");
  const last = await prisma.messageStudioDraftRevision.findFirst({
    where: { draftId },
    orderBy: { revisionNumber: "desc" },
    select: { revisionNumber: true },
  });
  const nextNum = (last?.revisionNumber ?? 0) + 1;
  const snapshotJson = sanitizeJsonForPersistence({
    id: row.id,
    title: row.title,
    status: row.status,
    subject: row.subject,
    preheader: row.preheader,
    body: row.body,
    audienceNote: row.audienceNote,
    primaryCta: row.primaryCta,
    tone: row.tone,
    approvalStatus: row.approvalStatus,
    approvalNotes: row.approvalNotes,
    complianceNotes: row.complianceNotes,
    campaignVoiceJson: row.campaignVoiceJson,
    qualityChecklistJson: row.qualityChecklistJson,
    editorialReviewJson: row.editorialReviewJson,
    templateJson: row.templateJson,
    sendPacketJson: row.sendPacketJson,
    sourceContextJson: row.sourceContextJson,
    metadataJson: row.metadataJson,
    updatedAt: row.updatedAt.toISOString(),
  }) as Prisma.InputJsonValue;
  await prisma.messageStudioDraftRevision.create({
    data: {
      draftId,
      revisionNumber: nextNum,
      snapshotJson,
      note: note?.trim() || null,
      createdByUserId: createdByUserId ?? undefined,
    },
  });
}

export async function messageStudioSharedDraftSnapshotCounts(): Promise<{
  totalActiveSharedDrafts: number;
  needsReview: number;
  inReview: number;
  approvedForSendGovernance: number;
  dbReachable: boolean;
}> {
  try {
    const [totalActiveSharedDrafts, needsReview, inReview, approvedForSendGovernance] = await Promise.all([
      prisma.messageStudioDraft.count({ where: { status: { not: "ARCHIVED" } } }),
      prisma.messageStudioDraft.count({ where: { status: "NEEDS_REVIEW" } }),
      prisma.messageStudioDraft.count({ where: { status: "IN_REVIEW" } }),
      prisma.messageStudioDraft.count({ where: { status: "APPROVED_FOR_SEND_GOVERNANCE" } }),
    ]);
    return {
      totalActiveSharedDrafts,
      needsReview,
      inReview,
      approvedForSendGovernance,
      dbReachable: true,
    };
  } catch {
    return {
      totalActiveSharedDrafts: 0,
      needsReview: 0,
      inReview: 0,
      approvedForSendGovernance: 0,
      dbReachable: false,
    };
  }
}

/** Verify user id exists before assigning reviewer (do not trust client blindly). */
export async function verifyUserIdExists(userId: string): Promise<boolean> {
  const n = await prisma.user.count({ where: { id: userId } });
  return n > 0;
}
