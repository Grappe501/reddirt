import { buildEmailProviderReadinessReport } from "@/lib/campaign-events/communications/email-provider-readiness";
import type { TrustLevel } from "../relationship-intelligence/relationship-graph-types";
import { resolveAudienceTone, toneOpening } from "./audience-tone-engine";
import { buildCta } from "./cta-builder";
import { describePurpose } from "./communication-purpose-engine";
import { adaptCountyMessaging } from "./county-message-adapter";
import { relationshipPreamble, adjustToneForRelationship } from "./relationship-tone-adjuster";
import { optimizeSubjectLine } from "./subject-line-optimizer";
import type { OrchestratedDraft, WritingAudience, WritingPurpose } from "./writing-orchestration-types";

export function routeCampaignWriting(input: {
  audience: WritingAudience;
  purpose: WritingPurpose;
  displayName?: string;
  trustLevel?: TrustLevel;
  countySlug?: string;
  countyName?: string;
  eventTitle?: string;
  urgency?: "low" | "medium" | "high";
}): OrchestratedDraft {
  const readiness = buildEmailProviderReadinessReport();
  const urgency = input.urgency ?? "medium";
  let tone = resolveAudienceTone(input.audience, urgency);
  if (input.trustLevel) tone = adjustToneForRelationship(tone, input.trustLevel);

  const county = input.countySlug ? adaptCountyMessaging(input.countySlug) : null;
  const preamble = input.displayName && input.trustLevel
    ? relationshipPreamble(input.trustLevel, input.displayName)
    : toneOpening(tone);

  const purposeLine = describePurpose(input.purpose);
  const countyBlock = county
    ? `\n\nCounty context: ${county.angle}\nPower of 5: ${county.powerOfFiveAsk}\nVolunteers: ${county.volunteerAsk}`
    : "";

  const warnings: string[] = [
    "Human approval required before any send",
    readiness.safety.massEmailBlocked
      ? "Mass send blocked in V1 — use ECC with explicit approval"
      : "Verify EMAIL_SEND_ENABLED before production send",
  ];
  if (input.purpose === "power_of_five" || input.purpose === "county_activation") {
    warnings.push("Political persuasion — campaign manager review required");
  }
  if (!readiness.approvalEmail.sendEnabled) {
    warnings.push("EMAIL_SEND_ENABLED is false — draft only");
  }

  const body = `${preamble}\n\n${purposeLine}.${countyBlock}\n\n${buildCta(input.purpose)}\n\n— Kelly Grappe for Secretary of State (draft — not sent)`;

  return {
    subject: optimizeSubjectLine({
      purpose: input.purpose,
      tone,
      countyName: input.countyName,
      eventTitle: input.eventTitle,
    }),
    previewText: purposeLine.slice(0, 120),
    body,
    cta: buildCta(input.purpose),
    tone,
    warnings,
    humanApprovalRequired: true,
    suggestedTemplateId:
      input.purpose === "host_prep"
        ? "tpl-host-followup"
        : input.purpose === "volunteer_recruitment"
          ? "tpl-volunteer-shift"
          : undefined,
  };
}
