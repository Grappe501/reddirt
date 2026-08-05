import { displayTitle, formatStopDate, type KellyCampaignStop } from "@/data/kelly-county-visits";
import { cn } from "@/lib/utils";

type Props = {
  id: string;
  title: string;
  lead: string;
  stops: KellyCampaignStop[];
  emptyMessage: string;
};

function CountyBadges({ stop }: { stop: KellyCampaignStop }) {
  if (!stop.counties.length) {
    return (
      <span className="inline-flex items-center rounded-full border border-amber-700/30 bg-amber-50 px-2.5 py-1 font-body text-xs font-semibold text-amber-900">
        County assignment pending
      </span>
    );
  }
  return (
    <ul className="flex flex-wrap gap-2" aria-label="Counties">
      {stop.counties.map((county) => (
        <li key={county}>
          <span className="inline-flex items-center rounded-full border border-kelly-navy/20 bg-kelly-navy/8 px-2.5 py-1 font-body text-xs font-semibold text-kelly-navy">
            {county}
          </span>
        </li>
      ))}
    </ul>
  );
}

export function StopList({ id, title, lead, stops, emptyMessage }: Props) {
  return (
    <section aria-labelledby={id}>
      <h2 id={id} className="font-heading text-2xl font-bold text-kelly-text md:text-3xl">
        {title}
      </h2>
      <p className="mt-2 max-w-2xl font-body text-base leading-relaxed text-kelly-text/80">{lead}</p>

      {stops.length === 0 ? (
        <p className="mt-8 rounded-lg border border-kelly-text/10 bg-kelly-text/[0.03] p-6 font-body text-sm text-kelly-text/80">
          {emptyMessage}
        </p>
      ) : (
        <ol className="mt-8 space-y-3">
          {stops.map((stop) => {
            const pending = stop.counties.length === 0;
            return (
              <li
                key={stop.id}
                className={cn(
                  "rounded-lg border px-4 py-4 md:px-5",
                  pending
                    ? "border-amber-700/25 bg-amber-50/40"
                    : "border-kelly-text/10 bg-kelly-text/[0.02]",
                )}
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div className="min-w-0">
                    <p className="font-body text-sm font-semibold text-kelly-navy">{formatStopDate(stop.date)}</p>
                    <h3 className="mt-1 font-heading text-lg font-bold text-kelly-text">{displayTitle(stop)}</h3>
                    {stop.city ? (
                      <p className="mt-1 font-body text-sm text-kelly-text/70">{stop.city}</p>
                    ) : null}
                  </div>
                  <div className="md:max-w-[50%] md:text-right">
                    <CountyBadges stop={stop} />
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
