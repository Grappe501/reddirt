import { getCommunicationCommandCenterReadiness } from "@/lib/communication-command-center/readiness";
import { getEmailSandboxReadiness } from "@/lib/communication-command-center/email-sandbox-readiness";
import { getGmailCalendarOAuthReadiness } from "@/lib/communication-command-center/gmail-calendar-readiness";
import { EMAIL_WORKFLOW_CAN_SEND_FROM_ITEM } from "@/lib/email-workflow/governance";

export const GMAIL_CALENDAR_OPERATOR_PROOF_MODE = "gmail_calendar_operator_proof" as const;

export type GmailCalendarOperatorProofPayload = {
  ok: boolean;
  mode: typeof GMAIL_CALENDAR_OPERATOR_PROOF_MODE;
  preconditions: {
    communicationCommandCenterReadinessPassed: boolean;
    gmailCalendarReadinessPassed: boolean;
    emailSandboxReadinessPassed: boolean;
    noSendPosture: boolean;
  };
  gmail: {
    oauthStartUrl: string;
    oauthStartReady: boolean;
    oauthCallbackReady: boolean;
    pubsubReady: boolean;
    connectionStatus: "ready_for_operator_connection" | "not_ready";
    metadataReadProofReady: boolean;
    sendLocked: boolean;
    operatorStep: string;
  };
  calendar: {
    callbackReady: boolean;
    cronSyncReady: boolean;
    webhookReady: boolean;
    connectionStatus: "ready_for_operator_connection" | "not_ready";
    readProofReady: boolean;
    eventWritesLocked: boolean;
    operatorStep: string;
  };
  safety: {
    gmailSendApproved: boolean;
    sendgridLiveSendApproved: boolean;
    twilioSmsApproved: boolean;
    contactImportApproved: boolean;
    automationWorkersApproved: boolean;
    calendarEventWriteApproved: boolean;
    noSendPosture: boolean;
  };
  nextRecommendedStep: string;
};

const GMAIL_STEP =
  "Open Gmail OAuth start and connect the campaign inbox. This proof must read metadata only — no blast send, no mailing list.";
const CAL_STEP =
  "Connect Google Calendar and verify calendar read and sync only. Creating or changing many events stays off until headquarters approves that separately.";
const NEXT_OK =
  "Operator connects Gmail first, then Calendar. Record callback results in your runbook (redacted — no tokens). Do not send email.";
const NEXT_BLOCKED =
  "Fix any red readiness gate first (Communication Command Center, Gmail + Calendar readiness, or email sandbox readiness). Sending stays locked until a separate approval slice.";

/**
 * Read-only operator proof gate: aggregates hosted readiness only. No Google API calls, no OAuth redirects, no sends.
 */
export async function getGmailCalendarOperatorProof(): Promise<GmailCalendarOperatorProofPayload> {
  const [comms, gmailCal, emailSandbox] = await Promise.all([
    getCommunicationCommandCenterReadiness(),
    getGmailCalendarOAuthReadiness(),
    getEmailSandboxReadiness(),
  ]);

  const noSendPosture = EMAIL_WORKFLOW_CAN_SEND_FROM_ITEM === false;
  const communicationCommandCenterReadinessPassed = comms.ok === true;
  const gmailCalendarReadinessPassed = gmailCal.ok === true;
  const emailSandboxReadinessPassed = emailSandbox.ok === true;

  const preconditions = {
    communicationCommandCenterReadinessPassed,
    gmailCalendarReadinessPassed,
    emailSandboxReadinessPassed,
    noSendPosture,
  };

  const preOk = Object.values(preconditions).every(Boolean);

  const g = gmailCal.gmail;
  const c = gmailCal.calendar;
  const gmailRoutesOk = g.oauthStartRoutePresent && g.oauthCallbackRoutePresent && g.pubsubRoutePresent;
  const calendarRoutesOk = c.callbackRoutePresent && c.cronSyncRoutePresent && c.webhookRoutePresent;

  const gmailConnectionStatus: GmailCalendarOperatorProofPayload["gmail"]["connectionStatus"] =
    preOk && gmailRoutesOk ? "ready_for_operator_connection" : "not_ready";
  const calendarConnectionStatus: GmailCalendarOperatorProofPayload["calendar"]["connectionStatus"] =
    preOk && calendarRoutesOk ? "ready_for_operator_connection" : "not_ready";

  const safety = {
    gmailSendApproved: false,
    sendgridLiveSendApproved: false,
    twilioSmsApproved: false,
    contactImportApproved: false,
    automationWorkersApproved: false,
    calendarEventWriteApproved: false,
    noSendPosture,
  };

  return {
    ok: preOk,
    mode: GMAIL_CALENDAR_OPERATOR_PROOF_MODE,
    preconditions,
    gmail: {
      oauthStartUrl: "/api/gmail/oauth/start",
      oauthStartReady: g.oauthStartRoutePresent,
      oauthCallbackReady: g.oauthCallbackRoutePresent,
      pubsubReady: g.pubsubRoutePresent,
      connectionStatus: gmailConnectionStatus,
      metadataReadProofReady: preOk && gmailRoutesOk && g.sendLocked,
      sendLocked: g.sendLocked,
      operatorStep: GMAIL_STEP,
    },
    calendar: {
      callbackReady: c.callbackRoutePresent,
      cronSyncReady: c.cronSyncRoutePresent,
      webhookReady: c.webhookRoutePresent,
      connectionStatus: calendarConnectionStatus,
      readProofReady: preOk && calendarRoutesOk,
      eventWritesLocked: true,
      operatorStep: CAL_STEP,
    },
    safety,
    nextRecommendedStep: preOk ? NEXT_OK : NEXT_BLOCKED,
  };
}
