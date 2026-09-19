import type { ElectionAdvisoryTopic } from "./catalog";

export type AeacSourceKind = "law" | "agency" | "research" | "data";

export type AeacSource = {
  label: string;
  href: string;
  kind: AeacSourceKind;
};

export type AeacGlossaryTerm = {
  slug: string;
  term: string;
  aliases: string[];
  category: "commission" | "process" | "law" | "security" | "data";
  shortDefinition: string;
  whyItMatters: string;
  sections: { heading: string; body: string }[];
  relatedTopics: ElectionAdvisoryTopic[];
  relatedSlugs: string[];
  sources: AeacSource[];
};

function t(term: AeacGlossaryTerm): AeacGlossaryTerm {
  return term;
}

export const aeacGlossary: AeacGlossaryTerm[] = [
  t({
    slug: "nonpartisan",
    term: "Nonpartisan",
    aliases: ["nonpartisan", "Nonpartisan"],
    category: "commission",
    shortDefinition: "Not working for a political party. The job is the facts and the process, not a campaign win.",
    whyItMatters:
      "People will only trust this Commission if they can see that it is not a Republican or Democratic project. It is a place to test Arkansas election questions with evidence.",
    sections: [
      {
        heading: "What this means here",
        body: "A nonpartisan body can still include people with strong views. The rule is that the Commission does not start with a party answer. It starts with a question, then looks at Arkansas law, county practice, and data.",
      },
      {
        heading: "What it is not",
        body: "Nonpartisan does not mean quiet or weak. It means the Commission will not treat a concern as true or false because of who raised it. Paper-ballot advocates and election-security advocates both belong in the room if they will work from evidence.",
      },
    ],
    relatedTopics: ["transparency_voter_education"],
    relatedSlugs: ["advisory-body", "evidence", "facilitator"],
    sources: [
      { label: "National Association of Secretaries of State", href: "https://www.nass.org/", kind: "agency" },
      { label: "U.S. Election Assistance Commission", href: "https://www.eac.gov/", kind: "agency" },
    ],
  }),
  t({
    slug: "advisory-body",
    term: "Advisory body",
    aliases: ["advisory body", "advisory", "working body"],
    category: "commission",
    shortDefinition: "A group that studies a problem and recommends answers. It does not make the final legal order.",
    whyItMatters:
      "Arkansas elections are run by county officials under state law. This Commission can advise. It cannot replace a clerk, a county board, or a court.",
    sections: [
      {
        heading: "Power and limits",
        body: "An advisory body publishes findings and recommendations. County election officials and state officers keep their legal duties. That limit is a feature: it keeps the Commission from pretending it can command a county.",
      },
      {
        heading: "Why the charter says this out loud",
        body: "If the public thinks this is a new state agency, trust drops when a recommendation is not instantly law. The honest frame is: listen, study, write it down, and leave the legal duty where Arkansas law put it.",
      },
    ],
    relatedTopics: ["transparency_voter_education"],
    relatedSlugs: ["statutory", "legal-responsibilities", "secretary-of-state"],
    sources: [
      { label: "Arkansas Secretary of State — Elections", href: "https://www.sos.arkansas.gov/elections", kind: "agency" },
    ],
  }),
  t({
    slug: "charter",
    term: "Charter",
    aliases: ["charter", "Founding Charter", "founding charter"],
    category: "commission",
    shortDefinition: "The written rules for why the Commission exists and how it will work.",
    whyItMatters:
      "A charter is the public promise. If later work drifts, anyone can hold the Commission to this page.",
    sections: [
      {
        heading: "What to look for in this charter",
        body: "The founding charter states the mission, the goal, the charge, and the working rules. It is not a campaign platform. It is the standard the Commission will use when members disagree.",
      },
    ],
    relatedTopics: ["transparency_voter_education"],
    relatedSlugs: ["charge", "nonpartisan", "advisory-body"],
    sources: [],
  }),
  t({
    slug: "charge",
    term: "Charge",
    aliases: ["Our Charge", "the charge", "The charge"],
    category: "commission",
    shortDefinition: "The list of jobs the Commission is asked to take on — from registration through certification.",
    whyItMatters:
      "Without a charge, a group talks about whatever is loud that week. The charge keeps the work on Arkansas election administration.",
    sections: [
      {
        heading: "How to read the charge",
        body: "The charge is grouped before, during, and after Election Day, plus issues that run all year. Each item can become a finding later. People who disagree on methods should still be able to work the same list.",
      },
    ],
    relatedTopics: ["transparency_voter_education"],
    relatedSlugs: ["election-administration", "certification", "charter"],
    sources: [],
  }),
  t({
    slug: "transparency",
    term: "Transparency",
    aliases: ["transparency", "Transparency", "transparent"],
    category: "commission",
    shortDefinition: "Letting people see the work: notes, sources, and reasons — not just a press line.",
    whyItMatters:
      "Trust is not created by saying “trust us.” It is created when a voter, a clerk, or a critic can inspect the same record.",
    sections: [
      {
        heading: "What the Commission will publish",
        body: "Meeting minutes, findings, supporting information, and recommendations belong on this site. Some working sessions may be structured so people can speak candidly. The public product still has to be visible.",
      },
      {
        heading: "Arkansas public-record context",
        body: "Arkansas has open-meetings and Freedom of Information rules for public bodies. This Commission is being organized as an advisory effort, not a hidden caucus. The working rule is: if a conclusion is public, the basis should be public too.",
      },
    ],
    relatedTopics: ["transparency_voter_education", "results_transparency"],
    relatedSlugs: ["minutes", "findings", "foia", "open-meetings"],
    sources: [
      { label: "Arkansas Freedom of Information Act overview (Attorney General)", href: "https://arkansasag.gov/arkansas-foia/", kind: "law" },
    ],
  }),
  t({
    slug: "accountability",
    term: "Accountability",
    aliases: ["accountability", "accountable"],
    category: "commission",
    shortDefinition: "Being able to say who did what, when, and why — and who will fix a mistake.",
    whyItMatters:
      "Elections fail in the dark. If a step cannot be named, it cannot be checked.",
    sections: [
      {
        heading: "In election work",
        body: "Accountability is a paper trail and a person. Chain of custody, canvass records, and published audit results are how the public sees that someone owned each step.",
      },
    ],
    relatedTopics: ["verification_physical_security", "results_transparency"],
    relatedSlugs: ["chain-of-custody", "transparency", "canvass"],
    sources: [],
  }),
  t({
    slug: "evidence",
    term: "Evidence",
    aliases: ["evidence", "objective evidence"],
    category: "commission",
    shortDefinition: "Facts you can check: law, data, county records, and tests — not a rumor or a vibe.",
    whyItMatters:
      "The charter says the Commission will not start with a chosen machine, bill, or conclusion. Evidence is the substitute for that.",
    sections: [
      {
        heading: "What counts",
        body: "Arkansas Code, county procedures, equipment certification files, audit reports, Census and labor data when they explain staffing or access, and sworn or recorded public testimony. Social posts are leads, not proof.",
      },
    ],
    relatedTopics: ["transparency_voter_education", "post_election_audits"],
    relatedSlugs: ["predetermined", "findings", "post-election-audits"],
    sources: [
      { label: "U.S. Census Bureau", href: "https://www.census.gov/", kind: "data" },
      { label: "Election Assistance Commission research", href: "https://www.eac.gov/", kind: "research" },
    ],
  }),
  t({
    slug: "predetermined",
    term: "Predetermined conclusion",
    aliases: ["predetermined conclusion", "predetermined", "predetermined answer"],
    category: "commission",
    shortDefinition: "Deciding the answer before looking at the facts.",
    whyItMatters:
      "The charter forbids that habit. If the ending is written first, the meeting is theater.",
    sections: [
      {
        heading: "How the Commission will resist it",
        body: "Start with the question. Hear people who disagree. Write down what Arkansas law already requires. Then recommend a change only if the record supports it.",
      },
    ],
    relatedTopics: ["transparency_voter_education"],
    relatedSlugs: ["evidence", "nonpartisan", "facilitator"],
    sources: [],
  }),
  t({
    slug: "deliberative",
    term: "Deliberative",
    aliases: ["deliberative", "Deliberative"],
    category: "commission",
    shortDefinition: "A careful talk aimed at a decision, not a rally or a debate for points.",
    whyItMatters:
      "Some meetings need candor so people can change their minds. The public still gets the minutes and the finding.",
    sections: [
      {
        heading: "Candor and the public record",
        body: "A deliberative session can be structured so members speak plainly. That is not the same as secrecy. The Commission’s product — notes, findings, sources — is what earns trust.",
      },
    ],
    relatedTopics: ["transparency_voter_education"],
    relatedSlugs: ["minutes", "facilitator", "transparency"],
    sources: [],
  }),
  t({
    slug: "facilitator",
    term: "Facilitator",
    aliases: ["facilitator", "nonpartisan facilitator", "third-party"],
    category: "commission",
    shortDefinition: "A neutral person who runs the meeting so no one side owns the microphone.",
    whyItMatters:
      "This room will hold paper-ballot passion and security-confidence passion. A third-party facilitator keeps the clock, the queue, and the ground rules.",
    sections: [
      {
        heading: "What a good facilitator does",
        body: "They do not pick the policy. They make sure county officials, skeptics, and experts each get a real turn, and that the group leaves with written next steps instead of a shouting match.",
      },
    ],
    relatedTopics: ["transparency_voter_education"],
    relatedSlugs: ["nonpartisan", "deliberative", "kickoff"],
    sources: [],
  }),
  t({
    slug: "statutory",
    term: "Statutory",
    aliases: ["statutory", "not a statutory"],
    category: "law",
    shortDefinition: "Created by a written state law. This Commission is not that — not yet, and not by itself.",
    whyItMatters:
      "If we called this a state commission without a statute, we would be claiming a power the General Assembly did not grant.",
    sections: [
      {
        heading: "Why the about page says this",
        body: "The site is honest: this is an independent advisory effort. A future law could create a standing body. Until then, recommendations are public advice, not a statute.",
      },
    ],
    relatedTopics: ["transparency_voter_education"],
    relatedSlugs: ["advisory-body", "legal-responsibilities", "arkansas-code-title-7"],
    sources: [
      { label: "Arkansas Code search", href: "https://www.arkleg.state.ar.us/Home/FTPDocument?path=%2FACTS%2F2023R%2FPublic%2F", kind: "law" },
    ],
  }),
  t({
    slug: "legal-responsibilities",
    term: "Legal responsibilities",
    aliases: ["legal responsibilities", "legal duties"],
    category: "law",
    shortDefinition: "The jobs the law already assigns to clerks, county boards, and state officers.",
    whyItMatters:
      "The Commission respects those jobs. It studies them. It does not take them.",
    sections: [
      {
        heading: "Who already holds the duty",
        body: "In Arkansas, county election officials administer elections under Title 7 and related rules. The Secretary of State has statewide election duties set by law. Courts resolve many disputes. Advice from this Commission does not move those lines.",
      },
    ],
    relatedTopics: ["county_staffing_poll_workers"],
    relatedSlugs: ["county-election-officials", "secretary-of-state", "statutory"],
    sources: [
      { label: "Arkansas Secretary of State — Elections", href: "https://www.sos.arkansas.gov/elections", kind: "agency" },
    ],
  }),
  t({
    slug: "minutes",
    term: "Minutes",
    aliases: ["minutes", "meeting minutes"],
    category: "commission",
    shortDefinition: "The official written record of what a meeting decided and what it reviewed.",
    whyItMatters:
      "If it is not in the minutes, the public cannot tell work from memory.",
    sections: [
      {
        heading: "What good minutes include",
        body: "Who was present, what was on the agenda, what documents were used, what was decided, and what was left open. They are not a word-for-word transcript unless the Commission chooses to publish one.",
      },
    ],
    relatedTopics: ["transparency_voter_education"],
    relatedSlugs: ["findings", "transparency", "open-meetings"],
    sources: [],
  }),
  t({
    slug: "findings",
    term: "Findings",
    aliases: ["findings", "Findings"],
    category: "commission",
    shortDefinition: "A written conclusion the Commission is willing to stand behind, with sources.",
    whyItMatters:
      "A finding is stronger than a vibe and weaker than a law. It is the public product of the work.",
    sections: [
      {
        heading: "How a finding should look",
        body: "A plain-language summary, the question asked, the evidence used, what remains uncertain, and any recommendation. Nothing is posted yet because the first working meeting has not happened.",
      },
    ],
    relatedTopics: ["transparency_voter_education", "results_transparency"],
    relatedSlugs: ["recommendations", "evidence", "minutes"],
    sources: [],
  }),
  t({
    slug: "recommendations",
    term: "Recommendations",
    aliases: ["recommendations", "practical recommendations"],
    category: "commission",
    shortDefinition: "A suggested next step for lawmakers, counties, or the public — not an order.",
    whyItMatters:
      "Recommendations have to survive contact with county staffing, cost, and current law. A pretty idea that a clerk cannot run is not a recommendation. It is a wish.",
    sections: [
      {
        heading: "The whole-system test",
        body: "The charter says recommendations must weigh security, accuracy, accessibility, cost, staffing, voter experience, and operational impact together.",
      },
    ],
    relatedTopics: ["county_staffing_poll_workers"],
    relatedSlugs: ["findings", "operational-impact", "advisory-body"],
    sources: [],
  }),
  t({
    slug: "kickoff",
    term: "Kickoff",
    aliases: ["kickoff", "founding kickoff"],
    category: "commission",
    shortDefinition: "The first working meeting after the founding members are named.",
    whyItMatters:
      "The kickoff is where the shared mission is tested in a real room — including people who disagree on methods.",
    sections: [
      {
        heading: "What to expect",
        body: "The first session is being planned after public launch. Officials who should not sit with a candidate before the election will have seats reserved for later. A facilitator is being sought so the first hour is not a predetermined fight.",
      },
    ],
    relatedTopics: ["transparency_voter_education"],
    relatedSlugs: ["facilitator", "charter"],
    sources: [],
  }),
  t({
    slug: "transition",
    term: "Transition",
    aliases: ["transition", "the transition"],
    category: "commission",
    shortDefinition: "The handoff period after an election when a new officeholder prepares to take the job.",
    whyItMatters:
      "If Kelly Grappe is elected, this Commission is intended to inform that handoff. The Commission is still meant to outlast one campaign calendar.",
    sections: [
      {
        heading: "Campaign versus office",
        body: "Organizing now is not the same as exercising the powers of the Secretary of State. Those powers begin only if the voters confer them. Until then, this is public advisory work.",
      },
    ],
    relatedTopics: ["transparency_voter_education"],
    relatedSlugs: ["secretary-of-state", "advisory-body"],
    sources: [],
  }),
  t({
    slug: "intake",
    term: "Intake",
    aliases: ["intake", "working intake"],
    category: "commission",
    shortDefinition: "The front door for a question or signup — where it is written down and queued.",
    whyItMatters:
      "A concern that lives only in someone’s inbox is not a public record. Intake puts it in the Commission queue.",
    sections: [
      {
        heading: "What happens after you submit",
        body: "Public forms on this site create a record for coordinators. That is how a question can later become a meeting item or a finding. It is not a tip line for accusations.",
      },
    ],
    relatedTopics: ["transparency_voter_education"],
    relatedSlugs: ["findings", "evidence"],
    sources: [],
  }),
  t({
    slug: "continuous-improvement",
    term: "Continuous improvement",
    aliases: ["continuous improvement"],
    category: "commission",
    shortDefinition: "Fixing the system in small, regular steps instead of waiting for a crisis.",
    whyItMatters:
      "Elections are a repeating operation. Last year’s audit and this year’s staffing shortage should change next year’s checklist.",
    sections: [
      {
        heading: "How this Commission will use it",
        body: "Each finding should say what to watch next cycle. That is how an advisory body stays useful after the press release.",
      },
    ],
    relatedTopics: ["emerging_risks_technologies"],
    relatedSlugs: ["post-election-audits", "findings"],
    sources: [],
  }),
  t({
    slug: "regnat-populus",
    term: "Regnat Populus",
    aliases: ["Regnat Populus"],
    category: "commission",
    shortDefinition: "Latin for “The People Rule.” It is Arkansas’s motto.",
    whyItMatters:
      "The Commission uses the motto as a reminder: election systems exist so the public’s choice is counted and believed.",
    sections: [
      {
        heading: "Why it is on this seal",
        body: "The phrase is not decoration. If people cannot see how a vote is protected, they will not believe they rule. The work is to make the safeguards visible.",
      },
    ],
    relatedTopics: ["transparency_voter_education"],
    relatedSlugs: ["transparency", "safeguards"],
    sources: [
      { label: "Encyclopedia of Arkansas — state motto", href: "https://encyclopediaofarkansas.net/entries/regnat-populus-5873/", kind: "research" },
    ],
  }),
  t({
    slug: "election-administration",
    term: "Election administration",
    aliases: ["election administration", "election systems and processes"],
    category: "process",
    shortDefinition: "The practical work of running an election: lists, ballots, people, machines, and the count.",
    whyItMatters:
      "This is the Commission’s subject. It is not a slogan fight. It is how 75 counties get from registration to a certified result.",
    sections: [
      {
        heading: "The full path",
        body: "Administration includes voter registration, equipment, polling places, absentee and early voting, accessibility, chain of custody, tabulation, canvass, audits, and public reporting. A change in one step can break another.",
      },
    ],
    relatedTopics: ["tabulation_reporting_certification"],
    relatedSlugs: ["certification", "canvass", "county-election-officials"],
    sources: [
      { label: "U.S. Election Assistance Commission", href: "https://www.eac.gov/", kind: "agency" },
    ],
  }),
  t({
    slug: "voter-registration",
    term: "Voter registration",
    aliases: ["voter registration", "registering to vote"],
    category: "process",
    shortDefinition: "Getting an eligible person onto the official list of voters, or updating that list.",
    whyItMatters:
      "If the list is wrong, a lawful voter is delayed or a name that should not vote stays on. Both errors hurt trust.",
    sections: [
      {
        heading: "Arkansas context",
        body: "Arkansans register through county clerks and other lawful channels. Federal law, including the National Voter Registration Act, sets some rules for how states maintain lists. The Commission will look at accuracy, notice, and whether the public can understand the process.",
      },
    ],
    relatedTopics: ["voter_registration_list_maintenance"],
    relatedSlugs: ["list-maintenance", "voter-rolls", "nvra"],
    sources: [
      { label: "Arkansas voter registration", href: "https://www.sos.arkansas.gov/elections/voter-information", kind: "agency" },
      { label: "Department of Justice — NVRA", href: "https://www.justice.gov/crt/national-voter-registration-act-1993-nvra", kind: "law" },
    ],
  }),
  t({
    slug: "list-maintenance",
    term: "List maintenance",
    aliases: ["list maintenance"],
    category: "process",
    shortDefinition: "The ongoing work of keeping the voter list accurate: moves, deaths, and lawful removals.",
    whyItMatters:
      "A list that is never cleaned looks sloppy. A list that is cleaned without notice looks like a purge. The law is in the middle: accurate, documented, and reviewable.",
    sections: [
      {
        heading: "What the Commission should ask",
        body: "What sources do counties use? How is a voter notified? How can an error be fixed before Election Day? What does the public get to see without exposing private data?",
      },
    ],
    relatedTopics: ["voter_registration_list_maintenance"],
    relatedSlugs: ["voter-registration", "voter-rolls", "nvra"],
    sources: [
      { label: "EAC — voter registration and list maintenance", href: "https://www.eac.gov/", kind: "agency" },
    ],
  }),
  t({
    slug: "voter-rolls",
    term: "Voter rolls",
    aliases: ["voter rolls", "the rolls"],
    category: "process",
    shortDefinition: "The official list of registered voters used to check people in at the polls.",
    whyItMatters:
      "The roll is the working tool on Election Day. If a name is missing or stale, the problem shows up in a line, not in a theory paper.",
    sections: [
      {
        heading: "Public understanding",
        body: "People often say “the rolls” when they mean list maintenance, poll books, or a downloaded file. The Commission will keep those pieces distinct so a concern can be answered with the right record.",
      },
    ],
    relatedTopics: ["voter_registration_list_maintenance"],
    relatedSlugs: ["list-maintenance", "voter-registration", "precinct"],
    sources: [],
  }),
  t({
    slug: "poll-workers",
    term: "Poll workers",
    aliases: ["poll workers", "poll worker", "election volunteers"],
    category: "process",
    shortDefinition: "The neighbors trained to run a polling place on Election Day.",
    whyItMatters:
      "Machines do not open the doors. People do. Recruitment, pay, training, and backup judges decide whether a precinct runs on time.",
    sections: [
      {
        heading: "County reality",
        body: "All 75 counties compete for workers, especially in small counties and long early-vote periods. The Commission will treat staffing as an election-security issue, not only an HR issue.",
      },
    ],
    relatedTopics: ["county_staffing_poll_workers"],
    relatedSlugs: ["precinct", "county-election-officials", "recruitment"],
    sources: [
      { label: "EAC — poll worker resources", href: "https://www.eac.gov/election-officials/poll-workers", kind: "agency" },
    ],
  }),
  t({
    slug: "recruitment",
    term: "Recruitment",
    aliases: ["recruitment"],
    category: "process",
    shortDefinition: "Finding and keeping enough trained people to run an election.",
    whyItMatters:
      "If a county cannot staff a site, hours shrink or errors rise. That is a public problem, not a private scheduling problem.",
    sections: [
      {
        heading: "What to measure",
        body: "How many workers a county needs, how many it has, what it pays, how training works, and where no-shows happen. Census age and commuting data can help explain the labor pool without guessing.",
      },
    ],
    relatedTopics: ["county_staffing_poll_workers"],
    relatedSlugs: ["poll-workers", "operational-impact"],
    sources: [
      { label: "U.S. Census Bureau — American Community Survey", href: "https://www.census.gov/programs-surveys/acs", kind: "data" },
      { label: "Bureau of Labor Statistics", href: "https://www.bls.gov/", kind: "data" },
    ],
  }),
  t({
    slug: "county-election-officials",
    term: "County election officials",
    aliases: ["county election officials", "county officials"],
    category: "law",
    shortDefinition: "The local officers who actually run elections in each Arkansas county.",
    whyItMatters:
      "Arkansas is not run from one downtown office on Election Day. The Commission has to hear the people who open the warehouse and the poll.",
    sections: [
      {
        heading: "Respect the structure",
        body: "The charter says the Commission is advisory and will respect county and state legal duties. That includes clerks, election commissions, and other officers named in law.",
      },
    ],
    relatedTopics: ["county_staffing_poll_workers"],
    relatedSlugs: ["county-board-of-election-commissioners", "legal-responsibilities", "secretary-of-state"],
    sources: [
      { label: "Arkansas Association of Counties", href: "https://www.arcounties.org/", kind: "agency" },
    ],
  }),
  t({
    slug: "county-board-of-election-commissioners",
    term: "County board of election commissioners",
    aliases: ["county board of election commissioners", "election commission"],
    category: "law",
    shortDefinition: "The county body that oversees election conduct under Arkansas law.",
    whyItMatters:
      "Voters often say “the clerk” for every election task. Some duties sit with the county board. Mixing them up produces the wrong complaint and the wrong fix.",
    sections: [
      {
        heading: "Why the Commission will map roles",
        body: "A deep dive for each county should say who appoints, who trains, who buys equipment, and who certifies. That map is how a recommendation stays lawful.",
      },
    ],
    relatedTopics: ["county_staffing_poll_workers", "tabulation_reporting_certification"],
    relatedSlugs: ["county-election-officials", "canvass", "certification"],
    sources: [
      { label: "Arkansas Secretary of State — Elections", href: "https://www.sos.arkansas.gov/elections", kind: "agency" },
    ],
  }),
  t({
    slug: "secretary-of-state",
    term: "Secretary of State",
    aliases: ["Secretary of State", "secretary of state"],
    category: "law",
    shortDefinition: "The statewide officer whose duties include elections, business filings, and public records set by law.",
    whyItMatters:
      "This Commission is being organized by a candidate for that office. The site is careful: the Commission is advisory now, and official seats wait until after the election where they must.",
    sections: [
      {
        heading: "What the office actually does",
        body: "The Arkansas Secretary of State supports statewide election administration, candidate filings, and related public information. It does not replace county officials. A modern office publishes plain-language guidance and answers clerks when the law changes.",
      },
    ],
    relatedTopics: ["transparency_voter_education"],
    relatedSlugs: ["legal-responsibilities", "transition", "advisory-body"],
    sources: [
      { label: "Arkansas Secretary of State", href: "https://www.sos.arkansas.gov/", kind: "agency" },
    ],
  }),
  t({
    slug: "paper-ballots",
    term: "Paper ballots",
    aliases: ["paper ballots", "paper ballot"],
    category: "process",
    shortDefinition: "A vote the voter can see on paper, which can be counted again by hand or by a scanner.",
    whyItMatters:
      "This is one of the loudest public questions in Arkansas. The charter says the Commission will study law, county practice, and best practices — without a predetermined machine or bill.",
    sections: [
      {
        heading: "What “paper” can mean",
        body: "Hand-marked paper, ballot-marking devices that print a paper record, and scanned paper are not the same system. The Commission will keep those words distinct so a finding is about a real method, not a slogan.",
      },
      {
        heading: "How the Commission will work the disagreement",
        body: "People who want hand-marked paper and people who trust current certified systems both have a seat if they will stay with Arkansas facts: statute, cost, accessibility, auditability, and county staffing.",
      },
    ],
    relatedTopics: ["paper_ballots", "voting_equipment_technology"],
    relatedSlugs: ["ballot-marking-device", "optical-scan", "post-election-audits"],
    sources: [
      { label: "Verified Voting — equipment lookup", href: "https://verifiedvoting.org/", kind: "research" },
      { label: "EAC — voting systems", href: "https://www.eac.gov/voting-equipment", kind: "agency" },
    ],
  }),
  t({
    slug: "absentee-voting",
    term: "Absentee voting",
    aliases: ["absentee voting", "absentee"],
    category: "process",
    shortDefinition: "Voting by a ballot sent to you, then returned, instead of voting at a polling place.",
    whyItMatters:
      "Absentee rules are about access and about verification. Both can be true at once: a lawful voter gets a ballot, and the county can show how that ballot was checked.",
    sections: [
      {
        heading: "What the Commission should publish",
        body: "Who may vote absentee in Arkansas, what ID or statement is required, how ballots are tracked, and when a ballot is rejected. Mystery here is where rumors grow.",
      },
    ],
    relatedTopics: ["absentee_early_voting"],
    relatedSlugs: ["early-voting", "uocava", "verification"],
    sources: [
      { label: "Arkansas absentee voting information", href: "https://www.sos.arkansas.gov/elections", kind: "agency" },
      { label: "Federal Voting Assistance Program", href: "https://www.fvap.gov/", kind: "agency" },
    ],
  }),
  t({
    slug: "early-voting",
    term: "Early voting",
    aliases: ["early voting", "early vote"],
    category: "process",
    shortDefinition: "In-person voting on days before Election Day.",
    whyItMatters:
      "Early voting changes staffing, chain of custody, and how results are stored until Election Night. It is not a side show. It is part of the same count.",
    sections: [
      {
        heading: "County operations",
        body: "Sites, hours, ballot accounting, and nightly security all have to be documented. The Commission will look at access and at whether the public can see those controls.",
      },
    ],
    relatedTopics: ["absentee_early_voting"],
    relatedSlugs: ["absentee-voting", "chain-of-custody", "poll-workers"],
    sources: [
      { label: "National Conference of State Legislatures — early voting", href: "https://www.ncsl.org/elections-and-campaigns", kind: "research" },
    ],
  }),
  t({
    slug: "accessibility",
    term: "Accessibility",
    aliases: ["accessibility", "Accessibility"],
    category: "process",
    shortDefinition: "Designing voting so eligible people can do it, including people with disabilities.",
    whyItMatters:
      "A secure election that a lawful voter cannot complete is not a finished system. Federal and state rules require accessible options.",
    sections: [
      {
        heading: "What to examine",
        body: "Polling-place entry, voting machines that can be used independently, language access, and how a voter with a disability casts a private ballot. Help America Vote Act requirements are part of this record.",
      },
    ],
    relatedTopics: ["accessibility_voter_experience"],
    relatedSlugs: ["hava", "paper-ballots", "ballot-marking-device"],
    sources: [
      { label: "EAC — accessibility", href: "https://www.eac.gov/voters/resources-voters-disabilities", kind: "agency" },
      { label: "ADA.gov — voting", href: "https://www.ada.gov/topics/voting/", kind: "law" },
    ],
  }),
  t({
    slug: "verification",
    term: "Verification",
    aliases: ["verification", "verified"],
    category: "security",
    shortDefinition: "Checking that a voter is eligible and that a ballot is the one that was issued.",
    whyItMatters:
      "Verification is how a county can say yes to a lawful vote and no to a ballot that cannot be tied to the rules.",
    sections: [
      {
        heading: "Examples",
        body: "Checking a voter in on the roll, reviewing an absentee statement, matching ballot numbers, and confirming a provisional envelope. Each step should leave a record someone else can inspect.",
      },
    ],
    relatedTopics: ["verification_physical_security"],
    relatedSlugs: ["chain-of-custody", "provisional-ballot", "absentee-voting"],
    sources: [],
  }),
  t({
    slug: "chain-of-custody",
    term: "Chain of custody",
    aliases: ["chain of custody"],
    category: "security",
    shortDefinition: "A written trail of who had the ballots and equipment, from start to finish.",
    whyItMatters:
      "If a box of ballots cannot be accounted for, the count is hard to defend. Paper plus a weak chain is not a complete safeguard.",
    sections: [
      {
        heading: "What a complete chain looks like",
        body: "Seals, logs, two-person rules, transport records, and a reconciliation of how many ballots went out and came back. The public does not need every name on a website. It does need to know the method and that exceptions were logged.",
      },
    ],
    relatedTopics: ["verification_physical_security"],
    relatedSlugs: ["physical-security", "tabulation", "accountability"],
    sources: [
      { label: "Cybersecurity and Infrastructure Security Agency — election security", href: "https://www.cisa.gov/topics/election-security", kind: "agency" },
    ],
  }),
  t({
    slug: "physical-security",
    term: "Physical security",
    aliases: ["physical security"],
    category: "security",
    shortDefinition: "Locks, seals, rooms, and people that keep ballots and machines from being tampered with.",
    whyItMatters:
      "Cybersecurity gets headlines. A warehouse door and a seal log are often the real story.",
    sections: [
      {
        heading: "What to inspect",
        body: "Who has keys, how seals are numbered, how overnight early-vote ballots are stored, and who can enter the tabulation room. Those are Commission questions, not conspiracy questions, when they are asked with records.",
      },
    ],
    relatedTopics: ["verification_physical_security", "election_security_cybersecurity"],
    relatedSlugs: ["chain-of-custody", "cybersecurity", "air-gap"],
    sources: [
      { label: "CISA — election security", href: "https://www.cisa.gov/topics/election-security", kind: "agency" },
    ],
  }),
  t({
    slug: "cybersecurity",
    term: "Cybersecurity",
    aliases: ["cybersecurity"],
    category: "security",
    shortDefinition: "Protecting election computers and networks from hacking, malware, and unauthorized access.",
    whyItMatters:
      "Even when ballots are paper, counties use networks for registration, reporting, and office work. Those systems need defenses the public can understand without being asked to “just trust IT.”",
    sections: [
      {
        heading: "What the Commission can examine without a predetermined tool",
        body: "How systems are certified, who can reach them, whether they are isolated from the open internet, how patches are applied, and what a county does after a scare. The goal is a public explanation, not a product pitch.",
      },
    ],
    relatedTopics: ["election_security_cybersecurity"],
    relatedSlugs: ["air-gap", "vvsg", "hash"],
    sources: [
      { label: "CISA — election security", href: "https://www.cisa.gov/topics/election-security", kind: "agency" },
      { label: "NIST voting publications", href: "https://www.nist.gov/itl/voting", kind: "research" },
    ],
  }),
  t({
    slug: "air-gap",
    term: "Air gap",
    aliases: ["air gap", "air-gapped"],
    category: "security",
    shortDefinition: "Keeping a computer off the public internet so remote attackers cannot reach it.",
    whyItMatters:
      "Counties often air-gap tabulation machines. The public should hear what that means and what it does not mean — USB drives and human process still matter.",
    sections: [
      {
        heading: "Limits of the phrase",
        body: "An air-gapped machine is safer from remote hacking. It is not magic. Chain of custody, tested software, and controlled media still decide whether the count is trustworthy.",
      },
    ],
    relatedTopics: ["election_security_cybersecurity"],
    relatedSlugs: ["cybersecurity", "tabulation", "hash"],
    sources: [
      { label: "CISA — election security", href: "https://www.cisa.gov/topics/election-security", kind: "agency" },
    ],
  }),
  t({
    slug: "hash",
    term: "Hash / checksum",
    aliases: ["hash", "checksum"],
    category: "security",
    shortDefinition: "A digital fingerprint of a file. If the file changes, the fingerprint changes.",
    whyItMatters:
      "Election software can be checked against a published hash so a county can show it is running the certified version.",
    sections: [
      {
        heading: "Plain picture",
        body: "Think of a unique seal for a computer file. Officials compare the seal on the machine to the seal from the testing lab. A mismatch means stop and explain.",
      },
    ],
    relatedTopics: ["election_security_cybersecurity", "voting_equipment_technology"],
    relatedSlugs: ["vvsg", "certification", "cybersecurity"],
    sources: [
      { label: "NIST — hash functions overview", href: "https://www.nist.gov/publications", kind: "research" },
    ],
  }),
  t({
    slug: "procurement",
    term: "Procurement",
    aliases: ["procurement", "procured"],
    category: "process",
    shortDefinition: "The official process of buying equipment and services with public rules.",
    whyItMatters:
      "Who sells the scanner, who services it, and who is on the hook when it fails are public questions. A black-box contract is a trust problem.",
    sections: [
      {
        heading: "What to publish",
        body: "Vendor name, contract term, what is being bought, who approved it, and how a county can get out if the system fails certification or support. Cost belongs next to security, not behind it.",
      },
    ],
    relatedTopics: ["vendors_procurement_infrastructure"],
    relatedSlugs: ["vendors", "infrastructure", "certification"],
    sources: [
      { label: "Arkansas Office of State Procurement", href: "https://www.transform.ar.gov/procurement/", kind: "agency" },
    ],
  }),
  t({
    slug: "vendors",
    term: "Vendors",
    aliases: ["vendors", "Vendors"],
    category: "process",
    shortDefinition: "The companies that sell or service voting equipment, software, or election support.",
    whyItMatters:
      "A vendor is not the government. The county and the state still owe the public an explanation of what was bought and how it is tested.",
    sections: [
      {
        heading: "Accountability",
        body: "The Commission will look at who is allowed to touch machines, how updates are approved, and what happens when a vendor’s timeline and a county’s Election Day collide.",
      },
    ],
    relatedTopics: ["vendors_procurement_infrastructure"],
    relatedSlugs: ["procurement", "vvsg", "certification"],
    sources: [
      { label: "Verified Voting — vendor and equipment data", href: "https://verifiedvoting.org/", kind: "research" },
    ],
  }),
  t({
    slug: "infrastructure",
    term: "Infrastructure",
    aliases: ["infrastructure", "election infrastructure"],
    category: "process",
    shortDefinition: "The buildings, machines, networks, and people an election cannot run without.",
    whyItMatters:
      "A new law that ignores warehouses, printers, and poll-worker hours will fail in the first small county that tries it.",
    sections: [
      {
        heading: "Whole-system view",
        body: "Infrastructure is not only servers. It is the gym that becomes a polling place, the ballot printer, the transport vans, and the overnight storage. The charter requires that recommendations consider operational impact.",
      },
    ],
    relatedTopics: ["vendors_procurement_infrastructure"],
    relatedSlugs: ["operational-impact", "physical-security", "procurement"],
    sources: [
      { label: "CISA — election infrastructure", href: "https://www.cisa.gov/topics/election-security", kind: "agency" },
    ],
  }),
  t({
    slug: "public-demonstration",
    term: "Public demonstration",
    aliases: ["public demonstration"],
    category: "process",
    shortDefinition: "A showing of voting equipment that the public can watch and ask about.",
    whyItMatters:
      "A machine that is only explained in a vendor brochure will not settle a county argument. People need to see a ballot go in and a record come out.",
    sections: [
      {
        heading: "How to do it without a predetermined pitch",
        body: "Demonstrate the actual certified workflow, including what a voter with a disability uses and how a paper record is stored. Invite questions. Publish the answers.",
      },
    ],
    relatedTopics: ["voting_equipment_technology", "transparency_voter_education"],
    relatedSlugs: ["paper-ballots", "vvsg", "transparency"],
    sources: [],
  }),
  t({
    slug: "evaluation",
    term: "Evaluation",
    aliases: ["evaluation"],
    category: "process",
    shortDefinition: "A structured test of whether equipment or a process does what officials claim.",
    whyItMatters:
      "Evaluation is more than a demo day. It includes test decks, accessibility checks, and a written result.",
    sections: [
      {
        heading: "Tied to certification",
        body: "Federal and state certification programs exist so a county is not asked to trust a salesperson. The Commission will point to those records and to county logic-and-accuracy tests.",
      },
    ],
    relatedTopics: ["voting_equipment_technology"],
    relatedSlugs: ["certification", "logic-and-accuracy-testing", "vvsg"],
    sources: [
      { label: "EAC — voting system testing", href: "https://www.eac.gov/voting-equipment/certified-voting-systems", kind: "agency" },
    ],
  }),
  t({
    slug: "certification",
    term: "Certification",
    aliases: ["certification", "certified", "final certification"],
    category: "process",
    shortDefinition: "Two related ideas: (1) lab approval of voting equipment, and (2) the official sign-off that an election’s results are complete.",
    whyItMatters:
      "People use one word for two jobs. Mixing them creates fake fights. Equipment certification is not the same night as county certification of results.",
    sections: [
      {
        heading: "Equipment certification",
        body: "Voting systems are tested against standards such as the Voluntary Voting System Guidelines. A certified system has a public record of what was tested.",
      },
      {
        heading: "Result certification",
        body: "After tabulation, canvass, and any required reviews, officials certify the outcome. That is a legal act with a deadline and a paper trail.",
      },
    ],
    relatedTopics: ["voting_equipment_technology", "tabulation_reporting_certification"],
    relatedSlugs: ["vvsg", "canvass", "tabulation"],
    sources: [
      { label: "EAC — certified voting systems", href: "https://www.eac.gov/voting-equipment/certified-voting-systems", kind: "agency" },
    ],
  }),
  t({
    slug: "tabulation",
    term: "Tabulation",
    aliases: ["tabulation", "tabulated"],
    category: "process",
    shortDefinition: "Adding up the votes, usually by scanning paper ballots or reading a recorded vote.",
    whyItMatters:
      "Tabulation is where a private mark becomes a public number. The path from precinct to county total has to be explainable.",
    sections: [
      {
        heading: "What the public should be able to follow",
        body: "How ballots are scanned or read, how batches are labeled, how a recount or audit would re-do the step, and when unofficial results become official.",
      },
    ],
    relatedTopics: ["tabulation_reporting_certification"],
    relatedSlugs: ["canvass", "certification", "optical-scan"],
    sources: [
      { label: "MIT Election Data + Science Lab", href: "https://electionlab.mit.edu/", kind: "research" },
    ],
  }),
  t({
    slug: "canvass",
    term: "Canvass",
    aliases: ["canvass", "the canvass"],
    category: "process",
    shortDefinition: "The official review that checks the count, the paperwork, and provisional ballots before results are certified.",
    whyItMatters:
      "Election Night is unofficial. The canvass is where the county accounts for every issued ballot it can. That is the adult version of “the count.”",
    sections: [
      {
        heading: "What happens",
        body: "Officials compare poll-book numbers, unused ballots, absentee and provisional envelopes, and machine tapes. Discrepancies get a written explanation. Then certification can happen.",
      },
    ],
    relatedTopics: ["tabulation_reporting_certification"],
    relatedSlugs: ["certification", "provisional-ballot", "tabulation"],
    sources: [
      { label: "EAC — election management", href: "https://www.eac.gov/", kind: "agency" },
    ],
  }),
  t({
    slug: "precinct",
    term: "Precinct",
    aliases: ["precinct", "precincts"],
    category: "process",
    shortDefinition: "A small voting area. Your precinct decides your polling place and your ballot style.",
    whyItMatters:
      "A precinct map error puts a voter in the wrong line or on the wrong ballot. That is an administration problem with a paper fix.",
    sections: [
      {
        heading: "Why it shows up in concerns",
        body: "People often report a “stolen vote” when they were sent to the wrong site after a line change. The Commission should keep precinct assignment, poll books, and results reporting in separate piles.",
      },
    ],
    relatedTopics: ["voter_registration_list_maintenance", "accessibility_voter_experience"],
    relatedSlugs: ["voter-rolls", "poll-workers"],
    sources: [
      { label: "Census — voting districts and geography", href: "https://www.census.gov/programs-surveys/decennial-census/about/voting-rights.html", kind: "data" },
    ],
  }),
  t({
    slug: "provisional-ballot",
    term: "Provisional ballot",
    aliases: ["provisional ballot", "provisional"],
    category: "process",
    shortDefinition: "A backup ballot used when a voter’s eligibility cannot be confirmed on the spot.",
    whyItMatters:
      "Provisional ballots are how a person is not turned away while the county checks the record. They are counted only if they later qualify.",
    sections: [
      {
        heading: "What the public should know",
        body: "Why a provisional is offered, how the voter finds out if it counted, and how many were accepted or rejected. Silence here looks like a missing vote.",
      },
    ],
    relatedTopics: ["accessibility_voter_experience", "tabulation_reporting_certification"],
    relatedSlugs: ["verification", "canvass", "hava"],
    sources: [
      { label: "EAC — provisional voting", href: "https://www.eac.gov/", kind: "agency" },
    ],
  }),
  t({
    slug: "post-election-audits",
    term: "Post-election audits",
    aliases: ["post-election audits", "Post-election audits", "audit", "audits"],
    category: "security",
    shortDefinition: "A check after Election Day that compares paper records to the reported totals.",
    whyItMatters:
      "An audit is how a county can say the number is not only a machine printout. Arkansas law and past findings belong on the table before anyone imports a national talking point.",
    sections: [
      {
        heading: "Kinds of audits",
        body: "Some audits pull a fixed sample of precincts. A risk-limiting audit uses statistics to decide how much paper to check. The Commission will explain each method in Arkansas terms: cost, staffing, and what the public gets to watch.",
      },
    ],
    relatedTopics: ["post_election_audits"],
    relatedSlugs: ["risk-limiting-audit", "paper-ballots", "tabulation"],
    sources: [
      { label: "National Academies — election audit resources via EAC", href: "https://www.eac.gov/", kind: "research" },
      { label: "MIT Election Lab — audits", href: "https://electionlab.mit.edu/", kind: "research" },
    ],
  }),
  t({
    slug: "risk-limiting-audit",
    term: "Risk-limiting audit",
    aliases: ["risk-limiting audit", "risk limiting audit"],
    category: "security",
    shortDefinition: "A math-based paper check that keeps looking until it is very unlikely the reported winner is wrong.",
    whyItMatters:
      "It is a tool, not a religion. The Commission will not adopt or reject it in advance. It will ask whether Arkansas counties can staff it and whether the public can understand the result.",
    sections: [
      {
        heading: "What it needs",
        body: "A voter-verifiable paper record, a way to sample ballots, and a published procedure. Without paper, there is nothing to limit the risk against.",
      },
    ],
    relatedTopics: ["post_election_audits"],
    relatedSlugs: ["post-election-audits", "paper-ballots", "tabulation"],
    sources: [
      { label: "NIST — risk-limiting audits", href: "https://www.nist.gov/itl/voting", kind: "research" },
    ],
  }),
  t({
    slug: "logic-and-accuracy-testing",
    term: "Logic and accuracy testing",
    aliases: ["logic and accuracy", "logic-and-accuracy testing"],
    category: "security",
    shortDefinition: "A before-Election-Day test: known ballots go through the machines to see if the totals come out right.",
    whyItMatters:
      "This is one of the most practical public demonstrations a county can offer. It is not optional theater. It is how a clerk shows the scanner can add.",
    sections: [
      {
        heading: "What to watch",
        body: "Test deck, expected totals, seals after the test, and who may observe. A public logic-and-accuracy test is a trust tool if the method is explained in plain words.",
      },
    ],
    relatedTopics: ["voting_equipment_technology"],
    relatedSlugs: ["evaluation", "tabulation", "public-demonstration"],
    sources: [
      { label: "EAC — pre-election testing", href: "https://www.eac.gov/", kind: "agency" },
    ],
  }),
  t({
    slug: "ballot-marking-device",
    term: "Ballot marking device",
    aliases: ["ballot marking device", "ballot-marking device"],
    category: "process",
    shortDefinition: "A machine that helps a voter mark or print a paper ballot, often used for accessibility.",
    whyItMatters:
      "It is not the same as a paperless touchscreen that never prints. Mixing the terms is how arguments talk past each other.",
    sections: [
      {
        heading: "What the Commission will separate",
        body: "Hand-marked paper, BMD-printed paper, and any system without an independent paper record. Accessibility needs and audit needs both have to be in the same finding.",
      },
    ],
    relatedTopics: ["voting_equipment_technology", "paper_ballots", "accessibility_voter_experience"],
    relatedSlugs: ["paper-ballots", "accessibility", "optical-scan"],
    sources: [
      { label: "Verified Voting — system types", href: "https://verifiedvoting.org/", kind: "research" },
    ],
  }),
  t({
    slug: "optical-scan",
    term: "Optical scan",
    aliases: ["optical scan", "scanner"],
    category: "process",
    shortDefinition: "A machine that reads marks on paper ballots and adds them up.",
    whyItMatters:
      "Most modern paper systems use a scanner. The paper remains the record if the chain of custody and audits are real.",
    sections: [
      {
        heading: "Public questions the Commission can answer",
        body: "How a mark is read, what happens to an unclear mark, how a recount is done by hand, and how the scanner software is certified.",
      },
    ],
    relatedTopics: ["voting_equipment_technology", "paper_ballots"],
    relatedSlugs: ["paper-ballots", "tabulation", "certification"],
    sources: [
      { label: "EAC — voting equipment", href: "https://www.eac.gov/voting-equipment", kind: "agency" },
    ],
  }),
  t({
    slug: "poll-watcher",
    term: "Poll watcher",
    aliases: ["poll watcher", "poll watchers"],
    category: "law",
    shortDefinition: "A person allowed by law to observe Election Day process, within set rules.",
    whyItMatters:
      "Watchers are a transparency tool when they follow the law. They are a disruption when they interfere with voters or workers.",
    sections: [
      {
        heading: "What the Commission can publish",
        body: "Who may appoint a watcher in Arkansas, where they may stand, what they may record, and how a complaint is filed. Clear rules protect both observation and the right to vote.",
      },
    ],
    relatedTopics: ["transparency_voter_education"],
    relatedSlugs: ["transparency", "poll-workers", "open-meetings"],
    sources: [
      { label: "Arkansas Secretary of State — Elections", href: "https://www.sos.arkansas.gov/elections", kind: "agency" },
    ],
  }),
  t({
    slug: "recount",
    term: "Recount",
    aliases: ["recount"],
    category: "process",
    shortDefinition: "Counting the ballots again, by the method the law allows, after a close or challenged result.",
    whyItMatters:
      "A recount is not a do-over election. It is a second look at the same ballots under published rules.",
    sections: [
      {
        heading: "What to explain in advance",
        body: "Who can request it, what it costs, whether it is machine or hand, and how observers participate. Surprise rules after Election Night destroy trust.",
      },
    ],
    relatedTopics: ["tabulation_reporting_certification", "post_election_audits"],
    relatedSlugs: ["tabulation", "canvass", "paper-ballots"],
    sources: [],
  }),
  t({
    slug: "uocava",
    term: "UOCAVA",
    aliases: ["UOCAVA", "military and overseas"],
    category: "law",
    shortDefinition: "Federal law that helps military and overseas voters get and return ballots.",
    whyItMatters:
      "These ballots have longer mail paths. Counties need a process that is both accessible and documented.",
    sections: [
      {
        heading: "Where to read more",
        body: "The Federal Voting Assistance Program publishes the voter-facing rules. Arkansas implements them through state and county procedure. The Commission can put both in one place.",
      },
    ],
    relatedTopics: ["absentee_early_voting"],
    relatedSlugs: ["absentee-voting", "hava"],
    sources: [
      { label: "Federal Voting Assistance Program", href: "https://www.fvap.gov/", kind: "agency" },
    ],
  }),
  t({
    slug: "hava",
    term: "Help America Vote Act (HAVA)",
    aliases: ["HAVA", "Help America Vote Act"],
    category: "law",
    shortDefinition: "A 2002 federal law that set minimum election standards, including accessible voting and provisional ballots.",
    whyItMatters:
      "HAVA is why many counties have accessible equipment and a provisional-ballot process. It is also why federal certification language shows up in local debates.",
    sections: [
      {
        heading: "What it does not do",
        body: "HAVA does not pick one Arkansas ballot style for all time. It sets floors. The Commission will use it as a source, not as a conversation-ender.",
      },
    ],
    relatedTopics: ["voting_equipment_technology", "accessibility_voter_experience"],
    relatedSlugs: ["accessibility", "provisional-ballot", "eac"],
    sources: [
      { label: "EAC — HAVA", href: "https://www.eac.gov/about-the-eac/help-america-vote-act", kind: "law" },
    ],
  }),
  t({
    slug: "nvra",
    term: "National Voter Registration Act (NVRA)",
    aliases: ["NVRA", "National Voter Registration Act"],
    category: "law",
    shortDefinition: "A 1993 federal law about how people register and how states may remove names from the list.",
    whyItMatters:
      "List-maintenance fights often skip this statute. The Commission will put the actual rules next to the county practice.",
    sections: [
      {
        heading: "The balance the law already wrote",
        body: "Make registration available. Do not remove a voter without a process. That is the federal frame Arkansas still has to administer locally.",
      },
    ],
    relatedTopics: ["voter_registration_list_maintenance"],
    relatedSlugs: ["voter-registration", "list-maintenance"],
    sources: [
      { label: "Department of Justice — NVRA", href: "https://www.justice.gov/crt/national-voter-registration-act-1993-nvra", kind: "law" },
    ],
  }),
  t({
    slug: "eac",
    term: "Election Assistance Commission (EAC)",
    aliases: ["EAC", "Election Assistance Commission"],
    category: "law",
    shortDefinition: "The federal agency that helps states with election administration and voting-system testing.",
    whyItMatters:
      "When someone says “federally certified,” they usually mean the EAC testing program. The Commission will link to the actual certified-system lists instead of repeating a vendor claim.",
    sections: [
      {
        heading: "Use on this site",
        body: "EAC pages are a first stop for poll-worker guides, HAVA, and certified equipment. They are not a substitute for Arkansas statute.",
      },
    ],
    relatedTopics: ["voting_equipment_technology"],
    relatedSlugs: ["hava", "vvsg", "certification"],
    sources: [{ label: "U.S. Election Assistance Commission", href: "https://www.eac.gov/", kind: "agency" }],
  }),
  t({
    slug: "vvsg",
    term: "Voluntary Voting System Guidelines (VVSG)",
    aliases: ["VVSG", "Voluntary Voting System Guidelines"],
    category: "security",
    shortDefinition: "The federal testing guidelines used when voting equipment is submitted for certification.",
    whyItMatters:
      "VVSG is how a lab can say a system was tested against a published bar. It is voluntary in name and central in practice for equipment that seeks EAC certification.",
    sections: [
      {
        heading: "How the Commission will use it",
        body: "As a source for what “certified” means, not as a verdict that any one Arkansas county must buy a new system tomorrow.",
      },
    ],
    relatedTopics: ["voting_equipment_technology", "election_security_cybersecurity"],
    relatedSlugs: ["eac", "certification", "hash"],
    sources: [
      { label: "EAC — VVSG", href: "https://www.eac.gov/voting-equipment/voluntary-voting-system-guidelines", kind: "agency" },
    ],
  }),
  t({
    slug: "foia",
    term: "FOIA (Freedom of Information)",
    aliases: ["FOIA", "Freedom of Information"],
    category: "law",
    shortDefinition: "Arkansas’s public-records law. People can ask for records a public body holds, with listed exceptions.",
    whyItMatters:
      "Election trust often depends on whether a citizen can see a contract, a canvass sheet, or a training memo. The Commission will point to the lawful path and, when it can, publish the record first.",
    sections: [
      {
        heading: "How this site will help",
        body: "Deep dives will link to the Attorney General’s FOIA guidance and to the kinds of election records that are commonly public. The Commission will not tell anyone to skip a lawful exemption that protects a voter’s private data.",
      },
    ],
    relatedTopics: ["transparency_voter_education"],
    relatedSlugs: ["transparency", "open-meetings", "minutes"],
    sources: [
      { label: "Arkansas Attorney General — FOIA", href: "https://arkansasag.gov/arkansas-foia/", kind: "law" },
    ],
  }),
  t({
    slug: "open-meetings",
    term: "Open meetings",
    aliases: ["open meetings", "open-meetings"],
    category: "law",
    shortDefinition: "Rules that say the public can attend certain official meetings and see the action.",
    whyItMatters:
      "The Commission’s own meetings are designed to produce a public record even when a working session is structured for candor.",
    sections: [
      {
        heading: "Election bodies",
        body: "County boards and some state boards already operate under open-meeting rules. The Commission will treat those meetings as a source, not a rumor mill.",
      },
    ],
    relatedTopics: ["transparency_voter_education"],
    relatedSlugs: ["foia", "minutes", "deliberative"],
    sources: [
      { label: "Arkansas Attorney General — FOIA / open government", href: "https://arkansasag.gov/arkansas-foia/", kind: "law" },
    ],
  }),
  t({
    slug: "arkansas-code-title-7",
    term: "Arkansas Code Title 7",
    aliases: ["Arkansas Code Title 7", "Title 7", "election code"],
    category: "law",
    shortDefinition: "The main part of Arkansas state law that covers elections.",
    whyItMatters:
      "National talking points are not Arkansas law. Title 7 and related acts are. Findings should cite the section, not the slogan.",
    sections: [
      {
        heading: "How the Commission will use it",
        body: "Each legal deep dive should name the statute or rule, quote the duty in plain language, and then describe county practice. If practice and law differ, that is a finding — not a vibe.",
      },
    ],
    relatedTopics: ["transparency_voter_education"],
    relatedSlugs: ["statutory", "legal-responsibilities", "secretary-of-state"],
    sources: [
      { label: "Arkansas General Assembly — acts and code access", href: "https://www.arkleg.state.ar.us/", kind: "law" },
    ],
  }),
  t({
    slug: "operational-impact",
    term: "Operational impact",
    aliases: ["operational impact"],
    category: "process",
    shortDefinition: "What a change does to real county work: time, money, staff, and risk of error.",
    whyItMatters:
      "The charter requires this test. A recommendation that ignores a 10-person clerk’s office is not ready.",
    sections: [
      {
        heading: "Questions the Commission will ask",
        body: "How many extra hours? What training? What happens if a vendor is late? What breaks in a county of 8,000 people that works in Pulaski?",
      },
    ],
    relatedTopics: ["county_staffing_poll_workers"],
    relatedSlugs: ["recruitment", "infrastructure", "recommendations"],
    sources: [
      { label: "Bureau of Labor Statistics — local employment data", href: "https://www.bls.gov/lau/", kind: "data" },
    ],
  }),
  t({
    slug: "safeguards",
    term: "Safeguards",
    aliases: ["safeguards"],
    category: "security",
    shortDefinition: "The checks that protect a lawful vote and make those checks visible.",
    whyItMatters:
      "The charter’s bottom line is that safeguards should be easier to see. Hidden security is not public confidence.",
    sections: [
      {
        heading: "Examples",
        body: "Seals, poll books, bipartisan teams, logic-and-accuracy tests, audits, and published canvass numbers. A safeguard the public cannot name will not settle a late-night argument.",
      },
    ],
    relatedTopics: ["verification_physical_security", "results_transparency"],
    relatedSlugs: ["chain-of-custody", "post-election-audits", "transparency"],
    sources: [],
  }),
  t({
    slug: "best-practices",
    term: "Best practices",
    aliases: ["best practices", "established best practices"],
    category: "process",
    shortDefinition: "Methods that have been tested in real elections and written down so others can copy them.",
    whyItMatters:
      "Best practice is not “what Twitter likes.” It is a documented method from clerks, labs, or researchers that Arkansas can adapt.",
    sections: [
      {
        heading: "The Arkansas filter",
        body: "The charter says focus on what works here. A practice from a 4-million-person county is a lead, not an order, until a 9,000-person county can run it.",
      },
    ],
    relatedTopics: ["emerging_risks_technologies"],
    relatedSlugs: ["evidence", "operational-impact"],
    sources: [
      { label: "EAC — election official resources", href: "https://www.eac.gov/election-officials", kind: "agency" },
    ],
  }),
  t({
    slug: "voter-education",
    term: "Voter education",
    aliases: ["voter education", "public understanding"],
    category: "commission",
    shortDefinition: "Clear, factual teaching about how to register, vote, and check a result.",
    whyItMatters:
      "The mission includes public understanding. Confusion is not a voter’s moral failure. It is often a communications failure.",
    sections: [
      {
        heading: "What this site is for",
        body: "Hover definitions, deep dives, and the research desk exist so a person does not have to leave this home to learn the words. Outside sources are still linked. The point is to anticipate the next question.",
      },
    ],
    relatedTopics: ["transparency_voter_education"],
    relatedSlugs: ["transparency", "accessibility"],
    sources: [
      { label: "Arkansas Secretary of State — voter information", href: "https://www.sos.arkansas.gov/elections/voter-information", kind: "agency" },
    ],
  }),
  t({
    slug: "emerging-risks",
    term: "Emerging risks",
    aliases: ["emerging risks", "Emerging risks"],
    category: "security",
    shortDefinition: "New threats or tools that are not yet in last year’s checklist.",
    whyItMatters:
      "Deepfakes, new devices, and new laws all arrive between cycles. The Commission’s across-the-cycle charge is to watch them through an Arkansas lens.",
    sections: [
      {
        heading: "How to stay disciplined",
        body: "Name the risk, name the Arkansas office that would have to respond, and name the evidence. Do not import a national panic without a local fact.",
      },
    ],
    relatedTopics: ["emerging_risks_technologies"],
    relatedSlugs: ["cybersecurity", "best-practices"],
    sources: [
      { label: "CISA — election security", href: "https://www.cisa.gov/topics/election-security", kind: "agency" },
    ],
  }),
  t({
    slug: "after-action",
    term: "After-action record",
    aliases: ["after-action", "after-action record"],
    category: "commission",
    shortDefinition: "The write-up after an election or meeting: what happened, what was checked, what to fix.",
    whyItMatters:
      "The findings library is meant to be that record for the Commission. Counties already do versions of this. The public should be able to see the habit.",
    sections: [
      {
        heading: "What belongs in one",
        body: "Timeline, exceptions, audit or canvass notes, and a short list of next-cycle changes. No victory lap. No cover-up paragraph.",
      },
    ],
    relatedTopics: ["results_transparency", "post_election_audits"],
    relatedSlugs: ["findings", "minutes", "post-election-audits"],
    sources: [],
  }),
  t({
    slug: "supporting-information",
    term: "Supporting information",
    aliases: ["supporting information", "supporting materials"],
    category: "commission",
    shortDefinition: "The documents behind a finding: statutes, data tables, county memos, and test results.",
    whyItMatters:
      "A finding without attachments is an opinion. The library is where those attachments will live.",
    sections: [
      {
        heading: "What we will link",
        body: "Arkansas Code, EAC and NIST publications, Census and BLS tables when they explain access or staffing, and county or state records that are already public.",
      },
    ],
    relatedTopics: ["transparency_voter_education"],
    relatedSlugs: ["findings", "evidence", "foia"],
    sources: [
      { label: "data.gov", href: "https://data.gov/", kind: "data" },
    ],
  }),
];

export const aeacGlossaryBySlug = new Map(aeacGlossary.map((item) => [item.slug, item]));

export function getAeacGlossaryTerm(slug: string): AeacGlossaryTerm | undefined {
  return aeacGlossaryBySlug.get(slug);
}

export const aeacGlossaryCategories: { id: AeacGlossaryTerm["category"]; label: string; summary: string }[] = [
  { id: "commission", label: "How this Commission works", summary: "Words from the charter about the body itself." },
  { id: "process", label: "How an election is run", summary: "The path from a registration to a counted ballot." },
  { id: "law", label: "Law and offices", summary: "Statutes, federal floors, and who holds the duty." },
  { id: "security", label: "Security and checks", summary: "Paper, tests, networks, and the trail of custody." },
  { id: "data", label: "Public data", summary: "Numbers used to understand counties and access." },
];
