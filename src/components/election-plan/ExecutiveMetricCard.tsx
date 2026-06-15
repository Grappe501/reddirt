import { cn } from "@/lib/utils";

type Props = {
  label: string;
  value: string;
  detail?: string;
  variant?: "hero" | "card";
  className?: string;
};

export function ExecutiveMetricCard({ label, value, detail, variant = "card", className }: Props) {
  if (variant === "hero") {
    return (
      <div className={cn("ep-metric-card", className)}>
        <div className="ep-metric-value">{value}</div>
        <div className="ep-metric-label">{label}</div>
        {detail ? <div className="mt-1 text-xs text-white/50">{detail}</div> : null}
      </div>
    );
  }

  return (
    <div className={cn("ep-card text-center", className)}>
      <div className="font-heading text-2xl font-bold text-[var(--ep-navy)]">{value}</div>
      <div className="mt-1 text-xs font-medium uppercase tracking-wide text-[var(--ep-navy-muted)]">{label}</div>
      {detail ? <div className="mt-1 text-xs text-[var(--ep-navy-muted)]">{detail}</div> : null}
    </div>
  );
}
