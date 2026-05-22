import Link from "next/link";
import type { CountyIntelligenceSummary } from "@/lib/agents/county-intelligence/county-kpi-types";

export function EventCountyIntelligenceCard({ context }: { context: CountyIntelligenceSummary }) {
  const { county } = context;
  return (
    <section className="rounded-2xl border border-kelly-navy/15 bg-kelly-navy/[0.03] p-5">
      <p className="text-[10px] font-bold uppercase tracking-wider text-kelly-slate">County intelligence · {county.countyName}</p>
      <h3 className="mt-1 font-heading text-base font-bold text-kelly-navy">Why this event here</h3>
      <ul className="mt-2 list-inside list-disc text-xs text-kelly-text/75">
        {context.whyHere.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>

      <dl className="mt-4 grid gap-2 text-xs sm:grid-cols-2">
        <div>
          <dt className="font-bold">Registration goal (planning)</dt>
          <dd>{county.registrationGoal?.toLocaleString() ?? "—"}</dd>
        </div>
        <div>
          <dt className="font-bold">Power of 5 goal (planning)</dt>
          <dd>{county.powerOfFiveGoal?.toLocaleString() ?? "—"}</dd>
        </div>
        <div>
          <dt className="font-bold">Readiness</dt>
          <dd>{county.countyReadinessScore}/100</dd>
        </div>
        <div>
          <dt className="font-bold">Field strength</dt>
          <dd>{county.fieldStrengthScore}/100</dd>
        </div>
      </dl>

      {county.topWeaknesses.length ? (
        <p className="mt-3 text-xs">
          <span className="font-bold">Weaknesses:</span> {county.topWeaknesses.join(" · ")}
        </p>
      ) : null}

      <div className="mt-3">
        <p className="text-xs font-bold text-kelly-navy">What Kelly should emphasize</p>
        <ul className="mt-1 list-inside list-disc text-xs text-kelly-muted">
          {context.kellyTalkingPoints.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {county.sourceLinks.slice(0, 3).map((l) => (
          <Link key={l.href} href={l.href} className="rounded-full border border-kelly-navy/20 px-3 py-1 text-[10px] font-bold text-kelly-navy">
            {l.label}
          </Link>
        ))}
      </div>
    </section>
  );
}
