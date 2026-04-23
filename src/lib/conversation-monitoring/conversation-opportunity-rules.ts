/**
 * Reusable rules for creating/updating `ConversationOpportunity` from analyzed items.
 * Campaign-safe: public signals only; no private-person tracking.
 */
import {
  ConversationItemStatus,
  ConversationOpportunityStatus,
  ConversationUrgency,
} from "@prisma/client";
import { getAdminActorUserId } from "@/lib/admin/actor";
import { prisma } from "@/lib/db";

export type OpportunitySyncResult = {
  opportunityId: string | null;
  action: "created" | "updated" | "skipped";
};

type RuleDecision = {
  create: boolean;
  title: string;
  actionTemplate: string;
  urgency: ConversationUrgency;
};

function decideRules(
  item: { countyId: string | null },
  a: {
    classification: string;
    issueTags: string[];
    urgency: ConversationUrgency;
  },
  repeatedCountyIssue: boolean
): RuleDecision | null {
  const tags = a.issueTags;
  if (a.classification === "QUESTION" || tags.includes("confusion_signal") || tags.includes("curious_question")) {
    return {
      create: true,
      title: tags.includes("confusion_signal") ? "Clarification (confusion signal)" : "FAQ / question (public thread)",
      actionTemplate: tags.includes("confusion_signal") ? "CLARIFICATION" : "FAQ_CANDIDATE",
      urgency: a.urgency,
    };
  }
  if (tags.includes("media_interest") && (a.urgency === "HIGH" || a.urgency === "BREAKING")) {
    return {
      create: true,
      title: "Urgent media / press triage",
      actionTemplate: "MEDIA_URGENT",
      urgency: a.urgency,
    };
  }
  if (a.classification === "MISINFO_RISK" || tags.includes("correction_candidate")) {
    return {
      create: true,
      title: "Correction / misinfo review",
      actionTemplate: "MISINFO_REVIEW",
      urgency: a.urgency,
    };
  }
  if (tags.includes("supporter_rising") && a.classification === "SUPPORT") {
    return {
      create: true,
      title: "Supporter / volunteer follow-up",
      actionTemplate: "VOLUNTEER_FOLLOWUP",
      urgency: a.urgency,
    };
  }
  if (repeatedCountyIssue && item.countyId) {
    return {
      create: true,
      title: "County follow-up (repeated public signal)",
      actionTemplate: "COUNTY_FOLLOWUP",
      urgency: a.urgency,
    };
  }
  return null;
}

export async function syncOpportunityForAnalyzedItem(conversationItemId: string): Promise<OpportunitySyncResult> {
  const item = await prisma.conversationItem.findUnique({
    where: { id: conversationItemId },
    include: { analysis: true, opportunityAsPrimary: true },
  });
  if (!item?.analysis) {
    return { opportunityId: null, action: "skipped" };
  }
  const a = item.analysis;
  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  let repeatedCountyIssue = false;
  if (item.countyId) {
    const n = await prisma.conversationItem.count({
      where: {
        countyId: item.countyId,
        id: { not: item.id },
        status: { not: ConversationItemStatus.DISMISSED },
        ingestedAt: { gte: since },
        analysis: { is: { classification: a.classification } },
      },
    });
    repeatedCountyIssue = n >= 2;
  }
  const decision = decideRules({ countyId: item.countyId }, a, repeatedCountyIssue);
  if (!decision?.create) {
    return { opportunityId: item.opportunityAsPrimary?.id ?? null, action: "skipped" };
  }
  const actor = await getAdminActorUserId();
  const existing = item.opportunityAsPrimary;
  if (existing) {
    const updated = await prisma.conversationOpportunity.update({
      where: { id: existing.id },
      data: {
        title: decision.title,
        summary: a.summary,
        urgency: decision.urgency,
        suggestedTone: a.suggestedTone,
        actionTemplate: decision.actionTemplate,
        countyId: item.countyId ?? undefined,
        metadata: {
          ...((existing.metadata as object) ?? {}),
          rulesEngine: "opportunity-rules-v1",
          lastRuleSyncAt: new Date().toISOString(),
        } as object,
      },
    });
    return { opportunityId: updated.id, action: "updated" };
  }
  const created = await prisma.conversationOpportunity.create({
    data: {
      title: decision.title,
      summary: a.summary,
      status: ConversationOpportunityStatus.OPEN,
      urgency: decision.urgency,
      suggestedTone: a.suggestedTone,
      actionTemplate: decision.actionTemplate,
      countyId: item.countyId,
      primaryConversationItemId: item.id,
      metadata: {
        rulesEngine: "opportunity-rules-v1",
        conversationAnalysisId: a.id,
      } as object,
      ...(actor ? { createdByUserId: actor } : {}),
    },
  });
  return { opportunityId: created.id, action: "created" };
}
