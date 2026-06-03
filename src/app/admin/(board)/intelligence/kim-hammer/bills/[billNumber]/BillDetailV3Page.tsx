import Link from "next/link";
import { loadDebateIntelligenceV3Packet, findV3BillNarrative } from "@/lib/intelligence/v3/debateIntelligenceV3";
import { V3BackLinks, V3PageHeader } from "@/components/admin/intelligence/v3/V3PageHeader";
import { notFound } from "next/navigation";

export default function BillDetailV3Page({ billNumber }: { billNumber: string }) {
  const v3 = loadDebateIntelligenceV3Packet();
  const narrative = findV3BillNarrative(v3, billNumber);
  const row = v3.hub.bills.find((b) => b.billNumber.toUpperCase() === billNumber.toUpperCase());
  if (!narrative && !row) notFound();

  return (
    <div className="mx-auto max-w-7xl text-kelly-text">
      <V3PageHeader
        eyebrow="Bill drill-down · v3"
        title={billNumber}
        description={narrative?.plainEnglishSummary ?? row?.title ?? "Bill record"}
      >
        <V3BackLinks />
      </V3PageHeader>

      {narrative ? (
        <>
          <section className="mb-4 rounded-xl border border-kelly-text/10 bg-white p-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">Legislative narrative</h2>
            <p className="mt-2 text-sm text-kelly-muted">{narrative.billNarrative}</p>
            <p className="mt-2 text-xs text-kelly-muted">County impact: {narrative.countyImpactNarrative}</p>
            <p className="mt-2 text-[10px] uppercase text-kelly-subtle">
              Risk: {narrative.publicationRisk} · Act {narrative.actNumber ?? "—"}
            </p>
          </section>

          <section className="mb-4 grid gap-4 lg:grid-cols-3">
            <div className="rounded-xl border border-emerald-100 bg-emerald-50/40 p-4 text-xs">
              <p className="font-bold uppercase text-emerald-900">Kelly frame</p>
              <p className="mt-2 text-emerald-950">{narrative.debateFrames.kellyFrame}</p>
            </div>
            <div className="rounded-xl border border-rose-100 bg-rose-50/40 p-4 text-xs">
              <p className="font-bold uppercase text-rose-900">Likely Hammer frame</p>
              <p className="mt-2 text-rose-950">{narrative.debateFrames.hammerFrame}</p>
            </div>
            <div className="rounded-xl border border-sky-100 bg-sky-50/40 p-4 text-xs">
              <p className="font-bold uppercase text-sky-900">County frame</p>
              <p className="mt-2 text-sky-950">{narrative.debateFrames.countyFrame}</p>
            </div>
          </section>

          <section className="mb-4 grid gap-4 lg:grid-cols-2">
            <div className="rounded-xl border border-kelly-text/10 bg-white p-4">
              <h2 className="text-sm font-bold uppercase text-kelly-navy">Counter-arguments</h2>
              <ul className="mt-2 list-inside list-disc text-xs text-kelly-muted">
                {narrative.counterArguments.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </div>
            <div className="rounded-xl border border-kelly-text/10 bg-white p-4">
              <h2 className="text-sm font-bold uppercase text-kelly-navy">Supporter arguments (balance)</h2>
              <ul className="mt-2 list-inside list-disc text-xs text-kelly-muted">
                {narrative.supporterArguments.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </div>
          </section>

          <section className="rounded-xl border border-violet-200/40 bg-violet-50/30 p-4">
            <h2 className="text-sm font-bold uppercase text-violet-950">Strategic briefing</h2>
            <ul className="mt-2 list-inside list-disc text-xs text-violet-950">
              <li>How to message: {narrative.strategicBriefing.howToMessage}</li>
              <li>Debate impact: {narrative.strategicBriefing.debateImpact}</li>
              <li>When to use: {narrative.strategicBriefing.whenToUse}</li>
              <li className="text-amber-900">When not to use: {narrative.strategicBriefing.whenNotToUse}</li>
            </ul>
          </section>
        </>
      ) : (
        <p className="text-sm text-kelly-muted">Narrative card not found — showing index row only.</p>
      )}
    </div>
  );
}
