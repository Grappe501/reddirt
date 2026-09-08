import Link from "next/link";
import { getVisitSummary } from "@/data/kelly-county-visits";

type Props = {
  /** Extra heading context when this band is not on /arkansas-visits. */
  heading?: string;
};

/**
 * Live ledger totals — homepage, /events, and any other public surface.
 * Reads `getVisitSummary()` at request time (parent pages should be dynamic).
 */
export function KellyAcrossArkansasStatsBand({ heading = "Kelly Across Arkansas" }: Props) {
  const summary = getVisitSummary();
  const items = [
    {
      label: "Counties visited",
      value: `${summary.visitedCounties} of ${summary.totalCounties}`,
    },
    {
      label: "Completed stops",
      value: String(summary.completedStopCount),
    },
    {
      label: "Upcoming stops",
      value: String(summary.scheduledStopCount),
    },
    {
      label: "All public stops",
      value: String(summary.totalPublicStopCount),
    },
  ];

  return (
    <section aria-labelledby="across-arkansas-live-stats">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-body text-[11px] font-bold uppercase tracking-[0.22em] text-kelly-gold">{heading}</p>
          <h2
            id="across-arkansas-live-stats"
            className="mt-2 font-heading text-xl font-bold text-kelly-text md:text-2xl"
          >
            {summary.totalPublicStopCount} campaign stops · {summary.visitedCounties} counties
          </h2>
          <p className="mt-2 max-w-2xl font-body text-sm leading-relaxed text-kelly-text/75">
            {summary.completedStopCount} completed
            {summary.completedUnpostedCount > 0
              ? ` (${summary.completedLedgerCount} dated on the ledger, ${summary.completedUnpostedCount} same-day still to backfill)`
              : ""}
            {" · "}
            {summary.scheduledStopCount} still ahead through Election Day.
          </p>
        </div>
        <Link
          href="/arkansas-visits"
          className="shrink-0 font-body text-sm font-bold text-kelly-navy underline-offset-2 hover:underline"
        >
          Full county calendar →
        </Link>
      </div>
      <ul className="mt-6 grid list-none grid-cols-2 gap-3 lg:grid-cols-4">
        {items.map((item) => (
          <li
            key={item.label}
            className="rounded-lg border border-kelly-navy/15 bg-kelly-navy/[0.04] px-4 py-3"
          >
            <p className="font-body text-xs font-semibold uppercase tracking-wide text-kelly-muted">{item.label}</p>
            <p className="mt-1 font-heading text-2xl font-bold text-kelly-navy">{item.value}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
