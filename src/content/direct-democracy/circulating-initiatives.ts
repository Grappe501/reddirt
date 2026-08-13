/**
 * Public-reporting snapshot of measures Arkansans may see in signature drives for 2026.
 * Not a legal filing. Update as Attorney General opinions and sponsor announcements change.
 */
export type InitiativeStampTone = "denied" | "qualified";

export type InitiativeStamp = {
  tone: InitiativeStampTone;
  /** Short rubber-stamp line, shown diagonally across the card */
  mark: string;
  /** Second line on the stamp — the specific outcome */
  submark: string;
};

export type CirculatingInitiative = {
  id: string;
  name: string;
  /** Short list label */
  shortLabel: string;
  category: "Education" | "Direct democracy" | "Environment" | "Governance" | "Tax fairness" | "Local";
  format: "Statewide · constitutional amendment" | "Statewide · initiated act" | "Local · city or county";
  /** As typically reported: certification, collection, or verify */
  statusLine: string;
  stamp: InitiativeStamp;
  summary: string;
  whatItWouldDo: string;
  organizing: string;
  /** What a professional Secretary of State’s office would make easy to see */
  sosStewardship: string;
  verify: string;
  /** Public campaign, coalition, or tracking site — not a state filing. */
  directWebsite: { label: string; href: string };
  ballotpediaPath?: string;
  externalLinks?: { label: string; href: string }[];
};

export const CIRCULATING_DISCLAIMER =
  "This is a campaign education snapshot, not a Secretary of State filing list. Most of these statewide efforts did not reach the November 2026 ballot. Each card is stamped with the outcome as publicly reported. Titles, committees, and local certification can still change. Always confirm the certified ballot title with the Attorney General and filing status with the Secretary of State or the county clerk before you sign, donate, or report news.";

export const circulatingInitiatives2026: CirculatingInitiative[] = [
  {
    id: "for-ar-kids-education",
    name: "Arkansas Educational Rights Amendment (For AR Kids and allies)",
    shortLabel: "For AR Kids — educational rights",
    category: "Education",
    format: "Statewide · constitutional amendment",
    statusLine: "Did not qualify: sponsors announced they were short of the 90,704 signatures required and did not turn in petitions on July 3, 2026.",
    stamp: { tone: "denied", mark: "FAILED", submark: "NOT ENOUGH SIGNATURES" },
    summary:
      "A coalition of parents, educators, and advocates under the “For AR Kids” banner advanced education-centered constitutional language aimed at guaranteed access to quality public education, early learning, and student supports—and at requiring private schools that take public funds to meet the same academic and accreditation standards as public schools. For the 2026 cycle the group said it did not collect enough signatures and did not submit petitions to the Secretary of State. A similar 2024 effort also fell short.",
    whatItWouldDo:
      "Depending on the certified text, the measure would have locked in pre‑K, after‑school, and summer learning access; protected special education services; aligned funding to student needs; and required identical academic and accreditation standards for any school receiving public dollars. Compare every clause to the AG-certified text—sponsor summaries are not the petition.",
    organizing:
      "Teachers’ associations, superintendents, and local PTAs were natural coalition partners. Leaders publicly cited a smaller volunteer base and the cost of a statewide petition as reasons the 2026 drive came up short.",
    sosStewardship:
      "A Secretary of State committed to transparency would: publish timely sample petition images, a plain-language FAQ, county-level progress where signatures have been filed (not just statewide totals), a single lookup for committee name and treasurer, and a clear “how to report irregularities” path that protects signers and volunteers.",
    verify:
      "Arkansas Democrat-Gazette (July 3 and July 12, 2026) and Arkansas Times (July 3, 2026): For AR Kids announced it would not turn in petitions. Confirm any later filing with the Secretary of State’s elections division.",
    directWebsite: { label: "For AR Kids — coalition & measure (official site)", href: "https://www.forarkids.org/" },
    ballotpediaPath: "https://ballotpedia.org/Arkansas_2026_ballot_measures",
    externalLinks: [
      { label: "Ballotpedia — Arkansas 2026 measures (context)", href: "https://ballotpedia.org/Arkansas_2026_ballot_measures" },
    ],
  },
  {
    id: "fundamental-right-initiative-referendum",
    name: "Create a fundamental right to initiative and referendum",
    shortLabel: "Fundamental I&R right",
    category: "Direct democracy",
    format: "Statewide · constitutional amendment",
    statusLine:
      "Denied by the Secretary of State on a clerical technicality: petition pages used a slightly different popular name than the Attorney General certified. Signers have asked the Arkansas Supreme Court to reverse that call.",
    stamp: { tone: "denied", mark: "DENIED BY SOS", submark: "CLERICAL TECHNICALITY" },
    summary:
      "Protect AR Rights circulated The Arkansas Ballot Measure Rights Amendment—often described as creating a fundamental right to initiative and referendum and rolling back recent laws that add friction to petitioning. The committee turned in more than 108,000 signatures on July 3, 2026 (above the 90,704 threshold). Secretary of State Cole Jester then refused to count any of them because the popular name printed on petition pages—“The Ballot Measure Rights Amendment of 2026”—did not match the AG-certified name—“The Arkansas Ballot Measure Rights Amendment.” Sponsors call that a non-material clerical difference; the office also cited other defects. Litigation was pending as of mid-August 2026. This page does not predict the court’s result.",
    whatItWouldDo:
      "Would treat the people’s right to propose and sign ballot measures as a fundamental constitutional right, limit the legislature’s ability to repeal voter-approved amendments without going back to voters, and require voter approval for new laws that restrict the petition process.",
    organizing:
      "Civic coalitions and cross-partisan “save the petition” efforts. Signature strategy emphasized county distribution and rapid-response media when the rules change mid-cycle.",
    sosStewardship:
      "The office should run nonpartisan public dashboards: which committees are active, visible deadline clocks, and rejected lines with reasons (without chilling lawful speech), plus downloadable templates that match the certified text exactly—reducing notary, witness, and popular-name errors that knock out valid signers. A professional office would flag a title mismatch immediately, not after the full review window.",
    verify:
      "Arkansas Advocate, KATV, and Arkansas Democrat-Gazette (July 30–August 5, 2026): SOS letter on the popular-name mismatch; Hanna v. Jester / Protect AR Rights intervention. Confirm any court order with the Arkansas Supreme Court clerk.",
    directWebsite: { label: "Protect Arkansas Rights — campaign site", href: "https://www.protectarrights.org/" },
    ballotpediaPath: "https://ballotpedia.org/Arkansas_Create_a_Fundamental_Right_to_Initiative_and_Referendum_Amendment_(2026)",
    externalLinks: [
      {
        label: "Ballotpedia — Fundamental right to I&R (2026)",
        href: "https://ballotpedia.org/Arkansas_Create_a_Fundamental_Right_to_Initiative_and_Referendum_Amendment_(2026)",
      },
    ],
  },
  {
    id: "initiative-referendum-process",
    name: "Initiative and referendum process amendment (Save / protect voter-approved text)",
    shortLabel: "I&R process & legislative constraint",
    category: "Direct democracy",
    format: "Statewide · constitutional amendment",
    statusLine: "Withdrawn from the 2026 process: sponsors said they would not have enough signatures to turn in by the July 3 deadline.",
    stamp: { tone: "denied", mark: "WITHDRAWN", submark: "FROM PROCESS" },
    summary:
      "Save AR Democracy, tied to League of Women Voters of Arkansas leadership, circulated a separate constitutional amendment to write detailed initiative rules into the constitution and protect voter-passed text from one-sided legislative rewrites. In early July 2026 the sponsor told reporters the campaign would not have enough signatures to file. Protect AR Rights was the only statewide committee that turned in petitions on deadline day.",
    whatItWouldDo:
      "Typically includes: clearer judicial review for challenges to proposed ballot text, limits on the General Assembly’s ability to nullify a voter-approved amendment, and clearer guardrails for how future legislatures can alter initiative sections—only by referring change back to voters in many designs.",
    organizing:
      "League of Women Voters–style good-government groups, legal clinics, and multi-issue tables that see legislative override as a long-term risk to every other ballot fight.",
    sosStewardship:
      "The Secretary of State should make comparative tables of “current law vs. proposed law” in plain English, and publish filing and litigation milestones in one timeline so a voter can see whether a measure is in circulation, withdrawn, in court, or qualified.",
    verify:
      "Arkansas Democrat-Gazette (July 1 and July 3, 2026): Save AR Democracy said it would not turn in signatures. Confirm any later filing with the Secretary of State.",
    directWebsite: { label: "Save AR Democracy — direct democracy protection (campaign site)", href: "https://www.saveardemocracy.org/" },
    ballotpediaPath: "https://ballotpedia.org/Arkansas_Initiative_and_Referendum_Process_Amendment_(2026)",
    externalLinks: [
      {
        label: "Ballotpedia — I&R process amendment (2026)",
        href: "https://ballotpedia.org/Arkansas_Initiative_and_Referendum_Process_Amendment_(2026)",
      },
    ],
  },
  {
    id: "environmental-preservation",
    name: "Arkansas Environmental Preservation Amendment",
    shortLabel: "Clean & healthy environment (statewide)",
    category: "Environment",
    format: "Statewide · constitutional amendment",
    statusLine:
      "Not on the 2026 ballot. Student organizers paused the drive and said they will try again for 2028 after the Attorney General rejected multiple versions of the ballot language.",
    stamp: { tone: "denied", mark: "POSTPONED", submark: "NOT ON 2026 BALLOT" },
    summary:
      "University of Arkansas students led a proposed constitutional amendment recognizing a right to a clean and healthy environment. The Attorney General’s office rejected successive popular names and ballot titles in 2025 and 2026 (including versions styled “Keep Arkansas Natural” and “The Natural Environment Amendment”) for being misleading or omitting material provisions. On May 1, 2026, organizers told the Arkansas Times they were pausing until the 2028 cycle because certification delays left too little time to collect statewide signatures.",
    whatItWouldDo:
      "Would have created constitutional floor language for environmental values while leaving most implementation to statute. Read carefully: “fundamental right” language interacts with private property, permitting, and existing agencies.",
    organizing:
      "Student organizers (publicly including Muskan Taori, Wyatt Rice, Sydney Stewart, and Kevin Durden) and conservation allies. After postponing, they said they hoped to help other 2026 petition work and return early in the 2028 cycle.",
    sosStewardship:
      "A transparent office would publish each AG rejection and the reason in plain English next to the proposed title, with a clock showing how much circulation time remains—so student and volunteer campaigns are not surprised by a late redesign instruction.",
    verify:
      "Arkansas Times (May 1, 2026): campaign postponed to 2028. University of Arkansas Cooperative Extension tracking of AG opinions 2025-098, 2025-128, and 2026-034 (rejections). Distinguish this statewide amendment from any local conservation or bond question.",
    directWebsite: {
      label: "Ballotpedia — measure page (file versions & status)",
      href: "https://ballotpedia.org/Arkansas_Environmental_Preservation_Amendment_(2026)",
    },
    ballotpediaPath: "https://ballotpedia.org/Arkansas_Environmental_Preservation_Amendment_(2026)",
    externalLinks: [
      {
        label: "Ballotpedia — Environmental preservation (2026)",
        href: "https://ballotpedia.org/Arkansas_Environmental_Preservation_Amendment_(2026)",
      },
    ],
  },
  {
    id: "garland-county-alcohol",
    name: "Garland County / Hot Springs — local alcohol sales",
    shortLabel: "Garland County alcohol (local ballot)",
    category: "Local",
    format: "Local · city or county",
    statusLine:
      "Local petitions were collected and submitted so voters in that community can decide on the November 2026 local ballot—unlike the statewide measures that did not qualify.",
    stamp: { tone: "qualified", mark: "ON THE LOCAL BALLOT", submark: "GARLAND COUNTY" },
    summary:
      "Neighbors in Garland County organized a local-option petition on alcohol sales. The public campaign most visible in 2025–26 is Keep Our Dollars in Hot Springs, which circulated a city question to allow Sunday off-premise alcohol sales (package stores and similar retailers—not only restaurant pours). Under the alcoholic-beverage code, a city question typically needs signatures equal to 15% of the votes cast for governor in that city in the last gubernatorial election—about 1,953 valid Hot Springs signatures, according to the committee. Organizers submitted petitions in August 2026. Local and county ballots are where this kind of question still reaches voters when statewide initiatives stall. Confirm final certification with the Garland County clerk and Hot Springs city clerk.",
    whatItWouldDo:
      "If certified and approved, Hot Springs voters would decide whether off-premise alcohol sales are allowed on Sunday inside the city, following the same local-option path used in other Arkansas cities. This is not a statewide wet/dry rewrite. Read the local ballot wording, not a statewide explainer.",
    organizing:
      "Keep Our Dollars in Hot Springs registered with the Ethics Commission in 2025. Chair Tyler Draper described a volunteer drive at retailers and civic spots, aiming above the minimum so disqualified signatures would not sink the filing.",
    sosStewardship:
      "A modern Secretary of State can still publish a local-election hub that points citizens to the county clerk, city recorder, and county board of election commissioners, and that lists local-option alcohol questions next to statewide measures so voters are not left guessing what is on their own ballot.",
    verify:
      "Arkansas Democrat-Gazette (May 31, 2025); KATV and THV11 (petition drive); Hot Springs Sentinel-Record (August 8, 2026: signatures submitted). Confirm certification on the Garland County elections site and with the city clerk before election day.",
    directWebsite: {
      label: "Garland County Elections — 2026 ballot issues",
      href: "https://www.garlandcountyvote.org/2026-ballot-issues.html",
    },
    externalLinks: [
      { label: "City of Hot Springs", href: "https://www.hotspringsar.gov/" },
    ],
  },
  {
    id: "government-transparency",
    name: "Arkansas Right to Government Transparency",
    shortLabel: "Government transparency (previous cycle)",
    category: "Governance",
    format: "Statewide · initiated act",
    statusLine: "Previous cycle: the 2024 transparency / FOIA petitions fell short of the signature total. A 2026 refile did not turn in petitions by the July 3, 2026 statewide deadline.",
    stamp: { tone: "denied", mark: "PREVIOUS CYCLE", submark: "NOT ON 2026 BALLOT" },
    summary:
      "Arkansas Citizens for Transparency and press-association partners sought to make government transparency a right in law, with voter approval for future rollbacks of sunshine provisions. That fight was the 2024 cycle: on July 5, 2024, sponsors said they fell just short of the statewide total while meeting the 50-county floor, and they did not turn in petitions. They refiled language for 2026. Protect AR Rights was the only statewide committee that submitted signatures on the July 3, 2026 deadline—so this measure is not a live 2026 statewide petition.",
    whatItWouldDo:
      "Statutory initiatives can be amended more easily by a future legislature than constitutional text unless the drafters chain voter approval; read the final section on entrenchment carefully. The 2024 package also included a constitutional “government disclosure” amendment in some filings.",
    organizing:
      "Press associations, open-government nonprofits, and cross-partisan reformers. Often pairs with local journalists for verification stories.",
    sosStewardship:
      "The office already touches business filings and election transparency—this measure heightens the expectation for searchable bulk data and clear appeals when a record request stalls. A Secretary of State can model the standard even before a vote: publish FOIA response SLAs, forms, and training for clerks.",
    verify:
      "Arkansas Advocate and Arkansas Democrat-Gazette (July 5, 2024): transparency measures missed the 2024 signature goal. July 3, 2026 reporting: only Protect AR Rights turned in statewide petitions that day.",
    directWebsite: {
      label: "Arkansas Citizens for Transparency (sunshine & FOIA coalition)",
      href: "https://www.arcitizens4transparency.org/",
    },
    ballotpediaPath: "https://ballotpedia.org/Arkansas_Right_to_Government_Transparency_Initiative_(2026)",
    externalLinks: [
      {
        label: "Ballotpedia — Government transparency (2026)",
        href: "https://ballotpedia.org/Arkansas_Right_to_Government_Transparency_Initiative_(2026)",
      },
    ],
  },
  {
    id: "educational-standards-public-funding",
    name: "Educational standards for schools receiving public funding",
    shortLabel: "Accreditation & standards for funded schools",
    category: "Education",
    format: "Statewide · constitutional amendment",
    statusLine: "Duplicate listing of the For AR Kids Educational Rights Amendment—not a second, separate 2026 petition.",
    stamp: { tone: "denied", mark: "DUPLICATE", submark: "SEE FOR AR KIDS" },
    summary:
      "Trackers sometimes list “educational standards for schools receiving public funding” as its own line. In this cycle that language is a plank of the For AR Kids Educational Rights Amendment (identical academic and accreditation standards for any school that takes public dollars, plus early-learning and student-support provisions)—not a second statewide petition with its own signature drive. The outcome is the same: For AR Kids did not turn in enough signatures.",
    whatItWouldDo:
      "See the For AR Kids card. If adopted in a future cycle, the fight would shift to rulemaking: who sets assessments, who pays for compliance, and how private or home-school routes interact with new expectations.",
    organizing:
      "Same coalition as For AR Kids. Do not collect or report this as a separate circulating petition.",
    sosStewardship:
      "A professional office would show one certified title per committee, not two public names for the same text, so voters are not asked to sign twice for one amendment.",
    verify:
      "Compare the For AR Kids certified title and Ballotpedia’s educational-standards page: they describe the same amendment. Outcome: July 3, 2026, For AR Kids did not file signatures.",
    directWebsite: {
      label: "For AR Kids — public hub (this is the same line of work)",
      href: "https://www.forarkids.org/",
    },
    ballotpediaPath: "https://ballotpedia.org/Arkansas_Establish_Educational_Standards_for_Schools_Receiving_Public_Funding_Initiative_(2026)",
    externalLinks: [
      {
        label: "Ballotpedia — Educational standards initiative (2026)",
        href: "https://ballotpedia.org/Arkansas_Establish_Educational_Standards_for_Schools_Receiving_Public_Funding_Initiative_(2026)",
      },
    ],
  },
  {
    id: "hygiene-diaper-tax",
    name: "Exempt hygiene products and diapers from sales tax",
    shortLabel: "Diapers & hygiene — sales tax",
    category: "Tax fairness",
    format: "Statewide · initiated act",
    statusLine: "Did not qualify: the committee did not turn in enough signatures for the 2026 ballot (statewide deadline July 3, 2026).",
    stamp: { tone: "denied", mark: "FAILED", submark: "NOT ENOUGH SIGNATURES" },
    summary:
      "The Arkansas Period Poverty Project sought an initiated act to exempt diapers and feminine hygiene products from the state sales and use tax. In 2024 the committee reported 43,831 signatures of the 72,563 required and did not file. It refiled for 2026. On July 3, 2026, Protect AR Rights was the only statewide campaign to turn in petitions—so this tax measure did not meet the signature threshold to appear on the 2026 ballot.",
    whatItWouldDo:
      "Would treat diapers and menstrual products as necessities, not luxuries, by exempting them from state sales and use tax. Revenue trade-offs are part of the public debate: where the state backfills, if it does, and how local taxes interact.",
    organizing:
      "Family, faith, and retail volunteer bases when organized well. The 2024 drive cited too few volunteers and too little time.",
    sosStewardship:
      "A transparent office publishes a fiscal impact analysis in plain language and ensures implementation guidance reaches the Department of Finance and Administration and retailers before effective dates, so the benefit hits receipts correctly.",
    verify:
      "Arkansas Democrat-Gazette (July 5, 2024) for the first miss; July 3, 2026 reporting that only one statewide committee filed signatures that day. Confirm any later filing with the Secretary of State.",
    directWebsite: {
      label: "Arkansas Period Poverty Project (lead committee in public reporting)",
      href: "https://periodlittlerock.wixsite.com/arperiodproject",
    },
    ballotpediaPath: "https://ballotpedia.org/Arkansas_Exempt_Feminine_Hygiene_Products_and_Diapers_from_Sales_Tax_Initiative_(2026)",
    externalLinks: [
      {
        label: "Ballotpedia — Hygiene & diaper tax (2026)",
        href: "https://ballotpedia.org/Arkansas_Exempt_Feminine_Hygiene_Products_and_Diapers_from_Sales_Tax_Initiative_(2026)",
      },
    ],
  },
  {
    id: "jacksonville-local",
    name: "Jacksonville — local election structure and representation",
    shortLabel: "Jacksonville (denied by county clerk)",
    category: "Local",
    format: "Local · city or county",
    statusLine:
      "Signatures were collected. The county clerk denied the filing on a clerical technicality of the same kind used to throw out the statewide Ballot Measure Rights Amendment.",
    stamp: { tone: "denied", mark: "DENIED BY COUNTY CLERK", submark: "CLERICAL TECHNICALITY" },
    summary:
      "Jacksonville residents organized a local petition to change how city council is elected—moving away from citywide (at-large) voting toward ward-based or hybrid representation so neighborhoods elect their own seats. Organizers gathered the signatures needed to file. The Pulaski County clerk then denied the petition on a clerical technicality: a mismatch between the popular name or form on the petition pages and the certified wording—the same class of defect the Secretary of State later used to refuse every signature on the statewide fundamental-right / Ballot Measure Rights Amendment. Confirm the clerk’s written determination with Pulaski County records.",
    whatItWouldDo:
      "If placed locally, the measure would restructure who represents which seats on city government. Read the local legal summary, not a statewide explainer. Statewide initiative rules do not automatically apply to city filings.",
    organizing:
      "Ward work is block-by-block: church networks, small businesses along commercial corridors, and school-zone parents. A council ordinance to put a similar question on the ballot was discussed in 2025 after an at-large-to-hybrid proposal failed on first attempt.",
    sosStewardship:
      "Even though local filings are not always centralized in the same SOS mailbox as state measures, a modern Secretary of State can still publish a local-election hub, standard templates that match certified titles exactly, and a public log of clerk denials with the reason—so a popular-name typo does not silently kill a neighborhood petition.",
    verify:
      "Pulaski County clerk; Jacksonville city government. Compare the denial reason to the Secretary of State’s July 2026 popular-name letter on the Ballot Measure Rights Amendment. Watch candidate forums in election years.",
    directWebsite: { label: "City of Jacksonville — government & public notices", href: "https://www.cityofjacksonville.net/" },
    externalLinks: [
      { label: "Pulaski County — Circuit/County Clerk (elections & filings)", href: "https://pulaskiclerkar.gov/" },
    ],
  },
  {
    id: "marion-city-election",
    name: "Marion — local election structure (ward vs. at-large)",
    shortLabel: "Marion (failed signatures)",
    category: "Local",
    format: "Local · city or county",
    statusLine: "Same kind of city-election question as Jacksonville. Organizers did not collect enough signatures to put it on the ballot.",
    stamp: { tone: "denied", mark: "FAILED", submark: "NOT ENOUGH SIGNATURES" },
    summary:
      "Residents in Marion (Crittenden County) organized to change city elections from at-large (every voter in the city picks every council seat) to ward-only or hybrid voting—the same representation question as Jacksonville. Public organizing included a 2025 ordinance push (a first-reading pass, then the ordinance died) and a signature effort to let voters decide. That petition did not gather enough signatures to qualify for the local ballot.",
    whatItWouldDo:
      "If it had qualified, Marion voters would have decided whether ward residents alone elect ward council members, instead of the whole city voting on every seat. Read any future local legal summary; this is not a statewide initiative.",
    organizing:
      "Neighborhood and civic volunteers. A Change.org page for the ordinance effort reported more than 150 names in support of a council ordinance that did not survive; the ballot petition is a higher legal bar than an online or ordinance-support list.",
    sosStewardship:
      "A professional office would give city and county clerks the same certified-title templates and deadline calendars statewide, so two cities running the same kind of election-structure petition are not left to invent the paperwork alone.",
    verify:
      "Crittenden County clerk; City of Marion council minutes (2025 ordinance readings). Confirm no certified local measure appears on the county’s November 2026 ballot list.",
    directWebsite: { label: "City of Marion — city council & public notices", href: "https://www.marionar.org/page/city-council" },
    externalLinks: [
      { label: "Crittenden County Clerk", href: "https://www.crittendencountyar.org/copy-of-treasurer" },
    ],
  },
];
