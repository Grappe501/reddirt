/**
 * Three-layer office trust system (Layer 1 clarity → Layer 2 relevance → Layer 3 competence).
 * Scaffolding copy — not final legal/policy text.
 *
 * INTERNAL (elections / voter data): keep public copy general; no SSN or “first state” claims
 * without primary-source verification.
 */

import { businessAreaConfig } from "@/content/office/business-area";
import { capitolAreaConfig } from "@/content/office/capitol-area";
import { electionsAreaConfig } from "@/content/office/elections-area";
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

export function officeLayerPath(slug: OfficeAreaSlug, layer: 1 | 2 | 3): string {
  if (layer === 1) return `/office/${slug}`;
  if (layer === 2) return `/office/${slug}/why-it-matters`;
  return `/office/${slug}/full-picture`;
}

/** Card copy for /understand hub — Layer 1 entry only */
export const officeUnderstandTeasers: Record<
  OfficeAreaSlug,
  { headline: string; blurb: string; href: string }
> = {
  elections: {
    headline: "Elections",
    blurb:
      "Clear rules, steady county partnership, and systems Arkansans can trust—start with what election administration actually means.",
    href: "/office/elections",
  },
  business: {
    headline: "Business & Filings",
    blurb:
      "Registrations, filings, and searchable records that keep commerce legible—economic infrastructure that should feel clear, not like a second job.",
    href: "/office/business",
  },
  records: {
    headline: "Transparency & Records",
    blurb:
      "You shouldn’t need an advanced degree to read what your government owes you in public—clear paths to records and systems this Secretary of State actually maintains.",
    href: "/office/records",
  },
  capitol: {
    headline: "Capitol & Public Safety",
    blurb:
      "The State Capitol is a working public space—grounds, facilities, and professional coordination with Capitol Police, stewarded so Arkansans can visit and work with calm, competent standards.",
    href: "/office/capitol",
  },
};

export const OFFICE_AREAS: readonly OfficeAreaConfig[] = [
  electionsAreaConfig,
  businessAreaConfig,
  recordsAreaConfig,
  capitolAreaConfig,
];

export function isOfficeAreaSlug(value: string): value is OfficeAreaSlug {
  return (OFFICE_AREA_SLUGS as readonly string[]).includes(value);
}

export function getOfficeArea(slug: string): OfficeAreaConfig | undefined {
  return OFFICE_AREAS.find((a) => a.slug === slug);
}
