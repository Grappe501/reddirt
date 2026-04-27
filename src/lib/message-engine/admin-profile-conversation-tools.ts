/**
 * Builds staff-only “Conversation Tools” payloads from the deterministic registry.
 * Does not call models or read the database. Callers supply already-permissioned summaries.
 *
 * @see docs/MESSAGE_CONTENT_ENGINE_SYSTEM_PLAN.md
 */

import type { MessageContext } from "./types";
import { getConversationStarterSet, getFollowUpSet, getMessageRecommendations } from "./recommendations";
import { getMessageTemplateById, MESSAGE_STARTER_FOLLOW_UP_PROMPTS } from "./templates";

export type AdminProfileConversationSnippet = {
  title: string;
  body: string;
};

export type AdminProfileConversationToolsPayload = {
  relationshipContext: string;
  suggestedOpener: AdminProfileConversationSnippet;
  listeningPrompt: AdminProfileConversationSnippet;
  followUpPrompt: AdminProfileConversationSnippet;
  pipelineNextStep: string;
  privacyLabel: string;
  registryFallbackNotes: string[];
};

const LISTENING_TEMPLATE_ID = "mce.listening.two_way_open.v1";

function pickSuggestedOpener(ctx: MessageContext): AdminProfileConversationSnippet {
  const starters = getConversationStarterSet(ctx);
  const withTemplate = starters.map((s) => ({ s, t: getMessageTemplateById(s.templateId) }));
  const conversationFirst = withTemplate.find((x) => x.t?.patternKind === "conversation_starter");
  const pick = conversationFirst ?? withTemplate[0];
  if (!pick?.t) {
    return {
      title: pick?.s.title ?? "Conversation starter",
      body: pick?.s.rationale ?? "Use a vetted script from the message registry.",
    };
  }
  return { title: pick.t.title, body: pick.t.body };
}

function pickListeningPrompt(ctx: MessageContext): AdminProfileConversationSnippet {
  const direct = getMessageTemplateById(LISTENING_TEMPLATE_ID);
  if (direct && direct.patternKind === "listening_prompt") {
    return { title: direct.title, body: direct.body };
  }
  const starters = getConversationStarterSet(ctx);
  const listening = starters.find((s) => getMessageTemplateById(s.templateId)?.patternKind === "listening_prompt");
  const t = listening ? getMessageTemplateById(listening.templateId) : undefined;
  if (t) return { title: t.title, body: t.body };
  return {
    title: "Listening prompt",
    body: "Lead with a genuine question and leave room for them to correct you. Pause more than you think you need to.",
  };
}

function pickFollowUpPrompt(ctx: MessageContext): AdminProfileConversationSnippet {
  const followRecs = getFollowUpSet(ctx);
  const first = followRecs[0];
  const tpl = first ? getMessageTemplateById(first.templateId) : undefined;
  if (tpl) {
    return { title: tpl.title, body: tpl.body };
  }
  const p = MESSAGE_STARTER_FOLLOW_UP_PROMPTS[0];
  if (p) return { title: p.title, body: p.prompt };
  return { title: "Follow-up", body: "Thank them, restate one thing you heard, and offer a single low-pressure next step." };
}

function buildPrivacyLabel(surface: "relational_contact" | "voter_model"): string {
  const base =
    "Staff-only. These lines come from the approved message registry — they are starting points, not personalized dossier language. " +
    "Do not treat classifications, signals, or file diagnostics as facts to repeat in outreach. Respect consent, local policy, and data-handling SOP.";
  if (surface === "voter_model") {
    return (
      base +
      " This page includes voter-file fields for operations; keep file keys and precinct detail out of volunteer-facing copy unless policy explicitly allows."
    );
  }
  return base + " Phone, email, and notes on this page are sensitive — share only on need-to-know channels.";
}

/**
 * @param relationshipContext — Plain-language summary built by caller from REL-2 / geography only (no model scores).
 * @param pipelineSummary — Human pipeline / follow-up line from organizing status (not voter propensity).
 */
export function buildAdminProfileConversationToolsPayload(
  context: MessageContext,
  input: {
    surface: "relational_contact" | "voter_model";
    relationshipContext: string;
    pipelineSummary: string;
  },
): AdminProfileConversationToolsPayload {
  const ctx: MessageContext = {
    ...context,
    visibilityTier: "leader",
    stateDisplayName: context.stateDisplayName ?? "Arkansas",
  };

  const recMeta = getMessageRecommendations(ctx);
  const engineNext = recMeta.nextActions[0] ?? "";
  const pipelineNextStep = [input.pipelineSummary.trim(), engineNext ? `Coaching note: ${engineNext}` : ""]
    .filter(Boolean)
    .join(" ");

  return {
    relationshipContext: input.relationshipContext.trim(),
    suggestedOpener: pickSuggestedOpener(ctx),
    listeningPrompt: pickListeningPrompt(ctx),
    followUpPrompt: pickFollowUpPrompt(ctx),
    pipelineNextStep: pipelineNextStep || "Log the touch after outreach and set a dated follow-up when you have clear consent.",
    privacyLabel: buildPrivacyLabel(input.surface),
    registryFallbackNotes: recMeta.fallbacksUsed,
  };
}
