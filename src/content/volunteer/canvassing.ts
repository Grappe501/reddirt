/**
 * Canvassing training hub — clipboard issues, Kelly stances, and field scripts.
 * Issues match Sela Moser's standard clipboard sheet (Aug 2026).
 */

export type CanvassingIssueSlug =
  | "environment"
  | "education"
  | "jobs"
  | "economy"
  | "healthcare";

export type CanvassingIssue = {
  slug: CanvassingIssueSlug;
  number: number;
  label: string;
  clipboardLabel: string;
  /** One–two sentences for doors — honest about SOS office limits. */
  kellyStance: string;
  /** Short opener after they pick this issue */
  doorBridge: string;
  /** Deeper bullets for training drill-down */
  talkPoints: readonly string[];
  /** Honest scope note for volunteers */
  officeScope: string;
  planHref?: string;
};

export const CANVASSING_LEAD_TRAINER = {
  name: "Sela Moser",
  role: "Lead canvassing trainer",
  note: "Sela developed our standard clipboard sheet and trains neighbors on listening-first door conversations.",
} as const;

export const CANVASSING_CLIPBOARD = {
  question: "Which of these issues is most important to your family?",
  footer: "Thank you for helping us to know what you need most from our representatives!",
  downloadFilename: "kelly-grappe-canvassing-clipboard-sheet",
} as const;

export const CANVASSING_ISSUES: readonly CanvassingIssue[] = [
  {
    slug: "environment",
    number: 1,
    label: "The Environment",
    clipboardLabel: "The Environment",
    kellyStance:
      "Kelly believes Arkansas families deserve clean air, water, and land they can trust — and leaders who listen when those basics are at risk. As Secretary of State she won't write environmental law, but she will run a transparent office and defend every Arkansan's right to participate in the decisions that affect their community.",
    doorBridge:
      "I hear that a lot on the trail. Kelly's running for Secretary of State — elections, business services, and making government understandable — so your voice actually counts when bigger policy gets decided.",
    talkPoints: [
      "Listen first. Ask what environmental concern hits home — water, land, flooding, rural wells, etc.",
      "Don't promise SOS can fix pollution rules. Do connect Kelly's transparency and civic-engagement plans.",
      "Election integrity matters here too: people need to trust that leaders who set environmental policy were chosen fairly.",
      "If they want depth, point to My Plan → transparency and engaged Arkansas (/priorities).",
    ],
    officeScope:
      "Environmental regulation belongs to other state and federal agencies. Kelly's SOS role is trustworthy elections, transparent records, and civic education — so communities can hold decision-makers accountable.",
    planHref: "/priorities#transparency",
  },
  {
    slug: "education",
    number: 2,
    label: "Education",
    clipboardLabel: "Education",
    kellyStance:
      "Kelly wants practical civic education in every county — how to register, vote, and use direct democracy — not partisan lectures. She spent her career making complex information usable and will bring that to schools, libraries, and youth programs statewide.",
    doorBridge:
      "Education comes up everywhere — schools, kids, colleges. Kelly's plan is to help Arkansans understand how to participate: registration, voting, initiatives — real tools counties can use.",
    talkPoints: [
      "Separate K-12 school funding (legislature) from SOS civic education (Kelly's lane).",
      "Highlight youth engagement and nonpartisan 'how to participate' resources in My Plan.",
      "Offer voter-registration help or campus/event invites when appropriate.",
      "Never tell someone how to vote — teach how the system works.",
    ],
    officeScope:
      "School curriculum and funding are not the Secretary of State's job. Kelly will provide optional voter-education materials for counties and invest in civic learning for young Arkansans.",
    planHref: "/priorities#engagement",
  },
  {
    slug: "jobs",
    number: 3,
    label: "Jobs",
    clipboardLabel: "Jobs",
    kellyStance:
      "Kelly has run a small business and knows paperwork can steal hours from a workday. She will modernize Secretary of State business services so entrepreneurs, farmers, and shop owners can file clearly and quickly — without becoming experts in state government.",
    doorBridge:
      "Jobs and hours matter. A big piece of Kelly's plan is fixing how Arkansas handles business filings — the Secretary of State's office is where a lot of that paperwork actually happens.",
    talkPoints: [
      "Ask whether they own a business, farm, or side gig — many SOS interactions start there.",
      "Kelly's business-services priority: clearer website, fewer duplicate steps, measured turnaround times.",
      "Connect rural jobs to county support — all 75 counties need state tools that work locally.",
      "No unsourced claims about unemployment rates or opponents.",
    ],
    officeScope:
      "Job creation policy is broader than SOS. Kelly's direct lane is Business Services — registrations, filings, and records that every employer touches.",
    planHref: "/priorities#business",
  },
  {
    slug: "economy",
    number: 4,
    label: "The Economy",
    clipboardLabel: "The Economy",
    kellyStance:
      "Strong local economies need government that works — especially in rural counties. Kelly will support all 75 counties with election tools, business services, and transparency so Main Street isn't waiting on Little Rock to answer the phone.",
    doorBridge:
      "When the economy is the worry, Kelly focuses on making state services actually work — elections people trust, business filings that don't waste your day, and an office that shows up outside Pulaski County.",
    talkPoints: [
      "Inflation and wages are kitchen-table issues — validate the concern before pivoting to SOS scope.",
      "Tie 'economy' to practical state services: business filings, accessible election info, county partnership.",
      "Transparency portal and performance dashboard = accountability for how the office spends time and money.",
      "Invite small-business owners to share filing horror stories (listen; don't promise overnight fixes).",
    ],
    officeScope:
      "Kelly won't set tax or budget policy from the Secretary of State's office. She will measure and improve the services Arkansas businesses and counties rely on daily.",
    planHref: "/priorities#counties",
  },
  {
    slug: "healthcare",
    number: 5,
    label: "Healthcare",
    clipboardLabel: "Healthcare",
    kellyStance:
      "Kelly hears every day how access and cost strain Arkansas families. Healthcare policy belongs to the legislature and other offices — Kelly's job as Secretary of State is trustworthy elections, clear registration, and defending your constitutional voice so you can choose the leaders who set health policy.",
    doorBridge:
      "Healthcare is personal — listen first. Kelly's running for Secretary of State, so her lane is making sure elections and voter participation work, and that ballot initiatives aren't buried in gotcha rules.",
    talkPoints: [
      "Do not promise SOS will fix Medicaid, hospitals, or premiums.",
      "Connect fair elections + initiative process to people's ability to push for change they want.",
      "Offer voter-registration check or absentee/early-vote info when relevant.",
      "Stay humane — many doors carry private health stories. Thank them for sharing.",
    ],
    officeScope:
      "Healthcare delivery and insurance rules are outside SOS. Kelly will administer elections and direct democracy fairly so Arkansans can elect and petition for the policies they need.",
    planHref: "/priorities#peoples-voice",
  },
] as const;

export function getCanvassingIssue(slug: string): CanvassingIssue | undefined {
  return CANVASSING_ISSUES.find((i) => i.slug === slug);
}

export const CANVASSING_DOOR_SCRIPT = {
  intro:
    "Hi — I'm [your name], a volunteer with Kelly Grappe for Arkansas Secretary of State. We're listening to neighbors about what matters most this year. Do you have one minute?",
  clipboard:
    "We're using a simple clipboard question — which of these issues is most important to your family? Your answer helps us listen, not lecture.",
  listen:
    "Let them talk. Repeat back what you heard. You are not here to win an argument.",
  close:
    "Thank you for your time. If you'd like to check your registration or learn about volunteering, I can point you to kellygrappe.com — no pressure either way.",
} as const;

export const CANVASSING_FIELD_RULES = [
  "Pair up when you can. Never enter a home unless invited.",
  "No debate, no opponent attacks, no unsourced claims.",
  "Mark the clipboard issue they choose — you don't need their name for the tally sheet.",
  "If someone is upset, stay calm, thank them, and move on.",
  "Route serious volunteer interest to /get-involved — don't collect sensitive data on the sheet.",
] as const;

export const CANVASSING_TRAINING_STEPS = [
  {
    title: "Before you knock",
    body: "Read Kelly's one–two sentence stance for each issue. Print the clipboard sheet. Charge your phone. Know your turf captain's number.",
  },
  {
    title: "At the door",
    body: "Introduce yourself, ask the clipboard question, listen, share Kelly's stance only if they want to hear it, offer a next step (registration check, volunteer, event).",
  },
  {
    title: "After the turf",
    body: "Turn in tallies to your captain. Debrief with your team — what did you hear? Note repeated themes for HQ.",
  },
] as const;

/** Placeholder until dates are scheduled with Sela. */
export const CANVASSING_TRAINING_SCHEDULE = {
  heading: "Training schedule",
  intro:
    "Live canvassing trainings with Sela Moser will be posted here as dates are set. Check back — or ask your county captain to request a session.",
  events: [] as readonly { dateLabel: string; title: string; location: string; href?: string }[],
} as const;
