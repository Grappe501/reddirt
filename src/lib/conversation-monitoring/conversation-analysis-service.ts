import { ConversationItemStatus } from "@prisma/client";
import { prisma } from "@/lib/db";
import { CONVERSATION_ANALYZER_VERSION, runDeterministicAnalysis } from "./deterministic-analyzer";
import { syncOpportunityForAnalyzedItem } from "./conversation-opportunity-rules";

export type AnalyzeOneResult = {
  conversationItemId: string;
  analysisId: string;
  opportunityId: string | null;
  opportunityAction: "created" | "updated" | "skipped";
  classification: string;
};

function toJsonValue(v: Record<string, unknown>): object {
  return JSON.parse(JSON.stringify(v)) as object;
}

export async function analyzeConversationItemById(conversationItemId: string): Promise<AnalyzeOneResult> {
  const item = await prisma.conversationItem.findUnique({
    where: { id: conversationItemId },
    include: { watchlist: { select: { filterSpec: true } } },
  });
  if (!item) {
    throw new Error("ConversationItem not found");
  }
  const out = await runDeterministicAnalysis(item, { watchlistFilterHint: item.watchlist?.filterSpec });
  const analysisRow = await prisma.conversationAnalysis.upsert({
    where: { conversationItemId: item.id },
    create: {
      conversationItemId: item.id,
      summary: out.summary,
      classification: out.classification,
      sentiment: out.sentiment,
      urgency: out.urgency,
      suggestedTone: out.suggestedTone,
      issueTags: out.issueTags,
      countyInferenceNote: out.countyInferenceNote,
      suggestedAction: out.suggestedAction,
      confidenceJson: toJsonValue(out.confidenceJson),
      analyzerVersion: CONVERSATION_ANALYZER_VERSION,
      analyzedAt: new Date(),
    },
    update: {
      summary: out.summary,
      classification: out.classification,
      sentiment: out.sentiment,
      urgency: out.urgency,
      suggestedTone: out.suggestedTone,
      issueTags: out.issueTags,
      countyInferenceNote: out.countyInferenceNote,
      suggestedAction: out.suggestedAction,
      confidenceJson: toJsonValue(out.confidenceJson),
      analyzerVersion: CONVERSATION_ANALYZER_VERSION,
      analyzedAt: new Date(),
    },
  });
  await prisma.conversationItem.update({
    where: { id: item.id },
    data: {
      status: item.status === ConversationItemStatus.NEW ? ConversationItemStatus.ENRICHED : item.status,
    },
  });
  const opp = await syncOpportunityForAnalyzedItem(item.id);
  return {
    conversationItemId: item.id,
    analysisId: analysisRow.id,
    opportunityId: opp.opportunityId,
    opportunityAction: opp.action,
    classification: out.classification,
  };
}

export async function analyzeUnanalyzedConversationItems(limit: number): Promise<{
  ok: true;
  processed: AnalyzeOneResult[];
  errors: { conversationItemId: string; message: string }[];
}> {
  const take = Math.min(50, Math.max(1, limit));
  const items = await prisma.conversationItem.findMany({
    where: { analysis: { is: null } },
    select: { id: true },
    orderBy: { ingestedAt: "desc" },
    take,
  });
  const processed: AnalyzeOneResult[] = [];
  const errors: { conversationItemId: string; message: string }[] = [];
  for (const it of items) {
    try {
      processed.push(await analyzeConversationItemById(it.id));
    } catch (e) {
      errors.push({
        conversationItemId: it.id,
        message: e instanceof Error ? e.message : String(e),
      });
    }
  }
  return { ok: true, processed, errors };
}
