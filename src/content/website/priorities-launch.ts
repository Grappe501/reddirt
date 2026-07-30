/**
 * Office priorities — launch pass.
 * Distinguishes campaign goals from legal authority of the Secretary of State.
 * Built from Government That Works substance + office explainers (no invented platform planks).
 */

export const prioritiesLaunchCopy = {
  hero: {
    eyebrow: "Priorities",
    title: "What this office should deliver for Arkansas",
    subtitle:
      "Elections support, business filings, public records, and Capitol stewardship—what Kelly intends to improve inside that authority, and what the office cannot do alone.",
  },
  authorityNote:
    "Goals describe leadership within legal duties. They do not claim powers the Secretary of State does not have—writing tax law, running every county election board unilaterally, or replacing the legislature.",
  pillars: [
    {
      id: "elections",
      title: "Secure, accessible elections",
      issue:
        "Voters and county clerks need clear rules, consistent guidance, and confidence that Election Day is administered under Arkansas law—not partisan theater.",
      whyCare:
        "Your ballot, your registration path, and your county’s election board all depend on a partner in Little Rock who explains the process plainly and supports all 75 counties equally.",
      officeRole:
        "The Secretary of State supports election administration, voter registration systems, and guidance for county clerks within state law. Counties still run Election Day operations locally.",
      position:
        "Kelly believes elections should be free, fair, transparent, and accessible—with the same rules explained evenly and clerks treated as partners, not afterthoughts.",
      wouldDo: [
        "Consistent training and guidance support for all 75 county clerks",
        "Clearer public reporting so results and process are easier to follow",
        "Registration and participation tools that reduce unnecessary friction",
        "Administration faithful to Arkansas law—not national political noise",
      ],
      limits:
        "The Secretary of State does not write election statutes alone, does not replace county election commissions, and does not decide partisan outcomes. Reform that requires legislation stays a legislative matter.",
      relatedOfficeHref: "/office/elections",
      relatedOfficeLabel: "Elections & the office",
      nextAction: { href: "/voter-registration", label: "Check Your Voter Registration" },
    },
    {
      id: "business",
      title: "Business and nonprofit filings that work",
      issue:
        "Owners, treasurers, and volunteer boards should not fight the filing system to stay legal. Dead ends and unclear instructions cost Main Street time and money.",
      whyCare:
        "When filings are unpredictable, small businesses and nonprofits pay twice—once in fees and again in lost hours.",
      officeRole:
        "The Secretary of State administers many business and commercial filings and related customer-facing systems. The office can modernize service quality within existing law; it does not set tax rates or rewrite every commercial code.",
      position:
        "Kelly wants a front office that is an ally in reducing drag: predictable timelines, plain language, and real help when a filing stalls.",
      wouldDo: [
        "Easier online filing with fewer dead ends",
        "Customer service that answers when filings stall",
        "Systems that support small businesses and nonprofits alike",
        "Clearer process maps so filers are not guessing between desks",
      ],
      limits:
        "The office cannot invent new corporate tax policy or eliminate every statutory requirement. Competence means administering required filings well—not pretending the counter can rewrite the General Assembly.",
      relatedOfficeHref: "/office/business",
      relatedOfficeLabel: "Business & filings",
      nextAction: { href: "/office/business", label: "Explore business services" },
    },
    {
      id: "transparency",
      title: "Transparent records and digital access",
      issue:
        "Public information should be findable without a specialist. When people cannot locate records or understand filings, accountability becomes a slogan.",
      whyCare:
        "Open records and clear online access are how neighbors check their government without hiring an intermediary.",
      officeRole:
        "Within its duties, the Secretary of State holds and publishes certain public records and operates digital systems that surface filings and related information. Broader FOIA disputes and agency records outside this office remain elsewhere.",
      position:
        "Kelly believes access should be open and the path clear—plain steps, real guidance, and accountability inside what this office actually controls.",
      wouldDo: [
        "Clearer paths to records the office already holds",
        "Better online access and search for public filings",
        "Efficient operations that respect taxpayers’ time",
        "Honest communication about what is—and is not—available here",
      ],
      limits:
        "The Secretary of State is not the FOIA desk for every Arkansas agency. Claims about “opening all of government” overstate the office.",
      relatedOfficeHref: "/office/records",
      relatedOfficeLabel: "Public records",
      nextAction: { href: "/office/records", label: "Explore public records" },
    },
    {
      id: "capitol",
      title: "Capitol stewardship and civic welcome",
      issue:
        "The people’s house should feel professionally managed—safe, respectful, and focused on service rather than fear politics.",
      whyCare:
        "Arkansans visit the Capitol for civic education, business, and democracy. The tone of that space matters.",
      officeRole:
        "The Secretary of State has stewardship responsibilities for the Capitol Complex and related public operations, alongside partners such as Capitol Police. Day-to-day legislative control remains with the General Assembly.",
      position:
        "Kelly supports professional stewardship, civic education, and a culture of service that puts Arkansas first.",
      wouldDo: [
        "Professional stewardship of the Capitol Complex",
        "Support for operational standards and public safety partners",
        "Civic education that helps Arkansans understand their government",
        "A welcome that treats visitors as owners of the people’s house",
      ],
      limits:
        "Capitol stewardship is not a license to run state politics from the marble halls. The office administers facilities and related duties; it does not control the legislature.",
      relatedOfficeHref: "/office/capitol",
      relatedOfficeLabel: "Capitol stewardship",
      nextAction: { href: "/understand", label: "Understand the office" },
    },
  ],
  closing: {
    title: "See the office in practice",
    body: "For neutral explainers of what the office does today, open the office guides. For qualifications and trail evidence, return to Meet Kelly.",
    ctas: [
      { href: "/understand", label: "Understand the office" },
      { href: "/about", label: "Read About Kelly’s Experience" },
      { href: "/get-involved", label: "Join the Campaign" },
    ],
  },
} as const;
