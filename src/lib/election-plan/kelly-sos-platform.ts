/** Kelly Grappe Secretary of State platform — built from Big Table Democrat Doctrine + SOS strategic manual. */

export type PlatformPlank = {
  slug: string;
  title: string;
  tagline: string;
  doctrineAnchor: string;
  summary: string;
  problem: string;
  approach: string[];
  first100Days: Array<{ action: string; detail: string }>;
  tenureLegacy: string[];
  deepDive: Array<{ heading: string; body: string }>;
};

export const KELLY_SOS_PLATFORM = {
  title: "Kelly Grappe Secretary of State Platform",
  subtitle: "From Big Table Democrat Doctrine to a service office Arkansans can trust",
  intro:
    "Kelly’s campaign is not a national-party audition. It is a working-class, Arkansas-first plan to run the Secretary of State’s office with competence, transparency, and respect for all 75 counties. The Big Table Democrat Doctrine is the governing philosophy; the planks below are what Kelly will do with the office if Arkansans elect her.",
  doctrineHref: "/election-plan/big-table-doctrine",
  objectivesOnWin: [
    {
      title: "Restore trust in how Arkansas runs elections",
      detail:
        "County clerks supported, processes explained in plain language, and problems routed through clear channels — not culture-war noise.",
    },
    {
      title: "Make participation normal again",
      detail:
        "Registration education, youth civic pipelines, poll worker respect, and community-hosted democracy literacy — especially in rural counties.",
    },
    {
      title: "Run the office like a service desk, not a fortress",
      detail:
        "Business filings, public records, and Capitol access that work for small towns and small businesses — not just Little Rock insiders.",
    },
    {
      title: "Prove the Big Table is real in how government shows up",
      detail:
        "Faith communities, working-class voters, independents, and conservative Democrats see an SOS who listens before she lectures.",
    },
  ],
  first100Days: {
    headline: "First 100 days — what Kelly tackles immediately",
    intro:
      "The first quarter sets culture, rebuilds county relationships, and ships visible wins without overpromising what requires the legislature or long procurement cycles.",
    phases: [
      {
        days: "Days 1–30",
        theme: "Listen, stabilize, publish baseline",
        items: [
          "Complete transition with county clerks and election commissioners — no surprises on day one",
          "Publish a plain-language ‘how Arkansas elections work’ hub and SOS transparency baseline",
          "Launch election integrity listening tour report with county-specific follow-ups",
          "Audit business-services backlogs and public-records response times by category",
          "Set internal rule: proactive publishing beats FOIA backlog wherever lawful",
        ],
      },
      {
        days: "Days 31–60",
        theme: "Support counties · pilot civic infrastructure",
        items: [
          "Pilot county clerk communication toolkit (templates, social, voter-education graphics — voluntary adoption)",
          "Announce 75-county support plan: training cadence, help desk, rural travel office hours",
          "Stand up Arkansas Civic Participation Initiative framework (partnerships, guardrails, pilot hosts)",
          "Quick-win business filing UX improvements and rural phone-support blocks",
          "Election worker recruitment campaign with schools, colleges, and community partners",
        ],
      },
      {
        days: "Days 61–100",
        theme: "Scale what works · publish the plan",
        items: [
          "Expand clerk toolkit based on pilot feedback; no county left guessing before major elections",
          "Publish first 100-day report: what changed, what’s next, what needs legislative partners",
          "Launch Future Voters / civic challenge pilots in willing counties and campuses (opt-in only)",
          "Meeting-records and public-records portal phase 1 — searchable, dated, plain labels",
          "Present full-term platform scorecard to legislature and county associations — accountability in public",
        ],
      },
    ],
  },
  tenureLegacy: {
    headline: "What voters should look back on after Kelly’s tenure",
    intro:
      "Success is not a headline on one election night. It is whether ordinary Arkansans believe the office works for them years later.",
    milestones: [
      {
        title: "Elections feel explainable",
        body: "Families, clerks, and poll workers can describe how votes are cast, counted, and secured — because the SOS office taught them, not because they had to guess.",
      },
      {
        title: "Every county got a fair shot at support",
        body: "Rural clerks stopped feeling like afterthoughts. Training, templates, and help arrived before crises — not after cable news calls.",
      },
      {
        title: "A generation learned citizenship as skill",
        body: "Youth civic pipelines, poll worker pathways, and library/campus partnerships outlasted one cycle — Arkansas history as anchor, not national Twitter fights.",
      },
      {
        title: "Business and records just work",
        body: "Small business owners spend less time confused by filings; journalists and citizens find public records without a scavenger hunt.",
      },
      {
        title: "The Big Table stayed big",
        body: "The office modeled dignity across difference — room for conservative, rural, Christian, and working-class Arkansans in how democracy was practiced, not just how it was preached.",
      },
    ],
  },
  planks: [
    {
      slug: "honest-elections",
      title: "Honest Elections & Integrity You Can See",
      tagline: "Competence and transparency — not chaos theater",
      doctrineAnchor: "Only American citizens vote · corporations held accountable · politics that fits Arkansas",
      summary:
        "Kelly will run election administration with calm competence, support county clerks, and explain processes so Arkansans can trust outcomes without partisan hype.",
      problem:
        "Too many Arkansans hear about elections through fear and national noise instead of how their own county actually works. Clerks need backup, not blame.",
      approach: [
        "Election integrity listening tour becomes standing county feedback — not a one-time campaign stunt",
        "Plain-language explainers: registration, absentee rules, canvassing, tabulation, audits — what SOS can and cannot do",
        "De-escalation as default: route problems through official channels; no performative crisis",
        "Support for lawful post-election reviews without undermining county professionals",
      ],
      first100Days: [
        { action: "Publish election process hub", detail: "Single trusted URL for how Arkansas runs elections" },
        { action: "County clerk listening report", detail: "Public summary + private follow-up queue by county" },
        { action: "Hotline and FAQ refresh", detail: "Citizen questions answered in plain English within SLA targets" },
      ],
      tenureLegacy: [
        "Arkansas cited as a state where election officials were supported, not sacrificed to headlines",
        "County clerks name SOS as partner in training and communication — not distant critic",
      ],
      deepDive: [
        {
          heading: "Contrast with status quo",
          body: "Kelly’s opponent has emphasized rankings and enforcement rhetoric. Kelly’s model is service: make the system understandable, fix what’s fixable inside SOS authority, and respect county election professionals.",
        },
        {
          heading: "Security without scare tactics",
          body: "Chain-of-custody education for civic groups and clerks — open houses where law and security allow; no reckless exposure of sensitive systems.",
        },
      ],
    },
    {
      slug: "county-clerk-partnership",
      title: "County Clerk Partnership",
      tagline: "75 counties · one standard of respect",
      doctrineAnchor: "Nonpartisan local offices serve people first",
      summary:
        "The SOS office will treat county clerks and election commissions as partners — with communication kits, training cadence, and rural equity baked in from day one.",
      problem:
        "Clerks run elections on thin budgets. They get national pressure and local blame while waiting for state support that arrives late or in legalese.",
      approach: [
        "Voluntary communication toolkit: social templates, voter-education graphics, FAQ sheets — Regnat Populus civic framing, not campaign branding",
        "Regional training blocks and virtual make-up sessions so small counties aren’t penalized for distance",
        "Dedicated help desk with escalation paths before peak election windows",
        "Annual clerk conference working sessions co-designed with ACCA voices",
      ],
      first100Days: [
        { action: "Toolkit pilot (3–5 counties)", detail: "Iterate with clerks before statewide offer" },
        { action: "75-county support matrix published", detail: "Who to call, what SOS provides, timelines" },
        { action: "Rural office hours calendar", detail: "SOS staff travels to counties that rarely see state officials" },
      ],
      tenureLegacy: [
        "Clerks report shorter time-to-answer on SOS questions",
        "Uniform voter-education quality rises without one-size-fits-all mandates",
      ],
      deepDive: [
        {
          heading: "Communication kits counties can use",
          body: "Template families for registration deadlines, poll worker thanks, early voting hours, and process reminders — legal-reviewed, county-customizable, nonpartisan.",
        },
      ],
    },
    {
      slug: "civic-participation",
      title: "Arkansas Civic Participation Initiative",
      tagline: "The SOS office builds culture — not just processes ballots",
      doctrineAnchor: "Strong communities · public education as foundation · build a bigger table",
      summary:
        "Turn the Secretary of State’s public education role into statewide civic infrastructure: campuses, libraries, schools, churches, and community hosts — opt-in, nonpartisan, Arkansas-rooted.",
      problem:
        "Civic life thinned out in many counties. Young Arkansans learn politics as national combat instead of local skill. Election workers age out without pipelines.",
      approach: [
        "Arkansas Civic Challenge — voluntary recognition for campuses, trade schools, high schools, and community orgs",
        "Future Voters Arkansas — first-time voter education and poll worker pathways",
        "County Civic Cup — county-based civic learning and service recognition",
        "History layer: Regnat Populus, state archives, civil-rights and rural service stories — skills, not slogans",
      ],
      first100Days: [
        { action: "Initiative charter + guardrails", detail: "Nonpartisan, privacy-aware, no curriculum mandates" },
        { action: "Pilot hosts in 5 counties", detail: "Libraries, campuses, or community centers opt in" },
        { action: "Poll worker recruitment push", detail: "Partner with schools and colleges for paid service pathways" },
      ],
      tenureLegacy: [
        "Measurable growth in poll worker and civic volunteer pipelines",
        "Arkansas known for youth civic education that feels local — not imported",
      ],
      deepDive: [
        {
          heading: "Program models (working names)",
          body: "Arkansas Civic Challenge · County Civic Cup · Future Voters Arkansas · Student Poll Worker Pipeline · Rural Civic Ambassador Program · Arkansas Civic Leadership Fellows.",
        },
        {
          heading: "Guardrails",
          body: "Voluntary only. No public rankings without locked methodology. Recognition for civic steps, not partisan outcomes. SOS does not control school curriculum.",
        },
      ],
    },
    {
      slug: "transparency-records",
      title: "Transparency & Public Records",
      tagline: "Publish first · answer second",
      doctrineAnchor: "Honest government · politics that fits Arkansas",
      summary:
        "Proactive publishing, searchable meeting records, and FOIA processes that respect citizens and journalists — reducing scavenger hunts for basic facts.",
      problem:
        "Public trust erodes when basic records feel hidden behind forms, delays, and jargon. Transparency should be the default setting of a people’s office.",
      approach: [
        "Meeting records in one searchable place with plain titles and dates",
        "FOIA reduction through routine proactive disclosure where lawful",
        "Plain-language guides: what SOS holds, how to request, expected timelines",
        "Capitol and archives access improvements for educators and civic groups",
      ],
      first100Days: [
        { action: "Transparency baseline audit", detail: "What we publish vs what we only release on request" },
        { action: "Records portal phase 1", detail: "High-demand categories live and dated" },
        { action: "FOIA response time targets published", detail: "Internal accountability metrics visible to leadership" },
      ],
      tenureLegacy: [
        "Journalists and citizens describe SOS as easier to work with — not perfect, but predictable",
        "Fewer ‘gotcha’ moments because basics were already public",
      ],
      deepDive: [
        {
          heading: "Direct democracy defense (structural)",
          body: "Kelly supports building referendum readiness and coalition transparency work — ballot access and dark-money education as civic defense, detailed in platform civic pillar and legal review before public commitments.",
        },
      ],
    },
    {
      slug: "business-services",
      title: "Business Services That Work",
      tagline: "Small business dignity · rural access",
      doctrineAnchor: "Working-class politics · fiscal responsibility · local jobs",
      summary:
        "Modernize filings, cut confusion, and staff for phone and rural support — the SOS office should help employers and nonprofits navigate requirements without insider knowledge.",
      problem:
        "Entrepreneurs lose hours to unclear forms and dead-end phone trees. Rural Arkansas shouldn’t need a lawyer to register a LLC.",
      approach: [
        "UX pass on highest-volume filing paths with plain-language error messages",
        "Expanded phone support blocks aligned to rural business hours",
        "Partner with Extension-style and small-business networks for education — not mandates",
        "Metrics published: wait times, completion rates, top confusion points",
      ],
      first100Days: [
        { action: "Backlog and pain-point audit", detail: "Clerk-facing and customer-facing queues separated" },
        { action: "Top-three filing fixes shipped", detail: "Quick wins before large procurement" },
        { action: "Small business listening sessions", detail: "Five regions — feedback into 12-month roadmap" },
      ],
      tenureLegacy: [
        "Business owners report less time lost to state paperwork",
        "SOS seen as economic ally for small towns — not distant regulator",
      ],
      deepDive: [
        {
          heading: "Scope honesty",
          body: "SOS does not set tax or labor policy. Kelly’s business pillar is execution: filings, registrations, and tools — done competently and respectfully.",
        },
      ],
    },
    {
      slug: "all-75-counties",
      title: "All 75 Counties Count",
      tagline: "VCI-informed equity · show up before you ask for trust",
      doctrineAnchor: "Strong communities statewide · rural Democrats and independents at the table",
      summary:
        "Resource plans follow Victory Contribution Index and relationship reality — but every county gets dignity, training access, and SOS presence, not just the top ten on a spreadsheet.",
      problem:
        "Rural Arkansans too often hear from state government only at election time or during a crisis. Apathy follows absence.",
      approach: [
        "Use VCI to prioritize scarce travel — never to zero-out small counties",
        "Minimum annual SOS presence standard across regions",
        "County-specific civic and clerk support — not one Little Rock template",
        "Integrate county workbench and field intelligence into office planning",
      ],
      first100Days: [
        { action: "Publish 75-county visit and support calendar", detail: "Clerks see SOS coming before they have to ask" },
        { action: "Regional liaison roles defined", detail: "Named contacts for NE, NW, River Valley, delta, etc." },
        { action: "Rural feedback loop standing", detail: "Quarterly public notes from listening sessions" },
      ],
      tenureLegacy: [
        "No county can say the SOS never showed up",
        "Field metrics show balanced attention — not only Pulaski–NWA corridor",
      ],
      deepDive: [
        {
          heading: "How VCI fits governance",
          body: "VCI prioritizes campaign and office travel — it does not rank human worth. Kelly’s pledge: high-VCI counties get intensity; low-VCI counties still get respect, tools, and scheduled presence.",
        },
      ],
    },
    {
      slug: "nonpartisan-local-government",
      title: "Nonpartisan Local Government",
      tagline: "Serve people first — not party brands",
      doctrineAnchor: "SOS and county/local offices should be nonpartisan",
      summary:
        "Kelly will advocate for nonpartisan election administration and support moving county-level offices — clerks, sheriffs, judges, school boards — toward service-first, not party-first, framing where law allows.",
      problem:
        "Local offices became national team jerseys. Clerks and school boards get pulled into fights that have nothing to do with serving neighbors.",
      approach: [
        "Model nonpartisan service in SOS hiring, communication, and civic education",
        "Legislative and county-association conversations on nonpartisan local election offices",
        "Train SOS staff and partners to de-partisanize voter-facing language",
        "Support clerks who want neutral, professional public communication",
      ],
      first100Days: [
        { action: "Internal nonpartisan communication standards", detail: "Review all public SOS templates" },
        { action: "County chair roundtable on service culture", detail: "Listen across parties and independents" },
        { action: "Draft white paper for legislature", detail: "Options for nonpartisan local election administration" },
      ],
      tenureLegacy: [
        "SOS office referenced as neutral referee — not party weapon",
        "Policy debate opened on local nonpartisan structures with county input",
      ],
      deepDive: [
        {
          heading: "What Kelly can do vs what requires law change",
          body: "SOS can model behavior and lead civic conversation. Structural nonpartisan shifts require statute — Kelly will not pretend otherwise.",
        },
      ],
    },
    {
      slug: "big-table-democracy",
      title: "Big Table Democracy in Practice",
      tagline: "Room for conservative, rural, Christian, and working-class Arkansans",
      doctrineAnchor: "Build a bigger table · dignity for all · come back to the table",
      summary:
        "Kelly’s governing style matches the doctrine: faith outreach without culture-war bait, Lane 4 listening with Republicans and independents, and coalition events that prove the table is real.",
      problem:
        "Many Arkansans left civic life because they were told they didn’t belong in ‘the party’ or ‘the movement.’ Democracy shrank.",
      approach: [
        "Faith and community listening sessions — dignity first, not debate traps",
        "Surrogate and validator network led by local trusted voices",
        "Coalition programming: Sherwood-style big-tent events scaled to counties",
        "Message discipline: Arkansas everyday life over national Twitter warfare",
      ],
      first100Days: [
        { action: "Community listening calendar (standing)", detail: "Rotating hosts — churches, unions, libraries, fairs" },
        { action: "Validator advisory circle", detail: "County leaders help shape SOS public education tone" },
        { action: "Publish Big Table operating principles for staff", detail: "How SOS shows up in divided rooms" },
      ],
      tenureLegacy: [
        "Arkansans who didn’t vote Democrat for years still cite SOS outreach as respectful",
        "Civic events feel like Arkansas gatherings — not imported national rallies",
      ],
      deepDive: [
        {
          heading: "Room at the table",
          body: "Working-class, rural, Christian, pro-life, conservative, union, civil-rights, and small-business Democrats — plus independents who want honest government — all have a seat in how Kelly runs the office and how she asks Arkansans to participate.",
        },
      ],
    },
  ] satisfies PlatformPlank[],
} as const;

const plankBySlug = new Map(KELLY_SOS_PLATFORM.planks.map((p) => [p.slug, p]));

export function getPlatformPlank(slug: string): PlatformPlank | undefined {
  return plankBySlug.get(slug);
}

export function platformPlankHref(slug: string): string {
  return `/election-plan/platform/${slug}`;
}

export function platformHubHref(): string {
  return "/election-plan/platform";
}
