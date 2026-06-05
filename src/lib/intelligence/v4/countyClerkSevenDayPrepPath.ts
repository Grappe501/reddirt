/**
 * Seven-day county-clerk-audience prep path — what Kelly reads, in what order, and why.
 * Primary audience: Arkansas county clerks & election commissioners (not TV debate theater).
 */

export type PrepReadItem = {
  id: string;
  href: string;
  label: string;
  minutes: number;
  whatToExtract: string;
  positioningForClerks: string;
  kellySuperiorityAngle: string;
};

export type PrepDayPlan = {
  day: number;
  title: string;
  subtitle: string;
  goalForKelly: string;
  hammerTrapWeWant: string;
  kellyReads: PrepReadItem[];
  staffOnly?: string[];
  rehearsalOutLoud: string[];
  afterTheDay: string;
  successCheck: string;
};

export const COUNTY_CLERK_AUDIENCE_PRIMER = {
  headline: "You are not performing for cable news — you are earning the clerks' partnership",
  whoIsInTheRoom:
    "County clerks, election commissioners, quorum court members who fund them, and senior poll workers. They care about training dollars, lead time, uniform SOS guidance, and not being blamed when the Capitol changes rules.",
  whatTheyReward:
    "Specific offers: hotline, implementation calendar, funding advocacy, respect for their oath. They punish vague culture-war talk and unfunded mandates.",
  whatHammerWillOffer:
    "Integrity slogans, #1 ranking claims, 'I wrote the bills' — light on who pays for implementation.",
  kellyWinCondition:
    "Leave every room with clerks believing Kelly will run SOS as their statewide partner — Hammer adds rules from Little Rock without a check.",
};

export const HAMMER_VS_KELLY_CLERK_MATRIX: Array<{
  topic: string;
  hammerPosition: string;
  kellyPosition: string;
  clerkQuestionToAsk: string;
}> = [
  {
    topic: "Role of SOS",
    hammerPosition: "I know election law because I sponsored it.",
    kellyPosition: "SOS administers what you live every day — I will fund clarity and answer your phone.",
    clerkQuestionToAsk: "What is your first-90-days plan for county training and implementation support?",
  },
  {
    topic: "2021 package",
    hammerPosition: "We secured elections after 2020.",
    kellyPosition: "Security yes — but six bills in one year shifted burden to counties without a visible support package.",
    clerkQuestionToAsk: "Which line items in the state budget matched each 2021 mandate for our county?",
  },
  {
    topic: "Poll watchers",
    hammerPosition: "Transparency at the polls.",
    kellyPosition: "Observation with standards — clerks should not be referees without SOS rulebooks and training.",
    clerkQuestionToAsk: "Who trains watchers when disputes land on our precinct judges?",
  },
  {
    topic: "Petitions / access",
    hammerPosition: "Stop fraud in petition drives.",
    kellyPosition: "Integrity and lawful participation together — tight rules without killing citizen initiatives.",
    clerkQuestionToAsk: "Show the fraud cases that justified each signature rule change.",
  },
  {
    topic: "Paper ballots / counting",
    hammerPosition: "Act 350 and integrity tech.",
    kellyPosition: "Clear procedures clerks can execute — state pays for rollout and help desk.",
    clerkQuestionToAsk: "What SOS staff ratio per county for Act 350 implementation?",
  },
  {
    topic: "County Voting System Grant Fund (CVSGF)",
    hammerPosition: "We funded counties — look at Act 808 and appropriations.",
    kellyPosition: "Appropriations in Little Rock are not the same as a public county ledger — SOS sets grant guidelines and must publish equitable accounting.",
    clerkQuestionToAsk: "Where is the county-by-county CVSGF award spreadsheet for the last five years?",
  },
];

export const COUNTY_CLERK_SEVEN_DAY_PATH: PrepDayPlan[] = [
  {
    day: 1,
    title: "Orient — SOS as service to clerks",
    subtitle: "Before any opponent attack language",
    goalForKelly:
      "Internalize: you are selling a partnership, not a partisan war. Clerks are the heroes; SOS is the statewide back office.",
    hammerTrapWeWant: "Do not engage Hammer yet — build Kelly's clerk-first vocabulary.",
    kellyReads: [
      {
        id: "d1-hub",
        href: "/admin/intelligence",
        label: "Command hub — executive brief",
        minutes: 15,
        whatToExtract: "Tonight focus + three moves + do-not-say count",
        positioningForClerks: "Open every clerk meeting with SOS-as-service headline, not opponent name.",
        kellySuperiorityAngle: "Kelly offers implementation; opponents offer slogans.",
      },
      {
        id: "d1-frame",
        href: "/admin/intelligence/kim-hammer/debate-prep",
        label: "Kelly master frame + pillars (prep packet top)",
        minutes: 20,
        whatToExtract: "Three pillars: trust/transparency, county support, participation+integrity",
        positioningForClerks: "Map each pillar to a clerk pain (training, funding, notice, sites).",
        kellySuperiorityAngle: "Pillars match clerk job description; Hammer pillars match Capitol authorship.",
      },
      {
        id: "d1-philosophy",
        href: "/admin/intelligence/debate-briefings/agree-but-never-only-agree",
        label: "Philosophy — agree but never only agree",
        minutes: 12,
        whatToExtract: "Core three-way method: validate, then add implementation layer",
        positioningForClerks: "Use when Hammer opens with integrity slogans in clerk rooms.",
        kellySuperiorityAngle: "Kelly adds county desk detail Hammer skips.",
      },
      {
        id: "d1-depth",
        href: "/admin/intelligence/debate-depth",
        label: "Plain-language depth library (index)",
        minutes: 10,
        whatToExtract: "Five topic guides — bookmark adversity + culture-war for later",
        positioningForClerks: "Depth blocks appear on every drill-down — know the index exists.",
        kellySuperiorityAngle: "Kelly reads for clerks; opponents read for cable.",
      },
      {
        id: "d1-county",
        href: "/admin/intelligence/kim-hammer/county-administration-burden",
        label: "County administration burden layer",
        minutes: 25,
        whatToExtract: "Four burden themes + actor roles (clerk, commissioners, quorum court)",
        positioningForClerks: "Use their statutory language — shows respect.",
        kellySuperiorityAngle: "Kelly cites actors and funding; Hammer cites rankings.",
      },
    ],
    staffOnly: ["Print one-page SOS service pledge for clerks (no new claims)", "List 3 county hosts for week"],
    rehearsalOutLoud: [
      "30s: Why I'm running SOS — for clerks, not against anyone.",
      "Name one clerk burden you will fix in first 90 days (generic until funded).",
    ],
    afterTheDay: "Send no social on Hammer — post only SOS-service for clerks photo op.",
    successCheck: "Kelly can recite three pillars without notes and without saying 'fraud' first.",
  },
  {
    day: 2,
    title: "Hammer pattern — 2021 architecture",
    subtitle: "Continuity, not a new pivot",
    goalForKelly:
      "Understand Hammer's legislative pattern as cumulative burden — especially 2021 six-bill package — without motive attacks.",
    hammerTrapWeWant: "Hammer says '2025 is a fresh start' — you have timeline + package proof ready.",
    kellyReads: [
      {
        id: "d2-integrity",
        href: "/admin/intelligence/kim-hammer/integrity-foundation-2021",
        label: "2021 integrity foundation package",
        minutes: 20,
        whatToExtract: "Six bills, narrative arc, act numbers to verify",
        positioningForClerks: "Frame as layered process changes clerks had to absorb in one session.",
        kellySuperiorityAngle: "Kelly will not add a package without a county implementation memo.",
      },
      {
        id: "d2-timeline",
        href: "/admin/intelligence/kim-hammer/timeline",
        label: "Legislative timeline",
        minutes: 15,
        whatToExtract: "2021 cluster vs 2023/2025 bills",
        positioningForClerks: "Show you did homework on their workload years.",
        kellySuperiorityAngle: "Kelly reads timeline forward; Hammer reads rankings backward.",
      },
      {
        id: "d2-themes",
        href: "/admin/intelligence/kim-hammer/themes",
        label: "Theme matrix",
        minutes: 15,
        whatToExtract: "Top 2 themes touching county admin + petition",
        positioningForClerks: "Speak in themes ('site control', 'observer rules') not bill soup.",
        kellySuperiorityAngle: "Kelly translates law into clerk shifts; Hammer lists bill numbers.",
      },
    ],
    staffOnly: ["Verify act numbers on Arkleg for any slide", "Build one-slide 2021→2025 continuity graphic"],
    rehearsalOutLoud: [
      "45s: 'This didn't start last session — in 2021 your offices got six process changes…'",
      "Practice agree-integrity-then-contrast-implementation.",
    ],
    afterTheDay: "Staff social: timeline graphic with claims gate.",
    successCheck: "Kelly can name two 2021 bills and one county impact without overstating fraud.",
  },
  {
    day: 3,
    title: "Trap setup — implementation questions",
    subtitle: "Walk him into your hand",
    goalForKelly:
      "Memorize five cross-exam questions that force implementation answers — the lane where Hammer is weakest vs SOS job.",
    hammerTrapWeWant:
      "Hammer claims 'I stand with clerks' — you ask for training dollars, SOS ratio, implementation calendar.",
    kellyReads: [
      {
        id: "d3-contrast",
        href: "/admin/intelligence/debate-command",
        label: "Debate command — P4 cross-exam bank",
        minutes: 25,
        whatToExtract: "County champion + 2021 pivot traps + bill-anchored questions",
        positioningForClerks: "Use questions in Q&A; let clerks nod when he can't answer.",
        kellySuperiorityAngle: "Kelly asks; Hammer slogans.",
      },
      {
        id: "d3-matrix",
        href: "/admin/intelligence",
        label: "Hammer vs Kelly clerk matrix (hub)",
        minutes: 15,
        whatToExtract: "Five topic rows — memorize clerk question column",
        positioningForClerks: "Invite clerks to ask Hammer the funding question.",
        kellySuperiorityAngle: "Kelly publishes implementation plan; Hammer publishes press releases.",
      },
      {
        id: "d3-hammer-depth",
        href: "/admin/intelligence/debate-depth/hammer-attacks",
        label: "How Hammer attacks — pattern playbook",
        minutes: 20,
        whatToExtract: "Six predictable lanes + argument map rhythm",
        positioningForClerks: "Translate attacks into clerk funding questions, not biography defense.",
        kellySuperiorityAngle: "Kelly structure vs Hammer interruption.",
      },
      {
        id: "d3-gaps",
        href: "/admin/intelligence/kim-hammer/intelligence-gaps",
        label: "Retrieval gaps (staff context)",
        minutes: 10,
        whatToExtract: "What evidence is still OPEN — do not cite on stage",
        positioningForClerks: "Honesty builds trust: 'we verify before we quote.'",
        kellySuperiorityAngle: "Kelly runs claims gate; opponents run vibes.",
      },
    ],
    staffOnly: ["Brief friendly clerk ally to ask funding question if Hammer present"],
    rehearsalOutLoud: [
      "Role-play: Hammer 'I stand with clerks' → your funding question → pivot SOS hotline pledge.",
    ],
    afterTheDay: "Internal only — no clip hunting until verified.",
    successCheck: "Kelly delivers three trap questions calmly, not prosecutorial.",
  },
  {
    day: 4,
    title: "Contrast & superiority — values, not smears",
    subtitle: "Kelly wins on job fit",
    goalForKelly:
      "Practice fair acknowledgment of Hammer strengths (tenure, integrity goal) then clear SOS administrator contrast.",
    hammerTrapWeWant: "Hammer says 'no one knows elections like me' — pivot to SOS implements in 75 counties equally.",
    kellyReads: [
      {
        id: "d4-contrast",
        href: "/admin/intelligence/kim-hammer/contrast-vs-kelly",
        label: "Contrast vs Kelly research",
        minutes: 20,
        whatToExtract: "Values-forward contrast bullets",
        positioningForClerks: "Never attack pastor/community identity — stay on job duties.",
        kellySuperiorityAngle: "Senator writes rules; Secretary administers service.",
      },
      {
        id: "d4-strengths",
        href: "/admin/intelligence/kim-hammer/strengths-weaknesses",
        label: "Strengths / vulnerabilities matrix",
        minutes: 15,
        whatToExtract: "One strength to acknowledge, two safer vulnerability framings",
        positioningForClerks: "Acknowledge his election-law focus; ask about unfunded mandates.",
        kellySuperiorityAngle: "Kelly fair + specific; Hammer general + ranked.",
      },
      {
        id: "d4-claims",
        href: "/admin/intelligence/claims",
        label: "Claims ledger",
        minutes: 15,
        whatToExtract: "Green vs amber vs red lines for clerk audiences",
        positioningForClerks: "Show discipline — clerks hate candidates who exaggerate.",
        kellySuperiorityAngle: "Kelly cites ledger; Hammer cites Heritage paraphrase (needs review).",
      },
    ],
    staffOnly: ["Cut 'against the people' language — use burden-on-clerks framing"],
    rehearsalOutLoud: [
      "60s: Acknowledge strength → contrast implementation → SOS pledge → close on clerks.",
    ],
    afterTheDay: "Draft clerk-facing one-pager (facts only, counsel if distributing).",
    successCheck: "Kelly can acknowledge one Hammer strength without losing frame.",
  },
  {
    day: 5,
    title: "Bill drills — act anchors",
    subtitle: "Credibility with clerks",
    goalForKelly:
      "Rehearse three anchor bills with act numbers, county impact, and 30-second answers.",
    hammerTrapWeWant: "Hammer drops SB250/HB1457 — you answer with Act + clerk impact first.",
    kellyReads: [
      {
        id: "d5-playbooks",
        href: "/admin/intelligence/kim-hammer/debate-prep",
        label: "Anchor bill playbooks (SB250, HB1457, SB291)",
        minutes: 40,
        whatToExtract: "Step-by-step WHAT/WHEN/HOW + debate script + trap per bill",
        positioningForClerks: "Use bills clerks actually implement — not abstract integrity.",
        kellySuperiorityAngle: "Kelly names acts and county desk impact.",
      },
      {
        id: "d5-rehearsal",
        href: "/admin/intelligence",
        label: "Hub rehearsal deck",
        minutes: 20,
        whatToExtract: "Drill queue cards — 30s structure",
        positioningForClerks: "Practice standing, not seated — mimic town hall.",
        kellySuperiorityAngle: "Kelly rehearsed implementation; Hammer rehearsed slogans.",
      },
      {
        id: "d5-bills",
        href: "/admin/intelligence/kim-hammer/bills/SB250",
        label: "Bill drill-down SB250 (repeat HB1457)",
        minutes: 15,
        whatToExtract: "County frame box + publication risk",
        positioningForClerks: "Invite clerk feedback: 'did Act 350 match your training budget?'",
        kellySuperiorityAngle: "Kelly listens; Hammer lectures.",
      },
    ],
    staffOnly: ["Bring laminated act cheat sheet for Kelly pocket"],
    rehearsalOutLoud: ["Three 30s answers + one 60s on county burden theme"],
    afterTheDay: "No public bill attack posts — save for post-event with citations",
    successCheck: "Kelly cites at least two act numbers correctly in rehearsal.",
  },
  {
    day: 6,
    title: "ACCA Mountain View — SOS candidates panel",
    subtitle: "Thu Jun 11 · 1:00–3:00pm · Ozark Folk Center",
    goalForKelly:
      "Execute clerk-first panel with Hammer and Pakko: listen 40%, SOS service plan 40%, contrast only when asked 20%. Arrive 12:40pm for A/V.",
    hammerTrapWeWant:
      "Hammer says 'I stand with clerks' in front of ACCA — use county ledger / training-dollar questions calmly.",
    kellyReads: [
      {
        id: "d6-acca",
        href: "/admin/intelligence/county-clerk-week/acca-summer-conference",
        label: "ACCA Summer Conference — full panel prep",
        minutes: 45,
        whatToExtract: "13 sections: panel format, three-way geometry, CVSGF for clerks, ES&S room awareness, staff checklist",
        positioningForClerks: "Partnership audition — not cable debate. Thank Margaret Darter; match ACCA professional tone.",
        kellySuperiorityAngle: "Kelly sounds like future SOS administrator; Hammer sounds like senator.",
      },
      {
        id: "d6-panel-format",
        href: "/admin/intelligence/county-clerk-week/acca-summer-conference/panel-format",
        label: "Two-hour moderated panel — rules of engagement",
        minutes: 15,
        whatToExtract: "120 min Q&A ratio, 60–90s answers, exhibitor break after",
        positioningForClerks: "Leave air for clerk questions — do not filibuster.",
        kellySuperiorityAngle: "Kelly disciplined time; opponents perform.",
      },
      {
        id: "d6-pocket",
        href: "/admin/intelligence/county-clerk-week",
        label: "County clerk week — live card",
        minutes: 10,
        whatToExtract: "Do-not-say + pocket answers + success metrics",
        positioningForClerks: "Open with listening session; close with hotline + training pledge.",
        kellySuperiorityAngle: "Kelly leaves with clerk cell numbers saved; opponents leave with flyers.",
      },
      {
        id: "d6-do-not-say",
        href: "/admin/intelligence/claims",
        label: "Claims — needs research queue",
        minutes: 5,
        whatToExtract: "Red lines for today",
        positioningForClerks: "If unsure, say 'I will verify with your county and publish guidance.'",
        kellySuperiorityAngle: "Kelly honest; opponents overclaim.",
      },
      {
        id: "d6-psychology",
        href: "/admin/intelligence/debate-prep/psychology-manual",
        label: "Psychology manual — panel atmosphere",
        minutes: 20,
        whatToExtract: "ACCA panel sections + three-way geometry + body language",
        positioningForClerks: "Professional tone for ACCA — not cable debate volume.",
        kellySuperiorityAngle: "Kelly steady executive presence; Hammer performs.",
      },
      {
        id: "d6-three-way",
        href: "/admin/intelligence/debate-depth/three-way",
        label: "Three-way debate geometry",
        minutes: 14,
        whatToExtract: "Speak order, agreement traps, never ask Packo for vote on stage",
        positioningForClerks: "Panel has Hammer + Pakko — add fresh county line after their agreement.",
        kellySuperiorityAngle: "Kelly adds implementation; opponents echo integrity.",
      },
      {
        id: "d6-film",
        href: "/admin/intelligence/film-room",
        label: "Film room / clips (staff only on stage)",
        minutes: 5,
        whatToExtract: "Do not play unverified clips in clerk rooms",
        positioningForClerks: "Offer to return with verified training video later.",
        kellySuperiorityAngle: "Kelly evidence discipline.",
      },
    ],
    staffOnly: [
      "Kelly at Ozark Folk Center by 12:40pm Thu Jun 11 — Michael Roys 479-567-1269",
      "Capture clerk quotes (permission) for institutional memory",
      "Log Hammer/Pakko panel claims for claims gate",
      "Visit exhibitor break 3:00–3:15 if schedule allows",
    ],
    rehearsalOutLoud: [
      "Opening 90s clerk-first (no opponent names)",
      "90s CVSGF fair public line + ledger trap question",
      "Pakko respect line + administrator close",
    ],
    afterTheDay: "Thank Michael Roys & Margaret Darter within 24h; staff posts only verified lines",
    successCheck: "At least three clerk follow-ups scheduled; zero NEEDS_RESEARCH lines spoken in panel",
  },
  {
    day: 7,
    title: "Consolidate + widen field (Packo watch)",
    subtitle: "After clerks week",
    goalForKelly:
      "Debrief, publish verified follow-ups, skim third-candidate scaffold — stay clerk-trusted.",
    hammerTrapWeWant: "Opponents attack your clerk tour — you respond with clerk testimonials + acts, not tone.",
    kellyReads: [
      {
        id: "d7-memory",
        href: "/admin/intelligence/memory",
        label: "Memory ledger (staff)",
        minutes: 10,
        whatToExtract: "What to lock from clerk week",
        positioningForClerks: "Show you remember their concerns next visit.",
        kellySuperiorityAngle: "Kelly institutional memory; opponents one-off visits.",
      },
      {
        id: "d7-progress",
        href: "/admin/intelligence/build-progress",
        label: "Build progress — gaps & completion chart",
        minutes: 10,
        whatToExtract: "Flagged items before next public event; overall completion %",
        positioningForClerks: "Staff uses chart; Kelly knows what is still PARTIAL.",
        kellySuperiorityAngle: "Kelly honest about verification; opponents overclaim.",
      },
      {
        id: "d7-packo",
        href: "/admin/intelligence/opponents",
        label: "Opponents hub — Packo scaffold (when live)",
        minutes: 15,
        whatToExtract: "Libertarian lane: access, skepticism of mandates — do not confuse with clerk message",
        positioningForClerks: "Clerks still primary; Packo is voter-persuasion secondary.",
        kellySuperiorityAngle: "Kelly SOS credibility vs third-party protest vote.",
      },
      {
        id: "d7-social",
        href: "/admin/intelligence/kim-hammer/debate-prep",
        label: "Social thread outlines from bill playbooks",
        minutes: 20,
        whatToExtract: "One verified thread from clerk week + one policy thread",
        positioningForClerks: "Tag county partners only with permission.",
        kellySuperiorityAngle: "Kelly posts proof; opponents post rankings.",
      },
    ],
    staffOnly: ["Run claims ingest for any new clerk quotes", "Assign Packo retrieval tasks per scaffold"],
    rehearsalOutLoud: ["90s debrief narrative for county press"],
    afterTheDay: "Plan week 2 clerk counties from debrief notes",
    successCheck: "Clerk debrief doc circulated; Packo tasks assigned or scheduled",
  },
];

export function getCountyClerkDayPlan(day: number): PrepDayPlan | undefined {
  return COUNTY_CLERK_SEVEN_DAY_PATH.find((d) => d.day === day);
}

export function totalCountyClerkReadMinutes(): number {
  return COUNTY_CLERK_SEVEN_DAY_PATH.reduce(
    (sum, d) => sum + d.kellyReads.reduce((s, r) => s + r.minutes, 0),
    0,
  );
}
