/**
 * Centralized compose → SocialContentItem write-back: master copy, optional saved draft rows, applied snapshots.
 * Routes should call this instead of duplicating Prisma + revalidation.
 */

import { prisma } from "@/lib/db";
import { persistWorkItemBodyCopy, saveSocialContentDraft } from "./authorStudioOperations";
import type { DraftSetData } from "./outputSchemas";

export async function loadContentDraftTextForWorkItem(
  socialContentItemId: string,
  contentDraftId: string
): Promise<string | null> {
  const row = await prisma.socialContentDraft.findFirst({
    where: { id: contentDraftId, socialContentItemId },
    select: { bodyCopy: true },
  });
  if (!row?.bodyCopy?.trim()) return null;
  return row.bodyCopy;
}

/**
 * If `selectedContentDraftId` is set, the draft’s `bodyCopy` becomes the effective master
 * (preview + persistence). Returns merged `data` and the chosen master string.
 */
export async function mergeSelectedDraftMasterIfAny(
  socialContentItemId: string | undefined,
  selectedContentDraftId: string | undefined,
  data: DraftSetData
): Promise<{ data: DraftSetData; effectiveMaster: string; usedDraft: boolean }> {
  if (!selectedContentDraftId?.trim() || !socialContentItemId) {
    return { data, effectiveMaster: data.compose.master, usedDraft: false };
  }
  const text = await loadContentDraftTextForWorkItem(socialContentItemId, selectedContentDraftId);
  if (text == null) {
    throw new Error("selectedContentDraftId does not match this work item or has no copy");
  }
  const next: DraftSetData = {
    ...data,
    compose: { ...data.compose, master: text },
  };
  return { data: next, effectiveMaster: text, usedDraft: true };
}

/**
 * Unsets `isApplied` on all prior drafts, updates `bodyCopy` on the work item, and inserts
 * a new `SocialContentDraft` with `isApplied: true` (audit / reuse).
 */
export async function persistMasterAndRecordAppliedDraft(input: {
  socialContentItemId: string;
  bodyCopy: string;
  sourceRoute: string;
  sourceIntent: string;
  /** Label for the applied snapshot row; default “Applied master”. */
  draftTitle?: string | null;
}): Promise<{ appliedDraftId: string }> {
  await prisma.socialContentDraft.updateMany({
    where: { socialContentItemId: input.socialContentItemId },
    data: { isApplied: false },
  });
  await persistWorkItemBodyCopy(input.socialContentItemId, input.bodyCopy);
  const { id } = await saveSocialContentDraft({
    socialContentItemId: input.socialContentItemId,
    bodyCopy: input.bodyCopy,
    title: input.draftTitle?.trim() ? input.draftTitle.trim() : "Applied master",
    sourceRoute: input.sourceRoute,
    sourceIntent: input.sourceIntent,
    isApplied: true,
  });
  return { appliedDraftId: id };
}
