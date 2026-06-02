import { z } from "zod";
import { assertAdminApi } from "@/lib/admin/require-admin";
import { prepareGovernedLlmBriefDraft } from "@/lib/intelligence/briefs/governedLlmBriefService";

export const dynamic = "force-dynamic";

const bodySchema = z.object({
  briefId: z.string().min(1),
  operatorTriggered: z.literal(true),
  attemptLiveLlm: z.boolean().optional(),
});

export async function POST(req: Request): Promise<Response> {
  const denied = await assertAdminApi();
  if (denied) return denied;

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return Response.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return Response.json(
      { ok: false, error: "validation", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const result = await prepareGovernedLlmBriefDraft({
    briefId: parsed.data.briefId,
    operatorTriggered: true,
    attemptLiveLlm: parsed.data.attemptLiveLlm ?? false,
    operator: "admin-api",
    route: "/api/admin/intelligence/governed-llm-brief",
  });

  if (!result.ok) {
    return Response.json(result, { status: 400 });
  }

  return Response.json(result);
}
