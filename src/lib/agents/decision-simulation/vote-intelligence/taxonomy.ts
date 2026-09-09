import type { LegislativeIssueTag } from "./contracts";

const KEYWORDS: Array<{ issue: LegislativeIssueTag; pattern: RegExp }> = [
  { issue: "TAX", pattern: /\btax(es|ation|able)?\b|irs\b|capital gains|tcja|income tax/i },
  { issue: "BUDGET", pattern: /\bbudget\b|continuing resolution|\bcr\b|appropriat|debt ceiling|debt limit|omnibus|rescission/i },
  { issue: "BANKING", pattern: /\bbank(ing|s)?\b|credit union|fdic|basel|stress test/i },
  { issue: "FINANCIAL_SERVICES", pattern: /financial services|securities|sec\b|cfpb|fintech|crypto|stablecoin|capital markets/i },
  { issue: "HEALTHCARE", pattern: /health ?care|medicaid|medicare|aca\b|affordable care|hospital|nih\b|cdc\b/i },
  { issue: "IMMIGRATION", pattern: /immigrat|border|asylum|visa|ice\b|daca|refugee/i },
  { issue: "DEFENSE", pattern: /\bndaa\b|defense|armed forces|pentagon|military|veteran affairs wait/i },
  { issue: "VETERANS", pattern: /\bveteran|va \b|department of veterans/i },
  { issue: "FOREIGN_POLICY", pattern: /ukraine|israel|taiwan|nato|foreign aid|state department|sanctions|iran|china/i },
  { issue: "AGRICULTURE", pattern: /agricult|farm bill|usda|crop|livestock|rural development/i },
  { issue: "EDUCATION", pattern: /education|title ix|student loan|school choice|department of education/i },
  { issue: "LABOR", pattern: /\blabor\b|nlrb|union|wage|osha|workforce/i },
  { issue: "ENERGY", pattern: /\benergy\b|oil|gas|pipeline|lng|nuclear|permitting/i },
  { issue: "ENVIRONMENT", pattern: /environment|epa\b|climate|clean air|clean water|endangered/i },
  { issue: "AI", pattern: /\bai\b|artificial intelligence|machine learning/i },
  { issue: "PRIVACY", pattern: /privacy|surveillance|fisa|data broker/i },
  { issue: "TECHNOLOGY", pattern: /technology|broadband|semiconductor|chips act|cyber/i },
  { issue: "ELECTIONS", pattern: /election|voting rights|ballot|fec\b|campaign finance/i },
  { issue: "GOVERNMENT_REFORM", pattern: /government reform|ethics|inspector general|foia|administrative state/i },
  { issue: "CIVIL_RIGHTS", pattern: /civil rights|voting rights act|discrimination|equal protection/i },
  { issue: "CRIMINAL_JUSTICE", pattern: /criminal justice|police|sentenc|fentanyl|crime bill/i },
  { issue: "INFRASTRUCTURE", pattern: /infrastructure|highway|bridge|transit|iija/i },
  { issue: "HOUSING", pattern: /housing|fannie|freddie|mortgage|rent|homeless/i },
  { issue: "ARKANSAS_SPECIFIC", pattern: /arkansas|little rock|central arkansas|ozark|delta\b/i },
  { issue: "ECONOMY", pattern: /econom|inflation|jobs|gdp|recession|small business|workforce/i },
];

export function classifyIssueTags(text: string, originalLabels: string[] = []): LegislativeIssueTag[] {
  const haystack = [text, ...originalLabels].join(" ");
  const tags = new Set<LegislativeIssueTag>();
  for (const { issue, pattern } of KEYWORDS) {
    if (pattern.test(haystack)) tags.add(issue);
  }
  if (tags.size === 0) tags.add("OTHER");
  return [...tags];
}

export function detectIssuesInOpening(opening: string): LegislativeIssueTag[] {
  return classifyIssueTags(opening).filter((tag) => tag !== "OTHER" || classifyIssueTags(opening).length === 1);
}
