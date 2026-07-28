/**
 * Launch-pass Meet Kelly biography narrative — verified campaign-facing copy only.
 * No invented dates, titles, or accomplishments. Long-form chapter links remain for depth.
 * @see docs/website/HOMEPAGE_48H_LAUNCH_SPRINT_REPORT.md
 */

export const aboutLaunchCopy = {
  hero: {
    eyebrow: "Meet Kelly Grappe",
    title: "Meet Kelly Grappe",
    subtitle:
      "Candidate for Arkansas Secretary of State — a neighbor you can know, a record you can check, and a clear reason she is asking for your trust.",
  },
  opening: {
    title: "Who Kelly is and why she is running",
    body: [
      "Kelly Grappe is running for Arkansas Secretary of State because the office should serve every county, business, and voter—not a political club. She believes people deserve plain answers: who she is, what she has already done in public view, and why this constitutional office matters to ordinary Arkansans.",
      "Before systems and statutes, trust is personal. Kelly’s campaign asks voters to judge character the way neighbors do—by visible work, clear limits, and a record of showing up.",
    ],
  },
  herStory: {
    title: "Her story",
    sections: [
      {
        title: "Family, community, and home",
        body: "Kelly’s life is rooted in family, faith as practice, and community work—not performance biography. She and her husband Steve built a life around Rose Bud and Forevermost Farms, including small-market and farm operations where permits, cash flow, and paperwork friction are daily reality. That ground truth shapes how she talks about business filings and rural counties.",
        links: [
          { href: "/about/story", label: "Read her story chapter" },
          { href: "/about/forevermost", label: "Stewardship & Forevermost" },
        ],
      },
      {
        title: "Work and systems",
        body: "Kelly spent nearly 25 years with Alltel and Verizon in operations leadership—training rooms, team leadership, and process discipline when customer-impacting services could not fail. She also knows the filer’s side of the counter: starting a small market and running farm operations. The habits that matter for Secretary of State work are clarity, training, and protecting the person in front of you when the rules are confusing.",
        links: [{ href: "/about/business", label: "Business & career" }],
      },
      {
        title: "Organizing and public service",
        body: "Through Stand Up Arkansas and grassroots petition work after the LEARNS Act, Kelly and neighbors organized around voter education and ballot access—including temporary field support for petition packets and notaries. Democracy, in her view, is a skill neighbors will practice when the official process is intelligible.",
        links: [
          { href: "/about/community", label: "Community & civic work" },
          { href: "/direct-democracy", label: "Direct democracy hub" },
        ],
      },
    ],
  },
  whySos: {
    title: "Why Secretary of State",
    body: [
      "The Secretary of State administers elections support, business filings, public records access, and Capitol stewardship. Kelly entered this race because those systems touch every Arkansan—and because ballot access and fair administration should stay under Arkansas law, explained plainly, without partisan favoritism.",
      "She is not asking voters to invent new powers for the office. She is asking them to demand competence, equal service for all 75 counties, and a front office that treats people with respect.",
    ],
    cta: { href: "/about/why-im-running", label: "Why I’m running" },
    officeCta: { href: "/understand", label: "Understand the office" },
  },
  leadership: {
    title: "Leadership in practice",
    items: [
      {
        title: "Listening across counties",
        body: "This campaign grows through conversations in community rooms, civic clubs, and trail stops—not through invented crowd claims. Verified field updates appear on From the Road when published.",
      },
      {
        title: "Teaching the official process",
        body: "Kelly’s organizing work emphasizes plain-language steps for initiatives and petitioning so volunteers know what the Secretary of State’s office actually controls—and what it does not.",
      },
      {
        title: "Solving friction where people feel it",
        body: "From telecom operations to small-business filings, her record is about removing duplicate steps, training people, and reducing the quiet humiliation of forms that never quite match the desk you are standing at.",
      },
    ],
  },
  acrossArkansas: {
    title: "Across Arkansas",
    intro:
      "Campaign trail evidence—selected photographs and journey stories—belongs with geography that is confirmed. Unknown locations stay unknown.",
    cta: { href: "/about/journey", label: "See Kelly Across Arkansas" },
    photosCta: { href: "/campaign-photos", label: "View Campaign Photos" },
  },
  values: {
    title: "What guides her",
    items: [
      {
        title: "People over politics",
        body: "Administration faithful to the law, equal respect for all 75 counties, and services that work for ordinary Arkansans first.",
      },
      {
        title: "Clarity over insider knowledge",
        body: "Filings, elections guidance, and records access should not require a specialist to start. Plain language is a fairness issue.",
      },
      {
        title: "Visible accountability",
        body: "Credentials you can check, civic work in plain sight, and honest empty states when an endorsement or update is not yet confirmed.",
      },
    ],
  },
  closing: {
    title: "Continue the story",
    body: "You have the person and the purpose. Next, hear Kelly’s message, explore what the office can actually deliver, or join the work in your county.",
    ctas: [
      { href: "/#primary-message", label: "Watch Kelly’s Message" },
      { href: "/priorities", label: "Explore Kelly’s Priorities" },
      { href: "/get-involved", label: "Join the Campaign" },
      { href: "/kelly-speaks", label: "Hear more from Kelly" },
    ],
  },
} as const;
