import { NETWORK_LADDER_LABELS } from "@/lib/power-of-5/onboarding-demo";

/**
 * SVG + labels: You → five → ripple → geography ladder. No chart library.
 */
export function PowerOf5NetworkPreview() {
  const nodes = [
    { cx: 90, cy: 120, r: 22, label: "You", emphasis: true },
    { cx: 40, cy: 55, r: 14, label: "1" },
    { cx: 140, cy: 55, r: 14, label: "2" },
    { cx: 25, cy: 175, r: 14, label: "3" },
    { cx: 155, cy: 175, r: 14, label: "4" },
    { cx: 90, cy: 35, r: 14, label: "5" },
  ];

  return (
    <div className="rounded-2xl border border-kelly-navy/15 bg-gradient-to-b from-kelly-navy/[0.04] to-kelly-page/90 p-4 sm:p-6">
      <p className="mb-4 text-center font-body text-xs font-bold uppercase tracking-[0.18em] text-kelly-navy/70">
        How your five connect outward
      </p>
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="mx-auto w-full max-w-[220px] shrink-0">
          <svg viewBox="0 0 180 220" className="h-auto w-full text-kelly-navy" aria-hidden>
            <defs>
              <linearGradient id="p5-edge" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="currentColor" stopOpacity="0.35" />
                <stop offset="100%" stopColor="currentColor" stopOpacity="0.12" />
              </linearGradient>
            </defs>
            {nodes.slice(1).map((n) => (
              <line
                key={n.label}
                x1={nodes[0].cx}
                y1={nodes[0].cy}
                x2={n.cx}
                y2={n.cy}
                stroke="url(#p5-edge)"
                strokeWidth="2"
              />
            ))}
            {nodes.map((n) => (
              <g key={n.label}>
                <circle
                  cx={n.cx}
                  cy={n.cy}
                  r={n.r}
                  className={n.emphasis ? "fill-kelly-gold/90 stroke-kelly-navy/40" : "fill-kelly-page stroke-kelly-navy/30"}
                  strokeWidth="2"
                />
                <text
                  x={n.cx}
                  y={n.cy}
                  textAnchor="middle"
                  dominantBaseline="central"
                  className="fill-kelly-navy font-body text-[11px] font-bold"
                >
                  {n.emphasis ? "You" : n.label}
                </text>
              </g>
            ))}
          </svg>
          <p className="mt-2 text-center text-xs text-kelly-text/65">
            Illustrative only — not a real roster or map.
          </p>
        </div>
        <ol className="flex flex-1 flex-wrap justify-center gap-2 sm:gap-3">
          {NETWORK_LADDER_LABELS.map((label, i) => (
            <li
              key={label}
              className="flex items-center gap-2 rounded-xl border border-kelly-text/10 bg-white/80 px-3 py-2 text-xs font-semibold text-kelly-text shadow-sm"
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-kelly-navy/10 text-[10px] font-bold text-kelly-navy">
                {i + 1}
              </span>
              <span>{label}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
