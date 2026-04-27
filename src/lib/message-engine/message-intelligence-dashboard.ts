/**
 * Demo / preview payloads for message intelligence on public organizing dashboards.
 * Aggregates only — no individual-level conversation data on public surfaces.
 *
 * When live telemetry exists, replace builders with registry-backed queries (still aggregate-only).
 */

import type { MessageCategory } from "./types";

export type MessageIntelligenceScope =
  | { level: "state" }
  | { level: "region"; regionDisplayName: string }
  | { level: "county"; countyDisplayName: string; regionDisplayName?: string };

export type MessageIntelligenceThemeRow = {
  label: string;
  /** Share of themed conversation logs in the preview window (0–100). */
  sharePercent: number;
  note?: string;
};

export type MessageIntelligenceCategoryRow = {
  label: string;
  /** Share of template uses tagged to this category (0–100). */
  useSharePercent: number;
};

export type MessageIntelligencePipelineMove = {
  fromLabel: string;
  toLabel: string;
  /** Positive = more conversations reached this stage vs prior window (percentage points). */
  deltaPercentPoints: number;
  conversationDelta: number;
  windowNote: string;
};

export type MessageIntelligenceNarrativeGap = {
  title: string;
  detail: string;
  priority: "high" | "medium" | "low";
};

export type MessageIntelligenceFieldMessage = {
  headline: string;
  script: string;
  categoryKey: MessageCategory;
  categoryLabel: string;
};

export type MessageIntelligenceFollowUpRow = {
  theme: string;
  openCount: number;
  note: string;
};

export type MessageIntelligenceDemoModel = {
  scopeLabel: string;
  windowLabel: string;
  themes: MessageIntelligenceThemeRow[];
  categoriesInUse: MessageIntelligenceCategoryRow[];
  pipelineMovement: MessageIntelligencePipelineMove[];
  narrativeGaps: MessageIntelligenceNarrativeGap[];
  fieldMessageOfWeek: MessageIntelligenceFieldMessage;
  followUpNeeds: MessageIntelligenceFollowUpRow[];
};

const CATEGORY_LABEL: Record<MessageCategory, string> = {
  power_of_5_onboarding: "Power of 5 onboarding",
  county_organizing: "County organizing",
  volunteer_recruitment: "Volunteer recruitment",
  listening_conversation: "Listening conversation",
  follow_up: "Follow-up",
  event_invite: "Event invite",
  petition_ask: "Petition ask",
  gotv_ask: "GOTV ask",
  candidate_recruitment_ask: "Candidate recruitment",
};

function baseCategories(): MessageIntelligenceCategoryRow[] {
  return [
    { label: CATEGORY_LABEL.listening_conversation, useSharePercent: 28 },
    { label: CATEGORY_LABEL.county_organizing, useSharePercent: 22 },
    { label: CATEGORY_LABEL.follow_up, useSharePercent: 18 },
    { label: CATEGORY_LABEL.power_of_5_onboarding, useSharePercent: 14 },
    { label: CATEGORY_LABEL.volunteer_recruitment, useSharePercent: 11 },
    { label: CATEGORY_LABEL.event_invite, useSharePercent: 7 },
  ];
}

function basePipeline(): MessageIntelligencePipelineMove[] {
  return [
    {
      fromLabel: "Invite sent",
      toLabel: "Conversation logged",
      deltaPercentPoints: 3.2,
      conversationDelta: 42,
      windowNote: "vs prior 14-day window (preview)",
    },
    {
      fromLabel: "Conversation logged",
      toLabel: "Follow-up scheduled",
      deltaPercentPoints: 1.1,
      conversationDelta: 18,
      windowNote: "vs prior 14-day window (preview)",
    },
    {
      fromLabel: "Follow-up scheduled",
      toLabel: "Ready to act (volunteer/event)",
      deltaPercentPoints: 0.6,
      conversationDelta: 9,
      windowNote: "vs prior 14-day window (preview)",
    },
  ];
}

/**
 * Deterministic demo payload for dashboards. Swap for live aggregates when logging pipelines connect.
 */
export function getMessageIntelligenceDemoModel(scope: MessageIntelligenceScope): MessageIntelligenceDemoModel {
  const windowLabel = "Rolling 14-day preview (illustrative — not live telemetry)";

  if (scope.level === "state") {
    return {
      scopeLabel: "Arkansas statewide",
      windowLabel,
      themes: [
        { label: "Ballot access and early voting", sharePercent: 24, note: "Most common civic frame in practice scripts." },
        { label: "Local schools and community anchors", sharePercent: 19 },
        { label: "Trust in election administration", sharePercent: 17 },
        { label: "Jobs and small business", sharePercent: 15 },
        { label: "Healthcare access", sharePercent: 12 },
        { label: "Other / mixed", sharePercent: 13 },
      ],
      categoriesInUse: baseCategories(),
      pipelineMovement: basePipeline(),
      narrativeGaps: [
        {
          title: "Rural post office and services closures",
          detail: "Volunteers report the frame shows up in conversations but official talking points are thin.",
          priority: "medium",
        },
        {
          title: "County clerk hours and ID help",
          detail: "High question volume; needs a short, cite-friendly script volunteers can repeat.",
          priority: "high",
        },
        {
          title: "Youth turnout — constructive tone",
          detail: "Skeptical audiences need listening-first scripts before asks.",
          priority: "medium",
        },
      ],
      fieldMessageOfWeek: {
        headline: "Lead with listening, then connect to a shared local stake",
        script:
          "“I’m checking in — what’s the civic issue on your mind lately? … Thanks for saying that. A lot of neighbors here care about [schools / small business / ballot access]. If you’re open, I can share how we’re organizing locally without pressure.”",
        categoryKey: "listening_conversation",
        categoryLabel: CATEGORY_LABEL.listening_conversation,
      },
      followUpNeeds: [
        { theme: "Return call / text within 48h", openCount: 128, note: "Aggregate open follow-ups in preview ledger." },
        { theme: "Schedule second touch (in-person)", openCount: 56, note: "County captains — batch by turf." },
        { theme: "Confirm event RSVP + day-of details", openCount: 34, note: "Event invites in the last window." },
      ],
    };
  }

  if (scope.level === "region") {
    const place = scope.regionDisplayName;
    return {
      scopeLabel: place,
      windowLabel,
      themes: [
        { label: `Regional growth and infrastructure (${place})`, sharePercent: 22 },
        { label: "Water, broadband, and county services", sharePercent: 20 },
        { label: "School boards and local elections", sharePercent: 18 },
        { label: "Trust and turnout mechanics", sharePercent: 16 },
        { label: "Volunteer capacity and burnout", sharePercent: 14 },
        { label: "Other / mixed", sharePercent: 10 },
      ],
      categoriesInUse: baseCategories(),
      pipelineMovement: basePipeline().map((p, i) => ({
        ...p,
        deltaPercentPoints: p.deltaPercentPoints + (i === 0 ? 0.4 : 0),
        conversationDelta: p.conversationDelta + (i === 0 ? 6 : 2),
      })),
      narrativeGaps: [
        {
          title: `${place} — cross-county comparison questions`,
          detail: "Neighbors ask how their county compares; keep answers factual and aggregate-only in public settings.",
          priority: "medium",
        },
        {
          title: "Primary vs general messaging discipline",
          detail: "Preview logs show category drift — reinforce approved category tags in workbench.",
          priority: "high",
        },
      ],
      fieldMessageOfWeek: {
        headline: "Name the region, then ground the stake in a public fact",
        script:
          `“Across ${place}, I keep hearing worries about [services / schools / turnout]. I’m not here to debate you — I’m organizing neighbors who want fair access. Can I leave you a one-pager or follow up after you think about it?”`,
        categoryKey: "county_organizing",
        categoryLabel: CATEGORY_LABEL.county_organizing,
      },
      followUpNeeds: [
        { theme: "Captain callbacks (multi-county)", openCount: 41, note: "Rollup — no individual names on public view." },
        { theme: "Event hosts — logistics checklist", openCount: 17, note: "Preview queue depth." },
      ],
    };
  }

  const county = scope.countyDisplayName;
  const reg = scope.regionDisplayName ?? "your region";
  return {
    scopeLabel: county,
    windowLabel,
    themes: [
      { label: "Downtown vs rural split (services)", sharePercent: 21 },
      { label: "College and young voter engagement", sharePercent: 18 },
      { label: "Church and civic club networks", sharePercent: 17 },
      { label: "Election rules — plain language", sharePercent: 16 },
      { label: "Candidate recruitment curiosity", sharePercent: 14 },
      { label: "Other / mixed", sharePercent: 14 },
    ],
    categoriesInUse: [
      { label: CATEGORY_LABEL.listening_conversation, useSharePercent: 31 },
      { label: CATEGORY_LABEL.follow_up, useSharePercent: 21 },
      { label: CATEGORY_LABEL.county_organizing, useSharePercent: 19 },
      { label: CATEGORY_LABEL.power_of_5_onboarding, useSharePercent: 16 },
      { label: CATEGORY_LABEL.volunteer_recruitment, useSharePercent: 8 },
      { label: CATEGORY_LABEL.event_invite, useSharePercent: 5 },
    ],
    pipelineMovement: basePipeline().map((p) => ({
      ...p,
      deltaPercentPoints: p.deltaPercentPoints + 0.2,
      conversationDelta: Math.max(4, Math.round(p.conversationDelta * 0.35)),
      windowNote: `${p.windowNote} · ${county}`,
    })),
    narrativeGaps: [
      {
        title: `${county} — city vs unincorporated framing`,
        detail: "Conversations mix municipal and county issues; separate scripts reduce confusion.",
        priority: "high",
      },
      {
        title: "Relational follow-up cadence",
        detail: "Preview shows follow-up category rising — protect leader bandwidth with weekly caps.",
        priority: "medium",
      },
    ],
    fieldMessageOfWeek: {
      headline: "Tie the Secretary of State race to a neighbor-sized problem",
      script:
        `“In ${county}, the part of this race that hits everyday life is [registration help / early voting access / transparent results]. I’m practicing a two-minute version — want to hear it, or should I check back?”`,
      categoryKey: "county_organizing",
      categoryLabel: CATEGORY_LABEL.county_organizing,
    },
    followUpNeeds: [
      { theme: "Same-week follow-up (county queue)", openCount: 23, note: `Rolls up to ${reg} when live sync ships.` },
      { theme: "Power Team rosters — incomplete invites", openCount: 11, note: "Preview depth only." },
    ],
  };
}
