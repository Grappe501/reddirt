/**
 * Canonical file-backed campaign photo registry (launch-first).
 * Do not invent counties, events, or people — use "Unknown" until confirmed.
 *
 * Existing trail stills remain in `campaign-trail-photos.ts` until individually
 * promoted here with real captions/alt/county metadata.
 */

import type { CampaignPhotoRecord } from "@/content/media/campaign-photo-types";
import { UNKNOWN } from "@/content/media/campaign-photo-types";
import { mergeCampaignPhotoWithEvidence, mergeCampaignPhotosWithEvidence } from "@/lib/campaign-media/merge-photo-evidence";

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
      homepageCandidate: true,
      featuredPhoto: true,
    },
    accessibility: {
      altText:
        "Kelly Grappe talks with attendees before addressing an Arkansas AFL-CIO gathering, standing in conversation inside the event venue.",
      caption:
        "Kelly Grappe speaks with attendees before addressing an Arkansas AFL-CIO gathering.",
      extendedDescription:
        "Kelly Grappe visits with attendees before speaking at an Arkansas AFL-CIO event, engaging participants in conversation inside the venue.",
      seoDescription:
        "Kelly Grappe meets with attendees before an Arkansas AFL-CIO meeting.",
    },
    notes:
      "Candid pre-event networking; Feature photo. County/city Unknown — do not attach to county workbench. Homepage candidate (Latest Campaign Photos). On /endorsements, pair with Arkansas AFL-CIO confirmation and note that the photo is pre-address networking, not the endorsement announcement itself.",
    createdAt: "2026-07-28T05:33:00.000Z",
    updatedAt: "2026-07-28T14:30:00.000Z",
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
      homepageCandidate: true,
      featuredPhoto: true,
    },
    accessibility: {
      altText:
        "Kelly Grappe speaks with a voter at a campaign information table during a community meet-and-greet in Mena, Arkansas.",
      caption:
        "Kelly Grappe visits with voters at a candidate meet-and-greet in Mena, Arkansas.",
      extendedDescription:
        "Kelly Grappe talks with a community member beside her campaign table at a candidate meet-and-greet in Mena, Arkansas. Campaign literature, yard signs, and volunteer materials are displayed as residents gather in the park to meet candidates and discuss issues affecting their community.",
      seoDescription:
        "Kelly Grappe meets voters at a candidate meet-and-greet in Mena, Polk County, Arkansas.",
    },
    notes:
      "Feature photo — retail politics in Mena / Polk (confirmed). Homepage candidate: Latest Campaign Photos + Meet Kelly still. County attachment YES → /counties/polk.",
    createdAt: "2026-07-28T05:35:00.000Z",
    updatedAt: "2026-07-28T14:30:00.000Z",
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
      homepageCandidate: true,
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
      homepageCandidate: true,
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
  {
    id: "stone-building-outdoor-gathering-20260620",
    src: "/media/campaign-photos/stone-building-outdoor-gathering-20260620.png",
    heroLevel: "FEATURE",
    publicationStatus: "DRAFT",
    basic: {
      originalFilename: "IMG_20260620_223137.png",
      width: 1024,
      height: 768,
      orientation: "LANDSCAPE",
      fileType: "image/png",
      captureDateIso: UNKNOWN,
      cameraDevice: UNKNOWN,
    },
    campaign: {
      eventName: "Community gathering (outdoor entry)",
      county: UNKNOWN,
      city: UNKNOWN,
      venue: "Stone building entrance / steps",
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
        "Kelly Grappe talks with a smiling woman in a red dress outside a stone community building as others gather on the steps.",
      caption:
        "Kelly Grappe visits with community members outside a local gathering, meeting people as they arrive.",
      extendedDescription:
        "Outside a fieldstone building on a sunny day, Kelly Grappe in a light blue shirt speaks with a woman in a bright red dress and straw hat while others wait on concrete steps near glass doors. The candid arrival-line moment captures informal retail politics without a stage or podium.",
      seoDescription:
        "Kelly Grappe greets community members outside a stone building at a local gathering.",
    },
    notes:
      "Feature — same-day pair with stone-building-handshake-steps-20260620. City/county Unknown. Placement: Journey, Across Arkansas.",
    createdAt: "2026-07-28T05:50:00.000Z",
    updatedAt: "2026-07-28T05:50:00.000Z",
  },
  {
    id: "regnat-populus-buttigieg-group-20260626",
    src: "/media/campaign-photos/regnat-populus-buttigieg-group-20260626.png",
    heroLevel: "FEATURE",
    publicationStatus: "DRAFT",
    basic: {
      originalFilename: "IMG_20260626_204648.png",
      width: 1024,
      height: 791,
      orientation: "LANDSCAPE",
      fileType: "image/png",
      captureDateIso: UNKNOWN,
      cameraDevice: UNKNOWN,
    },
    campaign: {
      eventName: "Campaign event / photo opportunity",
      county: UNKNOWN,
      city: UNKNOWN,
      venue: "Indoor backdrop (U.S. & Arkansas flags)",
      eventDate: UNKNOWN,
      photographer: UNKNOWN,
      peopleVisible: ["Kelly Grappe", "Pete Buttigieg"],
      organizations: [],
      campaignTheme: "Coalition Building",
      relatedIssue: "Voter Outreach",
      relatedSpeechVideoIds: [],
      relatedBlogPaths: [],
      relatedEventIds: [],
      relatedPagePaths: ["/about", "/about/journey", "/get-involved"],
      homepageCandidate: false,
      featuredPhoto: true,
    },
    accessibility: {
      altText:
        "Kelly Grappe in a Regnat Populus shirt stands with Pete Buttigieg and two supporters between U.S. and Arkansas flags.",
      caption:
        "Kelly Grappe joins Pete Buttigieg and supporters for a photo in Regnat Populus campaign shirts — The People Rule.",
      extendedDescription:
        "Against a blue backdrop flanked by the U.S. and Arkansas flags, Kelly Grappe wears a black Regnat Populus shirt and Secretary of State campaign button while posing with Pete Buttigieg and two supporters. The image documents a high-visibility campaign association; do not describe as a formal endorsement unless separately confirmed.",
      seoDescription:
        "Kelly Grappe poses with Pete Buttigieg and supporters in Regnat Populus campaign shirts.",
    },
    notes:
      "Feature — national association still. Caption must not invent endorsement language. City/county/event name Unknown until Steve confirms. Strong Meet Kelly / News / coalition placement after APPROVED.",
    createdAt: "2026-07-28T05:50:00.000Z",
    updatedAt: "2026-07-28T05:50:00.000Z",
  },
  {
    id: "festival-booth-supporter-selfie-20260619",
    src: "/media/campaign-photos/festival-booth-supporter-selfie-20260619.png",
    heroLevel: "FEATURE",
    publicationStatus: "DRAFT",
    basic: {
      originalFilename: "20260619_194431.png",
      width: 1024,
      height: 768,
      orientation: "LANDSCAPE",
      fileType: "image/png",
      captureDateIso: UNKNOWN,
      cameraDevice: UNKNOWN,
    },
    campaign: {
      eventName: "Outdoor festival / campaign booth",
      county: UNKNOWN,
      city: UNKNOWN,
      venue: "Outdoor festival grounds",
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
        "Kelly Grappe and a supporter in matching campaign shirts smile beside a People Over Politics banner at an outdoor festival booth.",
      caption:
        "Kelly Grappe stands with a supporter at a festival booth beside her People Over Politics campaign banner.",
      extendedDescription:
        "At an outdoor festival, Kelly Grappe and a supporter wear matching light-blue campaign shirts and smile near a People Over Politics pop-up banner and literature table. Shipping containers and tents fill the background, marking a classic grassroots booth stop.",
      seoDescription:
        "Kelly Grappe with a supporter at an outdoor festival campaign booth.",
    },
    notes:
      "Feature — clear branding (banner + shirts). City/county Unknown. Hugg & Hall Mobile Storage sign visible in background — venue clue only. Placement: Journey, Volunteer.",
    createdAt: "2026-07-28T05:50:00.000Z",
    updatedAt: "2026-07-28T05:50:00.000Z",
  },
  {
    id: "cafeteria-voter-conversation-20260617",
    src: "/media/campaign-photos/cafeteria-voter-conversation-20260617.png",
    heroLevel: "FEATURE",
    publicationStatus: "DRAFT",
    basic: {
      originalFilename: "20260617_122421.png",
      width: 1024,
      height: 768,
      orientation: "LANDSCAPE",
      fileType: "image/png",
      captureDateIso: UNKNOWN,
      cameraDevice: UNKNOWN,
    },
    campaign: {
      eventName: "Community meal / cafeteria visit",
      county: UNKNOWN,
      city: UNKNOWN,
      venue: "Cafeteria / community kitchen",
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
        "Kelly Grappe smiles while talking with a community member in a cafeteria near a kitchen doorway.",
      caption:
        "Kelly Grappe visits with a resident during a community meal in a local cafeteria.",
      extendedDescription:
        "Inside a cafeteria-style community space, Kelly Grappe in a green blouse holds her phone and talks with a woman near a kitchen doorway marked Not An Exit. Another resident carries a meal tray past them, underscoring an everyday, unscripted campaign stop.",
      seoDescription:
        "Kelly Grappe talks with a voter at a community cafeteria gathering.",
    },
    notes:
      "Feature — everyday retail politics. City/county Unknown. Name tag visible (Kelly Grappe). Placement: Journey, Meet Kelly.",
    createdAt: "2026-07-28T05:50:00.000Z",
    updatedAt: "2026-07-28T05:50:00.000Z",
  },
  {
    id: "good-things-grow-hall-conversation-20260613",
    src: "/media/campaign-photos/good-things-grow-hall-conversation-20260613.png",
    heroLevel: "FEATURE",
    publicationStatus: "DRAFT",
    basic: {
      originalFilename: "20260613_123057.png",
      width: 768,
      height: 1024,
      orientation: "PORTRAIT",
      fileType: "image/png",
      captureDateIso: UNKNOWN,
      cameraDevice: UNKNOWN,
    },
    campaign: {
      eventName: "Good Things Grow community meal",
      county: UNKNOWN,
      city: UNKNOWN,
      venue: "Community hall / church annex",
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
        "Kelly Grappe in a Good Things Grow shirt talks with seated community members at a hall dining table.",
      caption:
        "Kelly Grappe visits tables during a Good Things Grow community meal, talking with neighbors face-to-face.",
      extendedDescription:
        "In a vaulted community hall, Kelly Grappe wears a cream Good Things Grow shirt and a People Over Politics button while speaking with people seated at a meal table. The candid table-side stop is part of a same-day Good Things Grow photo set.",
      seoDescription:
        "Kelly Grappe talks with community members at a Good Things Grow meal event.",
    },
    notes:
      "Feature — same-day set with crowd-conversation, tomato-table, and SOS-shirt stills (20260613). Event name from shirt branding. City/county Unknown. Placement: Journey.",
    createdAt: "2026-07-28T05:50:00.000Z",
    updatedAt: "2026-07-28T05:50:00.000Z",
  },
  {
    id: "outdoor-fair-card-handout-20260613",
    src: "/media/campaign-photos/outdoor-fair-card-handout-20260613.png",
    heroLevel: "FEATURE",
    publicationStatus: "DRAFT",
    basic: {
      originalFilename: "20260613_111334.png",
      width: 768,
      height: 1024,
      orientation: "PORTRAIT",
      fileType: "image/png",
      captureDateIso: UNKNOWN,
      cameraDevice: UNKNOWN,
    },
    campaign: {
      eventName: "Outdoor fair / festival",
      county: UNKNOWN,
      city: UNKNOWN,
      venue: "Outdoor fairgrounds",
      eventDate: UNKNOWN,
      photographer: UNKNOWN,
      peopleVisible: ["Kelly Grappe"],
      organizations: [],
      campaignTheme: "Community Engagement",
      relatedIssue: "Voter Outreach",
      relatedSpeechVideoIds: [],
      relatedBlogPaths: [],
      relatedEventIds: [],
      relatedPagePaths: ["/about/journey", "/get-involved", "/volunteer"],
      homepageCandidate: false,
      featuredPhoto: true,
    },
    accessibility: {
      altText:
        "Kelly Grappe leans in to hand a campaign card to a woman seated in a lawn chair at an outdoor fair.",
      caption:
        "Kelly Grappe works the fairgrounds, handing a campaign card to a community member under the trees.",
      extendedDescription:
        "At an outdoor fair, Kelly Grappe smiles as she hands a small campaign card to a woman seated in a folding lawn chair. A Bad Boy Mowers banner and event tents appear in the background, grounding the stop in a classic Arkansas festival setting.",
      seoDescription:
        "Kelly Grappe hands out a campaign card at an outdoor community fair.",
    },
    notes:
      "Feature — strong one-on-one action. Bad Boy Mowers banner is a venue clue, not a location lock. City/county Unknown. Same day as Good Things Grow set but different outdoor venue — confirm if same county. Placement: Journey, Volunteer.",
    createdAt: "2026-07-28T05:50:00.000Z",
    updatedAt: "2026-07-28T05:50:00.000Z",
  },
  {
    id: "good-things-grow-crowd-conversation-20260613",
    src: "/media/campaign-photos/good-things-grow-crowd-conversation-20260613.png",
    heroLevel: "FEATURE",
    publicationStatus: "DRAFT",
    basic: {
      originalFilename: "20260613_135415.png",
      width: 768,
      height: 1024,
      orientation: "PORTRAIT",
      fileType: "image/png",
      captureDateIso: UNKNOWN,
      cameraDevice: UNKNOWN,
    },
    campaign: {
      eventName: "Good Things Grow community meal",
      county: UNKNOWN,
      city: UNKNOWN,
      venue: "Community hall / church annex",
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
        "Kelly Grappe gestures while talking with community members in a hall as someone behind her records on a phone.",
      caption:
        "Kelly Grappe talks with neighbors at a Good Things Grow community gathering.",
      extendedDescription:
        "Framed by two community members in conversation, Kelly Grappe wears a Good Things Grow shirt and campaign button while speaking animatedly in a wood-paneled hall. A supporter behind her holds up a phone to document the moment.",
      seoDescription:
        "Kelly Grappe speaks with community members at a Good Things Grow event.",
    },
    notes:
      "Feature — Good Things Grow same-day set. City/county Unknown. Placement: Journey, Meet Kelly.",
    createdAt: "2026-07-28T05:50:00.000Z",
    updatedAt: "2026-07-28T05:50:00.000Z",
  },
  {
    id: "good-things-grow-tomato-table-20260613",
    src: "/media/campaign-photos/good-things-grow-tomato-table-20260613.png",
    heroLevel: "FEATURE",
    publicationStatus: "DRAFT",
    basic: {
      originalFilename: "20260613_134933.png",
      width: 768,
      height: 1024,
      orientation: "PORTRAIT",
      fileType: "image/png",
      captureDateIso: UNKNOWN,
      cameraDevice: UNKNOWN,
    },
    campaign: {
      eventName: "Good Things Grow community meal",
      county: UNKNOWN,
      city: UNKNOWN,
      venue: "Community hall dining tables",
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
        "Kelly Grappe talks with women at a long table set with fresh tomatoes and a community meal.",
      caption:
        "Kelly Grappe joins a Good Things Grow table conversation beside a basket of fresh local tomatoes.",
      extendedDescription:
        "At a long dining table with red placemats and a produce basket of ripe tomatoes, Kelly Grappe in a Good Things Grow shirt leans in to talk with community members. The meal setting ties campaign outreach to local agriculture and neighborly gathering.",
      seoDescription:
        "Kelly Grappe visits with neighbors at a Good Things Grow community meal featuring local produce.",
    },
    notes:
      "Feature — strongest Good Things Grow table still (produce + meal). City/county Unknown. Placement: Journey, Across Arkansas.",
    createdAt: "2026-07-28T05:50:00.000Z",
    updatedAt: "2026-07-28T05:50:00.000Z",
  },
  {
    id: "community-room-sos-shirt-conversation-20260613",
    src: "/media/campaign-photos/community-room-sos-shirt-conversation-20260613.png",
    heroLevel: "FEATURE",
    publicationStatus: "DRAFT",
    basic: {
      originalFilename: "20260613_145914.png",
      width: 768,
      height: 1024,
      orientation: "PORTRAIT",
      fileType: "image/png",
      captureDateIso: UNKNOWN,
      cameraDevice: UNKNOWN,
    },
    campaign: {
      eventName: "Community room meet & greet",
      county: UNKNOWN,
      city: UNKNOWN,
      venue: "Community multipurpose room",
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
        "Kelly Grappe in a Secretary of State campaign shirt talks with two community members in a multipurpose room.",
      caption:
        "Kelly Grappe chats with community members in a local meeting room during a campaign stop.",
      extendedDescription:
        "In a tiled multipurpose room, Kelly Grappe — wearing a white campaign shirt reading For Secretary of State / Vote — smiles in conversation with women near folding chairs and a snack table. The informal standing-circle exchange shows accessible, face-to-face campaigning.",
      seoDescription:
        "Kelly Grappe talks with voters in a community meeting room during her campaign.",
    },
    notes:
      "Feature — clear SOS shirt branding from behind. Same day as Good Things Grow set; may be related stop. City/county Unknown. Placement: Journey, Meet Kelly.",
    createdAt: "2026-07-28T05:50:00.000Z",
    updatedAt: "2026-07-28T05:50:00.000Z",
  },
  {
    id: "stone-building-handshake-steps-20260620",
    src: "/media/campaign-photos/stone-building-handshake-steps-20260620.png",
    heroLevel: "FEATURE",
    publicationStatus: "DRAFT",
    basic: {
      originalFilename: "20260620_162658.png",
      width: 768,
      height: 1024,
      orientation: "PORTRAIT",
      fileType: "image/png",
      captureDateIso: UNKNOWN,
      cameraDevice: UNKNOWN,
    },
    campaign: {
      eventName: "Community gathering (outdoor entry)",
      county: UNKNOWN,
      city: UNKNOWN,
      venue: "Stone building entrance / steps",
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
        "Kelly Grappe shakes hands with a community member on concrete steps outside a stone building as others look on.",
      caption:
        "Kelly Grappe greets community members with a handshake on the steps outside a local gathering.",
      extendedDescription:
        "From a high angle, Kelly Grappe in a light blue shirt and white cargo pants shakes hands with a man on concrete steps beside a stone building. Other attendees wait nearby under trees, capturing a classic boots-on-the-ground arrival moment.",
      seoDescription:
        "Kelly Grappe shakes hands with a voter outside a community gathering.",
    },
    notes:
      "Feature — action handshake; pairs with stone-building-outdoor-gathering-20260620. City/county Unknown. Placement: Journey, Across Arkansas.",
    createdAt: "2026-07-28T05:50:00.000Z",
    updatedAt: "2026-07-28T05:50:00.000Z",
  },
  {
    id: "stage-event-power-up-conversation-20260518",
    src: "/media/campaign-photos/stage-event-power-up-conversation-20260518.png",
    heroLevel: "FEATURE",
    publicationStatus: "DRAFT",
    basic: {
      originalFilename: "20260518_192021.png",
      width: 768,
      height: 1024,
      orientation: "PORTRAIT",
      fileType: "image/png",
      captureDateIso: UNKNOWN,
      cameraDevice: UNKNOWN,
    },
    campaign: {
      eventName: "Community / stage social event",
      county: UNKNOWN,
      city: UNKNOWN,
      venue: "Indoor stage venue (pink curtains)",
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
        "Kelly Grappe in a white blazer listens to a community member near a stage with pink curtains at an indoor event.",
      caption:
        "Kelly Grappe talks with attendees at an indoor community event beside the stage.",
      extendedDescription:
        "In front of pink stage curtains and speakers, Kelly Grappe wears a white blazer and campaign name tag while listening to a woman holding a phone. Nearby, a supporter holds a Build Your Power Up flyer, marking an active, crowded social-politics stop.",
      seoDescription:
        "Kelly Grappe speaks with community members at an indoor stage-side campaign event.",
    },
    notes:
      "Feature — candid stage-side retail politics. City/county Unknown. Placement: Journey, Meet Kelly.",
    createdAt: "2026-07-28T05:55:00.000Z",
    updatedAt: "2026-07-28T05:55:00.000Z",
  },
  {
    id: "democrats-meeting-listening-20260612",
    src: "/media/campaign-photos/democrats-meeting-listening-20260612.png",
    heroLevel: "FEATURE",
    publicationStatus: "DRAFT",
    basic: {
      originalFilename: "20260612_193156.png",
      width: 768,
      height: 1024,
      orientation: "PORTRAIT",
      fileType: "image/png",
      captureDateIso: UNKNOWN,
      cameraDevice: UNKNOWN,
    },
    campaign: {
      eventName: "Democratic Party / community meeting",
      county: UNKNOWN,
      city: UNKNOWN,
      venue: "Meeting room",
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
        "Kelly Grappe in a black blazer over a People Over Politics shirt listens intently to a community member at an indoor meeting.",
      caption:
        "Kelly Grappe listens closely during a one-on-one conversation at a community political meeting.",
      extendedDescription:
        "Kelly Grappe wears a People Over Politics campaign button and black blazer while listening to a woman speaking beside her. A Democrats Arkansas-style banner is partially visible at the edge of a bright meeting room filled with other attendees.",
      seoDescription:
        "Kelly Grappe listens to a voter at a Democratic community meeting.",
    },
    notes:
      "Feature — strong listening crop + POP branding. City/county Unknown. Party banner visible — fine for partisan campaign context. Placement: Journey, Meet Kelly.",
    createdAt: "2026-07-28T05:55:00.000Z",
    updatedAt: "2026-07-28T05:55:00.000Z",
  },
  {
    id: "outdoor-petition-table-crowd-20260606",
    src: "/media/campaign-photos/outdoor-petition-table-crowd-20260606.png",
    heroLevel: "FEATURE",
    publicationStatus: "DRAFT",
    basic: {
      originalFilename: "20260606_110115.png",
      width: 768,
      height: 1024,
      orientation: "PORTRAIT",
      fileType: "image/png",
      captureDateIso: UNKNOWN,
      cameraDevice: UNKNOWN,
    },
    campaign: {
      eventName: "Outdoor petition / signature table",
      county: UNKNOWN,
      city: UNKNOWN,
      venue: "Outdoor plaza / parking area",
      eventDate: UNKNOWN,
      photographer: UNKNOWN,
      peopleVisible: ["Kelly Grappe"],
      organizations: [],
      campaignTheme: "Community Engagement",
      relatedIssue: "Voter Outreach",
      relatedSpeechVideoIds: [],
      relatedBlogPaths: [],
      relatedEventIds: [],
      relatedPagePaths: ["/about/journey", "/get-involved", "/volunteer"],
      homepageCandidate: false,
      featuredPhoto: true,
    },
    accessibility: {
      altText:
        "Kelly Grappe talks with a circle of community members around an outdoor petition table near a brick civic building.",
      caption:
        "Kelly Grappe works an outdoor signature table, talking with neighbors beside clipboards and campaign materials.",
      extendedDescription:
        "From a high angle, Kelly Grappe in a light pink blazer speaks with a small crowd around a folding table holding clipboards and literature. A Sign Petition chair placard and a historic brick building with a tower appear behind the group under overcast skies.",
      seoDescription:
        "Kelly Grappe gathers signatures and talks with voters at an outdoor petition table.",
    },
    notes:
      "Feature — petition/outreach action. Brick civic building in background may ID city — left Unknown until confirmed. Same day as community-hall-handshake-fans. Placement: Journey, Volunteer, Get Involved.",
    createdAt: "2026-07-28T05:55:00.000Z",
    updatedAt: "2026-07-28T05:55:00.000Z",
  },
  {
    id: "gallery-table-voter-conversation-20260526",
    src: "/media/campaign-photos/gallery-table-voter-conversation-20260526.png",
    heroLevel: "FEATURE",
    publicationStatus: "DRAFT",
    basic: {
      originalFilename: "20260526_175057.png",
      width: 1024,
      height: 768,
      orientation: "LANDSCAPE",
      fileType: "image/png",
      captureDateIso: UNKNOWN,
      cameraDevice: UNKNOWN,
    },
    campaign: {
      eventName: "Gallery / community meet",
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
        "Kelly Grappe in a white blazer leans over a table to talk with two seated community members in a gallery space.",
      caption:
        "Kelly Grappe visits with residents seated at a table during a community gallery gathering.",
      extendedDescription:
        "Kelly Grappe, wearing a Secretary of State name tag and white blazer, leans toward two women at a wooden table in a gallery-like room with framed photos on the walls. Campaign materials sit on the table between them during an attentive conversation.",
      seoDescription:
        "Kelly Grappe talks with voters at a community gallery meet-and-greet.",
    },
    notes:
      "Feature — table-side listening. Attendee name tag visible; omit from public caption unless cleared. City/county Unknown. Placement: Journey, Meet Kelly.",
    createdAt: "2026-07-28T05:55:00.000Z",
    updatedAt: "2026-07-28T05:55:00.000Z",
  },
  {
    id: "formal-group-red-curtain-20260611",
    src: "/media/campaign-photos/formal-group-red-curtain-20260611.png",
    heroLevel: "FEATURE",
    publicationStatus: "DRAFT",
    basic: {
      originalFilename: "20260611_142703.png",
      width: 1024,
      height: 768,
      orientation: "LANDSCAPE",
      fileType: "image/png",
      captureDateIso: UNKNOWN,
      cameraDevice: UNKNOWN,
    },
    campaign: {
      eventName: "Formal civic / community program",
      county: UNKNOWN,
      city: UNKNOWN,
      venue: "Auditorium / stage (red curtains)",
      eventDate: UNKNOWN,
      photographer: UNKNOWN,
      peopleVisible: ["Kelly Grappe"],
      organizations: [],
      campaignTheme: "Coalition Building",
      relatedIssue: "Voter Outreach",
      relatedSpeechVideoIds: [],
      relatedBlogPaths: [],
      relatedEventIds: [],
      relatedPagePaths: ["/about", "/about/journey", "/get-involved"],
      homepageCandidate: false,
      featuredPhoto: true,
    },
    accessibility: {
      altText:
        "Kelly Grappe stands centered in a formal group photo with four others in front of deep red stage curtains.",
      caption:
        "Kelly Grappe joins community and civic leaders for a group photo at a formal program.",
      extendedDescription:
        "Centered in a posed lineup before red stage curtains, Kelly Grappe wears a white blazer and campaign name tag beside community leaders in suits and a woman in a red dress. The professional group still documents a formal engagement stop.",
      seoDescription:
        "Kelly Grappe poses with community leaders at a formal civic event.",
    },
    notes:
      "Feature — formal/coalition still. Do not invent co-subject names or titles. Same day as auditorium-credential-conversation. City/county Unknown. Placement: Journey, About.",
    createdAt: "2026-07-28T05:55:00.000Z",
    updatedAt: "2026-07-28T05:55:00.000Z",
  },
  {
    id: "county-clerk-tomato-table-20260613",
    src: "/media/campaign-photos/county-clerk-tomato-table-20260613.png",
    heroLevel: "FEATURE",
    publicationStatus: "DRAFT",
    basic: {
      originalFilename: "20260613_110130.png",
      width: 1024,
      height: 768,
      orientation: "LANDSCAPE",
      fileType: "image/png",
      captureDateIso: UNKNOWN,
      cameraDevice: UNKNOWN,
    },
    campaign: {
      eventName: "Good Things Grow / outdoor tomato table",
      county: UNKNOWN,
      city: UNKNOWN,
      venue: "Outdoor table near County Clerk building",
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
        "Kelly Grappe prepares fresh tomatoes at an outdoor table in front of a brick County Clerk building.",
      caption:
        "Kelly Grappe joins a Good Things Grow tomato table outside a historic County Clerk building.",
      extendedDescription:
        "Seated at a white-clothed outdoor table, Kelly Grappe in a Good Things Grow shirt and People Over Politics button handles ripe tomatoes. Behind her, a brick building pediment reading County Clerk anchors the scene to a downtown civic square during a community produce event.",
      seoDescription:
        "Kelly Grappe at a tomato table outside a County Clerk building during a community event.",
    },
    notes:
      "Feature — COUNTY CLERK pediment visible (strong landmark). Likely Mena/Polk square with Good Things Grow set, but county left Unknown until Steve confirms. Same-day set with eating-tomato and tomato-with-child. Placement: Journey; add /counties/polk when confirmed.",
    createdAt: "2026-07-28T05:55:00.000Z",
    updatedAt: "2026-07-28T05:55:00.000Z",
  },
  {
    id: "community-hall-handshake-fans-20260606",
    src: "/media/campaign-photos/community-hall-handshake-fans-20260606.png",
    heroLevel: "FEATURE",
    publicationStatus: "DRAFT",
    basic: {
      originalFilename: "20260606_181041.png",
      width: 768,
      height: 1024,
      orientation: "PORTRAIT",
      fileType: "image/png",
      captureDateIso: UNKNOWN,
      cameraDevice: UNKNOWN,
    },
    campaign: {
      eventName: "Community hall meet & greet",
      county: UNKNOWN,
      city: UNKNOWN,
      venue: "Community hall / meeting room",
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
        "Kelly Grappe shakes hands with a community member beside a table of Regnat Populus campaign fans and refreshments.",
      caption:
        "Kelly Grappe greets a community member at a hall table stocked with campaign fans and snacks.",
      extendedDescription:
        "From above, Kelly Grappe in a pink blazer shakes hands across a literature table covered with blue Regnat Populus heart fans, palm cards, and refreshments. A seated woman looks on during the warm meet-and-greet exchange.",
      seoDescription:
        "Kelly Grappe shakes hands with a voter at a community hall campaign table.",
    },
    notes:
      "Feature — handshake + visible campaign fans. Clark County text on a nearby shirt is not proof of location. Same day as outdoor-petition-table. City/county Unknown. Placement: Journey, Volunteer.",
    createdAt: "2026-07-28T05:55:00.000Z",
    updatedAt: "2026-07-28T05:55:00.000Z",
  },
  {
    id: "county-clerk-eating-tomato-20260613",
    src: "/media/campaign-photos/county-clerk-eating-tomato-20260613.png",
    heroLevel: "FEATURE",
    publicationStatus: "DRAFT",
    basic: {
      originalFilename: "20260613_110123.png",
      width: 768,
      height: 1024,
      orientation: "PORTRAIT",
      fileType: "image/png",
      captureDateIso: UNKNOWN,
      cameraDevice: UNKNOWN,
    },
    campaign: {
      eventName: "Good Things Grow / outdoor tomato table",
      county: UNKNOWN,
      city: UNKNOWN,
      venue: "Outdoor table near County Clerk building",
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
        "Kelly Grappe smiles as she bites into a fresh tomato at an outdoor community table.",
      caption:
        "Kelly Grappe enjoys a fresh tomato at a Good Things Grow community table — an unscripted moment on the trail.",
      extendedDescription:
        "In a close outdoor portrait, Kelly Grappe in a Good Things Grow shirt and People Over Politics button bites into a ripe tomato at a white-clothed table. The candid produce moment humanizes the campaign stop beside downtown civic buildings.",
      seoDescription:
        "Kelly Grappe eats a fresh tomato at a Good Things Grow community event.",
    },
    notes:
      "Feature — high authenticity / personality still. Same COUNTY CLERK landmark set. City/county Unknown pending confirm. Placement: Journey, Meet Kelly personality (not homepage until Track C).",
    createdAt: "2026-07-28T05:55:00.000Z",
    updatedAt: "2026-07-28T05:55:00.000Z",
  },
  {
    id: "county-clerk-tomato-with-child-20260613",
    src: "/media/campaign-photos/county-clerk-tomato-with-child-20260613.png",
    heroLevel: "SUPPORTING",
    publicationStatus: "DRAFT",
    basic: {
      originalFilename: "20260613_110139.png",
      width: 1024,
      height: 768,
      orientation: "LANDSCAPE",
      fileType: "image/png",
      captureDateIso: UNKNOWN,
      cameraDevice: UNKNOWN,
    },
    campaign: {
      eventName: "Good Things Grow / outdoor tomato table",
      county: UNKNOWN,
      city: UNKNOWN,
      venue: "Outdoor table near County Clerk building",
      eventDate: UNKNOWN,
      photographer: UNKNOWN,
      peopleVisible: ["Kelly Grappe"],
      organizations: [],
      campaignTheme: "Community Engagement",
      relatedIssue: "Voter Outreach",
      relatedSpeechVideoIds: [],
      relatedBlogPaths: [],
      relatedEventIds: [],
      relatedPagePaths: ["/about/journey", "/about"],
      homepageCandidate: false,
      featuredPhoto: false,
    },
    accessibility: {
      altText:
        "Kelly Grappe sits at a tomato table talking with a young girl wearing a sash at an outdoor community event.",
      caption:
        "Kelly Grappe shares a moment at the tomato table with a young festival participant.",
      extendedDescription:
        "At an outdoor produce table, Kelly Grappe holds a piece of tomato while talking with a young girl in a red dress and sash. Tomatoes and a paper bag sit between them during a gentle community-festival exchange.",
      seoDescription:
        "Kelly Grappe talks with a young festival participant at a Good Things Grow tomato table.",
    },
    notes:
      "SUPPORTING — MINOR IN FRAME. Hold for Steve/guardian consent before any public publish. Do not name the child. Same County Clerk / Good Things Grow set. City/county Unknown.",
    createdAt: "2026-07-28T05:55:00.000Z",
    updatedAt: "2026-07-28T05:55:00.000Z",
  },
  {
    id: "auditorium-credential-conversation-20260611",
    src: "/media/campaign-photos/auditorium-credential-conversation-20260611.png",
    heroLevel: "FEATURE",
    publicationStatus: "DRAFT",
    basic: {
      originalFilename: "20260611_142149.png",
      width: 1024,
      height: 768,
      orientation: "LANDSCAPE",
      fileType: "image/png",
      captureDateIso: UNKNOWN,
      cameraDevice: UNKNOWN,
    },
    campaign: {
      eventName: "Auditorium / formal community program",
      county: UNKNOWN,
      city: UNKNOWN,
      venue: "Auditorium floor",
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
        "Kelly Grappe in a cream blazer talks with a credentialed attendee on an auditorium floor beside theater seating.",
      caption:
        "Kelly Grappe visits with an event attendee on the floor of a community auditorium.",
      extendedDescription:
        "On a polished wood auditorium floor beside rows of theater seats, Kelly Grappe in a cream blazer holds a drink and folder while speaking with a woman wearing an event lanyard. The unscripted exchange sits between formal program moments.",
      seoDescription:
        "Kelly Grappe talks with an attendee at a community auditorium event.",
    },
    notes:
      "Feature — same day as formal-group-red-curtain. City/county Unknown. Placement: Journey, Meet Kelly.",
    createdAt: "2026-07-28T05:55:00.000Z",
    updatedAt: "2026-07-28T05:55:00.000Z",
  },
  {
    id: "bodcaw-bank-festival-walk-hand-in-hand",
    src: "/media/campaign-photos/bodcaw-bank-festival-walk-hand-in-hand.png",
    heroLevel: "FEATURE",
    publicationStatus: "DRAFT",
    basic: {
      originalFilename: "FB_IMG_1779118584159.png",
      width: 820,
      height: 1024,
      orientation: "PORTRAIT",
      fileType: "image/png",
      captureDateIso: UNKNOWN,
      cameraDevice: UNKNOWN,
    },
    campaign: {
      eventName: "Outdoor community festival",
      county: UNKNOWN,
      city: UNKNOWN,
      venue: "Festival grounds (Bodcaw Bank tent)",
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
        "Kelly Grappe and a partner walk hand-in-hand into a festival wearing matching Kelly Grappe for Secretary of State shirts, past a Bodcaw Bank tent.",
      caption:
        "Kelly Grappe arrives at a community festival in matching campaign shirts, walking into the crowd past a Bodcaw Bank booth.",
      extendedDescription:
        "Shot from behind, Kelly Grappe and a partner in matching light-blue Kelly Grappe for Secretary of State Vote shirts walk hand-in-hand across a paved festival lot. A Bodcaw Bank canopy and feather banner stand among trees and other attendees ahead of them.",
      seoDescription:
        "Kelly Grappe walks into a community festival in campaign shirts near a Bodcaw Bank booth.",
    },
    notes:
      "Feature — clear SOS shirt branding from behind. Bodcaw Bank tent is a strong SW Arkansas venue clue (often Nevada County / Prescott area) — city/county left Unknown until Steve confirms. Placement: Journey.",
    createdAt: "2026-07-28T06:00:00.000Z",
    updatedAt: "2026-07-28T06:00:00.000Z",
  },
  {
    id: "gravel-lot-supporter-conversation-20260509",
    src: "/media/campaign-photos/gravel-lot-supporter-conversation-20260509.png",
    heroLevel: "FEATURE",
    publicationStatus: "DRAFT",
    basic: {
      originalFilename: "20260509_185458.png",
      width: 1024,
      height: 768,
      orientation: "LANDSCAPE",
      fileType: "image/png",
      captureDateIso: UNKNOWN,
      cameraDevice: UNKNOWN,
    },
    campaign: {
      eventName: "Outdoor meet & greet",
      county: UNKNOWN,
      city: UNKNOWN,
      venue: "Gravel lot / outdoor gathering",
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
        "Kelly Grappe smiles while talking with a supporter outdoors beside a golf cart.",
      caption:
        "Kelly Grappe visits with a supporter at an outdoor meet-and-greet beside a golf cart.",
      extendedDescription:
        "On a gravel lot, Kelly Grappe in a floral blouse talks with a woman wearing a Kelly for Arkansas button and Senate campaign shirt. A Coleman golf cart and trees fill the informal outdoor backdrop.",
      seoDescription:
        "Kelly Grappe talks with a supporter at an outdoor campaign meet-and-greet.",
    },
    notes:
      "Feature — coalition merch visible (other campaign shirt); crop carefully if needed. City/county Unknown. Placement: Journey, Meet Kelly.",
    createdAt: "2026-07-28T06:00:00.000Z",
    updatedAt: "2026-07-28T06:00:00.000Z",
  },
  {
    id: "fireplace-mic-remarks-20260502",
    src: "/media/campaign-photos/fireplace-mic-remarks-20260502.png",
    heroLevel: "FEATURE",
    publicationStatus: "DRAFT",
    basic: {
      originalFilename: "20260502_165153.png",
      width: 768,
      height: 1024,
      orientation: "PORTRAIT",
      fileType: "image/png",
      captureDateIso: UNKNOWN,
      cameraDevice: UNKNOWN,
    },
    campaign: {
      eventName: "Community remarks / celebration",
      county: UNKNOWN,
      city: UNKNOWN,
      venue: "Indoor hall with stone fireplace",
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
        "Kelly Grappe holds a microphone with her hand over her heart while speaking in front of a stone fireplace and balloon decorations.",
      caption:
        "Kelly Grappe speaks from the heart at a community gathering, microphone in hand before a decorated stone fireplace.",
      extendedDescription:
        "Standing before a rustic stone fireplace decorated with balloons including a horse foil balloon, Kelly Grappe holds a wireless mic with her hand over her heart. A campaign sticker is visible on her jacket during sincere remarks to the room.",
      seoDescription:
        "Kelly Grappe speaks into a microphone at a community celebration.",
    },
    notes:
      "Feature — speaking still (rare in this trail set). City/county Unknown. Placement: Journey, Meet Kelly, speeches-adjacent pages.",
    createdAt: "2026-07-28T06:00:00.000Z",
    updatedAt: "2026-07-28T06:00:00.000Z",
  },
  {
    id: "church-sanctuary-conversation-20260511",
    src: "/media/campaign-photos/church-sanctuary-conversation-20260511.png",
    heroLevel: "FEATURE",
    publicationStatus: "DRAFT",
    basic: {
      originalFilename: "20260511_192006.png",
      width: 768,
      height: 1024,
      orientation: "PORTRAIT",
      fileType: "image/png",
      captureDateIso: UNKNOWN,
      cameraDevice: UNKNOWN,
    },
    campaign: {
      eventName: "Church / faith community visit",
      county: UNKNOWN,
      city: UNKNOWN,
      venue: "Church sanctuary",
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
        "Kelly Grappe talks with a community member in a hijab in a church sanctuary aisle between wooden pews.",
      caption:
        "Kelly Grappe visits with a community member inside a church sanctuary during a local stop.",
      extendedDescription:
        "In a red-carpeted church aisle between wooden pews, Kelly Grappe in a black blazer speaks with a woman wearing a maroon hijab. A He Is Risen banner and stage instruments appear behind them, marking a faith-community visit rooted in face-to-face conversation.",
      seoDescription:
        "Kelly Grappe talks with a community member in a church sanctuary during her campaign.",
    },
    notes:
      "Feature — faith + diversity listening moment. City/county Unknown. Placement: Journey, Meet Kelly, community outreach.",
    createdAt: "2026-07-28T06:00:00.000Z",
    updatedAt: "2026-07-28T06:00:00.000Z",
  },
  {
    id: "cadence-bank-outdoor-conversation-20260502",
    src: "/media/campaign-photos/cadence-bank-outdoor-conversation-20260502.png",
    heroLevel: "FEATURE",
    publicationStatus: "DRAFT",
    basic: {
      originalFilename: "20260502_101320.png",
      width: 768,
      height: 1024,
      orientation: "PORTRAIT",
      fileType: "image/png",
      captureDateIso: UNKNOWN,
      cameraDevice: UNKNOWN,
    },
    campaign: {
      eventName: "Outdoor community festival",
      county: UNKNOWN,
      city: UNKNOWN,
      venue: "Outdoor festival near Cadence Bank",
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
        "Kelly Grappe listens to a man in a Franklin Fire Dept cap outdoors near a Cadence Bank building and Arkansas flags.",
      caption:
        "Kelly Grappe talks with a community member at an outdoor festival stop near local bank and flagpoles.",
      extendedDescription:
        "Under bright sun, Kelly Grappe in a black denim jacket and Secretary of State name tag listens to a man wearing a Franklin Fire Dept cap. A Cadence Bank building and U.S. and Arkansas flags stand in the background of the outdoor festival setting.",
      seoDescription:
        "Kelly Grappe talks with a voter at an outdoor festival near Cadence Bank.",
    },
    notes:
      "Feature — Cadence Bank + Franklin Fire Dept hat are clues only (hat ≠ event county). City/county Unknown. Placement: Journey.",
    createdAt: "2026-07-28T06:00:00.000Z",
    updatedAt: "2026-07-28T06:00:00.000Z",
  },
  {
    id: "regnat-populus-tent-conversation-20260501",
    src: "/media/campaign-photos/regnat-populus-tent-conversation-20260501.png",
    heroLevel: "FEATURE",
    publicationStatus: "DRAFT",
    basic: {
      originalFilename: "20260501_164852.png",
      width: 1024,
      height: 768,
      orientation: "LANDSCAPE",
      fileType: "image/png",
      captureDateIso: UNKNOWN,
      cameraDevice: UNKNOWN,
    },
    campaign: {
      eventName: "Toad Suck Daze",
      county: "Faulkner",
      city: "Conway",
      venue: "Outdoor festival tent",
      eventDate: UNKNOWN,
      photographer: UNKNOWN,
      peopleVisible: ["Kelly Grappe"],
      organizations: [],
      campaignTheme: "Community Engagement",
      relatedIssue: "Voter Outreach",
      relatedSpeechVideoIds: [],
      relatedBlogPaths: [],
      relatedEventIds: [],
      relatedPagePaths: ["/about/journey", "/about", "/counties/faulkner", "/get-involved"],
      homepageCandidate: false,
      featuredPhoto: true,
    },
    accessibility: {
      altText:
        "Kelly Grappe in a Regnat Populus shirt gestures while talking with a man under a festival tent.",
      caption:
        "Kelly Grappe talks animatedly with a festival-goer under a tent at Toad Suck Daze in Conway.",
      extendedDescription:
        "Under a white event tent, Kelly Grappe wears a Regnat Populus — The People Rule shirt and Secretary of State sticker while gesturing expressively to a man with a camera. Same-day Toad Suck Daze trail set with toad-race and first-responder stills.",
      seoDescription:
        "Kelly Grappe talks with a festival-goer at Toad Suck Daze in Conway, Faulkner County.",
    },
    notes:
      "Feature — geography locked via same-day Toad Suck Daze set (toad race + Conway festival context). Confirm if Steve disagrees. Placement: Faulkner county, Journey.",
    createdAt: "2026-07-28T06:00:00.000Z",
    updatedAt: "2026-07-28T06:00:00.000Z",
  },
  {
    id: "toad-suck-daze-toad-race-20260501",
    src: "/media/campaign-photos/toad-suck-daze-toad-race-20260501.png",
    heroLevel: "FEATURE",
    publicationStatus: "DRAFT",
    basic: {
      originalFilename: "20260501_170815.png",
      width: 1024,
      height: 768,
      orientation: "LANDSCAPE",
      fileType: "image/png",
      captureDateIso: UNKNOWN,
      cameraDevice: UNKNOWN,
    },
    campaign: {
      eventName: "Toad Suck Daze",
      county: "Faulkner",
      city: "Conway",
      venue: "Toad race course",
      eventDate: UNKNOWN,
      photographer: UNKNOWN,
      peopleVisible: ["Kelly Grappe"],
      organizations: [],
      campaignTheme: "Community Engagement",
      relatedIssue: "Voter Outreach",
      relatedSpeechVideoIds: [],
      relatedBlogPaths: [],
      relatedEventIds: [],
      relatedPagePaths: ["/about/journey", "/about", "/counties/faulkner", "/get-involved"],
      homepageCandidate: true,
      featuredPhoto: true,
    },
    accessibility: {
      altText:
        "Kelly Grappe kneels on a green mat at the starting line of a toad race, smiling beside other participants.",
      caption:
        "Kelly Grappe joins the toad race at Toad Suck Daze in Conway — a classic Arkansas festival tradition.",
      extendedDescription:
        "Kneeling on a bright green race mat behind a blue starting line, Kelly Grappe smiles while lining up a toad with other festival participants as a crowd watches. A Kelly for AR sticker and mic pack mark the campaign trail moment inside a beloved local tradition.",
      seoDescription:
        "Kelly Grappe participates in the toad race at Toad Suck Daze in Conway, Arkansas.",
    },
    notes:
      "Feature — signature Toad Suck Daze activity locks Conway / Faulkner. MINOR visible in frame — OK for festival context but review before large publish crops. Placement: Faulkner, Journey, Across Arkansas.",
    createdAt: "2026-07-28T06:00:00.000Z",
    updatedAt: "2026-07-28T06:00:00.000Z",
  },
  {
    id: "street-corner-voter-conversation-20260516",
    src: "/media/campaign-photos/street-corner-voter-conversation-20260516.png",
    heroLevel: "FEATURE",
    publicationStatus: "DRAFT",
    basic: {
      originalFilename: "20260516_175525.png",
      width: 768,
      height: 1024,
      orientation: "PORTRAIT",
      fileType: "image/png",
      captureDateIso: UNKNOWN,
      cameraDevice: UNKNOWN,
    },
    campaign: {
      eventName: "Outdoor street festival / downtown stop",
      county: UNKNOWN,
      city: UNKNOWN,
      venue: "Downtown street",
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
        "Kelly Grappe in a campaign shirt talks with two men on a downtown street near a crosswalk and festival tents.",
      caption:
        "Kelly Grappe works a downtown festival street, talking with community members face-to-face.",
      extendedDescription:
        "On asphalt near a white crosswalk, Kelly Grappe — shirt reading Kelly Grappe for Secretary of State Vote — converses with two men as festival tents and a golf cart appear down the block. A street sign hinting Washington / Court may help ID the town later.",
      seoDescription:
        "Kelly Grappe talks with voters on a downtown festival street during her campaign.",
    },
    notes:
      "Feature — clear shirt branding. Washington/Court street sign may ID city — left Unknown. Placement: Journey.",
    createdAt: "2026-07-28T06:00:00.000Z",
    updatedAt: "2026-07-28T06:00:00.000Z",
  },
  {
    id: "toad-suck-daze-pafford-ems-20260501",
    src: "/media/campaign-photos/toad-suck-daze-pafford-ems-20260501.png",
    heroLevel: "FEATURE",
    publicationStatus: "DRAFT",
    basic: {
      originalFilename: "20260501_165140.png",
      width: 1024,
      height: 768,
      orientation: "LANDSCAPE",
      fileType: "image/png",
      captureDateIso: UNKNOWN,
      cameraDevice: UNKNOWN,
    },
    campaign: {
      eventName: "Toad Suck Daze",
      county: "Faulkner",
      city: "Conway",
      venue: "Outdoor festival grounds",
      eventDate: UNKNOWN,
      photographer: UNKNOWN,
      peopleVisible: ["Kelly Grappe"],
      organizations: ["Pafford EMS"],
      campaignTheme: "Community Engagement",
      relatedIssue: "Voter Outreach",
      relatedSpeechVideoIds: [],
      relatedBlogPaths: [],
      relatedEventIds: [],
      relatedPagePaths: ["/about/journey", "/about", "/counties/faulkner", "/get-involved"],
      homepageCandidate: false,
      featuredPhoto: true,
    },
    accessibility: {
      altText:
        "Kelly Grappe in a campaign shirt talks with a Pafford EMS first responder at an outdoor festival.",
      caption:
        "Kelly Grappe visits with a Pafford EMS first responder during Toad Suck Daze in Conway.",
      extendedDescription:
        "At an outdoor festival, Kelly Grappe leans in to talk with a first responder whose shirt reads Pafford EMS. Festival tents and a festive green-suited performer appear nearby, documenting outreach to working first responders on the trail.",
      seoDescription:
        "Kelly Grappe talks with a Pafford EMS first responder at Toad Suck Daze in Conway.",
    },
    notes:
      "Feature — same-day Toad Suck Daze set. Pafford EMS org named from visible uniform text. Placement: Faulkner, Journey.",
    createdAt: "2026-07-28T06:00:00.000Z",
    updatedAt: "2026-07-28T06:00:00.000Z",
  },
  {
    id: "toad-suck-daze-tent-first-responders-20260501",
    src: "/media/campaign-photos/toad-suck-daze-tent-first-responders-20260501.png",
    heroLevel: "SUPPORTING",
    publicationStatus: "DRAFT",
    basic: {
      originalFilename: "20260501_171201.png",
      width: 768,
      height: 1024,
      orientation: "PORTRAIT",
      fileType: "image/png",
      captureDateIso: UNKNOWN,
      cameraDevice: UNKNOWN,
    },
    campaign: {
      eventName: "Toad Suck Daze",
      county: "Faulkner",
      city: "Conway",
      venue: "Festival tent",
      eventDate: UNKNOWN,
      photographer: UNKNOWN,
      peopleVisible: ["Kelly Grappe"],
      organizations: ["Pafford Medical Service"],
      campaignTheme: "Community Engagement",
      relatedIssue: "Voter Outreach",
      relatedSpeechVideoIds: [],
      relatedBlogPaths: [],
      relatedEventIds: [],
      relatedPagePaths: ["/about/journey", "/counties/faulkner", "/get-involved"],
      homepageCandidate: false,
      featuredPhoto: false,
    },
    accessibility: {
      altText:
        "Kelly Grappe in a Secretary of State campaign shirt talks with a Pafford Medical Service first responder under a festival tent near children in green shirts.",
      caption:
        "Under a Toad Suck Daze tent, Kelly Grappe talks with a Pafford Medical Service first responder amid festival families.",
      extendedDescription:
        "Seen from behind in a Kelly Grappe for Secretary of State Vote shirt, Kelly converses with a Pafford Medical Service first responder under a white tent. Children in green festival shirts stand nearby during the busy Conway festival stop.",
      seoDescription:
        "Kelly Grappe talks with first responders under a tent at Toad Suck Daze in Conway.",
    },
    notes:
      "SUPPORTING — MINORS prominently in foreground; hold/consent review before large public crops. Same Toad Suck Daze day set. Clear shirt branding from behind. Placement: Faulkner gallery after approval.",
    createdAt: "2026-07-28T06:00:00.000Z",
    updatedAt: "2026-07-28T06:00:00.000Z",
  },
  {
    id: "home-wine-tasting-conversation-20260329",
    src: "/media/campaign-photos/home-wine-tasting-conversation-20260329.png",
    heroLevel: "FEATURE",
    publicationStatus: "DRAFT",
    basic: {
      originalFilename: "20260329_190648.png",
      width: 768,
      height: 1024,
      orientation: "PORTRAIT",
      fileType: "image/png",
      captureDateIso: UNKNOWN,
      cameraDevice: UNKNOWN,
    },
    campaign: {
      eventName: "Home wine tasting / house party",
      county: UNKNOWN,
      city: UNKNOWN,
      venue: "Private home living room",
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
        "Kelly Grappe in a pink dress talks with guests in a living room during a home wine-tasting gathering.",
      caption:
        "Kelly Grappe visits with neighbors at a home wine-tasting house party — small-room retail politics.",
      extendedDescription:
        "In a warm living room with a brick fireplace and stained-glass windows, Kelly Grappe in a bright pink dress speaks animatedly with a guest holding a microphone. Wine bottles, tasting sheets, and seated neighbors frame an intimate house-party campaign stop.",
      seoDescription:
        "Kelly Grappe talks with guests at a home wine-tasting campaign house party.",
    },
    notes:
      "Feature — house-party intimacy. City/county Unknown. Attendee name tags visible — omit from public copy unless cleared. Placement: Journey, Volunteer, Get Involved.",
    createdAt: "2026-07-28T06:05:00.000Z",
    updatedAt: "2026-07-28T06:05:00.000Z",
  },
  {
    id: "hall-apron-listening-20260429",
    src: "/media/campaign-photos/hall-apron-listening-20260429.png",
    heroLevel: "FEATURE",
    publicationStatus: "DRAFT",
    basic: {
      originalFilename: "20260429_172457.png",
      width: 768,
      height: 1024,
      orientation: "PORTRAIT",
      fileType: "image/png",
      captureDateIso: UNKNOWN,
      cameraDevice: UNKNOWN,
    },
    campaign: {
      eventName: "Community hall meal / social",
      county: UNKNOWN,
      city: UNKNOWN,
      venue: "Community hall",
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
        "Kelly Grappe leans in closely to listen to a community member, wearing a Secretary of State name tag on an apron.",
      caption:
        "Kelly Grappe leans in to listen — a close, empathetic conversation at a community hall gathering.",
      extendedDescription:
        "In a tight candid portrait, Kelly Grappe wears a blue apron and a purple Kelly Grappe for Secretary of State name tag while leaning toward an older community member. Soft hall lighting and sunflower centerpieces keep the focus on attentive listening.",
      seoDescription:
        "Kelly Grappe listens closely to a community member at a hall gathering.",
    },
    notes:
      "Feature — strongest listening crop in this batch. City/county Unknown. Placement: Meet Kelly, Journey.",
    createdAt: "2026-07-28T06:05:00.000Z",
    updatedAt: "2026-07-28T06:05:00.000Z",
  },
  {
    id: "parking-lot-community-conversation-20260328",
    src: "/media/campaign-photos/parking-lot-community-conversation-20260328.png",
    heroLevel: "FEATURE",
    publicationStatus: "DRAFT",
    basic: {
      originalFilename: "20260328_103952.png",
      width: 768,
      height: 1024,
      orientation: "PORTRAIT",
      fileType: "image/png",
      captureDateIso: UNKNOWN,
      cameraDevice: UNKNOWN,
    },
    campaign: {
      eventName: "Outdoor community outreach / distribution",
      county: UNKNOWN,
      city: UNKNOWN,
      venue: "Parking lot",
      eventDate: UNKNOWN,
      photographer: UNKNOWN,
      peopleVisible: ["Kelly Grappe"],
      organizations: [],
      campaignTheme: "Community Engagement",
      relatedIssue: "Voter Outreach",
      relatedSpeechVideoIds: [],
      relatedBlogPaths: [],
      relatedEventIds: [],
      relatedPagePaths: ["/about/journey", "/get-involved", "/volunteer"],
      homepageCandidate: false,
      featuredPhoto: true,
    },
    accessibility: {
      altText:
        "Kelly Grappe talks with two community members in a sunny parking lot during an outdoor outreach event.",
      caption:
        "Kelly Grappe meets neighbors in a parking lot during a community outreach stop.",
      extendedDescription:
        "On asphalt under bright sun, Kelly Grappe listens as a man in a track jacket gestures mid-conversation beside a woman in a blue fleece. Supply bins and distant tables suggest a distribution or outdoor service event rather than a stage stop.",
      seoDescription:
        "Kelly Grappe talks with community members at an outdoor parking-lot outreach event.",
    },
    notes:
      "Feature — same day as outdoor-rally-handshake. City/county Unknown. Placement: Journey, Volunteer.",
    createdAt: "2026-07-28T06:05:00.000Z",
    updatedAt: "2026-07-28T06:05:00.000Z",
  },
  {
    id: "church-stage-shared-moment-20260322",
    src: "/media/campaign-photos/church-stage-shared-moment-20260322.png",
    heroLevel: "FEATURE",
    publicationStatus: "DRAFT",
    basic: {
      originalFilename: "20260322_111638.png",
      width: 768,
      height: 1024,
      orientation: "PORTRAIT",
      fileType: "image/png",
      captureDateIso: UNKNOWN,
      cameraDevice: UNKNOWN,
    },
    campaign: {
      eventName: "Church / faith community program",
      county: UNKNOWN,
      city: UNKNOWN,
      venue: "Church sanctuary stage",
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
        "Kelly Grappe laughs on a church stage with a community leader, microphone in hand beside a pulpit and cross banner.",
      caption:
        "Kelly Grappe shares a joyful moment on stage during a faith-community program.",
      extendedDescription:
        "On a red-carpeted church dais, Kelly Grappe holds a cordless mic and laughs with a man in a navy suit and bow tie, arms around each other in a collegial pose. A purple cross banner and pulpit mark the sanctuary setting behind them.",
      seoDescription:
        "Kelly Grappe on a church stage during a faith-community campaign visit.",
    },
    notes:
      "Feature — warm faith-community stage moment. Do not invent co-subject name. City/county Unknown. Placement: Journey, Meet Kelly.",
    createdAt: "2026-07-28T06:05:00.000Z",
    updatedAt: "2026-07-28T06:05:00.000Z",
  },
  {
    id: "brewery-meet-greet-conversation-20260426",
    src: "/media/campaign-photos/brewery-meet-greet-conversation-20260426.png",
    heroLevel: "FEATURE",
    publicationStatus: "DRAFT",
    basic: {
      originalFilename: "20260426_135136.png",
      width: 1024,
      height: 768,
      orientation: "LANDSCAPE",
      fileType: "image/png",
      captureDateIso: UNKNOWN,
      cameraDevice: UNKNOWN,
    },
    campaign: {
      eventName: "Brewery / taproom meet & greet",
      county: UNKNOWN,
      city: UNKNOWN,
      venue: "Brewery / industrial taproom",
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
        "Kelly Grappe talks with a woman in a pink jacket inside a brewery space with fermentation tanks in the background.",
      caption:
        "Kelly Grappe visits with community members at a brewery meet-and-greet.",
      extendedDescription:
        "In an industrial brewery hall with stainless tanks behind, Kelly Grappe in a cream blazer listens to a woman in a bright pink jacket while other attendees with name tags look on. Same-day brewery set with crowd and USW handshake stills.",
      seoDescription:
        "Kelly Grappe talks with voters at a brewery campaign meet-and-greet.",
    },
    notes:
      "Feature — brewery meet-greet set (20260426). City/county Unknown; ID brewery if Steve knows. Placement: Journey.",
    createdAt: "2026-07-28T06:05:00.000Z",
    updatedAt: "2026-07-28T06:05:00.000Z",
  },
  {
    id: "pavilion-picnic-table-conversation-20260410",
    src: "/media/campaign-photos/pavilion-picnic-table-conversation-20260410.png",
    heroLevel: "FEATURE",
    publicationStatus: "DRAFT",
    basic: {
      originalFilename: "20260410_175906.png",
      width: 768,
      height: 1024,
      orientation: "PORTRAIT",
      fileType: "image/png",
      captureDateIso: UNKNOWN,
      cameraDevice: UNKNOWN,
    },
    campaign: {
      eventName: "Community pavilion meal",
      county: UNKNOWN,
      city: UNKNOWN,
      venue: "Open pavilion / community building",
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
        "Kelly Grappe stands beside a picnic table talking with residents during a community meal in an open pavilion.",
      caption:
        "Kelly Grappe works the tables at a community pavilion meal, talking with neighbors over lunch.",
      extendedDescription:
        "Under a metal-roofed pavilion, Kelly Grappe in a navy blazer leans toward people eating at a picnic table while a buffet line continues in the background. Everyday mealtime conversation captures accessible trail politics.",
      seoDescription:
        "Kelly Grappe talks with neighbors at a community pavilion meal.",
    },
    notes:
      "Feature — mealtime retail politics. City/county Unknown. Placement: Journey, Meet Kelly.",
    createdAt: "2026-07-28T06:05:00.000Z",
    updatedAt: "2026-07-28T06:05:00.000Z",
  },
  {
    id: "brewery-crowd-conversation-20260426",
    src: "/media/campaign-photos/brewery-crowd-conversation-20260426.png",
    heroLevel: "FEATURE",
    publicationStatus: "DRAFT",
    basic: {
      originalFilename: "20260426_140755.png",
      width: 768,
      height: 1024,
      orientation: "PORTRAIT",
      fileType: "image/png",
      captureDateIso: UNKNOWN,
      cameraDevice: UNKNOWN,
    },
    campaign: {
      eventName: "Brewery / taproom meet & greet",
      county: UNKNOWN,
      city: UNKNOWN,
      venue: "Brewery / industrial taproom",
      eventDate: UNKNOWN,
      photographer: UNKNOWN,
      peopleVisible: ["Kelly Grappe"],
      organizations: [],
      campaignTheme: "Community Engagement",
      relatedIssue: "Voter Outreach",
      relatedSpeechVideoIds: [],
      relatedBlogPaths: [],
      relatedEventIds: [],
      relatedPagePaths: ["/about/journey", "/get-involved", "/volunteer"],
      homepageCandidate: false,
      featuredPhoto: true,
    },
    accessibility: {
      altText:
        "Kelly Grappe talks with a young supporter amid a crowded brewery meet-and-greet with tanks and kegs behind them.",
      caption:
        "Inside a busy brewery meet-and-greet, Kelly Grappe connects one-on-one with a supporter.",
      extendedDescription:
        "From a high angle in a taproom filled with brewing tanks, stacked pallets, and kegs, Kelly Grappe in a white blazer converses with a smiling young woman while a guitarist and other guests fill the room.",
      seoDescription:
        "Kelly Grappe meets supporters at a crowded brewery campaign event.",
    },
    notes:
      "Feature — brewery set wide energy. City/county Unknown. Placement: Journey, Volunteer.",
    createdAt: "2026-07-28T06:05:00.000Z",
    updatedAt: "2026-07-28T06:05:00.000Z",
  },
  {
    id: "brewery-usw-handshake-20260426",
    src: "/media/campaign-photos/brewery-usw-handshake-20260426.png",
    heroLevel: "FEATURE",
    publicationStatus: "DRAFT",
    basic: {
      originalFilename: "20260426_141504.png",
      width: 1024,
      height: 768,
      orientation: "LANDSCAPE",
      fileType: "image/png",
      captureDateIso: UNKNOWN,
      cameraDevice: UNKNOWN,
    },
    campaign: {
      eventName: "Brewery / taproom meet & greet",
      county: UNKNOWN,
      city: UNKNOWN,
      venue: "Brewery / industrial taproom",
      eventDate: UNKNOWN,
      photographer: UNKNOWN,
      peopleVisible: ["Kelly Grappe"],
      organizations: ["United Steelworkers (USW)"],
      campaignTheme: "Coalition Building",
      relatedIssue: "Labor",
      relatedSpeechVideoIds: [],
      relatedBlogPaths: [],
      relatedEventIds: [],
      relatedPagePaths: ["/about/journey", "/about", "/get-involved"],
      homepageCandidate: false,
      featuredPhoto: true,
    },
    accessibility: {
      altText:
        "Kelly Grappe shakes hands with an enthusiastic supporter wearing a USW political polo at a brewery event.",
      caption:
        "Kelly Grappe greets a United Steelworkers supporter with a handshake at a brewery meet-and-greet.",
      extendedDescription:
        "Kelly Grappe in a white blazer shakes hands with a bearded man in a USW Political polo whose name tag references Elm Springs. The joyful handshake sits in a brewery setting with kegs and pallets behind — a labor-coalition trail moment. Other candidates' buttons may appear in-frame; crop carefully.",
      seoDescription:
        "Kelly Grappe shakes hands with a USW supporter at a brewery campaign event.",
    },
    notes:
      "Feature — labor/coalition handshake. USW from visible shirt logo. Elm Springs on name tag is the supporter's hometown, not event city. Other-candidate button in frame — crop for public. City/county Unknown. Placement: Journey, Labor/coalition stories.",
    createdAt: "2026-07-28T06:05:00.000Z",
    updatedAt: "2026-07-28T06:05:00.000Z",
  },
  {
    id: "outdoor-rally-handshake-regnat-20260328",
    src: "/media/campaign-photos/outdoor-rally-handshake-regnat-20260328.png",
    heroLevel: "FEATURE",
    publicationStatus: "DRAFT",
    basic: {
      originalFilename: "20260328_145448.png",
      width: 768,
      height: 1024,
      orientation: "PORTRAIT",
      fileType: "image/png",
      captureDateIso: UNKNOWN,
      cameraDevice: UNKNOWN,
    },
    campaign: {
      eventName: "Outdoor rally / demonstration",
      county: UNKNOWN,
      city: UNKNOWN,
      venue: "Outdoor plaza",
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
      featuredPhoto: true,
    },
    accessibility: {
      altText:
        "Kelly Grappe in a Regnat Populus shirt shakes hands with a community member outdoors near handmade protest signs.",
      caption:
        "Kelly Grappe greets a community member during an outdoor rally, wearing her Regnat Populus campaign shirt.",
      extendedDescription:
        "On a sunny plaza, Kelly Grappe in a Regnat Populus shirt shakes hands with a woman in a patterned blazer. Handmade protest signs fill the background; crop tightly on the handshake for cleaner SOS-site use if protest messaging is not desired on the page.",
      seoDescription:
        "Kelly Grappe shakes hands with a voter at an outdoor rally in a Regnat Populus shirt.",
    },
    notes:
      "Feature — strong branding + handshake. Protest signs in background — editorial crop recommended before homepage/county publish. City/county Unknown. Same day as parking-lot conversation. Placement: Journey after crop review.",
    createdAt: "2026-07-28T06:05:00.000Z",
    updatedAt: "2026-07-28T06:05:00.000Z",
  },
  {
    id: "stone-hall-remarks-campaign-sign-20260326",
    src: "/media/campaign-photos/stone-hall-remarks-campaign-sign-20260326.png",
    heroLevel: "FEATURE",
    publicationStatus: "DRAFT",
    basic: {
      originalFilename: "20260326_184029.png",
      width: 768,
      height: 1024,
      orientation: "PORTRAIT",
      fileType: "image/png",
      captureDateIso: UNKNOWN,
      cameraDevice: UNKNOWN,
    },
    campaign: {
      eventName: "Indoor community program / remarks",
      county: UNKNOWN,
      city: UNKNOWN,
      venue: "Stone-walled hall",
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
        "Kelly Grappe in a red-orange blazer speaks indoors beside a People Over Politics campaign sign against a stone wall.",
      caption:
        "Kelly Grappe addresses a community gathering beside her People Over Politics Secretary of State sign.",
      extendedDescription:
        "From a low angle in a rustic stone-walled hall with wood beams, Kelly Grappe in a red-orange blazer clasps her hands while speaking. A blue Kelly Grappe / People Over Politics campaign sign sits on a ledge behind her.",
      seoDescription:
        "Kelly Grappe speaks at a community event beside her People Over Politics campaign sign.",
    },
    notes:
      "Feature — clear campaign sign + speaking posture. City/county Unknown. Placement: Journey, Meet Kelly, speeches-adjacent.",
    createdAt: "2026-07-28T06:05:00.000Z",
    updatedAt: "2026-07-28T06:05:00.000Z",
  },
  {
    id: "war-memorial-stadium-community-laugh-20260320",
    src: "/media/campaign-photos/war-memorial-stadium-community-laugh-20260320.png",
    heroLevel: "FEATURE",
    publicationStatus: "DRAFT",
    basic: {
      originalFilename: "20260320_100928.png",
      width: 1024,
      height: 768,
      orientation: "LANDSCAPE",
      fileType: "image/png",
      captureDateIso: UNKNOWN,
      cameraDevice: UNKNOWN,
    },
    campaign: {
      eventName: "War Memorial Stadium community celebration",
      county: "Pulaski",
      city: "Little Rock",
      venue: "War Memorial Stadium",
      eventDate: UNKNOWN,
      photographer: UNKNOWN,
      peopleVisible: ["Kelly Grappe"],
      organizations: [],
      campaignTheme: "Community Engagement",
      relatedIssue: "Voter Outreach",
      relatedSpeechVideoIds: [],
      relatedBlogPaths: [],
      relatedEventIds: [],
      relatedPagePaths: ["/about/journey", "/about", "/counties/pulaski", "/get-involved"],
      homepageCandidate: false,
      featuredPhoto: true,
    },
    accessibility: {
      altText:
        "Kelly Grappe laughs with a community member in traditional attire at War Memorial Stadium during a large field celebration.",
      caption:
        "Kelly Grappe shares a joyful conversation at War Memorial Stadium in Little Rock during a community celebration on the field.",
      extendedDescription:
        "On a stadium walkway above a crowded field, Kelly Grappe — wearing a People Over Politics button and Secretary of State name tag — laughs with a woman in embroidered traditional attire. Bleachers and a diverse celebration crowd fill the background of this Little Rock stop.",
      seoDescription:
        "Kelly Grappe laughs with a community member at War Memorial Stadium in Little Rock.",
    },
    notes:
      "Feature — same-day pair with war-memorial-stadium-concourse (scoreboard locks Little Rock / Pulaski). Child with balloon partially visible — fine in festival context. Placement: Pulaski county, Journey, diversity/outreach.",
    createdAt: "2026-07-28T06:10:00.000Z",
    updatedAt: "2026-07-28T06:10:00.000Z",
  },
  {
    id: "supporter-group-selfie-20260315",
    src: "/media/campaign-photos/supporter-group-selfie-20260315.png",
    heroLevel: "FEATURE",
    publicationStatus: "DRAFT",
    basic: {
      originalFilename: "20260315_190507.png",
      width: 1024,
      height: 473,
      orientation: "LANDSCAPE",
      fileType: "image/png",
      captureDateIso: UNKNOWN,
      cameraDevice: UNKNOWN,
    },
    campaign: {
      eventName: "Indoor supporter meetup",
      county: UNKNOWN,
      city: UNKNOWN,
      venue: "Indoor community space",
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
        "Kelly Grappe smiles in a group selfie with supporters, wearing a Secretary of State sticker and Kelly Across Arkansas button.",
      caption:
        "Kelly Grappe joins supporters for a group selfie — Kelly Across Arkansas energy up close.",
      extendedDescription:
        "In a casual indoor selfie, Kelly Grappe stands at right in a red top and dark blazer with a Secretary of State name sticker and Kelly Across Arkansas button, smiling with four supporters near a staircase and holiday tree.",
      seoDescription:
        "Kelly Grappe poses for a group selfie with campaign supporters.",
    },
    notes:
      "Feature — Kelly Across Arkansas button visible. Composition is companion-taken selfie; Kelly clearly branded. City/county Unknown. Placement: Journey, Volunteer.",
    createdAt: "2026-07-28T06:10:00.000Z",
    updatedAt: "2026-07-28T06:10:00.000Z",
  },
  {
    id: "war-memorial-stadium-concourse-20260320",
    src: "/media/campaign-photos/war-memorial-stadium-concourse-20260320.png",
    heroLevel: "FEATURE",
    publicationStatus: "DRAFT",
    basic: {
      originalFilename: "20260320_100940.png",
      width: 768,
      height: 1024,
      orientation: "PORTRAIT",
      fileType: "image/png",
      captureDateIso: UNKNOWN,
      cameraDevice: UNKNOWN,
    },
    campaign: {
      eventName: "War Memorial Stadium community celebration",
      county: "Pulaski",
      city: "Little Rock",
      venue: "War Memorial Stadium concourse",
      eventDate: UNKNOWN,
      photographer: UNKNOWN,
      peopleVisible: ["Kelly Grappe"],
      organizations: [],
      campaignTheme: "Community Engagement",
      relatedIssue: "Voter Outreach",
      relatedSpeechVideoIds: [],
      relatedBlogPaths: [],
      relatedEventIds: [],
      relatedPagePaths: ["/about/journey", "/about", "/counties/pulaski", "/get-involved"],
      homepageCandidate: true,
      featuredPhoto: true,
    },
    accessibility: {
      altText:
        "Kelly Grappe speaks on the War Memorial Stadium concourse overlooking a crowded field celebration in Little Rock.",
      caption:
        "Kelly Grappe engages on the concourse at War Memorial Stadium in Little Rock during a large community celebration.",
      extendedDescription:
        "From an elevated concourse, Kelly Grappe gestures mid-conversation while a War Memorial Stadium scoreboard and Simmons Bank branding confirm the Little Rock venue. A diverse crowd fills the field below during a daytime community celebration.",
      seoDescription:
        "Kelly Grappe at War Memorial Stadium in Little Rock during a community celebration.",
    },
    notes:
      "Feature — geography confirmed by War Memorial Stadium scoreboard (Little Rock / Pulaski). Strong statewide/capital-city story. Placement: Pulaski county, Journey, Across Arkansas.",
    createdAt: "2026-07-28T06:10:00.000Z",
    updatedAt: "2026-07-28T06:10:00.000Z",
  },
  {
    id: "i-voted-supporter-photo-20260303",
    src: "/media/campaign-photos/i-voted-supporter-photo-20260303.png",
    heroLevel: "FEATURE",
    publicationStatus: "DRAFT",
    basic: {
      originalFilename: "20260303_214343.png",
      width: 768,
      height: 1024,
      orientation: "PORTRAIT",
      fileType: "image/png",
      captureDateIso: UNKNOWN,
      cameraDevice: UNKNOWN,
    },
    campaign: {
      eventName: "Election night / voting celebration",
      county: UNKNOWN,
      city: UNKNOWN,
      venue: "Indoor event space",
      eventDate: UNKNOWN,
      photographer: UNKNOWN,
      peopleVisible: ["Kelly Grappe"],
      organizations: [],
      campaignTheme: "Voter Participation",
      relatedIssue: "Voting",
      relatedSpeechVideoIds: [],
      relatedBlogPaths: [],
      relatedEventIds: [],
      relatedPagePaths: ["/about/journey", "/about", "/get-involved"],
      homepageCandidate: false,
      featuredPhoto: true,
    },
    accessibility: {
      altText:
        "Kelly Grappe smiles beside a supporter, wearing an I Voted sticker on her blazer at an indoor event.",
      caption:
        "Kelly Grappe celebrates civic participation with an I Voted sticker beside a supporter.",
      extendedDescription:
        "At an indoor evening event, Kelly Grappe in a navy blazer and jeans smiles next to a supporter wearing Democratic and coalition buttons. An I Voted sticker on Kelly's lapel anchors a voter-participation story moment.",
      seoDescription:
        "Kelly Grappe wears an I Voted sticker while posing with a supporter.",
    },
    notes:
      "Feature — I Voted civic participation still. Other-candidate buttons on supporter — crop/context carefully. City/county Unknown. Placement: Journey, Get Involved, voting stories.",
    createdAt: "2026-07-28T06:10:00.000Z",
    updatedAt: "2026-07-28T06:10:00.000Z",
  },
  {
    id: "porch-door-knock-approach-20260301",
    src: "/media/campaign-photos/porch-door-knock-approach-20260301.png",
    heroLevel: "SUPPORTING",
    publicationStatus: "DRAFT",
    basic: {
      originalFilename: "20260301_115551.png",
      width: 1024,
      height: 768,
      orientation: "LANDSCAPE",
      fileType: "image/png",
      captureDateIso: UNKNOWN,
      cameraDevice: UNKNOWN,
    },
    campaign: {
      eventName: "Door-to-door canvassing",
      county: UNKNOWN,
      city: UNKNOWN,
      venue: "Residential porch",
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
      featuredPhoto: false,
    },
    accessibility: {
      altText:
        "Kelly Grappe stands on a residential porch reaching toward the front door during door-to-door canvassing.",
      caption:
        "Door by door — Kelly Grappe reaches a front porch during retail canvassing.",
      extendedDescription:
        "Seen from behind on a raised concrete porch of a beige metal-roof home, Kelly Grappe in a black blazer and jeans reaches toward the storm door. A cast-iron bench and porch decorations frame an everyday door-knock moment on the trail.",
      seoDescription:
        "Kelly Grappe approaches a front door during campaign canvassing.",
    },
    notes:
      "SUPPORTING — face not visible; strong process/canvass documentation. Same-day set with stone-porch-door-conversation. City/county Unknown. Placement: Journey gallery, Volunteer story.",
    createdAt: "2026-07-28T06:15:00.000Z",
    updatedAt: "2026-07-28T06:15:00.000Z",
  },
  {
    id: "stone-porch-door-conversation-20260301",
    src: "/media/campaign-photos/stone-porch-door-conversation-20260301.png",
    heroLevel: "FEATURE",
    publicationStatus: "DRAFT",
    basic: {
      originalFilename: "20260301_124500.png",
      width: 768,
      height: 1024,
      orientation: "PORTRAIT",
      fileType: "image/png",
      captureDateIso: UNKNOWN,
      cameraDevice: UNKNOWN,
    },
    campaign: {
      eventName: "Door-to-door canvassing",
      county: UNKNOWN,
      city: UNKNOWN,
      venue: "Residential stone porch",
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
      homepageCandidate: true,
      featuredPhoto: true,
    },
    accessibility: {
      altText:
        "Kelly Grappe talks with a resident at a stone-house doorway while holding campaign literature.",
      caption:
        "Kelly Grappe meets a voter at the door — literature in hand, conversation underway.",
      extendedDescription:
        "On a fieldstone porch, Kelly Grappe in a black blazer holds a stack of dark campaign pamphlets while speaking with a grey-haired resident in the doorway. A Ten Commandments tablet sits on the ledge beside them during this daytime canvass stop.",
      seoDescription:
        "Kelly Grappe talks with a resident during door-to-door campaign canvassing.",
    },
    notes:
      "Feature — strongest door-knock still (literature + conversation). Religious porch decor visible — use respectfully; do not invent faith/politics claims. Same-day set with porch-door-knock-approach. City/county Unknown.",
    createdAt: "2026-07-28T06:15:00.000Z",
    updatedAt: "2026-07-28T06:15:00.000Z",
  },
  {
    id: "elks-lodge-breakfast-table-20260228",
    src: "/media/campaign-photos/elks-lodge-breakfast-table-20260228.png",
    heroLevel: "FEATURE",
    publicationStatus: "DRAFT",
    basic: {
      originalFilename: "20260228_104908.png",
      width: 768,
      height: 1024,
      orientation: "PORTRAIT",
      fileType: "image/png",
      captureDateIso: UNKNOWN,
      cameraDevice: UNKNOWN,
    },
    campaign: {
      eventName: "Lodge breakfast meet-and-greet",
      county: UNKNOWN,
      city: UNKNOWN,
      venue: "Elks Lodge hall",
      eventDate: UNKNOWN,
      photographer: UNKNOWN,
      peopleVisible: ["Kelly Grappe"],
      organizations: ["Benevolent and Protective Order of Elks"],
      campaignTheme: "Community Engagement",
      relatedIssue: "Voter Outreach",
      relatedSpeechVideoIds: [],
      relatedBlogPaths: [],
      relatedEventIds: [],
      relatedPagePaths: ["/about/journey", "/about", "/get-involved"],
      homepageCandidate: true,
      featuredPhoto: true,
    },
    accessibility: {
      altText:
        "Kelly Grappe speaks with seniors seated around a breakfast table in an Elks Lodge hall.",
      caption:
        "Kelly Grappe visits with seniors over breakfast in an Elks Lodge hall.",
      extendedDescription:
        "Standing at a round breakfast table with blue campaign cards and juice glasses, Kelly Grappe — in a black jacket with gold braid trim and a blue campaign button — leans in to speak with seated seniors. An Our Absent Brothers memorial plaque with an elk emblem and a Conference Room door mark the lodge setting.",
      seoDescription:
        "Kelly Grappe speaks with seniors at an Elks Lodge breakfast table.",
    },
    notes:
      "Feature — venue locked as Elks Lodge from Our Absent Brothers / elk emblem plaque; city/county still Unknown. Strong small-town civic engagement still. Placement: Journey, Meet Kelly.",
    createdAt: "2026-07-28T06:15:00.000Z",
    updatedAt: "2026-07-28T06:15:00.000Z",
  },
  {
    id: "hallway-tracksuit-conversation-20260301",
    src: "/media/campaign-photos/hallway-tracksuit-conversation-20260301.png",
    heroLevel: "FEATURE",
    publicationStatus: "DRAFT",
    basic: {
      originalFilename: "20260301_162832.png",
      width: 768,
      height: 1024,
      orientation: "PORTRAIT",
      fileType: "image/png",
      captureDateIso: UNKNOWN,
      cameraDevice: UNKNOWN,
    },
    campaign: {
      eventName: "Public building community event",
      county: UNKNOWN,
      city: UNKNOWN,
      venue: "Public building lobby / hallway",
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
        "Kelly Grappe talks with a woman holding a drink carrier in a bright public-building hallway.",
      caption:
        "Kelly Grappe connects with a community member in a busy public hallway.",
      extendedDescription:
        "In a terrazzo hallway near an EXIT sign and first-aid marker, Kelly Grappe in a cream whip-stitched sweater gestures while speaking with a woman in a green tracksuit holding a cardboard drink carrier. Other attendees with campaign-style buttons gather toward a bright entrance beyond.",
      seoDescription:
        "Kelly Grappe talks with a community member in a public building hallway.",
    },
    notes:
      "Feature — candid hallway retail politics; face clear. City/county Unknown. Placement: Journey, Meet Kelly.",
    createdAt: "2026-07-28T06:15:00.000Z",
    updatedAt: "2026-07-28T06:15:00.000Z",
  },
];

export function listCampaignPhotos(): CampaignPhotoRecord[] {
  return mergeCampaignPhotosWithEvidence(CAMPAIGN_PHOTO_REGISTRY);
}

export function listPublishedCampaignPhotos(): CampaignPhotoRecord[] {
  return listCampaignPhotos().filter((p) => p.publicationStatus === "PUBLISHED");
}

export function getCampaignPhotoById(id: string): CampaignPhotoRecord | null {
  const base = CAMPAIGN_PHOTO_REGISTRY.find((p) => p.id === id) ?? null;
  return base ? mergeCampaignPhotoWithEvidence(base) : null;
}

export function listCampaignPhotosByCounty(county: string): CampaignPhotoRecord[] {
  const c = county.trim().toLowerCase().replace(/\s+county$/, "");
  if (!c) return [];
  return listCampaignPhotos().filter((p) => {
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
