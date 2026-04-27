import type { CountyDashboardNextAction } from "@/lib/campaign-engine/county-dashboards/types";
import { countyDashboardCardClass, CountySectionHeader } from "@/components/county/dashboard";
import { cn } from "@/lib/utils";

type Props = {
  title?: string;
  overline?: string;
  description?: string;
  actions: CountyDashboardNextAction[];
  className?: string;
};

function urgencyPill(urgency: CountyDashboardNextAction["urgency"]) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide",
        urgency === "high" && "bg-red-100/95 text-red-900 ring-1 ring-red-200/60",
        urgency === "medium" && "bg-amber-100/95 text-amber-950 ring-1 ring-amber-200/60",
        urgency === "low" && "bg-kelly-slate/12 text-kelly-text/75 ring-1 ring-kelly-text/10",
      )}
    >
      <span
        className={cn("h-1.5 w-1.5 rounded-full", urgency === "high" && "bg-red-600", urgency === "medium" && "bg-amber-600", urgency === "low" && "bg-kelly-slate/50")}
        aria-hidden
      />
      {urgency} urgency
    </span>
  );
}

const field = "text-[10px] font-bold uppercase tracking-wider text-kelly-text/45";

export function RegionActionPanel({
  title = "Regional next moves",
  overline = "Action queue",
  description,
  actions,
  className,
}: Props) {
  return (
    <section className={className}>
      <CountySectionHeader overline={overline} title={title} description={description} />
      <div className="mt-3 space-y-2.5">
        {actions.map((a) => (
          <div
            key={a.id}
            className={cn(
              countyDashboardCardClass,
              "border-l-4 border-l-kelly-navy/35 p-3 sm:p-4",
            )}
          >
            <p className="font-heading text-base font-bold leading-snug text-kelly-navy sm:text-lg">{a.title}</p>
            <dl className="mt-2 grid gap-1.5 text-sm sm:grid-cols-2 sm:gap-x-4">
              <div>
                <dt className={field}>Owner role</dt>
                <dd className="text-kelly-text/90">{a.ownerRole}</dd>
              </div>
              <div>
                <dt className={field}>Urgency</dt>
                <dd className="mt-0.5">{urgencyPill(a.urgency)}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className={field}>KPI affected</dt>
                <dd className="text-kelly-text/85">{a.kpiAffected}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className={field}>Expected impact</dt>
                <dd className="text-kelly-text/88">{a.expectedImpact}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className={field}>Next step</dt>
                <dd className="rounded-md border border-kelly-navy/10 bg-kelly-navy/[0.04] px-2 py-1.5 text-kelly-navy/95">
                  {a.nextStep}
                </dd>
              </div>
            </dl>
          </div>
        ))}
      </div>
    </section>
  );
}
