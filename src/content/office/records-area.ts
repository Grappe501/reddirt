/**
 * Transparency & Records — three-layer Office pathway (Pass 2).
 */

import type { OfficeAreaConfig } from "@/content/office/office-types";
import { OFFICE_LAYER_EYEBROWS, OFFICE_LAYER_KELLY_EYEBROW } from "@/content/office/office-layer-labels";
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
    "Public records kept by the Arkansas Secretary of State: Administrative Code and Register, legislative acts, city boundary filings, precinct maps, ethics-filing search, and the state seal.",
  layerOne: {
    eyebrow: OFFICE_LAYER_EYEBROWS[1],
    title: "Transparency & Records",
    intro:
      "Besides elections and business filings, the Secretary of State is the filing office for a set of statewide public records. People use those records to check rules, city boundaries, precinct lines, and ethics reports.",
    sections: [
      {
        heading: "Rules, acts, and maps",
        paragraphs: [
          "The office files the Arkansas Administrative Code and publishes the Arkansas Register. State agencies also file administrative rules here, and the office hosts a public-meeting calendar for agencies.",
          "The Elections Division library keeps the journals and acts of the Legislature, along with incorporations and annexations of cities and towns.",
          "The office publishes state precinct maps and files municipal boundary changes and related local documents assigned by law.",
        ],
      },
      {
        heading: "Ethics filings and official acts",
        paragraphs: [
          "Candidates and public officials file financial-interest and related ethics forms through a portal this office hosts. The public can search those filings here. The Arkansas Ethics Commission remains the ethics regulator.",
          "The Secretary of State attests official acts and affixes the state seal to commissions and other official acts of the Governor. The office also files facsimile signature certificates.",
          "Oaths of office, official acts of the Governor, and other state records assigned by statute are filed or maintained here.",
        ],
      },
      {
        heading: "What this page is not",
        paragraphs: [
          "County clerks, circuit clerks, and other agencies keep many local records this office does not hold.",
          "A Freedom of Information Act request still goes to the public body that owns the record. This office’s job is the record series the law assigns to the Secretary of State.",
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
    eyebrow: OFFICE_LAYER_KELLY_EYEBROW,
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
    { label: "Duties of the office (official)", href: "https://www.sos.arkansas.gov/about-the-office/duties-of-the-office" },
    { label: "Search administrative rules", href: "https://www.sos.arkansas.gov/elections" },
    { label: "Understand the Office", href: "/understand" },
    { label: "Meet Kelly", href: "/about" },
  ],
};
