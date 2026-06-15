import budgetLeadershipSource from "../../../data/campaign-brain/budget/executive-book-budget-leadership.source.json";
import budgetSummary from "../../../data/campaign-brain/budget/budget-summary.json";
import fundraisingTracker from "../../../data/campaign-brain/fundraising-tracker.json";

export type BudgetLeadershipCategory = {
  id: string;
  label: string;
  amount: number;
  notes?: string;
};

export type BudgetFundraisingTarget = {
  period: string;
  month: string;
  goal: number;
  notes?: string;
};

export type BudgetLeadershipModel = {
  disclaimer: string;
  headlineQuestion: string;
  electionDay: string;
  referenceDate: string;
  workingCampaignTotal: number;
  categories: BudgetLeadershipCategory[];
  categoryTotal: number;
  fundraising: {
    raisedAsOf: string;
    raisedToDate: number;
    workingCampaignGoal: number;
    remainingToRaise: number;
    rampUpNote: string;
    monthlyTargets: BudgetFundraisingTarget[];
    monthlyTargetsTotal: number;
    sources: Array<{ id: string; label: string; shareNote: string }>;
  };
  laborDayFundingPriorities: Array<{
    item: string;
    deadline: string;
    status: string;
    priority: string;
  }>;
  scenarios: {
    bareMinimum: number;
    working: number;
    aggressive: number;
    monthlyBurnWorking: number;
  };
};

function sumCategories(categories: BudgetLeadershipCategory[]): number {
  return categories.reduce((s, c) => s + c.amount, 0);
}

export function getExecutiveBookBudgetLeadership(): BudgetLeadershipModel {
  const src = budgetLeadershipSource as unknown as {
    disclaimer: string;
    headlineQuestion: string;
    electionDay: string;
    referenceDate: string;
    workingCampaignTotal: number;
    categories: BudgetLeadershipCategory[];
    fundraising: Omit<BudgetLeadershipModel["fundraising"], "monthlyTargetsTotal"> & {
      monthlyTargets: BudgetFundraisingTarget[];
    };
    laborDayFundingPriorities: BudgetLeadershipModel["laborDayFundingPriorities"];
  };

  const raisedToDate = fundraisingTracker.raised ?? src.fundraising.raisedToDate;
  const workingGoal = budgetSummary.workingCampaignTotal ?? src.workingCampaignTotal;
  const remainingToRaise = Math.max(0, workingGoal - raisedToDate);
  const monthlyTargetsTotal = src.fundraising.monthlyTargets.reduce((s, t) => s + t.goal, 0);

  return {
    disclaimer: src.disclaimer,
    headlineQuestion: src.headlineQuestion,
    electionDay: src.electionDay,
    referenceDate: src.referenceDate,
    workingCampaignTotal: workingGoal,
    categories: src.categories,
    categoryTotal: sumCategories(src.categories),
    fundraising: {
      ...src.fundraising,
      raisedToDate,
      workingCampaignGoal: workingGoal,
      remainingToRaise,
      monthlyTargetsTotal,
    },
    laborDayFundingPriorities: src.laborDayFundingPriorities,
    scenarios: {
      bareMinimum: budgetSummary.bareMinimumTotal ?? 181783,
      working: workingGoal,
      aggressive: budgetSummary.aggressiveStatewideTotal ?? 339123,
      monthlyBurnWorking: budgetSummary.monthlyBurnWorking ?? 38676,
    },
  };
}

export function executiveBookBudgetDashboardHref(): string {
  return "/election-plan/executive-book/budget/dashboard";
}

export function executiveBookBudgetChapterHref(): string {
  return "/election-plan/executive-book/budget";
}

export function laborDayResourceGapHref(): string {
  return "/election-plan/executive-book/labor-day/resource-gap";
}
