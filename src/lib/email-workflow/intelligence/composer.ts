import type { EmailWorkflowInterpretationContext } from "./context";
import type { EmailWorkflowContextFragment } from "./types";
import type { EmailWorkflowComposedSummary, EmailWorkflowInterpretationSignals } from "./types";

function pickWho(ctx: EmailWorkflowInterpretationContext, fragments: EmailWorkflowContextFragment[]): string | undefined {
  if (ctx.user) {
    const n = ctx.user.name?.trim();
    return [n, ctx.user.email].filter(Boolean).join(" · ");
  }
  if (ctx.thread?.primaryEmail) {
    return ctx.thread.primaryPhone
      ? `${ctx.thread.primaryEmail} · ${ctx.thread.primaryPhone}`
      : ctx.thread.primaryEmail;
  }
  const vol = fragments.find((f) => f.sourceKind === "VOLUNTEER_PROFILE");
  if (vol?.lines.length) return vol.lines[0]!.slice(0, 200);
  return undefined;
}

function pickWhat(fragments: EmailWorkflowContextFragment[]): string | undefined {
  const msg = fragments.find((f) => f.sourceKind === "COMMUNICATION_MESSAGE");
  if (msg?.lines.length) {
    return msg.lines.slice(0, 3).join(" · ");
  }
  const th = fragments.find((f) => f.sourceKind === "COMMUNICATION_THREAD");
  if (th?.lines[0]) return th.lines[0]!.slice(0, 400);
  const opp = fragments.find((f) => f.sourceKind === "CONVERSATION_OPPORTUNITY");
  if (opp?.lines.length) return opp.lines[0]!.slice(0, 400);
  const task = fragments.find((f) => f.sourceKind === "CAMPAIGN_TASK");
  if (task) return [task.label, task.lines[0]].filter(Boolean).join(" — ").slice(0, 400);
  const base = fragments.find((f) => f.sourceKind === "EMAIL_WORKFLOW_BASE");
  if (base?.lines.length) return base.lines.filter(Boolean).join(" · ").slice(0, 400);
  return undefined;
}

function pickWhen(fragments: EmailWorkflowContextFragment[], ctx: EmailWorkflowInterpretationContext): string | undefined {
  const times = fragments
    .map((f) => f.occurredAt)
    .filter((d): d is Date => d != null);
  if (ctx.occurredAt) {
    return `Occurred: ${ctx.occurredAt.toISOString()}`;
  }
  if (times.length) {
    const latest = times.reduce((a, b) => (a > b ? a : b));
    return `Latest activity: ${latest.toISOString()}`;
  }
  return undefined;
}

function pickWhere(fragments: EmailWorkflowContextFragment[], ctx: EmailWorkflowInterpretationContext): string | undefined {
  const parts: string[] = [];
  if (ctx.plan) parts.push(`Comms plan: ${ctx.plan.title}`);
  if (ctx.send) parts.push(`Send ${ctx.send.status} (${ctx.send.channel})`);
  if (ctx.thread) parts.push("Comms workbench thread");
  if (ctx.workflowIntake) parts.push("Workflow intake");
  if (ctx.conversationOpportunity) parts.push("Conversation opportunity");
  if (ctx.socialContentItem) parts.push("Social workbench item");
  if (ctx.comsPlanAudienceSegment) parts.push(`Segment: ${ctx.comsPlanAudienceSegment.name}`);
  if (parts.length) return parts.join(" · ");
  const seg = fragments.find((f) => f.sourceKind === "COMMS_PLAN_AUDIENCE_SEGMENT");
  if (seg) return `Segment: ${seg.label}`;
  return undefined;
}

function pickWhy(fragments: EmailWorkflowContextFragment[], ctx: EmailWorkflowInterpretationContext): string | undefined {
  if (ctx.queueReason?.trim()) return ctx.queueReason.trim();
  const int = fragments.find((f) => f.sourceKind === "WORKFLOW_INTAKE");
  if (int) return int.lines.join(" · ").slice(0, 400);
  return undefined;
}

/**
 * Build concise operator lines; may leave fields undefined (writeback will skip empty).
 */
export function composeEmailWorkflowSummaries(
  fragments: EmailWorkflowContextFragment[],
  ctx: EmailWorkflowInterpretationContext,
  signals: EmailWorkflowInterpretationSignals
): EmailWorkflowComposedSummary {
  const who = pickWho(ctx, fragments);
  const what = pickWhat(fragments);
  const when = pickWhen(fragments, ctx);
  const where = pickWhere(fragments, ctx);
  const why = pickWhy(fragments, ctx);

  const k = String(signals.intent ?? "UNKNOWN");
  const impact = ctx.plan
    ? `Touches plan “${ctx.plan.title}” (${ctx.plan.status}). Heuristic intent: ${k}.`
    : `Heuristic intent: ${k} — triage in queue (no plan linked on item).`;

  const rec: string | undefined = ctx.thread?.aiNextBestAction?.trim() || undefined;
  const rat = [
    "Deterministic E-2A pass over linked fragments; not AI-generated.",
    signals.escalationLevel && `Escalation hint: ${signals.escalationLevel}.`,
  ]
    .filter(Boolean)
    .join(" ");

  return {
    whoSummary: who,
    whatSummary: what,
    whenSummary: when,
    whereSummary: where,
    whySummary: why,
    impactSummary: impact,
    recommendedResponseSummary: rec,
    recommendedResponseRationale: rat,
  };
}
