import { z } from "zod";
import { assertAdminApi } from "@/lib/admin/require-admin";
import { runCopilotWithLlmDraftQueue } from "@/lib/intelligence/aiCopilotOrchestrator";
import { loadAiCopilotToolRegistry } from "@/lib/intelligence/aiCopilotOrchestrator";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

const bodySchema = z.object({
  toolId: z.string().min(1),
  topic: z.string().optional(),
  generatedForRoute: z.string().optional(),
});

export async function GET(): Promise<Response> {
  const denied = await assertAdminApi();
  if (denied) return denied;

  const registry = loadAiCopilotToolRegistry();
  return Response.json({
    ok: true,
    toolCount: registry.tools.length,
    debatePrepTools: registry.tools.filter((t) => t.category === "debate_prep").map((t) => t.toolId),
  });
}

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
    return Response.json({ ok: false, error: "validation" }, { status: 400 });
  }

  const { toolId, topic, generatedForRoute = "/api/admin/intelligence/copilot-tool" } = parsed.data;
  const registry = loadAiCopilotToolRegistry();
  if (!registry.tools.some((t) => t.toolId === toolId)) {
    return Response.json({ ok: false, error: "unknown_tool" }, { status: 404 });
  }

  const result = runCopilotWithLlmDraftQueue(toolId, {
    topic: topic ?? "election integrity and direct democracy",
    generatedForRoute,
  });

  if (!result) {
    return Response.json({ ok: false, error: "tool_failed" }, { status: 500 });
  }

  return Response.json({
    ok: true,
    toolId,
    publicationSafety: "NON_PUBLISHABLE",
    humanReviewRequired: true,
    llmDraftId: result.llmDraftId ?? null,
    generationMode: result.generationMode,
    output: result.deterministic,
  });
}
