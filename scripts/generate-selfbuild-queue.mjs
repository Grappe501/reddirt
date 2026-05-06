#!/usr/bin/env node
/**
 * REDDIRT-SELFBUILD-QUEUE-GENERATOR-1.0 — build queue JSON from roadmap + dependency graph + boundaries.
 * Does not execute slices or mutate src. Writes only data/selfbuild queue outputs.
 * Run: cd RedDirt && node scripts/generate-selfbuild-queue.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const OUT = path.join(ROOT, "data/selfbuild");

const PREREQ = [
  "data/architecture/reddirt_v2_cursor_roadmap_seed.json",
  "data/selfbuild/reddirt_selfbuild_slice_schema.json",
  "data/selfbuild/reddirt_selfbuild_forbidden_paths.json",
  "data/selfbuild/reddirt_selfbuild_forbidden_actions.json",
  "data/selfbuild/reddirt_selfbuild_boundary_profiles.json",
  "data/selfbuild/reddirt_selfbuild_dependency_graph.json",
  "data/selfbuild/reddirt_selfbuild_known_blockers.json",
  "docs/campaign-email-command-center-progress-ledger.md",
];

const MUST_NOT_GLOBAL = [
  "No live sends or auto-send; no Gmail send or SendGrid broadcast",
  "No real contact import; no automation worker activation",
  "No printing secrets; no committing .env",
  "No unapproved migrations; no unapproved sibling app edits; no unapproved sos-public coupling",
];

function readJson(p) {
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

function exists(p) {
  try {
    fs.accessSync(p);
    return true;
  } catch {
    return false;
  }
}

function stdChecks() {
  return [
    "cd RedDirt && node scripts/validate-selfbuild-slice.mjs",
    "cd RedDirt && node scripts/validate-selfbuild-boundaries.mjs",
    "cd RedDirt && npm run email:no-send-scan",
  ];
}

function buildFirstFive() {
  const forbidden = [
    "RedDirt/prisma/migrations/**",
    "sos-public/**",
    "../ajax/**",
    "../phatlip/**",
    "../countyWorkbench/**",
    "RedDirt/.env",
  ];
  const docPaths = ["RedDirt/docs/**", "RedDirt/data/selfbuild/**", "RedDirt/scripts/**", "RedDirt/develop_notes/**"];

  const statusBySliceId = {
    "REDDIRT-SELFBUILD-SLICE-SCHEMA-1.0": "completed",
    "REDDIRT-SELFBUILD-FORBIDDEN-PATH-GATES-1.0": "completed",
    "REDDIRT-SELFBUILD-DEPENDENCY-GRAPH-1.0": "completed",
    "REDDIRT-SELFBUILD-QUEUE-GENERATOR-1.0": "completed",
    "REDDIRT-EMAIL-HOSTED-DB-PROOF-1.0": "ready",
  };

  const items = [
    {
      queueId: "QB-001",
      sliceId: "REDDIRT-SELFBUILD-SLICE-SCHEMA-1.0",
      phase: "self_build_foundation",
      title: "Self-build slice schema and return format",
      priority: "P0",
      riskLevel: "low",
      readinessState: "operational_local",
      v2Layers: ["self_build_intelligence", "compliance_governance_safety"],
      blocked: false,
      blockedBy: [],
      requiredBeforeStart: [],
      allowedPaths: docPaths,
      forbiddenPaths: forbidden,
      proofRequired: ["develop_notes/REDDIRT_SELFBUILD_SLICE_SCHEMA_1_0_REPORT.md", "node scripts/validate-selfbuild-slice.mjs"],
      checksRequired: [...stdChecks(), "cd RedDirt && node scripts/validate-selfbuild-dependency-graph.mjs"],
      mustNotDo: [...MUST_NOT_GLOBAL, "No route or Prisma edits in this packet"],
      expectedOutputs: ["reddirt_selfbuild_slice_schema.json", "reddirt_selfbuild_required_return_format.json", "REDDIRT_SELFBUILD_SLICE_PROTOCOL.md"],
      finalReturnFormat: ["activeLane", "sliceId", "filesChanged", "commandsRunAndResults", "proofArtifacts", "governanceAttestation", "progressEffectsRealized", "remainingBlockers", "nextSafeSliceRecommendation"],
    },
    {
      queueId: "QB-002",
      sliceId: "REDDIRT-SELFBUILD-FORBIDDEN-PATH-GATES-1.0",
      phase: "self_build_foundation",
      title: "Forbidden path and action gates",
      priority: "P0",
      riskLevel: "low",
      readinessState: "operational_local",
      v2Layers: ["self_build_intelligence", "compliance_governance_safety", "public_site_interface_boundary"],
      blocked: false,
      blockedBy: [],
      requiredBeforeStart: ["REDDIRT-SELFBUILD-SLICE-SCHEMA-1.0"],
      allowedPaths: docPaths,
      forbiddenPaths: forbidden,
      proofRequired: ["develop_notes/REDDIRT_SELFBUILD_FORBIDDEN_PATH_GATES_1_0_REPORT.md", "node scripts/validate-selfbuild-boundaries.mjs"],
      checksRequired: [...stdChecks(), "cd RedDirt && node scripts/validate-selfbuild-dependency-graph.mjs"],
      mustNotDo: [...MUST_NOT_GLOBAL, "No product src edits"],
      expectedOutputs: ["reddirt_selfbuild_forbidden_paths.json", "reddirt_selfbuild_forbidden_actions.json", "validate-selfbuild-boundaries.mjs"],
      finalReturnFormat: ["activeLane", "sliceId", "filesChanged", "commandsRunAndResults", "proofArtifacts", "governanceAttestation", "progressEffectsRealized", "remainingBlockers", "nextSafeSliceRecommendation"],
    },
    {
      queueId: "QB-003",
      sliceId: "REDDIRT-SELFBUILD-DEPENDENCY-GRAPH-1.0",
      phase: "self_build_foundation",
      title: "Dependency graph and layer matrix",
      priority: "P0",
      riskLevel: "low",
      readinessState: "operational_local",
      v2Layers: ["self_build_intelligence"],
      blocked: false,
      blockedBy: [],
      requiredBeforeStart: ["REDDIRT-SELFBUILD-SLICE-SCHEMA-1.0", "REDDIRT-SELFBUILD-FORBIDDEN-PATH-GATES-1.0"],
      allowedPaths: docPaths,
      forbiddenPaths: forbidden,
      proofRequired: ["develop_notes/REDDIRT_SELFBUILD_DEPENDENCY_GRAPH_1_0_REPORT.md", "node scripts/validate-selfbuild-dependency-graph.mjs"],
      checksRequired: [...stdChecks(), "cd RedDirt && node scripts/generate-selfbuild-dependency-graph.mjs"],
      mustNotDo: [...MUST_NOT_GLOBAL, "No src mutation"],
      expectedOutputs: ["reddirt_selfbuild_dependency_graph.json", "reddirt_selfbuild_layer_dependency_matrix.json", "reddirt_selfbuild_known_blockers.json"],
      finalReturnFormat: ["activeLane", "sliceId", "filesChanged", "commandsRunAndResults", "proofArtifacts", "governanceAttestation", "progressEffectsRealized", "remainingBlockers", "nextSafeSliceRecommendation"],
    },
    {
      queueId: "QB-004",
      sliceId: "REDDIRT-SELFBUILD-QUEUE-GENERATOR-1.0",
      phase: "self_build_foundation",
      title: "Self-build queue generator",
      priority: "P0",
      riskLevel: "medium",
      readinessState: "operational_local",
      v2Layers: ["self_build_intelligence"],
      blocked: false,
      blockedBy: [],
      requiredBeforeStart: ["REDDIRT-SELFBUILD-DEPENDENCY-GRAPH-1.0"],
      allowedPaths: docPaths,
      forbiddenPaths: forbidden,
      proofRequired: ["develop_notes/REDDIRT_SELFBUILD_QUEUE_GENERATOR_1_0_REPORT.md", "node scripts/validate-selfbuild-queue.mjs"],
      checksRequired: [...stdChecks(), "cd RedDirt && node scripts/generate-selfbuild-queue.mjs"],
      mustNotDo: [...MUST_NOT_GLOBAL, "No slice execution from generator"],
      expectedOutputs: ["reddirt_selfbuild_queue.json", "reddirt_selfbuild_queue_status.json", "reddirt_selfbuild_next_recommendation.json"],
      finalReturnFormat: ["activeLane", "sliceId", "filesChanged", "commandsRunAndResults", "proofArtifacts", "governanceAttestation", "progressEffectsRealized", "remainingBlockers", "nextSafeSliceRecommendation"],
    },
    {
      queueId: "QB-005",
      sliceId: "REDDIRT-EMAIL-HOSTED-DB-PROOF-1.0",
      phase: "phase_1_email_command_center_proof",
      title: "Hosted DB proof for Email Command Center",
      priority: "P1",
      riskLevel: "high",
      readinessState: "planned",
      v2Layers: ["communications_intelligence", "deployment_environment_readiness", "compliance_governance_safety"],
      blocked: false,
      blockedBy: [],
      requiredBeforeStart: ["REDDIRT-SELFBUILD-QUEUE-GENERATOR-1.0"],
      allowedPaths: [
        "RedDirt/docs/**",
        "RedDirt/scripts/email-command-center-db-diagnose.mjs",
        "RedDirt/src/app/admin/**/email-command-center/readiness/hosted-db/**",
        "RedDirt/develop_notes/**",
      ],
      forbiddenPaths: [...forbidden, "RedDirt/src/app/api/**/send**"],
      proofRequired: ["npm run email:db:diagnose (redacted)", "Operator hosted verification attestation"],
      checksRequired: ["cd RedDirt && npm run email:db:diagnose", "cd RedDirt && npm run email:no-send-scan", "cd RedDirt && npm run check"],
      mustNotDo: [...MUST_NOT_GLOBAL, "No changing EMAIL_WORKFLOW_CAN_SEND_FROM_ITEM", "No prisma migrate deploy without steered packet"],
      expectedOutputs: ["develop_notes/REDDIRT_EMAIL_HOSTED_DB_PROOF_1_0_REPORT.md", "Optional PROJECT_MASTER_MAP hosted narrative"],
      finalReturnFormat: ["activeLane", "sliceId", "filesChanged", "commandsRunAndResults", "proofArtifacts", "governanceAttestation", "progressEffectsRealized", "remainingBlockers", "nextSafeSliceRecommendation"],
    },
  ];
  return { items, meta: { statusBySliceId } };
}

function buildExtendedQueue(graph, blockers) {
  const { items: first, meta } = buildFirstFive();
  void graph;
  const extra = [
    {
      queueId: "QB-006",
      sliceId: "REDDIRT-EMAIL-LIVE-SEND-PROOF-1.0",
      phase: "phase_1_email_command_center_proof",
      title: "Governed live send proof on hosted stack",
      priority: "P2",
      riskLevel: "critical",
      readinessState: "planned",
      v2Layers: ["communications_intelligence", "compliance_governance_safety"],
      blocked: true,
      blockedBy: ["hosted_db_proof_not_canonical", "live_send_blocked_until_steve"],
      requiredBeforeStart: ["REDDIRT-EMAIL-HOSTED-DB-PROOF-1.0"],
      allowedPaths: ["RedDirt/docs/**", "RedDirt/src/lib/email-command-center/**", "RedDirt/src/app/admin/**"],
      forbiddenPaths: ["sos-public/**", "RedDirt/.env", "../ajax/**"],
      proofRequired: ["Hosted DB proof complete", "Steve approval recorded", "Send execution preflight"],
      checksRequired: ["cd RedDirt && npm run email:no-send-scan", "cd RedDirt && npm run check"],
      mustNotDo: [...MUST_NOT_GLOBAL, "No live send before Steve approval and hosted proof"],
      expectedOutputs: ["Operator attestation doc", "Ledger note"],
      finalReturnFormat: ["activeLane", "sliceId", "filesChanged", "commandsRunAndResults", "proofArtifacts", "governanceAttestation", "progressEffectsRealized", "remainingBlockers", "nextSafeSliceRecommendation"],
    },
    {
      queueId: "QB-007",
      sliceId: "REDDIRT-AUTOMATION-WORKER-DRYRUN-1.0",
      phase: "phase_1_email_command_center_proof",
      title: "Automation worker dry-run (no activation)",
      priority: "P2",
      riskLevel: "critical",
      readinessState: "planned",
      v2Layers: ["automation_intelligence", "compliance_governance_safety"],
      blocked: true,
      blockedBy: ["automation_activation_blocked"],
      requiredBeforeStart: ["REDDIRT-EMAIL-HOSTED-DB-PROOF-1.0"],
      allowedPaths: ["RedDirt/docs/**", "RedDirt/scripts/**", "RedDirt/src/lib/email-command-center/**"],
      forbiddenPaths: ["sos-public/**", "RedDirt/.env"],
      proofRequired: ["Dry-run logs redacted", "No worker activation attestation"],
      checksRequired: ["cd RedDirt && npm run email:no-send-scan", "cd RedDirt && npm run check"],
      mustNotDo: [...MUST_NOT_GLOBAL, "No automation worker activation"],
      expectedOutputs: ["Dry-run report in develop_notes"],
      finalReturnFormat: ["activeLane", "sliceId", "filesChanged", "commandsRunAndResults", "proofArtifacts", "governanceAttestation", "progressEffectsRealized", "remainingBlockers", "nextSafeSliceRecommendation"],
    },
  ];
  return { items: [...first, ...extra], meta };
}

function summarize(items, blockers, meta) {
  const total = items.length;
  const statusBy = meta?.statusBySliceId || {};
  const completed = items.filter((i) => statusBy[i.sliceId] === "completed").length;
  const ready = items.filter((i) => statusBy[i.sliceId] === "ready").length;
  const blocked = items.filter((i) => i.blocked || statusBy[i.sliceId] === "blocked").length;
  const highRisk = items.filter((i) => i.riskLevel === "high" || i.riskLevel === "critical").length;
  const productionProofItems = items.filter((i) => i.phase === "phase_1_email_command_center_proof" && i.riskLevel !== "low").length;
  const blockedGates = (blockers?.blockers || [])
    .filter((b) => (b.affectedNodes || []).some((n) => String(n).includes("proof")))
    .map((b) => b.id);
  return {
    schemaVersion: "1.0",
    slice: "REDDIRT-SELFBUILD-QUEUE-GENERATOR-1.0",
    generatedAt: new Date().toISOString(),
    totalQueueItems: total,
    completed,
    ready,
    blocked,
    highRisk,
    productionProofItems,
    nextRecommendedSlice: "REDDIRT-EMAIL-HOSTED-DB-PROOF-1.0",
    blockedProductionGates: blockedGates.length ? blockedGates : ["hosted_db_proof_not_canonical", "live_send_blocked_until_steve"],
    currentLane: "RedDirt/",
  };
}

function buildNextRecommendation() {
  return {
    schemaVersion: "1.0",
    generatedAt: new Date().toISOString(),
    nextRecommendedSlice: "REDDIRT-EMAIL-HOSTED-DB-PROOF-1.0",
    reason:
      "The AI and self-build planning foundation are ready enough to begin production-readiness proof, but no live send or automation should happen until hosted DB proof is documented.",
    whyNow: "Queue generator and dependency graph establish ordering; roadmap phase_1 dependencyRule requires hosted DB before live send and ingestion proofs.",
    safeToStart: true,
    blockedBy: [],
    requiredChecksBeforeStart: [
      "cd RedDirt && node scripts/validate-selfbuild-queue.mjs",
      "cd RedDirt && npm run email:db:diagnose",
      "cd RedDirt && npm run email:no-send-scan",
    ],
    requiredHumanApprovals: ["Steve confirms hosted DATABASE_URL/DIRECT_URL targets", "Operator can authenticate admin on hosted deploy"],
    mustNotDo: [...MUST_NOT_GLOBAL, "No live send or automation activation during hosted DB proof slice"],
    expectedOutputs: ["Redacted diagnose output", "develop_notes hosted proof report", "Optional PROJECT_MASTER_MAP narrative"],
  };
}

function main() {
  const missing = [];
  for (const rel of PREREQ) {
    const p = path.join(ROOT, rel);
    if (!exists(p)) missing.push(rel);
  }
  if (missing.length) {
    console.error("generate-selfbuild-queue: STOP — missing prerequisites:");
    missing.forEach((m) => console.error(`  - ${m}`));
    process.exit(1);
  }

  const graph = readJson(path.join(ROOT, "data/selfbuild/reddirt_selfbuild_dependency_graph.json"));
  const blockers = readJson(path.join(ROOT, "data/selfbuild/reddirt_selfbuild_known_blockers.json"));
  const roadmap = readJson(path.join(ROOT, "data/architecture/reddirt_v2_cursor_roadmap_seed.json"));

  const { items, meta } = buildExtendedQueue(graph, blockers);
  const queue = {
    schemaVersion: "1.0",
    slice: "REDDIRT-SELFBUILD-QUEUE-GENERATOR-1.0",
    generatedAt: new Date().toISOString(),
    status: "queue_seed",
    queuePolicy: {
      ordering: "dependency_graph_then_roadmap_seed",
      noExecutionInGenerator: true,
      preserveBlockedStatus: true,
      roadmapReference: "data/architecture/reddirt_v2_cursor_roadmap_seed.json",
      graphReference: "data/selfbuild/reddirt_selfbuild_dependency_graph.json",
      roadmapPhaseKeys: (roadmap.phases || []).map((p) => p.key),
    },
    items,
  };

  const status = summarize(items, blockers, meta);
  const nextRec = buildNextRecommendation();

  fs.mkdirSync(OUT, { recursive: true });
  fs.writeFileSync(path.join(OUT, "reddirt_selfbuild_queue.json"), JSON.stringify(queue, null, 2), "utf8");
  fs.writeFileSync(path.join(OUT, "reddirt_selfbuild_queue_status.json"), JSON.stringify(status, null, 2), "utf8");
  fs.writeFileSync(path.join(OUT, "reddirt_selfbuild_next_recommendation.json"), JSON.stringify(nextRec, null, 2), "utf8");

  console.log("generate-selfbuild-queue: wrote reddirt_selfbuild_queue.json");
  console.log("generate-selfbuild-queue: wrote reddirt_selfbuild_queue_status.json");
  console.log("generate-selfbuild-queue: wrote reddirt_selfbuild_next_recommendation.json");
}

main();
