import Link from "next/link";

import { LOCATION_BRIEF_MASTER_PLAN } from "@/lib/election-plan/location-brief-master-plan";
import { cityLocationsHubHref } from "@/lib/election-plan/location-links";
import { cn } from "@/lib/utils";

function phaseStatusClass(status: "complete" | "in_progress" | "pending") {
  if (status === "complete") return "bg-emerald-100 text-emerald-900";
  if (status === "in_progress") return "bg-amber-100 text-amber-900";
  return "bg-[var(--ep-cream)] text-[var(--ep-navy-muted)]";
}

export function LocationBriefMasterPlanPanel() {
  const plan = LOCATION_BRIEF_MASTER_PLAN;

  return (
    <section>
      <Link href={cityLocationsHubHref()} className="text-xs font-semibold text-[var(--ep-navy-muted)] hover:text-[var(--ep-navy)]">
        ← Priority cities
      </Link>

      <div className="mt-2">
        <h1 className="font-heading text-2xl font-bold text-[var(--ep-navy)]">{plan.title}</h1>
        <p className="mt-1 text-sm text-[var(--ep-navy-muted)]">{plan.subtitle}</p>
      </div>

      <div className="ep-card-glass mt-6 mb-10">
        <p className="text-sm leading-relaxed text-[var(--ep-navy-muted)]">{plan.intro}</p>
      </div>

      <h2 className="mb-4 font-heading text-lg font-bold">Phases</h2>
      <div className="mb-10 space-y-4">
        {plan.phases.map((phase) => (
          <div key={phase.id} className="ep-card">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-heading font-bold text-[var(--ep-navy)]">{phase.title}</h3>
              <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-bold uppercase", phaseStatusClass(phase.status))}>
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

      <h2 className="mb-4 font-heading text-lg font-bold">City brief content schema</h2>
      <div className="mb-10 grid gap-3 sm:grid-cols-2">
        {plan.contentSchema.map((row) => (
          <div key={row.field} className="ep-card">
            <code className="text-xs font-semibold text-[var(--ep-gold)]">{row.field}</code>
            <p className="mt-1 text-sm text-[var(--ep-navy-muted)]">{row.purpose}</p>
          </div>
        ))}
      </div>

      <h2 className="mb-4 font-heading text-lg font-bold">Routes & source</h2>
      <div className="ep-card mb-6">
        <p className="text-sm text-[var(--ep-navy-muted)]">
          Edit narratives in{" "}
          <code className="text-xs">{plan.sourcePath}</code>
        </p>
        <ul className="mt-4 space-y-2 text-sm">
          {plan.routes.map((r) => (
            <li key={r.path}>
              <Link href={r.path} className="font-semibold text-[var(--ep-navy)] hover:text-[var(--ep-gold)]">
                {r.label}
              </Link>
              <span className="ml-2 text-xs text-[var(--ep-navy-muted)]">{r.path}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
