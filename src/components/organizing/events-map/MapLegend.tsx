import type { CountyMapFeature } from "@/components/organizing/events-map/county-map-types";

export function MapLegend() {
  return (
    <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2 font-body text-xs text-kelly-text/80" aria-label="Map legend">
      <li className="inline-flex items-center gap-2">
        <span className="inline-block h-3 w-3 rounded-[2px] bg-[var(--kelly-official-navy)]" aria-hidden />
        Visited
      </li>
      <li className="inline-flex items-center gap-2">
        <span
          className="inline-block h-3 w-3 rounded-[2px] bg-transparent"
          style={{ boxShadow: "inset 0 0 0 2px var(--kelly-official-gold)", background: "#eef1f4" }}
          aria-hidden
        />
        Confirmed upcoming
      </li>
      <li className="inline-flex items-center gap-2">
        <span
          className="inline-block h-3 w-3 rounded-[2px] bg-transparent"
          style={{ boxShadow: "inset 0 0 0 2px var(--kelly-official-sky)", background: "#eef1f4" }}
          aria-hidden
        />
        Tentative
      </li>
      <li className="inline-flex items-center gap-2">
        <span className="inline-block h-3 w-3 rounded-[2px] border border-kelly-text/20 bg-[#eef1f4]" aria-hidden />
        Not yet visited
      </li>
    </ul>
  );
}

export function CountyTooltip({ feature }: { feature: CountyMapFeature }) {
  return (
    <div className="rounded-lg border border-kelly-text/10 bg-white px-3 py-2 shadow-[var(--shadow-soft)]">
      <p className="font-heading text-sm font-bold text-kelly-text">{feature.name} County</p>
      <p className="mt-1 font-body text-xs text-kelly-text/80">{feature.visitedLabel}</p>
      {feature.upcomingHeading ? (
        <div className="mt-2">
          <p className="font-body text-[11px] font-bold uppercase tracking-wider text-kelly-navy">
            {feature.upcomingHeading}
          </p>
          <ul className="mt-1 space-y-1">
            {feature.upcomingLines.map((line) => (
              <li key={line.href} className="font-body text-xs text-kelly-text/80">
                {line.text}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
