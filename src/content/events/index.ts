import type { EventItem } from "@/content/types";
import { markSuggestedFestivalPath } from "@/lib/festivals/suggest-coverage-path";

/** Fair research dump — operator/Evidence only; not merged into the public `/events` hub (Phase 1). */
export { ARKANSAS_FESTIVAL_EVENTS_2026 } from "./arkansas-festivals-2026";

const movementEventsCore: EventItem[] = [
  {
    slug: "community-service-jacksonville-cleanup-2026",
    title: "Community service — Jacksonville clean-up",
    type: "Community Conversation",
    region: "Central Arkansas",
    countySlug: "pulaski-county",
    status: "past",
    startsAt: "2026-04-25T09:00:00",
    endsAt: "2026-04-25T12:00:00",
    timezone: "America/Chicago",
    locationLabel: "Jacksonville, Arkansas (meeting spot shared with volunteers)",
    addressLine: "Jacksonville, AR (exact staging area TBA)",
    summary:
      "Hands-on community clean-up: a Saturday morning service window before other events the same day. Great for volunteers who want to show up with gloves, bags, and neighbor-to-neighbor care.",
    description:
      "This lists a community calendar item titled “Jacksonville clean up” with Kelly Grappe as organizer. A Google Meet is on the original invite, often for coordination; **confirm the physical meeting spot and any waivers** with the host or city. Public listing is for awareness—the campaign is not the permit-holder unless the host says otherwise.",
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
    status: "past",
    startsAt: "2026-04-25T14:00:00",
    endsAt: "2026-04-25T15:00:00",
    timezone: "America/Chicago",
    locationLabel: "Argenta / North Little Rock area (venue TBA)",
    addressLine: "Argenta Arts District, North Little Rock, AR",
    summary:
      "Low-key weekend community time in Argenta around a Brooks band outing—confirm details with the host if you need coordination.",
    description:
      "Public site lists the time block and neighborhood. Confirm the exact spot with the organizer if you are unsure.",
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
    relatedResourceHrefs: [{ label: "Start a local team", href: "/start-a-local-team" }],
    mapCoordinates: { lat: 34.756, lng: -92.267 },
  },
  {
    slug: "democratic-party-fischer-shackelford-dinner-2026",
    title: "Fischer–Shackelford dinner (Democratic Party)",
    type: "Community Conversation",
    region: "Central Arkansas",
    countySlug: "pulaski-county",
    status: "past",
    startsAt: "2026-04-25T17:00:00",
    endsAt: "2026-04-25T20:00:00",
    timezone: "America/Chicago",
    locationLabel: "Central Arkansas (venue and ticket—confirm on invite or party channels)",
    addressLine: "Venue TBA",
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
    status: "past",
    startsAt: "2026-04-29T18:00:00",
    endsAt: "2026-04-29T21:00:00",
    timezone: "America/Chicago",
    locationLabel: "Elks Club — Hot Springs area (confirm city and room with host)",
    addressLine: "Hot Springs, AR — exact Elks address from event coordinator",
    summary:
      "Community fundraiser evening: beans-and-cornbread style program at the Elks. Event coordinator Tina Stauffer confirmed Kelly is expected; welcome table, tickets, and parking follow the host committee’s plan.",
    description:
      "Sourced from a coordinator email (Tina Stauffer) inviting Kelly to the **Beans and Cornbread** fundraiser on **April 29** at the **Elks Club**. **Time on the public site is a typical evening placeholder (6:00–9:00 p.m. Central)** until the host publishes a schedule. **City** is placed in **Hot Springs / Garland County** If your chapter is elsewhere, confirm county details with the host. This is a **third-party community benefit** unless the campaign is named on the invitation.",
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
    status: "past",
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
    status: "past",
    startsAt: "2026-05-03T13:00:00",
    endsAt: "2026-05-03T16:00:00",
    timezone: "America/Chicago",
    locationLabel: "Heber Springs — host venue (confirm on calendar or with Carol / organizers)",
    addressLine: "Heber Springs, AR (street address TBA; Greers Ferry Lake area / Cleburne County)",
    summary:
      "A Sunday afternoon **community music / program** in **Heber Springs** with **Carol Hutto** and **Edensong**—the invite notes a **show at 2:00 p.m.** within a **1:00–4:00 p.m. Central** window. Great for local culture calendars and neighbor-to-neighbor visibility.",
    description:
      "This lists a community calendar item **“Edensong in Heber with carol Hutto. Show at 2”** with Kelly Grappe as organizer. The site does **not** have the final venue; use the **Google Meet** for coordination, carpool, or remote touch-in as needed, and **confirm the performance location** in town before you publish a pin. **Not** a campaign event unless the host lists the campaign; community listing — confirm venue with the host.",
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
    relatedResourceHrefs: [{ label: "Start a local team", href: "/start-a-local-team" }],
    mapCoordinates: { lat: 35.491, lng: -92.031 },
  },
  {
    slug: "brunch-with-teresa-2026",
    title: "Brunch with Teresa",
    type: "Community Conversation",
    region: "Central Arkansas",
    status: "past",
    startsAt: "2026-05-09T11:00:00",
    endsAt: "2026-05-09T14:00:00",
    timezone: "America/Chicago",
    locationLabel: "Host venue or hybrid — confirm with host",
    addressLine: "Arkansas (street address from host when available)",
    summary:
      "Saturday **brunch / lunch block** with host Teresa—social time to connect. Confirm the **in-person** spot with the host.",
    description:
      "Mirrors a Google Calendar item **“Brunch with Teresa”** with Kelly Grappe as organizer. **11:00 a.m.–2:00 p.m. Central** per the invite. No public address was in the paste—**ask Teresa or the host** before sharing a map pin. Not a campaign-hosted meal unless the campaign is named on the invitation.",
    whatToExpect: [
      "Midday meal window (brunch/lunch)",
      "Friendly check-in—good for relationship building and schedule alignment",
    ],
    whoItsFor: "Invited guests and anyone the host opens the table to.",
    organizerNote:
      "User category: lunch/brunch event. Calendar title: “Brunch with Teresa.” Organizer: Kelly Grappe (per invite).",
    rsvpHref: "https://meet.google.com/vwv-nerr-gdo",
    audienceTags: ["Brunch", "Central Arkansas"],
    relatedEventSlugs: [
      "faith-visit-tabernacle-of-faith-wynne-2026",
      "listening-session-little-rock",
      "501-fest-little-rock-2026",
    ],
    relatedResourceHrefs: [{ label: "Get involved", href: "/get-involved" }],
  },
  {
    slug: "501-fest-little-rock-2026",
    title: "501 fest — Little Rock",
    type: "Fairs and Festivals",
    region: "Central Arkansas",
    countySlug: "pulaski-county",
    status: "past",
    startsAt: "2026-05-09T11:00:00",
    endsAt: "2026-05-09T18:00:00",
    timezone: "America/Chicago",
    locationLabel: "Little Rock (venue TBA — confirm with host)",
    addressLine: "Little Rock, AR (festival site and parking to be confirmed with organizers)",
    summary:
      "**501 fest** in the Little Rock / 501 area: **11:00 a.m.–6:00 p.m. Central** on **Saturday, May 9, 2026**. Confirm the in-person site before you go.",
    description:
      "Community festival context in the Little Rock / 501 area on **Saturday, May 9, 2026**. Confirm the in-person site with the host before you go. This listing is for public awareness—not a campaign-hosted festival unless the host names the campaign.",
    whatToExpect: [
      "Festival-style day—booths, food, and crowd flow per host rules once the venue is public",
      "Volunteer coordination details shared by the host when available",
    ],
    whoItsFor: "501 / Little Rock area neighbors and volunteers interested in public gatherings.",
    organizerNote:
      "Calendar title: “501 fest Little Rock.” May 9, 2026, 11:00 a.m.–6:00 p.m. Central. Organizer: Kelly Grappe. Conflicts: overlaps same calendar date with “Brunch with Teresa” (11:00 a.m.–2:00 p.m.) per user’s schedule note.",
    rsvpHref: "https://meet.google.com/air-qbnc-zdc",
    audienceTags: ["501", "Little Rock", "Festival", "Pulaski County", "Central Arkansas"],
    relatedEventSlugs: ["brunch-with-teresa-2026", "listening-session-little-rock"],
    relatedResourceHrefs: [
      { label: "Events calendar", href: "/events" },
      { label: "Get involved", href: "/get-involved" },
    ],
    mapCoordinates: { lat: 34.7465, lng: -92.2896 },
    fieldAttendance: "tentative",
  },
  {
    slug: "arkansas-times-tacos-tequilas-2026-05-21",
    title: "Arkansas Times — Tacos and Tequilas (Meet)",
    type: "Community Conversation",
    region: "Central Arkansas",
    countySlug: "pulaski-county",
    status: "past",
    startsAt: "2026-05-21T17:00:00",
    endsAt: "2026-05-21T21:00:00",
    timezone: "America/Chicago",
    locationLabel: "Virtual — Google Meet (Arkansas Times / Little Rock area context)",
    addressLine: "Little Rock, AR (confirm in-person details with host)",
    summary:
      "**Arkansas Times** Tacos and Tequilas evening window **5:00–9:00 p.m. Central**—confirm details with the host; not a campaign-run event unless the program names the campaign.",
    description:
      "Arkansas Times–associated evening gathering on **Thursday, May 21, 2026,** **5:00–9:00 p.m. Central**. Confirm venue or join details with the host. Not a campaign-run event unless the program names the campaign.",
    whatToExpect: [
      "Evening window—join times may be flexible; confirm with the host",
      "If Arkansas Times has an in-person ticketed block the same name/date, use their public listing for the physical venue",
    ],
    whoItsFor:
      "Little Rock / Pulaski County neighbors tracking culture calendars and public gatherings.",
    organizerNote:
      "Update notice (Apr 21, 2026): time changed to 5:00–9:00 p.m. CDT.",
    rsvpHref: "https://meet.google.com/bvj-zyzi-xmy",
    audienceTags: ["Little Rock", "Pulaski County", "Central Arkansas", "Arkansas Times"],
    relatedEventSlugs: ["501-fest-little-rock-2026", "ar-times-spring-margarita-2026"],
    relatedResourceHrefs: [
      { label: "Events calendar", href: "/events" },
      { label: "Get involved", href: "/get-involved" },
    ],
    mapCoordinates: { lat: 34.7465, lng: -92.2896 },
  },
  {
    slug: "magnolia-fest-immersion-weekend-2026",
    title: "Magnolia fest & immersion weekend",
    type: "Immersion",
    region: "Southwest Arkansas",
    countySlug: "columbia-county",
    status: "past",
    startsAt: "2026-05-16T08:00:00",
    endsAt: "2026-05-18T20:00:00",
    timezone: "America/Chicago",
    locationLabel: "Magnolia, Columbia County (multi-day — venues TBA with host)",
    addressLine: "Magnolia, AR and Columbia County (confirm lodging and public stops with the team)",
    summary:
      "**Immersion** = more than a drive-through: at least one overnight, structured days in town (e.g. library work time, county clerk or lunch with a local), and evenings to plan. Great window to **invite Kelly to church**, **host a dinner or small get-together**, or **grab coffee**—this calendar block ties to **Magnolia Blossom** weekend in town.",
    description:
      "Google Calendar: **“Magnolia fest and immersion weekend,”** **Saturday, May 16 – Monday, May 18, 2026,** with Kelly as organizer. Public times on this site are a **reasonable multi-day block** in Central time (start of Saturday through early Monday evening) so the map and list match the published window—confirm with the host if times differ. The **Magnolia Blossom Festival** is already on the public fair feed for the area; this entry covers the immersion weekend: who shows up, where Kelly posts up, and how neighbors can **open their table** during the stay.",
    whatToExpect: [
      "A multi-day stay—not a single speech stop",
      "Room for work at the library, civic and relationship meetings by day, debriefs and planning in the evening",
    ],
    whoItsFor:
      "Southwest Arkansas neighbors, hosts, and faith and civic friends who can offer a real welcome—worship, a meal, or a small circle in Magnolia and Columbia County.",
    organizerNote:
      "Internal calendar title: “Magnolia fest and immersion weekend.” May 16–18, 2026. Organizer listed on the campaign invite. **Immersion** is the movement term for this trip style.",
    rsvpHref: undefined,
    audienceTags: ["Immersion", "Columbia County", "Magnolia", "Southwest Arkansas", "Faith", "Hospitality"],
    relatedEventSlugs: ["magnolia-blossom-2026", "501-fest-little-rock-2026"],
    relatedResourceHrefs: [
      { label: "Host a gathering", href: "/host-a-gathering" },
      { label: "Get involved", href: "/get-involved" },
    ],
    mapCoordinates: { lat: 33.269, lng: -93.2373 },
  },
  {
    slug: "faith-visit-tabernacle-of-faith-wynne-2026",
    title: "Faith visit — Tabernacle of Faith (Wynne)",
    type: "Community Conversation",
    region: "Upper Delta",
    countySlug: "cross-county",
    status: "past",
    startsAt: "2026-05-17T15:00:00",
    endsAt: "2026-05-17T18:00:00",
    timezone: "America/Chicago",
    locationLabel: "Tabernacle of Faith — Wynne",
    addressLine: "Wynne, AR 72396 (ZIP from calendar; confirm street address with the congregation or host)",
    summary:
      "A Sunday afternoon **faith visit** in Cross County: worship, conversation, or program time with the **Tabernacle of Faith** community in **Wynne**—arrive in a spirit of respect and follow the congregation’s house norms for visitors.",
    description:
      "**Tabernacle of Faith** visit in **Wynne, AR** on **May 17, 2026, 3:00–6:00 p.m. Central**. Confirm the physical campus or sanctuary with the church. This listing is for public awareness; it is not a campaign-organized service unless the campaign is named in the program.",
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
    status: "past",
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
    status: "past",
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
    listeningSessionSeries: true,
    region: "Central Arkansas",
    countySlug: "garland-county",
    status: "past",
    startsAt: "2026-05-26T17:00:00",
    endsAt: "2026-05-26T21:00:00",
    timezone: "America/Chicago",
    locationLabel: "The Jewish Center, Hot Springs",
    addressLine: "300 Quapaw Ave, Hot Springs, AR",
    summary:
      "“Elections: Fair and Secure?” / Hot Springs Election Conversation — 5:00–9:00 p.m. Central, with local partners (VCK). (Program may start after doors open; follow host’s day-of flow.)",
    description:
      "In-person at The Jewish Center. Confirm day-of flow with the host. Details were coordinated by community organizers, including Kelly Grappe.",
    whatToExpect: [
      "Calendar block 5:00–9:00 p.m. Central (matches the host invite)",
      "Space for discussion on elections, integrity, and what fair process looks like locally",
    ],
    whoItsFor: "Garland County and Hot Springs area neighbors, including partners promoting the program.",
    organizerNote:
      "Google Calendar: “Hot Springs Election Conversation,” Tue May 26, 2026, 5:00–9:00 p.m. CDT.",
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
    status: "past",
    startsAt: "2026-06-03T08:00:00",
    endsAt: "2026-06-05T18:00:00",
    timezone: "America/Chicago",
    locationLabel: "State convention — venue & host city TBA (confirm with EHC / county council)",
    addressLine: "Arkansas (exact site from official program when published)",
    summary:
      "The annual **Arkansas Extension Homemakers** (EH) state gathering—workshops, business sessions, and fellowship for club members from across counties. Calendar hold: **Wednesday–Friday**, multi-day, **daily** schedule.",
    description:
      "This lists a public calendar item **“Ext homemakers club convention”** (June 3–5, 2026) with Kelly Grappe as organizer. The **Arkansas Extension Homemakers** network works through local clubs (including activities like the Petit Jean EH club’s public events). **Start/end times** on the public site are a **placeholder window**—real session blocks follow the official program. **Not** a campaign event unless the host lists the campaign; listed so neighbors can plan travel. **Note:** you may have other local commitments the same week (e.g. community conversations)—check the map.",
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
    status: "past",
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
    listeningSessionSeries: true,
    region: "Central Arkansas",
    countySlug: "garland-county",
    status: "past",
    startsAt: "2026-06-07T14:00:00",
    endsAt: "2026-06-07T16:00:00",
    timezone: "America/Chicago",
    locationLabel: "Garland County Library, Hot Springs",
    addressLine: "1427 Malvern Ave, Hot Springs National Park, AR (confirm room with library or host)",
    summary:
      "Panel-style community conversation on **election concerns**, part of a monthly first-Sunday series (2:00–4:00 p.m.). Co-presented by **Braver Angels Arkansas** and **Garland County Library**; facilitated by Cathi Kindt. Typical attendance ~20; format emphasizes listening across difference.",
    description:
      "This follows email correspondence (Cathi Kindt, April 2026): the **June 7** session is offered on the topic of **election process concerns** for Garland County residents. **Ground rules from the series:** it is **not** promoted as a candidate campaign rally—participants with public roles join as **citizens** in a structured conversation, not to pitch an organization or platform. A **separate, candidacy-focused listening session** at another time remains an option Cathi offered to discuss. The campaign lists this so neighbors understand host expectations; RSVP and room details should match the library’s or Braver Angels’ public post when available.",
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
    status: "past",
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
    slug: "madison-county-democrats-meeting-2026",
    title: "Madison County Democrats — Kelly speaking (Huntsville)",
    type: "Community Conversation",
    region: "Northwest Arkansas",
    countySlug: "madison-county",
    status: "upcoming",
    startsAt: "2026-09-03T18:30:00",
    endsAt: "2026-09-03T20:30:00",
    timezone: "America/Chicago",
    locationLabel: "Basham Building — Huntsville Square",
    addressLine:
      "Basham Building, Huntsville Square (Polk Square), Huntsville, AR 72740. City-owned community hall on the square; no street number on the party invite.",
    summary:
      "Thursday, September 3, 2026, **6:30 p.m. Central** at the **Basham Building on Huntsville Square**: Madison County Democrats meeting with **Kelly Grappe** as guest speaker. Open to neighbors who are not regular attendees.",
    description:
      "Madison County Democrats Chair **Brandi Solorzano** announced the next county meeting: **Thursday, September 3, 6:30 p.m.**, at the **Basham Building – Huntsville Square**. **Kelly Grappe**, candidate for Arkansas Secretary of State, is the **guest speaker**.\n\nThis is a **county Democratic Party** meeting, not a campaign-hosted rally. The chair’s note says you do not have to be a regular attendee — neighbors, family, and colleagues are welcome to meet Kelly, hear why she is running, learn what the Secretary of State’s office does, and ask questions.\n\nThe chair quotes Kelly: “Leadership in this role isn’t about headlines or ideology—it’s about steady, transparent administration and respect for the law.”\n\nThere will be a **donation area** at the meeting. Donations may go to Kelly’s campaign or to the Madison County Democrats advertising and building-rental fund (meetings, candidate visits, and voter information). Campaign gifts: use the donate page on this site.\n\nLocal news places the Basham Building on **Polk Square** (Huntsville’s downtown square). The party invite does not list a street number.\n\nKelly is traveling from nearby Eureka Springs for this Huntsville meeting. Lodging is private and is not listed as a public stop.",
    whatToExpect: [
      "6:30 p.m. Central start at the Basham Building on Huntsville Square (end time not posted — typical county-meeting evening)",
      "Kelly speaking, then questions — follow the chair and county party agenda",
      "Donation table for the campaign or the Madison County Democrats advertising and building-rental fund",
      "Open to people who are not regular meeting-goers",
    ],
    whoItsFor:
      "Madison County neighbors, Democrats, and anyone who wants to meet Kelly. Regular attendance is not required.",
    organizerNote:
      "Updated from Brandi Solorzano (Chair, Madison County Democrats) meeting notice. Guest speaker: Kelly. Venue: Basham Building – Huntsville Square. Ledger id presence-2026-09-03-madison-county. Lodging is Eureka Springs, not Huntsville — do not publish hotel details.",
    rsvpHref: "https://www.arkdems.org/county/madison/",
    audienceTags: ["Democratic Party", "Madison County", "Huntsville", "Northwest Arkansas"],
    relatedEventSlugs: ["democratic-party-montgomery-county-meeting-2026"],
    relatedResourceHrefs: [
      { label: "Democratic Party of Madison County — ArkDems", href: "https://www.arkdems.org/county/madison/" },
      { label: "Donate", href: "/donate" },
      { label: "Get involved", href: "/get-involved" },
    ],
    mapCoordinates: { lat: 36.0862, lng: -93.7363 },
    mapPinQuality: "region",
    fieldAttendance: "confirmed",
  },
  {
    slug: "rector-labor-day-pageants-2026",
    title: "Rector Labor Day pageants — Petite, Preteen, and Junior Miss",
    type: "Fairs and Festivals",
    region: "Northeast Arkansas",
    countySlug: "clay-county",
    status: "upcoming",
    startsAt: "2026-09-06T14:00:00",
    endsAt: "2026-09-06T18:00:00",
    timezone: "America/Chicago",
    locationLabel: "Rector, Arkansas — Labor Day weekend pageant program",
    addressLine: "Rector, AR 72461 (confirm room with Rector Labor Day Picnic hosts; picnic grounds / community spaces around 500 Park Rd)",
    summary:
      "Sunday of Rector’s Labor Day weekend: three Rector School District pageants — Petite Miss at 2:00 p.m., Preteen Miss at 3:30 p.m., and Junior Miss at 5:00 p.m. Central. Host-run community program, not a campaign event.",
    description:
      "These times come from the 2026 Rector Labor Day pageant flyer. All three contests are open to students registered with the Rector School District. Host contacts on the flyer: Amy and Morgan Garner.\n\nPetite Miss Rector — 2:00 p.m., ages 5 through 2nd grade. Sunday dress; no glitz or sequins. Early pre-registration $30. Practice Thursday, September 3, 4:30 p.m.\n\nPreteen Miss Rector — 3:30 p.m., 3rd through 5th grade. Sunday dress; no glitz or sequins. Early pre-registration $30. Practice Thursday, September 3, 5:00 p.m.\n\nJunior Miss Rector — 5:00 p.m., 6th through 9th grade. Short semi-formal or short party dress. Early pre-registration $30. Practice Thursday, September 3 (flyer lists 5:30 a.m. — confirm p.m. with the hosts).\n\nSunday is also the night before Monday’s Main Street parade. Confirm the exact pageant room with the Rector Labor Day Picnic organizers or the Rector Labor Day Picnic Facebook group.",
    whatToExpect: [
      "Three judged programs in one Sunday afternoon — plan for a 2:00–6:00 p.m. window if you stay for Junior Miss",
      "School-district eligibility and host dress rules; this is a hometown pageant, not a campaign stage",
      "Practice for all three titles is Thursday, September 3 — times on the flyer",
    ],
    whoItsFor:
      "Rector School District families, Clay County neighbors, and anyone in town for Labor Day weekend who wants to support local students.",
    organizerNote:
      "Sourced from the 2026 Rector pageant flyer (Petite / Preteen / Junior Miss). Hosts: Amy and Morgan Garner, 870-215-2268. Campaign listing is for public awareness — the campaign does not run the pageants.",
    rsvpHref: undefined,
    audienceTags: ["Rector", "Clay County", "Labor Day", "Youth", "Families", "Northeast Arkansas"],
    relatedEventSlugs: ["rector-labor-day-parade-picnic-2026"],
    relatedResourceHrefs: [
      { label: "Monday parade and picnic", href: "/events/rector-labor-day-parade-picnic-2026" },
      { label: "Get involved", href: "/get-involved" },
    ],
    mapCoordinates: { lat: 36.2631, lng: -90.2926 },
    mapPinQuality: "region",
    fieldAttendance: "confirmed",
  },
  {
    slug: "rector-labor-day-parade-picnic-2026",
    title: "Rector Labor Day Parade and Picnic",
    type: "Fairs and Festivals",
    region: "Northeast Arkansas",
    countySlug: "clay-county",
    status: "upcoming",
    startsAt: "2026-09-07T08:45:00",
    endsAt: "2026-09-07T17:00:00",
    timezone: "America/Chicago",
    locationLabel: "Main Street parade → City Park / community center, Rector",
    addressLine: "Main Street, Rector, AR 72461; picnic at City Memorial Park, 500 Park Rd",
    summary:
      "Monday, September 7, 2026: Rector’s Labor Day parade steps off at 9:00 a.m. on Main Street (line up by 8:45). The route moves toward the city park and community center for the picnic, barbecue, carnival rides, and political speeches. Hosts ask politicians to line up at Main and East 3rd.",
    description:
      "The Rector Labor Day Parade is one of Northeast Arkansas’s longest-running hometown traditions — organizers date it to 1940. It is a third-party community celebration. Proceeds support upkeep of Woodland Heights Cemetery (city-owned; the City of Rector states that Labor Day Picnic proceeds go to cemetery maintenance).\n\nParade: 9:00 a.m. Central on Main Street. Participants should be in place no later than 8:45 a.m. No entry fee. Floats and bicycles can be judged if you choose. ATVs and four-wheelers are allowed only if driven by or accompanied by someone 18 or older with a valid driver’s license.\n\nWhat rolls: floats, fire trucks, police cars, marching bands, antique cars, tractors, horses and wagons, and candy for the crowd. After the parade, the day continues at the city park — food, barbecue, carnival rides, and a long-standing stop for local, state, and federal candidates.\n\n2026 lineup (from the Rector Labor Day Picnic organizers):\n• Beauty queens — Main and West 3rd, beside the Methodist church\n• Politicians — Main and East 3rd, opposite the beauty queens\n• Antique cars — right side of West 3rd\n• HOF trucks and class-reunion trucks/trailers — left side of West 3rd\n• Fire trucks, ambulances, law enforcement — East 3rd\n• Bikes — right side of West 2nd\n• Stock trailers / race cars — right side of West 2nd, behind bicycles\n• Car clubs — on Main before the tractors; overflow on 2nd behind businesses\n• Businesses — left side of West 2nd\n• Floats — East 2nd\n• Tractors — West 2nd and Main\n• ATVs and side-by-sides — East 2nd and Main\n• Horses and wagons — in front of Antioch Baptist Church (gather anytime before 9:00)\n\nSpectator parking: First Baptist parking lots; lot behind Irby’s on Main; lot behind the Methodist church. Do not park in the front Methodist lot, on Main from 3rd down past 2nd, or on those side streets — those blocks are the lineup. The Methodist lot is reserved for the band, cheerleaders, and school clubs.\n\nConfirm day-of changes in the Rector Labor Day Picnic Facebook group. A published picnic listing uses (870) 595-3591.",
    whatToExpect: [
      "8:45 a.m. lineup / 9:00 a.m. step-off on Main Street toward the park",
      "Politicians stage at Main and East 3rd — opposite the beauty queens at Main and West 3rd",
      "Picnic, barbecue, carnival rides, and candidate remarks at City Memorial Park after the parade",
      "Free to watch; no parade entry fee. Candy, bands, antique cars, tractors, horses, and emergency vehicles",
      "Hot late-summer weather — water, shade, and insect repellent help if you stay for the park",
    ],
    whoItsFor:
      "Clay County families, Crowley’s Ridge neighbors, parade participants, and anyone who wants a small-town Labor Day with a real civic hour — not a campaign-hosted rally.",
    organizerNote:
      "Campaign stop for Monday, September 7, 2026. Sunday night lodging is in Piggott (private — not a public event). Lineup sourced from the 2026 Rector Labor Day Picnic organizer post. Politicians: Main and East 3rd. Horses/wagons: Antioch Baptist Church. Pageants are a separate Sunday listing.",
    rsvpHref: undefined,
    audienceTags: ["Rector", "Clay County", "Labor Day", "Parade", "Picnic", "Northeast Arkansas", "Families"],
    relatedEventSlugs: ["rector-labor-day-pageants-2026"],
    relatedResourceHrefs: [
      { label: "Sunday pageants in Rector", href: "/events/rector-labor-day-pageants-2026" },
      { label: "Woodland Heights Cemetery (City of Rector)", href: "https://rectorarkansas.gov/woodland-heights-cemetery" },
      { label: "KAIT: 2025 Main Street parade", href: "https://www.kait8.com/2025/09/01/hundreds-line-rector-main-street-celebrate-labor-day/" },
      { label: "Get involved", href: "/get-involved" },
    ],
    mapCoordinates: { lat: 36.2631, lng: -90.2926 },
    mapPinQuality: "exact",
    fieldAttendance: "confirmed",
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
    locationLabel: "Russellville — Mary Ella site or program (table/staging TBA)",
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
      "User category: community event. Calendar title: “Russellville Mary Ella voter reg.” Organizer: Kelly Grappe (per invite). All-day on calendar; times here are a placeholder until the host publishes a schedule.",
    rsvpHref: undefined,
    audienceTags: ["Russellville", "Pope County", "Voter registration", "Community"],
    relatedEventSlugs: ["river-valley-food-truck-russellville-2026"],
    relatedResourceHrefs: [
      { label: "Voter registration (site hub)", href: "/voter-registration" },
    ],
    mapCoordinates: { lat: 35.278, lng: -93.137 },
  },
  {
    slug: "aac-county-judges-fall-meeting-2026",
    title: "County Judges Association — fall meeting (Benton Event Center)",
    type: "Community Conversation",
    region: "Central Arkansas",
    countySlug: "saline-county",
    status: "upcoming",
    startsAt: "2026-09-02T12:00:00",
    endsAt: "2026-09-04T11:00:00",
    timezone: "America/Chicago",
    locationLabel: "Benton Event Center",
    addressLine: "17322 I-30 North, Benton, AR 72019 (Hickory Square)",
    summary:
      "Association of Arkansas Counties — County Judges fall meeting, **Wednesday, September 2 (noon) through Friday, September 4 (11:00 a.m.)** at the Benton Event Center. This is a county-officials conference, not a campaign rally.",
    description:
      "Listed by the Association of Arkansas Counties as **Judges Fall 2026 Meeting** at the Benton Event Center. A September FYI from the field (Michael Roys) flagged the same block: County Judges, September 2–4, Benton Events Center.\n\nThis is a working meeting of county judges from across Arkansas. Sessions, meals, and any evening blocks follow the AAC program — not a public town hall. The campaign lists it so the travel calendar is honest: if Kelly is in Benton that window, it is around this conference, not a general-audience event.\n\nVenue: Benton Event Center, 17322 I-30 North, Benton (Saline County). Confirm badge, agenda, and whether guests are allowed with AAC before showing up.",
    whatToExpect: [
      "Wednesday noon start through Friday late morning (AAC published window)",
      "County judges, staff, and association programming — not an open campaign meet-and-greet",
      "I-30 / Hickory Square location; parking and room assignments follow the Benton Event Center and AAC",
    ],
    whoItsFor:
      "County judges and invited AAC guests. Neighbors looking for a public Kelly event should use the campaign calendar or Invite Kelly — do not treat this as an open house.",
    organizerNote:
      "Source: AAC Judges Fall 2026 Meeting page + Michael Roys FYI (County Judges Sept 2–4, Benton Events Center). Association meeting — not campaign-hosted.",
    rsvpHref: "https://www.arcounties.org/events/judges-fall-2026-meeting/",
    audienceTags: ["Saline County", "Benton", "County judges", "AAC", "Central Arkansas"],
    relatedEventSlugs: ["aac-county-clerks-fall-meeting-2026"],
    relatedResourceHrefs: [
      { label: "AAC — Judges Fall 2026 Meeting", href: "https://www.arcounties.org/events/judges-fall-2026-meeting/" },
      { label: "Association of Arkansas Counties events", href: "https://www.arcounties.org/events/" },
      { label: "Benton Event Center", href: "https://www.bentoneventcenter.com/" },
    ],
    mapCoordinates: { lat: 34.5645, lng: -92.5868 },
    mapPinQuality: "exact",
    fieldAttendance: "confirmed",
  },
  {
    slug: "aac-county-clerks-fall-meeting-2026",
    title: "County Clerks Association — fall meeting (Benton Event Center)",
    type: "Community Conversation",
    region: "Central Arkansas",
    countySlug: "saline-county",
    status: "upcoming",
    startsAt: "2026-09-09T12:00:00",
    endsAt: "2026-09-11T10:00:00",
    timezone: "America/Chicago",
    locationLabel: "Benton Event Center",
    addressLine: "17322 I-30 North, Benton, AR 72019 (Hickory Square)",
    summary:
      "Association of Arkansas Counties — County Clerks fall meeting, **Wednesday, September 9 (noon) through Friday, September 11 (10:00 a.m.)** at the Benton Event Center. Field FYI said September 10–11; AAC publishes the fuller Wednesday–Friday window.",
    description:
      "Listed by the Association of Arkansas Counties as **County Clerks Fall 2026 Meeting** at the Benton Event Center. AAC times: Wednesday, September 9, 12:00 p.m. through Friday, September 11, 10:00 a.m. A September FYI from Michael Roys said County Clerks, September 10–11, same venue — treat AAC as the published start (Wednesday noon) and plan through Friday morning.\n\nThis is a clerks’ association conference (election administration, recording, and county office work), not a campaign event. AAC says an agenda is posted on the event page. Confirm registration and guest rules with AAC before travel.\n\nVenue: Benton Event Center, 17322 I-30 North, Benton (Saline County).",
    whatToExpect: [
      "Wednesday noon through Friday morning (AAC); the FYI highlighted Thursday–Friday as the core clerks block",
      "County clerks and association sessions — not a public campaign program",
      "Same Benton Event Center as the judges meeting the week before",
    ],
    whoItsFor:
      "County clerks and invited AAC guests. The public campaign calendar lists this for travel awareness only.",
    organizerNote:
      "Source: AAC County Clerks Fall 2026 Meeting + Michael Roys FYI (Clerks Sept 10–11). Official AAC window is Sept 9 noon–Sept 11 10:00 a.m.",
    rsvpHref: "https://www.arcounties.org/events/county-clerks-fall-meeting-2026/",
    audienceTags: ["Saline County", "Benton", "County clerks", "AAC", "Elections", "Central Arkansas"],
    relatedEventSlugs: ["aac-county-judges-fall-meeting-2026"],
    relatedResourceHrefs: [
      { label: "AAC — County Clerks Fall 2026 Meeting", href: "https://www.arcounties.org/events/county-clerks-fall-meeting-2026/" },
      { label: "Association of Arkansas Counties events", href: "https://www.arcounties.org/events/" },
      { label: "Benton Event Center", href: "https://www.bentoneventcenter.com/" },
    ],
    mapCoordinates: { lat: 34.5645, lng: -92.5868 },
    mapPinQuality: "exact",
    fieldAttendance: "confirmed",
  },
  {
    slug: "sheridan-immersion-justin-wise-2026",
    title: "Sheridan immersion — Grant County (with Justin Wise)",
    type: "Immersion",
    region: "Central Arkansas",
    countySlug: "grant-county",
    status: "upcoming",
    startsAt: "2026-10-31T08:00:00",
    endsAt: "2026-10-31T18:00:00",
    timezone: "America/Chicago",
    locationLabel: "Sheridan, Grant County — breakfast, then businesses and local stops",
    addressLine: "Sheridan, AR 72150 (breakfast spot and business list with Justin Wise / the campaign the week of the visit)",
    summary:
      "Saturday, October 31, 2026: a full Sheridan immersion. The day starts with **breakfast at 8:00 a.m. Central**, then visits to area businesses and time on the ground with **Justin Wise** — not a drive-through photo stop.",
    description:
      "Calendar hold: **“Sheridan,” Saturday, October 31, 2026.** The campaign arrives for breakfast at 8:00 a.m., then spends the day visiting Sheridan-area businesses and working the town with local host **Justin Wise**. Public hours on this page are an 8:00 a.m.–6:00 p.m. Central immersion window so neighbors can find the day; exact café, store list, and any afternoon open-to-the-public stop will be confirmed with Justin closer to the date.\n\n**Immersion** here means a structured day in the county seat — Main Street and Pine Street businesses, civic introductions, and time to listen — not a single speech. Grant County’s larger October gathering is **Timberfest** (downtown Sheridan, October 2–3, 2026, per the Grant County Chamber). This October 31 block is a separate campaign day in town.\n\nJustin Wise is a Sheridan City Council member (appointed October 2025, Ward 3) and a long-time Grant County civic volunteer. He is the local partner for this Saturday, not the campaign’s spokesperson. Neighbors who want Kelly at a shop, church, or small gathering that day should use Invite Kelly or Host a gathering so staff can match the route.",
    whatToExpect: [
      "8:00 a.m. Central breakfast arrival — restaurant TBA with the host",
      "Daytime business visits and introductions around Sheridan",
      "Immersion pace: listen, meet, and stay in town — not a one-stop drop-in",
      "Halloween Saturday in a small county seat — confirm any extra community events that week with local hosts",
    ],
    whoItsFor:
      "Sheridan and Grant County neighbors, Main Street owners, and anyone who can open a table, a shop, or a short conversation while Kelly is in town.",
    organizerNote:
      "Google Calendar all-day item “Sheridan,” Sat Oct 31, 2026. Operator note: arrive for breakfast at 8 a.m., then area businesses and a full Sheridan immersion with Justin Wise. Do not publish the campaign inbox on the public page.",
    rsvpHref: undefined,
    audienceTags: ["Immersion", "Sheridan", "Grant County", "Central Arkansas", "Small business"],
    relatedEventSlugs: ["magnolia-fest-immersion-weekend-2026"],
    relatedResourceHrefs: [
      { label: "Host a gathering", href: "/host-a-gathering" },
      { label: "Invite Kelly", href: "/events/request" },
      { label: "Get involved", href: "/get-involved" },
      { label: "Grant County Chamber — Timberfest", href: "https://www.grantcountychamber.com/timberfest" },
    ],
    mapCoordinates: { lat: 34.3081, lng: -92.4013 },
    mapPinQuality: "region",
    fieldAttendance: "confirmed",
  },
  {
    slug: "berryville-meet-the-candidates-reloaded-2026",
    title: "Berryville Chamber — Meet the Candidates: Reloaded",
    type: "Town Hall",
    region: "Northwest Arkansas",
    countySlug: "carroll-county",
    status: "upcoming",
    startsAt: "2026-10-01T16:00:00",
    endsAt: "2026-10-01T19:00:00",
    timezone: "America/Chicago",
    locationLabel: "Berryville — Greater Berryville Area Chamber of Commerce (venue TBA)",
    addressLine:
      "Berryville, AR 72616. February’s forum was at the Berryville Community Center Auditorium, 601 Doctor Spurlin Circle — confirm October 1 room with the Chamber.",
    summary:
      "Thursday, October 1, 2026, **4:00–7:00 p.m. Central**: the Berryville Chamber brings local candidates back to highlight platforms and take questions before the November election. Chamber-hosted — not a campaign rally.",
    description:
      "Greater Berryville Area Chamber of Commerce: **Meet the Candidates — Reloaded**, Thursday, October 1, 2026. Jean Reed (Chamber) confirmed **4:00–7:00 p.m.** and said registration forms will follow when they are ready. The Chamber’s public calendar lists the same title and date; the save-the-date flyer says location and registration details are still coming.\n\nThis is a return of the Chamber’s candidate night. The February 19, 2026 Meet the Candidates open house ran 4:00–7:00 p.m. at the Berryville Community Center Auditorium and was free and open to the public. Do not assume the October room until the Chamber publishes it.\n\nLocal candidates speak and take questions ahead of the November election. Follow Chamber rules for speaking order, tables, and time. Kelly is listed as a participating candidate when the host confirms the roster — this is not a Grappe-hosted event.",
    whatToExpect: [
      "4:00–7:00 p.m. Central (Jean Reed, Aug 31)",
      "Candidate remarks and audience questions before November",
      "Registration forms coming from the Chamber — watch berryvillechamber.com",
      "Venue still TBA; February used the Community Center Auditorium",
    ],
    whoItsFor:
      "Carroll County voters, Chamber members, and anyone who wants to hear local candidates in Berryville before Election Day.",
    organizerNote:
      "Sources: Berryville Chamber save-the-date flyer; Chamber email; Jean Reed 4:00–7:00 p.m. and registration forthcoming. Chamber calendar: Berryville Chamber Presents: Meet the Candidates - Reloaded, Thu Oct 1, 2026. Not campaign-hosted.",
    rsvpHref: "https://www.berryvillechamber.com/events/",
    audienceTags: ["Berryville", "Carroll County", "Chamber", "Town hall", "Northwest Arkansas"],
    relatedEventSlugs: ["berryville-chamber-awards-banquet-2026"],
    relatedResourceHrefs: [
      { label: "Greater Berryville Area Chamber — events", href: "https://www.berryvillechamber.com/events/" },
      { label: "October 22 Chamber Awards Banquet", href: "/events/berryville-chamber-awards-banquet-2026" },
      { label: "Get involved", href: "/get-involved" },
    ],
    mapCoordinates: { lat: 36.3654, lng: -93.5646 },
    mapPinQuality: "region",
    fieldAttendance: "confirmed",
  },
  {
    slug: "berryville-chamber-awards-banquet-2026",
    title: "Berryville Chamber — Annual Awards Banquet",
    type: "Community Conversation",
    region: "Northwest Arkansas",
    countySlug: "carroll-county",
    status: "upcoming",
    startsAt: "2026-10-22T18:00:00",
    endsAt: "2026-10-22T21:00:00",
    timezone: "America/Chicago",
    locationLabel: "Berryville — Annual Chamber Awards Banquet (venue TBA)",
    addressLine: "Berryville, AR 72616 (time and room from the Greater Berryville Area Chamber when published)",
    summary:
      "Thursday, October 22, 2026: the Greater Berryville Area Chamber’s annual awards banquet — an evening recognizing people, businesses, and organizations in the community. Time, place, and tickets TBA.",
    description:
      "Chamber save-the-date and email: **Annual Chamber Awards Banquet**, October 22. The flyer: “Join us for an evening of celebration as we highlight our incredible community.” The Chamber email adds that they will recognize people, businesses, and organizations that help make the community work.\n\n**Time and location are not published yet.** The public page uses a typical evening window (6:00–9:00 p.m. Central) so the day appears on the calendar — update when Jean Reed or the Chamber posts the program. This is a Chamber banquet, not a campaign fundraiser. Expect tickets or member pricing once registration opens.\n\nSame Chamber as Meet the Candidates: Reloaded on October 1.",
    whatToExpect: [
      "Evening celebration — exact start time TBA",
      "Awards and recognition for local people and businesses",
      "Registration and venue still coming from the Chamber",
    ],
    whoItsFor:
      "Chamber members, honorees, and invited guests. Confirm ticket rules before sharing as a walk-in event.",
    organizerNote:
      "Sources: Berryville Chamber save-the-date flyer and Chamber email (Jean Reed thread). Evening placeholder until the host publishes a schedule. Not campaign-hosted.",
    rsvpHref: "https://www.berryvillechamber.com/events/",
    audienceTags: ["Berryville", "Carroll County", "Chamber", "Banquet", "Northwest Arkansas"],
    relatedEventSlugs: ["berryville-meet-the-candidates-reloaded-2026"],
    relatedResourceHrefs: [
      { label: "Greater Berryville Area Chamber — events", href: "https://www.berryvillechamber.com/events/" },
      { label: "October 1 Meet the Candidates: Reloaded", href: "/events/berryville-meet-the-candidates-reloaded-2026" },
      { label: "Get involved", href: "/get-involved" },
    ],
    mapCoordinates: { lat: 36.3654, lng: -93.5646 },
    mapPinQuality: "region",
    fieldAttendance: "tentative",
  },
  {
    slug: "evening-with-acasa-2026",
    title: "An Evening with ACASA",
    type: "Community Conversation",
    region: "Central Arkansas",
    countySlug: "pulaski-county",
    status: "upcoming",
    startsAt: "2026-09-29T17:30:00",
    endsAt: "2026-09-29T19:30:00",
    timezone: "America/Chicago",
    locationLabel: "Historic Gibb-Altheimer House — Little Rock (RSVP required)",
    addressLine:
      "Governor’s Mansion Historic District, Little Rock. Historic listings place the house at 1801 S. Arch Street (entrance from 18th Street). This is a private home — RSVP only; do not treat it as a walk-in venue.",
    summary:
      "Tuesday, September 29, 2026, **5:30–7:30 p.m. Central**: ACASA hosts an informational evening for elected officials at the Historic Gibb-Altheimer House. Appetizers and drinks; brief presentation at **6:30 p.m.** RSVP required.",
    description:
      "Invitation from Kenny Smith, Law Enforcement Training Director at the Arkansas Coalition Against Sexual Assault (ACASA): **An Evening with ACASA**, Tuesday, September 29, 5:30–7:30 p.m., at the Historic Gibb-Altheimer House in Little Rock, hosted by Scott and Pam Smith.\n\nThe program is for elected officials to learn what ACASA does, the services sexual assault centers provide, and the challenges survivors and centers face across Arkansas. Appetizers and drinks; a brief presentation at 6:30 p.m.\n\nACASA is the statewide coalition working to end sexual violence and human trafficking and to support member centers. This is **not** a campaign event and **not** the ACANSA arts festival. RSVP through ACASA’s form — do not publish a walk-in invitation or treat the Smith home as a public campaign site.\n\nThe house is a 1906 Frank Gibb residence in the Governor’s Mansion Historic District (public historic tours have listed 1801 S. Arch Street). Use the RSVP channel for parking and arrival notes.",
    whatToExpect: [
      "5:30–7:30 p.m. Central; presentation at 6:30",
      "Appetizers and drinks; informational briefing — not a stump speech",
      "RSVP required: evening-with-acasa.rsvpify.com",
      "Private historic home — follow host and ACASA guidance on guests",
    ],
    whoItsFor:
      "Invited elected officials and their listed guests. This is not a general-public campaign gathering.",
    organizerNote:
      "Invite from Kenny Smith, ACASA (ksmith@arkcasa.org). RSVP: https://evening-with-acasa.rsvpify.com. Office: 300 West Capitol Avenue, Little Rock. Do not put the personal cell on the public card if the RSVP link is enough. Same date as Eddie Mae Herron Center candidate speaking and pie auction in Pocahontas.",
    rsvpHref: "https://evening-with-acasa.rsvpify.com",
    audienceTags: ["Little Rock", "Pulaski County", "ACASA", "Elected officials", "Central Arkansas"],
    relatedEventSlugs: ["eddie-mae-herron-pocahontas-2026"],
    relatedResourceHrefs: [
      { label: "RSVP — An Evening with ACASA", href: "https://evening-with-acasa.rsvpify.com" },
      { label: "Arkansas Coalition Against Sexual Assault", href: "https://www.arkcasa.org/" },
      { label: "About ACASA", href: "https://www.arkcasa.org/about-1" },
    ],
    mapCoordinates: { lat: 34.736, lng: -92.276 },
    mapPinQuality: "exact",
    fieldAttendance: "confirmed",
  },
  {
    slug: "eddie-mae-herron-pocahontas-2026",
    title: "Eddie Mae Herron Center — candidate speaking and pie auction",
    type: "Community Conversation",
    region: "Northeast Arkansas",
    countySlug: "randolph-county",
    status: "upcoming",
    startsAt: "2026-09-29T14:00:00",
    endsAt: "2026-09-29T17:00:00",
    timezone: "America/Chicago",
    locationLabel: "Eddie Mae Herron Center & Museum — Pocahontas",
    addressLine: "1708 Archer Street, Pocahontas, AR 72455",
    summary:
      "Tuesday, September 29, 2026: the Eddie Mae Herron Center’s **candidate speaking and pie auction** in Pocahontas. The Center moved the date because of a conflict. Start time is not posted yet — confirm with the Center before travel.",
    description:
      "The Eddie Mae Herron Center posted that, **because of a date conflict**, its **candidate speaking and pie auction** will be **September 29, 2026**, in Pocahontas.\n\nThis is a **Center-hosted** community fundraiser and candidate hour — not a campaign rally. The Center (1708 Archer Street) is the restored 1919 St. Mary’s AME / Pocahontas Colored School, now a museum and gathering place for African American history in Randolph County.\n\n**Start time is not on the public post.** This page uses a 2:00–5:00 p.m. Central placeholder so the day appears on the calendar. Update when the Center publishes a program.\n\nAn Evening with ACASA is the same date in Little Rock (5:30–7:30 p.m.). Those are different events; travel between Pocahontas and Little Rock the same evening is a long drive.",
    whatToExpect: [
      "Candidate speaking and a pie auction — follow the Center’s program",
      "Time TBA until the Center posts a schedule",
      "Historic one-room schoolhouse / museum on Archer Street — small space; arrive with the host’s guidance",
    ],
    whoItsFor:
      "Randolph County neighbors, candidates, and anyone supporting the Center’s work. Confirm time and any ticket or donation notes with the Center.",
    organizerNote:
      "Source: Eddie Mae Herron Center Facebook post — “Because of date conflict the Eddie Mae Herron Center candidate speaking and pie auction will be September 29th. 2026.” Time not posted. Same calendar day as evening-with-acasa-2026 in Little Rock.",
    rsvpHref: "https://www.herroncenter.org/",
    audienceTags: ["Pocahontas", "Randolph County", "Northeast Arkansas", "Faith", "Community"],
    relatedEventSlugs: ["evening-with-acasa-2026"],
    relatedResourceHrefs: [
      { label: "Eddie Mae Herron Center & Museum", href: "https://www.herroncenter.org/" },
      { label: "Visit / directions", href: "https://www.herroncenter.org/visit" },
      { label: "Get involved", href: "/get-involved" },
    ],
    mapCoordinates: { lat: 36.2602, lng: -90.9814 },
    mapPinQuality: "exact",
    fieldAttendance: "confirmed",
  },
  {
    slug: "ame-west-conference-magnolia-2026",
    title: "AME West Conference — politics and the church (Magnolia)",
    type: "Community Conversation",
    region: "Southwest Arkansas",
    countySlug: "columbia-county",
    status: "upcoming",
    startsAt: "2026-09-10T13:00:00",
    endsAt: "2026-09-10T15:30:00",
    timezone: "America/Chicago",
    locationLabel: "Unity AME Church — Magnolia",
    addressLine: "466 Columbia Road 38, Magnolia, AR 71753",
    summary:
      "Thursday, September 10, 2026, **1:00–3:30 p.m. Central** at Unity AME Church in Magnolia: West Conference session on politics and the church, with candidate introductions and questions. Presided over by Bishop Silvester S. Beaman.",
    description:
      "The African Methodist Episcopal Church’s **West Conference** hosts a session on a new approach to discussing **politics and the church**. Bishop **Silvester S. Beaman**, presiding prelate of the 12th Episcopal District (Arkansas and Oklahoma), presides.\n\nThe program is for introductions and questions about current issues and candidates. The host asks that **pastors and ministers know each candidate**. This is a **church-hosted** conference session, not a campaign rally.\n\nThe conferences are also asking churches for volunteer help with **voter registration**, **poll watching**, and **Souls to the Polls**. Neighbors who can help can start on this site’s volunteer and voter-registration pages.\n\nSame series: East Conference on September 24 in Pine Bluff, and Arkansas Conference on October 8 in Little Rock.",
    whatToExpect: [
      "1:00–3:30 p.m. Central at Unity AME Church",
      "Candidate introductions and questions — follow the bishop and host pastors",
      "Church volunteer ask: voter registration, poll watching, and Souls to the Polls",
    ],
    whoItsFor:
      "AME pastors, ministers, and invited conference guests. Confirm with the host church before treating it as a walk-in public forum.",
    organizerNote:
      "Host brief for 2026 West / East / Arkansas Conference candidate sessions. Bishop Silvester S. Beaman. Do not list as campaign-hosted. Volunteer ask stays church-side; point public readers to /get-involved and /voter-registration.",
    rsvpHref: undefined,
    audienceTags: ["AME", "Faith", "Magnolia", "Columbia County", "Southwest Arkansas", "Voter registration"],
    relatedEventSlugs: [
      "ame-east-conference-pine-bluff-2026",
      "ame-arkansas-conference-little-rock-2026",
      "magnolia-fest-immersion-weekend-2026",
    ],
    relatedResourceHrefs: [
      { label: "Get involved", href: "/get-involved" },
      { label: "Voter registration", href: "/voter-registration" },
      { label: "East Conference — Pine Bluff, Sept. 24", href: "/events/ame-east-conference-pine-bluff-2026" },
      { label: "Arkansas Conference — Little Rock, Oct. 8", href: "/events/ame-arkansas-conference-little-rock-2026" },
    ],
    mapCoordinates: { lat: 33.2671, lng: -93.2393 },
    mapPinQuality: "region",
    fieldAttendance: "confirmed",
  },
  {
    slug: "ame-east-conference-pine-bluff-2026",
    title: "AME East Conference — politics and the church (Pine Bluff)",
    type: "Community Conversation",
    region: "Central Arkansas",
    countySlug: "jefferson-county",
    status: "upcoming",
    startsAt: "2026-09-24T13:00:00",
    endsAt: "2026-09-24T15:30:00",
    timezone: "America/Chicago",
    locationLabel: "Mt. Pleasant AME Church — Pine Bluff",
    addressLine: "1201 N. Magnolia Street, Pine Bluff, AR 71601",
    summary:
      "Thursday, September 24, 2026, **1:00–3:30 p.m. Central** at Mt. Pleasant AME Church in Pine Bluff: East Conference session on politics and the church, with candidate introductions and questions. Presided over by Bishop Silvester S. Beaman.",
    description:
      "The African Methodist Episcopal Church’s **East Conference** hosts a session on a new approach to discussing **politics and the church**. Bishop **Silvester S. Beaman**, presiding prelate of the 12th Episcopal District (Arkansas and Oklahoma), presides.\n\nThe program is for introductions and questions about current issues and candidates. The host asks that **pastors and ministers know each candidate**. This is a **church-hosted** conference session, not a campaign rally.\n\nThe conferences are also asking churches for volunteer help with **voter registration**, **poll watching**, and **Souls to the Polls**. Neighbors who can help can start on this site’s volunteer and voter-registration pages.\n\nSame series: West Conference on September 10 in Magnolia, and Arkansas Conference on October 8 in Little Rock.",
    whatToExpect: [
      "1:00–3:30 p.m. Central at Mt. Pleasant AME Church",
      "Candidate introductions and questions — follow the bishop and host pastors",
      "Church volunteer ask: voter registration, poll watching, and Souls to the Polls",
    ],
    whoItsFor:
      "AME pastors, ministers, and invited conference guests. Confirm with the host church before treating it as a walk-in public forum.",
    organizerNote:
      "Host brief for 2026 West / East / Arkansas Conference candidate sessions. Bishop Silvester S. Beaman. Venue matches Mt. Pleasant AME, 1201 N. Magnolia Street. Do not list as campaign-hosted.",
    rsvpHref: "https://www.mtpleasantamecpinebluff.com/",
    audienceTags: ["AME", "Faith", "Pine Bluff", "Jefferson County", "Central Arkansas", "Voter registration"],
    relatedEventSlugs: [
      "ame-west-conference-magnolia-2026",
      "ame-arkansas-conference-little-rock-2026",
    ],
    relatedResourceHrefs: [
      { label: "Mt. Pleasant AME Church", href: "https://www.mtpleasantamecpinebluff.com/" },
      { label: "Get involved", href: "/get-involved" },
      { label: "Voter registration", href: "/voter-registration" },
      { label: "West Conference — Magnolia, Sept. 10", href: "/events/ame-west-conference-magnolia-2026" },
      { label: "Arkansas Conference — Little Rock, Oct. 8", href: "/events/ame-arkansas-conference-little-rock-2026" },
    ],
    mapCoordinates: { lat: 34.235, lng: -92.008 },
    mapPinQuality: "region",
    fieldAttendance: "confirmed",
  },
  {
    slug: "ame-arkansas-conference-little-rock-2026",
    title: "AME Arkansas Conference — politics and the church (Little Rock)",
    type: "Community Conversation",
    region: "Central Arkansas",
    countySlug: "pulaski-county",
    status: "upcoming",
    startsAt: "2026-10-08T13:00:00",
    endsAt: "2026-10-08T15:30:00",
    timezone: "America/Chicago",
    locationLabel: "Union AME Church — Little Rock",
    addressLine: "1825 S. Pulaski Street, Little Rock, AR 72206",
    summary:
      "Thursday, October 8, 2026, **1:00–3:30 p.m. Central** at Union AME Church in Little Rock: Arkansas Conference session on politics and the church, with candidate introductions and questions. Presided over by Bishop Silvester S. Beaman.",
    description:
      "The African Methodist Episcopal Church’s **Arkansas Conference** hosts a session on a new approach to discussing **politics and the church**. Bishop **Silvester S. Beaman**, presiding prelate of the 12th Episcopal District (Arkansas and Oklahoma), presides.\n\nThe program is for introductions and questions about current issues and candidates. The host asks that **pastors and ministers know each candidate**. This is a **church-hosted** conference session, not a campaign rally.\n\nThe conferences are also asking churches for volunteer help with **voter registration**, **poll watching**, and **Souls to the Polls**. Neighbors who can help can start on this site’s volunteer and voter-registration pages.\n\nSame series: West Conference on September 10 in Magnolia, and East Conference on September 24 in Pine Bluff.\n\nThe same Thursday evening is the League of Women Voters **Secretary of State forum** at the Fayetteville Public Library, 5:30–7:30 p.m. Little Rock to Fayetteville after 3:30 is a tight drive — plan the road time.",
    whatToExpect: [
      "1:00–3:30 p.m. Central at Union AME Church",
      "Candidate introductions and questions — follow the bishop and host pastors",
      "Church volunteer ask: voter registration, poll watching, and Souls to the Polls",
    ],
    whoItsFor:
      "AME pastors, ministers, and invited conference guests. Confirm with the host church before treating it as a walk-in public forum.",
    organizerNote:
      "Host brief for 2026 West / East / Arkansas Conference candidate sessions. Bishop Silvester S. Beaman. Venue matches Union AME, 1825 S. Pulaski Street. Do not list as campaign-hosted.",
    rsvpHref: "https://www.unionamec.com/home",
    audienceTags: ["AME", "Faith", "Little Rock", "Pulaski County", "Central Arkansas", "Voter registration"],
    relatedEventSlugs: [
      "ame-west-conference-magnolia-2026",
      "ame-east-conference-pine-bluff-2026",
      "lwv-fayetteville-library-oct-8-2026",
    ],
    relatedResourceHrefs: [
      { label: "Union AME Church", href: "https://www.unionamec.com/home" },
      { label: "Get involved", href: "/get-involved" },
      { label: "Voter registration", href: "/voter-registration" },
      { label: "West Conference — Magnolia, Sept. 10", href: "/events/ame-west-conference-magnolia-2026" },
      { label: "East Conference — Pine Bluff, Sept. 24", href: "/events/ame-east-conference-pine-bluff-2026" },
    ],
    mapCoordinates: { lat: 34.733, lng: -92.288 },
    mapPinQuality: "exact",
    fieldAttendance: "confirmed",
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
  {
    slug: "rally-for-hallie-jonesboro-2026",
    title: "Rally for Hallie — Jonesboro",
    type: "Community Conversation",
    region: "Northeast Arkansas",
    countySlug: "craighead-county",
    status: "upcoming",
    startsAt: "2026-09-19T16:00:00",
    endsAt: "2026-09-19T18:00:00",
    timezone: "America/Chicago",
    locationLabel: "Jonesboro — Rally for Hallie",
    addressLine: "355 S. Church Street, Jonesboro, AR 72401",
    summary:
      "Saturday, September 19, 2026, **4:00 p.m. Central** in Jonesboro: Rally for Hallie (Hallie Shoffner, U.S. Senate). Kelly’s calendar marks this Jonesboro stop. End time not posted.",
    description:
      "Kelly’s note: **Rally for Hallie in Jonesboro**, **September 19**. Public listings place the rally at **4:00 p.m.** at **355 S. Church Street**, Jonesboro.\n\nThis is a **Hallie Shoffner** campaign gathering, not a Kelly Grappe rally. Neighbors can expect candidate remarks and a chance to meet people working the midterms. Confirm the program with the host before travel.\n\nThe same Jonesboro trip is the attach point for a **KLEK 102.5 FM** candidate interview (book a slot — studio or Zoom). A tentative **Hot Spring County Democrats picnic** is also on the internal calendar at 4:00 p.m. that day — different part of the state.",
    whatToExpect: [
      "4:00 p.m. Central start (end time TBA)",
      "Senate-race rally — follow Hallie’s team for speaking order and any RSVP",
      "KLEK interview is a separate booking on the same Jonesboro trip",
    ],
    whoItsFor:
      "Craighead County neighbors and anyone turning out for Hallie Shoffner. Not a campaign-hosted Kelly event.",
    organizerNote:
      "Kelly email 2026-08-26: Rally for Hallie in Jonesboro / 9/19. Public listing: Sat Sep 19 4:00 p.m., 355 S Church St. Same-day internal hold: Hot Spring Dems picnic 4pm tentative.",
    rsvpHref: undefined,
    audienceTags: ["Jonesboro", "Craighead County", "Northeast Arkansas", "Hallie Shoffner"],
    relatedEventSlugs: ["klek-jonesboro-candidate-interview-2026", "women-in-democracy-jonesboro-2026"],
    relatedResourceHrefs: [
      { label: "KLEK interview (book a slot)", href: "/events/klek-jonesboro-candidate-interview-2026" },
      { label: "Get involved", href: "/get-involved" },
    ],
    mapCoordinates: { lat: 35.835, lng: -90.704 },
    mapPinQuality: "region",
    fieldAttendance: "confirmed",
  },
  {
    slug: "klek-jonesboro-candidate-interview-2026",
    title: "KLEK 102.5 FM — political candidate interview",
    type: "Community Conversation",
    region: "Northeast Arkansas",
    countySlug: "craighead-county",
    status: "upcoming",
    startsAt: "2026-09-19T10:00:00",
    endsAt: "2026-09-19T11:00:00",
    timezone: "America/Chicago",
    locationLabel: "KLEK 102.5 FM studio — Jonesboro (or Zoom)",
    addressLine:
      "1411 Franklin Street, Jonesboro, AR 72401 — or Zoom. Book a Political Candidate Interview slot; time on this page is a placeholder until tidycal is confirmed.",
    summary:
      "KLEK-LP 102.5 FM (the Voice of the Arkansas Minority Advocacy Council) invited Kelly for a candidate interview ahead of the November 2026 general election. Broadcast in Jonesboro and streamed on the station’s Facebook page. **Book a slot** — in studio or Zoom.",
    description:
      "Invitation from **LaGanzie Kale**, general manager of **KLEK-LP 102.5 FM**, Jonesboro. The station offers political candidate interviews so listeners can hear why someone is running and what they would do in office.\n\n**Book through the station:** [klekfm.biz](http://klekfm.biz) or [tidycal.com/klekfm/political](https://tidycal.com/klekfm/political) → **Political Candidate Interview**. Appear **in person** at **1411 Franklin Street** or **via Zoom**. If no listed time works, the station can **pre-record**.\n\nThis listing is attached to the next Jonesboro campaign stop (Rally for Hallie, September 19) so the interview is on the same trip. The 10:00 a.m. window here is only a placeholder until a tidycal time is locked. Interviews air on 102.5 FM and on the KLEK Facebook page.\n\nThis is a **station-hosted** interview, not a campaign rally.",
    whatToExpect: [
      "Self-book a Political Candidate Interview slot (or ask to pre-record)",
      "In-studio at 1411 Franklin Street or Zoom",
      "Live on KLEK 102.5 FM and the station Facebook page",
    ],
    whoItsFor:
      "Jonesboro and Northeast Arkansas listeners. Booking is for the candidate; the public hears it on air or the stream.",
    organizerNote:
      "Attach-queue item attach-klek-jonesboro-interview. Do not publish campaign email. Station phone 870-203-9951 is a business line — prefer booking URLs on the public card. Update startsAt when a slot is booked.",
    rsvpHref: "https://tidycal.com/klekfm/political",
    audienceTags: ["Jonesboro", "Craighead County", "KLEK", "Radio", "Northeast Arkansas"],
    relatedEventSlugs: ["rally-for-hallie-jonesboro-2026"],
    relatedResourceHrefs: [
      { label: "Book a Political Candidate Interview", href: "https://tidycal.com/klekfm/political" },
      { label: "KLEK booking hub", href: "http://klekfm.biz" },
      { label: "KLEK FM", href: "https://klekfm.org" },
      { label: "Rally for Hallie — Sept. 19", href: "/events/rally-for-hallie-jonesboro-2026" },
    ],
    mapCoordinates: { lat: 35.833, lng: -90.704 },
    mapPinQuality: "region",
    fieldAttendance: "tentative",
  },
  {
    slug: "women-in-democracy-jonesboro-2026",
    title: "Women in Democracy — Jonesboro (confirm host)",
    type: "Community Conversation",
    region: "Northeast Arkansas",
    countySlug: "craighead-county",
    status: "upcoming",
    startsAt: "2026-10-12T17:00:00",
    endsAt: "2026-10-12T19:00:00",
    timezone: "America/Chicago",
    locationLabel: "Jonesboro — Women in Democracy (venue TBA)",
    addressLine: "Jonesboro, AR (host and street address not on Kelly’s note — confirm before publishing a walk-in invite)",
    summary:
      "Monday, October 12, 2026: Kelly’s note says **Women in Democracy**, sent on the same thread as the Jonesboro Hallie rally. Venue and time are not confirmed. Evening window is a placeholder.",
    description:
      "On August 26, 2026, Kelly emailed a Jonesboro thread: first **Rally for Hallie / 9/19**, then **October 12 women in democracy**. This page holds the October date in **Jonesboro** until the host, room, and time are confirmed.\n\nDo not invent a League, church, or campus sponsor. Update this listing when the organizer publishes a program.\n\nThe internal calendar also has a **Saline County GOTV push** in Benton the same day — flag the conflict if both stay booked.",
    whatToExpect: [
      "Date from Kelly’s note: October 12, 2026",
      "Time and venue TBA — 5:00–7:00 p.m. is only a calendar placeholder",
      "Confirm whether the gathering is Jonesboro-only or a statewide Women in Democracy program",
    ],
    whoItsFor:
      "People following Kelly’s Jonesboro dates. Wait for the host before treating this as a public ticketed event.",
    organizerNote:
      "Kelly email 2026-08-26 on Rally for Hallie in Jonesboro thread: “October 12 women in democracy.” Location assumed Jonesboro from the thread — confirm. Same date as locked-2026-10-12-saline-county-gotv-push.",
    rsvpHref: undefined,
    audienceTags: ["Jonesboro", "Craighead County", "Northeast Arkansas", "Women"],
    relatedEventSlugs: ["rally-for-hallie-jonesboro-2026", "klek-jonesboro-candidate-interview-2026"],
    relatedResourceHrefs: [
      { label: "Rally for Hallie — Sept. 19", href: "/events/rally-for-hallie-jonesboro-2026" },
      { label: "Get involved", href: "/get-involved" },
    ],
    mapCoordinates: { lat: 35.822, lng: -90.7056 },
    mapPinQuality: "region",
    fieldAttendance: "tentative",
  },
  {
    slug: "october-daze-booneville-2026",
    title: "October Daze — Booneville (October fest)",
    type: "Fairs and Festivals",
    region: "Northwest Arkansas",
    countySlug: "logan-county",
    status: "upcoming",
    startsAt: "2026-10-10T08:00:00",
    endsAt: "2026-10-10T15:00:00",
    timezone: "America/Chicago",
    locationLabel: "Broadway Memorial Park and downtown Booneville",
    addressLine: "Broadway Memorial Park, 215 N. Broadway Avenue, Booneville, AR 72927 — festival stretches through downtown",
    summary:
      "Saturday, October 10, 2026, **8:00 a.m.–3:00 p.m. Central**: Booneville’s **October Daze** fall festival downtown and at Broadway Memorial Park. Free. The 58th Arkansas Marathon kicks off the same morning.",
    description:
      "Campaign calendar title: **October fest booneville**, Saturday, October 10, 2026. The South Logan County Chamber of Commerce lists the day as **October Daze 2026** — downtown Booneville and **Broadway Memorial Park** (215 N. Broadway Avenue), **8:00 a.m.–3:00 p.m.**, free.\n\nThe Chamber describes a full day of music, shopping, food, and community celebration as the kickoff for the **58th Arkansas Marathon** (Boston qualifier). Expect professional musicians, local show choirs and cheer squads, an antique car show, and 80+ vendors. Arkansas.com and the race listing put the marathon start at **7:00 a.m.**; the finish is in the festival. This page is the **festival** stop, not a race registration.\n\nChamber-hosted, not a campaign rally. Turkey Drop in Yellville is also on the public calendar this Saturday.",
    whatToExpect: [
      "8:00 a.m.–3:00 p.m. Central at Broadway Memorial Park and downtown streets",
      "Live music, vendors, car show, food, and a kids/family zone — follow the Chamber program",
      "Arkansas Marathon start 7:00 a.m. — expect race traffic and a crowded finish area",
    ],
    whoItsFor:
      "Logan County families, marathon fans, and anyone in Booneville for a free fall festival. Not a campaign-hosted rally.",
    organizerNote:
      "Calendar invite: October fest booneville, Sat Oct 10 2026. Official name October Daze (South Logan County Chamber). Do not publish campaign Gmail. Same-day public stop: Turkey Drop — Yellville.",
    rsvpHref: "https://southlogan.com/events/october-daze-2026",
    audienceTags: ["Booneville", "Logan County", "October Daze", "Festival", "Families"],
    relatedEventSlugs: ["booneville-jazz-2026"],
    relatedResourceHrefs: [
      { label: "October Daze 2026 — South Logan Chamber", href: "https://southlogan.com/events/october-daze-2026" },
      { label: "Arkansas Marathon and October Daze — Arkansas.com", href: "https://www.arkansas.com/experiences/discover/event-calendar/arkansas-marathon-and-october-daze" },
      { label: "Arkansas Marathon registration", href: "https://www.raceentry.com/arkansas-marathon/race-information" },
      { label: "Get involved", href: "/get-involved" },
    ],
    mapCoordinates: { lat: 35.1401, lng: -93.9216 },
    mapPinQuality: "exact",
    fieldAttendance: "confirmed",
  },
  {
    slug: "people-over-politics-back-forty-2026",
    title: "People Over Politics conversation — Back Forty (Mountain Home)",
    type: "Listening Session",
    region: "North Central Arkansas",
    countySlug: "baxter-county",
    status: "upcoming",
    startsAt: "2026-10-03T15:00:00",
    endsAt: "2026-10-03T16:00:00",
    timezone: "America/Chicago",
    locationLabel: "The Back Forty — Mountain Home",
    addressLine: "1400 Highway 62 East, Mountain Home, AR 72653",
    summary:
      "Saturday, October 3, 2026, **3:00–4:00 p.m. Central** at The Back Forty in Mountain Home: a **People Over Politics** conversation with Kelly Grappe. Bipartisan. Public invited.",
    description:
      "Staff note from Steven Grappe: **Oct. 3rd, Back Forty, 3:00–4:00 p.m.** — **Kelly Grappe — People Over Politics Conversation**. Bipartisan. Public invited.\n\nThe Back Forty (also written Back 40) is the restaurant at **1400 Highway 62 East**, Mountain Home. Baxter County Democrats have used this room for public gatherings; this listing is a **bipartisan conversation**, not a party meeting.\n\nCome hear Kelly and ask questions. A second People Over Politics / candidate forum is Tuesday, October 6, at VFW Ozark Post 3246 in Mountain Home.\n\nThe public calendar also has a Van Buren County Moonshine and Music Festival the same Saturday — different county.",
    whatToExpect: [
      "3:00–4:00 p.m. Central at The Back Forty",
      "Bipartisan People Over Politics conversation — public invited",
      "Restaurant venue — check the host for parking and whether you need to buy food",
    ],
    whoItsFor:
      "Baxter County neighbors of any party, and anyone who wants a short, public conversation — not a closed meeting.",
    organizerNote:
      "Steven Grappe note 2026-08-25. Contact on the note: Glenda Huffine (do not publish the Yahoo address). Venue inferred Mountain Home from Huffine / Back Forty use in Baxter County. Same-day public: Moonshine and Music Festival Van Buren County. Ozark Forward asked for a fundraiser this day if available.",
    rsvpHref: undefined,
    audienceTags: ["Mountain Home", "Baxter County", "People Over Politics", "Bipartisan", "North Central Arkansas"],
    relatedEventSlugs: [
      "people-over-politics-vfw-mountain-home-2026",
      "ozark-forward-fundraiser-oct-2026",
    ],
    relatedResourceHrefs: [
      { label: "Tuesday VFW candidate forum", href: "/events/people-over-politics-vfw-mountain-home-2026" },
      { label: "Ozark Forward fundraiser hold (same day)", href: "/events/ozark-forward-fundraiser-oct-2026" },
      { label: "Get involved", href: "/get-involved" },
    ],
    mapCoordinates: { lat: 36.336, lng: -92.365 },
    mapPinQuality: "region",
    fieldAttendance: "confirmed",
    listeningSessionSeries: true,
  },
  {
    slug: "ozark-forward-fundraiser-oct-2026",
    title: "Ozark Forward fundraiser — October 3 hold (if available)",
    type: "Community Conversation",
    region: "North Central Arkansas",
    countySlug: "baxter-county",
    status: "upcoming",
    startsAt: "2026-10-03T17:00:00",
    endsAt: "2026-10-03T19:00:00",
    timezone: "America/Chicago",
    locationLabel: "Ozark Forward fundraiser — venue TBA (Mountain Home area hold)",
    addressLine:
      "Time and room not set. Ozark Forward asked for a fundraiser on October 3 if Kelly is available. Placeholder evening window after the 3:00 p.m. Back Forty conversation in Mountain Home.",
    summary:
      "Saturday, October 3, 2026: **Ozark Forward** wants a fundraiser **if Kelly is available**. Time and venue are not set. This is a hold, not a locked RSVP.",
    description:
      "Ozark Forward (north-central Arkansas coalition) asked for a **fundraiser on October 3** if the campaign can do it.\n\nKelly already has a public **People Over Politics** conversation that day at **The Back Forty in Mountain Home, 3:00–4:00 p.m.** A fundraiser the same Saturday is possible **before 3:00 or after 4:00** if she stays in the Twin Lakes area — or this hold comes off if the host cannot work around that hour.\n\nThe public calendar also lists a Van Buren County Moonshine and Music Festival that Saturday (different county).\n\n**Do not treat the 5:00–7:00 p.m. window as a published start time.** It is only so the hold appears on the calendar. Update when Ozark Forward sets a room, ticket, and clock. This is a host fundraiser, not a walk-in campaign rally until they publish details.",
    whatToExpect: [
      "Date hold only — time and venue TBA",
      "Evening placeholder after the 3:00–4:00 p.m. Back Forty conversation",
      "Confirm with Ozark Forward before sharing as a ticketed public event",
    ],
    whoItsFor:
      "Ozark Forward partners and invited guests once the host publishes a program. Not a confirmed public ticket yet.",
    organizerNote:
      "Operator: Ozark Forward wants Oct 3 fundraiser if available. Same day: people-over-politics-back-forty-2026 (confirmed 3-4pm Mountain Home) and Van Buren Moonshine and Music Festival. fieldAttendance tentative until the host locks time/venue.",
    rsvpHref: "/donate",
    audienceTags: ["Ozark Forward", "Mountain Home", "Baxter County", "Fundraiser", "North Central Arkansas"],
    relatedEventSlugs: ["people-over-politics-back-forty-2026"],
    relatedResourceHrefs: [
      { label: "Saturday Back Forty conversation (3:00 p.m.)", href: "/events/people-over-politics-back-forty-2026" },
      { label: "Donate", href: "/donate" },
      { label: "Get involved", href: "/get-involved" },
    ],
    mapCoordinates: { lat: 36.3354, lng: -92.3851 },
    mapPinQuality: "region",
    fieldAttendance: "tentative",
  },
  {
    slug: "people-over-politics-vfw-mountain-home-2026",
    title: "Candidate forum — People Over Politics (VFW, Mountain Home)",
    type: "Community Conversation",
    region: "North Central Arkansas",
    countySlug: "baxter-county",
    status: "upcoming",
    startsAt: "2026-10-06T16:00:00",
    endsAt: "2026-10-06T19:00:00",
    timezone: "America/Chicago",
    locationLabel: "VFW Ozark Post 3246 — Mountain Home",
    addressLine: "214 West 7th Street, Mountain Home, AR 72653",
    summary:
      "Tuesday, October 6, 2026, **4:00–7:00 p.m. Central** at VFW Ozark Post 3246 in Mountain Home: a **candidate forum** and People Over Politics conversation. Bipartisan. Public invited.",
    description:
      "Staff note from Steven Grappe: **Oct. 6th VFW, 4:00–7:00 p.m.** — **Candidate Forum**, People Over Politics Conversation. Bipartisan. Public invited.\n\nThe note did not name a post number. In Mountain Home that is **VFW Ozark Post 3246**, **214 West 7th Street** — the hall used for other public veteran and community programs. Confirm with the host if a different VFW was meant.\n\nA shorter People Over Politics conversation with Kelly is Saturday, October 3, at The Back Forty in Mountain Home.\n\nThe League of Women Voters of Washington County’s official **Secretary of State** forum is **Thursday, October 8**, 5:30–7:30 p.m. at the Fayetteville Public Library — not this Tuesday.",
    whatToExpect: [
      "4:00–7:00 p.m. Central at VFW Post 3246",
      "Candidate forum plus People Over Politics conversation — public invited",
      "Follow post rules on the door (ID, food, or drink if they require them)",
    ],
    whoItsFor:
      "Baxter County neighbors of any party, veterans, and anyone who wants a public candidate forum.",
    organizerNote:
      "Steven Grappe note 2026-08-25. Contact on the note: Glenda Huffine (do not publish the Yahoo address). VFW inferred as Ozark Post 3246 in Mountain Home from the Back Forty / Huffine pairing.",
    rsvpHref: undefined,
    audienceTags: ["Mountain Home", "Baxter County", "VFW", "People Over Politics", "Bipartisan", "North Central Arkansas"],
    relatedEventSlugs: [
      "people-over-politics-back-forty-2026",
      "lwv-fayetteville-library-oct-8-2026",
    ],
    relatedResourceHrefs: [
      { label: "Saturday Back Forty conversation", href: "/events/people-over-politics-back-forty-2026" },
      { label: "League SOS forum — Fayetteville, Oct. 8", href: "/events/lwv-fayetteville-library-oct-8-2026" },
      { label: "Get involved", href: "/get-involved" },
    ],
    mapCoordinates: { lat: 36.3354, lng: -92.3852 },
    mapPinQuality: "exact",
    fieldAttendance: "confirmed",
    listeningSessionSeries: true,
  },
  {
    slug: "lwv-fayetteville-library-oct-8-2026",
    title: "League of Women Voters — Secretary of State forum (Fayetteville)",
    type: "Community Conversation",
    region: "Northwest Arkansas",
    countySlug: "washington-county",
    status: "upcoming",
    startsAt: "2026-10-08T17:30:00",
    endsAt: "2026-10-08T19:30:00",
    timezone: "America/Chicago",
    locationLabel: "Fayetteville Public Library — Walker Community Room",
    addressLine: "401 West Mountain Street, Fayetteville, AR 72701 (Walker Community Room, 3rd floor)",
    summary:
      "Thursday, October 8, 2026, **5:30–7:30 p.m. Central**: League of Women Voters of Washington County **nonpartisan candidate forum** for Arkansas Secretary of State. Fayetteville Public Library, Walker Community Room. About 60 minutes on stage inside the two-hour program.",
    description:
      "Official invitation from **Michelle Wolchok**, president of the **League of Women Voters of Washington County**: Thursday, **October 8, 2026**, **5:30–7:30 p.m.**, Fayetteville Public Library, **Walker Community Room**, 401 West Mountain Street.\n\nThis is a **League candidate forum**, not a debate or town hall, and not a campaign rally. The League does not support or oppose any candidate or party. A neutral moderator gives qualifying candidates equal time on questions about the Secretary of State’s office and issues for Washington County voters.\n\nCandidates should plan on an **approximate 60-minute window** on stage inside the two-hour forum. The League plans an informational session on the **three legislatively referred constitutional amendments** before or after that window. A formal participation agreement and media release will come before the event.\n\nThe program may be recorded, photographed, or livestreamed for voter education. The library keeps the recording on the Fayetteville Public Library YouTube channel. The League may archive and share it. **No signs, banners, or props.** Candidates and campaigns **may not** use any clip, photo, or quote from the forum in ads or campaign promotion.\n\nSame Thursday afternoon: AME Arkansas Conference in Little Rock, 1:00–3:30 p.m. — then north to Fayetteville for 5:30.",
    whatToExpect: [
      "5:30–7:30 p.m. Central in the Walker Community Room",
      "About 60 minutes on stage for the Secretary of State candidates; amendments briefing before or after",
      "Equal time, same rules for every qualifying candidate — forum, not a debate",
      "May be livestreamed or recorded; no campaign reuse of the recording; no signs or props",
    ],
    whoItsFor:
      "Washington County voters and anyone following the Secretary of State race. Free public library program. The League does not endorse candidates.",
    organizerNote:
      "Official invite from Michelle Wolchok, President, LWV of Washington County. Do not publish her cell on the public card — use lwvarwc.org. Do not publish campaign email. Participation agreement still to be signed. Earlier faylib listing had SOS on Oct 6; official invite is Oct 8. Same afternoon: AME Little Rock.",
    rsvpHref: "https://www.lwvarwc.org/",
    audienceTags: ["Fayetteville", "Washington County", "League of Women Voters", "Library", "Northwest Arkansas"],
    relatedEventSlugs: ["ame-arkansas-conference-little-rock-2026"],
    relatedResourceHrefs: [
      { label: "League of Women Voters of Washington County", href: "https://www.lwvarwc.org/" },
      { label: "Fayetteville Public Library", href: "https://www.faylib.org/" },
      { label: "AME Arkansas Conference — same afternoon", href: "/events/ame-arkansas-conference-little-rock-2026" },
      { label: "Get involved", href: "/get-involved" },
    ],
    mapCoordinates: { lat: 36.0626, lng: -94.1635 },
    mapPinQuality: "exact",
    fieldAttendance: "confirmed",
  },
  {
    slug: "arkansas-tv-sos-debate-oct-15-2026",
    title: "Arkansas TV — Secretary of State debate",
    type: "Community Conversation",
    region: "Central Arkansas",
    countySlug: "faulkner-county",
    status: "upcoming",
    startsAt: "2026-10-15T10:00:00",
    endsAt: "2026-10-15T11:00:00",
    timezone: "America/Chicago",
    locationLabel: "Arkansas TV studios — Conway (live broadcast)",
    addressLine:
      "350 South Donaghey Avenue, Conway, AR 72034. Live start 10:00 a.m. This is a television debate, not a walk-in studio audience.",
    summary:
      "Thursday, October 15, 2026, **10:00 a.m. Central**: live **Arkansas TV** debate for Arkansas Secretary of State. Watch on Arkansas TV / arkansastv.gov. Kelly’s campaign confirmed this slot.",
    description:
      "Arkansas TV (LaShuan Vaughn, public affairs producer) scheduled a week of debates **October 12–16**. The Secretary of State debate is **Thursday, October 15, 10:00 a.m.** live. Kelly confirmed the campaign is good for that time.\n\nThe clock is the **live broadcast start**. Candidates or a campaign representative arrive **at least two hours early** (8:00 a.m.) for walk-through, coin toss or number draw, and makeup. That call time is for the campaign, not the public.\n\nStudios are at **350 South Donaghey Avenue, Conway**. This is a **televised debate**, not a campaign rally and not a walk-in studio event. Watch on Arkansas TV. End time is not on the invite — this page uses an 11:00 a.m. placeholder until the station publishes a runtime.\n\nArkansas TV also aired the June Arkansas Press Association Secretary of State debate; this October date is a separate live studio debate.",
    whatToExpect: [
      "Live broadcast starts 10:00 a.m. Central Thursday, October 15",
      "Watch on Arkansas TV — not a public studio door event",
      "Campaign call time is 8:00 a.m. for walk-through and makeup",
    ],
    whoItsFor:
      "Anyone who wants to watch the Secretary of State candidates on Arkansas TV. Studio access is for participants and station staff.",
    organizerNote:
      "LaShuan Vaughn, Public Affairs Producer, Arkansas TV. Kelly confirmed 2026-08-25. Do not publish campaign email or producer email on the public card. Station: arkansastv.gov. Office 501-682-4178. Candidate arrive-by-8am is internal.",
    rsvpHref: "https://www.arkansastv.gov/",
    audienceTags: ["Conway", "Faulkner County", "Debate", "Arkansas TV", "Central Arkansas"],
    relatedEventSlugs: ["lwv-fayetteville-library-oct-8-2026"],
    relatedResourceHrefs: [
      { label: "Arkansas TV", href: "https://www.arkansastv.gov/" },
      { label: "League SOS forum — October 8", href: "/events/lwv-fayetteville-library-oct-8-2026" },
      { label: "Get involved", href: "/get-involved" },
    ],
    mapCoordinates: { lat: 35.088, lng: -92.442 },
    mapPinQuality: "exact",
    fieldAttendance: "confirmed",
  },
];

/** Public curated movement events only. Published CampaignOS rows merge on `/events` at request time. */
export const events: EventItem[] = markSuggestedFestivalPath([...movementEventsCore]);

export const eventTypes = [
  "Town Hall",
  "Community Conversation",
  "House Gathering",
  "Volunteer Training",
  "Direct Democracy Briefing",
  "Fairs and Festivals",
  "Immersion",
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
