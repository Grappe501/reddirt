import { CountySectionHeader } from "@/components/county/dashboard/CountySectionHeader";
import { cn } from "@/lib/utils";

const steps = [
  { key: "county", label: "County", status: "current" as const, blurb: "FIPS 05115 — you are on the county command view." },
  { key: "city", label: "City", status: "next" as const, blurb: "Municipal anchors — town cards in the drilldown section." },
  { key: "community", label: "Community", status: "future" as const, blurb: "Neighborhood / host circles when routes land." },
  { key: "precinct", label: "Precinct", status: "future" as const, blurb: "Electoral turf — list mode first; maps are placeholders." },
  { key: "power", label: "Power Team", status: "next" as const, blurb: "Relational five + leader — coverage & follow-up engine (demo metrics)." },
] as const;

/**
 * Visual ladder for the OIS model — public-safe, no PII, design targets for future routes.
 */
export function PopeIntelligenceStack({ className }: { className?: string }) {
  return (
    <section className={className} aria-label="Pope County intelligence stack">
      <CountySectionHeader
        overline="Pope County intelligence stack"
        title="County → City → Community → Precinct → Power Team"
        description="Same humans, different resolution. You are at County. Drill down to cities below; community and precinct routes are planned; Power Teams are the relational engine feeding rollups (aggregate-only on this page)."
      />
      <div className="mt-3 overflow-x-auto pb-1">
        <div className="flex min-w-full flex-nowrap items-stretch gap-0 sm:justify-between">
          {steps.map((s, i) => (
            <div key={s.key} className="flex min-w-0 items-center">
              {i > 0 ? (
                <span className="shrink-0 px-0.5 text-sm font-light text-kelly-navy/40 sm:px-1" aria-hidden>
                  →
                </span>
              ) : null}
              <div
                className={cn(
                  "w-[128px] shrink-0 rounded-lg border p-2 sm:w-[140px] md:w-[min(152px,100%)]",
                  s.status === "current" && "border-kelly-navy/45 bg-kelly-navy/[0.07] shadow-sm ring-1 ring-kelly-navy/20",
                  s.status === "next" && "border-kelly-text/12 bg-kelly-page/95",
                  s.status === "future" && "border-dashed border-kelly-text/25 bg-kelly-page/60",
                )}
              >
                <p className="text-center text-[9px] font-extrabold uppercase tracking-wider text-kelly-slate/75">{s.label}</p>
                <p className="mt-0.5 text-center text-[10px] font-bold text-kelly-navy/90">
                  {s.key === "county" ? "Pope" : s.key === "power" ? "Po5" : s.key === "community" ? "TBD" : s.key}
                </p>
                <p className="mt-1.5 line-clamp-4 text-center text-[9px] leading-tight text-kelly-text/72">{s.blurb}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
