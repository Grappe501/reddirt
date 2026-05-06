/**
 * EMAIL-SEND-PACKET-BUILDER-1.0 — client-side review artifact only.
 * No send, no server persistence, no DB.
 */

import type { MessageStudioLocalDraft } from "@/components/admin/email-command-center/message-studio-local-drafts";
import {
  AUDIENCE_FRAMES,
  CTA_FRAMES,
  ISSUE_FRAMES,
  TONE_PROFILES,
} from "@/lib/email-command-center/campaign-voice";
import {
  CLAIM_SOURCE_IDS,
  COMPLIANCE_IDS,
  computeEditorialBlockers,
  computeEditorialReadinessTier,
  inferFutureSendRail,
  type EditorialReadinessTier,
} from "@/lib/email-command-center/message-studio-editorial-review-model";
import { safeParseCampaignVoiceAdvisoryJson } from "@/lib/email-command-center/message-studio-advisory-json";

export const SEND_PACKET_SUPPRESSION_KEYS = [
  "audience_source_reviewed",
  "imported_contacts_consent_reviewed",
  "suppression_scan_required_before_send",
  "unsubscribes_must_be_excluded",
  "bounces_spam_complaints_excluded",
  "final_send_list_not_generated_here",
] as const;

export const SEND_PACKET_APPROVAL_KEYS = [
  "operator_reviewed",
  "comms_reviewed",
  "candidate_principal_if_needed",
  "legal_compliance_if_needed",
  "finance_if_fundraising",
  "final_send_operator_not_authorized",
] as const;

export type SendPacketSuppressionKey = (typeof SEND_PACKET_SUPPRESSION_KEYS)[number];
export type SendPacketApprovalKey = (typeof SEND_PACKET_APPROVAL_KEYS)[number];

export type MessageStudioSendPacketPreSendChecklist = {
  subjectPresent: boolean;
  preheaderPresent: boolean;
  bodyPresent: boolean;
  ctaPresent: boolean;
  audienceContextPresent: boolean;
  approvalOwnerSelected: boolean;
  editorialReviewStatusReady: boolean;
  editorialClaimSourceRowsClear: boolean;
  complianceRemindersAcknowledged: boolean;
  sendGovernanceRequired: true;
};

/** Subset of Message Studio AI advisory JSON for operator review packets (no secrets). */
export type MessageStudioSendPacketAiDigest = {
  advisoryPosture: string;
  uncertaintyNotes: string[];
  sourceBackedBullets: string[];
  suggestedLanguageOnly: string[];
  operatorReviewTasks: string[];
  unsupportedClaimsTagged: string;
};

export type MessageStudioSendPacket = {
  packetId: string;
  generatedAt: string;
  draftId: string;
  draftTitle: string;
  draftType: string;
  subject: string;
  preheader: string;
  body: string;
  primaryCta: string;
  audienceNote: string;
  sourceContext: MessageStudioLocalDraft["sourceContext"];
  campaignVoice: MessageStudioLocalDraft["campaignVoice"];
  toneLabel: string;
  issueFrameLabel: string;
  audienceFrameLabel: string;
  ctaFrameLabel: string;
  templateIdLastApplied: string;
  templatesUsed: string[];
  editorialReviewStatus: MessageStudioLocalDraft["editorialReviewStatus"];
  editorialReviewOwner: MessageStudioLocalDraft["editorialReviewOwner"];
  editorialReadinessTier: EditorialReadinessTier;
  editorialBlockers: string[];
  approvalStatus: MessageStudioLocalDraft["approvalStatus"];
  approvalNotes: string;
  complianceNotes: string;
  riskLevel: MessageStudioLocalDraft["campaignVoice"]["riskLevel"];
  futureSendRail: string;
  /** Parsed from `lastAiAdvisoryJson` when present — advisory only */
  messageStudioAiDigest: MessageStudioSendPacketAiDigest | null;
  suppressionChecklist: Record<SendPacketSuppressionKey, boolean>;
  approvalChecklist: Record<SendPacketApprovalKey, boolean>;
  preSendChecklist: MessageStudioSendPacketPreSendChecklist;
  operatorNotes: string;
  sendGovernanceRequired: true;
  canSendFromPacket: false;
  canSendFromQueue: false;
};

function newPacketId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `send-packet-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function defaultSuppression(): Record<SendPacketSuppressionKey, boolean> {
  return Object.fromEntries(SEND_PACKET_SUPPRESSION_KEYS.map((k) => [k, false])) as Record<
    SendPacketSuppressionKey,
    boolean
  >;
}

function defaultApproval(): Record<SendPacketApprovalKey, boolean> {
  return Object.fromEntries(SEND_PACKET_APPROVAL_KEYS.map((k) => [k, false])) as Record<SendPacketApprovalKey, boolean>;
}

function derivePreSendChecklist(d: MessageStudioLocalDraft): MessageStudioSendPacketPreSendChecklist {
  const subjectPresent = d.subject.trim().length >= 3;
  const preheaderPresent = d.preheader.trim().length >= 1;
  const bodyPresent = d.body.trim().length >= 40;
  const ctaPresent = d.primaryCta.trim().length >= 2;
  const audienceContextPresent = d.audienceNote.trim().length >= 10;
  const approvalOwnerSelected = d.approvalOwner.trim().length >= 1;
  const editorialReviewStatusReady = d.editorialReviewStatus === "editorial_ready_send_governance";
  const editorialClaimSourceRowsClear = CLAIM_SOURCE_IDS.every((id) => (d.editorialClaimSourceChecklist[id] ?? "clear") === "clear");
  const complianceRemindersAcknowledged = COMPLIANCE_IDS.every((id) => d.editorialComplianceChecklist[id] === true);
  return {
    subjectPresent,
    preheaderPresent,
    bodyPresent,
    ctaPresent,
    audienceContextPresent,
    approvalOwnerSelected,
    editorialReviewStatusReady,
    editorialClaimSourceRowsClear,
    complianceRemindersAcknowledged,
    sendGovernanceRequired: true,
  };
}

export type BuildSendPacketOptions = {
  suppressionChecklist?: Partial<Record<SendPacketSuppressionKey, boolean>>;
  approvalChecklist?: Partial<Record<SendPacketApprovalKey, boolean>>;
  operatorNotes?: string;
};

function buildAiDigestFromDraft(d: MessageStudioLocalDraft): MessageStudioSendPacketAiDigest | null {
  const adv = safeParseCampaignVoiceAdvisoryJson(d.lastAiAdvisoryJson);
  if (!adv) return null;
  const hasAny =
    adv.advisoryPosture.trim() ||
    adv.uncertaintyNotes.length ||
    adv.sourceBackedBullets.length ||
    adv.suggestedLanguageOnly.length ||
    adv.operatorReviewTasks.length ||
    adv.unsupportedClaimsTagged.trim();
  if (!hasAny) return null;
  return {
    advisoryPosture: adv.advisoryPosture.trim(),
    uncertaintyNotes: adv.uncertaintyNotes,
    sourceBackedBullets: adv.sourceBackedBullets,
    suggestedLanguageOnly: adv.suggestedLanguageOnly,
    operatorReviewTasks: adv.operatorReviewTasks,
    unsupportedClaimsTagged: adv.unsupportedClaimsTagged.trim(),
  };
}

export function buildMessageStudioSendPacket(
  d: MessageStudioLocalDraft,
  options: BuildSendPacketOptions = {},
): MessageStudioSendPacket {
  const tier = computeEditorialReadinessTier(d);
  const blockers = computeEditorialBlockers(d);
  const suppressionChecklist = { ...defaultSuppression(), ...options.suppressionChecklist };
  const approvalChecklist = { ...defaultApproval(), ...options.approvalChecklist };

  return {
    packetId: newPacketId(),
    generatedAt: new Date().toISOString(),
    draftId: d.id,
    draftTitle: d.title,
    draftType: d.draftType,
    subject: d.subject,
    preheader: d.preheader,
    body: d.body,
    primaryCta: d.primaryCta,
    audienceNote: d.audienceNote,
    sourceContext: { ...d.sourceContext },
    campaignVoice: { ...d.campaignVoice, sourceLayers: { ...d.campaignVoice.sourceLayers } },
    toneLabel: TONE_PROFILES.find((t) => t.id === d.campaignVoice.toneProfileId)?.label ?? d.tone,
    issueFrameLabel: ISSUE_FRAMES.find((f) => f.id === d.campaignVoice.issueFrameId)?.label ?? "—",
    audienceFrameLabel: AUDIENCE_FRAMES.find((f) => f.id === d.campaignVoice.audienceFrameId)?.label ?? "—",
    ctaFrameLabel: CTA_FRAMES.find((f) => f.id === d.campaignVoice.ctaFrameId)?.label ?? "—",
    templateIdLastApplied: d.templateIdLastApplied,
    templatesUsed: [...d.templatesUsed],
    editorialReviewStatus: d.editorialReviewStatus,
    editorialReviewOwner: d.editorialReviewOwner,
    editorialReadinessTier: tier,
    editorialBlockers: blockers,
    approvalStatus: d.approvalStatus,
    approvalNotes: d.approvalNotes,
    complianceNotes: d.complianceNotes,
    riskLevel: d.campaignVoice.riskLevel,
    futureSendRail: inferFutureSendRail(`${d.draftType}\n${d.title}`.trim() || "message"),
    messageStudioAiDigest: buildAiDigestFromDraft(d),
    suppressionChecklist,
    approvalChecklist,
    preSendChecklist: derivePreSendChecklist(d),
    operatorNotes: options.operatorNotes ?? "",
    sendGovernanceRequired: true,
    canSendFromPacket: false,
    canSendFromQueue: false,
  };
}

export function buildSendPacketSummaryText(p: MessageStudioSendPacket): string {
  const pre = p.preSendChecklist;
  const lines = [
    `Send packet ${p.packetId}`,
    `Generated: ${p.generatedAt}`,
    `Draft: ${p.draftTitle || "(untitled)"} · id ${p.draftId}`,
    `Type: ${p.draftType || "—"}`,
    `Future send rail (advisory): ${p.futureSendRail}`,
    `Editorial tier: ${p.editorialReadinessTier} · owner: ${p.editorialReviewOwner.replace(/_/g, " ")} · status: ${p.editorialReviewStatus.replace(/_/g, " ")}`,
    `Campaign voice: ${p.toneLabel} · ${p.issueFrameLabel} · audience ${p.audienceFrameLabel} · CTA frame ${p.ctaFrameLabel} · risk ${p.riskLevel}`,
    p.templateIdLastApplied.trim() ? `Last template id: ${p.templateIdLastApplied}` : "Last template: —",
    "",
    "Pre-send completeness (derived from draft):",
    `  subject: ${pre.subjectPresent ? "ok" : "missing"}`,
    `  preheader: ${pre.preheaderPresent ? "ok" : "missing"}`,
    `  body: ${pre.bodyPresent ? "ok" : "thin"}`,
    `  CTA: ${pre.ctaPresent ? "ok" : "missing"}`,
    `  audience/context: ${pre.audienceContextPresent ? "ok" : "thin"}`,
    `  approval owner: ${pre.approvalOwnerSelected ? "ok" : "missing"}`,
    `  editorial status send-governance: ${pre.editorialReviewStatusReady ? "yes" : "no"}`,
    `  claim/source rows clear: ${pre.editorialClaimSourceRowsClear ? "yes" : "no"}`,
    `  compliance reminders: ${pre.complianceRemindersAcknowledged ? "all ack" : "incomplete"}`,
    "",
    "Blockers (advisory):",
    ...(p.editorialBlockers.length ? p.editorialBlockers.map((b) => `  - ${b}`) : ["  (none listed)"]),
    "",
    ...(p.messageStudioAiDigest
      ? [
          "Message Studio AI digest (advisory — verify before any future send):",
          p.messageStudioAiDigest.advisoryPosture
            ? `  Posture: ${p.messageStudioAiDigest.advisoryPosture}`
            : "  Posture: —",
          ...(p.messageStudioAiDigest.uncertaintyNotes.length
            ? p.messageStudioAiDigest.uncertaintyNotes.map((u) => `  Uncertainty: ${u}`)
            : []),
          ...(p.messageStudioAiDigest.operatorReviewTasks.length
            ? p.messageStudioAiDigest.operatorReviewTasks.map((t) => `  Task: ${t}`)
            : []),
          ...(p.messageStudioAiDigest.unsupportedClaimsTagged
            ? [`  Unsupported / verify: ${p.messageStudioAiDigest.unsupportedClaimsTagged}`]
            : []),
          "",
        ]
      : []),
    "Operator notes:",
    p.operatorNotes.trim() || "  —",
    "",
    "Governance: sendGovernanceRequired=true · canSendFromPacket=false · canSendFromQueue=false",
  ];
  return lines.join("\n");
}

export function buildSendPacketPlainText(p: MessageStudioSendPacket): string {
  return [
    buildSendPacketSummaryText(p),
    "",
    "--- Subject ---",
    p.subject || "(empty)",
    "",
    "--- Preheader ---",
    p.preheader || "(empty)",
    "",
    "--- Body ---",
    p.body || "(empty)",
    "",
    "--- Primary CTA ---",
    p.primaryCta || "(empty)",
  ].join("\n");
}
