/**
 * Elections — three-layer Office depth pathway (Layer 1 clarity → 2 relevance → 3 competence).
 *
 * Copy themes are aligned with the campaign’s public corpus (verified site content), including:
 * - `src/content/about/why-kelly-page.ts`, `src/content/home/trust-funnel-home.ts`
 * - `src/app/(site)/priorities/page.tsx`, `listening-sessions/page.tsx`, `what-we-believe/page.tsx`
 *
 * **Database:** When `DATABASE_URL` is available, run `npx tsx scripts/query-elections-corpus.ts`
 * to list `SyncedPost` / `InboundContentItem` rows tagged by title/excerpt for election keywords—
 * use output to cue future copy refinement (do not auto-ingest unreviewed rows into live copy).
 *
 * Guardrails: no unverified voter-file claims, no SSNs, no “first state” boasts, no opponent attacks,
 * no overstatement of SOS authority beyond lawful administration and systems the office actually runs.
 */

import type { OfficeAreaConfig } from "@/content/office/office-types";
import { STANDARD_OFFICE_LAYER_THREE_SOFT_CTAS } from "@/content/office/standard-layer-three-ctas";

export const electionsAreaConfig: OfficeAreaConfig = {
  slug: "elections",
  title: "Elections",
  shortTitle: "Elections",
  navLabel: "Elections",
  metaDescription:
    "What the Arkansas Secretary of State does in election administration: clear rules, secure systems, county partnership, and public confidence in an evenhanded process.",
  layerOne: {
    eyebrow: "The Office · Layer 1",
    title: "Elections",
    intro:
      "Free and fair elections require more than slogans. They require clear rules, secure systems, consistent communication with counties, and public confidence that the process is administered evenhandedly.",
    sections: [
      {
        heading: "What this office touches",
        paragraphs: [
          "Statewide election systems the public depends on—the infrastructure, software relationships, and coordination that keep lawful process on schedule.",
          "Voter registration infrastructure: the backbone data and procedures that support lawful registration and updates—handled with discipline, not improvisation.",
          "Guidance and partnership with county election officials who do the front-line work—the Secretary of State should make training, instructions, and answers reliable.",
          "Election information for voters: deadlines, practical how-to, and plain-language help so Arkansans aren’t left guessing.",
          "Certification and official election processes where state law assigns that role—done transparently, by the book.",
        ],
      },
      {
        heading: "What voters should expect",
        paragraphs: [
          "Clear rules—published, explained, and applied with consistency across counties.",
          "Accessible information—so ordinary citizens, not just insiders, can follow what happens and when.",
          "Consistent administration—one standard, faithfully explained, rather than whiplash from office to office or week to week.",
          "Respect for every lawful voter—access and safeguards held together, not treated as opposites.",
        ],
      },
      {
        heading: "Kelly’s promise, briefly",
        paragraphs: [
          "Non-partisan administration: the office runs the process; it does not pick sides.",
          "Transparent process: visibility beats rumor—neighbors should be able to learn how elections work without a decoder ring.",
          "Voter access and voter privacy together: lawful participation, with careful stewardship of sensitive information.",
          "People over Politics: competence and steadiness come before performance.",
        ],
      },
    ],
  },
  layerTwo: {
    eyebrow: "The Office · Layer 2",
    title: "Why Election Administration Matters",
    intro:
      "Most people only notice election systems when something feels confusing, inconsistent, or unfair. The goal of the Secretary of State should be to prevent that confusion before it damages trust.",
    sections: [
      {
        heading: "Trust is built before Election Day",
        paragraphs: [
          "Registration deadlines and clear notices should reach voters early—not as a surprise the week of a deadline.",
          "Voter information should anticipate real questions: how, where, by when, and what to expect next.",
          "County communication has to be steady: clerks and election officials deserve predictability from the state, not hourly pivots.",
          "Poll workers and election workers deserve clarity too—training and materials that match the pressure they’re under.",
          "The public deserves patient explanation of process—how safeguards fit together—so good-faith questions have somewhere authoritative to land.",
        ],
      },
      {
        heading: "Confusion narrows access",
        paragraphs: [
          "Unclear instructions waste time, create anxiety, and push people away from participation.",
          "Changing rules without patient explanation erodes confidence—even when change is lawful—because neighbors can’t plan.",
          "Hard-to-find information favors insiders; accessible information favors every county.",
          "Inconsistent answers from official channels are poison for trust—consistency is a moral duty in administration.",
        ],
      },
      {
        heading: "Voter data deserves discipline",
        paragraphs: [
          "Voter information should be handled carefully, with technical and procedural seriousness—not casual curiosity.",
          "Sensitive election records should not be casually shared; access should follow clear legal authority and accountability.",
          "When data moves, Arkansans should be able to trust there is a lawful reason and a responsible custodian.",
        ],
      },
      {
        heading: "Why Kelly says “Hold the Line”",
        paragraphs: [
          "Arkansas elections should be administered under Arkansas law—not under pressured exceptions invented for convenience.",
          "That means resisting national noise when it collides with state statute, and refusing partisan shortcuts from any direction.",
          "It does not mean fear, rumor, or conspiracy storytelling—it means calm, lawful stewardship people can recognize as evenhanded.",
        ],
      },
    ],
  },
  layerThree: {
    eyebrow: "The Office · Layer 3",
    title: "The Full Picture: Elections",
    intro:
      "Election administration is a system. Kelly’s life and career have prepared her to manage systems that people depend on under pressure—with standards, training, and follow-through that hold when volume spikes.",
    sections: [
      {
        heading: "Elections are systems people have to trust",
        paragraphs: [
          "Election confidence is operational—not just rhetorical. It shows up in checklists, tested procedures, and honest answers when something breaks.",
          "Rules must be clear before crunch time, not rewritten in the heat of a headline.",
          "Counties need consistency from the state: the same guidance, the same patience, the same respect for their workload.",
          "Voters need plain language—not because anyone is unsophisticated, but because civic process belongs to everyone.",
        ],
      },
      {
        heading: "What Kelly brings",
        paragraphs: [
          "Verizon leadership managing 800+ people taught scale: expectations, accountability, and culture—how an organization behaves when nobody is giving a speech.",
          "Recruiting, training, and a real management pipeline mean the work doesn’t depend on heroic individuals burning out.",
          "A high-pressure call-center operation on the Arkansas River is a daily lesson in volume spikes, deadlines, and consequences when details slip—similar muscles to peak election seasons.",
          "Systems that must work when demand spikes don’t reward improvisation—they reward preparation, drills, and humility.",
          "Training people without talking down to them matches election work: respect the citizen and respect the worker behind the table.",
        ],
      },
      {
        heading: "What grassroots organizing taught her",
        paragraphs: [
          "LEARNS referendum work was neighbor-to-neighbor education: lawful signature gathering with clear explanation of rules and deadlines.",
          "Sherwood petition headquarters turned a duplex into logistics—coordinates, supplies, and a stable base so volunteers weren’t left to invent process alone.",
          "Petition pickup and dropoff, notary support, and patient answers are the unglamorous work that keeps civic life lawful.",
          "When structure is understandable, people show up—that instinct is what counties need from the state as a partner.",
        ],
      },
      {
        heading: "What “Hold the Line” means",
        paragraphs: [
          "Holding the line means following Arkansas law faithfully.",
          "It means protecting voter access and respecting voter privacy—held together, not traded away under pressure.",
          "It means explaining the process in public, with steadiness and receipts—not leaving a vacuum for rumor.",
          "And it means refusing partisan pressure from any direction: the office administers; it doesn’t perform for a team jersey.",
        ],
      },
      {
        heading: "What voters can expect",
        paragraphs: [
          "Non-partisan administration and transparent explanations—visibility on purpose, not mystery.",
          "Consistent communication with counties and the public—so the story doesn’t change depending on who asks.",
          "Respect for every lawful voter—and careful handling of voter data as a public trust, not a convenience.",
        ],
      },
    ],
    softCtas: STANDARD_OFFICE_LAYER_THREE_SOFT_CTAS,
  },
  relatedLinks: [
    { label: "Understand the Office", href: "/understand" },
    { label: "Experience & Leadership", href: "/about/business" },
    { label: "Why this race matters", href: "/office/why-this-race-matters" },
    { label: "Election listening sessions", href: "/listening-sessions" },
  ],
};
