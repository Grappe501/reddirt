import Link from "next/link";
import type { Phase10UpgradePassReport } from "@/lib/intelligence/v4/phase10StrategyPhilosophyClosure";
import type { StrategyPhilosophySurface } from "@/lib/intelligence/v4/strategyPhilosophyInventory";

export function Phase10UpgradePassPanel({
  report,
  compact,
}: {
  report: Phase10UpgradePassReport;
  compact?: boolean;
}) {
  const p = report.progress;

  return (
    <section
      className={`rounded-xl border-2 border-indigo-300/80 bg-gradient-to-br from-indigo-50/50 to-white ${compact ? "mb-6 p-4" : "mb-8 p-6"}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-indigo-950">Upgrade pass 10</p>
          <h2 className="mt-1 font-heading text-xl font-bold text-kelly-navy">{report.title}</h2>
          {!compact ? <p className="mt-2 text-sm text-kelly-muted">{report.summary}</p> : null}
        </div>
        <div className="text-right">
          <p className="font-heading text-3xl font-bold text-indigo-950">{report.completionPct}%</p>
          <p className="text-[10px] font-bold uppercase text-kelly-subtle">
            {p.inventorySurfaceCount} surfaces inventoried
          </p>
        </div>
      </div>

      <div className="mt-4 h-2 overflow-hidden rounded-full bg-white">
        <div
          className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-kelly-gold"
          style={{ width: `${report.completionPct}%` }}
        />
      </div>

      <dl className={`mt-4 grid gap-2 ${compact ? "grid-cols-2 text-xs" : "grid-cols-2 md:grid-cols-4 text-sm"}`}>
        <div className="rounded-lg border border-kelly-text/10 bg-white px-3 py-2">
          <dt className="text-[10px] font-bold uppercase text-kelly-subtle">Philosophy briefings</dt>
          <dd className="font-bold text-kelly-navy">
            {p.philosophyBriefingsAtBar}/{p.philosophyBriefingTotal}
          </dd>
        </div>
        <div className="rounded-lg border border-kelly-text/10 bg-white px-3 py-2">
          <dt className="text-[10px] font-bold uppercase text-kelly-subtle">Psychology manual</dt>
          <dd className="font-bold text-kelly-navy">
            {p.psychologySectionsAtBar}/{p.psychologySectionTotal}
          </dd>
        </div>
        <div className="rounded-lg border border-kelly-text/10 bg-white px-3 py-2">
          <dt className="text-[10px] font-bold uppercase text-kelly-subtle">Philosophy graph</dt>
          <dd className="font-bold text-kelly-navy">
            {p.philosophyGraphNodesAtBar}/{p.philosophyGraphNodeTotal}
          </dd>
        </div>
        <div className="rounded-lg border border-kelly-text/10 bg-white px-3 py-2">
          <dt className="text-[10px] font-bold uppercase text-kelly-subtle">Strategy routes</dt>
          <dd className="font-bold text-kelly-navy">{p.strategyMigrationRoutes} bound</dd>
        </div>
      </dl>
    </section>
  );
}

export function StrategyPhilosophyInventoryPanel({ surfaces }: { surfaces: StrategyPhilosophySurface[] }) {
  const groups = [
    { label: "Debate philosophy briefings", kind: "philosophy-briefing" as const },
    { label: "Psychology manual", kind: "psychology-manual" as const },
    { label: "Civic philosophy graph", kind: "philosophy-graph" as const },
    { label: "Kelly strategic plan manual", kind: "kelly-manual" as const },
    { label: "Intelligence strategy surfaces", kind: "intelligence-strategy" as const },
    { label: "Opposition strategy", kind: "opposition-strategy" as const },
  ];

  return (
    <section className="mb-8 space-y-6">
      {groups.map((group) => {
        const items = surfaces.filter((s) => s.kind === group.kind);
        if (!items.length) return null;
        return (
          <div key={group.kind} className="rounded-xl border border-kelly-navy/15 bg-white p-6">
            <h2 className="font-heading text-lg font-bold text-kelly-navy">
              {group.label} ({items.length})
            </h2>
            <ul className="mt-3 grid gap-2 md:grid-cols-2">
              {items.map((item) => (
                <li key={item.id} className="rounded-lg border border-kelly-text/10 px-3 py-2 text-sm">
                  <Link href={item.href} className="font-semibold text-kelly-navy underline">
                    {item.title}
                  </Link>
                  <p className="mt-1 text-xs text-kelly-muted">{item.summary.slice(0, 120)}</p>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </section>
  );
}
