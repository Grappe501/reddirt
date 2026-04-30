import { CountySectionHeader } from "@/components/county/dashboard/CountySectionHeader";
import { cn } from "@/lib/utils";

const steps = [
  {
    key: "county",
    label: "County",
    status: "current" as const,
    blurb: "FIPS 05045 — I-40 / Little Rock fringe growth band; county-seat scale before city ingest.",
  },
  { key: "city", label: "City", status: "future" as const, blurb: "Municipality tiles — Conway (city here) differs from Conway County; labels follow registry prose." },
  {
    key: "community",
    label: "Community",
    status: "future" as const,
    blurb: "School-town and highway-corridor narratives — placeholders until ACS place rows verify.",
  },
  {
    key: "precinct",
    label: "Precinct",
    status: "future" as const,
    blurb: "Precinct canvass granularity — precinct-level breakdown pending integration.",
  },
  {
    key: "outreach",
    label: "Neighbor-led outreach",
    status: "future" as const,
    blurb: "Public briefing shows framework slots only—not field staffing instructions.",
  },
] as const;

/** Decision ladder for public readers — same resolution story as Pope template, Faulkner geography. */
export function FaulknerCountyIntelligenceStack({ className }: { className?: string }) {
  return (
    <section className={className} aria-label="How this county briefing resolves">
      <CountySectionHeader
        overline="Geography ladder"
        title="County → City → Community → Voting district → Neighbor-led conversation"
        description="Telescoping resolution without inventing wards or precinct participation rates."
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
