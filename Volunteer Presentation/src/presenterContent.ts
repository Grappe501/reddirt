import { RALLY, SLIDES } from "./content";

export type PresenterBlock = {
  heading: string;
  bullets: string[];
};

export type PresenterSlideBrief = {
  slideId: string;
  audiencePath: string;
  timeBox: string;
  speaker: string;
  whyYouAreHere: string;
  whyItMatters: string;
  campaignFit: string;
  audienceSees: string[];
  openWith: string[];
  talkingPoints: PresenterBlock[];
  linesToLand: string[];
  asks: string[];
  watchOuts: string[];
  drillDownIds: string[];
};

export type DrillDown = {
  id: string;
  title: string;
  subtitle: string;
  sections: PresenterBlock[];
  relatedSlideIds: string[];
};

export const PRESENTER_SLIDES: PresenterSlideBrief[] = [
  {
    slideId: "welcome",
    audiencePath: "/",
    timeBox: "0:00–0:04",
    speaker: "Steve",
    whyYouAreHere:
      "Open the room, set the scoreboard for the night, and make clear this is a building meeting—not a briefing they sit through.",
    whyItMatters:
      "If the first four minutes feel like another Zoom update, energy dies. If they feel recruited into a statewide team with a clear scoreboard, everything after lands harder.",
    campaignFit:
      "Welcome is the doorway into Operation Arkansas: 75-county organization before Labor Day, statewide tour after, and one near-term proof point—Grassroots & Guitar Strings on September 17.",
    audienceSees: [
      "75 Counties. One Arkansas. One Team.",
      "Nine months of travel and listening; tonight begins the next phase.",
      "Three goals: organize 75 counties · launch the tour · fill 500 seats Sept 17.",
    ],
    openWith: [
      "Thank them for showing up—and say this is not another campaign meeting.",
      "Name the scoreboard early: counties, tour, and Sept 17.",
      "Promise the night ends with a real role, not a vague ‘stay engaged.’",
    ],
    talkingPoints: [
      {
        heading: "Tone to set",
        bullets: [
          "Tonight is about building the team that takes this campaign into every corner of Arkansas.",
          "Kelly and Steve have spent ~nine months laying a trust foundation; tonight we staff the next chapter.",
          "Inspire → Inform → Recruit → Commit. Everything else can be a follow-up meeting.",
        ],
      },
      {
        heading: "Three measurable goals (say them out loud)",
        bullets: [
          "Organize a presence in all 75 counties before Labor Day.",
          "Launch a sustained statewide community tour after Labor Day.",
          `Fill ${RALLY.goal} seats at ${RALLY.title} (${RALLY.shortDate}) with ${RALLY.artist}.`,
        ],
      },
      {
        heading: "What success looks like by the end of the hour",
        bullets: [
          "Know who is leading each county—or where leaders are still needed.",
          "Know who joined each statewide team.",
          "Have a list of people wanting follow-up conversations.",
          "Identify counties needing immediate attention.",
          "Know who is ready to help with Labor Day launch and Sept 17.",
        ],
      },
    ],
    linesToLand: [
      "Tonight isn’t about listening to another campaign meeting. Tonight is about building the team.",
      "Arkansas will not be won from the top down.",
    ],
    asks: ["Stay to the end for the commitment moment.", "Open the shared link on your phone if you want to follow along."],
    watchOuts: [
      "Don’t drown them in calendar detail yet—plant the three goals and move.",
      "Don’t apologize for asking people to work; frame it as ownership.",
    ],
    drillDownIds: ["meeting-design", "operation-arkansas", "rally"],
  },
  {
    slideId: "why",
    audiencePath: "/why",
    timeBox: "0:04–0:08",
    speaker: "Steve",
    whyYouAreHere:
      "Name the turning point honestly: the foundation exists; the bottleneck is leadership capacity. Give the room permission to become operators tonight.",
    whyItMatters:
      "Without this slide, people stay in ‘audience mode.’ With it, sign-ups during the meeting feel natural instead of pushy.",
    campaignFit:
      "This is the hinge between Kelly/Steve’s relationship-building phase and a distributed volunteer OS that can run 75 counties, Strike Teams, and GOTV.",
    audienceSees: [
      "The campaign has reached a turning point.",
      "Four verbs: Inspire · Inform · Recruit · Commit.",
      "Tonight is an invitation to build the Election Day team.",
    ],
    openWith: [
      "Until now, Kelly and Steve have managed nearly every part of the campaign while building relationships.",
      "The foundation is in place. Tonight we need leaders who operate and expand.",
    ],
    talkingPoints: [
      {
        heading: "The turning-point story",
        bullets: [
          "Relationship travel built trust—especially in places statewide races often skip.",
          "You cannot scale trust-based politics from two people’s calendars alone.",
          "Tonight converts interest into responsibility: local teams + statewide ops teams.",
        ],
      },
      {
        heading: "How the hour is designed (tell them the map)",
        bullets: [
          "Inspire — why Kelly runs and what trust means.",
          "Inform — Operation Arkansas, Youth Coalition, event model, calendar.",
          "Recruit — local and statewide roles during the meeting, not later ‘maybe.’",
          "Commit — one team, one recruit, one action this week.",
        ],
      },
      {
        heading: "What to emphasize",
        bullets: [
          "This is not only a campaign update.",
          "Every person should leave knowing how they help—or having asked for a match conversation.",
          "Follow-up meetings exist for depth; tonight is for placement.",
        ],
      },
    ],
    linesToLand: [
      "Tonight is not only a campaign update. It is an invitation to help build the team that will take us through Election Day.",
    ],
    asks: ["Listen for the role that fits—and sign up when we get there, not three days later."],
    watchOuts: ["Don’t turn this into a long org-chart lecture. Four verbs, then hand the emotional center to Kelly."],
    drillDownIds: ["meeting-design", "volunteer-machine"],
  },
  {
    slideId: "vision",
    audiencePath: "/vision",
    timeBox: "~7–8 minutes",
    speaker: "Kelly",
    whyYouAreHere:
      "You are the emotional center. Give people a reason to trust the person before they trust the plan. Everything after this slide borrows credibility from this one.",
    whyItMatters:
      "Volunteers don’t sustain hard work for a tactic sheet. They sustain it for a leader and a moral frame. Trust-before-politics is the warrant for every later ask.",
    campaignFit:
      "Kelly’s doctrine: win through trusted relationships, not ads alone. Local listening, rural show-up, opposing voices at the table, decisions close to communities—this is why Operation Arkansas is a tour of presence, not a media flyover.",
    audienceSees: [
      "Listen. Trust. Serve.",
      "Trust comes before politics.",
      "Seven commitments + the earn-trust quote.",
    ],
    openWith: [
      "People do not listen to a candidate until they trust the person.",
      "That is why this campaign started with travel, listening, and showing up—especially in rural Arkansas.",
    ],
    talkingPoints: [
      {
        heading: "Core theory (say simply)",
        bullets: [
          "Trust first → then policy conversation → then vote.",
          "Statewide candidates often overlook rural communities; this campaign does the opposite.",
          "You do not have to agree with Kelly on everything to work with Kelly—respect and presence matter.",
        ],
      },
      {
        heading: "Seven commitments (punch list—pick 4–5 live if short on time)",
        bullets: [
          "Nobody will outwork us.",
          "Every Arkansas community matters.",
          "Opposing voices belong at the table.",
          "Personal attacks do not bring people together.",
          "Public officials must still be held accountable.",
          "State government should work for citizens rather than restrict them.",
          "Decisions should be made as close to the local community as possible.",
        ],
      },
      {
        heading: "Color you can add if the room is with you",
        bullets: [
          "What you’ve learned traveling Arkansas—specific kinds of places and people (without inventing stories).",
          "Why Secretary of State must serve every voter, not a faction.",
          "How listening changes what you choose to fight for.",
        ],
      },
    ],
    linesToLand: [
      "Government works best when it listens. My goal isn’t simply to win an election—it’s to earn the trust of Arkansas.",
      "Listen. Trust. Serve.",
    ],
    asks: ["None yet—earn the right to ask. Plant that volunteers are how trust scales."],
    watchOuts: [
      "Don’t debate opponents here. Stay affirmative.",
      "Don’t rush—this is the heart of the meeting.",
    ],
    drillDownIds: ["kelly-trust", "elections-citizen-power"],
  },
  {
    slideId: "elections",
    audiencePath: "/elections",
    timeBox: "~5–6 minutes",
    speaker: "Kelly",
    whyYouAreHere:
      "Translate trust into the office: secure elections, accessible elections, local officials as partners, and citizen power as a constitutional practice—not a slogan.",
    whyItMatters:
      "SOS is the elections and commerce office people encounter when they doubt institutions. Your job tonight is to sound steady, competent, and respectful of county clerks—not like a cable-news segment.",
    campaignFit:
      "Field volunteers will meet voters worried about fraud myths and voters worried about access. Kelly’s frame holds both: strengthen systems with local officials, protect eligible participation, rebuild confidence through transparency, defend initiative/referendum and accountability.",
    audienceSees: [
      "Four cards: Support local officials · Protect access · Transparency · Defend citizen power.",
    ],
    openWith: [
      "Arkansas county clerks and election commissioners are first-rate public servants.",
      "As Secretary of State, my job is to strengthen their systems—not replace local judgment with rigid one-size-fits-all politics.",
    ],
    talkingPoints: [
      {
        heading: "Four pillars (walk the cards)",
        bullets: [
          "Support local election officials — resources, training, dependable systems.",
          "Protect voter access — every eligible Arkansan can participate without unnecessary barriers.",
          "Build confidence through transparency — meet communities with concerns; show safeguards; fix legitimate problems.",
          "Defend citizen power — election access, initiative & referendum, local decision-making, accountability.",
        ],
      },
      {
        heading: "Citizen power (keep affirmative)",
        bullets: [
          "Arkansans deserve pathways to place issues before voters and hold government accountable.",
          "The SOS office should help citizens navigate the process fairly—whether or not the office personally agrees with a particular issue.",
          "Do not turn this into an attack reel. Affirmative commitments only.",
        ],
      },
      {
        heading: "Bridge to volunteers",
        bullets: [
          "Local teams will be the trusted face when neighbors ask hard questions.",
          "Our job is calm competence: accurate information, respectful conversations, no mockery of people’s fears.",
        ],
      },
    ],
    linesToLand: [
      "Secure elections and accessible elections belong together.",
      "We rebuild confidence by showing our work—with local partners, not against them.",
    ],
    asks: ["None yet—transition Steve into Operation Arkansas as the how."],
    watchOuts: [
      "No unsourced opponent claims. No mocking voters who distrust elections.",
      "Don’t over-promise legal outcomes; speak to approach and values.",
    ],
    drillDownIds: ["elections-citizen-power", "kelly-trust"],
  },
  {
    slideId: "strategy",
    audiencePath: "/strategy",
    timeBox: "~5–6 minutes",
    speaker: "Steve",
    whyYouAreHere:
      "Show the campaign method and timeline so volunteers understand what ‘help’ means after Labor Day—and why tonight’s recruitment is urgent.",
    whyItMatters:
      "Strategy turns inspiration into a calendar. Without it, people love Kelly and still don’t know what happens next week.",
    campaignFit:
      "Operation Arkansas (field sense): 75-county presence before Labor Day → statewide community tour after → final-month canvass/Strike Teams/GOTV. Sept 17 Sherwood rally is the Central Arkansas GOTV kickoff proof point inside that arc.",
    audienceSees: [
      "Three phases: Before Labor Day · After Labor Day · Final Month.",
      "Arrive → Listen → Participate → Build → Return → Organize.",
      "Sept 17 Grassroots & Guitar Strings callout.",
    ],
    openWith: [
      "Arkansas will not be won from the top down.",
      "We build community by community, county by county, person by person.",
    ],
    talkingPoints: [
      {
        heading: "Three phases",
        bullets: [
          "Before Labor Day — establish campaign presence in all 75 counties.",
          "After Labor Day — launch the sustained statewide community tour; Sept 17 GOTV kickoff in Sherwood.",
          "Final month — canvassing, Strike Teams, outreach, GOTV.",
        ],
      },
      {
        heading: "How we show up (don’t skip this)",
        bullets: [
          "Arrive → Listen → Participate → Build Relationships → Return → Organize.",
          "We are not interested in dropping in for a speech, photos, and leaving.",
          "Local teams prepare the ground before Kelly arrives.",
        ],
      },
      {
        heading: "Labor Day readiness color (analyst—use carefully)",
        bullets: [
          "Labor Day 2026 is the hard gate for statewide organization sprint (Sept 7).",
          "Stretch goal remains presence across all 75 counties; treat gaps as recruitment targets tonight.",
          "Name the Sept 17 rally as the near-term team-building deadline (~one month).",
        ],
      },
    ],
    linesToLand: [
      "Kelly and I can’t do this alone anymore. That’s why you’re here tonight.",
      "Visit. Listen. Participate. Build. Return. Organize.",
    ],
    asks: [`Who will help plan ${RALLY.title}—raise a hand; signup link comes on the next slides.`],
    watchOuts: [
      "Website ‘Operation Arkansas’ also means evidence-publishing doctrine—don’t conflate jargon on stage unless intentional.",
      "Priority counties for Labor Day launch still TBD—don’t invent a list.",
    ],
    drillDownIds: ["operation-arkansas", "rally", "strike-teams"],
  },
  {
    slideId: "events",
    audiencePath: "/events",
    timeBox: "~3–4 minutes (+ rally emphasis)",
    speaker: "Steve",
    whyYouAreHere:
      "Give people two clear ways to bring the campaign home—and put the Sept 17 planning team ask front and center.",
    whyItMatters:
      "Hosting anxiety kills action. A simple model (local candidate rally vs town hall) plus one concrete statewide event makes ‘yes’ easy.",
    campaignFit:
      "Local events are how Operation Arkansas lands in real places. Grassroots & Guitar Strings is the Central Arkansas / Sherwood GOTV kickoff with live music—credibility on home turf and a 500-person organizing target.",
    audienceSees: [
      `Priority hero: ${RALLY.title} · ${RALLY.shortDate} · ${RALLY.artist} · ${RALLY.goal} people.`,
      "Two models: Local Candidate Rally · Community Town Hall.",
      "Join the Planning Team CTA.",
    ],
    openWith: [
      `We have a major GOTV kickoff on ${RALLY.date}: ${RALLY.title} with ${RALLY.artist}.`,
      `Goal: ${RALLY.goal} people in ${RALLY.city}. We need a planning team starting tonight.`,
    ],
    talkingPoints: [
      {
        heading: "Grassroots & Guitar Strings (primary)",
        bullets: [
          `Date: ${RALLY.date} · ${RALLY.city}, ${RALLY.county} County.`,
          `Artist: ${RALLY.artist} (Arkansas country artist; Sherwood roots—hometown energy matters).`,
          `Attendance goal for this meeting: ${RALLY.goal}.`,
          `Co-chairs: ${RALLY.coChairs}. Steve backs ops.`,
          "Need: planning · tickets/hosts · hospitality · outreach · day-of crew.",
          "Venue, exact time, ticket links: still locking—do not invent; invite planners into the room that will finish those details.",
        ],
      },
      {
        heading: "Two local event models",
        bullets: [
          "Local Candidate Rally — feature the local candidate; Kelly as guest (rally, cookout, festival, meet-and-greet, volunteer launch).",
          "Community Town Hall — locally led around community needs; multi-candidate only where campaign-finance rules allow.",
          "Local teams identify host, venue, audience, partners, media, and volunteers before Kelly arrives.",
        ],
      },
      {
        heading: "Partners to name",
        bullets: [
          "Mayoral, city council, JP, county clerk, State House/Senate candidates.",
          "County parties, civic groups, youth organizations, community organizations.",
        ],
      },
    ],
    linesToLand: [
      "Help bring the campaign to your community—and help us fill 500 seats on September 17.",
    ],
    asks: ["Join the Grassroots & Guitar Strings planning team now.", "Or propose a local rally/town hall via local signup."],
    watchOuts: [
      "Don’t quote VIP/ticket prices from internal models until legal/compliance locks them.",
      "Event co-chairs ≠ city leadership titles—keep roles clear.",
    ],
    drillDownIds: ["rally", "local-teams", "operation-arkansas"],
  },
  {
    slideId: "youth",
    audiencePath: "/youth",
    timeBox: "~7–8 minutes",
    speaker: "Chance Bradford",
    whyYouAreHere:
      "Own the Youth Coalition story: mission, this weekend’s activations, and a clear invite for ages 16–24 plus adult helpers.",
    whyItMatters:
      "Youth is both weekend energy and a leadership pipeline past Election Day. Adults in the room need a way to help without taking the mic from young people.",
    campaignFit:
      "Youth Coalition feeds campus/community organizing, voter registration, and public presence. It sits alongside Students for Arkansas campus work—tonight keep the public name Youth Coalition (16–24).",
    audienceSees: [
      "Mission for ages 16–24.",
      "Arkadelphia retreat · Hope Watermelon Festival · Clark County Clinton Day Dinner.",
      "Thanks: Dr. Judy Harrison · Kevin Heifner.",
      "Join / Refer / Help CTAs.",
    ],
    openWith: [
      "We’re building the next generation of Arkansas leadership—ages 16 to 24.",
      "This weekend is not hypothetical. We have real work on the ground.",
    ],
    talkingPoints: [
      {
        heading: "Mission (keep crisp)",
        bullets: [
          "Civic engagement and organizing skills.",
          "Voter registration and accurate information.",
          "Campus and community presence.",
          "Learning how to show up in political and community spaces with respect.",
        ],
      },
      {
        heading: "This weekend triad",
        bullets: [
          "Friday — Arkadelphia Youth Retreat: leadership and organizing (recognize Dr. Judy Harrison and Kevin Heifner).",
          "Saturday morning — Hope Watermelon Festival: table work, voter conversations, bright green shirts.",
          "Saturday evening — Clark County Clinton Day Dinner: navigate a political gathering; build relationships.",
        ],
      },
      {
        heading: "Asks",
        bullets: [
          "I am 16–24 and want to join.",
          "I know a young person who should join (refer).",
          "I want to help as an adult mentor / logistics / welcome table.",
        ],
      },
      {
        heading: "Analyst depth (optional)",
        bullets: [
          "Chance also connects to HBCU / campus outreach energy—keep it relational, not résumé-heavy.",
          "Confirm absolute calendar dates with Steve before stating hard dates beyond ‘this weekend’ if the meeting date shifts.",
        ],
      },
    ],
    linesToLand: [
      "If you are 16 to 24, we need you in the room—not watching from the hallway.",
      "If you know a young person who should be here, recruit them before Monday.",
    ],
    asks: ["Join / refer / help via the Youth form tonight."],
    watchOuts: ["Don’t let adults dominate youth space. Invite, then protect young leaders’ ownership."],
    drillDownIds: ["youth-coalition", "calendar-depth"],
  },
  {
    slideId: "local",
    audiencePath: "/local",
    timeBox: "~5 minutes",
    speaker: "Carol Egan",
    whyYouAreHere:
      "Make local ownership concrete. Most people will serve where they live—this is the 75-county machine.",
    whyItMatters:
      "Statewide tours fail without county anchors. Local roles are how visits, registration, media, and GOTV actually happen.",
    campaignFit:
      "Local teams feed Operation Arkansas: prep before Kelly arrives, host events, register voters, and run lawful local GOTV. Works with Sue Farris and volunteer leadership structure.",
    audienceSees: [
      "Eight local role cards.",
      "Join My Local Team CTA.",
      "Sue Farris named as a partner in the work.",
    ],
    openWith: [
      "If you want to help where you live—your city, county, campus, or region—this is your slide.",
      "We need named people in counties, not anonymous good intentions.",
    ],
    talkingPoints: [
      {
        heading: "Walk the eight roles (30–40 seconds each max)",
        bullets: [
          "County Lead Organizer — main campaign connection; builds the team; preps visits.",
          "Local Events — town halls, rallies, festivals, parades, cookouts.",
          "Community Outreach — faith, civic, neighborhood, local candidates.",
          "Local Media — papers, radio, TV, online groups, podcasts.",
          "Voter Registration — accurate info + registration opportunities.",
          "Canvassing — door hangers and respectful neighborhood conversations.",
          "Local GOTV — early vote / Election Day support (lawful; rides; visibility).",
          "Event Host — venue, meet-and-greet, invite Kelly into existing gatherings.",
        ],
      },
      {
        heading: "How to coach the room",
        bullets: [
          "It’s OK to pick one role tonight and grow later.",
          "County leads should also recruit deputies—don’t be a bottleneck.",
          "If you’re unsure, use Help Me Find My Place at the end.",
        ],
      },
    ],
    linesToLand: [
      "Build the campaign where you live—because that’s where Arkansas actually lives.",
    ],
    asks: ["Join My Local Team before you leave tonight.", "Recruit one local partner this week."],
    watchOuts: [
      "Celebrate Carol Egan and Sue Farris without inventing formal org-chart titles beyond what’s confirmed.",
    ],
    drillDownIds: ["local-teams", "volunteer-machine", "calendar-depth"],
  },
  {
    slideId: "campaign",
    audiencePath: "/campaign",
    timeBox: "~7–8 minutes",
    speaker: "Steve (with shout-outs)",
    whyYouAreHere:
      "Staff the statewide operating system. Introduce teams fast, recognize leaders, and push priority openings—especially Sept 17 planning and Project Organizer.",
    whyItMatters:
      "Without statewide teams, local energy never compounds. Logistics, creative, outreach, data, fundraising, and Strike/GOTV are how a statewide race functions.",
    campaignFit:
      "Campaign pathway = cross-county ops. Priority tonight: Grassroots & Guitar Strings planning + Campaign Project Organizer. Recognize Carol/Sue, Leann, Kimberly, Sara, John/Jay.",
    audienceSees: [
      "Priority cards first (G&G + Project Organizer).",
      "Full team grid with recognitions.",
      "Join a Campaign Team CTA.",
    ],
    openWith: [
      "If you can work across county lines—or you have a skill the campaign runs on—this is your lane.",
      "As I name each team, sign up immediately if it’s you.",
    ],
    talkingPoints: [
      {
        heading: "Priority openings (spend time here)",
        bullets: [
          `${RALLY.title} Planning Team — ${RALLY.shortDate}, ${RALLY.artist}, ${RALLY.goal} seats. Recognize ${RALLY.coChairs}.`,
          "Campaign Project Organizer — assign tasks, track deadlines, follow up with leaders, surface bottlenecks. Critical leadership opening.",
        ],
      },
      {
        heading: "Team roll call (name + one sentence + recognize)",
        bullets: [
          "Volunteer Leadership — Carol Egan · Sue Farris — recruit, welcome, place people.",
          "Social & Creative — Leann Solice — design, video, photo, writing, amplifiers.",
          "Logistics & Scheduling — calendar, travel, lodging, materials, prep.",
          "Statewide Outreach — Kimberly Sawyer — media booking, phones, recruitment, promotion.",
          "Data & Technology — Steve/ops — databases, maps, volunteer systems, web.",
          "Grassroots Fundraising — Sara Rampona — community fundraisers, small-dollar (volunteer support; paid fundraising discussed privately).",
          "Strike Teams — Saturday regional deployments (next slide deepens).",
          "Statewide GOTV — final-month turnout machine.",
        ],
      },
    ],
    linesToLand: [
      "Don’t wait for a perfect résumé. If you can own a lane, take a lane tonight.",
    ],
    asks: ["Join a Campaign Team now—especially Sept 17 planning."],
    watchOuts: ["Keep fundraising language careful: volunteer support vs any paid role."],
    drillDownIds: ["campaign-teams", "rally", "volunteer-machine"],
  },
  {
    slideId: "strike-team",
    audiencePath: "/strike-team",
    timeBox: "~3 minutes",
    speaker: "Steve",
    whyYouAreHere:
      "Give Strike Teams a visual identity and a hard goal so travelers self-select.",
    whyItMatters:
      "Kelly’s visits work better when a team arrives first—cookout, music, hangers, conversations. Strike Teams are the weekly rhythm of Operation Arkansas.",
    campaignFit:
      "Five regional teams (NW, NE, SW, SE, Central). Saturdays → Oct 1 goal: five operational teams. Supports tour and GOTV warm-up.",
    audienceSees: [
      "Five regional blocks.",
      "Saturday mission list.",
      "Goal: five active teams by October 1.",
    ],
    openWith: [
      "Five teams. Every Saturday. Communities across Arkansas.",
      "If you can travel—or recruit travelers—this is one of the most fun and consequential lanes.",
    ],
    talkingPoints: [
      {
        heading: "Saturday mission",
        bullets: [
          "Deploy to a priority community ahead of a campaign visit.",
          "Cook hot dogs / hospitality · music · meet residents.",
          "Recruit volunteers · door hangers · neighborhood canvass · promote the upcoming visit.",
        ],
      },
      {
        heading: "Regions",
        bullets: ["Northwest", "Northeast", "Southwest", "Southeast", "Central"],
      },
      {
        heading: "Goals",
        bullets: [
          "Five operational Strike Teams by October 1.",
          "Near-term: fill strike roles in priority counties as part of Labor Day readiness.",
        ],
      },
    ],
    linesToLand: ["We don’t just visit communities. We prepare them—then we return."],
    asks: ["Join a Strike Team / mark willingness to travel on the campaign form."],
    watchOuts: ["Don’t promise specific county deployment dates tonight unless locked."],
    drillDownIds: ["strike-teams", "operation-arkansas", "calendar-depth"],
  },
  {
    slideId: "calendar",
    audiencePath: "/calendar",
    timeBox: "~4–5 minutes",
    speaker: "Steve",
    whyYouAreHere:
      "Convert energy into a timeline. Feature Sept 17, then show near-term youth weekend, Labor Day sprint, and tour/GOTV arc.",
    whyItMatters:
      "People remember what they can put on a calendar. This slide is where ‘I’m in’ becomes ‘I’m free Saturday.’",
    campaignFit:
      "Curated meeting calendar—not the whole campaign OS. Volunteers organize before Kelly arrives. Early voting and Election Day are the back horizon.",
    audienceSees: [
      "Featured Sept 17 rally card.",
      "Tabs: Next 14 Days · Through Labor Day · Statewide Tour.",
    ],
    openWith: [
      "You don’t need the whole calendar—just where we need you next.",
      "Featured: September 17—Grassroots & Guitar Strings.",
    ],
    talkingPoints: [
      {
        heading: "Featured",
        bullets: [
          `${RALLY.title} — ${RALLY.date} — ${RALLY.city} — ${RALLY.artist} — goal ${RALLY.goal}.`,
          "Planning team signup is the main CTA.",
        ],
      },
      {
        heading: "Next 14 days (youth weekend)",
        bullets: [
          "Arkadelphia Youth Retreat — mentors/logistics/welcome.",
          "Hope Watermelon Festival — Youth Coalition table / green shirts.",
          "Clark County Clinton Day Dinner — relationship builders.",
        ],
      },
      {
        heading: "Through Labor Day",
        bullets: [
          "75-county organization sprint.",
          "Operation Arkansas launch window (priority counties still being named—recruit generally).",
          "Festival & community event corridor on September weekends.",
        ],
      },
      {
        heading: "Tour / GOTV horizon",
        bullets: [
          "Statewide community tour after Labor Day.",
          "Strike Team Saturdays through Oct 1.",
          "Final-month GOTV build — Election Day November 3, 2026; early voting context begins mid/late October (analyst date: confirm before stating).",
        ],
      },
    ],
    linesToLand: ["Help organize visits before Kelly arrives—that’s how trust compounds."],
    asks: ["Help with an upcoming event · Join rally planning."],
    watchOuts: ["Don’t dump the entire internal calendar. Stay curated."],
    drillDownIds: ["calendar-depth", "rally", "youth-coalition"],
  },
  {
    slideId: "join",
    audiencePath: "/join",
    timeBox: "0:55–1:00",
    speaker: "Kelly (close) + Steve (mechanics)",
    whyYouAreHere:
      "Close the sale with heart and clarity. Three asks. Keep Sept 17 visible. Get forms filled before people leave Zoom.",
    whyItMatters:
      "Without a commitment moment, the meeting was inspiration. With it, you leave with a roster.",
    campaignFit:
      "Local vs Campaign vs Match vs Youth—four doors into the same machine. Closing narrative ties nine months of listening to the next chapter volunteers will write.",
    audienceSees: [
      "Immediate Sept 17 planning ask.",
      "Local · Campaign · Help Me Decide · Youth.",
      "Closing challenge: one team · one recruit · one action.",
    ],
    openWith: [
      "Where will you help build this campaign?",
      "If you only do one thing tonight: pick a team—and if you can, join September 17 planning.",
    ],
    talkingPoints: [
      {
        heading: "Order of asks",
        bullets: [
          "1) Grassroots & Guitar Strings planning (urgent, time-bound).",
          "2) Local Involvement.",
          "3) Campaign Involvement.",
          "4) Help Me Find My Place / Youth Coalition.",
        ],
      },
      {
        heading: "Three closing commitments",
        bullets: [
          "Join one leadership team.",
          "Recruit one additional volunteer before next Monday.",
          "Stay engaged as we launch Operation Arkansas after Labor Day.",
        ],
      },
      {
        heading: "What Steve should do while Kelly closes",
        bullets: [
          "Drop the signup links in chat.",
          "Call out that thank-you confirmation means they’re on the team.",
          "Offer a 2-minute stay-after for people who are unsure.",
        ],
      },
    ],
    linesToLand: [
      "Nine months ago this campaign started with a belief that Arkansas deserves leaders who listen more than they talk… Tonight we’re asking you to help write the next chapter.",
      "Every county matters. Every volunteer matters. Every conversation matters.",
    ],
    asks: ["Forms in chat now. Don’t leave without choosing a door."],
    watchOuts: ["Don’t introduce new strategy here. Close."],
    drillDownIds: ["closing-commitments", "rally", "volunteer-machine"],
  },
];

export const DRILL_DOWNS: DrillDown[] = [
  {
    id: "meeting-design",
    title: "Meeting Design: Inspire → Inform → Recruit → Commit",
    subtitle: "How the hour is supposed to work",
    relatedSlideIds: ["welcome", "why", "join"],
    sections: [
      {
        heading: "Rule of the night",
        bullets: [
          "If a topic doesn’t move Inspire, Inform, Recruit, or Commit—it belongs in a follow-up.",
          "Presenters should interrupt themselves to point at signup CTAs when energy peaks.",
          "Success is a roster, not applause.",
        ],
      },
      {
        heading: "Suggested minute map",
        bullets: [
          "0:00 Steve welcome & scoreboard",
          "Kelly vision + elections (emotional + institutional center)",
          "Steve strategy + events + rally ask",
          "Chance youth",
          "Carol local",
          "Steve campaign teams + strike + calendar",
          "Kelly close + forms",
        ],
      },
      {
        heading: "Presenter discipline",
        bullets: [
          "One job per section.",
          "Land the lines—then stop talking.",
          "Hand off cleanly; don’t re-summarize the whole campaign on every slide.",
        ],
      },
    ],
  },
  {
    id: "kelly-trust",
    title: "Kelly’s Trust Doctrine",
    subtitle: "Listen · Trust · Serve",
    relatedSlideIds: ["vision", "elections"],
    sections: [
      {
        heading: "Why this is the campaign’s center of gravity",
        bullets: [
          "People grant attention after they grant trust.",
          "Travel and listening are not branding—they are the method.",
          "Rural show-up is a strategic choice, not a photo-op.",
        ],
      },
      {
        heading: "Language that fits Kelly",
        bullets: [
          "Steady. Respectful. Local. Competent.",
          "Opposing voices at the table.",
          "Accountability without personal destruction.",
          "Government that works for citizens.",
        ],
      },
      {
        heading: "What not to do",
        bullets: [
          "Don’t sneer at distrust—answer it with transparency.",
          "Don’t invent opponent claims.",
          "Don’t oversell; under-promise and show up.",
        ],
      },
    ],
  },
  {
    id: "elections-citizen-power",
    title: "Elections, Access & Citizen Power",
    subtitle: "SOS office framing for presenters",
    relatedSlideIds: ["elections", "vision"],
    sections: [
      {
        heading: "Partner with local officials",
        bullets: [
          "County clerks and election commissioners run elections day to day.",
          "SOS supports with systems, training, resources, and clarity.",
          "Respect local needs—avoid one rigid statewide posture that ignores county reality.",
        ],
      },
      {
        heading: "Hold two truths",
        bullets: [
          "Security and access belong together.",
          "Some Arkansans have been told elections can’t be trusted—don’t mock them; show the work.",
          "Eligible participation is a feature of a healthy republic.",
        ],
      },
      {
        heading: "Citizen power",
        bullets: [
          "Defend election access.",
          "Defend initiative and referendum pathways.",
          "Defend local decision-making and the ability to hold government accountable.",
          "Deeper opponent-record documentation belongs on a sourced accountability page—not this meeting.",
        ],
      },
    ],
  },
  {
    id: "operation-arkansas",
    title: "Operation Arkansas (Field)",
    subtitle: "75 counties → tour → GOTV",
    relatedSlideIds: ["strategy", "calendar", "strike-team"],
    sections: [
      {
        heading: "Definition for this meeting",
        bullets: [
          "Field Operation Arkansas = organize statewide presence, then travel and mobilize.",
          "Before Labor Day: presence in all 75 counties.",
          "After Labor Day: sustained community tour.",
          "Final month: canvass, Strike Teams, GOTV.",
        ],
      },
      {
        heading: "Method",
        bullets: [
          "Arrive → Listen → Participate → Build → Return → Organize.",
          "Local teams prepare hosts, venues, partners, media, and volunteers before Kelly arrives.",
        ],
      },
      {
        heading: "Naming note for presenters",
        bullets: [
          "Internal website docs also use ‘Operation Arkansas’ for evidence-publishing doctrine.",
          "On stage, stick to the field meaning unless Steve intentionally bridges both.",
        ],
      },
    ],
  },
  {
    id: "rally",
    title: `${RALLY.title}`,
    subtitle: `${RALLY.subtitle} · ${RALLY.shortDate}`,
    relatedSlideIds: ["events", "calendar", "campaign", "join"],
    sections: [
      {
        heading: "Locked for this meeting",
        bullets: [
          `Date: ${RALLY.date}`,
          `Place framing: ${RALLY.city}, ${RALLY.county} County (Central Arkansas GOTV kickoff / Sherwood home-turf energy)`,
          `Artist: ${RALLY.artist}`,
          `Attendance goal: ${RALLY.goal}`,
          `Co-chairs: ${RALLY.coChairs}`,
        ],
      },
      {
        heading: "Still TBD — say this honestly",
        bullets: [
          "Exact venue and doors/time.",
          "Ticket links and public flyer package.",
          "Full run-of-show.",
          "Invite planners to be the people who finish these details in the next 30 days.",
        ],
      },
      {
        heading: "Planning team lanes",
        bullets: [
          "Overall coordination with co-chairs",
          "Tickets / hosts / VIP pathways (compliance-aware)",
          "Hospitality & food",
          "Outreach & turnout to 500",
          "Day-of volunteer crew",
          "Creative / photo / social amplification",
          "Youth Coalition presence if scheduled",
        ],
      },
      {
        heading: "Why 500 matters",
        bullets: [
          "Proof that Central Arkansas can fill a room for a listening/trust campaign—not only for celebrities.",
          "Creates volunteer lists, donor pipelines, and earned media from a real crowd.",
          "Gives Strike Teams and county leads a shared near-term deadline.",
        ],
      },
    ],
  },
  {
    id: "youth-coalition",
    title: "Arkansas Youth Coalition",
    subtitle: "Ages 16–24 · Chance Bradford",
    relatedSlideIds: ["youth", "calendar"],
    sections: [
      {
        heading: "What success looks like",
        bullets: [
          "Young people with real roles—not props.",
          "Weekend activations that teach festival work and political-space navigation.",
          "Adults who support without commandeering.",
        ],
      },
      {
        heading: "This weekend package",
        bullets: [
          "Arkadelphia retreat — leadership/organizing; thank Dr. Judy Harrison & Kevin Heifner.",
          "Hope Watermelon Festival — green shirts, table, voter conversations.",
          "Clark County Clinton Day Dinner — relationship practice.",
        ],
      },
      {
        heading: "Signup pathways",
        bullets: ["Join (16–24)", "Refer a young person", "Help the Youth Coalition (adult support)"],
      },
    ],
  },
  {
    id: "local-teams",
    title: "Local Volunteer Machine",
    subtitle: "Eight roles that cover a county",
    relatedSlideIds: ["local", "events"],
    sections: [
      {
        heading: "Build order (if a county is empty)",
        bullets: [
          "1) County Lead",
          "2) Events + Host capacity",
          "3) Outreach + Media",
          "4) Registration + Canvass",
          "5) GOTV as calendar approaches",
        ],
      },
      {
        heading: "What County Leads owe the campaign",
        bullets: [
          "A living volunteer list",
          "Event ideas with local partners",
          "Honest status on ‘ready for a Kelly visit’",
          "Weekly communication with volunteer leadership",
        ],
      },
      {
        heading: "Lawful GOTV reminder",
        bullets: [
          "Poll support and electioneering must follow Arkansas rules.",
          "Emphasize rides, reminders, visibility, and volunteer coordination—not anything that risks polling-place violations.",
        ],
      },
    ],
  },
  {
    id: "campaign-teams",
    title: "Statewide Campaign Teams",
    subtitle: "Cross-county operating system",
    relatedSlideIds: ["campaign", "strike-team"],
    sections: [
      {
        heading: "Priority tonight",
        bullets: [
          "Grassroots & Guitar Strings planning",
          "Campaign Project Organizer",
        ],
      },
      {
        heading: "Recognition map",
        bullets: [
          "Carol Egan · Sue Farris — Volunteer Leadership",
          "Leann Solice — Social/Creative",
          "Kimberly Sawyer — Statewide Outreach",
          "Sara Rampona — Grassroots Fundraising",
          "John Duke · Jay Powell — G&G event co-chairs",
        ],
      },
      {
        heading: "How to place people quickly",
        bullets: [
          "Skill → team (designer → creative; traveler → strike; organizer → project/volunteer leadership).",
          "If multi-interested: primary + secondary on the form.",
          "Leadership interest checkbox = follow-up, not automatic title.",
        ],
      },
    ],
  },
  {
    id: "strike-teams",
    title: "Traveling Strike Teams",
    subtitle: "Five regions · Saturdays · Oct 1 goal",
    relatedSlideIds: ["strike-team", "strategy"],
    sections: [
      {
        heading: "Identity",
        bullets: [
          "Regional teams that deploy weekly.",
          "Hospitality + music + outreach + canvass + volunteer recruitment.",
          "Purpose: warm the ground before Kelly’s visit and leave organized capacity behind.",
        ],
      },
      {
        heading: "Regions",
        bullets: ["Northwest", "Northeast", "Southwest", "Southeast", "Central"],
      },
      {
        heading: "Hard goal",
        bullets: ["Five operational teams by October 1."],
      },
    ],
  },
  {
    id: "volunteer-machine",
    title: "How Local + Campaign Fit Together",
    subtitle: "One campaign, two doors",
    relatedSlideIds: ["local", "campaign", "why", "join"],
    sections: [
      {
        heading: "Local door",
        bullets: [
          "Geography-first: my county/city/campus.",
          "Primary outcome: presence, events, registration, local GOTV.",
        ],
      },
      {
        heading: "Campaign door",
        bullets: [
          "Function-first: creative, logistics, data, fundraising, strike, statewide GOTV.",
          "Primary outcome: the OS that multiplies local work.",
        ],
      },
      {
        heading: "Both can be true",
        bullets: [
          "Many people will do local + one statewide skill lane.",
          "Match form exists for the unsure—use it; don’t lose them.",
        ],
      },
    ],
  },
  {
    id: "calendar-depth",
    title: "Calendar Depth for Presenters",
    subtitle: "What to emphasize vs park for later",
    relatedSlideIds: ["calendar", "youth", "events"],
    sections: [
      {
        heading: "Always feature",
        bullets: [`${RALLY.shortDate} ${RALLY.title}`],
      },
      {
        heading: "Near-term youth weekend",
        bullets: ["Arkadelphia retreat", "Hope Watermelon Festival", "Clark County Clinton Day Dinner"],
      },
      {
        heading: "Horizons",
        bullets: [
          "Labor Day organization gate",
          "Post–Labor Day tour",
          "Strike Saturdays → Oct 1",
          "GOTV / Election Day (Nov 3, 2026)",
        ],
      },
      {
        heading: "Park for follow-up",
        bullets: [
          "Full festival list",
          "Every county fair",
          "Internal draft events not ready for public",
        ],
      },
    ],
  },
  {
    id: "closing-commitments",
    title: "Closing Commitments",
    subtitle: "What Kelly lands; what Steve executes",
    relatedSlideIds: ["join", "welcome"],
    sections: [
      {
        heading: "Kelly lands",
        bullets: [
          "Story of nine months of listening.",
          "Every county / volunteer / conversation matters.",
          "Three asks: team · recruit · stay for Operation Arkansas.",
        ],
      },
      {
        heading: "Steve executes",
        bullets: [
          "Links in chat",
          "Call out Sept 17 planning",
          "Stay-after for undecided",
          "Capture who needs a personal follow-up tonight",
        ],
      },
      {
        heading: "After the Zoom ends",
        bullets: [
          "Carol/volunteer leadership: sort local signups by county within 24–48 hours.",
          "G&G co-chairs: schedule planning huddle within a week.",
          "Chance: youth follow-ups from the weekend activations.",
        ],
      },
    ],
  },
];

export function getPresenterBrief(slideId: string): PresenterSlideBrief | undefined {
  return PRESENTER_SLIDES.find((s) => s.slideId === slideId);
}

export function getDrillDown(id: string): DrillDown | undefined {
  return DRILL_DOWNS.find((d) => d.id === id);
}

export function presenterSlideIndex(slideId: string): number {
  return PRESENTER_SLIDES.findIndex((s) => s.slideId === slideId);
}

export const PRESENTER_NAV = SLIDES.map((s) => ({
  id: s.id,
  label: s.navLabel,
  path: `/presenter/${s.id}`,
  audiencePath: s.path,
  speaker: s.speaker,
}));
