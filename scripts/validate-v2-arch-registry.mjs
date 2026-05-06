#!/usr/bin/env node
/**
 * REDDIRT-V2-ARCH-REGISTRY — full validation (JSON + docs + matrix + roadmap).
 * Read-only. Does not modify package.json.
 * Run: cd RedDirt && node scripts/validate-v2-arch-registry.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

const REQUIRED_JSON = [
  "data/architecture/reddirt_v2_layer_registry.json",
  "data/architecture/reddirt_v2_external_system_review_matrix.json",
  "data/architecture/reddirt_v2_cursor_roadmap_seed.json",
];

const REQUIRED_DOCS = [
  "docs/REDDIRT_V2_MASTER_ARCHITECTURE.md",
  "docs/REDDIRT_V2_SOURCE_OF_TRUTH_POLICY.md",
  "docs/REDDIRT_V2_CONSOLIDATION_REVIEW_POLICY.md",
];

const REQUIRED_LAYER_KEYS = [
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

const LAYER_FIELDS = [
  "key",
  "label",
  "purpose",
  "currentSignals",
  "canonicalRedDirtAreas",
  "relatedRoutes",
  "relatedModelsOrEnums",
  "relatedDocs",
  "externalSignals",
  "buildOutEstimate",
  "readinessStatus",
  "governanceRequirements",
  "nextRecommendedSlices",
];

/** All roadmap candidate slice IDs required by REDDIRT-V2-ARCH-REGISTRY-1.0 */
const REQUIRED_ROADMAP_SLICE_IDS = [
  "REDDIRT-EMAIL-HOSTED-DB-PROOF-1.0",
  "REDDIRT-EMAIL-LIVE-SEND-PROOF-1.0",
  "REDDIRT-AUTOMATION-WORKER-DRYRUN-1.0",
  "REDDIRT-PRODUCTION-CONTACT-INGESTION-PROOF-1.0",
  "REDDIRT-EMAIL-FINAL-OPERATIONAL-VERIFY-1.0",
  "REDDIRT-MEMORY-SCHEMA-INVENTORY-1.0",
  "REDDIRT-SOURCE-GROUNDED-MEMORY-INDEX-1.0",
  "REDDIRT-CONTACT-COUNTY-EVENT-LINKER-1.0",
  "REDDIRT-CAMPAIGN-MEMORY-RETRIEVAL-API-1.0",
  "REDDIRT-MEMORY-GOVERNANCE-GATES-1.0",
  "REDDIRT-DAILY-BRIEFING-SCHEMA-1.0",
  "REDDIRT-OPEN-LOOPS-DETECTOR-1.0",
  "REDDIRT-READINESS-SNAPSHOT-ENGINE-1.0",
  "REDDIRT-EXECUTIVE-BRIEFING-DASHBOARD-1.0",
  "REDDIRT-OPERATOR-ACTION-QUEUE-1.0",
  "REDDIRT-CALENDAR-SOURCE-AUDIT-1.0",
  "REDDIRT-AVAILABILITY-SUGGESTION-ENGINE-1.0",
  "REDDIRT-COUNTY-TOUR-SCHEDULING-INTELLIGENCE-1.0",
  "REDDIRT-FOLLOWUP-REMINDER-QUEUE-1.0",
  "REDDIRT-SCHEDULING-GOVERNANCE-GATES-1.0",
  "REDDIRT-AI-PROMPT-REGISTRY-1.0",
  "REDDIRT-AI-SOURCE-GROUNDING-CONTRACT-1.0",
  "REDDIRT-AI-RECOMMENDATION-EXPLAINER-1.0",
  "REDDIRT-AI-APPROVAL-WORKFLOW-1.0",
  "REDDIRT-AI-ACTION-AUDIT-LOG-1.0",
  "REDDIRT-SELFBUILD-SLICE-SCHEMA-1.0",
  "REDDIRT-SELFBUILD-FORBIDDEN-PATH-GATES-1.0",
  "REDDIRT-SELFBUILD-DEPENDENCY-GRAPH-1.0",
  "REDDIRT-SELFBUILD-QUEUE-GENERATOR-1.0",
  "REDDIRT-SELFBUILD-PROGRESS-LEDGER-1.0",
  "REDDIRT-SELFBUILD-HANDOFF-PACKET-GENERATOR-1.0",
  "REDDIRT-CONSOLIDATION-DECISION-RECORDS-1.0",
  "REDDIRT-PUBLIC-SITE-INTERFACE-CONTRACT-1.0",
];

const PHRASE_SCANNER =
  "scanner classification is evidence of possible relationship, not permission to migrate";
const PHRASE_PLACEHOLDER = "current sos-public contents are placeholder";

function norm(s) {
  return String(s)
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[`'"]/g, "")
    .trim();
}

function main() {
  const lines = [];
  let failures = 0;

  function pass(msg) {
    lines.push(`[PASS] ${msg}`);
  }
  function fail(msg) {
    lines.push(`[FAIL] ${msg}`);
    failures++;
  }

  // --- Files exist ---
  for (const rel of REQUIRED_JSON) {
    const abs = path.join(ROOT, rel);
    if (fs.existsSync(abs)) pass(`JSON exists: ${rel}`);
    else fail(`missing JSON: ${rel}`);
  }
  for (const rel of REQUIRED_DOCS) {
    const abs = path.join(ROOT, rel);
    if (fs.existsSync(abs)) pass(`Doc exists: ${rel}`);
    else fail(`missing doc: ${rel}`);
  }

  // --- Parse JSON ---
  let registry = null;
  let matrix = null;
  let roadmap = null;

  for (const rel of REQUIRED_JSON) {
    const abs = path.join(ROOT, rel);
    if (!fs.existsSync(abs)) continue;
    try {
      const o = JSON.parse(fs.readFileSync(abs, "utf8"));
      if (rel.includes("layer_registry")) registry = o;
      else if (rel.includes("external_system")) matrix = o;
      else if (rel.includes("cursor_roadmap")) roadmap = o;
      pass(`JSON parses: ${rel}`);
    } catch (e) {
      fail(`JSON parse error ${rel}: ${e.message}`);
    }
  }

  // --- Registry: layers ---
  if (registry) {
    if (registry.schemaVersion !== "1.0") fail('registry schemaVersion must be "1.0"');
    else pass('registry schemaVersion is "1.0"');
    if (registry.slice !== "REDDIRT-V2-ARCH-REGISTRY-1.0") fail("registry slice mismatch");
    else pass("registry slice OK");
    if (!Array.isArray(registry.layers)) fail("registry.layers must be array");
    else {
      const keys = registry.layers.map((x) => x.key);
      for (const k of REQUIRED_LAYER_KEYS) {
        if (!keys.includes(k)) fail(`registry missing layer key: ${k}`);
        else pass(`registry layer present: ${k}`);
      }
      if (keys.length !== REQUIRED_LAYER_KEYS.length) {
        fail(`registry layer count expected ${REQUIRED_LAYER_KEYS.length}, got ${keys.length}`);
      } else pass(`registry layer count: ${REQUIRED_LAYER_KEYS.length}`);
      for (const layer of registry.layers) {
        for (const f of LAYER_FIELDS) {
          if (!(f in layer)) {
            fail(`registry layer ${layer.key} missing field ${f}`);
            break;
          }
          if (f === "buildOutEstimate" && layer[f] !== null) {
            fail(`registry layer ${layer.key} buildOutEstimate must be null`);
            break;
          }
        }
      }
      pass("registry layer field shapes checked");
    }
  }

  // --- Matrix: sos-public ---
  if (matrix) {
    if (!Array.isArray(matrix.systems)) fail("matrix.systems must be array");
    else {
      const sos = matrix.systems.find(
        (s) =>
          (s.name && String(s.name).toLowerCase() === "sos-public") ||
          (s.relativePath && String(s.relativePath).replace(/\\/g, "/").toLowerCase() === "sos-public")
      );
      if (!sos) fail('matrix must include sos-public entry (name or relativePath "sos-public")');
      else {
        pass("matrix includes sos-public");
        if (sos.migrationDefault !== "do_not_merge_into_RedDirt") {
          fail(`sos-public migrationDefault must be "do_not_merge_into_RedDirt", got ${JSON.stringify(sos.migrationDefault)}`);
        } else pass('sos-public migrationDefault is "do_not_merge_into_RedDirt"');
        if (sos.canBeMovedWithoutApproval !== false) {
          fail(`sos-public canBeMovedWithoutApproval must be false, got ${sos.canBeMovedWithoutApproval}`);
        } else pass("sos-public canBeMovedWithoutApproval is false");
        if (sos.canBeImportedIntoRedDirtWithoutApproval !== false) {
          fail(`sos-public canBeImportedIntoRedDirtWithoutApproval must be false, got ${sos.canBeImportedIntoRedDirtWithoutApproval}`);
        } else pass("sos-public canBeImportedIntoRedDirtWithoutApproval is false");
      }
    }
  }

  // --- Roadmap: slice IDs ---
  if (roadmap) {
    if (roadmap.schemaVersion !== "1.0") fail('roadmap schemaVersion must be "1.0"');
    else pass('roadmap schemaVersion is "1.0"');
    if (roadmap.status !== "roadmap_seed") fail(`roadmap status must be roadmap_seed, got ${JSON.stringify(roadmap.status)}`);
    else pass("roadmap status is roadmap_seed");
    const found = new Set();
    if (Array.isArray(roadmap.phases)) {
      for (const ph of roadmap.phases) {
        if (!Array.isArray(ph.candidateSlices)) continue;
        for (const c of ph.candidateSlices) {
          if (c && typeof c.sliceId === "string") found.add(c.sliceId);
        }
      }
    } else fail("roadmap.phases must be array");
    for (const id of REQUIRED_ROADMAP_SLICE_IDS) {
      if (!found.has(id)) fail(`roadmap missing sliceId: ${id}`);
      else pass(`roadmap sliceId present: ${id}`);
    }
  }

  // --- Doc phrases (union of required docs) ---
  let union = "";
  for (const rel of REQUIRED_DOCS) {
    const abs = path.join(ROOT, rel);
    if (fs.existsSync(abs)) union += fs.readFileSync(abs, "utf8") + "\n";
  }
  const n = norm(union);
  if (!n.includes(norm(PHRASE_SCANNER))) {
    fail(`docs union missing phrase: "${PHRASE_SCANNER}"`);
  } else pass("docs include scanner-classification / migration permission doctrine");
  if (!n.includes(norm(PHRASE_PLACEHOLDER))) {
    fail(`docs union missing phrase: "${PHRASE_PLACEHOLDER}"`);
  } else pass("docs include current sos-public placeholder doctrine");

  // --- Summary ---
  console.log("");
  console.log("=== REDDIRT V2 Architecture Registry Validation ===");
  for (const L of lines) console.log(L);
  console.log("--------------------------------------------------");
  if (failures === 0) {
    console.log("Result: PASS (all checks OK)");
    process.exit(0);
  }
  console.log(`Result: FAIL (${failures} check(s) failed)`);
  process.exit(1);
}

main();
