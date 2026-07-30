/**
 * Public-site content integrity labels — real content or clearly marked pending only.
 * @see docs/website/WEBSITE_CONTENT_INTEGRITY_AUDIT.md
 */

export const CONTENT_PENDING = "More detail coming soon" as const;
export const SOURCE_NEEDED = "Source needed before publication" as const;
export const DRAFT_SECTION = "Draft section — not public-ready" as const;

export type PublicContentClass =
  | "real_sourced"
  | "generic_civic"
  | "placeholder_pending"
  | "removed";

/** Illustrative neighbor-voice stories in `src/content/stories` — off until campaign verifies sources. */
export const PUBLIC_ILLUSTRATIVE_STORIES_ENABLED = false;

/** Framework office-priority pillars when detailed positions are not yet published. */
export const OFFICE_PRIORITY_FRAMEWORK = [
  {
    id: "elections",
    title: "Elections",
    body: "How Arkansas registers voters, runs elections, and supports county officials — explained in plain language.",
    status: CONTENT_PENDING,
  },
  {
    id: "business",
    title: "Business Services",
    body: "Filings, registrations, and tools that help employers and nonprofits navigate state requirements.",
    status: CONTENT_PENDING,
  },
  {
    id: "transparency",
    title: "Transparency",
    body: "Public records, open processes, and accountability within what the Secretary of State actually controls.",
    status: CONTENT_PENDING,
  },
  {
    id: "civic",
    title: "Civic Participation",
    body: "Welcoming Arkansans into elections, candidate filing, and the Capitol — without insider-only knowledge.",
    status: CONTENT_PENDING,
  },
] as const;
