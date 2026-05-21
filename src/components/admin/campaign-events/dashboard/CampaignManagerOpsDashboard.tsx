import Link from "next/link";
import type { CampaignEventsDashboardSnapshot } from "@/lib/campaign-events/load-campaign-events-dashboard";
import { EMAIL_SEND_DISABLED_NOTICE } from "@/lib/campaign-events/approval-recipients";
import { ApprovalRecipientsBanner } from "@/components/admin/campaign-events/ApprovalRecipientsBanner";
import { MonthlyTravelSummaryCard } from "@/components/admin/campaign-events/MonthlyTravelSummaryCard";
import { ReimbursementMonthCards } from "@/components/admin/campaign-events/travel-reimbursement/ReimbursementMonthCards";
import type { ReimbursementMonthSummary } from "@/lib/campaign-events/travel-reimbursement/load-reimbursement-summaries";
import { REIMBURSEMENT_STATUS_LABELS } from "@/lib/campaign-events/travel-reimbursement/reimbursement-month-status";
import { CampaignDashboardShell, DashboardSection, DashboardStatGrid, StatCard } from "./CampaignDashboardShell";

const AUTOMATION_SCAFFOLDS = [
  { label: "Approval emails", status: "Scaffold — recipients configured", href: "/admin/campaign-events/ai-tools" },
  { label: "Host dashboard", status: "Idea", href: "/admin/campaign-events/ai-tools" },
  { label: "Event reminders", status: "Not built", href: "/admin/campaign-events/ai-tools" },
  { label: "Official reimbursement request", status: "Print / CSV / JSON", href: "/admin/campaign-events/reimbursement?month=2026-04" },
  { label: "Compliance export", status: "Not built", href: "/admin/travel-ledger" },
] as const;

export function CampaignManagerOpsDashboard({
  snapshot,
  reimbursementSummaries,
}: {
  snapshot: CampaignEventsDashboardSnapshot;
  reimbursementSummaries?: ReimbursementMonthSummary[];
}) {
  const { period } = snapshot;
  const monthSummary = reimbursementSummaries?.find((s) => s.month === period);
  const travelHref = `/admin/campaign-events/travel-report?month=${period}`;
  const reviewHref = `/admin/campaign-events/review?month=${period}&mode=chronological`;

  return (
    <CampaignDashboardShell
      eyebrow="Campaign operations · manager command center"
      title="Campaign manager dashboard"
      description="Event operations, travel ledger snapshot, approval queues, and calendar health for the March pilot period. Orchestration hub links — email send remains disabled."
    >
      <ApprovalRecipientsBanner compact />

      <Link
        href={`/admin/campaign-events/month-readiness?month=${period}`}
        className="inline-flex rounded-full border border-amber-700/30 bg-amber-50 px-4 py-2 font-body text-sm font-bold text-amber-950"
      >
        {period} readiness · close checklist
      </Link>

      <ReimbursementMonthCards title="Travel reimbursement workflow" summaries={reimbursementSummaries} />

      <DashboardSection title="Event operations command center">
        <div className="flex flex-wrap gap-2 font-body text-sm">
          <Link href="/admin/campaign-events/workbench" className="rounded-full bg-kelly-navy px-4 py-2 font-bold text-white">
            Campaign events workbench
          </Link>
          <Link href={reviewHref} className="rounded-full border px-4 py-2 font-bold">
            Month Review Wizard
          </Link>
          <Link href="/admin/workbench" className="rounded-full border px-4 py-2 font-bold">
            CM workbench (legacy)
          </Link>
        </div>
        <div className="mt-3 flex flex-wrap gap-2 text-sm">
          <Link href="/admin/campaign-calendar/timeline" className="underline">
            Timeline
          </Link>
          <Link href="/admin/campaign-calendar/month" className="underline">
            Month
          </Link>
          <Link href="/admin/campaign-calendar/week" className="underline">
            Week
          </Link>
          <Link href="/admin/campaign-calendar/day" className="underline">
            Day
          </Link>
          <Link href="/admin/campaign-calendar/agenda" className="underline">
            Agenda
          </Link>
        </div>
      </DashboardSection>

      <MonthlyTravelSummaryCard month={period} totals={snapshot.travel} reportHref={travelHref} />

      <DashboardSection title={`Travel reimbursement command (${period})`}>
        {monthSummary ? (
          <p className="mb-3 font-body text-sm">
            Month status:{" "}
            <strong>{REIMBURSEMENT_STATUS_LABELS[monthSummary.effectiveStatus]}</strong>
            {" · "}
            <span className="text-kelly-text/65">{monthSummary.nextAction}</span>
          </p>
        ) : null}
        <DashboardStatGrid>
          <StatCard
            label="Needs travel approval"
            value={snapshot.travel.needsReviewCount}
            href={`/admin/campaign-events/review?month=${period}&mode=travel_needs_approval&autostart=1`}
          />
          <StatCard label="Missing mileage" value={snapshot.travel.missingMileage} href={`/admin/campaign-events/travel-log?month=${period}&filter=needs_mileage`} />
          <StatCard
            label="Unapproved reimbursement rows"
            value={snapshot.travel.unapprovedReimbursementCount}
            href={`/admin/campaign-events/travel-log?month=${period}&filter=needs_approval`}
          />
          <StatCard
            label="Approved reimbursement $"
            value={new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(
              snapshot.travel.approvedReimbursement,
            )}
            href={`/admin/campaign-events/reimbursement?month=${period}`}
            hint="Print-ready request"
          />
        </DashboardStatGrid>
        <div className="mt-3 flex flex-wrap gap-2 text-sm">
          <Link href={`/admin/campaign-events/travel-log?month=${period}`} className="font-semibold text-kelly-navy underline">
            Tentative travel log
          </Link>
          <Link href={`/admin/campaign-events/reimbursement?month=${period}`} className="underline">
            View / print official request
          </Link>
          <Link href={travelHref} className="underline">
            Monthly travel report
          </Link>
        </div>
      </DashboardSection>

      <DashboardSection title="Website intake queue">
        <DashboardStatGrid>
          <StatCard
            label="Website intake volume"
            value={snapshot.websiteIntakeCount}
            href={`/admin/campaign-events/review?month=${period}&mode=website_intake_only`}
          />
          <StatCard
            label="Tentative (website)"
            value={snapshot.tentativeWebsiteCount}
            href={`/admin/campaign-events/review?month=${period}&mode=tentative_only`}
          />
          <StatCard
            label="Unresolved duplicates"
            value={snapshot.duplicateRiskCount}
            href={`/admin/campaign-events/review?month=${period}&mode=duplicate_risk`}
          />
          <StatCard
            label="Unresolved conflicts"
            value={snapshot.intakeConflictCount}
            href={`/admin/campaign-events/review?month=${period}&mode=intake_conflict`}
          />
        </DashboardStatGrid>
        <p className="mt-2 font-body text-xs text-kelly-text/55">
          Public schedule form → WorkflowIntake → CampaignEventLedgerRecord (tentative).{" "}
          <Link href="/schedule" className="underline">
            Public form
          </Link>
        </p>
      </DashboardSection>

      <DashboardSection title="Approval queue">
        <DashboardStatGrid>
          <StatCard label="Pending candidate decision" value={snapshot.pendingApprovals} href={reviewHref} />
          <StatCard label="Request info" value={snapshot.requestInfo} href="/admin/campaign-events/workbench" />
          <StatCard label="Holds" value={snapshot.holds} href={reviewHref} />
          <StatCard label="Denials (retained)" value={snapshot.denials} href="/admin/campaign-events/workbench" />
        </DashboardStatGrid>
        <p className="mt-3 font-body text-xs text-kelly-text/55">
          Campaign manager email not configured — candidate packages default to Kelly addresses. {EMAIL_SEND_DISABLED_NOTICE}
        </p>
        <Link href="/admin/candidate-dashboard" className="mt-2 inline-block text-sm font-semibold text-kelly-navy underline">
          Candidate dashboard →
        </Link>
      </DashboardSection>

      <DashboardSection title="Calendar health">
        <DashboardStatGrid>
          <StatCard label="Schedule conflicts" value={snapshot.conflicts} href="/admin/campaign-events/workbench" />
          <StatCard label="Work-hours warnings" value={snapshot.workHoursWarnings} href="/admin/campaign-events/workbench" />
          <StatCard label="Missing city" value={snapshot.missingCity} href={travelHref} />
          <StatCard label="Missing county" value={snapshot.missingCounty} href={travelHref} />
          <StatCard label="Missing ZIP" value={snapshot.missingZip} href="/admin/campaign-events/workbench" />
          <StatCard label="Tentative events" value={snapshot.tentativeCount} href="/admin/campaign-events/workbench" />
          <StatCard label="Official / on calendar" value={snapshot.officialCount} href="/admin/campaign-calendar/timeline" />
        </DashboardStatGrid>
      </DashboardSection>

      <DashboardSection title="Automation readiness (scaffold)">
        <ul className="space-y-2 font-body text-sm">
          {AUTOMATION_SCAFFOLDS.map((a) => (
            <li key={a.label} className="flex flex-wrap justify-between gap-2 rounded-lg border border-kelly-text/10 px-3 py-2">
              <Link href={a.href} className="font-semibold text-kelly-navy underline">
                {a.label}
              </Link>
              <span className="text-xs text-kelly-text/55">{a.status}</span>
            </li>
          ))}
        </ul>
      </DashboardSection>
    </CampaignDashboardShell>
  );
}
