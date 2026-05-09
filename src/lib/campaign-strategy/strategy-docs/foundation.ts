import type { StrategyDoc } from "../types";

export const metaDocument: StrategyDoc = {
  path: "meta",
  title: "Meta, versioning & disclaimers",
  eyebrow: "Manual v1.1",
  blocks: [
    {
      kind: "lead",
      text: "Document control, redaction rules for the LANE file, public vocabulary alignment, and distribution tiers.",
    },
    {
      kind: "callout",
      tone: "navy",
      title: "Not legal advice",
      body: "Finance, TCPA/CAN-SPAM, coordination, and disclaimer rules require counsel. This surface summarizes operating posture only.",
    },
    {
      kind: "h2",
      text: "Public vocabulary (approved)",
    },
    {
      kind: "ul",
      items: [
        "Campaign Companion — human-centered assistance (avoid “AI product” in public)",
        "Guided Campaign System — structured onboarding",
        "Field Intelligence — aggregate, permissioned insight — not public dossiers",
      ],
    },
    {
      kind: "h2",
      text: "Numbers lane redaction",
    },
    {
      kind: "ul",
      items: [
        "Strip dollar envelopes and GOTV lockbox before vendors/partners unless finance approves",
        "Summarize registration as statewide ambition without per-county sheets for non-partisan partners",
        "Never attach raw persuasion universe sizes to public PDFs",
      ],
    },
  ],
};

export const executiveDocument: StrategyDoc = {
  path: "executive-summary",
  title: "Executive summary",
  eyebrow: "Leadership",
  blocks: [
    {
      kind: "lead",
      text: "Elect Kelly Grappe for Arkansas Secretary of State through competent, transparent, people-powered organizing across all 75 counties — closing turnout gaps, growing registration with non-partisan partners, and meeting voters where they are.",
    },
    {
      kind: "h2",
      text: "Headline targets (see LANE for detail)",
    },
    {
      kind: "table",
      headers: ["Anchor", "Planning hypothesis"],
      rows: [
        ["Net vote margin (general)", "≥ ~35k net — Data replaces from model"],
        ["New registration ambition", "50,000 cycle"],
        ["County tiers", "~18–22 Tier 1 core; Tier 2 expansion; Tier 3 long tail"],
        ["Allocator", "~62% / 26% / 12% margin burden by tier"],
        ["GOTV reserve", "Segregated cash before T-21 — bands in LANE"],
      ],
    },
    {
      kind: "h2",
      text: "Ten synchronized programs",
    },
    {
      kind: "ol",
      items: [
        "Registration partnership (Get Loud + file tracking)",
        "Turnout gap closure + vote plans",
        "Persuasion (lawful universes)",
        "Youth (seniors → freshmen)",
        "Relational field + small gatherings",
        "Community intelligence → presence",
        "Collateral + merch",
        "Paid + earned media (APA)",
        "Rural / all-county story",
        "GOTV backward plan — every program aligns to LANE §6",
      ],
    },
    {
      kind: "h2",
      text: "Critical risks",
    },
    {
      kind: "ul",
      items: [
        "Capacity vs 75-county ambition — shrink Tier 1 list if captains missing",
        "Consent + TCPA discipline before GOTV surge",
        "Cash: no spend above LANE mix without CM + Finance dual sign-off",
        "Tool reality: GOTV assignment may be manual — parallel sheets OK",
      ],
    },
  ],
};

export const buildAuditDocument: StrategyDoc = {
  path: "build-audit",
  title: "Build audit: RedDirt & county workbench",
  eyebrow: "Technology alignment",
  blocks: [
    {
      kind: "lead",
      text: "RedDirt is the campaign operating system (Next.js, Prisma/Postgres, Workbench). County workbench is the separate county portal (Pope-first, 75-county shells, no voter PII on public aggregates).",
    },
    {
      kind: "h2",
      text: "Strong capabilities (summary)",
    },
    {
      kind: "ul",
      items: [
        "Workbench hub, unified open work, CM dashboard bands",
        "Email command center + governed sends",
        "Comms workbench (plans, drafts, sends)",
        "Voter file warehouse, county metrics, election ingest for planning",
        "GOTV-2 review-only planning on /admin/gotv",
        "Events, tasks, relational contacts (REL-2), social + monitoring",
      ],
    },
    {
      kind: "h2",
      text: "Partial / gaps",
    },
    {
      kind: "ul",
      items: [
        "GOTV-3+ assignment automation may still be emerging — run SOPs in parallel",
        "Submission triage not universal — name daily owner",
        "Fundraising desk early — ledger + budgets exist",
        "County workbench ↔ RedDirt read-only aggregates future-governed",
      ],
    },
    {
      kind: "h2",
      text: "Targets ↔ systems (from manual §11)",
    },
    {
      kind: "table",
      headers: ["LANE target", "Implementation"],
      rows: [
        ["registrationGoal integers", "CountyCampaignStats + CountyVoterMetrics mirror"],
        ["County tier", "Operator list + county workbench until Prisma enum"],
        ["GOTV cohorts", "/admin/gotv review + exports"],
        ["Vote plans", "VoterVotePlan + sheets"],
        ["Budget mix", "BudgetPlan / BudgetLine naming aligns to LANE categories"],
      ],
    },
  ],
};

export const frameworkDocument: StrategyDoc = {
  path: "framework",
  title: "Strategic framework & theory of change",
  eyebrow: "Narrative spine",
  blocks: [
    {
      kind: "lead",
      text: "The Secretary of State’s office belongs to the people. Competence plus presence beats apathy — registrations and turnout programs must converge on the GOTV clock (LANE §6).",
    },
    {
      kind: "h2",
      text: "Message pillars — cadence shift",
    },
    {
      kind: "table",
      headers: ["Pillar", "Early cycle", "GOTV-21 → E"],
      rows: [
        ["Transparency", "How Kelly would run the office", "Plain voting mechanics + official links"],
        ["Access", "Registration partnerships", "Early vote hours/locations — sourced"],
        ["Competence", "Administrator story", "Calm closing — no chaos"],
        ["Service", "County listening", "Rides + elder check-ins"],
        ["Integrity", "Listening tour, civic framing", "De-escalation; hotline"],
      ],
    },
    {
      kind: "h2",
      text: "Geography",
    },
    {
      kind: "p",
      text: "Resource concentration follows LANE Tier 1–3; narrative welcomes all 75 counties. Align region names with county workbench registry — no shadow taxonomies.",
    },
    {
      kind: "h2",
      text: "Quarterly review (tie to LANE)",
    },
    {
      kind: "ul",
      items: [
        "Tier 1 registration pace vs floor — four-week red flag rule",
        "Allocator credibility — shift 5 points between tiers if needed",
        "Lockbox funded per §4.3?",
        "LANE §6.2 matrix: named owners per cell, not vague “comms generally”",
      ],
    },
  ],
};
