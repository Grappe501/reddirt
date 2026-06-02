import Link from "next/link";
import type { StatewideCountyIntelligence } from "@/lib/agents/county-intelligence/county-kpi-types";
import type { CountyPublicBriefReadiness } from "@/lib/intelligence/briefs/governedBriefTypes";
import { buildCountyActionPackage } from "@/lib/agents/county-intelligence/county-action-package-builder";
import { buildFieldManagerDailyCountyPlan } from "@/lib/agents/county-intelligence/county-copilot-applications";
import { buildPowerOfFiveBriefing } from "@/lib/agents/county-intelligence/power-of-five-engine";
import { recommendCountyEventsForPeriod } from "@/lib/agents/county-intelligence/county-intelligence-engine";

export function CountyCommandCenterPanel({
  statewide,
  publicBriefRollup,
}: {
  statewide: StatewideCountyIntelligence;
  publicBriefRollup?: Record<CountyPublicBriefReadiness, number>;
}) {
  const p5 = buildPowerOfFiveBriefing();
  const fieldPlan = buildFieldManagerDailyCountyPlan();
  const events = recommendCountyEventsForPeriod("2026-03", 8);
  const pulaskiPkg = buildCountyActionPackage("pulaski", "county_recovery");

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-16 font-body text-kelly-text">
      <header className="border-b border-kelly-text/10 pb-4">
        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-kelly-subtle">Kelly Campaign OS · County V2</p>
        <h1 className="font-heading text-2xl font-bold text-kelly-navy">Statewide county command center</h1>
        <p className="mt-2 max-w-3xl text-sm text-kelly-muted">
          {statewide.counties.length} counties via read-only countyWorkbench bridge. Operator guidance only — no writes to workbench.
        </p>
        {!statewide.bridgeAvailable ? (
          <p className="mt-2 text-xs font-bold text-amber-900">Bridge unavailable — set COUNTY_WORKBENCH_ROOT.</p>
        ) : null}
      </header>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border bg-kelly-page p-4">
          <p className="text-xs font-bold text-kelly-muted">Statewide readiness</p>
          <p className="text-lg font-bold text-kelly-navy">{statewide.weakCounties.length} weak · {statewide.opportunityCounties.length} opportunity</p>
          <p className="text-xs text-kelly-muted">Reg goal {statewide.statewideRegistrationGoal.toLocaleString()} · PO5 {statewide.statewidePowerOfFiveGoal.toLocaleString()}</p>
        </div>
        <div className="rounded-xl border bg-kelly-page p-4">
          <p className="text-xs font-bold text-kelly-muted">Field manager · today</p>
          <ul className="mt-1 list-inside list-disc text-xs text-kelly-muted">
            {fieldPlan.dailyFieldTasks.slice(0, 3).map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </div>
        {publicBriefRollup ? (
          <div className="rounded-xl border border-amber-300/40 bg-amber-50/50 p-4">
            <p className="text-xs font-bold text-amber-950">Public brief readiness (internal only)</p>
            <p className="text-lg font-bold text-kelly-navy">
              {publicBriefRollup.PUBLIC_BRIEF_READY} public-ready · {publicBriefRollup.INTERNAL_MESSAGE_SOURCE_ONLY} internal source
            </p>
            <p className="text-xs text-kelly-muted">
              {publicBriefRollup.SHELL_ONLY} shell · {publicBriefRollup.FIELD_PLANNING_ONLY} field-only · NOT_PUBLISHABLE default
            </p>
            <Link href="/admin/intelligence" className="mt-1 inline-block text-xs font-semibold text-kelly-navy underline">
              Intelligence brief panel →
            </Link>
          </div>
        ) : null}
      </section>

      <section className="rounded-2xl border p-4">
        <h2 className="text-sm font-bold text-kelly-navy">Top weak counties</h2>
        <ul className="mt-2 space-y-2 text-sm">
          {statewide.weakCounties.slice(0, 10).map((c) => (
            <li key={c.countySlug} className="flex flex-wrap justify-between gap-2 rounded-lg border px-3 py-2">
              <span>
                <Link href={`/admin/counties/${c.countySlug}`} className="font-bold text-kelly-navy underline">
                  {c.countyName}
                </Link>
                <span className="ml-2 text-xs text-kelly-muted">readiness {c.countyReadinessScore}/100</span>
              </span>
              <span className="text-xs text-kelly-muted">{c.topWeaknesses[0] ?? "—"}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-2xl border p-4">
        <h2 className="text-sm font-bold text-kelly-navy">Power of 5 gaps</h2>
        <p className="text-xs text-kelly-muted">{p5.narrative}</p>
        <ul className="mt-2 text-xs">
          {p5.topGaps.slice(0, 8).map((g) => (
            <li key={g.countySlug}>
              {g.countyName}: gap {g.gap?.toLocaleString() ?? "TBD"} ({g.priority})
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-2xl border p-4">
        <h2 className="text-sm font-bold text-kelly-navy">Event recommendations</h2>
        <ul className="mt-2 text-xs">
          {events.map((e) => (
            <li key={e.countySlug}>
              <strong>{e.countyName}</strong> — {e.reason}
            </li>
          ))}
        </ul>
      </section>

      {pulaskiPkg ? (
        <section className="rounded-2xl border border-kelly-navy/15 bg-kelly-navy/[0.03] p-4">
          <h2 className="text-sm font-bold text-kelly-navy">Sample action package · {pulaskiPkg.countyName}</h2>
          <p className="mt-1 text-xs text-kelly-muted">{pulaskiPkg.countySummary}</p>
          <p className="mt-2 text-xs"><strong>Field:</strong> {pulaskiPkg.fieldTaskList.slice(0, 2).join(" · ")}</p>
          <p className="text-xs"><strong>Comms:</strong> {pulaskiPkg.communicationsRecommendation}</p>
        </section>
      ) : null}

      <section className="rounded-2xl border p-4">
        <h2 className="text-sm font-bold text-kelly-navy">Communications opportunities</h2>
        <p className="text-xs text-kelly-muted">Draft county angles from action packages — human send only.</p>
        <p className="mt-2 text-xs">{pulaskiPkg?.communicationsRecommendation ?? "Select county in copilot center"}</p>
      </section>

      <p className="text-xs text-kelly-muted">
        <Link href="/admin/county-profiles" className="underline">Legacy Pope profile math</Link>
        {" · "}
        <Link href="/admin/ai-command-center/copilots" className="underline">Role copilots</Link>
      </p>
    </div>
  );
}
