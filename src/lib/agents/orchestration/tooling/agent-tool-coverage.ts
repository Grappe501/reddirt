/**
 * Tool coverage analysis — all 20 orchestration domains.
 */

import type { CampaignDomainId } from "../campaign-state-types";
import type { AgentToolCapability, AgentToolDomainCoverage } from "./agent-tooling-types";
import { ALL_ORCHESTRATION_DOMAIN_IDS, domainLabel, toolsForDomain } from "./agent-tool-registry";
import { getOrchestrationDomain } from "../orchestration-domains";

export function analyzeToolCoverageByDomain(registry: AgentToolCapability[]): AgentToolDomainCoverage[] {
  return ALL_ORCHESTRATION_DOMAIN_IDS.map((domain) => {
    const tools = toolsForDomain(registry, domain);
    const ready = tools.filter((t) => t.status === "ready");
    const planned = tools.filter((t) => t.status === "planned");
    const blocked = tools.filter((t) => t.status === "blocked");
    const spec = getOrchestrationDomain(domain);

    let coverageStatus: AgentToolDomainCoverage["coverageStatus"] = "missing";
    if (ready.length >= 5) coverageStatus = "strong";
    else if (ready.length >= 2 || ready.length + tools.filter((t) => t.status === "partial").length >= 3) coverageStatus = "adequate";
    else if (tools.length >= 1) coverageStatus = "weak";

    const nextTool =
      ready[0]?.label ??
      tools.find((t) => t.status === "partial")?.label ??
      planned[0]?.label ??
      `Build ${domainLabel(domain)} intelligence tool`;

    const whyItMatters =
      spec?.typicalBlockers[0] != null
        ? `Tools here resolve: ${spec.typicalBlockers.slice(0, 2).join("; ")}`
        : `Improves ${domainLabel(domain)} domain cognition for orchestration.`;

    return {
      domain,
      domainLabel: domainLabel(domain),
      coverageStatus,
      readyToolCount: ready.length,
      plannedToolCount: planned.length,
      blockedToolCount: blocked.length,
      recommendedNextTool: nextTool,
      whyItMatters,
    };
  });
}

export function weakCoverageDomains(coverage: AgentToolDomainCoverage[]): CampaignDomainId[] {
  return coverage.filter((c) => c.coverageStatus === "weak" || c.coverageStatus === "missing").map((c) => c.domain);
}
