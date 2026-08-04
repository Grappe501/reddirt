export type Slide = {
  id: string;
  path: string;
  navLabel: string;
  title: string;
  eyebrow?: string;
  speaker?: string;
};

export const SLIDES: Slide[] = [
  { id: "welcome", path: "/", navLabel: "Welcome", title: "75 Counties. One Arkansas. One Team.", eyebrow: "Statewide Volunteer Leadership Kickoff", speaker: "Steve" },
  { id: "why", path: "/why", navLabel: "Why We Are Here", title: "The Campaign Has Reached a Turning Point", eyebrow: "Why we are here", speaker: "Steve" },
  { id: "vision", path: "/vision", navLabel: "Kelly’s Vision", title: "Trust Comes Before Politics", eyebrow: "Kelly’s vision", speaker: "Kelly" },
  { id: "elections", path: "/elections", navLabel: "Elections", title: "Secure Elections. Accessible Elections. Local Trust.", eyebrow: "Elections & citizen power", speaker: "Kelly" },
  { id: "strategy", path: "/strategy", navLabel: "Strategy", title: "County by County. Community by Community.", eyebrow: "Operation Arkansas", speaker: "Steve" },
  { id: "events", path: "/events", navLabel: "Event Model", title: "Help Bring the Campaign to Your Community", eyebrow: "Local event model", speaker: "Steve" },
  { id: "youth", path: "/youth", navLabel: "Youth Coalition", title: "Building the Next Generation of Arkansas Leadership", eyebrow: "Arkansas Youth Coalition", speaker: "Chance Bradford" },
  { id: "local", path: "/local", navLabel: "Local Teams", title: "Build the Campaign Where You Live", eyebrow: "Local involvement", speaker: "Carol Egan" },
  { id: "campaign", path: "/campaign", navLabel: "Campaign Teams", title: "Help Operate the Statewide Campaign", eyebrow: "Statewide campaign involvement", speaker: "Steve" },
  { id: "strike-team", path: "/strike-team", navLabel: "Strike Teams", title: "Five Teams. Every Saturday. Communities Across Arkansas.", eyebrow: "Traveling Strike Teams", speaker: "Steve" },
  { id: "calendar", path: "/calendar", navLabel: "Calendar", title: "Where We Are Going Next", eyebrow: "Campaign calendar", speaker: "Steve" },
  { id: "join", path: "/join", navLabel: "Join Us", title: "Where Will You Help Build This Campaign?", eyebrow: "The commitment moment", speaker: "Kelly" },
];

export const RALLY = {
  title: "Grassroots & Guitar Strings",
  subtitle: "Campaign Get Out the Vote Kickoff Rally",
  date: "Thursday, September 17, 2026",
  shortDate: "September 17",
  city: "Sherwood",
  county: "Pulaski",
  artist: "David Adam Byrnes",
  goal: 500,
  coChairs: "John Duke · Jay Powell",
  detail:
    "Central Arkansas GOTV kickoff with live music. About one month to build a planning team and fill 500 seats. Venue, run-of-show, and ticket details will be published as they lock.",
};

export const LOCAL_ROLES = [
  { id: "county_lead", title: "County Lead Organizer", blurb: "Main campaign connection in your county." },
  { id: "local_events", title: "Local Events Team", blurb: "Town halls, rallies, festivals, and cookouts." },
  { id: "community_outreach", title: "Community Outreach", blurb: "Organizations, faith leaders, neighborhoods." },
  { id: "local_media", title: "Local Media Contact", blurb: "Newspapers, radio, community publications." },
  { id: "voter_registration", title: "Voter Registration", blurb: "Accurate registration opportunities." },
  { id: "canvassing", title: "Canvassing", blurb: "Door hangers and neighborhood outreach." },
  { id: "local_gotv", title: "Local GOTV", blurb: "Early vote and Election Day support." },
  { id: "event_host", title: "Event Host", blurb: "Offer a venue or invite Kelly to an event." },
];

export const CAMPAIGN_TEAMS = [
  { id: "grassroots_guitar_strings", title: "Grassroots & Guitar Strings Planning", blurb: `Priority: plan the ${RALLY.shortDate} GOTV kickoff with ${RALLY.artist} and fill ${RALLY.goal} seats.`, priority: true, recognize: RALLY.coChairs },
  { id: "project_organizer", title: "Campaign Project Organizer", blurb: "Assign tasks, track deadlines, follow up with leaders.", priority: true },
  { id: "volunteer_leadership", title: "Volunteer Leadership", blurb: "Recruit, welcome, and connect people to roles.", recognize: "Carol Egan · Sue Farris" },
  { id: "social_creative", title: "Social Media & Creative", blurb: "Design, video, photography, writing, amplification.", recognize: "Leann Solice" },
  { id: "logistics", title: "Logistics & Scheduling", blurb: "Calendar, travel, lodging, materials." },
  { id: "statewide_outreach", title: "Statewide Outreach", blurb: "Media booking, phone banking, promotion.", recognize: "Kimberly Sawyer" },
  { id: "data_technology", title: "Data & Technology", blurb: "Databases, maps, volunteer systems, websites." },
  { id: "fundraising", title: "Grassroots Fundraising", blurb: "Community fundraisers and small-dollar outreach.", recognize: "Sara Rampona" },
  { id: "strike_team", title: "Traveling Strike Teams", blurb: "Saturday deployments across five regions." },
  { id: "statewide_gotv", title: "Statewide GOTV", blurb: "Final-month turnout operations." },
];

export const COUNTIES = [
  "Arkansas","Ashley","Baxter","Benton","Boone","Bradley","Calhoun","Carroll","Chicot","Clark","Clay","Cleburne","Cleveland","Columbia","Conway","Craighead","Crawford","Crittenden","Cross","Dallas","Desha","Drew","Faulkner","Franklin","Fulton","Garland","Grant","Greene","Hempstead","Hot Spring","Howard","Independence","Izard","Jackson","Jefferson","Johnson","Lafayette","Lawrence","Lee","Lincoln","Little River","Logan","Lonoke","Madison","Marion","Miller","Mississippi","Monroe","Montgomery","Nevada","Newton","Ouachita","Perry","Phillips","Pike","Poinsett","Polk","Pope","Prairie","Pulaski","Randolph","St. Francis","Saline","Scott","Searcy","Sebastian","Sevier","Sharp","Stone","Union","Van Buren","Washington","White","Woodruff","Yell",
];
