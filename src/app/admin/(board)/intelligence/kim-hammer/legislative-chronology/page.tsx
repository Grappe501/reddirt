import { KimHammerBriefingPageShell } from "../KimHammerBriefingPageShell";
import { loadKimHammerLegislativeChronology } from "@/lib/opposition/kimHammerLegislativeNarratives";

export default async function KimHammerLegislativeChronologyPage() {
  const chronology = loadKimHammerLegislativeChronology();

  return (
    <KimHammerBriefingPageShell moduleId="legislative-chronology">
      <section className="mb-4 rounded-xl border border-kelly-text/10 bg-white p-4 text-xs">
        <p className="text-kelly-muted">{chronology.tenureNote}</p>
      </section>

      <section className="space-y-4">
        {chronology.years.map((year) => (
          <article key={year.year} className="rounded-xl border border-kelly-text/10 bg-white p-4 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-bold text-kelly-navy">{year.year}</h2>
              <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold">{year.office}</span>
              <span className="rounded bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-900">
                {year.evidenceStatus.replaceAll("_", " ")}
              </span>
            </div>
            <p className="mt-2 text-kelly-muted">
              Primary sponsor: {year.primarySponsorCount} · Co-sponsor: {year.coSponsorCount} · Election-related:{" "}
              {year.electionRelatedSponsorCount}
            </p>
            <p className="mt-2 text-kelly-muted">{year.narrativeSummary}</p>
            {year.enactedElectionBillNumbers.length > 0 ? (
              <p className="mt-2 text-[10px] text-kelly-subtle">
                Election bills (sample): {year.enactedElectionBillNumbers.slice(0, 12).join(", ")}
                {year.enactedElectionBillNumbers.length > 12 ? "…" : ""}
              </p>
            ) : null}
          </article>
        ))}
      </section>
    </KimHammerBriefingPageShell>
  );
}
