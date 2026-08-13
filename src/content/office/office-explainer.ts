/**
 * Concise plain-language explainer of what the office does.
 * Campaign platform lives on /priorities — this page is civic education.
 */

export const officeExplainerCopy = {
  hero: {
    eyebrow: "The Office",
    title: "What the Secretary of State does",
    subtitle:
      "This is a concise explainer, not another platform page. At its core, the Secretary of State’s office is a large statewide service organization.",
  },
  functions: [
    {
      title: "Elections",
      body: "The Secretary of State has statewide election responsibilities and supports the local officials who administer elections in Arkansas. The office maintains statewide systems and records, provides guidance and resources, and carries out duties assigned by Arkansas law.",
      href: "/office/elections",
    },
    {
      title: "Business & Commercial Services",
      body: "The office handles business and nonprofit filings, commercial records, notary-related services and other transactions used by Arkansans and businesses every day.",
      href: "/office/business",
    },
    {
      title: "Initiatives & Referenda",
      body: "The office has major administrative responsibilities in the constitutional process Arkansans use to propose laws, constitutional amendments and referenda.",
      href: "/direct-democracy/ballot-initiative-process",
    },
    {
      title: "Public Records & Transparency",
      body: "The office maintains important public and government records and should make lawful public information genuinely accessible.",
      href: "/office/records",
    },
    {
      title: "The State Capitol",
      body: "The Secretary of State has responsibilities for the State Capitol and its operations. The Capitol should be safe, accessible, welcoming and treated as the people’s house.",
      href: "/office/capitol",
    },
  ],
  closer:
    "That’s the lens Kelly will bring to leading it: a statewide service organization that belongs to the people.",
} as const;
