import Link from "next/link";
import type { ExecutiveSummary } from "@/lib/dashboard-orchestration/executive-summary-builder";

export function ExecutiveSummaryStrip({ summary }: { summary: ExecutiveSummary }) {
  return (
    <section className="os-card border-kelly-navy/15 bg-gradient-to-br from-kelly-navy/[0.05] to-[var(--color-surface-elevated)] p-5" aria-label="Executive summary">
      <p className="os-eyebrow">Executive summary</p>
      <h2 className="mt-1 font-heading text-lg font-bold text-kelly-navy">{summary.headline}</h2>
      <p className="mt-2 os-body-muted text-xs">{summary.aiExplanation}</p>
      <p className="mt-1 text-xs italic text-kelly-subtle">{summary.calmNote}</p>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <SummaryColumn title="What matters" items={summary.whatMatters} tone="neutral" />
        <SummaryColumn title="Blocked" items={summary.blocked} tone="warn" emptyLabel="Nothing blocking in snapshot" />
        <SummaryColumn title="Ready / action" items={[...summary.ready, ...summary.needsAction]} tone="ok" emptyLabel="Review open queues" />
      </div>

      {summary.topNextMove ? (
        <div className="mt-4 flex flex-wrap items-center gap-3 rounded-xl border border-kelly-navy/20 bg-kelly-page px-4 py-3">
          <div className="min-w-0 flex-1">
            <p className="os-stat-label">Top next move</p>
            <p className="text-sm font-bold text-kelly-navy">{summary.topNextMove.label}</p>
            <p className="os-stat-hint">{summary.topNextMove.why}</p>
          </div>
          <Link href={summary.topNextMove.href} className="shrink-0 rounded-full bg-kelly-navy px-4 py-2 text-xs font-bold text-kelly-inverse">
            Go →
          </Link>
        </div>
      ) : null}
    </section>
  );
}

function SummaryColumn({
  title,
  items,
  tone,
  emptyLabel,
}: {
  title: string;
  items: string[];
  tone: "neutral" | "warn" | "ok";
  emptyLabel?: string;
}) {
  const border =
    tone === "warn" ? "border-amber-300/70" : tone === "ok" ? "border-emerald-300/60" : "border-kelly-border";
  return (
    <div className={`rounded-xl border ${border} bg-kelly-page p-3`}>
      <p className="os-stat-label">{title}</p>
      <ul className="mt-2 space-y-1 text-xs text-kelly-muted">
        {items.length === 0 ? <li className="text-kelly-subtle">{emptyLabel}</li> : null}
        {items.map((item) => (
          <li key={item}>• {item}</li>
        ))}
      </ul>
    </div>
  );
}
