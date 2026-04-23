import { guardAuthorStudioRoute } from "@/lib/author-studio/authorStudioAuth";
import { readAuthorStudioJsonBody } from "@/lib/author-studio/handlerStub";
import { authorStudioServerError, authorStudioSuccess, authorStudioValidationError } from "@/lib/author-studio/authorStudioHttp";
import { createAuthorStudioTaskPackage, previewAuthorStudioTaskPackage } from "@/lib/author-studio/authorStudioOperations";
import { createTasksRequestSchema } from "@/lib/author-studio/outputSchemas";
import { authorStudioOutputKinds } from "@/lib/author-studio/types";

export const dynamic = "force-dynamic";

const route = "author-studio/package/create-tasks";

export async function POST(req: Request) {
  const gate = await guardAuthorStudioRoute(route);
  if (gate) return gate;

  const json = await readAuthorStudioJsonBody(req);
  const parsed = createTasksRequestSchema.safeParse(json);
  if (!parsed.success) {
    return authorStudioValidationError(route, parsed.error);
  }
  const body = parsed.data;

  try {
    if (body.mode === "preview") {
      const data = await previewAuthorStudioTaskPackage({
        socialContentItemId: body.socialContentItemId,
        pack: body.pack,
        tasks: body.tasks,
      });
      return authorStudioSuccess(
        route,
        authorStudioOutputKinds.taskPackage,
        data,
        "Preview: task_package only (no CampaignTask rows). Use mode=apply to create tasks."
      );
    }
    const data = await createAuthorStudioTaskPackage({
      socialContentItemId: body.socialContentItemId,
      pack: body.pack,
      tasks: body.tasks,
    });
    return authorStudioSuccess(
      route,
      authorStudioOutputKinds.taskPackage,
      data,
      `Created ${data.createdTaskIds.length} CampaignTask row(s) linked to this work item.`
    );
  } catch (e) {
    return authorStudioServerError(route, e);
  }
}
