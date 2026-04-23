import { guardAuthorStudioRoute } from "./authorStudioAuth";
import { readAuthorStudioJsonBody } from "./handlerStub";
import { authorStudioSuccess } from "./authorStudioHttp";
import { mergeAuthorStudioV2WithLegacy } from "./authorStudioRequestBody";
import { stubDataFor } from "./stubPayloads";
import type { AuthorStudioStructuredOutputKind } from "./types";

function parseContextIds(json: unknown): {
  socialContentItemId?: string;
  workflowIntakeId?: string;
  campaignEventId?: string;
  ownedMediaId?: string;
} {
  if (typeof json !== "object" || json === null) return {};
  const merged = mergeAuthorStudioV2WithLegacy(json) as Record<string, unknown>;
  return {
    socialContentItemId: typeof merged.socialContentItemId === "string" ? merged.socialContentItemId : undefined,
    workflowIntakeId: typeof merged.workflowIntakeId === "string" ? merged.workflowIntakeId : undefined,
    campaignEventId: typeof merged.campaignEventId === "string" ? merged.campaignEventId : undefined,
    ownedMediaId: typeof merged.ownedMediaId === "string" ? merged.ownedMediaId : undefined,
  };
}

/**
 * Generic stub: admin-gated, threads workbench ids into `data`, validates `produces` + payload.
 * TODO: replace per route with OpenAI / tools / Prisma.
 */
export async function authorStudioStubHandler(
  req: Request,
  route: string,
  produces: AuthorStudioStructuredOutputKind,
  message: string
) {
  const gate = await guardAuthorStudioRoute(route);
  if (gate) return gate;
  const json = await readAuthorStudioJsonBody(req);
  const data = stubDataFor(produces, parseContextIds(json));
  return authorStudioSuccess(route, produces, data, message);
}
