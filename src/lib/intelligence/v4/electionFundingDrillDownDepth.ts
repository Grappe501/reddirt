/**
 * Election funding intelligence — full narrative drill-down per section.
 * Pairs with data/intelligence/county-voting-system-grant-fund-research.json (hard evidence).
 */

export type ElectionFundingDepthSection = {
  sectionId: string;
  title: string;
  eyebrow: string;
  /** Multi-paragraph narrative — read in order */
  narrativeOverview: string[];
  whyItMattersForKelly: string;
  plainEnglishWalkthrough: string[];
  hardEvidence: Array<{ claim: string; tier: "VERIFIED" | "PARTIAL" | "STRATEGY" | "NEEDS_RESEARCH" }>;
  whatWeStillNeed: string[];
  howToPresentOnStage: string[];
  howToPresentOnTrail: string[];
  connectToHammerRecord: string[];
  rehearsalPrompt?: string;
  relatedSectionIds: string[];
  href?: string;
};

export const ELECTION_FUNDING_DEPTH_SECTIONS: ElectionFundingDepthSection[] = [
  {
    sectionId: "research-method",
    title: "How we researched this — and what we will not claim",
    eyebrow: "Governance",
    narrativeOverview: [
      "This module is built from hard evidence first: Arkansas Code, enrolled appropriation acts, SOS and SBEC manuals, county budget archives, legislative presentations, and third-party research that cites Bureau of Legislative Research expenditure tables. We do not treat appropriations headlines as proof that every county received cash — we separate money authorized in Little Rock from money booked in county treasuries.",
      "Where a statewide county-by-county award spreadsheet should exist but is not published, we say so clearly. That gap is itself a policy finding: election transparency should include election funding transparency.",
      "Kelly should speak from verified totals (acts, statutes, documented county budget lines) and ask operational questions. She should not accuse anyone of hiding money without a sourced ledger — the fair frame is that the public cannot easily find what clerks need to plan around.",
    ],
    whyItMattersForKelly: "Credibility on stage comes from naming what you know, what you do not know, and what you would publish as SOS.",
    plainEnglishWalkthrough: [
      "Step 1: Statute — who creates the fund and who writes grant rules.",
      "Step 2: Appropriation — how much the legislature authorizes the SOS to spend.",
      "Step 3: Disbursement — how counties actually receive equipment, cash, or reimbursements.",
      "Step 4: Transparency — whether voters can see county-by-county accounting.",
    ],
    hardEvidence: [
      { claim: "Research pass documented statutes, acts, and county budget breadcrumbs — not a complete statewide ledger.", tier: "VERIFIED" },
    ],
    whatWeStillNeed: ["Master county award ledger from SOS (FY2018–FY2027)", "Staff verification of Garland $14,340 primary budget document"],
    howToPresentOnStage: [
      "Open with: 'I've been studying how election equipment money flows — here's what the law says and what the public can verify.'",
      "Never imply fraud — imply opacity that you would fix as SOS.",
    ],
    howToPresentOnTrail: [
      "Clerk rooms: 'Appropriations in Little Rock are not the same as implementation in your county — I want a published ledger.'",
    ],
    connectToHammerRecord: [
      "Hammer cites integrity laws; Kelly cites implementation and funding clarity — different jobs.",
    ],
    relatedSectionIds: ["who-funds-cvsgf", "county-ledger-gap"],
  },
  {
    sectionId: "who-funds-cvsgf",
    title: "Who funds the County Voting System Grant Fund?",
    eyebrow: "Fund sources",
    narrativeOverview: [
      "Most ongoing money in the County Voting System Grant Fund (CVSGF) comes from business activity, not from a line item voters think about at election time. Arkansas Code § 19-5-1247 requires the Secretary of State to periodically remit certain Uniform Commercial Code (UCC) filing fees to the Treasurer of State for deposit into CVSGF.",
      "Every UCC-1, UCC-3, and related commercial filing fee paid to the SOS Business & Commercial Services division is part of that pipeline. The SOS UCC fee schedule is public — this is not a secret tax; it is a dedicated fee stream tied by statute to county voting equipment.",
      "Legislature also adds periodic appropriations from CVSGF balances (for example $11 million in FY2025–26 and again in FY2026–27 under HB1041) and has made one-time transfers — notably Act 808 of 2019 moving $8.24 million from the Property Tax Relief Fund for statewide equipment needs.",
      "Federal Help America Vote Act (HAVA) dollars are separate: Arkansas appropriates federal HAVA funds to the SOS ($4 million in FY2025–26 via Act 408, and $4 million in FY2026–27 via HB1041 Section 12). HAVA is episodic nationally; Arkansas mirrors that pattern with biennial appropriations rather than a permanent county equipment trust.",
    ],
    whyItMattersForKelly: "Hammer may talk 'integrity' as virtue; Kelly can talk where equipment dollars actually originate — and who controls grant rules.",
    plainEnglishWalkthrough: [
      "UCC fees → CVSGF (ongoing)",
      "Legislative appropriations → SOS → counties (periodic)",
      "Act 808-style transfers → CVSGF (one-time, 2019)",
      "Federal HAVA → SOS → counties (federal, appropriated by General Assembly)",
    ],
    hardEvidence: [
      { claim: "A.C.A. § 19-5-1247 — UCC fee remittance to CVSGF", tier: "VERIFIED" },
      { claim: "Act 408 (HB1147) FY2025–26: $11M CVSGF + $4M HAVA to SOS", tier: "VERIFIED" },
      { claim: "HB1041 FY2026–27: Sec. 9 $11M CVSGF; Sec. 12 $4M HAVA federal", tier: "VERIFIED" },
      { claim: "Act 808 of 2019: $8.24M Property Tax Relief → CVSGF", tier: "VERIFIED" },
    ],
    whatWeStillNeed: ["Year-over-year UCC remittance totals vs CVSGF expenditures (SOS or Legislative Research)"],
    howToPresentOnStage: [
      "'This is not only federal money — Arkansas built a state grant fund fed by UCC fees and appropriations, administered through the Secretary of State.'",
    ],
    howToPresentOnTrail: [
      "Business audiences understand UCC fees; rural audiences understand 'state grant fund for county voting equipment.'",
    ],
    connectToHammerRecord: [
      "If he claims he 'funded elections,' ask whether he authored CVSGF appropriations or only election-law mandates without grant guidelines.",
    ],
    relatedSectionIds: ["statutory-ucc", "appropriations-timeline", "act-808-2019"],
  },
  {
    sectionId: "statutory-ucc",
    title: "Statutory authority — UCC fees and the grant fund",
    eyebrow: "A.C.A. § 19-5-1247",
    narrativeOverview: [
      "The County Voting System Grant Fund exists in law as a dedicated pool for county voting system equipment, programming, and maintenance. Section 19-5-1247 creates the linkage between commercial filing fees collected by the SOS and that fund.",
      "This matters politically because it is state-controlled election infrastructure money — not a federal-only story and not a county-only story. The SOS collects fees as part of normal business services, remits per statute, and then participates in distributing grants under separate election code.",
      "Responsive Governance / Institute for Responsive Government research summarizes Arkansas as one of the states using fee-based CVSGF grants at SOS discretion — with documented grant expenditures from FY2018 through FY2022 ranging from about $877k to about $9.18M annually per Bureau of Legislative Research tables cited in their white paper.",
    ],
    whyItMattersForKelly: "Shows Kelly understands the SOS commercial-services side funds election administration — a rare depth signal for candidates.",
    plainEnglishWalkthrough: [
      "Business pays UCC fees to SOS → statute requires remittance to CVSGF → legislature appropriates from fund to SOS → SOS grants to counties under guidelines.",
    ],
    hardEvidence: [
      { claim: "A.C.A. § 19-5-1247 establishes UCC fee remittance to CVSGF", tier: "VERIFIED" },
      { claim: "SOS UCC fee schedule published online", tier: "VERIFIED" },
      { claim: "FY2018–FY2022 actual grant expenditure range cited in IRG white paper", tier: "PARTIAL" },
    ],
    whatWeStillNeed: ["Primary BLR expenditure table PDF for each fiscal year"],
    howToPresentOnStage: ["Quote statute concept, not UCC fee dollar amounts, unless staff verifies current fee table."],
    howToPresentOnTrail: ["County quorum courts: 'Your voting equipment fund is partly fed by statewide business filing fees — SOS sets grant rules.'"],
    connectToHammerRecord: ["Integrity bills change what counties must do; CVSGF answers whether they get paid to do it."],
    relatedSectionIds: ["sos-control", "expenditure-history"],
  },
  {
    sectionId: "statutory-sos-guidelines",
    title: "SOS grant guidelines — A.C.A. § 7-5-301(d)(2)",
    eyebrow: "Secretary of State discretion",
    narrativeOverview: [
      "Election code makes the Secretary of State the architect of county grant rules. A.C.A. § 7-5-301(d)(2)(A) requires the SOS to establish guidelines and procedures for distributing CVSGF grants.",
      "Subsection (B) requires grants paid into the county treasury to the credit of the local voting system grant fund. Subsection (C) requires the quorum court to appropriate those dollars according to SOS guidelines. That three-step chain — SOS rules, county treasury deposit, quorum court appropriation — is how Arkansas balances state direction with county control.",
      "The SBEC Election Coordinator Manual repeats this in plain English: the SOS establishes guidelines and procedures for distributing grants. That manual is clerk-facing gospel — Kelly citing it shows she has read what county officials read.",
    ],
    whyItMattersForKelly: "As SOS candidate, Kelly is asking for the job that writes the grant playbook counties live under.",
    plainEnglishWalkthrough: [
      "SOS publishes guidelines → county receives grant into local fund → quorum court appropriates per those guidelines → clerks implement equipment changes.",
    ],
    hardEvidence: [
      { claim: "A.C.A. § 7-5-301(d)(2)(A)–(C) grant guidelines and county treasury deposit", tier: "VERIFIED" },
      { claim: "SBEC 2026 Election Coordinator Manual — SOS establishes grant guidelines", tier: "VERIFIED" },
    ],
    whatWeStillNeed: ["Current published CVSGF grant application packet (if any) on sos.arkansas.gov"],
    howToPresentOnStage: [
      "'The Secretary of State doesn't just swear in candidates — the code says you write the grant guidelines counties depend on.'",
    ],
    howToPresentOnTrail: [
      "Ask clerks: 'Are SOS grant guidelines clear enough that you can budget a replacement cycle?'",
    ],
    connectToHammerRecord: [
      "Each Hammer mandate on clerks is easier to attack when grant guidelines lag behind new duties.",
    ],
    relatedSectionIds: ["sos-control", "county-ledger-gap"],
  },
  {
    sectionId: "sos-control",
    title: "What the SOS actually controls",
    eyebrow: "Operational discretion",
    narrativeOverview: [
      "The SOS is not a ceremonial grant signer. Under statute and manual, the SOS influences what equipment counties may buy, what costs qualify for reimbursement versus direct state purchase, how counties apply, how priorities are set across rural and urban counties, and how transparent the process is.",
      "Arkansas also centralizes vendor selection at the state level: SBEC examines systems; SOS selects vendor(s) and serves as official purchaser and liaison with counties (ES&S documented as state vendor in coordinator materials — verify current contract before stage cite).",
      "Kelly's positive vision: publish equitable grant accounting, align guidelines with VVSG 2.0 transition timelines, require training calendars before deployment, and run a clerk hotline when new rules land — funding clarity as integrity.",
    ],
    whyItMattersForKelly: "Positions Kelly as the operator Hammer is not — without calling him corrupt.",
    plainEnglishWalkthrough: [
      "Control grant rules → control vendor liaison → control whether counties see a ledger → control whether mandates have matching dollars.",
    ],
    hardEvidence: [
      { claim: "SOS establishes CVSGF grant guidelines (A.C.A. § 7-5-301(d)(2))", tier: "VERIFIED" },
      { claim: "SOS selects vendor / official purchaser per SBEC manual", tier: "VERIFIED" },
    ],
    whatWeStillNeed: ["Current ES&S contract summary and renewal dates", "Published SOS grant priority criteria"],
    howToPresentOnStage: [
      "'Integrity includes funding transparency — clerks deserve a Secretary of State who publishes grant guidelines and county ledgers, not surprise mandates.'",
    ],
    howToPresentOnTrail: [
      "Do not attack ES&S on stage — talk about process, training, and published accounting.",
    ],
    connectToHammerRecord: [
      "Hammer authored rules; SOS job is implementation partnership — Kelly owns that contrast.",
    ],
    relatedSectionIds: ["statutory-sos-guidelines", "delivery-types", "vvsg-link"],
    href: "/admin/intelligence/election-equipment-vvsg",
  },
  {
    sectionId: "appropriations-timeline",
    title: "Appropriations timeline — what Little Rock authorized",
    eyebrow: "Acts & dollars",
    narrativeOverview: [
      "Appropriations tell you what the legislature authorized the SOS to spend — not automatically how each county fared. Recent verified anchors: Act 143 of 2024 (FY2024–25) appropriated $10M from CVSGF; Act 408 of 2025 / HB1147 (FY2025–26) appropriated $11M CVSGF plus $4M federal HAVA; HB1041 (FY2026–27 fiscal session) Section 9 appropriates $11M from CVSGF and Section 12 appropriates $4M from federal HAVA funds.",
      "These numbers are large enough to matter in every county conversation — but they are statewide totals. Without a county ledger, a clerk in a small county cannot tell whether their share matches their burden from new election laws.",
      "Kelly should cite FY2025–26 and FY2026–27 totals only with act citations — and immediately pivot to county-level transparency.",
    ],
    whyItMattersForKelly: "Lets Kelly sound fluent in fiscal session outcomes without overclaiming county impact.",
    plainEnglishWalkthrough: [
      "FY24–25: $10M CVSGF (Act 143) → FY25–26: $11M + $4M HAVA (Act 408) → FY26–27: $11M + $4M HAVA (HB1041).",
    ],
    hardEvidence: [
      { claim: "Act 143 FY2024–25: $10M CVSGF", tier: "VERIFIED" },
      { claim: "Act 408 FY2025–26: $11M CVSGF + $4M HAVA", tier: "VERIFIED" },
      { claim: "HB1041 FY2026–27: $11M CVSGF (Sec. 9) + $4M HAVA (Sec. 12)", tier: "VERIFIED" },
    ],
    whatWeStillNeed: ["Enrolled HB1041 PDF link in claims ledger", "Appropriation vs actual expenditure reconciliation by year"],
    howToPresentOnStage: [
      "'The legislature appropriated eleven million from the county voting system grant fund — show me the county spreadsheet that matches those dollars.'",
    ],
    howToPresentOnTrail: [
      "Use round numbers with act names — clerks respect enrolled acts more than campaign slogans.",
    ],
    connectToHammerRecord: [
      "If Hammer takes credit for appropriations, note he is a legislator — ask what he did as author of unfunded mandates vs grant support.",
    ],
    relatedSectionIds: ["who-funds-cvsgf", "county-ledger-gap"],
  },
  {
    sectionId: "act-808-2019",
    title: "Act 808 — the $8.24 million one-time transfer",
    eyebrow: "2019 equipment surge",
    narrativeOverview: [
      "In 2019 Governor Hutchinson authorized transferring $8.24 million from the Property Tax Relief Fund into the County Voting System Grant Fund for county voting equipment, programming, and maintenance statewide. Public releases described the goal as helping counties upgrade machines — but the press release did not attach a county award spreadsheet.",
      "Documented uses include roughly $2 million reimbursing Benton, White, and Ashley counties for half of prior equipment purchases, with remaining funds available for broader upgrades through the CVSGF process. Dem-Gaz and KARK covered the transfer; seven counties signing on for new voting gear appeared in follow-up reporting.",
      "This episode proves money did move — and proves the transparency gap: statewide intent was announced without a durable public county ledger.",
    ],
    whyItMattersForKelly: "Concrete example of real dollars + missing public accounting — Kelly's transparency argument in one story.",
    plainEnglishWalkthrough: [
      "Surplus → CVSGF → SOS grant process → some counties reimbursed, others upgraded — ledger not published holistically.",
    ],
    hardEvidence: [
      { claim: "Act 808 / $8.24M transfer for county voting equipment (2019)", tier: "VERIFIED" },
      { claim: "~$2M reimbursed Benton, White, Ashley (Dem-Gaz reporting)", tier: "PARTIAL" },
    ],
    whatWeStillNeed: ["Primary Act 808 PDF and SOS disbursement schedule for 2019–2020"],
    howToPresentOnStage: [
      "'Act 808 moved eight million plus into county equipment — voters still can't find a clean county-by-county table.'",
    ],
    howToPresentOnTrail: [
      "In Benton/White/Ashley: acknowledge reimbursement story; ask what ledger exists for other counties.",
    ],
    connectToHammerRecord: [
      "Hammer may cite 2019 funding — Kelly agrees money moved, asks for ledger and clerk training follow-through.",
    ],
    relatedSectionIds: ["county-breadcrumbs", "county-ledger-gap"],
  },
  {
    sectionId: "expenditure-history",
    title: "Actual expenditures — not just appropriations",
    eyebrow: "FY2018–FY2022",
    narrativeOverview: [
      "Appropriations authorize; expenditures prove money left the building. IRG / Responsive Governance research citing Bureau of Legislative Research reported actual CVSGF grant expenditures from FY2018 through FY2022 ranging from a low of about $876,837 (FY2019) to a high of about $9,178,505 (FY2020).",
      "That volatility shows the fund is real but lumpy — driven by appropriations timing, county demand, and SOS grant decisions. It also undercuts any claim that counties always receive steady, predictable support.",
      "Kelly should treat these figures as statewide totals — useful to show the fund is not imaginary, insufficient to prove equitable county treatment without a ledger.",
    ],
    whyItMattersForKelly: "Separates Kelly from candidates who only quote acts — she understands cash out the door.",
    plainEnglishWalkthrough: [
      "Low year ~$877k → high year ~$9.18M → proves grants happen → does not prove fairness county by county.",
    ],
    hardEvidence: [
      { claim: "FY2018–FY2022 CVSGF actual expenditures range per IRG/BLR citation", tier: "PARTIAL" },
    ],
    whatWeStillNeed: ["Primary BLR operating expenditure reports FY2018–FY2025"],
    howToPresentOnStage: [
      "Only cite expenditure range if staff confirms BLR primary — otherwise cite appropriations only.",
    ],
    howToPresentOnTrail: [],
    connectToHammerRecord: [],
    relatedSectionIds: ["appropriations-timeline", "county-ledger-gap"],
  },
  {
    sectionId: "county-ledger-gap",
    title: "The missing statewide county-by-county ledger",
    eyebrow: "Transparency gap",
    narrativeOverview: [
      "After extended public research, no consolidated statewide dashboard or downloadable county-by-county CVSGF/HAVA award table has been located. Arkansas publishes appropriations, fund authority, county budgets, legislative acts, and some federal reports — but not a single clerk-friendly ledger answering: 'Which county got how much, when, for what equipment, from which fund?'",
      "That does not prove malfeasance. It proves opacity. And opacity is a policy problem Kelly can own fixing as SOS without attacking clerks or inventing conspiracy.",
      "The master ledger almost certainly exists administratively — reimbursement spreadsheets, grant approvals, equipment transfer records — because SOS guidelines and purchaser role require internal tracking. The public just cannot see it cleanly.",
    ],
    whyItMattersForKelly: "Central positive promise: publish the ledger county by county.",
    plainEnglishWalkthrough: [
      "Money flows (statutes + acts) → counties book local lines → statewide table missing → records request + SOS outreach justified.",
    ],
    hardEvidence: [
      { claim: "No consolidated public statewide county-by-county CVSGF award table located in open research", tier: "VERIFIED" },
    ],
    whatWeStillNeed: ["SOS response to records request", "Any non-public ledger staff obtains under FOIA/administrative request"],
    howToPresentOnStage: [
      "'I've been researching how election funding flows to Arkansas counties, and it is surprisingly difficult for the public to find a clear county-by-county accounting — election transparency should include election funding transparency.'",
    ],
    howToPresentOnTrail: [
      "Do not say 'they are hiding money' — say 'the public deserves a published ledger.'",
    ],
    connectToHammerRecord: [
      "Trap: 'Can you point to the county-by-county grant ledger after the integrity bills you sponsored?'",
    ],
    relatedSectionIds: ["records-request", "county-breadcrumbs", "debate-funding"],
    href: "/admin/intelligence/trap-lanes/county-champion",
  },
  {
    sectionId: "county-breadcrumbs",
    title: "County budget breadcrumbs — proof money reached counties",
    eyebrow: "Local public records",
    narrativeOverview: [
      "Even without a statewide SOS dashboard, counties record grants in their own public budgets. Research found local fund labels such as 'Voting System Grant Fund,' 'SOS Grant,' 'Election Equipment Grant,' and 'Secretary of State Voting System Grant' in multiple county budget archives.",
      "Garland County documents a $14,340 Secretary of State Voting System Grant appropriation (2015) in budget records — a concrete dollar figure tied to SOS. Benton, White, and Ashley appear in Act 808 reimbursement reporting. Lonoke, Sharp, Scott, Franklin, Faulkner, Jackson, and others show grant-fund lines with amounts still needing primary verification.",
      "These breadcrumbs matter narratively: they disprove the claim 'counties got nothing.' They also prove the research method — you can reconstruct partial truth from county books because the state never consolidated them for the public.",
    ],
    whyItMattersForKelly: "Kelly can say money did flow — and still demand a statewide ledger for equity and planning.",
    plainEnglishWalkthrough: [
      "Search county budgets → find SOS grant lines → document county + year + label → build partial map until SOS ledger arrives.",
    ],
    hardEvidence: [
      { claim: "Garland County $14,340 SOS voting system grant (2015 budget archive)", tier: "PARTIAL" },
      { claim: "Multiple counties reference Voting System Grant Fund / SOS Grant lines", tier: "PARTIAL" },
    ],
    whatWeStillNeed: [
      "Primary PDF for Garland 2015 line",
      "Dollar amounts for Lonoke, Sharp, Scott, Franklin budget references",
      "Systematic scrape of 75 county budgets FY2018–FY2026",
    ],
    howToPresentOnStage: [
      "Do not cite Garland $14,340 until staff verifies primary — otherwise say 'county budgets show SOS grant lines.'",
    ],
    howToPresentOnTrail: [
      "In a county where budget line exists: 'Your quorum court booked this — voters deserve a statewide view.'",
    ],
    connectToHammerRecord: [],
    relatedSectionIds: ["sos-exhibit-e", "county-ledger-gap"],
  },
  {
    sectionId: "sos-exhibit-e",
    title: "SOS legislative presentation — historical county lists",
    eyebrow: "Exhibit E",
    narrativeOverview: [
      "An Arkleg assembly attachment (SOS equipment funding presentation, Exhibit E) documents historical SOS vs county expenditure snapshots: SOS expended about $6,115,663.38 on equipment through the presentation date; counties expended about $2,803,173.35. It lists counties fully funded in 2015–2016 (Washington, Sebastian, and nine others — eleven total), additional funded counties in 2016, 50/50 partnerships in 2017 (Faulkner, Miller, Sevier, Pike, Polk, Carroll, Cross), and pending counties at time of presentation.",
      "This is not a complete modern ledger — it is a legislative snapshot showing Arkansas has used multiple delivery models (full funding, 50/50, pending queues). Kelly can cite it to show she understands history — then promise a live dashboard, not a static slide deck.",
    ],
    whyItMattersForKelly: "Shows Arkansas funding was never one-size-fits-all — equity questions are real.",
    plainEnglishWalkthrough: [
      "Some counties fully funded → some 50/50 → some pending → totals on slide → no ongoing public dashboard.",
    ],
    hardEvidence: [
      { claim: "Exhibit E SOS presentation with county lists and expenditure totals", tier: "PARTIAL" },
    ],
    whatWeStillNeed: ["Date and context of presentation", "Which counties resolved from 'pending' lists"],
    howToPresentOnStage: [],
    howToPresentOnTrail: [],
    connectToHammerRecord: [],
    relatedSectionIds: ["delivery-types", "county-breadcrumbs"],
  },
  {
    sectionId: "delivery-types",
    title: "How counties actually receive value — not always cash",
    eyebrow: "Delivery models",
    narrativeOverview: [
      "County 'grants' are not always a check. Arkansas uses direct cash into local voting system grant funds, state-purchased equipment delivered to counties, 50/50 cost-share agreements, reimbursements for prior county purchases, licenses, maintenance contracts, and vendor procurement under statewide contracts (ES&S referenced in SOS presentation materials).",
      "That complexity explains why a simple 'who got how much cash' table is hard to find publicly — some counties received equipment or support instead of an appropriation line that looks like a grant payment.",
      "Kelly's SOS plan should classify deliveries in the ledger: cash, equipment, reimbursement, license — so clerks can budget honestly.",
    ],
    whyItMattersForKelly: "Preempts Hammer or press saying 'my county never got a grant' when they got equipment or support.",
    plainEnglishWalkthrough: [
      "Ask records request for cash AND equipment transfers AND reimbursements — not only 'grants.'",
    ],
    hardEvidence: [
      { claim: "Multiple delivery types documented in research + SBEC/SOS materials", tier: "PARTIAL" },
    ],
    whatWeStillNeed: ["Template ledger columns Kelly would publish as SOS"],
    howToPresentOnStage: [],
    howToPresentOnTrail: [],
    connectToHammerRecord: [],
    relatedSectionIds: ["records-request", "sos-control"],
  },
  {
    sectionId: "records-request",
    title: "Records request — exact ask",
    eyebrow: "Next step",
    narrativeOverview: [
      "A targeted administrative records request is now reasonable — not a fishing FOIA, but a precise ask any serious SOS candidate should make.",
      "Request county-by-county distribution records for CVSGF from FY2018 through FY2027: county name, award amount, award date, purpose, equipment/vendor where applicable, fund source (state CVSGF vs federal HAVA vs other). Also request reimbursement ledgers, equipment transfer records, grant approvals/denials, and any internal statewide summary not published online.",
      "Frame as policy learning: 'I am studying election administration funding flows.' Do not frame as catching thieves.",
    ],
    whyItMattersForKelly: "Gives staff a concrete deliverable and Kelly a honest 'here is what I asked for' story.",
    plainEnglishWalkthrough: [
      "Draft request → counsel review → send to SOS Elections Division → log response in claims/intelligence → publish if law allows.",
    ],
    hardEvidence: [{ claim: "Exact ask text stored in intelligence JSON — STRATEGY not yet sent", tier: "STRATEGY" }],
    whatWeStillNeed: ["SOS written response", "Fulfillment or denial log"],
    howToPresentOnStage: ["Only mention request if staff has actually sent it — otherwise 'I will request' not 'I requested.'"],
    howToPresentOnTrail: [],
    connectToHammerRecord: [],
    relatedSectionIds: ["sos-outreach", "county-ledger-gap"],
  },
  {
    sectionId: "sos-outreach",
    title: "SOS outreach — Leslie Oguinn and operational conversations",
    eyebrow: "Policy learner approach",
    narrativeOverview: [
      "Calling the SOS Elections Division — research suggested Leslie Oguinn as an operational contact — is appropriate if Kelly approaches as a serious policy learner, not an opponent trying to catch them.",
      "Opening script: 'I'm trying to better understand how election administration funding flows through Arkansas — both federal HAVA funding and the County Voting System Grant Fund. I'm particularly interested in how county support decisions are made and whether there are county-by-county public reports available.'",
      "Then ask: Is there a statewide distribution spreadsheet? Are grants reimbursement-based or allocated? How are priorities set? What sits with SOS vs counties vs SBEC? What unmet needs remain? How do UCC collections track to CVSGF balances?",
      "Do not open with 'Where's the money?' Strategic goal: become known as the candidate who understands election administration — rare and valuable.",
    ],
    whyItMattersForKelly: "Bridge-building before election — and intelligence gathering for ledger request.",
    plainEnglishWalkthrough: [
      "Schedule call → use opening script → take notes → no public accusations → follow with written request.",
    ],
    hardEvidence: [{ claim: "Contact name and script — verify Oguinn still in role before cite", tier: "STRATEGY" }],
    whatWeStillNeed: ["Current Elections Division org chart", "Call notes if conducted"],
    howToPresentOnStage: ["Do not name SOS staff on stage unless relationship is public and positive."],
    howToPresentOnTrail: [],
    connectToHammerRecord: [],
    relatedSectionIds: ["records-request", "debate-funding"],
  },
  {
    sectionId: "debate-funding",
    title: "Debate & trail — funding transparency frame",
    eyebrow: "Presentation",
    narrativeOverview: [
      "Kelly frame: Arkansas has real state election equipment funding — UCC fees and legislative appropriations flow through a SOS-controlled grant fund. Integrity includes funding transparency: clerks and voters deserve public county-by-county accounting, not appropriations headlines alone.",
      "Hammer likely says he secured funding / Arkansas is #1 / he wrote integrity laws. Kelly responds: totals in Little Rock are not the same as implementation in every county — show the ledger. Ranking is not a substitute for clerk training dollars.",
      "Packo may agree funding is opaque — Kelly adds operational SOS plan without attacking Pakko voters.",
      "Fair public line (claims-gate ready): 'I've been researching how election funding flows to Arkansas counties, and it is surprisingly difficult for the public to find a clear county-by-county accounting — election transparency should include election funding transparency.'",
    ],
    whyItMattersForKelly: "Connects CVSGF research to county champion trap lane and Hammer record.",
    plainEnglishWalkthrough: [
      "Agree on integrity → cite verified appropriations → pivot to missing ledger → SOS service plan.",
    ],
    hardEvidence: [{ claim: "Trap question and fair line in debateStrategy JSON", tier: "VERIFIED" }],
    whatWeStillNeed: [],
    howToPresentOnStage: [
      "Trap question: 'Senator, can you point to the county-by-county grant ledger showing which counties received CVSGF dollars after each mandate you sponsored?'",
    ],
    howToPresentOnTrail: [],
    connectToHammerRecord: [
      "Pair with 2021/2025 bill playbooks — every mandate needs a funding line.",
    ],
    relatedSectionIds: ["county-ledger-gap", "vvsg-link"],
    href: "/admin/intelligence/trap-lanes/county-champion",
  },
  {
    sectionId: "vvsg-link",
    title: "Connection to VVSG 2.0 modernization",
    eyebrow: "Equipment lifecycle",
    narrativeOverview: [
      "CVSGF and HAVA funding connect directly to the national VVSG 2.0 transition. The EAC reports voting equipment nationwide is aging, VVSG 2.0-certified systems cost more, and deployment takes years after certification. Arkansas SOS grant guidelines must plan for those lead times — not just appropriate eleven million and assume clerks absorb new mandates.",
      "Kelly should pair this funding module with the VVSG 2.0 education page: integrity = modern equipment + transparent grants + clerk training.",
    ],
    whyItMattersForKelly: "Shows integrated understanding — not isolated talking points.",
    plainEnglishWalkthrough: [
      "Read election-funding depth → read VVSG module → ask SOS about ES&S 2.0 roadmap + CVSGF premium.",
    ],
    hardEvidence: [{ claim: "EAC May 2026 VVSG 2.0 deployment report ingested", tier: "VERIFIED" }],
    whatWeStillNeed: ["Arkansas-specific equipment age inventory"],
    howToPresentOnStage: [],
    howToPresentOnTrail: [],
    connectToHammerRecord: [],
    relatedSectionIds: ["sos-control", "appropriations-timeline"],
    href: "/admin/intelligence/election-equipment-vvsg",
  },
];

export function getAllElectionFundingDepthSectionIds(): string[] {
  return ELECTION_FUNDING_DEPTH_SECTIONS.map((s) => s.sectionId);
}

import { enrichElectionFundingSection } from "@/lib/intelligence/v4/phase7ElectionFundingEnrichment";

export function getElectionFundingDepthSection(sectionId: string): ElectionFundingDepthSection | undefined {
  const section = ELECTION_FUNDING_DEPTH_SECTIONS.find((s) => s.sectionId === sectionId);
  return section ? enrichElectionFundingSection(section) : undefined;
}
