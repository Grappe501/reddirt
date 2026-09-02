import type { VisitSummary } from "@/data/kelly-county-visits";

type Props = {
  summary: VisitSummary;
};

export function VisitSummaryStats({ summary }: Props) {
  const items = [
    {
      label: "Counties visited",
      value: `${summary.visitedCounties} of ${summary.totalCounties}`,
      hint: `${summary.percentVisited}% of Arkansas`,
    },
    {
      label: "All public stops",
      value: String(summary.totalPublicStopCount),
      hint: "Completed plus upcoming through Election Day",
    },
    {
      label: "Completed stops",
      value: String(summary.completedStopCount),
      hint:
        summary.completedUnpostedCount > 0
          ? `${summary.completedLedgerCount} dated on the ledger · ${summary.completedUnpostedCount} same-day or unposted still to backfill`
          : "Published past visits",
    },
    {
      label: "Upcoming stops",
      value: String(summary.scheduledStopCount),
      hint: "Through November 3, 2026",
    },
    {
      label: "County assignments pending",
      value: String(summary.needsReviewCount),
      hint: "Needs a county review",
    },
  ];

  return (
    <section aria-labelledby="arkansas-visits-summary">
      <h2 id="arkansas-visits-summary" className="font-heading text-2xl font-bold text-kelly-text md:text-3xl">
        Statewide progress
      </h2>
      <p className="mt-2 max-w-2xl font-body text-base leading-relaxed text-kelly-text/80">
        Dated stops come from the campaign ledger. The completed total also includes same-day stops that have
        not been split onto their own calendar line yet.
      </p>
      <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-5" role="list">
        {items.map((item) => (
          <li
            key={item.label}
            className="rounded-lg border border-kelly-navy/15 bg-kelly-navy/[0.04] px-4 py-4"
          >
            <p className="font-body text-xs font-semibold uppercase tracking-wide text-kelly-muted">{item.label}</p>
            <p className="mt-2 font-heading text-2xl font-bold text-kelly-navy">{item.value}</p>
            <p className="mt-1 font-body text-sm text-kelly-text/70">{item.hint}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
