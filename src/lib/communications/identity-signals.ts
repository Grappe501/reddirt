export type IdentitySignalDraft = {
  source: "GMAIL_MESSAGE" | "GOOGLE_CONTACT" | "GOOGLE_CALENDAR_EVENT" | "FORM_INTAKE" | "SENDGRID_EVENT" | "MANUAL";
  signalType: string;
  value: string;
  confidence: number;
  evidenceJson: Record<string, unknown>;
};

export function deriveSignalsFromGmailParticipant(input: {
  normalizedEmail: string;
  displayName: string | null;
  messageId: string;
}): IdentitySignalDraft[] {
  const out: IdentitySignalDraft[] = [];
  out.push({
    source: "GMAIL_MESSAGE",
    signalType: "EMAIL_ADDRESS",
    value: input.normalizedEmail,
    confidence: 0.9,
    evidenceJson: { gmailMessageRecordIdHint: input.messageId, role: "participant" },
  });
  if (input.displayName?.trim()) {
    out.push({
      source: "GMAIL_MESSAGE",
      signalType: "NAME",
      value: input.displayName.trim(),
      confidence: 0.55,
      evidenceJson: { gmailMessageRecordIdHint: input.messageId },
    });
  }
  return out;
}

export function deriveSignalsFromGoogleContactSummary(input: {
  primaryEmail: string | null;
  displayName: string | null;
  resourceName: string;
}): IdentitySignalDraft[] {
  const out: IdentitySignalDraft[] = [];
  if (input.primaryEmail) {
    out.push({
      source: "GOOGLE_CONTACT",
      signalType: "EMAIL_ADDRESS",
      value: input.primaryEmail.trim().toLowerCase(),
      confidence: 0.95,
      evidenceJson: { googleResourceName: input.resourceName },
    });
  }
  if (input.displayName?.trim()) {
    out.push({
      source: "GOOGLE_CONTACT",
      signalType: "NAME",
      value: input.displayName.trim(),
      confidence: 0.7,
      evidenceJson: { googleResourceName: input.resourceName },
    });
  }
  return out;
}

export function deriveSignalsFromCalendarAttendee(input: {
  normalizedEmail: string;
  displayName: string | null;
  googleEventId: string;
}): IdentitySignalDraft[] {
  const out: IdentitySignalDraft[] = [];
  out.push({
    source: "GOOGLE_CALENDAR_EVENT",
    signalType: "EVENT_ATTENDANCE",
    value: input.normalizedEmail,
    confidence: 0.65,
    evidenceJson: { googleEventId: input.googleEventId },
  });
  if (input.displayName?.trim()) {
    out.push({
      source: "GOOGLE_CALENDAR_EVENT",
      signalType: "NAME",
      value: input.displayName.trim(),
      confidence: 0.45,
      evidenceJson: { googleEventId: input.googleEventId },
    });
  }
  return out;
}
