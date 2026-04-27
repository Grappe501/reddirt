/**
 * Starter template registry — safe, generic copy only. No voter rows, scores, or PII.
 * Replace `{{slots}}` with volunteer-supplied or **approved** static content.
 */

import type {
  FollowUpPrompt,
  LocalStoryPrompt,
  MessageCategory,
  MessageTemplate,
  ObjectionResponse,
} from "./types";

export const MESSAGE_STARTER_TEMPLATES = [
  {
    id: "mce.p5_onboarding.circle_invite.v1",
    version: "1.0.0",
    title: "Invite someone into your Power of 5",
    summary: "Listening-first invite to grow a small trusted circle",
    category: "power_of_5_onboarding",
    patternKind: "conversation_starter",
    defaultTone: "warm",
    primaryAudience: "volunteer_prospect",
    relationshipHints: ["friend", "neighbor", "coworker", "church_community"],
    geographyScope: "county",
    safetyLevel: "public_volunteer",
    body: `Hey — I've been thinking about how change actually happens where we live. I'm trying something called Power of 5: a small circle of people I already trust, having real conversations instead of just posting online.

Would you be open to coffee or a quick call? I'm not looking to argue politics — I want to hear what's on your mind about {{local_issue_or_place}}, and share what a few of us are doing locally. If it's not your thing, no pressure at all.`,
    bridge: `If they're curious: "The idea is five intentional relationships — people who'll pick up the phone — not a giant contact list."`,
    slots: [
      {
        key: "local_issue_or_place",
        description: "One concrete local hook (schools, jobs, downtown, a neighborly concern).",
        example: "our schools and who shows up for them",
      },
    ],
    relatedPipelines: ["invite", "activation"],
    tags: ["power_of_5", "relational", "onboarding"],
  },
  {
    id: "mce.county_organizing.local_stake.v1",
    version: "1.0.0",
    title: "County organizing — why this race matters here",
    summary: "Place-based bridge without jargon",
    category: "county_organizing",
    patternKind: "bridge_statement",
    defaultTone: "curious",
    primaryAudience: "persuadable",
    relationshipHints: ["neighbor", "coworker", "church_community", "local_leader"],
    geographyScope: "county",
    safetyLevel: "public_volunteer",
    body: `In {{county_name}}, a lot of us feel the same way: we want elections to be fair, transparent, and easy for regular people to navigate — not confusing on purpose.

The Secretary of State's office touches how we register, how votes get counted, and how much trust we have in the process. I'm paying attention to this race because it's about {{shared_local_value}} where we live, not just what's happening in DC.`,
    slots: [
      {
        key: "county_name",
        description: "County display name only.",
        example: "your county",
      },
      {
        key: "shared_local_value",
        description: "Value you genuinely share (integrity, access, local schools, small business, etc.).",
        example: "keeping the rules honest and predictable for everyone",
      },
    ],
    relatedPipelines: ["conversation", "volunteer"],
    tags: ["county", "local", "secretary_of_state"],
  },
  {
    id: "mce.volunteer.shift_ask.v1",
    version: "1.0.0",
    title: "Volunteer recruitment — one specific shift",
    summary: "Clear role, finite time, easy yes or no",
    category: "volunteer_recruitment",
    patternKind: "volunteer_ask",
    defaultTone: "direct",
    primaryAudience: "volunteer_prospect",
    relationshipHints: ["friend", "neighbor", "coworker", "family"],
    geographyScope: "county",
    safetyLevel: "public_volunteer",
    body: `I'm helping with {{candidate_or_campaign_name}} and we're trying to keep this human-scale — neighbors talking to neighbors.

We're doing {{shift_description}} on {{date_or_window}}. Would you be willing to join for {{time_commitment}}? If the timing's wrong, I totally get it; if you might know someone else who'd be a fit, I'd appreciate the nudge.`,
    slots: [
      {
        key: "candidate_or_campaign_name",
        description: "Public campaign name as approved by compliance.",
        example: "Kelly's campaign",
      },
      {
        key: "shift_description",
        description: "Concrete task (calls, door, event setup, data entry, etc.).",
        example: "a neighbor-to-neighbor phone bank",
      },
      {
        key: "date_or_window",
        description: "Date or rough window.",
        example: "Tuesday evening",
      },
      {
        key: "time_commitment",
        description: "Honest duration.",
        example: "about an hour",
      },
    ],
    relatedPipelines: ["volunteer", "event"],
    tags: ["volunteer", "shift"],
  },
  {
    id: "mce.listening.two_way_open.v1",
    version: "1.0.0",
    title: "Listening conversation — open the floor",
    summary: "Questions before persuasion",
    category: "listening_conversation",
    patternKind: "listening_prompt",
    defaultTone: "humble",
    primaryAudience: "skeptical",
    relationshipHints: ["neighbor", "friend", "coworker", "church_community"],
    geographyScope: "city",
    safetyLevel: "public_volunteer",
    body: `I've been trying to listen more than I talk lately. What's the thing people around here are worried about that doesn't make the news?

I'm not looking to debate — I'm genuinely curious what you're seeing. If anything I share doesn't match your experience, tell me; I'd rather learn something than win a point.`,
    slots: [],
    relatedPipelines: ["conversation"],
    tags: ["listening", "relational"],
  },
  {
    id: "mce.followup.after_touch.v1",
    version: "1.0.0",
    title: "Follow-up after a real conversation",
    summary: "Gratitude, one clear next step, low pressure",
    category: "follow_up",
    patternKind: "follow_up",
    defaultTone: "warm",
    primaryAudience: "persuadable",
    relationshipHints: ["friend", "neighbor", "coworker", "family"],
    geographyScope: "county",
    safetyLevel: "public_volunteer",
    body: `Thanks again for taking the time yesterday — I appreciated what you said about {{topic_they_raised}}.

If you're open to it, here's one small thing: {{single_concrete_ask}}. If now isn't good, totally fine — want me to check back in a week or two, or would you rather I leave it here?`,
    slots: [
      {
        key: "topic_they_raised",
        description: "Topic they cared about (no need to quote verbatim).",
        example: "trust in how ballots are handled",
      },
      {
        key: "single_concrete_ask",
        description: "One ask: link, event, petition, intro to another neighbor, etc.",
        example: "grab coffee with two of us who are organizing locally",
      },
    ],
    relatedPipelines: ["followup", "conversation"],
    tags: ["follow_up", "relational"],
  },
  {
    id: "mce.event.invite_rsvp.v1",
    version: "1.0.0",
    title: "Event invite with RSVP path",
    summary: "Time, place, why it matters, easy RSVP",
    category: "event_invite",
    patternKind: "event_invite",
    defaultTone: "celebratory",
    primaryAudience: "supporter",
    geographyScope: "city",
    safetyLevel: "public_volunteer",
    body: `We're hosting {{event_name}} on {{date_time}} at {{location}}. It's {{one_sentence_why}} — should be pretty casual, and you'll meet folks who care about {{local_hook}}.

Can you come? RSVP here: {{rsvp_link_or_contact}}. If you need a ride or have questions, reply and we'll sort it out.`,
    slots: [
      { key: "event_name", description: "Event title.", example: "a community meet-and-greet" },
      { key: "date_time", description: "When.", example: "Saturday at 2pm" },
      { key: "location", description: "Venue or public place.", example: "the library community room" },
      {
        key: "one_sentence_why",
        description: "Honest reason to show up.",
        example: "a chance to hear directly about protecting fair elections locally",
      },
      { key: "local_hook", description: "Local tie-in.", example: "what's happening in our county" },
      { key: "rsvp_link_or_contact", description: "Approved RSVP path.", example: "the link our team sent you" },
    ],
    relatedPipelines: ["event"],
    tags: ["event", "rsvp"],
  },
  {
    id: "mce.petition.signature_ask.v1",
    version: "1.0.0",
    title: "Petition or public-comment ask",
    summary: "Clear mechanics and deadline",
    category: "petition_ask",
    patternKind: "petition_ask",
    defaultTone: "direct",
    primaryAudience: "supporter",
    geographyScope: "state",
    safetyLevel: "public_volunteer",
    body: `Quick ask — we're gathering support for {{petition_or_action}} before {{deadline}}. It takes about {{time_estimate}}: {{mechanics_short}}.

If you're in, here's how: {{how_to_participate}}. If you have questions about what it does (and doesn't) do, I'm happy to explain — no arm-twisting.`,
    slots: [
      {
        key: "petition_or_action",
        description: "What they're signing or commenting on (accurate, compliance-checked).",
        example: "a public comment on the proposed rule change",
      },
      { key: "deadline", description: "Real deadline.", example: "Friday at 5pm" },
      { key: "time_estimate", description: "Honest time.", example: "two minutes" },
      {
        key: "mechanics_short",
        description: "Plain steps.",
        example: "name, address where you're registered, and signature",
      },
      {
        key: "how_to_participate",
        description: "Link, table location, or staff contact per compliance.",
        example: "the secure form our team shared",
      },
    ],
    relatedPipelines: ["petition"],
    tags: ["petition", "public_comment"],
  },
  {
    id: "mce.gotv.vote_plan.v1",
    version: "1.0.0",
    title: "GOTV — make a vote plan (generic)",
    summary: "Encourages official info sources; no fabricated rules",
    category: "gotv_ask",
    patternKind: "gotv_ask",
    defaultTone: "urgent_respectful",
    primaryAudience: "supporter",
    geographyScope: "county",
    safetyLevel: "election_law_review_required",
    body: `Election day's coming up — have you already thought through when and how you'll vote? I like to lock in a plan early: day-of, early vote, or absentee if that's an option for you.

The safest details (polling place, hours, ID rules) change sometimes, so I always double-check the official Arkansas Secretary of State / county election site rather than trusting a random text. If you want, we can look it up together, or I can send the link our team uses.`,
    slots: [],
    relatedPipelines: ["gotv"],
    tags: ["gotv", "vote_plan"],
  },
  {
    id: "mce.candidate_recruit.respectful_ask.v1",
    version: "1.0.0",
    title: "Candidate recruitment — private, respectful",
    summary: "For trusted circles only; no public pressure",
    category: "candidate_recruitment_ask",
    patternKind: "candidate_recruitment_ask",
    defaultTone: "quiet_confidential",
    primaryAudience: "candidate_prospect",
    relationshipHints: ["friend", "local_leader", "church_community"],
    geographyScope: "county",
    safetyLevel: "leader_visible",
    body: `I'm reaching out quietly because I think you'd be strong at this, and I'd rather ask you directly than talk around you.

Have you ever considered running for {{office_level_or_seat}}? No need to answer now — if you want, I can connect you with someone who can walk through what filing looks like, timelines, and support, all confidentially. If the timing's wrong, I'll drop it and it stays between us.`,
    slots: [
      {
        key: "office_level_or_seat",
        description: "Specific office as appropriate; avoid naming others' intentions.",
        example: "a local office you're suited for",
      },
    ],
    relatedPipelines: ["candidate"],
    tags: ["candidate", "recruitment", "confidential_tone"],
  },
] as const satisfies readonly MessageTemplate[];

/** Mutable view for helpers (readonly tuple preserved for type inference). */
export const MESSAGE_TEMPLATE_REGISTRY: MessageTemplate[] = [...MESSAGE_STARTER_TEMPLATES];

export function getMessageTemplateById(id: string): MessageTemplate | undefined {
  return MESSAGE_TEMPLATE_REGISTRY.find((t) => t.id === id);
}

export function listMessageTemplatesByCategory(category: MessageCategory): MessageTemplate[] {
  return MESSAGE_TEMPLATE_REGISTRY.filter((t) => t.category === category);
}

export function listMessageTemplatesByAudience(
  audience: MessageTemplate["primaryAudience"],
): MessageTemplate[] {
  return MESSAGE_TEMPLATE_REGISTRY.filter((t) => t.primaryAudience === audience);
}

export function listAllMessageTemplateIds(): string[] {
  return MESSAGE_TEMPLATE_REGISTRY.map((t) => t.id);
}

/** Script helper: ensure registry has unique ids (throws on duplicate). */
export function assertUniqueMessageTemplateIds(templates: readonly MessageTemplate[]): void {
  const seen = new Set<string>();
  for (const t of templates) {
    if (seen.has(t.id)) throw new Error(`Duplicate MessageTemplate id: ${t.id}`);
    seen.add(t.id);
  }
}

/** Short respectful replies for volunteer cards — no targeting language. */
export const MESSAGE_STARTER_OBJECTION_RESPONSES: ObjectionResponse[] = [
  {
    id: "mce.objection.too_busy.v1",
    objectionLabel: "I'm too busy right now",
    responseBody: `Totally fair — life is loud. If it's okay, can I leave you with one link to skim when you have five minutes? No follow-up unless you want it.`,
    defaultTone: "humble",
  },
  {
    id: "mce.objection.dont_do_politics.v1",
    objectionLabel: "I don't really do politics",
    responseBody: `I get that — a lot of us feel burned out. I'm thinking less about parties and more about whether our elections work the way neighbors expect. If you'd rather not go there, I respect it.`,
    defaultTone: "curious",
  },
];

export const MESSAGE_STARTER_LOCAL_STORY_PROMPTS: LocalStoryPrompt[] = [
  {
    id: "mce.local_story.place_memory.v1",
    title: "Ground in a place people remember",
    prompt: `What's a spot in {{place_name}} that feels like "us" — a fair, a main street corner, a school event — and what's changed about it lately?`,
    bridgeHint: `Listen for care, frustration, or pride; connect to fair process as "how we decide together," not a speech.`,
    geographyScope: "county",
  },
  {
    id: "mce.local_story.workday.v1",
    title: "Start with the workday or caregiving load",
    prompt: `When election rules or deadlines get in the way in {{place_name}}, where does it usually show up first — shifts at work, school pickup, helping parents, something else?`,
    bridgeHint: `Name the friction without debating parties; fair access should fit real schedules.`,
    geographyScope: "county",
  },
  {
    id: "mce.local_story.first_vote.v1",
    title: "Honor a first-time or returned voter",
    prompt: `Who in your circle in {{place_name}} voted for the first time recently, or came back after sitting out — what nudged them?`,
    bridgeHint: `Celebrate agency; avoid pressuring anyone to disclose how they voted.`,
    geographyScope: "county",
  },
  {
    id: "mce.local_story.volunteer_gap.v1",
    title: "Poll workers and helpers",
    prompt: `In {{place_name}}, do neighbors mostly know how to sign up to help on election day — or is that still a mystery?`,
    bridgeHint: `Connect clarity on roles with trust in how elections run — still demo copy until local facts are verified.`,
    geographyScope: "county",
  },
];

export const MESSAGE_STARTER_FOLLOW_UP_PROMPTS: FollowUpPrompt[] = [
  {
    id: "mce.followup_prompt.check_in.v1",
    title: "Light check-in after no commitment",
    prompt: `Hey — no pressure from last time. Did anything shift on your end, or still about the same? I'm around if you want to talk.`,
    timingHint: "within a few days to a week",
  },
  {
    id: "mce.followup_prompt.thanks_one_beat.v1",
    title: "Thanks, plus one clear beat",
    prompt: `Thanks for making time — I keep thinking about what you said about {{topic_summary}}. No need to reply tonight; if you want to continue, I'm happy to.`,
    timingHint: "after a good conversation when you want space, not pressure",
  },
];
