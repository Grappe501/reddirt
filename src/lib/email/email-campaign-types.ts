export type EmailCampaignPurpose =
  | "event_invitation"
  | "event_reminder"
  | "volunteer_ask"
  | "gotv_commitment"
  | "house_party"
  | "fundraising"
  | "county_update"
  | "press_advisory"
  | "thank_you";

export type EmailCampaignDraftStatus =
  | "draft"
  | "needs_review"
  | "approved_for_test"
  | "test_sent"
  | "approved_for_live"
  | "sent"
  | "cancelled";

export type EmailCampaignDraft = {
  id: string;
  title: string;
  purpose: EmailCampaignPurpose;
  audienceFilter: {
    counties?: string[];
    radiusMiles?: number;
    eventId?: string;
    tags?: string[];
    consentRequired: true;
  };
  subject: string;
  previewText?: string;
  html: string;
  text: string;
  fromEmail: string;
  replyTo?: string;
  physicalAddress: string;
  unsubscribeUrl: string;
  status: EmailCampaignDraftStatus;
  aiRecommended: boolean;
  humanApprovedBy?: string;
  createdAt: string;
};

export type EmailSendLogRow = {
  id: string;
  draftId: string;
  kind: "test" | "live_batch" | "blocked";
  status: "sent" | "blocked" | "failed";
  recipients: string[];
  recipientCount: number;
  message?: string;
  createdAt: string;
};

export type EmailSuppressionRow = {
  email: string;
  reason: "unsubscribe" | "bounce" | "spam_report" | "do_not_contact" | "global_suppression" | "manual";
  source: string;
  createdAt: string;
};
