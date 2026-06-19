/**
 * Forum lab — current election law study (SOS debate prep).
 * Verify act numbers on Arkleg before public use; claims gate required.
 */
import {
  EP_FORUM_LAB_ELECTION_LAW_STUDY_HREF,
  EP_OPPOSITION_RESEARCH_HREF,
  epForumLabElectionLawTopicHref,
  epForumLabIntegrationDayHref,
} from "@/lib/election-plan/debate-prep-links";

export type ElectionLawStudyTopic = {
  id: string;
  title: string;
  summary: string;
  sections: Array<{ heading: string; body: string }>;
  anchorBills: Array<{ billNumber: string; label: string; note: string }>;
  debateLines: string[];
  claimsGate: string[];
  relatedTopicIds: string[];
};

export type ElectionLawStudyHub = {
  title: string;
  intro: string;
  studyOrder: string[];
  topics: ElectionLawStudyTopic[];
};

const TOPICS: ElectionLawStudyTopic[] = [
  {
    id: "sos-role-vs-legislature",
    title: "SOS role vs legislature",
    summary:
      "Secretary of State runs elections; senators write and vote on election law. Hammer's record is authorship — Kelly's case is administration and county partnership.",
    sections: [
      {
        heading: "What the SOS does",
        body:
          "The Arkansas Secretary of State oversees election administration statewide: ballot access coordination, voter registration systems, election calendars, and guidance to county clerks. Voters experience elections through county offices — the SOS is the statewide service desk.",
      },
      {
        heading: "What the legislature does",
        body:
          "The General Assembly enacts election statutes — deadlines, ballot formats, observer rules, complaint procedures. Senators sponsor and vote; they do not run county elections day to day.",
      },
      {
        heading: "Author vs administrator frame",
        body:
          "When Hammer cites bills he sponsored, Kelly answers as the administrator voters need: implementation, funding clarity, training, and fair rules. Do not argue motives — argue who will call balls and strikes for all 75 counties.",
      },
    ],
    anchorBills: [],
    debateLines: [
      "I am not running for the Senate — I am running to administer elections fairly for every county.",
      "Writing a bill is not the same as helping a clerk implement it on time.",
    ],
    claimsGate: [
      "Do not claim Hammer 'doesn't understand' elections without sourced quote.",
      "SOS statutory duties — verify current Arkansas code before debate.",
    ],
    relatedTopicIds: ["2021-integrity-package", "county-implementation-burden"],
  },
  {
    id: "2021-integrity-package",
    title: "2021 election integrity package",
    summary:
      "Hammer's signature election-law cluster from the 2021 session — frame as rule changes voters felt through counties, not abstract 'security wins.'",
    sections: [
      {
        heading: "Package pattern",
        body:
          "Forum and campaign rhetoric often bundles multiple 2021 bills as one 'integrity package.' For debate, name specific acts only after Arkleg verification — the pattern is: tighter procedures, new deadlines, and county operational load.",
      },
      {
        heading: "Kelly frame",
        body:
          "Agree on secure elections — add that security fails when counties lack training dollars and lead time. Pivot from package slogans to clerk partnership.",
      },
      {
        heading: "Opposition research",
        body:
          "Use the opposition research hub and bill operator playbooks for act numbers and enrollment status. Forum transcript summaries are starting points, not citations.",
      },
    ],
    anchorBills: [
      { billNumber: "SB486", label: "Election law cluster (verify act)", note: "Part of 2021 integrity theme — confirm enrolled text." },
      { billNumber: "SB487", label: "Election law cluster (verify act)", note: "Pair with county burden frame." },
      { billNumber: "SB488", label: "Election law cluster (verify act)", note: "Common Hammer cite — verify before stage." },
    ],
    debateLines: [
      "I want secure elections too — the question is whether counties got support when those rules changed.",
      "Integrity without implementation is an unfunded mandate on our clerks.",
    ],
    claimsGate: [
      "Package statistics from forum AI — mark needs_review.",
      "Act numbers must match Arkleg enrollment for this cycle.",
    ],
    relatedTopicIds: ["sos-role-vs-legislature", "anchor-bills-sb250-act350"],
  },
  {
    id: "county-implementation-burden",
    title: "County implementation burden",
    summary:
      "Every election-law change is a training cycle for understaffed county offices. Center clerks and voters in line — not partisan villains.",
    sections: [
      {
        heading: "Why counties matter",
        body:
          "Seventy-five counties implement what Little Rock passes. Rural voters trust their county clerk more than any candidate. Kelly's SOS service frame: funding clarity, statewide guidance, realistic timelines.",
      },
      {
        heading: "Implementation questions",
        body:
          "When Hammer claims a bill 'secured elections,' ask: What funding? What SOS guidance? What training timeline? Move abstract security to verifiable support.",
      },
      {
        heading: "People impact",
        body:
          "When rules change faster than training, voters see longer lines and confused poll workers. Frame as community burden — not fraud accusations without evidence.",
      },
    ],
    anchorBills: [
      { billNumber: "HB1457", label: "County administration cluster", note: "Verify act — county champion test trap." },
    ],
    debateLines: [
      "County clerks told us what they need: clear rules, training, and funding clarity.",
      "Security and accessibility fail when clerks are left holding the bag.",
    ],
    claimsGate: [
      "No clerk quotes without permission.",
      "No fabricated funding claims — cite votes or appropriations only when verified.",
    ],
    relatedTopicIds: ["anchor-bills-sb250-act350", "complaints-and-enforcement-act279"],
  },
  {
    id: "anchor-bills-sb250-act350",
    title: "SB250 → Act 350 (paper ballot / counting)",
    summary:
      "2023 primary-sponsored bill changing paper ballot marking and counting procedures — debate anchor when Hammer cites 'secure paper ballots.'",
    sections: [
      {
        heading: "What to verify",
        body:
          "SB250 became Act 350 in the 2023 session. Confirm enrolled text on Arkleg before citing counting procedure details or funding clauses.",
      },
      {
        heading: "Debate use",
        body:
          "Bring up when Hammer says 'integrity package' or 'secure paper ballots' without naming county cost. Direct answer → Act 350 → county training burden → Kelly SOS partnership.",
      },
      {
        heading: "Trap: integrity without counties",
        body:
          "Bait: 'I passed Act 350 to secure Arkansas elections.' Setup: What funding and SOS guidance did counties receive? Pivot if thin: security fails when clerks lack support.",
      },
    ],
    anchorBills: [{ billNumber: "SB250", label: "Act 350", note: "Curated playbook — verify act text." }],
    debateLines: [
      "I agree we need clear, trusted ballot procedures — the question is whether counties got support to implement Act 350.",
      "Seventy-five counties do not implement changes at the same speed — clerks need training dollars and lead time.",
    ],
    claimsGate: [
      "Run act-specific claims through claims ledger before paid boost.",
      "Do not say fraud without evidence or stolen-election framing.",
    ],
    relatedTopicIds: ["2021-integrity-package", "county-implementation-burden"],
  },
  {
    id: "complaints-and-enforcement-act279",
    title: "SB291 → Act 279 (complaints / enforcement)",
    summary:
      "2025 complaint deadline and enforcement changes — when debate turns to 'prosecuting fraud.'",
    sections: [
      {
        heading: "What to verify",
        body:
          "SB291 became Act 279 in the 2025 session. Verify complaint windows and enforcement scope on enrolled text before citing deadlines.",
      },
      {
        heading: "Kelly frame",
        body:
          "Prosecute real fraud — but do not shorten windows so lawful challenges cannot be heard. SOS sets clear public rules; counties should not absorb uneven enforcement culture.",
      },
      {
        heading: "Rebuttal angle",
        body:
          "Ask for Arkansas conviction data versus new complaint procedures added. Tough on real fraud — fair to lawful voters.",
      },
    ],
    anchorBills: [{ billNumber: "SB291", label: "Act 279", note: "Deadline claims require HIGH confidence act text." }],
    debateLines: [
      "Prosecute real fraud — but don't shorten windows so much that lawful challenges can't be heard.",
      "SOS sets clear, public rules so enforcement targets real wrongdoing, not confusion.",
    ],
    claimsGate: ["Deadline claims require act text HIGH confidence.", "No unsupported 'elections full of fraud' lines."],
    relatedTopicIds: ["county-implementation-burden"],
  },
  {
    id: "2025-direct-democracy-cluster",
    title: "2025 direct democracy / petition cluster",
    summary:
      "Hammer's 2025 bills add friction to initiatives and referendums — frame as continuity from 2021, not a fresh security pivot.",
    sections: [
      {
        heading: "Package pattern",
        body:
          "Five primary-sponsored bills (Acts 218, 240, 241, 274, 768) touch signature verification, canvasser registration, petition restrictions, and ballot title rules. Verify each on Arkleg before citing on stage.",
      },
      {
        heading: "Kelly frame",
        body:
          "Arkansas voters cherish ballot measures. SOS protects lawful signatures with transparent rules — courts resolve fights; the Secretary of State administers the process fairly.",
      },
      {
        heading: "Continuity trap",
        body:
          "When Hammer says 2025 is a new start, pivot to 2021: six election bills already shifted county burden. Ask what changed for clerks besides more paperwork.",
      },
    ],
    anchorBills: [
      { billNumber: "SB207", label: "Act 218", note: "Petition signature verification" },
      { billNumber: "SB208", label: "Act 240", note: "Canvasser registration" },
      { billNumber: "SB210", label: "Act 274", note: "Petition process restrictions" },
      { billNumber: "SB211", label: "Act 241", note: "Ballot title / summary rules" },
      { billNumber: "SB296", label: "Act 768", note: "Package capstone — verify text" },
    ],
    debateLines: [
      "Arkansas voters cherish ballot measures — I'll protect lawful signatures with transparent rules, not slogans.",
      "You sponsored six election bills in 2021 and petition bills in 2025 — what changed for county clerks?",
    ],
    claimsGate: [
      "Verify act numbers on Arkleg before stage.",
      "No fraud statistics without sourced data.",
      "Do not sound anti-petition or anti-direct-democracy.",
    ],
    relatedTopicIds: ["2021-integrity-package", "sos-role-vs-legislature"],
  },
  {
    id: "claims-gate-and-sources",
    title: "Claims gate & sources",
    summary:
      "Forum lab and AI summaries are intel — not debate citations. Verify before stage, editorial, or paid media.",
    sections: [
      {
        heading: "Source hierarchy",
        body:
          "1) Enrolled Arkansas acts on Arkleg. 2) Curated bill operator playbooks (marked verify). 3) Opposition research hub. 4) Forum transcript lab (needs_review until staff confirms).",
      },
      {
        heading: "Do-not-say list (election law)",
        body:
          "Fraud without evidence; stolen election framing; suppress-votes claims without act text; clerk corruption; poll watcher intimidation without act proof.",
      },
      {
        heading: "Tonight drill (Day 1 integration)",
        body:
          "Skim three topics: SOS vs legislature, 2021 package pattern, one anchor bill (SB250/Act 350). Practice one agree-add line aloud. Mark any forum quote needs_review.",
      },
    ],
    anchorBills: [],
    debateLines: ["I will cite the record — and I will cite what counties need to implement it."],
    claimsGate: ["All opponent quotes from forum — staff review before broadcast.", "No PII in practice logs."],
    relatedTopicIds: ["sos-role-vs-legislature", "anchor-bills-sb250-act350"],
  },
];

export function getElectionLawStudyHub(): ElectionLawStudyHub {
  return {
    title: "Current election law study",
    intro:
      "Study module for forum-lab Day 1 drill: review current election laws before debating Hammer's legislative record. Verify every act on Arkleg; run claims gate before public use.",
    studyOrder: [
      "sos-role-vs-legislature",
      "2021-integrity-package",
      "2025-direct-democracy-cluster",
      "county-implementation-burden",
      "anchor-bills-sb250-act350",
      "complaints-and-enforcement-act279",
      "claims-gate-and-sources",
    ],
    topics: TOPICS,
  };
}

export function getElectionLawStudyTopic(topicId: string): ElectionLawStudyTopic | undefined {
  return TOPICS.find((t) => t.id === topicId);
}

export function listElectionLawStudyTopics(): ElectionLawStudyTopic[] {
  return TOPICS;
}

export const ELECTION_LAW_STUDY_LINKS = {
  hub: EP_FORUM_LAB_ELECTION_LAW_STUDY_HREF,
  day1Integration: epForumLabIntegrationDayHref(1),
  oppositionResearch: EP_OPPOSITION_RESEARCH_HREF,
  topicHref: epForumLabElectionLawTopicHref,
};
