"use server";

import {
  CommsPlanAudienceSegmentStatus,
  CommsPlanAudienceSegmentType,
} from "@prisma/client";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireAdminAction } from "@/app/admin/owned-media-auth";
import { getAdminActorUserId } from "@/lib/admin/actor";
import { parseRuleDefinitionForStorage } from "@/lib/contact-engagement/segment-rule-definition";
import {
  addCommsPlanAudienceSegmentMemberInputSchema,
  archiveCommsPlanAudienceSegmentInputSchema,
  createCommsPlanAudienceSegmentInputSchema,
  removeCommsPlanAudienceSegmentMemberInputSchema,
  updateCommsPlanAudienceSegmentInputSchema,
} from "@/lib/contact-engagement/segment-schemas";

const PLAN_PATH = (id: string) => `/admin/workbench/comms/plans/${id}` as const;
const SEG_PATH = (planId: string, segId: string) => `${PLAN_PATH(planId)}/segments/${segId}` as const;

type Ok<T> = { ok: true } & T;
type Err = { ok: false; error: string };
type ActionResult = Ok<{ comsPlanAudienceSegmentId: string }> | Err;
type IdResult = ActionResult;
type SimpleResult = { ok: true } | Err;

function revalidatePlan(planId: string, segId?: string) {
  revalidatePath(PLAN_PATH(planId));
  revalidatePath("/admin/workbench/comms/plans");
  if (segId) revalidatePath(SEG_PATH(planId, segId));
}

async function assertPlanExists(communicationPlanId: string) {
  const p = await prisma.communicationPlan.findUnique({ where: { id: communicationPlanId }, select: { id: true } });
  return p != null;
}

async function assertSegmentInPlan(communicationPlanId: string, comsPlanAudienceSegmentId: string) {
  return prisma.commsPlanAudienceSegment.findFirst({
    where: { id: comsPlanAudienceSegmentId, communicationPlanId },
    include: { _count: { select: { members: true } } },
  });
}

/** Block duplicate **active** segment names in the same plan (case-insensitive, trimmed). */
async function hasDuplicateSegmentName(
  communicationPlanId: string,
  name: string,
  excludeSegmentId?: string
): Promise<boolean> {
  const t = name.trim();
  if (!t) return false;
  const all = await prisma.commsPlanAudienceSegment.findMany({
    where: {
      communicationPlanId,
      status: CommsPlanAudienceSegmentStatus.ACTIVE,
      ...(excludeSegmentId ? { id: { not: excludeSegmentId } } : {}),
    },
    select: { name: true },
  });
  const lower = t.toLowerCase();
  return all.some((r) => r.name.trim().toLowerCase() === lower);
}

export async function createCommsPlanAudienceSegmentAction(raw: unknown): Promise<IdResult> {
  await requireAdminAction();
  const parsed = createCommsPlanAudienceSegmentInputSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const d = parsed.data;
  if (!(await assertPlanExists(d.communicationPlanId))) {
    return { ok: false, error: "Message plan not found." };
  }
  if (await hasDuplicateSegmentName(d.communicationPlanId, d.name)) {
    return { ok: false, error: "An active segment with this name already exists for this plan." };
  }
  const rule = parseRuleDefinitionForStorage(d.ruleDefinitionJson, { isDynamic: d.isDynamic });
  if (!rule.ok) return { ok: false, error: rule.error };
  if (!d.isDynamic && d.segmentType !== CommsPlanAudienceSegmentType.STATIC) {
    return { ok: false, error: "Use segment type STATIC for manual (static) groups." };
  }
  const actor = await getAdminActorUserId();
  try {
    const row = await prisma.commsPlanAudienceSegment.create({
      data: {
        communicationPlanId: d.communicationPlanId,
        name: d.name.trim(),
        description: d.description?.trim() || null,
        segmentType: d.segmentType,
        status: d.status,
        isDynamic: d.isDynamic,
        ruleDefinitionJson: rule.json,
        createdByUserId: actor,
        updatedByUserId: actor,
      },
    });
    revalidatePlan(d.communicationPlanId, row.id);
    return { ok: true, comsPlanAudienceSegmentId: row.id };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Create failed";
    return { ok: false, error: msg };
  }
}

export async function updateCommsPlanAudienceSegmentAction(raw: unknown): Promise<SimpleResult> {
  await requireAdminAction();
  const parsed = updateCommsPlanAudienceSegmentInputSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const d = parsed.data;
  const seg = await assertSegmentInPlan(d.communicationPlanId, d.comsPlanAudienceSegmentId);
  if (!seg) return { ok: false, error: "Segment not found for this plan." };
  if (d.name != null && (await hasDuplicateSegmentName(d.communicationPlanId, d.name, d.comsPlanAudienceSegmentId))) {
    return { ok: false, error: "An active segment with this name already exists for this plan." };
  }

  const nextIsDynamic = d.isDynamic ?? seg.isDynamic;
  const nextType = d.segmentType ?? seg.segmentType;
  if (nextIsDynamic) {
    if (nextType === CommsPlanAudienceSegmentType.STATIC) {
      return { ok: false, error: "Invalid combination: dynamic mode with type STATIC." };
    }
  } else {
    if (nextType === CommsPlanAudienceSegmentType.DYNAMIC) {
      return { ok: false, error: "Invalid combination: static mode with type DYNAMIC." };
    }
  }
  if (seg._count.members > 0 && d.isDynamic === true && !seg.isDynamic) {
    return { ok: false, error: "Cannot switch to a dynamic segment while members exist. Remove members or archive and create a new segment." };
  }
  if (seg._count.members > 0 && d.segmentType === CommsPlanAudienceSegmentType.DYNAMIC && seg.segmentType === CommsPlanAudienceSegmentType.STATIC) {
    return { ok: false, error: "Cannot change to type DYNAMIC while members exist. Remove members first." };
  }
  const actor = await getAdminActorUserId();
  const data: {
    name?: string;
    description?: string | null;
    status?: CommsPlanAudienceSegmentStatus;
    segmentType?: CommsPlanAudienceSegmentType;
    isDynamic?: boolean;
    ruleDefinitionJson?: object;
    updatedByUserId: string | null;
  } = { updatedByUserId: actor };
  if (d.name != null) data.name = d.name.trim();
  if (d.description !== undefined) data.description = d.description?.trim() || null;
  if (d.status != null) data.status = d.status;
  if (d.segmentType != null) data.segmentType = d.segmentType;
  if (d.isDynamic != null) data.isDynamic = d.isDynamic;
  if (d.ruleDefinitionJson !== undefined) {
    const rule = parseRuleDefinitionForStorage(d.ruleDefinitionJson, { isDynamic: nextIsDynamic });
    if (!rule.ok) return { ok: false, error: rule.error };
    data.ruleDefinitionJson = rule.json;
  }
  try {
    await prisma.commsPlanAudienceSegment.update({
      where: { id: d.comsPlanAudienceSegmentId },
      data,
    });
    revalidatePlan(d.communicationPlanId, d.comsPlanAudienceSegmentId);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Update failed" };
  }
}

export async function archiveCommsPlanAudienceSegmentAction(raw: unknown): Promise<SimpleResult> {
  await requireAdminAction();
  const parsed = archiveCommsPlanAudienceSegmentInputSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const d = parsed.data;
  const seg = await assertSegmentInPlan(d.communicationPlanId, d.comsPlanAudienceSegmentId);
  if (!seg) return { ok: false, error: "Segment not found for this plan." };
  const actor = await getAdminActorUserId();
  await prisma.commsPlanAudienceSegment.update({
    where: { id: d.comsPlanAudienceSegmentId },
    data: { status: CommsPlanAudienceSegmentStatus.ARCHIVED, updatedByUserId: actor },
  });
  revalidatePlan(d.communicationPlanId, d.comsPlanAudienceSegmentId);
  return { ok: true };
}

export async function addCommsPlanAudienceSegmentMemberAction(raw: unknown): Promise<SimpleResult> {
  await requireAdminAction();
  const parsed = addCommsPlanAudienceSegmentMemberInputSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const d = parsed.data;
  const seg = await assertSegmentInPlan(d.communicationPlanId, d.comsPlanAudienceSegmentId);
  if (!seg) return { ok: false, error: "Segment not found for this plan." };
  if (seg.isDynamic) {
    return { ok: false, error: "Dynamic segments do not use manual membership in this release. Edit rules only." };
  }
  if (seg.segmentType !== CommsPlanAudienceSegmentType.STATIC) {
    return { ok: false, error: "Only static segments support manual members." };
  }
  if (seg.status === CommsPlanAudienceSegmentStatus.ARCHIVED) {
    return { ok: false, error: "Cannot add members to an archived segment." };
  }
  const actor = await getAdminActorUserId();
  if (d.userId) {
    const u = await prisma.user.findUnique({ where: { id: d.userId }, select: { id: true } });
    if (!u) return { ok: false, error: "User not found." };
    const dupe = await prisma.commsPlanAudienceSegmentMember.findFirst({
      where: { comsPlanAudienceSegmentId: d.comsPlanAudienceSegmentId, userId: d.userId },
    });
    if (dupe) return { ok: false, error: "This user is already in the segment." };
    await prisma.commsPlanAudienceSegmentMember.create({
      data: {
        comsPlanAudienceSegmentId: d.comsPlanAudienceSegmentId,
        userId: d.userId,
        volunteerProfileId: null,
        crmContactKey: null,
        sourceType: d.sourceType,
        addedByUserId: actor,
      },
    });
  } else if (d.volunteerProfileId) {
    const v = await prisma.volunteerProfile.findUnique({ where: { id: d.volunteerProfileId }, select: { id: true } });
    if (!v) return { ok: false, error: "Volunteer profile not found." };
    const dupe = await prisma.commsPlanAudienceSegmentMember.findFirst({
      where: { comsPlanAudienceSegmentId: d.comsPlanAudienceSegmentId, volunteerProfileId: d.volunteerProfileId },
    });
    if (dupe) return { ok: false, error: "This volunteer is already in the segment." };
    await prisma.commsPlanAudienceSegmentMember.create({
      data: {
        comsPlanAudienceSegmentId: d.comsPlanAudienceSegmentId,
        userId: null,
        volunteerProfileId: d.volunteerProfileId,
        crmContactKey: null,
        sourceType: d.sourceType,
        addedByUserId: actor,
      },
    });
  } else if (d.crmContactKey) {
    const key = d.crmContactKey.trim();
    const dupe = await prisma.commsPlanAudienceSegmentMember.findFirst({
      where: { comsPlanAudienceSegmentId: d.comsPlanAudienceSegmentId, crmContactKey: key },
    });
    if (dupe) return { ok: false, error: "This CRM key is already in the segment." };
    await prisma.commsPlanAudienceSegmentMember.create({
      data: {
        comsPlanAudienceSegmentId: d.comsPlanAudienceSegmentId,
        userId: null,
        volunteerProfileId: null,
        crmContactKey: key,
        sourceType: d.sourceType,
        addedByUserId: actor,
      },
    });
  } else {
    return { ok: false, error: "No identity to add." };
  }
  revalidatePlan(d.communicationPlanId, d.comsPlanAudienceSegmentId);
  return { ok: true };
}

export async function removeCommsPlanAudienceSegmentMemberAction(raw: unknown): Promise<SimpleResult> {
  await requireAdminAction();
  const parsed = removeCommsPlanAudienceSegmentMemberInputSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const d = parsed.data;
  const seg = await assertSegmentInPlan(d.communicationPlanId, d.comsPlanAudienceSegmentId);
  if (!seg) return { ok: false, error: "Segment not found for this plan." };
  if (seg.isDynamic) {
    return { ok: false, error: "Cannot remove members from a dynamic segment via this action." };
  }
  const m = await prisma.commsPlanAudienceSegmentMember.findFirst({
    where: { id: d.memberId, comsPlanAudienceSegmentId: d.comsPlanAudienceSegmentId },
  });
  if (!m) return { ok: false, error: "Member not found." };
  await prisma.commsPlanAudienceSegmentMember.delete({ where: { id: d.memberId } });
  revalidatePlan(d.communicationPlanId, d.comsPlanAudienceSegmentId);
  return { ok: true };
}
