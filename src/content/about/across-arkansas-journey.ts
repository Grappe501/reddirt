/**
 * Kelly Across Arkansas — journey page copy (launch pass).
 * Geography claims stay conservative; unknown stays unknown.
 */

export const acrossArkansasJourneyCopy = {
  hero: {
    eyebrow: "Kelly Across Arkansas",
    title: "Kelly Across Arkansas",
    subtitle:
      "Traveling, listening, and showing up—selected trail stories, confirmed photography, and a clear invitation to meet or invite Kelly. Not an empty county grid.",
  },
  intro:
    "This page gathers campaign-trail evidence that already exists in the public record: a featured momentum video, curated stills with confirmed places where known, and real ways to invite Kelly to your community. We do not invent county coverage to fill the map.",
  videoIntroduction:
    "From Hot Springs Village outward, this story captures campaign momentum—neighbors gathering, conversations starting, and the work of showing up again and again.",
  invite: {
    title: "Invite Kelly",
    body: "Invite Kelly to your county, club, church, chamber, fair, or community gathering. Every request goes through staff review before anything is confirmed.",
    primary: { href: "/events/request", label: "Invite Kelly" },
    secondary: { href: "/events", label: "Events calendar" },
  },
  closing: {
    title: "Keep following the trail",
    body: "Verified field posts and published events appear as the campaign releases them—nothing fabricated to look busy.",
    ctas: [
      { href: "/from-the-road", label: "From the Road" },
      { href: "/campaign-photos", label: "View Campaign Photos" },
      { href: "/about", label: "Read Kelly’s Story" },
    ],
  },
} as const;
