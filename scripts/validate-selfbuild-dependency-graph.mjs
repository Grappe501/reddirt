#!/usr/bin/env node
/**
 * REDDIRT-SELFBUILD-DEPENDENCY-GRAPH-1.0 — validate dependency graph + matrix + blockers seeds.
 * Run: cd RedDirt && node scripts/validate-selfbuild-dependency-graph.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

const GRAPH = path.join(ROOT, "data/selfbuild/reddirt_selfbuild_dependency_graph.json");
const MATRIX = path.join(ROOT, "data/selfbuild/reddirt_selfbuild_layer_dependency_matrix.json");
const BLOCKERS = path.join(ROOT, "data/selfbuild/reddirt_selfbuild_known_blockers.json");

const PREREQ = [
  "data/selfbuild/reddirt_selfbuild_slice_schema.json",
  "data/selfbuild/reddirt_selfbuild_forbidden_paths.json",
  "data/architecture/reddirt_v2_layer_registry.json",
];

const REQUIRED_NODE_IDS = [
  "v2_arch_registry",
  "selfbuild_slice_schema",
  "selfbuild_forbidden_path_gates",
  "selfbuild_dependency_graph",
  "selfbuild_queue_generator",
  "email_ai_intelligence_upgrade_stack",
  "email_diagnostics_env",
  "sendgrid_auth_check",
  "sendgrid_sandbox_send",
  "hosted_db_proof",
  "live_send_proof",
  "automation_worker_dryrun",
  "production_contact_ingestion_proof",
  "final_operational_verify",
  "campaign_memory_foundation",
  "daily_operational_intelligence",
  "scheduling_intelligence",
  "governed_ai_orchestration",
  "public_site_interface_contract",
];

const PRODUCTION_PROOF_TYPES = new Set(["production_proof"]);

function readJson(p) {
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

function main() {
  const errors = [];
  for (const rel of PREREQ) {
    const p = path.join(ROOT, rel);
    if (!fs.existsSync(p)) errors.push(`Missing prerequisite: ${rel}`);
  }
  if (!fs.existsSync(GRAPH)) errors.push("Missing data/selfbuild/reddirt_selfbuild_dependency_graph.json (run generate-selfbuild-dependency-graph.mjs)");
  if (!fs.existsSync(MATRIX)) errors.push("Missing data/selfbuild/reddirt_selfbuild_layer_dependency_matrix.json");
  if (!fs.existsSync(BLOCKERS)) errors.push("Missing data/selfbuild/reddirt_selfbuild_known_blockers.json");

  let graph;
  let matrix;
  let blockers;
  if (errors.length === 0) {
    try {
      graph = readJson(GRAPH);
      matrix = readJson(MATRIX);
      blockers = readJson(BLOCKERS);
    } catch (e) {
      errors.push(e.message || String(e));
    }
  }

  if (errors.length === 0) {
    if (graph.schemaVersion !== "1.0") errors.push("graph schemaVersion must be 1.0");
    if (!Array.isArray(graph.nodes) || !Array.isArray(graph.edges)) errors.push("graph must have nodes[] and edges[]");
    if (!Array.isArray(graph.recommendedExecutionOrder)) errors.push("graph must have recommendedExecutionOrder[]");

    const byId = Object.fromEntries((graph.nodes || []).map((n) => [n.id, n]));
    for (const id of REQUIRED_NODE_IDS) {
      if (!byId[id]) errors.push(`Missing required node id: ${id}`);
    }

    const order = graph.recommendedExecutionOrder;
    const indexOf = (id) => order.indexOf(id);

    for (const n of graph.nodes || []) {
      if (PRODUCTION_PROOF_TYPES.has(n.type)) {
        for (const req of n.requiredBefore || []) {
          if (!order.includes(req)) {
            errors.push(`production_proof node "${n.id}" requires "${req}" but it is missing from recommendedExecutionOrder`);
            continue;
          }
          if (indexOf(req) >= indexOf(n.id) && indexOf(n.id) >= 0) {
            errors.push(
              `production_proof ordering: "${req}" must appear before "${n.id}" in recommendedExecutionOrder`,
            );
          }
        }
        if (n.safeToQueue === true) {
          errors.push(`production_proof node "${n.id}" must not have safeToQueue true before prerequisites are satisfied (keep false)`);
        }
      }
    }

    const live = byId.live_send_proof;
    if (live) {
      if (!(live.requiredBefore || []).includes("hosted_db_proof")) {
        errors.push("live_send_proof must list hosted_db_proof in requiredBefore");
      }
      const joinedProof = (live.proofRequired || []).join(" ").toLowerCase();
      const joinedBlocked = (live.blockedBy || []).join(" ").toLowerCase();
      if (!joinedProof.includes("steve") && !joinedBlocked.includes("steve")) {
        errors.push("live_send_proof must reference Steve approval in proofRequired or blockedBy (human gate)");
      }
      const edgeToHosted = (graph.edges || []).some(
        (e) => e.from === "live_send_proof" && e.to === "hosted_db_proof" && e.relation === "requires",
      );
      if (!edgeToHosted) errors.push('edges must include { from: "live_send_proof", to: "hosted_db_proof", relation: "requires" }');
    }

    const auto = byId.automation_worker_dryrun;
    if (auto) {
      const pb = (auto.proofRequired || []).join(" ").toLowerCase();
      if (!pb.includes("activation") && !(auto.blockedBy || []).includes("automation_activation_blocked")) {
        errors.push("automation_worker_dryrun must document no activation in proofRequired or blockedBy");
      }
    }

    const pub = byId.public_site_interface_contract;
    if (pub) {
      if (pub.permitsSosPublicMerge === true) {
        errors.push("public_site_interface_contract must not set permitsSosPublicMerge true (no sos-public merge)");
      }
    }

    if (matrix.schemaVersion !== "1.0" || !matrix.layers || typeof matrix.layers !== "object") {
      errors.push("layer matrix invalid: need schemaVersion 1.0 and layers object");
    }
    const layerKeys = [
      "communications_intelligence",
      "campaign_memory",
      "operational_intelligence",
      "scheduling_intelligence",
      "audience_relationship_intelligence",
      "automation_intelligence",
      "analytics_deliverability_intelligence",
      "owned_media_content_intelligence",
      "compliance_governance_safety",
      "self_build_intelligence",
      "deployment_environment_readiness",
      "public_site_interface_boundary",
    ];
    for (const lk of layerKeys) {
      const row = matrix.layers[lk];
      if (!row) errors.push(`layer matrix missing row: ${lk}`);
      else {
        for (const k of ["prerequisites", "blockers", "firstSafeSlice", "productionGate", "humanApprovalGates", "currentReadinessState"]) {
          if (!(k in row)) errors.push(`layer ${lk} missing field: ${k}`);
        }
        if (!Array.isArray(row.prerequisites) || !Array.isArray(row.blockers) || !Array.isArray(row.humanApprovalGates)) {
          errors.push(`layer ${lk}: prerequisites, blockers, humanApprovalGates must be arrays`);
        }
      }
    }

    if (!Array.isArray(blockers.blockers)) errors.push("known_blockers.json must have blockers[]");
  }

  const ok = errors.length === 0;
  console.log("");
  console.log("=== validate-selfbuild-dependency-graph ===");
  if (ok) {
    console.log("STATUS: PASS");
    console.log("");
    console.log("  Graph, layer matrix, and known blockers seeds validated.");
    console.log("");
  } else {
    console.log("STATUS: FAIL");
    console.log("");
    errors.forEach((e) => console.log(`  - ${e}`));
    console.log("");
  }
  process.exit(ok ? 0 : 1);
}

main();
