import { chunkMarkdown } from "@/lib/content/parse";
import type { ComplianceRuleChunk, ComplianceRuleSource, ComplianceRuleTopic } from "./compliance-rule-types";
import { inferTopicsFromText } from "./arkansas-rule-source-catalog";

export function chunkComplianceRuleSource(source: ComplianceRuleSource, markdown: string): ComplianceRuleChunk[] {
  const verificationStatus = resolveChunkVerification(source);
  return chunkMarkdown(source.filePath ?? source.id, markdown).map((chunk) => {
    const topic = inferRuleTopic(`${chunk.title}\n${chunk.content}`);
    const subtopics = inferTopicsFromText(`${chunk.title}\n${chunk.content}`).filter((item) => item !== topic);
    return {
      id: `${source.id}-${chunk.chunkIndex}`,
      sourceId: source.id,
      title: chunk.title,
      text: chunk.content,
      topic,
      subtopics: subtopics.length ? subtopics.map(String) : undefined,
      citations: [
        {
          sourceId: source.id,
          title: source.citationLabel ?? source.title,
          url: source.url,
          section: chunk.title,
          quote: chunk.content.slice(0, 240),
        },
      ],
      legacyCitations: [source.url ?? source.filePath ?? source.id],
      ruleStatus: source.verificationStatus === "campaign_policy" ? "campaign_policy" : source.verificationStatus === "verified_authoritative" ? "authoritative" : "needs_legal_review",
      verificationStatus,
      retrievedAt: source.retrievedAt,
      confidence: source.confidence ?? (verificationStatus === "official_source_loaded" ? "medium" : "low"),
    };
  });
}

function resolveChunkVerification(source: ComplianceRuleSource): ComplianceRuleChunk["verificationStatus"] {
  if (source.verificationStatus === "verified_authoritative") return "official_source_loaded";
  if (source.verificationStatus === "official_link_verified" || source.verificationStatus === "downloaded_official_source") return "official_source_loaded";
  if (source.verificationStatus === "campaign_policy") return "campaign_policy";
  if (source.verificationStatus === "placeholder") return "placeholder";
  return "needs_legal_review";
}

export function inferRuleTopic(text: string): ComplianceRuleTopic {
  const value = text.toLowerCase();
  if (/anonymous contribution/.test(value)) return "anonymous_contributions";
  if (/contribution limit|limit on contribution/.test(value)) return "contribution_limits";
  if (/employer|occupation|donor information/.test(value)) return "donor_information";
  if (/treasurer/.test(value)) return "treasurer";
  if (/certif/.test(value)) return "certification";
  if (/penalt|late filing|fine/.test(value)) return "penalties";
  if (/committee setup|register committee/.test(value)) return "candidate_committee_setup";
  if (/transfer between/.test(value)) return "transfers";
  if (/refund|returned contribution/.test(value)) return "refunds";
  if (/fundraiser|event receipt/.test(value)) return "fundraiser_event_receipts";
  if (/vendor|w-9|invoice|contract/.test(value)) return "vendor_documentation";
  if (/deadline|calendar|late filing|time for filing/.test(value)) return "filing_deadline";
  if (/record|receipt|documentation/.test(value)) return "recordkeeping";
  if (/amend/.test(value)) return "amendment";
  if (/reimburse/.test(value)) return "reimbursement";
  if (/credit card|card/.test(value)) return "credit_card";
  if (/cash/.test(value)) return "cash";
  if (/check/.test(value)) return "check";
  if (/in-kind|in kind/.test(value)) return "in_kind";
  if (/loan/.test(value)) return "loan";
  if (/debt|obligation/.test(value)) return "debt";
  if (/expenditure|expense|money out|payment/.test(value)) return "expenditure";
  if (/contribution|donor|money in/.test(value)) return "contribution";
  if (/report|filing|verification/.test(value)) return "reporting";
  return "unknown";
}
