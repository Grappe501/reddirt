/**
 * Public-reporting snapshot of measures Arkansans may see in signature drives for 2026.
 * Not a legal filing. Update as Attorney General opinions and sponsor announcements change.
 */
export type CirculatingInitiative = {
  id: string;
  name: string;
  /** Short list label */
  shortLabel: string;
  category: "Education" | "Direct democracy" | "Environment" | "Governance" | "Tax fairness" | "Local";
  format: "Statewide · constitutional amendment" | "Statewide · initiated act" | "Local · city or county";
  /** As typically reported: certification, collection, or verify */
  statusLine: string;
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
  "This is a campaign education snapshot, not a Secretary of State filing list. Titles, committees, and circulation status can change. Always confirm the certified ballot title with the Attorney General and filing status with the Secretary of State before you sign, donate, or report news.";

export const circulatingInitiatives2026: CirculatingInitiative[] = [
  {
    id: "for-ar-kids-education",
    name: "Arkansas Educational Rights Amendment (For AR Kids and allies)",
    shortLabel: "For AR Kids — educational rights",
    category: "Education",
    format: "Statewide · constitutional amendment",
    statusLine: "Widely reported: ballot title work with the Attorney General; signature drives organized in public view.",
    summary:
      "A coalition of parents, educators, and advocates (often under the “For AR Kids” banner) has advanced education-centered constitutional language aimed at guaranteed access to quality public education, early learning, and student supports—framed as equity for children regardless of zip code.",
    whatItWouldDo:
      "Depending on the exact certified text in effect when you read this, the measure may: lock in pre‑K, after‑school, and summer learning access; protect special education services; and/or align funding and accountability to student needs. Compare every clause to the AG-certified text—sponsor summaries are not the petition.",
    organizing:
      "Look for a designated ballot question committee, treasurer, and public events (town halls, school partners). Teachers’ associations, superintendents, and local PTAs are natural coalition partners. Social channels and email lists are common for training canvassers.",
    sosStewardship:
      "A Secretary of State committed to transparency would: publish timely sample petition images, a plain-language FAQ, county-level progress where signatures have been filed (not just statewide totals), a single lookup for committee name and treasurer, and a clear “how to report irregularities” path that protects signers and volunteers.",
    verify:
      "Arkansas Attorney General opinion search for the current popular name and ballot title; Secretary of State’s elections division for final filing. Local reporting (ADG, Talk Business & Politics, public radio) for ground truth on events.",
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
    statusLine: "Widely reported: part of a multi-year effort to entrench direct democracy in the state constitution.",
    summary:
      "This family of measures seeks to make initiative and referendum rights harder to erode: voters decide at the constitutional level, not only by statute, when the legislature chills the petition process.",
    whatItWouldDo:
      "Would amend Article 5, Section 1 and related language so the people’s right to write law and constitutional change is treated as fundamental—often paired with litigation and organizing against rules that add friction without a voter mandate.",
    organizing:
      "Civic coalitions, good-government groups, and cross-partisan “save the petition” efforts. Signature strategy usually emphasizes county distribution, volunteer lawyers, and rapid-response media when the rules change mid-cycle.",
    sosStewardship:
      "The office should run nonpartisan public dashboards: which committees are active, visible deadline clocks, and rejected lines with reasons (without chilling lawful speech), plus downloadable templates that match the certified text exactly—reducing notary and witness errors that knock out valid signers.",
    verify:
      "AG opinions and sponsor press releases. Compare text against earlier filed versions; sponsors sometimes substitute cleaner language after AG feedback.",
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
    statusLine: "Widely reported: certified title path; aims to protect voter-passed changes from one-sided rewrites.",
    summary:
      "Sometimes labeled “Save Arkansas Democracy” or similar, this line of effort writes detailed initiative rules (deadlines, challenge windows, and restrictions on the legislature amending or repealing what voters pass) into the constitution itself.",
    whatItWouldDo:
      "Typically includes: clearer judicial review for challenges to proposed ballot text, limits on the General Assembly’s ability to nullify a voter-approved amendment, and clearer guardrails for how future legislatures can alter initiative sections—only by referring change back to voters in many designs.",
    organizing:
      "League of Women Voters–style good-government groups, legal clinics, and multi-issue tables that see legislative override as a long-term risk to every other ballot fight.",
    sosStewardship:
      "The Secretary of State should make comparative tables of “current law vs. proposed law” in plain English, and publish filing and litigation milestones in one timeline so a voter can see whether a measure is in circulation, in court, or qualified.",
    verify:
      "AG opinion index by sponsor name. Cross-check dockets if a measure is tied to active Supreme Court review.",
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
    statusLine: "Widely reported: statewide text; NWA and river-country organizers often lead field visibility even when the law is statewide.",
    summary:
      "Would recognize a right to a clean and healthy environment and allow—but not require—the legislature to implement protective statutes. The politics mix upland, Delta, and urban conservation priorities; watershed and agricultural land-use conflicts (including CAFO siting) are part of the lived context even though the text is state-level.",
    whatItWouldDo:
      "Creates constitutional floor language for environmental values while leaving most implementation to statute. Read carefully: “fundamental right” language interacts with private property, permitting, and existing agencies.",
    organizing:
      "Statewide enviro groups, local watershed alliances, and hunters-and-anglers style coalitions. Field operations may concentrate where fundraising and volunteer density are highest (including Northwest Arkansas) without the measure being “only NWA.”",
    sosStewardship:
      "A transparent office maps filing districts to environmental regions for public education, not to pick winners: show where public hearings occurred, if any, and link to the Natural Resources and environmental quality agencies for the regulatory half of the story.",
    verify:
      "AG certification; see also conservation nonprofits’ public statements. Distinguish this statewide amendment from any purely local charter or bond question.",
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
    id: "government-transparency",
    name: "Arkansas Right to Government Transparency",
    shortLabel: "Government transparency (statute)",
    category: "Governance",
    format: "Statewide · initiated act",
    statusLine: "Widely reported: initiated act (lower signature bar than a constitutional amendment).",
    summary:
      "Aims to make transparency a right spelled out in law, with voter approval for future legislative rollbacks of sunshine provisions—relevant to FOIA, open meetings, and how agencies publish data.",
    whatItWouldDo:
      "Statutory initiatives can be amended more easily by a future legislature than constitutional text unless the drafters chain voter approval; read the final section on entrenchment carefully.",
    organizing:
      "Press associations, open-government nonprofits, and cross-partisan reformers. Often pairs with local journalists for verification stories.",
    sosStewardship:
      "The office already touches business filings and election transparency—this measure heightens the expectation for searchable bulk data and clear appeals when a record request stalls. A Secretary of State can model the standard even before a vote: publish FOIA response SLAs, forms, and training for clerks.",
    verify:
      "AG text; follow ethics and journalism nonprofits tracking amendments to FOIA in the same cycle.",
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
    format: "Statewide · initiated act",
    statusLine: "Widely reported: debate over one standard for all schools that take public dollars.",
    summary:
      "Would require schools that receive public funds to meet identical accreditation and assessment expectations—an intense finance-and-governance argument about parity between sectors.",
    whatItWouldDo:
      "If adopted, the fight shifts to rulemaking: who sets assessments, who pays for compliance, and how private or home-school routes interact with new expectations.",
    organizing:
      "Different coalition than pure “funding” amendments; includes accountability hawks, district boards, and sometimes labor. Expect heavy legal and fiscal scoring.",
    sosStewardship:
      "The Secretary of State’s consumer-facing job is to ensure fiscal impact statements and educator summaries (where provided) are linked next to the title so voters are not reading spin without numbers.",
    verify:
      "AG summary + fiscal note processes if a fiscal impact is filed. Compare to the For AR Kids line to avoid conflating two different education questions.",
    directWebsite: {
      label: "For AR Kids — public hub (allied to this line of filings; confirm latest AG title)",
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
    statusLine: "Widely reported: pocketbook issue with clear retail and family framing.",
    summary:
      "A tax-relief push that treats diapers and feminine hygiene as necessities, not luxuries, by exempting them from the state sales and use tax. Strong retail and faith-community volunteer bases when organized well.",
    whatItWouldDo:
      "Revenue trade-offs are part of the public debate: where the state backfills, if it does, and how local taxes interact.",
    organizing:
      "Big-box and pharmacy allies, family policy groups, and sometimes bipartisan urban-suburban teams.",
    sosStewardship:
      "A transparent office publishes a fiscal impact analysis in plain language and ensures implementation guidance reaches the Department of Finance and Administration and retailers before effective dates, so the benefit hits receipts correctly.",
    verify:
      "AG title; DFA statements if referenced in the fiscal debate; compare to any parallel legislative tax bills in the same session.",
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
    shortLabel: "Jacksonville (local · verify)",
    category: "Local",
    format: "Local · city or county",
    statusLine:
      "Hyper-local — not a state petition. Verify with the Pulaski County clerk and Jacksonville city records.",
    summary:
      "Conversations in Pulaski County have included whether Jacksonville should move from at-large to ward-based representation (or other structural reforms) to align council seats with neighborhood voice. The exact ballot question and year depend on city charter, council votes, and local filing—do not map state initiative rules here.",
    whatItWouldDo:
      "If placed locally, the measure would restructure who represents which seats on city government—zoning, police, and schools in the area follow from those votes. Read the local legal summary, not a statewide explainer.",
    organizing:
      "Ward work is block-by-block: church networks, small businesses along commercial corridors, and school zone parents. Statewide campaigns can signal solidarity, but the signatures and law are different.",
    sosStewardship:
      "Even though local filings are not always centralized in the same SOS mailbox as state measures, a modern Secretary of State can still publish a local-election hub that points citizens to the county clerk, city recorder, and county board of election commissioners, and standardizes public notice and filing deadlines in one calendar feed.",
    verify:
      "Pulaski County clerk; Jacksonville city government; county party chairs for ward maps and sample ballots. Watch candidate forums in election years.",
    directWebsite: { label: "City of Jacksonville — government & public notices", href: "https://www.cityofjacksonville.net/" },
    externalLinks: [
      { label: "Pulaski County — Circuit/County Clerk (elections & filings)", href: "https://pulaskiclerkar.gov/" },
    ],
  },
];
