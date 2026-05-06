"use server";

import { revalidatePath } from "next/cache";
import { requireAdminAction } from "@/app/admin/owned-media-auth";
import { getAdminActorUserId } from "@/lib/admin/actor";
import { parseMessageStudioLocalDraftPayload } from "@/components/admin/email-command-center/message-studio-local-drafts";
import {
  buildCritiqueOverallSummary,
  buildDeterministicDraftCritique,
  buildRevisionPlanFromCritique,
  mergeCritiqueScorecards,
  parseStoredCritiqueJson,
  serializeCritiqueForStorage,
  type DraftCritiqueResult,
  type DraftRevisionPlan,
} from "@/lib/email-command-center/ai-draft-critic";
import { runOpenAiDraftCritique } from "@/lib/email-command-center/message-studio-draft-critic-ai";
import { mergeMessageStudioDraftMetadataJson } from "@/lib/email-command-center/message-studio-drafts";

const ECC = "/admin/workbench/email-command-center";

function revalidateMessageStudioSurfaces() {
  revalidatePath(`${ECC}/message-studio`);
  revalidatePath(`${ECC}/daily`);
  revalidatePath(ECC);
}

function trimFd(fd: FormData, key: string): string {
  const v = fd.get(key);
  return typeof v === "string" ? v.trim() : "";
}

export async function critiqueMessageStudioDraftAction(
  fd: FormData,
): Promise<{ ok: true; critique: DraftCritiqueResult } | { ok: false; error: string }> {
  await requireAdminAction();
  const raw = fd.get("localDraftJson");
  if (typeof raw !== "string" || !raw.trim()) return { ok: false, error: "Missing local draft JSON." };
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { ok: false, error: "Invalid JSON." };
  }
  const draft = parseMessageStudioLocalDraftPayload(parsed);
  if (!draft) return { ok: false, error: "Invalid draft payload." };

  let critique = buildDeterministicDraftCritique(draft);
  const useOpenAi = trimFd(fd, "includeOpenAi") === "1";
  if (useOpenAi) {
    const ai = await runOpenAiDraftCritique(draft);
    if (ai.ok) {
      critique = {
        ...critique,
        scorecard: mergeCritiqueScorecards(critique.scorecard, ai.partial.dimensions),
        redFlags: [
          ...critique.redFlags,
          ...ai.partial.additionalRedFlags.map((message) => ({
            code: "openai_red_flag",
            severity: "medium" as const,
            message,
          })),
        ],
        mode: "deterministic_plus_openai",
      };
      critique.revisionPlan = buildRevisionPlanFromCritique(critique);
      critique.overallSummary = buildCritiqueOverallSummary(
        critique.scorecard,
        critique.redFlags,
        "deterministic_plus_openai",
      );
    }
  }

  return { ok: true, critique };
}

export async function generateRevisionPlanAction(
  fd: FormData,
): Promise<{ ok: true; plan: DraftRevisionPlan } | { ok: false; error: string }> {
  await requireAdminAction();
  const raw = fd.get("critiqueJson");
  if (typeof raw !== "string" || !raw.trim()) return { ok: false, error: "Missing critique JSON." };
  const critique = parseStoredCritiqueJson(raw);
  if (!critique) return { ok: false, error: "Invalid critique payload." };
  return { ok: true, plan: buildRevisionPlanFromCritique(critique) };
}

/** Persist last critique onto shared draft metadata only (does not change subject/body). */
export async function persistCritiqueToServerDraftMetadataAction(
  fd: FormData,
): Promise<{ ok: true } | { ok: false; error: string }> {
  await requireAdminAction();
  const actorId = await getAdminActorUserId();
  const id = trimFd(fd, "serverDraftId");
  const rawCrit = fd.get("critiqueJson");
  if (!id) return { ok: false, error: "Missing server draft id." };
  if (typeof rawCrit !== "string" || !rawCrit.trim()) return { ok: false, error: "Missing critique JSON." };
  const critique = parseStoredCritiqueJson(rawCrit);
  if (!critique) return { ok: false, error: "Invalid critique JSON." };
  const safe = serializeCritiqueForStorage(critique);
  try {
    await mergeMessageStudioDraftMetadataJson(id, { lastDraftCritiqueJson: safe }, actorId);
  } catch (e: unknown) {
    return { ok: false, error: e instanceof Error ? e.message : "Metadata merge failed." };
  }
  revalidateMessageStudioSurfaces();
  return { ok: true };
}
