import Link from "next/link";
import type { EncounterScenario } from "@/lib/intelligence/v4/phase16P2EncounterScenarios";
import type { RehearsalRunOfShowStep } from "@/lib/intelligence/v4/phase16P0SessionLauncher";

export function CandidateEncounterScenariosPanel({
  scenarios,
  steps,
  activeScenario,
}: {
  scenarios: EncounterScenario[];
  steps: RehearsalRunOfShowStep[];
  activeScenario: EncounterScenario;
}) {
  return (
    <div className="space-y-6">
      <section>
        <h2 className="mb-3 font-heading text-lg font-bold text-kelly-navy">Encounter scenarios</h2>
        <div className="grid gap-3 md:grid-cols-2">
          {scenarios.map((scenario) => (
            <article
              key={scenario.scenarioId}
              className={`rounded-xl border bg-white p-4 text-sm ${
                scenario.scenarioId === activeScenario.scenarioId
                  ? "border-violet-400 ring-1 ring-violet-200"
                  : "border-violet-200"
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="text-[10px] font-bold uppercase text-violet-950">{scenario.durationLabel}</p>
                  <Link href={scenario.launchHref} className="mt-1 block font-bold text-kelly-navy underline">
                    {scenario.title}
                  </Link>
                </div>
                <p className="text-[10px] text-kelly-muted">{scenario.eventDateLabel}</p>
              </div>
              <p className="mt-2 text-xs text-kelly-muted">{scenario.description}</p>
              <p className="mt-2 text-[10px] text-kelly-subtle">
                {scenario.audienceLabel} · {scenario.venueLabel}
              </p>
              <p className="mt-2 rounded-lg border border-violet-100 bg-violet-50/40 p-2 text-xs italic text-kelly-text">
                Kelly rule: {scenario.kellyRule}
              </p>
              <p className="mt-2 rounded-lg border border-indigo-100 bg-indigo-50/30 p-2 text-[10px] text-indigo-950">
                Honesty: {scenario.honestyRule}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Link
                  href={scenario.primaryBindHref}
                  className="rounded-full border border-violet-300 bg-violet-50 px-2 py-0.5 text-[10px] font-bold text-violet-950"
                >
                  Primary bind →
                </Link>
                {scenario.scenarioId !== "purchase-walkthrough" ? (
                  <Link
                    href={`/admin/intelligence/rehearsal?encounter=${scenario.scenarioId}`}
                    className="rounded-full border border-amber-300 bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-950"
                  >
                    Launch session →
                  </Link>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      </section>

      {activeScenario.scenarioId === "purchase-walkthrough" ? (
        <section className="rounded-xl border border-teal-200 bg-teal-50/40 p-4 text-sm text-teal-950">
          <p className="font-bold">Purchase walkthrough routes to demo-mode script.</p>
          <p className="mt-2 text-xs">7 steps · 15 minutes · buyer demo beats with evidence honesty on proof lines.</p>
          <Link href={activeScenario.primaryBindHref} className="mt-3 inline-block font-bold underline">
            Open demo-mode hub →
          </Link>
        </section>
      ) : (
        <section>
          <h2 className="mb-3 font-heading text-lg font-bold text-kelly-navy">
            Run-of-show — {activeScenario.title}
          </h2>
          <p className="mb-3 text-xs text-kelly-muted">
            {steps.length} steps · ~{activeScenario.durationMinutes} min · {activeScenario.stageSafeStepCount} stage-safe
            gates
          </p>
          <ol className="space-y-3">
            {steps.map((step) => (
              <li key={step.stepId} className="rounded-xl border border-kelly-text/10 bg-white p-4 text-sm">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="flex items-start gap-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-violet-100 text-xs font-bold text-violet-950">
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
      )}
    </div>
  );
}
