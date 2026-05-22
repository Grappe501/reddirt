"use server";

import { loadCampaignEventsDashboard } from "@/lib/campaign-events/load-campaign-events-dashboard";
import { routePaletteQuery, type PaletteQueryResult } from "@/lib/dashboard-orchestration/palette-query-router";

export async function routeCampaignPaletteQueryAction(
  query: string,
  period: string,
): Promise<PaletteQueryResult | null> {
  const { snapshot } = await loadCampaignEventsDashboard(period);
  return routePaletteQuery(query, period, snapshot);
}
