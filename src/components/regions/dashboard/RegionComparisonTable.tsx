import type { RegionComparisonTableModel } from "@/lib/campaign-engine/regions/types";
import { CountySectionHeader, countyDashboardCardClass } from "@/components/county/dashboard";
import { cn } from "@/lib/utils";

type Props = {
  model: RegionComparisonTableModel;
  className?: string;
};

/**
 * Peer sense-check table — all demo unless row `source` is `derived` (rare in this shell).
 */
export function RegionComparisonTable({ model, className }: Props) {
  const [c0, c1, c2, c3] = model.columnLabels;
  return (
    <section className={className}>
      <CountySectionHeader overline={model.overline ?? "Peer table"} title={model.title} description={model.description} />
      <p className="mt-2 text-xs text-kelly-text/65 sm:hidden">Swipe horizontally to read the full peer table.</p>
      <div className={cn(countyDashboardCardClass, "mt-2 touch-pan-x overflow-x-auto overscroll-x-contain p-0")}>
        <table className="w-full min-w-[520px] border-collapse text-left text-sm">
          <caption className="sr-only">{model.title}. Values are demonstration or derived aggregates, not voter data.</caption>
          <thead>
            <tr className="border-b border-kelly-text/10 bg-kelly-navy/5 text-[10px] font-bold uppercase tracking-wider text-kelly-text/75">
              <th scope="col" className="px-3 py-3 text-left">
                {c0}
              </th>
              <th scope="col" className="px-3 py-3 text-left">
                {c1}
              </th>
              <th scope="col" className="px-3 py-3 text-left">
                {c2}
              </th>
              <th scope="col" className="px-3 py-3 text-left">
                {c3}
              </th>
            </tr>
          </thead>
          <tbody>
            {model.rows.map((r) => (
              <tr key={r.id} className="border-b border-kelly-text/5 last:border-0">
                <th scope="row" className="px-3 py-3 text-left font-medium text-kelly-navy/95">
                  {r.metric}
                </th>
                <td className="px-3 py-3 font-mono text-kelly-text/85">{r.peerValue}</td>
                <td className="px-3 py-3 font-mono text-kelly-text/85">{r.regionValue}</td>
                <td className="px-3 py-3 text-xs text-kelly-text/70">
                  {r.notes}
                  <span
                    className={cn(
                      "ml-1.5 inline-block rounded px-1.5 py-0.5 text-[9px] font-bold uppercase",
                      r.source === "demo" ? "bg-amber-100/90 text-amber-950" : "bg-kelly-slate/15 text-kelly-text/70",
                    )}
                  >
                    {r.source}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
