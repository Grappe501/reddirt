"use server";

import { revalidatePath } from "next/cache";
import {
  CampaignTaskPriority,
  CampaignTaskStatus,
  CampaignTaskType,
  SocialContentKind,
  SocialContentStatus,
  SocialMessageTacticMode,
  SocialMessageToneMode,
  SocialPerformanceDataSource,
  SocialPlatform,
  SocialStrategicFollowupType,
  SocialVariantStatus,
} from "@prisma/client";
import { prisma } from "@/lib/db";
import { requireAdminAction } from "@/app/admin/owned-media-auth";
import { getAdminActorUserId } from "@/lib/admin/actor";
import { getSocialContentWorkbenchDetail } from "@/lib/social/social-workbench-queries";
import {
  buildHeuristicRecommendations,
  getSocialAnalyticsAggregates,
  getSocialAnalyticsAggregatesForDays,
  getSocialAnalyticsTimingIntelligence,
} from "@/lib/social/social-analytics-aggregates";
import { computeMeaningfulEngagementScore100 } from "@/lib/social/engagement-score";
import { parseDatetimeLocalToUtc } from "@/lib/social/date-input";
import type { SocialContentWorkbenchDetail } from "@/lib/social/social-workbench-dto";

const KINDS = new Set<string>(Object.values(SocialContentKind));
const STATUSES = new Set<string>(Object.values(SocialContentStatus));
const PLATFORMS = new Set<string>(Object.values(SocialPlatform));
const VARIANT_STATUSES = new Set<string>(Object.values(SocialVariantStatus));
const TONE_MODES = new Set<string>(Object.values(SocialMessageToneMode));
const TACTIC_MODES = new Set<string>(Object.values(SocialMessageTacticMode));
const FOLLOWUP_TYPES = new Set<string>(Object.values(SocialStrategicFollowupType));

function optMessageToneMode(raw: FormDataEntryValue | null | undefined): SocialMessageToneMode | null {
  const t = String(raw ?? "").trim();
  if (!t) return null;
  return TONE_MODES.has(t) ? (t as SocialMessageToneMode) : null;
}

function optMessageTacticMode(raw: FormDataEntryValue | null | undefined): SocialMessageTacticMode | null {
  const t = String(raw ?? "").trim();
  if (!t) return null;
  return TACTIC_MODES.has(t) ? (t as SocialMessageTacticMode) : null;
}

function optStrategicFollowupType(raw: FormDataEntryValue | null | undefined): SocialStrategicFollowupType {
  const t = String(raw ?? "").trim();
  if (!t || !FOLLOWUP_TYPES.has(t)) return SocialStrategicFollowupType.NONE;
  return t as SocialStrategicFollowupType;
}

export type CreateSocialItemResult = { ok: true; id: string } | { ok: false; error: string };

export async function createSocialContentItemAction(formData: FormData): Promise<CreateSocialItemResult> {
  await requireAdminAction();
  const title = String(formData.get("title") ?? "").trim();
  const kindRaw = String(formData.get("kind") ?? "OTHER");
  const kind = KINDS.has(kindRaw) ? (kindRaw as SocialContentKind) : SocialContentKind.OTHER;
  const messageToneMode = optMessageToneMode(formData.get("messageToneMode"));
  const messageTacticMode = optMessageTacticMode(formData.get("messageTacticMode"));
  const bodyCopy = String(formData.get("bodyCopy") ?? "").trim() || null;
  if (!title) {
    return { ok: false, error: "Add a short title for this post set." };
  }
  if (title.length > 200) {
    return { ok: false, error: "Title is too long (max 200 characters)." };
  }
  if (bodyCopy && bodyCopy.length > 50000) {
    return { ok: false, error: "Body copy is too long." };
  }
  const actor = await getAdminActorUserId();
  const row = await prisma.socialContentItem.create({
    data: {
      title,
      kind,
      messageToneMode,
      messageTacticMode,
      bodyCopy,
      status: SocialContentStatus.DRAFT,
      createdByUserId: actor,
    },
  });
  revalidatePath("/admin/workbench/social");
  revalidatePath("/admin/workbench");
  return { ok: true, id: row.id };
}

export type GetSocialDetailResult =
  | { ok: true; detail: SocialContentWorkbenchDetail }
  | { ok: false; error: "not_found" | "missing_id" };

export async function getSocialContentWorkbenchDetailAction(socialContentItemId: string): Promise<GetSocialDetailResult> {
  await requireAdminAction();
  const id = String(socialContentItemId ?? "").trim();
  if (!id) {
    return { ok: false, error: "missing_id" };
  }
  const detail = await getSocialContentWorkbenchDetail(id);
  if (!detail) {
    return { ok: false, error: "not_found" };
  }
  return { ok: true, detail };
}

export type UpdateSocialItemResult = { ok: true } | { ok: false; error: string };

export async function updateSocialContentItemAction(formData: FormData): Promise<UpdateSocialItemResult> {
  await requireAdminAction();
  const id = String(formData.get("id") ?? "").trim();
  if (!id) {
    return { ok: false, error: "Missing item id." };
  }
  const title = String(formData.get("title") ?? "").trim();
  if (!title) {
    return { ok: false, error: "Title is required." };
  }
  if (title.length > 200) {
    return { ok: false, error: "Title is too long (max 200 characters)." };
  }
  const bodyRaw = String(formData.get("bodyCopy") ?? "");
  if (bodyRaw.length > 50000) {
    return { ok: false, error: "Body copy is too long." };
  }
  const bodyCopy = bodyRaw.trim() || null;
  const kindRaw = String(formData.get("kind") ?? "OTHER");
  const kind = KINDS.has(kindRaw) ? (kindRaw as SocialContentKind) : SocialContentKind.OTHER;
  const messageToneMode = optMessageToneMode(formData.get("messageToneMode"));
  const messageTacticMode = optMessageTacticMode(formData.get("messageTacticMode"));
  const statusRaw = String(formData.get("status") ?? "DRAFT");
  if (!STATUSES.has(statusRaw)) {
    return { ok: false, error: "Invalid status." };
  }
  const status = statusRaw as SocialContentStatus;
  const exists = await prisma.socialContentItem.findUnique({ where: { id }, select: { id: true } });
  if (!exists) {
    return { ok: false, error: "Item not found." };
  }
  await prisma.socialContentItem.update({
    where: { id },
    data: { title, bodyCopy, kind, status, messageToneMode, messageTacticMode },
  });
  revalidatePath("/admin/workbench/social");
  revalidatePath("/admin/workbench");
  return { ok: true };
}

/** Apply Author Studio `compose.master` (or any master text) to `SocialContentItem.bodyCopy` without requiring full item form fields. */
export type ApplyWorkItemBodyCopyResult = { ok: true } | { ok: false; error: string };

export async function applyWorkItemBodyCopyFromStudioAction(formData: FormData): Promise<ApplyWorkItemBodyCopyResult> {
  await requireAdminAction();
  const id = String(formData.get("socialContentItemId") ?? "").trim();
  if (!id) {
    return { ok: false, error: "Missing work item id." };
  }
  const bodyRaw = String(formData.get("bodyCopy") ?? "");
  if (bodyRaw.length > 50000) {
    return { ok: false, error: "Body copy is too long." };
  }
  const bodyCopy = bodyRaw.trim() || null;
  const exists = await prisma.socialContentItem.findUnique({ where: { id }, select: { id: true } });
  if (!exists) {
    return { ok: false, error: "Item not found." };
  }
  await prisma.socialContentItem.update({
    where: { id },
    data: { bodyCopy },
  });
  revalidatePath("/admin/workbench/social");
  revalidatePath("/admin/workbench");
  return { ok: true };
}

export type VariantMutationResult = { ok: true; id: string } | { ok: false; error: string };

export async function createSocialPlatformVariantAction(formData: FormData): Promise<VariantMutationResult> {
  await requireAdminAction();
  const socialContentItemId = String(formData.get("socialContentItemId") ?? "").trim();
  if (!socialContentItemId) {
    return { ok: false, error: "Missing social work item id." };
  }
  const parent = await prisma.socialContentItem.findUnique({ where: { id: socialContentItemId }, select: { id: true } });
  if (!parent) {
    return { ok: false, error: "Work item not found." };
  }
  const platformRaw = String(formData.get("platform") ?? "OTHER");
  if (!PLATFORMS.has(platformRaw)) {
    return { ok: false, error: "Invalid platform." };
  }
  const platform = platformRaw as SocialPlatform;
  const accountId = String(formData.get("socialAccountId") ?? "").trim() || null;
  if (accountId) {
    const acc = await prisma.socialAccount.findUnique({ where: { id: accountId } });
    if (!acc) {
      return { ok: false, error: "Selected account not found." };
    }
  }
  const copyText = String(formData.get("copyText") ?? "").trim() || null;
  if (copyText && copyText.length > 100000) {
    return { ok: false, error: "Copy is too long." };
  }
  const statusRaw = String(formData.get("status") ?? "DRAFT");
  if (!VARIANT_STATUSES.has(statusRaw)) {
    return { ok: false, error: "Invalid variant status." };
  }
  const status = statusRaw as SocialVariantStatus;
  const scheduledAt = parseDatetimeLocalToUtc(String(formData.get("scheduledAt") ?? ""));
  const row = await prisma.socialPlatformVariant.create({
    data: {
      socialContentItemId,
      platform,
      socialAccountId: accountId,
      copyText,
      status,
      scheduledAt,
    },
  });
  revalidatePath("/admin/workbench/social");
  revalidatePath("/admin/workbench");
  return { ok: true, id: row.id };
}

export async function updateSocialPlatformVariantAction(formData: FormData): Promise<VariantMutationResult> {
  await requireAdminAction();
  const id = String(formData.get("id") ?? "").trim();
  const socialContentItemId = String(formData.get("socialContentItemId") ?? "").trim();
  if (!id || !socialContentItemId) {
    return { ok: false, error: "Missing variant or work item id." };
  }
  const variant = await prisma.socialPlatformVariant.findFirst({ where: { id, socialContentItemId } });
  if (!variant) {
    return { ok: false, error: "Variant not found for this work item." };
  }
  const platformRaw = String(formData.get("platform") ?? variant.platform);
  if (!PLATFORMS.has(platformRaw)) {
    return { ok: false, error: "Invalid platform." };
  }
  const accountId = String(formData.get("socialAccountId") ?? "").trim() || null;
  if (accountId) {
    const acc = await prisma.socialAccount.findUnique({ where: { id: accountId } });
    if (!acc) {
      return { ok: false, error: "Selected account not found." };
    }
  }
  const copyText = String(formData.get("copyText") ?? "").trim() || null;
  if (copyText && copyText.length > 100000) {
    return { ok: false, error: "Copy is too long." };
  }
  const statusRaw = String(formData.get("status") ?? "DRAFT");
  if (!VARIANT_STATUSES.has(statusRaw)) {
    return { ok: false, error: "Invalid variant status." };
  }
  const scheduledAt = parseDatetimeLocalToUtc(String(formData.get("scheduledAt") ?? ""));

  await prisma.socialPlatformVariant.update({
    where: { id },
    data: {
      platform: platformRaw as SocialPlatform,
      socialAccountId: accountId,
      copyText,
      status: statusRaw as SocialVariantStatus,
      scheduledAt,
    },
  });
  revalidatePath("/admin/workbench/social");
  revalidatePath("/admin/workbench");
  return { ok: true, id };
}

export type DeleteResult = { ok: true } | { ok: false; error: string };

export async function deleteSocialPlatformVariantAction(variantId: string, socialContentItemId: string): Promise<DeleteResult> {
  await requireAdminAction();
  const id = String(variantId ?? "").trim();
  const parentId = String(socialContentItemId ?? "").trim();
  if (!id || !parentId) {
    return { ok: false, error: "Missing ids." };
  }
  const n = await prisma.socialPlatformVariant.deleteMany({ where: { id, socialContentItemId: parentId } });
  if (n.count < 1) {
    return { ok: false, error: "Variant not found." };
  }
  revalidatePath("/admin/workbench/social");
  revalidatePath("/admin/workbench");
  return { ok: true };
}

export type TaskPackKey = "comms_review" | "schedule_publish" | "media_production" | "monitor_engagement";

const TASK_PACKS: Record<TaskPackKey, { title: string; taskType: CampaignTaskType; priority: CampaignTaskPriority; description: string }[]> = {
  comms_review: [
    {
      title: "Review & approve social copy",
      taskType: CampaignTaskType.COMMS,
      priority: CampaignTaskPriority.HIGH,
      description: "Comms: proofread, tone, and approval for this work item.",
    },
    {
      title: "Align messaging with event / intake",
      taskType: CampaignTaskType.COMMS,
      priority: CampaignTaskPriority.MEDIUM,
      description: "Check consistency with source brief (event or intake) when set.",
    },
  ],
  schedule_publish: [
    {
      title: "Set publish and boost window",
      taskType: CampaignTaskType.COMMS,
      priority: CampaignTaskPriority.HIGH,
      description: "Confirm schedule and accounts for each variant.",
    },
  ],
  media_production: [
    {
      title: "Media: cut / image / B-roll for variants",
      taskType: CampaignTaskType.MEDIA,
      priority: CampaignTaskPriority.HIGH,
      description: "Produce assets referenced by the work item and variants — TODO: attach `ownedMedia` ids later.",
    },
  ],
  monitor_engagement: [
    {
      title: "Engagement monitor: 24h after publish",
      taskType: CampaignTaskType.FOLLOW_UP,
      priority: CampaignTaskPriority.MEDIUM,
      description: "Watch comments, DMs, and replies — response scripts via Author Studio (TODO: pipeline).",
    },
  ],
};

export type CreateTaskPackResult = { ok: true; count: number } | { ok: false; error: string };

export async function createSocialTaskPackAction(
  socialContentItemId: string,
  pack: TaskPackKey
): Promise<CreateTaskPackResult> {
  await requireAdminAction();
  const id = String(socialContentItemId ?? "").trim();
  if (!id) {
    return { ok: false, error: "Missing work item id." };
  }
  const parent = await prisma.socialContentItem.findUnique({ where: { id }, select: { id: true, campaignEventId: true } });
  if (!parent) {
    return { ok: false, error: "Work item not found." };
  }
  const tasks = TASK_PACKS[pack];
  if (!tasks) {
    return { ok: false, error: "Unknown task pack." };
  }
  const actor = await getAdminActorUserId();
  await prisma.$transaction(
    tasks.map((t) =>
      prisma.campaignTask.create({
        data: {
          title: t.title,
          description: t.description,
          taskType: t.taskType,
          priority: t.priority,
          status: CampaignTaskStatus.TODO,
          socialContentItemId: id,
          eventId: parent.campaignEventId,
          createdByUserId: actor,
        },
      })
    )
  );
  revalidatePath("/admin/workbench/social");
  revalidatePath("/admin/workbench");
  revalidatePath("/admin/tasks");
  return { ok: true, count: tasks.length };
}

/** Preset `CampaignTask` rows for linked `OwnedMediaAsset` / `SocialContentMediaRef` workflows. */
export type MediaWorkflowPreset = "media_edit" | "thumbnail_graphic" | "captions" | "clip_review" | "recap_package";

const MEDIA_WORKFLOW_PRESETS: Record<
  MediaWorkflowPreset,
  { title: string; taskType: CampaignTaskType; priority: CampaignTaskPriority; description: string }[]
> = {
  media_edit: [
    {
      title: "Source media: timeline / colour / length edit",
      taskType: CampaignTaskType.MEDIA,
      priority: CampaignTaskPriority.HIGH,
      description: "Edit linked `OwnedMediaAsset` for this work item (see Social workbench media refs).",
    },
  ],
  thumbnail_graphic: [
    {
      title: "Thumbnail or quote graphic from source still",
      taskType: CampaignTaskType.MEDIA,
      priority: CampaignTaskPriority.HIGH,
      description: "Design deliverable for variants — reference linked media in the work item.",
    },
  ],
  captions: [
    {
      title: "Captions / subtitles pass",
      taskType: CampaignTaskType.COMMS,
      priority: CampaignTaskPriority.MEDIUM,
      description: "Generate or QC captions for linked transcript-bearing media; TODO: ASR pipeline.",
    },
  ],
  clip_review: [
    {
      title: "Clip / moment review (transcript or rough cut)",
      taskType: CampaignTaskType.COMMS,
      priority: CampaignTaskPriority.HIGH,
      description: "Review cuts or transcript-derived hooks from linked `VIDEO_REPURPOSE` media.",
    },
  ],
  recap_package: [
    {
      title: "Recap / package assembly",
      taskType: CampaignTaskType.COMMS,
      priority: CampaignTaskPriority.MEDIUM,
      description: "Assemble highlight recap for distribution; TODO: Author Studio package export.",
    },
  ],
};

export async function createMediaWorkflowTaskPackAction(
  socialContentItemId: string,
  preset: MediaWorkflowPreset,
  options?: { ownedMediaId?: string; refId?: string }
): Promise<CreateTaskPackResult> {
  await requireAdminAction();
  const id = String(socialContentItemId ?? "").trim();
  if (!id) {
    return { ok: false, error: "Missing work item id." };
  }
  const parent = await prisma.socialContentItem.findUnique({ where: { id }, select: { id: true, campaignEventId: true } });
  if (!parent) {
    return { ok: false, error: "Work item not found." };
  }
  const def = MEDIA_WORKFLOW_PRESETS[preset];
  if (!def) {
    return { ok: false, error: "Unknown media workflow preset." };
  }
  const suffix = options?.refId
    ? ` Ref: ${options.refId}.`
    : options?.ownedMediaId
      ? ` Owned media: ${options.ownedMediaId}.`
      : "";
  const actor = await getAdminActorUserId();
  const tasks = def.map((t) => ({
    ...t,
    description: t.description + suffix,
  }));
  await prisma.$transaction(
    tasks.map((t) =>
      prisma.campaignTask.create({
        data: {
          title: t.title,
          description: t.description,
          taskType: t.taskType,
          priority: t.priority,
          status: CampaignTaskStatus.TODO,
          socialContentItemId: id,
          eventId: parent.campaignEventId,
          createdByUserId: actor,
        },
      })
    )
  );
  revalidatePath("/admin/workbench/social");
  revalidatePath("/admin/workbench");
  revalidatePath("/admin/tasks");
  return { ok: true, count: tasks.length };
}

export type SocialInsightSaveResult = { ok: true } | { ok: false; error: string };

/**
 * Staff-authored strategic notes for the analytics tab (timing, tone, retention, conversion).
 * AI-generated fields are left unchanged unless we add separate actions later.
 */
export async function upsertSocialStrategicInsightAction(formData: FormData): Promise<SocialInsightSaveResult> {
  await requireAdminAction();
  const socialContentItemId = String(formData.get("socialContentItemId") ?? "").trim();
  if (!socialContentItemId) {
    return { ok: false, error: "Missing work item id." };
  }
  const parent = await prisma.socialContentItem.findUnique({ where: { id: socialContentItemId }, select: { id: true } });
  if (!parent) {
    return { ok: false, error: "Work item not found." };
  }
  const timingInsight = String(formData.get("timingInsight") ?? "").trim() || null;
  const tonePerformance = String(formData.get("tonePerformance") ?? "").trim() || null;
  const retentionSignal = String(formData.get("retentionSignal") ?? "").trim() || null;
  const conversionSignal = String(formData.get("conversionSignal") ?? "").trim() || null;
  const recommendedNextTone = optMessageToneMode(formData.get("recommendedNextTone"));
  const recommendedBestWindow = String(formData.get("recommendedBestWindow") ?? "").trim() || null;
  const recommendedFollowupType = optStrategicFollowupType(formData.get("recommendedFollowupType"));
  const recommendedCountyFocus = String(formData.get("recommendedCountyFocus") ?? "").trim() || null;
  const recommendedCtaType = String(formData.get("recommendedCtaType") ?? "").trim() || null;
  const confRaw = String(formData.get("confidenceScore") ?? "").trim();
  let confidenceScore: number | null = null;
  if (confRaw) {
    const c = parseFloat(confRaw);
    if (Number.isFinite(c) && c >= 0 && c <= 1) confidenceScore = c;
  }
  for (const [label, v] of [
    ["Timing insight", timingInsight],
    ["Tone performance", tonePerformance],
    ["Retention signal", retentionSignal],
    ["Conversion signal", conversionSignal],
    ["Recommended best window", recommendedBestWindow],
    ["Recommended county focus", recommendedCountyFocus],
  ] as const) {
    if (v && v.length > 20000) {
      return { ok: false, error: `${label} is too long.` };
    }
  }
  await prisma.socialContentStrategicInsight.upsert({
    where: { socialContentItemId },
    create: {
      socialContentItemId,
      timingInsight,
      tonePerformance,
      retentionSignal,
      conversionSignal,
      recommendedNextTone,
      recommendedBestWindow,
      recommendedFollowupType,
      recommendedCountyFocus,
      recommendedCtaType,
      confidenceScore,
    },
    update: {
      timingInsight,
      tonePerformance,
      retentionSignal,
      conversionSignal,
      recommendedNextTone,
      recommendedBestWindow,
      recommendedFollowupType,
      recommendedCountyFocus,
      recommendedCtaType,
      confidenceScore,
    },
  });
  revalidatePath("/admin/workbench/social");
  revalidatePath("/admin/workbench");
  return { ok: true };
}

function optInt(raw: string): number | null {
  const t = String(raw ?? "").trim();
  if (!t) return null;
  const n = parseInt(t, 10);
  if (!Number.isFinite(n) || n < 0) return null;
  return n;
}

function optFloat01(raw: string): number | null {
  const t = String(raw ?? "").trim();
  if (!t) return null;
  const n = parseFloat(t);
  if (!Number.isFinite(n) || n < 0 || n > 1) return null;
  return n;
}

export type CreatePerformanceSnapshotResult = { ok: true; id: string } | { ok: false; error: string };

/** Manual / importer-friendly row; APIImport path can set `dataSource` later via separate tooling. */
export async function createSocialPerformanceSnapshotAction(formData: FormData): Promise<CreatePerformanceSnapshotResult> {
  await requireAdminAction();
  const socialContentItemId = String(formData.get("socialContentItemId") ?? "").trim();
  if (!socialContentItemId) {
    return { ok: false, error: "Missing work item id." };
  }
  const parent = await prisma.socialContentItem.findUnique({
    where: { id: socialContentItemId },
    select: { id: true, campaignEventId: true },
  });
  if (!parent) {
    return { ok: false, error: "Work item not found." };
  }
  const periodStart = parseDatetimeLocalToUtc(String(formData.get("periodStart") ?? ""));
  const periodEnd = parseDatetimeLocalToUtc(String(formData.get("periodEnd") ?? ""));
  if (!periodStart || !periodEnd) {
    return { ok: false, error: "Set both period start and end (use local time fields)." };
  }
  if (periodEnd.getTime() <= periodStart.getTime()) {
    return { ok: false, error: "Period end must be after start." };
  }
  const variantId = String(formData.get("socialPlatformVariantId") ?? "").trim() || null;
  if (variantId) {
    const v = await prisma.socialPlatformVariant.findFirst({
      where: { id: variantId, socialContentItemId },
    });
    if (!v) {
      return { ok: false, error: "Variant not found for this work item." };
    }
  }
  const conversionCampaignEventId = String(formData.get("conversionCampaignEventId") ?? "").trim() || null;
  if (conversionCampaignEventId) {
    const ev = await prisma.campaignEvent.findUnique({ where: { id: conversionCampaignEventId }, select: { id: true } });
    if (!ev) {
      return { ok: false, error: "Linked event not found." };
    }
  }
  const useWorkEvent = String(formData.get("useWorkItemEvent") ?? "") === "1";
  const eventId = conversionCampaignEventId ?? (useWorkEvent && parent.campaignEventId ? parent.campaignEventId : null);

  const row = await prisma.socialPerformanceSnapshot.create({
    data: {
      socialContentItemId,
      socialPlatformVariantId: variantId,
      periodStart,
      periodEnd,
      impressions: optInt(String(formData.get("impressions") ?? "")),
      likes: optInt(String(formData.get("likes") ?? "")),
      comments: optInt(String(formData.get("comments") ?? "")),
      shares: optInt(String(formData.get("shares") ?? "")),
      saves: optInt(String(formData.get("saves") ?? "")),
      clickThroughs: optInt(String(formData.get("clickThroughs") ?? "")),
      clickThroughRate: optFloat01(String(formData.get("clickThroughRate") ?? "")),
      videoCompletionRate: optFloat01(String(formData.get("videoCompletionRate") ?? "")),
      engagementQualityScore: (() => {
        const t = String(formData.get("engagementQualityScore") ?? "").trim();
        if (t) {
          const n = parseFloat(t);
          if (Number.isFinite(n) && n >= 0 && n <= 100) return n;
        }
        const likes = optInt(String(formData.get("likes") ?? ""));
        const comments = optInt(String(formData.get("comments") ?? ""));
        const shares = optInt(String(formData.get("shares") ?? ""));
        const saves = optInt(String(formData.get("saves") ?? ""));
        const impressions = optInt(String(formData.get("impressions") ?? ""));
        const clickThroughs = optInt(String(formData.get("clickThroughs") ?? ""));
        const ctr = optFloat01(String(formData.get("clickThroughRate") ?? ""));
        const vcr = optFloat01(String(formData.get("videoCompletionRate") ?? ""));
        const volunteerLeadCount = optInt(String(formData.get("volunteerLeadCount") ?? ""));
        return computeMeaningfulEngagementScore100({
          impressions,
          likes,
          comments,
          shares,
          saves,
          clickThroughs,
          clickThroughRate: ctr,
          videoCompletionRate: vcr,
          volunteerLeadCount,
        });
      })(),
      volunteerLeadCount: optInt(String(formData.get("volunteerLeadCount") ?? "")),
      conversionCampaignEventId: eventId,
      dataSource: SocialPerformanceDataSource.MANUAL,
      notes: String(formData.get("notes") ?? "").trim() || null,
    },
  });
  revalidatePath("/admin/workbench/social");
  revalidatePath("/admin/workbench");
  return { ok: true, id: row.id };
}

export type SocialAnalyticsAggregatesResult =
  | { ok: true; data: Awaited<ReturnType<typeof getSocialAnalyticsAggregates>> }
  | { ok: false; error: string };

export async function getSocialAnalyticsAggregatesAction(): Promise<SocialAnalyticsAggregatesResult> {
  await requireAdminAction();
  try {
    const data = await getSocialAnalyticsAggregates();
    return { ok: true, data };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

export type SocialAnalyticsTimingIntelligenceResult =
  | { ok: true; data: Awaited<ReturnType<typeof getSocialAnalyticsTimingIntelligence>> }
  | { ok: false; error: string };

/** 14d / 30d / 60d windows with counts and confidence hints (server-side, reusable). */
export async function getSocialAnalyticsTimingIntelligenceAction(): Promise<SocialAnalyticsTimingIntelligenceResult> {
  await requireAdminAction();
  try {
    const data = await getSocialAnalyticsTimingIntelligence();
    return { ok: true, data };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

export type HeuristicStrategicResult = { ok: true } | { ok: false; error: string };

/** Fill structured recommendation fields from cross-work learnings + this item (narrative fields unchanged). */
export async function applyHeuristicStrategicRecommendationsAction(socialContentItemId: string): Promise<HeuristicStrategicResult> {
  await requireAdminAction();
  const id = String(socialContentItemId ?? "").trim();
  if (!id) return { ok: false, error: "Missing work item id." };
  const parent = await prisma.socialContentItem.findUnique({
    where: { id },
    include: {
      performanceSnapshots: { orderBy: { periodEnd: "desc" as const }, take: 1 },
    },
  });
  if (!parent) return { ok: false, error: "Work item not found." };
  const agg = await getSocialAnalyticsAggregatesForDays(30);
  const snap = parent.performanceSnapshots[0];
  const primary =
    snap != null
      ? {
          volunteerLeadCount: snap.volunteerLeadCount,
          saves: snap.saves,
          comments: snap.comments,
        }
      : null;
  const h = buildHeuristicRecommendations(
    {
      kind: parent.kind,
      messageToneMode: parent.messageToneMode,
      campaignEventId: parent.campaignEventId,
    },
    primary,
    agg
  );
  try {
    await prisma.socialContentStrategicInsight.upsert({
      where: { socialContentItemId: id },
      create: {
        socialContentItemId: id,
        recommendedNextTone: h.recommendedNextTone,
        recommendedBestWindow: h.recommendedBestWindow,
        recommendedFollowupType: h.recommendedFollowupType,
        recommendedCountyFocus: h.recommendedCountyFocus,
        recommendedCtaType: h.recommendedCtaType,
        confidenceScore: h.confidenceScore,
      },
      update: {
        recommendedNextTone: h.recommendedNextTone,
        recommendedBestWindow: h.recommendedBestWindow,
        recommendedFollowupType: h.recommendedFollowupType,
        recommendedCountyFocus: h.recommendedCountyFocus,
        recommendedCtaType: h.recommendedCtaType,
        confidenceScore: h.confidenceScore,
      },
    });
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
  revalidatePath("/admin/workbench/social");
  revalidatePath("/admin/workbench");
  return { ok: true };
}

export type AnalyticFollowUpResult = { ok: true; id: string } | { ok: false; error: string };

const ANALYTIC_TEMPLATES = new Set([
  "followup",
  "county",
  "volunteer",
  "clarification",
  "event_promo",
  "post_event_recap",
]);

/**
 * Create a new draft work item for operator follow-up (from analytics), preserving trust-building defaults.
 */
export async function createAnalyticFollowUpWorkItemAction(formData: FormData): Promise<AnalyticFollowUpResult> {
  await requireAdminAction();
  const sourceId = String(formData.get("sourceSocialContentItemId") ?? "").trim();
  const template = String(formData.get("template") ?? "").trim();
  if (!sourceId || !ANALYTIC_TEMPLATES.has(template)) {
    return { ok: false, error: "Invalid follow-up request." };
  }
  const source = await prisma.socialContentItem.findUnique({
    where: { id: sourceId },
    select: {
      id: true,
      title: true,
      campaignEventId: true,
      messageToneMode: true,
      strategicInsight: { select: { recommendedNextTone: true } },
    },
  });
  if (!source) return { ok: false, error: "Source work item not found." };
  const actor = await getAdminActorUserId();
  const tone = source.strategicInsight?.recommendedNextTone ?? source.messageToneMode ?? null;
  let title = "Follow-up";
  let kind: SocialContentKind = SocialContentKind.ORGANIC;
  if (template === "followup") {
    title = `Follow-up: ${source.title ?? "post"}`;
  } else if (template === "county") {
    title = `County follow-up: ${source.title ?? "post"}`;
  } else if (template === "volunteer") {
    title = `Volunteer path: ${source.title ?? "post"}`;
  } else if (template === "event_promo") {
    title = `Event promo: ${source.title ?? "post"}`;
    kind = SocialContentKind.EVENT_PROMO;
  } else if (template === "post_event_recap") {
    title = `Post-event recap: ${source.title ?? "post"}`;
    kind = SocialContentKind.POST_EVENT_RECAP;
  } else {
    title = `Clarification: ${source.title ?? "post"}`;
    kind = SocialContentKind.RAPID_RESPONSE;
  }
  if (title.length > 200) title = `${title.slice(0, 197)}…`;
  const row = await prisma.socialContentItem.create({
    data: {
      title,
      kind,
      messageToneMode: tone,
      bodyCopy: null,
      status: SocialContentStatus.DRAFT,
      campaignEventId: source.campaignEventId,
      createdByUserId: actor,
    },
  });
  revalidatePath("/admin/workbench/social");
  revalidatePath("/admin/workbench");
  return { ok: true, id: row.id };
}

function formWithTemplate(sourceSocialContentItemId: string, template: string): FormData {
  const fd = new FormData();
  fd.set("sourceSocialContentItemId", sourceSocialContentItemId);
  fd.set("template", template);
  return fd;
}

/** @see createAnalyticFollowUpWorkItemAction — stable name for analytics integrations. */
export async function createFollowupSocialItemFromAnalytics(formData: FormData): Promise<AnalyticFollowUpResult> {
  const id = String(formData.get("sourceSocialContentItemId") ?? "").trim();
  return createAnalyticFollowUpWorkItemAction(formWithTemplate(id, "followup"));
}

export async function createCountyVariantFromAnalytics(formData: FormData): Promise<AnalyticFollowUpResult> {
  const id = String(formData.get("sourceSocialContentItemId") ?? "").trim();
  return createAnalyticFollowUpWorkItemAction(formWithTemplate(id, "county"));
}

export async function createVolunteerCtaFromAnalytics(formData: FormData): Promise<AnalyticFollowUpResult> {
  const id = String(formData.get("sourceSocialContentItemId") ?? "").trim();
  return createAnalyticFollowUpWorkItemAction(formWithTemplate(id, "volunteer"));
}

export async function createClarificationPostFromAnalytics(formData: FormData): Promise<AnalyticFollowUpResult> {
  const id = String(formData.get("sourceSocialContentItemId") ?? "").trim();
  return createAnalyticFollowUpWorkItemAction(formWithTemplate(id, "clarification"));
}

/** Event-anchored promo draft; `WorkflowIntake` creation can be added when product defines the flow. */
export async function createEventPromoFromAnalytics(formData: FormData): Promise<AnalyticFollowUpResult> {
  const id = String(formData.get("sourceSocialContentItemId") ?? "").trim();
  return createAnalyticFollowUpWorkItemAction(formWithTemplate(id, "event_promo"));
}

/** Post-event recap draft. */
export async function createPostEventRecapFromAnalytics(formData: FormData): Promise<AnalyticFollowUpResult> {
  const id = String(formData.get("sourceSocialContentItemId") ?? "").trim();
  return createAnalyticFollowUpWorkItemAction(formWithTemplate(id, "post_event_recap"));
}
