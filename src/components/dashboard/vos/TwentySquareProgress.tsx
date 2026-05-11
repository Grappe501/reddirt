/**
 * Reusable 20-square progress strip (5% per ■). Pass `percent` 0–100.
 */
export function TwentySquareProgress({
  label,
  percent,
  caption,
  filledChar = "■",
  emptyChar = "□",
  className = "",
}: {
  label: string;
  /** 0–100 */
  percent: number;
  caption?: string;
  filledChar?: string;
  emptyChar?: string;
  className?: string;
}) {
  const p = Math.max(0, Math.min(100, Math.round(percent)));
  const filled = Math.round((p / 100) * 20);
  const squares = Array.from({ length: 20 }, (_, i) => (i < filled ? filledChar : emptyChar)).join(" ");

  return (
    <div className={className}>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="font-body text-[11px] font-bold uppercase tracking-wide text-kelly-text/55">{label}</p>
        <p className="font-mono text-xs font-semibold text-kelly-navy">
          {filled}/20 · {p}%
        </p>
      </div>
      <p className="mt-1.5 font-mono text-sm leading-relaxed tracking-tight text-kelly-deep" aria-label={`${label} ${p} percent`}>
        {squares}
      </p>
      {caption ? <p className="mt-1 font-body text-[11px] text-kelly-text/65">{caption}</p> : null}
    </div>
  );
}
