/**
 * Kelly Across Arkansas — journey page copy (message-psychology pass).
 * Geography claims stay conservative; unknown stays unknown.
 */

export const acrossArkansasJourneyCopy = {
  hero: {
    eyebrow: "Kelly Across Arkansas",
    title: "Kelly Across Arkansas",
    subtitle:
      "Evidence that Kelly is meeting Arkansas where Arkansas lives—listening, learning, visiting, speaking, and engaging. Not an empty county grid.",
  },
  /** Evidence verbs — Journey narrative spine (photos/video carry the proof) */
  evidenceVerbs: ["Listened", "Learned", "Visited", "Spoke", "Engaged"] as const,
  /** Target: 75–130 words */
  intro:
    "This page is trail evidence, not a travelogue. Kelly shows up at confirmed stops to listen and learn what is working and what is not—then visits, speaks, and engages so the office stays grounded in real communities. Featured video and curated stills prove that method. We do not invent county coverage to fill a map. Invite Kelly through staff review; nothing is confirmed until the campaign says so. For qualifications and governing commitments, use Meet Kelly and Priorities.",
  videoIntroduction:
    "A trail story from Hot Springs Village: neighbors gathering, conversations starting, and the work of showing up.",
  photographyHeading: "Trail evidence",
  photographyIntro:
    "Selected FEATURE stills. City and county appear only when confirmed. Each frame should answer: listened, learned, visited, spoke, or engaged.",
  invite: {
    title: "Invite Kelly",
    body: "Invite Kelly to your county, club, church, chamber, fair, or community gathering. Every request goes through staff review before anything is confirmed.",
    primary: { href: "/events/request", label: "Invite Kelly" },
    secondary: { href: "/events", label: "Events calendar" },
  },
  closing: {
    title: "Keep following the trail",
    body: "Verified field posts and published events appear as the campaign releases them. New confirmations make this page stronger—without rewriting the campaign.",
    ctas: [
      { href: "/from-the-road", label: "From the Road" },
      { href: "/campaign-photos", label: "View Campaign Photos" },
      { href: "/about", label: "Read About Kelly’s Experience" },
    ],
  },
} as const;
