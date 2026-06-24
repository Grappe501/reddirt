import Link from "next/link";
import type { CampaignEventsDashboardSnapshot } from "@/lib/campaign-events/load-campaign-events-dashboard";
import { EMAIL_SEND_DISABLED_NOTICE } from "@/lib/campaign-events/approval-recipients";
import { ApprovalRecipientsBanner } from "@/components/admin/campaign-events/ApprovalRecipientsBanner";
import { MonthlyTravelSummaryCard } from "@/components/admin/campaign-events/MonthlyTravelSummaryCard";
import { ReimbursementMonthCards } from "@/components/admin/campaign-events/travel-reimbursement/ReimbursementMonthCards";
import type { ReimbursementMonthSummary } from "@/lib/campaign-events/travel-reimbursement/load-reimbursement-summaries";
import { REIMBURSEMENT_STATUS_LABELS } from "@/lib/campaign-events/travel-reimbursement/reimbursement-month-status-shared";
import { AgentNextActionPanel } from "@/components/admin/campaign-events/AgentNextActionPanel";
import { AgentCommandPalette } from "@/components/agents/AgentCommandPalette";
import type { CampaignGap } from "@/lib/agents/campaign-intelligence/campaign-gap-analyzer";
import type { NextActionResult } from "@/lib/agents/user-intelligence/next-action-engine";
import type { WorkflowFrictionSignal } from "@/lib/agents/user-intelligence/workflow-friction-detector";
import { MicrocopyHint } from "@/components/admin/campaign-events/MicrocopyHint";
import { CampaignDashboardShell, DashboardSection, DashboardStatGrid, StatCard } from "./CampaignDashboardShell";
import { CampaignManagerFinancePanel } from "../finance/CampaignManagerFinancePanel";
import type { CampaignFinanceSnapshot } from "@/lib/campaign-events/finance/load-campaign-finance-snapshot";
import { ExecutiveSummaryStrip } from "@/components/admin/navigation/ExecutiveSummaryStrip";
import { WorkflowGuidanceCards } from "@/components/admin/navigation/WorkflowGuidanceCards";
import type { ExecutiveSummary } from "@/lib/dashboard-orchestration/executive-summary-builder";
import type { WorkflowGuidanceCard } from "@/lib/dashboard-orchestration/workflow-guidance-generator";
import type { AdaptiveDashboardPlan } from "@/lib/dashboard-orchestration/adaptive-dashboard-orchestrator";
import { isCardCollapsed } from "@/lib/dashboard-orchestration/adaptive-dashboard-orchestrator";
import { CountyIntelligencePanel } from "@/components/admin/county-intelligence/CountyIntelligencePanel";
import type { StatewideCountyIntelligence } from "@/lib/agents/county-intelligence/county-kpi-types";
import { VolunteerIntelligencePanel } from "@/components/admin/volunteers/VolunteerIntelligencePanel";
import type { VolunteerSystemBundle } from "@/lib/campaign-events/volunteers/load-volunteer-bundle";
import { OperationsCommandLadderPanel } from "@/components/volunteers/OperationsCommandLadderPanel";
import type { OperationsFeedbackRollup } from "@/lib/volunteers/load-operations-feedback-rollup";

const AUTOMATION_SCAFFOLDS = [
  { label: "Approval emails", status: "Scaffold — recipients configured", href: "/admin/campaign-events/ai-tools" },
  { label: "Host dashboard", status: "Idea", href: "/admin/campaign-events/ai-tools" },
  { label: "Event reminders", status: "Not built", href: "/admin/campaign-events/ai-tools" },
  { label: "Official reimbursement request", status: "Print / CSV / JSON", href: "/admin/campaign-events/reimbursement?month=2026-04" },
  { label: "Compliance export", status: "Not built", href: "/admin/travel-ledger" },
] as const;

export function CampaignManagerOpsDashboard({
  countyStatewide,
  snapshot,
  reimbursementSummaries,
  financeSnapshot,
  nextActions,
  gapHighlight,
  frictionTop,
  executiveSummary,
  guidanceCards,
  adaptivePlan,
  volunteerBundle,
  operationsFeedbackRollup,
}: {
  countyStatewide?: StatewideCountyIntelligence;
  volunteerBundle?: VolunteerSystemBundle;
  operationsFeedbackRollup?: OperationsFeedbackRollup;
  snapshot: CampaignEventsDashboardSnapshot;
  reimbursementSummaries?: ReimbursementMonthSummary[];
  financeSnapshot?: CampaignFinanceSnapshot;
  nextActions?: NextActionResult;
  gapHighlight?: CampaignGap;
  frictionTop?: WorkflowFrictionSignal[];
  executiveSummary?: ExecutiveSummary;
  guidanceCards?: WorkflowGuidanceCard[];
  adaptivePlan?: AdaptiveDashboardPlan;
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

      {operationsFeedbackRollup ? (
        <OperationsCommandLadderPanel
          rollup={operationsFeedbackRollup}
          activeTierId="campaign_manager"
          surface="admin"
        />
      ) : null}

      {executiveSummary ? <ExecutiveSummaryStrip summary={executiveSummary} /> : null}
      {guidanceCards?.length ? <WorkflowGuidanceCards cards={guidanceCards} /> : null}
      {countyStatewide ? <CountyIntelligencePanel statewide={countyStatewide} compact /> : null}
      {volunteerBundle ? <VolunteerIntelligencePanel bundle={volunteerBundle} /> : null}

      <AgentCommandPalette role="campaign_manager" pathname="/admin/campaign-manager-dashboard" period={period} />
      {nextActions ? <AgentNextActionPanel actions={nextActions} /> : null}

      {gapHighlight ? (
        <section className="rounded-2xl border border-amber-600/20 bg-amber-50/70 px-4 py-3 font-body text-xs text-amber-950">
          <strong>Gap:</strong> {gapHighlight.title} — {gapHighlight.recommendedAction}{" "}
          <Link href="/admin/ai-command-center" className="font-bold underline">
            AI command center
          </Link>
        </section>
      ) : null}

      {frictionTop && frictionTop.length > 0 ? (
        <section className="rounded-2xl border border-orange-200/40 bg-orange-50/60 px-4 py-3 font-body text-xs text-orange-950">
          <strong>Friction:</strong> {frictionTop[0].frictionType} — {frictionTop[0].suggestedNextAction}{" "}
          <MicrocopyHint term="ai_observation" role="campaign_manager" />
        </section>
      ) : null}

      <Link
        href={`/admin/campaign-events/month-readiness?month=${period}`}
        className="inline-flex rounded-full border border-amber-700/30 bg-amber-50 px-4 py-2 font-body text-sm font-bold text-amber-950"
      >
        {period} readiness · close checklist
      </Link>

      <ReimbursementMonthCards title="Travel reimbursement workflow" summaries={reimbursementSummaries} />

      {financeSnapshot ? <CampaignManagerFinancePanel snapshot={financeSnapshot} month={period} /> : null}

      {snapshot.calendarSync ? (
      <DashboardSection title="Calendar sync (read-only)">
        <DashboardStatGrid>
          <StatCard
            label="Sync dashboard"
            value={snapshot.calendarSync.googleMatched + snapshot.calendarSync.importedOnly}
            href={`/admin/campaign-events/calendar-sync?month=${period}`}
            hint="Matched + imported JSON"
          />
          <StatCard label="Stale rows" value={snapshot.calendarSync.stale} href={`/admin/campaign-events/calendar-sync?month=${period}`} />
          <StatCard
            label="GCal conflicts"
            value={snapshot.calendarSync.conflicts}
            href={`/admin/campaign-events/workbench?month=${period}&sync=GOOGLE_READ_CONFLICT`}
          />
          <StatCard
            label="OAuth ready"
            value={snapshot.calendarSync.googleConfigured ? 1 : 0}
            href="/admin/calendar-command-center/google-setup"
            hint={snapshot.calendarSync.googleConfigured ? "Configured" : "Not configured"}
          />
        </DashboardStatGrid>
        {snapshot.calendarSync.jsonStale ? (
          <p className="mt-2 font-body text-xs text-amber-900">Normalized JSON may be stale — see calendar sync dashboard for refresh commands.</p>
        ) : null}
      </DashboardSection>
      ) : null}

      <DashboardSection title="Calendar promotion queue">
        <DashboardStatGrid>
          <StatCard
            label="Ready tentative"
            value={snapshot.promotionReadyTentative}
            href={`/admin/campaign-events/calendar-promotion?month=${period}`}
          />
          <StatCard
            label="Ready official"
            value={snapshot.promotionReadyOfficial}
            href={`/admin/campaign-events/calendar-promotion?month=${period}`}
          />
          <StatCard label="Failed" value={snapshot.promotionFailed} href={`/admin/campaign-events/calendar-promotion?month=${period}`} />
          <StatCard
            label="Blocked / conflict"
            value={snapshot.promotionBlocked}
            href={`/admin/campaign-events/calendar-promotion?month=${period}`}
          />
        </DashboardStatGrid>
        <Link href={`/admin/campaign-events/calendar-promotion?month=${period}`} className="mt-2 inline-block text-sm font-bold text-kelly-navy underline">
          Open promotion workbench
        </Link>
      </DashboardSection>

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
            <span className="text-kelly-muted">{monthSummary.nextAction}</span>
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
        <p className="mt-2 font-body text-xs text-kelly-muted">
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
        <p className="mt-3 font-body text-xs text-kelly-muted">
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

      {adaptivePlan && !isCardCollapsed(adaptivePlan, "automation_scaffolds") ? (
      <DashboardSection title="Automation readiness (scaffold)">
        <ul className="space-y-2 font-body text-sm">
          {AUTOMATION_SCAFFOLDS.map((a) => (
            <li key={a.label} className="flex flex-wrap justify-between gap-2 rounded-lg border border-kelly-text/10 px-3 py-2">
              <Link href={a.href} className="font-semibold text-kelly-navy underline">
                {a.label}
              </Link>
              <span className="text-xs text-kelly-muted">{a.status}</span>
            </li>
          ))}
        </ul>
      </DashboardSection>
      ) : null}
    </CampaignDashboardShell>
  );
}
