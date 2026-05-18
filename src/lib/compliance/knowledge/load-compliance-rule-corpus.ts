import { readFile } from "node:fs/promises";
import path from "node:path";
import type { ComplianceRuleCorpus, ComplianceRuleSource, ComplianceRuleTopic } from "./compliance-rule-types";
import { chunkComplianceRuleSource } from "./chunk-compliance-rules";

export const ruleCorpusPath = path.join(process.cwd(), "data", "compliance", "knowledge", "compliance-rule-corpus.json");
export const ruleCoveragePath = path.join(process.cwd(), "data", "compliance", "knowledge", "compliance-rule-coverage.json");

export const defaultComplianceRuleSources: ComplianceRuleSource[] = [
  {
    id: "official-arkansas-compliance-source-library",
    title: "Official Arkansas Compliance Source Library",
    sourceType: "arkansas_ethics",
    filePath: "docs/compliance/OFFICIAL_ARKANSAS_COMPLIANCE_SOURCE_LIBRARY.md",
    retrievedAt: "2026-05-17",
    verificationStatus: "needs_legal_review",
    topics: ["contribution", "expenditure", "cash", "check", "credit_card", "in_kind", "loan", "debt", "filing_deadline", "reporting", "recordkeeping", "reimbursement"],
  },
  {
    id: "arkansas-sos-financial-disclosure",
    title: "Arkansas Secretary of State Financial Disclosure",
    sourceType: "arkansas_sos",
    url: "https://www.sos.arkansas.gov/elections/financial-disclosure/",
    retrievedAt: "2026-05-17",
    verificationStatus: "needs_legal_review",
    topics: ["filing_deadline", "reporting", "recordkeeping"],
  },
  {
    id: "arkansas-ethics-rules-campaign-finance-disclosure",
    title: "Arkansas Ethics Rules on Campaign Finance and Disclosure",
    sourceType: "arkansas_code",
    url: "http://www.arkansasethics.com/wp-content/uploads/2025/03/CAR-RCFD-1.pdf",
    retrievedAt: "2026-05-17",
    verificationStatus: "needs_legal_review",
    topics: ["contribution", "expenditure", "cash", "credit_card", "in_kind", "loan", "debt", "reporting", "recordkeeping", "reimbursement"],
  },
  ...topicPlaceholderSources(),
];

export async function buildComplianceRuleCorpus(): Promise<ComplianceRuleCorpus> {
  const sources = defaultComplianceRuleSources;
  const chunks = [];
  for (const source of sources) {
    if (!source.filePath) continue;
    const markdown = await readFile(path.join(process.cwd(), source.filePath), "utf8");
    chunks.push(...chunkComplianceRuleSource(source, markdown));
  }
  return {
    builtAt: new Date().toISOString(),
    sources,
    chunks,
  };
}

function topicPlaceholderSources(): ComplianceRuleSource[] {
  const topics: ComplianceRuleTopic[] = ["expenditure", "cash", "check", "credit_card", "in_kind", "loan", "debt", "reporting", "amendment", "reimbursement", "filing_deadline", "recordkeeping", "contribution"];
  return topics.map((topic) => ({
    id: `placeholder-${topic}`,
    title: `Placeholder rule source: ${topic}`,
    sourceType: "internal_notes",
    filePath: `docs/compliance/rules/${topic}.md`,
    retrievedAt: "2026-05-17",
    verificationStatus: topic === "check" ? "campaign_policy" : "placeholder",
    topics: [topic],
  }));
}

export async function loadComplianceRuleCorpus(): Promise<ComplianceRuleCorpus | null> {
  try {
    return JSON.parse(await readFile(ruleCorpusPath, "utf8")) as ComplianceRuleCorpus;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw error;
  }
}
