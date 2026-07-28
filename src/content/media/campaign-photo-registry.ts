/**
 * Canonical file-backed campaign photo registry (launch-first).
 * Do not invent counties, events, or people — use "Unknown" until confirmed.
 *
 * Existing trail stills remain in `campaign-trail-photos.ts` until individually
 * promoted here with real captions/alt/county metadata.
 */

import type { CampaignPhotoRecord } from "@/content/media/campaign-photo-types";
import { UNKNOWN } from "@/content/media/campaign-photo-types";

/**
 * Structured photo assets ready for county pages / Journey / Meet Kelly.
 */
export const CAMPAIGN_PHOTO_REGISTRY: CampaignPhotoRecord[] = [
  {
    id: "afl-cio-pre-event-networking-20260629",
    src: "/media/campaign-photos/afl-cio-pre-event-networking-20260629.png",
    heroLevel: "FEATURE",
    publicationStatus: "DRAFT",
    basic: {
      originalFilename: "20260629_103631.png",
      width: 1536,
      height: 2048,
      orientation: "PORTRAIT",
      fileType: "image/png",
      captureDateIso: UNKNOWN,
      cameraDevice: UNKNOWN,
    },
    campaign: {
      eventName: "AFL-CIO Meeting",
      county: UNKNOWN,
      city: UNKNOWN,
      venue: UNKNOWN,
      eventDate: UNKNOWN,
      photographer: UNKNOWN,
      peopleVisible: ["Kelly Grappe"],
      organizations: ["Arkansas AFL-CIO"],
      campaignTheme: "Coalition Building",
      relatedIssue: "Labor",
      relatedSpeechVideoIds: [],
      relatedBlogPaths: [],
      relatedEventIds: [],
      relatedPagePaths: ["/about", "/about/journey", "/get-involved"],
      homepageCandidate: false,
      featuredPhoto: true,
    },
    accessibility: {
      altText:
        "Kelly Grappe talks with attendees before addressing an Arkansas AFL-CIO gathering, standing in conversation inside the event venue.",
      caption:
        "Kelly Grappe speaks with attendees before addressing the Arkansas AFL-CIO meeting, where she later earned the organization's endorsement for Secretary of State.",
      extendedDescription:
        "Kelly Grappe visits with attendees before speaking at an Arkansas AFL-CIO event. Rather than preparing in isolation, she is pictured engaging directly with participants in conversation shortly before delivering remarks that resulted in the organization's endorsement of her campaign for Secretary of State.",
      seoDescription:
        "Kelly Grappe meets with attendees before an Arkansas AFL-CIO meeting that later endorsed her for Secretary of State.",
    },
    notes:
      "Candid pre-event networking; Feature photo (not homepage hero). Location/county/city pending confirmation. Story tags: Leadership, Listening, Coalition Building, Campaign Trail, Labor, Endorsements, Community Engagement. Suggested placement: Endorsements, Campaign Journey, Meet Kelly; secondary Labor/Workforce, News, Photo Gallery, Kelly Across Arkansas.",
    createdAt: "2026-07-28T05:33:00.000Z",
    updatedAt: "2026-07-28T05:33:00.000Z",
  },
  {
    id: "mena-polk-meet-greet-20260411",
    src: "/media/campaign-photos/mena-polk-meet-greet-20260411.png",
    heroLevel: "FEATURE",
    publicationStatus: "DRAFT",
    basic: {
      originalFilename: "20260411_112755.png",
      width: 1536,
      height: 2048,
      orientation: "PORTRAIT",
      fileType: "image/png",
      captureDateIso: UNKNOWN,
      cameraDevice: UNKNOWN,
    },
    campaign: {
      eventName: "Candidate Meet & Greet in the Park",
      county: "Polk",
      city: "Mena",
      venue: "Park (Mena)",
      eventDate: UNKNOWN,
      photographer: UNKNOWN,
      peopleVisible: ["Kelly Grappe"],
      organizations: [],
      campaignTheme: "Community Engagement",
      relatedIssue: "Voter Outreach",
      relatedSpeechVideoIds: [],
      relatedBlogPaths: [],
      relatedEventIds: [],
      relatedPagePaths: ["/about/journey", "/about", "/counties/polk", "/volunteer", "/get-involved"],
      homepageCandidate: false,
      featuredPhoto: true,
    },
    accessibility: {
      altText:
        "Kelly Grappe speaks with a voter at a campaign information table during a community meet-and-greet in Mena, Arkansas.",
      caption:
        "Kelly Grappe visits with voters during a community candidate meet-and-greet in Mena, Arkansas, answering questions and discussing her vision for the Secretary of State's office.",
      extendedDescription:
        "Kelly Grappe talks with a community member beside her campaign table at a candidate meet-and-greet in Mena, Arkansas. Campaign literature, yard signs, and volunteer materials are displayed as residents gather in the park to meet candidates and discuss issues affecting their community.",
      seoDescription:
        "Kelly Grappe meets voters at a candidate meet-and-greet in Mena, Polk County, Arkansas.",
    },
    notes:
      "Feature photo (4.5/5) — retail politics / candid conversation. Tags: Community Engagement, Listening, Campaign Trail, Retail Politics, Meet & Greet, Polk County, Mena, Voter Outreach. Primary: Kelly Across Arkansas, Campaign Journey, Meet Kelly. Secondary: Polk County page, Volunteer, Events, Photo Gallery. Related org host pending if civic group confirmed.",
    createdAt: "2026-07-28T05:35:00.000Z",
    updatedAt: "2026-07-28T05:35:00.000Z",
  },
  {
    id: "people-over-politics-supporter-selfie-20260725",
    src: "/media/campaign-photos/people-over-politics-supporter-selfie-20260725.png",
    heroLevel: "FEATURE",
    publicationStatus: "DRAFT",
    basic: {
      originalFilename: "20260725_100259.png",
      width: 1024,
      height: 473,
      orientation: "LANDSCAPE",
      fileType: "image/png",
      captureDateIso: UNKNOWN,
      cameraDevice: UNKNOWN,
    },
    campaign: {
      eventName: "Community festival / supporter meetup",
      county: UNKNOWN,
      city: UNKNOWN,
      venue: "Outdoor parking lot (community venue)",
      eventDate: UNKNOWN,
      photographer: UNKNOWN,
      peopleVisible: ["Kelly Grappe"],
      organizations: [],
      campaignTheme: "Community Engagement",
      relatedIssue: "Voter Outreach",
      relatedSpeechVideoIds: [],
      relatedBlogPaths: [],
      relatedEventIds: [],
      relatedPagePaths: ["/about/journey", "/about", "/volunteer", "/get-involved"],
      homepageCandidate: false,
      featuredPhoto: true,
    },
    accessibility: {
      altText:
        "Kelly Grappe and supporters in lime-green People Over Politics shirts pose for a group selfie outdoors beside a community building.",
      caption:
        "Kelly Grappe joins supporters in People Over Politics campaign shirts for a group photo at a community event stop.",
      extendedDescription:
        "Kelly Grappe, wearing a campaign hat for Secretary of State, stands with supporters in matching lime-green People Over Politics shirts featuring a watermelon graphic. The group poses outdoors in a parking lot beside a community building, capturing a grassroots campaign moment.",
      seoDescription:
        "Kelly Grappe poses with supporters in People Over Politics campaign shirts at a community event.",
    },
    notes:
      "Feature — supporter energy / campaign merch. Brinkley AR text on a supporter hat is a business name, not confirmed event location. City/county left Unknown. Placement: Journey, Meet Kelly, Volunteer, gallery.",
    createdAt: "2026-07-28T05:40:00.000Z",
    updatedAt: "2026-07-28T05:40:00.000Z",
  },
  {
    id: "vfw-hall-voter-conversation-20260725",
    src: "/media/campaign-photos/vfw-hall-voter-conversation-20260725.png",
    heroLevel: "FEATURE",
    publicationStatus: "DRAFT",
    basic: {
      originalFilename: "20260725_071429.png",
      width: 768,
      height: 1024,
      orientation: "PORTRAIT",
      fileType: "image/png",
      captureDateIso: UNKNOWN,
      cameraDevice: UNKNOWN,
    },
    campaign: {
      eventName: "Community gathering (VFW hall)",
      county: UNKNOWN,
      city: UNKNOWN,
      venue: "VFW / gymnasium-style hall",
      eventDate: UNKNOWN,
      photographer: UNKNOWN,
      peopleVisible: ["Kelly Grappe"],
      organizations: ["VFW (venue materials visible)"],
      campaignTheme: "Listening",
      relatedIssue: "Voter Outreach",
      relatedSpeechVideoIds: [],
      relatedBlogPaths: [],
      relatedEventIds: [],
      relatedPagePaths: ["/about/journey", "/about", "/get-involved"],
      homepageCandidate: false,
      featuredPhoto: true,
    },
    accessibility: {
      altText:
        "Kelly Grappe in a People Over Politics shirt talks with a seated community member at a table inside a gymnasium-style hall.",
      caption:
        "Kelly Grappe listens to a community member during a conversation at a local VFW-style hall gathering.",
      extendedDescription:
        "Kelly Grappe, wearing a People Over Politics campaign shirt and Secretary of State campaign hat, stands beside a folding table and speaks with a seated resident inside a gymnasium-style community hall. A VFW membership application is visible on the table among everyday personal items.",
      seoDescription:
        "Kelly Grappe talks with a voter at a community hall gathering during her Secretary of State campaign.",
    },
    notes:
      "Feature — retail politics / listening. Venue typed from visible VFW membership form; city/county Unknown (Cave City shirt on constituent is not proof of location). Same-day capture family as Cave City festival stills — confirm geography with Steve if needed.",
    createdAt: "2026-07-28T05:40:00.000Z",
    updatedAt: "2026-07-28T05:40:00.000Z",
  },
  {
    id: "church-hall-constituent-conversation-20260717",
    src: "/media/campaign-photos/church-hall-constituent-conversation-20260717.png",
    heroLevel: "FEATURE",
    publicationStatus: "DRAFT",
    basic: {
      originalFilename: "20260717_191547.png",
      width: 768,
      height: 1024,
      orientation: "PORTRAIT",
      fileType: "image/png",
      captureDateIso: UNKNOWN,
      cameraDevice: UNKNOWN,
    },
    campaign: {
      eventName: "Community meet & greet",
      county: UNKNOWN,
      city: UNKNOWN,
      venue: "Church / community hall (pews)",
      eventDate: UNKNOWN,
      photographer: UNKNOWN,
      peopleVisible: ["Kelly Grappe"],
      organizations: [],
      campaignTheme: "Listening",
      relatedIssue: "Voter Outreach",
      relatedSpeechVideoIds: [],
      relatedBlogPaths: [],
      relatedEventIds: [],
      relatedPagePaths: ["/about/journey", "/about", "/get-involved"],
      homepageCandidate: false,
      featuredPhoto: true,
    },
    accessibility: {
      altText:
        "Kelly Grappe speaks with two community members beside wooden pews inside a church or community hall.",
      caption:
        "Kelly Grappe visits with residents during a conversation in a local church or community hall.",
      extendedDescription:
        "Kelly Grappe, in a white blazer and jeans, talks with an older woman and man standing among wooden pews in a warm community hall. A handmade quilt hangs on the wall behind them, underscoring a grassroots, face-to-face campaign stop.",
      seoDescription:
        "Kelly Grappe meets community members in a church or community hall during her Arkansas campaign.",
    },
    notes:
      "Feature — intimate retail politics. City/county Unknown until Steve confirms. Placement: Journey, Meet Kelly, Kelly Across Arkansas.",
    createdAt: "2026-07-28T05:40:00.000Z",
    updatedAt: "2026-07-28T05:40:00.000Z",
  },
  {
    id: "restaurant-community-meal-selfie-20260717",
    src: "/media/campaign-photos/restaurant-community-meal-selfie-20260717.png",
    heroLevel: "SUPPORTING",
    publicationStatus: "DRAFT",
    basic: {
      originalFilename: "20260717_204549.png",
      width: 1024,
      height: 473,
      orientation: "LANDSCAPE",
      fileType: "image/png",
      captureDateIso: UNKNOWN,
      cameraDevice: UNKNOWN,
    },
    campaign: {
      eventName: "Community meal / informal meet",
      county: UNKNOWN,
      city: UNKNOWN,
      venue: "Restaurant (Mexican-style dining)",
      eventDate: UNKNOWN,
      photographer: UNKNOWN,
      peopleVisible: ["Kelly Grappe"],
      organizations: [],
      campaignTheme: "Community Engagement",
      relatedIssue: "Voter Outreach",
      relatedSpeechVideoIds: [],
      relatedBlogPaths: [],
      relatedEventIds: [],
      relatedPagePaths: ["/about/journey", "/get-involved"],
      homepageCandidate: false,
      featuredPhoto: false,
    },
    accessibility: {
      altText:
        "Kelly Grappe and community members smile for a group selfie while sharing a meal at a restaurant table.",
      caption:
        "A casual campaign-trail meal with community members — an informal moment of connection off the stage.",
      extendedDescription:
        "A wide group selfie at a restaurant table shows Kelly Grappe among adults and young people sharing a meal. Colorful plates, salsa bowls, and patio umbrellas indoors mark a casual Mexican-style dining stop during community outreach.",
      seoDescription:
        "Kelly Grappe shares a meal with community members during an informal campaign stop.",
    },
    notes:
      "Supporting — composition centers a companion selfie-taker; Kelly is present but not the sole focal subject. City/county Unknown. Good gallery / Journey documentation; not a primary feature crop.",
    createdAt: "2026-07-28T05:40:00.000Z",
    updatedAt: "2026-07-28T05:40:00.000Z",
  },
  {
    id: "parade-campaign-fans-outreach-20260718",
    src: "/media/campaign-photos/parade-campaign-fans-outreach-20260718.png",
    heroLevel: "FEATURE",
    publicationStatus: "DRAFT",
    basic: {
      originalFilename: "20260718_174658.png",
      width: 768,
      height: 1024,
      orientation: "PORTRAIT",
      fileType: "image/png",
      captureDateIso: UNKNOWN,
      cameraDevice: UNKNOWN,
    },
    campaign: {
      eventName: "Parade / festival street outreach",
      county: UNKNOWN,
      city: UNKNOWN,
      venue: "Outdoor parade route",
      eventDate: UNKNOWN,
      photographer: UNKNOWN,
      peopleVisible: ["Kelly Grappe"],
      organizations: [],
      campaignTheme: "Community Engagement",
      relatedIssue: "Voter Outreach",
      relatedSpeechVideoIds: [],
      relatedBlogPaths: [],
      relatedEventIds: [],
      relatedPagePaths: ["/about/journey", "/about", "/get-involved", "/volunteer"],
      homepageCandidate: false,
      featuredPhoto: true,
    },
    accessibility: {
      altText:
        "Kelly Grappe in an orange People Over Politics shirt hands a blue campaign fan to festival-goers along a parade route.",
      caption:
        "Kelly Grappe greets parade-goers and shares campaign fans during a community festival stop.",
      extendedDescription:
        "On a sunny parade route, Kelly Grappe wears an orange People Over Politics shirt and hands blue heart-shaped campaign fans to attendees in colorful tie-dye. A parade float with a peace sign is visible behind the group, capturing active street-level voter outreach.",
      seoDescription:
        "Kelly Grappe hands out campaign fans to attendees at a community parade.",
    },
    notes:
      "Feature — strong retail-politics action. Same capture day as Johnson County Peach Festival still, but this shirt uses an apple graphic (not peach festival text), so city/county left Unknown until confirmed. Fans show Regnat Populus branding.",
    createdAt: "2026-07-28T05:40:00.000Z",
    updatedAt: "2026-07-28T05:40:00.000Z",
  },
  {
    id: "cave-city-watermelon-festival-parade-20260725",
    src: "/media/campaign-photos/cave-city-watermelon-festival-parade-20260725.png",
    heroLevel: "FEATURE",
    publicationStatus: "DRAFT",
    basic: {
      originalFilename: "20260725_103013.png",
      width: 768,
      height: 1024,
      orientation: "PORTRAIT",
      fileType: "image/png",
      captureDateIso: UNKNOWN,
      cameraDevice: UNKNOWN,
    },
    campaign: {
      eventName: "Cave City Watermelon Festival parade",
      county: "Sharp",
      city: "Cave City",
      venue: "Main street parade route",
      eventDate: UNKNOWN,
      photographer: UNKNOWN,
      peopleVisible: ["Kelly Grappe"],
      organizations: [],
      campaignTheme: "Community Engagement",
      relatedIssue: "Voter Outreach",
      relatedSpeechVideoIds: [],
      relatedBlogPaths: [],
      relatedEventIds: [],
      relatedPagePaths: ["/about/journey", "/about", "/counties/sharp", "/get-involved"],
      homepageCandidate: false,
      featuredPhoto: true,
    },
    accessibility: {
      altText:
        "Kelly Grappe waves to spectators from a parade trailer during the Cave City Watermelon Festival.",
      caption:
        "Kelly Grappe rides a parade float and waves to the crowd at the Cave City Watermelon Festival in Sharp County.",
      extendedDescription:
        "From the back of a parade trailer towed by a pickup truck, Kelly Grappe waves to spectators lining Main Street. A red banner across the street identifies the Cave City Watermelon Festival. Campaign shirts and materials sit on the trailer beside her.",
      seoDescription:
        "Kelly Grappe waves from a parade float at the Cave City Watermelon Festival in Sharp County, Arkansas.",
    },
    notes:
      "Feature — geography confirmed by festival banner in-frame. County Sharp / city Cave City. Primary: Kelly Across Arkansas, Journey, Sharp County page.",
    createdAt: "2026-07-28T05:40:00.000Z",
    updatedAt: "2026-07-28T05:40:00.000Z",
  },
  {
    id: "election-laws-arkansas-2025-edition-20260723",
    src: "/media/campaign-photos/election-laws-arkansas-2025-edition-20260723.png",
    heroLevel: "SUPPORTING",
    publicationStatus: "DRAFT",
    basic: {
      originalFilename: "20260723_125343.png",
      width: 768,
      height: 1024,
      orientation: "PORTRAIT",
      fileType: "image/png",
      captureDateIso: UNKNOWN,
      cameraDevice: UNKNOWN,
    },
    campaign: {
      eventName: UNKNOWN,
      county: UNKNOWN,
      city: UNKNOWN,
      venue: UNKNOWN,
      eventDate: UNKNOWN,
      photographer: UNKNOWN,
      peopleVisible: [],
      organizations: [],
      campaignTheme: "Election Administration",
      relatedIssue: "Election Integrity",
      relatedSpeechVideoIds: [],
      relatedBlogPaths: [],
      relatedEventIds: [],
      relatedPagePaths: ["/about", "/priorities", "/office/elections", "/understand"],
      homepageCandidate: false,
      featuredPhoto: false,
    },
    accessibility: {
      altText:
        "Cover of the 2025 edition of Election Laws of Arkansas and Constitution of the State of Arkansas, spiral-bound with yellow page tabs.",
      caption:
        "The 2025 Election Laws of Arkansas — the statutory and constitutional reference at the center of the Secretary of State's work.",
      extendedDescription:
        "A spiral-bound 2025 edition of Election Laws of Arkansas and Constitution of the State of Arkansas rests on an orange surface. Yellow sticky tabs mark actively referenced pages, illustrating hands-on engagement with Arkansas election law.",
      seoDescription:
        "2025 Election Laws of Arkansas reference book used in Secretary of State campaign research.",
    },
    notes:
      "Supporting — policy/working still, not a Kelly portrait. Cover names current SOS office issuer; use carefully on public pages (context = preparing for the office / election law focus). Placement: Issues, About SOS role — not Journey hero.",
    createdAt: "2026-07-28T05:40:00.000Z",
    updatedAt: "2026-07-28T05:40:00.000Z",
  },
  {
    id: "watermelon-festival-booth-service-20260725",
    src: "/media/campaign-photos/watermelon-festival-booth-service-20260725.png",
    heroLevel: "FEATURE",
    publicationStatus: "DRAFT",
    basic: {
      originalFilename: "20260725_141448.png",
      width: 768,
      height: 1024,
      orientation: "PORTRAIT",
      fileType: "image/png",
      captureDateIso: UNKNOWN,
      cameraDevice: UNKNOWN,
    },
    campaign: {
      eventName: "Cave City Watermelon Festival (booth)",
      county: "Sharp",
      city: "Cave City",
      venue: "Outdoor festival booth",
      eventDate: UNKNOWN,
      photographer: UNKNOWN,
      peopleVisible: ["Kelly Grappe"],
      organizations: [],
      campaignTheme: "Community Engagement",
      relatedIssue: "Voter Outreach",
      relatedSpeechVideoIds: [],
      relatedBlogPaths: [],
      relatedEventIds: [],
      relatedPagePaths: ["/about/journey", "/about", "/counties/sharp", "/volunteer"],
      homepageCandidate: false,
      featuredPhoto: true,
    },
    accessibility: {
      altText:
        "Kelly Grappe in a People Over Politics watermelon shirt serves watermelon slices at an outdoor festival table.",
      caption:
        "Kelly Grappe helps serve watermelon at a festival booth during the Cave City Watermelon Festival.",
      extendedDescription:
        "Kelly Grappe and a campaign partner in matching lime-green People Over Politics shirts stand behind white folding tables covered with fresh watermelon slices at an outdoor festival. A child stands nearby among other festival-goers.",
      seoDescription:
        "Kelly Grappe serves watermelon at a Cave City Watermelon Festival booth in Sharp County.",
    },
    notes:
      "Feature — geography inferred from same-day capture + matching watermelon festival campaign merch as the banner-confirmed Cave City parade still. Confirm booth location with Steve if needed. Placement: Sharp County, Journey, Volunteer.",
    createdAt: "2026-07-28T05:40:00.000Z",
    updatedAt: "2026-07-28T05:40:00.000Z",
  },
  {
    id: "community-dinner-constituent-conversation-20260723",
    src: "/media/campaign-photos/community-dinner-constituent-conversation-20260723.png",
    heroLevel: "FEATURE",
    publicationStatus: "DRAFT",
    basic: {
      originalFilename: "20260723_163532.png",
      width: 768,
      height: 1024,
      orientation: "PORTRAIT",
      fileType: "image/png",
      captureDateIso: UNKNOWN,
      cameraDevice: UNKNOWN,
    },
    campaign: {
      eventName: "Community dinner / political gathering",
      county: UNKNOWN,
      city: UNKNOWN,
      venue: "Indoor banquet hall",
      eventDate: UNKNOWN,
      photographer: UNKNOWN,
      peopleVisible: ["Kelly Grappe"],
      organizations: [],
      campaignTheme: "Listening",
      relatedIssue: "Voter Outreach",
      relatedSpeechVideoIds: [],
      relatedBlogPaths: [],
      relatedEventIds: [],
      relatedPagePaths: ["/about/journey", "/about", "/get-involved"],
      homepageCandidate: false,
      featuredPhoto: true,
    },
    accessibility: {
      altText:
        "Kelly Grappe leans in to talk with a seated community member at a busy indoor dinner table covered with campaign materials.",
      caption:
        "Kelly Grappe connects one-on-one with a community member during a crowded campaign dinner event.",
      extendedDescription:
        "In a banquet hall decorated with string lights, Kelly Grappe in a navy blazer leans toward a seated woman at a table filled with food and campaign materials. The warm, unscripted exchange highlights accessible, face-to-face campaigning.",
      seoDescription:
        "Kelly Grappe speaks with a voter at a community campaign dinner.",
    },
    notes:
      "Feature — strong listening moment. City/county Unknown. Table also shows other candidates' literature and mixed campaign merch (including non-SOS branding in background); crop carefully for public use. Placement: Journey, Meet Kelly.",
    createdAt: "2026-07-28T05:40:00.000Z",
    updatedAt: "2026-07-28T05:40:00.000Z",
  },
  {
    id: "johnson-county-peach-festival-parade-20260718",
    src: "/media/campaign-photos/johnson-county-peach-festival-parade-20260718.png",
    heroLevel: "FEATURE",
    publicationStatus: "DRAFT",
    basic: {
      originalFilename: "20260718_182440.png",
      width: 768,
      height: 1024,
      orientation: "PORTRAIT",
      fileType: "image/png",
      captureDateIso: UNKNOWN,
      cameraDevice: UNKNOWN,
    },
    campaign: {
      eventName: "85th Annual Johnson County Peach Festival",
      county: "Johnson",
      city: "Clarksville",
      venue: "Downtown parade route",
      eventDate: UNKNOWN,
      photographer: UNKNOWN,
      peopleVisible: ["Kelly Grappe"],
      organizations: [],
      campaignTheme: "Community Engagement",
      relatedIssue: "Voter Outreach",
      relatedSpeechVideoIds: [],
      relatedBlogPaths: [],
      relatedEventIds: [],
      relatedPagePaths: ["/about/journey", "/about", "/counties/johnson", "/get-involved"],
      homepageCandidate: false,
      featuredPhoto: true,
    },
    accessibility: {
      altText:
        "Kelly Grappe waves to parade spectators while walking down a street at the Johnson County Peach Festival.",
      caption:
        "Kelly Grappe waves to the crowd along the parade route at the 85th Annual Johnson County Peach Festival in Clarksville.",
      extendedDescription:
        "Smiling and waving, Kelly Grappe walks the center of a downtown street in an orange People Over Politics shirt printed for the 85th Annual Johnson County Peach Festival. Spectators stand behind caution tape beside vendor tents as she works the parade route.",
      seoDescription:
        "Kelly Grappe waves to crowds at the Johnson County Peach Festival parade in Clarksville, Arkansas.",
    },
    notes:
      "Feature — event confirmed by shirt text. County Johnson; city Clarksville (traditional Peach Festival host) — confirm if Steve wants city Unknown. Placement: Johnson County page, Journey, Kelly Across Arkansas.",
    createdAt: "2026-07-28T05:40:00.000Z",
    updatedAt: "2026-07-28T05:40:00.000Z",
  },
  {
    id: "community-center-voter-circle-20260713",
    src: "/media/campaign-photos/community-center-voter-circle-20260713.png",
    heroLevel: "FEATURE",
    publicationStatus: "DRAFT",
    basic: {
      originalFilename: "20260713_195351.png",
      width: 1024,
      height: 768,
      orientation: "LANDSCAPE",
      fileType: "image/png",
      captureDateIso: UNKNOWN,
      cameraDevice: UNKNOWN,
    },
    campaign: {
      eventName: "Community meet & greet",
      county: UNKNOWN,
      city: UNKNOWN,
      venue: "Community center / public lobby",
      eventDate: UNKNOWN,
      photographer: UNKNOWN,
      peopleVisible: ["Kelly Grappe"],
      organizations: [],
      campaignTheme: "Listening",
      relatedIssue: "Voter Outreach",
      relatedSpeechVideoIds: [],
      relatedBlogPaths: [],
      relatedEventIds: [],
      relatedPagePaths: ["/about/journey", "/about", "/get-involved"],
      homepageCandidate: false,
      featuredPhoto: true,
    },
    accessibility: {
      altText:
        "Kelly Grappe talks with two community members in a bright indoor lobby near a glass exit door.",
      caption:
        "Kelly Grappe visits with residents during a conversation at a community gathering.",
      extendedDescription:
        "Kelly Grappe, in a tan blazer with a campaign button, stands between two community members and gestures mid-conversation inside a public lobby. Campaign signs are partially visible at the edge of the frame as daylight fills the room from glass doors behind the group.",
      seoDescription:
        "Kelly Grappe speaks with community members at an indoor campaign meet-and-greet.",
    },
    notes:
      "Feature — retail politics circle conversation. City/county Unknown (not invented as Mena). Name tags visible on attendees; do not publish full names without confirmation. Placement: Journey, Meet Kelly, Across Arkansas.",
    createdAt: "2026-07-28T05:45:00.000Z",
    updatedAt: "2026-07-28T05:45:00.000Z",
  },
  {
    id: "meet-greet-conversation-matt-20260712",
    src: "/media/campaign-photos/meet-greet-conversation-matt-20260712.png",
    heroLevel: "FEATURE",
    publicationStatus: "DRAFT",
    basic: {
      originalFilename: "20260712_114459.png",
      width: 1024,
      height: 768,
      orientation: "LANDSCAPE",
      fileType: "image/png",
      captureDateIso: UNKNOWN,
      cameraDevice: UNKNOWN,
    },
    campaign: {
      eventName: "Community meal / meet & greet",
      county: UNKNOWN,
      city: UNKNOWN,
      venue: "Community hall (blue tablecloths)",
      eventDate: UNKNOWN,
      photographer: UNKNOWN,
      peopleVisible: ["Kelly Grappe"],
      organizations: [],
      campaignTheme: "Listening",
      relatedIssue: "Voter Outreach",
      relatedSpeechVideoIds: [],
      relatedBlogPaths: [],
      relatedEventIds: [],
      relatedPagePaths: ["/about/journey", "/about", "/get-involved"],
      homepageCandidate: false,
      featuredPhoto: true,
    },
    accessibility: {
      altText:
        "Kelly Grappe listens closely while speaking with a community member wearing a name tag at an indoor gathering.",
      caption:
        "Kelly Grappe connects one-on-one with a community member during a meet-and-greet conversation.",
      extendedDescription:
        "In a close portrait of retail politics, Kelly Grappe wears a navy blazer and a Secretary of State name tag while listening to a community member at an indoor event. Soft background tables with blue cloths keep the focus on the face-to-face exchange.",
      seoDescription:
        "Kelly Grappe listens to a voter during a community meet-and-greet.",
    },
    notes:
      "Feature — strong listening crop. Same-day family as community-meal-table-conversation-20260712. City/county Unknown. Attendee first name visible on tag (Matt) — omit from public caption unless confirmed for release. Placement: Journey, Meet Kelly.",
    createdAt: "2026-07-28T05:45:00.000Z",
    updatedAt: "2026-07-28T05:45:00.000Z",
  },
  {
    id: "personal-family-moment-20260707",
    src: "/media/campaign-photos/personal-family-moment-20260707.png",
    heroLevel: "SUPPORTING",
    publicationStatus: "DRAFT",
    basic: {
      originalFilename: "20260707_102524.png",
      width: 768,
      height: 1024,
      orientation: "PORTRAIT",
      fileType: "image/png",
      captureDateIso: UNKNOWN,
      cameraDevice: UNKNOWN,
    },
    campaign: {
      eventName: UNKNOWN,
      county: UNKNOWN,
      city: UNKNOWN,
      venue: "Home (personal)",
      eventDate: UNKNOWN,
      photographer: UNKNOWN,
      peopleVisible: ["Kelly Grappe"],
      organizations: [],
      campaignTheme: "About Kelly",
      relatedIssue: UNKNOWN,
      relatedSpeechVideoIds: [],
      relatedBlogPaths: [],
      relatedEventIds: [],
      relatedPagePaths: ["/about"],
      homepageCandidate: false,
      featuredPhoto: false,
    },
    accessibility: {
      altText:
        "Kelly Grappe sits in a living-room recliner with a young child on her lap as they look at a tablet together.",
      caption:
        "A quiet at-home moment — the personal life behind a statewide campaign.",
      extendedDescription:
        "In a wood-paneled living room, Kelly Grappe sits in a recliner with a young child, sharing a tablet on a plaid blanket. The unscripted domestic scene contrasts with trail photos and is intended only for carefully approved About Kelly storytelling.",
      seoDescription:
        "Kelly Grappe in a personal at-home moment during her Secretary of State campaign.",
    },
    notes:
      "SUPPORTING / personal — MINOR IN FRAME. Do not publish without explicit Steve + family consent. Do not name the child. Not for county pages, Journey trail, or galleries by default. Hold in DRAFT until approved.",
    createdAt: "2026-07-28T05:45:00.000Z",
    updatedAt: "2026-07-28T05:45:00.000Z",
  },
  {
    id: "gallery-voter-conversation-20260627",
    src: "/media/campaign-photos/gallery-voter-conversation-20260627.png",
    heroLevel: "FEATURE",
    publicationStatus: "DRAFT",
    basic: {
      originalFilename: "20260627_155321.png",
      width: 768,
      height: 1024,
      orientation: "PORTRAIT",
      fileType: "image/png",
      captureDateIso: UNKNOWN,
      cameraDevice: UNKNOWN,
    },
    campaign: {
      eventName: "Community / gallery meet",
      county: UNKNOWN,
      city: UNKNOWN,
      venue: "Indoor gallery / community space",
      eventDate: UNKNOWN,
      photographer: UNKNOWN,
      peopleVisible: ["Kelly Grappe"],
      organizations: [],
      campaignTheme: "Listening",
      relatedIssue: "Voter Outreach",
      relatedSpeechVideoIds: [],
      relatedBlogPaths: [],
      relatedEventIds: [],
      relatedPagePaths: ["/about/journey", "/about", "/get-involved"],
      homepageCandidate: false,
      featuredPhoto: true,
    },
    accessibility: {
      altText:
        "Kelly Grappe in a white blazer over a red People Over Politics shirt listens to a community member indoors.",
      caption:
        "Kelly Grappe talks with a community member while wearing her People Over Politics campaign shirt.",
      extendedDescription:
        "Kelly Grappe, in a white blazer over a red campaign shirt, stands in conversation with a woman in an indoor gallery-style space with framed photographs on the walls. The candid exchange highlights accessible, face-to-face campaigning.",
      seoDescription:
        "Kelly Grappe speaks with a voter at an indoor community event during her Arkansas campaign.",
    },
    notes:
      "Feature — clear Kelly branding (People Over Politics / SOS). City/county Unknown. Same capture day as historic-site still. Placement: Journey, Meet Kelly.",
    createdAt: "2026-07-28T05:45:00.000Z",
    updatedAt: "2026-07-28T05:45:00.000Z",
  },
  {
    id: "historic-site-voter-conversation-20260627",
    src: "/media/campaign-photos/historic-site-voter-conversation-20260627.png",
    heroLevel: "FEATURE",
    publicationStatus: "DRAFT",
    basic: {
      originalFilename: "20260627_101708.png",
      width: 1024,
      height: 768,
      orientation: "LANDSCAPE",
      fileType: "image/png",
      captureDateIso: UNKNOWN,
      cameraDevice: UNKNOWN,
    },
    campaign: {
      eventName: "Historic site / living-history community event",
      county: UNKNOWN,
      city: UNKNOWN,
      venue: "Log cabin historic site",
      eventDate: UNKNOWN,
      photographer: UNKNOWN,
      peopleVisible: ["Kelly Grappe"],
      organizations: [],
      campaignTheme: "Community Engagement",
      relatedIssue: "Voter Outreach",
      relatedSpeechVideoIds: [],
      relatedBlogPaths: [],
      relatedEventIds: [],
      relatedPagePaths: ["/about/journey", "/about", "/get-involved"],
      homepageCandidate: false,
      featuredPhoto: true,
    },
    accessibility: {
      altText:
        "Kelly Grappe in a red People Over Politics shirt talks with a community member in front of a log cabin with living-history reenactors.",
      caption:
        "Kelly Grappe meets voters at a historic-site community event, with living-history reenactors in the background.",
      extendedDescription:
        "Outdoors beside a log cabin decorated with patriotic bunting, Kelly Grappe speaks animatedly with a community member. Period-costumed reenactors stand on the porch behind them, marking a distinctive festival or heritage-day stop on the campaign trail.",
      seoDescription:
        "Kelly Grappe talks with a voter at a historic cabin community event during her campaign.",
    },
    notes:
      "Feature — distinctive venue (log cabin + reenactors). City/county Unknown until Steve IDs site (building number 300 visible across street). Placement: Journey, Across Arkansas.",
    createdAt: "2026-07-28T05:45:00.000Z",
    updatedAt: "2026-07-28T05:45:00.000Z",
  },
  {
    id: "bates-event-conversation-20260626",
    src: "/media/campaign-photos/bates-event-conversation-20260626.png",
    heroLevel: "FEATURE",
    publicationStatus: "DRAFT",
    basic: {
      originalFilename: "20260626_110300.png",
      width: 768,
      height: 1024,
      orientation: "PORTRAIT",
      fileType: "image/png",
      captureDateIso: UNKNOWN,
      cameraDevice: UNKNOWN,
    },
    campaign: {
      eventName: "Community banquet / civic event (BATES banner)",
      county: UNKNOWN,
      city: UNKNOWN,
      venue: "Banquet / conference hall",
      eventDate: UNKNOWN,
      photographer: UNKNOWN,
      peopleVisible: ["Kelly Grappe"],
      organizations: [],
      campaignTheme: "Listening",
      relatedIssue: "Voter Outreach",
      relatedSpeechVideoIds: [],
      relatedBlogPaths: [],
      relatedEventIds: [],
      relatedPagePaths: ["/about/journey", "/about", "/get-involved"],
      homepageCandidate: false,
      featuredPhoto: true,
    },
    accessibility: {
      altText:
        "Kelly Grappe speaks with a man in a suit holding a binder in a banquet hall with U.S. and Arkansas flags.",
      caption:
        "Kelly Grappe talks with a community leader during a civic banquet event.",
      extendedDescription:
        "In a banquet hall under a chandelier, Kelly Grappe in a white blazer listens to a man in a navy suit holding a binder. U.S. and Arkansas flags stand behind them, and a banner partially reading BATES is visible in the background.",
      seoDescription:
        "Kelly Grappe converses with a community leader at a civic banquet during her campaign.",
    },
    notes:
      "Feature — BATES banner visible (likely Batesville / Independence County). City/county left Unknown until Steve confirms. If confirmed: set city Batesville, county Independence, relatedPagePaths += /counties/independence. Placement: Journey pending geo confirm.",
    createdAt: "2026-07-28T05:45:00.000Z",
    updatedAt: "2026-07-28T05:45:00.000Z",
  },
  {
    id: "campaign-hq-supporter-conversation-20260711",
    src: "/media/campaign-photos/campaign-hq-supporter-conversation-20260711.png",
    heroLevel: "FEATURE",
    publicationStatus: "DRAFT",
    basic: {
      originalFilename: "20260711_182215.png",
      width: 1024,
      height: 768,
      orientation: "LANDSCAPE",
      fileType: "image/png",
      captureDateIso: UNKNOWN,
      cameraDevice: UNKNOWN,
    },
    campaign: {
      eventName: "Campaign office / coalition HQ visit",
      county: UNKNOWN,
      city: UNKNOWN,
      venue: "Campaign / party office",
      eventDate: UNKNOWN,
      photographer: UNKNOWN,
      peopleVisible: ["Kelly Grappe"],
      organizations: [],
      campaignTheme: "Coalition Building",
      relatedIssue: "Voter Outreach",
      relatedSpeechVideoIds: [],
      relatedBlogPaths: [],
      relatedEventIds: [],
      relatedPagePaths: ["/about/journey", "/volunteer", "/get-involved"],
      homepageCandidate: false,
      featuredPhoto: true,
    },
    accessibility: {
      altText:
        "Kelly Grappe talks with supporters inside a campaign office lined with candidate signs and maps.",
      caption:
        "Kelly Grappe visits with supporters in a local campaign office filled with volunteer energy and yard signs.",
      extendedDescription:
        "Inside a campaign headquarters, Kelly Grappe in a white blazer converses with supporters while a seated volunteer holds a Regnat Populus campaign fan. Walls display multiple candidates' signs, district maps, and vote materials, underscoring coalition-style organizing.",
      seoDescription:
        "Kelly Grappe meets supporters inside a campaign office during her Secretary of State race.",
    },
    notes:
      "Feature — HQ energy. Heavy other-candidate signage in frame; crop carefully for public pages or use as coalition/organizing story. City/county Unknown. Placement: Volunteer, Journey (with crop), not clean Meet Kelly hero.",
    createdAt: "2026-07-28T05:45:00.000Z",
    updatedAt: "2026-07-28T05:45:00.000Z",
  },
  {
    id: "community-meal-table-conversation-20260712",
    src: "/media/campaign-photos/community-meal-table-conversation-20260712.png",
    heroLevel: "FEATURE",
    publicationStatus: "DRAFT",
    basic: {
      originalFilename: "20260712_120529.png",
      width: 768,
      height: 1024,
      orientation: "PORTRAIT",
      fileType: "image/png",
      captureDateIso: UNKNOWN,
      cameraDevice: UNKNOWN,
    },
    campaign: {
      eventName: "Community meal / meet & greet",
      county: UNKNOWN,
      city: UNKNOWN,
      venue: "Community hall dining room",
      eventDate: UNKNOWN,
      photographer: UNKNOWN,
      peopleVisible: ["Kelly Grappe"],
      organizations: [],
      campaignTheme: "Community Engagement",
      relatedIssue: "Voter Outreach",
      relatedSpeechVideoIds: [],
      relatedBlogPaths: [],
      relatedEventIds: [],
      relatedPagePaths: ["/about/journey", "/about", "/get-involved"],
      homepageCandidate: false,
      featuredPhoto: true,
    },
    accessibility: {
      altText:
        "Kelly Grappe sits at a blue-covered community dinner table talking with neighbors, with a People Over Politics banner behind her.",
      caption:
        "Kelly Grappe shares a community meal and conversation with residents at a local gathering.",
      extendedDescription:
        "Seated at a long table with a bright blue tablecloth, Kelly Grappe talks with community members over a casual meal. A People Over Politics campaign banner and literature on the table mark the stop as an intentional meet-and-greet, not a staged speech.",
      seoDescription:
        "Kelly Grappe joins a community meal meet-and-greet during her Arkansas campaign.",
    },
    notes:
      "Feature — mealtime retail politics. Same-day family as meet-greet-conversation-matt-20260712. City/county Unknown. Attendee name tags visible — omit from public copy unless cleared. Placement: Journey, Meet Kelly.",
    createdAt: "2026-07-28T05:45:00.000Z",
    updatedAt: "2026-07-28T05:45:00.000Z",
  },
  {
    id: "community-meeting-group-portrait-20260716",
    src: "/media/campaign-photos/community-meeting-group-portrait-20260716.png",
    heroLevel: "FEATURE",
    publicationStatus: "DRAFT",
    basic: {
      originalFilename: "20260716_184223.png",
      width: 1024,
      height: 768,
      orientation: "LANDSCAPE",
      fileType: "image/png",
      captureDateIso: UNKNOWN,
      cameraDevice: UNKNOWN,
    },
    campaign: {
      eventName: "Community meeting / team gather",
      county: UNKNOWN,
      city: UNKNOWN,
      venue: "Classroom / meeting room",
      eventDate: UNKNOWN,
      photographer: UNKNOWN,
      peopleVisible: ["Kelly Grappe"],
      organizations: [],
      campaignTheme: "Community Engagement",
      relatedIssue: "Voter Outreach",
      relatedSpeechVideoIds: [],
      relatedBlogPaths: [],
      relatedEventIds: [],
      relatedPagePaths: ["/about/journey", "/volunteer", "/get-involved"],
      homepageCandidate: false,
      featuredPhoto: true,
    },
    accessibility: {
      altText:
        "Kelly Grappe stands with a diverse group of supporters for a group photo in a community meeting room.",
      caption:
        "Kelly Grappe gathers with community supporters after a local campaign meeting.",
      extendedDescription:
        "Centered in a meeting-room group portrait, Kelly Grappe smiles with supporters of mixed ages after what appears to be a community briefing. Tables and wall monitors frame a casual, post-meeting team moment useful for volunteer and organizing pages.",
      seoDescription:
        "Kelly Grappe poses with supporters after a community campaign meeting.",
    },
    notes:
      "Feature — group energy / volunteer story. City/county Unknown. Placement: Volunteer, Get Involved, Journey gallery.",
    createdAt: "2026-07-28T05:45:00.000Z",
    updatedAt: "2026-07-28T05:45:00.000Z",
  },
];

export function listCampaignPhotos(): CampaignPhotoRecord[] {
  return CAMPAIGN_PHOTO_REGISTRY;
}

export function listPublishedCampaignPhotos(): CampaignPhotoRecord[] {
  return CAMPAIGN_PHOTO_REGISTRY.filter((p) => p.publicationStatus === "PUBLISHED");
}

export function getCampaignPhotoById(id: string): CampaignPhotoRecord | null {
  return CAMPAIGN_PHOTO_REGISTRY.find((p) => p.id === id) ?? null;
}

export function listCampaignPhotosByCounty(county: string): CampaignPhotoRecord[] {
  const c = county.trim().toLowerCase().replace(/\s+county$/, "");
  if (!c) return [];
  return CAMPAIGN_PHOTO_REGISTRY.filter((p) => {
    if (p.campaign.county === "Unknown") return false;
    const stored = p.campaign.county.toLowerCase().replace(/\s+county$/, "");
    return stored === c || stored.includes(c) || c.includes(stored);
  });
}

export function listFeatureCandidates(): CampaignPhotoRecord[] {
  return CAMPAIGN_PHOTO_REGISTRY.filter(
    (p) =>
      p.heroLevel === "FEATURE" &&
      (p.publicationStatus === "DRAFT" ||
        p.publicationStatus === "IN_REVIEW" ||
        p.publicationStatus === "APPROVED" ||
        p.publicationStatus === "PUBLISHED"),
  );
}

export function listHeroCandidates(): CampaignPhotoRecord[] {
  return CAMPAIGN_PHOTO_REGISTRY.filter(
    (p) => p.heroLevel === "HERO" && (p.publicationStatus === "APPROVED" || p.publicationStatus === "PUBLISHED"),
  );
}

export function assertCampaignPhotoRegistryInvariants(
  records: CampaignPhotoRecord[] = CAMPAIGN_PHOTO_REGISTRY,
): void {
  const ids = new Set<string>();
  for (const p of records) {
    if (ids.has(p.id)) throw new Error(`Duplicate photo id: ${p.id}`);
    ids.add(p.id);
    if (!p.src.trim()) throw new Error(`Photo missing src: ${p.id}`);
    if (p.publicationStatus === "PUBLISHED") {
      if (!p.accessibility.altText.trim()) throw new Error(`Published photo missing alt: ${p.id}`);
      if (!p.accessibility.caption.trim()) throw new Error(`Published photo missing caption: ${p.id}`);
    }
    if (p.campaign.peopleVisible.some((name) => !name.trim())) {
      throw new Error(`Empty peopleVisible entry: ${p.id}`);
    }
  }
}
