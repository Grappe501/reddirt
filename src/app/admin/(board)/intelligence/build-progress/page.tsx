import Link from "next/link";
import { computeIntelligenceBuildProgress } from "@/lib/intelligence/v4/intelligenceBuildProgress";
import { computePhaseAUpgradePass } from "@/lib/intelligence/v4/phaseAUpgradePass";
import { V4BackLinks, V4PageHeader } from "@/components/admin/intelligence/v4/V4PageHeader";
import { DebatePrepDepthNavPanel } from "@/components/admin/intelligence/DebatePrepDepthNavPanel";
import { KimHammerModuleNavPanel } from "@/components/admin/intelligence/KimHammerModuleNavPanel";
import { PhaseAUpgradePassPanel } from "@/components/admin/intelligence/PhaseAUpgradePassPanel";
import { Phase3UpgradePassPanel } from "@/components/admin/intelligence/Phase3UpgradePassPanel";
import { Phase4UpgradePassPanel } from "@/components/admin/intelligence/Phase4UpgradePassPanel";
import { Phase5UpgradePassPanel } from "@/components/admin/intelligence/Phase5UpgradePassPanel";
import { Phase6UpgradePassPanel } from "@/components/admin/intelligence/Phase6UpgradePassPanel";
import { computePhase3UpgradePass } from "@/lib/intelligence/v4/phase3DebateSpineDepth";
import { computePhase4UpgradePass } from "@/lib/intelligence/v4/phase4CanonLoop";
import { computePhase5UpgradePass } from "@/lib/intelligence/v4/phase5GlossaryConnectivity";
import { computePhase6UpgradePass } from "@/lib/intelligence/v4/phase6DebateReadyGovernance";

export const dynamic = "force-dynamic";

const STATUS_COLORS = {
  complete: "bg-emerald-500",
  partial: "bg-amber-400",
  stub: "bg-slate-300",
  flagged: "bg-rose-400",
} as const;

export default function IntelligenceBuildProgressPage() {
  const report = computeIntelligenceBuildProgress();
  const phaseA = computePhaseAUpgradePass();
  const phase3 = computePhase3UpgradePass();
  const phase4 = computePhase4UpgradePass();
  const phase5 = computePhase5UpgradePass();
  const phase6 = computePhase6UpgradePass();

  return (
    <div className="mx-auto max-w-7xl text-kelly-text">
      <V4PageHeader
        eyebrow="Master build tracker · v6.2 opposition strategy"
        title="Intelligence stack progress"
        description={`Overall completion ${report.overallCompletionPct}% · ${report.version} · generated ${new Date(report.generatedAt).toLocaleString()}`}
      >
        <V4BackLinks />
        <Link
          href="/admin/intelligence/debate-briefings"
          className="rounded-full border border-violet-300 bg-violet-50 px-3 py-1 text-xs font-bold text-violet-950"
        >
          Philosophy briefings
        </Link>
        <Link
          href="/admin/intelligence/debate-depth"
          className="rounded-full border border-indigo-300 bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-950"
        >
          Depth library
        </Link>
        <Link
          href="/admin/intelligence/diligence"
          className="rounded-full border border-rose-300 bg-rose-50 px-3 py-1 text-xs font-bold text-rose-950"
        >
          Phase A diligence
        </Link>
        <Link
          href="/admin/intelligence/field-book"
          className="rounded-full border border-kelly-gold/60 px-3 py-1 text-xs font-bold text-kelly-navy"
        >
          The Field Book
        </Link>
        <Link
          href="/admin/intelligence/kim-hammer/debate-prep"
          className="rounded-full border border-violet-800/30 px-3 py-1 text-xs font-bold text-violet-950"
        >
          Debate prep
        </Link>
        <Link
          href="/admin/intelligence/phase-3-upgrade"
          className="rounded-full border border-violet-300 bg-violet-50 px-3 py-1 text-xs font-bold text-violet-950"
        >
          Phase 3 waves
        </Link>
        <Link
          href="/admin/intelligence/phase-6-upgrade"
          className="rounded-full border border-rose-300 bg-rose-50 px-3 py-1 text-xs font-bold text-rose-950"
        >
          Phase 6 governance
        </Link>
      </V4PageHeader>

      <Phase6UpgradePassPanel report={phase6} compact />
      <Phase5UpgradePassPanel report={phase5} compact />
      <Phase4UpgradePassPanel report={phase4} compact />

      <Phase3UpgradePassPanel report={phase3} compact />

      <PhaseAUpgradePassPanel report={phaseA} />

      <DebatePrepDepthNavPanel compact />
      <KimHammerModuleNavPanel compact />

      <section className="mb-8 rounded-xl border-2 border-kelly-navy/20 bg-kelly-page/50 p-6">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-kelly-navy">Overall progress</p>
        <div className="mt-4 flex items-end gap-4">
          <p className="font-heading text-5xl font-bold text-kelly-navy">{report.overallCompletionPct}%</p>
          <p className="pb-2 text-sm text-kelly-muted">{report.items.length} tracked surfaces</p>
        </div>
        <div className="mt-4 h-4 overflow-hidden rounded-full bg-white">
          <div
            className="h-full rounded-full bg-gradient-to-r from-kelly-navy to-kelly-gold transition-all"
            style={{ width: `${report.overallCompletionPct}%` }}
          />
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-sm font-bold uppercase text-kelly-navy">Completion by surface</h2>
        <div className="mt-4 space-y-4">
          {report.items.map((item) => (
            <article key={item.id} className="rounded-xl border border-kelly-text/10 bg-white p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-[10px] font-bold uppercase text-kelly-subtle">{item.category}</p>
                  {item.href ? (
                    <Link href={item.href} className="font-heading text-base font-bold text-kelly-navy underline">
                      {item.label}
                    </Link>
                  ) : (
                    <p className="font-heading text-base font-bold text-kelly-navy">{item.label}</p>
                  )}
                  <p className="mt-1 text-xs text-kelly-muted">
                    {item.built} / {item.total} built · status: {item.status}
                  </p>
                </div>
                <span className="font-heading text-2xl font-bold text-kelly-navy">{item.completionPct}%</span>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className={`h-full rounded-full ${STATUS_COLORS[item.status]}`}
                  style={{ width: `${item.completionPct}%` }}
                />
              </div>
              {item.flags.length > 0 ? (
                <ul className="mt-3 list-inside list-disc text-xs text-amber-900">
                  {item.flags.map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
              ) : null}
            </article>
          ))}
        </div>
      </section>

      <section className="mb-8 rounded-xl border border-violet-200 bg-violet-50/30 p-6">
        <h2 className="text-sm font-bold uppercase text-violet-950">Flagged for master build finish</h2>
        {report.flaggedForMasterBuild.length === 0 ? (
          <p className="mt-3 text-xs text-violet-950">No flags — all surfaces at target depth.</p>
        ) : (
          <ul className="mt-4 list-inside list-disc space-y-2 text-xs text-violet-950">
            {report.flaggedForMasterBuild.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
        )}
      </section>

      <section className="mb-8">
        <h2 className="text-sm font-bold uppercase text-kelly-navy">Phase build plan — next version upgrades</h2>
        <div className="mt-4 space-y-4">
          {report.phases.map((phase) => (
            <article key={phase.phase} className="rounded-xl border border-kelly-text/10 bg-white p-5 text-xs">
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-full bg-kelly-navy px-3 py-1 text-[10px] font-bold uppercase text-white">
                  Phase {phase.phase}
                </span>
                <span className="font-bold text-kelly-navy">{phase.name}</span>
                <span className="text-[10px] text-kelly-subtle">Target: {phase.targetVersion}</span>
              </div>
              <p className="mt-3 text-sm text-kelly-text">{phase.goal}</p>
              <p className="mt-3 font-bold text-emerald-900">Build items</p>
              <ul className="mt-1 list-inside list-disc text-kelly-muted">
                {phase.items.map((i) => (
                  <li key={i}>{i}</li>
                ))}
              </ul>
              <p className="mt-3 font-bold text-violet-900">Exit criteria</p>
              <ul className="mt-1 list-inside list-disc text-kelly-muted">
                {phase.exitCriteria.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-sky-200 bg-sky-50/30 p-5 text-xs">
        <h2 className="font-bold uppercase text-sky-950">Link audit scope</h2>
        <p className="mt-2 text-kelly-muted">
          {report.linkAuditRoutes.length} internal routes registered for sandbox audit — run{" "}
          <code className="rounded bg-white px-1">npm run agents:test-intelligence-hardening</code>
        </p>
        <p className="mt-2 text-[10px] text-kelly-subtle">
          Includes all trap lanes, SOS questions, prep sections, and bill + act-proof pages.
        </p>
      </section>
    </div>
  );
}
