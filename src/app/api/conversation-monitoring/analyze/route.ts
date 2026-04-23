import { revalidatePath } from "next/cache";
import { assertAdminApi } from "@/lib/admin/require-admin";
import {
  analyzeConversationItemById,
  analyzeUnanalyzedConversationItems,
} from "@/lib/conversation-monitoring/conversation-analysis-service";

export const dynamic = "force-dynamic";

const ROUTE = "conversation-monitoring/analyze";

/**
 * Admin-only. Deterministic analysis (rules v1) — produces `ConversationAnalysis` and may create/update `ConversationOpportunity`.
 * Body: `{ conversationItemId?: string, batchUnanalyzed?: boolean, limit?: number }`
 */
export async function POST(req: Request) {
  const denied = await assertAdminApi();
  if (denied) return denied;

  let body: unknown = {};
  try {
    body = await req.json();
  } catch {
    /* empty body */
  }
  const o = body as Record<string, unknown>;
  const conversationItemId = typeof o.conversationItemId === "string" ? o.conversationItemId.trim() : "";
  const batchUnanalyzed = o.batchUnanalyzed === true;
  const limit = typeof o.limit === "number" && Number.isFinite(o.limit) ? o.limit : 25;

  try {
    if (batchUnanalyzed) {
      const out = await analyzeUnanalyzedConversationItems(limit);
      revalidatePath("/admin/workbench/social");
      revalidatePath("/admin/workbench");
      return Response.json(
        {
          ok: true,
          version: 1,
          route: ROUTE,
          mode: "batch",
          message: `Processed ${out.processed.length} item(s)${out.errors.length ? `, ${out.errors.length} error(s)` : ""}.`,
          processed: out.processed,
          errors: out.errors,
        },
        { status: 200 }
      );
    }
    if (conversationItemId) {
      const r = await analyzeConversationItemById(conversationItemId);
      revalidatePath("/admin/workbench/social");
      revalidatePath("/admin/workbench");
      return Response.json(
        {
          ok: true,
          version: 1,
          route: ROUTE,
          mode: "single",
          message: "Analysis complete.",
          result: r,
        },
        { status: 200 }
      );
    }
    return Response.json(
      {
        ok: false,
        version: 1,
        route: ROUTE,
        message: "Provide `conversationItemId` or set `batchUnanalyzed: true`.",
      },
      { status: 400 }
    );
  } catch (e) {
    const message = e instanceof Error ? e.message : "Analysis failed";
    return Response.json(
      { ok: false, version: 1, route: ROUTE, message },
      { status: message.includes("not found") ? 404 : 500 }
    );
  }
}
