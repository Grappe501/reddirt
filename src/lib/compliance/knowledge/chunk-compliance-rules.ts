import { chunkMarkdown } from "@/lib/content/parse";
import type { ComplianceRuleChunk, ComplianceRuleSource, ComplianceRuleTopic } from "./compliance-rule-types";

export function chunkComplianceRuleSource(source: ComplianceRuleSource, markdown: string): ComplianceRuleChunk[] {
  return chunkMarkdown(source.filePath ?? source.id, markdown).map((chunk) => ({
    id: `${source.id}-${chunk.chunkIndex}`,
    sourceId: source.id,
    title: chunk.title,
    text: chunk.content,
    topic: inferRuleTopic(`${chunk.title}\n${chunk.content}`),
    citations: [source.url ?? source.filePath ?? source.id],
    ruleStatus: source.verificationStatus === "campaign_policy" ? "campaign_policy" : source.verificationStatus === "verified_authoritative" ? "authoritative" : "needs_legal_review",
  }));
}

export function inferRuleTopic(text: string): ComplianceRuleTopic {
  const value = text.toLowerCase();
  if (/deadline|calendar|late filing|time for filing/.test(value)) return "filing_deadline";
  if (/record|receipt|documentation/.test(value)) return "recordkeeping";
  if (/amend/.test(value)) return "amendment";
  if (/reimburse/.test(value)) return "reimbursement";
  if (/credit card|card/.test(value)) return "credit_card";
  if (/cash/.test(value)) return "cash";
  if (/check/.test(value)) return "check";
  if (/in-kind|in kind/.test(value)) return "in_kind";
  if (/loan/.test(value)) return "loan";
  if (/debt/.test(value)) return "debt";
  if (/expenditure|expense|money out|payment/.test(value)) return "expenditure";
  if (/contribution|donor|money in/.test(value)) return "contribution";
  if (/report|filing|verification/.test(value)) return "reporting";
  return "unknown";
}
