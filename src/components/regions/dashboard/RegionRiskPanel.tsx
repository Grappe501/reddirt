import type { CountyDashboardRiskRow } from "@/lib/campaign-engine/county-dashboards/types";
import { countyDashboardCardClass, CountySectionHeader } from "@/components/county/dashboard";
import { cn } from "@/lib/utils";

type Props = {
  title?: string;
  overline?: string;
  description?: string;
  risks: CountyDashboardRiskRow[];
  className?: string;
};

const label = "text-[10px] font-bold uppercase tracking-wider text-kelly-text/45";

function severityBlock(severity: CountyDashboardRiskRow["severity"]) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-extrabold uppercase tracking-wide ring-1",
        severity === "high" && "bg-red-100/95 text-red-900 ring-red-200/80",
        severity === "medium" && "bg-amber-100/95 text-amber-950 ring-amber-200/70",
        severity === "low" && "bg-kelly-slate/12 text-kelly-text/80 ring-kelly-text/10",
      )}
    >
      {severity} severity
    </span>
  );
}

export function RegionRiskPanel({
  title = "Risks & mitigations",
  overline = "Watch list",
  description,
  risks,
  className,
}: Props) {
  return (
    <section className={className}>
      <CountySectionHeader overline={overline} title={title} description={description} />
      <div className="mt-3 grid gap-2 md:grid-cols-2">
        {risks.map((r) => (
          <div key={r.id} className={cn(countyDashboardCardClass, "border-l-4 border-l-kelly-slate/25 p-3 sm:p-4")}>
            <p className="text-sm font-bold text-kelly-navy/95">{r.category}</p>
            <div className="mt-1.5 space-y-2">
              <div>
                <p className={label}>Severity</p>
                <p className="mt-0.5">{severityBlock(r.severity)}</p>
              </div>
              <div>
                <p className={label}>Mitigation</p>
                <p className="text-sm leading-snug text-kelly-text/88">{r.mitigation}</p>
              </div>
              <div>
                <p className={label}>Owner role</p>
                <p className="text-sm text-kelly-text/80">{r.ownerRole}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
