import { ComplianceCard, ComplianceNav, CompliancePageHeader, StorageModeNotice } from "../components";
import { runComplianceFinalizationReport } from "@/lib/compliance/ai/finalization-agent/run-compliance-finalization";
import { buildComplianceExecutiveScore } from "@/lib/compliance/scoring/compliance-score";
import { checkComplianceStorageHealth } from "@/lib/compliance/storage/storage-health";
import { assessDbPersistenceReadiness } from "@/lib/compliance/persistence/db-readiness";

export const dynamic = "force-dynamic";

export default async function ComplianceExecutivePage() {
  const [finalization, executive, storage, db] = await Promise.all([
    runComplianceFinalizationReport(),
    buildComplianceExecutiveScore(),
    checkComplianceStorageHealth(),
    assessDbPersistenceReadiness(),
  ]);
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <CompliancePageHeader
        eyebrow="Executive"
        title="Compliance completion dashboard"
        description="Completion %, filing readiness, subsystem scores, and next actions. Not legal certification."
      />
      <ComplianceNav />
      <StorageModeNotice />
      <section className="grid gap-4 md:grid-cols-4">
        <ComplianceCard title="Compliance completion">{finalization.completionPct}%</ComplianceCard>
        <ComplianceCard title="Commercial readiness">{finalization.commercialReadinessPct}%</ComplianceCard>
        <ComplianceCard title="Filing readiness">{finalization.filingReadinessStatus}</ComplianceCard>
        <ComplianceCard title="Executive score">{executive.score}/100 · {executive.status}</ComplianceCard>
      </section>
      <section className="grid gap-4 md:grid-cols-3">
        {finalization.subsystemScores.map((item) => (
          <ComplianceCard key={item.id} title={item.label}>
            <p>{item.score}/100 · {item.status}</p>
            <p className="mt-2">{item.explanation}</p>
          </ComplianceCard>
        ))}
      </section>
      <section className="grid gap-4 md:grid-cols-2">
        <ComplianceCard title="Readiness flags">
          <p>Internal use: {finalization.canUseInternally ? "yes" : "no"}</p>
          <p>Beta test: {finalization.canBetaTest ? "yes" : "no"}</p>
          <p>Sellable: {finalization.canSell ? "yes (system threshold met — counsel still required)" : "no"}</p>
          <p className="mt-2">Storage: {storage.summary}</p>
          <p>DB: {db.summary}</p>
        </ComplianceCard>
        <ComplianceCard title="Top blockers">
          {finalization.blockers.length ? finalization.blockers.map((item) => <p key={item}>{item}</p>) : "None listed"}
        </ComplianceCard>
      </section>
      <ComplianceCard title="Next 10 actions">
        <ol className="list-decimal pl-5">
          {finalization.nextActions.slice(0, 10).map((item) => <li key={item}>{item}</li>)}
        </ol>
      </ComplianceCard>
    </div>
  );
}
