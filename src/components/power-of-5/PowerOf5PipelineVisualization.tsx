import { POWER_OF_5_ORGANIZING_PIPELINES, type PowerOf5OrganizingPipelineId } from "@/lib/power-of-5/pipelines";
import { countyDashboardCardClass } from "@/components/county/dashboard/countyDashboardClassNames";
import { cn } from "@/lib/utils";

type Props = {
  /** Highlight one stage (e.g. demo “you are here”). */
  activeId?: PowerOf5OrganizingPipelineId;
  /** `compact` = single row, smaller type; `full` = wraps with short summaries on wide screens. */
  variant?: "compact" | "full";
  className?: string;
};

/**
 * Shared ladder UI for the six organizing pipelines defined in `lib/power-of-5/pipelines.ts`.
 */
export function PowerOf5PipelineVisualization({ activeId, variant = "compact", className }: Props) {
  const steps = POWER_OF_5_ORGANIZING_PIPELINES;

  return (
    <nav
      className={cn(countyDashboardCardClass, "p-3 sm:p-4", className)}
      aria-label="Power of 5 organizing pipelines"
    >
      <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-kelly-text/50">Organizing pipelines</p>
      <p className="mt-1 text-xs text-kelly-text/65">
        Six-stage funnel — metrics on this page roll up to these motions; live completion rates ship with field tools.
      </p>
      <ol className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
        {steps.map((p) => {
          const isActive = activeId === p.id;
          return (
            <li key={p.id}>
              <div
                className={cn(
                  "flex h-full flex-col rounded-lg border px-2.5 py-2",
                  isActive
                    ? "border-kelly-navy/40 bg-kelly-navy/[0.06] ring-1 ring-kelly-navy/25"
                    : "border-kelly-text/10 bg-kelly-page/80",
                )}
                title={p.summary}
              >
                <span className="flex items-center gap-2">
                  <span
                    className={cn(
                      "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-extrabold",
                      isActive ? "bg-kelly-navy text-white" : "bg-kelly-slate/15 text-kelly-navy",
                    )}
                    aria-hidden
                  >
                    {p.order}
                  </span>
                  <span className="text-[11px] font-bold uppercase tracking-wide text-kelly-navy">{p.label}</span>
                </span>
                {variant === "full" ? (
                  <p className="mt-1.5 text-[11px] leading-snug text-kelly-text/70">{p.summary}</p>
                ) : null}
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
