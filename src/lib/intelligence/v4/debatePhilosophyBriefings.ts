import type { DebatePhilosophyBriefing } from "@/lib/intelligence/v4/debateBriefingDepthTypes";
import { applyPhase10PhilosophyBriefing } from "@/lib/intelligence/v4/applyPhase10StrategyPhilosophy";

const HAMMER_BILLS = "/admin/intelligence/kim-hammer/bills";
const OPPOSITION = "/admin/intelligence/opposition-strategy";
const FILM = "/admin/intelligence/film-room";
const EVIDENCE = "/admin/intelligence/kim-hammer/evidence-command";

export const DEBATE_PHILOSOPHY_BRIEFINGS: DebatePhilosophyBriefing[] = [
  {
    briefingId: "agree-but-never-only-agree",
    eyebrow: "Core method",
    title: "Agree — but never only agree",
    summary:
      "The fastest way to sound like a third echo is to stop after agreement. Kelly wins by validating the shared goal, then adding what only the SOS can deliver.",
    corePhilosophy:
      "Voters already heard Hammer agree with himself. Your job is not to out-agree him — it is to add the implementation layer he skipped: county funding, published rules, training calendars, and a human SOS desk when a new act lands on a Friday.",
    whyThisMethod:
      "Three-way forums reward the candidate who sounds prepared for the office, not the candidate who sounds most partisan. Agreement buys you 8 seconds of trust; the fresh addition is what makes you memorable and non-interchangeable.",
    whenToApply: [
      "Any question where Hammer opens with 'we all want secure elections'",
      "When Packo says both parties failed — do not let that be the last word",
      "When you speak second or third and the prior answers already covered integrity",
      "Moderator asks a yes/no fairness question",
    ],
    whenNotToApply: [
      "When the question demands a direct factual correction (e.g., misquoted act text)",
      "When a claims-gate line is NEEDS_RESEARCH — do not agree to an unverified statistic",
      "Culture-war bait designed to trap you in biography defense",
    ],
    handlingSteps: [
      "Name the shared value in one sentence — no sarcasm.",
      "Add one SOS-specific deliverable Hammer cannot claim from the Senate floor.",
      "Anchor with a county or clerk example only if verified night-before.",
      "Close with unity or Civic Index language — not a zinger at Hammer.",
    ],
    samplePhrases: [
      {
        label: "Second speaker pivot",
        text: "I agree with Senator Hammer that integrity matters — what Arkansas still needs is a Secretary of State who funds clerk training when Little Rock passes the next mandate.",
        whenToUse: "After Hammer and Packo both said 'secure elections'",
        presenceGoal: "Calm authority — you are adding, not attacking",
      },
      {
        label: "Third speaker close",
        text: "We all want the same outcome — the difference is who will answer the phone when Saline County gets a new rule at 4 p.m. on a Friday.",
        whenToUse: "Closing a pile-on on integrity",
        presenceGoal: "Service-forward warmth",
      },
      {
        label: "Avoid echo trap",
        text: "I won't repeat what you just heard twice — here's what the Secretary of State actually does next week.",
        whenToUse: "When tempted to restate Hammer's line",
        presenceGoal: "Confident differentiation",
      },
    ],
    commonMistakes: [
      "Ending with 'I agree with Senator Hammer' and sitting down",
      "Adding a fresh point that is still abstract ('I'll work hard')",
      "Attacking motives instead of contrasting roles (author vs administrator)",
    ],
    linkedQuestionIds: [
      "2020-election-fairness",
      "integrity-vs-access",
      "experience-sos-ready",
      "civic-education-unity-accountability",
    ],
    linkedTrapLaneIds: ["integrity-without-participation", "experience-equals-sos-ready"],
    hammerResearchHooks: [
      {
        label: "2021 integrity package",
        href: OPPOSITION,
        finding: "Hammer brands six 2021 acts as proof of competence — staff must know which impose unfunded county burden.",
        howToUseInPrep: "After agreeing on integrity, cite one act's county implementation gap — not the slogan.",
      },
      {
        label: "SB488 act proof",
        href: `${HAMMER_BILLS}/SB488/act-proof`,
        finding: "Curated playbook — verify Arkleg before stage.",
        howToUseInPrep: "Use as fresh-addition anchor when Hammer cites authorship.",
      },
    ],
    relatedLinks: [
      { href: "/admin/intelligence/sos-debate-questions", label: "SOS question bank" },
      { href: "/admin/intelligence/debate-depth/adversity", label: "Handling adversity" },
    ],
    estimatedReadMinutes: 6,
  },
  {
    briefingId: "author-vs-administrator",
    eyebrow: "Contrast frame",
    title: "Author vs administrator — the role contrast",
    summary:
      "Hammer's strongest move is collapsing 'wrote the law' into 'can run elections.' Kelly's answer is always: writing is not administering 75 counties.",
    corePhilosophy:
      "The Arkansas Secretary of State is an operations executive for elections, business services, and public records — not a senator who lists bill numbers. Voters respect legislative service; they hire SOS candidates for who will implement.",
    whyThisMethod:
      "It avoids personal attack, stays true to Kelly's biography, and gives moderators a clean frame when Hammer claims experience. It also pairs with verified act citations when available.",
    whenToApply: [
      "Experience / readiness questions",
      "When Hammer says 'I wrote the integrity laws'",
      "County clerk unfunded mandate questions",
      "Debate openings where he leads with Senate tenure",
    ],
    whenNotToApply: [
      "Questions about Kelly's own record — answer directly first",
      "When no act is verified — stay at role level, do not invent citations",
    ],
    handlingSteps: [
      "Acknowledge legislative work where fair.",
      "Name two SOS duties (certify, train, publish rules, business filings).",
      "Contrast: author sets policy; SOS executes with counties.",
      "Offer one concrete SOS deliverable (hotline, funding ask, training calendar).",
    ],
    samplePhrases: [
      {
        label: "Soft contrast",
        text: "Senator Hammer helped write policy — the Secretary of State's job is to make sure 75 county clerks can execute it without going broke.",
        whenToUse: "High-road forums",
        presenceGoal: "Respectful, firm",
      },
      {
        label: "Clerk room",
        text: "Clerks don't call the Capitol when a new rule drops — they call the Secretary of State. I will answer that phone.",
        whenToUse: "County-heavy audiences",
        presenceGoal: "Operational credibility",
      },
    ],
    commonMistakes: [
      "Saying Hammer 'knows nothing' about elections",
      "Listing bills Kelly cannot verify on stage",
      "Sounding dismissive of the legislature's role",
    ],
    linkedQuestionIds: ["experience-sos-ready", "county-clerks-unfunded-mandates", "recent-election-laws-hard-or-easy"],
    linkedTrapLaneIds: ["experience-equals-sos-ready", "2021-vs-2025-pivot"],
    hammerResearchHooks: [
      {
        label: "Opposition strategy layer",
        href: OPPOSITION,
        finding: "Offensive moves map Hammer authorship to petition-cluster and CVSGF traps.",
        howToUseInPrep: "Pick one move per question — do not stack three contrasts in 60s.",
      },
    ],
    relatedLinks: [
      { href: "/admin/intelligence/kim-hammer/debate-prep/integrity-2021", label: "Prep § integrity 2021" },
      { href: "/admin/intelligence/election-funding", label: "Election funding" },
    ],
    estimatedReadMinutes: 7,
  },
  {
    briefingId: "county-clerk-partnership",
    eyebrow: "Service frame",
    title: "County clerk partnership — speak clerk, not Capitol",
    summary:
      "Kelly wins clerk rooms and debate undecideds when every answer lands on who implements, who pays, and who picks up the phone.",
    corePhilosophy:
      "The SOS is the statewide partner to county election administrators. Abstract integrity language without county detail sounds like a campaign ad; one verified county line sounds like a job interview.",
    whyThisMethod:
      "Hammer rarely names quorum court pressure, CVSGF gaps, or poll-worker shortages with specificity. Kelly's field work gives authentic vocabulary — use it sparingly and verify numbers.",
    whenToApply: [
      "Funding / mandate questions",
      "Poll worker shortage",
      "Turnout and access balance",
      "Trap lane: county-champion",
    ],
    whenNotToApply: [
      "Federal takeover hypotheticals — answer federal boundary first, then county",
      "When county example is not verified — use generic 'clerks statewide' language",
    ],
    handlingSteps: [
      "Translate policy to clerk workload.",
      "Name funding or training as SOS deliverable.",
      "Avoid blaming clerks for legislature choices.",
      "Bridge to unity: clerks serve every voter.",
    ],
    samplePhrases: [
      {
        label: "Funding bridge",
        text: "When the legislature passes another election bill, the Secretary of State should show up with a training plan and a funding conversation — not another surprise for quorum court.",
        whenToUse: "Unfunded mandate questions",
        presenceGoal: "Clerk ally",
      },
    ],
    commonMistakes: [
      "Citing CVSGF dollar amounts without verified ledger",
      "Pretending Kelly already runs a statewide clerk hotline",
    ],
    linkedQuestionIds: ["county-clerks-unfunded-mandates", "poll-workers-shortage", "voter-turnout-registration"],
    linkedTrapLaneIds: ["county-champion", "fraud-data-dare"],
    hammerResearchHooks: [
      {
        label: "Election funding intelligence",
        href: "/admin/intelligence/election-funding",
        finding: "CVSGF + appropriations table — partial ledger NEEDS_RESEARCH; use statutory frame if dollars unverified.",
        howToUseInPrep: "Read funding page before citing any county dollar figure.",
      },
    ],
    relatedLinks: [{ href: "/admin/intelligence/county-clerk-week", label: "7-day clerk path" }],
    estimatedReadMinutes: 8,
  },
  {
    briefingId: "pile-on-survival",
    eyebrow: "Three-way dynamics",
    title: "Pile-on survival — when both opponents attack",
    summary:
      "Packo and Hammer will sometimes align to make Kelly the odd voice out. Shorten, agree on the smallest fact, add what neither said, exit.",
    corePhilosophy:
      "You do not win a pile-on by winning every point — you win by looking like the adult who can still answer the moderator's question after noise.",
    whyThisMethod:
      "Long defensive answers feed clip culture. One sentence direct, one safe fact, one bridge preserves time and composure.",
    whenToApply: ["rebuttalIfYouArePileOnTarget scenarios", "Experience attacks", "Three-way why Kelly questions"],
    whenNotToApply: ["Opening statement — you set frame, don't react", "When moderator asks only you a follow-up"],
    handlingSteps: [
      "Thank moderator; ignore side chatter.",
      "Answer only the question asked.",
      "Smallest agree → Kelly-only add → stop.",
    ],
    samplePhrases: [
      {
        label: "Pile-on exit",
        text: "I hear two senators agree on slogans — neither named who trains poll workers in your county. I will.",
        whenToUse: "Double-team on readiness",
        presenceGoal: "Composed, not flustered",
      },
    ],
    commonMistakes: ["Interrupting", "Demanding equal time", "Personal counterattack"],
    linkedQuestionIds: ["three-way-why-kelly", "experience-sos-ready"],
    linkedTrapLaneIds: ["culture-war-escalation"],
    hammerResearchHooks: [],
    relatedLinks: [{ href: "/admin/intelligence/debate-depth/adversity", label: "Adversity depth" }],
    estimatedReadMinutes: 5,
  },
  {
    briefingId: "rebuttal-architecture",
    eyebrow: "Structure",
    title: "Rebuttal architecture — agree, contrast, bridge",
    summary:
      "Every Hammer attack gets the same skeleton: validate the value, contrast the role or record, bridge to what Kelly will do Monday morning.",
    corePhilosophy:
      "Rebuttals are not debates within the debate — they are 15-second recoveries that return the room to SOS service.",
    whyThisMethod:
      "Staff and Kelly can rehearse triggers, not paragraphs. The triplet prevents drift into anger or over-agreement.",
    whenToApply: ["All rebuttalIfHammerAttacks blocks", "Trap lane rebuttal scripts", "Film-room counter-lines"],
    whenNotToApply: ["When claims gate says NEEDS_RESEARCH — bridge without new facts"],
    handlingSteps: [
      "Agree: one clause, genuine.",
      "Contrast: role or implementation — not motive.",
      "Bridge: SOS deliverable or unity line.",
      "Stop — do not rebut the rebuttal.",
    ],
    samplePhrases: [
      {
        label: "Integrity attack",
        text: "We all want secure elections — writing law isn't administering them — I will fund clerk training.",
        whenToUse: "Hammer 'I wrote the laws'",
        presenceGoal: "Disciplined triplet",
      },
    ],
    commonMistakes: ["Skipping agree (sounds defensive)", "Contrast as insult", "Bridge that introduces unverified stats"],
    linkedQuestionIds: [],
    linkedTrapLaneIds: [],
    hammerResearchHooks: [{ label: "Evidence command", href: EVIDENCE, finding: "Staff citation locker", howToUseInPrep: "Verify before bridge cites acts" }],
    relatedLinks: [{ href: "/admin/intelligence/kim-hammer/debate-prep/rebuttal", label: "Prep § rebuttal" }],
    estimatedReadMinutes: 6,
  },
  {
    briefingId: "presence-without-repetition",
    eyebrow: "Delivery",
    title: "Presence without repetition — vary your lines",
    summary:
      "Same spine, different sentences — voters notice when Kelly repeats Hammer's cadence or the same Civic Index closer every answer.",
    corePhilosophy:
      "Unity themes are non-negotiable; verbatim scripts are not. Rotate openers, closers, and contrast verbs while keeping one fresh fact per answer.",
    whyThisMethod:
      "Repetition makes three strong answers sound like one weak loop. Alternatives in each briefing give Kelly 3+ ways to land the same strategic point.",
    whenToApply: ["Every question after the first two answers", "Rehearsal — cycle alternatives", "Social clips — pick non-default line"],
    whenNotToApply: ["Claims-sensitive answers — prioritize accuracy over variety"],
    handlingSteps: [
      "Pick opener variant by speak order position.",
      "Never reuse exact 60s answer from prior question.",
      "Rotate closers: clerk phone, Civic Index, cross-aisle, transparency pledge.",
    ],
    samplePhrases: [
      {
        label: "Closer rotation A",
        text: "I'll measure this office by whether clerks got help — not by cable news clips.",
        whenToUse: "After integrity block",
        presenceGoal: "Grounded finish",
      },
      {
        label: "Closer rotation B",
        text: "Arkansas deserves a Secretary of State who educates voters — not one who performs for primaries.",
        whenToUse: "Civic education questions",
        presenceGoal: "Educator tone",
      },
    ],
    commonMistakes: ["Same 'I agree secure elections' opener 5 times", "Copying Hammer bill-number cadence"],
    linkedQuestionIds: ["civic-education-unity-accountability", "closing-final-thought"],
    linkedTrapLaneIds: [],
    hammerResearchHooks: [{ label: "Film room", href: FILM, finding: "Opponent cadence samples", howToUseInPrep: "Don't mimic Hammer rhythm" }],
    relatedLinks: [{ href: "/admin/intelligence/debate-briefings", label: "All philosophy briefings" }],
    estimatedReadMinutes: 5,
  },
  {
    briefingId: "integrity-without-nationalizing",
    eyebrow: "2020 / national frame",
    title: "Integrity without nationalizing Arkansas",
    summary:
      "Arkansas certified its results. Kelly agrees on state facts, refuses to be a prop for national grievance, pivots to next-election SOS work.",
    corePhilosophy:
      "Nationalizing the answer wastes Arkansas seconds and hands Hammer a culture-war clip. The win is calm certitude on AR plus forward-looking SOS plan.",
    whyThisMethod:
      "2022 AR SOS debate split on this exact axis — voters remember who sounded like a statewide officer vs a cable guest.",
    whenToApply: ["2020 fairness", "Misinformation role", "Federal takeover fears"],
    whenNotToApply: ["Never deny Arkansas certification when asked directly"],
    handlingSteps: [
      "One sentence: AR certified / clerks delivered.",
      "Decline to nationalize: 'My job is the next election.'",
      "Pivot: rules, training, funding.",
    ],
    samplePhrases: [
      {
        label: "National pivot",
        text: "Arkansas's count was certified — I won't use our clerks to score national points. Ask me what I'll do in November.",
        whenToUse: "2020 bait",
        presenceGoal: "Steady, non-performative",
      },
    ],
    commonMistakes: ["45 seconds on other states", "Fraud statistics without sourcing", "Calling opponents election deniers"],
    linkedQuestionIds: ["2020-election-fairness", "misinformation-role-sos", "federal-takeover-elections"],
    linkedTrapLaneIds: ["fraud-data-dare", "2021-vs-2025-pivot"],
    hammerResearchHooks: [
      {
        label: "2022 debate archive",
        href: "/admin/intelligence/kim-hammer/debate-archive",
        finding: "Thurston/Gorman pattern on 2020 hedge",
        howToUseInPrep: "Study hedge lines — Kelly should not hedge AR",
      },
    ],
    relatedLinks: [{ href: "/admin/intelligence/trap-lanes/fraud-data-dare", label: "Trap: fraud data dare" }],
    estimatedReadMinutes: 7,
  },
  {
    briefingId: "direct-democracy-offense",
    eyebrow: "2025 cluster",
    title: "Direct democracy — petition cluster offense",
    summary:
      "Hammer's 2025 petition bills are both vulnerability and trap bait. Kelly educates on impact without sounding anti-petition — contrast implementation burden.",
    corePhilosophy:
      "Direct democracy questions test whether Kelly can explain SOS ballot duties and Hammer's authorship on petition-process bills without attacking voters who sign petitions.",
    whyThisMethod:
      "Packo may amplify anti-establishment lines; Hammer may claim integrity. Kelly's lane is transparent process + clerk capacity.",
    whenToApply: ["Petition / initiative questions", "Trap: integrity-without-participation", "SB584 cluster prep"],
    whenNotToApply: ["Do not cite petition bill impact without verified act text"],
    handlingSteps: [
      "Affirm voter participation right.",
      "Explain SOS certification workload plainly.",
      "Contrast Hammer authorship only with verified act proof links.",
    ],
    samplePhrases: [
      {
        label: "Participation + process",
        text: "I want every lawful signature counted fairly — that requires a Secretary of State who publishes clear rules and funds county verification time.",
        whenToUse: "Initiative process questions",
        presenceGoal: "Pro-voter, pro-process",
      },
    ],
    commonMistakes: ["Sounding hostile to petitions", "Unverified SB584 claims on stage"],
    linkedQuestionIds: ["petition-initiative-process"],
    linkedTrapLaneIds: ["integrity-without-participation", "2021-vs-2025-pivot"],
    hammerResearchHooks: [
      {
        label: "2025 petition cluster",
        href: OPPOSITION,
        finding: "Petition cluster depth in opposition strategy layer",
        howToUseInPrep: "Read cluster before any petition question",
      },
      { label: "SB584 act proof", href: `${HAMMER_BILLS}/SB584/act-proof`, finding: "Curated playbook", howToUseInPrep: "Staff verify before debate" },
    ],
    relatedLinks: [{ href: "/admin/intelligence/kim-hammer/debate-prep/petition-cluster", label: "Prep § petition cluster" }],
    estimatedReadMinutes: 9,
  },
];

export function getDebatePhilosophyBriefing(briefingId: string): DebatePhilosophyBriefing | undefined {
  const raw = DEBATE_PHILOSOPHY_BRIEFINGS.find((b) => b.briefingId === briefingId);
  return raw ? applyPhase10PhilosophyBriefing(raw) : undefined;
}

export function listDebatePhilosophyBriefings(): DebatePhilosophyBriefing[] {
  return DEBATE_PHILOSOPHY_BRIEFINGS.map(applyPhase10PhilosophyBriefing);
}
