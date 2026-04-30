import type { CountyFairResearchRow } from "@/content/events/county-fair-research-placeholder";

type Props = {
  rows: readonly CountyFairResearchRow[];
};

/**
 * Responsive research tracker — all rows start as "Research needed" until verified data lands.
 * TODO: Filter/pagination when real research rows include notes and source links.
 */
export function CountyFairResearchTable({ rows }: Props) {
  return (
    <div className="overflow-x-auto rounded-card border border-kelly-text/15 bg-white/90 shadow-sm [-webkit-overflow-scrolling:touch]">
      <table className="w-full min-w-[48rem] border-collapse text-left font-body text-sm">
        <thead>
          <tr className="border-b border-kelly-text/15 bg-kelly-fog/50">
            <th scope="col" className="px-3 py-3 font-heading text-xs font-bold uppercase tracking-wider text-kelly-text/70 md:px-4">
              County
            </th>
            <th scope="col" className="px-3 py-3 font-heading text-xs font-bold uppercase tracking-wider text-kelly-text/70 md:px-4">
              Fair name
            </th>
            <th scope="col" className="px-3 py-3 font-heading text-xs font-bold uppercase tracking-wider text-kelly-text/70 md:px-4">
              2026 dates
            </th>
            <th scope="col" className="px-3 py-3 font-heading text-xs font-bold uppercase tracking-wider text-kelly-text/70 md:px-4">
              City
            </th>
            <th scope="col" className="px-3 py-3 font-heading text-xs font-bold uppercase tracking-wider text-kelly-text/70 md:px-4">
              Source
            </th>
            <th scope="col" className="px-3 py-3 font-heading text-xs font-bold uppercase tracking-wider text-kelly-text/70 md:px-4">
              Status
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.countySlug} className="border-b border-kelly-text/8 odd:bg-white even:bg-kelly-text/[0.02]">
              <td className="whitespace-nowrap px-3 py-2.5 font-medium text-kelly-text md:px-4">{r.county}</td>
              <td className="px-3 py-2.5 text-kelly-text/85 md:px-4">{r.fairName}</td>
              <td className="whitespace-nowrap px-3 py-2.5 text-kelly-text/85 md:px-4">{r.dates2026}</td>
              <td className="px-3 py-2.5 text-kelly-text/85 md:px-4">{r.city}</td>
              <td className="px-3 py-2.5 text-kelly-text/85 md:px-4">
                {r.sourceUrl ? (
                  <a
                    href={r.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-kelly-navy underline-offset-2 hover:underline"
                  >
                    Link
                  </a>
                ) : (
                  "—"
                )}
              </td>
              <td className="whitespace-nowrap px-3 py-2.5 md:px-4">
                <span className="rounded-full border border-kelly-text/12 bg-kelly-navy/5 px-2 py-0.5 text-xs font-semibold text-kelly-text/80">
                  {r.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
