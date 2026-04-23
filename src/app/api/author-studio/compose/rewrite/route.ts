import { randomUUID } from "node:crypto";
import { guardAuthorStudioRoute } from "@/lib/author-studio/authorStudioAuth";
import { loadContentDraftTextForWorkItem, persistMasterAndRecordAppliedDraft } from "@/lib/author-studio/composeWorkItemWriteBack";
import { resolveComposePersistenceIntent } from "@/lib/author-studio/composePersistence";
import { readAuthorStudioJsonBody } from "@/lib/author-studio/handlerStub";
import {
  authorStudioRequestError,
  authorStudioServerError,
  authorStudioSuccess,
  authorStudioValidationError,
} from "@/lib/author-studio/authorStudioHttp";
import { rewriteComposeText, saveSocialContentDraft } from "@/lib/author-studio/authorStudioOperations";
import { composeRewriteRequestSchema, type DraftSetData } from "@/lib/author-studio/outputSchemas";
import { authorStudioOutputKinds } from "@/lib/author-studio/types";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

const route = "author-studio/compose/rewrite";

export async function POST(req: Request) {
  const gate = await guardAuthorStudioRoute(route);
  if (gate) return gate;

  const json = await readAuthorStudioJsonBody(req);
  const parsed = composeRewriteRequestSchema.safeParse(json);
  if (!parsed.success) {
    return authorStudioValidationError(route, parsed.error);
  }
  const body = parsed.data;

  try {
    let item: { bodyCopy: string | null; workflowIntakeId: string | null; campaignEventId: string | null } | null = null;
    if (body.socialContentItemId) {
      item = await prisma.socialContentItem.findUnique({
        where: { id: body.socialContentItemId },
        select: { bodyCopy: true, workflowIntakeId: true, campaignEventId: true },
      });
      if (!item) {
        return authorStudioServerError(route, new Error("socialContentItem not found"));
      }
    }

    let source = body.sourceText?.trim() || "";
    if (body.selectedContentDraftId && body.socialContentItemId) {
      const t = await loadContentDraftTextForWorkItem(body.socialContentItemId, body.selectedContentDraftId);
      if (t == null) {
        return authorStudioRequestError(
          route,
          "selectedContentDraftId is invalid for this work item or has no copy",
          400
        );
      }
      source = t;
    } else if (!source) {
      source = item?.bodyCopy?.trim() || "";
    }
    if (!source) {
      return authorStudioRequestError(
        route,
        "Provide `sourceText`, a selected saved draft, or a work item with `bodyCopy`.",
        400
      );
    }

    let maxChars = body.maxChars;
    if (maxChars == null) {
      if (body.length === "tight") maxChars = 280;
      else if (body.length === "long") maxChars = 4000;
    }
    const { master } = rewriteComposeText(source, body.intent, maxChars);
    const now = new Date().toISOString();
    const idA = randomUUID();
    const idB = randomUUID();

    const data: DraftSetData = {
      socialContentItemId: body.socialContentItemId,
      workflowIntakeId: item?.workflowIntakeId ?? body.workflowIntakeId,
      campaignEventId: item?.campaignEventId ?? body.campaignEventId,
      intent: `rewrite_${body.intent}`,
      compose: {
        master,
        alternates: [
          { id: idA, label: "Rewrite", body: master, createdAt: now },
          { id: idB, label: "Original (reference)", body: source, createdAt: now },
        ],
        compareLeftId: idA,
        compareRightId: idB,
        compareMode: true,
        length: (body.maxChars && body.maxChars < 400 ? "tight" : "standard") as "tight" | "standard" | "long",
      },
    };
    const resolved = resolveComposePersistenceIntent(body);

    if (resolved === "preview") {
      return authorStudioSuccess(
        route,
        authorStudioOutputKinds.draftSet,
        data,
        "Preview: rewritten draft_set only (no DB write)."
      );
    }

    if (resolved === "save_draft") {
      if (!body.socialContentItemId) {
        return authorStudioRequestError(route, "save_draft requires `context.socialContentItemId`", 400);
      }
      const saved = await saveSocialContentDraft({
        socialContentItemId: body.socialContentItemId,
        bodyCopy: data.compose.master,
        title: body.draftTitle,
        sourceRoute: route,
        sourceIntent: "save_draft",
      });
      return authorStudioSuccess(
        route,
        authorStudioOutputKinds.draftSet,
        {
          ...data,
          persistence: {
            workbenchRefetch: true,
            didSaveDraft: true,
            savedDraftId: saved.id,
            appliedIntent: "save_draft",
          },
        },
        "Saved alternate draft on the work item (structured SocialContentDraft row)."
      );
    }

    if (resolved === "apply_to_master" || resolved === "replace_master") {
      if (!body.socialContentItemId) {
        return authorStudioRequestError(
          route,
          `${resolved} requires \`context.socialContentItemId\` (or legacy flat socialContentItemId)`,
          400
        );
      }
      const { appliedDraftId } = await persistMasterAndRecordAppliedDraft({
        socialContentItemId: body.socialContentItemId,
        bodyCopy: data.compose.master,
        sourceRoute: route,
        sourceIntent: resolved,
        draftTitle: "Applied rewrite",
      });
      return authorStudioSuccess(
        route,
        authorStudioOutputKinds.draftSet,
        {
          ...data,
          persistence: {
            workbenchRefetch: true,
            didApplyToMaster: true,
            appliedIntent: resolved,
            appliedDraftId,
          },
        },
        resolved === "replace_master"
          ? "Master replaced with rewrite; applied snapshot draft recorded."
          : "Rewrite applied to master; applied snapshot draft recorded. (Heuristic — TODO: model for voice.)"
      );
    }

    return authorStudioServerError(route, new Error("Unhandled compose/rewrite persistence branch"));
  } catch (e) {
    return authorStudioServerError(route, e);
  }
}
