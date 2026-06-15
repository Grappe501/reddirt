/** Supporting budget documents — slug maps to docs/campaign-brain/budget/*.md */

export type BudgetDocumentDef = {
  slug: string;
  file: string;
  title: string;
};

export const BUDGET_SUPPORTING_DOCUMENTS: BudgetDocumentDef[] = [
  { slug: "campaign-budget-framework", file: "CAMPAIGN-BUDGET-FRAMEWORK.md", title: "Framework overview" },
  { slug: "media-outreach-budget", file: "MEDIA-OUTREACH-BUDGET.md", title: "Media & outreach" },
  { slug: "community-activation-swag-budget", file: "COMMUNITY-ACTIVATION-SWAG-BUDGET.md", title: "Community activation & swag" },
  { slug: "compliance-budget", file: "COMPLIANCE-BUDGET.md", title: "Compliance" },
  { slug: "county-sponsorships-budget", file: "COUNTY-SPONSORSHIPS-BUDGET.md", title: "County sponsorships" },
  { slug: "digital-advertising-budget", file: "DIGITAL-ADVERTISING-BUDGET.md", title: "Digital advertising" },
  { slug: "digital-content-production-budget", file: "DIGITAL-CONTENT-PRODUCTION-BUDGET.md", title: "Digital content production" },
  { slug: "travel-budget", file: "TRAVEL-BUDGET.md", title: "Travel" },
  { slug: "field-materials-budget", file: "FIELD-MATERIALS-BUDGET.md", title: "Field materials" },
  { slug: "postcard-and-mail-budget", file: "POSTCARD-AND-MAIL-BUDGET.md", title: "Postcards & mail" },
  { slug: "sherwood-60-budget", file: "SHERWOOD-60-BUDGET.md", title: "Sherwood 60%" },
  { slug: "fundraising-goal-model", file: "FUNDRAISING-GOAL-MODEL.md", title: "Fundraising model" },
];

const bySlug = new Map(BUDGET_SUPPORTING_DOCUMENTS.map((d) => [d.slug, d]));
const byFile = new Map(BUDGET_SUPPORTING_DOCUMENTS.map((d) => [d.file.toLowerCase(), d]));

export function getBudgetDocument(slug: string): BudgetDocumentDef | undefined {
  return bySlug.get(slug);
}

export function budgetDocPathToRoute(docPath: string): string | null {
  const normalized = docPath.replace(/\\/g, "/");
  const fileMatch = normalized.match(/budget\/([^/`]+)\.md/i);
  if (!fileMatch) return null;
  const fileName = `${fileMatch[1]}.md`;
  const hit = byFile.get(fileName.toLowerCase()) ?? byFile.get(fileName.toUpperCase());
  if (!hit) {
    const slug = fileName.replace(/\.md$/i, "").toLowerCase();
    return `/election-plan/executive-book/budget/documents/${slug}`;
  }
  return `/election-plan/executive-book/budget/documents/${hit.slug}`;
}

export function budgetDocumentHref(slug: string): string {
  return `/election-plan/executive-book/budget/documents/${slug}`;
}
