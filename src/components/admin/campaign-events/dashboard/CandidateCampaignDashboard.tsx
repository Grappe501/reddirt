import type { CampaignEventsDashboardSnapshot } from "@/lib/campaign-events/load-campaign-events-dashboard";
import type { ReimbursementMonthSummary } from "@/lib/campaign-events/travel-reimbursement/load-reimbursement-summaries";
import type { NextActionResult } from "@/lib/agents/user-intelligence/next-action-engine";
import type { ExecutiveSummary } from "@/lib/dashboard-orchestration/executive-summary-builder";
import type { StatewideCountyIntelligence } from "@/lib/agents/county-intelligence/county-kpi-types";
import type { CampaignFinanceSnapshot } from "@/lib/campaign-events/finance/load-campaign-finance-snapshot";
import type { CandidateDashboardLayerId } from "@/lib/dashboard-orchestration/candidate-dashboard-layers";
import { CandidateCalmDashboard } from "./CandidateCalmDashboard";

export function CandidateCampaignDashboard({
  countyStatewide,
  snapshot,
  reimbursementSummaries,
  financeSnapshot,
  nextActions,
  executiveSummary,
  layer,
}: {
  countyStatewide?: StatewideCountyIntelligence;
  snapshot: CampaignEventsDashboardSnapshot;
  reimbursementSummaries?: ReimbursementMonthSummary[];
  financeSnapshot?: CampaignFinanceSnapshot;
  nextActions?: NextActionResult;
  executiveSummary?: ExecutiveSummary;
  layer?: CandidateDashboardLayerId | null;
}) {
  return (
    <CandidateCalmDashboard
      snapshot={snapshot}
      layer={layer ?? null}
      reimbursementSummaries={reimbursementSummaries}
      financeSnapshot={financeSnapshot}
      countyStatewide={countyStatewide}
      nextActions={nextActions}
      executiveSummary={executiveSummary}
    />
  );
}
