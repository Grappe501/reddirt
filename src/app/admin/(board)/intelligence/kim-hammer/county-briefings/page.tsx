import Link from "next/link";
import { KimHammerBriefingPageShell } from "../KimHammerBriefingPageShell";
import { loadCountyBriefingIntelligenceIndex } from "@/lib/intelligence/countyBriefingIntelligence";

function bandTone(band: string): string {
  if (band === "STRONG") return "text-emerald-700";
  if (band === "MODERATE") return "text-amber-700";
  if (band === "BLOCKED") return "text-rose-700";
  return "text-kelly-muted";
}

export default async function KimHammerCountyBriefingsIndexPage() {
  const index = loadCountyBriefingIntelligenceIndex();

  return (
    <KimHammerBriefingPageShell moduleId="county-briefings">
      <section className="mb-4 rounded-xl border border-kelly-text/10 bg-white p-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">NSI-5 · County briefing index</h2>
        <p className="mt-2 text-xs text-kelly-muted">
          Read-only county-specific campaign intelligence composing NSI-2 geographic state, NSI-4 civic intelligence,
          SDI-1 doctrine alignment, export history, and citation health — aggregate only, no voter-level targeting.
        </p>
        <p className="mt-2 text-xs text-kelly-muted">
          {index.countyCount} counties/regions tracked · Generated {index.generatedAt.slice(0, 10)}
        </p>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {index.cards.map((card) => (
          <article key={card.countyId} className="rounded-xl border border-kelly-text/10 bg-white p-4 text-xs">
            <p className="text-[10px] font-bold uppercase tracking-wider text-kelly-subtle">{card.region}</p>
            <h3 className="mt-1 font-heading text-lg font-bold text-kelly-navy">{card.countyName}</h3>
            <p className={`mt-1 font-semibold ${bandTone(card.confidenceBand)}`}>
              Confidence: {card.confidenceBand} · Risk: {card.localRiskLevel}
            </p>
            <ul className="mt-2 space-y-1 text-kelly-muted">
              <li>Top narrative: {card.topNarrativeTitle}</li>
              <li>Top bill: {card.topOpponentBill ?? "—"}</li>
              <li>Open research: {card.openResearchCount}</li>
              <li>Export-ready points: {card.exportReadyTalkingPointCount}</li>
              <li>Blocked narratives: {card.blockedNarrativeCount}</li>
            </ul>
            <p className="mt-2 text-[10px] text-kelly-subtle">
              {card.primarySignal.replaceAll("_", " ")}: {card.primarySignalText.slice(0, 100)}
            </p>
            <Link
              href={`/admin/intelligence/kim-hammer/counties/${encodeURIComponent(card.countyId)}`}
              className="mt-3 inline-block font-semibold text-kelly-navy underline"
            >
              Open county briefing →
            </Link>
          </article>
        ))}
      </section>
    </KimHammerBriefingPageShell>
  );
}
