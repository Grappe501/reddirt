import type {
  ConversationSuggestedTone,
  EmailWorkflowEscalationLevel,
  EmailWorkflowIntent,
  EmailWorkflowSpamDisposition,
  EmailWorkflowTone,
} from "@prisma/client";
import {
  EmailWorkflowIntent as EIntent,
  EmailWorkflowTone as ETone,
  EmailWorkflowEscalationLevel as EEsc,
  EmailWorkflowSpamDisposition as ESpam,
} from "@prisma/client";
import type { EmailWorkflowInterpretationContext } from "./context";
import type { EmailWorkflowContextFragment, EmailWorkflowInterpretationSignals } from "./types";

const UNsubscribe = /\b(unsubscribe|opt out|remove me|stop emailing)\b/i;
const SPAM = /\b(spam|scam|phishing|viagra|winner you've been selected)\b/i;
const COMPLAINT = /\b(complain|lawsuit|sue|attorney|harass|disgust|furious|unacceptable)\b/i;
const MEDIA = /\b(press|journalist|reporter|interview|editor|newspaper|tv station|coverage)\b/i;
const VOL = /\b(volunteer|canvass|phone bank|yard sign|knock|sign up to help)\b/i;
const SUPPORT = /\b(help|how do i|what time|where is|question about|not received)\b/i;
const HOSTILE = /\b(hate|idiot|corrupt|criminal|pathetic|threat|violence|kill)\b/i;

function joinText(fragments: EmailWorkflowContextFragment[], ctx: EmailWorkflowInterpretationContext): string {
  const base = [
    ctx.title,
    ctx.queueReason,
    ...fragments.flatMap((f) => f.lines),
  ]
    .filter(Boolean)
    .join("\n");
  return base;
}

/**
 * Map thread AI summary to sentiment string only (existing stable field on EmailWorkflowItem).
 */
function sentimentFromContext(ctx: EmailWorkflowInterpretationContext): string | undefined {
  const t = ctx.thread;
  if (t?.aiThreadSummary?.trim()) {
    return "thread_ai_summary_available";
  }
  return undefined;
}

/**
 * Map conversation opportunity suggested tone to EmailWorkflowTone when unambiguous; else undefined.
 */
function toneFromOpportunity(
  ctx: EmailWorkflowInterpretationContext
): EmailWorkflowTone | undefined {
  const s = ctx.conversationOpportunity?.suggestedTone;
  if (s == null) return undefined;
  const m: Partial<Record<ConversationSuggestedTone, EmailWorkflowTone>> = {
    FACTUAL: ETone.NEUTRAL,
    EMPATHETIC: ETone.SUPPORTIVE,
    CALM: ETone.NEUTRAL,
    FIRM: ETone.FRUSTRATED,
    CELEBRATORY: ETone.SUPPORTIVE,
  };
  return m[s];
}

/**
 * Deterministic, conservative heuristics over fragments + item (no network, no model).
 */
export function runEmailWorkflowHeuristics(
  fragments: EmailWorkflowContextFragment[],
  ctx: EmailWorkflowInterpretationContext
): EmailWorkflowInterpretationSignals {
  const text = joinText(fragments, ctx).toLowerCase();
  const out: EmailWorkflowInterpretationSignals = {};

  const sent = sentimentFromContext(ctx);
  if (sent) out.sentiment = sent;

  const fromOpp = toneFromOpportunity(ctx);
  if (fromOpp) out.tone = fromOpp;

  if (UNsubscribe.test(text)) {
    out.intent = EIntent.UNSUBSCRIBE;
    out.spamDisposition = ESpam.SUSPECTED_SPAM;
    out.spamScore = Math.max(out.spamScore ?? 0, 0.25);
  } else if (SPAM.test(text)) {
    out.intent = EIntent.SPAM;
    out.spamDisposition = ESpam.SUSPECTED_SPAM;
    out.spamScore = Math.max(out.spamScore ?? 0, 0.4);
  } else if (MEDIA.test(text)) {
    out.intent = EIntent.MEDIA_INQUIRY;
  } else if (VOL.test(text)) {
    out.intent = EIntent.VOLUNTEER_INTEREST;
  } else if (COMPLAINT.test(text) || HOSTILE.test(text)) {
    out.intent = EIntent.COMPLAINT;
  } else if (SUPPORT.test(text)) {
    out.intent = EIntent.SUPPORT;
  } else {
    out.intent = EIntent.UNKNOWN;
  }

  if (HOSTILE.test(text) && !out.tone) {
    out.tone = ETone.HOSTILE;
  }
  if (!out.tone) {
    if (out.intent === EIntent.SUPPORT) out.tone = ETone.SUPPORTIVE;
    else if (out.intent === EIntent.UNKNOWN) out.tone = ETone.CURIOUS;
    else out.tone = ETone.NEUTRAL;
  }

  let esc: EmailWorkflowEscalationLevel = EEsc.NONE;
  if (/\b(urgent|asap|immediately|legal|lawsuit|sue|attorney)\b/i.test(text)) {
    esc = EEsc.MEDIUM;
  }
  if (COMPLAINT.test(text) && out.intent === EIntent.COMPLAINT) {
    esc = esc === EEsc.NONE ? EEsc.LOW : esc;
  }
  if (/\b(threat|violence|kill|harm)\b/i.test(text)) {
    esc = EEsc.HIGH;
  }
  out.escalationLevel = esc;

  out.needsDeescalation = Boolean(
    (HOSTILE.test(text) || (out.tone && out.tone === ETone.FRUSTRATED)) && out.intent === EIntent.COMPLAINT
  );

  if (!out.spamDisposition) {
    if (out.intent === EIntent.SPAM) {
      out.spamDisposition = ESpam.SUSPECTED_SPAM;
      out.spamScore = out.spamScore ?? 0.5;
    } else {
      out.spamDisposition = ESpam.CLEAN;
      out.spamScore = out.spamScore ?? 0.05;
    }
  }

  if (out.spamDisposition === ESpam.SUSPECTED_SPAM && (out.spamScore == null || out.spamScore < 0.15)) {
    out.spamScore = 0.2;
  }

  return out;
}
