/**
 * Community calendar intelligence only — not Kelly campaign events.
 * Do not merge into `src/content/events/index.ts` public `events` list without product/legal approval.
 * Label for field: "Community calendar intelligence — tentative, verify before outreach."
 * Research: `docs/research/ARKANSAS_EXTENSION_HOMEMAKERS_EVENT_INTELLIGENCE.md`
 */
export type ExternalIntelConfidence = "high" | "medium" | "low";

export type TentativeExternalEvent = {
  id: string;
  label: string;
  /** Third-party or intel-only entries stay tentative */
  status: "tentative";
  sourceUrl: string;
  confidence: ExternalIntelConfidence;
  /** Always true in this register */
  requires_confirmation: true;
  whenSummary: string;
  whereSummary?: string;
  notes: string;
  category: "aehc" | "extension" | "other";
};

export const tentativeExternalEvents: TentativeExternalEvent[] = [
  {
    id: "aehc-state-meeting-2026-06",
    label: "AEHC / Arkansas Extension Homemakers state meeting (info per UAEX training page)",
    status: "tentative",
    sourceUrl: "https://www.uaex.uada.edu/life-skills-wellness/extension-homemakers/training.aspx",
    confidence: "high",
    requires_confirmation: true,
    whenSummary: "June 2–4, 2026 (re-verify; hotel/discount and registration deadlines in linked PDF).",
    whereSummary: "Wyndham Riverfront Hotel, Little Rock / North Little Rock (confirm with PDF/organizer).",
    notes:
      "PDF: EHC State Mtg Info June 2026 — linked from the training page. Scrape as of 2026-04-26; confirm before outreach.",
    category: "aehc",
  },
  {
    id: "aehc-food-fair-judging-2026-05",
    label: "River Valley Food and Fair Judging Training (EHC / extension program)",
    status: "tentative",
    sourceUrl: "https://www.uaex.uada.edu/life-skills-wellness/extension-homemakers/training.aspx",
    confidence: "high",
    requires_confirmation: true,
    whenSummary: "May 13, 2026, 9:00 a.m.–12:00 p.m. (per page; re-verify).",
    whereSummary: "Pope County Farm Bureau Building, Russellville, AR",
    notes: "Registration deadline and fee on Formstack from UA page—confirm live.",
    category: "extension",
  },
  {
    id: "aehc-spring-workshop-2026-03",
    label: "Spring Workshop (EHC — calendar line on UAEX training page)",
    status: "tentative",
    sourceUrl: "https://www.uaex.uada.edu/life-skills-wellness/extension-homemakers/training.aspx",
    confidence: "medium",
    requires_confirmation: true,
    whenSummary: "March 10–11, 2026 (table on training page; open full calendar for venues).",
    notes: "Venue/registration not in Day 2 scrape—must confirm on live UA page or county office.",
    category: "aehc",
  },
  {
    id: "aehc-ozark-district-rally-2026-10",
    label: "Ozark District Rally (EHC — October calendar line)",
    status: "tentative",
    sourceUrl: "https://www.uaex.uada.edu/life-skills-wellness/extension-homemakers/training.aspx",
    confidence: "low",
    requires_confirmation: true,
    whenSummary: "October 13, 2026 (per calendar table on training page).",
    notes: "No venue in scrape. Confirm with district or state EHC contact.",
    category: "aehc",
  },
  {
    id: "aehc-ouachita-district-rally-2026-10",
    label: "Ouachita District Rally",
    status: "tentative",
    sourceUrl: "https://www.uaex.uada.edu/life-skills-wellness/extension-homemakers/training.aspx",
    confidence: "low",
    requires_confirmation: true,
    whenSummary: "October 15, 2026 (per calendar table on training page).",
    whereSummary: undefined,
    notes: "Venue TBA. Confirm with district or state EHC contact.",
    category: "aehc",
  },
  {
    id: "aehc-delta-district-rally-2026-10",
    label: "Delta District Rally",
    status: "tentative",
    sourceUrl: "https://www.uaex.uada.edu/life-skills-wellness/extension-homemakers/training.aspx",
    confidence: "low",
    requires_confirmation: true,
    whenSummary: "October 20, 2026 (per calendar table on training page).",
    whereSummary: undefined,
    notes: "Venue TBA. Confirm with district or state EHC contact.",
    category: "aehc",
  },
  {
    id: "ozark-folk-center-retreat-2026-10",
    label: "Ozark Folk Center Retreat (listed on EHC training calendar table)",
    status: "tentative",
    sourceUrl: "https://www.uaex.uada.edu/life-skills-wellness/extension-homemakers/training.aspx",
    confidence: "low",
    requires_confirmation: true,
    whenSummary: "October 28–30, 2026 (per calendar table).",
    notes: "Not vetted for campaign use—ops intel only.",
    category: "other",
  },
];
