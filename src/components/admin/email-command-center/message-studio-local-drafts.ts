/**
 * EMAIL-MESSAGE-STUDIO-LOCAL-DRAFTS-1.1 + CAMPAIGN-VOICE-1.2 — browser-only persistence (localStorage).
 * No server writes; no secrets.
 */

import {
  getDefaultCampaignVoiceSettings,
  getToneProfileById,
  type MessageStudioCampaignVoiceSettings,
} from "@/lib/email-command-center/campaign-voice";
import {
  defaultEditorialClaimSourceChecklist,
  defaultEditorialComplianceChecklist,
  defaultEditorialVoiceAudienceChecklist,
  type EditorialClaimSourceStatus,
  type EditorialVoiceAudienceStatus,
  type MessageStudioEditorialReviewOwner,
  type MessageStudioEditorialReviewStatus,
} from "@/lib/email-command-center/message-studio-editorial-review-model";

export type { MessageStudioCampaignVoiceSettings };
export type {
  EditorialClaimSourceStatus,
  EditorialVoiceAudienceStatus,
  MessageStudioEditorialReviewOwner,
  MessageStudioEditorialReviewStatus,
};

export const MESSAGE_STUDIO_DRAFTS_STORAGE_KEY = "reddirt:email-command-center:message-studio-drafts:v1";

export type MessageStudioApprovalStatus = "draft" | "needs_review" | "reviewed" | "ready_for_future_send";

export type MessageStudioSourceContext = {
  source: string;
  emailWorkflowItemId: string;
  audienceDefinitionId: string;
  importBatchId: string;
};

export type MessageStudioLocalDraft = {
  id: string;
  /** When set, local edits can be pushed to this shared server row (EMAIL-MESSAGE-STUDIO-SERVER-DRAFTS-1.0). */
  linkedServerDraftId?: string;
  createdAt: string;
  updatedAt: string;
  title: string;
  draftType: string;
  subject: string;
  preheader: string;
  audienceNote: string;
  primaryCta: string;
  /** Legacy display tone; kept in sync with campaign voice tone profile label when possible */
  tone: string;
  approvalStatus: MessageStudioApprovalStatus;
  approvalNotes: string;
  /** Short tag for who owns approval (quality checklist) */
  approvalOwner: string;
  complianceNotes: string;
  sourceContext: MessageStudioSourceContext;
  body: string;
  contentBlocksUsed: string[];
  governanceAcknowledged: boolean;
  campaignVoice: MessageStudioCampaignVoiceSettings;
  /** Last advisory JSON from server AI (not auto-applied to body) */
  lastAiAdvisoryJson: string;
  /** Operator self-check for draft quality panel (advisory only) */
  qualityChecklist: Record<string, boolean>;
  /** EMAIL-EDITORIAL-REVIEW-DESK-1.0 — browser-local editorial workflow */
  editorialReviewStatus: MessageStudioEditorialReviewStatus;
  editorialReviewOwner: MessageStudioEditorialReviewOwner;
  editorialReviewNotes: string;
  editorialClaimSourceChecklist: Record<string, EditorialClaimSourceStatus>;
  editorialVoiceAudienceChecklist: Record<string, EditorialVoiceAudienceStatus>;
  editorialComplianceChecklist: Record<string, boolean>;
  /** Last production template applied (advisory tracking) */
  templateIdLastApplied: string;
  /** History of template ids applied to this draft (most recent last) */
  templatesUsed: string[];
  /** EMAIL-SEND-PACKET-BUILDER-1.0 — last exported snapshot JSON (browser only; no server). */
  lastSendPacketJson: string;
  lastSendPacketGeneratedAt: string;
};

function newId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `draft-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function defaultVoiceToneLabel(): string {
  const p = getToneProfileById(getDefaultCampaignVoiceSettings().toneProfileId);
  return p?.label ?? "Direct and trustworthy";
}

export function createEmptyDraft(overrides?: Partial<MessageStudioLocalDraft>): MessageStudioLocalDraft {
  const now = new Date().toISOString();
  const defCv = getDefaultCampaignVoiceSettings();
  const cv = overrides?.campaignVoice
    ? {
        ...defCv,
        ...overrides.campaignVoice,
        sourceLayers: { ...defCv.sourceLayers, ...overrides.campaignVoice.sourceLayers },
      }
    : defCv;
  const base: MessageStudioLocalDraft = {
    id: newId(),
    createdAt: now,
    updatedAt: now,
    title: "",
    draftType: "",
    subject: "",
    preheader: "",
    audienceNote: "",
    primaryCta: "",
    tone: getToneProfileById(cv.toneProfileId)?.label ?? defaultVoiceToneLabel(),
    approvalStatus: "draft",
    approvalNotes: "",
    approvalOwner: "",
    complianceNotes: "",
    sourceContext: {
      source: "",
      emailWorkflowItemId: "",
      audienceDefinitionId: "",
      importBatchId: "",
    },
    body: "",
    contentBlocksUsed: [],
    governanceAcknowledged: false,
    campaignVoice: cv,
    lastAiAdvisoryJson: "",
    qualityChecklist: {},
    editorialReviewStatus: "editorial_draft",
    editorialReviewOwner: "operator",
    editorialReviewNotes: "",
    editorialClaimSourceChecklist: defaultEditorialClaimSourceChecklist(),
    editorialVoiceAudienceChecklist: defaultEditorialVoiceAudienceChecklist(),
    editorialComplianceChecklist: defaultEditorialComplianceChecklist(),
    templateIdLastApplied: "",
    templatesUsed: [],
    lastSendPacketJson: "",
    lastSendPacketGeneratedAt: "",
  };
  if (!overrides) return base;
  const {
    campaignVoice: ovCv,
    sourceContext: ovSc,
    contentBlocksUsed: ovCb,
    qualityChecklist: _ovQc,
    editorialReviewStatus: _ovErs,
    editorialReviewOwner: _ovEro,
    editorialReviewNotes: _ovErn,
    editorialClaimSourceChecklist: _ovEcc,
    editorialVoiceAudienceChecklist: _ovEvac,
    editorialComplianceChecklist: _ovEcmp,
    ...restOverrides
  } = overrides;
  const mergedCv = ovCv
    ? {
        ...defCv,
        ...ovCv,
        sourceLayers: { ...defCv.sourceLayers, ...ovCv.sourceLayers },
      }
    : base.campaignVoice;
  return {
    ...base,
    ...restOverrides,
    id: overrides.id ?? base.id,
    createdAt: overrides.createdAt ?? base.createdAt,
    updatedAt: overrides.updatedAt ?? now,
    sourceContext: { ...base.sourceContext, ...ovSc },
    contentBlocksUsed: ovCb ? [...ovCb] : [...base.contentBlocksUsed],
    campaignVoice: mergedCv,
    tone: restOverrides.tone ?? getToneProfileById(mergedCv.toneProfileId)?.label ?? base.tone,
    lastAiAdvisoryJson: overrides.lastAiAdvisoryJson ?? base.lastAiAdvisoryJson,
    qualityChecklist:
      overrides.qualityChecklist !== undefined
        ? { ...base.qualityChecklist, ...overrides.qualityChecklist }
        : { ...base.qualityChecklist },
    editorialReviewStatus: overrides.editorialReviewStatus ?? base.editorialReviewStatus,
    editorialReviewOwner: overrides.editorialReviewOwner ?? base.editorialReviewOwner,
    editorialReviewNotes: overrides.editorialReviewNotes ?? base.editorialReviewNotes,
    editorialClaimSourceChecklist:
      overrides.editorialClaimSourceChecklist !== undefined
        ? { ...base.editorialClaimSourceChecklist, ...overrides.editorialClaimSourceChecklist }
        : { ...base.editorialClaimSourceChecklist },
    editorialVoiceAudienceChecklist:
      overrides.editorialVoiceAudienceChecklist !== undefined
        ? { ...base.editorialVoiceAudienceChecklist, ...overrides.editorialVoiceAudienceChecklist }
        : { ...base.editorialVoiceAudienceChecklist },
    editorialComplianceChecklist:
      overrides.editorialComplianceChecklist !== undefined
        ? { ...base.editorialComplianceChecklist, ...overrides.editorialComplianceChecklist }
        : { ...base.editorialComplianceChecklist },
    templateIdLastApplied: overrides.templateIdLastApplied ?? base.templateIdLastApplied,
    templatesUsed: overrides.templatesUsed !== undefined ? [...overrides.templatesUsed] : [...base.templatesUsed],
    lastSendPacketJson: overrides.lastSendPacketJson ?? base.lastSendPacketJson,
    lastSendPacketGeneratedAt: overrides.lastSendPacketGeneratedAt ?? base.lastSendPacketGeneratedAt,
    linkedServerDraftId: overrides.linkedServerDraftId ?? base.linkedServerDraftId,
  };
}

function normalizeSourceLayers(
  raw: unknown,
  base: MessageStudioCampaignVoiceSettings["sourceLayers"],
): MessageStudioCampaignVoiceSettings["sourceLayers"] {
  if (!raw || typeof raw !== "object") return { ...base };
  const r = raw as Record<string, unknown>;
  return {
    campaignMission: r.campaignMission === true,
    priorWriting: r.priorWriting === true,
    queueItemContext: r.queueItemContext === true,
    audienceContext: r.audienceContext === true,
    profileFacts: r.profileFacts === true,
    importSource: r.importSource === true,
    sendgridCompliance: r.sendgridCompliance === true,
  };
}

function normalizeClaimChecklist(raw: unknown): Record<string, EditorialClaimSourceStatus> {
  const def = defaultEditorialClaimSourceChecklist();
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return def;
  const o = raw as Record<string, unknown>;
  const out = { ...def };
  for (const k of Object.keys(def)) {
    const v = o[k];
    if (v === "clear" || v === "needs_source" || v === "remove" || v === "needs_approval") {
      out[k] = v;
    }
  }
  return out;
}

function normalizeVoiceChecklist(raw: unknown): Record<string, EditorialVoiceAudienceStatus> {
  const def = defaultEditorialVoiceAudienceChecklist();
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return def;
  const o = raw as Record<string, unknown>;
  const out = { ...def };
  for (const k of Object.keys(def)) {
    const v = o[k];
    if (v === "clear" || v === "needs_attention" || v === "n_a") {
      out[k] = v;
    }
  }
  return out;
}

function normalizeComplianceChecklist(raw: unknown): Record<string, boolean> {
  const def = defaultEditorialComplianceChecklist();
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return def;
  const o = raw as Record<string, unknown>;
  const out = { ...def };
  for (const k of Object.keys(def)) {
    if (o[k] === true) out[k] = true;
  }
  return out;
}

function normalizeCampaignVoice(raw: unknown): MessageStudioCampaignVoiceSettings {
  const def = getDefaultCampaignVoiceSettings();
  if (!raw || typeof raw !== "object") return def;
  const c = raw as Record<string, unknown>;
  const risk = c.riskLevel === "low" || c.riskLevel === "elevated" ? c.riskLevel : "standard";
  const al = [
    "coordinator",
    "comms_lead",
    "dual_signoff",
    "finance_counsel",
    "candidate_final",
  ].includes(String(c.approvalLevel))
    ? (c.approvalLevel as MessageStudioCampaignVoiceSettings["approvalLevel"])
    : def.approvalLevel;
  return {
    toneProfileId: typeof c.toneProfileId === "string" ? c.toneProfileId : def.toneProfileId,
    issueFrameId: typeof c.issueFrameId === "string" ? c.issueFrameId : def.issueFrameId,
    audienceFrameId: typeof c.audienceFrameId === "string" ? c.audienceFrameId : def.audienceFrameId,
    ctaFrameId: typeof c.ctaFrameId === "string" ? c.ctaFrameId : def.ctaFrameId,
    riskLevel: risk,
    approvalLevel: al,
    sourceLayers: normalizeSourceLayers(c.sourceLayers, def.sourceLayers),
  };
}

function normalizeDraft(raw: unknown): MessageStudioLocalDraft | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const sc = (o.sourceContext as Record<string, unknown>) || {};
  const approval = o.approvalStatus;
  const statuses: MessageStudioApprovalStatus[] = ["draft", "needs_review", "reviewed", "ready_for_future_send"];
  const approvalStatus = statuses.includes(approval as MessageStudioApprovalStatus)
    ? (approval as MessageStudioApprovalStatus)
    : "draft";
  const ers = o.editorialReviewStatus;
  const editorialStatuses: MessageStudioEditorialReviewStatus[] = [
    "editorial_draft",
    "editorial_needs_edits",
    "editorial_ready_comms",
    "editorial_ready_principal",
    "editorial_ready_send_governance",
  ];
  const editorialReviewStatus = editorialStatuses.includes(ers as MessageStudioEditorialReviewStatus)
    ? (ers as MessageStudioEditorialReviewStatus)
    : "editorial_draft";
  const ero = o.editorialReviewOwner;
  const editorialOwners: MessageStudioEditorialReviewOwner[] = [
    "operator",
    "comms_lead",
    "candidate_principal",
    "legal_compliance",
    "finance_fundraising",
    "field_organizing",
  ];
  const editorialReviewOwner = editorialOwners.includes(ero as MessageStudioEditorialReviewOwner)
    ? (ero as MessageStudioEditorialReviewOwner)
    : "operator";
  const id = typeof o.id === "string" ? o.id : null;
  if (!id) return null;
  const now = new Date().toISOString();
  const campaignVoice = normalizeCampaignVoice(o.campaignVoice);
  const toneProfile = getToneProfileById(campaignVoice.toneProfileId);
  return {
    id,
    createdAt: typeof o.createdAt === "string" ? o.createdAt : now,
    updatedAt: typeof o.updatedAt === "string" ? o.updatedAt : now,
    title: typeof o.title === "string" ? o.title : "",
    draftType: typeof o.draftType === "string" ? o.draftType : "",
    subject: typeof o.subject === "string" ? o.subject : "",
    preheader: typeof o.preheader === "string" ? o.preheader : "",
    audienceNote: typeof o.audienceNote === "string" ? o.audienceNote : "",
    primaryCta: typeof o.primaryCta === "string" ? o.primaryCta : "",
    tone: typeof o.tone === "string" ? o.tone : toneProfile?.label ?? defaultVoiceToneLabel(),
    approvalStatus,
    approvalNotes: typeof o.approvalNotes === "string" ? o.approvalNotes : "",
    approvalOwner: typeof o.approvalOwner === "string" ? o.approvalOwner : "",
    complianceNotes: typeof o.complianceNotes === "string" ? o.complianceNotes : "",
    sourceContext: {
      source: typeof sc.source === "string" ? sc.source : "",
      emailWorkflowItemId: typeof sc.emailWorkflowItemId === "string" ? sc.emailWorkflowItemId : "",
      audienceDefinitionId: typeof sc.audienceDefinitionId === "string" ? sc.audienceDefinitionId : "",
      importBatchId: typeof sc.importBatchId === "string" ? sc.importBatchId : "",
    },
    body: typeof o.body === "string" ? o.body : "",
    contentBlocksUsed: Array.isArray(o.contentBlocksUsed)
      ? o.contentBlocksUsed.filter((x): x is string => typeof x === "string")
      : [],
    governanceAcknowledged: o.governanceAcknowledged === true,
    campaignVoice,
    lastAiAdvisoryJson: typeof o.lastAiAdvisoryJson === "string" ? o.lastAiAdvisoryJson : "",
    qualityChecklist:
      o.qualityChecklist && typeof o.qualityChecklist === "object" && !Array.isArray(o.qualityChecklist)
        ? Object.fromEntries(
            Object.entries(o.qualityChecklist as Record<string, unknown>).filter(
              ([, v]) => typeof v === "boolean",
            ) as [string, boolean][],
          )
        : {},
    editorialReviewStatus,
    editorialReviewOwner,
    editorialReviewNotes: typeof o.editorialReviewNotes === "string" ? o.editorialReviewNotes : "",
    editorialClaimSourceChecklist: normalizeClaimChecklist(o.editorialClaimSourceChecklist),
    editorialVoiceAudienceChecklist: normalizeVoiceChecklist(o.editorialVoiceAudienceChecklist),
    editorialComplianceChecklist: normalizeComplianceChecklist(o.editorialComplianceChecklist),
    templateIdLastApplied: typeof o.templateIdLastApplied === "string" ? o.templateIdLastApplied : "",
    templatesUsed: Array.isArray(o.templatesUsed)
      ? o.templatesUsed.filter((x): x is string => typeof x === "string").slice(-30)
      : [],
    lastSendPacketJson: typeof o.lastSendPacketJson === "string" ? o.lastSendPacketJson : "",
    lastSendPacketGeneratedAt: typeof o.lastSendPacketGeneratedAt === "string" ? o.lastSendPacketGeneratedAt : "",
    linkedServerDraftId: typeof o.linkedServerDraftId === "string" ? o.linkedServerDraftId : undefined,
  };
}

/** Parse JSON from the client into a normalized local draft (server actions). */
export function parseMessageStudioLocalDraftPayload(raw: unknown): MessageStudioLocalDraft | null {
  return normalizeDraft(raw);
}

export function loadDraftsFromStorage(): MessageStudioLocalDraft[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(MESSAGE_STUDIO_DRAFTS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.map(normalizeDraft).filter((d): d is MessageStudioLocalDraft => d !== null);
  } catch {
    return [];
  }
}

export function saveDraftsToStorage(drafts: MessageStudioLocalDraft[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(MESSAGE_STUDIO_DRAFTS_STORAGE_KEY, JSON.stringify(drafts));
  } catch {
    /* quota or private mode */
  }
}

export function duplicateDraft(d: MessageStudioLocalDraft): MessageStudioLocalDraft {
  const now = new Date().toISOString();
  return createEmptyDraft({
    ...d,
    id: newId(),
    createdAt: now,
    updatedAt: now,
    title: d.title.trim() ? `${d.title.trim()} (copy)` : "Untitled (copy)",
    lastAiAdvisoryJson: "",
    lastSendPacketJson: "",
    lastSendPacketGeneratedAt: "",
  });
}

