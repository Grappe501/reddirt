import { CountySectionHeader } from "@/components/county/dashboard/CountySectionHeader";
import { cn } from "@/lib/utils";

const steps = [
  {
    key: "county",
    label: "County",
    status: "current" as const,
    blurb: "FIPS 05119 — Pulaski County command view (template parity with Pope v2).",
  },
  { key: "city", label: "City", status: "future" as const, blurb: "Municipal drilldown cards deferred until place aggregates ingest." },
  {
    key: "community",
    label: "Community",
    status: "future" as const,
    blurb: "Neighborhood / host circles when routes and ethics review land.",
  },
  {
    key: "precinct",
    label: "Precinct",
    status: "future" as const,
    blurb: "Electoral turf — list mode after verified tabulation; no fabricated precinct targets here.",
  },
  {
    key: "power",
    label: "Power Team",
    status: "future" as const,
    blurb: "Relational engine — zeros on this briefing until Pulaski telemetry connects (no Pope seed graph cloned).",
  },
] as const;

/** Visual ladder — same resolution model as Pope template; Pulaski-specific posture. */
export function PulaskiCountyIntelligenceStack({ className }: { className?: string }) {
  return (
    <section className={className} aria-label="Pulaski County intelligence stack">
      <CountySectionHeader
        overline="Pulaski County intelligence stack"
        title="County → City → Community → Precinct → Power Team"
        description="Same humans, different resolution. City cards are intentionally empty on this v1 Pulaski briefing until verified ingest; Power Team metrics are zeroed—not copied from Pope seed data."
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
                  s.status === "future" && "border-dashed border-kelly-text/25 bg-kelly-page/60",
                )}
              >
                <p className="text-center text-[9px] font-extrabold uppercase tracking-wider text-kelly-slate/75">{s.label}</p>
                <p className="mt-1.5 text-center text-[9px] leading-snug text-kelly-text/75">{s.blurb}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
