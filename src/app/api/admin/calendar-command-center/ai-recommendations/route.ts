import { z } from "zod";
import { assertAdminApi } from "@/lib/admin/require-admin";
import type { AiRecommendationApiItem, AiRecommendationsPostResponse } from "@/lib/calendar/ai-approval-recommendation-types";
import { getCachedRecommendation, hashApprovalContext, putCachedRecommendation } from "@/lib/calendar/ai-recommendations-cache";
import { buildApprovalContext } from "@/lib/calendar/build-approval-context";
import { resolveApprovalContextHints } from "@/lib/calendar/kelly-approval-hints";
import { fetchAiCalendarRecommendation } from "@/lib/calendar/openai-calendar-recommendation";
import { loadCountyPrioritySnapshot, loadCountyTouchMap, loadTravelCalendarItems } from "@/lib/calendar/load-travel-calendar-data";
import { isOpenAIConfigured } from "@/lib/openai/client";

export const dynamic = "force-dynamic";

const bodySchema = z.object({
  itemIds: z.array(z.string()).min(1).max(48),
  force: z.boolean().optional(),
});

export async function POST(req: Request): Promise<Response> {
  const denied = await assertAdminApi();
  if (denied) return denied;

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return Response.json({ error: "itemIds (1–48 strings) required", details: parsed.error.flatten() }, { status: 400 });
  }

  const { itemIds, force } = parsed.data;
  const all = loadTravelCalendarItems();
  const byId = new Map(all.map((i) => [i.id, i]));
  const priorities = loadCountyPrioritySnapshot();
  const touchMap = loadCountyTouchMap();
  const items: AiRecommendationApiItem[] = [];
  const notFound: string[] = [];
  const modelWarnings: string[] = [];

  for (const id of itemIds) {
    const item = byId.get(id);
    if (!item) {
      notFound.push(id);
      continue;
    }
    const ctx = buildApprovalContext(item, all, resolveApprovalContextHints(item, priorities, touchMap));
    const h = hashApprovalContext(ctx);
    if (!force) {
      const cached = getCachedRecommendation(id, h);
      if (cached) {
        items.push({ calendarItemId: id, context: ctx, recommendation: cached, fromCache: true });
        continue;
      }
    }
    const { recommendation, error } = await fetchAiCalendarRecommendation(ctx);
    if (error) modelWarnings.push(`${id}: ${error}`);
    putCachedRecommendation(id, h, recommendation);
    items.push({ calendarItemId: id, context: ctx, recommendation, fromCache: false });
  }

  const payload: AiRecommendationsPostResponse = {
    items,
    notFound,
    openaiConfigured: isOpenAIConfigured(),
    modelWarnings: modelWarnings.length ? modelWarnings : undefined,
  };
  return Response.json(payload);
}
