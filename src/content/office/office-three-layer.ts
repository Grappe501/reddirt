/**
 * Two-layer office trust system (Layer 1 clarity → Layer 2 relevance + competence).
 * Scaffolding copy — not final legal/policy text.
 *
 * INTERNAL (elections / voter data): keep public copy general; no SSN or “first state” claims
 * without primary-source verification.
 */

import { businessAreaConfig } from "@/content/office/business-area";
import { capitolAreaConfig } from "@/content/office/capitol-area";
import { electionsAreaConfig } from "@/content/office/elections-area";
import { notariesAreaConfig } from "@/content/office/notaries-area";
import { recordsAreaConfig } from "@/content/office/records-area";
import {
  OFFICE_AREA_SLUGS,
  type OfficeAreaConfig,
  type OfficeAreaSlug,
} from "@/content/office/office-types";

export type {
  OfficeAreaConfig,
  OfficeAreaSlug,
  OfficeCard,
  OfficeLayerCopy,
  OfficeLayerThreeCopy,
  OfficeSectionBlock,
} from "@/content/office/office-types";

export { OFFICE_AREA_SLUGS };

export function officeLayerPath(slug: OfficeAreaSlug, layer: 1 | 2): string {
  if (layer === 1) return `/office/${slug}`;
  return `/office/${slug}/why-it-matters`;
}

/** Card copy for /understand hub — Layer 1 entry only */
export const officeUnderstandTeasers: Record<
  OfficeAreaSlug,
  { headline: string; blurb: string; href: string }
> = {
  elections: {
    headline: "Elections",
    blurb:
      "Chief election official: statewide voter registration, candidate and petition filings, ballot certification, returns, voting-equipment training, and chair of the State Board of Election Commissioners.",
    href: "/office/elections",
  },
  business: {
    headline: "Business & Filings",
    blurb:
      "Business and Commercial Services: entity name search, corporations and LLCs, annual reports, franchise tax, UCC, trademarks, and the public business-entity search.",
    href: "/office/business",
  },
  notaries: {
    headline: "Notaries",
    blurb:
      "Commissioning notaries and eNotaries, the public notary search, and apostilles so notarized documents can be used in other countries.",
    href: "/office/notaries",
  },
  records: {
    headline: "Transparency & Records",
    blurb:
      "Administrative Code and Register, legislative acts, city boundary filings, precinct maps, ethics-filing search, and the state seal on official commissions.",
    href: "/office/records",
  },
  capitol: {
    headline: "Capitol & Public Safety",
    blurb:
      "Capitol building and grounds, Capitol Police, public tours and civics programs, and day-to-day operations of the people’s house.",
    href: "/office/capitol",
  },
};

export const OFFICE_AREAS: readonly OfficeAreaConfig[] = [
  electionsAreaConfig,
  businessAreaConfig,
  notariesAreaConfig,
  recordsAreaConfig,
  capitolAreaConfig,
];

export function isOfficeAreaSlug(value: string): value is OfficeAreaSlug {
  return (OFFICE_AREA_SLUGS as readonly string[]).includes(value);
}

export function getOfficeArea(slug: string): OfficeAreaConfig | undefined {
  return OFFICE_AREAS.find((a) => a.slug === slug);
}
