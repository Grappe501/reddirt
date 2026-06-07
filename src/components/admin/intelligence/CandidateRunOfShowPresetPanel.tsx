import Link from "next/link";
import type { RunOfShowPreset } from "@/lib/intelligence/v4/phase16P1RunOfShow";
import type { RehearsalRunOfShowStep } from "@/lib/intelligence/v4/phase16P0SessionLauncher";

export function CandidateRunOfShowPresetPanel({
  presets,
  steps,
  activePresetTitle,
}: {
  presets: RunOfShowPreset[];
  steps: RehearsalRunOfShowStep[];
  activePresetTitle?: string;
}) {
  return (
    <div className="space-y-6">
      <section>
        <h2 className="mb-3 font-heading text-lg font-bold text-kelly-navy">Timed presets</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {presets.map((preset) => (
            <Link
              key={preset.presetId}
              href={preset.launchHref}
              className="rounded-xl border border-orange-200 bg-white p-4 text-sm transition hover:border-orange-400"
            >
              <p className="text-[10px] font-bold uppercase text-orange-950">{preset.durationLabel}</p>
              <p className="mt-1 font-bold text-kelly-navy">{preset.title}</p>
              <p className="mt-2 text-xs text-kelly-muted">{preset.stepCount} steps</p>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 font-heading text-lg font-bold text-kelly-navy">
          Step list{activePresetTitle ? ` — ${activePresetTitle}` : ""}
        </h2>
        <ol className="space-y-3">
          {steps.map((step) => (
            <li key={step.stepId} className="rounded-xl border border-kelly-text/10 bg-white p-4 text-sm">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="flex items-start gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-orange-100 text-xs font-bold text-orange-950">
                    {step.order}
                  </span>
                  <div>
                    <Link href={step.href} className="font-bold text-kelly-navy underline">
                      {step.title}
                    </Link>
                    <p className="mt-1 text-xs text-kelly-muted">{step.kellyBeat}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-mono text-[10px] text-kelly-subtle">{step.durationLabel}</span>
                  {step.stageSafeRequired ? (
                    <p className="mt-1 text-[10px] font-bold uppercase text-violet-800">Stage-safe</p>
                  ) : null}
                </div>
              </div>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
