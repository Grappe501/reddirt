import Link from "next/link";

import { PHASE_13_BUILD_MASTER_PLAN } from "@/lib/election-plan/phase-13-build-master-plan";
import { cn } from "@/lib/utils";

function phaseStatusClass(status: "complete" | "in_progress" | "pending") {
  if (status === "complete") return "bg-emerald-100 text-emerald-900";
  if (status === "in_progress") return "bg-amber-100 text-amber-900";
  return "bg-[var(--ep-cream)] text-[var(--ep-navy-muted)]";
}

export function Phase13BuildMasterPlanPanel() {
  const plan = PHASE_13_BUILD_MASTER_PLAN;

  return (
    <section>
      <Link
        href="/election-plan?tab=forwardMotion"
        className="text-xs font-semibold text-[var(--ep-navy-muted)] hover:text-[var(--ep-navy)]"
      >
        ← Forward Motion
      </Link>

      <div className="mt-2">
        <h1 className="font-heading text-2xl font-bold text-[var(--ep-navy)]">{plan.title}</h1>
        <p className="mt-1 text-sm text-[var(--ep-navy-muted)]">{plan.subtitle}</p>
      </div>

      <div className="ep-card-glass mt-6 mb-6">
        <p className="text-sm leading-relaxed text-[var(--ep-navy-muted)]">{plan.intro}</p>
      </div>

      <div className="ep-warning mb-8 text-sm">
        <p className="font-semibold text-[var(--ep-navy)]">Hard rules</p>
        <ul className="mt-2 list-inside list-disc space-y-1 text-xs text-[var(--ep-navy-muted)]">
          {plan.hardRules.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ul>
      </div>

      <h2 className="mb-4 font-heading text-lg font-bold">Build sub-phases</h2>
      <div className="mb-10 space-y-4">
        {plan.phases.map((phase) => (
          <div key={phase.id} className="ep-card">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-heading font-bold text-[var(--ep-navy)]">{phase.title}</h3>
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase",
                  phaseStatusClass(phase.status),
                )}
              >
                {phase.status.replace("_", " ")}
              </span>
            </div>
            <ul className="mt-3 list-inside list-disc space-y-1 text-sm text-[var(--ep-navy-muted)]">
              {phase.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <h2 className="mb-4 font-heading text-lg font-bold">Suggested engineering order</h2>
      <ol className="mb-10 list-inside list-decimal space-y-1 text-sm text-[var(--ep-navy-muted)]">
        {plan.buildOrder.map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ol>

      <div className="ep-card">
        <h2 className="font-heading font-bold text-[var(--ep-navy)]">Weekly rebuild</h2>
        <ol className="mt-3 list-inside list-decimal space-y-1 text-sm text-[var(--ep-navy-muted)]">
          <li>Update event-approvals decisions</li>
          <li>Verify calendar ingest</li>
          <li>
            <code className="text-xs">{plan.commands[0]}</code>
          </li>
          <li>
            <code className="text-xs">{plan.commands[2]}</code>
          </li>
          <li>Review weekly packet; approve drafts for next 7 days</li>
        </ol>
        <p className="mt-4 text-xs text-[var(--ep-navy-muted)]">
          Full doc: <code>{plan.docPath}</code>
        </p>
      </div>
    </section>
  );
}
