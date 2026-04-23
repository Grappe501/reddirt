import type { EmailWorkflowInterpretationContext } from "./context";
import type { EmailWorkflowContextFragment, EmailWorkflowFragmentSourceKind } from "./types";

function lines(...parts: (string | null | undefined)[]): string[] {
  return parts
    .map((p) => (p == null ? null : String(p).trim()))
    .filter((p): p is string => Boolean(p && p.length > 0));
}

export function fragmentFromEmailWorkflowBase(ctx: EmailWorkflowInterpretationContext): EmailWorkflowContextFragment {
  return {
    sourceKind: "EMAIL_WORKFLOW_BASE",
    sourceId: ctx.id,
    label: ctx.title?.trim() || "Queue item",
    occurredAt: ctx.occurredAt,
    lines: lines(ctx.title, ctx.queueReason, ctx.sourceType && `Source: ${ctx.sourceType}`),
    tags: [ctx.status, ctx.sourceType, ctx.triggerType].filter(Boolean) as string[],
  };
}

export function fragmentFromCommunicationThread(
  ctx: EmailWorkflowInterpretationContext
): EmailWorkflowContextFragment | null {
  const t = ctx.thread;
  if (!t) return null;
  const lab = t.primaryEmail || t.primaryPhone || t.id;
  return {
    sourceKind: "COMMUNICATION_THREAD",
    sourceId: t.id,
    label: `Thread ${lab}`,
    occurredAt: t.lastMessageAt ?? t.lastInboundAt,
    lines: lines(
      t.aiThreadSummary ? `Thread summary: ${t.aiThreadSummary}` : null,
      t.aiNextBestAction ? `Suggested next step: ${t.aiNextBestAction}` : null,
      t.primaryEmail && `Email: ${t.primaryPhone ? `${t.primaryEmail} / ${t.primaryPhone}` : t.primaryEmail}`,
      `Status: ${t.threadStatus}`
    ),
    tags: ["thread", t.threadStatus],
  };
}

export function fragmentFromWorkflowIntake(
  ctx: EmailWorkflowInterpretationContext
): EmailWorkflowContextFragment | null {
  const w = ctx.workflowIntake;
  if (!w) return null;
  return {
    sourceKind: "WORKFLOW_INTAKE",
    sourceId: w.id,
    label: w.title?.trim() || "Workflow intake",
    occurredAt: w.createdAt,
    lines: lines(
      w.title,
      w.source && `Intake source: ${w.source}`,
      `Intake status: ${w.status}`
    ),
  };
}

export function fragmentFromCampaignTask(
  ctx: EmailWorkflowInterpretationContext
): EmailWorkflowContextFragment | null {
  const t = ctx.campaignTask;
  if (!t) return null;
  return {
    sourceKind: "CAMPAIGN_TASK",
    sourceId: t.id,
    label: t.title,
    occurredAt: t.dueAt,
    lines: lines(
      t.title,
      t.description?.slice(0, 500) ?? null,
      `Task status: ${t.status} · priority: ${t.priority}`
    ),
    tags: [t.status, t.taskType].filter(Boolean) as string[],
  };
}

export function fragmentFromCommunicationMessage(
  ctx: EmailWorkflowInterpretationContext
): EmailWorkflowContextFragment | null {
  const m = ctx.communicationMessage;
  if (!m) return null;
  return {
    sourceKind: "COMMUNICATION_MESSAGE",
    sourceId: m.id,
    label: m.subject?.trim() || `Message ${m.id.slice(0, 8)}`,
    occurredAt: m.createdAt,
    lines: lines(
      m.subject && `Subject: ${m.subject}`,
      `Channel: ${m.channel} · ${m.direction}`,
      m.bodyTextPreview
        ? `Excerpt: ${m.bodyTextPreview.length > 400 ? `${m.bodyTextPreview.slice(0, 400)}…` : m.bodyTextPreview}`
        : null
    ),
    tags: [m.channel, m.direction].map(String),
  };
}

export function fragmentFromConversationOpportunity(
  ctx: EmailWorkflowInterpretationContext
): EmailWorkflowContextFragment | null {
  const o = ctx.conversationOpportunity;
  if (!o) return null;
  return {
    sourceKind: "CONVERSATION_OPPORTUNITY",
    sourceId: o.id,
    label: o.title,
    occurredAt: null,
    lines: lines(
      o.title,
      o.summary?.slice(0, 600) ?? null,
      `Opp status: ${o.status} · urgency: ${o.urgency} · suggested tone: ${o.suggestedTone}`,
      o.actionTemplate && `Action template: ${o.actionTemplate}`
    ),
  };
}

export function fragmentFromSocialContentItem(
  ctx: EmailWorkflowInterpretationContext
): EmailWorkflowContextFragment | null {
  const s = ctx.socialContentItem;
  if (!s) return null;
  return {
    sourceKind: "SOCIAL_CONTENT_ITEM",
    sourceId: s.id,
    label: s.title?.trim() || "Social work item",
    occurredAt: null,
    lines: lines(
      s.title,
      `Kind: ${s.kind} · status: ${s.status}`,
      s.messageToneMode && `Tone mode: ${s.messageToneMode}`,
      s.messageTacticMode && `Tactic: ${s.messageTacticMode}`
    ),
  };
}

export function fragmentFromUser(ctx: EmailWorkflowInterpretationContext): EmailWorkflowContextFragment | null {
  const u = ctx.user;
  if (!u) return null;
  const label = u.name?.trim() || u.email;
  return {
    sourceKind: "USER",
    sourceId: u.id,
    label: `Contact: ${label}`,
    occurredAt: null,
    lines: lines(u.name && `Name: ${u.name}`, `Email: ${u.email}`),
  };
}

export function fragmentFromVolunteerProfile(
  ctx: EmailWorkflowInterpretationContext
): EmailWorkflowContextFragment | null {
  const v = ctx.volunteerProfile;
  if (!v) return null;
  return {
    sourceKind: "VOLUNTEER_PROFILE",
    sourceId: v.id,
    label: "Volunteer profile",
    occurredAt: null,
    lines: lines(
      v.leadershipInterest ? "Leadership interest: yes" : null,
      v.skills?.slice(0, 300) ?? null,
      v.availability?.slice(0, 300) ?? null
    ),
    tags: v.leadershipInterest ? ["leadership"] : undefined,
  };
}

export function fragmentFromCommunicationPlan(
  ctx: EmailWorkflowInterpretationContext
): EmailWorkflowContextFragment | null {
  const p = ctx.plan;
  if (!p) return null;
  return {
    sourceKind: "COMMUNICATION_PLAN",
    sourceId: p.id,
    label: p.title,
    occurredAt: null,
    lines: lines(p.title, `Plan status: ${p.status}`, p.objective && `Objective: ${p.objective}`),
  };
}

export function fragmentFromCommunicationSend(
  ctx: EmailWorkflowInterpretationContext
): EmailWorkflowContextFragment | null {
  const s = ctx.send;
  if (!s) return null;
  return {
    sourceKind: "COMMUNICATION_SEND",
    sourceId: s.id,
    label: `Send ${s.id.slice(0, 8)}`,
    occurredAt: s.sentAt ?? s.scheduledAt ?? s.createdAt,
    lines: lines(
      `Channel: ${s.channel} · status: ${s.status}`,
      s.scheduledAt && `Scheduled: ${s.scheduledAt.toISOString()}`,
      s.sentAt && `Sent: ${s.sentAt.toISOString()}`
    ),
  };
}

export function fragmentFromCommsPlanAudienceSegment(
  ctx: EmailWorkflowInterpretationContext
): EmailWorkflowContextFragment | null {
  const s = ctx.comsPlanAudienceSegment;
  if (!s) return null;
  return {
    sourceKind: "COMMS_PLAN_AUDIENCE_SEGMENT",
    sourceId: s.id,
    label: s.name,
    occurredAt: null,
    lines: lines(`Segment: ${s.name}`),
  };
}

/** All fragments; order is stable and documented for provenance. */
export function buildEmailWorkflowContextFragments(
  ctx: EmailWorkflowInterpretationContext
): EmailWorkflowContextFragment[] {
  const out: EmailWorkflowContextFragment[] = [fragmentFromEmailWorkflowBase(ctx)];
  const add = (f: EmailWorkflowContextFragment | null) => {
    if (f) out.push(f);
  };
  add(fragmentFromUser(ctx));
  add(fragmentFromVolunteerProfile(ctx));
  add(fragmentFromCommunicationThread(ctx));
  add(fragmentFromCommunicationPlan(ctx));
  add(fragmentFromCommunicationSend(ctx));
  add(fragmentFromWorkflowIntake(ctx));
  add(fragmentFromCampaignTask(ctx));
  add(fragmentFromCommunicationMessage(ctx));
  add(fragmentFromConversationOpportunity(ctx));
  add(fragmentFromSocialContentItem(ctx));
  add(fragmentFromCommsPlanAudienceSegment(ctx));
  return out;
}

export function collectFragmentSourceKinds(fragments: EmailWorkflowContextFragment[]): EmailWorkflowFragmentSourceKind[] {
  return [...new Set(fragments.map((f) => f.sourceKind))];
}
