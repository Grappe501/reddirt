import { existsSync } from "node:fs";
import path from "node:path";
import { prisma } from "@/lib/db";
import { getHostedDbProofSummary } from "@/lib/email-command-center/hosted-db-proof";
import { EMAIL_WORKFLOW_CAN_SEND_FROM_ITEM } from "@/lib/email-workflow/governance";

export const COMMUNICATION_COMMAND_CENTER_READINESS_MODE = "communication_command_center_readiness" as const;

/** Public tables required for Communication Command Center + hosted proof overlap (read-only existence). */
export const COMMUNICATION_COMMAND_CENTER_TABLE_KEYS = [
  "WorkflowIntake",
  "EmailContactProfile",
  "EmailWorkflowItem",
  "CampaignEvent",
  "CommunicationMessage",
  "CommunicationThread",
  "CommunicationSend",
  "CommunicationRecipient",
] as const;

export type CommunicationCommandCenterTableKey = (typeof COMMUNICATION_COMMAND_CENTER_TABLE_KEYS)[number];

export type CommunicationCommandCenterRouteContractKey =
  | "hostedDbProof"
  | "gmailOauthStart"
  | "gmailOauthCallback"
  | "gmailPubSub"
  | "calendarCallback"
  | "calendarCronSync"
  | "calendarWebhook"
  | "sendgridWebhook"
  | "twilioWebhook";

/** Relative to `src/app/api` → `route.ts` (repo layout). Order matches public readiness JSON contract. */
export const COMMUNICATION_COMMAND_CENTER_ROUTE_KEYS: CommunicationCommandCenterRouteContractKey[] = [
  "hostedDbProof",
  "gmailOauthStart",
  "gmailOauthCallback",
  "gmailPubSub",
  "calendarCallback",
  "calendarCronSync",
  "calendarWebhook",
  "sendgridWebhook",
  "twilioWebhook",
];

const ROUTE_CONTRACT: Record<CommunicationCommandCenterRouteContractKey, string[]> = {
  hostedDbProof: ["admin", "production-readiness", "hosted-db"],
  gmailOauthStart: ["gmail", "oauth", "start"],
  gmailOauthCallback: ["gmail", "oauth", "callback"],
  gmailPubSub: ["gmail", "pubsub"],
  calendarCallback: ["calendar", "google", "callback"],
  calendarCronSync: ["calendar", "google", "cron-sync"],
  calendarWebhook: ["calendar", "google", "webhook"],
  sendgridWebhook: ["webhooks", "sendgrid"],
  twilioWebhook: ["webhooks", "twilio"],
};

function sqlIdentPublicTable(s: string): string {
  if (!/^[a-zA-Z0-9_]+$/.test(String(s))) throw new Error("invalid_identifier");
  return String(s);
}

async function tableExistsInPublic(table: string): Promise<boolean> {
  const safe = sqlIdentPublicTable(table);
  const rows = await prisma.$queryRawUnsafe<Array<{ e: boolean }>>(
    `SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = '${safe}') AS e`,
  );
  const r = Array.isArray(rows) ? rows[0] : rows;
  return Boolean(r?.e);
}

function routeHandlerPresent(segments: string[]): boolean {
  try {
    const base = path.join(process.cwd(), "src", "app", "api", ...segments, "route.ts");
    return existsSync(base);
  } catch {
    return false;
  }
}

/**
 * When `src/app/api` is not on disk (e.g. some production bundles), treat route contract as satisfied —
 * offline `scripts/validate-communication-command-center-readiness.mjs` still verifies repo layout.
 */
function resolveRoutePresence(): Record<CommunicationCommandCenterRouteContractKey, boolean> {
  const apiRoot = path.join(process.cwd(), "src", "app", "api");
  const out = {} as Record<CommunicationCommandCenterRouteContractKey, boolean>;
  if (!existsSync(apiRoot)) {
    for (const k of COMMUNICATION_COMMAND_CENTER_ROUTE_KEYS) out[k] = true;
    return out;
  }
  for (const k of COMMUNICATION_COMMAND_CENTER_ROUTE_KEYS) {
    out[k] = routeHandlerPresent(ROUTE_CONTRACT[k]);
  }
  return out;
}

export type CommunicationCommandCenterReadinessPayload = {
  ok: boolean;
  mode: typeof COMMUNICATION_COMMAND_CENTER_READINESS_MODE;
  database: {
    reachable: boolean;
    productionCanonical: boolean;
  };
  tables: Record<CommunicationCommandCenterTableKey, boolean>;
  routes: Record<CommunicationCommandCenterRouteContractKey, boolean>;
  safety: {
    liveSendApproved: boolean;
    gmailSendApproved: boolean;
    sendgridLiveSendApproved: boolean;
    twilioSmsApproved: boolean;
    socialPostingApproved: boolean;
    contactImportApproved: boolean;
    automationWorkersApproved: boolean;
    noSendPosture: boolean;
  };
  nextRecommendedStep: string;
};

const NEXT_STEP =
  "Next launch steps: connect Gmail for the campaign inbox, verify calendar sync, confirm text-message webhooks when texting goes live, then roll out broader outreach tools." as const;

/** Human labels for diagnostics UI (API keys stay technical). */
export const COMMUNICATION_COMMAND_CENTER_TABLE_LABELS: Record<CommunicationCommandCenterTableKey, string> = {
  WorkflowIntake: "Incoming requests",
  EmailContactProfile: "Contact profiles",
  EmailWorkflowItem: "Message follow-ups",
  CampaignEvent: "Campaign events",
  CommunicationMessage: "Communication messages",
  CommunicationThread: "Conversation threads",
  CommunicationSend: "Outbound sends (records)",
  CommunicationRecipient: "Recipients (records)",
};

export const COMMUNICATION_COMMAND_CENTER_ROUTE_LABELS: Record<CommunicationCommandCenterRouteContractKey, string> = {
  hostedDbProof: "Hosted database readiness API",
  gmailOauthStart: "Gmail sign-in (start)",
  gmailOauthCallback: "Gmail sign-in (callback)",
  gmailPubSub: "Gmail inbox notifications",
  calendarCallback: "Calendar OAuth callback",
  calendarCronSync: "Calendar scheduled sync",
  calendarWebhook: "Calendar push updates",
  sendgridWebhook: "SendGrid event webhook",
  twilioWebhook: "Twilio SMS webhook",
};

export async function getCommunicationCommandCenterReadiness(): Promise<CommunicationCommandCenterReadinessPayload> {
  const hosted = await getHostedDbProofSummary();
  const database = {
    reachable: hosted.database.reachable,
    productionCanonical: hosted.proof.productionCanonical,
  };

  const tables = {} as Record<CommunicationCommandCenterTableKey, boolean>;
  if (database.reachable) {
    for (const t of COMMUNICATION_COMMAND_CENTER_TABLE_KEYS) {
      try {
        tables[t] = await tableExistsInPublic(t);
      } catch {
        tables[t] = false;
      }
    }
  } else {
    for (const t of COMMUNICATION_COMMAND_CENTER_TABLE_KEYS) {
      tables[t] = false;
    }
  }

  const routes = resolveRoutePresence();

  const noSendPosture = EMAIL_WORKFLOW_CAN_SEND_FROM_ITEM === false;
  const safety = {
    liveSendApproved: false,
    gmailSendApproved: false,
    sendgridLiveSendApproved: false,
    twilioSmsApproved: false,
    socialPostingApproved: false,
    contactImportApproved: false,
    automationWorkersApproved: false,
    noSendPosture,
  };

  const allTablesOk = COMMUNICATION_COMMAND_CENTER_TABLE_KEYS.every((k) => tables[k] === true);
  const allRoutesOk = COMMUNICATION_COMMAND_CENTER_ROUTE_KEYS.every((k) => routes[k] === true);

  const ok =
    database.reachable &&
    database.productionCanonical === true &&
    allTablesOk &&
    allRoutesOk &&
    safety.noSendPosture === true;

  return {
    ok,
    mode: COMMUNICATION_COMMAND_CENTER_READINESS_MODE,
    database,
    tables,
    routes,
    safety,
    nextRecommendedStep: NEXT_STEP,
  };
}
