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
    "How the Arkansas Secretary of State's business services support registrations, filings, and public records employers and nonprofits rely on—with plain language and reliable process.",
  layerOne: {
    eyebrow: OFFICE_LAYER_EYEBROWS[1],
    title: "Business & Filings",
    intro:
      "The Secretary of State's office is part of Arkansas's economic infrastructure. When filings are clear, searchable, and understandable, small businesses, nonprofits, employers, and local organizations can spend less time fighting paperwork and more time doing their work.",
    sections: [
      {
        heading: "What this office touches",
        paragraphs: [
          "Business registrations—the on-ramps that let lawful entities form and operate in Arkansas with confidence.",
          "Annual reports and filings the law assigns to this office.",
          "Nonprofit filings that keep charities and civic organizations in good standing.",
          "Official business records maintained as the durable, public-facing history of what was filed.",
          "Searchable public information so lenders, partners, and researchers can verify what the law expects to be visible.",
        ],
      },
      {
        heading: "What users should expect",
        paragraphs: [
          "Clear instructions written for humans who are busy—not manuals written only for specialists.",
          "Predictable steps you can plan around instead of guessing which door to knock on next.",
          "Forms and guidance that are easy to find.",
          "Fewer loops and false finishes—the process should feel on your side when you are trying to do things right.",
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
    { label: "Understand the Office", href: "/understand" },
    { label: "Experience & Leadership", href: "/about/journey" },
    { label: "Meet Kelly", href: "/about" },
  ],
};
