import fs from "node:fs";
import path from "node:path";
import type { CommunicationsStore } from "./communications-types";

const REL = path.join("data", "campaign-events", "communications");

function storePath(name: string): string {
  return path.join(process.cwd(), REL, name);
}

function readJson<T>(file: string, fallback: T): T {
  const p = storePath(file);
  if (!fs.existsSync(p)) return fallback;
  try {
    return JSON.parse(fs.readFileSync(p, "utf8")) as T;
  } catch {
    return fallback;
  }
}

function writeJson(file: string, data: unknown): void {
  const p = storePath(file);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

export function loadCommunicationsStore(): CommunicationsStore {
  return {
    version: 1,
    contacts: readJson("contacts.json", []),
    lists: readJson("contact-lists.json", []),
    segments: readJson("segments.json", []),
    templates: readJson("templates.json", []),
    sends: readJson("sends.json", []),
    suppressions: readJson("suppressions.json", []),
  };
}

export function saveCommunicationsContacts(contacts: CommunicationsStore["contacts"]): void {
  writeJson("contacts.json", contacts);
}

export function saveCommunicationsSuppressions(suppressions: CommunicationsStore["suppressions"]): void {
  writeJson("suppressions.json", suppressions);
}

export function appendSendAudit(send: CommunicationsStore["sends"][0]): void {
  const sends = readJson<CommunicationsStore["sends"]>("sends.json", []);
  sends.unshift(send);
  writeJson("sends.json", sends.slice(0, 200));
}

/** Seed templates on first load if empty. */
export function ensureDefaultTemplates(): CommunicationsStore["templates"] {
  const existing = readJson<CommunicationsStore["templates"]>("templates.json", []);
  if (existing.length > 0) return existing;

  const templates: CommunicationsStore["templates"] = [
    {
      id: "tpl-approval-package",
      name: "Approval package (candidate)",
      audience: "candidate",
      subject: "Approval needed: {{eventTitle}} — {{month}}",
      previewText: "Secure links to approve, hold, or request info.",
      body: "Hi {{recipientName}},\n\nPlease review the attached approval package for {{eventTitle}}.\n\n{{approvalLinks}}\n\n— Kelly Campaign OS",
      variables: ["recipientName", "eventTitle", "month", "approvalLinks"],
      requiredApprovals: ["campaign_manager", "operator"],
      riskLevel: "medium",
      unsubscribeRequired: false,
      status: "ready",
      workflowType: "approval_package",
    },
    {
      id: "tpl-volunteer-welcome",
      name: "Volunteer welcome",
      audience: "volunteers",
      subject: "Welcome to the Kelly Grappe for SOS team",
      previewText: "Your first steps and training links.",
      body: "Thank you for volunteering.\n\nNext: complete onboarding at {{onboardingUrl}}.\n\n— Team Kelly",
      variables: ["onboardingUrl"],
      requiredApprovals: ["volunteer_coordinator", "operator"],
      riskLevel: "low",
      unsubscribeRequired: true,
      status: "draft",
      workflowType: "volunteer",
    },
    {
      id: "tpl-host-followup",
      name: "Host follow-up",
      audience: "hosts",
      subject: "Thank you for hosting — next steps",
      previewText: "Post-event follow-up and materials.",
      body: "Thank you for hosting {{eventTitle}}.\n\n{{followUpBullets}}\n\n— Kelly Campaign",
      variables: ["eventTitle", "followUpBullets"],
      requiredApprovals: ["communications_lead"],
      riskLevel: "medium",
      unsubscribeRequired: true,
      status: "draft",
      workflowType: "host_followup",
    },
    {
      id: "tpl-team-daily-brief",
      name: "Campaign team daily briefing",
      audience: "campaign_team",
      subject: "Kelly SOS ops brief — {{date}}",
      previewText: "Approvals, finance, county priorities.",
      body: "{{executiveSummary}}\n\nOpen command center: {{commandCenterUrl}}",
      variables: ["date", "executiveSummary", "commandCenterUrl"],
      requiredApprovals: ["campaign_manager"],
      riskLevel: "low",
      unsubscribeRequired: false,
      status: "draft",
      workflowType: "campaign_team",
    },
    {
      id: "tpl-power-of-five",
      name: "Power of 5 outreach",
      audience: "volunteers",
      subject: "Bring five people into the movement",
      previewText: "Relational organizing ask for {{countyName}}.",
      body: "We're building relational capacity in {{countyName}}.\n\nGoal: {{powerOfFiveGoal}} contacts.\n\n{{ask}}\n\n— Field team",
      variables: ["countyName", "powerOfFiveGoal", "ask"],
      requiredApprovals: ["field_manager", "operator"],
      riskLevel: "medium",
      unsubscribeRequired: true,
      status: "draft",
      workflowType: "power_of_five",
    },
    {
      id: "tpl-newsletter-blocked",
      name: "All-contact update (BLOCKED default)",
      audience: "all_contacts",
      subject: "[DRAFT ONLY] Statewide campaign update",
      previewText: "Mass send requires explicit operator approval.",
      body: "This template is draft-only until mass-email safety checklist is complete.",
      variables: [],
      requiredApprovals: ["candidate", "campaign_manager", "operator"],
      riskLevel: "high",
      unsubscribeRequired: true,
      status: "draft",
      workflowType: "newsletter",
    },
  ];
  writeJson("templates.json", templates);
  return templates;
}
