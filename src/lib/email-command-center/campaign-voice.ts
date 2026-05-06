/**
 * EMAIL-MESSAGE-STUDIO-CAMPAIGN-VOICE-1.2 — curated campaign voice guidance for operator drafting.
 * EMAIL-CAMPAIGN-VOICE-SOURCE-READINESS-1.0 — expanded source registry + readiness buckets + context health (no ingestion, no claims).
 * Grounded in repo docs (titles/paths only); does not assert live RAG index contents.
 */

/** Canonical material slots for operator source-awareness (registry + UI). */
export type CampaignVoiceSourceSlot =
  | "mission"
  | "values"
  | "issue_frames"
  | "candidate_bio"
  | "prior_writings"
  | "fundraising_language"
  | "volunteer_language"
  | "press_language"
  | "voter_education_language"
  | "compliance_language"
  | "semantic_rag_index"
  | "queue_context"
  | "audience_definitions"
  | "profile_import_sendgrid";

export type SourceMaterialReadinessKind =
  | "static_repo"
  | "requires_ingest_for_semantic_rag"
  | "operator_provided_only"
  /** No dedicated bundled markdown for this slice — operator must supply approved text elsewhere. */
  | "no_bundled_document";

export type SourceMaterialCategory = {
  id: string;
  slot: CampaignVoiceSourceSlot;
  title: string;
  /** Repo-relative path or route when applicable */
  location: string;
  /** How operators should treat this source today */
  readiness: SourceMaterialReadinessKind;
  notes: string;
};

export type ToneProfile = {
  id: string;
  label: string;
  description: string;
  /** Aligns with approved public copy posture where applicable */
  docRefs?: string[];
};

export type LabeledFrame = {
  id: string;
  label: string;
  description: string;
  docRefs?: string[];
};

export type MessageStudioCampaignVoiceSettings = {
  toneProfileId: string;
  issueFrameId: string;
  audienceFrameId: string;
  ctaFrameId: string;
  riskLevel: "low" | "standard" | "elevated";
  approvalLevel: "coordinator" | "comms_lead" | "dual_signoff" | "finance_counsel" | "candidate_final";
  sourceLayers: {
    campaignMission: boolean;
    priorWriting: boolean;
    queueItemContext: boolean;
    audienceContext: boolean;
    profileFacts: boolean;
    importSource: boolean;
    sendgridCompliance: boolean;
  };
};

export const CAMPAIGN_VOICE_PRINCIPLES: string[] = [
  "Arkansas-rooted, service-first framing for Secretary of State work — records, elections process, and transparent government (see docs/KELLY_SOS_STRATEGIC_THEME_INTEGRATION_PLAN.md).",
  "Values-first, steady administration — avoid panic tone unless the draft type explicitly calls for urgency with comms approval.",
  "Neighbor-to-neighbor clarity: short paragraphs, one primary ask, honest about what the office does and does not do.",
  "Protect the vote and fair process without unsourced opponent claims — contrast lines require citations/legal review per docs/content/KELLY_SOS_SAFE_PUBLIC_COPY_SNIPPETS.md.",
  "People-powered organizing: respect volunteers' time; accuracy beats speed for anything that could reach voters.",
];

export const PROHIBITED_OR_HIGH_RISK_PATTERNS: string[] = [
  "Unsourced statistical or legal claims about opponents, bills, or election outcomes.",
  "Promising a specific visit, filing outcome, or enforcement result without an approved source and approver.",
  "Fundraising urgency that implies matching funds, tax outcomes, or legal threats without finance + counsel review.",
  "Using private voter data or queue bodies in outbound copy without human redaction and policy signoff.",
  "Bypassing unsubscribe / suppression posture for any future broadcast (honor SendGrid suppression doctrine).",
];

export const COMPLIANCE_GUARDRAILS: string[] = [
  "Broadcast email: include truthful unsubscribe path and honor suppression lists before any future send (Send Execution Governance).",
  "Paid media lines: follow labels in docs/content/KELLY_SOS_SAFE_PUBLIC_COPY_SNIPPETS.md (`needs source citation`, `needs legal review`).",
  "Opposition contrast: internal research only — no unsourced opponent claims (Kelly SOS firewall / comms checklist).",
  "Imports: provenance and consent posture must be documented — do not assume opt-in for fundraising or blast sends.",
];

export const MESSAGE_QUALITY_CHECKLIST: string[] = [
  "Clear audience — who receives this and why now?",
  "Clear CTA — one primary action; secondary asks labeled optional.",
  "Campaign voice fit — tone/issue frames match the moment and approver tier.",
  "Local relevance — county or regional hook when using county audience frame.",
  "No unsupported factual claims — flag or footnote before externalization.",
  "No opponent claims without an approved source on file.",
  "No accidental promises — distinguish aspiration from guaranteed outcomes.",
  "Unsubscribe / compliance reminder captured for any future broadcast.",
  "Approval owner identified in notes before leaving draft.",
  "Suppression / send gate acknowledged for future execution (readiness + send-execution routes).",
];

export const TONE_PROFILES: ToneProfile[] = [
  {
    id: "direct-trustworthy",
    label: "Direct and trustworthy",
    description: "Plain language, confident, no fluff — fits queue follow-ups and clerk-facing notes.",
    docRefs: ["docs/content/KELLY_SOS_SAFE_PUBLIC_COPY_SNIPPETS.md"],
  },
  {
    id: "neighbor-to-neighbor",
    label: "Neighbor-to-neighbor",
    description: "Warm, conversational, respectful of the reader’s time.",
    docRefs: ["docs/KELLY_SOS_COMMS_READINESS.md"],
  },
  {
    id: "urgent-not-panicked",
    label: "Urgent but not panicked",
    description: "Time-bound without alarmism; pair with elevated risk + comms lead approval.",
    docRefs: ["docs/KELLY_SOS_SECTION_3_LAUNCH_LOCK.md"],
  },
  {
    id: "values-first",
    label: "Values-first",
    description: "Transparent government, fair elections, public service as shared Arkansas values.",
    docRefs: ["docs/KELLY_SOS_STRATEGIC_THEME_INTEGRATION_PLAN.md"],
  },
  {
    id: "democracy-protection",
    label: "Democracy protection",
    description: "Process integrity, ballot access clarity, steady stewardship of public lists.",
    docRefs: ["docs/content/KELLY_SOS_SAFE_PUBLIC_COPY_SNIPPETS.md (county / integrity lines)"],
  },
  {
    id: "arkansas-rooted",
    label: "Arkansas-rooted / local control",
    description: "Delta to River Valley geographic fairness; county clerks as partners.",
    docRefs: ["docs/briefs/KELLY_NWA_BENTON_WASHINGTON_CANDIDATE_BRIEF.md"],
  },
  {
    id: "volunteer-activation",
    label: "Volunteer activation",
    description: "Specific asks, shifts, gratitude; no guilt trips; verify events before promising attendance.",
    docRefs: ["docs/KELLY_SOS_DAY_3_TO_7_EXECUTION_BOARD.md"],
  },
  {
    id: "donor-careful",
    label: "Donor / fundraising careful",
    description: "Stewardship tone; avoid transactional consent implications; finance + counsel path.",
    docRefs: ["docs/KELLY_SOS_COMPLIANCE_CHECKLIST.md"],
  },
  {
    id: "press-professional",
    label: "Press / professional",
    description: "Tight lede, attributed facts only, rapid-response routing for media inquiries.",
    docRefs: ["docs/KELLY_SOS_COMMS_READINESS.md"],
  },
  {
    id: "pastoral-community",
    label: "Pastoral / community-centered",
    description: "Grounded, empathetic community voice when appropriate — still policy-accurate; avoid hollow platitudes.",
    docRefs: ["docs/ask-kelly-public/kelly-grappe-biography.md"],
  },
];

export const ISSUE_FRAMES: LabeledFrame[] = [
  { id: "protect-the-vote", label: "Protect the vote", description: "Access, accuracy, and confidence in election infrastructure." },
  { id: "fair-elections", label: "Fair elections", description: "Rules applied evenly; transparency in process." },
  { id: "transparent-government", label: "Transparent government", description: "Public records, clear deadlines, open books." },
  { id: "local-accountability", label: "Local accountability", description: "County partnership, no surprises for clerks." },
  { id: "voter-access", label: "Voter access", description: "Clarity on how to participate; remove friction without overpromising." },
  { id: "public-service", label: "Public service", description: "SOS office as service desk for citizens and small business." },
  { id: "steady-administration", label: "Steady administration / anti-chaos", description: "Competent execution over drama; operator-safe phrasing." },
  { id: "people-powered", label: "Community organizing / people-powered", description: "Volunteers and neighbors carrying the campaign — earned media discipline." },
];

export const AUDIENCE_FRAMES: LabeledFrame[] = [
  { id: "county-volunteers", label: "County volunteers", description: "Shift-specific asks; respect local leadership." },
  { id: "digital-activists", label: "Digital activists", description: "Scannable, link-forward, one CTA." },
  { id: "clerks-election-officials", label: "Clerks / election officials", description: "Professional, gratitude for workload, no blame." },
  { id: "small-business", label: "Small business filers", description: "Practical SOS services; avoid partisan heat." },
  { id: "press", label: "Press / media", description: "Attribution, short quotes, rapid response discipline." },
  { id: "donors", label: "Donors / finance audience", description: "Impact without overclaiming; compliance-aware." },
  { id: "general-supporters", label: "General supporters", description: "Values + one ask; broad geographic inclusivity." },
];

export const CTA_FRAMES: LabeledFrame[] = [
  { id: "rsvp", label: "RSVP / attend", description: "Verify event details before hard commitments." },
  { id: "volunteer-shift", label: "Volunteer shift", description: "Concrete time window + contact path." },
  { id: "donate", label: "Donate", description: "Finance-approved language only; no fabricated matching." },
  { id: "share", label: "Forward / share", description: "Peer-to-peer distribution; keep copy short." },
  { id: "petition-read", label: "Read / learn more", description: "Education-first; link to approved sources." },
  { id: "contact-reply", label: "Reply / contact", description: "One-to-one tone; set expectations on response time." },
  { id: "take-action-online", label: "Online action", description: "Clear URL; mobile-friendly instructions." },
];

/** Curated inventory — not a claim that semantic RAG is populated in any environment */
export const SOURCE_MATERIAL_READINESS: SourceMaterialCategory[] = [
  {
    id: "mission-strategic-theme",
    slot: "mission",
    title: "Campaign mission (strategic themes)",
    location: "docs/KELLY_SOS_STRATEGIC_THEME_INTEGRATION_PLAN.md",
    readiness: "static_repo",
    notes: "Theme-to-route posture; align asks with documented scope — do not invent new planks.",
  },
  {
    id: "values-strategic-comms",
    slot: "values",
    title: "Campaign values framing",
    location: "docs/KELLY_SOS_STRATEGIC_THEME_INTEGRATION_PLAN.md · docs/KELLY_SOS_COMMS_READINESS.md",
    readiness: "static_repo",
    notes: "Service-first, transparent-government framing; pair with safe-public snippets for labeled lines.",
  },
  {
    id: "issue-frames-safe-copy",
    slot: "issue_frames",
    title: "Issue frames (approved phrasing hooks)",
    location: "docs/content/KELLY_SOS_SAFE_PUBLIC_COPY_SNIPPETS.md · docs/KELLY_SOS_STRATEGIC_THEME_INTEGRATION_PLAN.md",
    readiness: "static_repo",
    notes: "UI issue frames are guidance only — outbound claims still need labels (`safe now` vs citation vs legal review).",
  },
  {
    id: "candidate-bio-public",
    slot: "candidate_bio",
    title: "Candidate bio (public biography doc)",
    location: "docs/ask-kelly-public/kelly-grappe-biography.md",
    readiness: "static_repo",
    notes: "Public biography text; do not extrapolate beyond what the doc states.",
  },
  {
    id: "prior-writings-no-bundle",
    slot: "prior_writings",
    title: "Prior approved writings",
    location: "(no bundled repository pack)",
    readiness: "no_bundled_document",
    notes: "No campaign-wide prior-writings archive ships in this repo — paste approved excerpts into audience note, compliance notes, or body.",
  },
  {
    id: "fundraising-language-compliance",
    slot: "fundraising_language",
    title: "Fundraising language (compliance-first)",
    location: "docs/KELLY_SOS_COMPLIANCE_CHECKLIST.md · docs/KELLY_SOS_COMMS_READINESS.md",
    readiness: "static_repo",
    notes: "Stewardship tone, finance + counsel path; no matching-funds or tax inventions.",
  },
  {
    id: "volunteer-language-execution-board",
    slot: "volunteer_language",
    title: "Volunteer language (shifts, gratitude)",
    location: "docs/KELLY_SOS_DAY_3_TO_7_EXECUTION_BOARD.md",
    readiness: "static_repo",
    notes: "Concrete asks; verify events before promising attendance or headcount.",
  },
  {
    id: "press-language-comms",
    slot: "press_language",
    title: "Press / professional language",
    location: "docs/KELLY_SOS_COMMS_READINESS.md",
    readiness: "static_repo",
    notes: "Tight lede discipline; attributed facts only — paste approved quotes separately if needed.",
  },
  {
    id: "compliance-language-checklist",
    slot: "compliance_language",
    title: "Compliance language rails",
    location: "docs/KELLY_SOS_COMPLIANCE_CHECKLIST.md",
    readiness: "static_repo",
    notes: "Pre-flight checks before high-reach or paid use; pair with SendGrid / send-governance docs when drafting future broadcast paths.",
  },
  {
    id: "safe-public-snippets",
    slot: "voter_education_language",
    title: "Voter education & safe public copy snippets",
    location: "docs/content/KELLY_SOS_SAFE_PUBLIC_COPY_SNIPPETS.md",
    readiness: "static_repo",
    notes: "Education-first and general comms lines; follow `safe now` vs `needs source citation` vs `needs legal review` — no fabricated deadlines.",
  },
  {
    id: "search-chunk-rag",
    slot: "semantic_rag_index",
    title: "SearchChunk semantic RAG (ingest)",
    location: "src/lib/openai/README.md · npm run ingest",
    readiness: "requires_ingest_for_semantic_rag",
    notes: "Embeddings + DB chunks power /api/search answers when OPENAI_API_KEY + DATABASE_URL + ingest have run; Message Studio does not query it automatically.",
  },
  {
    id: "queue-ai-json",
    slot: "queue_context",
    title: "Queue item context",
    location: "/admin/workbench/email-queue/[id]",
    readiness: "operator_provided_only",
    notes: "Operators paste or summarize approved queue context into Message Studio — no auto-fetch of bodies here.",
  },
  {
    id: "audience-definitions",
    slot: "audience_definitions",
    title: "Audience Studio definitions",
    location: "/admin/workbench/email-command-center/audiences",
    readiness: "operator_provided_only",
    notes: "Use approved audience criteria in audience note and Campaign Voice audience frame.",
  },
  {
    id: "profile-import-sendgrid-posture",
    slot: "profile_import_sendgrid",
    title: "Profile facts, import provenance, SendGrid suppression posture",
    location: "docs/email-command-center-launch-hardening.md · Send Execution Governance route",
    readiness: "operator_provided_only",
    notes: "Toggle source layers when reviewed; Message Studio does not load profile rows or suppression lists automatically.",
  },
];

/** Operator-facing reminders when no repo document exists for a slice (honest gaps, not fabricated claims). */
export const MISSING_DOC_OPERATOR_GUIDANCE: string[] = [
  "Approved prior writings: paste excerpts or bullet summaries into the draft workspace — there is no bundled writings archive in this repository.",
  "Event-specific logistics, headcount caps, or venue rules: paste from an approved run-of-show or staff doc.",
  "Attributable quotes or press lines: paste the approved quote and attribution context — the model must not invent quotations.",
];

export type OperatorPromptTemplate = { id: string; label: string; template: string };

/** Paste helpers — placeholders only; operators replace bracketed sections with approved facts. */
export const OPERATOR_PROMPT_TEMPLATES: readonly OperatorPromptTemplate[] = [
  {
    id: "paste_event_details",
    label: "Paste event details",
    template: `[OPERATOR: replace bracketed sections with approved facts only — no invention]

Event name:
Date / time (with timezone):
Location (venue, city, state):
Hosts or partners (approved names):
RSVP or signup (approved URL only):
Accessibility / parking notes (if applicable):`,
  },
  {
    id: "paste_source_claim",
    label: "Paste source claim",
    template: `[OPERATOR: one claim per block; attach citation or internal doc ID]

Claim (exact wording to defend):
Approved source (title + URL or internal reference):
How we may phrase it in email (approved or “needs citation”):`,
  },
  {
    id: "paste_audience_context",
    label: "Paste audience context",
    template: `[OPERATOR: audience facts the draft must respect]

Who receives this (role / geography):
Why now (trigger or deadline, if any — cite approved source):
Sensitivity (e.g. finance, legal, clerks):`,
  },
  {
    id: "paste_quote_context",
    label: "Paste quote / context",
    template: `[OPERATOR: quotes must match approved text exactly]

Quote (verbatim):
Speaker / title:
Where published or approved (link or internal doc ID):
Surrounding context (1–3 sentences max):`,
  },
] as const;

export type CampaignVoiceContextDraftSlice = {
  audienceNote: string;
  complianceNotes: string;
  body: string;
};

export type CampaignVoiceContextHealth = {
  thinContext: boolean;
  summary: string;
  reasons: string[];
};

/** Heuristic: warns when few layers are confirmed and free-text context is short (advisory only). */
export function computeCampaignVoiceContextHealth(
  settings: MessageStudioCampaignVoiceSettings,
  draft: CampaignVoiceContextDraftSlice,
): CampaignVoiceContextHealth {
  const reasons: string[] = [];
  const layersOn = Object.values(settings.sourceLayers).filter(Boolean).length;
  if (layersOn < 2) {
    reasons.push(
      "Fewer than two source-layer confirmations are checked — treat unchecked layers as unavailable to the model.",
    );
  }
  const textMass =
    draft.audienceNote.trim().length + draft.complianceNotes.trim().length + Math.min(draft.body.trim().length, 400);
  if (textMass < 80) {
    reasons.push(
      "Audience note, compliance notes, and body are still light — paste approved logistics, citations, or excerpts before asking the model for specifics.",
    );
  }
  const thinContext = reasons.length > 0;
  return {
    thinContext,
    summary: thinContext ? "Thin context for AI drafting" : "Context posture acceptable for advisory generation",
    reasons,
  };
}

export type SourceReadinessPartition = {
  availableStatic: SourceMaterialCategory[];
  notYetIndexed: SourceMaterialCategory[];
  operatorPasteRequired: SourceMaterialCategory[];
  missingBundledDocs: SourceMaterialCategory[];
};

export function partitionCampaignVoiceSourceReadiness(): SourceReadinessPartition {
  const availableStatic = SOURCE_MATERIAL_READINESS.filter((s) => s.readiness === "static_repo");
  const notYetIndexed = SOURCE_MATERIAL_READINESS.filter((s) => s.readiness === "requires_ingest_for_semantic_rag");
  const operatorPasteRequired = SOURCE_MATERIAL_READINESS.filter((s) => s.readiness === "operator_provided_only");
  const missingBundledDocs = SOURCE_MATERIAL_READINESS.filter((s) => s.readiness === "no_bundled_document");
  return { availableStatic, notYetIndexed, operatorPasteRequired, missingBundledDocs };
}

/** Deterministic limitations merged into AI JSON so operators always see repo posture. */
export function buildDeterministicAiSourceLimitationLines(
  settings: MessageStudioCampaignVoiceSettings,
  draft: CampaignVoiceContextDraftSlice,
): string[] {
  const lines: string[] = [];
  const offLayers = (Object.keys(settings.sourceLayers) as (keyof MessageStudioCampaignVoiceSettings["sourceLayers"])[])
    .filter((k) => !settings.sourceLayers[k])
    .map(String);
  if (offLayers.length) {
    lines.push(`Operator did not confirm these source layers (treat as absent): ${offLayers.join(", ")}.`);
  }
  const health = computeCampaignVoiceContextHealth(settings, draft);
  if (health.thinContext) {
    lines.push(`Context health: ${health.summary} — ${health.reasons.join(" ")}`);
  }
  lines.push(
    "Semantic RAG: Message Studio generation does not call SearchChunk retrieval; only static excerpts above + operator text are in scope unless you paste more.",
  );
  const { missingBundledDocs, notYetIndexed } = partitionCampaignVoiceSourceReadiness();
  if (missingBundledDocs.length) {
    lines.push(
      `No bundled repo document for: ${missingBundledDocs.map((m) => m.title).join("; ")} — paste approved material for those slices.`,
    );
  }
  if (notYetIndexed.length) {
    lines.push(
      "Not-yet-indexed: semantic RAG requires npm run ingest per src/lib/openai/README.md — do not assume corpus coverage.",
    );
  }
  return lines;
}

export function mergeModelSourceLimitations(
  settings: MessageStudioCampaignVoiceSettings,
  draft: CampaignVoiceContextDraftSlice,
  fromModel: string[],
): string[] {
  const det = buildDeterministicAiSourceLimitationLines(settings, draft);
  return [...new Set([...det, ...fromModel])];
}

export function getToneProfileById(id: string): ToneProfile | undefined {
  return TONE_PROFILES.find((t) => t.id === id);
}

export function getDefaultCampaignVoiceSettings(): MessageStudioCampaignVoiceSettings {
  return {
    toneProfileId: TONE_PROFILES[0]?.id ?? "direct-trustworthy",
    issueFrameId: ISSUE_FRAMES[0]?.id ?? "fair-elections",
    audienceFrameId: AUDIENCE_FRAMES[6]?.id ?? "general-supporters",
    ctaFrameId: CTA_FRAMES[0]?.id ?? "rsvp",
    riskLevel: "standard",
    approvalLevel: "coordinator",
    sourceLayers: {
      campaignMission: true,
      priorWriting: true,
      queueItemContext: false,
      audienceContext: false,
      profileFacts: false,
      importSource: false,
      sendgridCompliance: false,
    },
  };
}

/** Compact text block for model prompts — bounded size */
export function buildCampaignVoicePromptExcerpt(settings: MessageStudioCampaignVoiceSettings): string {
  const tone = getToneProfileById(settings.toneProfileId) ?? TONE_PROFILES[0];
  const issue = ISSUE_FRAMES.find((f) => f.id === settings.issueFrameId) ?? ISSUE_FRAMES[0];
  const aud = AUDIENCE_FRAMES.find((f) => f.id === settings.audienceFrameId) ?? AUDIENCE_FRAMES[0];
  const cta = CTA_FRAMES.find((f) => f.id === settings.ctaFrameId) ?? CTA_FRAMES[0];
  const layers = Object.entries(settings.sourceLayers)
    .filter(([, v]) => v)
    .map(([k]) => k)
    .join(", ");
  return [
    "=== Campaign voice (operator-selected) ===",
    `Tone: ${tone?.label ?? ""} — ${tone?.description ?? ""}`,
    `Issue frame: ${issue?.label ?? ""} — ${issue?.description ?? ""}`,
    `Audience frame: ${aud?.label ?? ""} — ${aud?.description ?? ""}`,
    `CTA frame: ${cta?.label ?? ""} — ${cta?.description ?? ""}`,
    `Risk level: ${settings.riskLevel}; Approval tier: ${settings.approvalLevel}`,
    `Source layers toggled on: ${layers || "(none — context is thin)"}`,
    "=== Principles (abridge in output; do not contradict) ===",
    ...CAMPAIGN_VOICE_PRINCIPLES.slice(0, 4),
    "=== High-risk patterns (avoid) ===",
    ...PROHIBITED_OR_HIGH_RISK_PATTERNS.slice(0, 4),
  ].join("\n");
}
