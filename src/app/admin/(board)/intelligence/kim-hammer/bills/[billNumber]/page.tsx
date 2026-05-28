import { KimHammerBriefingPageShell } from "../../KimHammerBriefingPageShell";
import { notFound } from "next/navigation";
import { findKimHammerBill } from "@/lib/opposition/kimHammerWorkbench";
import { resolveKimHammerBillNarrative } from "@/lib/opposition/kimHammerLegislativeNarratives";
import { loadKimHammerKh2Workbench } from "@/lib/opposition/kimHammerKh2Workbench";
import { computeKimHammerBillCivicIntelligence } from "@/lib/intelligence/kimHammerBillCivicIntelligence";
import { resolveMessagingGuidance } from "@/lib/intelligence/campaignMessagingIntelligence";
import { KimHammerBillCivicIntelligencePanel } from "../../KimHammerBillCivicIntelligencePanel";

type Props = {
  params: Promise<{ billNumber: string }>;
};

export default async function KimHammerBillDetailPage({ params }: Props) {
  const { billNumber } = await params;
  const bill = findKimHammerBill(billNumber);
  const kh2 = loadKimHammerKh2Workbench();
  if (!bill) notFound();

  const narrative = resolveKimHammerBillNarrative(bill);
  const debateProfileEntry = kh2.debateProfile.entries.find((entry) =>
    entry.supportingFacts.some((fact) => fact.toUpperCase().includes(bill.billNumber.toUpperCase())),
  );
  const civic = computeKimHammerBillCivicIntelligence(bill);
  const messaging = resolveMessagingGuidance(bill);

  return (
    <KimHammerBriefingPageShell moduleId="themes" billNumber={billNumber}>
      <section className="mb-4 rounded-xl border border-kelly-text/10 bg-white p-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">1) Bill Identity</h2>
        <ul className="mt-2 list-inside list-disc text-xs text-kelly-muted">
          <li>Bill number: {bill.billNumber}</li>
          <li>Act number: {bill.actNumber ?? "MISSING"}</li>
          <li>Session/year: {bill.sessionYear}</li>
          <li>Status/final disposition: {bill.status}; {bill.finalDisposition}</li>
          <li>Hammer role: {bill.hammerRole}</li>
          <li>Package: {narrative.packageId ?? "—"}</li>
          <li>Evidence tier: {narrative.evidenceTier} · Publication risk: {narrative.publicationRisk}</li>
        </ul>
      </section>

      <section className="mb-4 rounded-xl border border-kelly-text/10 bg-white p-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">2) Plain-English Summary</h2>
        <p className="mt-2 text-xs text-kelly-muted">{narrative.plainEnglishSummary}</p>
        <p className="mt-2 text-xs text-kelly-muted">{narrative.billNarrative}</p>
      </section>

      <section className="mb-4 grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-kelly-text/10 bg-white p-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">3) County impact</h2>
          <p className="mt-2 text-xs text-kelly-muted">{narrative.countyImpactNarrative}</p>
          <p className="mt-2 text-xs text-kelly-muted">{narrative.operationalBurdenNarrative}</p>
        </div>
        <div className="rounded-xl border border-kelly-text/10 bg-white p-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">4) Voter / citizen impact</h2>
          <ul className="mt-2 list-inside list-disc text-xs text-kelly-muted">
            <li>Ballot access: {bill.ballotAccessImpact}</li>
            <li>Direct democracy: {bill.directDemocracyImpact}</li>
            <li>Voter process: {bill.voterAccessImpact}</li>
            <li>Enforcement: {bill.enforcementImpact}</li>
          </ul>
        </div>
      </section>

      <section className="mb-4 rounded-xl border border-kelly-text/10 bg-white p-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">5) Debate frames</h2>
        <ul className="mt-2 list-inside list-disc text-xs text-kelly-muted">
          {narrative.debateFrames.map((frame) => (
            <li key={frame.slice(0, 48)}>{frame}</li>
          ))}
        </ul>
      </section>

      <section className="mb-4 grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-kelly-text/10 bg-white p-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">Counter-arguments (balance)</h2>
          <ul className="mt-2 list-inside list-disc text-xs text-kelly-muted">
            {narrative.counterArguments.map((item) => (
              <li key={item.slice(0, 40)}>{item}</li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl border border-kelly-text/10 bg-white p-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">Supporter arguments (expect in debate)</h2>
          <ul className="mt-2 list-inside list-disc text-xs text-kelly-muted">
            {narrative.supporterArguments.map((item) => (
              <li key={item.slice(0, 40)}>{item}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mb-4 rounded-xl border border-kelly-text/10 bg-white p-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">6) Legacy index impacts</h2>
        <ul className="mt-2 list-inside list-disc text-xs text-kelly-muted">
          <li>SOS duties: {bill.secretaryOfStateDutyImpact}</li>
          <li>County admin (index): {bill.countyAdministrationImpact}</li>
          {debateProfileEntry ? <li>KH-2 profile anchor: {debateProfileEntry.bridgeLine}</li> : null}
        </ul>
      </section>

      <section className="rounded-xl border border-kelly-text/10 bg-white p-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">7) Source appendix</h2>
        <ul className="mt-2 list-inside list-disc text-xs text-kelly-muted">
          {[...new Set([...narrative.sourceLinks, ...bill.sourceLinks])].map((source) => (
            <li key={source}>
              {source.startsWith("http") ? (
                <a className="text-kelly-navy underline" href={source} target="_blank" rel="noreferrer">
                  {source}
                </a>
              ) : (
                source
              )}
            </li>
          ))}
        </ul>
        <ul className="mt-3 list-inside list-disc text-[10px] text-kelly-subtle">
          {narrative.governanceNotes.map((note) => (
            <li key={note.slice(0, 40)}>{note}</li>
          ))}
        </ul>
      </section>

      <KimHammerBillCivicIntelligencePanel civic={civic} />

      <section className="mb-4 rounded-xl border border-indigo-200/40 bg-indigo-50/30 p-4 text-xs">
        <h2 className="text-sm font-bold uppercase tracking-wider text-indigo-950">Messaging intelligence summary</h2>
        <p className="mt-2 text-indigo-900">{messaging.messagingRiskSummary}</p>
        <ul className="mt-2 list-inside list-disc text-indigo-900/90">
          {messaging.doctrineSafeFrames.slice(0, 4).map((frame) => (
            <li key={frame}>Doctrine-safe: {frame}</li>
          ))}
        </ul>
      </section>
    </KimHammerBriefingPageShell>
  );
}
