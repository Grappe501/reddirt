import type { CampaignFinanceSnapshot } from "@/lib/campaign-events/finance/load-campaign-finance-snapshot";
import type { CampaignEventsDashboardSnapshot } from "@/lib/campaign-events/load-campaign-events-dashboard";

export type FinanceIntelligenceV2 = {
  resourceEfficiencyScore: number;
  budgetPacing: "under" | "on_track" | "over" | "unknown";
  travelEfficiencyNotes: string[];
  eventRoiNotes: string[];
  countyInvestmentNotes: string[];
  operationalWasteFlags: string[];
  sustainabilityNarrative: string;
};

export function buildFinanceIntelligenceV2(
  finance: CampaignFinanceSnapshot | null,
  snapshot?: CampaignEventsDashboardSnapshot | null,
): FinanceIntelligenceV2 {
  const waste: string[] = [];
  const travel: string[] = [];
  const roi: string[] = [];
  let score = 70;

  if (finance) {
    if (finance.missingMileage > 0) {
      waste.push(`${finance.missingMileage} rows missing mileage — reimbursement efficiency blocked`);
      score -= 12;
    }
    if (finance.exceptionCount > 0) {
      waste.push(`${finance.exceptionCount} finance exception(s) — treasurer review`);
      score -= 8;
    }
    if (finance.pendingReceipts > 0) {
      waste.push(`${finance.pendingReceipts} pending receipt(s)`);
      score -= 5;
    }
    travel.push(`Approved reimbursement ~$${finance.approvedReimbursement.toFixed(0)} for ${finance.month}`);
    if (finance.countySpendNotes.length) {
      roi.push(...finance.countySpendNotes.map((n) => `County spend: ${n}`));
    }
  }

  if (snapshot?.needsMileageReview) {
    travel.push("Mileage queue open — travel efficiency analysis incomplete");
    score -= 10;
  }

  const budgetPacing: FinanceIntelligenceV2["budgetPacing"] =
    score >= 75 ? "on_track" : score >= 55 ? "under" : "over";

  return {
    resourceEfficiencyScore: Math.min(100, Math.max(0, score)),
    budgetPacing,
    travelEfficiencyNotes: travel,
    eventRoiNotes: roi.length ? roi : ["Link event attendance to finance rows in drilldown for ROI V2"],
    countyInvestmentNotes: finance?.countySpendNotes ?? [],
    operationalWasteFlags: waste,
    sustainabilityNarrative:
      waste.length === 0
        ? "Finance ops appear sustainable for the active month — maintain receipt discipline."
        : "Resolve waste flags before expanding event volume.",
  };
}
