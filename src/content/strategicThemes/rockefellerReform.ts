/**
 * Winthrop Rockefeller–inspired reform *themes* (editorial, not history lessons).
 * Research + citations: `docs/research/WINTHROP_ROCKEFELLER_REFORM_CAMPAIGN_RESEARCH.md`
 * Public site: use sparingly; do not over-attribute.
 */
export const rockefellerReform = {
  /** Short value statements — no proper-name attribution required. */
  themeLines: [
    "Reform you can read in the rules, not just hear in a speech.",
    "Real competition and real choices make institutions sharper—not angrier.",
    "Arkansas is big enough for fair process in every county seat.",
  ] as const,
  /** If copy names Rockefeller, pair with an approved primary or Encyclopedia link. */
  requiresNamedAttribution: true,
  integrationNotes:
    "Homepage, blog, long-form. Avoid chaining this label on every page; Secretary of State is an administrative office.",
} as const;
