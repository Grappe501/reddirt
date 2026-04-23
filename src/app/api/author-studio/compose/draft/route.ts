import { guardAuthorStudioRoute } from "@/lib/author-studio/authorStudioAuth";
import { mergeSelectedDraftMasterIfAny, persistMasterAndRecordAppliedDraft } from "@/lib/author-studio/composeWorkItemWriteBack";
import { resolveComposePersistenceIntent } from "@/lib/author-studio/composePersistence";
import { readAuthorStudioJsonBody } from "@/lib/author-studio/handlerStub";
import {
  authorStudioRequestError,
  authorStudioServerError,
  authorStudioSuccess,
  authorStudioValidationError,
} from "@/lib/author-studio/authorStudioHttp";
import { buildDraftSetFromItemAndBrief, saveSocialContentDraft } from "@/lib/author-studio/authorStudioOperations";
import { composeDraftRequestSchema, type DraftSetData } from "@/lib/author-studio/outputSchemas";
import { authorStudioOutputKinds } from "@/lib/author-studio/types";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

const route = "author-studio/compose/draft";

export async function POST(req: Request) {
  const gate = await guardAuthorStudioRoute(route);
  if (gate) return gate;

  const json = await readAuthorStudioJsonBody(req);
  const parsed = composeDraftRequestSchema.safeParse(json);
  if (!parsed.success) {
    return authorStudioValidationError(route, parsed.error);
  }
  const body = parsed.data;

  try {
    let item = null;
    if (body.socialContentItemId) {
      item = await prisma.socialContentItem.findUnique({ where: { id: body.socialContentItemId } });
      if (!item) {
        return authorStudioServerError(route, new Error("socialContentItem not found"));
      }
    }
    let data: DraftSetData = buildDraftSetFromItemAndBrief(item, {
      intent: body.intent,
      brief: body.brief ?? null,
      compose: body.compose,
    });

    try {
      const merged = await mergeSelectedDraftMasterIfAny(body.socialContentItemId, body.selectedContentDraftId, data);
      data = merged.data;
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Invalid draft selection";
      return authorStudioRequestError(route, msg, 400);
    }

    const resolved = resolveComposePersistenceIntent(body);

    if (resolved === "preview") {
      return authorStudioSuccess(
        route,
        authorStudioOutputKinds.draftSet,
        data,
        "Preview: draft_set only (no DB write). Use a non-preview intent to persist to the work item."
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
          ? "Master copy replaced; applied snapshot stored with isApplied on the new draft (prior drafts kept)."
          : "Master copy applied; applied snapshot stored (new draft, isApplied: true; prior applies cleared)."
      );
    }

    return authorStudioServerError(route, new Error("Unhandled compose/draft persistence branch"));
  } catch (e) {
    return authorStudioServerError(route, e);
  }
}
