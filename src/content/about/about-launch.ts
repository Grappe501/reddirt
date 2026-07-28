/**
 * Launch Meet Kelly — qualification-centered page (not memoir).
 * Verified campaign-facing facts only. Deep chapters remain optional links.
 * @see docs/website/PUBLIC_MESSAGE_PRECISION_AUDIT.md
 */

export const aboutLaunchCopy = {
  hero: {
    eyebrow: "Meet Kelly Grappe",
    title: "Meet Kelly Grappe",
    subtitle:
      "Candidate for Arkansas Secretary of State — relevant experience, how she leads, and why she seeks this office.",
  },
  opening: {
    title: "Meet Kelly Grappe",
    /** Target: 100–140 words */
    body: [
      "Kelly Grappe is running for Arkansas Secretary of State. She is a community organizer and operations leader who has spent years helping neighbors understand elections and ballot access—including grassroots petition work after the LEARNS Act—and nearly twenty-five years leading teams in telecom operations where training, process, and customer impact could not fail.",
      "She and her husband Steve built a life around Rose Bud and Forevermost Farms, including small-market and farm work where permits and paperwork are daily reality. She is asking voters to judge her by visible service, clear limits on what this office can do, and a record of showing up—not by a full life history.",
    ],
  },
  experience: {
    title: "Experience That Prepared Her to Serve",
    intro:
      "Relevant preparation only—leadership, organizing, administration, and listening across differences. Optional chapters add depth; they are not required to understand her qualifications for this constitutional office.",
    items: [
      {
        title: "Operations leadership",
        body: "Nearly 25 years with Alltel and Verizon in operations leadership: training rooms, team leadership, and process discipline when customer-impacting services could not fail. That habit—clarity, training, and protecting the person in front of you when rules are confusing—transfers directly to public-facing state systems voters and filers use every day.",
        links: [{ href: "/about/business", label: "Business & career" }],
      },
      {
        title: "Community and civic organizing",
        body: "Through Stand Up Arkansas and grassroots petition work after LEARNS, Kelly and neighbors organized around voter education and ballot access—including field support for petition packets and notaries. She treats democracy as a skill neighbors can practice when the official process is intelligible, and she teaches what the Secretary of State’s office actually controls versus what it does not.",
        links: [
          { href: "/about/community", label: "Community & civic work" },
          { href: "/direct-democracy", label: "Direct democracy hub" },
        ],
      },
      {
        title: "Small business and rural administration",
        body: "Running small-market and farm operations at Forevermost Farms taught the filer’s side of the counter: permits, cash flow, and paperwork friction that costs Main Street time. That ground truth shapes how she talks about business filings, nonprofit compliance, and equal service for rural counties—not as abstract policy, but as desks people actually stand at.",
        links: [
          { href: "/about/forevermost", label: "Stewardship & Forevermost" },
          { href: "/about/story", label: "Optional story chapter" },
        ],
      },
    ],
  },
  whySos: {
    title: "Why the Secretary of State’s Office",
    body: [
      "The Secretary of State administers elections support, business filings, public records access, and Capitol stewardship. Those systems touch ordinary Arkansans every day—whether they vote, register a business, request a record, or visit the Capitol. Competence here is not optional; confusion at this desk becomes statewide friction.",
      "Kelly entered this race because ballot access and fair administration should stay under Arkansas law, explained plainly, without partisan favoritism. She is not asking voters to invent new powers for the office. She is asking them to demand competence, equal service for all 75 counties, and a front office that treats people with respect while staying inside legal limits.",
    ],
    cta: { href: "/about/why-im-running", label: "Why I’m running" },
    officeCta: { href: "/understand", label: "Understand the office" },
  },
  leadership: {
    title: "How Kelly Leads",
    items: [
      {
        title: "She listens before deciding",
        body: "Campaign stops are conversations in community rooms, civic clubs, and trail events—not invented crowd claims. Verified field notes appear on From the Road when published.",
      },
      {
        title: "She explains how decisions are made",
        body: "Her organizing work emphasizes plain-language steps for initiatives and petitioning so volunteers know what the Secretary of State’s office actually controls—and what it does not.",
      },
      {
        title: "She treats public service as responsibility",
        body: "From telecom operations to small-business filings, her record is about removing duplicate steps, training people, and reducing the quiet friction of forms that never quite match the desk you are standing at.",
      },
      {
        title: "She focuses on practical results",
        body: "Modernize what is broken inside the office’s legal duties. Defend lawful ballot access. Make state services easier for ordinary Arkansans to use.",
      },
    ],
  },
  acrossArkansas: {
    title: "Across Arkansas",
    intro:
      "Selected trail photography and a featured journey video show how Kelly travels, listens, asks questions, and carries concerns into plans for the office. Geography appears only when confirmed in the campaign record. This section is shorter than the dedicated journey page on purpose.",
    cta: { href: "/about/journey", label: "See Kelly Across Arkansas" },
    photosCta: { href: "/campaign-photos", label: "View Campaign Photos" },
  },
  bringToOffice: {
    title: "What Kelly Will Bring to the Office",
    items: [
      {
        title: "Transparency",
        body: "Plain language about process, limits, and what the office holds—so accountability is usable, not theatrical.",
      },
      {
        title: "Accessibility",
        body: "Services and guidance that work for people who are not specialists: clearer filings, elections support, and records paths.",
      },
      {
        title: "Accurate administration",
        body: "Faithful execution of Arkansas law with equal respect for all 75 counties and the clerks who run Election Day locally.",
      },
      {
        title: "Respect for voters",
        body: "A front office culture that treats Arkansans as owners of their government, not obstacles in a queue.",
      },
      {
        title: "Responsible stewardship",
        body: "Professional care for Capitol operations and the public trust attached to this constitutional office.",
      },
      {
        title: "Clear public communication",
        body: "Answers people can follow—what changed, why it matters, and what to do next—without insider jargon.",
      },
    ],
  },
  closing: {
    title: "Choose your next step",
    body: "Explore what Kelly intends to improve inside the office’s authority, see how she shows up on the trail, or join the work in your community.",
    ctas: [
      { href: "/priorities", label: "Explore Kelly’s Priorities" },
      { href: "/about/journey", label: "See Kelly Across Arkansas" },
      { href: "/get-involved", label: "Join the Campaign" },
    ],
  },
} as const;
