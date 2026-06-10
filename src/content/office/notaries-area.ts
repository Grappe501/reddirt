/**
 * Notaries — three-layer Office pathway (Pass 2).
 * Civic education only in Layers 1–2; verified Kelly credentials in Layer 3.
 */

import type { OfficeAreaConfig } from "@/content/office/office-types";
import { OFFICE_LAYER_EYEBROWS } from "@/content/office/office-layer-labels";
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
    "What the Arkansas Secretary of State does for notaries: commission standards, training resources, and public trust in everyday legal acknowledgments.",
  layerOne: {
    eyebrow: OFFICE_LAYER_EYEBROWS[1],
    title: "Notaries",
    intro:
      "Notaries public are part of Arkansas’s everyday legal infrastructure—witnessing signatures, administering oaths, and helping documents travel between people, businesses, and institutions. The Secretary of State’s office sets commission standards and maintains the systems notaries and the public rely on.",
    sections: [
      {
        heading: "What this office touches",
        paragraphs: [
          "Notary public commissions—the lawful authorization for Arkansans to serve as notaries under state rules.",
          "Application and renewal processes so commissions stay current and traceable.",
          "Training and guidance materials that help notaries understand their duties—not guess from rumor.",
          "Official records related to notary commissions within the Secretary of State’s authority.",
          "Coordination with the standards state law assigns to this office—not every notarial question in every context, but the commission system itself.",
        ],
      },
      {
        heading: "What notaries and the public should expect",
        paragraphs: [
          "Clear rules about who may serve, how to apply, and how to stay in good standing.",
          "Accessible instructions—not buried PDFs that only insiders can parse.",
          "Consistent standards so a lawful acknowledgment in one county matches what neighbors expect statewide.",
          "Respect for notaries as volunteers and professionals who absorb liability so others can transact with confidence.",
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
    eyebrow: OFFICE_LAYER_EYEBROWS[3],
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
    { label: "Understand the Office", href: "/understand" },
    { label: "Business & Filings", href: "/office/business" },
    { label: "Meet Kelly", href: "/about" },
  ],
};
