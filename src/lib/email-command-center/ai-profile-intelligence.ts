/**
 * EMAIL-AI-PROFILE-INTELLIGENCE-2.0 — deterministic profile/audience signal helpers + evidence-labeled suggestions.
 * No OpenAI calls here; no auto-approve; no inference of protected characteristics (race, religion, health, etc.).
 */

import type { EmailAiAnalysisV1 } from "@/lib/email-workflow/ai/types";

const MAX_SNIP = 480;

export type RelationshipType =
  | "unknown"
  | "supporter"
  | "press"
  | "opponent_inquiry"
  | "volunteer_aligned"
  | "official"
  | "vendor_spam";

export type IssueInterestLevel = "none" | "low" | "medium" | "high";

export type VolunteerPotential = "none" | "possible" | "likely";

/** Donor posture is intentionally conservative — never "high" from heuristics alone. */
export type DonorPotentialCareful = "unknown" | "low" | "observe_only" | "do_not_infer";

export type ProfileIntelligenceSignals = {
  relationshipType: RelationshipType;
  issueInterest: IssueInterestLevel;
  volunteerPotential: VolunteerPotential;
  donorPotential: DonorPotentialCareful;
  suppressionRisk: boolean;
  suppressionReasons: string[];
  /** Bounded concatenation of operator-visible queue text used for grounding. */
  corpusSnippet: string;
};

export type ProfileEvidenceFactType =
  | "engagement_note"
  | "issue_interest"
  | "volunteer_signal"
  | "donor_signal_careful"
  | "relationship"
  | "compliance_flag"
  | "neutral_fact";

export type ProfileEvidenceSourceType =
  | "queue_who_what"
  | "queue_recommended_response"
  | "ai_email_analysis_text"
  | "merged_operator_context";

export type ProfileEvidenceRiskLevel = "low" | "medium" | "high";

/** One suggested fact row with explicit evidence and governance flags (staged to DB metadataJson by caller). */
export type ProfileEvidenceFactSuggestion = {
  suggestedFact: string;
  factType: ProfileEvidenceFactType;
  confidence: number;
  evidenceText: string;
  sourceType: ProfileEvidenceSourceType;
  riskLevel: ProfileEvidenceRiskLevel;
  needsHumanReview: boolean;
  shouldNotStoreReason?: string;
  /** Operator-facing explanation (non-fabricated). */
  whySuggested: string;
};

export type ProfileEvidenceAudienceHint = {
  label: string;
  confidence: number;
  evidenceText: string;
  sourceType: ProfileEvidenceSourceType;
  riskLevel: ProfileEvidenceRiskLevel;
  needsHumanReview: boolean;
  shouldNotStoreReason?: string;
  whySuggested: string;
};

export type QueueItemProfileContext = {
  whoSummary: string | null;
  whatSummary: string | null;
  whenSummary: string | null;
  whereSummary: string | null;
  whySummary: string | null;
  impactSummary: string | null;
  recommendedResponseSummary: string | null;
  recommendedResponseRationale: string | null;
  intent: string | null;
  tone: string | null;
  sentiment: string | null;
  /** True when Gmail bridge was metadata-only (no body in RedDirt). */
  gmailMetadataOnly: boolean;
};

function norm(s: string | null | undefined): string {
  return (s ?? "").trim().toLowerCase();
}

function clip(s: string, max = MAX_SNIP): string {
  const t = s.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max)}…`;
}

/** Conservative keyword classifier — advisory only. */
export function classifyRelationshipType(text: string): RelationshipType {
  const c = norm(text);
  if (!c) return "unknown";
  if (/\b(unsubscribe|remove me|stop emailing|cease|do not contact|dnc)\b/i.test(c)) return "vendor_spam";
  if (/\bpress|journalist|editor|reporter|media inquiry\b/i.test(c)) return "press";
  if (/\bopponent|campaign of|attack ad\b/i.test(c)) return "opponent_inquiry";
  if (/\bvolunteer|canvass|phone bank|shift\b/i.test(c)) return "volunteer_aligned";
  if (/\bsecretary of state|sos office|official capacity|government\b/i.test(c)) return "official";
  if (/\b(support|donate|thank you|grateful|yard sign)\b/i.test(c)) return "supporter";
  return "unknown";
}

export function classifyIssueInterest(text: string): IssueInterestLevel {
  const c = norm(text);
  if (!c) return "none";
  if (/\b(urgent|critical|must pass|defeat|protect)\b/i.test(c)) return "high";
  if (/\b(issue|policy|education|healthcare|environment|voting rights)\b/i.test(c)) return "medium";
  if (/\b(interested|curious|question about)\b/i.test(c)) return "low";
  return "none";
}

export function classifyVolunteerPotential(text: string): VolunteerPotential {
  const c = norm(text);
  if (!c) return "none";
  if (/\b(sign me up|i can volunteer|i will knock|phone bank|shift)\b/i.test(c)) return "likely";
  if (/\b(volunteer|canvas|event|help out)\b/i.test(c)) return "possible";
  return "none";
}

/**
 * Never upgrade to strong donor inference from text alone — finance/legal review required elsewhere.
 */
export function classifyDonorPotentialCarefully(text: string): DonorPotentialCareful {
  const c = norm(text);
  if (!c) return "unknown";
  if (/\b(matching grant|match ends|double your)\b/i.test(c)) return "do_not_infer";
  if (/\b(donate|donation|chip in|contribute)\b/i.test(c)) return "observe_only";
  if (/\b(fundraiser|stewardship|sustainer)\b/i.test(c)) return "low";
  return "unknown";
}

export function detectDoNotContactOrSuppressionRisk(text: string): { risk: boolean; reasons: string[] } {
  const reasons: string[] = [];
  const c = norm(text);
  if (/\b(unsubscribe|opt out|remove me|stop emailing|cease and desist)\b/i.test(c)) {
    reasons.push("Language suggests suppression / opt-out intent — verify suppression lists before any outreach.");
  }
  if (/\b(do not contact|dnc|wrong person|not the voter)\b/i.test(c)) {
    reasons.push("Possible do-not-contact or identity mismatch — verify before storing contact facts.");
  }
  if (/\b(bounce|invalid email|no longer at)\b/i.test(c)) {
    reasons.push("Deliverability / invalid-address language — do not treat email as verified.");
  }
  return { risk: reasons.length > 0, reasons };
}

/**
 * Deterministic 0..1 score from signals — not a model confidence.
 */
export function buildProfileConfidenceScore(input: {
  signals: ProfileIntelligenceSignals;
  hasAiEnvelope: boolean;
  evidenceAnchoredInQueueText: boolean;
  gmailMetadataOnly?: boolean;
}): number {
  let s = 0.35;
  if (input.hasAiEnvelope) s += 0.12;
  if (input.evidenceAnchoredInQueueText) s += 0.2;
  if (input.signals.issueInterest === "high") s += 0.05;
  if (input.signals.volunteerPotential === "likely") s += 0.08;
  if (input.gmailMetadataOnly) s -= 0.18;
  if (input.signals.suppressionRisk) s -= 0.35;
  if (input.signals.relationshipType === "unknown") s -= 0.05;
  return Math.min(0.92, Math.max(0.08, Math.round(s * 100) / 100));
}

export function analyzeQueueItemForProfileSignals(
  ctx: QueueItemProfileContext,
  ai: EmailAiAnalysisV1 | null | undefined,
): ProfileIntelligenceSignals {
  const parts = [
    ctx.whoSummary,
    ctx.whatSummary,
    ctx.whenSummary,
    ctx.whereSummary,
    ctx.whySummary,
    ctx.impactSummary,
    ctx.recommendedResponseSummary,
    ctx.recommendedResponseRationale,
    ctx.intent,
    ctx.tone,
    ctx.sentiment,
    ai?.recommendedNextAction,
    ai?.campaignImpact,
    ai?.reviewIntelligenceSummary,
    (ai?.sourceBackedObservations ?? []).join(" "),
  ]
    .filter(Boolean)
    .join("\n");

  const corpusSnippet = clip(parts, MAX_SNIP);
  const sup = detectDoNotContactOrSuppressionRisk(parts);

  return {
    relationshipType: classifyRelationshipType(parts),
    issueInterest: classifyIssueInterest(parts),
    volunteerPotential: classifyVolunteerPotential(parts),
    donorPotential: classifyDonorPotentialCarefully(parts),
    suppressionRisk: sup.risk,
    suppressionReasons: sup.reasons,
    corpusSnippet,
  };
}

function evidenceFromQueue(ctx: QueueItemProfileContext, needle: string): { text: string; source: ProfileEvidenceSourceType } {
  const pool = [ctx.whatSummary, ctx.whoSummary, ctx.whySummary, ctx.recommendedResponseSummary].filter(Boolean).join(" | ");
  const n = norm(needle).slice(0, 80);
  if (n && pool && norm(pool).includes(n.slice(0, Math.min(24, n.length)))) {
    return { text: clip(pool, 320), source: "queue_who_what" };
  }
  if (ctx.recommendedResponseSummary?.trim()) {
    return { text: clip(ctx.recommendedResponseSummary, 320), source: "queue_recommended_response" };
  }
  return { text: clip(pool || needle, 320), source: "merged_operator_context" };
}

const PROTECTED_INFERENCE_RE =
  /\b(race|ethnicity|religion|faith|disability|health|diagnosis|pregnant|sexual orientation|gender identity|citizenship status|national origin)\b/i;

/**
 * Turn queue + stored AI analysis into evidence-labeled fact rows. Does not write to the database.
 */
export function suggestProfileFactsWithEvidence(
  ctx: QueueItemProfileContext,
  ai: EmailAiAnalysisV1 | null | undefined,
): ProfileEvidenceFactSuggestion[] {
  const signals = analyzeQueueItemForProfileSignals(ctx, ai);
  const rows: ProfileEvidenceFactSuggestion[] = [];

  const pushRow = (row: ProfileEvidenceFactSuggestion) => {
    if (!row.suggestedFact.trim()) return;
    if (rows.length >= 24) return;
    rows.push(row);
  };

  if (signals.suppressionRisk) {
    pushRow({
      suggestedFact: "Suppression / opt-out language detected in queue context — hold outreach until lists are verified.",
      factType: "compliance_flag",
      confidence: buildProfileConfidenceScore({
        signals,
        hasAiEnvelope: Boolean(ai),
        evidenceAnchoredInQueueText: true,
        gmailMetadataOnly: ctx.gmailMetadataOnly,
      }),
      evidenceText: clip(signals.suppressionReasons.join(" "), 400),
      sourceType: "merged_operator_context",
      riskLevel: "high",
      needsHumanReview: true,
      shouldNotStoreReason: "Suppression-risk heuristics fired — do not store as a positive contact trait.",
      whySuggested: "Heuristic match on unsubscribe / DNC / bounce-style language in queue-derived corpus.",
    });
  }

  if (signals.volunteerPotential !== "none") {
    const ev = evidenceFromQueue(ctx, "volunteer");
    pushRow({
      suggestedFact: `Volunteer interest signal (${signals.volunteerPotential}) — confirm with the contact before scheduling.`,
      factType: "volunteer_signal",
      confidence: buildProfileConfidenceScore({
        signals,
        hasAiEnvelope: Boolean(ai),
        evidenceAnchoredInQueueText: ev.source === "queue_who_what",
        gmailMetadataOnly: ctx.gmailMetadataOnly,
      }),
      evidenceText: ev.text,
      sourceType: ev.source,
      riskLevel: signals.volunteerPotential === "likely" ? "medium" : "low",
      needsHumanReview: true,
      whySuggested: "Derived from queue summaries using volunteer keyword heuristics — not a commitment to serve.",
    });
  }

  if (signals.issueInterest !== "none") {
    const ev = evidenceFromQueue(ctx, "issue");
    pushRow({
      suggestedFact: `Issue engagement level heuristic: ${signals.issueInterest} (verify before targeting).`,
      factType: "issue_interest",
      confidence: buildProfileConfidenceScore({
        signals,
        hasAiEnvelope: Boolean(ai),
        evidenceAnchoredInQueueText: ev.source === "queue_who_what",
        gmailMetadataOnly: ctx.gmailMetadataOnly,
      }),
      evidenceText: ev.text,
      sourceType: ev.source,
      riskLevel: signals.issueInterest === "high" ? "medium" : "low",
      needsHumanReview: signals.issueInterest !== "low",
      whySuggested: "Keyword density on policy/issue language in operator-visible queue fields.",
    });
  }

  if (signals.donorPotential === "do_not_infer") {
    pushRow({
      suggestedFact: "Fundraising urgency language detected — do not auto-store matching-funds or finance claims.",
      factType: "donor_signal_careful",
      confidence: 0.55,
      evidenceText: clip(signals.corpusSnippet, 360),
      sourceType: "merged_operator_context",
      riskLevel: "high",
      needsHumanReview: true,
      shouldNotStoreReason: "Matching / urgency claims require finance + compliance review before any CRM fact.",
      whySuggested: "Conservative donor classifier flagged high-risk fundraising phrasing.",
    });
  } else if (signals.donorPotential !== "unknown") {
    const ev = evidenceFromQueue(ctx, "donat");
    pushRow({
      suggestedFact: "Possible donor-interest language — treat as observation only until finance approves.",
      factType: "donor_signal_careful",
      confidence: 0.42,
      evidenceText: ev.text,
      sourceType: ev.source,
      riskLevel: "medium",
      needsHumanReview: true,
      whySuggested: "Donor keywords present; RedDirt does not infer gift capacity or willingness.",
    });
  }

  if (signals.relationshipType !== "unknown") {
    const ev = evidenceFromQueue(ctx, signals.relationshipType);
    pushRow({
      suggestedFact: `Relationship/triage posture (heuristic): ${signals.relationshipType.replace(/_/g, " ")}.`,
      factType: "relationship",
      confidence: 0.48,
      evidenceText: ev.text,
      sourceType: ev.source,
      riskLevel: signals.relationshipType === "opponent_inquiry" || signals.relationshipType === "press" ? "medium" : "low",
      needsHumanReview: true,
      whySuggested: "Keyword routing hint from queue text — not a CRM party affiliation.",
    });
  }

  for (const raw of ai?.profileFactSuggestions ?? []) {
    const suggestion = typeof raw === "string" ? raw : raw.suggestion;
    const t = suggestion.trim();
    if (!t) continue;
    if (PROTECTED_INFERENCE_RE.test(t)) {
      pushRow({
        suggestedFact: t.slice(0, 400),
        factType: "compliance_flag",
        confidence: 0.15,
        evidenceText: "Model line matched protected-attribute guard — do not store as a demographic fact.",
        sourceType: "ai_email_analysis_text",
        riskLevel: "high",
        needsHumanReview: true,
        shouldNotStoreReason:
          "Possible protected-class or health inference — reject or rewrite with counsel before any profile storage.",
        whySuggested: "EMAIL-AI-PROFILE-INTELLIGENCE-2.0 guard: blocked automatic promotion of sensitive inference text.",
      });
      continue;
    }
    const anchored = norm(signals.corpusSnippet).includes(norm(t).slice(0, Math.min(32, norm(t).length)));
    const evSource: ProfileEvidenceSourceType = anchored ? "ai_email_analysis_text" : "ai_email_analysis_text";
    const conf = buildProfileConfidenceScore({
      signals,
      hasAiEnvelope: true,
      evidenceAnchoredInQueueText: anchored,
      gmailMetadataOnly: ctx.gmailMetadataOnly,
    });
    pushRow({
      suggestedFact: t.slice(0, 800),
      factType: "neutral_fact",
      confidence: conf,
      evidenceText: clip(anchored ? `${t}\n---\nQueue context:\n${signals.corpusSnippet}` : t, 500),
      sourceType: evSource,
      riskLevel: anchored && !signals.suppressionRisk ? "low" : "medium",
      needsHumanReview: !anchored || ctx.gmailMetadataOnly,
      whySuggested: anchored
        ? "Suggestion text overlaps queue-derived corpus — still requires human approval."
        : "Suggestion comes from AI analysis text without strong overlap to queue fields — higher review burden.",
    });
  }

  return dedupeFactRows(rows);
}

export function suggestAudienceHintsWithEvidence(
  ctx: QueueItemProfileContext,
  ai: EmailAiAnalysisV1 | null | undefined,
): ProfileEvidenceAudienceHint[] {
  const signals = analyzeQueueItemForProfileSignals(ctx, ai);
  const out: ProfileEvidenceAudienceHint[] = [];

  const push = (h: ProfileEvidenceAudienceHint) => {
    if (!h.label.trim() || out.length >= 16) return;
    out.push(h);
  };

  for (const raw of ai?.audienceHints ?? []) {
    const hint = typeof raw === "string" ? raw : raw.hint;
    const label = hint.trim();
    if (!label) continue;
    if (PROTECTED_INFERENCE_RE.test(label)) {
      push({
        label: label.slice(0, 400),
        confidence: 0.2,
        evidenceText: "Blocked sensitive inference pattern in audience hint text.",
        sourceType: "ai_email_analysis_text",
        riskLevel: "high",
        needsHumanReview: true,
        shouldNotStoreReason: "Audience hint touched protected-class style inference — reject or rewrite.",
        whySuggested: "EMAIL-AI-PROFILE-INTELLIGENCE-2.0 audience guard.",
      });
      continue;
    }
    const ev = evidenceFromQueue(ctx, label);
    push({
      label: label.slice(0, 500),
      confidence: buildProfileConfidenceScore({
        signals,
        hasAiEnvelope: Boolean(ai),
        evidenceAnchoredInQueueText: ev.source === "queue_who_what",
        gmailMetadataOnly: ctx.gmailMetadataOnly,
      }),
      evidenceText: ev.text,
      sourceType: "ai_email_analysis_text",
      riskLevel: signals.suppressionRisk ? "high" : "low",
      needsHumanReview: true,
      whySuggested: "From stored AI audienceHints — advisory only; not a segment.",
    });
  }

  if (signals.issueInterest !== "none") {
    push({
      label: `Consider issue-interest framing (${signals.issueInterest}) for messaging tests (not a list membership).`,
      confidence: 0.4,
      evidenceText: clip(signals.corpusSnippet, 360),
      sourceType: "merged_operator_context",
      riskLevel: "low",
      needsHumanReview: true,
      whySuggested: "Derived from queue keyword issue-interest heuristic.",
    });
  }

  return dedupeHints(out);
}

function dedupeFactRows(rows: ProfileEvidenceFactSuggestion[]): ProfileEvidenceFactSuggestion[] {
  const seen = new Set<string>();
  const out: ProfileEvidenceFactSuggestion[] = [];
  for (const r of rows) {
    const k = `${r.factType}::${norm(r.suggestedFact).slice(0, 120)}`;
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(r);
  }
  return out;
}

function dedupeHints(rows: ProfileEvidenceAudienceHint[]): ProfileEvidenceAudienceHint[] {
  const seen = new Set<string>();
  const out: ProfileEvidenceAudienceHint[] = [];
  for (const r of rows) {
    const k = norm(r.label).slice(0, 160);
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(r);
  }
  return out;
}

/** Typed envelope stored under suggestion.metadataJson.profileIntelligenceV2 */
export type ProfileIntelligenceV2Metadata = {
  version: 2;
  evidenceText: string;
  sourceType: ProfileEvidenceSourceType;
  riskLevel: ProfileEvidenceRiskLevel;
  factType: ProfileEvidenceFactType;
  needsHumanReview: boolean;
  shouldNotStoreReason?: string;
  whySuggested: string;
  signals: Pick<
    ProfileIntelligenceSignals,
    "relationshipType" | "issueInterest" | "volunteerPotential" | "donorPotential" | "suppressionRisk"
  >;
};

export function buildProfileIntelligenceV2Metadata(row: ProfileEvidenceFactSuggestion, signals: ProfileIntelligenceSignals): ProfileIntelligenceV2Metadata {
  return {
    version: 2,
    evidenceText: row.evidenceText,
    sourceType: row.sourceType,
    riskLevel: row.riskLevel,
    factType: row.factType,
    needsHumanReview: row.needsHumanReview,
    shouldNotStoreReason: row.shouldNotStoreReason,
    whySuggested: row.whySuggested,
    signals: {
      relationshipType: signals.relationshipType,
      issueInterest: signals.issueInterest,
      volunteerPotential: signals.volunteerPotential,
      donorPotential: signals.donorPotential,
      suppressionRisk: signals.suppressionRisk,
    },
  };
}

export type AudienceIntelligenceV2Metadata = {
  version: 2;
  evidenceText: string;
  sourceType: ProfileEvidenceSourceType;
  riskLevel: ProfileEvidenceRiskLevel;
  needsHumanReview: boolean;
  shouldNotStoreReason?: string;
  whySuggested: string;
};

export function buildAudienceIntelligenceV2Metadata(row: ProfileEvidenceAudienceHint): AudienceIntelligenceV2Metadata {
  return {
    version: 2,
    evidenceText: row.evidenceText,
    sourceType: row.sourceType,
    riskLevel: row.riskLevel,
    needsHumanReview: row.needsHumanReview,
    shouldNotStoreReason: row.shouldNotStoreReason,
    whySuggested: row.whySuggested,
  };
}

/** Shared shape for Prisma `EmailWorkflowItem` triage fields used in profile intelligence. */
export type EmailWorkflowItemProfileFields = {
  whoSummary: string | null;
  whatSummary: string | null;
  whenSummary: string | null;
  whereSummary: string | null;
  whySummary: string | null;
  impactSummary: string | null;
  recommendedResponseSummary: string | null;
  recommendedResponseRationale: string | null;
  sentiment: string | null;
  intent: unknown;
  tone: unknown;
};

export function buildQueueItemProfileContextFromRow(
  row: EmailWorkflowItemProfileFields,
  gmailMetadataOnly: boolean,
): QueueItemProfileContext {
  return {
    whoSummary: row.whoSummary,
    whatSummary: row.whatSummary,
    whenSummary: row.whenSummary,
    whereSummary: row.whereSummary,
    whySummary: row.whySummary,
    impactSummary: row.impactSummary,
    recommendedResponseSummary: row.recommendedResponseSummary,
    recommendedResponseRationale: row.recommendedResponseRationale,
    intent: row.intent != null ? String(row.intent) : null,
    tone: row.tone != null ? String(row.tone) : null,
    sentiment: row.sentiment,
    gmailMetadataOnly,
  };
}

const FACT_TYPES_V2: ProfileEvidenceFactType[] = [
  "engagement_note",
  "issue_interest",
  "volunteer_signal",
  "donor_signal_careful",
  "relationship",
  "compliance_flag",
  "neutral_fact",
];

const SOURCE_TYPES_V2: ProfileEvidenceSourceType[] = [
  "queue_who_what",
  "queue_recommended_response",
  "ai_email_analysis_text",
  "merged_operator_context",
];

function isRiskLevel(v: unknown): v is ProfileEvidenceRiskLevel {
  return v === "low" || v === "medium" || v === "high";
}

function isFactType(v: unknown): v is ProfileEvidenceFactType {
  return typeof v === "string" && (FACT_TYPES_V2 as string[]).includes(v);
}

function isSourceType(v: unknown): v is ProfileEvidenceSourceType {
  return typeof v === "string" && (SOURCE_TYPES_V2 as string[]).includes(v);
}

/** Parse staged `metadataJson.profileIntelligenceV2` (client- or server-safe). */
export function parseProfileIntelligenceV2FromSuggestionMetadata(metadataJson: unknown): ProfileIntelligenceV2Metadata | null {
  if (!metadataJson || typeof metadataJson !== "object" || Array.isArray(metadataJson)) return null;
  const root = metadataJson as Record<string, unknown>;
  const v2 = root.profileIntelligenceV2;
  if (!v2 || typeof v2 !== "object" || Array.isArray(v2)) return null;
  const o = v2 as Record<string, unknown>;
  if (o.version !== 2) return null;
  if (!isFactType(o.factType) || !isSourceType(o.sourceType) || !isRiskLevel(o.riskLevel)) return null;
  if (typeof o.evidenceText !== "string" || typeof o.whySuggested !== "string" || typeof o.needsHumanReview !== "boolean") return null;
  const signals = o.signals;
  if (!signals || typeof signals !== "object" || Array.isArray(signals)) return null;
  const s = signals as Record<string, unknown>;
  return {
    version: 2,
    evidenceText: o.evidenceText,
    sourceType: o.sourceType,
    riskLevel: o.riskLevel,
    factType: o.factType,
    needsHumanReview: o.needsHumanReview,
    shouldNotStoreReason: typeof o.shouldNotStoreReason === "string" ? o.shouldNotStoreReason : undefined,
    whySuggested: o.whySuggested,
    signals: {
      relationshipType: typeof s.relationshipType === "string" ? (s.relationshipType as RelationshipType) : "unknown",
      issueInterest: typeof s.issueInterest === "string" ? (s.issueInterest as IssueInterestLevel) : "none",
      volunteerPotential: typeof s.volunteerPotential === "string" ? (s.volunteerPotential as VolunteerPotential) : "none",
      donorPotential: typeof s.donorPotential === "string" ? (s.donorPotential as DonorPotentialCareful) : "unknown",
      suppressionRisk: s.suppressionRisk === true,
    },
  };
}

/** Parse staged `metadataJson.audienceIntelligenceV2`. */
export function parseAudienceIntelligenceV2FromHintMetadata(metadataJson: unknown): AudienceIntelligenceV2Metadata | null {
  if (!metadataJson || typeof metadataJson !== "object" || Array.isArray(metadataJson)) return null;
  const root = metadataJson as Record<string, unknown>;
  const v2 = root.audienceIntelligenceV2;
  if (!v2 || typeof v2 !== "object" || Array.isArray(v2)) return null;
  const o = v2 as Record<string, unknown>;
  if (o.version !== 2) return null;
  if (!isSourceType(o.sourceType) || !isRiskLevel(o.riskLevel)) return null;
  if (typeof o.evidenceText !== "string" || typeof o.whySuggested !== "string" || typeof o.needsHumanReview !== "boolean") return null;
  return {
    version: 2,
    evidenceText: o.evidenceText,
    sourceType: o.sourceType,
    riskLevel: o.riskLevel,
    needsHumanReview: o.needsHumanReview,
    shouldNotStoreReason: typeof o.shouldNotStoreReason === "string" ? o.shouldNotStoreReason : undefined,
    whySuggested: o.whySuggested,
  };
}
