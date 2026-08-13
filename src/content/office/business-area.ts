/**
 * Business & Filings — three-layer Office pathway (Pass 2).
 */

import type { OfficeAreaConfig } from "@/content/office/office-types";
import { OFFICE_LAYER_EYEBROWS, OFFICE_LAYER_KELLY_EYEBROW } from "@/content/office/office-layer-labels";
import {
  kellyBringsCivicSection,
  kellyBringsSmallBusinessSection,
  kellyBringsStewardshipCloser,
  kellyBringsTelecomSection,
} from "@/content/office/kelly-brings-verified";
import { STANDARD_OFFICE_LAYER_THREE_SOFT_CTAS } from "@/content/office/standard-layer-three-ctas";

export const businessAreaConfig: OfficeAreaConfig = {
  slug: "business",
  title: "Business & Filings",
  shortTitle: "Business & Filings",
  navLabel: "Business & Filings",
  metaDescription:
    "Arkansas Secretary of State Business and Commercial Services: corporations, LLCs, nonprofits, annual reports, franchise tax, UCC filings, trademarks, and the public business-entity search.",
  layerOne: {
    eyebrow: OFFICE_LAYER_EYEBROWS[1],
    title: "Business & Filings",
    intro:
      "Business and Commercial Services is Arkansas’s starting point for people who form or transact business in the state, whether they are based here or elsewhere. Several filing desks sit under one division so a name search, an entity filing, and a later annual report live in the same system.",
    sections: [
      {
        heading: "What Business and Commercial Services files",
        paragraphs: [
          "Domestic and foreign business corporations, nonprofit corporations, professional corporations, limited partnerships, LLPs, LLLPs, and limited liability companies are formed or qualified by filing with this division.",
          "Filers can search whether a company name is available, then file articles, amendments, mergers, or dissolutions. The office publishes that most filings complete within two business days of receipt; the effective date is the date BCS receives the document unless the filing sets a later date.",
          "Corporations and LLCs file annual reports and pay franchise tax to the Secretary of State—online, by mail, or in person in Little Rock or Fayetteville.",
          "The division records Uniform Commercial Code financing statements and other lien documents, and registers trademarks and service marks.",
          "Other filings assigned to this office include commercial registered agents, cooperatives, international student-exchange organizations, and related commercial records.",
        ],
      },
      {
        heading: "How to use the office",
        paragraphs: [
          "The public business-entity search lets lenders, partners, and neighbors check what was filed.",
          "Counter service is at the Victory Building, 1401 W. Capitol Avenue, Suite 250, Little Rock, and at 300 North College, Suite 201F, Fayetteville.",
          "Notary commissions, eNotary, and apostilles are also housed in this division; those duties are described on the Notaries page.",
        ],
      },
    ],
  },
  layerTwo: {
    eyebrow: OFFICE_LAYER_EYEBROWS[2],
    title: "Why Business Filings Matter",
    intro:
      "A confusing filing system does not just inconvenience people. It costs time, money, momentum, and confidence—especially for small businesses, nonprofits, and local organizations operating with thin margins.",
    sections: [
      {
        heading: "For small businesses",
        paragraphs: [
          "Missed deadlines can mean penalties, suspended authority, or reputational hits that are hard to unwind.",
          "Farmers, growers, and first-time employers feel friction first—they rarely have a compliance department on speed dial.",
          "Local entrepreneurs translate a healthy filing culture into real hiring; they notice when government feels indifferent.",
        ],
      },
      {
        heading: "For nonprofits and civic organizations",
        paragraphs: [
          "Volunteer treasurers cannot afford a week lost to a form that never should have been a maze.",
          "Charities and civic groups doing lawful work deserve the same clarity as any other filer.",
        ],
      },
      {
        heading: "For voters and communities",
        paragraphs: [
          "Main-street employers and community institutions depend on searchable good-standing records neighbors can trust.",
          "When systems are confusing, the cost shifts onto citizens who were trying to follow the law.",
        ],
      },
      {
        heading: "Clear systems build confidence",
        paragraphs: [
          "People are more likely to comply when the rules read like something a neighbor could explain.",
          "Plain-language guidance shrinks avoidable mistakes; most filers want to do the right thing if we show them how.",
        ],
      },
    ],
  },
  layerThree: {
    eyebrow: OFFICE_LAYER_KELLY_EYEBROW,
    title: "What Kelly Brings: Business & Filings",
    intro:
      "Business services are public-facing systems that affect whether people can start, maintain, and understand their legal responsibilities in Arkansas.",
    sections: [
      {
        heading: "Business filings are economic infrastructure",
        paragraphs: [
          "Filings, records, and registrations are part of how commerce functions—who exists, who is in good standing, and what the public can verify.",
          "Good administration makes compliance easier without lowering standards: clearer rails, same guardrails.",
        ],
      },
      kellyBringsTelecomSection,
      kellyBringsSmallBusinessSection,
      kellyBringsCivicSection,
      kellyBringsStewardshipCloser,
    ],
    softCtas: STANDARD_OFFICE_LAYER_THREE_SOFT_CTAS,
  },
  layerTwoNextLabel: "What Kelly brings",
  relatedLinks: [
    { label: "Business & Commercial Services (official)", href: "https://www.sos.arkansas.gov/business-commercial-services-bcs" },
    { label: "Duties of the office (official)", href: "https://www.sos.arkansas.gov/about-the-office/duties-of-the-office" },
    { label: "Understand the Office", href: "/understand" },
    { label: "Notaries", href: "/office/notaries" },
    { label: "Meet Kelly", href: "/about" },
  ],
};
