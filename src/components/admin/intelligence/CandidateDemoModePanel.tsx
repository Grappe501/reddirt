import Link from "next/link";
import type { DemoScriptStep } from "@/lib/intelligence/v4/phase15P6DemoMode";

export function CandidateDemoModePanel({
  steps,
  showStaffNotes,
}: {
  steps: DemoScriptStep[];
  showStaffNotes?: boolean;
}) {
  return (
    <div className="space-y-3">
      {steps.map((step) => (
        <article key={step.stepId} className="rounded-xl border border-kelly-text/10 bg-white p-4 text-sm">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <p className="text-[10px] font-bold uppercase text-teal-950">
                Step {step.order} · {step.durationLabel}
              </p>
              <Link href={step.href} className="mt-1 block font-bold text-kelly-navy underline">
                {step.title}
              </Link>
            </div>
            <span className="rounded-full bg-teal-100 px-2 py-0.5 text-[10px] font-bold text-teal-950">
              {step.durationMinutes} min
            </span>
          </div>
          <p className="mt-2 text-xs text-kelly-muted">{step.demoBeat}</p>
          <p className="mt-2 rounded-lg border border-teal-100 bg-teal-50/40 p-2 text-xs italic text-kelly-text">
            Say: {step.buyerLine}
          </p>
          {showStaffNotes ? (
            <p className="mt-2 text-[10px] font-semibold text-amber-900">Staff: {step.staffNote}</p>
          ) : null}
        </article>
      ))}
    </div>
  );
}
