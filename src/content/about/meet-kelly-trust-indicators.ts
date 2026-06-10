/**
 * Auditable trust indicators — verified external links only.
 * No invented stats, county counts, or endorsements.
 * @see docs/website/KELLY_BIOGRAPHY_VERIFICATION_MATRIX.md
 */

export type TrustIndicatorKind = "profile" | "organization" | "media" | "civic";

export type TrustIndicator = {
  kind: TrustIndicatorKind;
  label: string;
  detail: string;
  href: string;
  /** Matrix status for this indicator */
  verification: "VERIFIED";
};

export const MEET_KELLY_TRUST_INDICATORS: readonly TrustIndicator[] = [
  {
    kind: "profile",
    label: "Professional record",
    detail: "Public LinkedIn profile — roles, dates, and recommendations in one place.",
    href: "https://www.linkedin.com/in/kelly-grappe-48b6aa51/",
    verification: "VERIFIED",
  },
  {
    kind: "organization",
    label: "Stand Up Arkansas",
    detail: "Nonprofit civic organization Kelly helps lead — voter education and community engagement.",
    href: "https://www.standuparkansas.com/",
    verification: "VERIFIED",
  },
  {
    kind: "organization",
    label: "Forevermost Farms",
    detail: "Family farm and market operations in Rose Bud, Arkansas.",
    href: "https://forevermostfarms.com/",
    verification: "VERIFIED",
  },
  {
    kind: "media",
    label: "Talk Business & Politics",
    detail: "Arkansas business and politics coverage — candidate interview and 2026 election list.",
    href: "https://talkbusiness.net/2026-election-candidates/",
    verification: "VERIFIED",
  },
] as const;

/** Items that require campaign verification before displaying as metrics */
export const MEET_KELLY_TRUST_PENDING = [
  {
    label: "Counties visited",
    reason: "Source needed before publication — no internal Victory OS metrics on public site.",
  },
  {
    label: "Public speaking appearances",
    reason: "Needs Kelly approval and dated source list before counting.",
  },
  {
    label: "Community leadership roles (full list)",
    reason: "Partial list in biography sources — needs Kelly approval for complete public résumé.",
  },
] as const;
