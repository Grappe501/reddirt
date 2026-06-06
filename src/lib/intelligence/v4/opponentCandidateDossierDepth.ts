/**
 * Opponent candidate dossiers — narrative drill-down per candidate and section.
 * Hard evidence: data/opposition candidate-dossier JSON + strength/weakness matrices.
 */
import type { CandidateDossierFile } from "@/lib/intelligence/v4/loadOpponentCandidateDossier";

export type OpponentDossierDepthSection = {
  sectionId: string;
  candidateId: "kim-hammer" | "michael-packo";
  title: string;
  eyebrow: string;
  narrativeOverview: string[];
  whyItMattersForKelly: string;
  plainEnglishWalkthrough: string[];
  hardEvidence: Array<{ claim: string; tier: "VERIFIED" | "PARTIAL" | "STRATEGY" | "NEEDS_RESEARCH" }>;
  whatWeStillNeed: string[];
  howToUseInDebate: string[];
  howToUseInClerkRoom: string[];
  doNotSay: string[];
  relatedSectionIds: string[];
  href?: string;
  researchDepth?: {
    sourcedFacts: string[];
    fieldResearchNotes: string[];
  };
};

export const OPPONENT_DOSSIER_SECTIONS: OpponentDossierDepthSection[] = [
  // ─── KIM HAMMER ───
  {
    sectionId: "hammer-executive-profile",
    candidateId: "kim-hammer",
    title: "Kim Hammer — executive profile",
    eyebrow: "Primary opponent · Republican",
    narrativeOverview: [
      "Kim David Hammer is the Republican nominee for Arkansas Secretary of State in 2026, currently serving as State Senator (District 33). Public record positions him as the election-law specialist in the legislature: author/sponsor of the 2021 six-bill integrity package, subsequent 2023 and 2025 election bills, and a campaign built on security, #1 ranking claims, and GOP base alignment.",
      "He is also a pastor with long community identity in central Arkansas — staff must never attack personal faith or community role. Kelly's contrast stays on job fit: senator writes rules; secretary administers service in seventy-five counties. When Hammer says 'I wrote the integrity laws,' Kelly's answer is not motive attack — it is implementation: training dollars, published ledgers, clerk hotlines, and Monday-morning readiness when a new act lands.",
      "Hammer won a competitive 2026 Republican runoff — public reporting shows a narrow margin, suggesting coalition fragility Kelly can address with values-forward contrast, not insult. In three-way forums he will likely repeat authorship, #1 ranking, and 'I stand with clerks' themes — Kelly pre-reads the claims ledger and CVSGF trap questions before ACCA Mountain View.",
      "Staff should treat Hammer as a credible interlocutor on election law vocabulary while holding the administrator lane: Kelly is not running to out-legislate a senator; she is running to out-serve counties. Fair acknowledgment of one strength (election-law focus) before contrast builds moderator trust and clerk-room credibility.",
    ],
    whyItMattersForKelly: "Know the man you're contrasting with — tenure is real; SOS implementation gaps are Kelly's lane.",
    plainEnglishWalkthrough: ["Senator + pastor identity → election-law author → SOS candidate → ACCA panel Thu Jun 11."],
    hardEvidence: [
      { claim: "State Senator District 33; 2026 GOP SOS nominee", tier: "VERIFIED" },
      { claim: "2021 six-bill integrity package in election record index", tier: "VERIFIED" },
    ],
    whatWeStillNeed: ["Exact runoff margin verified against Secretary of State results"],
    howToUseInDebate: ["Acknowledge tenure once; pivot to SOS service philosophy."],
    howToUseInClerkRoom: ["Never mention pastor role; stay on clerk burden and funding."],
    doNotSay: ["Career politician smear without nuance", "Attack faith"],
    relatedSectionIds: ["hammer-strengths-deep", "hammer-claims-ledger"],
    href: "/admin/intelligence/kim-hammer",
  },
  {
    sectionId: "hammer-strengths-deep",
    candidateId: "kim-hammer",
    title: "Hammer strengths — what clerks and voters reward",
    eyebrow: "Know his hand",
    narrativeOverview: [
      "Hammer's strengths are real assets Kelly must acknowledge before contrast — clerks and Republican quorum courts may enter the room predisposed to trust a long-tenure senator who speaks election-law fluently. Long tenure and office familiarity mean Hammer can name committees, bills, and process credibly; clerks may respect that he 'knows the law' even when they dislike unfunded mandates.",
      "Election-law specialization is his central brand — hammerforarkansas.com/election-security and the bill index back it. He will drop act numbers on stage; Kelly must match with county desk impact and clerk training dollars, not bill soup alone. GOP base alignment and pastoral/community identity give him trust with Republican clerks — Kelly wins some of these with SOS-service framing but should not assume they start skeptical of Hammer.",
      "Runoff victory despite narrow margin still confers 'Republican nominee' legitimacy — do not treat him as weak; treat his implementation answers as weak. Kelly's move: fair acknowledgment of one strength, then pivot to administrator readiness, published ledgers, and clerk hotlines.",
    ],
    whyItMattersForKelly: "Fair acknowledgment of one strength builds credibility before contrast.",
    plainEnglishWalkthrough: ["Name one strength → contrast implementation → SOS pledge."],
    hardEvidence: [
      { claim: "Four documented strengths in strengths matrix with sources", tier: "VERIFIED" },
    ],
    whatWeStillNeed: [],
    howToUseInDebate: ["'I respect his focus on election law — my focus is administering it fairly for every clerk.'"],
    howToUseInClerkRoom: ["Do not dismiss tenure; ask training-dollar questions."],
    doNotSay: ["He knows nothing about elections"],
    relatedSectionIds: ["hammer-weaknesses-deep", "hammer-kelly-response-playbook"],
    href: "/admin/intelligence/kim-hammer/strengths-weaknesses",
  },
  {
    sectionId: "hammer-weaknesses-deep",
    candidateId: "kim-hammer",
    title: "Hammer weaknesses — debate-safe framing",
    eyebrow: "Implementation lane",
    narrativeOverview: [
      "Hammer's debate-safe weaknesses are implementation gaps, not character attacks. County administration burden is Kelly's strongest clerk-room lane: multiple election-law changes without a visible county support package. Safer wording: 'A fair question is whether counties received enough support for implementation burdens when each new mandate landed.'",
      "Direct-democracy restriction pattern appears in the legislative record — petition and initiative process constraints Kelly can debate on access tradeoffs with sourced bills, not motive. Narrow 2026 runoff suggests coalition fragility — philosophy contrast only, never mockery.",
      "Rhetoric controversy (2021 deleted Facebook post) has public reporting — if raised, stay values-based and sourced; temperament contrast, not personal destruction. Office-stacking narrative remains RESEARCH_QUESTION only — do not use on stage until claims gate clears.",
    ],
    whyItMattersForKelly: "Weaknesses are about job fit and clerk burden — not character assassination.",
    plainEnglishWalkthrough: ["Verify tier → use saferWording from matrix → pivot SOS plan."],
    hardEvidence: [{ claim: "Five weaknesses in vulnerability matrix with debateUsefulness ratings", tier: "VERIFIED" }],
    whatWeStillNeed: ["Office-stacking evidence before any public use"],
    howToUseInDebate: ["County champion trap questions — ledger, Act 350 ratio, watcher training."],
    howToUseInClerkRoom: ["Maximum three trap questions — curious tone."],
    doNotSay: ["He stole elections", "Office stacking (unverified)"],
    relatedSectionIds: ["hammer-lead-stories", "hammer-acca-panel-tactics"],
    href: "/admin/intelligence/kim-hammer/strengths-weaknesses",
  },
  {
    sectionId: "hammer-claims-ledger",
    candidateId: "kim-hammer",
    title: "What Hammer claims — and Kelly's verified response",
    eyebrow: "Claims gate",
    narrativeOverview: [
      "Hammer's public claims are the spine of his campaign — Kelly must verify each tier in the claims ledger before repeating or rebutting on stage. #1 ranking and Heritage-style security claims need primary citation on hammerforarkansas.com; Kelly frame: ranking is not a substitute for clerk training dollars.",
      "'I wrote the integrity laws' is authorship VERIFIED; fraud-prevention effect remains NEEDS_REVIEW. Kelly answer: security yes — six bills in one year without a county implementation memo clerks could use on Monday morning. Act 808 appropriations totals are VERIFIED; county-by-county ledger is NOT public — Kelly: show the ledger.",
      "'I stand with clerks' is a campaign claim Kelly tests with CVSGF spreadsheet questions and SOS staff ratio. Poll watcher and petition fraud prevention themes are bill-backed — ask for fraud case evidence tied to each rule change before accepting epidemic framing.",
    ],
    whyItMattersForKelly: "Every Hammer claim gets agree → verify → contrast → SOS offer.",
    plainEnglishWalkthrough: ["Hammer claim → claims tier → Kelly rebuttal frame → stop."],
    hardEvidence: [{ claim: "Six tracked claims in kim-hammer-candidate-dossier.json", tier: "VERIFIED" }],
    whatWeStillNeed: ["Heritage ranking primary citation", "Fraud case inventory for petition rules"],
    howToUseInDebate: ["Use dossier kellyRebuttalFrame fields verbatim after staff verify."],
    howToUseInClerkRoom: ["Invite clerks to ask Hammer the funding question."],
    doNotSay: ["Unverified #1 ranking as fact", "Fraud epidemic without cases"],
    relatedSectionIds: ["hammer-bill-record-arc", "hammer-lead-stories"],
    href: "/admin/intelligence/claims",
  },
  {
    sectionId: "hammer-lead-stories",
    candidateId: "kim-hammer",
    title: "Lead stories to watch — Hammer",
    eyebrow: "Intelligence watch",
    narrativeOverview: [
      "Lead stories are the headlines Hammer or moderators may surface before Kelly walks on stage — ACCA panel traps, legislative record flashpoints, and claims that need claims-gate verification. Staff should pre-read each story's linked prep module and rehearse a 60-second agree-then-contrast answer, not a prosecutorial monologue.",
      "CRITICAL — ACCA Jun 11 panel: Hammer will likely say 'I stand with clerks' while Kelly holds the CVSGF ledger trap — can you point to the county-by-county grant spreadsheet clerks use when budgeting? Staff captures verbatim answers for post-panel quote ledger. CRITICAL — 2021 package cumulative burden: Hammer cites security; Kelly cites layered process changes without a visible county implementation memo or training-dollar line item.",
      "HIGH — #1 ranking claims: Heritage-style security rankings need primary citation before Kelly repeats or rebuts — ranking is not a substitute for clerk training dollars. HIGH — 2025 petition cluster: direct democracy access vs fraud-prevention rhetoric — ask for case evidence tied to each rule change. MEDIUM — narrow runoff dynamics: values contrast only, never mockery. MEDIUM — 2021 rhetoric controversy: sourced temperament contrast only if moderator raises.",
      "MEDIUM — ES&S sponsor room at ACCA: equipment vendor credit vs VVSG 2.0 funding reality and county replacement timelines. Kelly pairs integrity talk with grant transparency and clerk hotline readiness — not vendor bashing.",
    ],
    whyItMattersForKelly: "Anticipate headlines — prep answers before clerks ask.",
    plainEnglishWalkthrough: [
      "Scan lead story priority tag (CRITICAL/HIGH/MEDIUM).",
      "Open linked prep module — trap lane, ACCA section, or claims ledger.",
      "Rehearse 60s: agree on goal → verify claim tier → clerk-impact question → SOS pledge.",
    ],
    hardEvidence: [{ claim: "Seven lead stories in dossier with priority tags", tier: "VERIFIED" }],
    whatWeStillNeed: ["Post-panel transcript if AAC records"],
    howToUseInDebate: [
      "When a lead story surfaces, name the shared goal first — secure elections — then ask the implementation question tied to that story.",
      "Never introduce a lead story Kelly has not pre-read — if surprised, pivot to SOS service pledge and defer specifics.",
    ],
    howToUseInClerkRoom: [
      "Use CRITICAL stories only — maximum three trap questions in curious tone, not accusation.",
      "Invite clerks to ask Hammer the funding question themselves — Kelly does not need to be the attack dog.",
    ],
    doNotSay: [],
    relatedSectionIds: ["hammer-acca-panel-tactics"],
    href: "/admin/intelligence/opponents/dossiers/kim-hammer",
  },
  {
    sectionId: "hammer-acca-panel-tactics",
    candidateId: "kim-hammer",
    title: "Hammer at ACCA — panel-specific tactics",
    eyebrow: "Thu Jun 11 · clerks",
    narrativeOverview: [
      "Two-hour moderated panel — not TV knockout. Hammer will likely repeat integrity + funding + clerk solidarity themes. Kelly uses calm implementation cross-exam.",
      "Best traps in this room: county-by-county CVSGF ledger; training budget for 2021 mandates; Act 350 SOS support ratio; poll watcher training ownership.",
      "ES&S is platinum sponsor — Hammer may claim equipment victories; Kelly pairs integrity with grant transparency and VVSG 2.0 lead times.",
      "Do not use film-room clips or 2021 Facebook post unless moderator raises — and then only with sourced reporting.",
    ],
    whyItMattersForKelly: "Clerks reward fair operational questions — this is Kelly's best venue vs Hammer.",
    plainEnglishWalkthrough: ["Listen → SOS offer → one trap → pass mic."],
    hardEvidence: [{ claim: "ACCA panel 120 min with three candidates", tier: "VERIFIED" }],
    whatWeStillNeed: ["Moderator name"],
    howToUseInDebate: ["Same traps work in any three-way forum."],
    howToUseInClerkRoom: ["Primary execution surface for Hammer contrast."],
    doNotSay: ["They are hiding money", "War on Democrats"],
    relatedSectionIds: ["hammer-lead-stories", "hammer-kelly-response-playbook"],
    href: "/admin/intelligence/county-clerk-week/acca-summer-conference/hammer-traps-clerk-room",
  },
  {
    sectionId: "hammer-bill-record-arc",
    candidateId: "kim-hammer",
    title: "Legislative record arc — 2021 → 2025",
    eyebrow: "Bill anchors",
    narrativeOverview: [
      "Hammer's legislative arc is Kelly's homework backbone — when he drops act numbers, Kelly answers with county desk impact first. The 2021 six-bill integrity foundation (SB250, HB1457, and cluster) represents county process overhaul in one session; Kelly frame: package without implementation memo or training-dollar line item.",
      "2023 bills continue continuity themes — site control, observers, equipment — each ties to county burden layer Kelly should rehearse with act-proof drill-downs. 2025 petition cluster (signature rules, notary changes, access constraints) is direct-democracy offensive material with sourced bills, not motive attacks.",
      "Kelly should cite minimum anchors SB250, HB1457, SB291 with county impact before ACCA and any three-way forum — credibility with clerks requires act-level homework, not slogans alone.",
    ],
    whyItMattersForKelly: "Credibility with clerks requires act-level homework.",
    plainEnglishWalkthrough: ["2021 cluster → 2023 continuity → 2025 petitions → CVSGF funding gap."],
    hardEvidence: [
      { claim: "29 curated bill playbooks with Arkleg links", tier: "VERIFIED" },
      { claim: "2021 package depth module with six bill anchors", tier: "VERIFIED" },
    ],
    whatWeStillNeed: [],
    howToUseInDebate: ["When Hammer names a bill, answer with act + clerk impact first."],
    howToUseInClerkRoom: ["Ask which budget line matched each mandate."],
    doNotSay: ["Bill numbers without county frame"],
    relatedSectionIds: ["hammer-claims-ledger"],
    href: "/admin/intelligence/opposition-strategy",
  },
  {
    sectionId: "hammer-kelly-response-playbook",
    candidateId: "kim-hammer",
    title: "Kelly response playbook — Hammer",
    eyebrow: "Operator scripts",
    narrativeOverview: [
      "Kelly's Hammer response playbook is a rehearsed sequence, not improvisation on stage. Master frame: agree on integrity → contrast implementation → SOS service pledge (hotline, training calendar, published ledger). Opening respect line: 'Senator Hammer and I both want secure elections — I am running to administer them fairly in all seventy-five counties.'",
      "Trap question (funding): 'Can you point to the county-by-county grant ledger after each mandate you sponsored?' If #1 ranking: 'Ranking is not a substitute for clerk training dollars.' If 'I stand with clerks': 'Where is the CVSGF spreadsheet clerks use when budgeting?'",
      "Close every Hammer exchange on SOS as balls-and-strikes service office — not conflict office. Rehearse until calm, not prosecutorial; pair with kelly-debate-coaching opening/closing scripts and county champion trap lane.",
    ],
    whyItMattersForKelly: "Rehearse these until calm — not prosecutorial.",
    plainEnglishWalkthrough: ["Agree → ask → offer → close."],
    hardEvidence: [{ claim: "Scripts in debate-funding JSON + county champion trap lane", tier: "VERIFIED" }],
    whatWeStillNeed: [],
    howToUseInDebate: ["Pair with kelly-debate-coaching opening/closing scripts."],
    howToUseInClerkRoom: ["Primary ACCA panel script set."],
    doNotSay: ["Kelly's NEEDS_RESEARCH lines from claims gate"],
    relatedSectionIds: ["hammer-acca-panel-tactics"],
    href: "/admin/intelligence/kelly-debate-coaching",
  },
  {
    sectionId: "hammer-2021-six-bill-deep",
    candidateId: "kim-hammer",
    title: "2021 six-bill integrity package — bill-by-bill county impact",
    eyebrow: "Acts 727–729 · 973–974 · 1051 · KH-0B verified",
    narrativeOverview: [
      "Kim Hammer primary-sponsored six election bills in the 2021 regular session — all enrolled. This is the foundational 'integrity architecture' Kelly must know cold before ACCA Mountain View or any three-way forum. Hammer will cite the package as proof of competence; Kelly answers with county desk impact bill by bill.",
      "SB486 (Act 728) tightened electioneering rules and misdemeanor penalties at polling places — expanded enforcement surface clerks must administer. SB487 (Act 729) changed precinct boundaries, polling sites, and vote-center establishment — operational decisions pushed to county election administration.",
      "SB488 (Act 727) created FOIA-related voted-ballot records exemption structure — transparency rhetoric splits: narrower public inspection while compliance duties expand for counties. SB582 (Act 1051) modified county election board governance and oath procedures.",
      "SB643 (Act 973) amended absentee-ballot procedures; SB644 (Act 974) established election-law violation hotline and investigation mechanisms. Cumulative effect: six procedural layers in one session without a documented statewide county implementation memo or training-dollar line item Kelly can cite.",
    ],
    whyItMattersForKelly: "Act-level homework builds clerk credibility — Kelly asks implementation questions Hammer must answer.",
    plainEnglishWalkthrough: [
      "Memorize bill→act pairs: SB486→728, SB487→729, SB488→727, SB582→1051, SB643→973, SB644→974.",
      "One plain-English county impact line per bill before citing package totals.",
      "Close: security yes — where was the training budget for clerks implementing all six?",
    ],
    hardEvidence: [
      { claim: "Six bills enrolled 2021 — KH-0B integrity foundation package", tier: "VERIFIED" },
      { claim: "Bill index assigns county clerks as affected actors on SB487, SB582", tier: "VERIFIED" },
    ],
    whatWeStillNeed: ["County training budget line items tied to 2021 package implementation"],
    howToUseInDebate: [
      "When Hammer says 'six bills secured elections,' ask which county spreadsheet tracked implementation.",
    ],
    howToUseInClerkRoom: [
      "Maximum three bill references — curious tone, not prosecution.",
    ],
    doNotSay: ["Stolen election", "Fraud without case evidence"],
    relatedSectionIds: ["hammer-bill-record-arc", "hammer-claims-ledger"],
    href: "/admin/intelligence/kim-hammer/integrity-foundation-2021",
  },
  {
    sectionId: "hammer-background-business-pastoral",
    candidateId: "kim-hammer",
    title: "Background — pastoral ministry, hospice, and business profile",
    eyebrow: "Biography · tone guardrails · never attack faith",
    narrativeOverview: [
      "Kim Hammer's biography is not just legislative — it is pastoral and community-rooted. Senate profile materials reference ministry service since 1978 and pastor role in Tull. Saline Memorial Hospice organizing committee chair and volunteer/full-time chaplain service through 2018 appear in verified Senate biography sources.",
      "Hammer Advertising LLC and small-business owner framing appear in campaign materials and public reporting, including Benton Courier coverage of state contract items. Family Council Action Committee 2023 Statesman Award is logged as reported claim — explains base affinity, not SOS qualification.",
      "Kelly's staff rule is absolute: never attack personal faith, pastoral identity, or hospice service. These are audience trust assets in central Arkansas Republican rooms. Contrast stays on job fit — senator writes rules; secretary administers service.",
      "If moderators invite biography comparison, Kelly uses one respect line and returns to SOS operations: published rules, clerk hotline, CVSGF ledger, training calendar. Biography surprises should be pre-read here so Kelly is never caught flat-footed.",
    ],
    whyItMattersForKelly: "Tone guardrails — respect biography, win on administrator contrast.",
    plainEnglishWalkthrough: [
      "Acknowledge pastoral/community service once if raised.",
      "Decline personal attacks — redirect to county implementation.",
      "Business references only with sourced reporting — no insinuation.",
    ],
    hardEvidence: [
      { claim: "Ministry since 1978 — Senate profile", tier: "VERIFIED" },
      { claim: "Saline Memorial Hospice — Senate biography PDF", tier: "VERIFIED" },
      { claim: "Hammer Advertising LLC — Benton Courier reported claim", tier: "PARTIAL" },
    ],
    whatWeStillNeed: ["Contract details verification before any stage reference"],
    howToUseInDebate: [
      "If Facebook 2021 post raised: sourced temperament contrast only — values, not destruction.",
    ],
    howToUseInClerkRoom: [
      "Never mention pastor role unprompted.",
    ],
    doNotSay: ["Attack faith", "Career politician smear", "Unverified contract accusations"],
    relatedSectionIds: ["hammer-executive-profile", "hammer-strengths-deep"],
    href: "/admin/intelligence/kim-hammer/background-deep",
  },
  // ─── MICHAEL PAKKO ───
  {
    sectionId: "packo-executive-profile",
    candidateId: "michael-packo",
    title: "Dr. Michael Pakko — executive profile",
    eyebrow: "Third candidate · Libertarian",
    narrativeOverview: [
      "Dr. Michael R. Pakko (campaign spelling Pakko) is the 2026 Libertarian nominee for Arkansas Secretary of State, nominated at the LPAR convention February 22, 2026. Residence: Roland, Arkansas. Chief Economist and State Economic Forecaster at UALR's Arkansas Economic Development Institute; chair of the Libertarian Party of Arkansas since 2015.",
      "Prior statewide run: 2024 Libertarian candidate for State Treasurer with fiscal transparency framing. Career: Fed economist St. Louis (1993–2009), then Arkansas economic commentator — PBS Arkansas Week panels, Arkansas Economist series. His communicator credential is real; Kelly should never mock the Ph.D. or treat him as a novelty — underestimating Pakko loses Libertarian-leaning clerks and protest voters Kelly might otherwise persuade with SOS-service framing.",
      "Pakko is not a county clerk administrator. His lane is reform ideas, anti-duopoly competitiveness, and mandate skepticism that may sound clerk-friendly — especially when Hammer defends unfunded mandates Pakko can criticize from the left and right simultaneously. Kelly treats him respectfully and contrasts daily SOS administration: reform ideas vs showing up for seventy-five counties every Monday.",
      "Three-way geometry warning: when Hammer and Pakko both attack mandate burden, Kelly agrees on clerk pain, then adds funding + ledger + training — never pile on Pakko to hurt Hammer in front of clerks. When Pakko attacks duopoly, Kelly respects voter choice and differentiates administrator readiness without attacking Libertarian voters.",
    ],
    whyItMattersForKelly: "Third candidate geometry — protest vote + agree-on-burden risk.",
    plainEnglishWalkthrough: ["Economist + LP chair → 2024 treasurer → 2026 SOS → ACCA panel."],
    hardEvidence: [
      { claim: "LPAR convention nomination Feb 22, 2026", tier: "VERIFIED" },
      { claim: "Ph.D. University of Rochester; AEDI chief economist", tier: "VERIFIED" },
    ],
    whatWeStillNeed: ["Campaign finance filings PACKO-01"],
    howToUseInDebate: ["Respectful acknowledge; administrator contrast."],
    howToUseInClerkRoom: ["Do not mention unless asked."],
    doNotSay: ["Spelling error Pakko/Packo without verify"],
    relatedSectionIds: ["packo-bio-career", "packo-strengths-deep"],
    href: "/admin/intelligence/opponents/dossiers/michael-packo",
  },
  {
    sectionId: "packo-strengths-deep",
    candidateId: "michael-packo",
    title: "Pakko strengths — respect on stage",
    eyebrow: "Know his hand",
    narrativeOverview: [
      "Pakko's strengths are real credentials Kelly must respect on stage — underestimating him loses Libertarian-leaning clerks and protest voters who might otherwise hear Kelly's SOS-service framing. Economist/communicator credential: PBS panels, Arkansas Economist series, UALR forecasting role — do not mock; acknowledge analysis skill once.",
      "LPAR chair since 2015 gives institutional third-party voice — he is not a placeholder candidate. Anti-duopoly framing attracts voters frustrated with two-party dynamics; some clerks share mandate-skeptic instincts that sound clerk-friendly until Kelly adds funded implementation.",
      "2024 treasurer run provides prior statewide ballot experience and fiscal-transparency vocabulary Kelly can agree with before adding operational detail. Calm TV demeanor may contrast with Hammer combativeness — Kelly must stay warm toward Pakko, never aggressive, even when differentiating administrator readiness.",
      "Mandate skepticism may outflank Kelly on 'burden' unless she adds funded implementation plan, published ledger, and training calendar — agree on clerk pain, then supply the SOS solution.",
    ],
    whyItMattersForKelly: "Underestimating Pakko loses Libertarian-leaning clerks and voters.",
    plainEnglishWalkthrough: ["Acknowledge strength → differentiate administrator job."],
    hardEvidence: [{ claim: "Six strengths in michael-packo-strengths-matrix.json", tier: "VERIFIED" }],
    whatWeStillNeed: ["Full interview quote ledger PACKO-02"],
    howToUseInDebate: [
      "'Dr. Pakko brings reform ideas — I bring daily administration for seventy-five counties.'",
      "Acknowledge one strength before contrast — builds trust with moderators and clerks.",
    ],
    howToUseInClerkRoom: [
      "Silent unless ballot-access or third-candidate question — then one respectful acknowledge line.",
    ],
    doNotSay: ["He's a spoiler only", "Mock Ph.D."],
    relatedSectionIds: ["packo-weaknesses-deep"],
  },
  {
    sectionId: "packo-weaknesses-deep",
    candidateId: "michael-packo",
    title: "Pakko weaknesses — debate-safe framing",
    eyebrow: "Administrator contrast",
    narrativeOverview: [
      "Pakko's debate-safe weaknesses are administrator gaps, not voter-choice attacks. No SOS administration experience is verified — Kelly line: economist analyzes; secretary administers Monday morning in seventy-five counties with different equipment, staffing, and quorum-court politics.",
      "Reform themes without county implementation detail — ranked choice, competitiveness, mandate skepticism — need clerk cost answers Kelly should ask politely, not dismiss. Libertarian platform vs statutory SOS duties (UCC remittance, CVSGF certification timelines, enrolled-act publishing) is fair policy contrast, not party attack.",
      "Vote-split geometry: attacking Pakko helps Hammer — Kelly stays respectful to Libertarian voters while contrasting administrator readiness. Never say 'vote for me not him' in three-way forum — internal math only.",
    ],
    whyItMattersForKelly: "Contrast job description — not voter choice.",
    plainEnglishWalkthrough: ["Reform idea → ask clerk implementation cost → SOS plan."],
    hardEvidence: [{ claim: "Five weaknesses in michael-packo-vulnerability-matrix.json", tier: "VERIFIED" }],
    whatWeStillNeed: ["Pakko SOS-specific platform vs treasurer framing"],
    howToUseInDebate: [
      "'If you want election reform ideas, listen to Dr. Pakko. If you want a Secretary of State who shows up for clerks, that's my job.'",
    ],
    howToUseInClerkRoom: [
      "Do not initiate Pakko weakness framing — only respond if clerk asks why Kelly over Pakko.",
    ],
    doNotSay: ["Vote for me not him", "Libertarians can't win"],
    relatedSectionIds: ["packo-kelly-response-playbook"],
  },
  {
    sectionId: "packo-claims-ledger",
    candidateId: "michael-packo",
    title: "What Pakko claims — verified response frames",
    eyebrow: "Claims gate",
    narrativeOverview: [
      "Pakko's public claims cluster around fiscal transparency, election competitiveness, and independence from the two-party duopoly — themes that can sound aligned with Kelly's transparency pledge until Kelly adds operational detail. When Pakko agrees on transparency, Kelly extends with publish-the-ledger, clerk training calendar, and SOS hotline — do not fight agreement on shared values.",
      "Fiscal transparency via economist skills is VERIFIED from his 2024 treasurer and 2026 SOS campaign framing. Kelly's contrast: analysis is valuable; administration is the Monday-morning job — who publishes the CVSGF remittance spreadsheet clerks can use? Election competitiveness / anti-duopoly is a VERIFIED theme — Kelly agrees voters deserve choices; contrasts administrator readiness and county partnership.",
      "Independent SOS outside two parties is campaign interpretation — Kelly frame: non-partisan administration in office, not absence from the ballot. Enhanced SOS public profile through communication is VERIFIED — Kelly adds that profile must include published rules clerks can execute, not just commentary.",
      "Ranked-choice and mandate-skeptic specifics remain NEEDS_RESEARCH until pakko4ar.com policy pages are logged in PACKO-02 quote ledger — do not debate hypotheticals on stage.",
    ],
    whyItMattersForKelly: "When Pakko agrees with Kelly on transparency, add operational detail — don't fight agreement.",
    plainEnglishWalkthrough: [
      "Read Pakko claim from dossier table.",
      "Agree where VERIFIED and true.",
      "Add SOS operational pledge — ledger, training, hotline.",
      "Stop — no pile-on against Libertarian voters.",
    ],
    hardEvidence: [{ claim: "Four tracked claims in michael-packo-candidate-dossier.json", tier: "VERIFIED" }],
    whatWeStillNeed: ["Ranked choice specific proposal text from pakko4ar.com"],
    howToUseInDebate: [
      "'Dr. Pakko and I both want voters to trust the process — I am running to administer it in all seventy-five counties every day.'",
      "When Pakko cites fiscal transparency, add: 'Transparency means published ledgers and training calendars — not just analysis.'",
    ],
    howToUseInClerkRoom: [
      "Do not initiate Pakko claims in clerk rooms — if ballot-access question arises, stay neutral and factual.",
    ],
    doNotSay: ["Unverified LP platform quotes as Pakko's words"],
    relatedSectionIds: ["packo-lead-stories"],
  },
  {
    sectionId: "packo-lead-stories",
    candidateId: "michael-packo",
    title: "Lead stories to watch — Pakko",
    eyebrow: "Intelligence watch",
    narrativeOverview: [
      "Lead stories for Pakko are intelligence watch items — moments where third-candidate geometry can help or hurt Kelly depending on whether she respects Pakko while supplying the SOS solution. CRITICAL — ACCA panel: Pakko may agree mandates hurt clerks; Kelly adds implementation plan without attacking Libertarian voters.",
      "HIGH — CVSGF opacity: Pakko may agree funding is opaque — Kelly owns publish-the-ledger promise and asks both opponents for county-level spreadsheets. MEDIUM — Ranked choice / reform specifics: verify exact wording on pakko4ar.com before debating; NEEDS_RESEARCH until PACKO-02 harvest complete.",
      "MEDIUM — PBS calm demeanor: Pakko's TV presence may contrast with Hammer combativeness — Kelly stays warm, not aggressive toward either opponent. LOW — LP 3% ballot access math: ignore on stage — internal strategy only, never coordinate vote aloud.",
      "Post-panel Pakko quotes should feed PACKO-02 ledger within 24 hours — ACCA is the highest-yield harvest surface for third-candidate contrast rehearsal.",
    ],
    whyItMattersForKelly: "Pakko can validate Kelly's burden frame — then Kelly must supply the SOS solution.",
    plainEnglishWalkthrough: [
      "Watch story priority → open linked href module.",
      "Pre-read agree-and-extend script.",
      "Rehearse before ACCA and three-way forums.",
    ],
    hardEvidence: [{ claim: "Five lead stories in packo dossier", tier: "VERIFIED" }],
    whatWeStillNeed: ["Post-panel Pakko quotes"],
    howToUseInDebate: [
      "When a Pakko lead story surfaces, agree on clerk burden if true — then pivot to Kelly's funded implementation plan.",
    ],
    howToUseInClerkRoom: [
      "Silent on Pakko lead stories unless moderator or clerk asks about third candidate.",
    ],
    doNotSay: [],
    relatedSectionIds: ["packo-three-way-geometry"],
  },
  {
    sectionId: "packo-three-way-geometry",
    candidateId: "michael-packo",
    title: "Three-way geometry — Pakko in the room",
    eyebrow: "Hammer · Kelly · Pakko",
    narrativeOverview: [
      "Three-way geometry is the hardest discipline in this race — Kelly must respect Pakko while contrasting Hammer record and winning clerk trust without coordinating votes aloud. When Hammer and Pakko both attack mandate burden, Kelly agrees on clerk pain, then adds funding, published ledger, and training — never pile on Pakko to hurt Hammer in front of clerks.",
      "When Pakko attacks duopoly or two-party dynamics, Kelly respects voters' right to choose and differentiates the administrator job: reform ideas vs daily administration for seventy-five counties. When moderator asks why Kelly over Pakko: 'Reform ideas vs daily administration — I am running to show up for clerks every Monday morning.'",
      "Never coordinate vote strategy aloud — phased anything-but-Hammer is internal math only. Spelling: Pakko on campaign site pakko4ar.com — verify ballot spelling before on-stage name. Use packo contrast kellyDo/kellyDoNot lists from packo-contrast-vs-kelly.json after contrast gate review.",
    ],
    whyItMattersForKelly: "Plurality race geometry — respect Pakko, contrast Hammer record, win clerk trust.",
    plainEnglishWalkthrough: ["Hammer slogans → Pakko reform → Kelly administer → close service."],
    hardEvidence: [{ claim: "Three-way scripts in kellyDebateCoaching + ACCA depth", tier: "VERIFIED" }],
    whatWeStillNeed: [],
    howToUseInDebate: ["Use packo contrast kellyDo / kellyDoNot lists."],
    howToUseInClerkRoom: ["Silent on Pakko unless asked."],
    doNotSay: ["Vote Libertarian", "Pakko is a spoiler"],
    relatedSectionIds: ["packo-kelly-response-playbook"],
    href: "/admin/intelligence/debate-depth/three-way",
  },
  {
    sectionId: "packo-bio-career",
    candidateId: "michael-packo",
    title: "Bio & career timeline",
    eyebrow: "Background",
    narrativeOverview: [
      "Dr. Michael Pakko's biography is a Midwest economist who became Arkansas's most visible Libertarian institutional voice — not a county elections administrator. Born Kalamazoo, Michigan; Portage Central High School; Michigan State B.A. 1984; University of Rochester Ph.D. 1993 in economics. That credential is real and Kelly should acknowledge it once when relevant.",
      "Federal Reserve Bank of St. Louis research economist 1993–2009: macro, trade, and public policy — then Arkansas since 2009 as Chief Economist and State Economic Forecaster at UALR's Arkansas Economic Development Institute. He runs the Arkansas Economic Forecast Conference, adjunct-teaches, and maintains the Arkansas Economist commentary series — plus regular PBS Arkansas Week panels.",
      "LPAR chair since 2015 (sixth term per LP site) — institutional third-party leadership, not a novelty candidacy. 2024 Libertarian State Treasurer run established fiscal-transparency portal themes he carries into 2026 SOS. LPAR convention nomination February 22, 2026; ACCA panel June 11; general election November 3 with Hammer and Grappe.",
      "Spelling note: campaign site pakko4ar.com uses Pakko; Ballotpedia Michael Pakko — verify ballot spelling before on-stage name. Kelly humanizes respectfully — he is not a cartoon third candidate.",
    ],
    whyItMattersForKelly: "Humanize respectfully — he's not a cartoon third candidate.",
    plainEnglishWalkthrough: [
      "Fed economist → Arkansas AEDI → LP chair → 2024 treasurer → 2026 SOS.",
      "One-line economist acknowledge if moderator asks backgrounds.",
      "Differentiate administrator job immediately after acknowledge.",
    ],
    hardEvidence: [{ claim: "Timeline in michael-packo-bio-timeline.json", tier: "VERIFIED" }],
    whatWeStillNeed: ["Full CV for unpublished research angles"],
    howToUseInDebate: [
      "'Dr. Pakko brings decades of economic analysis — I bring daily administration for seventy-five counties.'",
    ],
    howToUseInClerkRoom: [
      "Only mention Pakko background if clerk asks about third candidate — one respectful sentence, then SOS plan.",
    ],
    doNotSay: [],
    relatedSectionIds: ["packo-executive-profile"],
  },
  {
    sectionId: "packo-kelly-response-playbook",
    candidateId: "michael-packo",
    title: "Kelly response playbook — Pakko",
    eyebrow: "Operator scripts",
    narrativeOverview: [
      "Kelly's Pakko response playbook defaults to respect plus administrator contrast — never attack Libertarian voters or treat Pakko as a spoiler. Default line: 'Dr. Pakko and I both want voters to trust the process — I am running to administer it in all seventy-five counties every day.'",
      "If reform vs administer split: 'If you want election reform ideas, listen to Dr. Pakko. If you want a Secretary of State who shows up for clerks, that's my job.' If Pakko agrees funding is opaque, Kelly adds publish-the-ledger SOS plan — do not compete to sound more anti-establishment.",
      "Clerk rooms: do not mention Pakko unless ballot-access question. Do not attack Libertarian voters. Do not say vote for Kelly explicitly over Pakko in three-way forum — pair with THREE_WAY_DEBATE_STRATEGY in coaching panel.",
    ],
    whyItMattersForKelly: "Respect + differentiation wins geometry.",
    plainEnglishWalkthrough: ["Respect → administrator contrast → SOS pledge."],
    hardEvidence: [{ claim: "kellyDo/kellyDoNot in packo-contrast-vs-kelly.json", tier: "VERIFIED" }],
    whatWeStillNeed: [],
    howToUseInDebate: ["Pair with THREE_WAY_DEBATE_STRATEGY in coaching panel."],
    howToUseInClerkRoom: ["Ignore unless asked."],
    doNotSay: ["Vote Libertarian", "Throw your vote away"],
    relatedSectionIds: ["packo-three-way-geometry"],
    href: "/admin/intelligence/kelly-debate-coaching",
  },
  {
    sectionId: "packo-economist-platform-deep",
    candidateId: "michael-packo",
    title: "Economist platform — Fed to AEDI to fiscal transparency SOS frame",
    eyebrow: "Ph.D. Rochester · PBS · 2024 treasurer → 2026 SOS",
    narrativeOverview: [
      "Dr. Michael Pakko's credential stack is unusually deep for a third-party statewide candidate: B.A. Michigan State 1984, Ph.D. University of Rochester 1993 in economics, thirteen years as research economist at the Federal Reserve Bank of St. Louis (macro, trade, public policy), then Arkansas since 2009 as Chief Economist and State Economic Forecaster at UALR's Arkansas Economic Development Institute.",
      "He runs the Arkansas Economic Forecast Conference, adjunct-teaches, maintains the Arkansas Economist commentary series, and appears regularly on PBS Arkansas Week — calm panel demeanor that may contrast with Hammer combativeness in three-way settings. LPAR chair since 2015 (sixth term per LP site) gives institutional third-party voice, not placeholder status.",
      "2024 Libertarian State Treasurer run established fiscal-transparency vocabulary he carries into 2026 SOS: economist/data skills for public finance visibility, anti-duopoly election competitiveness themes, and independence from two-party dynamics. Campaign claims on pakko4ar.com emphasize communication and analysis — Kelly extends with operational detail: published CVSGF ledger, clerk training calendar, SOS hotline.",
      "Kelly's contrast is respectful and precise: analysis is valuable; administration is Monday morning in seventy-five counties with different equipment, staffing, and quorum-court politics. Ranked-choice and mandate-skeptic specifics remain NEEDS_RESEARCH until PACKO-02 quote ledger harvest completes — do not debate hypotheticals on stage.",
    ],
    whyItMattersForKelly: "Respect economist credential once; win on administrator readiness and county partnership.",
    plainEnglishWalkthrough: [
      "Fed 1993-2009 → AEDI 2009 → LP chair 2015 → treasurer 2024 → SOS 2026.",
      "Acknowledge PBS/forecasting credential if moderator asks backgrounds.",
      "Differentiate: reform ideas vs daily clerk administration immediately after.",
    ],
    hardEvidence: [
      { claim: "Ph.D. Rochester 1993; Fed St. Louis 1993-2009 — bio timeline VERIFIED", tier: "VERIFIED" },
      { claim: "LPAR convention nomination 2026-02-22 — bio timeline VERIFIED", tier: "VERIFIED" },
      { claim: "2024 treasurer run — Talk Business, Ballotpedia VERIFIED", tier: "VERIFIED" },
    ],
    whatWeStillNeed: ["SOS-specific platform vs treasurer framing on pakko4ar.com", "PACKO-02 full quote ledger"],
    howToUseInDebate: [
      "'Dr. Pakko brings decades of economic analysis — I bring daily administration for seventy-five counties.'",
    ],
    howToUseInClerkRoom: [
      "Silent unless third-candidate question — one respectful sentence, then SOS plan.",
    ],
    doNotSay: ["Mock Ph.D.", "Spoiler framing", "Unverified LP platform quotes"],
    relatedSectionIds: ["packo-executive-profile", "packo-bio-career", "packo-strengths-deep"],
    href: "/admin/intelligence/opponents/michael-packo",
  },
];

import { applyOpponentDossierResearchDepth } from "@/lib/intelligence/v4/applyCandidateDossierResearchDepth";
import { applyOpponentDossierDepthExpansion } from "@/lib/intelligence/v4/applyDossierDepthExpansion";
import { enrichOpponentDossierSection } from "@/lib/intelligence/v4/phase7DossierBriefingEnrichment";

function finalizeOpponentSection(section: OpponentDossierDepthSection): OpponentDossierDepthSection {
  return enrichOpponentDossierSection(
    applyOpponentDossierDepthExpansion(applyOpponentDossierResearchDepth(section)),
  );
}

export function getOpponentDossierSectionsForCandidate(
  candidateId: "kim-hammer" | "michael-packo",
): OpponentDossierDepthSection[] {
  return OPPONENT_DOSSIER_SECTIONS.filter((s) => s.candidateId === candidateId).map(finalizeOpponentSection);
}

export function getAllOpponentDossierSectionIds(): string[] {
  return OPPONENT_DOSSIER_SECTIONS.map((s) => s.sectionId);
}

export function getOpponentDossierSection(sectionId: string): OpponentDossierDepthSection | undefined {
  const section = OPPONENT_DOSSIER_SECTIONS.find((s) => s.sectionId === sectionId);
  return section ? finalizeOpponentSection(section) : undefined;
}

export function getOpponentDossierHubPath(candidateId: "kim-hammer" | "michael-packo"): string {
  return `/admin/intelligence/opponents/dossiers/${candidateId}`;
}

export function getOpponentDossierSectionPath(sectionId: string): string | undefined {
  const s = getOpponentDossierSection(sectionId);
  return s ? `${getOpponentDossierHubPath(s.candidateId)}/${sectionId}` : undefined;
}
