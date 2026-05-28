import fs from "node:fs";
import path from "node:path";
import { ARKANSAS_COMMAND_REGIONS, ARKANSAS_COUNTY_REGISTRY } from "../../src/lib/county/arkansas-county-registry";
import { buildCountyAgentRuntimePayload } from "../../src/lib/agents/county-intelligence/countyAgentRuntimePayloadBuilder";
import { runCampaignManagerAnalysisAgent } from "../../src/lib/agents/county-intelligence/campaignManagerAnalysisAgent";

function writeJson(relPath: string, value: unknown): void {
  const abs = path.join(process.cwd(), relPath);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function avg(nums: number[]): number {
  if (nums.length === 0) return 0;
  return Math.round((nums.reduce((acc, x) => acc + x, 0) / nums.length) * 100) / 100;
}

async function main() {
  const generatedAt = new Date().toISOString();
  const runtime = await buildCountyAgentRuntimePayload();
  const analysis = runCampaignManagerAnalysisAgent(runtime);

  const counties = ARKANSAS_COUNTY_REGISTRY.map((county) => {
    const row = runtime.countyPayloads.find((x) => x.countySlug === county.slug);
    const rank = analysis.multiAgentCoordination.executiveUrgencyRanking.find(
      (x) => x.countySlug === county.slug,
    );
    const readiness = row
      ? Math.max(
          0,
          Math.min(
            100,
            Math.round(
              row.resourceOperations.operationalHealth * 0.24 +
                row.resourceOperations.volunteerCapacity * 0.16 +
                row.simulations.confidenceScore * 0.2 +
                row.publicNarrative.narrativeConfidenceScore * 0.12 +
                row.campaignBrainCoordination.coordinationConfidence * 0.18 +
                (row.readinessStatus.mapReady ? 10 : 0),
            ),
          ),
        )
      : 0;
    const confidence = row
      ? Math.max(
          0,
          Math.min(
            100,
            Math.round(
              row.publicNarrative.narrativeConfidenceScore * 0.3 +
                row.simulations.confidenceScore * 0.3 +
                row.campaignBrainCoordination.coordinationConfidence * 0.4,
            ),
          ),
        )
      : 0;
    const urgency = rank?.executiveUrgency ?? row?.campaignBrainCoordination.executiveUrgency ?? 0;
    const status =
      confidence >= 70 ? "PRESENT" : confidence >= 45 ? "LOW_CONFIDENCE" : ("MISSING" as const);
    const fragility = Math.max(0, Math.min(100, row?.resourceOperations.resourcePressure ?? 0));
    const momentum = Math.max(0, Math.min(100, row?.resourceOperations.operationalHealth ?? 0));
    const blockedAutomationStatePresent = true;
    return {
      countySlug: county.slug,
      countyName: county.displayName,
      readiness,
      urgency,
      confidence,
      status,
      fragility,
      momentum,
      row,
      blockedAutomationStatePresent,
    };
  });

  const statewideSummary = {
    campaignHealth: Math.round(
      avg(counties.map((x) => x.readiness)) * 0.55 + avg(counties.map((x) => x.confidence)) * 0.45,
    ),
    readinessAverage: avg(counties.map((x) => x.readiness)),
    executiveUrgencyAverage: avg(counties.map((x) => x.urgency)),
    blockedAutomationCount: counties.filter((x) => x.blockedAutomationStatePresent).length,
  };

  writeJson("data/executive-command/executive-command-state.json", {
    version: 1,
    generatedAt,
    statewideSummary,
    counties: counties.map((x) => ({
      countySlug: x.countySlug,
      countyName: x.countyName,
      readiness: x.readiness,
      urgency: x.urgency,
      confidence: x.confidence,
      status: x.status,
    })),
  });

  writeJson("data/executive-command/statewide-readiness-matrix.json", {
    version: 1,
    generatedAt,
    rows: counties.map((x) => ({
      countySlug: x.countySlug,
      countyName: x.countyName,
      countyReadiness: x.readiness,
      operationsMomentum: x.momentum,
      voterMetricsReadiness: x.row?.readinessStatus.voterFileReadiness === "PRESENT" ? 100 : 0,
      simulationConfidence: x.row?.simulations.confidenceScore ?? 0,
      narrativeVolatility: x.row?.publicNarrative.issueVolatility ?? 0,
      organizationalFragility: x.fragility,
      status: x.status,
    })),
  });

  writeJson("data/executive-command/executive-priority-ranking.json", {
    version: 1,
    generatedAt,
    rows: counties
      .map((x) => ({
        countySlug: x.countySlug,
        countyName: x.countyName,
        executivePriorityScore: Math.round(x.urgency * 0.55 + x.fragility * 0.35 + (100 - x.readiness) * 0.1),
        urgencyBand:
          x.urgency >= 70 ? "HIGH" : x.urgency >= 40 ? "MEDIUM" : ("LOW" as const),
        sourceLayers: [
          "data/audit/multi-agent-coordination-readiness-table.json",
          "data/audit/resource-allocation-readiness-table.json",
          "data/audit/public-narrative-readiness-table.json",
          "data/audit/simulation-engine-readiness-table.json",
        ],
        status: x.status,
      }))
      .sort((a, b) => b.executivePriorityScore - a.executivePriorityScore),
  });

  writeJson("data/executive-command/operational-bottleneck-map.json", {
    version: 1,
    generatedAt,
    rows: counties.map((x) => ({
      countySlug: x.countySlug,
      countyName: x.countyName,
      bottlenecks: [
        "SIGNAL: staffing pressure and volunteer capacity mismatch.",
        "TREND: operational momentum divergence versus intervention urgency.",
      ],
      pressureScore: x.fragility,
      label: "TREND",
      status: x.status,
    })),
  });

  writeJson("data/executive-command/statewide-intervention-queue.json", {
    version: 1,
    generatedAt,
    rows: counties
      .map((x) => ({
        countySlug: x.countySlug,
        countyName: x.countyName,
        intervention:
          "Human-reviewed intervention only: resolve staffing pressure and readiness blockers.",
        priority: Math.round(x.urgency * 0.6 + (100 - x.readiness) * 0.4),
        requiredHumanApprovals: [
          "Executive review required before intervention execution.",
          "Compliance review required for any outreach-related operational changes.",
        ],
        status: x.status,
      }))
      .sort((a, b) => b.priority - a.priority),
  });

  writeJson("data/executive-command/regional-pressure-map.json", {
    version: 1,
    generatedAt,
    rows: ARKANSAS_COMMAND_REGIONS.map((region) => {
      const rows = counties.filter((x) => {
        const county = ARKANSAS_COUNTY_REGISTRY.find((c) => c.slug === x.countySlug);
        return county?.regionId === region.id;
      });
      return {
        regionId: region.id,
        regionLabel: region.label,
        pressureScore: rows.length > 0 ? Math.round(avg(rows.map((x) => x.fragility))) : 0,
        counties: rows.map((x) => x.countySlug),
        label: "TREND",
        status: rows.some((x) => x.status === "MISSING")
          ? "MISSING"
          : rows.some((x) => x.status === "LOW_CONFIDENCE")
            ? "LOW_CONFIDENCE"
            : "PRESENT",
      };
    }),
  });

  writeJson("data/executive-command/campaign-health-scorecard.json", {
    version: 1,
    generatedAt,
    metrics: [
      { metric: "county_readiness", score: Math.round(avg(counties.map((x) => x.readiness))), label: "TREND", status: "PRESENT" },
      { metric: "operational_momentum", score: Math.round(avg(counties.map((x) => x.momentum))), label: "FORECAST", status: "PRESENT" },
      { metric: "volunteer_capacity", score: Math.round(avg(counties.map((x) => x.row?.resourceOperations.volunteerCapacity ?? 0))), label: "FORECAST", status: "LOW_CONFIDENCE" },
      { metric: "staffing_pressure", score: Math.round(avg(counties.map((x) => x.fragility))), label: "TREND", status: "PRESENT" },
      { metric: "event_coverage", score: Math.round(avg(counties.map((x) => x.row?.resourceOperations.operationalHealth ?? 0))), label: "SIGNAL", status: "LOW_CONFIDENCE" },
      { metric: "voter_metrics_readiness", score: Math.round(avg(counties.map((x) => (x.row?.readinessStatus.voterFileReadiness === "PRESENT" ? 100 : 0)))), label: "SIGNAL", status: "MISSING" },
      { metric: "registration_momentum", score: Math.round(avg(counties.map((x) => x.row?.resourceOperations.operationalHealth ?? 0))), label: "FORECAST", status: "LOW_CONFIDENCE" },
      { metric: "simulation_confidence", score: Math.round(avg(counties.map((x) => x.row?.simulations.confidenceScore ?? 0))), label: "MODEL", status: "LOW_CONFIDENCE" },
      { metric: "narrative_volatility", score: Math.round(avg(counties.map((x) => x.row?.publicNarrative.issueVolatility ?? 0))), label: "TREND", status: "LOW_CONFIDENCE" },
      { metric: "organizational_fragility", score: Math.round(avg(counties.map((x) => x.fragility))), label: "FORECAST", status: "PRESENT" },
      { metric: "regional_dependencies", score: Math.round(avg(counties.map((x) => x.row?.campaignBrainCoordination.coordinationConfidence ?? 0))), label: "TREND", status: "LOW_CONFIDENCE" },
      { metric: "intervention_urgency", score: Math.round(avg(counties.map((x) => x.urgency))), label: "TREND", status: "PRESENT" },
      { metric: "data_confidence", score: Math.round(avg(counties.map((x) => x.confidence))), label: "SIGNAL", status: "LOW_CONFIDENCE" },
      { metric: "statewide_bottlenecks", score: Math.round(avg(counties.map((x) => x.fragility))), label: "SIGNAL", status: "PRESENT" },
      { metric: "campaign_system_health", score: statewideSummary.campaignHealth, label: "FORECAST", status: "LOW_CONFIDENCE" },
      { metric: "blocked_automation_state", score: 100, label: "SIGNAL", status: "PRESENT" },
      { metric: "strategy_readiness_progression", score: Math.round(avg(counties.map((x) => (x.row?.strategyGate.status === "YES" ? 100 : 0)))), label: "TREND", status: "MISSING" },
    ],
  });

  writeJson("data/executive-command/executive-alert-stream.json", {
    version: 1,
    generatedAt,
    rows: counties
      .filter((x) => x.urgency >= 65 || x.status !== "PRESENT")
      .slice(0, 150)
      .map((x) => ({
        countySlug: x.countySlug,
        countyName: x.countyName,
        alert:
          x.urgency >= 80
            ? "CRITICAL: executive urgency and fragility jointly elevated."
            : x.status === "MISSING"
              ? "WARN: missing executive synthesis coverage."
              : "INFO: monitor readiness trajectory and intervention queue position.",
        severity: x.urgency >= 80 ? "CRITICAL" : x.status === "MISSING" ? "WARN" : "INFO",
        label: x.urgency >= 70 ? "TREND" : "SIGNAL",
        sourceLayers: [
          "data/executive-command/statewide-intervention-queue.json",
          "data/executive-command/operational-bottleneck-map.json",
          "data/audit/multi-agent-coordination-readiness-table.json",
        ],
      })),
  });

  writeJson("data/executive-command/executive-brief-registry.json", {
    version: 1,
    generatedAt,
    rows: counties.map((x) => ({
      countySlug: x.countySlug,
      countyName: x.countyName,
      executiveBrief:
        "EXECUTIVE BRIEF: read-only synthesis of readiness, operational pressure, narrative/simulation confidence, and coordination state. Human approval required for execution.",
      requiredHumanApprovals: [
        "Human leadership approval required for all intervention actions.",
        "Compliance review required for any outreach-adjacent operational changes.",
      ],
      confidence: x.confidence,
      status: x.status,
    })),
  });

  writeJson("data/audit/executive-command-readiness-table.json", {
    version: 1,
    generatedAt,
    countyCount: counties.length,
    rows: counties.map((x) => ({
      countySlug: x.countySlug,
      countyName: x.countyName,
      commandStateReady: x.status,
      readinessMatrixReady: x.status,
      priorityRankingReady: x.status,
      bottleneckMapReady: x.status,
      interventionQueueReady: x.status,
      regionalPressureReady: x.status,
      healthScorecardReady: x.status,
      alertStreamReady: x.status,
      briefRegistryReady: x.status,
      blockedAutomationStatePresent: true,
      coordinationConfidence: x.row?.campaignBrainCoordination.coordinationConfidence ?? 0,
      missingCoverage:
        x.status === "MISSING"
          ? ["executive synthesis confidence", "statewide readiness alignment"]
          : x.status === "LOW_CONFIDENCE"
            ? ["confidence below target threshold"]
            : [],
    })),
  });

  console.log("Generated Phase 4S executive command artifacts.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

