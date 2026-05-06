/**
 * EMAIL-AI-DRAFT-CRITIC-1.0 — deterministic red-team heuristics for Message Studio drafts.
 * OpenAI enrichment (optional) lives in `message-studio-draft-critic-ai.ts`; this module stays importable without API keys.
 * AI cannot approve, send, or auto-apply body rewrites — operators own edits.
 */

import type { MessageStudioLocalDraft } from "@/components/admin/email-command-center/message-studio-local-drafts";
import { buildCampaignVoicePromptExcerpt } from "@/lib/email-command-center/campaign-voice";

export const DRAFT_CRITIQUE_DIMENSION_IDS = [
  "clarity",
  "persuasion",
  "campaign_voice_fit",
  "factual_claim_risk",
  "unsupported_claim_risk",
  "tone_risk",
  "audience_mismatch",
  "cta_weakness",
  "compliance_issue",
  "fundraising_caution",
  "press_sensitivity",
  "length_readability",
  "subject_body_mismatch",
  "reply_confusion_risk",
] as const;

export type DraftCritiqueDimensionId = (typeof DRAFT_CRITIQUE_DIMENSION_IDS)[number];

export type DraftCritiqueDimensionScore = {
  /** 1 = poor / high concern, 5 = strong / low concern for risk dimensions; for factual_claim_risk low score = higher risk. */
  score: number;
  note: string;
};

export type DraftCritiqueScorecard = Record<DraftCritiqueDimensionId, DraftCritiqueDimensionScore>;

export type DraftCritiqueRedFlag = {
  code: string;
  severity: "low" | "medium" | "high";
  message: string;
};

export type DraftRevisionPlanStep = {
  title: string;
  detail: string;
  /** When true, step must not be executed as a factual rewrite without sources. */
  needsSource?: boolean;
};

export type DraftRevisionPlan = {
  version: 1;
  generatedAt: string;
  steps: DraftRevisionPlanStep[];
  summary: string;
};

export type DraftCritiqueResult = {
  version: 1;
  generatedAt: string;
  mode: "deterministic" | "deterministic_plus_openai";
  overallSummary: string;
  scorecard: DraftCritiqueScorecard;
  redFlags: DraftCritiqueRedFlag[];
  revisionPlan: DraftRevisionPlan;
};

function clip(s: string, max: number): string {
  const t = s.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max)}…`;
}

function score(n: number): number {
  return Math.max(1, Math.min(5, Math.round(n)));
}

function needsSourceCount(d: MessageStudioLocalDraft): number {
  return Object.values(d.editorialClaimSourceChecklist).filter((v) => v === "needs_source" || v === "remove").length;
}

function unmarkedCompliance(d: MessageStudioLocalDraft): number {
  return Object.entries(d.editorialComplianceChecklist).filter(([, v]) => !v).length;
}

function wordCount(s: string): number {
  return s.trim().split(/\s+/).filter(Boolean).length;
}

function avgSentenceLen(body: string): number {
  const parts = body.split(/[.!?]+/).map((x) => x.trim()).filter(Boolean);
  if (!parts.length) return 0;
  return parts.reduce((a, b) => a + wordCount(b), 0) / parts.length;
}

/** Conservative merge for red-team: take the worse (lower) score when AI provided a value. */
export function mergeCritiqueScorecards(
  deterministic: DraftCritiqueScorecard,
  aiPartial: Partial<Record<DraftCritiqueDimensionId, DraftCritiqueDimensionScore>> | null,
): DraftCritiqueScorecard {
  if (!aiPartial) return deterministic;
  const out = { ...deterministic };
  for (const id of DRAFT_CRITIQUE_DIMENSION_IDS) {
    const a = aiPartial[id];
    if (!a || typeof a.score !== "number") continue;
    const merged = Math.min(deterministic[id].score, score(a.score));
    out[id] = {
      score: merged,
      note: [deterministic[id].note, a.note].filter(Boolean).join(" · ").slice(0, 600),
    };
  }
  return out;
}

export function buildCritiqueOverallSummary(
  scorecard: DraftCritiqueScorecard,
  redFlags: DraftCritiqueRedFlag[],
  mode: DraftCritiqueResult["mode"],
): string {
  const now = new Date().toISOString();
  return clip(
    `${mode === "deterministic_plus_openai" ? "Deterministic + OpenAI red-team" : "Deterministic red-team"} pass (${now.slice(0, 10)}): ${redFlags.length} red flag(s); watch dimensions: ${[...DRAFT_CRITIQUE_DIMENSION_IDS]
      .map((id) => ({ id, s: scorecard[id].score }))
      .sort((a, b) => a.s - b.s)
      .slice(0, 5)
      .map((x) => `${x.id}=${x.s}`)
      .join(", ")}. Advisory only — AI cannot approve or send.`,
    720,
  );
}

export function buildRevisionPlanFromCritique(critique: DraftCritiqueResult): DraftRevisionPlan {
  const steps: DraftRevisionPlanStep[] = [];
  const sc = critique.scorecard;

  if (sc.clarity.score <= 2) {
    steps.push({
      title: "Clarity pass",
      detail: "Shorten sentences, add one clear preview line after greeting, and break walls of text.",
    });
  }
  if (sc.unsupported_claim_risk.score <= 2 || sc.factual_claim_risk.score <= 2) {
    steps.push({
      title: "Fact-check pass",
      detail:
        "Every statistic, legal outcome, opponent action, or named third party must either cite an approved source in editorial notes or be removed. Do not substitute invented citations.",
      needsSource: true,
    });
  }
  if (sc.cta_weakness.score <= 2) {
    steps.push({
      title: "CTA upgrade",
      detail: "State one primary action, deadline if any, and who it helps — avoid stacked competing asks.",
    });
  }
  if (sc.subject_body_mismatch.score <= 2) {
    steps.push({
      title: "Subject / body alignment",
      detail: "Rewrite subject or opening paragraph so the promise in the subject appears in the first 120 words.",
    });
  }
  if (sc.audience_mismatch.score <= 2) {
    steps.push({
      title: "Audience note",
      detail: "Add 1–2 sentences in audience note tying body promises to the selected audience frame and approved facts.",
      needsSource: true,
    });
  }
  if (sc.compliance_issue.score <= 2) {
    steps.push({
      title: "Compliance checklist",
      detail: "Resolve unchecked compliance rows or document why N/A with counsel before externalization.",
    });
  }
  if (sc.fundraising_caution.score <= 2) {
    steps.push({
      title: "Fundraising / finance posture",
      detail: "Matching-funds or urgency claims need finance + compliance review — soften or add explicit disclaimers.",
      needsSource: true,
    });
  }
  if (sc.press_sensitivity.score <= 2) {
    steps.push({
      title: "Press / rapid response posture",
      detail: "Route for comms director review; avoid speculative claims about opponents or ongoing matters.",
      needsSource: true,
    });
  }
  if (sc.tone_risk.score <= 2) {
    steps.push({
      title: "Tone calibration",
      detail: "Reduce ALL CAPS and stacked exclamation; align with selected tone profile examples.",
    });
  }
  if (sc.length_readability.score <= 2) {
    steps.push({
      title: "Length trim",
      detail: "Cut optional paragraphs; move detail to a linked doc or follow-up — keep email skimmable.",
    });
  }
  if (sc.reply_confusion_risk.score <= 2) {
    steps.push({
      title: "Reply clarity",
      detail: "Add explicit reply expectation (one question or one link) so correspondents are not guessing.",
    });
  }
  if (!steps.length) {
    steps.push({
      title: "Maintenance review",
      detail: "Scorecard is green enough for routine review — still run human editorial approval before send governance.",
    });
  }

  const now = new Date().toISOString();
  return {
    version: 1,
    generatedAt: now,
    steps: steps.slice(0, 14),
    summary: clip(
      `Plan derived from critic scorecard (${critique.redFlags.length} red flags). Steps marked "needs source" cannot be executed as factual rewrites without counsel-approved sources.`,
      400,
    ),
  };
}

export function buildDeterministicDraftCritique(draft: MessageStudioLocalDraft): DraftCritiqueResult {
  const now = new Date().toISOString();
  const subject = draft.subject.trim();
  const body = draft.body.trim();
  const pre = draft.preheader.trim();
  const cta = draft.primaryCta.trim();
  const audience = draft.audienceNote.trim();
  const wc = wordCount(body);
  const asl = avgSentenceLen(body);
  const voiceExcerpt = buildCampaignVoicePromptExcerpt(draft.campaignVoice).slice(0, 800);
  const ns = needsSourceCount(draft);
  const badCompliance = unmarkedCompliance(draft);

  const redFlags: DraftCritiqueRedFlag[] = [];

  const pushFlag = (code: string, severity: DraftCritiqueRedFlag["severity"], message: string) => {
    redFlags.push({ code, severity, message });
  };

  if (!subject) pushFlag("missing_subject", "high", "Subject line is empty — inbox placement and trust suffer.");
  if (!body) pushFlag("missing_body", "high", "Body is empty — nothing to review for send governance.");
  if (ns > 0) pushFlag("claim_source_gaps", "high", `${ns} editorial claim/source row(s) marked needs_source or remove.`);
  if (badCompliance > 0) pushFlag("compliance_incomplete", "medium", `${badCompliance} compliance checklist item(s) still unchecked.`);
  if (/\b\d{1,2}\/\d{1,2}\/\d{2,4}\b/.test(body) && ns > 0) {
    pushFlag("dates_without_sources", "medium", "Body contains date-like tokens while claim-source checklist is not clear — verify each date.");
  }
  if (/\b\d+%|\bpoll\b|\bsurvey says\b/i.test(body)) {
    pushFlag("stats_language", "high", "Percent or poll-style language detected — needs cited source or removal (needs source).");
  }
  if (/\b(guarantee|always wins|illegal|corrupt|scandal)\b/i.test(body + subject)) {
    pushFlag("strong_political_claim", "high", "High-certainty political/legal language — counsel review before externalization.");
  }
  if (/\b(donate|matching|double your|chip in)\b/i.test(body + subject)) {
    pushFlag("fundraising_language", "medium", "Fundraising / urgency language — finance + compliance path.");
  }
  if (/\bpress|journalist|media inquiry\b/i.test(draft.draftType + " " + body)) {
    pushFlag("press_surface", "medium", "Press-sensitive draft type or copy — comms director review.");
  }
  if (subject && body && !body.toLowerCase().includes(subject.toLowerCase().split(/\s+/).slice(0, 2).join(" ").slice(0, 40))) {
    pushFlag("subject_body_drift", "low", "Top of body may not reflect subject keywords — check alignment.");
  }

  const clarity = score(3 + (wc > 40 && wc < 450 ? 1 : 0) - (asl > 32 ? 1.5 : 0) - (!pre ? 0.3 : 0));
  const persuasion = score(3 + (cta.length > 12 ? 0.8 : -1) + (wc > 80 ? 0.3 : -0.5));
  const campaign_voice_fit = score(
    3 + (draft.tone && voiceExcerpt.toLowerCase().includes(draft.tone.toLowerCase().slice(0, 12)) ? 0.5 : -0.3),
  );
  const factual_claim_risk = score(5 - (/\b\d+%|\ball voters\b|\bproven\b/i.test(body + subject) ? 2.2 : 0) - (ns > 0 ? 1.2 : 0));
  const unsupported_claim_risk = score(5 - Math.min(3, ns * 0.9 + (badCompliance > 0 ? 0.8 : 0)));
  const tone_risk = score(5 - (/(!!|\bFREE\b|\bURGENT\b)/i.test(body + subject) ? 2 : 0) - (body === body.toUpperCase() && body.length > 40 ? 1.5 : 0));
  const audience_mismatch = score(3 + (audience.length > 40 ? 1 : -1) + (wc > 120 && audience.length < 20 ? -1 : 0));
  const cta_weakness = score(3 + (cta.length > 8 ? 1 : -1.5));
  const compliance_issue = score(5 - Math.min(3, badCompliance * 0.85));
  const fundraising_caution = score(/\b(donate|matching|double)\b/i.test(body + subject) ? 2.5 : 4.2);
  const press_sensitivity = score(/\bpress|journalist\b/i.test(draft.draftType + body) ? 2.8 : 4.2);
  const length_readability = score(4 - (wc > 700 ? 1.2 : 0) - (asl > 40 ? 0.8 : 0) + (wc < 30 && body.length > 0 ? -0.8 : 0));
  const subject_body_mismatch = score(subject && body && subject.toLowerCase().split(/\s+/).some((w) => w.length > 3 && body.toLowerCase().includes(w)) ? 4 : 2.5);
  const reply_confusion_risk = score(3.5 - (/\?\s*\?/.test(body) ? 0.5 : 0) - (/\b(maybe|perhaps|unclear)\b/i.test(body) ? 0.6 : 0));

  const scorecard: DraftCritiqueScorecard = {
    clarity: {
      score: clarity,
      note:
        asl > 32
          ? "Average sentence length is high — consider splitting for scanability."
          : wc < 40
            ? "Body is very short — ensure intent and CTA are still explicit."
            : "Structure looks workable — still verify transitions.",
    },
    persuasion: {
      score: persuasion,
      note: cta.length > 12 ? "Primary CTA present." : "Primary CTA is thin or missing — strengthen a single ask.",
    },
    campaign_voice_fit: {
      score: campaign_voice_fit,
      note: "Compared tone label against Campaign Voice excerpt — operator should still verify voice toggles used in generation.",
    },
    factual_claim_risk: {
      score: factual_claim_risk,
      note: "Heuristic scan for stats / certainty language vs claim checklist — not a fact-check service.",
    },
    unsupported_claim_risk: {
      score: unsupported_claim_risk,
      note:
        ns > 0
          ? "Editorial checklist shows lines needing sources — treat as blocking until cleared."
          : "No needs_source rows detected in checklist — still review body for new numbers.",
    },
    tone_risk: {
      score: tone_risk,
      note: "Scans for shouty patterns — does not detect sarcasm or dog-whistles.",
    },
    audience_mismatch: {
      score: audience_mismatch,
      note: audience ? "Audience note present." : "Audience note is thin while body is long — add framing for reviewers.",
    },
    cta_weakness: {
      score: cta_weakness,
      note: cta ? "CTA field populated." : "No CTA text — add one explicit action.",
    },
    compliance_issue: {
      score: compliance_issue,
      note: badCompliance ? "Compliance checklist incomplete." : "Compliance checklist appears satisfied.",
    },
    fundraising_caution: {
      score: fundraising_caution,
      note: "Fundraising-adjacent phrasing heuristics — not legal advice.",
    },
    press_sensitivity: {
      score: press_sensitivity,
      note: "Press / media posture from draft type + body keywords.",
    },
    length_readability: {
      score: length_readability,
      note: `Word count ~${wc}; avg sentence length heuristic ~${asl.toFixed(0)} words.`,
    },
    subject_body_mismatch: {
      score: subject_body_mismatch,
      note: "Keyword overlap heuristic between subject and body openings.",
    },
    reply_confusion_risk: {
      score: reply_confusion_risk,
      note: "Looks for hedging / stacked questions that may confuse replies.",
    },
  };

  const revisionPlan = buildRevisionPlanFromCritique({
    version: 1,
    generatedAt: now,
    mode: "deterministic",
    overallSummary: "",
    scorecard,
    redFlags,
    revisionPlan: { version: 1, generatedAt: now, steps: [], summary: "pending" },
  });

  const overallSummary = buildCritiqueOverallSummary(scorecard, redFlags, "deterministic");

  return {
    version: 1,
    generatedAt: now,
    mode: "deterministic",
    overallSummary,
    scorecard,
    redFlags,
    revisionPlan,
  };
}

/** Strip or shrink critique for JSON persistence (no secrets; bounded size). */
export function sanitizeCritiqueForMetadata(critique: DraftCritiqueResult): Record<string, unknown> {
  const o = {
    version: critique.version,
    generatedAt: critique.generatedAt,
    mode: critique.mode,
    overallSummary: clip(critique.overallSummary, 1200),
    scorecard: critique.scorecard,
    redFlags: critique.redFlags.slice(0, 40),
    revisionPlan: {
      ...critique.revisionPlan,
      steps: critique.revisionPlan.steps.slice(0, 20).map((s) => ({
        ...s,
        title: clip(s.title, 200),
        detail: clip(s.detail, 800),
      })),
      summary: clip(critique.revisionPlan.summary, 800),
    },
  };
  return o;
}

/** Serialize sanitized critique for `metadataJson.lastDraftCritiqueJson` / localStorage (bounded). */
export function serializeCritiqueForStorage(critique: DraftCritiqueResult, maxChars = 75000): string {
  const raw = JSON.stringify(sanitizeCritiqueForMetadata(critique));
  if (raw.length <= maxChars) return raw;
  const shrunk: DraftCritiqueResult = {
    ...critique,
    redFlags: critique.redFlags.slice(0, 15),
    revisionPlan: {
      ...critique.revisionPlan,
      steps: critique.revisionPlan.steps.slice(0, 8),
    },
    overallSummary: clip(critique.overallSummary, 400),
  };
  return JSON.stringify(sanitizeCritiqueForMetadata(shrunk)).slice(0, maxChars);
}

function clampStoredScore(n: unknown): number | null {
  if (typeof n !== "number" || Number.isNaN(n)) return null;
  return Math.max(1, Math.min(5, Math.round(n)));
}

function normalizeScorecardFromStorage(raw: unknown): DraftCritiqueScorecard | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const out = {} as DraftCritiqueScorecard;
  for (const id of DRAFT_CRITIQUE_DIMENSION_IDS) {
    const row = o[id];
    if (!row || typeof row !== "object") return null;
    const r = row as Record<string, unknown>;
    const sc = clampStoredScore(r.score);
    if (sc === null) return null;
    out[id] = {
      score: sc,
      note: typeof r.note === "string" ? r.note : "",
    };
  }
  return out;
}

function normalizeRedFlagsFromStorage(raw: unknown): DraftCritiqueRedFlag[] {
  if (!Array.isArray(raw)) return [];
  const out: DraftCritiqueRedFlag[] = [];
  for (const x of raw.slice(0, 50)) {
    if (!x || typeof x !== "object") continue;
    const r = x as Record<string, unknown>;
    const sev =
      r.severity === "low" || r.severity === "medium" || r.severity === "high" ? r.severity : ("medium" as const);
    out.push({
      code: typeof r.code === "string" ? r.code : "unknown",
      severity: sev,
      message: typeof r.message === "string" ? r.message : "",
    });
  }
  return out;
}

/** Parse stored critique JSON (local draft or `metadataJson.lastDraftCritiqueJson`). Rebuilds revision plan from scorecard. */
export function parseStoredCritiqueJson(raw: string | null | undefined): DraftCritiqueResult | null {
  if (!raw?.trim()) return null;
  try {
    const j = JSON.parse(raw) as Partial<DraftCritiqueResult>;
    if (j.version !== 1) return null;
    const scorecard = normalizeScorecardFromStorage(j.scorecard);
    if (!scorecard) return null;
    const mode = j.mode === "deterministic_plus_openai" ? "deterministic_plus_openai" : "deterministic";
    const generatedAt = typeof j.generatedAt === "string" ? j.generatedAt : new Date().toISOString();
    const overallSummary = typeof j.overallSummary === "string" ? j.overallSummary : "";
    const redFlags = normalizeRedFlagsFromStorage(j.redFlags);
    const base: DraftCritiqueResult = {
      version: 1,
      generatedAt,
      mode,
      overallSummary,
      scorecard,
      redFlags,
      revisionPlan: { version: 1, generatedAt, steps: [], summary: "" },
    };
    base.revisionPlan = buildRevisionPlanFromCritique(base);
    return base;
  } catch {
    return null;
  }
}
