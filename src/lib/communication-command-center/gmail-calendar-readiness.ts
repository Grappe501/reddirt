import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { EMAIL_WORKFLOW_CAN_SEND_FROM_ITEM } from "@/lib/email-workflow/governance";

export const GMAIL_CALENDAR_OAUTH_READINESS_MODE = "gmail_calendar_oauth_readiness" as const;

const GMAIL_API_REL = ["src", "lib", "integrations", "gmail", "gmail-api.ts"];

function routeFileExists(segments: string[]): boolean {
  try {
    const base = path.join(process.cwd(), "src", "app", "api", ...segments, "route.ts");
    return existsSync(base);
  } catch {
    return false;
  }
}

function detectGmailSendCapabilityInRepo(): boolean {
  try {
    const p = path.join(process.cwd(), ...GMAIL_API_REL);
    if (!existsSync(p)) return false;
    const src = readFileSync(p, "utf8");
    const needle = ["users", "messages", "send"].join(".");
    return src.includes(needle);
  } catch {
    return false;
  }
}

export type GmailCalendarOAuthReadinessPayload = {
  ok: boolean;
  mode: typeof GMAIL_CALENDAR_OAUTH_READINESS_MODE;
  gmail: {
    oauthStartRoutePresent: boolean;
    oauthCallbackRoutePresent: boolean;
    pubsubRoutePresent: boolean;
    sendFunctionDetected: boolean;
    sendLocked: boolean;
    metadataReadiness: "ready_to_test" | "routes_incomplete";
    tokenStorageReadiness: "ready_to_test" | "routes_incomplete";
    nextStep: string;
  };
  calendar: {
    callbackRoutePresent: boolean;
    cronSyncRoutePresent: boolean;
    webhookRoutePresent: boolean;
    readiness: "ready_to_test" | "routes_incomplete";
    nextStep: string;
  };
  safety: {
    gmailSendApproved: boolean;
    sendgridLiveSendApproved: boolean;
    twilioSmsApproved: boolean;
    contactImportApproved: boolean;
    automationWorkersApproved: boolean;
    noSendPosture: boolean;
  };
  nextRecommendedStep: string;
};

/**
 * Static, read-only readiness for Gmail + Google Calendar OAuth surfaces.
 * Does not call Google APIs, mutate OAuth state, or send messages.
 */
export async function getGmailCalendarOAuthReadiness(): Promise<GmailCalendarOAuthReadinessPayload> {
  const oauthStartRoutePresent = routeFileExists(["gmail", "oauth", "start"]);
  const oauthCallbackRoutePresent = routeFileExists(["gmail", "oauth", "callback"]);
  const pubsubRoutePresent = routeFileExists(["gmail", "pubsub"]);

  const callbackRoutePresent = routeFileExists(["calendar", "google", "callback"]);
  const cronSyncRoutePresent = routeFileExists(["calendar", "google", "cron-sync"]);
  const webhookRoutePresent = routeFileExists(["calendar", "google", "webhook"]);

  const sendFunctionDetected = detectGmailSendCapabilityInRepo();
  const sendLocked = EMAIL_WORKFLOW_CAN_SEND_FROM_ITEM === false;

  const gmailRoutesOk = oauthStartRoutePresent && oauthCallbackRoutePresent && pubsubRoutePresent;
  const gmailMeta: GmailCalendarOAuthReadinessPayload["gmail"]["metadataReadiness"] = gmailRoutesOk
    ? "ready_to_test"
    : "routes_incomplete";
  const gmailToken: GmailCalendarOAuthReadinessPayload["gmail"]["tokenStorageReadiness"] = oauthCallbackRoutePresent
    ? "ready_to_test"
    : "routes_incomplete";

  const calendarRoutesOk = callbackRoutePresent && cronSyncRoutePresent && webhookRoutePresent;
  const calendarReadiness: GmailCalendarOAuthReadinessPayload["calendar"]["readiness"] = calendarRoutesOk
    ? "ready_to_test"
    : "routes_incomplete";

  const noSendPosture = EMAIL_WORKFLOW_CAN_SEND_FROM_ITEM === false;
  const safety = {
    gmailSendApproved: false,
    sendgridLiveSendApproved: false,
    twilioSmsApproved: false,
    contactImportApproved: false,
    automationWorkersApproved: false,
    noSendPosture,
  };

  const ok = gmailRoutesOk && calendarRoutesOk && noSendPosture === true;

  return {
    ok,
    mode: GMAIL_CALENDAR_OAUTH_READINESS_MODE,
    gmail: {
      oauthStartRoutePresent,
      oauthCallbackRoutePresent,
      pubsubRoutePresent,
      sendFunctionDetected,
      sendLocked,
      metadataReadiness: gmailMeta,
      tokenStorageReadiness: gmailToken,
      nextStep:
        "Open the Gmail OAuth start route in the browser on this site, complete Google consent for the campaign inbox, then confirm the callback succeeds. No emails are sent from this proof.",
    },
    calendar: {
      callbackRoutePresent,
      cronSyncRoutePresent,
      webhookRoutePresent,
      readiness: calendarReadiness,
      nextStep:
        "In Workbench → Calendar, connect Google Calendar and complete consent so the callback route stores tokens. Calendar proof starts read-only; event writes stay gated separately.",
    },
    safety,
    nextRecommendedStep:
      "Run operator OAuth connection proof for Gmail, then Calendar. Sending, SendGrid delivery, Twilio SMS, imports, and workers remain locked.",
  };
}
