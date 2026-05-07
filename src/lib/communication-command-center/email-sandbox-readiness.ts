import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import {
  getCommunicationCommandCenterReadiness,
  resolveApiRouteHandlerPresent,
} from "@/lib/communication-command-center/readiness";
import { getGmailCalendarOAuthReadiness } from "@/lib/communication-command-center/gmail-calendar-readiness";
import { getHostedDbProofSummary } from "@/lib/email-command-center/hosted-db-proof";
import { EMAIL_WORKFLOW_CAN_SEND_FROM_ITEM } from "@/lib/email-workflow/governance";

export const EMAIL_SANDBOX_SEND_READINESS_MODE = "email_sandbox_send_readiness" as const;

function readGmailCalendarContractPass(): boolean {
  try {
    const p = path.join(process.cwd(), "data", "gmail-calendar-oauth-proof-contract.json");
    if (!existsSync(p)) return false;
    const j = JSON.parse(readFileSync(p, "utf8")) as { status?: string };
    return j?.status === "pass";
  } catch {
    return false;
  }
}

export type EmailSandboxReadinessPayload = {
  ok: boolean;
  mode: typeof EMAIL_SANDBOX_SEND_READINESS_MODE;
  preconditions: {
    hostedDbProofPassed: boolean;
    communicationCommandCenterReadinessPassed: boolean;
    gmailCalendarProofPassed: boolean;
  };
  providers: {
    gmail: {
      oauthReady: boolean;
      sendLocked: boolean;
      metadataOnlyFirst: boolean;
    };
    sendgrid: {
      authCheckRoutePresent: boolean;
      sandboxSendRoutePresent: boolean;
      liveSendLocked: boolean;
    };
  };
  safety: {
    bulkSendApproved: boolean;
    gmailLiveSendApproved: boolean;
    sendgridLiveSendApproved: boolean;
    twilioSmsApproved: boolean;
    contactImportApproved: boolean;
    automationWorkersApproved: boolean;
    allowedRecipientMode: "internal_admin_test_only";
    noSendPosture: boolean;
  };
  nextRecommendedStep: string;
};

/**
 * Read-only sandbox email proof readiness. Does not call SendGrid mail/send, Gmail send, or mutate providers.
 */
export async function getEmailSandboxReadiness(): Promise<EmailSandboxReadinessPayload> {
  const gmailCalendarProofPassed = readGmailCalendarContractPass();
  const [hosted, comms, gmailCal] = await Promise.all([
    getHostedDbProofSummary(),
    getCommunicationCommandCenterReadiness(),
    getGmailCalendarOAuthReadiness(),
  ]);

  const hostedDbProofPassed =
    hosted.database.reachable === true && hosted.proof.productionCanonical === true;
  const communicationCommandCenterReadinessPassed = comms.ok === true;

  const sendgridAuthCheckRoutePresent = resolveApiRouteHandlerPresent([
    "admin",
    "email-diagnostics",
    "sendgrid-auth-check",
  ]);
  const sandboxSendRoutePresent = resolveApiRouteHandlerPresent(["admin", "email-diagnostics", "sandbox-send"]);

  const noSendPosture = EMAIL_WORKFLOW_CAN_SEND_FROM_ITEM === false;
  const safety = {
    bulkSendApproved: false,
    gmailLiveSendApproved: false,
    sendgridLiveSendApproved: false,
    twilioSmsApproved: false,
    contactImportApproved: false,
    automationWorkersApproved: false,
    allowedRecipientMode: "internal_admin_test_only" as const,
    noSendPosture,
  };

  const providers = {
    gmail: {
      oauthReady: gmailCal.ok === true && gmailCal.gmail.oauthStartRoutePresent && gmailCal.gmail.oauthCallbackRoutePresent,
      sendLocked: gmailCal.gmail.sendLocked === true,
      metadataOnlyFirst: true,
    },
    sendgrid: {
      authCheckRoutePresent: sendgridAuthCheckRoutePresent,
      sandboxSendRoutePresent: sandboxSendRoutePresent,
      liveSendLocked: true,
    },
  };

  const preconditions = {
    hostedDbProofPassed,
    communicationCommandCenterReadinessPassed,
    gmailCalendarProofPassed,
  };

  const ok =
    preconditions.hostedDbProofPassed &&
    preconditions.communicationCommandCenterReadinessPassed &&
    preconditions.gmailCalendarProofPassed &&
    providers.sendgrid.authCheckRoutePresent &&
    providers.sendgrid.sandboxSendRoutePresent &&
    safety.noSendPosture === true;

  return {
    ok,
    mode: EMAIL_SANDBOX_SEND_READINESS_MODE,
    preconditions,
    providers,
    safety,
    nextRecommendedStep:
      "When headquarters approves, run one internal sandbox proof to a single admin address only. This is not list mail, not volunteer outreach, and not live campaign send.",
  };
}
