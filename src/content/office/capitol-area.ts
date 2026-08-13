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
    "How the Arkansas Secretary of State stewards the State Capitol, grounds, and professional partnership with Capitol Police—safe access, steady operations, and non-partisan public service.",
  layerOne: {
    eyebrow: OFFICE_LAYER_EYEBROWS[1],
    title: "Capitol & Public Safety",
    intro:
      "The Secretary of State helps steward the Arkansas State Capitol building and grounds and works with Capitol Police—with professionalism and clear coordination—to support a safe, welcoming public space within the office's authority.",
    sections: [
      {
        heading: "What this office touches",
        paragraphs: [
          "The Arkansas State Capitol building and grounds—day-to-day care of a working landmark.",
          "Capitol Police: a lawful, professional security partnership within statute.",
          "Public-facing facility operations visitors and employees rely on: access, signage, events, and logistics.",
          "Visitor and staff safety coordination within the office's authority.",
        ],
      },
      {
        heading: "What people should expect",
        paragraphs: [
          "Safe and respectful access to the Capitol—order that serves participation, not intimidation.",
          "Professional standards: predictable processes, calm communication, competent follow-through.",
          "Clear coordination among the offices and partners involved.",
          "Responsible stewardship of public property.",
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
    { label: "Understand the Office", href: "/understand" },
    { label: "Campaign Videos", href: "/kelly-speaks" },
    { label: "Office priorities", href: "/priorities" },
  ],
};
