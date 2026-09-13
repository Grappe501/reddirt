import Link from "next/link";
import type { ChannelRow, TransitionRow } from "@/lib/analytics/site-traffic-aggregate";

function formatPct(n: number | null): string {
  if (n == null) return "—";
  return `${Math.round(n * 100)}%`;
}

export function SiteAnalyticsJourneyDesk({
  channels,
  transitions,
  landingNext,
}: {
  channels: ChannelRow[];
  transitions: TransitionRow[];
  landingNext: TransitionRow[];
}) {
  const active = channels.filter((row) => row.sessions > 0);
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <section className="rounded-card border border-kelly-ink/10 bg-white p-6 shadow-sm">
        <h2 className="font-heading text-xl font-bold text-kelly-ink">Where they came from</h2>
        <p className="mt-2 font-body text-sm text-kelly-slate">
          Channel is attributed from the first page of the visit (referrer + utm tags). Direct includes typed URLs and
          some privacy-blocked search.
        </p>
        {active.length === 0 ? (
          <p className="mt-3 font-body text-sm text-kelly-slate">No arrivals yet.</p>
        ) : (
          <table className="mt-4 w-full text-left font-body text-sm">
            <thead>
              <tr className="border-b border-kelly-ink/10 text-[11px] uppercase tracking-wider text-kelly-slate/70">
                <th className="py-2 pr-3">Source</th>
                <th className="py-2 pr-3">Visits</th>
                <th className="py-2 pr-3">Bounce</th>
                <th className="py-2">Forms</th>
              </tr>
            </thead>
            <tbody>
              {active.map((row) => (
                <tr key={row.id} className="border-b border-kelly-ink/5">
                  <td className="py-2 pr-3 font-semibold text-kelly-ink">{row.label}</td>
                  <td className="py-2 pr-3">{row.sessions}</td>
                  <td className="py-2 pr-3">{formatPct(row.bounceRate)}</td>
                  <td className="py-2">{row.formCompletes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section className="rounded-card border border-kelly-ink/10 bg-white p-6 shadow-sm">
        <h2 className="font-heading text-xl font-bold text-kelly-ink">Where they went next</h2>
        <p className="mt-2 font-body text-sm text-kelly-slate">
          First click after the landing page, then the strongest page-to-page moves on the campaign site.
        </p>
        {landingNext.length === 0 && transitions.length === 0 ? (
          <p className="mt-3 font-body text-sm text-kelly-slate">No second-page moves yet.</p>
        ) : (
          <div className="mt-4 space-y-4">
            {landingNext.slice(0, 8).map((row) => (
              <p key={`land-${row.from}-${row.to}`} className="font-body text-sm text-kelly-ink">
                Landed on{" "}
                <Link href={row.from} className="font-semibold text-kelly-navy hover:underline" target="_blank" rel="noreferrer">
                  {row.from}
                </Link>{" "}
                then opened{" "}
                <Link href={row.to} className="font-semibold text-kelly-navy hover:underline" target="_blank" rel="noreferrer">
                  {row.to}
                </Link>
                <span className="text-kelly-slate"> · {row.hits}</span>
              </p>
            ))}
            {transitions.length > landingNext.length ? (
              <div>
                <h3 className="font-heading text-sm font-bold text-kelly-ink">All on-site moves</h3>
                <ul className="mt-2 space-y-1 font-body text-sm">
                  {transitions.slice(0, 10).map((row) => (
                    <li key={`${row.from}-${row.to}`}>
                      {row.from} → {row.to} <span className="text-kelly-slate">{row.hits}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        )}
      </section>
    </div>
  );
}
