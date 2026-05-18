import { ComplianceCard, ComplianceNav, CompliancePageHeader, ComplianceWarningPanel, StorageModeNotice } from "../components";
import { auditComplianceRuleCorpusAsync } from "@/lib/compliance/knowledge/compliance-rule-index";
import { loadComplianceRuleCorpus } from "@/lib/compliance/knowledge/load-compliance-rule-corpus";
import { loadRuleReviews } from "@/lib/compliance/knowledge/rule-reviews-storage";
import { RuleDashboardActions } from "./rule-dashboard-actions";
import { RuleTopicCard } from "./rule-topic-card";

export const dynamic = "force-dynamic";

export default async function ComplianceRulesPage() {
  const [corpus, reviews] = await Promise.all([loadComplianceRuleCorpus(), loadRuleReviews()]);
  const audit = await auditComplianceRuleCorpusAsync(corpus);
  const sourceIds = corpus?.sources.map((source) => source.id) ?? [];

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 pt-6">
      <CompliancePageHeader
        eyebrow="Rules"
        title="Arkansas rule coverage command center"
        description="Official source metadata, chunk coverage, and compliance officer review. System checks are not legal certification."
      />
      <ComplianceNav />
      <StorageModeNotice />
      <RuleDashboardActions sourceIds={sourceIds} />
      <ComplianceWarningPanel title="Corpus status" tone="amber">
        {audit.warning}
      </ComplianceWarningPanel>
      <section className="grid gap-4 md:grid-cols-4">
        <ComplianceCard title="Arkansas Ethics sources">{audit.sourceCounts.arkansas_ethics}</ComplianceCard>
        <ComplianceCard title="Arkansas SOS sources">{audit.sourceCounts.arkansas_sos}</ComplianceCard>
        <ComplianceCard title="Arkansas Code sources">{audit.sourceCounts.arkansas_code}</ComplianceCard>
        <ComplianceCard title="Chunks indexed">{audit.chunksIndexed}</ComplianceCard>
        <ComplianceCard title="Topics missing">{audit.topicsMissing.length ? audit.topicsMissing.join(", ") : "none"}</ComplianceCard>
        <ComplianceCard title="Needs verification">{audit.rulesNeedingVerification} source(s)</ComplianceCard>
        <ComplianceCard title="Officer-reviewed topics">
          {reviews.filter((review) => review.topic && !review.stale).length}
        </ComplianceCard>
        <ComplianceCard title="Last build">{corpus?.builtAt ?? "Run Rebuild corpus"}</ComplianceCard>
      </section>
      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {audit.topicCoverage.map((topic) => {
          const sources = corpus?.sources.filter((source) => source.topics?.includes(topic.topic)) ?? [];
          const chunks = corpus?.chunks.filter((chunk) => chunk.topic === topic.topic) ?? [];
          const topicReview = reviews.find((review) => review.topic === topic.topic && !review.stale);
          return (
            <RuleTopicCard
              key={topic.topic}
              topic={topic}
              sources={sources}
              chunks={chunks}
              topicReviewed={
                topicReview
                  ? { initials: topicReview.reviewedByInitials, at: topicReview.reviewedAt, note: topicReview.reviewNote }
                  : undefined
              }
            />
          );
        })}
      </section>
    </div>
  );
}
