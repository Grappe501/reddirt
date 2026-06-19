"use client";

import { useCallback, useState } from "react";
import Link from "next/link";

import type { DebatePrepTonightPackageV8 } from "@/lib/election-plan/debate-prep-system-v8";
import { EP_DEBATE_PREP_PACKAGE_PROGRESS_API } from "@/lib/election-plan/debate-prep-links";

export function DebatePrepTonightPackageClient({
  tonightPackage,
  packageCompletenessPct,
  packageLabel,
}: {
  tonightPackage: DebatePrepTonightPackageV8;
  packageCompletenessPct: number;
  packageLabel: string;
}) {
  const [completedIds, setCompletedIds] = useState(
    () => new Set(tonightPackage.steps.filter((s) => s.completed).map((s) => s.stepId)),
  );
  const [busy, setBusy] = useState<string | null>(null);

  const toggleStep = useCallback(async (stepId: string) => {
    setBusy(stepId);
    try {
      const res = await fetch(EP_DEBATE_PREP_PACKAGE_PROGRESS_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "toggle-step", stepId }),
      });
      const data = (await res.json()) as { ok?: boolean; progress?: { completedStepIds: string[] } };
      if (data.ok && data.progress) {
        setCompletedIds(new Set(data.progress.completedStepIds));
      }
    } finally {
      setBusy(null);
    }
  }, []);

  const doneCount = tonightPackage.steps.filter((s) => completedIds.has(s.stepId)).length;

  return (
    <section className="ep-card mb-8 border-2 border-[var(--ep-navy)]/20 bg-white p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--ep-gold)]">
            {packageLabel} · Tonight&apos;s package
          </p>
          <h2 className="mt-2 font-heading text-xl font-bold text-[var(--ep-navy)]">{tonightPackage.headline}</h2>
          <p className="mt-2 text-sm text-[var(--ep-navy-muted)]">
            Track each step — {doneCount}/{tonightPackage.steps.length} complete.
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs font-bold uppercase text-[var(--ep-navy-muted)]">Package completeness</p>
          <p className="font-heading text-3xl font-bold text-[var(--ep-navy)]">{packageCompletenessPct}%</p>
          <p className="text-xs text-[var(--ep-navy-muted)]">~{tonightPackage.totalMinutes} min total</p>
        </div>
      </div>

      <ol className="mt-6 space-y-3">
        {tonightPackage.steps.map((step) => {
          const done = completedIds.has(step.stepId);
          return (
            <li
              key={step.stepId}
              className={`flex flex-wrap items-start gap-3 rounded-xl border p-4 text-sm ${
                done
                  ? "border-emerald-300 bg-emerald-50/40"
                  : "border-[var(--ep-border)] bg-[var(--ep-cream)]/30"
              }`}
            >
              <button
                type="button"
                disabled={busy === step.stepId}
                onClick={() => void toggleStep(step.stepId)}
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold transition ${
                  done ? "bg-emerald-600 text-white" : "bg-[var(--ep-navy)] text-white hover:opacity-90"
                }`}
                aria-label={done ? `Mark ${step.label} incomplete` : `Mark ${step.label} complete`}
              >
                {done ? "✓" : step.order}
              </button>
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
          );
        })}
      </ol>
    </section>
  );
}
