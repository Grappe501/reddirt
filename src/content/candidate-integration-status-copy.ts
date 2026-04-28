/** V2.15+ integration snapshot — factual about code rails; deployment must verify `.env`/Netlify. */

export type IntegrationStatusTone = "codepath" | "external" | "oauth";

export const ASK_KELLY_CANDIDATE_INTEGRATION_STATUS = {
  sectionTitle: "Integration status",
  sectionLead:
    "Integrations are code-path status, not a live monitor. Verify `.env`, Netlify, and OAuth per environment. Nothing here reads secrets or proves production connectivity.",
  rows: [
    {
      id: "calendar",
      label: "Google Calendar sync",
      tone: "codepath" as const,
      line: "Calendar HQ components reference Google OAuth; requires server env vars to enable.",
    },
    {
      id: "gmail",
      label: "Staff Gmail · human mail",
      tone: "oauth" as const,
      line: "OAuth flow under `/api/gmail/oauth/*`; workbench exposes “Connect Gmail” when actor user is configured.",
    },
    {
      id: "sendgrid",
      label: "SendGrid",
      tone: "codepath" as const,
      line: "Webhooks and comms send rails exist—configure API key and webhook PEM in prod.",
    },
    {
      id: "twilio",
      label: "Twilio (SMS)",
      tone: "codepath" as const,
      line: "Inbound status webhooks wired—needs account SID/token and from-number in prod env.",
    },
    {
      id: "campaign-organizing-hub",
      label: "Campaign Organizing Hub",
      tone: "external" as const,
      line:
        "Team chat (e.g. Discord) stays invite-managed outside this UI. County briefings, volunteer entry, and admin workbenches are first-party RedDirt campaign-management routes.",
    },
  ],
} as const;
