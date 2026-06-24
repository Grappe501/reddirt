import Link from "next/link";

import type { CampaignEventsDashboardSnapshot } from "@/lib/campaign-events/load-campaign-events-dashboard";
import type { ReimbursementMonthSummary } from "@/lib/campaign-events/travel-reimbursement/load-reimbursement-summaries";
import type { CampaignFinanceSnapshot } from "@/lib/campaign-events/finance/load-campaign-finance-snapshot";
import type { ExecutiveSummary } from "@/lib/dashboard-orchestration/executive-summary-builder";
import type { NextActionResult } from "@/lib/agents/user-intelligence/next-action-engine";
import type { StatewideCountyIntelligence } from "@/lib/agents/county-intelligence/county-kpi-types";
import {
  buildCandidateDashboardLayers,
  type CandidateDashboardLayerId,
} from "@/lib/dashboard-orchestration/candidate-dashboard-layers";
import { ExecutiveSummaryStrip } from "@/components/admin/navigation/ExecutiveSummaryStrip";
import { AgentNextActionPanel } from "@/components/admin/campaign-events/AgentNextActionPanel";
import { MonthlyTravelSummaryCard } from "@/components/admin/campaign-events/MonthlyTravelSummaryCard";
import { ReimbursementMonthCards } from "@/components/admin/campaign-events/travel-reimbursement/ReimbursementMonthCards";
import { CandidateFinanceOverview } from "../finance/CandidateFinanceOverview";
import { CountyIntelligencePanel } from "@/components/admin/county-intelligence/CountyIntelligencePanel";
import { CandidateLayerNav } from "./CandidateLayerNav";
import { CampaignDashboardShell, DashboardSection, DashboardStatGrid, StatCard } from "./CampaignDashboardShell";

type Props = {
  snapshot: CampaignEventsDashboardSnapshot;
  layer: CandidateDashboardLayerId | null;
  reimbursementSummaries?: ReimbursementMonthSummary[];
  financeSnapshot?: CampaignFinanceSnapshot;
  countyStatewide?: StatewideCountyIntelligence;
  nextActions?: NextActionResult;
  executiveSummary?: ExecutiveSummary;
};

function LayerCards({
  snapshot,
  layers,
}: {
  snapshot: CampaignEventsDashboardSnapshot;
  layers: ReturnType<typeof buildCandidateDashboardLayers>;
}) {
  return (
    <section className="grid gap-4 sm:grid-cols-2">
      {layers.map((layer) => (
        <Link
          key={layer.id}
          href={layer.href}
          className="os-card block p-5 transition hover:border-kelly-navy/35 hover:shadow-md"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="font-heading text-lg font-bold text-kelly-text">{layer.label}</h2>
              <p className="mt-2 text-sm leading-relaxed text-kelly-muted">{layer.description}</p>
            </div>
            {layer.badge > 0 ? (
              <span className="shrink-0 rounded-full bg-kelly-navy px-3 py-1 font-heading text-lg font-bold text-white">
                {layer.badge}
              </span>
            ) : (
              <span className="shrink-0 rounded-full border border-kelly-text/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-kelly-muted">
                {layer.badgeHint}
              </span>
            )}
          </div>
          {layer.primaryAction ? (
            <p className="mt-4 text-xs font-bold uppercase tracking-wide text-kelly-slate">
              {layer.primaryAction.label} →
            </p>
          ) : null}
        </Link>
      ))}
    </section>
  );
}

function HomeView({
  snapshot,
  layers,
  executiveSummary,
}: {
  snapshot: CampaignEventsDashboardSnapshot;
  layers: ReturnType<typeof buildCandidateDashboardLayers>;
  executiveSummary?: ExecutiveSummary;
}) {
  const decisionLayer = layers.find((l) => l.id === "decisions");
  const topDecisions = snapshot.upcoming.slice(0, 5);

  return (
    <>
      {executiveSummary ? <ExecutiveSummaryStrip summary={executiveSummary} /> : null}

      {decisionLayer && decisionLayer.badge > 0 ? (
        <section className="rounded-2xl border border-kelly-navy/15 bg-kelly-navy/5 px-5 py-4">
          <p className="font-body text-sm text-kelly-muted">Needs your decision</p>
          <p className="mt-1 font-heading text-2xl font-bold text-kelly-text">
            {decisionLayer.badge} item{decisionLayer.badge === 1 ? "" : "s"}
          </p>
          <Link
            href={decisionLayer.href}
            className="mt-3 inline-flex rounded-full bg-kelly-navy px-5 py-2.5 text-sm font-bold text-white"
          >
            Review decisions
          </Link>
        </section>
      ) : (
        <section className="rounded-2xl border border-emerald-200/60 bg-emerald-50/80 px-5 py-4">
          <p className="font-heading text-lg font-bold text-emerald-950">You're clear for now</p>
          <p className="mt-1 text-sm text-emerald-900/90">
            No pending approvals in the queue. Open a layer below when you want schedule, travel, or field context.
          </p>
        </section>
      )}

      <div>
        <h2 className="font-heading text-base font-bold text-kelly-text">Your layers</h2>
        <p className="mt-1 text-sm text-kelly-muted">
          Tap a card to drill down. Steve manages the full campaign manager board — this view stays calm.
        </p>
        <div className="mt-4">
          <LayerCards snapshot={snapshot} layers={layers} />
        </div>
      </div>

      {topDecisions.length ? (
        <DashboardSection title="Coming up">
          <ul className="divide-y divide-kelly-text/5 font-body text-sm">
            {topDecisions.map((e) => (
              <li key={e.recordId} className="flex flex-wrap items-baseline justify-between gap-2 py-2">
                <div>
                  <Link href={`/admin/campaign-events/${e.recordId}`} className="font-semibold text-kelly-navy underline">
                    {e.title}
                  </Link>
                  <p className="text-xs text-kelly-muted">
                    {e.dateYmd} · {e.timeLabel}
                    {e.city ? ` · ${e.city}` : ""}
                  </p>
                </div>
                <span className="text-xs text-kelly-muted">{e.decisionLabel ?? "pending"}</span>
              </li>
            ))}
          </ul>
          <Link
            href={layers.find((l) => l.id === "schedule")?.href ?? "#"}
            className="mt-3 inline-block text-sm font-semibold text-kelly-navy underline"
          >
            Full schedule layer →
          </Link>
        </DashboardSection>
      ) : null}
    </>
  );
}

function DecisionsLayer({
  snapshot,
  nextActions,
}: {
  snapshot: CampaignEventsDashboardSnapshot;
  nextActions?: NextActionResult;
}) {
  const { period } = snapshot;
  const reviewHref = `/admin/campaign-events/review?month=${period}&mode=chronological`;

  return (
    <>
      {nextActions ? <AgentNextActionPanel actions={nextActions} compact /> : null}
      <DashboardSection title="Pending approvals">
        <DashboardStatGrid>
          <StatCard label="Needs decision" value={snapshot.pendingApprovals} href={reviewHref} hint="Approve · deny · hold" />
          <StatCard label="On hold" value={snapshot.holds} href={reviewHref} />
          <StatCard label="Approved this month" value={snapshot.approved} href="/admin/campaign-events/workbench" />
          <StatCard label="Missing info" value={snapshot.actionItems.missingInfo} href="/admin/campaign-events/workbench" />
        </DashboardStatGrid>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link href={reviewHref} className="rounded-full bg-kelly-navy px-4 py-2 text-sm font-bold text-white">
            Month review wizard
          </Link>
        </div>
      </DashboardSection>

      <DashboardSection title="Approval packages">
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
                    {item.packageStatus.replaceAll("_", " ")}
                    {item.awaitingCandidate ? " · awaiting you" : ""}
                  </p>
                </div>
                <Link href={item.packagePreviewUrl} className="text-xs font-bold text-kelly-navy underline">
                  Open package
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-kelly-muted">No packages waiting.</p>
        )}
      </DashboardSection>
    </>
  );
}

function ScheduleLayer({ snapshot }: { snapshot: CampaignEventsDashboardSnapshot }) {
  const { period } = snapshot;

  return (
    <>
      <DashboardSection title="Upcoming (next 14 days)">
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
          <p className="font-body text-sm text-kelly-muted">No events in the next 14 days.</p>
        )}
      </DashboardSection>
      <div className="flex flex-wrap gap-2 text-sm">
        <Link href="/admin/calendar-command-center/kelly" className="rounded-full bg-kelly-navy px-4 py-2 font-bold text-white">
          Kelly schedule cockpit
        </Link>
        <Link href="/admin/campaign-calendar/timeline" className="rounded-full border px-4 py-2 font-bold">
          Timeline
        </Link>
        <Link href="/admin/campaign-calendar/day" className="rounded-full border px-4 py-2 font-bold">
          Day view
        </Link>
        <Link href={`/admin/campaign-events/review?month=${period}&mode=chronological`} className="underline">
          Month review
        </Link>
      </div>
    </>
  );
}

function TravelLayer({
  snapshot,
  reimbursementSummaries,
}: {
  snapshot: CampaignEventsDashboardSnapshot;
  reimbursementSummaries?: ReimbursementMonthSummary[];
}) {
  const { period } = snapshot;
  const travelHref = `/admin/campaign-events/travel-report?month=${period}`;

  return (
    <>
      <MonthlyTravelSummaryCard month={period} totals={snapshot.travel} reportHref={travelHref} />
      <ReimbursementMonthCards title="Reimbursement months" summaries={reimbursementSummaries} />
      <DashboardSection title="Travel action items">
        <DashboardStatGrid>
          <StatCard label="Travel review" value={snapshot.actionItems.travelReview} href={travelHref} />
          <StatCard label="Needs mileage" value={snapshot.travel.missingMileage} href={travelHref} />
          <StatCard
            label="Hot wash pending"
            value={snapshot.actionItems.hotWashPending}
            href="/admin/campaign-events/workbench"
            hint="Past approved events"
          />
        </DashboardStatGrid>
      </DashboardSection>
      <p className="font-body text-xs text-kelly-muted">
        Steve clears mileage and ledger detail on the campaign manager board before you sign reimbursement packets.
      </p>
    </>
  );
}

function FinanceLayer({
  financeSnapshot,
  month,
}: {
  financeSnapshot?: CampaignFinanceSnapshot;
  month: string;
}) {
  if (!financeSnapshot) {
    return <p className="text-sm text-kelly-muted">Finance snapshot unavailable in this environment.</p>;
  }
  return <CandidateFinanceOverview snapshot={financeSnapshot} month={month} />;
}

function ReportsLayer({
  snapshot,
  countyStatewide,
}: {
  snapshot: CampaignEventsDashboardSnapshot;
  countyStatewide?: StatewideCountyIntelligence;
}) {
  const { period } = snapshot;

  return (
    <>
      {countyStatewide ? <CountyIntelligencePanel statewide={countyStatewide} compact /> : null}
      <DashboardSection title="Reports & checklists">
        <ul className="space-y-2 font-body text-sm">
          <li>
            <Link href={`/admin/campaign-events/month-readiness?month=${period}`} className="font-semibold text-kelly-navy underline">
              {period} month readiness checklist
            </Link>
          </li>
          <li>
            <Link href={`/admin/campaign-events/travel-report?month=${period}`} className="font-semibold text-kelly-navy underline">
              Monthly travel report
            </Link>
          </li>
          <li>
            <Link href="/admin/county-intelligence" className="font-semibold text-kelly-navy underline">
              Full county intelligence board
            </Link>
          </li>
        </ul>
        <p className="mt-4 text-xs text-kelly-muted">
          Website intake queues, calendar sync, and promotion work stay on the campaign manager board — not here.
        </p>
      </DashboardSection>
    </>
  );
}

export function CandidateCalmDashboard({
  snapshot,
  layer,
  reimbursementSummaries,
  financeSnapshot,
  countyStatewide,
  nextActions,
  executiveSummary,
}: Props) {
  const layers = buildCandidateDashboardLayers(snapshot);
  const { period } = snapshot;

  return (
    <CampaignDashboardShell
      variant="candidate-calm"
      eyebrow="Kelly Grappe · candidate home"
      title={layer ? layers.find((l) => l.id === layer)?.label ?? "Candidate dashboard" : "Your dashboard"}
      description={
        layer
          ? "Detail for this layer only — use Home to return to the calm summary."
          : "One calm home screen. Tap a layer for reports and workflow — Steve runs the full operations board."
      }
    >
      <CandidateLayerNav month={period} layer={layer} />

      {!layer ? (
        <HomeView snapshot={snapshot} layers={layers} executiveSummary={executiveSummary} />
      ) : layer === "decisions" ? (
        <DecisionsLayer snapshot={snapshot} nextActions={nextActions} />
      ) : layer === "schedule" ? (
        <ScheduleLayer snapshot={snapshot} />
      ) : layer === "travel" ? (
        <TravelLayer snapshot={snapshot} reimbursementSummaries={reimbursementSummaries} />
      ) : layer === "finance" ? (
        <FinanceLayer financeSnapshot={financeSnapshot} month={period} />
      ) : (
        <ReportsLayer snapshot={snapshot} countyStatewide={countyStatewide} />
      )}
    </CampaignDashboardShell>
  );
}
