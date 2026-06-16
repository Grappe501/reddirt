"use client";

import Link from "next/link";

import { communityWorkbenchHref } from "@/lib/election-plan/community-workbench/links";
import type { PilotValidationSnapshot } from "@/lib/election-plan/community-workbench/load-pilot-status";
import { cn } from "@/lib/utils";

import { CommunityWorkbenchDefectLogPanel } from "./CommunityWorkbenchDefectLogPanel";

type Props = {
  snapshot: PilotValidationSnapshot;
  operatorInitials: string | null;
};

export function CommunityWorkbenchPilotStatusPanel({ snapshot, operatorInitials }: Props) {
  const { deploySummary, pilots, pilotsAllPass, openDefectCount } = snapshot;

  return (
    <section id="pilot-validation" className="mt-8 scroll-mt-24 rounded-xl border-2 border-[var(--ep-navy)] bg-white p-4 sm:p-5">
      <p className="text-xs font-bold uppercase tracking-[0.15em] text-[var(--ep-gold)]">Live pilot · v1.3</p>
      <h2 className="mt-1 font-heading text-xl font-bold text-[var(--ep-navy)]">Pilot validation status</h2>
      <p className="mt-1 text-sm text-[var(--ep-navy-muted)]">
        Sherwood and Jacksonville must pass before statewide rollout. Executive Book readiness rollup stays deferred.
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <StatCard
          label="Deploy readiness"
          value={`${deploySummary.passed}/${deploySummary.total}`}
          ok={deploySummary.allPass}
        />
        <StatCard
          label="Pilot smoke tests"
          value={`${pilots.filter((p) => p.allPass).length}/${pilots.length} cities`}
          ok={pilotsAllPass}
        />
        <StatCard label="Open defects" value={String(openDefectCount)} ok={openDefectCount === 0} invertOk />
      </div>

      <div className="mt-6">
        <h3 className="text-xs font-bold uppercase tracking-wide text-[var(--ep-navy-muted)]">Deploy gate (local files)</h3>
        <ul className="mt-2 space-y-1 text-sm">
          {snapshot.deployChecks.map((c) => (
            <li key={c.id} className="flex gap-2">
              <span className={cn("font-bold", c.pass ? "text-emerald-700" : "text-amber-700")}>{c.pass ? "✓" : "○"}</span>
              <span className="text-[var(--ep-navy)]">{c.label}</span>
              {c.detail ? <span className="text-xs text-[var(--ep-navy-muted)]">· {c.detail}</span> : null}
            </li>
          ))}
        </ul>
        <p className="mt-2 text-xs text-[var(--ep-navy-muted)]">
          Netlify UI: scope builds-only vars per{" "}
          <code className="text-[10px]">docs/COMMUNITY_WORKBENCH_V1_3_PILOT.md</code>
        </p>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        {pilots.map((pilot) => (
          <div key={pilot.slug} className="rounded-lg border border-[var(--ep-border)] p-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <Link href={communityWorkbenchHref(pilot.slug)} className="font-heading font-bold text-[var(--ep-navy)] hover:underline">
                  {pilot.name}
                </Link>
                <p className="mt-0.5 text-xs text-[var(--ep-navy-muted)]">{pilot.context}</p>
              </div>
              <span
                className={cn(
                  "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase",
                  pilot.allPass ? "bg-emerald-100 text-emerald-900" : "bg-amber-100 text-amber-900",
                )}
              >
                {pilot.stepsPassed}/{pilot.steps.length}
              </span>
            </div>
            <ul className="mt-3 space-y-2 text-sm">
              {pilot.steps.map((step) => (
                <li key={step.id} className="flex gap-2">
                  <span className={cn("font-bold", step.pass ? "text-emerald-700" : "text-[var(--ep-navy-muted)]")}>
                    {step.pass ? "✓" : "○"}
                  </span>
                  <div>
                    <p className="font-medium text-[var(--ep-navy)]">{step.label}</p>
                    {step.detail ? <p className="text-xs text-[var(--ep-navy-muted)]">{step.detail}</p> : null}
                    {!step.pass && step.href ? (
                      <Link href={step.href} className="text-xs font-semibold text-[var(--ep-gold)] hover:underline">
                        Run this step →
                      </Link>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
            <Link
              href={`${communityWorkbenchHref(pilot.slug)}#pilot-smoke`}
              className="mt-3 inline-block text-xs font-semibold text-[var(--ep-navy)] underline"
            >
              Full smoke path →
            </Link>
          </div>
        ))}
      </div>

      <div id="defect-log" className="mt-8">
        <CommunityWorkbenchDefectLogPanel
          initialDefects={snapshot.defects}
          operatorInitials={operatorInitials}
          showWorkbenchPicker
        />
      </div>
    </section>
  );
}

function StatCard({
  label,
  value,
  ok,
  invertOk = false,
}: {
  label: string;
  value: string;
  ok: boolean;
  invertOk?: boolean;
}) {
  const good = invertOk ? ok : ok;
  return (
    <div className={cn("rounded-lg border px-3 py-3 text-center", good ? "border-emerald-200 bg-emerald-50" : "border-amber-200 bg-amber-50")}>
      <p className="text-[10px] font-bold uppercase tracking-wide text-[var(--ep-navy-muted)]">{label}</p>
      <p className="mt-1 font-heading text-2xl font-bold tabular-nums text-[var(--ep-navy)]">{value}</p>
    </div>
  );
}
