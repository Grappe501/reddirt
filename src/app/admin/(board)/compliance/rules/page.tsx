import { ComplianceCard, ComplianceNav, CompliancePageHeader, StorageModeNotice } from "../components";
import { auditComplianceRuleCorpus } from "@/lib/compliance/knowledge/compliance-rule-index";
import { loadComplianceRuleCorpus } from "@/lib/compliance/knowledge/load-compliance-rule-corpus";

export const dynamic = "force-dynamic";

export default async function ComplianceRulesPage() {
  const corpus = await loadComplianceRuleCorpus();
  const audit = auditComplianceRuleCorpus(corpus);
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <CompliancePageHeader
        eyebrow="Rules"
        title="Compliance Knowledge Core"
        description="Source-backed Arkansas SOS, Arkansas Ethics, Arkansas Code, campaign policy, and internal notes coverage for AI retrieval and human review."
      />
      <ComplianceNav />
      <StorageModeNotice />
      <div className="rounded-2xl border border-red-700/20 bg-red-50 p-4 font-body text-sm font-semibold text-red-950">
        {audit.warning}
      </div>
      <section className="grid gap-4 md:grid-cols-4">
        <ComplianceCard title="Arkansas SOS sources">{audit.sourceCounts.arkansas_sos}</ComplianceCard>
        <ComplianceCard title="Arkansas Ethics sources">{audit.sourceCounts.arkansas_ethics}</ComplianceCard>
        <ComplianceCard title="Arkansas Code sources">{audit.sourceCounts.arkansas_code}</ComplianceCard>
        <ComplianceCard title="Campaign policy rules">{audit.sourceCounts.campaign_policy}</ComplianceCard>
        <ComplianceCard title="Chunks indexed">{audit.chunksIndexed}</ComplianceCard>
        <ComplianceCard title="Topics covered">{audit.topicsCovered.length}</ComplianceCard>
        <ComplianceCard title="Topics missing">{audit.topicsMissing.length ? audit.topicsMissing.join(", ") : "none"}</ComplianceCard>
        <ComplianceCard title="Needs verification">{audit.rulesNeedingVerification} source(s)</ComplianceCard>
      </section>
      <section className="grid gap-4 md:grid-cols-3">
        {audit.topicCoverage.map((topic) => (
          <ComplianceCard key={topic.topic} title={topic.label}>
            <p>Status: <strong>{topic.status}</strong></p>
            <p>Sources: {topic.sourceCount} · Chunks: {topic.chunkCount}</p>
            <p>Verified: {topic.verified ? "yes" : "no"}</p>
            <p>Last updated: {topic.lastUpdated ?? "unknown"}</p>
            <p className="mt-2">{topic.nextAction}</p>
            {!topic.verified ? <p className="mt-2 font-semibold text-red-800">Not filing-certified. Rule source needs verification before final reliance.</p> : null}
          </ComplianceCard>
        ))}
      </section>
      <ComplianceCard title="Last build time">{corpus?.builtAt ?? "No corpus built yet. Run npm run compliance:rules:build."}</ComplianceCard>
    </div>
  );
}
