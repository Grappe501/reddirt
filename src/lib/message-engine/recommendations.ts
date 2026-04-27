/**
 * Deterministic Message Recommendation Engine — registry + rule scoring only.
 * No network, no database, no probabilistic models. Safe copy from `templates.ts` only.
 *
 * @see docs/MESSAGE_RECOMMENDATION_ENGINE_REPORT.md
 */

import type {
  MessageAudience,
  MessageContext,
  MessageEngineVisibilityTier,
  MessagePatternKind,
  MessageRecommendationEngineResult,
  MessageTemplate,
  RecommendedMessage,
  RelationshipType,
} from "./types";
import { MESSAGE_TEMPLATE_REGISTRY } from "./templates";

// ---------------------------------------------------------------------------
// Geography (ordinal granularity; deterministic compatibility)
// ---------------------------------------------------------------------------

const GEO_RANK: Record<MessageTemplate["geographyScope"], number> = {
  state: 0,
  region: 1,
  county: 2,
  city: 3,
  precinct: 4,
};

/** Slop so county-scoped scripts still appear with state-only context (generic county fill). */
const GEO_SLOP = 2;

export function inferFinestGeographyRank(context: MessageContext): number {
  let finest = -1;
  const a = context.geographyAttachment;

  if (a?.precinct) finest = Math.max(finest, GEO_RANK.precinct);
  if (a?.city) finest = Math.max(finest, GEO_RANK.city);
  if (a?.county) finest = Math.max(finest, GEO_RANK.county);
  if (a?.region) finest = Math.max(finest, GEO_RANK.region);
  if (a?.state) finest = Math.max(finest, GEO_RANK.state);

  if (context.countyDisplayName) finest = Math.max(finest, GEO_RANK.county);
  if (context.cityDisplayName) finest = Math.max(finest, GEO_RANK.city);
  if (context.regionDisplayName) finest = Math.max(finest, GEO_RANK.region);
  if (context.stateDisplayName) finest = Math.max(finest, GEO_RANK.state);

  if (context.geographyScope != null) {
    finest = Math.max(finest, GEO_RANK[context.geographyScope]);
  }
  return finest;
}

/**
 * Drops templates whose geographic grain is likely too tight for the anchors you supplied.
 * Sparse context (no place fields) passes everything — ranking and fallbacks handle ordering.
 * Operates on the full template registry for a stable public API.
 */
export function filterTemplatesByGeography(context: MessageContext): MessageTemplate[] {
  return applyGeographyFilter(MESSAGE_TEMPLATE_REGISTRY, context);
}

function applyGeographyFilter(
  templates: readonly MessageTemplate[],
  context: MessageContext,
): MessageTemplate[] {
  const finest = inferFinestGeographyRank(context);
  if (finest < 0) return [...templates];

  return templates.filter((t) => {
    if (t.geographyScope === "state") return true;
    const need = GEO_RANK[t.geographyScope];
    return finest >= Math.max(0, need - GEO_SLOP);
  });
}

// ---------------------------------------------------------------------------
// Audience (compatibility table — not propensity scoring)
// ---------------------------------------------------------------------------

const TEMPLATE_AUDIENCE_OK: Record<MessageAudience, readonly MessageAudience[]> = {
  supporter: ["supporter", "volunteer_prospect", "donor_prospect", "persuadable"],
  persuadable: ["persuadable", "skeptical", "disengaged", "supporter"],
  skeptical: ["skeptical", "persuadable", "disengaged"],
  disengaged: ["disengaged", "persuadable", "volunteer_prospect"],
  civic_leader: ["civic_leader", "candidate_prospect", "supporter", "volunteer_prospect", "persuadable"],
  volunteer_prospect: ["volunteer_prospect", "supporter", "disengaged", "persuadable"],
  donor_prospect: ["donor_prospect", "supporter"],
  candidate_prospect: ["candidate_prospect", "civic_leader", "volunteer_prospect"],
};

export function filterTemplatesByAudience(context: MessageContext): MessageTemplate[] {
  return applyAudienceFilter(MESSAGE_TEMPLATE_REGISTRY, context);
}

function applyAudienceFilter(
  templates: readonly MessageTemplate[],
  context: MessageContext,
): MessageTemplate[] {
  if (!context.audience) return [...templates];
  const allowed = TEMPLATE_AUDIENCE_OK[context.audience];
  return templates.filter((t) => allowed.includes(t.primaryAudience));
}

// ---------------------------------------------------------------------------
// Relationship
// ---------------------------------------------------------------------------

export function filterTemplatesByRelationship(context: MessageContext): MessageTemplate[] {
  return applyRelationshipFilter(MESSAGE_TEMPLATE_REGISTRY, context);
}

function applyRelationshipFilter(
  templates: readonly MessageTemplate[],
  context: MessageContext,
): MessageTemplate[] {
  if (!context.relationship) return [...templates];
  return templates.filter((t) => {
    if (!t.relationshipHints?.length) return true;
    return t.relationshipHints.includes(context.relationship as RelationshipType);
  });
}

// ---------------------------------------------------------------------------
// Category
// ---------------------------------------------------------------------------

export function filterTemplatesByCategory(context: MessageContext): MessageTemplate[] {
  return applyCategoryFilter(MESSAGE_TEMPLATE_REGISTRY, context);
}

function applyCategoryFilter(
  templates: readonly MessageTemplate[],
  context: MessageContext,
): MessageTemplate[] {
  if (!context.preferredCategory) return [...templates];
  return templates.filter((t) => t.category === context.preferredCategory);
}

// ---------------------------------------------------------------------------
// Safety tier
// ---------------------------------------------------------------------------

function visibilityTier(context: MessageContext): MessageEngineVisibilityTier {
  return context.visibilityTier ?? "public_volunteer";
}

function applyVisibilityTierFilter(
  templates: readonly MessageTemplate[],
  context: MessageContext,
): MessageTemplate[] {
  const tier = visibilityTier(context);
  if (tier === "leader") {
    return templates.filter(
      (t) => t.safetyLevel !== "finance_review_required" && t.safetyLevel !== "staff_only",
    );
  }
  return templates.filter((t) => t.safetyLevel === "public_volunteer");
}

// ---------------------------------------------------------------------------
// Scoring + ranking
// ---------------------------------------------------------------------------

const NEXT_BY_PATTERN: Partial<Record<MessagePatternKind, string[]>> = {
  conversation_starter: [
    "Choose one concrete local hook for the slot, then offer two time options.",
    "Confirm they know they can decline without friction.",
  ],
  bridge_statement: [
    "Pair with a listening question before asking for commitment.",
    "Keep county or value language aligned with approved talking points.",
  ],
  volunteer_ask: [
    "Name the ask, date, and time commitment clearly; accept a soft no.",
    "If they pass, ask once for a referral — not a chain of asks.",
  ],
  listening_prompt: [
    "Listen more than you talk; thank them for specifics.",
    "Note follow-up only if they invite it.",
  ],
  follow_up: [
    "Reference what they shared without quoting private details in group settings.",
    "Offer one next step, or a time-bound check-in.",
  ],
  event_invite: [
    "Send the approved RSVP path; offer rides or accessibility help if your program allows.",
    "Confirm date, time, and place from the official event listing.",
  ],
  petition_ask: [
    "Verify deadline and mechanics with the compliance packet before sending.",
    "Keep screenshots or links only from approved sources.",
  ],
  gotv_ask: [
    "Point to official election sites for hours, ID, and polling changes — never invent rules.",
    "Have staff review this script if law or dates shifted.",
  ],
  donor_ask: [],
  candidate_recruitment_ask: [
    "Keep the thread private; no public pressure.",
    "Offer a confidential next contact, not an on-the-spot decision.",
  ],
  objection_response: ["Stay humble; offer an opt-out.", "Do not argue point-by-point in text if emotions run hot — move to voice or in person when safe."],
  local_story: [],
};

const FALLBACK_TEMPLATE_IDS: readonly string[] = [
  "mce.listening.two_way_open.v1",
  "mce.p5_onboarding.circle_invite.v1",
  "mce.county_organizing.local_stake.v1",
];

function nextActionsForTemplate(t: MessageTemplate): string[] {
  const slotLine =
    t.slots.length > 0
      ? [`Replace each placeholder (${t.slots.map((s) => `{{${s.key}}}`).join(", ")}) with approved wording.`]
      : [];
  const patternLine = NEXT_BY_PATTERN[t.patternKind] ?? [
    "Re-read once for tone, then send when it still feels like you.",
  ];
  return [...slotLine, ...patternLine, "Log the touch where your team tracks relational work (when policy allows)."];
}

function scoreTemplate(
  t: MessageTemplate,
  context: MessageContext,
): { score: number; reasons: string[] } {
  let score = 0;
  const reasons: string[] = [];

  if (context.audience) {
    const ok = TEMPLATE_AUDIENCE_OK[context.audience];
    if (ok.includes(t.primaryAudience)) {
      score += 20;
      reasons.push("Audience posture matches the compatibility map for your selected supporter type.");
    }
  }

  if (context.relationship && t.relationshipHints?.includes(context.relationship)) {
    score += 16;
    reasons.push("Relationship hint on the template matches the relationship you selected.");
  }

  if (context.tone && t.defaultTone === context.tone) {
    score += 10;
    reasons.push("Template default tone matches your tone pick.");
  }

  if (context.preferredCategory && t.category === context.preferredCategory) {
    score += 24;
    reasons.push("Template category matches your preferred mission category.");
  }

  const finest = inferFinestGeographyRank(context);
  const need = GEO_RANK[t.geographyScope];
  if (finest < 0) {
    score += 4;
    reasons.push("Place context is light; this template still works with generic, approved fills.");
  } else if (finest + GEO_SLOP >= need) {
    score += 12;
    reasons.push("Geographic grain of the template fits the place detail available.");
  }

  if (t.category === "power_of_5_onboarding") {
    score += 6;
    reasons.push("Tagged for Power of 5 onboarding flows.");
  }

  if (reasons.length === 0) {
    reasons.push("Baseline safe template from the public registry (no strong contextual match).");
    score += 1;
  }

  return { score, reasons };
}

function toRecommendedMessage(t: MessageTemplate, context: MessageContext): RecommendedMessage {
  const { score, reasons } = scoreTemplate(t, context);
  const rationale =
    reasons[0] ??
    "Included as a vetted script from the message registry with conservative, volunteer-safe language.";
  return {
    templateId: t.id,
    title: t.title,
    rationale,
    reasons,
    nextActions: nextActionsForTemplate(t),
    score,
  };
}

/**
 * Stable sort on visibility-filtered registry: higher score first, then lexicographic template id.
 */
export function rankMessageTemplates(context: MessageContext): MessageTemplate[] {
  const base = applyVisibilityTierFilter(MESSAGE_TEMPLATE_REGISTRY, context);
  return rankTemplatesWithin(base, context);
}

function rankTemplatesWithin(
  templates: readonly MessageTemplate[],
  context: MessageContext,
): MessageTemplate[] {
  const scored = templates.map((t) => ({ t, ...scoreTemplate(t, context) }));
  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.t.id.localeCompare(b.t.id);
  });
  return scored.map((s) => s.t);
}

// ---------------------------------------------------------------------------
// Mission packs
// ---------------------------------------------------------------------------

const CONVERSATION_STARTER_KINDS = new Set<MessagePatternKind>([
  "conversation_starter",
  "listening_prompt",
  "bridge_statement",
]);

export function getConversationStarterSet(context: MessageContext): RecommendedMessage[] {
  const base = applyVisibilityTierFilter(MESSAGE_TEMPLATE_REGISTRY, context);
  const narrowed = base.filter((t) => CONVERSATION_STARTER_KINDS.has(t.patternKind));
  const ranked = rankTemplatesWithin(
    applyCategoryFilter(
      applyRelationshipFilter(applyAudienceFilter(applyGeographyFilter(narrowed, context), context), context),
      context,
    ),
    context,
  );
  return ranked.map((t) => toRecommendedMessage(t, context));
}

export function getFollowUpSet(context: MessageContext): RecommendedMessage[] {
  const base = applyVisibilityTierFilter(MESSAGE_TEMPLATE_REGISTRY, context);
  const narrowed = base.filter((t) => t.patternKind === "follow_up" || t.category === "follow_up");
  const ranked = rankTemplatesWithin(
    applyCategoryFilter(
      applyRelationshipFilter(applyAudienceFilter(applyGeographyFilter(narrowed, context), context), context),
      context,
    ),
    context,
  );
  return ranked.map((t) => toRecommendedMessage(t, context));
}

export function getPowerOf5OnboardingMessages(context: MessageContext): RecommendedMessage[] {
  const base = applyVisibilityTierFilter(MESSAGE_TEMPLATE_REGISTRY, context);
  const narrowed = base.filter(
    (t) =>
      t.category === "power_of_5_onboarding" ||
      (t.tags?.includes("power_of_5") ?? false) ||
      t.relatedPipelines?.includes("invite") ||
      t.relatedPipelines?.includes("activation"),
  );
  const ranked = rankTemplatesWithin(
    applyRelationshipFilter(applyAudienceFilter(applyGeographyFilter(narrowed, context), context), context),
    context,
  );
  return ranked.map((t) => toRecommendedMessage(t, context));
}

// ---------------------------------------------------------------------------
// Primary API
// ---------------------------------------------------------------------------

function globalNextActions(recs: RecommendedMessage[], context: MessageContext): string[] {
  const ids = new Set(recs.map((r) => r.templateId));
  const out: string[] = [
    "Swap in approved names, links, and deadlines from your compliance packet before sending.",
    "Prefer voice or in-person for sensitive asks when you can.",
  ];
  if (
    MESSAGE_TEMPLATE_REGISTRY.some(
      (t) => ids.has(t.id) && t.safetyLevel === "election_law_review_required",
    )
  ) {
    out.push("Have staff review election-law-sensitive scripts against the current official rules.");
  }
  if (inferFinestGeographyRank(context) < 0) {
    out.push("Add at least a state or county label when you can — it tightens place-based scripts.");
  }
  if (!context.audience) {
    out.push("Pick an audience posture when you know it; recommendations narrow automatically.");
  }
  return out;
}

function sparseFallbackNotes(context: MessageContext): string[] {
  const notes: string[] = [];
  if (inferFinestGeographyRank(context) < 0) {
    notes.push("Place context was sparse; geography filter stayed inclusive and copy may use generic fills.");
  }
  if (!context.audience) {
    notes.push("Audience not set; broader compatibility rules were used.");
  }
  if (!context.relationship) {
    notes.push("Relationship not set; relationship filter did not narrow hints-only templates.");
  }
  return notes;
}

function buildFromTemplates(templates: MessageTemplate[], context: MessageContext): RecommendedMessage[] {
  const ranked = rankTemplatesWithin(templates, context);
  return ranked.map((t) => toRecommendedMessage(t, context));
}

/**
 * Full pipeline: visibility → geography → audience → relationship → optional category → rank.
 * If filters eliminate everything, falls back to a short ordered list of universal-safe scripts.
 */
export function getMessageRecommendations(context: MessageContext): MessageRecommendationEngineResult {
  const fallbacksUsed = sparseFallbackNotes(context);

  let working = applyVisibilityTierFilter(MESSAGE_TEMPLATE_REGISTRY, context);
  working = applyGeographyFilter(working, context);
  working = applyAudienceFilter(working, context);
  working = applyRelationshipFilter(working, context);
  working = applyCategoryFilter(working, context);

  if (working.length === 0) {
    fallbacksUsed.push("Filters removed all templates; restored a minimal universal-safe ordered set.");
    const byId = new Map(MESSAGE_TEMPLATE_REGISTRY.map((t) => [t.id, t]));
    const restored: MessageTemplate[] = [];
    for (const id of FALLBACK_TEMPLATE_IDS) {
      const t = byId.get(id);
      if (t && applyVisibilityTierFilter([t], context).length > 0) restored.push(t);
    }
    working = restored.length > 0 ? restored : applyVisibilityTierFilter(MESSAGE_TEMPLATE_REGISTRY, context);
  }

  const recommendations = buildFromTemplates(working, context);
  return {
    recommendations,
    fallbacksUsed,
    nextActions: globalNextActions(recommendations, context),
  };
}

/**
 * Quick sanity checks for CI or local `tsx` — throws on failure.
 */
export function assertMessageRecommendationEngineInvariants(): void {
  const empty = getMessageRecommendations({});
  if (empty.recommendations.length === 0) {
    throw new Error("Expected non-empty recommendations for empty context");
  }

  const p5 = getPowerOf5OnboardingMessages({});
  if (!p5.some((r) => r.templateId === "mce.p5_onboarding.circle_invite.v1")) {
    throw new Error("Expected Power of 5 circle invite in onboarding pack");
  }

  const starters = getConversationStarterSet({});
  if (!starters.length) throw new Error("Expected conversation starters");

  const geo = applyGeographyFilter(MESSAGE_TEMPLATE_REGISTRY, {});
  if (geo.length !== MESSAGE_TEMPLATE_REGISTRY.length) {
    throw new Error("Sparse context should not drop templates in geography filter");
  }
}
