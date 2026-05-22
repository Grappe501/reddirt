import { loadCampaignEventsDashboard } from "@/lib/campaign-events/load-campaign-events-dashboard";
import { loadCampaignFinanceSnapshot } from "@/lib/campaign-events/finance/load-campaign-finance-snapshot";
import { loadCampaignLearningSnapshot } from "@/lib/campaign-events/hot-wash-intelligence/load-campaign-learning-snapshot";
import { loadGlobalUserObservations } from "@/lib/agents/user-intelligence/user-observations";
import { loadOsControlBundle } from "@/lib/agents/os-control/load-os-control-bundle";
import { loadDashboardNavigationBundle } from "@/lib/dashboard-orchestration/load-dashboard-navigation-bundle";
import { resolveActiveCampaignTenant, defaultReviewMonthForTenant } from "@/lib/campaign-tenancy/resolve-active-tenant";
import { getTenantContext, listTenantsForUser, DEFAULT_TENANT_ID } from "@/lib/campaign-tenancy/campaign-tenant-store";
import { buildCampaignStrategicIntelligence } from "./strategic-intelligence-engine";
import { buildCampaignLearningLoopIntelligence } from "./campaign-learning-loop-engine";
import { buildFinanceIntelligenceV2 } from "./finance-intelligence-v2";
import { buildOperatorIntelligenceV2 } from "./operator-intelligence-v2";
import { synthesizeCampaignMemory } from "./campaign-memory-synthesizer";
import { analyzeAgentPsychology } from "./agent-psychology-intelligence";

export type UnifiedCampaignContext = {
  tenantId: string;
  tenantDisplayName: string;
  period: string;
  campaignReadinessIndex: number;
  strategic: ReturnType<typeof buildCampaignStrategicIntelligence>;
  learning: ReturnType<typeof buildCampaignLearningLoopIntelligence>;
  finance: ReturnType<typeof buildFinanceIntelligenceV2>;
  operator: ReturnType<typeof buildOperatorIntelligenceV2>;
  memory: ReturnType<typeof synthesizeCampaignMemory>;
  psychology: ReturnType<typeof analyzeAgentPsychology>;
  situationSummary: string;
  recommendedCampaignMoves: { title: string; href: string; why: string }[];
};

export async function assembleUnifiedCampaignContext(opts?: {
  tenantId?: string;
  period?: string;
  pathname?: string;
}): Promise<UnifiedCampaignContext> {
  const period =
    opts?.period ??
    (opts?.tenantId ? defaultReviewMonthForTenant(opts.tenantId) : defaultReviewMonthForTenant(DEFAULT_TENANT_ID));
  const pathname = opts?.pathname ?? "/admin/ai-command-center";

  let tenantId = opts?.tenantId ?? DEFAULT_TENANT_ID;
  let tenant = getTenantContext(tenantId)?.tenant;
  let settings = getTenantContext(tenantId)?.settings ?? null;
  let available = listTenantsForUser("admin");

  if (!opts?.tenantId) {
    try {
      const active = await resolveActiveCampaignTenant();
      tenantId = active.tenantId;
      tenant = active.tenant;
      settings = active.settings;
      available = active.available;
    } catch {
      /* cookies unavailable (e.g. tsx script) — use defaults */
    }
  }
  if (!tenant) {
    const ctx = getTenantContext(DEFAULT_TENANT_ID);
    if (!ctx) throw new Error("Campaign tenancy store missing default tenant");
    tenantId = DEFAULT_TENANT_ID;
    tenant = ctx.tenant;
    settings = ctx.settings;
  }

  const [{ snapshot }, finance, learning, observations, navBundle, osControl] = await Promise.all([
    loadCampaignEventsDashboard(period),
    loadCampaignFinanceSnapshot(period),
    loadCampaignLearningSnapshot(),
    Promise.resolve(loadGlobalUserObservations()),
    loadDashboardNavigationBundle(period, { pathname, surface: "command_center", role: "campaign_manager" }),
    loadOsControlBundle(period, { emitObservation: false }),
  ]);

  const strategic = buildCampaignStrategicIntelligence({
    snapshot,
    tenant,
    settings,
    period,
  });

  const learningIntel = buildCampaignLearningLoopIntelligence(learning, snapshot);
  const financeIntel = buildFinanceIntelligenceV2(finance, snapshot);
  const operator = buildOperatorIntelligenceV2({
    observations,
    pathname,
    period,
    snapshot,
    strategicNarrative: strategic.executiveNarrative,
  });
  const memory = synthesizeCampaignMemory({ tenantId, period, observations, strategic, learning: learningIntel });
  const psychology = analyzeAgentPsychology(observations, navBundle.cognitiveLoad);

  const readiness = Math.round(
    (strategic.momentumScore * 0.25 +
      financeIntel.resourceEfficiencyScore * 0.2 +
      learningIntel.eventSuccessScore * 0.15 +
      osControl.state.systemHealthScore * 0.25 +
      (100 - operator.fatigueScore) * 0.15) /
      1,
  );

  const recommendedCampaignMoves = [
    ...navBundle.workflowRoutes.slice(0, 2).map((r) => ({ title: r.title, href: r.href, why: r.why })),
    ...strategic.strategicGaps.slice(0, 1).map((g) => ({
      title: g.title,
      href: "/admin/campaign-events/review?month=" + period,
      why: g.insight,
    })),
  ].slice(0, 5);

  const situationSummary = [
    memory.campaignInstinctLine,
    strategic.executiveNarrative,
    financeIntel.sustainabilityNarrative,
    psychology.operatorConfidenceLine,
  ].join(" ");

  return {
    tenantId,
    tenantDisplayName: tenant.displayName,
    period,
    campaignReadinessIndex: Math.min(100, Math.max(0, readiness)),
    strategic,
    learning: learningIntel,
    finance: financeIntel,
    operator,
    memory,
    psychology,
    situationSummary,
    recommendedCampaignMoves,
  };
}
