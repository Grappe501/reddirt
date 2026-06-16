import { SpecialKpiGoalCard } from "@/components/election-plan/SpecialKpiGoalCard";
import { EventFundraisingKpiStripCard } from "@/components/election-plan/EventFundraisingOpportunityPanel";
import {
  getSpecialKpiGoals,
  specialKpiExplanation,
} from "@/lib/election-plan/load-special-kpi-goals";

type Props = {
  variant?: "strip" | "panel";
  /** Show only goals matching these ids */
  goalIds?: string[];
};

export function SpecialKpiGoalsStrip({ variant = "strip", goalIds }: Props) {
  const goals = getSpecialKpiGoals().filter((g) => !goalIds?.length || goalIds.includes(g.id));
  const showEventKpi = !goalIds?.length || goalIds.includes("grassroots-guitar-strings-profit");

  if (!goals.length && !showEventKpi) return null;

  return (
    <section className={variant === "panel" ? "mb-8" : undefined}>
      {variant === "panel" ? (
        <div className="mb-4">
          <h2 className="font-heading text-xl font-bold text-[var(--ep-navy)]">Special KPI goals</h2>
          <p className="mt-1 text-sm text-[var(--ep-navy-muted)]">{specialKpiExplanation()}</p>
        </div>
      ) : null}
      <div className={`grid gap-4 ${goals.length > 0 || showEventKpi ? "lg:grid-cols-2" : ""}`}>
        {showEventKpi ? <EventFundraisingKpiStripCard /> : null}
        {goals.map((goal) => (
          <SpecialKpiGoalCard key={goal.id} goal={goal} variant={variant} />
        ))}
      </div>
    </section>
  );
}
