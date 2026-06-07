import { loadKimHammerWorkbench } from "@/lib/opposition/kimHammerWorkbench";

export type BillCategoryAttackGuide = {
  categoryId: string;
  label: string;
  summary: string;
  billNumbers: string[];
  potentialMessages: string[];
  howToAttack: string[];
  debateSetupQuestions: string[];
  hammerLikelyRebuttal: string;
  kellyCounterPivot: string;
  risksToAvoid: string[];
  patternLaneId?: string;
  evidenceStatus: "INTERPRETATION" | "NEEDS_REVIEW";
};

const CATEGORY_LABELS: Record<string, string> = {
  direct_democracy_ballot_initiatives: "Direct democracy & ballot initiatives",
  petition_gathering: "Petition gathering & canvasser rules",
  county_election_administration: "County election administration",
  election_enforcement: "Election enforcement & complaints",
  ballot_access: "Ballot access & qualification",
  absentee_voting: "Absentee & mail voting",
  voting_equipment_paper_ballots: "Voting equipment & paper ballots",
  poll_watchers_election_observers: "Poll watchers & election observers",
  secretary_of_state_duties: "Secretary of State duties & authority",
  write_ins_candidate_access: "Write-ins & candidate access",
  transparency_public_records: "Transparency & public records",
  unclassified_election_topic: "Unclassified election topics",
};

const STATIC_GUIDES: Omit<BillCategoryAttackGuide, "billNumbers">[] = [
  {
    categoryId: "direct_democracy_ballot_initiatives",
    label: CATEGORY_LABELS.direct_democracy_ballot_initiatives,
    summary:
      "Hammer's largest 2025 cluster — initiative, referendum, and ballot-title process changes. Attack as a pattern of tightening citizen lawmaking, not one bill.",
    patternLaneId: "direct-democracy-restriction",
    evidenceStatus: "INTERPRETATION",
    potentialMessages: [
      "Arkleg records show Senator Hammer sponsored a multi-bill package in 2025 that changes how citizens put issues on the ballot — the question is whether those rules protect participation or just add barriers.",
      "When someone says 'election integrity,' ask what changed for a volunteer gathering signatures in a parking lot — that's where these bills land.",
      "Kelly's SOS plan treats lawful citizen initiatives as a feature of Arkansas democracy, not a loophole to close — contrast that with a record of repeated petition-process tightening.",
      "You don't have to attack direct democracy to ask: who trains counties, who pays, and who gets shut out when affidavit rules change mid-cycle?",
    ],
    howToAttack: [
      "Open with the pattern, not HB1222 alone: '2025 saw seven Hammer-sponsored bills touching initiative and petition mechanics — that's a package, not an accident.'",
      "Name one verified act (e.g. HB1222 Act 154 if confirmed on Arkleg) then pivot to operational impact: circulation windows, title review, challenge exposure.",
      "Use the county clerk frame: clerks implement what the legislature passes — did these bills fund training and lead time, or just add compliance steps?",
      "Set up Hammer with a agree-then-contrast line: 'We both want valid signatures — the difference is whether the SOS office helps citizens navigate the process or treats petitions as adversaries.'",
      "Close with Kelly doctrine: modern SOS supports counties, transparent rules, and lawful participation — administrator readiness, not author politics.",
      "Never claim motive; cite bill numbers, act numbers, and title-level provisions until enrolled-act review is complete.",
    ],
    debateSetupQuestions: [
      "Which of your 2025 petition bills would you undo if you became Secretary of State — and why?",
      "What would you tell a county clerk who gets new affidavit rules two weeks before a filing deadline?",
      "How do you measure whether these changes reduced fraud versus reduced lawful participation?",
    ],
    hammerLikelyRebuttal: "These bills protect the ballot from fraud and chaos in the initiative process.",
    kellyCounterPivot:
      "Security and participation aren't opposites — a modern SOS funds county guidance, publishes plain-language checklists, and calls balls and strikes without shutting citizens out.",
    risksToAvoid: [
      "Do not say 'voter suppression' without bill-text evidence.",
      "Do not cite ChatGPT or secondary summaries on stage.",
      "Do not treat co-sponsor vs primary sponsor as identical without checking Arkleg role field.",
    ],
  },
  {
    categoryId: "petition_gathering",
    label: CATEGORY_LABELS.petition_gathering,
    summary:
      "Overlaps direct democracy but focuses on canvasser conduct, documentation, and gathering mechanics — high emotional potency with advocates and volunteers.",
    patternLaneId: "direct-democracy-restriction",
    evidenceStatus: "INTERPRETATION",
    potentialMessages: [
      "The record shows repeated bills touching how petitions are gathered and documented — volunteers bear the cost when rules shift.",
      "Integrity means knowing who's circulating — it also means not criminalizing good-faith mistakes by community organizers.",
      "Kelly would run an SOS that publishes a living petition guide counties can hand to canvassers — not a maze only lawyers understand.",
      "Ask Hammer to explain one rule change in plain English a high-school volunteer could follow on a clipboard.",
    ],
    howToAttack: [
      "Pair petition_gathering bills with direct_democracy cluster — same session, same sponsor pattern, different audience hook (volunteers vs policy wonks).",
      "Lead with a human story placeholder: overtime clerk, church parking lot canvass, county legal review — always flag as illustrative until sourced.",
      "Force specificity: 'Which provision would you keep if a county said implementation cost exceeded the fraud it prevented?'",
      "Bridge to Pakko/direct-democracy offense briefing only in three-way geometry — don't pile on third candidate to hurt Hammer in clerk rooms.",
      "Use opposition-strategy trap lane for experience-equals-SOS-ready only after establishing operational burden evidence.",
    ],
    debateSetupQuestions: [
      "Walk us through what a canvasser must do differently today because of your 2025 bills.",
      "Who pays when counties need legal review of new affidavit requirements?",
      "Would you publish a single SOS petition handbook — yes or no?",
    ],
    hammerLikelyRebuttal: "Canvassers need accountability so out-of-state operators can't game our process.",
    kellyCounterPivot:
      "Accountability yes — confusion no. Administrator SOS means training, templates, and county partnership before new mandates hit.",
    risksToAvoid: [
      "Avoid attacking individual canvassers or groups by name.",
      "Do not conflate petition gathering with ballot initiative titles (HB1222 AG review is a separate thread).",
    ],
  },
  {
    categoryId: "county_election_administration",
    label: CATEGORY_LABELS.county_election_administration,
    summary:
      "Core contrast lane — Hammer's record shifts procedures onto county clerks; Kelly's doctrine is SOS-as-service for all 75 counties.",
    patternLaneId: "procedural-barrier-growth",
    evidenceStatus: "INTERPRETATION",
    potentialMessages: [
      "Election law isn't abstract in Arkansas — it lands on county clerks who already run on tight budgets and overtime.",
      "Hammer sponsored bills that change clerk procedures; Kelly would measure SOS success by whether clerks got help implementing them.",
      "When he says 'integrity,' ask who trained the poll workers, who paid for the forms, and who answered the phone at 8 p.m. on a deadline.",
      "ACCA rooms don't want partisan theater — they want a Secretary of State who funds implementation and respects county expertise.",
    ],
    howToAttack: [
      "Start from county-clerk-partnership philosophy briefing — this category is the debate translation of that node.",
      "Stack bills chronologically: 2021 foundation (SB487, SB582) → 2023 poll watcher (HB1457) → 2025 enforcement cluster — longitudinal pattern.",
      "Ask implementation questions Hammer cannot answer without clerk testimony: staffing, training hours, unfunded mandate cost.",
      "Use election-funding and CVSGF drill-downs only when ledger claims are VERIFIED — otherwise stay on procedural burden.",
      "Contrast with Kelly build-audit / county workbench proof points where claims are sourced.",
      "In suburban/rural mix audiences, lead with clerk partnership; in donor rooms, lead with governance competence.",
    ],
    debateSetupQuestions: [
      "Name one county clerk who asked for your help implementing HB1457 — what did you do?",
      "If mandates increase, will you fund county election offices from the SOS budget — how much?",
      "What's the difference between setting standards and dumping work on clerks without resources?",
    ],
    hammerLikelyRebuttal: "Stronger standards protect every county equally — clerks want clear rules.",
    kellyCounterPivot:
      "Clear rules plus resources — that's administrator leadership. Standards without support break trust in small counties first.",
    risksToAvoid: [
      "Do not invent county cost figures — use NEEDS_REVIEW until clerk documentation attached.",
      "Do not attack individual clerks by name.",
    ],
  },
  {
    categoryId: "election_enforcement",
    label: CATEGORY_LABELS.election_enforcement,
    summary:
      "Complaint timelines, audit triggers, and enforcement mechanics — frame as who gets investigated and who bears process cost.",
    patternLaneId: "authority-centralization",
    evidenceStatus: "INTERPRETATION",
    potentialMessages: [
      "Enforcement bills sound neutral until you ask who files complaints, who adjudicates, and whether counties get caught in the crossfire.",
      "Integrity requires enforcement — it also requires proportionality so routine errors don't become political weapons.",
      "Kelly's SOS would publish enforcement guidance counties can apply consistently — not a patchwork of fear and confusion.",
      "When Hammer cites enforcement, ask for one example where a county requested clearer complaint procedures before the bill passed.",
    ],
    howToAttack: [
      "Agree on enforcement necessity — then test proportionality and county role (SB272, SB291, HB1464, HB1693 as anchors once act-verified).",
      "Link to authority-centralization pattern: do these bills shift complaint resolution toward state actors away from local boards?",
      "Use film-room / clip governance if media statements exist — quote verification rules from rapid-response appendix.",
      "Pair with 2021 integrity foundation package narrative for longitudinal story (SB644 etc.).",
      "If opponent says 'fraud,' pivot to documented complaint process and SOS transparency — not motive.",
    ],
    debateSetupQuestions: [
      "Who should investigate a routine poll-worker paperwork error — county or state?",
      "Did your enforcement bills include funding for county legal counsel?",
      "How do you prevent complaint processes from being used for political harassment?",
    ],
    hammerLikelyRebuttal: "Without enforcement, bad actors know there are no consequences.",
    kellyCounterPivot:
      "Consequences yes — fairness yes. A modern SOS trains first, enforces consistently, and publishes rules everyone can read.",
    risksToAvoid: [
      "Never imply criminal intent without adjudicated record.",
      "HB1693 and similar need enrolled-act review before specific penalty claims.",
    ],
  },
  {
    categoryId: "ballot_access",
    label: CATEGORY_LABELS.ballot_access,
    summary:
      "Qualification, submission rules, and access mechanics — connect to voter participation without overclaiming access reduction.",
    patternLaneId: "procedural-barrier-growth",
    evidenceStatus: "INTERPRETATION",
    potentialMessages: [
      "Ballot access bills decide who gets on the ballot and how hard it is to stay there — that's core SOS work, not side theater.",
      "The question isn't whether we have rules; it's whether rules are readable, funded, and fair to candidates and voters alike.",
      "Kelly would run an SOS that publishes access checklists — Hammer's record adds process layers across multiple sessions.",
      "When access comes up, cite the bill, cite the act, then ask who helped counties implement it.",
    ],
    howToAttack: [
      "Use SB486 / 2021 foundation as entry if session context matters — then bridge to 2025 HB1222 access threads.",
      "Separate ballot access from direct democracy where bills split categories — don't blur legal mechanisms.",
      "Setup question: 'What would you tell a first-time candidate who missed a deadline because rules changed?'",
      "Align with agree-but-never-only-agree briefing when Hammer agrees on 'fair access.'",
    ],
    debateSetupQuestions: [
      "Which ballot-access rule from your record would you simplify first as SOS?",
      "How do counties learn about access changes before candidates get disqualified?",
    ],
    hammerLikelyRebuttal: "Rules keep bad actors off the ballot and protect voters from chaos.",
    kellyCounterPivot:
      "Rules plus guidance — an SOS office that answers the phone before disqualifications, not after headlines.",
    risksToAvoid: ["Do not claim access reduction without bill-text comparison to prior law."],
  },
  {
    categoryId: "absentee_voting",
    label: CATEGORY_LABELS.absentee_voting,
    summary:
      "Absentee and mail-procedure bills (2021 foundation SB643, SB258/SB299) — sensitive with rural and elderly voters.",
    evidenceStatus: "INTERPRETATION",
    potentialMessages: [
      "Absentee voting matters to rural Arkansas — long drives, shift workers, and elderly voters rely on lawful mail options.",
      "Hammer's record touches absentee procedures in the 2021 package — ask what changed for the voter, not just the statute.",
      "Kelly supports secure absentee processes with county support — not confusion that discourages lawful voting.",
      "Security and access together: verify signatures, publish rules, fund county training.",
    ],
    howToAttack: [
      "Lead with rural thesis from Kelly manual — absentee is a 75-county logistics question.",
      "Tie SB643 to 2021 integrity foundation page if moderator goes chronological.",
      "Avoid national mail-voting culture-war framing — stay Arkansas-specific and clerk-grounded.",
      "Ask for county implementation stories before citing voter impact numbers.",
    ],
    debateSetupQuestions: [
      "What would you tell a veteran in a rural county who fears their absentee ballot won't count?",
      "Did your absentee bills include county training dollars?",
    ],
    hammerLikelyRebuttal: "Absentee rules prevent fraud in mail voting.",
    kellyCounterPivot:
      "Secure absentee voting is achievable with transparent rules and county partnership — voters deserve clarity, not fear.",
    risksToAvoid: ["Do not import national 'stop the steal' rhetoric — Arkansas clerk frame only."],
  },
  {
    categoryId: "voting_equipment_paper_ballots",
    label: CATEGORY_LABELS.voting_equipment_paper_ballots,
    summary:
      "Equipment, paper ballot, and tabulation themes (SB250 anchor, SB488, HB1487) — high debate visibility post-2020.",
    patternLaneId: "authority-centralization",
    evidenceStatus: "INTERPRETATION",
    potentialMessages: [
      "SB250 is on every debate prep card for a reason — equipment law is where voters feel election integrity in their hands.",
      "Paper trails and equipment standards are legitimate — so is asking who pays counties to comply.",
      "Kelly would coordinate VVSG-aligned guidance with county clerks — not drop equipment mandates without implementation support.",
      "When Hammer cites equipment bills, ask about HAVA/CVSGF funding and county lead time.",
    ],
    howToAttack: [
      "Open with verified act citation for SB250 — one of highest-confidence anchors in the index.",
      "Link to election-equipment-vvsg intelligence surface for staff prep; on stage stay plain language.",
      "Bridge to election-funding drill-down when ledger clean; otherwise stay on unfunded mandate question.",
      "Use equipment bills to test SOS operational competence — not culture-war bait.",
    ],
    debateSetupQuestions: [
      "What did SB250 cost your home county to implement — and who paid?",
      "How would you help a county still upgrading equipment meet your standards?",
    ],
    hammerLikelyRebuttal: "Paper ballots and audits restore voter confidence in equipment.",
    kellyCounterPivot:
      "Confidence comes from equipment voters can trust and clerks who can afford to maintain it — SOS leadership means funding the bridge.",
    risksToAvoid: ["Do not claim counties 'can't comply' without sourced cost data."],
  },
  {
    categoryId: "poll_watchers_election_observers",
    label: CATEGORY_LABELS.poll_watchers_election_observers,
    summary:
      "HB1457 poll watcher bill of rights cluster — clerk training burden and observer-process politics.",
    evidenceStatus: "INTERPRETATION",
    potentialMessages: [
      "Poll watchers can strengthen transparency — when rules are clear and clerks are trained before Election Day.",
      "HB1457 changed observer procedures statewide — the SOS question is who trained county staff to apply it.",
      "Kelly wants watchers and workers both protected by published SOS guidance — not chaos at the precinct door.",
      "Observer rights aren't the debate — implementation on clerk overtime budgets is.",
    ],
    howToAttack: [
      "Use HB1457 as single-bill deep anchor — act 444 if verified on Arkleg.",
      "Agree on observer transparency — pivot to clerk training timeline and conflict de-escalation.",
      "Cross-link county_election_administration bills for pattern depth.",
      "Avoid implying watchers are inherently disruptive — stay on process design.",
    ],
    debateSetupQuestions: [
      "Who trains poll workers on the new watcher rules — state or county?",
      "What happens when a watcher and a clerk disagree at a precinct — what's the SOS hotline?",
    ],
    hammerLikelyRebuttal: "Poll watchers protect transparency — clerks wanted clearer rights.",
    kellyCounterPivot:
      "Transparency yes — preparation yes. An SOS publishes the playbook before November, not after the lawsuits.",
    risksToAvoid: ["Do not attack lawful observers or impugn volunteer motives."],
  },
  {
    categoryId: "secretary_of_state_duties",
    label: CATEGORY_LABELS.secretary_of_state_duties,
    summary:
      "HB1707 and SOS-adjacent authority shifts — direct contrast with Kelly's modernization and service doctrine.",
    patternLaneId: "authority-centralization",
    evidenceStatus: "INTERPRETATION",
    potentialMessages: [
      "Secretary of State isn't a ceremonial office — these bills show who Hammer thinks should hold election power.",
      "Kelly's plan modernizes SOS service: business filings, election support, transparent rules — legislator habits aren't the same as running the office.",
      "When Hammer lists bills, ask which ones he wrote as a senator versus which he'd administer as SOS.",
      "Author vs administrator frame: sponsoring authority shifts isn't the same as competently operating 75 counties.",
    ],
    howToAttack: [
      "Deploy author-vs-administrator philosophy briefing explicitly.",
      "Use HB1707 as bill anchor — cross-read write_ins and ballot_access tags.",
      "Contrast with Kelly executive-summary manual chapter — operations executive frame.",
      "Trap lane: experience-equals-sos-ready — only after establishing bill list is legislative, not operational.",
    ],
    debateSetupQuestions: [
      "Which SOS duty from HB1707 would you delegate to counties versus centralize in Little Rock?",
      "What's the first SOS division you'd visit on day one — and what would you fix?",
    ],
    hammerLikelyRebuttal: "I've spent years writing election law — I know this office's duties.",
    kellyCounterPivot:
      "Writing law and running operations are different jobs — voters need an administrator who's managed teams, budgets, and deadlines.",
    risksToAvoid: ["Do not conflate legislative tenure with SOS management experience without sourced capacity evidence."],
  },
  {
    categoryId: "write_ins_candidate_access",
    label: CATEGORY_LABELS.write_ins_candidate_access,
    summary:
      "Write-in and candidate-access mechanics (SB254, HB1707 overlap) — niche but useful for process-purity attacks.",
    evidenceStatus: "NEEDS_REVIEW",
    potentialMessages: [
      "Write-in rules decide whether alternative voices can participate without expensive ballot wars.",
      "Small rule changes at the SOS office can disqualify candidates — that's why administrator competence matters.",
      "Kelly would publish candidate-access guides; the record shows Hammer-authored process changes worth examining.",
    ],
    howToAttack: [
      "Use only when moderator or opponent raises candidate access — not a lead attack lane.",
      "Pair with ballot_access category for fuller picture.",
      "Keep enrolled-act verification gate high — publication risk MEDIUM.",
    ],
    debateSetupQuestions: [
      "Should write-in candidates face the same documentation burden as major-party candidates — why?",
    ],
    hammerLikelyRebuttal: "Write-in rules prevent ballot manipulation and frivolous candidacies.",
    kellyCounterPivot:
      "Fair access with clear rules — an SOS that helps candidates comply before deadlines, not after disqualification.",
    risksToAvoid: ["Title-level only until act-text review — flag NEEDS_REVIEW in staff prep."],
  },
  {
    categoryId: "transparency_public_records",
    label: CATEGORY_LABELS.transparency_public_records,
    summary:
      "SB488 transparency thread — use carefully; integrity and transparency overlap can backfire if overclaimed.",
    evidenceStatus: "INTERPRETATION",
    potentialMessages: [
      "Transparency sounds universal — ask what records voters can actually get and how fast under these bills.",
      "Kelly's SOS would default to open data on election procedures — clerk manuals, funding flows, complaint stats.",
      "If Hammer claims transparency, test it: what would you publish on day one that voters can't get today?",
    ],
    howToAttack: [
      "Flip transparency frame to operational openness — not rhetorical 'integrity.'",
      "Use SB488 with voting_equipment overlap sparingly — one bill, multiple tags.",
      "Ask for specific public records Hammer would proactively release as SOS.",
    ],
    debateSetupQuestions: [
      "Will you publish county-by-county election funding receipts online — yes or no?",
      "What election record did you fight to keep public in committee?",
    ],
    hammerLikelyRebuttal: "My bills strengthen accountability and public confidence.",
    kellyCounterPivot:
      "Confidence comes from records voters can actually see — administrator SOS means proactive disclosure, not FOIA fights.",
    risksToAvoid: ["Do not claim Hammer hid records without primary sourcing."],
  },
  {
    categoryId: "unclassified_election_topic",
    label: CATEGORY_LABELS.unclassified_election_topic,
    summary:
      "HB1837 and bills pending full theme assignment — internal research lane until KH-0B categorization completes.",
    evidenceStatus: "NEEDS_REVIEW",
    potentialMessages: [
      "The election record includes bills still under theme review — staff should verify before any external use.",
      "When in doubt, cite existence on Arkleg and defer interpretive claims until enrolled-act pass.",
    ],
    howToAttack: [
      "Do not lead debate attacks from this category — use for staff research queue only.",
      "Move bill to proper theme after bill-text review updates index.",
      "Link to claims-review and act-proof drill-down before promotion.",
    ],
    debateSetupQuestions: ["Staff-only — complete theme assignment before stage use."],
    hammerLikelyRebuttal: "N/A — bill not yet in deployable narrative set.",
    kellyCounterPivot: "Stay on verified anchors (SB250, HB1457, SB291, SB584) until HB1837 is categorized.",
    risksToAvoid: ["Do not use HB1837 on stage until theme and act-text review complete."],
  },
];

function billsByCategory(): Map<string, string[]> {
  const { bills } = loadKimHammerWorkbench();
  const map = new Map<string, string[]>();
  for (const bill of bills) {
    for (const cat of bill.topicCategory) {
      const list = map.get(cat) ?? [];
      if (!list.includes(bill.billNumber)) list.push(bill.billNumber);
      map.set(cat, list);
    }
  }
  for (const [, list] of map) {
    list.sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  }
  return map;
}

export function loadKimHammerNarrativeTestingByCategory(): BillCategoryAttackGuide[] {
  const byCat = billsByCategory();
  return STATIC_GUIDES.map((guide) => ({
    ...guide,
    billNumbers: byCat.get(guide.categoryId) ?? [],
  })).filter((guide) => guide.billNumbers.length > 0 || guide.categoryId === "unclassified_election_topic");
}

export function getBillCategoryLabel(categoryId: string): string {
  return CATEGORY_LABELS[categoryId] ?? categoryId.replace(/_/g, " ");
}
