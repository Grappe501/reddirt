import { formatCountyDashboardNumber } from "./countyDashboardFormat";
import { CountySectionHeader } from "./CountySectionHeader";
import { cn } from "@/lib/utils";

type Props = {
  dataWarnings: string[];
  priorityVoterOnRoll: number | null;
  overline?: string;
  title?: string;
  description?: string;
  className?: string;
};

export function CountyDataGapsPanel({
  dataWarnings,
  priorityVoterOnRoll,
  overline = "Integrity",
  title = "Honest data gaps (from engine)",
  description = "No invented microtargeting. See notes before messaging from this board.",
  className,
}: Props) {
  return (
    <section className={cn("border-t border-kelly-text/10 pt-6", className)}>
      <CountySectionHeader overline={overline} title={title} description={description} />
      <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-kelly-text/70">
      <ul className="mt-2 list-inside list-disc space-y-1">
        {dataWarnings.map((w, i) => (
          <li key={i}>{w}</li>
        ))}
      </ul>
      <p className="mt-3 text-xs text-kelly-text/70">
        Aggregate on roll (county, when file linked): <strong className="text-kelly-navy/90">{formatCountyDashboardNumber(priorityVoterOnRoll)}</strong>
      </p>
    </section>
  );
}