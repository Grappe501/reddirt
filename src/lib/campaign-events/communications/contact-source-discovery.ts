import fs from "node:fs";
import path from "node:path";
import { loadCommunicationsStore } from "./communications-store";

export type DiscoveredContactSource = {
  id: string;
  label: string;
  lane: string;
  contactType: string;
  path: string;
  countEstimate: string;
  fieldsAvailable: string[];
  importReadiness: "ready" | "partial" | "manual" | "blocked";
  risk: string;
  recommendedMapping: string;
  partOfUnifiedComms: boolean;
};

export function discoverContactSources(): DiscoveredContactSource[] {
  const store = loadCommunicationsStore();
  const sources: DiscoveredContactSource[] = [
    {
      id: "ecc-prisma",
      label: "Email Command Center profiles",
      lane: "RedDirt",
      contactType: "mixed",
      path: "prisma:EmailContactProfile + import batches",
      countEstimate: "DB (hosted)",
      fieldsAvailable: ["email", "name", "tags", "consent", "suppression"],
      importReadiness: "ready",
      risk: "Requires hosted DB + migrations",
      recommendedMapping: "Primary graph — sync via ECC import",
      partOfUnifiedComms: true,
    },
    {
      id: "ecc-sendgrid-sync",
      label: "SendGrid Marketing Contacts",
      lane: "RedDirt",
      contactType: "audience",
      path: "src/lib/email-command-center/sendgrid-contact-sync.ts",
      countEstimate: "SendGrid list",
      fieldsAvailable: ["email", "list ids", "ASM suppressions"],
      importReadiness: "partial",
      risk: "List drift vs Prisma — reconcile webhooks",
      recommendedMapping: "Outbound sync after Prisma profile commit",
      partOfUnifiedComms: true,
    },
    {
      id: "campaign-approval-recipients",
      label: "Approval package recipients",
      lane: "RedDirt",
      contactType: "campaign_team",
      path: "src/lib/campaign-events/approval-recipients.ts",
      countEstimate: "small static",
      fieldsAvailable: ["email", "role"],
      importReadiness: "ready",
      risk: "Candidate/CM only — not volunteers",
      recommendedMapping: "approval_package template audience",
      partOfUnifiedComms: true,
    },
    {
      id: "workflow-intake",
      label: "Public schedule / forms intake",
      lane: "RedDirt",
      contactType: "host",
      path: "WorkflowIntake + POST /api/forms",
      countEstimate: "DB",
      fieldsAvailable: ["name", "email", "event meta"],
      importReadiness: "partial",
      risk: "Consent varies by form — review before marketing",
      recommendedMapping: "host + event tags",
      partOfUnifiedComms: true,
    },
    {
      id: "volunteer-signup",
      label: "Volunteer signup ops notification",
      lane: "RedDirt",
      contactType: "volunteer",
      path: "src/lib/campaign-ops/ops-notifications.ts",
      countEstimate: "per submission",
      fieldsAvailable: ["email", "name", "interest"],
      importReadiness: "partial",
      risk: "Ops email only today — profile link V2",
      recommendedMapping: "volunteer welcome workflow",
      partOfUnifiedComms: true,
    },
    {
      id: "comms-json-v1",
      label: "Campaign OS communications JSON store",
      lane: "RedDirt",
      contactType: "mixed",
      path: "data/campaign-events/communications/contacts.json",
      countEstimate: String(store.contacts.length),
      fieldsAvailable: ["email", "roleTags", "consent", "suppressed"],
      importReadiness: "ready",
      risk: "File-backed V1 — not authoritative vs Prisma",
      recommendedMapping: "Staging / demo lists until DB merge",
      partOfUnifiedComms: true,
    },
    {
      id: "county-workbench-leaders",
      label: "County workbench leaders",
      lane: "countyWorkbench",
      contactType: "county_lead",
      path: "counties/leaders/* (profiles)",
      countEstimate: "6 full + shells",
      fieldsAvailable: ["organizational context", "not bulk email"],
      importReadiness: "manual",
      risk: "No verified email export — do not invent",
      recommendedMapping: "county_leader template + manual add",
      partOfUnifiedComms: true,
    },
    {
      id: "sos-public-formspree",
      label: "sos-public contact Formspree",
      lane: "sos-public",
      contactType: "general",
      path: "sos-public ContactPageClient",
      countEstimate: "external",
      fieldsAvailable: ["form fields"],
      importReadiness: "blocked",
      risk: "Bypasses RedDirt intake — migrate to /api/forms",
      recommendedMapping: "Route to RedDirt WorkflowIntake",
      partOfUnifiedComms: false,
    },
    {
      id: "ajax-outreach-queue",
      label: "AJAX outreach queue",
      lane: "ajax",
      contactType: "volunteer",
      path: "ajax Supabase outreach_queue",
      countEstimate: "initiative DB",
      fieldsAvailable: ["email", "ward"],
      importReadiness: "blocked",
      risk: "Cross-lane firewall — separate SendGrid billing",
      recommendedMapping: "Integration packet only",
      partOfUnifiedComms: false,
    },
    {
      id: "county-workbench-mailto",
      label: "County workbench email drafts",
      lane: "countyWorkbench",
      contactType: "operator",
      path: "pathToVictoryEmails.ts",
      countEstimate: "mailto only",
      fieldsAvailable: ["draft text"],
      importReadiness: "manual",
      risk: "No send — client mail only",
      recommendedMapping: "Copy into Message Studio",
      partOfUnifiedComms: false,
    },
  ];

  const volunteerTemplates = path.join(process.cwd(), "src", "lib", "volunteer-ops", "p5-placement-emails.ts");
  if (fs.existsSync(volunteerTemplates)) {
    sources.push({
      id: "volunteer-template-copy",
      label: "Volunteer email templates (copy-paste)",
      lane: "RedDirt",
      contactType: "volunteer",
      path: "src/lib/volunteer-ops/p5-placement-emails.ts",
      countEstimate: "templates",
      fieldsAvailable: ["static copy"],
      importReadiness: "manual",
      risk: "No API send — operator paste",
      recommendedMapping: "Import into communications templates",
      partOfUnifiedComms: true,
    });
  }

  return sources;
}

export function countUnifiedSources(sources: DiscoveredContactSource[]): number {
  return sources.filter((s) => s.partOfUnifiedComms).length;
}
