/**
 * Capitol & Public Safety — three-layer Office pathway (Pass 2).
 */

import type { OfficeAreaConfig } from "@/content/office/office-types";
import { OFFICE_LAYER_EYEBROWS, OFFICE_LAYER_KELLY_EYEBROW } from "@/content/office/office-layer-labels";
import {
  kellyBringsStewardshipCloser,
  kellyBringsTelecomSection,
} from "@/content/office/kelly-brings-verified";
import { STANDARD_OFFICE_LAYER_THREE_SOFT_CTAS } from "@/content/office/standard-layer-three-ctas";

export const capitolAreaConfig: OfficeAreaConfig = {
  slug: "capitol",
  title: "Capitol & Public Safety",
  shortTitle: "Capitol & Public Safety",
  navLabel: "Capitol & Public Safety",
  metaDescription:
    "Arkansas Secretary of State Capitol duties: building and grounds, Capitol Police, tours and civics programs, purchasing and flags, and day-to-day operations of the Capitol Complex.",
  layerOne: {
    eyebrow: OFFICE_LAYER_EYEBROWS[1],
    title: "Capitol & Public Safety",
    intro:
      "The Secretary of State’s office includes the divisions that keep the State Capitol running as a workplace and a public building: facilities, Capitol Police, communications and education, and the internal business office.",
    sections: [
      {
        heading: "Capitol Facilities",
        paragraphs: [
          "Capitol Facilities cares for the State Capitol, the Capitol Hill Building, and the surrounding landscape, including skilled trades, housekeeping for offices in the building, and grounds staff.",
          "That is building operations: maintenance, preservation, and daily upkeep of a working landmark, not a ceremonial title.",
        ],
      },
      {
        heading: "State Capitol Police",
        paragraphs: [
          "State Capitol Police provide security for the State Capitol building and police services for the Capitol Complex. The Capitol Police desk is on the first floor of the Capitol.",
          "The chief of Capitol Police is part of the office’s published leadership structure.",
        ],
      },
      {
        heading: "Communications, education, and internal operations",
        paragraphs: [
          "Communications and Education runs voter-outreach campaigns, civics materials, guided tours, exhibits, teacher workshops, Young Voters Workshops, and the December Capitol Lighting Ceremony. The division also archives architectural drawings of the Capitol and other historical documents.",
          "The Business Office covers purchasing, supply, and mail; arranges insurance on Capitol buildings and contents under this office’s jurisdiction; and purchases, inventories, and disburses Arkansas and United States flags as authorized by law.",
          "The State Capitol Gift Shop on the first floor sells Arkansas-made products during posted weekday hours. Human Resources handles staffing, payroll, and benefits for the office.",
        ],
      },
    ],
  },
  layerTwo: {
    eyebrow: OFFICE_LAYER_EYEBROWS[2],
    title: "Why Capitol & Public Safety Matters",
    intro:
      "The Capitol is a public workplace, a civic gathering place, and a symbol of state government. People should enter with confidence that it is managed professionally and respectfully.",
    sections: [
      {
        heading: "For voters and visitors",
        paragraphs: [
          "Safety and access belong together—reasonable clarity helps neighbors participate without feeling pushed away.",
          "Order should support public participation, not perform intimidation.",
        ],
      },
      {
        heading: "For local communities",
        paragraphs: [
          "School groups, civic leagues, and faith communities use the Capitol as Arkansas's shared civic room.",
          "Small failures—broken wayfinding, deferred maintenance—add up to public frustration fast.",
        ],
      },
      {
        heading: "For public servants and staff",
        paragraphs: [
          "Employees, elected officials, and Capitol partners depend on consistent, understandable standards.",
          "Buildings require maintenance, coordination, communication, and planning—especially one that hosts the public daily.",
        ],
      },
      {
        heading: "Capitol Police deserve steady leadership",
        paragraphs: [
          "Respect their role and the difficulty of protecting a living workplace.",
          "Support professionalism: training, clarity of expectations, and coordination that does not jerk from headline to headline.",
          "Avoid politicizing their work—their mission is public safety and lawful order.",
        ],
      },
    ],
  },
  layerThree: {
    eyebrow: OFFICE_LAYER_KELLY_EYEBROW,
    title: "What Kelly Brings: Capitol & Public Safety",
    intro:
      "Managing the Capitol is an operational responsibility—systems that hold, people who are supported, and leadership steady enough to keep public service functioning.",
    sections: [
      {
        heading: "The Capitol is a working public system",
        paragraphs: [
          "It serves visitors, employees, elected officials, and citizens who expect the people's house to be run with care.",
          "Stewardship is daily work: schedules, vendors, communication, and follow-through when something goes wrong.",
        ],
      },
      kellyBringsTelecomSection,
      {
        heading: "Facilities and accountability at scale",
        paragraphs: [
          "Large operations taught Kelly that culture and standards walk through the front door before any speech does.",
          "Keeping systems humane and functional under pressure matches public facilities when tours, sessions, and events share the same halls.",
        ],
      },
      {
        heading: "Community-grounded stewardship",
        paragraphs: [
          "Family and farm life in Rose Bud reinforced that public spaces belong to people who show up on ordinary Tuesdays—not just ceremony days.",
          "Safe access approached with calm leadership—not alarm, not political theater.",
        ],
      },
      kellyBringsStewardshipCloser,
    ],
    softCtas: STANDARD_OFFICE_LAYER_THREE_SOFT_CTAS,
  },
  layerTwoNextLabel: "What Kelly brings",
  relatedLinks: [
    { label: "Duties of the office (official)", href: "https://www.sos.arkansas.gov/about-the-office/duties-of-the-office" },
    { label: "Understand the Office", href: "/understand" },
    { label: "Meet Kelly", href: "/about" },
  ],
};
