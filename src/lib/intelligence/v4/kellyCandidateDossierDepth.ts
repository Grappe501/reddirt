/**
 * Kelly Grappe — Experience-to-Office Alignment Profile.
 * Candidate-facing dossier: single-page readout + per-theme drill-down.
 */
import type { KellyCandidateDossierFile } from "@/lib/intelligence/v4/loadKellyCandidateDossier";

export type KellyDossierDepthSection = {
  sectionId: string;
  title: string;
  eyebrow: string;
  narrativeOverview: string[];
  relevantSosFunctions: string[];
  experienceHighlights: string[];
  debateFramingExample: string;
  plainEnglishWalkthrough: string[];
  howToUseInDebate: string[];
  howToUseOnTrail: string[];
  whatNotToDo: string[];
  relatedSectionIds: string[];
  href?: string;
  /** Sourced research corpus — facts and staff field notes beyond narrative overview */
  researchDepth?: {
    sourcedFacts: string[];
    fieldResearchNotes: string[];
  };
};

export const KELLY_DOSSIER_SECTIONS: KellyDossierDepthSection[] = [
  {
    sectionId: "kelly-sos-office-overview",
    title: "What the Secretary of State actually does",
    eyebrow: "Office map · read first",
    narrativeOverview: [
      "Before any debate answer, Kelly should hold a clear mental map of the office she is seeking. The Arkansas Secretary of State is not a single-issue election post — it is a multi-division public trust institution that touches every county, every business filing desk, and every citizen who needs to understand how to participate in democracy.",
      "Election administration and county support sit at the center of this race: training clerks, supporting poll workers, certifying results, and coordinating with all seventy-five counties when the legislature changes the rules. But the same office also manages business and commercial filings, public records and transparency functions, State Capitol and grounds oversight, civic education, and large-scale organizational management across multiple divisions.",
      "When Hammer emphasizes authorship of election bills, Kelly's contrast is not 'I wrote different bills' — it is 'I will administer the service layer those bills created.' When Pakko emphasizes reform ideas, Kelly's contrast is daily operational readiness for Monday morning in a county clerk's office.",
      "This overview is the anchor for every other section in this dossier. Each experience theme below maps to one or more of these SOS functions — rehearse the bridge, not the job title.",
    ],
    relevantSosFunctions: [
      "Election administration and support across 75 counties",
      "Business and commercial filings",
      "Public records and transparency",
      "State Capitol and grounds oversight",
      "Civic education and public information",
      "Large-scale organizational management",
      "Coordination with county clerks and election officials",
      "Public trust and institutional stewardship",
    ],
    experienceHighlights: [
      "Kelly's campaign frame: depoliticize the office, serve every county equally, publish rules clerks can execute.",
    ],
    debateFramingExample:
      "The Secretary of State's office belongs to the people of Arkansas. My job is to make sure it serves every county fairly, operates transparently, and earns public trust — not to win arguments about who wrote which bill.",
    plainEnglishWalkthrough: [
      "Memorize the eight SOS function buckets — not as a list on stage, but as a mental checklist when answering.",
      "When asked 'why you,' pick the function most relevant to the question, then bridge from experience.",
      "Never let the debate shrink to one lane (elections only) if the question invites broader administration.",
    ],
    howToUseInDebate: [
      "Opening/closing: SOS as service office for all seventy-five counties.",
      "When Hammer cites authorship: agree on integrity → contrast implementation → SOS pledge.",
      "When Pakko cites reform: respect ideas → differentiate administrator readiness.",
    ],
    howToUseOnTrail: [
      "County visits: lead with clerk partnership and published training calendar — not opponent attacks.",
      "Business audiences: mention UCC/filings division stewardship alongside elections.",
    ],
    whatNotToDo: [
      "Do not recite the eight functions as a bullet list on TV — use them as internal structure.",
      "Do not claim SOS experience you do not have — bridge from transferable leadership.",
    ],
    relatedSectionIds: ["kelly-experience-office-crosswalk", "kelly-public-trust-stewardship"],
    href: "/admin/intelligence/sos-debate-questions",
  },
  {
    sectionId: "kelly-organizational-leadership",
    title: "Organizational leadership — systems people can trust",
    eyebrow: "Experience → skill → office",
    narrativeOverview: [
      "According to Kelly's campaign biography and public record, she brings approximately three decades of leadership experience — including directing large teams and organizational systems in corporate and healthcare-adjacent environments. Her biography cites leadership roles at Verizon and the development of training and leadership programs at Rock Dental, with experience managing large teams, budgets, organizational transitions, and operational systems.",
      "The Secretary of State's office is, at its core, an operations institution. Counties depend on predictable processes: when a new act lands on a Friday afternoon, clerks need published guidance, training pathways, and a human being who answers the phone. Kelly's leadership narrative is not 'I was a vice president' — it is 'I have spent my career building systems that had to work reliably for thousands of people who did not all agree with each other.'",
      "Hammer will frame legislative authorship as proof of competence. Kelly's answer is not to compete on bill count — it is to explain that writing rules and administering them are different jobs, and that she has done the latter kind of work for decades: change management, cross-functional coordination, and making complex requirements usable for front-line staff.",
      "In clerk rooms especially, operational credibility matters more than partisan framing. Kelly should sound like the person who will show up when Act 350 creates a training gap — not the person who wrote the gap into law.",
    ],
    relevantSosFunctions: [
      "Managing large staffs across divisions",
      "Organizational change management when statutes change",
      "Building operational systems counties can execute",
      "Cross-functional coordination (elections, business services, Capitol)",
      "Public service administration at scale",
    ],
    experienceHighlights: [
      "Verizon — large-team leadership and organizational systems.",
      "Rock Dental — training and leadership-development program design.",
      "Budget and transition management in multi-site environments.",
    ],
    debateFramingExample:
      "Throughout my career I've worked in organizations where success depended on creating systems that worked reliably, training people well, and helping large groups work toward a common goal. That's exactly the kind of administrative leadership the Secretary of State's office requires.",
    plainEnglishWalkthrough: [
      "Never open with 'I worked at X company' — open with the skill the company taught you.",
      "Structure: experience → skill → office responsibility → SOS pledge.",
      "If Hammer says 'I wrote the laws,' respond: 'And I am running to administer them fairly in all seventy-five counties.'",
    ],
    howToUseInDebate: [
      "Primary rebuttal to 'inexperienced' attack: decades of operational leadership, not decades in Little Rock.",
      "Pair with CVSGF ledger trap — Kelly offers implementation, not just critique.",
    ],
    howToUseOnTrail: [
      "Quorum court / clerk meetings: emphasize hotline, training calendar, and published implementation memos.",
    ],
    whatNotToDo: [
      "Do not name-drop corporate titles without translating to SOS function.",
      "Do not imply private-sector parity with statutory SOS duties — bridge, don't equate.",
    ],
    relatedSectionIds: ["kelly-leadership-development", "kelly-debate-credential-intro"],
    href: "/admin/intelligence/kelly-debate-coaching",
  },
  {
    sectionId: "kelly-leadership-development",
    title: "Leadership development and training systems",
    eyebrow: "Clerk training · poll workers · public communication",
    narrativeOverview: [
      "Kelly's public biography states that she helped build learning and leadership-development programs and spent years helping people develop skills and leadership capacity. That work is directly transferable to one of the most under-discussed SOS responsibilities: training the people who make elections work.",
      "County clerks, election officials, poll workers, business owners, notaries, and public information audiences all depend on the Secretary of State to translate law into usable guidance. When Hammer sponsors complex election legislation, counties still need training dollars, materials, and consistent statewide standards. Kelly's training-systems background is her answer to 'who will help clerks implement this?'",
      "This section also supports Kelly's civic-education lane: teaching is not a soft skill in this office — it is operational infrastructure. A SOS who cannot explain the system cannot administer it.",
      "Rehearse this theme when moderators ask about unfunded mandates, poll worker recruitment, or notary rule changes. The through-line: Kelly builds systems that help people succeed inside complex rules.",
    ],
    relevantSosFunctions: [
      "County clerk and election official training",
      "Poll worker onboarding and retention",
      "Notary and business-filing guidance",
      "Public information and voter education",
      "Statewide consistency when statutes change mid-cycle",
    ],
    experienceHighlights: [
      "Rock Dental leadership-development program design.",
      "Career-long emphasis on skill-building and leadership capacity.",
      "Stand Up Arkansas civic education (see dedicated section).",
    ],
    debateFramingExample:
      "One of the things I've done throughout my career is help people understand complex systems and use them successfully. County clerks deserve a Secretary of State who publishes training they can actually use — not just new rules landing on a Friday afternoon.",
    plainEnglishWalkthrough: [
      "When Hammer cites security bills, ask: 'Where is the training budget for clerks to implement them?'",
      "Bridge from training experience → clerk hotline → published calendar.",
      "Keep tone teacher-clear, not prosecutorial.",
    ],
    howToUseInDebate: [
      "ACCA panel: primary clerk-room credibility lane alongside CVSGF questions.",
      "Three-way forums: if Pakko agrees mandates hurt clerks, add Kelly's training + funding plan.",
    ],
    howToUseOnTrail: [
      "Offer concrete SOS commitments: training calendar, clerk advisory rhythm, published FAQ on new acts.",
    ],
    whatNotToDo: [
      "Do not claim specific SOS training programs already exist — pledge future operational detail.",
      "Do not mock poll workers or clerks as 'confused' — frame as unfunded complexity.",
    ],
    relatedSectionIds: ["kelly-civic-education", "kelly-rural-arkansas"],
    href: "/admin/intelligence/county-clerk-week",
  },
  {
    sectionId: "kelly-civic-education",
    title: "Civic education experience — Stand Up Arkansas",
    eyebrow: "Lawful participation · rural civics",
    narrativeOverview: [
      "Kelly's biography and verified media record state that she co-founded Stand Up Arkansas and helped build civic education programs designed to help Arkansans understand government processes and civic participation — especially in rural communities where distance from the capital can feel like distance from democracy itself.",
      "Opponents will frame this work as partisan activism. Kelly's answer is to own lawful civic engagement as Arkansas tradition, then draw a bright line: organizing history informs her values; SOS administration requires serving every lawful petition and every county clerk equally during this race.",
      "The SOS office includes public-facing education responsibilities regarding elections, voter participation, public records, and civic processes. Kelly can speak credibly about why civic literacy matters without relitigating specific ballot measures on stage — especially LEARNS/CAPES and For AR Kids themes covered in the public record brief.",
      "This section pairs with the public record brief's petition-boundary drills. Rehearse the ten-second pivot: agree on integrity → SOS serves all sides → implementation plan.",
    ],
    relevantSosFunctions: [
      "Elections and voter participation education",
      "Public records literacy",
      "Civic process explainers for counties",
      "Non-partisan administration of lawful petitions",
    ],
    experienceHighlights: [
      "Stand Up Arkansas co-founder — rural civic engagement.",
      "Documented ballot-measure organizing (For AR Kids themes).",
      "Campaign pledge: depoliticize SOS, call balls and strikes.",
    ],
    debateFramingExample:
      "I've spent years helping people understand how government works and how they can participate effectively. As Secretary of State, I will administer the rules fairly for every lawful drive and every county — that is the job.",
    plainEnglishWalkthrough: [
      "If LEARNS/CAPES spouse question arises: one-sentence boundary, pivot to SOS neutrality plan.",
      "Never end on 'agree' alone — always bridge to implementation.",
      "Use public record brief verified lines only — claims gate for anything new.",
    ],
    howToUseInDebate: [
      "Hammer petition cluster: agree integrity → contrast unfunded rules → publish ledger + training.",
      "Packo duopoly question: respect voter choice → administrator differentiation.",
    ],
    howToUseOnTrail: [
      "Emphasize civic education as SOS duty — voter guides, plain-English act summaries.",
    ],
    whatNotToDo: [
      "Do not attack spouse or CAPES on stage.",
      "Do not deny documented organizing — own and pivot.",
      "Do not circulate petitions during this race (campaign stance) — state once if asked.",
    ],
    relatedSectionIds: ["kelly-public-trust-stewardship", "kelly-debate-credential-intro"],
    href: "/admin/intelligence/kelly-debate-coaching",
  },
  {
    sectionId: "kelly-rural-arkansas",
    title: "Rural Arkansas perspective — Rose Bud and small-farm roots",
    eyebrow: "75 counties · not just Pulaski",
    narrativeOverview: [
      "Kelly's public biography references life in Rose Bud, small-farm ownership, rural community engagement, and work with families and local communities across Arkansas. This is not a decorative bio detail — it is a governance argument. The Secretary of State serves rural counties, small towns, local businesses, agricultural communities, and urban centers with equal statutory obligation.",
      "Hammer's base includes many Republican-leaning rural clerks. Kelly will not win all of them with party label — she wins trust by sounding like someone who understands that a mandate from Little Rock lands differently in a one-clerk county than in Pulaski.",
      "Rural perspective also informs Kelly's funding arguments: CVSGF transparency, training access, and equipment timelines hit small counties first when money and staff time are scarce.",
      "Use this theme to reject the implicit frame that SOS is a Little Rock political prize. Kelly's line: the office belongs to every county clerk who opens the doors on Monday.",
    ],
    relevantSosFunctions: [
      "Equal service to rural and urban counties",
      "Small-business and UCC filing support",
      "Agricultural community outreach",
      "Grant and equipment funding equity",
    ],
    experienceHighlights: [
      "Rose Bud roots and small-farm ownership.",
      "Stand Up Arkansas rural civic focus.",
      "Road stories and community engagement (see kelly-road-stories.json).",
    ],
    debateFramingExample:
      "I've lived and worked in the same communities that rely on state government systems every day. When a new election rule lands, it is not abstract in Rose Bud — it is overtime for a clerk and a line at the courthouse.",
    plainEnglishWalkthrough: [
      "Pair rural identity with CVSGF / training traps — concrete, not sentimental.",
      "One personal sentence max on stage — then policy.",
      "Avoid urban-vs-rural divisive language.",
    ],
    howToUseInDebate: [
      "County champion framing: Kelly as clerk partner, not coastal activist caricature.",
      "ACCA Mountain View panel: geographic credibility in clerk-heavy audience.",
    ],
    howToUseOnTrail: [
      "Lead with county names and clerk partnership — not opponent insults.",
    ],
    whatNotToDo: [
      "Do not perform rural accent or over-index on biography.",
      "Do not imply Hammer ignores rural Arkansas — contrast implementation support.",
    ],
    relatedSectionIds: ["kelly-community-building", "kelly-organizational-leadership"],
    href: "/admin/intelligence/county-clerk-week/acca-summer-conference",
  },
  {
    sectionId: "kelly-community-building",
    title: "Community building and volunteer leadership",
    eyebrow: "Coalition · trust · stakeholder engagement",
    narrativeOverview: [
      "The public record reflects Kelly's involvement in community organizing, civic engagement efforts, mentorship programs, women's leadership initiatives, and community education programs. Success in the Secretary of State's office often depends on coalition building, public communication, trust-building, and stakeholder engagement — especially when election law changes polarize counties.",
      "Kelly's community-building experience is the human counterpart to her organizational-leadership systems work: she has repeatedly brought people together who do not always agree and helped them work toward common goals. That is precisely the temperament SOS requires when quorum courts, clerk associations, and partisan election boards all need the same published guidance.",
      "Hammer may project combativeness; Pakko may project ideological reform. Kelly's differentiation is steady warmth plus operational clarity — the person who de-escalates and delivers service.",
      "This section supports Kelly's debate psychology training: executive calm, teacher clarity, dossier-sourced facts through claims gate.",
    ],
    relevantSosFunctions: [
      "Coalition building across county lines",
      "Public communication during contested elections",
      "Trust-building with clerks and quorum courts",
      "Stakeholder engagement on rule changes",
    ],
    experienceHighlights: [
      "Community organizing and civic engagement leadership.",
      "Mentorship and women's leadership initiatives.",
      "Stand Up Arkansas coalition work in rural counties.",
    ],
    debateFramingExample:
      "A large part of my work has involved bringing people together who don't always agree and helping them work toward common goals. The Secretary of State's office needs that same steadiness — especially when the legislature changes the rules mid-cycle.",
    plainEnglishWalkthrough: [
      "If debate gets hot, slow down — lower voice, shorter sentences.",
      "Never match Hammer combat tone — contrast temperament through calm.",
      "Clerk rooms reward curiosity, not prosecution.",
    ],
    howToUseInDebate: [
      "Three-way forums: do not pile on Pakko to hurt Hammer — agree on burden, add SOS plan.",
      "Culture-war bait: ten-second boundary → acts and clerks.",
    ],
    howToUseOnTrail: [
      "Volunteer events: emphasize service and listening — build trust before asking for vote.",
    ],
    whatNotToDo: [
      "Do not claim bipartisan endorsements without verification.",
      "Do not attack opponents' communities or faith.",
    ],
    relatedSectionIds: ["kelly-public-trust-stewardship", "kelly-family-stewardship"],
    href: "/admin/intelligence/debate-depth",
  },
  {
    sectionId: "kelly-family-stewardship",
    title: "Family, foster care, and adoption — stewardship narrative",
    eyebrow: "Personal story · principle connection",
    narrativeOverview: [
      "Kelly's biography notes that she became a parent through foster care and adoption and later became a grandmother. This is not a technical qualification for the Secretary of State's office — and Kelly should never present it as a credential check-box on a debate stage.",
      "Used well, family stewardship informs discussions about service, responsibility, long-term thinking, and future generations — the same instincts voters want in an institutional trust office. Used poorly, it reads as emotional manipulation or invites invasive counter-narratives Kelly cannot control in ninety seconds.",
      "The rule: personal stories work best when connected to a broader principle rather than presented as credentials. One sentence, one principle, pivot to SOS service.",
      "Staff should keep deeper family narrative in candidate-eyes-only coaching — not opposition research packets or public social unless Kelly chooses otherwise.",
    ],
    relevantSosFunctions: [
      "Long-term institutional stewardship",
      "Public trust across generations",
      "Service ethic and responsibility framing",
    ],
    experienceHighlights: [
      "Foster care and adoption parenthood — documented in campaign biography.",
      "Grandmother — human context for future-generations language.",
    ],
    debateFramingExample:
      "Raising children through foster care and adoption taught me that public institutions have to be worthy of trust — because families depend on them. That is why I am running to administer this office fairly for every county.",
    plainEnglishWalkthrough: [
      "Use only if moderator or audience question invites personal story.",
      "One sentence → principle → SOS plan → stop.",
      "Do not use as rebuttal to policy attacks.",
    ],
    howToUseInDebate: [
      "Optional closing color — not opening unless format is biographical.",
    ],
    howToUseOnTrail: [
      "House parties and small forums — authentic connection when invited.",
    ],
    whatNotToDo: [
      "Do not weaponize against opponents' family.",
      "Do not over-share on TV — vulnerability without pivot reads as distraction.",
    ],
    relatedSectionIds: ["kelly-public-trust-stewardship", "kelly-30-second-bio"],
  },
  {
    sectionId: "kelly-public-trust-stewardship",
    title: "Public trust and institutional stewardship",
    eyebrow: "Trust office · transparency · fairness",
    narrativeOverview: [
      "The Secretary of State's office is fundamentally a trust office. Voters evaluate candidates on reliability, transparency, consistency, competence, and fairness — often before they evaluate party or ideology. Kelly's campaign messaging emphasizes transparency, public trust, county support, and administration rather than ideological conflict.",
      "This section is Kelly's north star when Hammer invokes security theater or Pakko invokes anti-establishment reform. The answer is always: publish the rules, publish the ledger, answer the clerk hotline, treat every county equally.",
      "Kelly's depoliticize-SOS frame is verified on kellygrappe.com — use 'call balls and strikes' language that signals neutrality without pretending parties do not exist. Neutrality in this race means operational fairness, not absence of values.",
      "Pair with claims gate discipline: trust is destroyed faster by one unsourced line than by any opponent attack.",
    ],
    relevantSosFunctions: [
      "Public trust in election administration",
      "Transparency in funding and rule publication",
      "Consistent treatment of counties",
      "Institutional stewardship of Capitol and records",
    ],
    experienceHighlights: [
      "Campaign pledge: depoliticize SOS, county fairness, election security through service.",
      "Public record brief: verified kellygrappe.com messaging.",
    ],
    debateFramingExample:
      "The Secretary of State's office belongs to the people. My focus is on making sure it serves every county fairly, operates transparently, and earns public trust.",
    plainEnglishWalkthrough: [
      "When attacked as 'activist,' respond with office plan — not biography defense for 45 seconds.",
      "Publish-the-ledger promise is Kelly's signature contrast with Hammer funding opacity.",
      "Claims gate every number before stage.",
    ],
    howToUseInDebate: [
      "Closing lines: SOS as service, not conflict office.",
      "Rebuttal to #1 ranking claims: ranking ≠ clerk training dollars.",
    ],
    howToUseOnTrail: [
      "Transparency pledges: CVSGF spreadsheet, training calendar, act-summary FAQ.",
    ],
    whatNotToDo: [
      "Do not claim 'non-partisan' if moderator will cite party label — use 'fair administration.'",
      "Do not promise outcomes only the legislature controls — stay in SOS lane.",
    ],
    relatedSectionIds: ["kelly-sos-office-overview", "kelly-debate-credential-intro"],
    href: "/admin/intelligence/claims",
  },
  {
    sectionId: "kelly-debate-credential-intro",
    title: "How to introduce credentials in a debate",
    eyebrow: "Structure · not résumé recitation",
    narrativeOverview: [
      "One common mistake candidates make is answering experience questions with job titles: 'I worked at Verizon.' or 'I co-founded Stand Up Arkansas.' Titles invite gotcha research and sound like résumé reading — not leadership.",
      "The stronger structure is Experience → Skill → Office: name the capability, explain what it taught you, connect to a specific SOS function, close with a pledge. Example: 'I spent years leading large teams and managing complex operations. What that taught me is how to build systems people can trust. That is exactly the administrative leadership the Secretary of State's office requires.'",
      "Kelly should rehearse this structure for each theme section in this dossier until it feels conversational — not memorized. Moderators reward clarity; opponents reward fluster.",
      "This section links to debate coaching scripts, Check My Record drills, and public record brief boundaries.",
    ],
    relevantSosFunctions: ["All SOS functions — meta framing skill"],
    experienceHighlights: [
      "Three decades leadership — translate to systems and training.",
      "Civic education — translate to voter literacy and fair administration.",
      "Rural roots — translate to county equity.",
    ],
    debateFramingExample:
      "I spent years leading large teams and managing complex operations. What that taught me is how to build systems people can trust. That is exactly the kind of administrative leadership the Secretary of State's office requires.",
    plainEnglishWalkthrough: [
      "Ban the phrase 'I worked at X' without immediate skill translation.",
      "Practice with staff playing Hammer inexperience bait.",
      "Record rehearsal — watch for speed and defensiveness.",
    ],
    howToUseInDebate: [
      "First rebuttal to 'no experience' attack — use master frame once, not five times.",
      "ACCA panel: shorter sentences than TV debate.",
    ],
    howToUseOnTrail: [
      "House parties: same structure, warmer tone, local county reference.",
    ],
    whatNotToDo: [
      "Do not read biography chronologically.",
      "Do not list more than two experience themes per answer.",
    ],
    relatedSectionIds: ["kelly-30-second-bio", "kelly-experience-office-crosswalk"],
    href: "/admin/intelligence/kelly-debate-coaching",
  },
  {
    sectionId: "kelly-30-second-bio",
    title: "The 30-second biography framework",
    eyebrow: "Past · present · future",
    narrativeOverview: [
      "Kelly needs a concise introduction that fits moderator formats, ACCA panel openings, and rotary club stops. The framework is Past → Present → Future — not personality branding or political identity.",
      "Past: long-term leadership experience, organizational management, civic education work. Present: community and rural engagement, public service focus for this race. Future: commitment to transparent administration and serving all seventy-five counties.",
      "This approach emphasizes experience and office responsibilities rather than personality or political identity. It keeps Kelly out of culture-war openings and lands on SOS service within thirty seconds.",
      "Rehearse aloud until under twenty-eight seconds at moderate pace — leave air for moderator follow-up.",
    ],
    relevantSosFunctions: ["Executive introduction — all functions implied"],
    experienceHighlights: [
      "Past: Verizon / Rock Dental / Stand Up Arkansas (pick two max in 30s).",
      "Present: SOS candidacy, county partnership focus.",
      "Future: transparent admin, clerk support, published rules.",
    ],
    debateFramingExample:
      "I am Kelly Grappe. For three decades I have built teams and training systems in organizations that had to work for real people — and I co-founded rural civics education work across Arkansas. I am running for Secretary of State to administer that office fairly in all seventy-five counties — transparent rules, clerk partnership, and public trust.",
    plainEnglishWalkthrough: [
      "Time with phone stopwatch — target 28 seconds.",
      "Remove party label unless moderator introduces candidates with parties.",
      "Smile on 'seventy-five counties' — clerk applause line.",
    ],
    howToUseInDebate: [
      "Opening statement when format allows.",
      "Reset when moderator says 'introduce yourself.'",
    ],
    howToUseOnTrail: [
      "Every county event — same skeleton, one local county name inserted.",
    ],
    whatNotToDo: [
      "Do not exceed 45 seconds — moderators will cut you.",
      "Do not open with opponent names.",
    ],
    relatedSectionIds: ["kelly-debate-credential-intro", "kelly-sos-office-overview"],
    href: "/admin/intelligence/kelly-debate-coaching",
  },
  {
    sectionId: "kelly-experience-office-crosswalk",
    title: "Experience-to-office crosswalk — master reference",
    eyebrow: "Competency matrix · drill-down index",
    narrativeOverview: [
      "This section is the master crosswalk Kelly and staff use to connect biography themes to SOS duties. It is the internal competency matrix behind every public answer — not meant to be read aloud as a table on stage.",
      "Organizational leadership maps to multi-division management, change management, and cross-functional coordination. Leadership development maps to clerk training, poll worker support, and public information. Civic education maps to voter participation and lawful petition administration. Rural perspective maps to equitable county service. Community building maps to coalition and trust work. Public trust maps to transparency and institutional stewardship.",
      "When Hammer attacks on bills, pull crosswalk row: implementation + training + ledger. When Pakko attacks on duopoly, pull row: administrator readiness + published rules. When moderators ask 'qualifications,' pull row: experience → skill → office.",
      "Each row has a dedicated drill-down section in this dossier — open the full page for narrative depth, debate examples, and do-not-say lists.",
    ],
    relevantSosFunctions: [
      "Election administration",
      "Business filings",
      "Public records",
      "Capitol stewardship",
      "Civic education",
      "Organizational management",
      "County coordination",
      "Public trust",
    ],
    experienceHighlights: [
      "See individual theme sections for sourced experience detail.",
      "Public record brief for verified defensive lines.",
      "Opponent dossiers for contrast geometry.",
    ],
    debateFramingExample:
      "Pick one row, one SOS function, one sentence of experience, one pledge — stop. Depth lives in follow-up answers, not monologues.",
    plainEnglishWalkthrough: [
      "Staff: print crosswalk as one-page cheat sheet for debate prep binder.",
      "Kelly: memorize three favorite rows — leadership, training, rural — not all eleven.",
      "Link to expected questions bank for moderator-specific variants.",
    ],
    howToUseInDebate: [
      "Use as mental index when question topic shifts mid-answer.",
    ],
    howToUseOnTrail: [
      "Tailor emphasized row to audience — clerks hear training; businesses hear filings.",
    ],
    whatNotToDo: [
      "Do not read the crosswalk aloud.",
      "Do not invent SOS duties not listed in office overview.",
    ],
    relatedSectionIds: [
      "kelly-organizational-leadership",
      "kelly-leadership-development",
      "kelly-civic-education",
      "kelly-rural-arkansas",
      "kelly-community-building",
      "kelly-public-trust-stewardship",
    ],
    href: "/admin/intelligence/sos-debate-questions",
  },
  {
    sectionId: "kelly-career-timeline-deep",
    title: "Career timeline — Verizon, Rock Dental, and the path to SOS",
    eyebrow: "Chronology · decade markers · source-locked",
    narrativeOverview: [
      "Kelly's public biography describes roughly three decades of leadership before this race — not a sudden pivot into politics, but a long arc from corporate operations to healthcare-adjacent training systems to rural civic education and now a statewide administration campaign. Staff should treat this section as the canonical chronology every other dossier section pulls from.",
      "The Verizon chapter establishes large-team leadership under performance pressure: budgets, organizational transitions, cross-functional coordination, and systems that had to work for thousands of employees who did not all share the same priorities. That is the closest private-sector analog to running a multi-division state office where elections, business filings, Capitol operations, and county support cannot fail silently.",
      "Rock Dental adds the training-systems credential Hammer cannot match on stage. Kelly helped build learning and leadership-development programs — the same operational muscle clerks need when a new act lands and poll workers, notaries, and election officials must absorb new procedures on short notice. This is not 'HR experience' in abstract; it is the job description of a modern Secretary of State.",
      "The civic chapter — Stand Up Arkansas co-founder, rural ballot-measure education, Rose Bud roots and small-farm ownership — explains why Kelly entered this race with county equity already in her vocabulary. The October 8, 2025 candidacy announcement (Arkansas Times) marks the public pivot from organizer-educator to administrator-candidate. Every timeline answer should end forward: transparent rules, clerk partnership, seventy-five counties.",
    ],
    relevantSosFunctions: [
      "Multi-division organizational management",
      "Staff training and change management",
      "County clerk and election official support",
      "Civic education and public information",
    ],
    experienceHighlights: [
      "Verizon — large-team leadership, budgets, operational systems.",
      "Rock Dental — leadership-development and training program design.",
      "Stand Up Arkansas — rural civic education co-founder.",
      "2025-10-08 — Arkansas Times documents SOS candidacy announcement.",
    ],
    debateFramingExample:
      "For three decades I've built teams and training systems in organizations that had to work for real people every day — and I've spent years helping Arkansans understand how government works. I'm running to bring that operational leadership to the Secretary of State's office in all seventy-five counties.",
    plainEnglishWalkthrough: [
      "Use decade markers when exact title dates are not yet in the verified packet.",
      "Never list employers without immediate skill translation to SOS function.",
      "Anchor with 2025 candidacy date; close on forward-looking administration pledge.",
    ],
    howToUseInDebate: [
      "Qualifications questions: three-phase arc in under 45 seconds.",
      "Experience attack: agree Hammer has tenure → contrast administrator readiness.",
    ],
    howToUseOnTrail: [
      "Rotary and chamber events: emphasize Rock Dental training + county clerk parallel.",
    ],
    whatNotToDo: [
      "Do not invent exact Verizon title dates without resume packet verification.",
      "Do not read chronology longer than 45 seconds on TV.",
    ],
    relatedSectionIds: ["kelly-organizational-leadership", "kelly-debate-credential-intro", "kelly-30-second-bio"],
    href: "/admin/intelligence/kelly-debate-coaching",
  },
  {
    sectionId: "kelly-public-record-defensive",
    title: "Public record defensive brief — verified, partial, and NOT_SEARCHED lanes",
    eyebrow: "Claims gate · counsel frame · stage-safe boundaries",
    narrativeOverview: [
      "This section consolidates every high-risk public-record lane opponents may bundle into one moderator question: Stand Up Arkansas organizing, LEARNS/CAPES spouse connection, For AR Kids petition leadership, media clip potential, and court/financial diligence status. Kelly wins these exchanges with disciplined boundaries — not denial theater.",
      "Stand Up Arkansas is VERIFIED and should be owned, not apologized for. Kelly co-founded rural civic education work; opponents will frame it as partisan activism. The pivot: lawful participation is Arkansas tradition; as SOS she administers rules for every lawful drive and every county equally during this race.",
      "LEARNS/CAPES is the most sensitive verified lane. Husband Steve Grappe led CAPES opposing the LEARNS referendum. Hammer may bundle spouse, petitions, and 2025 restriction bills. Kelly's rule: one sentence boundary if asked, never attack Steve on stage, pivot to SOS neutrality plan and published rules for all lawful petitioners.",
      "CourtConnect, UCC, business entity, and property tax diligence remain NOT_SEARCHED in staff logs until the five-search protocol completes. Kelly must never claim a clean search on stage. The incomplete pivot: 'I am running to run the Secretary of State's office for every voter — and we follow counsel on any personal-record question.'",
    ],
    relevantSosFunctions: [
      "Lawful petition administration",
      "Public trust and transparency",
      "Non-partisan election administration",
      "Records and diligence governance",
    ],
    experienceHighlights: [
      "Public record brief: five verified/partial fact lanes with response frameworks.",
      "Attack vectors: petition-organizer and experience-readiness marked CRITICAL/HIGH.",
      "Diligence log: kelly-court-diligence-log.json — staff protocol before clean claims.",
    ],
    debateFramingExample:
      "I've spent years helping people participate lawfully in democracy. As Secretary of State I will administer the rules fairly for every county and every lawful petition — that is the job, and that is what I am running to do.",
    plainEnglishWalkthrough: [
      "Tag each lane VERIFIED, PARTIAL, or NOT_SEARCHED before rehearsal.",
      "Practice bundled attacks: Stand Up + LEARNS + petitions in one question.",
      "Mandatory sequence: acknowledge → boundary → SOS implementation pledge → stop.",
    ],
    howToUseInDebate: [
      "When Hammer cites 2025 act numbers, agree integrity → contrast unfunded rules → training plan.",
      "Never end on agree alone — always bridge to implementation.",
    ],
    howToUseOnTrail: [
      "House parties: deeper civics story OK; still pivot within 20 seconds.",
    ],
    whatNotToDo: [
      "Do not claim clean CourtConnect/UCC search before log shows CLEAN.",
      "Do not attack spouse, CAPES, or Hammer voters personally.",
      "Do not circulate petitions during this race — state once if asked.",
    ],
    relatedSectionIds: ["kelly-civic-education", "kelly-public-trust-stewardship"],
    href: "/admin/intelligence/kelly-debate-coaching",
  },
  {
    sectionId: "kelly-road-stories-fieldbook",
    title: "Road stories fieldbook — eight county narratives for debate and trail",
    eyebrow: "Humanize · verify · one sentence + pivot",
    narrativeOverview: [
      "Road stories translate policy into kitchen-table reality — but they are governed by claims status. The kelly-road-stories.json corpus contains eight slots (road-01 through road-08). Most county labels are INTERPRETATION until Kelly confirms on tape; road-08 (Arkansas Civic Index) is NEEDS_REVIEW until source year is verified.",
      "Road-01 (Saline area): clerk gets Friday mandate, no training budget, no SOS contact — the implementation-dare story. Road-02 (Central Arkansas): lawful petition volunteer stopped by confusing rules, not fraud. Road-03 (South Arkansas): quorum court asks where the line item is for the newest election law.",
      "Road-04 (Northwest): first-time voter wants rules online, not slogans. Road-05 (Delta): poll workers absorb new procedures without extra staff or state training. Road-06: clerk asks about Act 768 before plain-language guidance existed. Road-07: Republican-leaning room wants non-partisan SOS — transparency reaction was strong.",
      "Deployment rule: one sentence of story, immediate SOS function mapping, stop. Never stack three stories in one answer. Never name a county publicly until travel log confirms the interpretation label. Road-08 stays off-air until claims gate clears the civic index source.",
    ],
    relevantSosFunctions: [
      "County clerk partnership",
      "Training and implementation support",
      "Voter and volunteer education",
      "Transparent rule publication",
    ],
    experienceHighlights: [
      "Eight road stories with offensive/defensive use tags in data/opposition/kelly-road-stories.json.",
      "Pairs with county-champion trap lane and Act 350/444 unfunded-mandate themes.",
      "Generated 2026-06-04 — replace INTERPRETATION counties from Kelly travel log.",
    ],
    debateFramingExample:
      "A clerk told me they got a new mandate on a Friday with no training budget and no one to call Monday morning. That is why I am running this office as service — published rules, a training calendar, and a hotline that answers.",
    plainEnglishWalkthrough: [
      "Print story cards with claims-status color coding for green room.",
      "Rehearse one-sentence delivery + function pivot for each approved story.",
      "Staff interrupts if Kelly stacks anecdotes — one story max per answer.",
    ],
    howToUseInDebate: [
      "County champion trap: road-01 or road-05 after Hammer cites security bills.",
      "Integrity-without-participation: road-02 after fraud-data-dare if no case numbers.",
    ],
    howToUseOnTrail: [
      "County-specific events: confirm county label with Kelly before naming it on stage.",
    ],
    whatNotToDo: [
      "Do not broadcast road-08 until civic index source verified.",
      "Do not invent county names for INTERPRETATION slots.",
      "Do not use stories as substitute for sourced policy claims.",
    ],
    relatedSectionIds: ["kelly-rural-arkansas", "kelly-leadership-development"],
    href: "/admin/intelligence/trap-lanes/county-champion",
  },
  {
    sectionId: "kelly-next-prep-modules",
    title: "What to open next — linked prep modules",
    eyebrow: "Drill-down · staff + candidate",
    narrativeOverview: [
      "This dossier is the narrative spine — not the only prep surface. After reading the single-page overview and two theme sections most relevant to tonight's forum, Kelly should drill into linked modules for adversarial geometry, verified defensive lines, and offensive contrast.",
      "Debate coaching panel: openings/closings, three-way strategy, Check My Record, stage presence. Public record brief: verified lines on Stand Up, LEARNS/CAPES boundary, petition pivot. Opponent dossiers: Hammer production profile + Pakko partial verified — strengths, claims, lead stories. Expected questions: thirty-five SOS questions with full speak-order scripts. Claims gate: verify before any new number or quote.",
      "Optional campaign-neutral expansions staff can build: full SOS competency matrix export, responsibility-to-experience spreadsheet, debate skills inventory, public administration leadership profile, and '100 likely debate questions' tied to Kelly background and actual SOS duties.",
      "Kelly mirror (gated): adversarial red-team — trigger word quorum on hub; requires second passphrase. Candidate eyes only.",
    ],
    relevantSosFunctions: ["All — navigation hub"],
    experienceHighlights: ["This dossier + linked modules = complete candidate read path."],
    debateFramingExample:
      "Read this dossier for who you are in the office frame; open coaching and questions for what to say when Hammer speaks.",
    plainEnglishWalkthrough: [
      "Night before debate: dossier overview + two themes + three expected questions.",
      "Morning of: claims check + 30-second bio + one trap lane.",
      "After forum: staff debrief against claims ledger gaps.",
    ],
    howToUseInDebate: ["Navigation only — not stage content."],
    howToUseOnTrail: ["Same read order for ACCA panel and county clerk week."],
    whatNotToDo: ["Do not skip claims gate for 'new' lines learned in spin room."],
    relatedSectionIds: ["kelly-sos-office-overview", "kelly-debate-credential-intro"],
    href: "/admin/intelligence/supreme-workbench",
  },
];

import { applyKellyDossierResearchDepth } from "@/lib/intelligence/v4/applyCandidateDossierResearchDepth";
import { applyKellyDossierDepthExpansion } from "@/lib/intelligence/v4/applyDossierDepthExpansion";
import { enrichKellyDossierSection } from "@/lib/intelligence/v4/phase7DossierBriefingEnrichment";

function finalizeKellySection(section: KellyDossierDepthSection): KellyDossierDepthSection {
  return enrichKellyDossierSection(applyKellyDossierDepthExpansion(applyKellyDossierResearchDepth(section)));
}

export function getKellyDossierSections(): KellyDossierDepthSection[] {
  return KELLY_DOSSIER_SECTIONS.map(finalizeKellySection);
}

export function getKellyDossierSection(sectionId: string): KellyDossierDepthSection | undefined {
  const section = KELLY_DOSSIER_SECTIONS.find((s) => s.sectionId === sectionId);
  return section ? finalizeKellySection(section) : undefined;
}

export function getAllKellyDossierSectionIds(): string[] {
  return KELLY_DOSSIER_SECTIONS.map((s) => s.sectionId);
}

export function getKellyDossierHubPath(): string {
  return "/admin/intelligence/candidate-dossiers/kelly-grappe";
}

export function getKellyDossierSectionPath(sectionId: string): string {
  return `${getKellyDossierHubPath()}/${sectionId}`;
}

export function buildKellyDossierReadoutSummary(dossier: KellyCandidateDossierFile) {
  return {
    executiveSummary: dossier.executiveSummary,
    sectionCount: KELLY_DOSSIER_SECTIONS.length,
    coreStrengthCount: dossier.coreStrengths.length,
    themeCount: dossier.experienceToOfficeThemes.length,
    bioFramework: dossier.thirtySecondBioFramework,
  };
}
