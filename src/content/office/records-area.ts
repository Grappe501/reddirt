/**
 * Transparency & Records — Office trust pillar: accountability and credibility.
 * Layer model: clarity → why it matters → full picture (why Kelly fits).
 *
 * People should not need to be experts to understand their own government—that line anchors public copy.
 * Substantively, stay within the Secretary of State’s lane: public-facing records and official filings
 * and information systems this office maintains—not every record in Arkansas. No invented reforms,
 * no unverified allegations, no claiming SOS controls all state agencies’ files.
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
    "Transparency and public records under the Secretary of State’s authority—plain language and useful paths so Arkansans are not expected to be experts to understand their own government.",
  layerOneNextLabel: "See why transparency matters",
  layerOne: {
    eyebrow: "The Office · Layer 1",
    title: "Transparency & Records",
    intro:
      "Public records are part of public trust—and trust starts with respect. You should not need to be an expert to understand your own government. Arkansans ought to find official information within this office’s authority, understand what it means, and know it is kept clearly and responsibly.",
    sections: [
      {
        heading: "What this office touches",
        paragraphs: [
          "Public-facing records the Secretary of State publishes, maintains, or indexes under law—always “within the office’s authority,” not every filing cabinet in state government.",
          "Official filings and state information systems assigned to this office, so what you search is what statute actually places here.",
          "Searchable public-facing systems where the office provides them—navigation and labels meant for neighbors, not just specialists.",
          "Election- and business-related public information where applicable—released and organized lawfully, in plain sight where the rules allow.",
        ],
      },
      {
        heading: "What people should expect",
        paragraphs: [
          "Clear access points: a front door you can find on the first try, not a maze of PDFs and dead links.",
          "Plain-language guidance that says what to do next—in words a busy parent or a small-town treasurer can use.",
          "Records and official information that are organized and understandable, so lawful disclosure actually helps someone.",
          "Public systems that do not feel hidden behind bureaucracy—you are a citizen, not a nuisance ticket in a queue.",
        ],
      },
      {
        heading: "Kelly’s promise, briefly",
        paragraphs: [
          "Transparent administration: sunlight on purpose, and honest words when the law says “not this week” or “redacted for privacy.”",
          "Plain explanations—because dignity and democracy both start with being understood.",
          "Accessible public information: if it belongs in public view, your office should help you get there.",
          "Service for all 75 counties—the same patient standard for a reporter in Little Rock and a volunteer clerk in a rural county seat.",
        ],
      },
    ],
  },
  layerTwo: {
    eyebrow: "The Office · Layer 2",
    title: "Why Transparency & Records Matter",
    intro:
      "When public information is hard to find, hard to understand, or hard to trust, people quietly disengage—and democracy gets smaller. Transparent systems help citizens, businesses, journalists, watchdogs, counties, and community leaders make grounded decisions without needing a backstage pass.",
    sections: [
      {
        heading: "Confusion creates distance",
        paragraphs: [
          "People give up when the path is a riddle. That is not laziness; it is time and dignity running out.",
          "Trust slips when answers feel hidden—even when someone is following the rulebook—because nobody took the extra step to explain it in public.",
          "Unclear instructions waste hours for filers, clerks, and reporters who were all trying to do the right thing the first time.",
        ],
      },
      {
        heading: "Records affect real life",
        paragraphs: [
          "A voter checking a deadline before work—clarity saves a ballot, not just a mood.",
          "A shop owner or nonprofit treasurer verifying good standing—predictable records protect payrolls, grants, and grocery money.",
          "Neighbors looking for official guidance on what this office actually publishes deserve a straight answer without a scavenger hunt.",
          "Reporters and community leaders following public actions—they need archives that work, not paywalls of confusion.",
        ],
      },
      {
        heading: "Transparency is a service standard",
        paragraphs: [
          "Access should be clear: where to start, what happens next, and what “reasonable time” looks like under the law.",
          "Guidance should be understandable—if only insiders can parse it, the public never got a fair shot.",
          "Public systems should respect people’s time; courtesy is part of legitimacy.",
        ],
      },
      {
        heading: "Kelly’s lens",
        paragraphs: [
          "She has trained adults through complex systems—measured in patience, repetition, and never making someone feel small for asking twice.",
          "She has run large operations where sloppy process becomes public failure; she builds for the person at the counter.",
          "She believes process should be explained, not guarded—secrecy by accident is still a broken experience.",
        ],
      },
    ],
  },
  layerThree: {
    eyebrow: "The Office · Layer 3",
    title: "The Full Picture: Transparency & Records",
    intro:
      "Transparency is not a poster slogan. It is how you operate when nobody is clapping. Public records only build credibility when people can reach them, understand them, and depend on the systems behind them—still without being expected to be experts in their own government.",
    sections: [
      {
        heading: "Transparency is operational",
        paragraphs: [
          "It takes organized systems: owners, timelines, and searchable paths—not good intentions filed in a drawer.",
          "Records must be findable and understandable; an archive only insiders can use is not yet a public archive.",
          "Public-facing information should not require insider knowledge—if the map only works for staff, the public is still lost.",
        ],
      },
      {
        heading: "What Kelly brings from Verizon",
        paragraphs: [
          "Managing 800+ people drilled a simple test: does the outside world experience competence, or only the inside memo?",
          "Training and process design mean answers do not depend on who picked up the phone on Tuesday.",
          "Operational accountability can be checked: Was the request logged? Did the answer go out? Can someone find it again next month?",
          "Customer-facing clarity under pressure matches filing seasons and election cycles—volume shows up whether you are ready or not.",
          "Systems that hold up when scrutiny spikes are the ones that earn public trust.",
        ],
      },
      {
        heading: "What Kelly learned from civic organizing",
        paragraphs: [
          "Sherwood petition headquarters proved how fast goodwill freezes when rules, forms, and deadlines are not explained with patience.",
          "Volunteers needed plain language—not because anyone lacked grit, but because civic life belongs to everyone who shows up.",
          "When process is understandable, more people step forward; when it is opaque, participation narrows to those with time to fight the maze.",
          "Democracy works better when people can learn their way through—that habit belongs in how this office treats records and guidance.",
        ],
      },
      {
        heading: "What transparency should feel like",
        paragraphs: [
          "Fewer dead ends—if disclosure cannot happen, say so plainly and cite the lawful reason.",
          "Clearer public guidance so a first-time filer and a seasoned reporter read the same honest map.",
          "Organized official filings and information the office maintains—indexes and labels that signal respect for the public’s time.",
          "Responsive service when someone is stuck—a real person helping, not a shrug.",
          "Honest explanations when a system is confusing—fix the process instead of blaming the neighbor who got lost.",
        ],
      },
      {
        heading: "What Arkansans can expect",
        paragraphs: [
          "Non-partisan administration of public-facing information—predictable standards, not selective sunshine.",
          "Public information treated as a public service: timely, respectful, and lawful.",
          "Plain-language access priorities Kelly will advance within statute and resources—without pretending the SOS runs every agency’s records room.",
          "Accountable stewardship of records under this office’s authority—including humility when improvement takes more than one news cycle.",
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
