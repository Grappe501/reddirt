import { IMPACT_LADDER_STEPS } from "@/lib/power-of-5/onboarding-demo";

export function PowerOf5ImpactPanel() {
  return (
    <div className="rounded-2xl border border-kelly-slate/20 bg-kelly-navy/[0.03] p-5 sm:p-8">
      <h3 className="font-heading text-xl font-bold text-kelly-navy">Impact ladder</h3>
      <p className="mt-2 max-w-3xl font-body text-sm leading-relaxed text-kelly-text/80">
        Small actions only feel small when they are disconnected. This system connects them — from one conversation to county and
        state rollups you can trust because they are built from real relationships and honest aggregates.
      </p>
      <ol className="mt-6 space-y-0 border-l-2 border-kelly-gold/50 pl-6">
        {IMPACT_LADDER_STEPS.map((row, i) => (
          <li key={row.step} className="relative pb-6 last:pb-0">
            <span
              className="absolute -left-[calc(1.5rem+5px)] top-1.5 flex h-3 w-3 rounded-full border-2 border-kelly-gold bg-kelly-page"
              aria-hidden
            />
            <p className="font-heading text-sm font-bold text-kelly-navy">
              {i + 1}. {row.step}
            </p>
            <p className="mt-1 font-body text-sm text-kelly-text/75">{row.detail}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}
