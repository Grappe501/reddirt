import { cn } from "@/lib/utils";
import type { VisitSummary } from "@/data/kelly-county-visits";
import { getCountyPaintMap } from "@/data/kelly-county-visits";

type Props = {
  summary: VisitSummary;
};

const legend = [
  { key: "visited" as const, label: "Visited", className: "border-kelly-navy/30 bg-kelly-navy/10 text-kelly-navy" },
  {
    key: "scheduled" as const,
    label: "Scheduled",
    className: "border-kelly-gold/40 bg-kelly-gold/15 text-kelly-navy",
  },
  {
    key: "visited-scheduled" as const,
    label: "Visited + upcoming",
    className: "border-2 border-kelly-gold bg-kelly-navy/10 text-kelly-navy",
  },
  {
    key: "undocumented" as const,
    label: "Not yet documented",
    className: "border-kelly-text/10 bg-kelly-text/[0.04] text-kelly-text/55",
  },
];

export function CountyProgressGrid({ summary }: Props) {
  const { buckets, returningCounties } = summary;
  const paint = getCountyPaintMap();
  const rows = [...buckets.visited, ...buckets.scheduled, ...buckets.undocumented]
    .filter((name, i, all) => all.indexOf(name) === i)
    .sort((a, b) => a.localeCompare(b))
    .map((name) => ({ name, bucket: paint[name] ?? "undocumented" }));

  const returningCount = returningCounties.length;

  return (
    <section aria-labelledby="arkansas-visits-counties">
      <h2 id="arkansas-visits-counties" className="font-heading text-2xl font-bold text-kelly-text md:text-3xl">
        All 75 counties
      </h2>
      <p className="mt-2 max-w-2xl font-body text-base leading-relaxed text-kelly-text/80">
        Navy is a completed public stop. Gold is an upcoming stop. A gold outline on navy means she has already been
        there and is scheduled to return.
      </p>

      <div className="mt-6 flex flex-wrap gap-4 font-body text-xs text-kelly-muted">
        {legend.map((item) => {
          const count =
            item.key === "visited-scheduled"
              ? returningCount
              : item.key === "visited"
                ? buckets.visited.length
                : buckets[item.key].length;
          return (
            <span key={item.key} className="inline-flex items-center gap-2">
              <span className={cn("h-3 w-3 rounded-sm border", item.className)} aria-hidden />
              {item.label}
              <span className="text-kelly-text/45">({count})</span>
            </span>
          );
        })}
      </div>

      <ul
        className="mt-8 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
        role="list"
        aria-label="Arkansas counties by visit status"
      >
        {rows.map((row) => {
          const style = legend.find((l) => l.key === row.bucket) ?? legend[3];
          return (
            <li key={row.name}>
              <div
                className={cn(
                  "rounded-lg border px-3 py-2 text-center font-body text-xs font-semibold leading-tight",
                  style.className,
                )}
              >
                <span className="sr-only">{style.label}: </span>
                {row.name}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
