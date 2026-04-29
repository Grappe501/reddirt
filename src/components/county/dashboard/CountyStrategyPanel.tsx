import { countyDashboardCardClass } from "./countyDashboardClassNames";
import { CountySectionHeader } from "./CountySectionHeader";
import { cn } from "@/lib/utils";

type Props = {
  overline?: string;
  title?: string;
  strongest: string;
  weakest: string;
  nextMove: string;
  /** Label before `nextMove` — default “Next move” for internal decks; county briefings use “Next sourcing step”. */
  nextMoveLead?: string;
  footnote?: string;
  className?: string;
};

export function CountyStrategyPanel({
  overline = "Read on the data",
  title = "What this means",
  strongest,
  weakest,
  nextMove,
  nextMoveLead = "Next move",
  footnote,
  className,
}: Props) {
  return (
    <div className={className}>
      <CountySectionHeader
        overline={overline}
        title={title}
        description="Plain-language read anchored in sources — not quotas or GOTV choreography."
      />
      <div className={cn(countyDashboardCardClass, "mt-2 space-y-2 border-l-4 border-l-kelly-success/30 text-sm leading-relaxed")}>
        <p>
          <span className="font-bold text-kelly-navy">Strongest: </span>
          {strongest}
        </p>
        <p>
          <span className="font-bold text-kelly-navy">Weakest: </span>
          {weakest}
        </p>
        <p>
          <span className="font-bold text-kelly-navy">{nextMoveLead}: </span>
          {nextMove}
        </p>
        {footnote ? <p className="text-xs text-kelly-text/60">{footnote}</p> : null}
      </div>
    </div>
  );
}
