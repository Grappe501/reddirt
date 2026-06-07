import Link from "next/link";
import type { RehearsalEncounterOption, RehearsalRunOfShowStep } from "@/lib/intelligence/v4/phase16P0SessionLauncher";

export function CandidateRehearsalLauncherPanel({
  encounters,
  steps,
  activeEncounterTitle,
}: {
  encounters: RehearsalEncounterOption[];
  steps: RehearsalRunOfShowStep[];
  activeEncounterTitle?: string;
}) {
  return (
    <div className="space-y-6">
      <section>
        <h2 className="mb-3 font-heading text-lg font-bold text-kelly-navy">Tonight&apos;s encounters</h2>
        <div className="grid gap-3 md:grid-cols-2">
          {encounters.map((encounter) => (
            <article key={encounter.encounterId} className="rounded-xl border border-amber-200 bg-white p-4 text-sm">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="text-[10px] font-bold uppercase text-amber-950">{encounter.durationLabel}</p>
                  <Link href={encounter.launchHref} className="mt-1 block font-bold text-kelly-navy underline">
                    {encounter.title}
                  </Link>
                </div>
              </div>
              <p className="mt-2 text-xs text-kelly-muted">{encounter.description}</p>
              <p className="mt-2 rounded-lg border border-amber-100 bg-amber-50/40 p-2 text-xs italic text-kelly-text">
                Kelly rule: {encounter.kellyRule}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 font-heading text-lg font-bold text-kelly-navy">
          Run-of-show{activeEncounterTitle ? ` — ${activeEncounterTitle}` : ""}
        </h2>
        <ol className="space-y-3">
          {steps.map((step) => (
            <li key={step.stepId} className="rounded-xl border border-kelly-text/10 bg-white p-4 text-sm">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="flex items-start gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-100 text-xs font-bold text-amber-950">
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
