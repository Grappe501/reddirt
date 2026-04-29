import { CountySectionHeader } from "@/components/county/dashboard/CountySectionHeader";
import { cn } from "@/lib/utils";

const steps = [
  {
    key: "county",
    label: "County",
    status: "current" as const,
    blurb: "FIPS 05119 — statewide capital county; full picture before city splits ingest.",
  },
  { key: "city", label: "City", status: "future" as const, blurb: "Municipal cards — ACS & canvass aggregates marked “in progress.”" },
  {
    key: "community",
    label: "Community",
    status: "future" as const,
    blurb: "Neighborhood storylines anchor after place data attaches—no improvised populations here.",
  },
  {
    key: "precinct",
    label: "Precinct",
    status: "future" as const,
    blurb: "Precinct turnout tables — turnout modeling flagged “to be layered.”",
  },
  {
    key: "outreach",
    label: "Neighbor-led outreach",
    status: "future" as const,
    blurb: "Volunteer ladders stay off public marketing routes; illustrative zeros keep shape without field claims.",
  },
] as const;

/** Decision ladder borrowed from briefing pedagogy — public education, not a staffing checklist. */
export function PulaskiCountyIntelligenceStack({ className }: { className?: string }) {
  return (
    <section className={className} aria-label="How this county briefing resolves">
      <CountySectionHeader
        overline="Geography ladder"
        title="County → City → Neighborhood → Voting district → Neighbor-led conversation"
        description="Readers understand scale before precinct detail; ladders stay illustrative until ingest fills each cell."
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
