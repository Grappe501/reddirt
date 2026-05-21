import Link from "next/link";
import { MonthReviewWizard } from "@/components/admin/campaign-events/month-review/MonthReviewWizard";
import { CampaignEventsNav, CampaignEventsPageHeader } from "@/app/admin/(board)/campaign-events/components";
import { loadCampaignEventsWorkbench, serializeWorkbenchRows } from "@/lib/campaign-events/load-workbench-events";
import {
  parseMonthReviewMode,
  parseReviewDateRange,
  parseReviewMonth,
} from "@/lib/campaign-events/month-review/month-review-types";
import { parseMonthReviewFocus } from "@/lib/campaign-events/month-readiness/month-readiness-types";
import { TravelReimbursementMonthNav } from "@/components/admin/campaign-events/travel-reimbursement/TravelReimbursementMonthNav";
import { TravelReimbursementWorkflowNav } from "@/components/admin/campaign-events/travel-reimbursement/TravelReimbursementWorkflowNav";
import { AgentObservationTracker } from "@/components/agents/AgentObservationTracker";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{ month?: string; mode?: string; focus?: string; autostart?: string; start?: string; end?: string }>;
};

export default async function CampaignEventMonthReviewPage({ searchParams }: Props) {
  const sp = await searchParams;
  const month = parseReviewMonth(sp.month);
  const mode = parseMonthReviewMode(sp.mode);
  const focus = parseMonthReviewFocus(sp.focus);
  const autostart = sp.autostart === "1";
  const dateRange = parseReviewDateRange(sp.start, sp.end);
  const travelReimbursement =
    mode === "travel_needs_approval" || mode === "approved_travel" || mode === "denied_travel" || !!sp.focus;
  const { rows, period } = await loadCampaignEventsWorkbench({ period: month });

  return (
    <AgentObservationTracker
      role="campaign_manager"
      pathname="/admin/campaign-events/review"
      period={period}
    >
    <div className="mx-auto flex max-w-[1100px] flex-col gap-6 pb-16">
      <CampaignEventsPageHeader
        eyebrow={travelReimbursement ? "Travel reimbursement · step 2" : "Campaign operations · month review wizard"}
        title={travelReimbursement ? "Travel approval wizard" : "Month Review"}
        description={
          travelReimbursement
            ? "Approve, deny, or hold travel one event at a time. Approved travel appears on the official reimbursement request; denied rows stay in the ledger but leave the approval queue."
            : "Review one event at a time with AI summary, inline edits, and persisted approve/deny/hold decisions. Denied events stay in the ledger — never deleted."
        }
        actions={
          <>
            <Link
              href={`/admin/campaign-events/month-readiness?month=${month}`}
              className="rounded-full border border-amber-700/30 bg-amber-50 px-4 py-2 font-body text-sm font-bold text-amber-950"
            >
              Month readiness
            </Link>
            <Link
              href="/admin/campaign-events/workbench"
              className="rounded-full border border-kelly-text/15 px-4 py-2 font-body text-sm font-bold"
            >
              ← Workbench
            </Link>
          </>
        }
      />
      <CampaignEventsNav />
      {travelReimbursement ? <TravelReimbursementWorkflowNav month={period} active="review" /> : null}
      <TravelReimbursementMonthNav activeMonth={period} activeBase="review" />
      <MonthReviewWizard
        initialRows={serializeWorkbenchRows(rows)}
        initialPeriod={period}
        initialMonth={month}
        initialMode={mode}
        initialFocus={focus}
        initialAutostart={autostart}
        initialStart={dateRange.start}
        initialEnd={dateRange.end}
        travelReimbursement={travelReimbursement}
      />
    </div>
    </AgentObservationTracker>
  );
}
