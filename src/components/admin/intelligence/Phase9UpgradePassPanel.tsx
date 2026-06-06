import Link from "next/link";
import type { Phase9UpgradePassReport } from "@/lib/intelligence/v4/phase9DebateInstructionClosure";
import { PHASE9_PROMOTED_KH_MODULE_IDS } from "@/lib/intelligence/kimHammerV4ModuleRegistry";
import { buildDebateCoachingOperatorSummary } from "@/lib/intelligence/v4/phase9DebateCoachingRunbook";

export function Phase9UpgradePassPanel({
  report,
  compact,
}: {
  report: Phase9UpgradePassReport;
  compact?: boolean;
}) {
  const p = report.progress;
  const openGaps = report.gaps.filter((g) => g.status !== "closed").length;

  return (
    <section
      className={`rounded-xl border-2 border-emerald-300/80 bg-gradient-to-br from-emerald-50/50 to-white ${compact ? "mb-6 p-4" : "mb-8 p-6"}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-emerald-950">Upgrade pass 9</p>
          <h2 className="mt-1 font-heading text-xl font-bold text-kelly-navy">{report.title}</h2>
          {!compact ? <p className="mt-2 text-sm text-kelly-muted">{report.summary}</p> : null}
        </div>
        <div className="text-right">
          <p className="font-heading text-3xl font-bold text-emerald-950">{report.completionPct}%</p>
          <p className="text-[10px] font-bold uppercase text-kelly-subtle">
            prep {p.prepSectionsAtBridge}/{p.prepSectionTotal} · traps {p.trapLanesAtBridge}/{p.trapLaneTotal}
          </p>
        </div>
      </div>

      <div className="mt-4 h-2 overflow-hidden rounded-full bg-white">
        <div
          className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-kelly-gold"
          style={{ width: `${report.completionPct}%` }}
        />
      </div>

      <dl className={`mt-4 grid gap-2 ${compact ? "grid-cols-2 text-xs" : "grid-cols-2 md:grid-cols-4 text-sm"}`}>
        <div className="rounded-lg border border-kelly-text/10 bg-white px-3 py-2">
          <dt className="text-[10px] font-bold uppercase text-kelly-subtle">Dossier depth</dt>
          <dd className="font-bold text-kelly-navy">{p.dossierDepthPct}% at 2× bar</dd>
        </div>
        <div className="rounded-lg border border-kelly-text/10 bg-white px-3 py-2">
          <dt className="text-[10px] font-bold uppercase text-kelly-subtle">SOS questions</dt>
          <dd className="font-bold text-kelly-navy">
            {p.sosQuestionsAtBridge}/{p.sosQuestionTotal} bridged
          </dd>
        </div>
        <div className="rounded-lg border border-kelly-text/10 bg-white px-3 py-2">
          <dt className="text-[10px] font-bold uppercase text-kelly-subtle">Coaching runbook</dt>
          <dd className="font-bold text-kelly-navy">{p.coachingRunbookSteps} steps</dd>
        </div>
        <div className="rounded-lg border border-kelly-text/10 bg-white px-3 py-2">
          <dt className="text-[10px] font-bold uppercase text-kelly-subtle">Orchestration gaps</dt>
          <dd className="font-bold text-kelly-navy">{openGaps} open/partial</dd>
        </div>
      </dl>

      <div className="mt-4 flex flex-wrap gap-2">
        <Link
          href={report.coachingHubHref}
          className="rounded-full border border-sky-400 bg-white px-3 py-1 text-[10px] font-bold text-sky-950"
        >
          Kelly debate coaching →
        </Link>
        <Link
          href="/admin/intelligence/kim-hammer/debate-prep"
          className="rounded-full border border-kelly-gold/50 px-3 py-1 text-[10px] font-bold text-kelly-navy"
        >
          Prep sections (28) →
        </Link>
        <Link
          href="/admin/intelligence/field-book/debate-instruction-bridge"
          className="rounded-full border border-emerald-400 px-3 py-1 text-[10px] font-bold text-emerald-950"
        >
          Field Book article →
        </Link>
      </div>
    </section>
  );
}

export function Phase9OrchestrationGapsPanel({ report }: { report: Phase9UpgradePassReport }) {
  return (
    <section className="mb-8 rounded-xl border border-kelly-navy/15 bg-white p-6">
      <h2 className="font-heading text-xl font-bold text-kelly-navy">Orchestration status — what is closed vs still open</h2>
      <p className="mt-2 text-sm text-kelly-muted">
        Phase 9 closes the dossier-to-debate spine gap Phase 8 intentionally left open. Items marked partial are Phase 10
        candidates.
      </p>
      <ul className="mt-4 space-y-3">
        {report.gaps.map((gap) => (
          <li
            key={gap.id}
            className={`rounded-lg border px-4 py-3 text-sm ${
              gap.status === "closed"
                ? "border-emerald-200 bg-emerald-50/50"
                : gap.status === "partial"
                  ? "border-amber-200 bg-amber-50/50"
                  : "border-rose-200 bg-rose-50/50"
            }`}
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-bold text-kelly-navy">{gap.label}</span>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                  gap.status === "closed"
                    ? "bg-emerald-200 text-emerald-950"
                    : gap.status === "partial"
                      ? "bg-amber-200 text-amber-950"
                      : "bg-rose-200 text-rose-950"
                }`}
              >
                {gap.status}
              </span>
            </div>
            <p className="mt-1 text-kelly-muted">{gap.note}</p>
            {gap.href ? (
              <Link href={gap.href} className="mt-2 inline-block text-xs font-bold text-kelly-navy underline">
                Open →
              </Link>
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  );
}

export function DebateCoachingRunbookPanel() {
  const { steps } = buildDebateCoachingOperatorSummary();

  return (
    <section className="mb-8 rounded-xl border border-sky-200 bg-sky-50/30 p-6">
      <h2 className="font-heading text-xl font-bold text-sky-950">Debate coaching operator runbook</h2>
      <p className="mt-2 text-sm text-kelly-muted">
        Eight steps from T-14 through post-event Field Book promotion — dossier corpus → stage-ready drills.
      </p>
      <ol className="mt-4 space-y-3">
        {steps.map((step) => (
          <li key={step.order} className="rounded-lg border border-sky-100 bg-white px-4 py-3 text-sm">
            <span className="font-bold text-sky-950">
              {step.order}. {step.phase}
            </span>
            <p className="mt-1 text-kelly-muted">{step.action}</p>
            {step.href ? (
              <Link href={step.href} className="mt-2 inline-block text-xs font-bold text-sky-900 underline">
                {step.href} →
              </Link>
            ) : null}
          </li>
        ))}
      </ol>
    </section>
  );
}

export function Phase9KhWavePanel() {
  return (
    <section className="mb-8">
      <h2 className="text-sm font-bold uppercase text-kelly-navy">Wave 4 KH modules ({PHASE9_PROMOTED_KH_MODULE_IDS.length})</h2>
      <ul className="mt-3 grid gap-2 md:grid-cols-2">
        {PHASE9_PROMOTED_KH_MODULE_IDS.map((id) => (
          <li key={id}>
            <Link
              href={`/admin/intelligence/kim-hammer/${id}`}
              className="block rounded-lg border border-kelly-navy/10 bg-white px-3 py-2 text-sm font-semibold text-kelly-navy underline"
            >
              {id}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
