import Link from "next/link";
import type { computePhase19UpgradePass } from "@/lib/intelligence/v4/phase19ProfessorShowcaseClosure";
import { SEARCH_AI_PREP_HUB_HREF } from "@/lib/intelligence/v4/phase19ProfessorShowcaseClosure";
import { ShowcaseHeroBanner, ShowcaseGoldRule } from "@/components/admin/intelligence/v4/ProfessorSeminarShowcase";

type Report = ReturnType<typeof computePhase19UpgradePass>;

export function Phase19UpgradePassPanel({ report, compact }: { report: Report; compact?: boolean }) {
  const p = report.progress;
  return (
    <section className={compact ? "mb-6 space-y-4" : "mb-8 space-y-5"}>
      {!compact ? <ShowcaseHeroBanner /> : null}
      <div className="overflow-hidden rounded-2xl border-2 border-kelly-gold/40 bg-white shadow-xl">
        <div className="bg-seminar-hall px-5 py-4 text-white">
          <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-kelly-gold">Upgrade pass 19 · Showcase v6</p>
          <h2 className="mt-1 font-heading text-xl font-bold">{report.title}</h2>
          {!compact ? <p className="mt-2 text-sm text-white/85">{report.summary}</p> : null}
        </div>
        <div className="p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="font-heading text-4xl font-bold text-kelly-navy">{report.completionPct}%</p>
            <p className="text-[10px] font-bold uppercase text-kelly-subtle">
              {p.checkpointsAtBar}/{p.checkpointTotal} checkpoints · {p.version}
            </p>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-violet-100">
            <div
              className="h-full rounded-full bg-gradient-to-r from-kelly-navy via-violet-600 to-kelly-gold"
              style={{ width: `${report.completionPct}%` }}
            />
          </div>
          <ShowcaseGoldRule className="my-4" />
          <ul className="space-y-1.5 text-sm">
            {report.checkpoints.map((c) => (
              <li key={c.id} className="flex items-center gap-2">
                <span className={c.atBar ? "text-emerald-600" : "text-rose-600"}>{c.atBar ? "✓" : "✗"}</span>
                <span className="text-kelly-muted">{c.id}</span>
              </li>
            ))}
          </ul>
          {!compact ? (
            <Link
              href={SEARCH_AI_PREP_HUB_HREF}
              className="mt-4 inline-flex rounded-full border-2 border-kelly-gold bg-kelly-navy px-4 py-2 text-xs font-bold text-white"
            >
              Search & AI prep hub →
            </Link>
          ) : null}
        </div>
      </div>
    </section>
  );
}
