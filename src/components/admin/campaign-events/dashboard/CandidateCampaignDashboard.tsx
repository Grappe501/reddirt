import Link from "next/link";
import type { CampaignEventsDashboardSnapshot } from "@/lib/campaign-events/load-campaign-events-dashboard";
import { AiObservationsPanel } from "@/components/admin/campaign-events/AiObservationsPanel";
import { ApprovalRecipientsBanner } from "@/components/admin/campaign-events/ApprovalRecipientsBanner";
import { MonthlyTravelSummaryCard } from "@/components/admin/campaign-events/MonthlyTravelSummaryCard";
import { ReimbursementMonthCards } from "@/components/admin/campaign-events/travel-reimbursement/ReimbursementMonthCards";
import type { ReimbursementMonthSummary } from "@/lib/campaign-events/travel-reimbursement/load-reimbursement-summaries";
import { AgentNextActionPanel } from "@/components/admin/campaign-events/AgentNextActionPanel";
import { AgentCommandPalette } from "@/components/agents/AgentCommandPalette";
import type { NextActionResult } from "@/lib/agents/user-intelligence/next-action-engine";
import { CampaignDashboardShell, DashboardSection, DashboardStatGrid, StatCard } from "./CampaignDashboardShell";
import { ExecutiveSummaryStrip } from "@/components/admin/navigation/ExecutiveSummaryStrip";
import { WorkflowGuidanceCards } from "@/components/admin/navigation/WorkflowGuidanceCards";
import { CountyIntelligencePanel } from "@/components/admin/county-intelligence/CountyIntelligencePanel";
import type { StatewideCountyIntelligence } from "@/lib/agents/county-intelligence/county-kpi-types";
import type { ExecutiveSummary } from "@/lib/dashboard-orchestration/executive-summary-builder";
import type { WorkflowGuidanceCard } from "@/lib/dashboard-orchestration/workflow-guidance-generator";
import { CandidateFinanceOverview } from "../finance/CandidateFinanceOverview";
import type { CampaignFinanceSnapshot } from "@/lib/campaign-events/finance/load-campaign-finance-snapshot";

export function CandidateCampaignDashboard({
  countyStatewide,
  snapshot,
  reimbursementSummaries,
  financeSnapshot,
  nextActions,
  executiveSummary,
  guidanceCards,
}: {
  countyStatewide?: StatewideCountyIntelligence;
  snapshot: CampaignEventsDashboardSnapshot;
  reimbursementSummaries?: ReimbursementMonthSummary[];
  financeSnapshot?: CampaignFinanceSnapshot;
  nextActions?: NextActionResult;
  executiveSummary?: ExecutiveSummary;
  guidanceCards?: WorkflowGuidanceCard[];
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

      {executiveSummary ? <ExecutiveSummaryStrip summary={executiveSummary} /> : null}
      {guidanceCards?.length ? <WorkflowGuidanceCards cards={guidanceCards} /> : null}
      {countyStatewide ? <CountyIntelligencePanel statewide={countyStatewide} compact /> : null}

      <AgentCommandPalette role="candidate" pathname="/admin/candidate-dashboard" period={period} compact />
      {nextActions ? <AgentNextActionPanel actions={nextActions} compact /> : null}

      <ReimbursementMonthCards title="Travel reimbursement (March · April · May MTD)" summaries={reimbursementSummaries} />

      {financeSnapshot ? <CandidateFinanceOverview snapshot={financeSnapshot} month={period} /> : null}

      {snapshot.calendarSync ? (
      <DashboardSection title="Calendar sync truth">
        <DashboardStatGrid>
          <StatCard
            label="Google matched"
            value={snapshot.calendarSync.googleMatched}
            href={`/admin/campaign-events/calendar-sync?month=${period}`}
          />
          <StatCard
            label="Imported JSON only"
            value={snapshot.calendarSync.importedOnly}
            href={`/admin/campaign-events/workbench?month=${period}&sync=IMPORTED_FROM_NORMALIZED_JSON`}
          />
          <StatCard
            label="Stale / conflict"
            value={snapshot.calendarSync.stale + snapshot.calendarSync.conflicts}
            href={`/admin/campaign-events/calendar-sync?month=${period}`}
            hint={snapshot.calendarSync.jsonStale ? "Normalized JSON stale" : undefined}
          />
          <StatCard
            label="Not linked"
            value={snapshot.calendarSync.notLinked}
            href={`/admin/campaign-events/workbench?month=${period}&sync=NOT_LINKED`}
          />
        </DashboardStatGrid>
      </DashboardSection>
      ) : null}

      <div className="flex flex-wrap gap-2 font-body text-sm">
        <Link
          href={`/admin/campaign-events/month-readiness?month=${period}`}
          className="rounded-full border border-amber-700/30 bg-amber-50 px-4 py-2 font-bold text-amber-950"
        >
          {period} readiness checklist
        </Link>
      </div>

      <DashboardSection title="Website intake & tentative events">
        <DashboardStatGrid>
          <StatCard
            label="Website requests (ledger)"
            value={snapshot.websiteIntakeCount}
            href={`/admin/campaign-events/workbench?period=${period}`}
            hint="Tentative Event OS rows"
          />
          <StatCard
            label="Needs intake review"
            value={snapshot.needsIntakeReviewCount}
            href={`/admin/campaign-events/review?month=${period}&mode=needs_intake_review&autostart=1`}
          />
          <StatCard
            label="Duplicate risk"
            value={snapshot.duplicateRiskCount}
            href={`/admin/campaign-events/review?month=${period}&mode=duplicate_risk`}
          />
          <StatCard
            label="Schedule conflicts"
            value={snapshot.intakeConflictCount}
            href={`/admin/campaign-events/review?month=${period}&mode=intake_conflict`}
          />
        </DashboardStatGrid>
      </DashboardSection>

      <DashboardSection title="Calendar promotion (human-controlled)">
        <DashboardStatGrid>
          <StatCard
            label="Ready · tentative GCal"
            value={snapshot.promotionReadyTentative}
            href={`/admin/campaign-events/calendar-promotion?month=${period}`}
          />
          <StatCard
            label="Ready · official GCal"
            value={snapshot.promotionReadyOfficial}
            href={`/admin/campaign-events/calendar-promotion?month=${period}`}
          />
          <StatCard label="Promotion failed" value={snapshot.promotionFailed} href={`/admin/campaign-events/calendar-promotion?month=${period}`} />
          <StatCard label="Promotion blocked" value={snapshot.promotionBlocked} href={`/admin/campaign-events/calendar-promotion?month=${period}`} />
        </DashboardStatGrid>
        <p className="mt-2 font-body text-xs text-kelly-muted">
          Writes require GOOGLE_CALENDAR_WRITE_ENABLED and explicit operator Promote click — no autonomous AI calendar writes.
        </p>
      </DashboardSection>

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
                  <p className="text-xs text-kelly-muted">
                    {e.dateYmd} · {e.timeLabel}
                    {e.city ? ` · ${e.city}` : ""}
                    {e.county ? ` · ${e.county}` : ""}
                  </p>
                </div>
                <span className="text-xs text-kelly-muted">
                  {e.status} · {e.decisionLabel ?? "pending"}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="font-body text-sm text-kelly-muted">No events in the next 14 days from today ({snapshot.todayYmd}). Open the full calendar for March ledger items.</p>
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

      <DashboardSection title="Approval package inbox">
        <p className="mb-3 font-body text-xs text-kelly-muted">
          Package send status from ledger email log. Email transport is gated by EMAIL_SEND_ENABLED.
        </p>
        <AiObservationsPanel observations={[]} compact />
        {snapshot.approvalInbox.length ? (
          <ul className="space-y-2 font-body text-sm">
            {snapshot.approvalInbox.map((item) => (
              <li key={item.recordId} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-kelly-text/10 px-3 py-2">
                <div>
                  <strong>{item.title}</strong>
                  <span className="ml-2 text-xs text-kelly-muted">
                    {item.dateYmd} {item.timeLabel}
                  </span>
                  <p className="mt-1 text-xs text-kelly-muted">
                    Package: <strong>{item.packageStatus.replaceAll("_", " ")}</strong>
                    {item.lastSentAt ? ` · sent ${new Date(item.lastSentAt).toLocaleString()}` : ""}
                    {item.awaitingCandidate ? " · awaiting candidate" : ""}
                  </p>
                </div>
                <Link href={item.packagePreviewUrl} className="text-xs font-bold text-kelly-navy underline">
                  {item.packageStatus === "sent" ? "View / resend" : "Preview / send"}
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-kelly-muted">No pending packages in queue.</p>
        )}
      </DashboardSection>
    </CampaignDashboardShell>
  );
}
