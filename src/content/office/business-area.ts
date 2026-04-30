/**
 * Business & Filings — three-layer Office depth pathway (Layer 1 clarity → 2 relevance → 3 competence).
 *
 * Copy stays within the Secretary of State’s lane; improvements are framed as priorities and approach,
 * not specific statutory or fee commitments unless separately verified and approved.
 */

import type { OfficeAreaConfig } from "@/content/office/office-types";
import { STANDARD_OFFICE_LAYER_THREE_SOFT_CTAS } from "@/content/office/standard-layer-three-ctas";

export const businessAreaConfig: OfficeAreaConfig = {
  slug: "business",
  title: "Business & Filings",
  shortTitle: "Business & Filings",
  navLabel: "Business & Filings",
  metaDescription:
    "How the Arkansas Secretary of State’s business services support registrations, filings, and public records employers and nonprofits rely on—with plain language and reliable process.",
  layerOne: {
    eyebrow: "The Office · Layer 1",
    title: "Business & Filings",
    intro:
      "The Secretary of State’s office is part of Arkansas’s economic infrastructure. When filings are clear, searchable, and understandable, small businesses, nonprofits, employers, and local organizations can spend less time fighting paperwork and more time doing their work.",
    sections: [
      {
        heading: "What this office touches",
        paragraphs: [
          "Business registrations—the on-ramps that let lawful entities form and operate in Arkansas with confidence.",
          "Annual reports and filings the law assigns to this office—timely, explained steps rather than mystery dates.",
          "Nonprofit filings that keep charities and civic organizations in good standing so donations and missions stay protected.",
          "Official business records maintained as the durable, public-facing history of what was filed.",
          "Searchable public information so lenders, partners, neighbors, and researchers can verify what the law expects to be visible.",
        ],
      },
      {
        heading: "What users should expect",
        paragraphs: [
          "Clear instructions written for humans who are busy—not manuals written only for specialists.",
          "Predictable steps you can plan around instead of guessing which door to knock on next.",
          "Forms and guidance that are easy to find—no treasure hunt just to comply.",
          "Responsive help culture: real people solving real dead ends, without attitude.",
          "Fewer loops and false finishes—the feeling that the process is on your side when you are trying to do things right.",
        ],
      },
      {
        heading: "Kelly’s promise, briefly",
        paragraphs: [
          "Plain language first—because respect starts with being understood.",
          "Reliable systems—what you are told today should still make sense tomorrow.",
          "Service-first administration—the office exists to serve Arkansans, not to impress a scoreboard.",
          "Respect for small business and nonprofit operators—thin margins, volunteer treasurers, and first-time filers deserve the same patience as anyone else.",
        ],
      },
    ],
  },
  layerTwo: {
    eyebrow: "The Office · Layer 2",
    title: "Why Business Filings Matter",
    intro:
      "A confusing filing system does not just inconvenience people. It costs time, money, momentum, and confidence—especially for small businesses, nonprofits, and local organizations operating with thin margins.",
    sections: [
      {
        heading: "Paperwork becomes a real cost",
        paragraphs: [
          "Missed deadlines can mean penalties, suspended authority, or reputational hits that are hard to unwind.",
          "Unclear forms steal hours that should go to customers, donors, or crops in the field.",
          "Duplicate steps and mystery portals stack frustration until some operators simply give up—or pay someone else to decode what should be public process.",
          "Every hour lost to confusion is time away from customers, members, employees, and family—the people counting on that business or mission to succeed.",
        ],
      },
      {
        heading: "Small operators feel friction first",
        paragraphs: [
          "Farmers and growers juggling seasons, suppliers, and cash flow do not have a compliance department on speed dial.",
          "Small businesses testing payroll for the first time need the state’s front door to feel doable.",
          "Nonprofits run by volunteers cannot afford a week lost to a form that never should have been a maze.",
          "Civic organizations doing lawful work deserve the same clarity as anyone else.",
          "Local entrepreneurs are the ones who translate a healthy filing culture into real hiring—and they notice when government feels indifferent.",
        ],
      },
      {
        heading: "Clear systems build confidence",
        paragraphs: [
          "People are more likely to comply when the rules read like something a neighbor could explain—not a puzzle designed to trip them.",
          "Plain-language guidance shrinks avoidable mistakes; most filers want to do the right thing if we show them how.",
          "Reliable systems help local economies function: lenders, insurers, and partners trust what they can verify quickly and fairly.",
        ],
      },
      {
        heading: "Kelly understands both sides of the counter",
        paragraphs: [
          "Corporate-scale systems leadership taught her how service operations behave when volume spikes—and how leadership shows up in the details.",
          "Forevermost Farms and small-operation life mean paperwork, planning, and margins that do not forgive confusion.",
          "Nonprofit and civic organizing reinforced that volunteers need process explained with patience, not patronizing shortcuts.",
        ],
      },
    ],
  },
  layerThree: {
    eyebrow: "The Office · Layer 3",
    title: "The Full Picture: Business & Filings",
    intro:
      "Business services are not just paperwork. They are a public-facing system that affects whether people can start, maintain, and understand their legal responsibilities in Arkansas.",
    sections: [
      {
        heading: "Business filings are economic infrastructure",
        paragraphs: [
          "Filings, records, and registrations are part of how commerce functions—who exists, who is in good standing, and what the public can verify.",
          "When systems are confusing, the cost does not disappear—it shifts onto citizens who were trying to follow the law.",
          "Good administration makes compliance easier without lowering standards: clearer rails, same guardrails.",
        ],
      },
      {
        heading: "What Kelly brings from Verizon",
        paragraphs: [
          "Managing 800+ people meant expectations, accountability, and culture—not speeches about service, but service measured at scale.",
          "Recruiting, training, and a management pipeline meant reliability did not depend on one heroic employee answering every question.",
          "System design and operations taught her to see the whole workflow: where filers stumble, where counties get caught in the middle, and where a small fix prevents a pile-up.",
          "Customer-facing accountability under pressure is everyday habit—deadlines do not negotiate because the calendar moved.",
        ],
      },
      {
        heading: "What Kelly learned from Forevermost Farms",
        paragraphs: [
          "Small operators live with real paperwork: permits, vendors, equipment, cash flow, and the trust of neighbors who buy from you year after year.",
          "When margins are thin, confusion from government hits harder—lawful work should not feel harder because instructions were written for someone else’s convenience.",
        ],
      },
      {
        heading: "What civic organizing taught her",
        paragraphs: [
          "People need process explained plainly—the first time, and the fifth time, without making anyone feel small for asking.",
          "Rules should not be a maze; clarity is how participation grows.",
          "When people understand what to do, they show up and follow through—that instinct belongs inside the Secretary of State’s customer experience.",
        ],
      },
      {
        heading: "What users can expect",
        paragraphs: [
          "Plain-language guides and clearer public-facing explanations—priorities Kelly will push for within the law and resources available.",
          "Consistency: the same patient standard whether you are filing in Pulaski or a rural county with one broadband bar.",
          "Respect for every filer—from the first-time LLC to the treasurer juggling a school booster club.",
          "A better service culture: administration that treats business services like the economic front door they are.",
        ],
      },
    ],
    softCtas: STANDARD_OFFICE_LAYER_THREE_SOFT_CTAS,
  },
  relatedLinks: [
    { label: "Understand the Office", href: "/understand" },
    { label: "Experience & Leadership", href: "/about/business" },
    { label: "Why this race matters", href: "/office/why-this-race-matters" },
  ],
};
