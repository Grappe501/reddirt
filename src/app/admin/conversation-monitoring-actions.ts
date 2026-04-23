"use server";

import { revalidatePath } from "next/cache";
import { getConversationItemDetail } from "@/lib/conversation-monitoring/conversation-monitoring-queries";
import {
  analyzeConversationItemById,
  analyzeUnanalyzedConversationItems,
  type AnalyzeOneResult,
} from "@/lib/conversation-monitoring/conversation-analysis-service";
import {
  CampaignTaskPriority,
  CampaignTaskStatus,
  CampaignTaskType,
  ConversationOpportunityStatus,
  SocialContentKind,
  SocialContentStatus,
  WorkflowIntakeStatus,
} from "@prisma/client";
import { requireAdminAction } from "@/app/admin/owned-media-auth";
import { getAdminActorUserId } from "@/lib/admin/actor";
import { prisma } from "@/lib/db";

type Ok<T> = T extends void ? { ok: true } : { ok: true } & T;
type Err = { ok: false; error: string };
type Result<T = void> = Ok<T> | Err;

export async function getConversationItemDetailForWorkbenchAction(id: string) {
  await requireAdminAction();
  if (!id.trim()) return null;
  return getConversationItemDetail(id);
}

async function revalidateMon() {
  revalidatePath("/admin/workbench/social");
  revalidatePath("/admin/workbench");
}

/**
 * Create `WorkflowIntake` + `SocialContentItem` (rapid response) from a monitoring item, and link opportunity.
 * TODO: optional dedupe with existing op for same `primaryConversationItemId`.
 */
export async function createRapidResponseFromConversationItemAction(conversationItemId: string): Promise<Result<{ opportunityId: string; intakeId: string; socialId: string }>> {
  await requireAdminAction();
  const item = await prisma.conversationItem.findUnique({
    where: { id: conversationItemId },
    include: { analysis: true, county: true, opportunityAsPrimary: true },
  });
  if (!item) {
    return { ok: false, error: "Conversation item not found." };
  }
  const actor = await getAdminActorUserId();
  const title = item.title?.trim() || `Rapid response: ${item.channel}`;
  const bodySeed = (item.analysis?.suggestedAction?.trim() || item.bodyText).slice(0, 20000);
  const result = await prisma.$transaction(async (tx) => {
    const intake = await tx.workflowIntake.create({
      data: {
        title: title.slice(0, 200),
        source: "conversation_monitoring",
        status: WorkflowIntakeStatus.IN_REVIEW,
        countyId: item.countyId,
        metadata: { origin: "RAPID_RESPONSE", conversationItemId: item.id } as object,
        ...(actor ? { assignedUserId: actor } : {}),
      },
    });
    const social = await tx.socialContentItem.create({
      data: {
        title: title.slice(0, 200),
        bodyCopy: bodySeed,
        kind: SocialContentKind.RAPID_RESPONSE,
        status: SocialContentStatus.DRAFT,
        workflowIntakeId: intake.id,
        ...(actor ? { createdByUserId: actor } : {}),
      },
    });
    const opp = await tx.conversationOpportunity.upsert({
      where: { primaryConversationItemId: item.id },
      create: {
        title: `RR: ${title.slice(0, 90)}`,
        summary: item.analysis?.summary,
        status: ConversationOpportunityStatus.CONVERTED,
        urgency: item.analysis?.urgency ?? undefined,
        suggestedTone: item.analysis?.suggestedTone,
        actionTemplate: "RAPID_RESPONSE",
        countyId: item.countyId,
        primaryConversationItemId: item.id,
        clusterId: null,
        workflowIntakeId: intake.id,
        socialContentItemId: social.id,
        ...(actor ? { createdByUserId: actor } : {}),
        convertedAt: new Date(),
        metadata: {} as object,
      },
      update: {
        workflowIntakeId: intake.id,
        socialContentItemId: social.id,
        status: ConversationOpportunityStatus.CONVERTED,
        convertedAt: new Date(),
      },
    });
    return { intakeId: intake.id, socialId: social.id, opportunityId: opp.id };
  });
  await revalidateMon();
  return { ok: true, ...result };
}

export async function createClarificationPostFromConversationItemAction(conversationItemId: string): Promise<Result<{ socialId: string }>> {
  await requireAdminAction();
  const item = await prisma.conversationItem.findUnique({ where: { id: conversationItemId }, include: { analysis: true } });
  if (!item) return { ok: false, error: "Item not found." };
  const actor = await getAdminActorUserId();
  const social = await prisma.socialContentItem.create({
    data: {
      title: `Clarification: ${(item.title ?? "public thread").slice(0, 120)}`,
      bodyCopy: (item.analysis?.suggestedAction?.trim() || "Draft clarification (fact-forward, non-negative).").slice(0, 20000),
      kind: SocialContentKind.ORGANIC,
      status: SocialContentStatus.DRAFT,
      ...(actor ? { createdByUserId: actor } : {}),
      metadata: { origin: "CLARIFICATION", conversationItemId: item.id } as object,
    },
  });
  await prisma.conversationOpportunity.upsert({
    where: { primaryConversationItemId: item.id },
    create: {
      title: "Clarification post",
      status: ConversationOpportunityStatus.ROUTED,
      actionTemplate: "CLARIFICATION",
      primaryConversationItemId: item.id,
      socialContentItemId: social.id,
      countyId: item.countyId,
      ...(actor ? { createdByUserId: actor } : {}),
    },
    update: { socialContentItemId: social.id, status: ConversationOpportunityStatus.ROUTED },
  });
  await revalidateMon();
  return { ok: true, socialId: social.id };
}

export async function createFaqDraftFromConversationItemAction(conversationItemId: string): Promise<Result<{ socialId: string }>> {
  await requireAdminAction();
  const item = await prisma.conversationItem.findUnique({ where: { id: conversationItemId }, include: { analysis: true } });
  if (!item) return { ok: false, error: "Item not found." };
  const actor = await getAdminActorUserId();
  const social = await prisma.socialContentItem.create({
    data: {
      title: "FAQ / myth vs fact (draft)",
      bodyCopy: (item.analysis?.summary?.trim() || item.bodyText).slice(0, 20000),
      kind: SocialContentKind.ORGANIC,
      status: SocialContentStatus.DRAFT,
      ...(actor ? { createdByUserId: actor } : {}),
      metadata: { origin: "FAQ", conversationItemId: item.id } as object,
    },
  });
  await prisma.conversationOpportunity.upsert({
    where: { primaryConversationItemId: item.id },
    create: {
      title: "FAQ draft",
      actionTemplate: "FAQ",
      primaryConversationItemId: item.id,
      socialContentItemId: social.id,
      countyId: item.countyId,
      status: ConversationOpportunityStatus.ROUTED,
      ...(actor ? { createdByUserId: actor } : {}),
    },
    update: { socialContentItemId: social.id, status: ConversationOpportunityStatus.ROUTED },
  });
  await revalidateMon();
  return { ok: true, socialId: social.id };
}

export async function routeOpportunityToCountyAction(params: { opportunityId: string; countyId: string }): Promise<Result<void>> {
  await requireAdminAction();
  const { opportunityId, countyId } = params;
  const c = await prisma.county.findUnique({ where: { id: countyId } });
  if (!c) return { ok: false, error: "County not found." };
  await prisma.conversationOpportunity.update({
    where: { id: opportunityId },
    data: { countyId, metadata: { routedToCountyAt: new Date().toISOString() } as object },
  });
  await revalidateMon();
  return { ok: true };
}

export async function addWatchlistAction(formData: FormData): Promise<Result<{ id: string }>> {
  await requireAdminAction();
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { ok: false, error: "Name required." };
  const countyId = String(formData.get("countyId") ?? "").trim() || null;
  const description = String(formData.get("description") ?? "").trim() || null;
  const actor = await getAdminActorUserId();
  const w = await prisma.conversationWatchlist.create({
    data: {
      name: name.slice(0, 200),
      description,
      countyId,
      ...(actor ? { createdByUserId: actor } : {}),
      filterSpec: {} as object,
    },
  });
  await revalidateMon();
  return { ok: true, id: w.id };
}

/** Run rules-based analysis and persist `ConversationAnalysis` (+ optional opportunity). */
export async function analyzeConversationItemAction(
  conversationItemId: string
): Promise<Result<AnalyzeOneResult> | { ok: false; error: string }> {
  await requireAdminAction();
  if (!conversationItemId.trim()) return { ok: false, error: "Missing conversation item id." };
  try {
    const r = await analyzeConversationItemById(conversationItemId);
    await revalidateMon();
    return { ok: true, ...r };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Analysis failed" };
  }
}

/** Batch-analyze items with no `ConversationAnalysis` yet (recent first). */
export async function analyzeRecentUnanalyzedConversationItemsAction(
  limit = 25
): Promise<
  { ok: true; processed: AnalyzeOneResult[]; errors: { conversationItemId: string; message: string }[] } | { ok: false; error: string }
> {
  await requireAdminAction();
  try {
    const out = await analyzeUnanalyzedConversationItems(limit);
    await revalidateMon();
    return { ok: true, processed: out.processed, errors: out.errors };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Batch analysis failed" };
  }
}

/**
 * Set target county, mark opportunity as routed, and optionally create `WorkflowIntake` / `SocialContentItem` / `CampaignTask`.
 * Additive: aligns with workbench + workflow spine.
 */
export async function routeConversationItemToCountyAction(params: {
  conversationItemId: string;
  countyId: string;
  createWorkflowIntake?: boolean;
  createSocialContentItem?: boolean;
  createCampaignTask?: boolean;
}): Promise<
  Result<{
    opportunityId: string;
    workflowIntakeId?: string;
    socialContentItemId?: string;
    campaignTaskId?: string;
  }>
> {
  await requireAdminAction();
  const {
    conversationItemId,
    countyId,
    createWorkflowIntake = true,
    createSocialContentItem: wantSocial = false,
    createCampaignTask: wantTask = false,
  } = params;
  const county = await prisma.county.findUnique({ where: { id: countyId } });
  if (!county) return { ok: false, error: "County not found." };
  const item = await prisma.conversationItem.findUnique({
    where: { id: conversationItemId },
    include: { analysis: true, opportunityAsPrimary: true },
  });
  if (!item) return { ok: false, error: "Conversation item not found." };
  const actor = await getAdminActorUserId();
  const baseTitle = item.title?.trim() || `Public signal: ${item.channel}`;

  const out = await prisma.$transaction(async (tx) => {
    let opportunityId: string;
    if (item.opportunityAsPrimary) {
      const prev = item.opportunityAsPrimary;
      const u = await tx.conversationOpportunity.update({
        where: { id: prev.id },
        data: {
          countyId,
          status: ConversationOpportunityStatus.ROUTED,
          metadata: {
            ...((prev.metadata as object) ?? {}),
            countyRoutedAt: new Date().toISOString(),
            countyRoute: { source: "conversation_monitoring", version: 1 },
          } as object,
        },
      });
      opportunityId = u.id;
    } else {
      const o = await tx.conversationOpportunity.create({
        data: {
          title: `County route: ${baseTitle.slice(0, 80)}`,
          summary: item.analysis?.summary,
          status: ConversationOpportunityStatus.ROUTED,
          urgency: item.analysis?.urgency,
          suggestedTone: item.analysis?.suggestedTone,
          actionTemplate: "COUNTY_ROUTE",
          countyId,
          primaryConversationItemId: item.id,
          metadata: { countyRoutedAt: new Date().toISOString() } as object,
          ...(actor ? { createdByUserId: actor } : {}),
        },
      });
      opportunityId = o.id;
    }
    let workflowIntakeId: string | undefined;
    let socialContentItemId: string | undefined;
    let campaignTaskId: string | undefined;
    if (createWorkflowIntake) {
      const intake = await tx.workflowIntake.create({
        data: {
          title: `${county.displayName} — ${baseTitle}`.slice(0, 200),
          source: "conversation_monitoring",
          status: WorkflowIntakeStatus.IN_REVIEW,
          countyId,
          metadata: { conversationItemId: item.id, opportunityId, countyRoute: true } as object,
          ...(actor ? { assignedUserId: actor } : {}),
        },
      });
      workflowIntakeId = intake.id;
      await tx.conversationOpportunity.update({ where: { id: opportunityId }, data: { workflowIntakeId: intake.id } });
    }
    if (wantSocial) {
      const bodySeed = (item.analysis?.suggestedAction?.trim() || item.bodyText).slice(0, 20000);
      const social = await tx.socialContentItem.create({
        data: {
          title: baseTitle.slice(0, 200),
          bodyCopy: bodySeed,
          kind: SocialContentKind.ORGANIC,
          status: SocialContentStatus.DRAFT,
          workflowIntakeId: workflowIntakeId ?? null,
          metadata: { origin: "county_route", conversationItemId: item.id, routedCountyId: countyId } as object,
          ...(actor ? { createdByUserId: actor } : {}),
        },
      });
      socialContentItemId = social.id;
      await tx.conversationOpportunity.update({ where: { id: opportunityId }, data: { socialContentItemId: social.id } });
    }
    if (wantTask && socialContentItemId) {
      const task = await tx.campaignTask.create({
        data: {
          title: "County follow-up: conversation signal",
          description: "Created from conversation monitoring county route.",
          taskType: CampaignTaskType.COMMS,
          priority: CampaignTaskPriority.MEDIUM,
          status: CampaignTaskStatus.TODO,
          socialContentItemId,
          countyId,
          ...(actor ? { createdByUserId: actor } : {}),
        },
      });
      campaignTaskId = task.id;
    }
    return { opportunityId, workflowIntakeId, socialContentItemId, campaignTaskId };
  });
  await revalidateMon();
  return { ok: true, ...out };
}

/**
 * Mark an opportunity (creating one if needed) for later candidate-brief sync.
 * `metadata.candidateBrief` — full briefing pipeline TBD.
 */
export async function addConversationItemToCandidateBriefAction(
  conversationItemId: string
): Promise<Result<{ opportunityId: string }>> {
  await requireAdminAction();
  const item = await prisma.conversationItem.findUnique({
    where: { id: conversationItemId },
    include: { opportunityAsPrimary: true, analysis: true },
  });
  if (!item) return { ok: false, error: "Conversation item not found." };
  const actor = await getAdminActorUserId();
  let opp = item.opportunityAsPrimary;
  if (!opp) {
    opp = await prisma.conversationOpportunity.create({
      data: {
        title: `Brief candidate: ${(item.title ?? "public signal").slice(0, 80)}`,
        summary: item.analysis?.summary,
        status: ConversationOpportunityStatus.OPEN,
        primaryConversationItemId: item.id,
        countyId: item.countyId,
        urgency: item.analysis?.urgency,
        suggestedTone: item.analysis?.suggestedTone,
        actionTemplate: "BRIEF_CANDIDATE",
        metadata: {} as object,
        ...(actor ? { createdByUserId: actor } : {}),
      },
    });
  }
  const meta = (opp.metadata as Record<string, unknown> | null) ?? {};
  await prisma.conversationOpportunity.update({
    where: { id: opp.id },
    data: {
      metadata: {
        ...meta,
        candidateBrief: {
          flaggedAt: new Date().toISOString(),
          conversationItemId: item.id,
          /** TODO: wire to org-wide candidate briefing / research queue. */
          integration: "placeholder",
        },
      } as object,
    },
  });
  await revalidateMon();
  return { ok: true, opportunityId: opp.id };
}
