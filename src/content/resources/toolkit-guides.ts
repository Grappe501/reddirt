/**
 * Long-form organizing guides backing /resources/[slug].
 * Card copy in `organizingToolkit` is derived from this file.
 */
import type { ResourceItem } from "@/content/types";

export type ToolkitGuideSection = {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
  /** Short emphasis line */
  callout?: string;
};

export type ToolkitGuide = {
  slug: string;
  title: string;
  tag: string;
  /** Card + meta description */
  shortDescription: string;
  intro: string;
  /** Reassurance — no special credentials */
  anyOneCan: string[];
  sections: ToolkitGuideSection[];
  /** “Go deeper” — pillar pages, forms, or related toolkits */
  goDeeper: { label: string; href: string }[];
};

const volunteersNote =
  "When you volunteer through the form, we tag your signup with this guide so a coordinator can match you with the right next step—nothing fancy, just so we do not treat a host the same as a data volunteer.";

const guides: ToolkitGuide[] = [
  {
    slug: "host-first-gathering",
    title: "How to host a first gathering",
    tag: "Hosting",
    shortDescription:
      "A simple run-of-show for 8–25 people, with two good lanes: your own table talks about the ballot, or a private home visit when the campaign is in range.",
    intro:
      "You do not need a nonprofit board or a big house. A first gathering is a structured invitation: people know why they are there, they are heard, and they leave with one or two real actions instead of a fog of worry. This guide is a script you can adapt, not a performance you have to perfect. Most hosts lean on one of two complementary avenues: keep building confidence in your own circle on your own schedule, or, when the travel map allows, bring Kelly in for a small-room conversation in your own home.",
    anyOneCan: [
      "Space can be a living room, church classroom, library meeting room, or back room of a local restaurant—ask, do not overthink.",
      "You are the host, not the expert. Your job is clarity, welcome, and timekeeping; subject-matter folks can take turns when needed.",
      "Avenue 1 — your own work: use these get-togethers to educate and encourage friends, family, and neighbors. Make “who and what is on the Arkansas ballot” a normal, repeated topic between now and Election Day, not a one-time lecture.",
      "Avenue 2 — the campaign path: look ahead on the public campaign calendar, then tell us the date, place, and expected headcount. If we are in or near your area, we may schedule time for Kelly to drop by so people can meet her in the privacy of a home, not a rally stage.",
    ],
    sections: [
      {
        heading: "Two avenues (use one, or build toward both)",
        paragraphs: [
          "These are not competing ideas—the same group can get comfortable in their own format first, then add a visit when the route lines up. Name which lane you are in on your invite so guests know what to expect.",
        ],
        bullets: [
          "On your own: you set the table for motivation and clarity. Use plain language about races, the Secretary of State’s job, and what is on the ballot. Pair stories with a single link or handout to official or campaign explainers; avoid drowning people in five URLs.",
          "On our path: open the campaign calendar, find windows when we are in your part of the state, and submit a host request with as much lead time as you can. If the schedule can absorb a stop, a coordinator will be in touch about format, timing, and a respectful setup for neighbors who want a private introduction to Kelly.",
        ],
        callout:
          "A home should stay safe: let us know about pets, stairs, and parking. If a drop-by is not possible, you still have Avenue 1—and you are not doing it wrong.",
      },
      {
        heading: "Before: three decisions",
        paragraphs: [
          "Pick a date at least a week out so people can plan childcare and shifts. Set a hard end time and stick to it—90 minutes is plenty for a first run.",
          "Name the purpose in one sentence: for example, “Hear what voting access and ballot rules look like in our county, and name one thing we can do this month.” Send it in the invite, not buried at the bottom.",
        ],
        bullets: [
          "Send a text thread or email with address, parking, and whether kids are welcome.",
          "If you can, have simple snacks and water; if you cannot, say “bring what you can” and mean it.",
        ],
      },
      {
        heading: "Run of show (about 90 minutes)",
        paragraphs: [
          "Open with a real welcome, not a long biography: who you are, why you care, and ground rules (one mic, no pile-ons, respect names and pronouns).",
          "Use a go-round early while energy is high: a single prompt everyone answers in 2 minutes or less—e.g. “What do you want your neighbors to be able to do at the polls without shame or confusion?”",
          "In the middle, offer one short teach piece—5–8 minutes on the Secretary of State’s visible role, or a ballot-process fact—and then return to questions.",
        ],
        bullets: [
          "0:00–0:10 — Welcome, land acknowledgement if your community uses one, and purpose.",
          "0:10–0:40 — Go-round and paired listening (turn to a partner for 3 minutes, then a few report-backs).",
          "0:40–0:60 — One focused segment (guest or host explainer) with a printed one-pager people can take home.",
          "0:60–0:85 — “What is one next step we can name tonight?” Write them on a sheet everyone can see.",
          "0:85–0:90 — Thank-you, who will send notes, and how to follow up in the next 48 hours.",
        ],
        callout: "If a debate drifts into national talking points, gently tie it back: “What does that mean for our county or our ballot in Arkansas?”",
      },
      {
        heading: "Roles you can hand off (so you are not alone)",
        paragraphs: [
          "Timekeeper, note-taker, door greeter, and someone to pair shy attendees with a buddy. You can recruit those roles in the first five minutes of the event.",
        ],
      },
      {
        heading: "After: follow-up that builds trust",
        paragraphs: [
          "Send notes within 48 hours: what was said, who volunteered for what, and the next date even if it is tentative. A single follow-up text beats a perfect newsletter you never send.",
        ],
        bullets: [
          "Offer a second smaller action before the next big meeting: table at a market, a postcard shift, or a clerk-office visit with a friend.",
        ],
      },
      {
        heading: "Common tripwires",
        paragraphs: [
          "Letting the room vent without a path to action, or running a expert lecture with no room for lived experience. Let expertise serve the room, not the other way around.",
        ],
      },
    ],
    goDeeper: [
      { label: "Campaign calendar (where we are on the road)", href: "/campaign-calendar" },
      { label: "Host a gathering (tell us your date & place)", href: "/host-a-gathering" },
      { label: "Talking about Kelly (what to say in the room)", href: "/resources/talking-about-kelly" },
      { label: "Direct democracy & what can be on the ballot", href: "/direct-democracy" },
      { label: "How a measure reaches the Arkansas ballot (official steps)", href: "/direct-democracy/ballot-initiative-process" },
      { label: "Facilitation: run a community meeting", href: "/resources/community-meeting" },
      { label: "Field: listen before organizing", href: "/resources/listen-before-organizing" },
    ],
  },
  {
    slug: "listen-before-organizing",
    title: "How to listen before organizing",
    tag: "Field",
    shortDescription:
      "Exact prompts, follow-up habits, and how to earn trust so when you finally ask for time or signatures, people know you are not a stranger.",
    intro:
      "Organizing that lasts starts with memory: people will forget your flyer before they forget how you treated them in a parking lot. This is a field practice guide—low gear, high integrity—so anyone can do civic outreach without becoming a parody of a campaign.",
    anyOneCan: [
      "You can start with three conversations a week. Consistency matters more than charisma.",
      "No script beats curiosity plus honesty about what you do not know yet.",
    ],
    sections: [
      {
        heading: "Mindset: dignity first, pitch second",
        paragraphs: [
          "Assume every person is carrying something heavier than your candidate or issue. The goal of the first touch is to be trustworthy, not to “win” the conversation in sixty seconds.",
        ],
      },
      {
        heading: "Openers that do not feel like a sales call",
        paragraphs: [
          "Ask permission: “I’m volunteering with a voter-education project—do you have two minutes, or is now a bad time?” If it is a bad time, ask when to circle back and write it down.",
        ],
        bullets: [
          "“What would make it easier for you or your family to vote with confidence in our county?”",
          "“Is there a local issue you wish showed up on the ballot more than national noise?”",
          "“If you could fix one thing about how elections are run in Arkansas, what would it be?”",
        ],
      },
      {
        heading: "What to do with the answer",
        paragraphs: [
          "Reflect it back in your own words before you respond—people relax when they feel heard, not when they are corrected.",
          "Share one concrete fact, one story from your own life, and one way to stay in touch: text, email, or a follow-up at a public event. Avoid dumping five links; one link or QR on a handout is enough.",
        ],
      },
      {
        heading: "Habits that build a reputation",
        paragraphs: [
          "Keep a simple log: name or initials, best contact, and what they cared about. Follow up on what you said you would follow up on—even if the answer is “I looked it up, and it is more complicated; here is what I know so far.”",
        ],
        callout: "If someone is hostile, you do not owe them a debate. Thank them, wish them a good day, and move on. Safety beats ego.",
      },
      {
        heading: "When you are ready to invite action",
        paragraphs: [
          "Tie the ask to what they said: a signing event, a letter to the paper, a shift at a fair, a training, or a neighborhood coffee. The volunteer form is there when they want a steady lane with the campaign.",
        ],
      },
    ],
    goDeeper: [
      { label: "Neighbor conversations toolkit", href: "/resources/neighbor-conversations" },
      { label: "Volunteer (sign up to do this in the field)", href: "/get-involved?resource=listen-before-organizing#volunteer" },
    ],
  },
  {
    slug: "start-county-team",
    title: "How to start a county team",
    tag: "Teams",
    shortDescription:
      "Roles, weekly rhythms, and a 30-day start plan so the team grows without burning out the one person who said yes first.",
    intro:
      "A county team is not everyone doing everything. It is a few trustworthy practices in public: show up, teach plain language, keep a calendar, and make space for new people. You can begin with three people and a group chat; just name what you are doing so it can grow.",
    anyOneCan: [
      "You do not have to be chair of anything—often the best first role is “ logistics + notes.”",
      "Rural, urban, and suburban counties all count; the work just looks different on the map.",
    ],
    sections: [
      {
        heading: "The first 30 days (realistic)",
        paragraphs: [
          "Week 1: two listening conversations with people who already show up in your community; ask who else should be in the room.",
          "Week 2: one public-facing event (even if 10 people) with a clear agenda: purpose, one teach piece, and one action.",
          "Week 3: split roles—outreach, data/notes, supplies—so the same two people are not on every task.",
          "Week 4: short retrospective: what to repeat, what to drop, and a date for the next month’s bigger push.",
        ],
      },
      {
        heading: "Minimum viable roles",
        paragraphs: [
          "Captain or anchor: sets the schedule and makes sure follow-up happens. Outreach: extends invitations in person, not just online. Comms/notes: keeps a simple record and sends a weekly update.",
          "Mentor hook: the campaign can pair you with a coach—use the local team form when you are ready to bring in staff support.",
        ],
        bullets: [
          "Data light: a shared spreadsheet of events, contacts, and what people asked for beats a perfect CRM you never open.",
        ],
      },
      {
        heading: "Burnout patterns to avoid",
        paragraphs: [
          "Myth: “we need a big launch.” Reality: a steady small circle beats a one-time crowd that never hears from you again.",
          "Myth: “I will wait until I understand everything.” Reality: you learn by co-teaching; pair a curious newcomer with a steady note-taker.",
        ],
      },
    ],
    goDeeper: [
      { label: "Start a local team (long form on this site)", href: "/start-a-local-team" },
      { label: "Host a first gathering", href: "/resources/host-first-gathering" },
    ],
  },
  {
    slug: "community-meeting",
    title: "How to run a community meeting",
    tag: "Facilitation",
    shortDescription:
      "Agendas, stack and time limits, and how to hold disagreement in the room without turning it into a Facebook thread.",
    intro:
      "A good facilitator protects time, voice, and purpose. You are not there to be the smartest person—you are there so the group can think together and leave with clarity. This guide works for 15 people in a back room or 80 in a school auditorium with small adjustments.",
    anyOneCan: [
      "Use a written agenda on paper or a slide every time; it signals respect and keeps you from going fuzzy when tension rises.",
      "It is fine to be nervous. Breathe, start on time, and name the end time in the first minute.",
    ],
    sections: [
      {
        heading: "Set the container",
        paragraphs: [
          "Open with the purpose, the agenda, and ground rules: one person at a time, no interruptions, no name-calling, step up / step back if you usually talk a lot or rarely talk.",
        ],
        bullets: [
          "Name a timekeeper and a note-taker; if the topic is hot, add a “vibe checker” to pause if things spike.",
        ],
      },
      {
        heading: "Stack and limits",
        paragraphs: [
          "For large rooms, use a talking piece or numbered stack: people raise hands, you call names in order, and you give a fair but firm time cap (1–2 minutes in debate sections).",
        ],
        callout: "If someone filibusters, thank them, summarize their point, and move on: “Holding the rest of the agenda matters to everyone who came.”",
      },
      {
        heading: "When disagreement is the point",
        paragraphs: [
          "Separate “facts we can look up” from “values we are weighing.” Park factual disputes: assign someone to return with a source next time so the group does not spiral.",
          "Offer breakout pairs for 5 minutes on hard topics; people often hear better one-to-one than in a public pile-on.",
        ],
      },
      {
        heading: "Close on decisions, not just feelings",
        paragraphs: [
          "End with: what we decided, what we did not, who owns the next task, and when the next meeting is. Send notes in 48 hours with those bullets at the top.",
        ],
      },
    ],
    goDeeper: [
      { label: "Host a first gathering (smaller, intimate format)", href: "/resources/host-first-gathering" },
      { label: "Listening before organizing (field practice)", href: "/resources/listen-before-organizing" },
    ],
  },
  {
    slug: "direct-democracy-guide",
    title: "Direct democracy in Arkansas: basics & ballot process",
    tag: "Civic power",
    shortDescription:
      "Plain-language vocabulary, how an idea moves toward the ballot, the Secretary of State’s role, a live list of initiatives in the public conversation (with drill-downs), and links to the full policy pages—without replacing official filings.",
    intro:
      "This is the volunteer-friendly layer: enough vocabulary and flow to teach a neighbor, not a law review. The campaign’s deep pages on direct democracy and the step-by-step ballot process stay the canonical references; use this guide when you need one place to rehearse the story. Always verify deadlines and certified text with the Attorney General and Secretary of State when you are working with live petitions. After the sections below, this page includes the same 2026 field snapshot of measures in public conversation—expandable cards with direct website links, coalition notes, and how to verify—so you do not have to bounce away to remember what is moving.",
    anyOneCan: [
      "You can help without signing anything: witness tables, education tables, and driving seniors to a signing event are all part of a healthy process.",
      "If you are asked to sign, you deserve to read the certified title and summary, not a paraphrase on a clipboard.",
      "You can be the person who always shares primary .gov links—the Attorney General and Secretary of State pages beat a screenshot every time.",
      "If you collect signatures, take training on witness rules, notary practice, and anti-fraud expectations seriously. Sloppy lines hurt good measures.",
    ],
    sections: [
      {
        heading: "Vocabulary in human terms",
        paragraphs: [
          "Initiative: citizens propose a new law or constitutional amendment. Referendum: citizens vote to keep or throw out a law the legislature passed. Popular name: the short label on a petition; ballot title: the longer, certified text that must match the petition and what voters see.",
        ],
        bullets: [
          "Veto referenda: a narrower tool aimed at a specific act—deadlines and targets are not interchangeable with a general initiative drive.",
        ],
      },
      {
        heading: "From draft language toward the ballot (conceptual order)",
        paragraphs: [
          "Drafts go through popular-name and title work with the Attorney General’s office; sponsors amend language when asked. Once a title is approved for circulation, the measure can be printed for signature gathering within the legal window for that type of proposal. After submission, the Secretary of State’s review and verification steps determine what actually qualifies—details, numbers, and dates belong in the official sources linked at the bottom of this page.",
        ],
        bullets: [
          "Initiated acts, constitutional amendments, and referenda have different signature thresholds and rules—compare apples to apples when someone quotes a number.",
        ],
      },
      {
        heading: "Why the Secretary of State office matters (without picking policy winners)",
        paragraphs: [
          "The office does not choose which ideas deserve to win on election day, but it can make democracy legible: clear filing, accessible public notice, and professional handling of valid signatures and rejected lines. Transparent sample materials, defensible petition review, and calm public education are how voters trust the count. That is the standard Kelly is campaigning to model.",
        ],
      },
      {
        heading: "What healthy signature culture looks like",
        paragraphs: [
          "Canvassers who can answer when and where a measure was certified, what it does in plain language, and where to read the full text. Organizers who train people not to rush or corner residents.",
        ],
      },
      {
        heading: "How you help in the field",
        paragraphs: [
          "Carry a way to read the certified text, not just a slogan. If someone is unsure, that is a good sign: invite them to read slowly, ask questions, and come back later. Pressure is how bad stories start.",
        ],
      },
    ],
    goDeeper: [
      { label: "Direct democracy (campaign pillar — big picture)", href: "/direct-democracy" },
      { label: "How a measure reaches the Arkansas ballot (step-by-step on this site)", href: "/direct-democracy/ballot-initiative-process" },
      { label: "Attorney General — ballot initiative information", href: "https://arkansasag.gov/resources/ballot-initiative-information/" },
    ],
  },
  {
    slug: "neighbor-conversations",
    title: "Talking with neighbors",
    tag: "Conversations",
    shortDescription:
      "Respect-first prompts, door etiquette, and follow-ups that keep trust intact when you do not see eye to eye on everything.",
    intro:
      "Scripts are not the goal—relationship is. These are short prompts and habits so you can talk about democracy and the Secretary of State’s job without making people feel like a target. Most of this is listening and clarity, not clever lines.",
    anyOneCan: [
      "If you are shy, try paired walks with a friend: one knocks, one takes notes, swap next block.",
      "It is always okay to end politely: no one owes you a debate on their own porch.",
    ],
    sections: [
      {
        heading: "Door and sidewalk basics",
        paragraphs: [
          "Step back from the door after you knock; give people space. Say who you are, the campaign, and that you are not fundraising unless you are.",
        ],
        bullets: [
          "If a child answers, be brief and ask for an adult. If a “no soliciting” sign is clear, skip the house—there are other doors.",
        ],
      },
      {
        heading: "Prompts that keep doors open",
        paragraphs: [
          "“I’m not here to argue national politics—can I ask what would make you feel the election system in Arkansas is on your side?”",
          "“If the Secretary of State’s office was known for one thing, what should it be in your life?”",
        ],
      },
      {
        heading: "When you disagree",
        paragraphs: [
          "Name a shared value first: “We both care that votes count, even if we see different problems.” Do not correct tone before content; it reads as condescending.",
        ],
        callout: "You do not have to “close” every conversation. Sometimes the win is: they know you are a real neighbor who was kind.",
      },
    ],
    goDeeper: [
      { label: "Talking about Kelly (messaging & tough conversations)", href: "/resources/talking-about-kelly" },
      { label: "Listen before organizing (field)", href: "/resources/listen-before-organizing" },
      { label: "Get involved", href: "/get-involved" },
    ],
  },
  {
    slug: "talking-about-kelly",
    title: "Talking about Kelly: messaging you can use",
    tag: "Messaging",
    shortDescription:
      "Practical language for breakrooms and copy-pastable text, email, and phone invites for friends and family: who Kelly is, what the office does, how to disagree without a cage match, and how to stay grounded as a Democrat when Arkansas isn’t a swing state on cable news.",
    intro:
      "This is not a script to recite at people—it is a set of clear ideas, openers, and recovery lines so you can sound like yourself and still be precise. The Secretary of State’s race is a distinct job: fair administration, public trust, and a front office that works for every county. You do not have to re-litigate the whole country in one conversation. Your job is to make Kelly knowable, the office understandable, and the invitation sincere. Further down, before the “Go deeper” list, you will find text-message, email, and phone blocks you can copy straight to your device—worded for friends who may not know this office exists yet.",
    anyOneCan: [
      "You do not need a political science degree. You need two true sentences, genuine curiosity, and a willingness to exit a conversation with dignity if it is not the day.",
      "Kelly’s name goes with a job description, not a battle-of-the-bumper-stickers. Lead with the work.",
      "If you are a Democrat, Republican, or independent—say so only when it helps clarity, not when it is a cudgel.",
      "Repetition is a feature, not a failure: most people hear you for the first time every time.",
    ],
    sections: [
      {
        heading: "The 30-second frame (always start here)",
        paragraphs: [
          "Kelly Grappe is running to be Arkansas’s next Secretary of State: the state’s election and commercial-records front office, not a legislator. She is running on calm competence—making rules legible, protecting ballot access, and running a public office you do not have to be embarrassed to call.",
        ],
        bullets: [
          "Name the job before the person: “This is the office that keeps elections information honest and the public record findable for businesses and families.”",
          "Then the person: “Kelly is asking for a chance to run that office with high standards in all 75 counties.”",
        ],
      },
      {
        heading: "Talking points you can say out loud (mix and match)",
        paragraphs: [],
        bullets: [
          "Fair and transparent: voters deserve correct information, reasonable access, and real answers when something breaks down—not spin.",
          "The Secretary of State is not a national pundit. It is a service job with massive responsibility for trust in the count and clarity in the paperwork.",
          "Ballot access is civic infrastructure. When the process is confusing on purpose, working people and rural Arkansans pay the price first.",
          "Small business owners, farmers, and local clerks all touch what this office files and publishes. Competence isn’t abstract—it is someone’s day at work.",
          "Direct democracy and petition rights matter to Arkansans across labels; the office should be a neutral, professional scorekeeper, not a hidden thumb on the scale.",
        ],
        callout: "If someone wants policy detail, point to the priorities page. If they want story, point to the about page. You are not a walking encyclopedia—you are a neighbor who cares.",
      },
      {
        heading: "How to approach people (tone beats cleverness)",
        paragraphs: [
          "Ask permission: “I’m with Kelly’s campaign for Secretary of State—do you have a minute, or should I catch you another time?” Lower your volume before you open your mouth. Let silence exist.",
        ],
        bullets: [
          "Start local: a county line, a school calendar, a small business, a long line on election day. Ground truth beats ideology.",
          "Name one way the office touches their life: voting materials, a business filing, a records question, helping someone register.",
          "Invite a question: “What would you want that office to get right in your life?”",
        ],
      },
      {
        heading: "When someone is extremely different from you politically",
        paragraphs: [
          "Separate the person from a caricature. Most people are not a walking party platform; they are tired, proud, and protecting something real—kids, work, place, memory of how things used to be.",
        ],
        bullets: [
          "Lead with a shared value you can credibly name: a fair count, a government that does not play favorites, or teachers not having to fact-check the state in their spare time.",
          "Disaggregate this race: “I’m not here to re-argue 500 national fights. I’m here because this one office handles how we treat voters and the public record in Arkansas.”",
          "If they test you, do not flatter them by pretending to agree. Do flatter the conversation: “I hear you. Here’s what I can honestly say about this job.”",
          "It is not your job to convert everyone. It is your job to leave the door ajar: they remember you were decent.",
        ],
      },
      {
        heading: "When you are a Democrat in a Republican-leaning state (plain talk)",
        paragraphs: [
          "Do not smuggle shame into your pitch. The rural South and Arkansas’s small towns are full of people who have been stereotyped by strangers; do not sound like a stranger. Stand in your own shoes, not in a performance of “reach.”",
        ],
        bullets: [
          "Optional honesty: “I’m a Democrat, and I’m for Kelly because I think this job needs independence and public service—not a party stunt.” (Adjust if you are not a D—use your true label or none.)",
          "Reframe: “I’m not asking you to sign up for a party platform. I’m asking you to look at a single executive office that either works for the public or doesn’t.”",
          "If they lead with a national insult, breathe: “That’s a real frustration. I’m not running for that office. Kelly is running to run the Secretary of State’s office well.”",
          "Pride in place: “Arkansans of every stripe want government that keeps its word. That’s a conservative and a progressive sentence at the same time—because it is true.”",
        ],
      },
      {
        heading: "When the conversation drifts to national culture war (gentle reset)",
        paragraphs: [
          "Do not be preachy. Name the frame and step sideways: “The screens want us in that fight. The Secretary of State’s job is more boring and more important: accurate elections, honest notice, a front desk that does not play hide-and-seek with the law.”",
        ],
        bullets: [
          "If they are baiting: “I won’t play cable news in your living room. I will answer anything about this race.”",
          "If they are anxious: “You don’t have to like everything about national politics to want this office to be professional.”",
        ],
      },
      {
        heading: "When they distrust all politicians (and they mean you too)",
        paragraphs: [
          "Agree with the distrust up to a point: public life has earned skepticism. Then pivot to observable standards: public schedules, clear filing rules, plain-language voter materials, a boss who does not play favorites with one county or one company.",
        ],
        bullets: [
          "“Watch what someone says they’ll do in the one job they are asking for—that’s a fair test.”",
          "Offer a homework link: priorities and about, not a thirty-minute monologue.",
        ],
      },
      {
        heading: "Phrases you can borrow (make them sound like you)",
        paragraphs: [],
        bullets: [
          "“I’m out here because I want my neighbors to have a government office they don’t have to be embarrassed to call.”",
          "“The Secretary of State isn’t a loud job—it’s a trust job. I think Kelly is asking for the right reason.”",
          "“I’m not here to put you in a box. I’m here to make sure you know this race is on the ballot and what it’s about.”",
          "“If the count isn’t right, the rest of politics is noise.”",
        ],
      },
      {
        heading: "What to avoid (protect your credibility)",
        paragraphs: [],
        bullets: [
          "Talking down to people who did not go to the same school or use the same vocabulary.",
          "Winning a Facebook argument in someone’s kitchen. You lose the neighbor even if you win the line.",
          "Pretending the Secretary of State is a superpower. Be accurate: big policy still has to go through the legislature; this job is about administration and public trust in the work.",
          "Guilt, shame, or “if you were smart you would…” Energy convinces no one; dignity invites people back.",
        ],
      },
    ],
    goDeeper: [
      { label: "Meet Kelly (story & path)", href: "/about" },
      { label: "Office priorities (the plan in one place)", href: "/priorities" },
      { label: "Secretary of State 101 (what the job is)", href: "/resources/sos-office-brief" },
      { label: "Talking with neighbors (field habits)", href: "/resources/neighbor-conversations" },
      { label: "Listen before organizing (trust first)", href: "/resources/listen-before-organizing" },
    ],
  },
  {
    slug: "postcard-outreach",
    title: "Postcard outreach (we supply, you send)",
    tag: "Field",
    shortDescription:
      "We provide postcard stock and a targeted list; you hand-write messages, pay postage, and put them in the mail. A tangible lane for neighbors who like paper and a personal touch.",
    intro:
      "Postcards still work for voter contact when the tone is local, legible, and respectful. The campaign’s postcard lane is simple on purpose: we supply the cards and a list matched to a program, you add your own handwriting in your own words within guardrails a coordinator will share, and you cover postage so the program stays sustainable for volunteers. Nothing here replaces the official mail from election offices—this is campaign-to-neighbor contact with consent and care.",
    anyOneCan: [
      "You can do this at a kitchen table in short shifts—you do not need a call center voice or a perfect pen.",
      "If handwriting is hard for you, say so: we can pair you with a buddy or a different lane.",
      "Stamps and envelopes (if your packet uses them) are on you, which keeps the model honest and local.",
    ],
    sections: [
      {
        heading: "How the lane works (plain terms)",
        paragraphs: [
          "You sign up, a coordinator places you in a batch, and you receive postcard stock from the campaign plus instructions for the message window (what to stress, what to avoid, and how to keep it truthful).",
          "We also provide the addresses for that batch—the list is not for copying into your own tool or reusing outside the program. It exists so neighbors get one thoughtful note, not three duplicates from the same name.",
        ],
        bullets: [
          "We supply the postcards (design and print through the campaign).",
          "You write in ink, sign as yourself unless a script says otherwise, and you pay to mail them.",
          "You send only to the list we provide for your packet—no additions from private spreadsheets or purchased lists.",
        ],
        callout: "If you run out of time or cannot finish a batch, tell the coordinator so we reassign the addresses—no shame, no guilt.",
      },
      {
        heading: "Voice and respect (the trust part)",
        paragraphs: [
          "Handwriting signals that a real person cared enough to sit down and write. Keep facts inside what the program gives you; if you are unsure about a date or a rule, leave it for the next training link rather than guessing.",
        ],
        bullets: [
          "Be warm and neighborly, not pushy. No threats, no shame, no impersonation of a government office.",
          "If someone returns mail or asks to be left alone, that request is final for this program and we note it in coordination.",
        ],
      },
      {
        heading: "Postage, timing, and proof",
        paragraphs: [
          "Buy stamps at the rate your packet specifies; oversized cards may need extra ounce postage. If you are mailing close to a deadline, ask for a clear “mail-by” date when you pick up the packet.",
        ],
        bullets: [
          "Track how many you sent when we ask for closeout numbers—it helps the field team learn without becoming a vanity scoreboard.",
        ],
      },
    ],
    goDeeper: [
      { label: "Text banking (peer-to-peer, numbers we provide)", href: "/resources/text-banking" },
      { label: "Phone banking (road map and signup)", href: "/resources/phone-banking" },
      { label: "Volunteer (tagged from this guide)", href: "/get-involved?resource=postcard-outreach#volunteer" },
    ],
  },
  {
    slug: "phone-banking",
    title: "Phone banking (system on the way)",
    tag: "Remote",
    shortDescription:
      "We are building a full phone-banking system with coach support and compliant dial workflows. For now, this page is your signup and training bookmark—so you are first in line when the stack is ready.",
    intro:
      "Phone conversations still move people when they are consented, time-bounded, and human. A professional campaign phone program needs a real dialer track, not a pile of personal cell phones blasting random numbers. We are planning that system with the same trust standards as the rest of the field. Until it ships, use this resource to know what to expect, how to prepare, and how to stay on the list so coordinators can place you the moment shifts open.",
    anyOneCan: [
      "If you are comfortable on the phone, you are already in the right zip code. Coaching will cover openers, opt-outs, and the nuts and bolts of Arkansas-specific scripts.",
      "If night calling does not work for you, we will not treat that as a character flaw—say so and we will look at daytime batches or a different lane like postcards or P2P text.",
    ],
    sections: [
      {
        heading: "What is coming (so you are not left guessing)",
        paragraphs: [
          "Expect a real workflow: contact lists with permission, scripts tied to the Secretary of State race, call dispositions, and a path for do-not-call requests that we honor immediately. We are not publishing vendor names before contracts are final, but the goal is a single place to log in, receive training, and take supervised shifts.",
        ],
        bullets: [
          "Coaches and recorded practices before your first live calls.",
          "Clear rules for ID, time zones, and what to do when someone is confused or angry.",
        ],
        callout: "Bookmark this page; we will update it when the first pilot shifts go live. Until then, sign the volunteer form and note phone banking so routing is easy.",
      },
      {
        heading: "What you can do right now",
        paragraphs: [
          "Use the volunteer form to raise your hand. In skills or availability, name windows that work, whether you are bilingual, and if you have used a virtual phone bank before.",
        ],
        bullets: [
          "Pair with postcard or P2P text if you need something tangible while you wait for dialer access.",
        ],
      },
    ],
    goDeeper: [
      { label: "Text banking (P2P now)", href: "/resources/text-banking" },
      { label: "Postcard outreach (handwritten)", href: "/resources/postcard-outreach" },
      { label: "Volunteer (tag for phone bank)", href: "/get-involved?resource=phone-banking#volunteer" },
    ],
  },
  {
    slug: "text-banking",
    title: "Text banking (peer-to-peer, protect your number)",
    tag: "Remote",
    shortDescription:
      "We provide numbers and message flows; you send peer-to-peer texts from a separate line—like Google Voice—so your personal phone number stays out of the blast radius.",
    intro:
      "Peer-to-peer texting is a conversation, not a robocall. The campaign can supply phone numbers, segments, and approved scripts, and you send messages one at a time from your device. Because your personal line deserves protection, we teach volunteers to set up a Google Voice number or another service that gives you a dedicated outbound number. That habit keeps your family’s phone from becoming the return path for a stranger with a grudge, and it keeps the program clean when someone opts out.",
    anyOneCan: [
      "If you can text your cousin, you can learn P2P—training covers consent, opt-out language, and when to hand off to a human.",
      "If you have zero patience for new apps, say so; we can match you to postcards or event representation instead.",
    ],
    sections: [
      {
        heading: "What the campaign provides",
        paragraphs: [
          "We give you the numbers to contact (within the program), the copy approved for that round, and training on the tone we want: local, direct, and honest about who you are.",
        ],
        bullets: [
          "You send; you are not “the campaign robot.” That is the whole point of P2P.",
        ],
      },
      {
        heading: "Hide your personal number (seriously)",
        paragraphs: [
          "Before you send a single assigned text, set up a separate number. Google Voice is a common free option on Android and iOS; other VoIP and second-line services work too. Use that number only for this work so replies and opt-outs do not follow you home.",
        ],
        bullets: [
          "Never paste the voter file into a personal group chat or a for-profit blast tool. Stay inside the workflow we give you.",
          "If someone says stop, you stop and mark it in the system—no debate, no second message from another number.",
        ],
        callout: "We will walk through the setup in training. If a tool changes, the principle does not: one campaign-facing line, not your family cell.",
      },
      {
        heading: "Tone and safety",
        paragraphs: [
          "Be short. Be true. If you do not know an election rule, do not improvise—point to official sources or a coordinator.",
        ],
      },
    ],
    goDeeper: [
      { label: "Phone banking (dialer—road map)", href: "/resources/phone-banking" },
      { label: "Postcard outreach (paper lane)", href: "/resources/postcard-outreach" },
      { label: "Volunteer (tag for text bank)", href: "/get-involved?resource=text-banking#volunteer" },
    ],
  },
  {
    slug: "sos-office-brief",
    title: "Secretary of State 101",
    tag: "Civic",
    shortDescription:
      "What the office actually runs: elections, business and commercial filings, and public records access—stated without campaign spin so you can explain it in a breakroom or a church lobby.",
    intro:
      "Voters are asked to care about a job that touches almost every part of public life, often without a clear picture of what the Secretary of State can and cannot do. This guide gives you a stable outline; pair it with the priorities page for Kelly’s plan.",
    anyOneCan: [
      "You are allowed to point to official .gov pages when someone drifts into myths—politeness and accuracy go together.",
      "It is fine to say “I’m going to look that up and get back to you” about a detail. That is how trust is built.",
    ],
    sections: [
      {
        heading: "Core buckets (simplified)",
        paragraphs: [
          "Elections and voting infrastructure: support for fair administration, public information, and accurate election-related materials within the office’s role.",
          "Business services: corporations, UCC, and commercial filings that keep the public record legible for small business owners.",
          "Records and access: the office touches how many documents are filed and found; transparency expectations are part of a modern standard.",
        ],
        bullets: [
          "The Secretary of State is not a legislature—big policy still runs through the General Assembly. The office is where professionalism and public trust in the system show up day to day.",
        ],
      },
      {
        heading: "What volunteers often get asked",
        paragraphs: [
          "“Is this the person who keeps my data safe at the polls?” — Talk about the role of public trust, local election officials, and the rule of law without pretending one office is a superpower.",
          "“Why should I care if it is boring?” — Because the boring parts of democracy are what stop chaos from being normalized. Calm, accurate administration is a civil right for everyone who depends on the count.",
        ],
      },
    ],
    goDeeper: [
      { label: "Office priorities (campaign)", href: "/priorities" },
      { label: "Direct democracy (why ballots matter here)", href: "/direct-democracy" },
    ],
  },
];

/** Toolkit slugs shown as optional volunteer interest checkboxes (see VolunteerForm). */
export const OUTREACH_RESOURCE_SLUGS = ["postcard-outreach", "phone-banking", "text-banking"] as const;
export type OutreachResourceSlug = (typeof OUTREACH_RESOURCE_SLUGS)[number];

const bySlug = Object.fromEntries(guides.map((g) => [g.slug, g])) as Record<string, ToolkitGuide>;

export function getToolkitGuide(slug: string): ToolkitGuide | undefined {
  return bySlug[slug];
}

export function getToolkitSlugs(): string[] {
  return guides.map((g) => g.slug);
}

function volunteerPath(slug: string) {
  return `/get-involved?resource=${encodeURIComponent(slug)}#volunteer`;
}

/** Card grid + imports — href points at full guide. */
export const organizingToolkit: ResourceItem[] = guides.map((g) => ({
  slug: g.slug,
  title: g.title,
  description: g.shortDescription,
  href: `/resources/${g.slug}`,
  tag: g.tag,
}));

export function getToolkitTitleForResourceSlug(slug: string | undefined): string | null {
  if (!slug) return null;
  const g = bySlug[slug];
  return g ? g.title : null;
}

export function isValidResourceVolunteerSlug(slug: string): boolean {
  return Boolean(bySlug[slug]);
}

export { guides as allToolkitGuides, volunteersNote, volunteerPath };
