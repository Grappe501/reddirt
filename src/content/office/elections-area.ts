/**
 * Elections — three-layer Office pathway (Pass 2).
 * Layer 1: civic education · Layer 2: stakeholder relevance · Layer 3: verified Kelly credentials.
 */

import type { OfficeAreaConfig } from "@/content/office/office-types";
import { OFFICE_LAYER_EYEBROWS, OFFICE_LAYER_KELLY_EYEBROW } from "@/content/office/office-layer-labels";
import {
  kellyBringsCivicSection,
  kellyBringsStewardshipCloser,
  kellyBringsTelecomSection,
} from "@/content/office/kelly-brings-verified";
import { STANDARD_OFFICE_LAYER_THREE_SOFT_CTAS } from "@/content/office/standard-layer-three-ctas";

export const electionsAreaConfig: OfficeAreaConfig = {
  slug: "elections",
  title: "Elections",
  shortTitle: "Elections",
  navLabel: "Elections",
  metaDescription:
    "What the Arkansas Secretary of State does in election administration: clear rules, secure systems, county partnership, and public confidence in an evenhanded process.",
  layerOne: {
    eyebrow: OFFICE_LAYER_EYEBROWS[1],
    title: "Elections",
    intro:
      "Free and fair elections require clear rules, secure systems, consistent communication with counties, and public confidence that the process is administered evenhandedly under Arkansas law.",
    sections: [
      {
        heading: "What this office touches",
        paragraphs: [
          "Statewide election systems the public depends on—the infrastructure, software relationships, and coordination that keep lawful process on schedule.",
          "Voter registration infrastructure: the backbone data and procedures that support lawful registration and updates.",
          "Guidance and partnership with county election officials who do the front-line work.",
          "Election information for voters: deadlines, practical how-to, and plain-language help.",
          "Certification and official election processes where state law assigns that role.",
        ],
      },
      {
        heading: "What voters should expect",
        paragraphs: [
          "Clear rules—published, explained, and applied with consistency across counties.",
          "Accessible information—so ordinary citizens, not just insiders, can follow what happens and when.",
          "Consistent administration—one standard, faithfully explained.",
          "Respect for every lawful voter—access and safeguards held together, not treated as opposites.",
        ],
      },
    ],
  },
  layerTwo: {
    eyebrow: OFFICE_LAYER_EYEBROWS[2],
    title: "Why Election Administration Matters",
    intro:
      "Most people only notice election systems when something feels confusing, inconsistent, or unfair. The goal of the Secretary of State should be to prevent that confusion before it damages trust.",
    sections: [
      {
        heading: "For voters",
        paragraphs: [
          "Registration deadlines and clear notices should reach voters early—not as a surprise the week of a deadline.",
          "Voter information should anticipate real questions: how, where, by when, and what to expect next.",
          "The public deserves patient explanation of process so good-faith questions have somewhere authoritative to land.",
        ],
      },
      {
        heading: "For county election officials",
        paragraphs: [
          "Clerks and election teams deserve predictability from the state—steady guidance, training, and answers that match statute.",
          "Poll workers absorb pressure first; materials and instructions should match the workload they carry.",
        ],
      },
      {
        heading: "For small businesses and nonprofits",
        paragraphs: [
          "Employers coordinate time off, civic groups register members, and nonprofits run voter-education programs—all of which depend on reliable official information.",
          "When election rules shift without plain explanation, lawful participation narrows for operators who cannot afford a compliance team.",
        ],
      },
      {
        heading: "For local communities",
        paragraphs: [
          "Rural counties deserve the same seriousness as the largest county seat—consistency is a moral duty in administration.",
          "Trust is built before Election Day; confusion narrows access even when change is lawful if neighbors cannot plan.",
        ],
      },
      {
        heading: "Voter data deserves discipline",
        paragraphs: [
          "Voter information should be handled carefully, with technical and procedural seriousness.",
          "Sensitive election records should not be casually shared; access should follow clear legal authority and accountability.",
        ],
      },
    ],
  },
  layerThree: {
    eyebrow: OFFICE_LAYER_KELLY_EYEBROW,
    title: "What Kelly Brings: Elections",
    intro:
      "Election administration is a system people must trust under pressure. Kelly’s career and civic work prepared her for systems, training, and follow-through when volume spikes—not improvisation.",
    sections: [
      {
        heading: "Elections are operational, not rhetorical",
        paragraphs: [
          "Election confidence shows up in checklists, tested procedures, and honest answers when something breaks.",
          "Counties need consistency from the state: the same guidance, the same patience, the same respect for their workload.",
          "Voters need plain language—because civic process belongs to everyone.",
        ],
      },
      kellyBringsTelecomSection,
      kellyBringsCivicSection,
      {
        heading: "Stewardship under law",
        paragraphs: [
          "Kelly believes Arkansas elections should be administered under Arkansas law—with steadiness, transparent explanation, and careful handling of voter data as a public trust.",
          "Detailed election-administration positions on this site await campaign approval; see Why I'm running for the personal case Kelly makes for entering the race.",
        ],
      },
      kellyBringsStewardshipCloser,
    ],
    softCtas: STANDARD_OFFICE_LAYER_THREE_SOFT_CTAS,
  },
  layerTwoNextLabel: "What Kelly brings",
  relatedLinks: [
    { label: "Understand the Office", href: "/understand" },
    { label: "Why I'm running", href: "/about/why-im-running" },
    { label: "Meet Kelly", href: "/about" },
    { label: "Election listening sessions", href: "/listening-sessions" },
  ],
};
