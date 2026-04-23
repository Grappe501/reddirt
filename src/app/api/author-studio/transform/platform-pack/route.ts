import { SocialPlatform } from "@prisma/client";
import { guardAuthorStudioRoute } from "@/lib/author-studio/authorStudioAuth";
import { readAuthorStudioJsonBody } from "@/lib/author-studio/handlerStub";
import { authorStudioServerError, authorStudioSuccess, authorStudioValidationError } from "@/lib/author-studio/authorStudioHttp";
import { buildPlatformPackStructured, persistPlatformVariants, persistWorkItemBodyCopy } from "@/lib/author-studio/authorStudioOperations";
import { platformPackRequestSchema } from "@/lib/author-studio/outputSchemas";
import { authorStudioOutputKinds } from "@/lib/author-studio/types";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

const route = "author-studio/transform/platform-pack";

export async function POST(req: Request) {
  const gate = await guardAuthorStudioRoute(route);
  if (gate) return gate;

  const json = await readAuthorStudioJsonBody(req);
  const parsed = platformPackRequestSchema.safeParse(json);
  if (!parsed.success) {
    return authorStudioValidationError(route, parsed.error);
  }
  const body = parsed.data;

  try {
    let master = body.master?.trim() ?? "";
    if (!master && body.socialContentItemId) {
      const item = await prisma.socialContentItem.findUnique({ where: { id: body.socialContentItemId } });
      if (!item) {
        return authorStudioServerError(route, new Error("socialContentItem not found"));
      }
      master = item.bodyCopy?.trim() || item.title?.trim() || "";
    }
    if (!master) {
      return authorStudioServerError(route, new Error("No `master` text and nothing to load from the work item."));
    }

    const platformEnums = body.platforms?.map((p) => p as SocialPlatform) ?? undefined;
    const { platformPack, forPersist } = buildPlatformPackStructured(master, platformEnums);
    const parent = body.socialContentItemId
      ? await prisma.socialContentItem.findUnique({
          where: { id: body.socialContentItemId },
          select: { id: true, workflowIntakeId: true, campaignEventId: true },
        })
      : null;

    const isPreview = body.mode === "preview";
    const persistVariants =
      !isPreview && (body.persistVariants !== undefined ? body.persistVariants : Boolean(body.socialContentItemId));
    const applyMasterToWorkItem =
      !isPreview && (body.applyMasterToWorkItem !== undefined ? body.applyMasterToWorkItem : Boolean(body.socialContentItemId));

    if (applyMasterToWorkItem && body.socialContentItemId) {
      await persistWorkItemBodyCopy(body.socialContentItemId, master);
    }

    let platformVariantIds: string[] | undefined;
    if (persistVariants && body.socialContentItemId) {
      platformVariantIds = await persistPlatformVariants(body.socialContentItemId, forPersist, {
        onlyCreateMissing: body.onlyCreateMissingVariants === true,
      });
    }

    return authorStudioSuccess(
      route,
      authorStudioOutputKinds.platformPack,
      {
        socialContentItemId: parent?.id ?? body.socialContentItemId,
        workflowIntakeId: parent?.workflowIntakeId ?? body.workflowIntakeId,
        campaignEventId: parent?.campaignEventId ?? body.campaignEventId,
        platformPack,
        platformVariantIds,
      },
      isPreview
        ? "Preview: platform_pack only (no DB write). Use mode=apply to sync master and upsert platform variants."
        : persistVariants
          ? "Platform pack + SocialPlatformVariant rows (per platform). TODO: OpenAI and account binding."
          : "Platform pack (structured only; persistVariants is off or preview)."
    );
  } catch (e) {
    return authorStudioServerError(route, e);
  }
}
