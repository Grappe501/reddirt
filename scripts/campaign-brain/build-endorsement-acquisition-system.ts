/**
 * PHASE 15 — Endorsement Strategy & Acquisition System
 *
 * Not collecting names — leveraging validators who move credibility, volunteers,
 * donors, networks, and persuasion.
 *
 * Usage: npm run campaign-brain:endorsements:build
 */

import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

import { BRAIN_DATA, BRAIN_ROOT, readJson } from "./lib/inputs";
import type {
  EndorsementActivationLevel,
  EndorsementScorecard,
  EndorsementStatus,
  EndorsementTarget,
  EndorsementValueScores,
} from "./lib/endorsement-acquisition-types";

const ENDORSE = path.join(BRAIN_ROOT, "endorsement-strategy");

const VALUE_CRITERIA = [
  { id: "credibility", label: "Credibility" },
  { id: "volunteerActivation", label: "Volunteer activation" },
  { id: "donorActivation", label: "Donor activation" },
  { id: "networkAccess", label: "Network access" },
  { id: "voterPersuasion", label: "Voter persuasion" },
];

const ACTIVATION_CHECKLIST = [
  "Announcement graphic",
  "Social media post",
  "Website placement",
  "Election-plan dashboard update",
  "Email inclusion",
  "Press release consideration",
  "Mobilize volunteer recruitment opportunity",
];

function normalizeStatus(raw?: string, requested?: boolean): EndorsementStatus {
  if (raw === "endorsed" || raw === "yes") return "endorsed";
  if (raw === "declined" || raw === "no") return "declined";
  if (raw === "in_progress" || raw === "decision_pending") return "decision_pending";
  if (raw === "presentation_given") return "presentation_given";
  if (raw === "meeting_scheduled") return "meeting_scheduled";
  if (raw === "requested" || requested) return "requested";
  if (raw === "follow_up") return "follow_up";
  if (raw && raw !== "none" && raw !== "not_requested") return raw as EndorsementStatus;
  return requested ? "requested" : "not_requested";
}

function normalizeActivation(raw?: string): EndorsementActivationLevel {
  const valid: EndorsementActivationLevel[] = [
    "none",
    "announced",
    "volunteer_recruitment",
    "donor_outreach",
    "event_hosted",
    "media_placed",
    "full_activation",
  ];
  if (raw && valid.includes(raw as EndorsementActivationLevel)) return raw as EndorsementActivationLevel;
  return "none";
}

function defaultValues(): EndorsementValueScores {
  return { credibility: 0, volunteerActivation: 0, donorActivation: 0, networkAccess: 0, voterPersuasion: 0 };
}

function pipelineFromRecord(r: {
  endorsementRequested?: boolean;
  endorsementStatus?: string;
  meetingRequested?: boolean;
  meetingCompleted?: boolean;
  asks?: { meetingRequested?: boolean; meetingCompleted?: boolean; supportRequested?: boolean };
}): EndorsementTarget["pipeline"] {
  const status = normalizeStatus(r.endorsementStatus, r.endorsementRequested);
  const meetingReq = r.meetingRequested ?? r.asks?.meetingRequested ?? false;
  const meetingDone = r.meetingCompleted ?? r.asks?.meetingCompleted ?? false;
  return {
    requested: r.endorsementRequested ?? status !== "not_requested",
    meetingScheduled: meetingReq || status === "meeting_scheduled",
    presentationGiven: meetingDone || status === "presentation_given" || status === "decision_pending",
    decisionDate: null,
    endorsed: status === "endorsed",
    declined: status === "declined",
    followUp: status === "follow_up",
  };
}

function loadTargets(): EndorsementTarget[] {
  const targets: EndorsementTarget[] = [];

  const labor = readJson<{ unions: Array<Record<string, unknown>> }>(
    path.join(BRAIN_DATA, "labor-union-engagement.json"),
  );
  for (const u of labor?.unions ?? []) {
    const e = (u.endorsement as Record<string, unknown>) ?? u;
    const status = normalizeStatus(
      String(e.endorsementStatus ?? u.endorsementStatus ?? ""),
      Boolean(e.endorsementRequested ?? u.endorsementRequested),
    );
    targets.push({
      id: `labor-${String(u.union ?? u.id ?? targets.length).replace(/\s+/g, "-").toLowerCase()}`,
      name: String(u.leader ?? u.union ?? "Union"),
      organization: String(u.union ?? ""),
      tier: 1,
      tierLabel: "institutional",
      category: "labor",
      county: String(u.county ?? "Statewide"),
      endorsementRequested: Boolean(e.endorsementRequested ?? u.endorsementRequested),
      endorsementStatus: status,
      endorsementActivationLevel: normalizeActivation(String(e.endorsementActivationLevel ?? u.endorsementActivationLevel ?? "")),
      valueScores: { ...defaultValues(), credibility: 4, volunteerActivation: 5, networkAccess: 4 },
      pipeline: pipelineFromRecord(u as never),
      volunteerLeadsGenerated: u.volunteerSupport ? 1 : 0,
      donorLeadsGenerated: u.financialSupport ? 1 : 0,
      source: "labor-union-engagement",
    });
  }

  const naacp = readJson<{ branches: Array<Record<string, unknown>> }>(
    path.join(BRAIN_DATA, "naacp-branch-engagement.json"),
  );
  for (const b of naacp?.branches ?? []) {
    const status = normalizeStatus(String(b.endorsementStatus ?? ""), Boolean(b.endorsementRequested));
    targets.push({
      id: String(b.id ?? `naacp-${targets.length}`),
      name: String(b.branchName ?? "NAACP Branch"),
      organization: "NAACP",
      tier: 1,
      tierLabel: "institutional",
      category: "civil_rights",
      county: String(b.county ?? ""),
      endorsementRequested: Boolean(b.endorsementRequested),
      endorsementStatus: status,
      endorsementActivationLevel: normalizeActivation(String(b.endorsementActivationLevel ?? "")),
      valueScores: { ...defaultValues(), credibility: 5, networkAccess: 4, voterPersuasion: 3 },
      pipeline: pipelineFromRecord(b as never),
      volunteerLeadsGenerated: Number(b.volunteerLeadersIdentified) || 0,
      donorLeadsGenerated: 0,
      source: "naacp-branch-engagement",
    });
  }

  const aea = readJson<{ counties: Array<Record<string, unknown>> }>(
    path.join(BRAIN_DATA, "aea-teacher-network.json"),
  );
  for (const c of aea?.counties ?? []) {
    targets.push({
      id: `aea-${String(c.county ?? targets.length)}`,
      name: String(c.aeaContact ?? `AEA ${c.county}`),
      organization: "AEA / Teachers",
      tier: 1,
      tierLabel: "institutional",
      category: "teacher",
      county: String(c.county ?? ""),
      endorsementRequested: Boolean(c.endorsementRequested),
      endorsementStatus: normalizeStatus(String(c.endorsementStatus ?? ""), Boolean(c.endorsementRequested)),
      endorsementActivationLevel: normalizeActivation(String(c.endorsementActivationLevel ?? "")),
      valueScores: { ...defaultValues(), credibility: 4, volunteerActivation: 4, networkAccess: 3 },
      pipeline: pipelineFromRecord(c as never),
      volunteerLeadsGenerated: Array.isArray(c.teacherSupporters) ? c.teacherSupporters.length : 0,
      donorLeadsGenerated: 0,
      source: "aea-teacher-network",
    });
  }

  const current = readJson<{ officials: Array<Record<string, unknown>> }>(
    path.join(BRAIN_DATA, "current-elected-officials.json"),
  );
  for (const o of current?.officials ?? []) {
    const e = (o.endorsement as Record<string, unknown>) ?? o;
    targets.push({
      id: String(o.id ?? `official-${targets.length}`),
      name: String(o.name ?? ""),
      organization: String(o.office ?? ""),
      tier: 2,
      tierLabel: "current_elected",
      category: String(o.category ?? "current_elected"),
      county: String(o.county ?? ""),
      endorsementRequested: Boolean(e.endorsementRequested),
      endorsementStatus: normalizeStatus(String(e.endorsementStatus ?? ""), Boolean(e.endorsementRequested)),
      endorsementActivationLevel: normalizeActivation(String(e.endorsementActivationLevel ?? "")),
      valueScores: { ...defaultValues(), credibility: 3, networkAccess: 4, voterPersuasion: 3 },
      pipeline: pipelineFromRecord(o as never),
      volunteerLeadsGenerated: (o.asks as { volunteerLeadsProvided?: boolean })?.volunteerLeadsProvided ? 1 : 0,
      donorLeadsGenerated: 0,
      source: "current-elected-officials",
    });
  }

  const former = readJson<{ officials: Array<Record<string, unknown>> }>(
    path.join(BRAIN_DATA, "former-elected-officials.json"),
  );
  for (const o of former?.officials ?? []) {
    const e = (o.endorsement as Record<string, unknown>) ?? o;
    targets.push({
      id: String(o.id ?? `former-${targets.length}`),
      name: String(o.name ?? ""),
      organization: String(o.formerOffice ?? ""),
      tier: 3,
      tierLabel: "former_elected",
      category: "former_elected",
      county: String(o.county ?? ""),
      endorsementRequested: Boolean(e.endorsementRequested),
      endorsementStatus: normalizeStatus(String(e.endorsementStatus ?? ""), Boolean(e.endorsementRequested)),
      endorsementActivationLevel: normalizeActivation(String(e.endorsementActivationLevel ?? "")),
      valueScores: { ...defaultValues(), credibility: 4, donorActivation: 3, networkAccess: 4 },
      pipeline: pipelineFromRecord(o as never),
      volunteerLeadsGenerated: Number((o.outcomes as { volunteerLeadersIdentified?: number })?.volunteerLeadersIdentified) || 0,
      donorLeadsGenerated: (o.outcomes as { financialSupportDiscussed?: boolean })?.financialSupportDiscussed ? 1 : 0,
      source: "former-elected-officials",
    });
  }

  const candidates = readJson<{ candidates: Array<Record<string, unknown>> }>(
    path.join(BRAIN_DATA, "running-candidate-partnerships.json"),
  );
  for (const c of candidates?.candidates ?? []) {
    targets.push({
      id: String(c.id ?? `candidate-${targets.length}`),
      name: String(c.name ?? ""),
      organization: String(c.office ?? ""),
      tier: 5,
      tierLabel: "candidate_partnership",
      category: String(c.category ?? "candidate"),
      county: String(c.county ?? ""),
      endorsementRequested: Boolean(c.crossEndorsementRequested),
      endorsementStatus: normalizeStatus(String(c.endorsementStatus ?? ""), Boolean(c.crossEndorsementRequested)),
      endorsementActivationLevel: normalizeActivation(String(c.endorsementActivationLevel ?? "")),
      valueScores: { ...defaultValues(), volunteerActivation: 4, networkAccess: 3, voterPersuasion: 4 },
      pipeline: pipelineFromRecord(c as never),
      volunteerLeadsGenerated: Number(c.sharedVolunteers) || 0,
      donorLeadsGenerated: Number(c.sharedFundraising) || 0,
      source: "running-candidate-partnerships",
    });
  }

  return targets;
}

function buildScorecard(targets: EndorsementTarget[]): EndorsementScorecard {
  const endorsed = targets.filter((t) => t.endorsementStatus === "endorsed");
  const pending = targets.filter((t) =>
    ["requested", "meeting_scheduled", "presentation_given", "decision_pending"].includes(t.endorsementStatus),
  );

  return {
    version: 1,
    generatedAt: new Date().toISOString(),
    heroLine: "Endorsements are validators — measure activation, not vanity.",
    requested: targets.filter((t) => t.endorsementRequested || t.endorsementStatus !== "not_requested").length,
    meetingsScheduled: targets.filter((t) => t.pipeline.meetingScheduled).length,
    presentationsGiven: targets.filter((t) => t.pipeline.presentationGiven).length,
    endorsed: endorsed.length,
    declined: targets.filter((t) => t.endorsementStatus === "declined").length,
    pending: pending.length,
    byTier: {
      tier1: targets.filter((t) => t.tier === 1).length,
      tier2: targets.filter((t) => t.tier === 2).length,
      tier3: targets.filter((t) => t.tier === 3).length,
      tier4: targets.filter((t) => t.tier === 4).length,
      tier5: targets.filter((t) => t.tier === 5).length,
    },
    institutional: {
      labor: targets.filter((t) => t.category === "labor" && t.endorsementStatus === "endorsed").length,
      teacher: targets.filter((t) => t.category === "teacher" && t.endorsementStatus === "endorsed").length,
      civilRights: targets.filter((t) => t.category === "civil_rights" && t.endorsementStatus === "endorsed").length,
      total: targets.filter((t) => t.tier === 1 && t.endorsementStatus === "endorsed").length,
    },
    currentOfficials: endorsed.filter((t) => t.tier === 2).length,
    formerOfficials: endorsed.filter((t) => t.tier === 3).length,
    communityLeaders: endorsed.filter((t) => t.tier === 4).length,
    candidatePartnerships: targets.filter((t) => t.tier === 5).length,
    volunteerLeadsGenerated: targets.reduce((a, t) => a + t.volunteerLeadsGenerated, 0),
    donorLeadsGenerated: targets.reduce((a, t) => a + t.donorLeadsGenerated, 0),
    activated: targets.filter((t) => t.endorsementActivationLevel !== "none").length,
  };
}

function writeHub(scorecard: EndorsementScorecard) {
  mkdirSync(ENDORSE, { recursive: true });
  writeFileSync(
    path.join(ENDORSE, "PHASE-15-ENDORSEMENT-STRATEGY-ACQUISITION.md"),
    `# Phase 15 — Endorsement Strategy & Acquisition System

Updated: ${scorecard.generatedAt.slice(0, 10)}

## Mission

Identify, prioritize, secure, track, announce, and **activate** endorsements — not collect names.

## Five evaluation values

${VALUE_CRITERIA.map((v) => `- **${v.label}**`).join("\n")}

## Scorecard

| Metric | Count |
| ------ | ----: |
| Requested | ${scorecard.requested} |
| Meetings scheduled | ${scorecard.meetingsScheduled} |
| Presentations given | ${scorecard.presentationsGiven} |
| Endorsed | ${scorecard.endorsed} |
| Pending | ${scorecard.pending} |
| Activated (deployment) | ${scorecard.activated} |
| Volunteer leads | ${scorecard.volunteerLeadsGenerated} |
| Donor leads | ${scorecard.donorLeadsGenerated} |

## Tiers

| Tier | Track | Doc |
| ---- | ----- | --- |
| 1 | Institutional | [\`tier-1-institutional.md\`](./tier-1-institutional.md) |
| 2 | Current elected | [\`tier-2-current-elected.md\`](./tier-2-current-elected.md) |
| 3 | Former elected | [\`tier-3-former-elected.md\`](./tier-3-former-elected.md) |
| 4 | Community influencers | [\`tier-4-community-influencers.md\`](./tier-4-community-influencers.md) |
| 5 | Candidate partnerships | [\`tier-5-candidate-partnerships.md\`](./tier-5-candidate-partnerships.md) |

## Coalition strategies

- [\`union-endorsement-strategy.md\`](./union-endorsement-strategy.md)
- [\`naacp-endorsement-strategy.md\`](./naacp-endorsement-strategy.md)
- [\`aea-endorsement-strategy.md\`](./aea-endorsement-strategy.md)
- [\`muslim-community-endorsement-strategy.md\`](./muslim-community-endorsement-strategy.md)
- [\`hispanic-endorsement-pathways.md\`](./hispanic-endorsement-pathways.md)

## Activation

[\`endorsement-announcement-system.md\`](./endorsement-announcement-system.md) · [\`endorsement-scorecard.md\`](./endorsement-scorecard.md)

Every leader record includes: \`endorsementRequested\` · \`endorsementStatus\` · \`endorsementActivationLevel\`

\`\`\`bash
npm run campaign-brain:endorsements:build
\`\`\`
`,
    "utf8",
  );
}

function writeTierDocs() {
  const tiers = [
    ["tier-1-institutional.md", "Tier 1 — Institutional Endorsements", "Labor · unions · teachers · civil rights · caucuses · professional associations. Track: requested → meeting → presentation → decision → endorsed/declined → follow-up."],
    ["tier-2-current-elected.md", "Tier 2 — Current Elected Officials", "Democratic legislators · county · municipal · school board. Ask: endorsement · introductions · event hosting · volunteer leaders · donor intros."],
    ["tier-3-former-elected.md", "Tier 3 — Former Elected Officials", "Credibility · historical knowledge · donor relationships · community relationships."],
    ["tier-4-community-influencers.md", "Tier 4 — Community Influencers", "Pastors · civic · NAACP · business · educators · veterans. Public support · event participation · introductions · volunteer recruitment."],
    ["tier-5-candidate-partnerships.md", "Tier 5 — Candidate Partnerships", "Shared events · canvasses · phone banks · volunteers · media · cross-endorsements."],
  ];
  for (const [file, title, body] of tiers) {
    writeFileSync(path.join(ENDORSE, file), `# ${title}\n\n${body}\n`, "utf8");
  }
}

function writeCoalitionStrategies() {
  writeFileSync(
    path.join(ENDORSE, "union-endorsement-strategy.md"),
    `# Union Endorsement Strategy

Partners: Mr. Fouche · Danny Brown · Democratic Union Caucus · Zack Bledsoe

## Meeting framework

1. Listen first
2. How can SOS better serve working people?
3. Business filing barriers
4. Transparency concerns
5. Election participation barriers
6. Request endorsement consideration
7. Request volunteer support
8. Request member communications support

Track: meeting · presentation · decision · endorsement · volunteer · financial · member comms
`,
    "utf8",
  );
  writeFileSync(
    path.join(ENDORSE, "naacp-endorsement-strategy.md"),
    `# NAACP Endorsement Strategy

**Primary:** Speak at every branch possible.

**Secondary:** Endorsement consideration where appropriate.

**Tertiary:** Volunteer leaders and community connectors.

Track: branch visits · speaking · introductions · endorsements · volunteer leaders
`,
    "utf8",
  );
  writeFileSync(
    path.join(ENDORSE, "aea-endorsement-strategy.md"),
    `# AEA Endorsement Strategy

Coordinator: **April Reisma**

Teacher network activation · county contacts · volunteer leaders · local events · endorsement pathway.
`,
    "utf8",
  );
  writeFileSync(
    path.join(ENDORSE, "muslim-community-endorsement-strategy.md"),
    `# Muslim Community Endorsement Strategy

Dr. Ali Khan · Ebrahim — relationship-first · listening · trust-building · volunteer leaders · introductions.
`,
    "utf8",
  );
  writeFileSync(
    path.join(ENDORSE, "hispanic-endorsement-pathways.md"),
    `# Hispanic Endorsement Pathways

**Framework only** — Jasmine Serano lead.

Potential pathways: community orgs · faith · business · youth · civic.
`,
    "utf8",
  );
}

function writeActivationDocs(scorecard: EndorsementScorecard) {
  writeFileSync(
    path.join(ENDORSE, "endorsement-announcement-system.md"),
    `# Endorsement Announcement System

Every endorsement receives:

${ACTIVATION_CHECKLIST.map((a, i) => `${i + 1}. ${a}`).join("\n")}

**Do not waste endorsements. Activate them.**

Set \`endorsementActivationLevel\` on the leader record when each step completes.
`,
    "utf8",
  );
  writeFileSync(
    path.join(ENDORSE, "endorsement-scorecard.md"),
    `# Endorsement Scorecard

| Metric | Count |
| ------ | ----: |
| Endorsements requested | ${scorecard.requested} |
| Meetings scheduled | ${scorecard.meetingsScheduled} |
| Presentations given | ${scorecard.presentationsGiven} |
| Endorsements received | ${scorecard.endorsed} |
| Organizational (Tier 1) | ${scorecard.institutional.total} |
| Labor | ${scorecard.institutional.labor} |
| Teacher | ${scorecard.institutional.teacher} |
| Civil rights | ${scorecard.institutional.civilRights} |
| Current officials | ${scorecard.currentOfficials} |
| Former officials | ${scorecard.formerOfficials} |
| Community leaders | ${scorecard.communityLeaders} |
| Candidate partnerships | ${scorecard.candidatePartnerships} |
| Volunteer leads generated | ${scorecard.volunteerLeadsGenerated} |
| Donor leads generated | ${scorecard.donorLeadsGenerated} |
| Deployed (activation ≠ none) | ${scorecard.activated} |

Data: [\`endorsement-acquisition-queue.json\`](../../../data/campaign-brain/endorsement-acquisition-queue.json)
`,
    "utf8",
  );
}

function main() {
  const targets = loadTargets();
  const scorecard = buildScorecard(targets);

  writeFileSync(
    path.join(BRAIN_DATA, "endorsement-acquisition-queue.json"),
    JSON.stringify(
      {
        version: 1,
        generatedAt: scorecard.generatedAt,
        note: "Aggregated from coalition + leader records. Update source files; re-run build.",
        evaluationValues: VALUE_CRITERIA.map((v) => v.id),
        targets,
      },
      null,
      2,
    ),
    "utf8",
  );
  writeFileSync(path.join(BRAIN_DATA, "endorsement-scorecard.json"), JSON.stringify(scorecard, null, 2), "utf8");

  writeHub(scorecard);
  writeTierDocs();
  writeCoalitionStrategies();
  writeActivationDocs(scorecard);

  // eslint-disable-next-line no-console
  console.log(
    `Phase 15 Endorsements: ${scorecard.requested} requested · ${scorecard.endorsed} endorsed · ${scorecard.activated} activated`,
  );
}

main();
