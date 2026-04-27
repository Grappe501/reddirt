/**
 * Demo/seed view-model for the public member hub (`/messages`).
 * Composes NDE packet helpers with static narrative slices — no I/O, no blog/CMS replacement.
 *
 * @see docs/NARRATIVE_PUBLIC_MEMBER_HUB_REPORT.md
 * @see docs/WEBSITE_PASS_06_CONVERSATIONS_STORIES_REPORT.md
 */

import { MESSAGE_STARTER_LOCAL_STORY_PROMPTS } from "@/lib/message-engine";
import { POWER_OF_5_ORGANIZING_PIPELINES } from "@/lib/power-of-5/pipelines";
import { getCountyNarrativePacket, getPowerOf5LaunchPacket } from "./packet-builder";

export type PublicMemberHubMessageOfWeek = {
  weekLabel: string;
  title: string;
  dek: string;
  body: string;
};

export type PublicMemberHubCountyCard = {
  countySlug: string;
  displayName: string;
  teaser: string;
  coreLine: string;
  countyCommandHref: string;
  organizingIntelligenceHref: string;
};

export type PublicMemberHubP5Prompt = {
  stage: string;
  title: string;
  prompt: string;
};

export type PublicMemberHubSharePacket = {
  title: string;
  intro: string;
  checklist: string[];
  copyBlock: string;
};

export type PublicMemberHubListeningPrompt = {
  title: string;
  prompt: string;
  reminder: string;
};

export type PublicMemberHubBringFiveCta = {
  title: string;
  body: string;
  primaryHref: string;
  primaryLabel: string;
  secondaryHref: string;
  secondaryLabel: string;
};

export type PublicMemberHubWhatToSayToFiveLine = {
  /** Short context label, e.g. "Coffee / text". */
  setting: string;
  /** Speak-aloud line volunteers can adapt. */
  script: string;
};

export type PublicMemberHubWhatToSayToFive = {
  intro: string;
  lines: PublicMemberHubWhatToSayToFiveLine[];
};

export type PublicMemberHubLocalStoryPrompt = {
  id: string;
  title: string;
  prompt: string;
  bridgeHint: string;
};

export type PublicMemberHubNarrativePriority = {
  windowLabel: string;
  title: string;
  summary: string;
  href?: string;
  hrefLabel?: string;
};

export type PublicMemberHubModel = {
  demoNotice: string;
  messageOfWeek: PublicMemberHubMessageOfWeek;
  narrativePriorities: PublicMemberHubNarrativePriority[];
  whatToSayToYourFive: PublicMemberHubWhatToSayToFive;
  localStoryPrompts: PublicMemberHubLocalStoryPrompt[];
  countyCards: PublicMemberHubCountyCard[];
  powerOf5Launch: {
    coreMessage: string;
    feedbackQuestion: string;
    assignmentSuggestion: string;
    timingSuggestion: string;
    kpiTarget: string;
  };
  powerOf5ConversationPrompts: PublicMemberHubP5Prompt[];
  /** Ordered share packets: relational DM, gatherings, quick social — all demo/seed. */
  volunteerSharePackets: PublicMemberHubSharePacket[];
  listeningPrompts: PublicMemberHubListeningPrompt[];
  bringFiveCta: PublicMemberHubBringFiveCta;
};

function titleCaseCounty(slug: string): string {
  return slug
    .split("-")
    .filter(Boolean)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(" ");
}

const STATIC_MESSAGE_OF_WEEK: PublicMemberHubMessageOfWeek = {
  weekLabel: "This week · demo packet MH-001 (refreshes when comms rails connect)",
  title: "Democracy works better when neighbors talk to neighbors",
  dek: "A single statewide line you can repeat in your own words — staff will swap this for the live message of the week when the hub is wired to approvals.",
  body: "This week’s through-line is simple: fair access to the ballot isn’t a partisan talking point — it’s how communities hold power accountable. When you share the story, lead with a real moment from your county (a line at the polls, a confusing form, a win you saw). Stay in your lane: no invented quotes, no pressure on anyone to share private details. This block is demo/seed text only.",
};

const WHAT_TO_SAY_TO_YOUR_FIVE: PublicMemberHubWhatToSayToFive = {
  intro:
    "Five people you already trust — not a quota, a circle. Rotate through these lines over the week; adapt the words so they sound like you. Everything below is demo/seed until your region’s packet is approved.",
  lines: [
    {
      setting: "Opening beat",
      script:
        "I’ve been thinking about how elections actually show up in our day-to-day — not cable news, but the stuff that hits our county. Can I run one thing by you?",
    },
    {
      setting: "Invite curiosity",
      script:
        "When voting or registration got confusing for you or someone you know, where did you feel it first — time, paperwork, or just not knowing who to ask?",
    },
    {
      setting: "Share the stake",
      script:
        "I’m backing Kelly Grappe for Secretary of State because I want rules that are readable and fair — especially for folks who don’t live on politics Twitter. No pressure; I’m just naming my why.",
    },
    {
      setting: "Offer a small next step",
      script:
        "If you want, I can send a one-pager or a story link — or we can pick this up another time. Either way, I’m glad we’re talking.",
    },
    {
      setting: "Close with dignity",
      script:
        "Thanks for hearing me out. If this isn’t your thing, totally okay — I appreciate you either way.",
    },
  ],
};

const NARRATIVE_PRIORITIES: PublicMemberHubNarrativePriority[] = [
  {
    windowLabel: "Now · demo queue",
    title: "Lift county-colored proof alongside the statewide spine",
    summary:
      "Pair the message of the week with one true local detail per conversation — a line you saw, a question a neighbor asked, a poll-worker gap. Stories and blog posts remain the long-form record.",
    href: "/stories",
    hrefLabel: "Browse Stories",
  },
  {
    windowLabel: "Next · when wired",
    title: "Tighten “why Kelly” for municipal clerks and first-time helpers",
    summary:
      "Field teams want short, respectful language for people who run elections and neighbors who might volunteer — no hot takes, just clarity. Notebook posts may mirror this cadence on the Blog.",
    href: "/blog",
    hrefLabel: "Open Blog",
  },
  {
    windowLabel: "Standing guardrail",
    title: "Listening before litigating",
    summary:
      "Keep public-facing prompts aggregate-safe: themes back to organizers, not voter-level detail on open pages. Pair hub prompts with election listening sessions when you host.",
    href: "/listening-sessions",
    hrefLabel: "Listening sessions",
  },
];

const VOLUNTEER_SHARE_PACKET: PublicMemberHubSharePacket = {
  title: "Volunteer DM / text packet (demo)",
  intro:
    "Copy, paste, and personalize. Replace bracketed slots with your turf; delete anything that doesn’t fit your relationship.",
  checklist: [
    "Open with gratitude — one sentence about why this person matters to you.",
    "Name one concrete stake: voting, poll workers, or local rules they’ve seen.",
    "Offer a small next step: reply, coffee, or a link to the campaign calendar.",
    "Close without pressure — a real invitation beats a hard close.",
  ],
  copyBlock: `Hey [name] — I’ve been thinking about our conversation about [local detail]. I’m helping Kelly Grappe’s campaign for Secretary of State because I want fair, readable election rules for [county/community]. No pressure at all — if you want the one-page summary I’m using with friends, I can send it. If not, still glad we talked.`,
};

const EVENT_INVITE_PACKET: PublicMemberHubSharePacket = {
  title: "Event invite packet (demo)",
  intro: "Short invites work best when time, place, and “why you” are obvious.",
  checklist: [
    "Lead with the human hook — who’s hosting, what kind of room it is.",
    "Add logistics in one line — date, time, neighborhood, accessibility note if you have it.",
    "Offer a backup — “happy to catch you another time” lowers anxiety.",
  ],
  copyBlock: `I’m hosting a small get-together on [date] at [time] — mostly neighbors who care about elections being run fairly and clearly. Kelly’s team shared a short briefing we can walk through together. Want me to save you a seat? If weekdays are tough, tell me what works and we’ll find another touchpoint.`,
};

const SOCIAL_SPARK_PACKET: PublicMemberHubSharePacket = {
  title: "Volunteer social spark (demo)",
  intro: "Short optional post or caption — personalize; skip if the platform feels wrong for your people.",
  checklist: [
    "Lead with a neighbor detail, not a slogan.",
    "One sentence on why readable election rules matter where you live.",
    "Invite replies or DMs — not a pile-on thread.",
  ],
  copyBlock: `Neighbors in [place] deserve election rules we can actually read — and clerks who aren’t set up to fail. I’m volunteering with Kelly Grappe’s SOS race because I want that kind of leadership. If you’re curious, I’m happy to share what I’m learning — no pressure.`,
};

const LISTENING_PROMPTS: PublicMemberHubListeningPrompt[] = [
  {
    title: "Name the friction",
    prompt: "Where did you last see voting or registration get confusing — for you or someone you know?",
    reminder: "Listen first; don’t debate. Note the theme for organizers (aggregate only).",
  },
  {
    title: "Local proof",
    prompt: "What’s one thing your county does well today in elections — and one thing you’d fix if you could?",
    reminder: "Demo/seed prompt — swap for staff-approved listening scripts when published.",
  },
  {
    title: "Hope and homework",
    prompt: "If we got rules that were easier to read and easier to trust, what would change in your community?",
    reminder: "Invite them to stay in touch; no voter file talk on public surfaces.",
  },
];

const BRING_FIVE: PublicMemberHubBringFiveCta = {
  title: "Bring this to your five — start with onboarding",
  body: "Walk the Power of 5 flow to name your circle, practice scripts, and see the same prompts in context. Then come back here for the weekly line and county packets. Demo/seed until your region is published.",
  primaryHref: "/onboarding/power-of-5",
  primaryLabel: "Power of 5 onboarding",
  secondaryHref: "/start-a-local-team",
  secondaryLabel: "Start a local team",
};

function hubLocalStoryPrompts(): PublicMemberHubLocalStoryPrompt[] {
  const place = "your area";
  return MESSAGE_STARTER_LOCAL_STORY_PROMPTS.map((p) => ({
    id: p.id,
    title: p.title,
    prompt: p.prompt.replace(/\{\{place_name\}\}/g, place),
    bridgeHint: p.bridgeHint,
  }));
}

/**
 * Deterministic public-safe hub payload (packet builder + static slices).
 */
export function buildPublicMemberHubModel(): PublicMemberHubModel {
  const p5 = getPowerOf5LaunchPacket();
  const countySlugs = ["pope", "washington", "jefferson"] as const;
  const countyCards: PublicMemberHubCountyCard[] = countySlugs.map((slug) => {
    const packet = getCountyNarrativePacket(slug);
    const firstAsset = packet.copyAssets[0];
    return {
      countySlug: slug,
      displayName: `${titleCaseCounty(slug)} County`,
      teaser: firstAsset?.summary ?? packet.coreMessage.slice(0, 160),
      coreLine: packet.coreMessage,
      countyCommandHref: `/counties/${slug}`,
      organizingIntelligenceHref: `/organizing-intelligence/counties/${slug}`,
    };
  });

  const powerOf5ConversationPrompts: PublicMemberHubP5Prompt[] = POWER_OF_5_ORGANIZING_PIPELINES.map((step) => ({
    stage: `Stage ${step.order}`,
    title: step.label,
    prompt: `Try opening with: “I’m curious where you are on ${step.label.toLowerCase()} — ${step.summary}” Then hush. Let them finish a thought before you add detail.`,
  }));

  return {
    demoNotice:
      "Everything on this page uses demo or seed content for layout and training. It is not a substitute for counsel-reviewed sends, blog posts, or workbench drafts.",
    messageOfWeek: STATIC_MESSAGE_OF_WEEK,
    narrativePriorities: NARRATIVE_PRIORITIES,
    whatToSayToYourFive: WHAT_TO_SAY_TO_YOUR_FIVE,
    localStoryPrompts: hubLocalStoryPrompts(),
    countyCards,
    powerOf5Launch: {
      coreMessage: p5.coreMessage,
      feedbackQuestion: p5.feedbackQuestion,
      assignmentSuggestion: p5.assignmentSuggestion,
      timingSuggestion: p5.timingSuggestion,
      kpiTarget: p5.kpiTarget,
    },
    powerOf5ConversationPrompts,
    volunteerSharePackets: [VOLUNTEER_SHARE_PACKET, EVENT_INVITE_PACKET, SOCIAL_SPARK_PACKET],
    listeningPrompts: LISTENING_PROMPTS,
    bringFiveCta: BRING_FIVE,
  };
}
