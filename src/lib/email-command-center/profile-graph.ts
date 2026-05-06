/**
 * EMAIL-CONTACT-PROFILE-GRAPH-1.0 — governed staging of profile facts / audience hints from email queue + AI.
 * No SendGrid, no Gmail API, no OpenAI calls, no automatic User/VolunteerProfile writes.
 */

import { prisma } from "@/lib/db";
import type { Prisma } from "@prisma/client";
import type { EmailAiAnalysisStoredV1, EmailAiAnalysisV1 } from "@/lib/email-workflow/ai/types";
import {
  analyzeQueueItemForProfileSignals,
  buildAudienceIntelligenceV2Metadata,
  buildProfileIntelligenceV2Metadata,
  buildQueueItemProfileContextFromRow,
  suggestAudienceHintsWithEvidence,
  suggestProfileFactsWithEvidence,
} from "@/lib/email-command-center/ai-profile-intelligence";

function asMetaRecord(v: unknown): Record<string, unknown> {
  if (v != null && typeof v === "object" && !Array.isArray(v)) {
    return v as Record<string, unknown>;
  }
  return {};
}

function extractEmailAngleBrackets(who: string | null | undefined): string | null {
  if (!who) return null;
  const m = who.match(/<([^>\s]+@[^>\s]+)>/);
  return m?.[1]?.trim().toLowerCase() ?? null;
}

function normalizeEmailForProfile(item: {
  userId: string | null;
  user: { email: string } | null;
  whoSummary: string | null;
}): string | null {
  if (item.user?.email?.trim()) return item.user.email.trim().toLowerCase();
  const fromWho = extractEmailAngleBrackets(item.whoSummary ?? undefined);
  if (fromWho) return fromWho;
  return null;
}

function isStoredAiAnalysis(v: unknown): v is EmailAiAnalysisStoredV1 {
  if (!v || typeof v !== "object" || Array.isArray(v)) return false;
  const o = v as Record<string, unknown>;
  return o.version === 1 && typeof o.generatedAt === "string";
}

/** Read persisted queue AI output from `EmailWorkflowItem.metadataJson` (no OpenAI call). */
export function getStoredEmailAiOutputFromMetadata(metadataJson: unknown): EmailAiAnalysisV1 | null {
  const meta = asMetaRecord(metadataJson);
  const rawAi = meta.emailAiAnalysis;
  if (!isStoredAiAnalysis(rawAi)) return null;
  return rawAi.output ?? null;
}

/** Build immutable provenance JSON for suggestions / facts (names only — no secrets). */
function buildAiProvenanceJson(params: {
  itemId: string;
  gmailReview: Record<string, unknown> | null;
  aiEnvelope: EmailAiAnalysisStoredV1;
  aiOutput?: EmailAiAnalysisV1 | null;
}): Prisma.InputJsonValue {
  const { itemId, gmailReview, aiEnvelope, aiOutput } = params;
  return {
    version: 1,
    emailWorkflowItemId: itemId,
    gmailReviewSource: (gmailReview ?? null) as Prisma.InputJsonValue,
    aiAnalysis: {
      generatedAt: aiEnvelope.generatedAt,
      model: aiEnvelope.model,
      promptVersion: aiEnvelope.promptVersion,
      bodyWasAvailable: aiOutput?.bodyWasAvailable ?? false,
    },
  } as Prisma.InputJsonValue;
}

export async function findOrCreateEmailContactProfileForQueueItem(itemId: string) {
  const item = await prisma.emailWorkflowItem.findUnique({
    where: { id: itemId },
    include: {
      user: { select: { email: true, name: true, county: true } },
      volunteerProfile: true,
    },
  });
  if (!item) throw new Error("Email workflow item not found.");

  if (item.emailContactProfileId) {
    const existing = await prisma.emailContactProfile.findUnique({
      where: { id: item.emailContactProfileId },
    });
    if (existing) return existing;
  }

  if (item.userId) {
    const byUser = await prisma.emailContactProfile.findFirst({
      where: { userId: item.userId },
    });
    if (byUser) {
      await prisma.emailWorkflowItem.update({
        where: { id: itemId },
        data: { emailContactProfileId: byUser.id },
      });
      return byUser;
    }
  }

  if (item.volunteerProfileId) {
    const byVol = await prisma.emailContactProfile.findFirst({
      where: { volunteerProfileId: item.volunteerProfileId },
    });
    if (byVol) {
      await prisma.emailWorkflowItem.update({
        where: { id: itemId },
        data: { emailContactProfileId: byVol.id },
      });
      return byVol;
    }
  }

  const primaryEmail = normalizeEmailForProfile(item);
  const meta = asMetaRecord(item.metadataJson);
  const gmailReview =
    typeof meta.gmailReviewSource === "object" && meta.gmailReviewSource != null && !Array.isArray(meta.gmailReviewSource)
      ? (meta.gmailReviewSource as Record<string, unknown>)
      : null;

  const displayName =
    item.user?.name?.trim() ||
    (item.whoSummary ? item.whoSummary.replace(/<[^>]+>/g, "").trim() : null) ||
    primaryEmail ||
    `Queue ${item.id.slice(0, 10)}`;

  const profileMeta: Prisma.InputJsonValue = {
    linkedFrom: "EmailWorkflowItem",
    gmailReviewMetadataOnly: gmailReview ? true : false,
  };

  const created = await prisma.emailContactProfile.create({
    data: {
      userId: item.userId,
      volunteerProfileId: item.volunteerProfileId,
      relationalContactId: null,
      primaryEmail,
      displayName: displayName.slice(0, 500),
      county: item.user?.county ?? null,
      source: "email_workflow_queue",
      metadataJson: profileMeta,
    },
  });

  await prisma.emailWorkflowItem.update({
    where: { id: itemId },
    data: { emailContactProfileId: created.id },
  });

  return created;
}

export type CreateSuggestionsResult = {
  profileFactSuggestionsCreated: number;
  audienceHintsCreated: number;
};

/**
 * Idempotent-ish: skips duplicate PENDING rows for same item + factKey + factValue /
 * duplicate PENDING audience label for item.
 */
export async function createProfileFactSuggestionsFromEmailAiAnalysis(
  itemId: string
): Promise<CreateSuggestionsResult> {
  const profile = await findOrCreateEmailContactProfileForQueueItem(itemId);

  const item = await prisma.emailWorkflowItem.findUnique({
    where: { id: itemId },
    select: {
      metadataJson: true,
      whoSummary: true,
      whatSummary: true,
      whenSummary: true,
      whereSummary: true,
      whySummary: true,
      impactSummary: true,
      recommendedResponseSummary: true,
      recommendedResponseRationale: true,
      intent: true,
      tone: true,
      sentiment: true,
    },
  });
  if (!item) throw new Error("Email workflow item not found.");

  const meta = asMetaRecord(item.metadataJson);
  const rawAi = meta.emailAiAnalysis;
  if (!isStoredAiAnalysis(rawAi)) {
    return { profileFactSuggestionsCreated: 0, audienceHintsCreated: 0 };
  }
  const envelope = rawAi;
  const out = envelope.output;
  if (!out) {
    return { profileFactSuggestionsCreated: 0, audienceHintsCreated: 0 };
  }

  const gmailReview =
    typeof meta.gmailReviewSource === "object" && meta.gmailReviewSource != null && !Array.isArray(meta.gmailReviewSource)
      ? (meta.gmailReviewSource as Record<string, unknown>)
      : null;

  const provenanceJson = buildAiProvenanceJson({
    itemId,
    gmailReview,
    aiEnvelope: envelope,
    aiOutput: out,
  });

  const limitationLines: string[] = [];
  if (gmailReview?.bodyStored === false) {
    limitationLines.push("Gmail metadata-only bridge — no Gmail body read by RedDirt.");
  }
  for (const s of out.sourceLimitations ?? []) {
    limitationLines.push(s);
  }
  for (const u of out.uncertaintyNotes ?? []) {
    const line = typeof u === "string" ? u.trim() : "";
    if (line) limitationLines.push(`AI uncertainty: ${line.slice(0, 400)}`);
  }
  for (const t of out.operatorReviewTasks ?? []) {
    const line = typeof t === "string" ? t.trim() : "";
    if (line) limitationLines.push(`AI review task: ${line.slice(0, 400)}`);
  }
  if (!out.bodyWasAvailable) {
    limitationLines.push("AI analysis: bodyWasAvailable=false.");
  }

  let profileFactSuggestionsCreated = 0;
  let audienceHintsCreated = 0;

  const existingPendingSuggestions = await prisma.emailContactProfileFactSuggestion.findMany({
    where: { emailWorkflowItemId: itemId, status: "PENDING" },
    select: { factKey: true, factValue: true },
  });
  const existingPendingHints = await prisma.emailAudienceHint.findMany({
    where: { emailWorkflowItemId: itemId, status: "PENDING" },
    select: { label: true },
  });

  const suggestionKey = (k: string, v: string) => `${k}::${v}`;
  const pendingSet = new Set(existingPendingSuggestions.map((s) => suggestionKey(s.factKey, s.factValue)));
  const hintLabelSet = new Set(existingPendingHints.map((h) => h.label));

  const gmailMetaOnly = Boolean(gmailReview && gmailReview.bodyStored !== true);
  const ctx = buildQueueItemProfileContextFromRow(item, gmailMetaOnly);

  const signals = analyzeQueueItemForProfileSignals(ctx, out);
  const enrichedFacts = suggestProfileFactsWithEvidence(ctx, out);
  const enrichedHints = suggestAudienceHintsWithEvidence(ctx, out);

  let idx = 0;
  for (const row of enrichedFacts) {
    const factValue = row.suggestedFact.trim();
    if (!factValue) continue;
    const factKey = `pi2.${row.factType}.${idx}`;
    idx += 1;
    if (pendingSet.has(suggestionKey(factKey, factValue))) continue;
    pendingSet.add(suggestionKey(factKey, factValue));

    const piMeta = buildProfileIntelligenceV2Metadata(row, signals);
    await prisma.emailContactProfileFactSuggestion.create({
      data: {
        profileId: profile.id,
        emailWorkflowItemId: itemId,
        suggestionType: "EMAIL_AI_PROFILE_INTEL_2",
        factKey,
        factValue,
        confidence: row.confidence,
        rationale: [row.whySuggested, row.evidenceText ? `Evidence: ${row.evidenceText.slice(0, 600)}` : ""]
          .filter(Boolean)
          .join("\n\n"),
        sourceLimitations: limitationLines.length ? [...new Set(limitationLines)] : [],
        status: "PENDING",
        metadataJson: {
          provenance: provenanceJson,
          profileIntelligenceV2: piMeta,
        },
      },
    });
    profileFactSuggestionsCreated += 1;
  }

  let hidx = 0;
  for (const h of enrichedHints) {
    const label = h.label.trim();
    if (!label) continue;
    if (hintLabelSet.has(label)) continue;
    hintLabelSet.add(label);

    const hiMeta = buildAudienceIntelligenceV2Metadata(h);
    await prisma.emailAudienceHint.create({
      data: {
        emailWorkflowItemId: itemId,
        profileId: profile.id,
        hintType: "EMAIL_AI_PROFILE_INTEL_2",
        label: label.slice(0, 500),
        rationale: [h.whySuggested, h.evidenceText ? `Evidence: ${h.evidenceText.slice(0, 600)}` : ""]
          .filter(Boolean)
          .join("\n\n"),
        confidence: h.confidence,
        status: "PENDING",
        metadataJson: {
          provenance: provenanceJson,
          notAppliedNotMerge: true,
          audienceIntelligenceV2: hiMeta,
        },
      },
    });
    hidx += 1;
    audienceHintsCreated += 1;
  }

  void hidx;
  return { profileFactSuggestionsCreated, audienceHintsCreated };
}

export async function listPendingProfileFactSuggestions() {
  return prisma.emailContactProfileFactSuggestion.findMany({
    where: { status: "PENDING" },
    orderBy: { createdAt: "desc" },
    include: {
      profile: true,
      emailWorkflowItem: { select: { id: true, title: true, whatSummary: true, status: true } },
    },
    take: 200,
  });
}

export async function listApprovedRecentFacts(limit = 100) {
  return prisma.emailContactProfileFact.findMany({
    where: { status: "ACTIVE" },
    orderBy: { approvedAt: "desc" },
    include: { profile: true },
    take: limit,
  });
}

export async function listPendingAudienceHints() {
  return prisma.emailAudienceHint.findMany({
    where: { status: "PENDING" },
    orderBy: { createdAt: "desc" },
    include: {
      profile: true,
      emailWorkflowItem: { select: { id: true, title: true, whatSummary: true, status: true } },
    },
    take: 200,
  });
}

export async function listProfileFactsForQueueItem(itemId: string) {
  const item = await prisma.emailWorkflowItem.findUnique({
    where: { id: itemId },
    select: { emailContactProfileId: true },
  });
  if (!item?.emailContactProfileId) return [];
  return prisma.emailContactProfileFact.findMany({
    where: { profileId: item.emailContactProfileId, status: "ACTIVE" },
    orderBy: { approvedAt: "desc" },
  });
}

export async function listSuggestionsForQueueItem(itemId: string) {
  return prisma.emailContactProfileFactSuggestion.findMany({
    where: { emailWorkflowItemId: itemId },
    orderBy: { createdAt: "desc" },
  });
}

export async function listAudienceHintsForQueueItem(itemId: string) {
  return prisma.emailAudienceHint.findMany({
    where: { emailWorkflowItemId: itemId },
    orderBy: { createdAt: "desc" },
  });
}

export async function approveProfileFactSuggestion(suggestionId: string, reviewedByUserId: string) {
  const s = await prisma.emailContactProfileFactSuggestion.findUnique({
    where: { id: suggestionId },
  });
  if (!s) throw new Error("Suggestion not found.");
  if (s.status !== "PENDING") throw new Error("Suggestion is not pending.");

  const profileId = s.profileId;
  if (!profileId) throw new Error("Suggestion has no profile link.");

  const now = new Date();
  const sourceMeta: Prisma.InputJsonValue = {
    ...(typeof s.metadataJson === "object" && s.metadataJson != null && !Array.isArray(s.metadataJson)
      ? (s.metadataJson as Record<string, unknown>)
      : {}),
    approvedFromSuggestionId: s.id,
    emailWorkflowItemId: s.emailWorkflowItemId,
  };

  await prisma.$transaction([
    prisma.emailContactProfileFact.create({
      data: {
        profileId,
        factType: "EMAIL_AI_APPROVED",
        factKey: s.factKey,
        factValue: s.factValue,
        confidence: s.confidence,
        sourceType: "EMAIL_WORKFLOW_AI_SUGGESTION",
        sourceEmailWorkflowItemId: s.emailWorkflowItemId,
        sourceMetadataJson: sourceMeta,
        status: "ACTIVE",
        approvedByUserId: reviewedByUserId,
        approvedAt: now,
      },
    }),
    prisma.emailContactProfileFactSuggestion.update({
      where: { id: suggestionId },
      data: {
        status: "APPROVED",
        reviewedByUserId,
        reviewedAt: now,
      },
    }),
  ]);
}

export async function rejectProfileFactSuggestion(suggestionId: string, reviewedByUserId: string) {
  const s = await prisma.emailContactProfileFactSuggestion.findUnique({ where: { id: suggestionId } });
  if (!s) throw new Error("Suggestion not found.");
  if (s.status !== "PENDING") throw new Error("Suggestion is not pending.");
  await prisma.emailContactProfileFactSuggestion.update({
    where: { id: suggestionId },
    data: {
      status: "REJECTED",
      reviewedByUserId,
      reviewedAt: new Date(),
    },
  });
}

export async function approveAudienceHint(hintId: string, reviewedByUserId: string) {
  const h = await prisma.emailAudienceHint.findUnique({ where: { id: hintId } });
  if (!h) throw new Error("Audience hint not found.");
  if (h.status !== "PENDING") throw new Error("Hint is not pending.");
  await prisma.emailAudienceHint.update({
    where: { id: hintId },
    data: {
      status: "APPROVED",
      reviewedByUserId,
      reviewedAt: new Date(),
      metadataJson: {
        ...(typeof h.metadataJson === "object" && h.metadataJson != null && !Array.isArray(h.metadataJson)
          ? (h.metadataJson as Record<string, unknown>)
          : {}),
        operatorApprovedAt: new Date().toISOString(),
        governanceNote:
          "Approval records staff review only — does not create SendGrid lists or CommsPlanAudienceSegment rows.",
      } as Prisma.InputJsonValue,
    },
  });
}

export async function rejectAudienceHint(hintId: string, reviewedByUserId: string) {
  const h = await prisma.emailAudienceHint.findUnique({ where: { id: hintId } });
  if (!h) throw new Error("Audience hint not found.");
  if (h.status !== "PENDING") throw new Error("Hint is not pending.");
  await prisma.emailAudienceHint.update({
    where: { id: hintId },
    data: {
      status: "REJECTED",
      reviewedByUserId,
      reviewedAt: new Date(),
    },
  });
}

/** Read-model counts — safe degrade if DB unreachable. */
export async function emailProfileGraphSnapshotCounts(): Promise<{
  pendingProfileSuggestions: number;
  pendingAudienceHints: number;
  approvedActiveFacts: number;
}> {
  try {
    const [pendingProfileSuggestions, pendingAudienceHints, approvedActiveFacts] = await Promise.all([
      prisma.emailContactProfileFactSuggestion.count({ where: { status: "PENDING" } }),
      prisma.emailAudienceHint.count({ where: { status: "PENDING" } }),
      prisma.emailContactProfileFact.count({ where: { status: "ACTIVE" } }),
    ]);
    return { pendingProfileSuggestions, pendingAudienceHints, approvedActiveFacts };
  } catch {
    return { pendingProfileSuggestions: 0, pendingAudienceHints: 0, approvedActiveFacts: 0 };
  }
}
