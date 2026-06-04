/**
 * Kelly court/financial diligence log — structured verification checklist.
 * No fabricated court results — staff completes search and logs outcome.
 */

export type DiligenceSearchEntry = {
  id: string;
  source: string;
  searchQuery: string;
  dateSearched: string | null;
  result: "CLEAN" | "HIT_REQUIRES_COUNSEL" | "NOT_SEARCHED" | "IN_PROGRESS";
  staffInitials: string | null;
  counselReviewed: boolean;
  notes: string;
  debateStageLine: string | null;
};

export const KELLY_DILIGENCE_SEARCH_CHECKLIST: DiligenceSearchEntry[] = [
  {
    id: "courtconnect-civil",
    source: "Arkansas CourtConnect (AOC)",
    searchQuery: "Kelly Grappe — civil, probate, domestic relations (all counties)",
    dateSearched: null,
    result: "NOT_SEARCHED",
    staffInitials: null,
    counselReviewed: false,
    notes: "Complete before debate. Log case numbers only — no public speculation.",
    debateStageLine: null,
  },
  {
    id: "courtconnect-criminal",
    source: "Arkansas CourtConnect (AOC)",
    searchQuery: "Kelly Grappe — criminal docket search (all counties)",
    dateSearched: null,
    result: "NOT_SEARCHED",
    staffInitials: null,
    counselReviewed: false,
    notes: "If clean: pivot to service frame. If hit: counsel-approved single sentence only.",
    debateStageLine: null,
  },
  {
    id: "ucc-liens",
    source: "Arkansas Secretary of State UCC filings",
    searchQuery: "Kelly Grappe / Forevermost / related entity names",
    dateSearched: null,
    result: "NOT_SEARCHED",
    staffInitials: null,
    counselReviewed: false,
    notes: "Farm economics stress may be spun — document filings factually if asked.",
    debateStageLine: null,
  },
  {
    id: "business-entity",
    source: "Arkansas SOS business entity search",
    searchQuery: "Forevermost and related LLC/corp standing",
    dateSearched: null,
    result: "NOT_SEARCHED",
    staffInitials: null,
    counselReviewed: false,
    notes: "Verify good standing before debate — whisper campaigns on business filings are common.",
    debateStageLine: null,
  },
  {
    id: "property-tax",
    source: "County assessor (Faulkner + relevant counties)",
    searchQuery: "Property tax delinquency / lien status — campaign-relevant parcels only",
    dateSearched: null,
    result: "NOT_SEARCHED",
    staffInitials: null,
    counselReviewed: false,
    notes: "No PII in logs. Counsel review before any public response.",
    debateStageLine: null,
  },
];

export function diligenceCompletionPct(): number {
  const searched = KELLY_DILIGENCE_SEARCH_CHECKLIST.filter(
    (e) => e.result === "CLEAN" || e.result === "HIT_REQUIRES_COUNSEL",
  ).length;
  return Math.round((searched / KELLY_DILIGENCE_SEARCH_CHECKLIST.length) * 100);
}

export const KELLY_DILIGENCE_COUNSEL_FRAME =
  "If search is incomplete: 'I am running to run the Secretary of State's office for every voter.' If clean and logged: pivot to small-business survival and service frame in one sentence. Never fabricate denials.";
