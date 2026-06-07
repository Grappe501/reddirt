import Link from "next/link";
import type { Phase11P1UpgradePassReport } from "@/lib/intelligence/v4/phase11KellyStrategicPlanClosure";
import type { KellyStrategicPlanChapterSurface } from "@/lib/intelligence/v4/phase11KellyStrategicPlanClosure";
import { getKellyStrategicPlanChapterOverlay } from "@/lib/intelligence/v4/phase11KellyStrategicPlanDepth";

export function Phase11P1UpgradePassPanel({
  report,
  compact,
}: {
  report: Phase11P1UpgradePassReport;
  compact?: boolean;
}) {
  const p = report.progress;

  return (
    <section
      className={`rounded-xl border-2 border-emerald-300/80 bg-gradient-to-br from-emerald-50/50 to-white ${compact ? "mb-6 p-4" : "mb-8 p-6"}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-emerald-950">Upgrade pass 11 · P1</p>
          <h2 className="mt-1 font-heading text-xl font-bold text-kelly-navy">{report.title}</h2>
          {!compact ? <p className="mt-2 text-sm text-kelly-muted">{report.summary}</p> : null}
        </div>
        <div className="text-right">
          <p className="font-heading text-3xl font-bold text-emerald-950">{report.completionPct}%</p>
          <p className="text-[10px] font-bold uppercase text-kelly-subtle">
            {p.chaptersAtBar}/{p.chapterTotal} chapters enriched
          </p>
        </div>
      </div>

      <div className="mt-4 h-2 overflow-hidden rounded-full bg-white">
        <div
          className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-kelly-gold"
          style={{ width: `${report.completionPct}%` }}
        />
      </div>

      <dl className={`mt-4 grid gap-2 ${compact ? "grid-cols-2 text-xs" : "grid-cols-2 md:grid-cols-4 text-sm"}`}>
        <div className="rounded-lg border border-kelly-text/10 bg-white px-3 py-2">
          <dt className="text-[10px] font-bold uppercase text-kelly-subtle">Chapters</dt>
          <dd className="font-bold text-kelly-navy">
            {p.chaptersAtBar}/{p.chapterTotal}
          </dd>
        </div>
        <div className="rounded-lg border border-kelly-text/10 bg-white px-3 py-2">
          <dt className="text-[10px] font-bold uppercase text-kelly-subtle">Canon</dt>
          <dd className="font-bold text-kelly-navy">{p.canonBindingReady ? "Bound" : "Open"}</dd>
        </div>
        <div className="rounded-lg border border-kelly-text/10 bg-white px-3 py-2">
          <dt className="text-[10px] font-bold uppercase text-kelly-subtle">Migration</dt>
          <dd className="font-bold text-kelly-navy">{p.migrationRouteBound ? "Wired" : "Open"}</dd>
        </div>
        <div className="rounded-lg border border-kelly-text/10 bg-white px-3 py-2">
          <dt className="text-[10px] font-bold uppercase text-kelly-subtle">Routes</dt>
          <dd className="font-bold text-kelly-navy">{p.strategyMigrationRoutes}</dd>
        </div>
      </dl>
    </section>
  );
}

export function KellyStrategicPlanChapterInventoryPanel({ chapters }: { chapters: KellyStrategicPlanChapterSurface[] }) {
  return (
    <section className="mb-8 space-y-3">
      {chapters.map((ch) => {
        const overlay = getKellyStrategicPlanChapterOverlay(ch.pathKey);
        return (
          <article key={ch.pathKey} className="rounded-xl border border-emerald-100 bg-white p-4 text-sm">
            <Link href={ch.href} className="font-bold text-kelly-navy underline">
              {ch.title}
            </Link>
            <p className="mt-1 text-xs text-kelly-muted">{overlay.strategicRole}</p>
            <ul className="mt-2 list-inside list-disc text-xs text-kelly-muted">
              {overlay.debateApplication.slice(0, 2).map((line) => (
                <li key={line.slice(0, 40)}>{line}</li>
              ))}
            </ul>
          </article>
        );
      })}
    </section>
  );
}
