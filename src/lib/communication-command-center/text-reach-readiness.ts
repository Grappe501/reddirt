import { getCommunicationCommandCenterReadiness } from "@/lib/communication-command-center/readiness";
import { getRelationalOrganizingReadinessSnapshot } from "@/lib/people/relational-organizing-readiness";
import { getTextCommandCenterReadinessSnapshot } from "@/lib/texting/text-command-center-readiness";
import { EMAIL_WORKFLOW_CAN_SEND_FROM_ITEM } from "@/lib/email-workflow/governance";

export const TEXT_REACH_FOUNDATION_READINESS_MODE = "text_reach_foundation_readiness" as const;

export type TextReachFoundationReadinessPayload = {
  ok: boolean;
  mode: typeof TEXT_REACH_FOUNDATION_READINESS_MODE;
  texting: {
    status: "foundation_ready" | "setup_needed";
    twilioWebhookReady: boolean;
    smsSendingLocked: boolean;
    stopHelpComplianceRequired: boolean;
    stopHelpHandlingDetected: boolean;
    audienceBuilderPlanned: boolean;
    replyInboxPlanned: boolean;
    nextStep: string;
  };
  relationalOrganizing: {
    status: "foundation_ready" | "setup_needed";
    peopleGraphAvailable: boolean;
    manualRelationshipEntryPlanned: boolean;
    volunteerFollowUpPlanned: boolean;
    actionCardsPlanned: boolean;
    nextStep: string;
  };
  followUpCockpit: {
    status: "foundation_ready" | "setup_needed";
    messageFollowUpsPlanned: boolean;
    volunteerFollowUpsPlanned: boolean;
    eventFollowUpsPlanned: boolean;
    nextStep: string;
  };
  safety: {
    twilioSmsApproved: boolean;
    bulkSmsApproved: boolean;
    contactImportApproved: boolean;
    automationWorkersApproved: boolean;
    liveEmailApproved: boolean;
    calendarEventWriteApproved: boolean;
    noSendPosture: boolean;
  };
  nextRecommendedStep: string;
};

const TEXT_NEXT_OK =
  "Build the no-send Text Command Center cockpit, then connect Twilio webhooks before any SMS is approved.";
const REL_NEXT_OK =
  "Build a volunteer-facing relationship entry flow and staff review queue.";
const FOLLOW_NEXT_OK =
  "Create a unified follow-up queue for people, messages, events, and volunteer asks.";
const TOP_NEXT_OK =
  "Build the no-send Text Command Center cockpit and RedDirt Reach MVP shell.";
const TOP_NEXT_BLOCKED =
  "Finish Communication Command Center hosted readiness first (database, tables, routes, no-send posture).";

/**
 * Read-only Text + Reach foundation readiness. No Twilio sends, no SMS, no imports, no worker activation.
 */
export async function getTextReachFoundationReadiness(): Promise<TextReachFoundationReadinessPayload> {
  const [comms, textingSnap, relationalSnap] = await Promise.all([
    getCommunicationCommandCenterReadiness(),
    Promise.resolve(getTextCommandCenterReadinessSnapshot()),
    getRelationalOrganizingReadinessSnapshot(),
  ]);

  const noSendPosture = EMAIL_WORKFLOW_CAN_SEND_FROM_ITEM === false;
  const twilioWebhookReady = textingSnap.twilioWebhookRouteReady && comms.routes.twilioWebhook === true;
  const smsSendingLocked = comms.safety.twilioSmsApproved === false && noSendPosture;

  const textingStatus: TextReachFoundationReadinessPayload["texting"]["status"] =
    comms.ok && twilioWebhookReady && smsSendingLocked ? "foundation_ready" : "setup_needed";

  const relationalStatus: TextReachFoundationReadinessPayload["relationalOrganizing"]["status"] =
    comms.ok && relationalSnap.peopleGraphAvailable ? "foundation_ready" : "setup_needed";

  const followStatus: TextReachFoundationReadinessPayload["followUpCockpit"]["status"] =
    comms.ok && comms.tables.EmailWorkflowItem === true && comms.tables.CampaignEvent === true
      ? "foundation_ready"
      : "setup_needed";

  const safety = {
    twilioSmsApproved: false,
    bulkSmsApproved: false,
    contactImportApproved: false,
    automationWorkersApproved: false,
    liveEmailApproved: false,
    calendarEventWriteApproved: false,
    noSendPosture,
  };

  const ok =
    comms.ok === true &&
    twilioWebhookReady === true &&
    smsSendingLocked === true &&
    relationalSnap.peopleGraphAvailable === true &&
    noSendPosture === true;

  return {
    ok,
    mode: TEXT_REACH_FOUNDATION_READINESS_MODE,
    texting: {
      status: textingStatus,
      twilioWebhookReady,
      smsSendingLocked,
      stopHelpComplianceRequired: true,
      stopHelpHandlingDetected: textingSnap.stopHelpHandlingDetected,
      audienceBuilderPlanned: true,
      replyInboxPlanned: true,
      nextStep: TEXT_NEXT_OK,
    },
    relationalOrganizing: {
      status: relationalStatus,
      peopleGraphAvailable: relationalSnap.peopleGraphAvailable,
      manualRelationshipEntryPlanned: true,
      volunteerFollowUpPlanned: true,
      actionCardsPlanned: true,
      nextStep: REL_NEXT_OK,
    },
    followUpCockpit: {
      status: followStatus,
      messageFollowUpsPlanned: true,
      volunteerFollowUpsPlanned: true,
      eventFollowUpsPlanned: true,
      nextStep: FOLLOW_NEXT_OK,
    },
    safety,
    nextRecommendedStep: ok ? TOP_NEXT_OK : TOP_NEXT_BLOCKED,
  };
}
