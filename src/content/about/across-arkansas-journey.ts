/**
 * Kelly Across Arkansas — journey page copy (message-psychology pass).
 * Geography claims stay conservative; unknown stays unknown.
 */

export const acrossArkansasJourneyCopy = {
  hero: {
    eyebrow: "Kelly Across Arkansas",
    title: "Kelly Across Arkansas",
    subtitle:
      "Confirmed trail evidence: travel, listening, and invitations to meet—not an empty county grid.",
  },
  /** Target: 75–130 words */
  intro:
    "This page shows how Kelly works on the trail: she travels to confirmed stops, listens, asks questions, and learns what is working and what is not. Featured video and curated stills are evidence of that method — not claims of coverage everywhere. We do not invent county coverage to fill a map. Invite Kelly through staff review; nothing is confirmed until the campaign says so. For qualifications and governing commitments, use Meet Kelly and Priorities rather than expecting a full biography on this page.",
  videoIntroduction:
    "A trail story from Hot Springs Village: neighbors gathering, conversations starting, and the work of showing up.",
  invite: {
    title: "Invite Kelly",
    body: "Invite Kelly to your county, club, church, chamber, fair, or community gathering. Every request goes through staff review before anything is confirmed.",
    primary: { href: "/events/request", label: "Invite Kelly" },
    secondary: { href: "/events", label: "Events calendar" },
  },
  closing: {
    title: "Keep following the trail",
    body: "Verified field posts and published events appear as the campaign releases them.",
    ctas: [
      { href: "/from-the-road", label: "From the Road" },
      { href: "/campaign-photos", label: "View Campaign Photos" },
      { href: "/about", label: "Read About Kelly’s Experience" },
    ],
  },
} as const;
