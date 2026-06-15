import Link from "next/link";

import {
  getCitizenVoicesLteModel,
  type LteOutletTracking,
} from "@/lib/election-plan/load-citizen-voices-lte";
import {
  getArkansasCampuses,
  getFreshmanWeekReadinessRollup,
} from "@/lib/election-plan/load-movement-infrastructure";
import { phase18MasterPlanHref } from "@/lib/election-plan/phase-18-movement-infrastructure";

function StatusDot({ ok }: { ok: boolean }) {
  return (
    <span
      className={`inline-block h-2 w-2 rounded-full ${ok ? "bg-emerald-500" : "bg-red-400"}`}
      aria-hidden
    />
  );
}

function OutletRow({ outlet }: { outlet: LteOutletTracking }) {
  return (
    <tr className="border-b border-[var(--ep-border)] last:border-0">
      <td className="py-2 pr-3">
        <span className="font-medium">{outlet.outletName}</span>
        <p className="text-xs text-[var(--ep-navy-muted)]">Tier {outlet.tier} · {outlet.mediaMarket}</p>
      </td>
      <td className="py-2 pr-3">{outlet.primaryCounty}</td>
      <td className="py-2 pr-3">
        {outlet.lteCoordinator ? (
          <span className="text-sm">{outlet.lteCoordinator}</span>
        ) : (
          <span className="text-xs font-semibold uppercase text-red-700">Vacant</span>
        )}
      </td>
      <td className="py-2 pr-3 tabular-nums">{outlet.writers}</td>
      <td className="py-2 pr-3 tabular-nums">{outlet.lettersSubmitted}</td>
      <td className="py-2 tabular-nums">{outlet.lettersPublished}</td>
    </tr>
  );
}

export function CitizenVoicesLtePanel() {
  const model = getCitizenVoicesLteModel();
  const { rollup } = model;

  return (
    <section>
      <Link href={phase18MasterPlanHref()} className="text-xs font-semibold text-[var(--ep-navy-muted)] hover:text-[var(--ep-navy)]">
        ← Phase 18
      </Link>
      <div className="mt-2">
        <p className="text-xs font-bold uppercase tracking-[0.15em] text-[var(--ep-gold)]">Phase 18.7 · LTE Corps</p>
        <h1 className="font-heading text-2xl font-bold text-[var(--ep-navy)]">{model.programName}</h1>
        <p className="mt-1 text-sm text-[var(--ep-navy-muted)]">{model.doctrine}</p>
        <p className="mt-2 text-sm font-medium text-[var(--ep-navy)]">Goal: {model.goal}</p>
      </div>

      <div className="my-6 ep-stat-grid">
        <div className="ep-stat">
          <div className="ep-stat-value">{rollup.outletsTracked}</div>
          <div className="ep-stat-label">Newspapers tracked</div>
        </div>
        <div className="ep-stat">
          <div className="ep-stat-value">{rollup.coordinatorsAssigned}</div>
          <div className="ep-stat-label">Coordinators assigned</div>
        </div>
        <div className="ep-stat">
          <div className="ep-stat-value">{rollup.totalWriters}</div>
          <div className="ep-stat-label">Citizen writers</div>
        </div>
        <div className="ep-stat">
          <div className="ep-stat-value">{rollup.lettersSubmitted}</div>
          <div className="ep-stat-label">Letters submitted</div>
        </div>
        <div className="ep-stat">
          <div className="ep-stat-value">{rollup.lettersPublished}</div>
          <div className="ep-stat-label">Letters published</div>
        </div>
        <div className="ep-stat">
          <div className="ep-stat-value">{rollup.foundingWriters}/{rollup.foundingWritersGoal}</div>
          <div className="ep-stat-label">Founding writers by Labor Day</div>
        </div>
      </div>

      <div className="mb-8 ep-card">
        <h2 className="font-heading font-bold text-[var(--ep-navy)]">LTE workflow</h2>
        <p className="mt-1 text-xs text-[var(--ep-navy-muted)]">Real citizens — not campaign press releases</p>
        <ol className="mt-4 space-y-3">
          {model.workflowSteps.map((step) => (
            <li key={step.step} className="flex gap-3 text-sm">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--ep-navy)] text-xs font-bold text-white">
                {step.step}
              </span>
              <div>
                <span className="font-medium text-[var(--ep-navy)]">{step.label}</span>
                <span className="text-[var(--ep-navy-muted)]"> · {step.owner}</span>
              </div>
            </li>
          ))}
        </ol>
      </div>

      <div className="mb-8 ep-card overflow-x-auto">
        <h2 className="font-heading font-bold text-[var(--ep-navy)]">Regional coverage</h2>
        <table className="mt-4 w-full min-w-[40rem] text-sm">
          <thead>
            <tr className="border-b border-[var(--ep-border)] text-left text-xs uppercase text-[var(--ep-navy-muted)]">
              <th className="pb-2 pr-3">Region</th>
              <th className="pb-2 pr-3">Coordinator</th>
              <th className="pb-2 pr-3">Weekly goal</th>
              <th className="pb-2 pr-3">Outlets</th>
              <th className="pb-2 pr-3">Submitted</th>
              <th className="pb-2">Published</th>
            </tr>
          </thead>
          <tbody>
            {model.regions.map((r) => (
              <tr key={r.id} className="border-b border-[var(--ep-border)] last:border-0">
                <td className="py-2 pr-3 font-medium">{r.label}</td>
                <td className="py-2 pr-3">
                  {r.lteCoordinator ?? <span className="text-xs font-semibold uppercase text-red-700">Vacant</span>}
                </td>
                <td className="py-2 pr-3 tabular-nums">{r.weeklyGoal}/week</td>
                <td className="py-2 pr-3 tabular-nums">{r.outletsInRegion}</td>
                <td className="py-2 pr-3 tabular-nums">{r.lettersSubmitted}</td>
                <td className="py-2 tabular-nums">{r.lettersPublished}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="ep-card overflow-x-auto">
        <h2 className="font-heading font-bold text-[var(--ep-navy)]">Newspaper registry & publication tracking</h2>
        <table className="mt-4 w-full min-w-[56rem] text-sm">
          <thead>
            <tr className="border-b border-[var(--ep-border)] text-left text-xs uppercase text-[var(--ep-navy-muted)]">
              <th className="pb-2 pr-3">Newspaper</th>
              <th className="pb-2 pr-3">County</th>
              <th className="pb-2 pr-3">LTE coordinator</th>
              <th className="pb-2 pr-3">Writers</th>
              <th className="pb-2 pr-3">Submitted</th>
              <th className="pb-2">Published</th>
            </tr>
          </thead>
          <tbody>
            {model.outlets.map((o) => (
              <OutletRow key={o.outletId} outlet={o} />
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export function FreshmanWeekReadinessPanel() {
  const data = getFreshmanWeekReadinessRollup();

  const checklistKeys = [
    "captainAssigned",
    "tableLocationSecured",
    "mobilizeEventCreated",
    "volunteersAssigned",
    "registrationMaterialsReady",
  ] as const;

  return (
    <section>
      <Link href="/election-plan/campuses" className="text-xs font-semibold text-[var(--ep-navy-muted)] hover:text-[var(--ep-navy)]">
        ← Campus network
      </Link>
      <div className="mt-2">
        <p className="text-xs font-bold uppercase tracking-[0.15em] text-[var(--ep-gold)]">Phase 18.9</p>
        <h1 className="font-heading text-2xl font-bold text-[var(--ep-navy)]">Freshman Week Readiness</h1>
        <p className="mt-1 text-sm text-[var(--ep-navy-muted)]">
          Must be operational before August · target {data.targetDate}
        </p>
      </div>

      <div className="my-6 ep-stat-grid">
        <div className="ep-stat">
          <div className="ep-stat-value">{data.summary.fullyReady}/{data.summary.total}</div>
          <div className="ep-stat-label">Fully ready</div>
        </div>
        <div className="ep-stat">
          <div className="ep-stat-value">{data.summary.captainsAssigned}</div>
          <div className="ep-stat-label">Captains assigned</div>
        </div>
        <div className="ep-stat">
          <div className="ep-stat-value">{data.summary.mobilizeCreated}</div>
          <div className="ep-stat-label">Mobilize events</div>
        </div>
        <div className="ep-stat">
          <div className="ep-stat-value">{data.summary.kellyConfirmed}</div>
          <div className="ep-stat-label">Kelly confirmed</div>
        </div>
      </div>

      <div className="overflow-x-auto ep-card">
        <table className="w-full min-w-[64rem] text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--ep-border)] text-xs uppercase text-[var(--ep-navy-muted)]">
              <th className="py-2 pr-3">Campus</th>
              {checklistKeys.map((k) => (
                <th key={k} className="py-2 px-2 text-center">{data.checklistLabels[k]}</th>
              ))}
              <th className="py-2 pl-2">Kelly appearance</th>
            </tr>
          </thead>
          <tbody>
            {data.campuses.map((c) => {
              const r = c.freshmanWeekReadiness!;
              const readyCount = checklistKeys.filter((k) => r[k]).length;
              return (
                <tr key={c.slug} className="border-b border-[var(--ep-border)] last:border-0">
                  <td className="py-2 pr-3">
                    <Link href={`/election-plan/campuses/${c.slug}`} className="font-medium hover:underline">
                      {c.shortName}
                    </Link>
                    <p className="text-xs text-[var(--ep-navy-muted)]">
                      {c.county} · {readyCount}/{checklistKeys.length} ready
                    </p>
                  </td>
                  {checklistKeys.map((k) => (
                    <td key={k} className="py-2 px-2 text-center">
                      <StatusDot ok={r[k]} />
                    </td>
                  ))}
                  <td className="py-2 pl-2 capitalize text-xs">{r.kellyAppearanceStatus.replace(/_/g, " ")}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

const PRIORITY_CAPTAIN_SLUGS = new Set([
  "arkansas-state-university",
  "ualr",
  "university-of-arkansas",
]);

export function CampusCaptainDashboardPanel() {
  const campuses = getArkansasCampuses();
  const filled = campuses.filter((c) => c.campusCaptainStatus === "filled").length;

  return (
    <section>
      <Link href="/election-plan/campuses" className="text-xs font-semibold text-[var(--ep-navy-muted)] hover:text-[var(--ep-navy)]">
        ← Campus network
      </Link>
      <div className="mt-2">
        <p className="text-xs font-bold uppercase tracking-[0.15em] text-[var(--ep-gold)]">Phase 18.1 · Captains</p>
        <h1 className="font-heading text-2xl font-bold text-[var(--ep-navy)]">Campus Captain Assignment</h1>
        <p className="mt-1 text-sm text-[var(--ep-navy-muted)]">
          Hold campus fundraising workflow until ASU · UALR · Fayetteville leaders recruited
        </p>
      </div>

      <div className="my-6 ep-stat-grid">
        <div className="ep-stat">
          <div className="ep-stat-value">{filled}/{campuses.length}</div>
          <div className="ep-stat-label">Captains filled</div>
        </div>
        <div className="ep-stat">
          <div className="ep-stat-value">{campuses.length - filled}</div>
          <div className="ep-stat-label">Vacant</div>
        </div>
        <div className="ep-stat">
          <div className="ep-stat-value">3</div>
          <div className="ep-stat-label">Priority recruits (ASU · UALR · UA)</div>
        </div>
      </div>

      <div className="overflow-x-auto ep-card">
        <table className="w-full min-w-[48rem] text-sm">
          <thead>
            <tr className="border-b border-[var(--ep-border)] text-left text-xs uppercase text-[var(--ep-navy-muted)]">
              <th className="py-2 pr-3">Campus</th>
              <th className="py-2 pr-3">County</th>
              <th className="py-2 pr-3">Enrollment</th>
              <th className="py-2 pr-3">Captain status</th>
              <th className="py-2 pr-3">Freshman week</th>
              <th className="py-2">Priority</th>
            </tr>
          </thead>
          <tbody>
            {campuses.map((c) => (
              <tr key={c.slug} className="border-b border-[var(--ep-border)] last:border-0">
                <td className="py-2 pr-3">
                  <Link href={`/election-plan/campuses/${c.slug}`} className="font-medium hover:underline">
                    {c.shortName}
                  </Link>
                </td>
                <td className="py-2 pr-3">{c.county}</td>
                <td className="py-2 pr-3 tabular-nums">{c.enrollment.toLocaleString()}</td>
                <td className="py-2 pr-3">
                  <span
                    className={
                      c.campusCaptainStatus === "filled"
                        ? "rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase text-emerald-900"
                        : "rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold uppercase text-red-900"
                    }
                  >
                    {c.campusCaptainStatus}
                  </span>
                </td>
                <td className="py-2 pr-3">{c.freshmanWeekOpportunity ? "Yes" : "—"}</td>
                <td className="py-2">
                  {PRIORITY_CAPTAIN_SLUGS.has(c.slug) ? (
                    <span className="rounded-full bg-[var(--ep-gold)]/20 px-2 py-0.5 text-[10px] font-bold uppercase text-amber-900">
                      Priority recruit
                    </span>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
