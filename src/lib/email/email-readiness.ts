import { loadEmailSendLog, loadEmailSuppressions } from "@/lib/email/email-staged-store";

export type EmailReadinessReport = {
  status: "green" | "yellow" | "red";
  canSendTest: boolean;
  canSendLive: boolean;
  blockers: string[];
  warnings: string[];
  configured: {
    sendgridApiKey: boolean;
    fromEmail: boolean;
    physicalAddress: boolean;
    unsubscribeUrl: boolean;
    domainAuthenticated?: boolean;
  };
};

function hasEnv(name: string): boolean {
  return Boolean(process.env[name]?.trim());
}

function boolEnv(name: string): boolean | undefined {
  const raw = process.env[name]?.trim().toLowerCase();
  if (!raw) return undefined;
  return ["true", "1", "yes"].includes(raw);
}

export async function getEmailReadinessReport(): Promise<EmailReadinessReport> {
  const configured = {
    sendgridApiKey: hasEnv("SENDGRID_API_KEY"),
    fromEmail: hasEnv("SENDGRID_FROM_EMAIL"),
    physicalAddress: hasEnv("CAMPAIGN_PHYSICAL_ADDRESS") || hasEnv("EMAIL_PHYSICAL_ADDRESS"),
    unsubscribeUrl: hasEnv("CAMPAIGN_UNSUBSCRIBE_URL") || hasEnv("EMAIL_UNSUBSCRIBE_URL"),
    domainAuthenticated: boolEnv("SENDGRID_DOMAIN_AUTHENTICATED"),
  };

  const blockers: string[] = [];
  const warnings: string[] = [];
  if (!configured.sendgridApiKey) blockers.push("SENDGRID_API_KEY missing");
  if (!configured.fromEmail) blockers.push("SENDGRID_FROM_EMAIL missing");
  if (!hasEnv("SENDGRID_FROM_NAME")) blockers.push("SENDGRID_FROM_NAME missing");
  if (!configured.physicalAddress) blockers.push("Physical mailing address missing");
  if (!configured.unsubscribeUrl) blockers.push("Unsubscribe URL missing");
  if (configured.domainAuthenticated !== true) warnings.push("SendGrid domain authentication must be confirmed by operator");
  if (!hasEnv("SENDGRID_REPLY_TO_EMAIL")) warnings.push("SENDGRID_REPLY_TO_EMAIL missing; replies will use from email");
  if (!hasEnv("SENDGRID_UNSUBSCRIBE_GROUP_ID")) warnings.push("SENDGRID_UNSUBSCRIBE_GROUP_ID missing; compliance footer still required");

  const suppressions = await loadEmailSuppressions();
  if (suppressions.length === 0) warnings.push("No staged suppression rows yet; DB contact preferences still checked");
  const sendLog = await loadEmailSendLog();
  const hasSuccessfulTest = sendLog.some((row) => row.kind === "test" && row.status === "sent");
  if (!hasSuccessfulTest) warnings.push("No successful test send logged in staged send log");

  const canSendTest =
    configured.sendgridApiKey &&
    configured.fromEmail &&
    hasEnv("SENDGRID_FROM_NAME") &&
    configured.physicalAddress &&
    configured.unsubscribeUrl;
  const canSendLive = canSendTest && configured.domainAuthenticated === true && hasSuccessfulTest;

  return {
    status: blockers.length ? "red" : canSendLive ? "green" : "yellow",
    canSendTest,
    canSendLive,
    blockers,
    warnings,
    configured,
  };
}
