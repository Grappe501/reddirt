import Link from "next/link";

import { PHASE_18_MOVEMENT_INFRASTRUCTURE } from "@/lib/election-plan/phase-18-movement-infrastructure";
import { cn } from "@/lib/utils";

function moduleStatusClass(status: "complete" | "in_progress" | "pending") {
  if (status === "complete") return "bg-emerald-100 text-emerald-900";
  if (status === "in_progress") return "bg-amber-100 text-amber-900";
  return "bg-[var(--ep-cream)] text-[var(--ep-navy-muted)]";
}

export function Phase18BuildMasterPlanPanel() {
  const plan = PHASE_18_MOVEMENT_INFRASTRUCTURE;

  return (
    <section>
      <Link href="/election-plan?tab=movementInfrastructure" className="text-xs font-semibold text-[var(--ep-navy-muted)] hover:text-[var(--ep-navy)]">
        ← Movement Infrastructure
      </Link>
      <div className="mt-2">
        <h1 className="font-heading text-2xl font-bold text-[var(--ep-navy)]">{plan.title}</h1>
        <p className="mt-1 text-sm text-[var(--ep-navy-muted)]">{plan.subtitle}</p>
      </div>
      <div className="ep-card-glass mt-6 mb-6 text-sm leading-relaxed">{plan.intro}</div>
      <ul className="mb-8 list-inside list-disc space-y-1 text-sm text-[var(--ep-navy-muted)]">
        {plan.doctrine.map((d) => (
          <li key={d}>{d}</li>
        ))}
      </ul>
      <h2 className="mb-4 font-heading text-lg font-bold">Modules</h2>
      <div className="space-y-4">
        {plan.modules.map((mod) => (
          <div key={mod.id} className="ep-card">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-heading font-bold">{mod.title}</h3>
              <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-bold uppercase", moduleStatusClass(mod.status))}>
                {mod.status.replace("_", " ")}
              </span>
              <Link href={mod.href} className="text-xs font-semibold underline">
                Open →
              </Link>
            </div>
            <ul className="mt-3 list-inside list-disc space-y-1 text-sm text-[var(--ep-navy-muted)]">
              {mod.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <h2 className="mb-4 mt-10 font-heading text-lg font-bold">Build order</h2>
      <ol className="list-inside list-decimal space-y-1 text-sm text-[var(--ep-navy-muted)]">
        {plan.buildOrder.map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ol>
    </section>
  );
}
