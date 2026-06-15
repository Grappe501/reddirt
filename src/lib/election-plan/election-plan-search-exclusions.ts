/**
 * Corpus exclusion rules for Election Plan local search (18.7H).
 * Never index admin, voter, donor, private contact, or opposition raw files.
 */

const EXCLUDED_PATH_SEGMENTS = [
  "/admin/",
  "/api/admin/",
  "relational-contacts",
  "donor",
  "donors",
  "fundraising-donor",
  "voter-file",
  "voter_file",
  "voterfile",
  "opposition/raw",
  "opposition-intel/raw",
  "credentials",
  ".env",
  "private-contact",
  "networking-contacts.source",
  "county-networking",
  "/dashboard/field/",
  "/dashboard/team/",
];

const EXCLUDED_FILE_PATTERNS = [
  /donor/i,
  /voter.?file/i,
  /relational.?contact/i,
  /private.?contact/i,
  /credentials/i,
  /opposition.*raw/i,
  /networking-contacts\.source\.json/i,
  /\.env/i,
];

export function isElectionPlanSearchExcluded(relativePath: string): boolean {
  const normalized = relativePath.replace(/\\/g, "/").toLowerCase();
  for (const seg of EXCLUDED_PATH_SEGMENTS) {
    if (normalized.includes(seg.toLowerCase())) return true;
  }
  for (const pat of EXCLUDED_FILE_PATTERNS) {
    if (pat.test(relativePath)) return true;
  }
  return false;
}

export const ELECTION_PLAN_SEARCH_CORPUS_ROOTS = [
  "src/app/election-plan",
  "docs/strategic-plan/plurality-victory-plan",
  "docs/campaign-brain",
  "data/campaign-brain/election-plan",
  "data/election-plan/election-plan-workbench.snapshot.json",
] as const;

export const ELECTION_PLAN_SEARCH_PUBLIC_ROUTE_PREFIXES = [
  "/about",
  "/understand",
  "/office",
  "/events",
  "/get-involved",
  "/platform",
  "/onboarding/power-of-5",
  "/voter-registration",
  "/from-the-road",
  "/updates",
  "/editorial",
  "/explainers",
  "/arkansas",
] as const;
