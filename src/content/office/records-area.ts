/**
 * Transparency & Records — three-layer Office depth pathway (Layer 1 clarity → 2 relevance → 3 competence).
 *
 * Copy stays within the Secretary of State’s statutory lane: public-facing records and systems this office
 * actually controls—not every agency in state government. Improvements are framed as priorities and
 * operating approach, not invented reforms or unverified allegations.
 */

import { getJoinCampaignHref } from "@/config/external-campaign";
import { voterRegistrationHref } from "@/config/navigation";
import type { OfficeAreaConfig } from "@/content/office/office-types";

export const recordsAreaConfig: OfficeAreaConfig = {
  slug: "records",
  title: "Transparency & Records",
  shortTitle: "Transparency & Records",
  navLabel: "Transparency & Records",
  metaDescription:
    "How the Arkansas Secretary of State supports transparent access to public records and official information within the office’s authority—plain language, clear paths, and accountable stewardship.",
  layerOneNextLabel: "See why transparency matters",
  layerOne: {
    eyebrow: "The Office · Layer 1",
    title: "Transparency & Records",
    intro:
      "Public records are part of public trust. Arkansans should be able to find official information, understand what it means, and know that government records within this office’s responsibility are maintained clearly and responsibly.",
    sections: [
      {
        heading: "What this office touches",
        paragraphs: [
          "Public-facing records the Secretary of State is responsible for publishing, maintaining, or indexing under law—not every record held anywhere in state government.",
          "Official filings and state information systems that fall under SOS authority, so searches and disclosures match what statute actually assigns to this office.",
          "Searchable information where the office provides it: labels, indexes, and navigation that help people find answers without insider training.",
          "Election- and business-related public information where applicable—always within the boundaries of what this office lawfully holds and shares.",
        ],
      },
      {
        heading: "What people should expect",
        paragraphs: [
          "Clear access points—obvious paths for “start here” instead of a scavenger hunt.",
          "Plain-language guidance that respects citizens, reporters, and small-town clerks alike.",
          "Records organized so lawful disclosure is understandable, not buried in jargon.",
          "Public systems that do not feel hidden behind bureaucracy—patience and competence, not intimidation.",
        ],
      },
      {
        heading: "Kelly’s promise, briefly",
        paragraphs: [
          "Transparent administration: visibility on purpose, with honest boundaries where the law requires redaction or delay.",
          "Plain explanations so neighbors can learn how things work without feeling lectured.",
          "Accessible public information treated as a service obligation, not a favor.",
          "Service for all 75 counties—urban researchers and rural treasurers deserve the same respectful front door.",
        ],
      },
    ],
  },
  layerTwo: {
    eyebrow: "The Office · Layer 2",
    title: "Why Transparency & Records Matter",
    intro:
      "When public information is hard to find, hard to understand, or hard to trust, people disengage. Transparent systems help citizens, businesses, journalists, watchdogs, counties, and community leaders make informed decisions.",
    sections: [
      {
        heading: "Confusion creates distance",
        paragraphs: [
          "People give up when systems require a map they were never handed.",
          "Public trust drops when answers feel hidden—even when the law is being followed—because the explanation never reached the public.",
          "Unclear instructions waste time for filers, clerks, and reporters who are all trying to do lawful work.",
        ],
      },
      {
        heading: "Records affect real life",
        paragraphs: [
          "Voters checking information before deadlines—they need clarity, not a runaround.",
          "Businesses and nonprofits verifying filings and good-standing—they need predictability for payroll, grants, and contracts.",
          "Citizens looking for official guidance on what the Secretary of State’s office actually publishes.",
          "Reporters and community leaders tracking public actions—they depend on organized disclosure and usable archives.",
        ],
      },
      {
        heading: "Transparency is a service standard",
        paragraphs: [
          "Access should be clear: where to ask, what to expect next, and how long a lawful process may take.",
          "Guidance should be understandable: if only specialists can follow it, the public is cut out.",
          "Public systems should respect people’s time—courtesy and competence are part of democracy working.",
        ],
      },
      {
        heading: "Kelly’s lens",
        paragraphs: [
          "She has trained adults through complex systems—patience, repetition, and dignity at the counter matter.",
          "She has managed large operations where variance turns into public failure if you do not design for real humans.",
          "She believes process should be explained, not guarded—secrecy by accident is still a failure of service.",
        ],
      },
    ],
  },
  layerThree: {
    eyebrow: "The Office · Layer 3",
    title: "The Full Picture: Transparency & Records",
    intro:
      "Transparency is not just a value. It is an operating practice. Public records only build trust when people can access them, understand them, and rely on the systems behind them.",
    sections: [
      {
        heading: "Transparency is operational",
        paragraphs: [
          "Transparency requires organized systems: owners, checklists, and searchable paths—not a poster on the wall.",
          "Records must be findable and understandable; archives nobody can navigate do not serve the public.",
          "Public-facing information should not require insider knowledge—if the insider is the only one who can use it, the job is unfinished.",
        ],
      },
      {
        heading: "What Kelly brings from Verizon",
        paragraphs: [
          "Managing 800+ people taught that standards and follow-through show up in how outsiders experience your organization.",
          "Training and process design mean the public does not depend on whichever employee happened to answer the phone that day.",
          "Operational accountability is measurable: Did the request get logged? Did the answer ship? Can someone find it again next month?",
          "Customer-facing clarity under pressure matches election cycles and filing seasons—deadlines do not wait for perfect moods.",
          "Systems that work when scrutiny spikes are the only systems that deserve public trust.",
        ],
      },
      {
        heading: "What Kelly learned from civic organizing",
        paragraphs: [
          "Sherwood petition headquarters showed how volunteers stall when rules, forms, and deadlines are not explained with patience.",
          "People needed plain explanations—not because anyone was incapable, but because civic life belongs to everyone.",
          "When process is understandable, more people participate; when it is opaque, democracy narrows to the few with time to fight the maze.",
          "Democracy works better when people can learn their way through it—that mindset belongs in records and public guidance.",
        ],
      },
      {
        heading: "What transparency should feel like",
        paragraphs: [
          "Fewer dead ends: if something cannot be disclosed, say so plainly and point to the lawful reason.",
          "Clearer public guidance so first-time filers and veteran reporters see the same honest map.",
          "Organized records and indexes so the office models what accountable stewardship looks like within its lane.",
          "Responsive service when someone is stuck—human help, not a shrug.",
          "Honest explanations when systems are confusing—repair the process instead of blaming the user.",
        ],
      },
      {
        heading: "What Arkansans can expect",
        paragraphs: [
          "Non-partisan administration of public information—consistent standards, not selective sunshine.",
          "Public information treated as a public service: timely, respectful, lawful.",
          "Plain-language access priorities Kelly will advance within statute and resources—not a promise to control every agency’s files.",
          "Accountable maintenance of records under this office’s authority, with humility when fixes take time.",
        ],
      },
    ],
    softCtas: [
      { label: "Why Kelly", href: "/about/why-kelly" },
      { label: "Meet Kelly", href: "/about" },
      { label: "Vote / Register", href: voterRegistrationHref },
      { label: "Volunteer", href: getJoinCampaignHref() },
    ],
  },
  relatedLinks: [
    { label: "Understand the Office", href: "/understand" },
    { label: "Priorities — transparency", href: "/priorities#transparency-heading" },
    { label: "Why this race matters", href: "/office/why-this-race-matters" },
  ],
};
