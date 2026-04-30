/**
 * Three-layer office trust system (Layer 1 clarity → Layer 2 relevance → Layer 3 competence).
 * Scaffolding copy — not final legal/policy text.
 *
 * INTERNAL (elections / voter data): keep public copy general; no SSN or “first state” claims
 * without primary-source verification.
 */

import { getJoinCampaignHref } from "@/config/external-campaign";
import { voterRegistrationHref } from "@/config/navigation";

export const OFFICE_AREA_SLUGS = ["elections", "business", "records", "capitol"] as const;
export type OfficeAreaSlug = (typeof OFFICE_AREA_SLUGS)[number];

export type OfficeSectionBlock = {
  heading?: string;
  paragraphs: readonly string[];
};

export type OfficeCard = {
  title: string;
  body: string;
};

export type OfficeLayerCopy = {
  eyebrow: string;
  title: string;
  intro: string;
  sections: readonly OfficeSectionBlock[];
  cards?: readonly OfficeCard[];
};

export type OfficeLayerThreeCopy = OfficeLayerCopy & {
  softCtas: readonly { label: string; href: string }[];
};

export type OfficeAreaConfig = {
  slug: OfficeAreaSlug;
  title: string;
  shortTitle: string;
  navLabel: string;
  metaDescription: string;
  layerOne: OfficeLayerCopy;
  layerTwo: OfficeLayerCopy;
  layerThree: OfficeLayerThreeCopy;
  relatedLinks?: readonly { label: string; href: string }[];
};

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
    blurb: "How the office supports counties, voter registration systems, and clear, consistent election administration.",
    href: "/office/elections",
  },
  business: {
    headline: "Business & Filings",
    blurb: "Registrations and filings employers, nonprofits, and small businesses rely on—economic infrastructure in plain process.",
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
  {
    slug: "elections",
    title: "Elections",
    shortTitle: "Elections",
    navLabel: "Elections",
    metaDescription:
      "What the Secretary of State does in election administration—support for counties, consistent rules, and care for voter access and sensitive data.",
    layerOne: {
      eyebrow: "The Office · Layer 1",
      title: "Elections",
      intro:
        "The Secretary of State helps administer statewide election systems, supports county election officials, maintains core voter-registration infrastructure, and works to keep rules explained and applied clearly and consistently across Arkansas.",
      sections: [
        {
          heading: "What this responsibility is",
          paragraphs: [
            "The job centers on lawful, transparent processes: helping counties run elections, coordinating guidance, and safeguarding systems that voters and officials depend on.",
            "It is administration under statute—not picking winners, not bending standards for politics.",
          ],
        },
      ],
      cards: [
        { title: "County partnership", body: "Local officials do the front-line work; the state office should make guidance, training, and tools dependable." },
        { title: "Clarity over confusion", body: "When instructions and timelines are plain, fewer neighbors fall through the cracks—and confidence in the process grows." },
      ],
    },
    layerTwo: {
      eyebrow: "The Office · Layer 2",
      title: "Why elections work here matters to you",
      intro:
        "Elections touch every Arkansan who votes—or who might. When systems wobble, the people who pay the price are clerks, poll workers, and voters trying to do the right thing.",
      sections: [
        {
          heading: "What can go wrong",
          paragraphs: [
            "Inconsistent guidance, last-minute changes, or opaque processes frustrate voters and burden county offices that are already stretched thin.",
            "Sensitive voter data must be handled with strict care and clear legal authority—not convenience or outside pressure.",
          ],
        },
        {
          heading: "Why clarity builds trust",
          paragraphs: [
            "Fair, transparent process and steady rules let neighbors disagree at the ballot box without doubting the administration of the election itself.",
            "Kelly’s career has been built on running large operations where detail matters and people are counting on the process to work the first time.",
          ],
        },
      ],
    },
    layerThree: {
      eyebrow: "The Office · Layer 3",
      title: "Why Kelly fits this part of the job",
      intro:
        "This is not a retelling of Kelly’s biography—it is why operational habits from her career map to election administration Arkansas can rely on.",
      sections: [
        {
          heading: "Scale and discipline",
          paragraphs: [
            "Leading more than 800 people at Verizon, building recruiting and training pipelines, and running a high-volume call center in Little Rock taught the same lesson elections demand: clear standards, accountable follow-through, and no excuses when the phones are ringing.",
          ],
        },
        {
          heading: "Systems under pressure",
          paragraphs: [
            "Election seasons are deadlines and scrutiny. Kelly’s background is managing complex systems where slip-ups have real consequences—exactly the temperament non-partisan administration requires.",
          ],
        },
        {
          heading: "Ground-level organizing",
          paragraphs: [
            "Sherwood petition headquarters and statewide initiative work showed how respect for volunteers and clear process keep civic life from turning into chaos. That instinct carries into supporting counties and voters with patience and plain language.",
          ],
        },
        {
          heading: "People over Politics",
          paragraphs: [
            "Holding the line means administering the law faithfully—transparent elections, protected access, careful stewardship of voter data, and consistency Arkansans can predict.",
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
      { label: "Understand the Office", href: "/understand" },
      { label: "Priorities", href: "/priorities" },
    ],
  },
  {
    slug: "business",
    title: "Business & Filings",
    shortTitle: "Business & Filings",
    navLabel: "Business & Filings",
    metaDescription:
      "Business registrations and filings as economic infrastructure—and how steady, plain-language administration helps Arkansas employers and nonprofits.",
    layerOne: {
      eyebrow: "The Office · Layer 1",
      title: "Business & Filings",
      intro:
        "The office handles business registrations, filings, and related tools that small businesses, nonprofits, and employers use to stay in good standing and focus on their mission—not on wrestling paperwork.",
      sections: [
        {
          heading: "Economic infrastructure",
          paragraphs: [
            "When filings are predictable and instructions are readable, Arkansas organizations spend less time untangling process and more time hiring, serving customers, and delivering community impact.",
          ],
        },
      ],
      cards: [
        { title: "Small business reality", body: "Most filers are not lawyers; they deserve forms and guidance that respect their time." },
        { title: "Nonprofits too", body: "Charitable and civic entities rely on the same public systems—clarity helps good work move faster." },
      ],
    },
    layerTwo: {
      eyebrow: "The Office · Layer 2",
      title: "Why smooth filings matter",
      intro:
        "A delayed filing, a confusing fee schedule, or a portal that breaks at the wrong moment can stall a grand opening, a grant, or payroll—especially for operators without a compliance department.",
      sections: [
        {
          heading: "Who feels it",
          paragraphs: [
            "Main Street shops, startups, faith-based nonprofits, and volunteer treasurers all bump into the Secretary of State’s systems. Friction here is a tax on optimism.",
          ],
        },
        {
          heading: "Kelly’s operational lens",
          paragraphs: [
            "Kelly spent years improving processes at scale—making instructions survive first contact with real humans. That mindset matches an office that should treat every filer with respect.",
          ],
        },
      ],
    },
    layerThree: {
      eyebrow: "The Office · Layer 3",
      title: "Prepared to modernize service—not ego",
      intro:
        "Running business services well is engineering plus empathy: standards, plain language, feedback loops, and humility when something needs fixing.",
      sections: [
        {
          heading: "Verizon-honed habits",
          paragraphs: [
            "Large-team leadership, training rooms, and river-tower accountability taught Kelly to measure success by whether the system works for the person using it—not by how impressive the org chart looks.",
          ],
        },
        {
          heading: "Reducing friction",
          paragraphs: [
            "Kelly approaches filings as infrastructure: fewer loops, clearer checkpoints, and honest help when something breaks—aligned with People over Politics and non-partisan administration.",
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
    relatedLinks: [{ label: "Understand the Office", href: "/understand" }],
  },
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
] as const;

export function isOfficeAreaSlug(value: string): value is OfficeAreaSlug {
  return (OFFICE_AREA_SLUGS as readonly string[]).includes(value);
}

export function getOfficeArea(slug: string): OfficeAreaConfig | undefined {
  return OFFICE_AREAS.find((a) => a.slug === slug);
}
