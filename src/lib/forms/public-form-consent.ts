/**
 * Explicit public-form consent → ContactPreference.
 * Never infer OPT_IN from mere form submission.
 */

import { EmailOptInStatus, SmsOptInStatus, type Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";

export type PublicConsentInput = {
  consentEmail?: boolean;
  consentSms?: boolean;
  consentPhone?: boolean;
  phone?: string | null;
  formType: string;
  sourcePage?: string | null;
};

export type ConsentWriteSummary = {
  email: "opt_in" | "opt_out_preserved" | "unchanged" | "reconsent_opt_in" | "skipped";
  sms: "opt_in" | "opt_out_preserved" | "unchanged" | "skipped_no_phone" | "skipped";
  phoneNoted: boolean;
};

function stamp(source: string): string {
  return `${source}@${new Date().toISOString()}`;
}

/**
 * Apply explicit consent only. Preserves OPT_OUT unless explicit re-consent.
 */
export async function applyPublicFormConsent(params: {
  userId: string;
  consent: PublicConsentInput;
}): Promise<ConsentWriteSummary> {
  const { userId, consent } = params;
  const existing = await prisma.contactPreference.findUnique({ where: { userId } });
  const summary: ConsentWriteSummary = {
    email: "skipped",
    sms: "skipped",
    phoneNoted: Boolean(consent.consentPhone),
  };

  let emailStatus = existing?.emailOptInStatus ?? EmailOptInStatus.UNKNOWN;
  let smsStatus = existing?.smsOptInStatus ?? SmsOptInStatus.UNKNOWN;
  const noteParts: string[] = [];
  if (existing?.notes) noteParts.push(existing.notes);

  if (consent.consentEmail === true) {
    if (existing?.emailOptInStatus === EmailOptInStatus.OPT_OUT) {
      emailStatus = EmailOptInStatus.OPT_IN;
      summary.email = "reconsent_opt_in";
      noteParts.push(stamp("public_form_reconsent_email"));
    } else {
      emailStatus = EmailOptInStatus.OPT_IN;
      summary.email = "opt_in";
      noteParts.push(stamp(`public_form_email:${consent.formType}`));
    }
  } else if (existing?.emailOptInStatus === EmailOptInStatus.OPT_OUT) {
    emailStatus = EmailOptInStatus.OPT_OUT;
    summary.email = "opt_out_preserved";
  } else if (consent.consentEmail === false) {
    summary.email = "unchanged";
  } else {
    summary.email = existing ? "unchanged" : "skipped";
  }

  if (consent.consentSms === true) {
    const phone = consent.phone?.trim();
    if (!phone) {
      summary.sms = "skipped_no_phone";
      noteParts.push(stamp("public_form_sms_consent_without_phone"));
    } else if (existing?.smsOptInStatus === SmsOptInStatus.OPT_OUT && existing.smsOptOutAt) {
      smsStatus = SmsOptInStatus.OPT_OUT;
      summary.sms = "opt_out_preserved";
      noteParts.push(stamp("public_form_sms_opt_out_preserved"));
    } else {
      smsStatus = SmsOptInStatus.OPT_IN;
      summary.sms = "opt_in";
      noteParts.push(stamp(`public_form_sms:${consent.formType}`));
    }
  } else if (existing?.smsOptInStatus === SmsOptInStatus.OPT_OUT) {
    smsStatus = SmsOptInStatus.OPT_OUT;
    summary.sms = "opt_out_preserved";
  } else {
    summary.sms = existing ? "unchanged" : "skipped";
  }

  const shouldWrite =
    summary.email === "opt_in" ||
    summary.email === "reconsent_opt_in" ||
    summary.sms === "opt_in" ||
    summary.sms === "skipped_no_phone" ||
    (existing == null && (consent.consentEmail === true || consent.consentSms === true));

  if (!shouldWrite && !existing) {
    return summary;
  }

  if (!shouldWrite && existing && summary.email === "unchanged" && summary.sms === "unchanged") {
    return summary;
  }

  // Always persist when we have an existing row and are preserving opt-out after a form touch with notes
  const data: Prisma.ContactPreferenceUncheckedCreateInput = {
    userId,
    emailOptInStatus: emailStatus,
    smsOptInStatus: smsStatus,
    source: `public_form:${consent.formType}`,
    notes: noteParts.slice(-12).join(" | ").slice(0, 4000),
  };

  await prisma.contactPreference.upsert({
    where: { userId },
    create: data,
    update: {
      emailOptInStatus: emailStatus,
      smsOptInStatus: smsStatus,
      source: data.source,
      notes: data.notes,
    },
  });

  return summary;
}
