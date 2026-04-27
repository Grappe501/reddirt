/**
 * Message engine — **typed feedback loop** (pure functions, no I/O).
 *
 * Use events + outcomes to summarize usage, suggest category emphasis shifts, and
 * map touches to Power pipeline hints. Safe for demos and server aggregation;
 * **do not** attach voter ids or raw PII to `metadata`.
 *
 * @see docs/MESSAGE_ENGINE_FEEDBACK_LOOP_REPORT.md
 */

import type { PowerPipelineId } from "@/lib/power-of-5/types";
import { getMessageTemplateById } from "./templates";
import type {
  ConversationOutcome,
  MessageCategory,
  MessageFeedback,
  MessageResponseBucket,
  MessageUseEvent,
  MessageUseEventKind,
} from "./types";
import { CONVERSATION_OUTCOMES, MESSAGE_CATEGORIES } from "./types";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type CreateMessageUseEventInput = {
  kind: MessageUseEventKind;
  templateId: string;
  channel?: MessageUseEvent["channel"];
  /** ISO 8601; defaults to `new Date().toISOString()` when omitted. */
  occurredAt?: string;
  metadata?: Record<string, string | number | boolean | null>;
};

export type CreateMessageUseEventResult =
  | { ok: true; event: MessageUseEvent }
  | { ok: false; error: string };

export type MessageFeedbackSummary = {
  total: number;
  byResponseBucket: Record<MessageResponseBucket, number>;
  byOutcome: Partial<Record<ConversationOutcome, number>>;
  /** Distinct template ids appearing in feedback. */
  templateIdsTouched: string[];
  /** Aggregate-safe coaching lines (no person-level shaming). */
  coachingNotes: string[];
};

export type CategoryMovementSummary = {
  /** Net weight by category after processing feedback (not normalized probabilities). */
  deltas: Record<MessageCategory, number>;
  /** Human-readable lines for dashboards or trainer view. */
  narrative: string[];
};

export type FollowUpNeed = {
  templateId: string;
  outcome: ConversationOutcome;
  priority: "high" | "medium" | "low";
  reason: string;
};

export type PipelineMomentum = "advance" | "maintain" | "cool" | "park";

export type PipelineMovementHint = {
  pipelineId: PowerPipelineId;
  momentum: PipelineMomentum;
  /** 0–1 signal strength for sorting / UI emphasis */
  strength: number;
};

export type ConversationPipelineMovement = {
  hints: PipelineMovementHint[];
  headline: string;
  /** Message categories to surface next in UI (deterministic ordering). */
  suggestedCategories: MessageCategory[];
};

// ---------------------------------------------------------------------------
// Guards
// ---------------------------------------------------------------------------

const USE_EVENT_KINDS: readonly MessageUseEventKind[] = [
  "template_selected",
  "template_copied",
  "template_sent_preview",
];

const SENSITIVE_METADATA_KEY = /email|e164|phone|address|street|ssn|password|token|secret|voter|pii/i;

function isIsoLike(s: string): boolean {
  return !Number.isNaN(Date.parse(s));
}

function isValidTemplateId(id: string): boolean {
  const t = id.trim();
  if (t.length === 0 || t.length > 160) return false;
  return /^[a-zA-Z0-9_.-]+$/.test(t);
}

export function isConversationOutcome(value: string): value is ConversationOutcome {
  return (CONVERSATION_OUTCOMES as readonly string[]).includes(value);
}

// ---------------------------------------------------------------------------
// Factories
// ---------------------------------------------------------------------------

/**
 * Build a validated {@link MessageUseEvent}. Rejects unsafe metadata keys and oversized payloads.
 */
export function createMessageUseEvent(input: CreateMessageUseEventInput): CreateMessageUseEventResult {
  if (!USE_EVENT_KINDS.includes(input.kind)) {
    return { ok: false, error: "Invalid message use event kind." };
  }
  if (!isValidTemplateId(input.templateId)) {
    return { ok: false, error: "Invalid template id (empty, too long, or disallowed characters)." };
  }

  const occurredAt =
    input.occurredAt != null && input.occurredAt.trim() !== ""
      ? input.occurredAt.trim()
      : new Date().toISOString();
  if (!isIsoLike(occurredAt)) {
    return { ok: false, error: "occurredAt must be a parseable ISO 8601 datetime." };
  }

  let metadata: MessageUseEvent["metadata"] | undefined;
  if (input.metadata && Object.keys(input.metadata).length > 0) {
    const entries = Object.entries(input.metadata).slice(0, 24);
    const cleaned: Record<string, string | number | boolean | null> = {};
    for (const [k, v] of entries) {
      const key = k.trim().slice(0, 64);
      if (!key || SENSITIVE_METADATA_KEY.test(key)) continue;
      if (typeof v === "string" && v.length > 400) cleaned[key] = `${v.slice(0, 397)}...`;
      else cleaned[key] = v;
    }
    metadata = Object.keys(cleaned).length > 0 ? cleaned : undefined;
  }

  return {
    ok: true,
    event: {
      kind: input.kind,
      templateId: input.templateId.trim(),
      channel: input.channel,
      occurredAt,
      metadata,
    },
  };
}

// ---------------------------------------------------------------------------
// Summaries
// ---------------------------------------------------------------------------

const EMPTY_BUCKETS: Record<MessageResponseBucket, number> = {
  positive: 0,
  mixed: 0,
  negative: 0,
  unknown: 0,
};

/**
 * Aggregate {@link MessageFeedback} rows into bucket counts and coaching notes.
 */
export function summarizeMessageFeedback(feedback: readonly MessageFeedback[]): MessageFeedbackSummary {
  const byResponseBucket: Record<MessageResponseBucket, number> = { ...EMPTY_BUCKETS };
  const byOutcome: Partial<Record<ConversationOutcome, number>> = {};
  const templates = new Set<string>();

  for (const row of feedback) {
    byResponseBucket[row.responseBucket] += 1;
    templates.add(row.templateId);
    if (row.conversationOutcome) {
      byOutcome[row.conversationOutcome] = (byOutcome[row.conversationOutcome] ?? 0) + 1;
    }
  }

  const coachingNotes: string[] = [];
  const total = feedback.length;
  if (total === 0) {
    coachingNotes.push("No feedback rows yet — log outcomes after conversations to tighten recommendations.");
  } else {
    const fu = (byOutcome.needs_follow_up ?? 0) + (byOutcome.wants_event ?? 0) + (byOutcome.wants_volunteer ?? 0);
    if (fu > 0) {
      coachingNotes.push(`${fu} touch(es) need routing to follow-up, events, or volunteer onboarding.`);
    }
    if ((byOutcome.opposed ?? 0) > 0) {
      coachingNotes.push("Some touches landed as opposed — review listening prompts and local bridge language in those geographies.");
    }
    if ((byResponseBucket.mixed ?? 0) > total * 0.4 && total >= 3) {
      coachingNotes.push("High share of mixed reactions — consider shorter openers and more listening prompts.");
    }
    if ((byOutcome.listened ?? 0) > 0 && (byOutcome.interested ?? 0) === 0 && total >= 3) {
      coachingNotes.push("People are listening but not shifting to interest — add a gentle next-step ask or event anchor.");
    }
  }

  return {
    total,
    byResponseBucket,
    byOutcome,
    templateIdsTouched: [...templates].sort(),
    coachingNotes,
  };
}

// Outcome → weight on the template’s own category (and cross-category nudges below)
const OUTCOME_TEMPLATE_WEIGHT: Record<ConversationOutcome, number> = {
  listened: 0.25,
  interested: 0.65,
  needs_follow_up: 0.45,
  wants_event: 0.55,
  wants_volunteer: 0.6,
  wants_petition: 0.55,
  wants_candidate_info: 0.55,
  not_now: -0.15,
  opposed: -0.85,
  unknown: 0,
};

/** Extra weight routed to specific categories (organizing ladder alignment). */
const OUTCOME_CATEGORY_BOOST: Partial<Record<ConversationOutcome, Partial<Record<MessageCategory, number>>>> = {
  needs_follow_up: { follow_up: 0.35, listening_conversation: 0.1 },
  wants_event: { event_invite: 0.45 },
  wants_volunteer: { volunteer_recruitment: 0.5, power_of_5_onboarding: 0.15 },
  wants_petition: { petition_ask: 0.55 },
  wants_candidate_info: { candidate_recruitment_ask: 0.5 },
  listened: { listening_conversation: 0.2 },
  interested: { county_organizing: 0.1 },
  not_now: { follow_up: 0.15 },
  opposed: { listening_conversation: 0.05 },
  unknown: {},
};

function zeroCategoryRecord(): Record<MessageCategory, number> {
  return MESSAGE_CATEGORIES.reduce(
    (acc, c) => {
      acc[c] = 0;
      return acc;
    },
    {} as Record<MessageCategory, number>,
  );
}

/**
 * Derive implied **category emphasis** shifts from feedback (template category + outcome).
 * Deterministic; not a trained model.
 */
export function calculateMessageCategoryMovement(feedback: readonly MessageFeedback[]): CategoryMovementSummary {
  const deltas = zeroCategoryRecord();

  for (const row of feedback) {
    const template = getMessageTemplateById(row.templateId);
    const oc = row.conversationOutcome ?? "unknown";
    const base = OUTCOME_TEMPLATE_WEIGHT[oc] ?? 0;

    if (template) {
      deltas[template.category] += base;
      if (row.responseBucket === "negative") deltas[template.category] -= 0.25;
      if (row.responseBucket === "positive" && oc !== "opposed") deltas[template.category] += 0.1;
    }

    const boost = OUTCOME_CATEGORY_BOOST[oc];
    if (boost) {
      for (const cat of MESSAGE_CATEGORIES) {
        const b = boost[cat];
        if (b) deltas[cat] += b;
      }
    }
  }

  const narrative: string[] = [];
  const ranked = MESSAGE_CATEGORIES.map((c) => ({ c, v: deltas[c] }))
    .filter((x) => x.v > 0.001)
    .sort((a, b) => b.v - a.v)
    .slice(0, 4);
  if (ranked.length === 0) {
    narrative.push("No strong category tilt from feedback yet.");
  } else {
    narrative.push(`Emphasize next: ${ranked.map((x) => x.c.replace(/_/g, " ")).join(", ")}.`);
  }

  return { deltas, narrative };
}

// ---------------------------------------------------------------------------
// Follow-up queue (logical — not persisted here)
// ---------------------------------------------------------------------------

const FOLLOW_UP_OUTCOMES_HIGH: readonly ConversationOutcome[] = [
  "needs_follow_up",
  "wants_event",
  "wants_volunteer",
  "wants_petition",
  "wants_candidate_info",
];

/**
 * Select feedback rows that imply **operator or volunteer follow-up** (safe, aggregate-first).
 */
export function getFollowUpNeeds(feedback: readonly MessageFeedback[]): FollowUpNeed[] {
  const out: FollowUpNeed[] = [];

  for (const row of feedback) {
    const oc = row.conversationOutcome ?? "unknown";

    if (FOLLOW_UP_OUTCOMES_HIGH.includes(oc)) {
      out.push({
        templateId: row.templateId,
        outcome: oc,
        priority: "high",
        reason: "Explicit ask or follow-up intent — route to workbench / tasks when persistence is enabled.",
      });
      continue;
    }

    if (oc === "interested" && row.responseBucket !== "negative") {
      out.push({
        templateId: row.templateId,
        outcome: oc,
        priority: "medium",
        reason: "Interest without a specific ask — offer event or volunteer ladder.",
      });
      continue;
    }

    if (oc === "not_now") {
      out.push({
        templateId: row.templateId,
        outcome: oc,
        priority: "low",
        reason: "Defer and schedule a respectful check-in.",
      });
      continue;
    }

    if (oc === "unknown" && row.responseBucket === "mixed") {
      out.push({
        templateId: row.templateId,
        outcome: oc,
        priority: "medium",
        reason: "Mixed signal — one clarifying listening pass before another ask.",
      });
    }
  }

  return out;
}

// ---------------------------------------------------------------------------
// Pipeline mapping (Power pipeline ids — types layer only)
// ---------------------------------------------------------------------------

function hint(
  pipelineId: PowerPipelineId,
  momentum: PipelineMomentum,
  strength: number,
): PipelineMovementHint {
  return { pipelineId, momentum, strength: Math.min(1, Math.max(0, strength)) };
}

/**
 * Map a single **conversation outcome** to Power pipeline hints and next categories.
 */
export function mapConversationOutcomeToPipelineMovement(outcome: ConversationOutcome): ConversationPipelineMovement {
  const hints: PipelineMovementHint[] = [];
  let headline = "";
  const categories = new Set<MessageCategory>();

  switch (outcome) {
    case "listened":
      hints.push(hint("conversation", "advance", 0.45), hint("invite", "maintain", 0.35));
      headline = "Conversation opened; keep the circle warm with a soft invite or story.";
      categories.add("listening_conversation");
      categories.add("power_of_5_onboarding");
      break;
    case "interested":
      hints.push(hint("activation", "advance", 0.55), hint("invite", "advance", 0.4));
      headline = "Interest signal — move toward activation or a concrete next step.";
      categories.add("county_organizing");
      categories.add("volunteer_recruitment");
      break;
    case "needs_follow_up":
      hints.push(hint("followup", "advance", 0.85));
      headline = "Follow-up is the bottleneck — close the loop before adding new names.";
      categories.add("follow_up");
      categories.add("listening_conversation");
      break;
    case "wants_event":
      hints.push(hint("event", "advance", 0.8), hint("followup", "advance", 0.35));
      headline = "Event pathway — anchor with time/place and a light confirmation touch.";
      categories.add("event_invite");
      break;
    case "wants_volunteer":
      hints.push(hint("volunteer", "advance", 0.85), hint("activation", "advance", 0.4));
      headline = "Volunteer intent — use onboarding and role clarity before overload.";
      categories.add("volunteer_recruitment");
      categories.add("power_of_5_onboarding");
      break;
    case "wants_petition":
      hints.push(hint("petition", "advance", 0.8), hint("followup", "maintain", 0.25));
      headline = "Petition / signature path — keep compliance-forward language.";
      categories.add("petition_ask");
      break;
    case "wants_candidate_info":
      hints.push(hint("candidate", "advance", 0.75));
      headline = "Leadership curiosity — share candidate info, not opposition research.";
      categories.add("candidate_recruitment_ask");
      break;
    case "not_now":
      hints.push(hint("followup", "park", 0.5), hint("invite", "cool", 0.35));
      headline = "Park respectfully; schedule a later check-in rather than pushing.";
      categories.add("follow_up");
      categories.add("listening_conversation");
      break;
    case "opposed":
      hints.push(hint("conversation", "cool", 0.5), hint("invite", "cool", 0.6));
      headline = "Exit gracefully; protect relationships and avoid argument loops.";
      categories.add("listening_conversation");
      break;
    case "unknown":
      hints.push(hint("conversation", "maintain", 0.25));
      headline = "Outcome unclear — prefer one listening question before the next ask.";
      categories.add("listening_conversation");
      break;
  }

  const suggestedCategories = MESSAGE_CATEGORIES.filter((c) => categories.has(c));

  return {
    hints,
    headline,
    suggestedCategories,
  };
}
