import Link from "next/link";
import type { CampaignEventsDashboardSnapshot } from "@/lib/campaign-events/load-campaign-events-dashboard";
import { ApprovalRecipientsBanner } from "@/components/admin/campaign-events/ApprovalRecipientsBanner";
import { MonthlyTravelSummaryCard } from "@/components/admin/campaign-events/MonthlyTravelSummaryCard";
import { ReimbursementMonthCards } from "@/components/admin/campaign-events/travel-reimbursement/ReimbursementMonthCards";
import type { ReimbursementMonthSummary } from "@/lib/campaign-events/travel-reimbursement/load-reimbursement-summaries";
import { CampaignDashboardShell, DashboardSection, DashboardStatGrid, StatCard } from "./CampaignDashboardShell";

export function CandidateCampaignDashboard({
  snapshot,
  reimbursementSummaries,
}: {
  snapshot: CampaignEventsDashboardSnapshot;
  reimbursementSummaries?: ReimbursementMonthSummary[];
}) {
  const { period } = snapshot;
  const reviewHref = `/admin/campaign-events/review?month=${period}&mode=chronological`;
  const workbenchHref = "/admin/campaign-events/workbench";
  const travelHref = `/admin/campaign-events/travel-report?month=${period}`;

  return (
    <CampaignDashboardShell
      eyebrow="Kelly Grappe · candidate operations"
      title="Candidate dashboard"
      description="Pending event approvals, monthly travel totals, upcoming calendar, and approval-package inbox. Admin-authenticated surface for Kelly and operators — no emails are sent from this page."
    >
      <ApprovalRecipientsBanner />

      <ReimbursementMonthCards title="Travel reimbursement (March · April · May MTD)" summaries={reimbursementSummaries} />

      <div className="flex flex-wrap gap-2 font-body text-sm">
        <Link
          href={`/admin/campaign-events/month-readiness?month=${period}`}
          className="rounded-full border border-amber-700/30 bg-amber-50 px-4 py-2 font-bold text-amber-950"
        >
          {period} readiness checklist
        </Link>
      </div>

      <DashboardSection title="Pending approvals">
        <DashboardStatGrid>
          <StatCard label="Needs decision" value={snapshot.pendingApprovals} href={reviewHref} hint="Approve · deny · hold" />
          <StatCard label="In review queue" value={snapshot.needsReview} href={workbenchHref} />
          <StatCard label="On hold" value={snapshot.holds} href={reviewHref} />
          <StatCard label="Approved" value={snapshot.approved} href="/admin/campaign-events/workbench" />
        </DashboardStatGrid>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link href={reviewHref} className="rounded-full bg-kelly-navy px-4 py-2 text-sm font-bold text-white">
            Month Review Wizard
          </Link>
          <Link href={workbenchHref} className="rounded-full border px-4 py-2 text-sm font-bold">
            Events workbench
          </Link>
        </div>
      </DashboardSection>

      <MonthlyTravelSummaryCard month={period} totals={snapshot.travel} reportHref={travelHref} />

      <DashboardSection title="Upcoming calendar (next 14 days)">
        {snapshot.upcoming.length ? (
          <ul className="divide-y divide-kelly-text/5 font-body text-sm">
            {snapshot.upcoming.map((e) => (
              <li key={e.recordId} className="flex flex-wrap items-baseline justify-between gap-2 py-2">
                <div>
                  <Link href={`/admin/campaign-events/${e.recordId}`} className="font-semibold text-kelly-navy underline">
                    {e.title}
                  </Link>
                  <p className="text-xs text-kelly-text/60">
                    {e.dateYmd} · {e.timeLabel}
                    {e.city ? ` · ${e.city}` : ""}
                    {e.county ? ` · ${e.county}` : ""}
                  </p>
                </div>
                <span className="text-xs text-kelly-text/55">
                  {e.status} · {e.decisionLabel ?? "pending"}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="font-body text-sm text-kelly-text/55">No events in the next 14 days from today ({snapshot.todayYmd}). Open the full calendar for March ledger items.</p>
        )}
        <div className="mt-4 flex flex-wrap gap-2 text-sm">
          <Link href="/admin/campaign-calendar/timeline" className="font-semibold text-kelly-navy underline">
            Timeline
          </Link>
          <Link href="/admin/campaign-calendar/day" className="underline">
            Day view
          </Link>
          <Link href="/admin/calendar-command-center/kelly" className="underline">
            Kelly cockpit
          </Link>
        </div>
      </DashboardSection>

      <DashboardSection title="Candidate action items">
        <DashboardStatGrid>
          <StatCard label="Approve / deny / hold" value={snapshot.actionItems.approveDenyHold} href={reviewHref} />
          <StatCard label="Missing info requests" value={snapshot.actionItems.missingInfo} href="/admin/campaign-events/workbench" />
          <StatCard label="Travel review needed" value={snapshot.actionItems.travelReview} href={travelHref} />
          <StatCard label="Hot wash pending" value={snapshot.actionItems.hotWashPending} href="/admin/campaign-events/workbench" hint="Past approved events" />
        </DashboardStatGrid>
      </DashboardSection>

      <DashboardSection title="Approval package inbox (scaffold)">
        <p className="mb-3 font-body text-xs text-kelly-text/55">Future approval emails will appear here. Preview packages per event — not sent.</p>
        {snapshot.approvalInbox.length ? (
          <ul className="space-y-2 font-body text-sm">
            {snapshot.approvalInbox.map((item) => (
              <li key={item.recordId} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-kelly-text/10 px-3 py-2">
                <div>
                  <strong>{item.title}</strong>
                  <span className="ml-2 text-xs text-kelly-text/55">
                    {item.dateYmd} {item.timeLabel}
                  </span>
                </div>
                <Link href={item.packagePreviewUrl} className="text-xs font-bold text-kelly-navy underline">
                  Preview package
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-kelly-text/55">No pending packages in queue.</p>
        )}
      </DashboardSection>
    </CampaignDashboardShell>
  );
}
