"use server";

import { z } from "zod";
import { requireAdminAction } from "@/app/admin/owned-media-auth";
import {
  generateCampaignVoiceEmailDraft,
  reviseCampaignVoiceEmailDraft,
  type CampaignVoiceDraftAiResult,
  type MessageStudioRevisionMode,
} from "@/lib/email-command-center/message-draft-ai";
import type { MessageStudioCampaignVoiceSettings } from "@/lib/email-command-center/campaign-voice";

const sourceLayersSchema = z.object({
  campaignMission: z.boolean(),
  priorWriting: z.boolean(),
  queueItemContext: z.boolean(),
  audienceContext: z.boolean(),
  profileFacts: z.boolean(),
  importSource: z.boolean(),
  sendgridCompliance: z.boolean(),
});

const campaignVoiceSchema = z.object({
  toneProfileId: z.string(),
  issueFrameId: z.string(),
  audienceFrameId: z.string(),
  ctaFrameId: z.string(),
  riskLevel: z.enum(["low", "standard", "elevated"]),
  approvalLevel: z.enum(["coordinator", "comms_lead", "dual_signoff", "finance_counsel", "candidate_final"]),
  sourceLayers: sourceLayersSchema,
});

const generateInputSchema = z.object({
  draftType: z.string().max(400),
  audienceNote: z.string().max(8000),
  subjectGoal: z.string().max(2000),
  primaryCta: z.string().max(800),
  complianceNotes: z.string().max(8000),
  existingBody: z.string().max(120_000),
  campaignVoice: campaignVoiceSchema,
  sourceHints: z.string().max(4000),
  templateSummary: z.string().max(12000).optional(),
});

const reviseInputSchema = z.object({
  mode: z.enum([
    "warmer",
    "shorter",
    "more_urgent",
    "more_plainspoken",
    "for_volunteers",
    "for_donors",
    "for_county",
    "for_press",
    "subject_lines",
    "cta_options",
  ]),
  body: z.string().max(120_000),
  subject: z.string().max(500),
  audienceNote: z.string().max(8000),
  complianceNotes: z.string().max(8000).optional(),
  campaignVoice: campaignVoiceSchema,
});

export type GenerateCampaignVoiceDraftActionResult =
  | { ok: true; result: CampaignVoiceDraftAiResult }
  | { ok: false; error: string };

/** Advisory only — no send, no DB. Requires admin session + OPENAI_API_KEY. */
export async function generateCampaignVoiceDraftAction(
  input: unknown,
): Promise<GenerateCampaignVoiceDraftActionResult> {
  await requireAdminAction();
  const parsed = generateInputSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Invalid request payload." };
  }
  const cv = parsed.data.campaignVoice as MessageStudioCampaignVoiceSettings;
  return generateCampaignVoiceEmailDraft({
    ...parsed.data,
    campaignVoice: cv,
  });
}

export async function reviseCampaignVoiceDraftAction(
  input: unknown,
): Promise<GenerateCampaignVoiceDraftActionResult> {
  await requireAdminAction();
  const parsed = reviseInputSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Invalid request payload." };
  }
  const cv = parsed.data.campaignVoice as MessageStudioCampaignVoiceSettings;
  return reviseCampaignVoiceEmailDraft({
    mode: parsed.data.mode as MessageStudioRevisionMode,
    body: parsed.data.body,
    subject: parsed.data.subject,
    audienceNote: parsed.data.audienceNote,
    complianceNotes: parsed.data.complianceNotes,
    campaignVoice: cv,
  });
}
