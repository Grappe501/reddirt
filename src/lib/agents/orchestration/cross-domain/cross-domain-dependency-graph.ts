import type { CampaignState } from "../campaign-state-types";
import type { CampaignSectionEdge, CampaignSectionId, CampaignSectionNode, CrossDomainDependencyGraph } from "./cross-domain-orchestrator-types";
import { CAMPAIGN_SECTION_MAP } from "./campaign-section-map";

const STATIC_EDGES: CampaignSectionEdge[] = [
  { from: "county_intelligence", to: "events_calendar", relationship: "unlocks", strength: "high", whyItMatters: "County gaps identify where events should happen." },
  { from: "county_intelligence", to: "communications", relationship: "informs", strength: "high", whyItMatters: "County context changes message priority and local proof." },
  { from: "county_intelligence", to: "volunteer_field", relationship: "unlocks", strength: "high", whyItMatters: "Field work depends on county priorities." },
  { from: "county_intelligence", to: "content_media", relationship: "informs", strength: "medium", whyItMatters: "Local stories feed content and media packets." },
  { from: "communications", to: "email_os_ecc", relationship: "unlocks", strength: "high", whyItMatters: "Email OS should not prepare outreach without comms readiness." },
  { from: "communications", to: "volunteer_field", relationship: "unlocks", strength: "medium", whyItMatters: "Comms follow-up activates volunteers and event attendance." },
  { from: "events_calendar", to: "county_intelligence", relationship: "informs", strength: "medium", whyItMatters: "Event outcomes refresh county intelligence." },
  { from: "events_calendar", to: "volunteer_field", relationship: "unlocks", strength: "high", whyItMatters: "Events create volunteer staffing needs." },
  { from: "events_calendar", to: "content_media", relationship: "unlocks", strength: "medium", whyItMatters: "Events produce recap and earned media material." },
  { from: "finance_reimbursement", to: "compliance", relationship: "requires_review", strength: "high", whyItMatters: "Finance and reimbursement artifacts affect compliance posture." },
  { from: "compliance", to: "communications", relationship: "blocks", strength: "medium", whyItMatters: "Compliance risk can block fundraising or public claims." },
  { from: "memory_observations", to: "research_strategy", relationship: "informs", strength: "high", whyItMatters: "Approved lessons improve future strategic recommendations." },
  { from: "memory_observations", to: "tool_builder", relationship: "informs", strength: "medium", whyItMatters: "Repeated observations become tool-builder tickets." },
  { from: "tool_builder", to: "deployment_readiness", relationship: "depends_on", strength: "medium", whyItMatters: "New tool work must pass the release gate before use." },
  { from: "deployment_readiness", to: "public_site", relationship: "blocks", strength: "high", whyItMatters: "Public/admin changes should not ship without build and migration confirmation." },
  { from: "executive_command", to: "memory_observations", relationship: "informs", strength: "high", whyItMatters: "Human feedback turns recommendations into lessons." },
];

function nodeHealth(sectionId: CampaignSectionId, state: CampaignState): CampaignSectionNode["health"] {
  const section = CAMPAIGN_SECTION_MAP.find((s) => s.id === sectionId);
  const domains = section?.ownedDomains ?? [];
  const domainSlices = domains.map((d) => state.domainStatuses[d]).filter(Boolean);
  if (sectionId === "email_os_ecc" && !state.emailEccReadiness.sendEnabled) return "blocked";
  if (sectionId === "deployment_readiness" && state.signalLoadErrors.length > 0) return "weak";
  if (domains.some((d) => state.activeBlockers.some((b) => b.domainId === d && (b.severity === "P0" || b.severity === "P1")))) return "blocked";
  if (domainSlices.some((d) => d.band === "critical" || d.band === "weak")) return "weak";
  if (domainSlices.every((d) => d.band === "strong")) return "strong";
  return "stable";
}

function leverageScore(sectionId: CampaignSectionId, state: CampaignState): number {
  const outgoing = STATIC_EDGES.filter((e) => e.from === sectionId).length;
  const section = CAMPAIGN_SECTION_MAP.find((s) => s.id === sectionId);
  const weakDomainBoost = section?.ownedDomains.filter((d) => state.weakDomains.includes(d)).length ?? 0;
  const blockerBoost = section?.ownedDomains.filter((d) => state.activeBlockers.some((b) => b.domainId === d)).length ?? 0;
  return outgoing * 10 + weakDomainBoost * 15 + blockerBoost * 20;
}

export function buildCrossDomainDependencyGraph(state: CampaignState): CrossDomainDependencyGraph {
  const nodes: CampaignSectionNode[] = CAMPAIGN_SECTION_MAP.map((section) => {
    const health = nodeHealth(section.id, state);
    const blocking = state.activeBlockers.find((b) => section.ownedDomains.includes(b.domainId));
    return {
      id: section.id,
      label: section.label,
      health,
      leverageScore: leverageScore(section.id, state),
      ownedDomains: section.ownedDomains,
      summary: blocking ? blocking.message : section.mission,
    };
  });

  const weakSections = nodes.filter((n) => n.health === "weak").map((n) => n.id);
  const blockedSections = nodes.filter((n) => n.health === "blocked").map((n) => n.id);
  const highLeverageSections = [...nodes].sort((a, b) => b.leverageScore - a.leverageScore).slice(0, 5).map((n) => n.id);
  const dependencyWarnings: string[] = [];

  if (weakSections.includes("county_intelligence")) {
    dependencyWarnings.push("County intelligence is weak, which can reduce event, volunteer, comms, content, and fundraising quality.");
  }
  if (blockedSections.includes("communications") || blockedSections.includes("email_os_ecc")) {
    dependencyWarnings.push("Comms readiness is blocking field mobilization and public narrative preparation.");
  }
  if (weakSections.includes("finance_reimbursement") || blockedSections.includes("compliance")) {
    dependencyWarnings.push("Finance/reimbursement or compliance weakness requires human-only review before operational push.");
  }
  if (state.feedbackLoop.feedbackHealth.confidence === "low") {
    dependencyWarnings.push("Feedback is stale or thin, so recommendation confidence should stay conservative.");
  }
  if (state.signalLoadErrors.length > 0) {
    dependencyWarnings.push("Deployment/source readiness has degraded signals; verify build/check health before shipping.");
  }

  return {
    nodes,
    edges: STATIC_EDGES,
    weakSections,
    blockedSections,
    highLeverageSections,
    dependencyWarnings,
  };
}
