import type { EventItem } from "@/content/types";
import { markSuggestedFestivalPath } from "@/lib/festivals/suggest-coverage-path";
import { ARKANSAS_FESTIVAL_EVENTS_2026 } from "./arkansas-festivals-2026";

const movementEventsCore: EventItem[] = [
  {
    slug: "community-service-jacksonville-cleanup-2026",
    title: "Community service — Jacksonville clean-up",
    type: "Community Conversation",
    region: "Central Arkansas",
    countySlug: "pulaski-county",
    status: "upcoming",
    startsAt: "2026-04-25T09:00:00",
    endsAt: "2026-04-25T12:00:00",
    timezone: "America/Chicago",
    locationLabel: "Jacksonville, Arkansas (meetup point on invite or city volunteer thread)",
    addressLine: "Jacksonville, AR (exact staging area—confirm on calendar)",
    summary:
      "Hands-on community clean-up: a Saturday morning service window before other events the same day. Great for volunteers who want to show up with gloves, bags, and neighbor-to-neighbor care.",
    description:
      "This mirrors a personal calendar item titled “Jacksonville clean up” with Kelly Grappe as organizer. A Google Meet is on the original invite, often for coordination; **confirm the physical meeting spot and any waivers** with the host or city. Public listing is for awareness—the campaign is not the permit-holder unless the host says otherwise.",
    whatToExpect: [
      "9:00 a.m.–12:00 p.m. Central (per calendar)",
      "Outdoor or corridor work—watch for host instructions on tools and PPE",
    ],
    whoItsFor: "Volunteers and residents who want a concrete community service block in Jacksonville.",
    organizerNote: "Calendar title: “Jacksonville clean up.” Organizer: Kelly Grappe (per invite). User category: community service.",
    rsvpHref: "https://meet.google.com/wsc-ozuw-knj",
    audienceTags: ["Community service", "Volunteers", "Jacksonville", "Pulaski County"],
    relatedEventSlugs: ["community-argenta-brooks-band-2026", "naacp-jacksonville-inspiring-women-keynote-2026"],
    relatedResourceHrefs: [{ label: "Get involved", href: "/get-involved" }],
    mapCoordinates: { lat: 34.866, lng: -92.11 },
  },
  {
    slug: "community-argenta-brooks-band-2026",
    title: "Community outing — Argenta (Brooks band)",
    type: "Community Conversation",
    region: "Central Arkansas",
    countySlug: "pulaski-county",
    status: "upcoming",
    startsAt: "2026-04-25T14:00:00",
    endsAt: "2026-04-25T15:00:00",
    timezone: "America/Chicago",
    locationLabel: "Argenta / North Little Rock area (see Meet for details from invite)",
    addressLine: "Argenta Arts District, North Little Rock, AR",
    summary:
      "Low-key weekend community time in Argenta around a Brooks band outing—join the thread on the original calendar invite if you need the Meet line for coordination.",
    description:
      "Place and exact venue follow the Google Calendar thread (public site lists the time block and neighborhood). The Meet link on the invite is for coordination as needed; confirm in person with the organizer if you’re unsure of the exact spot.",
    whatToExpect: ["Short window (2:00–3:00 p.m. Central per calendar)", "Neighborhood energy in Argenta", "Optional Meet for folks connecting remotely first"],
    whoItsFor: "Central Arkansas neighbors who want to show up in community without a formal program.",
    organizerNote: "Calendar title: “Argenta to see Brooks band.” Organizer: Kelly Grappe (per invite).",
    rsvpHref: "https://meet.google.com/kqt-qqrs-iyr",
    audienceTags: ["Pulaski County", "North Little Rock"],
    relatedEventSlugs: [
      "community-service-jacksonville-cleanup-2026",
      "democratic-party-fischer-shackelford-dinner-2026",
      "listening-session-little-rock",
    ],
    relatedResourceHrefs: [{ label: "Local organizing", href: "/local-organizing" }],
    mapCoordinates: { lat: 34.756, lng: -92.267 },
  },
  {
    slug: "democratic-party-fischer-shackelford-dinner-2026",
    title: "Fischer–Shackelford dinner (Democratic Party)",
    type: "Community Conversation",
    region: "Central Arkansas",
    countySlug: "pulaski-county",
    status: "upcoming",
    startsAt: "2026-04-25T17:00:00",
    endsAt: "2026-04-25T20:00:00",
    timezone: "America/Chicago",
    locationLabel: "Central Arkansas (venue and ticket—confirm on invite or party channels)",
    addressLine: "TBA (see calendar thread)",
    summary:
      "An Arkansas Democratic Party–associated evening event on the same day as the Argenta outing. Verify ticket, address, and host details before travel.",
    description:
      "This listing reflects a personal/organizer calendar item titled “Fischer Shackelford dinner,” with Kelly Grappe as organizer. The site treats it as a **state or local Democratic Party** dinner for awareness—not an official **campaign** event unless the campaign is named on the ticket. A Google Meet link is on the original invite, often for coordination; confirm the in-person venue separately.",
    whatToExpect: [
      "Evening time block: 5:00–8:00 p.m. Central (per invite)",
      "Party fundraising or organizing dinner—expect ticket or RSVP rules from hosts",
    ],
    whoItsFor: "Arkansas Democrats, supporters, and invited guests; not a general-audience open house unless promoted that way.",
    organizerNote: "User-designated: Democratic Party event. Calendar title: “Fischer Shackelford dinner.” Organizer: Kelly Grappe (per invite).",
    rsvpHref: "https://meet.google.com/xwu-hjgw-ioj",
    audienceTags: ["Democratic Party", "Central Arkansas", "Pulaski County"],
    relatedEventSlugs: [
      "community-service-jacksonville-cleanup-2026",
      "community-argenta-brooks-band-2026",
    ],
    relatedResourceHrefs: [{ label: "Get involved", href: "/get-involved" }],
    mapCoordinates: { lat: 34.75, lng: -92.29 },
  },
  {
    slug: "beans-cornbread-elks-fundraiser-2026",
    title: "Beans and Cornbread fundraiser (Elks Club)",
    type: "Community Conversation",
    region: "Central Arkansas",
    countySlug: "garland-county",
    status: "upcoming",
    startsAt: "2026-04-29T18:00:00",
    endsAt: "2026-04-29T21:00:00",
    timezone: "America/Chicago",
    locationLabel: "Elks Club — Hot Springs area (confirm city and room with host)",
    addressLine: "Hot Springs, AR — exact Elks address from event coordinator",
    summary:
      "Community fundraiser evening: beans-and-cornbread style program at the Elks. Event coordinator Tina Stauffer confirmed Kelly is expected; welcome table, tickets, and parking follow the host committee’s plan.",
    description:
      "Sourced from a coordinator email (Tina Stauffer) inviting Kelly to the **Beans and Cornbread** fundraiser on **April 29** at the **Elks Club**. **Time on the public site is a typical evening placeholder (6:00–9:00 p.m. Central)** until the host publishes a schedule. **City** is placed in **Hot Springs / Garland County** to match related local community context in your calendar thread—if your chapter is elsewhere, update the county and map in content. This is a **third-party community benefit** unless the campaign is named on the invitation.",
    whatToExpect: [
      "Evening food, program, and fundraising flow set by the host committee",
      "Confirm ticket price, dress, and Elks address before sharing widely",
    ],
    whoItsFor: "Supporters of the host organization, invited guests, and neighbors who RSVP through the official channel.",
    organizerNote:
      "Coordinator: Tina Stauffer (Event Coordinator), per confirmation email. User category: community event. Verify date/time/location on the final flyer or ticket.",
    rsvpHref: undefined,
    audienceTags: ["Community", "Fundraiser", "Hot Springs", "Garland County"],
    relatedEventSlugs: ["community-conversation-hot-springs-elections-2026"],
    relatedResourceHrefs: [{ label: "Get involved", href: "/get-involved" }],
    mapCoordinates: { lat: 34.51, lng: -93.05 },
  },
  {
    slug: "naacp-jacksonville-inspiring-women-keynote-2026",
    title: "Inspiring Women of Yesterday, Today, and Tomorrow — NAACP Jacksonville (keynote)",
    type: "Town Hall",
    region: "Central Arkansas",
    countySlug: "pulaski-county",
    status: "upcoming",
    startsAt: "2026-04-30T18:00:00",
    endsAt: "2026-04-30T20:00:00",
    timezone: "America/Chicago",
    locationLabel: "Jacksonville Community Center",
    addressLine: "Jacksonville, AR (confirm room and parking with NAACP Jacksonville Branch #6289)",
    summary:
      "WIN (Women in the NAACP) presents an evening program with **Kelly Grappe as keynote speaker** on **leadership, hope, and perseverance**. Also on the agenda: **Youth Innovator** and **Leadership / Community Impact** awards.",
    description:
      "Official invitation (Apr 2026) from **Tricia Maddox**, Committee Chair, WIN, **NAACP Jacksonville, AR Branch (#6289)**. The host frames the keynote around inspiration and community—not a substitute for the branch’s own marketing. **Tickets:** additional guests beyond the speaker’s complimentary plus-one may register through the host’s **Zeffy** page. Public site end time is a **two-hour placeholder** until the program is published.",
    whatToExpect: [
      "6:00 p.m. start (Central) per formal invitation",
      "Awards segment and keynote; follow host rules for photos and recording",
    ],
    whoItsFor: "Jacksonville-area neighbors, NAACP members, and guests supporting women’s leadership stories in the community.",
    organizerNote:
      "Keynote confirmed per official PDF. Contact: Tricia Maddox, 501-952-3777, win@naacpjvark.org. Branch site: naacpjvark.org.",
    rsvpHref:
      "https://www.zeffy.com/en-US/ticketing/inspiring-women-of-yesterday-today-and-tomorrow",
    audienceTags: ["NAACP", "Jacksonville", "Pulaski County", "Town hall", "Keynote"],
    relatedEventSlugs: ["community-service-jacksonville-cleanup-2026"],
    relatedResourceHrefs: [
      { label: "NAACP Jacksonville branch", href: "https://www.naacpjvark.org" },
      { label: "Get involved", href: "/get-involved" },
    ],
    mapCoordinates: { lat: 34.866, lng: -92.11 },
  },
  {
    slug: "edensong-heber-springs-2026",
    title: "Edensong in Heber Springs (with Carol Hutto)",
    type: "Community Conversation",
    region: "North Central Arkansas",
    countySlug: "cleburne-county",
    status: "upcoming",
    startsAt: "2026-05-03T13:00:00",
    endsAt: "2026-05-03T16:00:00",
    timezone: "America/Chicago",
    locationLabel: "Heber Springs — host venue (confirm on calendar or with Carol / organizers)",
    addressLine: "Heber Springs, AR (street address TBA; Greers Ferry Lake area / Cleburne County)",
    summary:
      "A Sunday afternoon **community music / program** in **Heber Springs** with **Carol Hutto** and **Edensong**—the invite notes a **show at 2:00 p.m.** within a **1:00–4:00 p.m. Central** window. Great for local culture calendars and neighbor-to-neighbor visibility.",
    description:
      "This reflects a personal calendar item **“Edensong in Heber with carol Hutto. Show at 2”** with Kelly Grappe as organizer. The site does **not** have the final venue; use the **Google Meet** for coordination, carpool, or remote touch-in as needed, and **confirm the performance location** in town before you publish a pin. **Not** a campaign event unless the host lists the campaign; third-party community listing for field awareness only.",
    whatToExpect: [
      "Typical small-town community performance energy—arrive a little early if seating is open",
      "If “show at 2” is the main set, the rest of the block may be pre-show or social time",
    ],
    whoItsFor: "Cleburne County neighbors, music supporters, and visitors around Greers Ferry Lake communities.",
    organizerNote:
      "User category: community event. Calendar title: “Edensong in Heber with carol Hutto. Show at 2.” Organizer: Kelly Grappe (per invite).",
    rsvpHref: "https://meet.google.com/fgb-atpu-rfq",
    audienceTags: ["Heber Springs", "Cleburne County", "Music", "Community"],
    relatedEventSlugs: ["naacp-jacksonville-inspiring-women-keynote-2026", "brunch-with-teresa-2026"],
    relatedResourceHrefs: [{ label: "Local organizing", href: "/local-organizing" }],
    mapCoordinates: { lat: 35.491, lng: -92.031 },
  },
  {
    slug: "brunch-with-teresa-2026",
    title: "Brunch with Teresa",
    type: "Community Conversation",
    region: "Central Arkansas",
    status: "upcoming",
    startsAt: "2026-05-09T11:00:00",
    endsAt: "2026-05-09T14:00:00",
    timezone: "America/Chicago",
    locationLabel: "Host venue or hybrid — confirm on calendar thread (Meet on invite for coordination)",
    addressLine: "Arkansas (street address from host when available)",
    summary:
      "Saturday **brunch / lunch block** with host Teresa—social time to connect before the late-spring field push. Use the original calendar thread for the **in-person** spot; the Meet link is there for coordination if needed.",
    description:
      "Mirrors a Google Calendar item **“Brunch with Teresa”** with Kelly Grappe as organizer. **11:00 a.m.–2:00 p.m. Central** per the invite. No public address was in the paste—**ask Teresa or check the thread** before sharing a map pin. Not a campaign-hosted meal unless the campaign is named on the invitation.",
    whatToExpect: [
      "Midday meal window (brunch/lunch)",
      "Friendly check-in—good for relationship building and schedule alignment",
    ],
    whoItsFor: "Invited guests and anyone the host opens the table to.",
    organizerNote:
      "User category: lunch/brunch event. Calendar title: “Brunch with Teresa.” Organizer: Kelly Grappe (per invite).",
    rsvpHref: "https://meet.google.com/vwv-nerr-gdo",
    audienceTags: ["Brunch", "Central Arkansas"],
    relatedEventSlugs: ["faith-visit-tabernacle-of-faith-wynne-2026", "listening-session-little-rock"],
    relatedResourceHrefs: [{ label: "Get involved", href: "/get-involved" }],
  },
  {
    slug: "faith-visit-tabernacle-of-faith-wynne-2026",
    title: "Faith visit — Tabernacle of Faith (Wynne)",
    type: "Community Conversation",
    region: "Upper Delta",
    countySlug: "cross-county",
    status: "upcoming",
    startsAt: "2026-05-17T15:00:00",
    endsAt: "2026-05-17T18:00:00",
    timezone: "America/Chicago",
    locationLabel: "Tabernacle of Faith — Wynne",
    addressLine: "Wynne, AR 72396 (ZIP from calendar; confirm street address with the congregation or host)",
    summary:
      "A Sunday afternoon **faith visit** in Cross County: worship, conversation, or program time with the **Tabernacle of Faith** community in **Wynne**—arrive in a spirit of respect and follow the congregation’s house norms for visitors.",
    description:
      "From the Google Calendar invite: **“Tabernacle of faith,”** **May 17, 2026, 3:00–6:00 p.m. Central,** with location **Wynne, AR 72396** and Kelly Grappe as organizer. A **Google Meet** is on the thread—often for carpool, backup, or hybrid planning; **confirm the physical campus or sanctuary** with the church. This listing is for **field awareness**; it is not a campaign-organized service unless the campaign is named in the program.",
    whatToExpect: [
      "Afternoon three-hour block on the host calendar (may include travel or fellowship—confirm)",
      "Dress and media rules follow the congregation’s culture",
    ],
    whoItsFor: "Members, visitors, and invited guests in community with the host faith body.",
    organizerNote:
      "User category: faith visit. Calendar title: “Tabernacle of faith.” Organizer: Kelly Grappe (per invite).",
    rsvpHref: "https://meet.google.com/pna-qvfz-kuy",
    audienceTags: ["Faith communities", "Wynne", "Cross County"],
    relatedEventSlugs: ["wynne-farmfest-2026", "listening-session-little-rock"],
    relatedResourceHrefs: [{ label: "Get involved", href: "/get-involved" }],
    mapCoordinates: { lat: 35.2506, lng: -90.7898 },
  },
  {
    slug: "listening-session-little-rock",
    title: "Listening Session — Little Rock neighborhoods",
    type: "Listening Session",
    region: "Central Arkansas",
    countySlug: "pulaski-county",
    status: "upcoming",
    startsAt: "2026-05-18T18:00:00",
    endsAt: "2026-05-18T19:30:00",
    timezone: "America/Chicago",
    locationLabel: "Community space — TBA",
    addressLine: "Little Rock, AR (exact address after RSVP)",
    summary: "A no-agenda night to name what’s breaking trust locally—and what neighbors want next.",
    description:
      "This isn’t a speech and it isn’t a debate. Facilitators keep time, take notes, and make sure quieter voices get room. You’ll leave with clarity on shared concerns and optional next steps.",
    whatToExpect: [
      "Ground rules rooted in respect",
      "Small-group listening rotations",
      "Public themes captured (no forced agreement)",
    ],
    whoItsFor: "Residents of Pulaski County who want to be heard—even if you’ve checked out of politics.",
    organizerNote: "Placeholder organizer line—Script 5 can sync names from Mobilize or CRM.",
    rsvpHref: undefined,
    audienceTags: ["Neighbors", "Faith communities"],
    relatedEventSlugs: ["volunteer-training-central-ark"],
    relatedResourceHrefs: [{ label: "Host your own session", href: "/host-a-gathering" }],
  },
  {
    slug: "volunteer-training-central-ark",
    title: "Volunteer Training — Central Arkansas cohort",
    type: "Volunteer Training",
    region: "Central Arkansas",
    countySlug: "pulaski-county",
    status: "upcoming",
    startsAt: "2026-05-25T17:30:00",
    endsAt: "2026-05-25T20:00:00",
    timezone: "America/Chicago",
    locationLabel: "Hybrid — Zoom + in-person hub",
    summary: "Practical skills for neighbor-to-neighbor organizing: listening, mapping, follow-through.",
    description:
      "You’ll practice short conversations, learn how teams debrief without drama, and walk away with a simple plan for your next 10 doors or calls.",
    whatToExpect: ["Roleplays (kind, not corny)", "A printed one-page field plan", "Mentor pairing options"],
    whoItsFor: "New volunteers and returning organizers who want a shared baseline.",
    organizerNote: "Training team placeholder.",
    audienceTags: ["Volunteers", "Youth"],
    relatedEventSlugs: ["listening-session-little-rock"],
    relatedResourceHrefs: [{ label: "Toolkit: first gathering", href: "/resources#toolkit" }],
  },
  {
    slug: "community-conversation-hot-springs-elections-2026",
    title: "Community Conversation — Hot Springs: Elections",
    type: "Community Conversation",
    region: "Central Arkansas",
    countySlug: "garland-county",
    status: "upcoming",
    startsAt: "2026-05-26T17:30:00",
    endsAt: "2026-05-26T21:00:00",
    timezone: "America/Chicago",
    locationLabel: "The Jewish Center, Hot Springs",
    addressLine: "300 Quapaw Ave, Hot Springs, AR",
    summary: "“Elections: Fair and Secure?” — a community program with local partners (VCK). Arrive 5:30; program at 6:00 p.m.",
    description:
      "In-person at The Jewish Center. A Google Meet line is on the original invite (meet.google.com) for those who need remote access; phone dial-in is also on the calendar invite. Details were coordinated by community organizers, including Kelly Grappe. Contact 501-620-0427 with questions (per host outreach).",
    whatToExpect: [
      "Doors 5:30, program on time at 6:00 p.m. Central",
      "Space for discussion on elections, integrity, and what fair process looks like locally",
    ],
    whoItsFor: "Garland County and Hot Springs area neighbors, including partners promoting the program.",
    organizerNote: "Community partner program; titles on invites may list “Hot Springs Election Conversation.”",
    rsvpHref: "https://meet.google.com/utc-cnjr-fwh",
    audienceTags: ["Garland County", "Hot Springs"],
    relatedEventSlugs: [
      "beans-cornbread-elks-fundraiser-2026",
      "town-hall-garland-library-election-concerns-braver-angels-2026",
    ],
    relatedResourceHrefs: [{ label: "Get involved", href: "/get-involved" }],
    mapCoordinates: { lat: 34.51, lng: -93.05 },
  },
  {
    slug: "extension-homemakers-state-convention-2026",
    title: "Arkansas Extension Homemakers — state convention (EH club)",
    type: "Community Conversation",
    region: "Statewide",
    status: "upcoming",
    startsAt: "2026-06-03T08:00:00",
    endsAt: "2026-06-05T18:00:00",
    timezone: "America/Chicago",
    locationLabel: "State convention — venue & host city TBA (confirm with EHC / county council)",
    addressLine: "Arkansas (exact site from official program when published)",
    summary:
      "The annual **Arkansas Extension Homemakers** (EH) state gathering—workshops, business sessions, and fellowship for club members from across counties. Calendar hold: **Wednesday–Friday**, multi-day, **daily** schedule.",
    description:
      "This mirrors a Google Calendar item **“Ext homemakers club convention”** (June 3–5, 2026) with Kelly Grappe as organizer. The **Arkansas Extension Homemakers** network works through local clubs (including activities like the Petit Jean EH club’s public events). **Start/end times** on the public site are a **placeholder window**—real session blocks follow the official program. **Not** a campaign event unless the host lists the campaign; list for field awareness and travel planning. **Note:** you may have other local commitments the same week (e.g. community conversations)—check the map.",
    whatToExpect: [
      "Multi-day, daytime-heavy programming typical of state home-extension assemblies",
      "Opportunities to connect with county and state volunteer leaders in community programs",
    ],
    whoItsFor: "EHC / Extension Homemakers members, invited guests, and partners supporting family & community education.",
    organizerNote:
      "Calendar: Extension Homemakers club convention, daily Wed Jun 3–Fri Jun 5, 2026. Organizer: Kelly Grappe (per invite). User category: EH club meeting / convention.",
    rsvpHref: undefined,
    audienceTags: ["Extension Homemakers", "EHC", "Convention", "Statewide"],
    relatedEventSlugs: ["petit-jean-lake-bailey-canoe-race-2026", "community-conversation-benton"],
    relatedResourceHrefs: [{ label: "Get involved", href: "/get-involved" }],
  },
  {
    slug: "community-conversation-benton",
    title: "Community Conversation — Benton",
    type: "Community Conversation",
    region: "Central Arkansas",
    countySlug: "saline-county",
    status: "upcoming",
    startsAt: "2026-06-04T19:00:00",
    endsAt: "2026-06-04T20:15:00",
    timezone: "America/Chicago",
    locationLabel: "Downtown Benton — venue TBA",
    summary: "A smaller circle format—coffee, names, and honest questions about what’s working and what isn’t.",
    description:
      "Designed for 15–35 people. We’ll use a simple question stack and end with optional commitments—nothing heavy, nothing performative.",
    whatToExpect: ["Name + place intros", "Two rounds of focused questions", "Optional signup for follow-up"],
    whoItsFor: "Saline County residents curious about building local power without the usual political theater.",
    organizerNote: "Local host team forming—details finalized soon.",
    audienceTags: ["Saline County"],
    relatedEventSlugs: [],
    relatedResourceHrefs: [{ label: "Start a local team", href: "/start-a-local-team" }],
  },
  {
    slug: "town-hall-garland-library-election-concerns-braver-angels-2026",
    title: "Town hall — Election concerns (Garland County Library · Braver Angels)",
    type: "Town Hall",
    region: "Central Arkansas",
    countySlug: "garland-county",
    status: "upcoming",
    startsAt: "2026-06-07T14:00:00",
    endsAt: "2026-06-07T16:00:00",
    timezone: "America/Chicago",
    locationLabel: "Garland County Library, Hot Springs",
    addressLine: "1427 Malvern Ave, Hot Springs National Park, AR (confirm room with library or host)",
    summary:
      "Panel-style community conversation on **election concerns**, part of a monthly first-Sunday series (2:00–4:00 p.m.). Co-presented by **Braver Angels Arkansas** and **Garland County Library**; facilitated by Cathi Kindt. Typical attendance ~20; format emphasizes listening across difference.",
    description:
      "This follows email correspondence (Cathi Kindt, April 2026): the **June 7** session is offered on the topic of **election process concerns** for Garland County residents. **Ground rules from the series:** it is **not** promoted as a candidate campaign rally—participants with public roles join as **citizens** in a structured conversation, not to pitch an organization or platform. A **separate, candidacy-focused listening session** at another time remains an option Cathi offered to discuss. The campaign lists this for **field awareness and integrity of host expectations**; RSVP and room details should match the library’s or Braver Angels’ public post when available.",
    whatToExpect: [
      "Two-hour facilitated block (2:00–4:00 p.m. Central per series pattern)",
      "Small-group norms: curiosity, civil disagreement, and local election-process concerns—not stump speeches",
    ],
    whoItsFor: "Garland County residents who want a moderated forum on how elections work and where trust breaks down.",
    organizerNote:
      "User-designated: town hall / panel type. Facilitator: Cathi Kindt. Partners: Braver Angels Arkansas + Garland County Library. Intro: Judy Dare. Kelly copies campaign manager Steve on planning. May 4 topic in series: “Social Equity” (per host).",
    rsvpHref: undefined,
    audienceTags: ["Garland County", "Hot Springs", "Town hall", "Elections", "Braver Angels"],
    relatedEventSlugs: ["community-conversation-hot-springs-elections-2026"],
    relatedResourceHrefs: [
      { label: "Get involved", href: "/get-involved" },
      { label: "Braver Angels", href: "https://braverangels.org/" },
    ],
    mapCoordinates: { lat: 34.507, lng: -93.056 },
  },
  {
    slug: "democratic-party-montgomery-county-meeting-2026",
    title: "Montgomery County Democrats — county meeting (Kelly speaking)",
    type: "Community Conversation",
    region: "Central Arkansas",
    countySlug: "montgomery-county",
    status: "upcoming",
    startsAt: "2026-06-17T17:00:00",
    endsAt: "2026-06-17T20:00:00",
    timezone: "America/Chicago",
    locationLabel: "Montgomery County (venue or hybrid—confirm on party channels or invite)",
    addressLine: "Mount Ida, AR (typical county seat; verify meeting location)",
    summary:
      "Arkansas Democratic Party county meeting for Montgomery County. Kelly is scheduled to speak—confirm start time, format (in-person, hybrid, or online), and any membership rules with the county party.",
    description:
      "This reflects a personal calendar event titled “Montgomery county meeting” with Kelly Grappe as organizer. The site categorizes it as a **county Democratic Party** meeting, not a separate campaign-only rally, unless the party advertises it that way. The Google Meet on the original invite may be the full program or a coordination line—**confirm with the county chair or host** before publicizing a physical address.",
    whatToExpect: [
      "5:00–8:00 p.m. Central time block (per calendar)",
      "County party business, speakers, and possible committee votes—follow local party norms",
    ],
    whoItsFor: "Montgomery County Democrats, invited guests, and local chairs following party procedure.",
    organizerNote:
      "User-designated: Democratic county party meeting; Kelly speaking. Calendar title: “Montgomery county meeting.” Organizer: Kelly Grappe (per invite).",
    rsvpHref: "https://meet.google.com/fcw-suqq-uxf",
    audienceTags: ["Democratic Party", "Montgomery County", "Mount Ida"],
    relatedEventSlugs: ["democratic-party-fischer-shackelford-dinner-2026"],
    relatedResourceHrefs: [{ label: "Get involved", href: "/get-involved" }],
    mapCoordinates: { lat: 34.556, lng: -93.634 },
  },
  {
    slug: "russellville-mary-ella-voter-registration-2026",
    title: "Russellville — Mary Ella voter registration (community event)",
    type: "Community Conversation",
    region: "North Central Arkansas",
    countySlug: "pope-county",
    status: "upcoming",
    startsAt: "2026-09-15T10:00:00",
    endsAt: "2026-09-15T16:00:00",
    timezone: "America/Chicago",
    locationLabel: "Russellville — “Mary Ella” site or program (table/staging TBA on calendar thread)",
    addressLine: "Russellville, AR (exact address with host; confirm whether Mary Ella is a school, site, or partner name)",
    summary:
      "Neighborhood-style voter registration help in Russellville, tied in the calendar to “Mary Ella.” Bring ID rules handouts, clipboards, and a plan for who covers lunch if it’s a long table day.",
    description:
      "This mirrors a Google Calendar all-day block titled “Russellville Mary Ella voter reg” with Kelly Grappe as organizer. **The public site uses a 10:00 a.m.–4:00 p.m. window as a tabling-style placeholder**—update when the host publishes the real start/stop. “Mary Ella” is left as a **local name** the host can clarify (building, program, or partner). The campaign is listed for **awareness and coordination**; check Arkansas voter registration law and any training the county clerk or party requires for volunteers.",
    whatToExpect: [
      "Voter reg basics: check IDs and deadlines with the official Arkansas Secretary of State / county clerk resources",
      "Public tables need shade, water, and line-control courtesy if foot traffic is heavy",
    ],
    whoItsFor: "River Valley residents who need to register, update, or get questions answered before election deadlines.",
    organizerNote:
      "User category: community event. Calendar title: “Russellville Mary Ella voter reg.” Organizer: Kelly Grappe (per invite). All-day on calendar; times here are a placeholder for field planning.",
    rsvpHref: undefined,
    audienceTags: ["Russellville", "Pope County", "Voter registration", "Community"],
    relatedEventSlugs: ["river-valley-food-truck-russellville-2026"],
    relatedResourceHrefs: [
      { label: "Voter registration (site hub)", href: "/voter-registration" },
    ],
    mapCoordinates: { lat: 35.278, lng: -93.137 },
  },
  {
    slug: "direct-democracy-briefing-statewide",
    title: "Direct Democracy Briefing (statewide Zoom)",
    type: "Direct Democracy Briefing",
    region: "Statewide",
    status: "past",
    startsAt: "2026-03-12T18:30:00",
    endsAt: "2026-03-12T20:00:00",
    timezone: "America/Chicago",
    locationLabel: "Online",
    summary: "How initiatives and referendums work—and how Arkansans can defend ballot access responsibly.",
    description:
      "Recording and slides will be posted to Resources after legal review. This session emphasized education, not petition language.",
    whatToExpect: [],
    whoItsFor: "Anyone considering civic action beyond election day.",
    organizerNote: "Past event archive placeholder.",
    relatedEventSlugs: [],
    relatedResourceHrefs: [{ label: "Direct democracy pillar page", href: "/direct-democracy" }],
  },
];

export const events: EventItem[] = markSuggestedFestivalPath([...movementEventsCore, ...ARKANSAS_FESTIVAL_EVENTS_2026]);

export const eventTypes = [
  "Town Hall",
  "Community Conversation",
  "House Gathering",
  "Volunteer Training",
  "Direct Democracy Briefing",
  "Fairs and Festivals",
  "Labor / Worker Roundtable",
  "Youth Civic Session",
  "Listening Session",
] as const;

/**
 * Options for the Movement /events Audience filter. Includes tags that appear on any event, plus
 * standard buckets (e.g. `Youth`) so the dropdown is complete even before content is tagged.
 */
export function listMovementEventAudienceOptions(): string[] {
  const fromEvents = events.flatMap((e) => e.audienceTags ?? []);
  const extras: string[] = ["Youth", "Families", "All ages"];
  return [...new Set([...fromEvents, ...extras])].sort((a, b) => a.localeCompare(b));
}

export function getEventBySlug(slug: string): EventItem | undefined {
  return events.find((e) => e.slug === slug);
}

export function listEventSlugs(): string[] {
  return events.map((e) => e.slug);
}
