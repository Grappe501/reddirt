import Link from "next/link";
import { composeMondayBriefViewModel } from "@/lib/victory-os/mission-brief/compose-monday-brief-view-model";

/** Compact Top 3 preview for AI Command Center — drives CM to Monday Brief. */
export function MondayBriefPreviewStrip() {
  const vm = composeMondayBriefViewModel();
  const top3 = vm.brief.topDecisions.slice(0, 3);

  return (
    <section className="rounded-3xl border-2 border-kelly-navy/25 bg-gradient-to-r from-kelly-navy/[0.06] to-amber-500/[0.08] p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="font-body text-[10px] font-bold uppercase tracking-[0.28em] text-kelly-slate">Monday brief live</p>
          <h2 className="mt-1 font-heading text-xl font-bold text-kelly-navy">This week&apos;s Top 3 decisions</h2>
          <p className="mt-1 font-body text-sm text-kelly-muted">
            {vm.readiness.pending > 0
              ? `${vm.readiness.pending} awaiting CM approval · ${vm.electionCountdown.daysRemaining} days out`
              : `${vm.readiness.approvalPct}% approved · ${vm.electionCountdown.label}`}
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <Link
            href="/admin/victory-board"
            className="rounded-full border border-kelly-navy/30 bg-white px-5 py-3 text-sm font-bold text-kelly-navy shadow-sm hover:bg-kelly-page/80"
          >
            Victory Board
          </Link>
          <Link
            href="/admin/mission-brief"
            className="rounded-full bg-kelly-navy px-6 py-3 text-sm font-bold text-white shadow-sm hover:bg-kelly-slate"
          >
            Open Monday Brief
          </Link>
        </div>
      </div>
      <ol className="mt-4 grid gap-2 md:grid-cols-3">
        {top3.map((d) => (
          <li key={d.id} className="rounded-xl border border-kelly-text/10 bg-white/90 p-3">
            <p className="font-body text-[10px] font-bold uppercase text-kelly-muted">#{d.rank} {d.county}</p>
            <p className="mt-1 line-clamp-2 font-body text-xs font-semibold text-kelly-navy">{d.recommendation}</p>
            <p className="mt-1 font-body text-[10px] capitalize text-kelly-muted">{d.status} · {d.opsStatus} ops</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
