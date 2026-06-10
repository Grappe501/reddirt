/**
 * Transparency & Records — three-layer Office pathway (Pass 2).
 */

import type { OfficeAreaConfig } from "@/content/office/office-types";
import { OFFICE_LAYER_EYEBROWS } from "@/content/office/office-layer-labels";
import {
  kellyBringsCivicSection,
  kellyBringsStewardshipCloser,
  kellyBringsTelecomSection,
} from "@/content/office/kelly-brings-verified";
import { STANDARD_OFFICE_LAYER_THREE_SOFT_CTAS } from "@/content/office/standard-layer-three-ctas";

export const recordsAreaConfig: OfficeAreaConfig = {
  slug: "records",
  title: "Transparency & Records",
  shortTitle: "Transparency & Records",
  navLabel: "Transparency & Records",
  metaDescription:
    "Transparency and public records under the Secretary of State's authority—plain language and useful paths so Arkansans are not expected to be experts to understand their own government.",
  layerOne: {
    eyebrow: OFFICE_LAYER_EYEBROWS[1],
    title: "Transparency & Records",
    intro:
      "Public records are part of public trust. You should not need to be an expert to understand your own government. Arkansans ought to find official information within this office's authority, understand what it means, and know it is kept clearly and responsibly.",
    sections: [
      {
        heading: "What this office touches",
        paragraphs: [
          "Public-facing records the Secretary of State publishes, maintains, or indexes under law.",
          "Official filings and state information systems assigned to this office.",
          "Searchable public-facing systems where the office provides them.",
          "Election- and business-related public information where applicable—released and organized lawfully.",
        ],
      },
      {
        heading: "What people should expect",
        paragraphs: [
          "Clear access points: a front door you can find on the first try.",
          "Plain-language guidance that says what to do next.",
          "Records organized so lawful disclosure actually helps someone.",
          "Public systems that do not feel hidden behind bureaucracy.",
        ],
      },
    ],
  },
  layerTwo: {
    eyebrow: OFFICE_LAYER_EYEBROWS[2],
    title: "Why Transparency & Records Matter",
    intro:
      "When public information is hard to find, hard to understand, or hard to trust, people quietly disengage—and democracy gets smaller.",
    sections: [
      {
        heading: "For voters",
        paragraphs: [
          "A neighbor checking a deadline before work—clarity saves participation, not just a mood.",
          "Trust slips when answers feel hidden—even when someone is following the rulebook.",
        ],
      },
      {
        heading: "For small businesses and nonprofits",
        paragraphs: [
          "A shop owner or nonprofit treasurer verifying good standing—predictable records protect payrolls and grants.",
          "Unclear instructions waste hours for filers who were trying to do the right thing the first time.",
        ],
      },
      {
        heading: "For journalists and community leaders",
        paragraphs: [
          "Reporters and civic leaders following public actions need archives that work, not paywalls of confusion.",
          "Transparency is a service standard: access should be clear, guidance understandable, and systems respectful of people's time.",
        ],
      },
      {
        heading: "For local communities",
        paragraphs: [
          "County seats and rural towns alike depend on the same official information being findable statewide.",
          "Confusion creates distance—not laziness, but time and dignity running out.",
        ],
      },
    ],
  },
  layerThree: {
    eyebrow: OFFICE_LAYER_EYEBROWS[3],
    title: "What Kelly Brings: Transparency & Records",
    intro:
      "Transparency is how you operate when nobody is clapping. Public records only build credibility when people can reach them, understand them, and depend on the systems behind them.",
    sections: [
      {
        heading: "Transparency is operational",
        paragraphs: [
          "It takes organized systems: owners, timelines, and searchable paths—not good intentions filed in a drawer.",
          "Public-facing information should not require insider knowledge.",
        ],
      },
      kellyBringsTelecomSection,
      kellyBringsCivicSection,
      {
        heading: "Training and plain language",
        paragraphs: [
          "Kelly has trained adults through complex systems—measured in patience, repetition, and never making someone feel small for asking twice.",
          "Process should be explained, not guarded—secrecy by accident is still a broken experience.",
        ],
      },
      kellyBringsStewardshipCloser,
    ],
    softCtas: STANDARD_OFFICE_LAYER_THREE_SOFT_CTAS,
  },
  layerTwoNextLabel: "What Kelly brings",
  relatedLinks: [
    { label: "Understand the Office", href: "/understand" },
    { label: "Meet Kelly", href: "/about" },
    { label: "Office priorities", href: "/priorities" },
  ],
};
