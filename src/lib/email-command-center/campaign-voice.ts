/**
 * EMAIL-MESSAGE-STUDIO-CAMPAIGN-VOICE-1.2 — curated campaign voice guidance for operator drafting.
 * Grounded in repo docs (titles/paths only); does not assert live RAG index contents.
 */

export type SourceMaterialCategory = {
  id: string;
  title: string;
  /** Repo-relative path or route when applicable */
  location: string;
  /** How operators should treat this source today */
  readiness: "static_repo" | "requires_ingest_for_semantic_rag" | "operator_provided_only";
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
    id: "safe-public-snippets",
    title: "Safe public copy snippets",
    location: "docs/content/KELLY_SOS_SAFE_PUBLIC_COPY_SNIPPETS.md",
    readiness: "static_repo",
    notes: "Labeled lines for comms; follow `safe now` vs `needs source citation` vs `needs legal review`.",
  },
  {
    id: "strategic-theme-plan",
    title: "Strategic theme integration",
    location: "docs/KELLY_SOS_STRATEGIC_THEME_INTEGRATION_PLAN.md",
    readiness: "static_repo",
    notes: "When themes ship to which routes — align drafts with documented posture.",
  },
  {
    id: "comms-readiness",
    title: "Comms readiness",
    location: "docs/KELLY_SOS_COMMS_READINESS.md",
    readiness: "static_repo",
    notes: "Operator-facing readiness narrative; not a substitute for legal on paid.",
  },
  {
    id: "compliance-checklist",
    title: "Compliance checklist",
    location: "docs/KELLY_SOS_COMPLIANCE_CHECKLIST.md",
    readiness: "static_repo",
    notes: "Pre-flight checks before high-reach or paid use.",
  },
  {
    id: "search-chunk-rag",
    title: "SearchChunk semantic RAG (ingest)",
    location: "src/lib/openai/README.md · npm run ingest",
    readiness: "requires_ingest_for_semantic_rag",
    notes: "Embeddings + DB chunks power /api/search answers when OPENAI_API_KEY + DATABASE_URL + ingest have run; Message Studio does not query it automatically in this packet.",
  },
  {
    id: "queue-ai-json",
    title: "Queue item AI interpretation (advisory JSON)",
    location: "/admin/workbench/email-queue/[id]",
    readiness: "operator_provided_only",
    notes: "Operators paste or summarize approved queue context into Message Studio — no auto-fetch of bodies here.",
  },
  {
    id: "audience-definitions",
    title: "Audience Studio definitions",
    location: "/admin/workbench/email-command-center/audiences",
    readiness: "operator_provided_only",
    notes: "Use approved audience criteria in audience note and Campaign Voice audience frame.",
  },
];

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
