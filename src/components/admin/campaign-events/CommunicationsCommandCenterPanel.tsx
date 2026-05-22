import Link from "next/link";
import type { CommunicationsBundle } from "@/lib/campaign-events/communications/load-communications-bundle";

export function CommunicationsCommandCenterPanel({ bundle }: { bundle: CommunicationsBundle }) {
  const r = bundle.readiness;
  return (
    <section className="rounded-2xl border border-kelly-navy/15 bg-white/80 p-5">
      <p className="text-[10px] font-bold uppercase tracking-wider text-kelly-slate">Communications</p>
      <h2 className="mt-1 font-heading text-lg font-bold text-kelly-navy">Email & contact readiness</h2>
      <dl className="mt-3 grid gap-2 text-xs sm:grid-cols-2">
        <div>
          <dt className="font-bold">SendGrid</dt>
          <dd>{r.sendGrid.broadcastAllowed ? "Broadcast configured" : "Incomplete"}</dd>
        </div>
        <div>
          <dt className="font-bold">Sources (unified)</dt>
          <dd>{bundle.unifiedSourceCount}</dd>
        </div>
        <div>
          <dt className="font-bold">Templates</dt>
          <dd>{bundle.templates.length}</dd>
        </div>
        <div>
          <dt className="font-bold">Mass email</dt>
          <dd className="text-amber-800">{bundle.massEmailStatus}</dd>
        </div>
      </dl>
      {bundle.risks[0] ? <p className="mt-2 text-[10px] text-kelly-text/55">Top risk: {bundle.risks[0]}</p> : null}
      <Link href="/admin/communications" className="mt-3 inline-block text-xs font-bold text-kelly-navy underline">
        Open communications center →
      </Link>
    </section>
  );
}
