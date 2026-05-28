"use server";

import { revalidatePath } from "next/cache";
import { requireAdminAction } from "@/app/admin/owned-media-auth";
import { updateKimHammerSuggestionDisposition } from "@/lib/opposition/kimHammerSuggestionWorkflow";
import type { KimHammerSuggestionStatus } from "@/lib/opposition/types/kimHammerAiSuggestion";

const SUGGESTION_CHANGED_BY_ROUTE =
  "admin/intelligence/kim-hammer/suggestion-actions";

const SUGGESTION_REVALIDATE_PATHS = [
  "/admin/intelligence/kim-hammer",
  "/admin/intelligence/kim-hammer/evidence-command",
  "/admin/intelligence/kim-hammer/ai-suggestion-sandbox",
  "/admin/intelligence/kim-hammer/kh4-agent-tools",
  "/admin/intelligence/kim-hammer/audit-log",
];

function revalidateKimHammerSuggestionSurfaces() {
  for (const routePath of SUGGESTION_REVALIDATE_PATHS) {
    revalidatePath(routePath);
  }
}

export async function updateKimHammerSuggestionDispositionAction(input: {
  suggestionId: string;
  operator: string;
  nextStatus: KimHammerSuggestionStatus;
  operatorNotes?: string;
}) {
  await requireAdminAction();

  const result = updateKimHammerSuggestionDisposition({
    ...input,
    changedByRoute: `${SUGGESTION_CHANGED_BY_ROUTE}#updateKimHammerSuggestionDispositionAction`,
  });

  if (result.ok) {
    revalidateKimHammerSuggestionSurfaces();
  }

  return result;
}
