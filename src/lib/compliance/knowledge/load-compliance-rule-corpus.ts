import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import type { ComplianceRuleCorpus, ComplianceRuleSource, ComplianceRuleTopic } from "./compliance-rule-types";
import { chunkComplianceRuleSource } from "./chunk-compliance-rules";
import { arkansasOfficialRuleSources } from "./arkansas-rule-source-catalog";
import { applyHumanReviewToSource, arkansasRecordToComplianceSource, mergeArkansasCatalogWithPersisted } from "./merge-arkansas-sources";
import { loadRuleReviews } from "./rule-reviews-storage";

export const ruleCorpusPath = path.join(process.cwd(), "data", "compliance", "knowledge", "compliance-rule-corpus.json");
export const ruleCoveragePath = path.join(process.cwd(), "data", "compliance", "knowledge", "compliance-rule-coverage.json");
export const arkansasSourcesPath = path.join(process.cwd(), "data", "compliance", "knowledge", "sources", "arkansas-rule-sources.json");
export const rawKnowledgeDir = path.join(process.cwd(), "data", "compliance", "knowledge", "raw");
export const chunkKnowledgeDir = path.join(process.cwd(), "data", "compliance", "knowledge", "chunks");

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

export async function loadArkansasSourceCatalog() {
  try {
    return JSON.parse(await readFile(arkansasSourcesPath, "utf8")) as ReturnType<typeof mergeArkansasCatalogWithPersisted>;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return mergeArkansasCatalogWithPersisted(null);
    throw error;
  }
}

export async function buildComplianceRuleSources(): Promise<ComplianceRuleSource[]> {
  const [catalog, reviews] = await Promise.all([loadArkansasSourceCatalog(), loadRuleReviews()]);
  const arkansasSources = catalog.map(arkansasRecordToComplianceSource);
  const reviewBySource = new Map(reviews.map((review) => [review.sourceId, review]));
  const merged = [...arkansasSources, ...defaultComplianceRuleSources.filter((source) => !arkansasSources.some((item) => item.id === source.id))];
  return merged.map((source) => {
    const review = reviewBySource.get(source.id);
    if (!review?.reviewedByInitials || review.stale) return source;
    return applyHumanReviewToSource(source, review.reviewedByInitials, review.reviewedAt);
  });
}

export async function buildComplianceRuleCorpus(): Promise<ComplianceRuleCorpus> {
  const sources = await buildComplianceRuleSources();
  const chunks = [];
  for (const source of sources) {
    if (source.filePath) {
      try {
        const markdown = await readFile(path.join(process.cwd(), source.filePath), "utf8");
        chunks.push(...chunkComplianceRuleSource(source, markdown));
      } catch {
        // placeholder docs may be missing locally
      }
    }
  }
  try {
    const rawFiles = await readdir(rawKnowledgeDir);
    for (const fileName of rawFiles) {
      if (!fileName.endsWith(".html") && !fileName.endsWith(".txt") && !fileName.endsWith(".md")) continue;
      const sourceId = fileName.replace(/\.(html|txt|md)$/i, "");
      const source = sources.find((item) => item.id === sourceId);
      if (!source) continue;
      const markdown = await readFile(path.join(rawKnowledgeDir, fileName), "utf8");
      chunks.push(...chunkComplianceRuleSource(source, markdown));
    }
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
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
