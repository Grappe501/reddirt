/**
 * "Keeper of the public record" / civic-librarian *metaphor* themes.
 * Always distinguish from the Arkansas **State Library** (separate agency).
 * Official duties: `https://sos.arkansas.gov/about-the-office/duties-of-the-office/`
 * Research: `docs/research/SOS_AS_KEEPER_OF_RECORDS_MESSAGING.md`
 */
export const keeperOfRecords = {
  /** Safe, metaphor-forward lines for About / office explainer pages. */
  lines: [
    "The Secretary of State helps keep the public’s records straight—lists voters rely on, filings businesses use, and the official paper trail of our democracy.",
    "I want you to find what’s official without a scavenger hunt—clear deadlines, clear answers.",
    "Stewardship for public lists: accurate, accessible, and accountable.",
  ] as const,
  /** Phrases to avoid in literal claims */
  doNotClaimLiteralTitle: "The Secretary of State is not Arkansas’s “State Librarian” (a different role/agency).",
} as const;
