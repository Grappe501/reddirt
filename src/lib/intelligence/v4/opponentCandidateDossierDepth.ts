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
      "He is also a pastor with long community identity in central Arkansas — staff must never attack personal faith or community role. Kelly's contrast stays on job fit: senator writes rules; secretary administers service in seventy-five counties.",
      "Hammer won a competitive 2026 Republican runoff — public reporting shows a narrow margin, suggesting coalition fragility Kelly can address with values-forward contrast, not insult.",
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
      "Long tenure and office familiarity: Hammer can name committees, bills, and process credibly. Clerks may respect that he 'knows the law' even when they dislike unfunded mandates.",
      "Election-law specialization narrative is his central brand — hammerforarkansas.com/election-security and the bill index back it. He will drop act numbers; Kelly must match with county desk impact, not bill soup alone.",
      "GOP base alignment and pastoral/community identity give him trust with Republican clerks and quorum court members. Kelly wins some of these with SOS-service framing but should not assume they start skeptical of Hammer.",
      "Runoff victory despite narrow margin still confers 'Republican nominee' legitimacy — do not treat him as weak; treat his implementation answers as weak.",
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
      "County administration burden: multiple election-law changes without a visible county support package — Kelly's strongest clerk-room lane. Safer wording: 'A fair question is whether counties received enough support for implementation burdens.'",
      "Direct-democracy restriction pattern: petition and initiative process constraints in legislative record — debate on access tradeoffs with sourced bills, not motive.",
      "Narrow 2026 runoff: competitive coalition — philosophy contrast, not mockery.",
      "Rhetoric controversy (2021 deleted Facebook post): public reporting exists — if raised, stay values-based and sourced; temperament contrast, not personal destruction.",
      "Office-stacking narrative: RESEARCH_QUESTION only — do not use on stage until claims gate clears.",
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
      "#1 ranking / Heritage-style security claims: verify primary on hammerforarkansas.com before Kelly cites or rebuts. Kelly frame: ranking ≠ clerk training dollars.",
      "'I wrote the integrity laws': authorship VERIFIED; fraud-prevention effect NEEDS_REVIEW. Kelly: security yes — six bills one year without county implementation memo.",
      "Act 808 / appropriations funded counties: VERIFIED totals; county-by-county ledger NOT public. Kelly: show the ledger.",
      "'I stand with clerks': campaign claim — test with CVSGF spreadsheet question and SOS staff ratio.",
      "Poll watchers / petition fraud prevention: bill-backed — ask for fraud case evidence tied to each rule change.",
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
      "CRITICAL — ACCA Jun 11 panel: 'I stand with clerks' vs CVSGF ledger trap. Staff captures verbatim answers.",
      "CRITICAL — 2021 package cumulative burden: Hammer cites security; Kelly cites layered process + missing training memo.",
      "HIGH — #1 ranking claims: claims gate before Kelly repeats or rebuts.",
      "HIGH — 2025 petition cluster: direct democracy / fraud evidence question.",
      "MEDIUM — Narrow runoff dynamics: values contrast only.",
      "MEDIUM — 2021 rhetoric controversy: sourced temperament contrast if moderator raises.",
      "MEDIUM — ES&S sponsor room at ACCA: equipment credit vs VVSG 2.0 funding reality.",
    ],
    whyItMattersForKelly: "Anticipate headlines — prep answers before clerks ask.",
    plainEnglishWalkthrough: ["Scan lead story → pre-read href module → rehearse 60s."],
    hardEvidence: [{ claim: "Seven lead stories in dossier with priority tags", tier: "VERIFIED" }],
    whatWeStillNeed: ["Post-panel transcript if AAC records"],
    howToUseInDebate: [],
    howToUseInClerkRoom: [],
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
      "2021 six-bill integrity foundation: SB250, HB1457, and cluster — county process overhaul in one session. Kelly frame: package without implementation memo.",
      "2023 bills: continuity themes — site control, observers, equipment. Tie to county burden layer.",
      "2025 petition cluster: signature rules, notary changes, access constraints — direct democracy offensive material.",
      "Kelly should cite act numbers with county desk impact — rehearse SB250, HB1457, SB291 playbooks minimum.",
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
      "Master frame: agree on integrity → contrast implementation → SOS service pledge (hotline, training calendar, published ledger).",
      "Opening respect line: 'Senator Hammer and I both want secure elections — I am running to administer them fairly in all seventy-five counties.'",
      "Trap question (funding): 'Can you point to the county-by-county grant ledger after each mandate you sponsored?'",
      "If #1 ranking: 'Ranking is not a substitute for clerk training dollars.'",
      "If 'I stand with clerks': 'Where is the CVSGF spreadsheet clerks use when budgeting?'",
      "Close: SOS as balls-and-strikes service office — not conflict office.",
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
  // ─── MICHAEL PAKKO ───
  {
    sectionId: "packo-executive-profile",
    candidateId: "michael-packo",
    title: "Dr. Michael Pakko — executive profile",
    eyebrow: "Third candidate · Libertarian",
    narrativeOverview: [
      "Dr. Michael R. Pakko (campaign spelling Pakko) is the 2026 Libertarian nominee for Arkansas Secretary of State, nominated at the LPAR convention February 22, 2026. Residence: Roland, Arkansas. Chief Economist and State Economic Forecaster at UALR's Arkansas Economic Development Institute; chair of the Libertarian Party of Arkansas since 2015.",
      "Prior statewide run: 2024 Libertarian candidate for State Treasurer with fiscal transparency framing. Career: Fed economist St. Louis (1993–2009), then Arkansas economic commentator — PBS Arkansas Week panels, Arkansas Economist series.",
      "Pakko is not a county clerk administrator. His lane is reform ideas, anti-duopoly competitiveness, and mandate skepticism that may sound clerk-friendly. Kelly treats him respectfully and contrasts daily SOS administration.",
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
      "Economist/communicator credential is real — PBS panels, long Arkansas Economist presence. Do not mock; acknowledge analysis skill.",
      "LPAR chair since 2015 — institutional third-party voice, not a novelty candidate.",
      "Anti-duopoly framing attracts protest voters and some mandate-skeptic clerks.",
      "2024 treasurer run gives prior statewide ballot experience.",
      "Calm TV demeanor may contrast with Hammer combativeness — Kelly must stay warm, not aggressive toward Pakko.",
      "Mandate skepticism may outflank Kelly on 'burden' unless she adds funded implementation plan.",
    ],
    whyItMattersForKelly: "Underestimating Pakko loses Libertarian-leaning clerks and voters.",
    plainEnglishWalkthrough: ["Acknowledge strength → differentiate administrator job."],
    hardEvidence: [{ claim: "Six strengths in michael-packo-strengths-matrix.json", tier: "VERIFIED" }],
    whatWeStillNeed: ["Full interview quote ledger PACKO-02"],
    howToUseInDebate: ["'Dr. Pakko brings reform ideas — I bring daily administration.'"],
    howToUseInClerkRoom: ["Silent unless ballot-access question."],
    doNotSay: ["He's a spoiler only", "Mock Ph.D."],
    relatedSectionIds: ["packo-weaknesses-deep"],
  },
  {
    sectionId: "packo-weaknesses-deep",
    candidateId: "michael-packo",
    title: "Pakko weaknesses — debate-safe framing",
    eyebrow: "Administrator contrast",
    narrativeOverview: [
      "No SOS administration experience — verified. Kelly line: economist analyzes; secretary administers Monday morning.",
      "Reform themes without county implementation detail — ranked choice/competitiveness need clerk cost answers.",
      "Libertarian platform vs statutory SOS duties (UCC remittance, CVSGF, certification timelines) — ask politely, don't attack party.",
      "Vote-split geometry: attacking Pakko helps Hammer — stay respectful.",
    ],
    whyItMattersForKelly: "Contrast job description — not voter choice.",
    plainEnglishWalkthrough: ["Reform idea → ask clerk implementation cost → SOS plan."],
    hardEvidence: [{ claim: "Five weaknesses in michael-packo-vulnerability-matrix.json", tier: "VERIFIED" }],
    whatWeStillNeed: ["Pakko SOS-specific platform vs treasurer framing"],
    howToUseInDebate: ["'If you want reform ideas, listen to Dr. Pakko. If you want a SOS who shows up for clerks, that's my job.'"],
    howToUseInClerkRoom: [],
    doNotSay: ["Vote for me not him", "Libertarians can't win"],
    relatedSectionIds: ["packo-kelly-response-playbook"],
  },
  {
    sectionId: "packo-claims-ledger",
    candidateId: "michael-packo",
    title: "What Pakko claims — verified response frames",
    eyebrow: "Claims gate",
    narrativeOverview: [
      "Fiscal transparency via economist skills: VERIFIED from treasurer/SOS campaign framing — Kelly adds election funding ledger + clerk training transparency.",
      "Election competitiveness / anti-duopoly: VERIFIED theme — Kelly agrees voters deserve choices; contrasts administrator readiness.",
      "Independent SOS outside two parties: campaign interpretation — Kelly: non-partisan administration, not non-partisan absence.",
      "Enhanced SOS public profile through communication: VERIFIED — Kelly: profile must include published rules clerks can execute.",
    ],
    whyItMattersForKelly: "When Pakko agrees with Kelly on transparency, add operational detail — don't fight agreement.",
    plainEnglishWalkthrough: ["Pakko claim → agree where true → add SOS operational pledge."],
    hardEvidence: [{ claim: "Four tracked claims in michael-packo-candidate-dossier.json", tier: "VERIFIED" }],
    whatWeStillNeed: ["Ranked choice specific proposal text from pakko4ar.com"],
    howToUseInDebate: [],
    howToUseInClerkRoom: [],
    doNotSay: ["Unverified LP platform quotes as Pakko's words"],
    relatedSectionIds: ["packo-lead-stories"],
  },
  {
    sectionId: "packo-lead-stories",
    candidateId: "michael-packo",
    title: "Lead stories to watch — Pakko",
    eyebrow: "Intelligence watch",
    narrativeOverview: [
      "CRITICAL — ACCA panel: Pakko agrees mandates hurt clerks — Kelly adds implementation plan without attacking L voters.",
      "HIGH — CVSGF opacity: Pakko may agree — Kelly owns publish-the-ledger promise.",
      "MEDIUM — Ranked choice / reform specifics — verify before debating.",
      "MEDIUM — PBS demeanor — Kelly stays warm; don't over-contrast tone.",
      "LOW — LP 3% ballot access math — ignore on stage.",
    ],
    whyItMattersForKelly: "Pakko can validate Kelly's burden frame — then Kelly must supply the SOS solution.",
    plainEnglishWalkthrough: ["Watch story → pre-read href → rehearse agree-and-extend."],
    hardEvidence: [{ claim: "Five lead stories in packo dossier", tier: "VERIFIED" }],
    whatWeStillNeed: ["Post-panel Pakko quotes"],
    howToUseInDebate: [],
    howToUseInClerkRoom: [],
    doNotSay: [],
    relatedSectionIds: ["packo-three-way-geometry"],
  },
  {
    sectionId: "packo-three-way-geometry",
    candidateId: "michael-packo",
    title: "Three-way geometry — Pakko in the room",
    eyebrow: "Hammer · Kelly · Pakko",
    narrativeOverview: [
      "When Hammer and Pakko both attack mandates: Kelly agrees on burden, adds funding + ledger + training — do not pile on Pakko to hurt Hammer in front of clerks.",
      "When Pakko attacks duopoly: respect voters' right to choose; differentiate administrator job.",
      "When moderator asks why Kelly over Pakko: 'Reform ideas vs daily administration for seventy-five counties.'",
      "Never coordinate vote strategy aloud. Phased anything-but-Hammer is internal math only.",
      "Spelling: Pakko on campaign site — verify ballot spelling before on-stage name.",
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
      "Born Kalamazoo, MI — Portage Central HS, Michigan State B.A. 1984, Rochester Ph.D. 1993.",
      "Fed St. Louis economist 1993–2009: macro, trade, public policy research.",
      "2009–present: Arkansas — AEDI chief economist, Arkansas Economic Forecast Conference, UALR adjunct.",
      "2015–present: LPAR chair (sixth term per LP site).",
      "2024: Libertarian State Treasurer candidate — fiscal transparency portal theme.",
      "2026-02-22: LPAR SOS nomination. 2026-06-11: ACCA panel. 2026-11-03: general election.",
    ],
    whyItMattersForKelly: "Humanize respectfully — he's not a cartoon third candidate.",
    plainEnglishWalkthrough: ["Fed → Arkansas economist → LP leader → SOS run."],
    hardEvidence: [{ claim: "Timeline in michael-packo-bio-timeline.json", tier: "VERIFIED" }],
    whatWeStillNeed: ["Full CV for unpublished research angles"],
    howToUseInDebate: ["One line acknowledge economist credential if relevant."],
    howToUseInClerkRoom: [],
    doNotSay: [],
    relatedSectionIds: ["packo-executive-profile"],
  },
  {
    sectionId: "packo-kelly-response-playbook",
    candidateId: "michael-packo",
    title: "Kelly response playbook — Pakko",
    eyebrow: "Operator scripts",
    narrativeOverview: [
      "Default: 'Dr. Pakko and I both want voters to trust the process — I am running to administer it in all seventy-five counties every day.'",
      "If reform vs administer: 'If you want election reform ideas, listen to Dr. Pakko. If you want a Secretary of State who shows up for clerks, that's my job.'",
      "If Pakko agrees funding opaque: add Kelly publish-the-ledger SOS plan — don't compete to sound more anti-establishment.",
      "Clerk rooms: do not mention Pakko unless ballot access question.",
      "Do not attack Libertarian voters. Do not say vote for Kelly explicitly over Pakko in three-way forum.",
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
];

export function getOpponentDossierSectionsForCandidate(
  candidateId: "kim-hammer" | "michael-packo",
): OpponentDossierDepthSection[] {
  return OPPONENT_DOSSIER_SECTIONS.filter((s) => s.candidateId === candidateId);
}

export function getAllOpponentDossierSectionIds(): string[] {
  return OPPONENT_DOSSIER_SECTIONS.map((s) => s.sectionId);
}

export function getOpponentDossierSection(sectionId: string): OpponentDossierDepthSection | undefined {
  return OPPONENT_DOSSIER_SECTIONS.find((s) => s.sectionId === sectionId);
}

export function getOpponentDossierHubPath(candidateId: "kim-hammer" | "michael-packo"): string {
  return `/admin/intelligence/opponents/dossiers/${candidateId}`;
}

export function getOpponentDossierSectionPath(sectionId: string): string | undefined {
  const s = getOpponentDossierSection(sectionId);
  return s ? `${getOpponentDossierHubPath(s.candidateId)}/${sectionId}` : undefined;
}
