import Link from "next/link";
import {
  loadDebateIntelligenceV4Packet,
  findV4BillNarrative,
  findV4TimelineForBill,
  isInIntegrity2021,
} from "@/lib/intelligence/v4/debateIntelligenceV4";
import { getSurfaceGuide } from "@/lib/intelligence/v4/debateOperatorNarratives";
import { V4BackLinks, V4PageHeader } from "@/components/admin/intelligence/v4/V4PageHeader";
import { notFound } from "next/navigation";

export default function BillDetailV3Page({ billNumber }: { billNumber: string }) {
  const v4 = loadDebateIntelligenceV4Packet();
  const narrative = findV4BillNarrative(v4, billNumber);
  if (!narrative) notFound();

  const timelineHits = findV4TimelineForBill(v4, billNumber);
  const in2021 = isInIntegrity2021(v4, billNumber);
  const themeHits = v4.themeMatrix.filter((t) => t.bills.some((b) => b.toUpperCase() === billNumber.toUpperCase()));

  return (
    <div className="mx-auto max-w-7xl text-kelly-text">
      <V4PageHeader
        eyebrow="Bill drill-down · v4"
        title={billNumber}
        description={narrative.plainEnglishSummary}
        guide={getSurfaceGuide("billDrilldown")}
      >
        <V4BackLinks />
        <Link
          href="/admin/intelligence/kim-hammer/debate-prep"
          className="rounded-full border border-violet-800/30 px-3 py-1 text-xs font-bold text-violet-950"
        >
          Debate prep
        </Link>
      </V4PageHeader>

      {(in2021 || themeHits.length > 0) && (
        <section className="mb-4 flex flex-wrap gap-2">
          {in2021 ? (
            <span className="rounded-full bg-violet-100 px-3 py-1 text-[10px] font-bold uppercase text-violet-950">
              2021 integrity foundation package
            </span>
          ) : null}
          {themeHits.map((t) => (
            <span key={t.theme} className="rounded-full border border-kelly-navy/20 px-3 py-1 text-[10px] font-bold text-kelly-navy">
              {t.label}
            </span>
          ))}
        </section>
      )}

      <section className="mb-4 rounded-xl border border-amber-200/50 bg-amber-50/40 p-4">
        <h2 className="text-sm font-bold uppercase text-amber-950">Office-stacking contrast (research discipline)</h2>
        <p className="mt-2 text-xs text-amber-950">
          This raises a research question about whether successive election-law changes compound county implementation
          burden without added state support. Frame as operational impact and verified act text — not motive or fraud
          claims without sources.
        </p>
        {in2021 ? (
          <p className="mt-2 text-xs text-violet-950">
            This bill is part of the 2021 integrity foundation package — use package briefing when Hammer portrays later
            sessions as a new pivot.
          </p>
        ) : null}
      </section>

      {timelineHits.length > 0 ? (
        <section className="mb-4 rounded-xl border border-sky-100 bg-sky-50/40 p-4">
          <h2 className="text-sm font-bold uppercase text-sky-900">Timeline</h2>
          <ul className="mt-2 space-y-2 text-xs text-sky-950">
            {timelineHits.map((t) => (
              <li key={`${t.year}-${t.billOrAct}`}>
                <span className="font-bold">{t.year}</span> · {t.billOrAct} ({t.hammerRole}): {t.whatChanged}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

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

          {in2021 && v4.integrity2021 ? (
            <section className="mb-4 rounded-xl border border-violet-200/50 bg-violet-50/30 p-4">
              <h2 className="text-sm font-bold uppercase text-violet-950">2021 package strategic briefing</h2>
              <ul className="mt-2 list-inside list-disc text-xs text-violet-950">
                <li>{v4.integrity2021.strategicBriefing.howToMessage}</li>
                <li>{v4.integrity2021.strategicBriefing.debateImpact}</li>
                <li className="text-amber-900">When not to use: {v4.integrity2021.strategicBriefing.whenNotToUse}</li>
              </ul>
            </section>
          ) : null}

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
    </div>
  );
}
