/**
 * Deterministic narrative distribution packet helpers — registry + rules only.
 * No network, database, sends, or PII. Bridges Message Content Engine templates to NDE assets.
 *
 * @see docs/NARRATIVE_PACKET_BUILDER_REPORT.md
 */

import type { ArkansasCampaignRegionSlug } from "@/lib/campaign-engine/regions/arkansas-campaign-regions";
import { getCampaignRegionBySlug } from "@/lib/campaign-engine/regions/arkansas-campaign-regions";
import {
  getMessageRecommendations,
  getMessageTemplateById,
  MESSAGE_TEMPLATE_REGISTRY,
} from "@/lib/message-engine";
import type {
  MessageCategory,
  MessageContext,
  MessagePatternKind,
  MessageTemplate,
} from "@/lib/message-engine";
import { POWER_OF_5_ORGANIZING_PIPELINES } from "@/lib/power-of-5/pipelines";
import { DEMO_MESSAGE_TO_NARRATIVE_BRIDGES, DEMO_NARRATIVE_ASSETS, DEMO_NARRATIVE_PACKETS } from "./assets";
import type {
  NarrativeAsset,
  NarrativeAssetKind,
  NarrativeChannel,
  NarrativeGeographyScope,
} from "./types";

// ---------------------------------------------------------------------------
// Packet shape (helper surface — not a persisted row)
// ---------------------------------------------------------------------------

export type NarrativeDistributionPacket = {
  /** Stable deterministic id for this helper output. */
  id: string;
  coreMessage: string;
  audience: MessageTemplate["primaryAudience"];
  channel: NarrativeChannel;
  copyAssets: NarrativeAsset[];
  assignmentSuggestion: string;
  timingSuggestion: string;
  kpiTarget: string;
  feedbackQuestion: string;
  geography: NarrativeGeographyScope;
  /** Optional trace to demo `NarrativePacket` when used. */
  sourceNarrativePacketId?: string;
  /** Top message template driving copy (when applicable). */
  primaryTemplateId?: string;
};

export type NarrativePacketBuildContext = MessageContext & {
  /** When set, overrides category-inferred primary channel. */
  primaryChannel?: NarrativeChannel;
};

// ---------------------------------------------------------------------------
// Slug hygiene (public-safe)
// ---------------------------------------------------------------------------

const COUNTY_SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const MAX_SLUG_LEN = 80;

function normalizeCountySlug(raw: string): string {
  return raw.trim().toLowerCase();
}

function isAllowedCountySlug(slug: string): boolean {
  return slug.length > 0 && slug.length <= MAX_SLUG_LEN && COUNTY_SLUG_RE.test(slug);
}

function titleCaseFromSlug(slug: string): string {
  const parts = slug.split("-").filter(Boolean);
  if (parts.length === 0) return "County";
  return parts.map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(" ");
}

function isCampaignRegionSlug(s: string): s is ArkansasCampaignRegionSlug {
  return getCampaignRegionBySlug(s as ArkansasCampaignRegionSlug) !== undefined;
}

// ---------------------------------------------------------------------------
// Deterministic lookup tables
// ---------------------------------------------------------------------------

const PRIMARY_CHANNEL_BY_CATEGORY: Record<MessageCategory, NarrativeChannel> = {
  power_of_5_onboarding: "power_of_5_network",
  county_organizing: "county_pages",
  volunteer_recruitment: "email",
  listening_conversation: "social",
  follow_up: "sms",
  event_invite: "local_events",
  petition_ask: "email",
  gotv_ask: "sms",
  candidate_recruitment_ask: "power_of_5_network",
};

const ASSIGNMENT_BY_PATTERN: Record<MessagePatternKind, string> = {
  conversation_starter: "Assign to a volunteer or county lead who already has trust in the turf; pair with a short listening check-in.",
  bridge_statement: "Assign to field staff or a county captain to localize approved stakes language before volunteer reuse.",
  local_story: "Assign to a storyteller or regional lead to collect one place-based anecdote for review.",
  follow_up: "Assign to the original conversationalist where possible; otherwise hand to turf owner with context notes (no PII in shared logs).",
  event_invite: "Assign to events coordinator for RSVP path verification, then to hosts for relational follow-through.",
  volunteer_ask: "Assign to volunteer coordinator with a clear shift roster and single point of contact.",
  donor_ask: "Assign to finance-cleared staff only; do not push to public volunteer tiers without sign-off.",
  petition_ask: "Assign to digital + field pair: one verifies mechanics/deadline, one runs relational amplification.",
  candidate_recruitment_ask: "Assign to a trusted leader with confidential-handling training; keep lists off public channels.",
  gotv_ask: "Assign to GOTV lead with current official election references; volunteers use only approved scripts.",
  objection_response: "Assign as coaching reference to trainers; not a blast template without localization.",
  listening_prompt: "Assign to listening-heavy organizers; emphasize note-taking for themes, not transcripts of individuals.",
};

const TIMING_BY_CATEGORY: Record<MessageCategory, string> = {
  power_of_5_onboarding: "Start within 3–5 days of onboarding; avoid holiday noise windows when possible.",
  county_organizing: "Anchor to a local news beat or county meeting cycle; ship when staff can monitor replies for 48 hours.",
  volunteer_recruitment: "Send Tuesday–Thursday early evening local time; keep the ask within a two-week signup window.",
  listening_conversation: "Prefer in-person or voice within a week of first touch; defer if major local crisis dominates attention.",
  follow_up: "Follow up within 3–7 days of the prior conversation unless they asked for more space.",
  event_invite: "Send first notice 10–14 days out; reminder 48 hours before RSVP deadline.",
  petition_ask: "Tie to a real deadline; final push 24–36 hours before close with compliance-verified copy only.",
  gotv_ask: "Phase: early vote window, mid-window nudge, final day plan — exact dates from the official calendar packet.",
  candidate_recruitment_ask: "One quiet touch; if no response in two weeks, park unless they re-engage.",
};

const KPI_BY_CATEGORY: Record<MessageCategory, string> = {
  power_of_5_onboarding:
    "Net new intentional invites logged (aggregate): target +1 quality invite per active volunteer per week (team defines “quality” in the playbook).",
  county_organizing:
    "County narrative engagement: +10% reply or follow-up rate vs prior baseline week on the same channel (aggregate only).",
  volunteer_recruitment: "Fill rate: ≥70% of published shift slots for the target window, or waitlist captured for overflow.",
  listening_conversation: "Thematic capture: at least five anonymized themes routed to editorial per two-week sprint (no raw PII).",
  follow_up: "Close-loop rate: ≥60% of flagged follow-ups completed within the SLA your team sets (e.g. 7 days).",
  event_invite: "RSVP conversion: track click-to-RSVP and show rate vs prior comparable event (aggregate).",
  petition_ask: "Valid participation count toward goal with ≤2% compliance flags on intake review (staff metric).",
  gotv_ask: "Vote plan confirmations: increase “plan locked” self-reports in approved tracking (aggregate).",
  candidate_recruitment_ask: "Confidential intros: count of vetted handoffs to staff pipeline, not public tallies.",
};

const FEEDBACK_BY_CATEGORY: Record<MessageCategory, string> = {
  power_of_5_onboarding:
    "After this touch, what single concern did people raise most often about joining a small circle (themes only)?",
  county_organizing: "Which local value landed best — access, integrity, or economy — and what phrasing felt off?",
  volunteer_recruitment: "Was the shift ask clear enough that someone could say yes or no in one sentence?",
  listening_conversation: "What worry showed up that we do not yet have approved language for?",
  follow_up: "Did they want another step, or did they signal closure — and how sure are you (high/medium/low)?",
  event_invite: "Did RSVP friction come from timing, location, or trust — pick one primary theme.",
  petition_ask: "Any confusion on mechanics or deadline that we should fix in the next draft?",
  gotv_ask: "Did they reference official sources comfortably, or do we need simpler pointers?",
  candidate_recruitment_ask: "Was confidentiality respected — any moment that felt like public pressure?",
};

function primaryChannelForTemplate(t: MessageTemplate, override?: NarrativeChannel): NarrativeChannel {
  if (override) return override;
  return PRIMARY_CHANNEL_BY_CATEGORY[t.category];
}

function geographyFromTemplate(t: MessageTemplate, regionKey?: string, countySlug?: string): NarrativeGeographyScope {
  const base: NarrativeGeographyScope = { scope: t.geographyScope, stateCode: "AR" };
  if (regionKey) return { ...base, scope: "region", regionKey };
  if (countySlug) return { ...base, scope: "county", countySlug };
  return base;
}

// ---------------------------------------------------------------------------
// Pattern → asset kind (deterministic)
// ---------------------------------------------------------------------------

const ASSET_KIND_BY_PATTERN: Record<MessagePatternKind, NarrativeAssetKind> = {
  conversation_starter: "volunteer_script",
  bridge_statement: "talking_points",
  local_story: "story_card",
  follow_up: "email_copy",
  event_invite: "event_script",
  volunteer_ask: "volunteer_script",
  donor_ask: "email_copy",
  petition_ask: "short_post",
  candidate_recruitment_ask: "volunteer_script",
  gotv_ask: "email_copy",
  objection_response: "talking_points",
  listening_prompt: "talking_points",
};

/** Maps every starter template to a synthetic narrative asset (deterministic ids). */
export function bridgeMessageTemplatesToNarrativeAssets(): NarrativeAsset[] {
  const out = MESSAGE_TEMPLATE_REGISTRY.map(messageTemplateToNarrativeAsset);
  return [...out].sort((a, b) => a.id.localeCompare(b.id));
}

function messageTemplateToNarrativeAsset(t: MessageTemplate): NarrativeAsset {
  const id = `nde.bridge.asset.${t.id.replace(/\./g, "_")}`;
  return {
    id,
    kind: ASSET_KIND_BY_PATTERN[t.patternKind],
    title: t.title,
    summary: t.summary,
    linkedMessageTemplateIds: [t.id],
    messageCategories: [t.category],
    geography: geographyFromTemplate(t),
    isDemoPlaceholder: true,
  };
}

function narrativeAssetsForTemplateId(templateId: string): NarrativeAsset[] {
  const fromDemo = DEMO_NARRATIVE_ASSETS.filter((a) => a.linkedMessageTemplateIds?.includes(templateId));
  if (fromDemo.length > 0) return [...fromDemo].sort((a, b) => a.id.localeCompare(b.id));
  const t = getMessageTemplateById(templateId);
  return t ? [messageTemplateToNarrativeAsset(t)] : [];
}

/**
 * Demo narrative assets tied to packets that list this channel (stable sort by asset id).
 */
export function getAssetsForChannel(channel: NarrativeChannel): NarrativeAsset[] {
  const packetIds = new Set(
    DEMO_NARRATIVE_PACKETS.filter((p) => p.channels.includes(channel)).map((p) => p.id),
  );
  const assetIds = new Set<string>();
  for (const p of DEMO_NARRATIVE_PACKETS) {
    if (!packetIds.has(p.id)) continue;
    for (const aid of p.assetIds) assetIds.add(aid);
  }
  const assets = DEMO_NARRATIVE_ASSETS.filter((a) => assetIds.has(a.id));
  return [...assets].sort((a, b) => a.id.localeCompare(b.id));
}

function distributionIdParts(prefix: string, parts: string[]): string {
  const safe = parts.map((p) => p.replace(/[^a-z0-9_-]+/gi, "_"));
  return `nde.distribution.${prefix}.${safe.join(".")}`;
}

/**
 * Build a single distribution packet from message context using the deterministic recommendation engine.
 */
export function buildNarrativePacket(context: NarrativePacketBuildContext): NarrativeDistributionPacket {
  const { recommendations, fallbacksUsed } = getMessageRecommendations(context);
  const top = recommendations[0];
  const t = top ? getMessageTemplateById(top.templateId) : undefined;
  const template =
    t ??
    getMessageTemplateById("mce.listening.two_way_open.v1") ??
    MESSAGE_TEMPLATE_REGISTRY[0];

  const channel = primaryChannelForTemplate(template, context.primaryChannel);
  const assets = narrativeAssetsForTemplateId(template.id);
  const geo = geographyFromTemplate(template);
  const coreMessage =
    template.summary +
    (fallbacksUsed.length ? ` (${fallbacksUsed[0]})` : "");

  return {
    id: distributionIdParts("context", [template.id, channel]),
    coreMessage,
    audience: template.primaryAudience,
    channel,
    copyAssets: assets,
    assignmentSuggestion: ASSIGNMENT_BY_PATTERN[template.patternKind],
    timingSuggestion: TIMING_BY_CATEGORY[template.category],
    kpiTarget: KPI_BY_CATEGORY[template.category],
    feedbackQuestion: FEEDBACK_BY_CATEGORY[template.category],
    geography: geo,
    primaryTemplateId: template.id,
  };
}

/**
 * County-scoped packet: uses demo Pope packet when slug is `pope`; otherwise county organizing template + synthetic assets.
 */
export function getCountyNarrativePacket(countySlug: string): NarrativeDistributionPacket {
  const slug = normalizeCountySlug(countySlug);
  if (!isAllowedCountySlug(slug)) {
    throw new Error(`Invalid county slug: ${countySlug}`);
  }

  const demoPacket = DEMO_NARRATIVE_PACKETS.find(
    (p) => p.geography.scope === "county" && p.geography.countySlug === slug,
  );
  if (demoPacket) {
    const assets = demoPacket.assetIds
      .map((id) => DEMO_NARRATIVE_ASSETS.find((a) => a.id === id))
      .filter((a): a is NarrativeAsset => a != null);
    const primaryTemplateId = assets[0]?.linkedMessageTemplateIds?.[0] ?? "mce.county_organizing.local_stake.v1";
    const t =
      getMessageTemplateById(primaryTemplateId) ??
      getMessageTemplateById("mce.county_organizing.local_stake.v1") ??
      MESSAGE_TEMPLATE_REGISTRY[0];
    const channel = demoPacket.channels[0] ?? primaryChannelForTemplate(t);

    return {
      id: distributionIdParts("county", [slug, demoPacket.id]),
      coreMessage: demoPacket.summary,
      audience: t.primaryAudience,
      channel,
      copyAssets: [...assets].sort((a, b) => a.id.localeCompare(b.id)),
      assignmentSuggestion: ASSIGNMENT_BY_PATTERN[t.patternKind],
      timingSuggestion: TIMING_BY_CATEGORY[t.category],
      kpiTarget: KPI_BY_CATEGORY[t.category],
      feedbackQuestion: FEEDBACK_BY_CATEGORY[t.category],
      geography: { scope: "county", stateCode: "AR", countySlug: slug },
      sourceNarrativePacketId: demoPacket.id,
      primaryTemplateId: t.id,
    };
  }

  const t =
    getMessageTemplateById("mce.county_organizing.local_stake.v1") ?? MESSAGE_TEMPLATE_REGISTRY[0];
  const display = titleCaseFromSlug(slug);
  const channel = PRIMARY_CHANNEL_BY_CATEGORY.county_organizing;
  const assets = narrativeAssetsForTemplateId(t.id);

  return {
    id: distributionIdParts("county", [slug, "generic"]),
    coreMessage: `${t.summary} (localized for ${display} County — fill slots with approved county language only.)`,
    audience: t.primaryAudience,
    channel,
    copyAssets: assets,
    assignmentSuggestion: ASSIGNMENT_BY_PATTERN[t.patternKind],
    timingSuggestion: TIMING_BY_CATEGORY.county_organizing,
    kpiTarget: KPI_BY_CATEGORY.county_organizing,
    feedbackQuestion: FEEDBACK_BY_CATEGORY.county_organizing,
    geography: { scope: "county", stateCode: "AR", countySlug: slug },
    primaryTemplateId: t.id,
  };
}

/**
 * Region-scoped packet: uses NWA demo when slug matches; otherwise listening template with region geography.
 */
export function getRegionNarrativePacket(regionSlug: string): NarrativeDistributionPacket {
  const key = regionSlug.trim().toLowerCase();
  const regionMeta = isCampaignRegionSlug(key) ? getCampaignRegionBySlug(key) : undefined;
  const displayName = regionMeta?.displayName ?? titleCaseFromSlug(key);

  const demoPacket = DEMO_NARRATIVE_PACKETS.find(
    (p) => p.geography.scope === "region" && p.geography.regionKey === key,
  );

  if (demoPacket) {
    const assets = demoPacket.assetIds
      .map((id) => DEMO_NARRATIVE_ASSETS.find((a) => a.id === id))
      .filter((a): a is NarrativeAsset => a != null);
    const primaryTemplateId = assets[0]?.linkedMessageTemplateIds?.[0] ?? "mce.listening.two_way_open.v1";
    const t =
      getMessageTemplateById(primaryTemplateId) ??
      getMessageTemplateById("mce.listening.two_way_open.v1") ??
      MESSAGE_TEMPLATE_REGISTRY[0];
    const channel = demoPacket.channels[0] ?? primaryChannelForTemplate(t);

    return {
      id: distributionIdParts("region", [key, demoPacket.id]),
      coreMessage: demoPacket.summary,
      audience: t.primaryAudience,
      channel,
      copyAssets: [...assets].sort((a, b) => a.id.localeCompare(b.id)),
      assignmentSuggestion: ASSIGNMENT_BY_PATTERN[t.patternKind],
      timingSuggestion: TIMING_BY_CATEGORY[t.category],
      kpiTarget: KPI_BY_CATEGORY[t.category],
      feedbackQuestion: FEEDBACK_BY_CATEGORY[t.category],
      geography: { scope: "region", stateCode: "AR", regionKey: key },
      sourceNarrativePacketId: demoPacket.id,
      primaryTemplateId: t.id,
    };
  }

  const t =
    getMessageTemplateById("mce.listening.two_way_open.v1") ?? MESSAGE_TEMPLATE_REGISTRY[0];
  const channel = PRIMARY_CHANNEL_BY_CATEGORY.listening_conversation;
  const assets = narrativeAssetsForTemplateId(t.id);

  return {
    id: distributionIdParts("region", [key, "generic"]),
    coreMessage: `${t.summary} (listening-first wave for ${displayName}; elevate local color through review.)`,
    audience: t.primaryAudience,
    channel,
    copyAssets: assets,
    assignmentSuggestion: ASSIGNMENT_BY_PATTERN[t.patternKind],
    timingSuggestion: TIMING_BY_CATEGORY.listening_conversation,
    kpiTarget: KPI_BY_CATEGORY.listening_conversation,
    feedbackQuestion: FEEDBACK_BY_CATEGORY.listening_conversation,
    geography: { scope: "region", stateCode: "AR", regionKey: key },
    primaryTemplateId: t.id,
  };
}

/**
 * Power of 5 launch packet: demo narrative packet + pipeline ladder copy (still no live metrics).
 */
export function getPowerOf5LaunchPacket(): NarrativeDistributionPacket {
  const demoPacket =
    DEMO_NARRATIVE_PACKETS.find((p) => p.id === "nde.demo.packet.power_of_5_launch") ??
    DEMO_NARRATIVE_PACKETS.find((p) => p.title.includes("Power of 5"));
  if (!demoPacket) {
    throw new Error("Missing Power of 5 demo narrative packet in registry");
  }

  const assets = demoPacket.assetIds
    .map((id) => DEMO_NARRATIVE_ASSETS.find((a) => a.id === id))
    .filter((a): a is NarrativeAsset => a != null);
  const primaryTemplateId = "mce.p5_onboarding.circle_invite.v1";
  const t = getMessageTemplateById(primaryTemplateId) ?? MESSAGE_TEMPLATE_REGISTRY[0];
  const channel = demoPacket.channels[0] ?? "power_of_5_network";

  const ladder = POWER_OF_5_ORGANIZING_PIPELINES.map((p) => `${p.order}. ${p.label}: ${p.summary}`).join(" ");

  return {
    id: distributionIdParts("p5_launch", [demoPacket.id]),
    coreMessage: `${demoPacket.summary} Ladder (reference): ${ladder}`,
    audience: t.primaryAudience,
    channel,
    copyAssets: [...assets].sort((a, b) => a.id.localeCompare(b.id)),
    assignmentSuggestion:
      "Assign circle leads to confirm consent-forward invites; staff QA on first-week scripts before scale.",
    timingSuggestion:
      "Launch wave: two-week sprint with mid-point office hours; pause paid amplification until organic reply patterns look healthy (aggregate).",
    kpiTarget:
      "Invite → activation: move +1 stage on the organizing ladder for at least one node per active team (aggregate dashboard tiles; no person-level grades).",
    feedbackQuestion:
      "Which stage of the ladder is stalling most often in your turf — invite, activation, or follow-up — and what blocker theme do you hear?",
    geography: demoPacket.geography,
    sourceNarrativePacketId: demoPacket.id,
    primaryTemplateId,
  };
}

/**
 * Dev guard: bridge ids unique; demo bridges reference known template + asset ids where applicable.
 */
export function assertNarrativePacketBuilderInvariants(): void {
  const bridged = bridgeMessageTemplatesToNarrativeAssets();
  const ids = new Set<string>();
  for (const a of bridged) {
    if (ids.has(a.id)) throw new Error(`Duplicate bridged narrative asset id: ${a.id}`);
    ids.add(a.id);
    if (!a.linkedMessageTemplateIds?.length) throw new Error(`Bridged asset missing template link: ${a.id}`);
  }

  for (const b of DEMO_MESSAGE_TO_NARRATIVE_BRIDGES) {
    if (!getMessageTemplateById(b.messageTemplateId)) {
      throw new Error(`Demo bridge references missing template: ${b.messageTemplateId}`);
    }
    if (!DEMO_NARRATIVE_ASSETS.some((a) => a.id === b.narrativeAssetId)) {
      throw new Error(`Demo bridge references missing asset: ${b.narrativeAssetId}`);
    }
  }

  const p = buildNarrativePacket({});
  if (!p.copyAssets.length) throw new Error("Expected copy assets for empty context packet");

  const county = getCountyNarrativePacket("pope");
  if (!county.sourceNarrativePacketId) throw new Error("Expected Pope county packet to trace demo packet");

  const region = getRegionNarrativePacket("northwest-arkansas");
  if (!region.sourceNarrativePacketId) throw new Error("Expected NWA region packet to trace demo packet");

  const p5 = getPowerOf5LaunchPacket();
  if (p5.primaryTemplateId !== "mce.p5_onboarding.circle_invite.v1") {
    throw new Error("Expected P5 launch packet to reference circle invite template");
  }

  const ch = getAssetsForChannel("email");
  if (!ch.length) throw new Error("Expected email channel to resolve demo assets");
}
