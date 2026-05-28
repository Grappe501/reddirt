import Link from "next/link";
import { loadKimHammerBriefingHub } from "@/lib/opposition/kimHammerModuleBriefings";
import { loadKimHammerEvidenceIndex } from "@/lib/opposition/kimHammerEvidenceIndex";

export function KimHammerBriefingHub() {
  const hub = loadKimHammerBriefingHub();
  const index = loadKimHammerEvidenceIndex();

  return (
    <div className="space-y-10">
      <section className="rounded-2xl border border-kelly-navy/20 bg-kelly-page/60 p-5 lg:p-6">
        <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">System posture</h2>
        <p className="mt-2 max-w-4xl text-sm leading-relaxed text-kelly-muted">
          Nested briefing architecture: every module below opens with a full summary narrative, then drill-down
          records. {index.metrics.totalClaims} governed claims · {index.metrics.exportReadyClaims} export-ready ·{" "}
          {index.retrievalTasks.length} retrieval tasks · {index.metrics.reviewNeededClaims} review-needed.
        </p>
      </section>

      {hub.domains.map((domain) => {
        const rollup = hub.domainRollups[domain.id];
        const modules = domain.moduleIds.map((id) => hub.moduleBriefings[id]).filter(Boolean);

        return (
          <section key={domain.id} id={domain.id} className="scroll-mt-6">
            <header className="mb-4 border-b border-kelly-text/10 pb-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-kelly-subtle">{domain.eyebrow}</p>
              <h2 className="font-heading text-xl font-bold text-kelly-navy">{domain.title}</h2>
              {rollup ? (
                <div className="mt-3 max-w-4xl space-y-2 text-sm leading-relaxed text-kelly-muted">
                  {rollup.paragraphs.slice(0, 2).map((p) => (
                    <p key={p.slice(0, 48)}>{p}</p>
                  ))}
                </div>
              ) : null}
            </header>

            <div className="grid gap-4 lg:grid-cols-2">
              {modules.map((briefing) => (
                <article
                  key={briefing.id}
                  className="flex flex-col rounded-xl border border-kelly-text/10 bg-white p-5 shadow-sm"
                >
                  <p className="text-[10px] font-bold uppercase tracking-wider text-kelly-subtle">{briefing.eyebrow}</p>
                  <h3 className="mt-1 font-heading text-lg font-bold text-kelly-navy">
                    <Link href={briefing.href} className="hover:underline">
                      {briefing.title}
                    </Link>
                  </h3>
                  <div className="mt-3 flex-1 space-y-3 text-xs leading-relaxed text-kelly-muted">
                    {briefing.paragraphs.slice(0, 3).map((p) => (
                      <p key={p.slice(0, 40)}>{p}</p>
                    ))}
                  </div>
                  {briefing.operatorTakeaway ? (
                    <p className="mt-3 text-[11px] font-medium text-kelly-navy">{briefing.operatorTakeaway}</p>
                  ) : null}
                  <Link
                    href={briefing.href}
                    className="mt-4 inline-block text-[11px] font-bold uppercase tracking-wider text-kelly-navy underline"
                  >
                    Open full module briefing →
                  </Link>
                </article>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
