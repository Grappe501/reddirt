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
    label: "Forevermost Farms",
    detail: "Family farm and market operations in Rose Bud, Arkansas.",
    href: "https://www.facebook.com/forevermostfarms",
    verification: "VERIFIED",
  },
  {
    kind: "media",
    label: "Talk Business & Politics",
    detail: "Capitol View interview with Roby Brock — why she’s running and the skills she brings to the office.",
    href: "https://www.kark.com/capitol-view/capitol-view-barack-obamas-arkansas-visit-arkansas-sec-of-state-candidate-kelly-grappe/",
    verification: "VERIFIED",
  },
] as const;

/** Items that require campaign verification before displaying as metrics */
export const MEET_KELLY_TRUST_PENDING = [
  {
    label: "Counties visited",
    reason: "Published on /arkansas — derived from verified public campaign events only; no internal metrics.",
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
