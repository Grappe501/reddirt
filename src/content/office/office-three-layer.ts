/**
 * Three-layer office trust system (Layer 1 clarity → Layer 2 relevance → Layer 3 competence).
 * Scaffolding copy — not final legal/policy text.
 *
 * INTERNAL (elections / voter data): keep public copy general; no SSN or “first state” claims
 * without primary-source verification.
 */

import { getJoinCampaignHref } from "@/config/external-campaign";
import { voterRegistrationHref } from "@/config/navigation";
import { businessAreaConfig } from "@/content/office/business-area";
import { electionsAreaConfig } from "@/content/office/elections-area";
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
    blurb: "Public records and tools so people can find official information without unnecessary friction.",
    href: "/office/records",
  },
  capitol: {
    headline: "Capitol & Public Safety",
    blurb: "The Capitol building and grounds, partnership with Capitol Police, and professional stewardship of a working public space.",
    href: "/office/capitol",
  },
};

export const OFFICE_AREAS: readonly OfficeAreaConfig[] = [
  electionsAreaConfig,
  businessAreaConfig,
  {
    slug: "records",
    title: "Transparency & Records",
    shortTitle: "Transparency & Records",
    navLabel: "Transparency & Records",
    metaDescription:
      "Public records and accessible systems within the Secretary of State’s role—clarity, trust, and government that does not hide behind complexity.",
    layerOne: {
      eyebrow: "The Office · Layer 1",
      title: "Transparency & Records",
      intro:
        "The office maintains public-facing records and systems Arkansans use to find official information—filings, disclosures, and tools that should be understandable on the first honest try.",
      sections: [
        {
          heading: "Within the office’s lane",
          paragraphs: [
            "The Secretary of State cannot control every agency in state government—but can lead on what the office itself holds: clear requests, published materials, and navigation that does not require insider knowledge.",
          ],
        },
      ],
      cards: [
        { title: "Searchable truth", body: "People should locate answers without repeating the same FOIA request others already asked." },
        { title: "Plain language", body: "Complexity should never be a wall between citizens and lawful access." },
      ],
    },
    layerTwo: {
      eyebrow: "The Office · Layer 2",
      title: "Why records access shapes trust",
      intro:
        "When official information is hard to find, rumor fills the gap. Journalists, researchers, advocates, and curious neighbors all lose when opacity becomes habit.",
      sections: [
        {
          heading: "Stakes you can feel",
          paragraphs: [
            "Opaque processes favor insiders. Transparent, well-indexed records favor everyone who plays by the rules—including journalists and county clerks juggling overlapping requests.",
          ],
        },
        {
          heading: "Kelly’s bias for clarity",
          paragraphs: [
            "Kelly’s career emphasized teaching, repeatable instructions, and systems people can trust—habits that belong in records administration as much as in training rooms.",
          ],
        },
      ],
    },
    layerThree: {
      eyebrow: "The Office · Layer 3",
      title: "Lead by example inside the office",
      intro:
        "Credibility starts at home: publish what you can, explain what you cannot, and keep improving how people search and learn.",
      sections: [
        {
          heading: "Operational credibility",
          paragraphs: [
            "From Verizon-scale operations to Sherwood organizing, Kelly has lived the difference between announcing transparency and operating it—checklists, owners, and follow-through the public can see.",
          ],
        },
        {
          heading: "People over Politics",
          paragraphs: [
            "Records are not a weapon for selective visibility. Non-partisan administration means consistent standards—before and after headlines.",
          ],
        },
      ],
      softCtas: [
        { label: "Meet Kelly", href: "/about" },
        { label: "Why Kelly", href: "/about/why-kelly" },
        { label: "Volunteer", href: getJoinCampaignHref() },
        { label: "Vote / Register", href: voterRegistrationHref },
      ],
    },
    relatedLinks: [{ label: "Priorities — transparency", href: "/priorities#transparency-heading" }],
  },
  {
    slug: "capitol",
    title: "Capitol & Public Safety",
    shortTitle: "Capitol & Public Safety",
    navLabel: "Capitol & Public Safety",
    metaDescription:
      "Stewardship of the Arkansas State Capitol, grounds, Capitol Police partnership, and professional operation of a public landmark.",
    layerOne: {
      eyebrow: "The Office · Layer 1",
      title: "Capitol & Public Safety",
      intro:
        "The Secretary of State’s office is responsible for the Arkansas State Capitol building and grounds, works with Capitol Police, and supports safe, professional operation of one of the state’s most visible public spaces.",
      sections: [
        {
          heading: "Stewardship, not theater",
          paragraphs: [
            "The goal is straightforward: a Capitol that is welcoming, functional, and respectfully managed—where visitors, staff, and law enforcement partners know what to expect.",
          ],
        },
      ],
      cards: [
        { title: "Facility operations", body: "Day-to-day care of a working government complex—not a museum piece." },
        { title: "Capitol Police", body: "Professional security partnership grounded in mutual respect and clear roles." },
      ],
    },
    layerTwo: {
      eyebrow: "The Office · Layer 2",
      title: "Why the people’s house matters",
      intro:
        "School groups, advocates, employees, and tourists share the same halls. Stewardship is safety, accessibility, and dignity—not fear messaging or spectacle.",
      sections: [
        {
          heading: "Who is affected",
          paragraphs: [
            "Visitors deserve predictable wayfinding and staff deserve workplaces run with competence. Inconsistent leadership shows up as confusion long before it shows up in headlines.",
          ],
        },
        {
          heading: "Professional standards",
          paragraphs: [
            "Kelly respects law enforcement as a profession and expects operational leadership to match—clear processes, steady tone, and accountability.",
          ],
        },
      ],
    },
    layerThree: {
      eyebrow: "The Office · Layer 3",
      title: "Operational leadership for an operational job",
      intro:
        "Running the Capitol well is logistics, people, and long hours—not slogans. Kelly’s background in large-scale operations maps directly to that reality.",
      sections: [
        {
          heading: "Large venues, real stakes",
          paragraphs: [
            "Verizon leadership and the Little Rock call center taught management of complex facilities and teams where the public shows up expectant—similar muscles to keeping a capitol complex functional.",
          ],
        },
        {
          heading: "Community and continuity",
          paragraphs: [
            "Rose Bud and field organizing reinforced that public spaces belong to neighbors. People over Politics means treating the Capitol as shared ground—not a stage for partisan performance.",
          ],
        },
      ],
      softCtas: [
        { label: "Meet Kelly", href: "/about" },
        { label: "Why Kelly", href: "/about/why-kelly" },
        { label: "Volunteer", href: getJoinCampaignHref() },
        { label: "Vote / Register", href: voterRegistrationHref },
      ],
    },
    relatedLinks: [
      { label: "Experience & Leadership", href: "/about/business" },
      { label: "Understand the Office", href: "/understand" },
    ],
  },
];

export function isOfficeAreaSlug(value: string): value is OfficeAreaSlug {
  return (OFFICE_AREA_SLUGS as readonly string[]).includes(value);
}

export function getOfficeArea(slug: string): OfficeAreaConfig | undefined {
  return OFFICE_AREAS.find((a) => a.slug === slug);
}
