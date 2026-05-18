import { ComplianceCard, ComplianceNav, CompliancePageHeader, StorageModeNotice } from "../components";
import { auditComplianceRuleCorpus } from "@/lib/compliance/knowledge/compliance-rule-index";
import { loadComplianceRuleCorpus } from "@/lib/compliance/knowledge/load-compliance-rule-corpus";
import { RuleDashboardActions } from "./rule-dashboard-actions";

export const dynamic = "force-dynamic";

export default async function ComplianceRulesPage() {
  const corpus = await loadComplianceRuleCorpus();
  const audit = auditComplianceRuleCorpus(corpus);
  const sourceIds = corpus?.sources.map((source) => source.id) ?? [];
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <CompliancePageHeader
        eyebrow="Rules"
        title="Arkansas rule coverage command center"
        description="Official source metadata, chunk coverage, and human review status. System checks are not legal certification."
      />
      <ComplianceNav />
      <StorageModeNotice />
      <RuleDashboardActions sourceIds={sourceIds} />
      <div className="rounded-2xl border border-red-700/20 bg-red-50 p-4 font-body text-sm font-semibold text-red-950">
        {audit.warning}
      </div>
      <section className="grid gap-4 md:grid-cols-4">
        <ComplianceCard title="Arkansas Ethics sources">{audit.sourceCounts.arkansas_ethics}</ComplianceCard>
        <ComplianceCard title="Arkansas SOS sources">{audit.sourceCounts.arkansas_sos}</ComplianceCard>
        <ComplianceCard title="Arkansas Code sources">{audit.sourceCounts.arkansas_code}</ComplianceCard>
        <ComplianceCard title="Campaign policy rules">{audit.sourceCounts.campaign_policy}</ComplianceCard>
        <ComplianceCard title="Chunks indexed">{audit.chunksIndexed}</ComplianceCard>
        <ComplianceCard title="Topics covered">{audit.topicsCovered.length}</ComplianceCard>
        <ComplianceCard title="Topics missing">{audit.topicsMissing.length ? audit.topicsMissing.join(", ") : "none"}</ComplianceCard>
        <ComplianceCard title="Needs verification">{audit.rulesNeedingVerification} source(s)</ComplianceCard>
      </section>
      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {audit.topicCoverage.map((topic) => (
          <ComplianceCard key={topic.topic} title={topic.label}>
            <p>Status: <strong>{topic.status}</strong></p>
            <p>Sources: {topic.sourceCount} · Chunks: {topic.chunkCount}</p>
            <p>Official source: {topic.hasOfficialSource ? "yes" : "no"}</p>
            <p>Legal review required: {topic.legalReviewRequired ? "yes" : "no"}</p>
            <p>Confidence: {topic.confidence ?? "low"}</p>
            <p>Last retrieved: {topic.lastRetrieved ?? "unknown"}</p>
            {topic.brokenLinkCount ? <p className="text-red-800">Broken links: {topic.brokenLinkCount}</p> : null}
            <p className="mt-2">{topic.nextAction}</p>
            {topic.status !== "verified_authoritative" ? (
              <p className="mt-2 font-semibold text-amber-900">Ready for compliance officer review — not verified authoritative.</p>
            ) : null}
          </ComplianceCard>
        ))}
      </section>
      <ComplianceCard title="Last build time">{corpus?.builtAt ?? "No corpus built yet. Run npm run compliance:rules:build."}</ComplianceCard>
    </div>
  );
}
