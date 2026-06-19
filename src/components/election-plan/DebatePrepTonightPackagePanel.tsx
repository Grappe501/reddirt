import Link from "next/link";

import type { DebatePrepTonightPackage } from "@/lib/election-plan/debate-prep-system-v7";

export function DebatePrepTonightPackagePanel({
  tonightPackage,
  packageCompletenessPct,
}: {
  tonightPackage: DebatePrepTonightPackage;
  packageCompletenessPct: number;
}) {
  return (
    <section className="ep-card mb-8 border-2 border-[var(--ep-navy)]/20 bg-white p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--ep-gold)]">v7 · Tonight&apos;s package</p>
          <h2 className="mt-2 font-heading text-xl font-bold text-[var(--ep-navy)]">{tonightPackage.headline}</h2>
          <p className="mt-2 text-sm text-[var(--ep-navy-muted)]">
            {tonightPackage.forumFirst
              ? "Forum intel is live — follow this sequence before standard trap-only prep."
              : "Standard path until forum analysis is ready — same modules, forum steps omitted."}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs font-bold uppercase text-[var(--ep-navy-muted)]">Package completeness</p>
          <p className="font-heading text-3xl font-bold text-[var(--ep-navy)]">{packageCompletenessPct}%</p>
          <p className="text-xs text-[var(--ep-navy-muted)]">~{tonightPackage.totalMinutes} min total</p>
        </div>
      </div>

      <ol className="mt-6 space-y-3">
        {tonightPackage.steps.map((step) => (
          <li
            key={step.stepId}
            className="flex flex-wrap items-start gap-3 rounded-xl border border-[var(--ep-border)] bg-[var(--ep-cream)]/30 p-4 text-sm"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--ep-navy)] text-xs font-bold text-white">
              {step.order}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-semibold text-[var(--ep-navy)]">{step.label}</p>
                <span className="rounded-full border border-[var(--ep-border)] px-2 py-0.5 text-[10px] font-bold uppercase text-[var(--ep-navy-muted)]">
                  {step.minutes} min
                </span>
              </div>
              <p className="mt-1 text-[var(--ep-navy-muted)]">{step.detail}</p>
              <Link href={step.href} className="mt-2 inline-block text-xs font-bold text-[var(--ep-navy)] underline">
                Open step →
              </Link>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
