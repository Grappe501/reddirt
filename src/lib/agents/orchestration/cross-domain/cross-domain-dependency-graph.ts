import type { CampaignState } from "../campaign-state-types";
import type { OrchestrationSourceHealth } from "../orchestration-source-health";
import type {
  CampaignSection,
  CampaignSectionEdge,
  CampaignSectionId,
  CampaignSectionNode,
  CrossDomainDependencyGraph,
} from "./cross-domain-orchestrator-types";

function sectionHealth(section: CampaignSection, state: CampaignState, sourceHealth: OrchestrationSourceHealth[]): CampaignSectionNode["health"] {
  const domains = section.ownedDomains.map((d) => state.domainStatuses[d]?.band).filter(Boolean);
  const degradedSource = sourceHealth.some((s) => section.sourceHealthIds.includes(s.sourceId) && (s.status === "error" || s.status === "missing"));
  if (degradedSource) return "blocked";
  if (domains.includes("critical")) return "blocked";
  if (domains.includes("weak")) return "weak";
  if (domains.includes("stable")) return "stable";
  return "strong";
}

function explicitEdges(): CampaignSectionEdge[] {
  return [
    {
      from: "county_intelligence",
      to: "events_calendar",
      relationship: "unlocks",
      whyItMatters: "County posture determines where events should happen and what local prep is missing.",
      evidence: ["county intelligence affects events"],
    },
    {
      from: "county_intelligence",
      to: "volunteer_field",
      relationship: "unlocks",
      whyItMatters: "Field and volunteer work should follow county priority, weak counties, and Power of 5 gaps.",
      evidence: ["county intelligence affects volunteer and field"],
    },
    {
      from: "communications",
      to: "email_os_ecc",
      relationship: "depends_on",
      whyItMatters: "Email OS should only prepare sends after comms readiness and message context are understood.",
      evidence: ["comms readiness affects email"],
    },
    {
      from: "events_calendar",
      to: "memory_observations",
      relationship: "informs",
      whyItMatters: "Events create hot wash notes, county memory, and reusable lessons.",
      evidence: ["events affect observations and lessons"],
    },
    {
      from: "finance_reimbursement",
      to: "compliance",
      relationship: "requires_review",
      whyItMatters: "Finance and reimbursement issues become compliance risks if documentation is incomplete.",
      evidence: ["finance affects compliance"],
    },
    {
      from: "memory_observations",
      to: "tool_builder",
      relationship: "informs",
      whyItMatters: "Repeated friction and feedback become tool build tickets.",
      evidence: ["feedback loop affects tool selection"],
    },
    {
      from: "deployment_readiness",
      to: "public_site",
      relationship: "blocks",
      whyItMatters: "Public/admin changes should not ship without test, typecheck, build, and migration confidence.",
      evidence: ["deployment readiness affects whether changes are safe to ship"],
    },
  ];
}

export function buildCrossDomainDependencyGraph(input: {
  sections: CampaignSection[];
  state: CampaignState;
  sourceHealth: OrchestrationSourceHealth[];
}): CrossDomainDependencyGraph {
  const nodes: CampaignSectionNode[] = input.sections.map((section) => ({
    id: section.id,
    label: section.label,
    domains: section.ownedDomains,
    health: sectionHealth(section, input.state, input.sourceHealth),
    routePaths: section.routePaths,
    toolCount: section.primaryTools.length + section.relatedTools.length,
    ownerRoles: section.humanOwners,
  }));

  const edges: CampaignSectionEdge[] = [...explicitEdges()];
  for (const section of input.sections) {
    for (const dep of section.upstreamDependencies) {
      edges.push({
        from: dep,
        to: section.id,
        relationship: "depends_on",
        whyItMatters: `${section.label} depends on ${dep.replaceAll("_", " ")} context before the agent should prepare action.`,
        evidence: [`${section.id}.upstreamDependencies`],
      });
    }
    for (const dep of section.downstreamDependencies) {
      edges.push({
        from: section.id,
        to: dep,
        relationship: "unlocks",
        whyItMatters: `${section.label} can improve ${dep.replaceAll("_", " ")} when its signals are fresh.`,
        evidence: [`${section.id}.downstreamDependencies`],
      });
    }
  }

  const weakSections = nodes.filter((n) => n.health === "weak").map((n) => n.id);
  const blockedSections = nodes.filter((n) => n.health === "blocked").map((n) => n.id);
  const highLeverageSections = nodes
    .map((n) => ({ id: n.id, outs: edges.filter((e) => e.from === n.id).length }))
    .sort((a, b) => b.outs - a.outs)
    .slice(0, 6)
    .map((n) => n.id);

  const dependencyWarnings: string[] = [];
  for (const blocked of blockedSections) {
    const affected = edges.filter((e) => e.from === blocked).map((e) => e.to);
    if (affected.length) {
      dependencyWarnings.push(`${blocked.replaceAll("_", " ")} is blocked and affects ${affected.slice(0, 4).join(", ")}.`);
    }
  }
  if (input.state.feedbackLoop.feedbackHealth.ignoredCount > 0) {
    dependencyWarnings.push("Feedback is stale or ignored in places, so recommendation confidence should stay conservative.");
  }
  if (input.state.emailEccReadiness.massSendBlocked) {
    dependencyWarnings.push("Email/ECC remains human-gated; comms-to-field sequences can prepare but not send.");
  }

  return {
    nodes,
    edges: edges.filter((e, idx, arr) => arr.findIndex((x) => x.from === e.from && x.to === e.to && x.relationship === e.relationship) === idx),
    weakSections,
    blockedSections,
    highLeverageSections: [...new Set(highLeverageSections as CampaignSectionId[])],
    dependencyWarnings,
  };
}
