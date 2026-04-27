import { CountySectionHeader } from "@/components/county/dashboard";

type Props = {
  title?: string;
  overline?: string;
  /** Explains data source and placeholder posture. */
  caption: string;
  /** Optional: region name for label on abstract map. */
  regionLabelOnMap?: string;
  className?: string;
};

/**
 * State/region map placeholder (SVG) — no map dependencies.
 */
export function RegionMapPanel({
  overline = "Geography",
  title = "Region map (placeholder)",
  caption,
  regionLabelOnMap = "Region",
  className,
}: Props) {
  return (
    <section className={className}>
      <CountySectionHeader
        overline={overline}
        title={title}
        description="Aggregate-only posture: no household or voter-point map on public view."
      />
      <div className="mt-3 rounded-2xl border border-dashed border-kelly-navy/25 bg-gradient-to-br from-kelly-navy/5 to-kelly-page/90 p-4">
        <p className="text-sm text-kelly-text/75">{caption}</p>
        <div className="mt-4 flex min-h-[200px] items-center justify-center rounded-xl border border-kelly-slate/20 bg-kelly-page/80 p-3">
          <ArkansasRegionPlaceholder label={regionLabelOnMap} />
        </div>
      </div>
    </section>
  );
}

function ArkansasRegionPlaceholder({ label }: { label: string }) {
  return (
    <svg viewBox="0 0 400 220" className="h-full w-full max-h-[220px] text-kelly-navy/30" aria-hidden>
      <rect width="400" height="220" className="fill-kelly-slate/5" rx="4" />
      <path
        d="M 50 40 L 120 20 L 280 30 L 360 100 L 340 180 L 200 200 L 60 160 Z"
        className="fill-kelly-navy/8 stroke-kelly-navy/25"
        strokeWidth="2"
      />
      <path
        d="M 140 50 L 220 60 L 260 120 L 200 150 L 120 120 Z"
        className="fill-amber-400/25 stroke-amber-600/50"
        strokeWidth="2"
      />
      <text x="175" y="110" className="fill-kelly-navy/80 text-xs font-bold">
        {label}
      </text>
    </svg>
  );
}
