/**
 * Notaries — three-layer Office pathway (Pass 2).
 * Civic education only in Layers 1–2; verified Kelly credentials in Layer 3.
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

export const notariesAreaConfig: OfficeAreaConfig = {
  slug: "notaries",
  title: "Notaries",
  shortTitle: "Notaries",
  navLabel: "Notaries",
  metaDescription:
    "Arkansas Secretary of State notary duties: commissioning notaries and eNotaries, the public notary search, the notary handbook and exam, complaints, and apostilles for use abroad.",
  layerOne: {
    eyebrow: OFFICE_LAYER_EYEBROWS[1],
    title: "Notaries",
    intro:
      "Business and Commercial Services records and certifies notaries public for Arkansas. A notary verifies the identity of a person who appears before them and acts as an official witness to an oath, testimony, or signature on a legal document.",
    sections: [
      {
        heading: "Commissions, search, and training",
        paragraphs: [
          "The office runs the notary application and renewal process, keeps a public search of Arkansas notaries, and publishes the Notary Public and eNotary handbook.",
          "Applicants use the online filing portal. The office also publishes a user guide, change-of-information forms, affidavit templates, a notario-publico disclaimer, a complaint form, and an online notary exam.",
          "Non-resident spouses of U.S. military members working or operating a business in Arkansas may apply under Act 215 of 2019 by contacting the office.",
        ],
      },
      {
        heading: "eNotary and remote online notarization",
        paragraphs: [
          "The Secretary of State commissions notaries who perform electronic notarial acts. An eNotary uses a digital signature, seal, and certificate on digital documents.",
          "Arkansas law allows in-person electronic notarization and remote online notarization through approved solution providers. A person must hold a traditional notary commission in good standing before applying for an eNotary commission, then complete office-required training and an exam.",
        ],
      },
      {
        heading: "Apostilles and authentications",
        paragraphs: [
          "The same division issues apostilles and certificates of authentication so notarized public documents can be used in other countries, including Hague Convention countries.",
          "Requests can be prepared through the BCS portal. That is a document-authentication duty of this office, not a substitute for a notary’s own act.",
        ],
      },
    ],
  },
  layerTwo: {
    eyebrow: OFFICE_LAYER_EYEBROWS[2],
    title: "Why Notary Services Matter",
    intro:
      "Most people only think about notaries when a closing, a power of attorney, or a school form lands on the kitchen table. When the system works, commerce and civic life move. When it confuses people, lawful work stalls.",
    sections: [
      {
        heading: "For voters and families",
        paragraphs: [
          "Real-estate closings, caregiver documents, and school paperwork often require a notary—clarity prevents last-minute scrambles.",
          "Rural counties need the same understandable guidance as urban ones; distance should not mean guessing.",
        ],
      },
      {
        heading: "For small businesses and nonprofits",
        paragraphs: [
          "Employers, treasurers, and contractors depend on notarized documents for loans, leases, and compliance filings.",
          "When commission rules are hard to find, small operators pay twice—in time and in third-party fees.",
        ],
      },
      {
        heading: "For notaries themselves",
        paragraphs: [
          "Commission holders take on legal responsibility; they deserve training and answers that match statute—not folklore passed on a Facebook thread.",
          "Renewal deadlines and procedure changes should arrive in plain language before someone’s commission lapses mid-transaction.",
        ],
      },
      {
        heading: "For local communities",
        paragraphs: [
          "County courthouses, libraries, and civic hubs often host notary services—state guidance should help local partners stay aligned.",
          "Trustworthy notary infrastructure is part of how neighbors buy homes, enroll kids, and settle estates without unnecessary friction.",
        ],
      },
    ],
  },
  layerThree: {
    eyebrow: OFFICE_LAYER_KELLY_EYEBROW,
    title: "What Kelly Brings: Notaries",
    intro:
      "Notary administration is a detail-heavy public service—exactly the kind of work that rewards clear process, patient training, and respect for the person across the counter.",
    sections: [
      kellyBringsTelecomSection,
      {
        heading: "Training adults through complex rules",
        paragraphs: [
          "Corporate training rooms taught Kelly to explain procedures without condescension—repeat questions welcome, shortcuts discouraged when law is involved.",
          "That posture fits notary education: commission holders need competence and confidence, not performance.",
        ],
      },
      kellyBringsCivicSection,
      kellyBringsSmallBusinessSection,
      kellyBringsStewardshipCloser,
    ],
    softCtas: STANDARD_OFFICE_LAYER_THREE_SOFT_CTAS,
  },
  layerTwoNextLabel: "What Kelly brings",
  relatedLinks: [
    { label: "Notary & eNotary (official)", href: "https://www.sos.arkansas.gov/business-commercial-services-bcs/notary-e-notary/" },
    { label: "Business & Filings", href: "/office/business" },
    { label: "Understand the Office", href: "/understand" },
    { label: "Meet Kelly", href: "/about" },
  ],
};
