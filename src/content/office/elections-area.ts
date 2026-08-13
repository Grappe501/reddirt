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
    "Duties of the Arkansas Secretary of State in elections: statewide voter registration, candidate and petition filings, ballot certification, returns, voting equipment, and chair of the State Board of Election Commissioners.",
  layerOne: {
    eyebrow: OFFICE_LAYER_EYEBROWS[1],
    title: "Elections",
    intro:
      "State law names the Secretary of State Arkansas’s chief election official. The office administers state and federal elections together with the State Board of Election Commissioners and with county clerks and county boards of election commissioners in all 75 counties.",
    sections: [
      {
        heading: "What the Elections Division does",
        paragraphs: [
          "It keeps the state’s election records and helps county officials conduct federal, state, and district elections.",
          "It maintains Arkansas’s uniform statewide voter registration system and helps the state meet federal requirements such as the National Voter Registration Act and the Help America Vote Act.",
          "It oversees training on the state’s electronic voting systems and answers questions on voting equipment.",
          "It receives candidate filings for U.S. Senate, U.S. House, state, and district offices; files and reviews ballot-access and ballot-measure petitions; and certifies the candidate and measure list for ballot placement.",
          "It compiles county election returns, reports results, and publishes current and historical election results, including historical initiative and referendum results.",
          "It hosts a public search for ethics filings that candidates and officials submit through the state’s ethics process. The Arkansas Ethics Commission remains the ethics regulator.",
        ],
      },
      {
        heading: "Chair of the State Board of Election Commissioners",
        paragraphs: [
          "By statute, the Secretary of State is chair and secretary of the seven-member State Board of Election Commissioners.",
          "The Board trains county election commissioners and election officials, monitors compliance with election law, investigates complaints of alleged misconduct, and distributes state funds to counties for specified elections.",
          "Those Board duties sit beside—not instead of—the Elections Division’s filing, registration, equipment, and results work.",
        ],
      },
      {
        heading: "Where county officials remain in charge",
        paragraphs: [
          "County clerks and county boards of election commissioners run polling places, appoint poll workers, and administer Election Day in each county.",
          "The State Board’s procedures manual sends voter registration, candidate filing, petitions, tabulation, certification, voting equipment, and interpretation of election laws to the Secretary of State. It sends general procedures, complaints, monitors, reimbursement, and poll-worker training to the Board.",
          "The Secretary of State also sits on the Arkansas Board of Apportionment, the three-member body that draws state legislative districts after each census.",
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
          "Kelly believes Arkansas elections should be administered under Arkansas law—with steadiness, transparent explanation, and careful handling of voter data as a public trust. Read Why I'm running for the personal case Kelly makes for entering the race.",
        ],
      },
      kellyBringsStewardshipCloser,
    ],
    softCtas: STANDARD_OFFICE_LAYER_THREE_SOFT_CTAS,
  },
  layerTwoNextLabel: "What Kelly brings",
  relatedLinks: [
    { label: "Arkansas Secretary of State — Elections", href: "https://www.sos.arkansas.gov/elections" },
    { label: "Duties of the office (official)", href: "https://www.sos.arkansas.gov/about-the-office/duties-of-the-office" },
    { label: "State Board of Election Commissioners", href: "https://sbec.arkansas.gov/about-us/" },
    { label: "Understand the Office", href: "/understand" },
    { label: "Why I'm running", href: "/about/why-im-running" },
    { label: "Meet Kelly", href: "/about" },
  ],
};
