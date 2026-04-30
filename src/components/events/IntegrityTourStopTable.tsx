import type { IntegrityTourPlaceholderRow } from "@/content/events/community-election-integrity-tour";

type Props = {
  rows: readonly IntegrityTourPlaceholderRow[];
};

export function IntegrityTourStopTable({ rows }: Props) {
  return (
    <div className="overflow-x-auto rounded-card border border-kelly-text/15 bg-white/90 shadow-sm [-webkit-overflow-scrolling:touch]">
      <table className="w-full min-w-[52rem] border-collapse text-left font-body text-sm">
        <thead>
          <tr className="border-b border-kelly-text/15 bg-kelly-fog/50">
            <th className="px-2 py-3 font-heading text-[10px] font-bold uppercase tracking-wider text-kelly-text/70 md:px-3">
              Stop
            </th>
            <th className="px-2 py-3 font-heading text-[10px] font-bold uppercase tracking-wider text-kelly-text/70 md:px-3">
              County
            </th>
            <th className="px-2 py-3 font-heading text-[10px] font-bold uppercase tracking-wider text-kelly-text/70 md:px-3">Status</th>
            <th className="px-2 py-3 font-heading text-[10px] font-bold uppercase tracking-wider text-kelly-text/70 md:px-3">Host</th>
            <th className="px-2 py-3 font-heading text-[10px] font-bold uppercase tracking-wider text-kelly-text/70 md:px-3">Venue</th>
            <th className="px-2 py-3 font-heading text-[10px] font-bold uppercase tracking-wider text-kelly-text/70 md:px-3">Date</th>
            <th className="px-2 py-3 font-heading text-[10px] font-bold uppercase tracking-wider text-kelly-text/70 md:px-3">
              Point team
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.slot} className="border-b border-kelly-text/8 odd:bg-white even:bg-kelly-text/[0.02]">
              <td className="whitespace-nowrap px-2 py-2 font-medium text-kelly-text md:px-3">{r.slot}</td>
              <td className="px-2 py-2 text-kelly-text/85 md:px-3">{r.county}</td>
              <td className="whitespace-nowrap px-2 py-2 md:px-3">
                <span className="rounded-full border border-kelly-text/12 bg-kelly-navy/5 px-2 py-0.5 text-xs font-semibold text-kelly-text/80">
                  {r.status}
                </span>
              </td>
              <td className="px-2 py-2 text-kelly-text/85 md:px-3">{r.host}</td>
              <td className="px-2 py-2 text-kelly-text/85 md:px-3">{r.venue}</td>
              <td className="whitespace-nowrap px-2 py-2 text-kelly-text/85 md:px-3">{r.date}</td>
              <td className="px-2 py-2 text-kelly-text/85 md:px-3">{r.pointTeam}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
