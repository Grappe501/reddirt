import Link from "next/link";
import { composeMondayBriefViewModel } from "@/lib/victory-os/mission-brief/compose-monday-brief-view-model";
import { vos } from "./victory-os-ui/victory-os-tokens";

/** Compact Top 3 preview for AI Command Center — drives CM to Victory OS. */
export function MondayBriefPreviewStrip() {
  const vm = composeMondayBriefViewModel();
  const top3 = vm.brief.topDecisions.slice(0, 3);

  return (
    <section className={`${vos.glass} border-2 border-kelly-navy/15 p-6`}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className={vos.eyebrow}>Victory OS live</p>
          <h2 className="mt-1 font-heading text-xl font-bold text-kelly-navy">This week&apos;s Top 3 decisions</h2>
          <p className="mt-1 font-body text-sm text-kelly-muted">
            {vm.readiness.pending > 0
              ? `${vm.readiness.pending} awaiting CM approval · ${vm.electionCountdown.daysRemaining} days out`
              : `${vm.readiness.approvalPct}% approved · ${vm.electionCountdown.label}`}
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <Link href="/admin/victory-board" className={vos.btnSecondary}>
            Victory Board
          </Link>
          <Link href="/admin/mission-brief" className={vos.btnPrimary}>
            Monday brief
          </Link>
        </div>
      </div>
      <ol className="mt-4 grid gap-2 md:grid-cols-3">
        {top3.map((d) => (
          <li key={d.id} className={`${vos.card} !p-3`}>
            <p className="font-body text-[10px] font-bold uppercase text-kelly-copper">#{d.rank} {d.county}</p>
            <p className="mt-1 line-clamp-2 font-body text-xs font-semibold text-kelly-navy">{d.recommendation}</p>
            <p className="mt-1 font-body text-[10px] capitalize text-kelly-muted">{d.status} · {d.opsStatus} ops</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
